import { Request, Response } from 'express';
import {
  createCustomerService,
  getCustomersService,
  getCustomerByIdService,
  updateCustomerService,
  deleteCustomerService,
  createFollowUpService,
  getFollowUpsService,
} from '../services/customer.service';

export const createCustomerController = async (req: Request, res: Response) => {
  const customer = await createCustomerService(req.body, req.user!.id);
  res.status(201).json({
    success: true,
    message: 'Customer created successfully',
    data: { customer },
  });
};

export const getCustomersController = async (req: Request, res: Response) => {
  const result = await getCustomersService(req.query as any);
  res.status(200).json({
    success: true,
    data: result,
  });
};

export const getCustomerByIdController = async (req: Request, res: Response) => {
  const idStr = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(idStr, 10);
  const customer = await getCustomerByIdService(id);
  res.status(200).json({
    success: true,
    data: { customer },
  });
};

export const updateCustomerController = async (req: Request, res: Response) => {
  const idStr = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(idStr, 10);
  const customer = await updateCustomerService(id, req.body);
  res.status(200).json({
    success: true,
    message: 'Customer updated successfully',
    data: { customer },
  });
};

export const deleteCustomerController = async (req: Request, res: Response) => {
  const idStr = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(idStr, 10);
  await deleteCustomerService(id);
  res.status(200).json({
    success: true,
    message: `Customer ${id} deleted successfully`,
  });
};

export const createFollowUpController = async (req: Request, res: Response) => {
  const idStr = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const customerId = parseInt(idStr, 10);
  const followUp = await createFollowUpService(customerId, req.body, req.user!.id);
  res.status(201).json({
    success: true,
    message: 'Follow-up created successfully',
    data: { followUp },
  });
};

export const getFollowUpsController = async (req: Request, res: Response) => {
  const idStr = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const customerId = parseInt(idStr, 10);
  const followUps = await getFollowUpsService(customerId);
  res.status(200).json({
    success: true,
    data: { followUps },
  });
};
