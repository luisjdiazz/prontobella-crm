// ProntoBella CRM — Seed Script
// Run: npm run seed (from backend/)

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'postgres',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function seed() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Create owner user (password: admin123)
    const ownerHash = await bcrypt.hash('admin123', 10);
    await client.query(
      `INSERT INTO users (name, email, password_hash, role, pin)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO NOTHING`,
      ['Administrador', 'admin@prontobella.com', ownerHash, 'owner', '0000']
    );

    // Create default cashier (PIN: 1234)
    await client.query(
      `INSERT INTO users (name, email, password_hash, role, pin)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO NOTHING`,
      ['Cajera Principal', 'cajera@prontobella.com', null, 'cashier', '1234']
    );

    await client.query('COMMIT');
    console.log('Seed completado exitosamente!');
    console.log('  Owner: admin@prontobella.com / admin123');
    console.log('  Cajera PIN: 1234');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error en seed:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
