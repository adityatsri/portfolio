const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const db = require('./db');

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── API Routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/videos', require('./routes/videos'));
app.use('/api/settings', require('./routes/settings'));

// ── Serve React build in production (local only; Vercel handles static via CDN) ─
if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
  app.use(express.static(path.join(__dirname, 'client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

// ── Create tables & seed defaults ─────────────────────────────────────────────
const initDB = async () => {
  const bcrypt = require('bcryptjs');

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
    console.log('✅ Default settings seeded.  Admin password: adhi@admin2024');
  }

  console.log('✅ Database tables ready');
};

// ── Start server ───────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

db.connect()
  .then(async (client) => {
    client.release();
    console.log('✅ Postgres connected');
    await initDB();
    app.listen(PORT, () => console.log(`✅ Server on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ Postgres error:', err.message);
    process.exit(1);
  });

