const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db');
const auth = require('../middleware/auth');

const ROW_TO_OBJ = (r) => ({
  contactEmail:  r.contact_email,
  contactPhone:  r.contact_phone,
  instagramUrl:  r.instagram_url,
  youtubeUrl:    r.youtube_url,
  heroTitle:     r.hero_title,
  heroSubtitle:  r.hero_subtitle,
  displayName:   r.display_name,
  profilePicUrl: r.profile_pic_url || '',
});

// GET /api/settings  (public)
router.get('/', async (_req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT contact_email,contact_phone,instagram_url,youtube_url,hero_title,hero_subtitle,display_name,profile_pic_url FROM settings LIMIT 1'
    );
    if (!rows.length) return res.status(404).json({ message: 'Not found' });
    res.json(ROW_TO_OBJ(rows[0]));
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/settings  (admin only)
router.put('/', auth, async (req, res) => {
  try {
    const {
      contactEmail, contactPhone, instagramUrl, youtubeUrl,
      heroTitle, heroSubtitle, displayName, profilePicUrl,
      currentPassword, newPassword,
    } = req.body;

    const { rows } = await db.query('SELECT id, admin_password FROM settings LIMIT 1');
    if (!rows.length) return res.status(404).json({ message: 'Settings not found' });

    let newHash = rows[0].admin_password;
    if (newPassword) {
      if (!currentPassword)
        return res.status(400).json({ message: 'Current password required' });
      const ok = await bcrypt.compare(currentPassword, rows[0].admin_password);
      if (!ok) return res.status(401).json({ message: 'Current password is incorrect' });
      newHash = await bcrypt.hash(newPassword, 10);
    }

    const { rows: updated } = await db.query(
      `UPDATE settings SET
        contact_email   = COALESCE($1, contact_email),
        contact_phone   = COALESCE($2, contact_phone),
        instagram_url   = COALESCE($3, instagram_url),
        youtube_url     = COALESCE($4, youtube_url),
        hero_title      = COALESCE($5, hero_title),
        hero_subtitle   = COALESCE($6, hero_subtitle),
        display_name    = COALESCE($7, display_name),
        admin_password  = $8,
        profile_pic_url = COALESCE($9, profile_pic_url),
        updated_at      = NOW()
       WHERE id = $10
       RETURNING contact_email,contact_phone,instagram_url,youtube_url,hero_title,hero_subtitle,display_name,profile_pic_url`,
      [contactEmail||null, contactPhone||null, instagramUrl||null, youtubeUrl||null,
       heroTitle||null, heroSubtitle||null, displayName||null, newHash,
       profilePicUrl !== undefined ? profilePicUrl : null, rows[0].id]
    );
    res.json(ROW_TO_OBJ(updated[0]));
  } catch (err) {
    console.error('Settings error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

