import { Request, Response } from 'express';
import { loginService } from '../services/auth.service';

export const loginController = async (req: Request, res: Response) => {
  const result = await loginService(req.body);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: result,
  });
};

export const getMeController = async (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      user: req.user,
    },
  });
};
