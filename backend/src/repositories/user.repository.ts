import prisma from '../db/prisma';
import { UserRole } from '@prisma/client';

export const findUserByEmail = async (email: string) => {
  return prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });
};

export const findUserById = async (id: number) => {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

export const createUser = async (data: { name: string; email: string; passwordHash: string; role?: UserRole }) => {
  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email.toLowerCase().trim(),
      passwordHash: data.passwordHash,
      role: data.role || 'SALES',
    },
  });
};
