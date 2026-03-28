import { Request, Response } from 'express';
import { pool } from '../config/db';

// ─── CUSTOMER: Confirm Payment ────────────────────────────────────────────────

/**
 * POST /api/delivery/:id/confirm-payment
 * Customer submits their Telebirr or CBE Birr transaction ID.
 * Creates a payment record in 'held_in_escrow' state.
 * Body: { transaction_id, payment_method: 'telebirr' | 'cbe_birr' }
 */
export const confirmPayment = async (req: Request, res: Response) => {
  const customerId = (req as any).user?.id;
  const { id: deliveryId } = req.params;
  const { transaction_id, payment_method = 'telebirr' } = req.body;

  if (!transaction_id?.trim()) {
    res.status(400).json({ error: 'transaction_id is required' });
    return;
  }

  if (!['telebirr', 'cbe_birr'].includes(payment_method)) {
    res.status(400).json({ error: 'payment_method must be telebirr or cbe_birr' });
    return;
  }

  try {
    // Verify this delivery belongs to this customer
    const deliveryRes = await pool.query(
      `SELECT id, customer_id, total_amount, delivery_fee, platform_fee, status, courier_id
       FROM delivery_requests WHERE id = $1`,
      [deliveryId]
    );

    if (deliveryRes.rowCount === 0) {
      res.status(404).json({ error: 'Delivery not found' });
      return;
    }

    const delivery = deliveryRes.rows[0];

    if (delivery.customer_id !== customerId) {
      res.status(403).json({ error: 'This is not your delivery' });
      return;
    }

    if (!['pending', 'matched'].includes(delivery.status)) {
      res.status(400).json({ error: `Cannot record payment for a delivery with status: ${delivery.status}` });
      return;
    }

    const totalPaid = parseFloat(delivery.total_amount);
    const platformFee = parseFloat(delivery.platform_fee);
    const deliveryFee = parseFloat(delivery.delivery_fee);
    const merchantShare = totalPaid - platformFee - deliveryFee;
    const courierShare = deliveryFee;

    // Insert payment record (idempotent — fails if duplicate transaction_id)
    const paymentRes = await pool.query(
      `INSERT INTO payment_records 
         (delivery_request_id, transaction_id, payment_method, total_paid, merchant_share, courier_share, platform_fee, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'held_in_escrow')
       RETURNING id, transaction_id, payment_method, total_paid, merchant_share, courier_share, platform_fee, status, created_at`,
      [deliveryId, transaction_id.trim(), payment_method, totalPaid, merchantShare, courierShare, platformFee]
    );

    res.status(201).json({
      message: 'Payment recorded successfully. Funds held in escrow.',
      payment: paymentRes.rows[0],
    });
  } catch (err: any) {
    if (err.code === '23505') {
      // Unique constraint on transaction_id
      res.status(409).json({ error: 'This transaction ID has already been used' });
      return;
    }
    console.error('[Financial] confirmPayment error:', err);
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
};

// ─── COURIER: Complete Delivery & Release Funds ───────────────────────────────

/**
 * PATCH /api/delivery/:id/complete
 * Courier marks delivery as delivered. Releases payment from escrow.
 */
export const completeDelivery = async (req: Request, res: Response) => {
  const courierId = (req as any).user?.id;
  const { id: deliveryId } = req.params;

  try {
    // Ensure this delivery belongs to this courier and is in transit
    const deliveryRes = await pool.query(
      `SELECT id, courier_id, status FROM delivery_requests WHERE id = $1`,
      [deliveryId]
    );

    if (deliveryRes.rowCount === 0) {
      res.status(404).json({ error: 'Delivery not found' });
      return;
    }

    const delivery = deliveryRes.rows[0];

    if (delivery.courier_id !== courierId) {
      res.status(403).json({ error: 'This delivery is not assigned to you' });
      return;
    }

    if (delivery.status === 'delivered') {
      res.status(400).json({ error: 'Delivery is already marked as delivered' });
      return;
    }

    // Update delivery status to delivered
    await pool.query(
      `UPDATE delivery_requests 
       SET status = 'delivered', delivered_at = NOW(), updated_at = NOW()
       WHERE id = $1`,
      [deliveryId]
    );

    // Release funds from escrow
    const releaseRes = await pool.query(
      `UPDATE payment_records 
       SET status = 'released'
       WHERE delivery_request_id = $1 AND status = 'held_in_escrow'
       RETURNING id, total_paid, merchant_share, courier_share, platform_fee, status`,
      [deliveryId]
    );

    res.json({
      message: 'Delivery completed! Funds released from escrow.',
      delivery: { id: deliveryId, status: 'delivered' },
      payment: releaseRes.rows[0] || null,
    });
  } catch (err: any) {
    console.error('[Financial] completeDelivery error:', err);
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
};

/**
 * GET /api/delivery/courier/tasks
 * Returns all delivery requests assigned to the authenticated courier.
 */
export const getCourierTasks = async (req: Request, res: Response) => {
  const courierId = (req as any).user?.id;

  try {
    const result = await pool.query(
      `SELECT 
         dr.id, dr.status, dr.total_amount, dr.delivery_fee, dr.platform_fee,
         dr.created_at, dr.matched_at, dr.picked_up_at, dr.delivered_at,
         dr.package_details,
         s.name AS shop_name, s.address AS shop_address,
         u.full_name AS customer_name, u.phone_number AS customer_phone,
         ST_X(dr.pickup_location::geometry) AS pickup_lng,
         ST_Y(dr.pickup_location::geometry) AS pickup_lat,
         ST_X(dr.dropoff_location::geometry) AS dropoff_lng,
         ST_Y(dr.dropoff_location::geometry) AS dropoff_lat
       FROM delivery_requests dr
       LEFT JOIN shops s ON s.id = dr.shop_id
       LEFT JOIN users u ON u.id = dr.customer_id
       WHERE dr.courier_id = $1
       ORDER BY dr.created_at DESC`,
      [courierId]
    );

    res.json({ tasks: result.rows });
  } catch (err: any) {
    console.error('[Financial] getCourierTasks error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── CUSTOMER: My Orders ─────────────────────────────────────────────────────

/**
 * GET /api/delivery/my-orders
 * Returns all delivery requests for the authenticated customer with payment info.
 */
export const getMyOrders = async (req: Request, res: Response) => {
  const customerId = (req as any).user?.id;

  try {
    const result = await pool.query(
      `SELECT 
         dr.id, dr.status, dr.total_amount, dr.delivery_fee, dr.platform_fee,
         dr.created_at, dr.matched_at, dr.delivered_at, dr.package_details,
         s.name AS shop_name,
         pr.transaction_id, pr.payment_method, pr.status AS payment_status,
         COALESCE(u.full_name, 'Not assigned') AS courier_name
       FROM delivery_requests dr
       LEFT JOIN shops s ON s.id = dr.shop_id
       LEFT JOIN payment_records pr ON pr.delivery_request_id = dr.id
       LEFT JOIN users u ON u.id = dr.courier_id
       WHERE dr.customer_id = $1
       ORDER BY dr.created_at DESC`,
      [customerId]
    );

    res.json({ orders: result.rows });
  } catch (err: any) {
    console.error('[Financial] getMyOrders error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── ADMIN: Deduct Courier Bond ───────────────────────────────────────────────

/**
 * POST /api/admin/courier/:id/deduct-bond
 * Admin deducts from a courier's security deposit bond.
 * Body: { amount: number, reason: string }
 */
export const deductCourierBond = async (req: Request, res: Response) => {
  const { id: courierId } = req.params;
  const { amount, reason } = req.body;

  const deductAmount = parseFloat(amount);
  if (isNaN(deductAmount) || deductAmount <= 0) {
    res.status(400).json({ error: 'amount must be a positive number' });
    return;
  }
  if (!reason?.trim()) {
    res.status(400).json({ error: 'reason is required' });
    return;
  }

  try {
    const result = await pool.query(
      `UPDATE courier_profiles
       SET bond_amount = GREATEST(0, bond_amount - $1),
           updated_at = NOW()
       WHERE user_id = $2
       RETURNING user_id, bond_amount`,
      [deductAmount, courierId]
    );

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Courier not found' });
      return;
    }

    res.json({
      message: `Deducted ETB ${deductAmount} from courier bond. Reason: ${reason}`,
      courier: result.rows[0],
    });
  } catch (err: any) {
    console.error('[Financial] deductCourierBond error:', err);
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
};

// ─── ADMIN: All Payment Records ───────────────────────────────────────────────

/**
 * GET /api/admin/payment-records
 * Returns all payment records for admin audit.
 */
export const getAllPaymentRecords = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT 
         pr.id, pr.transaction_id, pr.payment_method, pr.total_paid,
         pr.merchant_share, pr.courier_share, pr.platform_fee, pr.status,
         pr.created_at,
         dr.status AS delivery_status,
         uc.full_name AS customer_name,
         uu.full_name AS courier_name,
         s.name AS shop_name
       FROM payment_records pr
       LEFT JOIN delivery_requests dr ON dr.id = pr.delivery_request_id
       LEFT JOIN users uc ON uc.id = dr.customer_id
       LEFT JOIN users uu ON uu.id = dr.courier_id
       LEFT JOIN shops s ON s.id = dr.shop_id
       ORDER BY pr.created_at DESC`,
    );

    res.json({ records: result.rows });
  } catch (err: any) {
    console.error('[Financial] getAllPaymentRecords error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
