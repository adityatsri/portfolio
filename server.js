const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ── API Routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/videos', require('./routes/videos'));
app.use('/api/settings', require('./routes/settings'));

// ── Serve React build in production ───────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

// ── Seed default settings ─────────────────────────────────────────────────────
const initializeSettings = async () => {
  try {
    const Settings = require('./models/Settings');
    const bcrypt = require('bcryptjs');
    const existing = await Settings.findOne();
    if (!existing) {
      const hashedPassword = await bcrypt.hash('adhi@admin2024', 10);
      await Settings.create({
        adminPassword: hashedPassword,
        contactEmail: 'adityatadury@gmail.com',
        contactPhone: '+91 9999999999',
        instagramUrl: 'https://instagram.com/adityatadury',
        youtubeUrl: 'https://youtube.com/@adityatadury',
        heroTitle: 'TADURY SRINIVAS ADITYA',
        heroSubtitle: 'Videographer • Photographer • Video Editor',
        displayName: 'Tadury Srinivas Aditya',
      });
      console.log('✅ Default settings created.  Default admin password: adhi@admin2024');
    }
  } catch (err) {
    console.error('Settings init error:', err.message);
  }
};

// ── Start server ───────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ MongoDB connected');
    await initializeSettings();
    app.listen(PORT, () => console.log(`✅ Server on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB error:', err.message);
    process.exit(1);
  });
