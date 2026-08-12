import bcrypt from 'bcrypt';
import { findUserByEmail, createUser } from '../repositories/user.repository';
import { UserRole } from '@prisma/client';
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

export interface RegisterDTO {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
}

export const registerService = async (data: RegisterDTO) => {
  const { name, email, password, role } = data;

  if (!name || !email || !password) {
    throw new ApiError(400, 'Please provide name, email, and password');
  }

  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new ApiError(409, 'User with this email already exists');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await createUser({
    name,
    email,
    passwordHash,
    role,
  });

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
