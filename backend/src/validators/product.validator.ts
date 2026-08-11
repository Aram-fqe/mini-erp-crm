import { MovementType } from '@prisma/client';
import { ApiError } from '../utils/apiError';

export interface CreateProductDTO {
  name: string;
  sku: string;
  category: string;
  unitPrice: number;
  currentStock?: number;
  minStockQuantity?: number;
  warehouseLocation?: string;
}

export interface UpdateProductDTO extends Partial<Omit<CreateProductDTO, 'sku'>> {}

export interface ProductQueryDTO {
  page?: string;
  limit?: string;
  search?: string;
  category?: string;
  lowStock?: string; // 'true' to filter low-stock items
}

export interface StockMovementDTO {
  quantity: number;
  movementType: MovementType;
  reason: string;
}

export const validateCreateProduct = (data: any): CreateProductDTO => {
  if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
    throw new ApiError(400, 'Product name is required');
  }

  if (!data.sku || typeof data.sku !== 'string' || !data.sku.trim()) {
    throw new ApiError(400, 'Product SKU is required');
  }

  if (!data.category || typeof data.category !== 'string' || !data.category.trim()) {
    throw new ApiError(400, 'Product category is required');
  }

  if (data.unitPrice === undefined || data.unitPrice === null) {
    throw new ApiError(400, 'Unit price is required');
  }

  const unitPrice = parseFloat(data.unitPrice);
  if (isNaN(unitPrice) || unitPrice < 0) {
    throw new ApiError(400, 'Unit price must be a non-negative number');
  }

  const currentStock = data.currentStock !== undefined ? parseInt(data.currentStock, 10) : 0;
  if (isNaN(currentStock) || currentStock < 0) {
    throw new ApiError(400, 'Current stock must be a non-negative integer');
  }

  const minStockQuantity = data.minStockQuantity !== undefined
    ? parseInt(data.minStockQuantity, 10) : 0;
  if (isNaN(minStockQuantity) || minStockQuantity < 0) {
    throw new ApiError(400, 'Minimum stock quantity must be a non-negative integer');
  }

  return {
    name: data.name.trim(),
    sku: data.sku.trim().toUpperCase(),
    category: data.category.trim(),
    unitPrice,
    currentStock,
    minStockQuantity,
    warehouseLocation: data.warehouseLocation ? data.warehouseLocation.trim() : undefined,
  };
};

export const validateUpdateProduct = (data: any): UpdateProductDTO => {
  if (data.name !== undefined && (typeof data.name !== 'string' || !data.name.trim())) {
    throw new ApiError(400, 'Product name cannot be empty');
  }

  if (data.category !== undefined && (typeof data.category !== 'string' || !data.category.trim())) {
    throw new ApiError(400, 'Category cannot be empty');
  }

  if (data.unitPrice !== undefined) {
    const unitPrice = parseFloat(data.unitPrice);
    if (isNaN(unitPrice) || unitPrice < 0) {
      throw new ApiError(400, 'Unit price must be a non-negative number');
    }
  }

  if (data.minStockQuantity !== undefined) {
    const min = parseInt(data.minStockQuantity, 10);
    if (isNaN(min) || min < 0) {
      throw new ApiError(400, 'Minimum stock quantity must be a non-negative integer');
    }
  }

  return {
    ...(data.name && { name: data.name.trim() }),
    ...(data.category && { category: data.category.trim() }),
    ...(data.unitPrice !== undefined && { unitPrice: parseFloat(data.unitPrice) }),
    ...(data.minStockQuantity !== undefined && {
      minStockQuantity: parseInt(data.minStockQuantity, 10),
    }),
    ...(data.warehouseLocation !== undefined && {
      warehouseLocation: data.warehouseLocation ? data.warehouseLocation.trim() : null,
    }),
  };
};

export const validateStockMovement = (data: any): StockMovementDTO => {
  if (!data.quantity) {
    throw new ApiError(400, 'Quantity is required');
  }

  const quantity = parseInt(data.quantity, 10);
  if (isNaN(quantity) || quantity <= 0) {
    throw new ApiError(400, 'Quantity must be a positive integer greater than zero');
  }

  if (!data.movementType) {
    throw new ApiError(400, 'Movement type is required (IN or OUT)');
  }

  if (!Object.values(MovementType).includes(data.movementType)) {
    throw new ApiError(400, `Invalid movement type. Allowed values: ${Object.values(MovementType).join(', ')}`);
  }

  if (!data.reason || typeof data.reason !== 'string' || !data.reason.trim()) {
    throw new ApiError(400, 'Reason is required for stock movement');
  }

  return {
    quantity,
    movementType: data.movementType as MovementType,
    reason: data.reason.trim(),
  };
};
