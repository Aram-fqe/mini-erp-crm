import { UserRole } from '@prisma/client';

export interface UserPayload {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}
