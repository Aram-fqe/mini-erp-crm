import { Request, Response, NextFunction, RequestHandler } from 'express';

// Wraps async route handlers to automatically pass rejected promises to next()
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
