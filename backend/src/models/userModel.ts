import { z } from 'zod';

export const UserRoleEnum = z.enum(['customer', 'merchant', 'courier', 'admin']);

export const RegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  phone_number: z.string().min(10, 'Phone number must be at least 10 digits').max(15),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  role: UserRoleEnum,
});

export const LoginSchema = z.object({
  emailOrPhone: z.string().min(1, 'Email or phone is required'),
  password: z.string().min(1, 'Password is required'),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;

export interface User {
  id: string;
  email: string;
  phone_number: string;
  password_hash: string;
  full_name: string;
  role: 'customer' | 'merchant' | 'courier' | 'admin';
  created_at: Date;
  updated_at: Date;
}
