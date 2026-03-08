import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db';
import { RegisterSchema, LoginSchema } from '../models/userModel';
import { ZodError } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

/**
 * POST /api/auth/register
 */
export const register = async (req: Request, res: Response) => {
  try {
    const validatedData = RegisterSchema.parse(req.body);
    const { email, phone_number, password, full_name, role } = validatedData;

    // Check for duplicate email or phone
    const userExists = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR phone_number = $2',
      [email, phone_number]
    );

    if (userExists.rows.length > 0) {
      res.status(400).json({ error: 'User with this email or phone already exists' });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user into DB
    const newUser = await pool.query(
      `INSERT INTO users (email, phone_number, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, full_name, role`,
      [email, phone_number, passwordHash, full_name, role]
    );

    // If courier, create a blank courier profile row
    if (role === 'courier') {
      await pool.query(
        'INSERT INTO courier_profiles (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING',
        [newUser.rows[0].id]
      );
    }

    res.status(201).json({
      message: 'Registration successful',
      user: newUser.rows[0],
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ error: error.errors.map(e => e.message).join(', ') });
      return;
    }
    console.error('[Auth] register error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

/**
 * POST /api/auth/login
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { emailOrPhone, password } = LoginSchema.parse(req.body);

    // Find user by email OR phone
    const userResult = await pool.query(
      `SELECT id, email, full_name, password_hash, role
       FROM users
       WHERE email = $1 OR phone_number = $1`,
      [emailOrPhone]
    );

    if (userResult.rows.length === 0) {
      res.status(401).json({ error: 'Invalid email/phone or password' });
      return;
    }

    const user = userResult.rows[0];

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email/phone or password' });
      return;
    }

    // Sign JWT
    const token = jwt.sign(
      { sub: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ error: error.errors.map(e => e.message).join(', ') });
      return;
    }
    console.error('[Auth] login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};
