import { pool } from '../config/db';

async function migrate() {
  console.log('🔄 Starting migration: Add category to products...');
  try {
    await pool.query(`
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Food';
    `);
    console.log('✅ Migration successful: category column added.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

migrate();
