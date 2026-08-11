import {
  createProductInDb,
  findProductsInDb,
  findProductByIdInDb,
  findProductBySkuInDb,
  updateProductInDb,
  adjustStockInDb,
  findStockMovementsByProductIdInDb,
  getDistinctCategoriesInDb,
} from '../repositories/product.repository';
import {
  validateCreateProduct,
  validateUpdateProduct,
  validateStockMovement,
  ProductQueryDTO,
} from '../validators/product.validator';
import { ApiError } from '../utils/apiError';

export const createProductService = async (data: any, userId: number) => {
  const validatedData = validateCreateProduct(data);

  const existingSku = await findProductBySkuInDb(validatedData.sku);
  if (existingSku) {
    throw new ApiError(400, `Product with SKU '${validatedData.sku}' already exists`);
  }

  return createProductInDb(validatedData, userId);
};

export const getProductsService = async (query: ProductQueryDTO) => {
  const page = Math.max(1, parseInt(query.page || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || '10', 10)));
  const skip = (page - 1) * limit;

  const lowStock = query.lowStock === 'true';

  const { products, total } = await findProductsInDb({
    skip,
    take: limit,
    search: query.search ? String(query.search).trim() : undefined,
    category: query.category ? String(query.category).trim() : undefined,
    lowStock,
  });

  const totalPages = Math.ceil(total / limit);

  return {
    products,
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

export const getProductByIdService = async (id: number) => {
  if (isNaN(id)) {
    throw new ApiError(400, 'Invalid product ID');
  }

  const product = await findProductByIdInDb(id);
  if (!product) {
    throw new ApiError(404, `Product with ID ${id} not found`);
  }

  return product;
};

export const updateProductService = async (id: number, data: any) => {
  if (isNaN(id)) {
    throw new ApiError(400, 'Invalid product ID');
  }

  await getProductByIdService(id);

  const validatedData = validateUpdateProduct(data);
  return updateProductInDb(id, validatedData);
};

export const adjustStockService = async (productId: number, data: any, userId: number) => {
  if (isNaN(productId)) {
    throw new ApiError(400, 'Invalid product ID');
  }

  await getProductByIdService(productId);

  const validatedData = validateStockMovement(data);

  try {
    return await adjustStockInDb(
      productId,
      validatedData.quantity,
      validatedData.movementType,
      validatedData.reason,
      userId
    );
  } catch (error: any) {
    throw new ApiError(400, error.message || 'Failed to adjust stock');
  }
};

export const getStockMovementsService = async (productId: number) => {
  if (isNaN(productId)) {
    throw new ApiError(400, 'Invalid product ID');
  }

  await getProductByIdService(productId);

  return findStockMovementsByProductIdInDb(productId);
};

export const getCategoriesService = async () => {
  return getDistinctCategoriesInDb();
};
