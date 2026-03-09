import { Request, Response } from 'express';
import { pool } from '../config/db';

/**
 * GET /api/delivery/available
 * Couriers poll this endpoint to find 'pending' delivery requests within 5km.
 */
export const getAvailableJobs = async (req: Request, res: Response) => {
  const courierId = (req as any).user?.id;

  try {
    // 1. Get Courier's current location from profile
    const profileRes = await pool.query(
      `SELECT current_location, is_available, is_verified 
       FROM courier_profiles 
       WHERE user_id = $1`,
      [courierId]
    );

    if (profileRes.rowCount === 0) {
      res.status(404).json({ error: 'Courier profile not found' });
      return;
    }

    const { current_location, is_available, is_verified } = profileRes.rows[0];

    // Must be online and verified to receive jobs
    if (!is_available || !is_verified || !current_location) {
      res.json({ jobs: [] });
      return;
    }

    // 2. Find pending deliveries within 5km (5000 meters) AND within 15 seconds of creation
    // AND NOT previously rejected by this courier
    // Using a simple JOIN structure if we had a rejection table, for now we will just use a time window
    const jobsRes = await pool.query(
      `SELECT 
         dr.id, dr.shop_id, dr.total_amount, dr.delivery_fee, dr.created_at,
         ST_X(dr.pickup_location::geometry) AS pickup_lng,
         ST_Y(dr.pickup_location::geometry) AS pickup_lat,
         ST_X(dr.dropoff_location::geometry) AS dropoff_lng,
         ST_Y(dr.dropoff_location::geometry) AS dropoff_lat,
         ST_Distance(dr.pickup_location, $1::geography) AS distance_to_pickup
       FROM delivery_requests dr
       WHERE dr.status = 'pending'
         AND ST_DWithin(dr.pickup_location, $1::geography, 5000)
         AND NOW() - dr.created_at <= INTERVAL '15 seconds'
       ORDER BY distance_to_pickup ASC`,
      [current_location]
    );

    res.json({ jobs: jobsRes.rows });
  } catch (err: any) {
    console.error('[Matching] getAvailableJobs error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * POST /api/delivery/:id/accept
 * First Accept Wins logic.
 */
export const acceptJob = async (req: Request, res: Response) => {
  const courierId = (req as any).user?.id;
  const { id: deliveryId } = req.params;

  try {
    // Atomic UPDATE to ensure only the first courier gets it
    const result = await pool.query(
      `UPDATE delivery_requests
       SET status = 'matched',
           courier_id = $1,
           matched_at = NOW(),
           updated_at = NOW()
       WHERE id = $2 AND status = 'pending'
       RETURNING id, status`,
      [courierId, deliveryId]
    );

    if (result.rowCount === 0) {
      // Either job doesn't exist, is no longer pending (someone else took it), or 15s passed
      res.status(400).json({ error: 'Job no longer available' });
      return;
    }

    res.json({ message: 'Job accepted successfully', delivery: result.rows[0] });
  } catch (err: any) {
    console.error('[Matching] acceptJob error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * POST /api/delivery/:id/reject
 * Courier intentionally rejects a job. For now, it just acknowledges it.
 * In a production env, you'd insert into a 'rejected_jobs' table.
 */
export const rejectJob = async (req: Request, res: Response) => {
  // const courierId = (req as any).user?.id;
  // const { id: deliveryId } = req.params;

  res.json({ message: 'Job rejected' });
};
