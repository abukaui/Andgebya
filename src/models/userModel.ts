import { z } from 'zod';

export const UserRoleEnum = z.enum(['customer', 'merchant', 'courier', 'admin']);

export const RegisterSchema = z.object({
  email: z.string().email(),
  phone_number: z.string().min(10).max(15),
  password: z.string().min(6),
  full_name: z.string().min(2),
  role: UserRoleEnum,
});

export const LoginSchema = z.object({
  emailOrPhone: z.string(),
  password: z.string(),
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
