import { Request, Response } from 'express';
import { pool } from '../config/db';

// ─── SHOP CRUD ────────────────────────────────────────────────────────────────

/**
 * POST /api/shops
 * Create a new shop for the authenticated merchant
 */
export const createShop = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { name, address, lat, lng } = req.body;

  if (!name || !address) {
    res.status(400).json({ error: 'name and address are required' });
    return;
  }

  try {
    const result = await pool.query(
      `INSERT INTO shops (owner_id, name, address, location)
       VALUES ($1, $2, $3, ${lat && lng ? 'ST_SetSRID(ST_MakePoint($5, $4), 4326)' : 'NULL'})
       RETURNING id, name, address, rating, is_active, created_at`,
      lat && lng ? [userId, name, address, lat, lng] : [userId, name, address]
    );
    res.status(201).json({ message: 'Shop created', shop: result.rows[0] });
  } catch (err: any) {
    console.error('[Shop] createShop error:', err);
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
};

/**
 * GET /api/shops/mine
 * Get the authenticated merchant's own shop
 */
export const getMyShop = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;

  try {
    const result = await pool.query(
      `SELECT s.*, 
              ST_X(s.location::geometry) AS lng,
              ST_Y(s.location::geometry) AS lat
       FROM shops s
       WHERE s.owner_id = $1`,
      [userId]
    );
    res.json({ shop: result.rows[0] || null });
  } catch (err: any) {
    console.error('[Shop] getMyShop error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * PATCH /api/shops/:id
 * Update shop info (owner only)
 */
export const updateShop = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { id } = req.params;
  const { name, address, is_active } = req.body;

  try {
    const result = await pool.query(
      `UPDATE shops
       SET name = COALESCE($1, name),
           address = COALESCE($2, address),
           is_active = COALESCE($3, is_active),
           updated_at = NOW()
       WHERE id = $4 AND owner_id = $5
       RETURNING *`,
      [name, address, is_active, id, userId]
    );

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Shop not found or not yours' });
      return;
    }
    res.json({ message: 'Shop updated', shop: result.rows[0] });
  } catch (err: any) {
    console.error('[Shop] updateShop error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── PRODUCT CRUD ─────────────────────────────────────────────────────────────

/**
 * GET /api/shops/:shopId/products
 * List all products for a shop (public)
 */
export const getProducts = async (req: Request, res: Response) => {
  const { shopId } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM products WHERE shop_id = $1 ORDER BY created_at DESC`,
      [shopId]
    );
    res.json({ products: result.rows });
  } catch (err: any) {
    console.error('[Shop] getProducts error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * POST /api/shops/:shopId/products
 * Add a product to a shop (merchant only, must own shop)
 */
export const addProduct = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { shopId } = req.params;
  const { name, description, price, image_url } = req.body;

  if (!name || price == null) {
    res.status(400).json({ error: 'name and price are required' });
    return;
  }

  try {
    // Verify the merchant owns this shop
    const shopCheck = await pool.query(
      'SELECT id FROM shops WHERE id = $1 AND owner_id = $2',
      [shopId, userId]
    );
    if (shopCheck.rowCount === 0) {
      res.status(403).json({ error: 'You do not own this shop' });
      return;
    }

    const result = await pool.query(
      `INSERT INTO products (shop_id, name, description, price, image_url)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [shopId, name, description || null, price, image_url || null]
    );
    res.status(201).json({ message: 'Product added', product: result.rows[0] });
  } catch (err: any) {
    console.error('[Shop] addProduct error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * PATCH /api/products/:productId
 * Update a product (merchant only)
 */
export const updateProduct = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { productId } = req.params;
  const { name, description, price, image_url, is_available } = req.body;

  try {
    const result = await pool.query(
      `UPDATE products p
       SET name         = COALESCE($1, p.name),
           description  = COALESCE($2, p.description),
           price        = COALESCE($3, p.price),
           image_url    = COALESCE($4, p.image_url),
           is_available = COALESCE($5, p.is_available),
           updated_at   = NOW()
       FROM shops s
       WHERE p.id = $6
         AND p.shop_id = s.id
         AND s.owner_id = $7
       RETURNING p.*`,
      [name, description, price, image_url, is_available, productId, userId]
    );

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Product not found or not yours' });
      return;
    }
    res.json({ message: 'Product updated', product: result.rows[0] });
  } catch (err: any) {
    console.error('[Shop] updateProduct error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * DELETE /api/products/:productId
 * Delete a product (merchant only)
 */
export const deleteProduct = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { productId } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM products p
       USING shops s
       WHERE p.id = $1
         AND p.shop_id = s.id
         AND s.owner_id = $2
       RETURNING p.id`,
      [productId, userId]
    );

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Product not found or not yours' });
      return;
    }
    res.json({ message: 'Product deleted' });
  } catch (err: any) {
    console.error('[Shop] deleteProduct error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── DELIVERY REQUEST ─────────────────────────────────────────────────────────

/**
 * POST /api/delivery/request
 * Customer creates a delivery request from a shop
 * Body: { shop_id, pickup_lat, pickup_lng, dropoff_lat, dropoff_lng, total_amount, delivery_fee }
 */
export const requestDelivery = async (req: Request, res: Response) => {
  const customerId = (req as any).user?.id;
  const {
    shop_id,
    pickup_lat, pickup_lng,
    dropoff_lat, dropoff_lng,
    total_amount,
    delivery_fee,
  } = req.body;

  const platform_fee = parseFloat((total_amount * 0.05).toFixed(2)); // 5% fee

  if (!shop_id || !pickup_lat || !pickup_lng || !dropoff_lat || !dropoff_lng) {
    res.status(400).json({ error: 'shop_id, pickup and dropoff coordinates are required' });
    return;
  }

  try {
    const result = await pool.query(
      `INSERT INTO delivery_requests
         (customer_id, shop_id, pickup_location, dropoff_location,
          total_amount, delivery_fee, platform_fee, status)
       VALUES (
         $1, $2,
         ST_SetSRID(ST_MakePoint($4, $3), 4326),
         ST_SetSRID(ST_MakePoint($6, $5), 4326),
         $7, $8, $9,
         'pending'
       )
       RETURNING id, status, total_amount, delivery_fee, platform_fee, created_at`,
      [
        customerId, shop_id,
        pickup_lat, pickup_lng,
        dropoff_lat, dropoff_lng,
        total_amount, delivery_fee, platform_fee
      ]
    );

    res.status(201).json({
      message: 'Delivery requested! Searching for nearby couriers.',
      delivery: result.rows[0],
    });
  } catch (err: any) {
    console.error('[Delivery] requestDelivery error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * GET /api/delivery/shop/:shopId
 * Get all delivery requests for a shop (merchant view)
 */
export const getShopOrders = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { shopId } = req.params;

  try {
    // Verify ownership
    const shopCheck = await pool.query(
      'SELECT id FROM shops WHERE id = $1 AND owner_id = $2',
      [shopId, userId]
    );
    if (shopCheck.rowCount === 0) {
      res.status(403).json({ error: 'You do not own this shop' });
      return;
    }

    const result = await pool.query(
      `SELECT 
         dr.id, dr.status, dr.total_amount, dr.delivery_fee, dr.platform_fee,
         dr.created_at, dr.matched_at, dr.delivered_at,
         u.full_name AS customer_name, u.phone_number AS customer_phone
       FROM delivery_requests dr
       JOIN users u ON u.id = dr.customer_id
       WHERE dr.shop_id = $1
       ORDER BY dr.created_at DESC`,
      [shopId]
    );

    res.json({ orders: result.rows });
  } catch (err: any) {
    console.error('[Delivery] getShopOrders error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
