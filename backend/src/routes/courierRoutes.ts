import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  updateLocation,
  setAvailability,
  getCourierProfile,
  getNearbyCouriers,
} from '../controllers/courierController';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Courier-only routes
router.post('/location', updateLocation);
router.patch('/availability', setAvailability);
router.get('/profile', getCourierProfile);

// Nearby couriers — accessible by any authenticated user
router.get('/nearby', getNearbyCouriers);

export default router;
