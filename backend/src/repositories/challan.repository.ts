import prisma from '../db/prisma';
import { ChallanStatus, MovementType, Prisma } from '@prisma/client';

export interface ChallanFilterOptions {
  skip: number;
  take: number;
  status?: ChallanStatus;
  search?: string;
}

export interface PreparedItemSnapshot {
  productId: number;
  productName: string;
  productSku: string;
  unitPrice: number;
  quantity: number;
}

// Generate sequential unique Challan Number: CH-YYYY-XXXX (e.g. CH-2026-0001)
export const generateChallanNumber = async (tx?: Prisma.TransactionClient): Promise<string> => {
  const client = tx || prisma;
  const year = new Date().getFullYear();
  const prefix = `CH-${year}-`;

  const lastChallan = await client.challan.findFirst({
    where: { challanNumber: { startsWith: prefix } },
    orderBy: { challanNumber: 'desc' },
    select: { challanNumber: true },
  });

  let nextSequence = 1;
  if (lastChallan) {
    const parts = lastChallan.challanNumber.split('-');
    if (parts.length === 3) {
      const lastSeq = parseInt(parts[2], 10);
      if (!isNaN(lastSeq)) {
        nextSequence = lastSeq + 1;
      }
    }
  }

  const paddedSeq = String(nextSequence).padStart(4, '0');
  return `${prefix}${paddedSeq}`;
};

export const createChallanInDb = async (
  customerId: number,
  items: PreparedItemSnapshot[],
  createdById: number
) => {
  return prisma.$transaction(async (tx) => {
    const challanNumber = await generateChallanNumber(tx);
    const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);

    const challan = await tx.challan.create({
      data: {
        challanNumber,
        customerId,
        totalQuantity,
        status: ChallanStatus.DRAFT,
        createdById,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            productSku: item.productSku,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        customer: { select: { id: true, name: true, businessName: true } },
        createdBy: { select: { id: true, name: true } },
        items: true,
      },
    });

    return challan;
  });
};

export const findChallansInDb = async (options: ChallanFilterOptions) => {
  const { skip, take, status, search } = options;

  const where: Prisma.ChallanWhereInput = {};

  if (status) {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { challanNumber: { contains: search, mode: 'insensitive' } },
      { customer: { name: { contains: search, mode: 'insensitive' } } },
      { customer: { businessName: { contains: search, mode: 'insensitive' } } },
    ];
  }

  const [challans, total] = await Promise.all([
    prisma.challan.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { id: true, name: true, businessName: true } },
        createdBy: { select: { id: true, name: true } },
        _count: { select: { items: true } },
      },
    }),
    prisma.challan.count({ where }),
  ]);

  return { challans, total };
};

export const findChallanByIdInDb = async (id: number) => {
  return prisma.challan.findUnique({
    where: { id },
    include: {
      customer: { select: { id: true, name: true, mobile: true, email: true, businessName: true, gstNumber: true } },
      createdBy: { select: { id: true, name: true, email: true, role: true } },
      items: {
        include: {
          product: { select: { id: true, currentStock: true, minStockQuantity: true } },
        },
      },
    },
  });
};

// Confirm Challan with ACID Transaction: Stock Check -> Stock Deduction -> Stock Movement OUT -> Status CONFIRMED
export const confirmChallanInDb = async (challanId: number, userId: number) => {
  return prisma.$transaction(async (tx) => {
    // 1. Lock & fetch challan with items
    const challan = await tx.challan.findUnique({
      where: { id: challanId },
      include: { items: true },
    });

    if (!challan) {
      throw new Error(`Challan ${challanId} not found`);
    }

    if (challan.status === ChallanStatus.CONFIRMED) {
      throw new Error(`Challan ${challan.challanNumber} is already CONFIRMED`);
    }

    if (challan.status === ChallanStatus.CANCELLED) {
      throw new Error(`Cannot confirm a CANCELLED challan`);
    }

    // 2. Atomic Stock Pre-check for ALL items
    for (const item of challan.items) {
      const product = await tx.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw new Error(`Product '${item.productName}' (ID: ${item.productId}) no longer exists`);
      }

      if (product.currentStock < item.quantity) {
        throw new Error(
          `Insufficient stock for '${product.name}' (SKU: ${product.sku}). Available: ${product.currentStock}, Required: ${item.quantity}`
        );
      }
    }

    // 3. Stock Reduction & Movement Recording
    for (const item of challan.items) {
      // Reduce stock
      await tx.product.update({
        where: { id: item.productId },
        data: { currentStock: { decrement: item.quantity } },
      });

      // Create OUT Stock Movement record
      await tx.stockMovement.create({
        data: {
          productId: item.productId,
          quantity: item.quantity,
          movementType: MovementType.OUT,
          reason: `Dispatched via Sales Challan ${challan.challanNumber}`,
          createdById: userId,
        },
      });
    }

    // 4. Update Challan status to CONFIRMED
    const updatedChallan = await tx.challan.update({
      where: { id: challanId },
      data: { status: ChallanStatus.CONFIRMED },
      include: {
        customer: { select: { id: true, name: true, businessName: true } },
        createdBy: { select: { id: true, name: true } },
        items: true,
      },
    });

    return updatedChallan;
  });
};

// Cancel Challan (If DRAFT -> CANCELLED; If CONFIRMED -> restore stock via IN movement -> CANCELLED)
export const cancelChallanInDb = async (challanId: number, userId: number) => {
  return prisma.$transaction(async (tx) => {
    const challan = await tx.challan.findUnique({
      where: { id: challanId },
      include: { items: true },
    });

    if (!challan) {
      throw new Error(`Challan ${challanId} not found`);
    }

    if (challan.status === ChallanStatus.CANCELLED) {
      throw new Error(`Challan ${challan.challanNumber} is already CANCELLED`);
    }

    // If it was already CONFIRMED, restore the deducted stock and record IN movements
    if (challan.status === ChallanStatus.CONFIRMED) {
      for (const item of challan.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { currentStock: { increment: item.quantity } },
        });

        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            quantity: item.quantity,
            movementType: MovementType.IN,
            reason: `Restored stock from cancelled Sales Challan ${challan.challanNumber}`,
            createdById: userId,
          },
        });
      }
    }

    const cancelledChallan = await tx.challan.update({
      where: { id: challanId },
      data: { status: ChallanStatus.CANCELLED },
      include: {
        customer: { select: { id: true, name: true, businessName: true } },
        createdBy: { select: { id: true, name: true } },
        items: true,
      },
    });

    return cancelledChallan;
  });
};
