import {
  createChallanInDb,
  findChallansInDb,
  findChallanByIdInDb,
  confirmChallanInDb,
  cancelChallanInDb,
  PreparedItemSnapshot,
} from '../repositories/challan.repository';
import { findCustomerByIdInDb } from '../repositories/customer.repository';
import { findProductByIdInDb } from '../repositories/product.repository';
import { validateCreateChallan, ChallanQueryDTO } from '../validators/challan.validator';
import { ApiError } from '../utils/apiError';

export const createChallanService = async (data: any, userId: number) => {
  const validated = validateCreateChallan(data);

  // 1. Validate customer existence
  const customer = await findCustomerByIdInDb(validated.customerId);
  if (!customer) {
    throw new ApiError(404, `Customer with ID ${validated.customerId} not found`);
  }

  // 2. Validate all products and prepare item snapshot
  const preparedItems: PreparedItemSnapshot[] = [];

  for (const item of validated.items) {
    const product = await findProductByIdInDb(item.productId);
    if (!product) {
      throw new ApiError(404, `Product with ID ${item.productId} not found`);
    }

    preparedItems.push({
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      unitPrice: Number(product.unitPrice),
      quantity: item.quantity,
    });
  }

  // 3. Create Challan as DRAFT
  return createChallanInDb(validated.customerId, preparedItems, userId);
};

export const getChallansService = async (query: ChallanQueryDTO) => {
  const page = Math.max(1, parseInt(query.page || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || '10', 10)));
  const skip = (page - 1) * limit;

  const { challans, total } = await findChallansInDb({
    skip,
    take: limit,
    status: query.status,
    search: query.search ? String(query.search).trim() : undefined,
  });

  const totalPages = Math.ceil(total / limit);

  return {
    challans,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

export const getChallanByIdService = async (id: number) => {
  if (isNaN(id)) {
    throw new ApiError(400, 'Invalid Challan ID');
  }

  const challan = await findChallanByIdInDb(id);
  if (!challan) {
    throw new ApiError(404, `Challan with ID ${id} not found`);
  }

  return challan;
};

export const confirmChallanService = async (id: number, userId: number) => {
  if (isNaN(id)) {
    throw new ApiError(400, 'Invalid Challan ID');
  }

  try {
    return await confirmChallanInDb(id, userId);
  } catch (error: any) {
    throw new ApiError(400, error.message || 'Failed to confirm challan');
  }
};

export const cancelChallanService = async (id: number, userId: number) => {
  if (isNaN(id)) {
    throw new ApiError(400, 'Invalid Challan ID');
  }

  try {
    return await cancelChallanInDb(id, userId);
  } catch (error: any) {
    throw new ApiError(400, error.message || 'Failed to cancel challan');
  }
};
