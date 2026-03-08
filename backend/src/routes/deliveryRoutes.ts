import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { requestDelivery } from '../controllers/shopController';

const router = Router();

router.use(authenticate);

// POST /api/delivery/request — Customer requests a delivery
router.post('/request', authorize(['customer']), requestDelivery);

export default router;
