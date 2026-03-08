/**
 * Ardi MVP Application Entry Point
 * Location: src/index.ts
 */

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { authenticate, authorize } from './middleware/auth';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" }
});

app.use(express.json());

// --- Core Routes ---

// 1. Delivery Lifecycle (Matching)
app.post('/api/delivery/request', authenticate, authorize(['customer']), (req, res) => {
  // Logic: Create request -> Trigger matching broadcast
  res.status(202).json({ message: "Delivery request created. Finding nearby couriers..." });
});

app.post('/api/delivery/accept', authenticate, authorize(['courier']), (req, res) => {
  // Logic: Redis-backed First Accept Wins
  res.status(200).json({ message: "Job accepted!" });
});

// 2. KYC & Onboarding
app.post('/api/courier/kyc', authenticate, authorize(['courier']), (req, res) => {
  // Logic: Fayda ID upload & status update
  res.status(200).json({ message: "KYC documents submitted for review." });
});

// 3. Real-time Tracking (WebSockets)
io.on('connection', (socket) => {
  console.log('User connected to Ardi Real-time Network:', socket.id);
  
  socket.on('update_location', (data) => {
    // Update Courier Location in PostGIS
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`
  🚀 Ardi MVP Services Online
  ---------------------------
  🛡️  Brand: Reliability & Security
  🪪  KYC: Fayda ID Integrated
  🤝  Trust: Courier-Bond™ Active
  📍  Port: ${PORT}
  `);
});
