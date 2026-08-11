import prisma from '../db/prisma';
import { Prisma, MovementType } from '@prisma/client';
import { CreateProductDTO, UpdateProductDTO } from '../validators/product.validator';

export interface ProductFilterOptions {
  skip: number;
  take: number;
  search?: string;
  category?: string;
  lowStock?: boolean;
}

export const createProductInDb = async (data: CreateProductDTO, _createdById: number) => {
  return prisma.product.create({
    data: {
      name: data.name,
      sku: data.sku,
      category: data.category,
      unitPrice: data.unitPrice,
      currentStock: data.currentStock || 0,
      minStockQuantity: data.minStockQuantity || 0,
      warehouseLocation: data.warehouseLocation,
    },
  });
};

export const findProductsInDb = async (options: ProductFilterOptions) => {
  const { skip, take, search, category, lowStock } = options;

  const where: Prisma.ProductWhereInput = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { sku: { contains: search, mode: 'insensitive' } },
      { category: { contains: search, mode: 'insensitive' } },
      { warehouseLocation: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (category) {
    where.category = { contains: category, mode: 'insensitive' };
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { stockMovements: true },
        },
      },
    }),
    prisma.product.count({ where }),
  ]);

  // Map products and compute isLowStock flag
  let productsWithFlag = products.map((p) => ({
    ...p,
    unitPrice: Number(p.unitPrice),
    isLowStock: p.currentStock <= p.minStockQuantity,
  }));

  // If lowStock query flag is set, filter in-memory for accuracy
  if (lowStock) {
    productsWithFlag = productsWithFlag.filter((p) => p.isLowStock);
  }

  return {
    products: productsWithFlag,
    total: lowStock ? productsWithFlag.length : total,
  };
};

export const findProductByIdInDb = async (id: number) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      _count: {
        select: { stockMovements: true },
      },
    },
  });

  if (!product) return null;

  return {
    ...product,
    unitPrice: Number(product.unitPrice),
    isLowStock: product.currentStock <= product.minStockQuantity,
  };
};

export const findProductBySkuInDb = async (sku: string) => {
  return prisma.product.findUnique({ where: { sku } });
};

export const updateProductInDb = async (id: number, data: UpdateProductDTO) => {
  const product = await prisma.product.update({
    where: { id },
    data,
  });
  return {
    ...product,
    unitPrice: Number(product.unitPrice),
    isLowStock: product.currentStock <= product.minStockQuantity,
  };
};

export const adjustStockInDb = async (
  productId: number,
  quantity: number,
  movementType: MovementType,
  reason: string,
  createdById: number
) => {
  return prisma.$transaction(async (tx) => {
    // 1. Lock/fetch current product stock
    const product = await tx.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error(`Product ${productId} not found`);
    }

    const newStock =
      movementType === MovementType.IN
        ? product.currentStock + quantity
        : product.currentStock - quantity;

    // Business Rule 1: Stock cannot become negative
    if (newStock < 0) {
      throw new Error(
        `Insufficient stock. Current stock is ${product.currentStock}, requested OUT quantity is ${quantity}`
      );
    }

    // 2. Update product stock
    const updated = await tx.product.update({
      where: { id: productId },
      data: { currentStock: newStock },
    });

    // 3. Business Rule 2 & 3: Record stock movement
    const movement = await tx.stockMovement.create({
      data: {
        productId,
        quantity,
        movementType,
        reason,
        createdById,
      },
      include: {
        createdBy: { select: { id: true, name: true, role: true } },
      },
    });

    return {
      product: {
        ...updated,
        unitPrice: Number(updated.unitPrice),
        isLowStock: updated.currentStock <= updated.minStockQuantity,
      },
      movement,
    };
  });
};

export const findStockMovementsByProductIdInDb = async (productId: number) => {
  return prisma.stockMovement.findMany({
    where: { productId },
    orderBy: { createdAt: 'desc' },
    include: {
      createdBy: {
        select: { id: true, name: true, role: true },
      },
    },
  });
};

export const getDistinctCategoriesInDb = async (): Promise<string[]> => {
  const result = await prisma.product.findMany({
    select: { category: true },
    distinct: ['category'],
    orderBy: { category: 'asc' },
  });
  return result.map((r) => r.category);
};
