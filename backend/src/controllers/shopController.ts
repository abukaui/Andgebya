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
 * List all products for a specific shop
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
 * GET /api/shops/catalog
 * List all active products from all active shops (Public E-Commerce View)
 */
export const getCatalog = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT 
         p.id, p.shop_id, p.name, p.description, p.price, p.category, p.image_url, p.is_available,
         s.name AS shop_name, s.address AS shop_address, s.rating AS shop_rating,
         ST_X(s.location::geometry) AS lng,
         ST_Y(s.location::geometry) AS lat
       FROM products p
       JOIN shops s ON p.shop_id = s.id
       WHERE p.is_available = true AND s.is_active = true
       ORDER BY p.created_at DESC`
    );
    res.json({ catalog: result.rows });
  } catch (err: any) {
    console.error('[Shop] getCatalog error:', err);
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
  const { name, description, price, category, image_url } = req.body;

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
      `INSERT INTO products (shop_id, name, description, price, category, image_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [shopId, name, description || null, price, category || 'Food', image_url || null]
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
  const { name, description, price, category, image_url, is_available } = req.body;

  try {
    const result = await pool.query(
      `UPDATE products p
       SET name         = COALESCE($1, p.name),
           description  = COALESCE($2, p.description),
           price        = COALESCE($3, p.price),
           category     = COALESCE($4, p.category),
           image_url    = COALESCE($5, p.image_url),
           is_available = COALESCE($6, p.is_available),
           updated_at   = NOW()
       FROM shops s
       WHERE p.id = $7
         AND p.shop_id = s.id
         AND s.owner_id = $8
       RETURNING p.*`,
      [name, description, price, category, image_url, is_available, productId, userId]
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
 * Body: { shop_id, pickup_lat, pickup_lng, dropoff_lat, dropoff_lng, total_amount, delivery_fee, package_details }
 */
export const requestDelivery = async (req: Request, res: Response) => {
  const customerId = (req as any).user?.id;
  const {
    shop_id,
    pickup_lat, pickup_lng,
    dropoff_lat, dropoff_lng,
    total_amount,
    delivery_fee,
    package_details
  } = req.body;

  const platform_fee = parseFloat((total_amount * 0.05).toFixed(2)); // 5% fee

  if (!shop_id || !pickup_lat || !pickup_lng || !dropoff_lat || !dropoff_lng) {
    res.status(400).json({ error: 'shop_id, pickup and dropoff coordinates are required' });
    return;
  }

  try {
    // FR 3.3.2 & 3.3.3: Validate that at least one courier exists within configured radius (5000m)
    const nearbyCouriersCheck = await pool.query(
      `SELECT user_id 
       FROM courier_profiles 
       WHERE is_available = true 
         AND is_verified = true
         AND ST_DWithin(current_location, ST_SetSRID(ST_MakePoint($1, $2), 4326), 5000)
       LIMIT 1`,
      [pickup_lng, pickup_lat]
    );

    if (nearbyCouriersCheck.rowCount === 0) {
      res.status(404).json({ error: 'No courier available in your area.' });
      return;
    }

    // Capture package_details in the database if the column exists, otherwise just log it or pass it.
    // For now we assume delivery_requests has a package_details column, if not we ignore it or alter table.

    const result = await pool.query(
      `INSERT INTO delivery_requests
         (customer_id, shop_id, pickup_location, dropoff_location,
          total_amount, delivery_fee, platform_fee, status, package_details)
       VALUES (
         $1, $2,
         ST_SetSRID(ST_MakePoint($4, $3), 4326),
         ST_SetSRID(ST_MakePoint($6, $5), 4326),
         $7, $8, $9,
         'pending', $10
       )
       RETURNING id, status, total_amount, delivery_fee, platform_fee, package_details, created_at`,
      [
        customerId, shop_id,
        pickup_lat, pickup_lng,
        dropoff_lat, dropoff_lng,
        total_amount, delivery_fee, platform_fee,
        package_details || null
      ]
    );

    res.status(201).json({
      message: 'Delivery requested! Searching for nearby couriers.',
      delivery: result.rows[0],
    });
  } catch (err: any) {
    // If package_details column doesn't exist yet, we can catch the error and fallback or just alter the table.
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
