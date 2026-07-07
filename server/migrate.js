const { pool, init } = require('./db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

async function seedAdmin() {
  try {
    await init();
    // create a test user if not exists
    const email = process.env.SEED_EMAIL || 'admin@example.com';
    const password = process.env.SEED_PASSWORD || 'password';
    const [rows] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (rows && rows.length) {
      console.log('User already exists:', email);
      return;
    }
    const id = uuidv4();
    const hashed = bcrypt.hashSync(password, 10);
    await pool.query('INSERT INTO users (id, name, email, password, phone) VALUES (?, ?, ?, ?, ?)', [id, 'Admin User', email, hashed, null]);
    console.log('Seeded user:', email, 'password:', password);
  } catch (err) {
    console.error('Migration/seed failed:', err.message || err);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

seedAdmin();
