const { Pool } = require('pg');
require('dotenv').config({ path: './.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function runMigration() {
  try {
    await pool.query(`
      ALTER TABLE payment_records
        ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'telebirr'
          CHECK (payment_method IN ('telebirr', 'cbe_birr'));

      ALTER TABLE delivery_requests
        ADD COLUMN IF NOT EXISTS package_details TEXT;

      CREATE INDEX IF NOT EXISTS idx_payment_delivery ON payment_records (delivery_request_id);
    `);
    console.log('✅ Migration successful');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    pool.end();
  }
}

runMigration();
