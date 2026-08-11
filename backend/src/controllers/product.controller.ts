import { Request, Response } from 'express';
import {
  createProductService,
  getProductsService,
  getProductByIdService,
  updateProductService,
  adjustStockService,
  getStockMovementsService,
  getCategoriesService,
} from '../services/product.service';

export const createProductController = async (req: Request, res: Response) => {
  const product = await createProductService(req.body, req.user!.id);
  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: { product },
  });
};

export const getProductsController = async (req: Request, res: Response) => {
  const result = await getProductsService(req.query as any);
  res.status(200).json({
    success: true,
    data: result,
  });
};

export const getProductByIdController = async (req: Request, res: Response) => {
  const idStr = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(idStr, 10);
  const product = await getProductByIdService(id);
  res.status(200).json({
    success: true,
    data: { product },
  });
};

export const updateProductController = async (req: Request, res: Response) => {
  const idStr = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(idStr, 10);
  const product = await updateProductService(id, req.body);
  res.status(200).json({
    success: true,
    message: 'Product updated successfully',
    data: { product },
  });
};

export const adjustStockController = async (req: Request, res: Response) => {
  const idStr = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const productId = parseInt(idStr, 10);
  const result = await adjustStockService(productId, req.body, req.user!.id);
  res.status(200).json({
    success: true,
    message: `Stock movement recorded (${req.body.movementType})`,
    data: result,
  });
};

export const getStockMovementsController = async (req: Request, res: Response) => {
  const idStr = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const productId = parseInt(idStr, 10);
  const movements = await getStockMovementsService(productId);
  res.status(200).json({
    success: true,
    data: { movements },
  });
};

export const getCategoriesController = async (_req: Request, res: Response) => {
  const categories = await getCategoriesService();
  res.status(200).json({
    success: true,
    data: { categories },
  });
};
