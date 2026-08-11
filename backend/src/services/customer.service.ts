import {
  createCustomerInDb,
  findCustomersInDb,
  findCustomerByIdInDb,
  updateCustomerInDb,
  deleteCustomerInDb,
} from '../repositories/customer.repository';
import {
  createFollowUpInDb,
  findFollowUpsByCustomerIdInDb,
} from '../repositories/followup.repository';
import {
  validateCreateCustomer,
  validateUpdateCustomer,
  validateCreateFollowUp,
  CustomerQueryDTO,
} from '../validators/customer.validator';
import { ApiError } from '../utils/apiError';

export const createCustomerService = async (data: any, userId: number) => {
  const validatedData = validateCreateCustomer(data);
  return createCustomerInDb(validatedData, userId);
};

export const getCustomersService = async (query: CustomerQueryDTO) => {
  const page = Math.max(1, parseInt(String(query.page || 1), 10));
  const limit = Math.min(100, Math.max(1, parseInt(String(query.limit || 10), 10)));
  const skip = (page - 1) * limit;

  const { customers, total } = await findCustomersInDb({
    skip,
    take: limit,
    search: query.search ? String(query.search).trim() : undefined,
    status: query.status,
    customerType: query.customerType,
  });

  const totalPages = Math.ceil(total / limit);

  return {
    customers,
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

export const getCustomerByIdService = async (id: number) => {
  if (isNaN(id)) {
    throw new ApiError(400, 'Invalid customer ID');
  }

  const customer = await findCustomerByIdInDb(id);
  if (!customer) {
    throw new ApiError(404, `Customer with ID ${id} not found`);
  }

  return customer;
};

export const updateCustomerService = async (id: number, data: any) => {
  if (isNaN(id)) {
    throw new ApiError(400, 'Invalid customer ID');
  }

  // Ensure customer exists
  await getCustomerByIdService(id);

  const validatedData = validateUpdateCustomer(data);
  return updateCustomerInDb(id, validatedData);
};

export const deleteCustomerService = async (id: number) => {
  if (isNaN(id)) {
    throw new ApiError(400, 'Invalid customer ID');
  }

  // Ensure customer exists
  await getCustomerByIdService(id);

  return deleteCustomerInDb(id);
};

export const createFollowUpService = async (customerId: number, data: any, userId: number) => {
  if (isNaN(customerId)) {
    throw new ApiError(400, 'Invalid customer ID');
  }

  // Ensure customer exists
  await getCustomerByIdService(customerId);

  const validatedData = validateCreateFollowUp(data);
  return createFollowUpInDb(customerId, validatedData, userId);
};

export const getFollowUpsService = async (customerId: number) => {
  if (isNaN(customerId)) {
    throw new ApiError(400, 'Invalid customer ID');
  }

  // Ensure customer exists
  await getCustomerByIdService(customerId);

  return findFollowUpsByCustomerIdInDb(customerId);
};
