import { CustomerType, CustomerStatus } from '@prisma/client';
import { ApiError } from '../utils/apiError';

export interface CreateCustomerDTO {
  name: string;
  mobile: string;
  email?: string;
  businessName?: string;
  gstNumber?: string;
  customerType?: CustomerType;
  address?: string;
  status?: CustomerStatus;
  followUpDate?: string | Date;
  notes?: string;
}

export interface UpdateCustomerDTO extends Partial<CreateCustomerDTO> {}

export interface CustomerQueryDTO {
  page?: string | number;
  limit?: string | number;
  search?: string;
  status?: CustomerStatus;
  customerType?: CustomerType;
}

export interface CreateFollowUpDTO {
  notes: string;
  followUpDate?: string | Date;
}

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidMobile = (mobile: string): boolean => {
  // Accepts 10-15 digits, optionally prefixed with +
  const mobileRegex = /^\+?[0-9]{10,15}$/;
  return mobileRegex.test(mobile.replace(/[\s-]/g, ''));
};

export const validateCreateCustomer = (data: any): CreateCustomerDTO => {
  if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
    throw new ApiError(400, 'Customer name is required');
  }

  if (!data.mobile || typeof data.mobile !== 'string' || !data.mobile.trim()) {
    throw new ApiError(400, 'Customer mobile number is required');
  }

  if (!isValidMobile(data.mobile)) {
    throw new ApiError(400, 'Invalid mobile number format (must be 10-15 digits)');
  }

  if (data.email && (typeof data.email !== 'string' || !isValidEmail(data.email))) {
    throw new ApiError(400, 'Invalid email format');
  }

  if (data.customerType && !Object.values(CustomerType).includes(data.customerType)) {
    throw new ApiError(
      400,
      `Invalid customer type. Allowed values: ${Object.values(CustomerType).join(', ')}`
    );
  }

  if (data.status && !Object.values(CustomerStatus).includes(data.status)) {
    throw new ApiError(
      400,
      `Invalid customer status. Allowed values: ${Object.values(CustomerStatus).join(', ')}`
    );
  }

  return {
    name: data.name.trim(),
    mobile: data.mobile.trim(),
    email: data.email ? data.email.trim().toLowerCase() : undefined,
    businessName: data.businessName ? data.businessName.trim() : undefined,
    gstNumber: data.gstNumber ? data.gstNumber.trim() : undefined,
    customerType: data.customerType || CustomerType.RETAIL,
    address: data.address ? data.address.trim() : undefined,
    status: data.status || CustomerStatus.LEAD,
    followUpDate: data.followUpDate ? new Date(data.followUpDate) : undefined,
    notes: data.notes ? data.notes.trim() : undefined,
  };
};

export const validateUpdateCustomer = (data: any): UpdateCustomerDTO => {
  if (data.name !== undefined && (typeof data.name !== 'string' || !data.name.trim())) {
    throw new ApiError(400, 'Customer name cannot be empty');
  }

  if (data.mobile !== undefined) {
    if (typeof data.mobile !== 'string' || !data.mobile.trim()) {
      throw new ApiError(400, 'Mobile number cannot be empty');
    }
    if (!isValidMobile(data.mobile)) {
      throw new ApiError(400, 'Invalid mobile number format');
    }
  }

  if (data.email !== undefined && data.email !== null && data.email !== '') {
    if (typeof data.email !== 'string' || !isValidEmail(data.email)) {
      throw new ApiError(400, 'Invalid email format');
    }
  }

  if (data.customerType && !Object.values(CustomerType).includes(data.customerType)) {
    throw new ApiError(
      400,
      `Invalid customer type. Allowed values: ${Object.values(CustomerType).join(', ')}`
    );
  }

  if (data.status && !Object.values(CustomerStatus).includes(data.status)) {
    throw new ApiError(
      400,
      `Invalid customer status. Allowed values: ${Object.values(CustomerStatus).join(', ')}`
    );
  }

  return {
    ...(data.name && { name: data.name.trim() }),
    ...(data.mobile && { mobile: data.mobile.trim() }),
    ...(data.email !== undefined && {
      email: data.email ? data.email.trim().toLowerCase() : null,
    }),
    ...(data.businessName !== undefined && {
      businessName: data.businessName ? data.businessName.trim() : null,
    }),
    ...(data.gstNumber !== undefined && {
      gstNumber: data.gstNumber ? data.gstNumber.trim() : null,
    }),
    ...(data.customerType && { customerType: data.customerType }),
    ...(data.address !== undefined && {
      address: data.address ? data.address.trim() : null,
    }),
    ...(data.status && { status: data.status }),
    ...(data.followUpDate !== undefined && {
      followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
    }),
    ...(data.notes !== undefined && {
      notes: data.notes ? data.notes.trim() : null,
    }),
  };
};

export const validateCreateFollowUp = (data: any): CreateFollowUpDTO => {
  if (!data.notes || typeof data.notes !== 'string' || !data.notes.trim()) {
    throw new ApiError(400, 'Follow-up notes are required');
  }

  return {
    notes: data.notes.trim(),
    followUpDate: data.followUpDate ? new Date(data.followUpDate) : undefined,
  };
};
