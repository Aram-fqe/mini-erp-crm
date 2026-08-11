import bcrypt from 'bcrypt';
import { findUserByEmail } from '../repositories/user.repository';
import { generateToken } from '../utils/jwt';
import { ApiError } from '../utils/apiError';

export interface LoginDTO {
  email?: string;
  password?: string;
}

export const loginService = async (credentials: LoginDTO) => {
  const { email, password } = credentials;

  if (!email || !password) {
    throw new ApiError(400, 'Please provide both email and password');
  }

  const user = await findUserByEmail(email);
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    },
  };
};
