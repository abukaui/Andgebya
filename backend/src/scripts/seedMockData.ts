import { pool } from '../config/db';
import bcrypt from 'bcryptjs';

const MOCK_PRODUCTS = [
  { name: 'Classic Burger', description: 'Juicy beef patty with fresh lettuce and tomato', price: 150.00, category: 'Food', image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500' },
  { name: 'Margherita Pizza', description: 'Fresh mozzarella, basil, and tomato sauce', price: 280.00, category: 'Food', image_url: 'https://images.unsplash.com/photo-1574071318508-1cdbad80ad38?w=500' },
  { name: 'Chicken Tibs', description: 'Traditional Ethiopian sautéed chicken with spices', price: 220.00, category: 'Food', image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500' },
  { name: 'Iced Coffee', description: 'Cold brewed coffee with a splash of milk', price: 85.00, category: 'Drink', image_url: 'https://images.unsplash.com/photo-1517701604599-bb29b5650947?w=500' },
  { name: 'Leather Bag', description: 'Handcrafted genuine leather backpack', price: 1200.00, category: 'Other', image_url: 'https://images.unsplash.com/photo-1548036328-19db89a4273c?w=500' },
];

async function seed() {
  console.log('🌱 Starting database seeding...');

  try {
    // 1. Ensure we have at least 2 merchant users
    const merchants = [
      { email: 'merchant1@ardi.com', phone: '0911223344', name: 'Abebe Dessie' },
      { email: 'merchant2@ardi.com', phone: '0922334455', name: 'Sara Kebede' }
    ];

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    for (const m of merchants) {
      // Create user if not exists
      const userRes = await pool.query(
        `INSERT INTO users (email, phone_number, password_hash, full_name, role)
         VALUES ($1, $2, $3, $4, 'merchant')
         ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
         RETURNING id`,
        [m.email, m.phone, passwordHash, m.name]
      );
      const userId = userRes.rows[0].id;

      // 2. Create a shop for this merchant if not exists
      const shopName = m.name.split(' ')[0] + "'s Kitchen";
      const shopRes = await pool.query(
        `INSERT INTO shops (owner_id, name, address, location)
         VALUES ($1, $2, $3, ST_SetSRID(ST_MakePoint(38.7578, 8.9806), 4326))
         ON CONFLICT DO NOTHING
         RETURNING id`,
        [userId, shopName, 'Bole, Addis Ababa']
      );

      let shopId;
      if (shopRes.rowCount === 0) {
        const existingShop = await pool.query('SELECT id FROM shops WHERE owner_id = $1', [userId]);
        shopId = existingShop.rows[0].id;
      } else {
        shopId = shopRes.rows[0].id;
      }

      // 3. Add products to the shop
      console.log(`🏪 Seeding products for shop: ${shopName}...`);
      for (const p of MOCK_PRODUCTS) {
        await pool.query(
          `INSERT INTO products (shop_id, name, description, price, category, image_url)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT DO NOTHING`,
          [shopId, p.name, p.description, p.price, p.category, p.image_url]
        );
      }
    }

    console.log('✅ Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seed();
