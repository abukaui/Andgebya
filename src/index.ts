import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import { authenticate, authorize } from './middleware/auth';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// --- Public Routes ---
app.use('/api/auth', authRoutes);

// --- Protected Routes (Examples) ---
app.get('/api/profile', authenticate, (req, res) => {
  res.json({ message: 'User profile accessed', user: (req as any).user });
});

app.get('/api/admin', authenticate, authorize(['admin']), (req, res) => {
  res.json({ message: 'Admin dashboard accessed' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
  🚀 Ardi Backend Services Online
  ---------------------------
  🛡️  Auth: Module 1 Integrated
  📍  Port: ${PORT}
  ---------------------------
  `);
});
