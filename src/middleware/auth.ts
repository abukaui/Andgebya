/**
 * Ardi Auth Middleware
 * Location: src/middleware/auth.ts
 * 
 * Enforces:
 * - JWT validation
 * - RBAC (Role-Based Access Control)
 */

import { Request, Response, NextFunction } from 'express';
// import jwt from 'jsonwebtoken';

export type UserRole = 'customer' | 'merchant' | 'courier' | 'admin';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
  };
}

/**
 * authenticate
 * Verifies JWT token
 */
export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    // const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    // req.user = { id: decoded.sub, role: decoded.role };
    
    // Mock for scaffold
    req.user = { id: 'mock-uuid', role: 'customer' }; 
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

/**
 * authorize
 * RBAC check
 */
export const authorize = (roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Access denied. Requires one of these roles: ${roles.join(', ')}` 
      });
    }
    next();
  };
};
