const { pool } = require('./src/config/db.ts');

async function run() {
  try {
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image_url TEXT');
    console.log('Successfully added profile_image_url');
  } catch (error) {
    console.error('Failed:', error);
  } finally {
    process.exit(0);
  }
}

run();
