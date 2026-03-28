import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  updateLocation,
  setAvailability,
  getCourierProfile,
  getNearbyCouriers,
  uploadKYC,
} from '../controllers/courierController';
import { kycUpload } from '../middleware/uploadMiddleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Courier-only routes
router.post('/location', updateLocation);
router.patch('/availability', setAvailability);
router.get('/profile', getCourierProfile);

// Nearby couriers — accessible by any authenticated user
router.get('/nearby', getNearbyCouriers);

// kyc upload
router.post('/kyc/upload', kycUpload.fields([{ name: 'front', maxCount: 1 }, { name: 'back', maxCount: 1 }]), uploadKYC);

export default router;
