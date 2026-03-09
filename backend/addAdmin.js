const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function addAdmin() {
  const email = 'abuy3832@gmail.com';
  const password = 'abukamengistu';
  const fullName = 'Abu Admin';
  const phone = '+251900000000'; // Placeholder since phone is usually required
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Check if user already exists
    const checkRes = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    
    if (checkRes.rowCount > 0) {
      console.log('User already exists, updating role to admin...');
      await pool.query(
        'UPDATE users SET role = $1, password_hash = $2 WHERE email = $3',
        ['admin', hashedPassword, email]
      );
      console.log('✅ Admin user updated successfully.');
    } else {
      console.log('Inserting new admin user...');
      await pool.query(
        `INSERT INTO users (email, password_hash, full_name, phone_number, role, is_verified) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [email, hashedPassword, fullName, phone, 'admin', true]
      );
      console.log('✅ Admin user created successfully.');
    }
  } catch (err) {
    console.error('❌ Failed to add admin:', err);
  } finally {
    pool.end();
  }
}

addAdmin();
