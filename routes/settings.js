const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Settings = require('../models/Settings');
const auth = require('../middleware/auth');

// GET /api/settings  (public – password excluded)
router.get('/', async (_req, res) => {
  try {
    const settings = await Settings.findOne().select('-adminPassword');
    res.json(settings);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/settings  (admin only)
router.put('/', auth, async (req, res) => {
  try {
    const {
      contactEmail,
      contactPhone,
      instagramUrl,
      youtubeUrl,
      heroTitle,
      heroSubtitle,
      displayName,
      currentPassword,
      newPassword,
    } = req.body;

    const settings = await Settings.findOne();
    if (!settings) return res.status(404).json({ message: 'Settings not found' });

    if (contactEmail !== undefined) settings.contactEmail = contactEmail;
    if (contactPhone !== undefined) settings.contactPhone = contactPhone;
    if (instagramUrl !== undefined) settings.instagramUrl = instagramUrl;
    if (youtubeUrl !== undefined) settings.youtubeUrl = youtubeUrl;
    if (heroTitle !== undefined) settings.heroTitle = heroTitle;
    if (heroSubtitle !== undefined) settings.heroSubtitle = heroSubtitle;
    if (displayName !== undefined) settings.displayName = displayName;

    if (newPassword) {
      if (!currentPassword)
        return res.status(400).json({ message: 'Current password required to change password' });
      const isMatch = await bcrypt.compare(currentPassword, settings.adminPassword);
      if (!isMatch) return res.status(401).json({ message: 'Current password is incorrect' });
      settings.adminPassword = await bcrypt.hash(newPassword, 10);
    }

    await settings.save();
    const { adminPassword: _pw, ...safe } = settings.toObject();
    res.json(safe);
  } catch (err) {
    console.error('Settings update error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
