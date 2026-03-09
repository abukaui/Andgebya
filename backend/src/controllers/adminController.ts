import { Request, Response } from 'express';
import { pool } from '../config/db';

// Add to existing controllers/financialController.ts

/**
 * GET /api/admin/couriers
 * Returns all verified couriers for the admin dashboard.
 */
export const getAdminCouriers = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT 
         u.id, u.full_name, u.email, u.phone_number,
         cp.vehicle_type, cp.bond_amount, cp.is_verified, cp.is_available
       FROM users u
       JOIN courier_profiles cp ON u.id = cp.user_id
       ORDER BY u.created_at DESC`
    );
    res.json({ couriers: result.rows });
  } catch (err: any) {
    console.error('[Admin] getAdminCouriers error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
