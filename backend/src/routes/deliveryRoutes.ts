import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { requestDelivery } from '../controllers/shopController';
import { getAvailableJobs, acceptJob, rejectJob, updateTaskStatus } from '../controllers/matchingController';
import { confirmPayment, completeDelivery, getMyOrders, getCourierTasks } from '../controllers/financialController';

const router = Router();

router.use(authenticate);

// POST /api/delivery/request — Customer requests a delivery
router.post('/request', authorize(['customer']), requestDelivery);

// GET /api/delivery/my-orders — Customer views their order history
router.get('/my-orders', authorize(['customer']), getMyOrders);

// POST /api/delivery/:id/confirm-payment — Customer records Telebirr/CBE Birr txn
router.post('/:id/confirm-payment', authorize(['customer']), confirmPayment);

// PATCH /api/delivery/:id/complete — Courier marks delivery done, releases funds
router.patch('/:id/complete', authorize(['courier']), completeDelivery);

// GET /api/delivery/available — Couriers fetch nearby pending jobs
router.get('/available', authorize(['courier']), getAvailableJobs);

// POST /api/delivery/:id/accept — Courier accepts job
router.post('/:id/accept', authorize(['courier']), acceptJob);

// POST /api/delivery/:id/reject — Courier rejects job
router.post('/:id/reject', authorize(['courier']), rejectJob);

// GET /api/delivery/courier/tasks — Courier fetches their active & past jobs
router.get('/courier/tasks', authorize(['courier']), getCourierTasks);

// PATCH /api/delivery/:id/status — Courier updates status (picked_up, in_transit)
router.patch('/:id/status', authorize(['courier']), updateTaskStatus);

export default router;
