import prisma from '../db/prisma';
import { CreateFollowUpDTO } from '../validators/customer.validator';

export const createFollowUpInDb = async (
  customerId: number,
  data: CreateFollowUpDTO,
  createdById: number
) => {
  return prisma.$transaction(async (tx) => {
    // 1. Create the follow-up record
    const followUp = await tx.followUp.create({
      data: {
        customerId,
        notes: data.notes,
        followUpDate: data.followUpDate || new Date(),
        createdById,
      },
      include: {
        createdBy: {
          select: { id: true, name: true },
        },
      },
    });

    // 2. Optionally update customer's latest followUpDate if provided
    if (data.followUpDate) {
      await tx.customer.update({
        where: { id: customerId },
        data: { followUpDate: data.followUpDate },
      });
    }

    return followUp;
  });
};

export const findFollowUpsByCustomerIdInDb = async (customerId: number) => {
  return prisma.followUp.findMany({
    where: { customerId },
    orderBy: { createdAt: 'desc' },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true },
      },
    },
  });
};
