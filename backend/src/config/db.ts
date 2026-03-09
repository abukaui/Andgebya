import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from the backend/ directory root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// pool.on('connect', () => {
//   console.log('🐘 PostgreSQL connected → ' + process.env.DATABASE_URL?.split('@')[1]);
// });

// pool.on('error', (err) => {
//   console.error('❌ PostgreSQL pool error:', err.message);
// });
