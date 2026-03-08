import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db';
import { RegisterSchema, LoginSchema, RegisterInput, LoginInput } from '../models/userModel';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

export const register = async (req: Request, res: Response) => {
  try {
    const validatedData = RegisterSchema.parse(req.body);
    const { email, phone_number, password, full_name, role } = validatedData;

    // Check if user already exists
    const userExists = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR phone_number = $2',
      [email, phone_number]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'User with this email or phone already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user
    const newUser = await pool.query(
      'INSERT INTO users (email, phone_number, password_hash, full_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, role',
      [email, phone_number, passwordHash, full_name, role]
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: newUser.rows[0],
    });
  } catch (error: any) {
    if (error.errors) return res.status(400).json({ error: error.errors });
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { emailOrPhone, password } = LoginSchema.parse(req.body);

    // Find user
    const userResult = await pool.query(
      'SELECT id, email, password_hash, role FROM users WHERE email = $1 OR phone_number = $1',
      [emailOrPhone]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const user = userResult.rows[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { sub: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (error: any) {
    if (error.errors) return res.status(400).json({ error: error.errors });
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};
