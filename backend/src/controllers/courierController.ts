import { Request, Response } from 'express';
import { pool } from '../config/db';

/**
 * POST /api/courier/location
 * Update the authenticated courier's GPS coordinates and availability status.
 * Body: { lat: number, lng: number }
 */
export const updateLocation = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const role = (req as any).user?.role;

  if (role !== 'courier') {
    res.status(403).json({ error: 'Only couriers can update location' });
    return;
  }

  const { lat, lng } = req.body;

  if (lat == null || lng == null) {
    res.status(400).json({ error: 'lat and lng are required' });
    return;
  }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    res.status(400).json({ error: 'Invalid GPS coordinates' });
    return;
  }

  try {
    // Upsert the courier's location using PostGIS POINT format
    const result = await pool.query(
      `INSERT INTO courier_profiles (user_id, current_location, last_active, updated_at)
       VALUES ($1, ST_SetSRID(ST_MakePoint($3, $2), 4326), NOW(), NOW())
       ON CONFLICT (user_id) DO UPDATE
         SET current_location = ST_SetSRID(ST_MakePoint($3, $2), 4326),
             last_active = NOW(),
             updated_at = NOW()
       RETURNING user_id, is_available, last_active,
                 ST_X(current_location::geometry) AS lng,
                 ST_Y(current_location::geometry) AS lat`,
      [userId, lat, lng]
    );

    res.status(200).json({
      message: 'Location updated',
      location: result.rows[0],
    });
  } catch (err: any) {
    console.error('[Courier] updateLocation error:', err);
    res.status(500).json({ error: 'Internal server error', detail: err.message });
  }
};

/**
 * PATCH /api/courier/availability
 * Toggle the courier between Online (available) and Offline.
 * Body: { is_available: boolean }
 */
export const setAvailability = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const role = (req as any).user?.role;

  if (role !== 'courier') {
    res.status(403).json({ error: 'Only couriers can change availability' });
    return;
  }

  const { is_available } = req.body;

  if (typeof is_available !== 'boolean') {
    res.status(400).json({ error: 'is_available must be a boolean' });
    return;
  }

  try {
    const result = await pool.query(
      `INSERT INTO courier_profiles (user_id, is_available, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (user_id) DO UPDATE
         SET is_available = $2, updated_at = NOW()
       RETURNING user_id, is_available, last_active`,
      [userId, is_available]
    );

    res.status(200).json({
      message: `Courier is now ${is_available ? 'ONLINE' : 'OFFLINE'}`,
      profile: result.rows[0],
    });
  } catch (err: any) {
    console.error('[Courier] setAvailability error:', err);
    res.status(500).json({ error: 'Internal server error', detail: err.message });
  }
};

/**
 * GET /api/courier/profile
 * Get the authenticated courier's profile and current status.
 */
export const getCourierProfile = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const role = (req as any).user?.role;

  if (role !== 'courier') {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  try {
    const result = await pool.query(
      `SELECT 
         u.id, u.full_name, u.email, u.phone_number,
         cp.is_available, cp.kyc_status, cp.bond_amount,
         cp.fayda_id, cp.is_verified, cp.last_active,
         ST_X(cp.current_location::geometry) AS lng,
         ST_Y(cp.current_location::geometry) AS lat
       FROM users u
       LEFT JOIN courier_profiles cp ON cp.user_id = u.id
       WHERE u.id = $1`,
      [userId]
    );

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Courier profile not found' });
      return;
    }

    res.status(200).json({ profile: result.rows[0] });
  } catch (err: any) {
    console.error('[Courier] getCourierProfile error:', err);
    res.status(500).json({ error: 'Internal server error', detail: err.message });
  }
};

/**
 * GET /api/courier/nearby?lat=...&lng=...&radius=5000
 * Find available couriers within a radius (in meters). Admin/customer facing.
 */
export const getNearbyCouriers = async (req: Request, res: Response) => {
  const { lat, lng, radius = 5000 } = req.query;

  if (!lat || !lng) {
    res.status(400).json({ error: 'lat and lng query params are required' });
    return;
  }

  try {
    const result = await pool.query(
      `SELECT 
         u.id, u.full_name, 
         cp.is_available, cp.bond_amount, cp.is_verified,
         ST_X(cp.current_location::geometry) AS lng,
         ST_Y(cp.current_location::geometry) AS lat,
         ST_Distance(cp.current_location, ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography) AS distance_meters
       FROM courier_profiles cp
       JOIN users u ON u.id = cp.user_id
       WHERE cp.is_available = TRUE
         AND cp.current_location IS NOT NULL
         AND ST_DWithin(
               cp.current_location,
               ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography,
               $3
             )
       ORDER BY distance_meters ASC
       LIMIT 20`,
      [parseFloat(lat as string), parseFloat(lng as string), parseFloat(radius as string)]
    );

    res.status(200).json({ couriers: result.rows });
  } catch (err: any) {
    res.status(500).json({ error: 'Internal server error', detail: err.message });
  }
};

/**
 * POST /api/courier/kyc/upload
 * Handle Front and Back ID uploads. Set status to 'pending'.
 */
export const uploadKYC = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  if (!files || !files.front || !files.back) {
    res.status(400).json({ error: 'Both Front and Back photos are required.' });
    return;
  }

  try {
    // Update the profile to 'pending'
    await pool.query(
      `UPDATE courier_profiles
       SET kyc_status = 'pending',
           is_verified = FALSE,
           updated_at = NOW()
       WHERE user_id = $1`,
      [userId]
    );

    res.status(200).json({
      message: 'KYC documents uploaded successfully and are now under review.',
      status: 'pending'
    });
  } catch (err: any) {
    console.error('[Courier] uploadKYC error:', err);
    res.status(500).json({ error: 'Internal server error', detail: err.message });
  }
};
