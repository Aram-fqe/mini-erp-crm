import { Request, Response } from 'express';
import {
  createChallanService,
  getChallansService,
  getChallanByIdService,
  confirmChallanService,
  cancelChallanService,
} from '../services/challan.service';

export const createChallanController = async (req: Request, res: Response) => {
  const challan = await createChallanService(req.body, req.user!.id);
  res.status(201).json({
    success: true,
    message: 'Delivery Challan created successfully (DRAFT)',
    data: { challan },
  });
};

export const getChallansController = async (req: Request, res: Response) => {
  const result = await getChallansService(req.query as any);
  res.status(200).json({
    success: true,
    data: result,
  });
};

export const getChallanByIdController = async (req: Request, res: Response) => {
  const idStr = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(idStr, 10);
  const challan = await getChallanByIdService(id);
  res.status(200).json({
    success: true,
    data: { challan },
  });
};

export const confirmChallanController = async (req: Request, res: Response) => {
  const idStr = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(idStr, 10);
  const challan = await confirmChallanService(id, req.user!.id);
  res.status(200).json({
    success: true,
    message: `Sales Challan ${challan.challanNumber} CONFIRMED. Stock updated successfully.`,
    data: { challan },
  });
};

export const cancelChallanController = async (req: Request, res: Response) => {
  const idStr = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(idStr, 10);
  const challan = await cancelChallanService(id, req.user!.id);
  res.status(200).json({
    success: true,
    message: `Sales Challan ${challan.challanNumber} CANCELLED.`,
    data: { challan },
  });
};
