import prisma from '../db/prisma';
import { CustomerType, CustomerStatus, Prisma } from '@prisma/client';
import { CreateCustomerDTO, UpdateCustomerDTO } from '../validators/customer.validator';

export interface CustomerFilterOptions {
  skip: number;
  take: number;
  search?: string;
  status?: CustomerStatus;
  customerType?: CustomerType;
}

export const createCustomerInDb = async (data: CreateCustomerDTO, createdById: number) => {
  return prisma.customer.create({
    data: {
      ...data,
      createdById,
    },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true },
      },
    },
  });
};

export const findCustomersInDb = async (options: CustomerFilterOptions) => {
  const { skip, take, search, status, customerType } = options;

  const where: Prisma.CustomerWhereInput = {};

  if (status) {
    where.status = status;
  }

  if (customerType) {
    where.customerType = customerType;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { mobile: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { businessName: { contains: search, mode: 'insensitive' } },
      { gstNumber: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { followUps: true, challans: true },
        },
      },
    }),
    prisma.customer.count({ where }),
  ]);

  return { customers, total };
};

export const findCustomerByIdInDb = async (id: number) => {
  return prisma.customer.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true },
      },
      followUps: {
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: {
            select: { id: true, name: true },
          },
        },
      },
      _count: {
        select: { challans: true },
      },
    },
  });
};

export const updateCustomerInDb = async (id: number, data: UpdateCustomerDTO) => {
  return prisma.customer.update({
    where: { id },
    data,
    include: {
      createdBy: {
        select: { id: true, name: true, email: true },
      },
    },
  });
};

export const deleteCustomerInDb = async (id: number) => {
  return prisma.customer.delete({
    where: { id },
  });
};
