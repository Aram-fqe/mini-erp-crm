import { ChallanStatus } from '@prisma/client';
import { ApiError } from '../utils/apiError';

export interface CreateChallanItemDTO {
  productId: number;
  quantity: number;
}

export interface CreateChallanDTO {
  customerId: number;
  items: CreateChallanItemDTO[];
}

export interface ChallanQueryDTO {
  page?: string;
  limit?: string;
  status?: ChallanStatus;
  search?: string;
}

export const validateCreateChallan = (data: any): CreateChallanDTO => {
  if (!data.customerId) {
    throw new ApiError(400, 'Customer ID is required');
  }

  const customerId = parseInt(data.customerId, 10);
  if (isNaN(customerId) || customerId <= 0) {
    throw new ApiError(400, 'Invalid Customer ID');
  }

  if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
    throw new ApiError(400, 'Challan must contain at least one product item');
  }

  const validatedItems: CreateChallanItemDTO[] = data.items.map((item: any, index: number) => {
    if (!item.productId) {
      throw new ApiError(400, `Item at index ${index} is missing productId`);
    }

    const productId = parseInt(item.productId, 10);
    if (isNaN(productId) || productId <= 0) {
      throw new ApiError(400, `Item at index ${index} has invalid productId`);
    }

    if (!item.quantity) {
      throw new ApiError(400, `Item at index ${index} is missing quantity`);
    }

    const quantity = parseInt(item.quantity, 10);
    if (isNaN(quantity) || quantity <= 0) {
      throw new ApiError(400, `Item at index ${index} quantity must be a positive integer greater than zero`);
    }

    return { productId, quantity };
  });

  return { customerId, items: validatedItems };
};
