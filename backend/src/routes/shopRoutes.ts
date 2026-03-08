import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  createShop,
  getMyShop,
  updateShop,
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  requestDelivery,
  getShopOrders,
} from '../controllers/shopController';

const router = Router();

// All routes require authentication
router.use(authenticate);

// ─── Shop Routes ─────────────────────────────────────────────
router.post('/', authorize(['merchant']), createShop);           // Create my shop
router.get('/mine', authorize(['merchant']), getMyShop);         // Get my shop
router.patch('/:id', authorize(['merchant']), updateShop);       // Update my shop

// ─── Product Routes ──────────────────────────────────────────
router.get('/:shopId/products', getProducts);                          // List products (public)
router.post('/:shopId/products', authorize(['merchant']), addProduct); // Add product
router.patch('/products/:productId', authorize(['merchant']), updateProduct); // Update product
router.delete('/products/:productId', authorize(['merchant']), deleteProduct); // Delete product

// ─── Delivery Requests (Shop-facing) ─────────────────────────
router.get('/:shopId/orders', authorize(['merchant']), getShopOrders); // Merchant sees orders

export default router;
