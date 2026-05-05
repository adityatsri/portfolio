const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const db = require('../db');

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Tables created flag (per cold start), but always re-seed if settings is empty
let tablesCreated = false;
const ensureDB = async () => {
  const bcrypt = require('bcryptjs');

  if (!tablesCreated) {
    await db.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        admin_password TEXT NOT NULL,
        contact_email TEXT DEFAULT 'adityatadury@gmail.com',
        contact_phone TEXT DEFAULT '+91 9999999999',
        instagram_url TEXT DEFAULT 'https://instagram.com/adityatadury',
        youtube_url TEXT DEFAULT 'https://youtube.com/@adityatadury',
        hero_title TEXT DEFAULT 'TADURY SRINIVAS ADITYA',
        hero_subtitle TEXT DEFAULT 'Videographer • Photographer • Video Editor',
        display_name TEXT DEFAULT 'Tadury Srinivas Aditya',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS videos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        description TEXT DEFAULT '',
        category TEXT NOT NULL,
        media_type TEXT NOT NULL,
        media_url TEXT DEFAULT '',
        youtube_id TEXT DEFAULT '',
        thumbnail TEXT DEFAULT '',
        featured BOOLEAN DEFAULT FALSE,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    tablesCreated = true;
  }

  // Always check — re-seed if settings was deleted
  const { rows } = await db.query('SELECT id FROM settings LIMIT 1');
  if (rows.length === 0) {
    const hashed = await bcrypt.hash('adhi@admin2024', 10);
    await db.query(
      `INSERT INTO settings
        (admin_password, contact_email, contact_phone, instagram_url, youtube_url,
         hero_title, hero_subtitle, display_name)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [
        hashed,
        'adityatadury@gmail.com',
        '+91 9999999999',
        'https://instagram.com/adityatadury',
        'https://youtube.com/@adityatadury',
        'TADURY SRINIVAS ADITYA',
        'Videographer • Photographer • Video Editor',
        'Tadury Srinivas Aditya',
      ]
    );
    console.log('Default settings seeded. Admin password: adhi@admin2024');
  }
};

// Run DB init before every request
app.use(async (req, res, next) => {
  try {
    await ensureDB();
    next();
  } catch (err) {
    console.error('DB init error:', err.message);
    res.status(500).json({ error: 'Database initialization failed' });
  }
});

app.use('/api/auth', require('../routes/auth'));
app.use('/api/videos', require('../routes/videos'));
app.use('/api/settings', require('../routes/settings'));

module.exports = app;
