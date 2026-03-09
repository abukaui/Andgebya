import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { deductCourierBond, getAllPaymentRecords } from '../controllers/financialController';
import { getAdminCouriers } from '../controllers/adminController';

const router = Router();

// All admin routes require authentication + admin role
router.use(authenticate);
router.use(authorize(['admin']));

// POST /api/admin/courier/:id/deduct-bond — Deduct from courier security deposit
router.post('/courier/:id/deduct-bond', deductCourierBond);

// GET /api/admin/payment-records — Full audit log of all payments
router.get('/payment-records', getAllPaymentRecords);

// GET /api/admin/couriers — Admin view of all couriers (for bond management)
router.get('/couriers', getAdminCouriers);

export default router;
