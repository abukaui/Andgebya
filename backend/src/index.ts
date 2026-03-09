import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/authRoutes';
import courierRoutes from './routes/courierRoutes';
import shopRoutes from './routes/shopRoutes';
import deliveryRoutes from './routes/deliveryRoutes';
import adminRoutes from './routes/adminRoutes';
import { authenticate, authorize } from './middleware/auth';

// Load .env from backend/ root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();

// ✅ CORS: Allow frontend dev servers
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
}));

// Enable larger payloads for Base64 image uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// --- Health Check ---
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- Public Routes ---
app.use('/api/auth', authRoutes);

// --- Protected Feature Routes ---
app.use('/api/courier', courierRoutes);   // Module 2: Location Services
app.use('/api/shops', shopRoutes);        // Module 3: Shop & Products
app.use('/api/delivery', deliveryRoutes); // Module 3+4: Delivery Requests & Matching
app.use('/api/admin', adminRoutes);       // Module 5: Admin Financial Controls

// --- Admin / Misc Protected Routes ---
app.get('/api/admin', authenticate, authorize(['admin']), (req, res) => {
  res.json({ message: 'Admin dashboard accessed' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
  🚀 Ardi Backend Online
  ----------------------------------
  🛡️  Auth:     /api/auth
  📍  Location: /api/courier
  🏪  Shops:    /api/shops
  📦  Delivery: /api/delivery
  🔌  Port:     ${PORT}
  ----------------------------------
  `);
});
