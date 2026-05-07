const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// ─── URL helpers ──────────────────────────────────────────────────────────────

const extractYoutubeId = (url) => {
  const match = (url || '').match(
    /(?:youtu\.be\/|v\/|watch\?v=|embed\/|shorts\/|&v=)([^#&?]{11})/
  );
  return match ? match[1] : null;
};

const extractDriveId = (url) => {
  const patterns = [
    /drive\.google\.com\/file\/d\/([^/?#]+)/,
    /drive\.google\.com\/open\?id=([^&]+)/,
    /drive\.google\.com\/uc\?.*id=([^&]+)/,
    /drive\.google\.com\/thumbnail\?.*id=([^&]+)/,
  ];
  for (const p of patterns) {
    const m = (url || '').match(p);
    if (m) return m[1];
  }
  return null;
};

const driveEmbedUrl = (id) => `https://drive.google.com/file/d/${id}/preview`;
const driveThumbUrl = (id) => `https://drive.google.com/thumbnail?id=${id}&sz=w640`;
const driveFullUrl  = (id) => `https://drive.google.com/thumbnail?id=${id}&sz=w1280`;
const driveViewUrl  = (id) => `https://drive.google.com/uc?export=view&id=${id}`;

const normalizeThumbnail = (thumbUrl) => {
  if (!thumbUrl) return '';
  const driveId = extractDriveId(thumbUrl);
  if (driveId) return driveThumbUrl(driveId);
  return thumbUrl;
};

const VALID_CATEGORIES = [
  'youtube_video', 'youtube_short',
  'personal_video', 'personal_photo',
  'instagram_reel', 'instagram_post',
];

// ─── Map DB row → camelCase ───────────────────────────────────────────────────
const toVideo = (r) => ({
  _id:         r.id,
  title:       r.title,
  description: r.description,
  category:    r.category,
  mediaType:   r.media_type,
  mediaUrl:    r.media_url,
  youtubeId:   r.youtube_id,
  thumbnail:   r.thumbnail,
  featured:    r.featured,
  order:       r.display_order,
  createdAt:   r.created_at,
  updatedAt:   r.updated_at,
});

// GET /api/videos
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const { rows } = category
      ? await db.query('SELECT * FROM videos WHERE category=$1 ORDER BY display_order ASC, created_at DESC', [category])
      : await db.query('SELECT * FROM videos ORDER BY display_order ASC, created_at DESC');
    res.json(rows.map(toVideo));
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/videos/:id
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM videos WHERE id=$1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Not found' });
    res.json(toVideo(rows[0]));
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/videos
router.post('/', auth, async (req, res) => {
  try {
    const {
      title, description, category,
      youtubeUrl, driveUrl, instagramUrl,
      thumbnail, featured, order,
    } = req.body;

    if (!VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    let finalYoutubeId = '';
    let finalMediaUrl  = '';
    let finalThumbnail = normalizeThumbnail(thumbnail);

    if (category === 'youtube_video' || category === 'youtube_short') {
      finalYoutubeId = extractYoutubeId(youtubeUrl);
      if (!finalYoutubeId) return res.status(400).json({ message: 'Invalid YouTube URL' });
      if (!finalThumbnail) finalThumbnail = `https://img.youtube.com/vi/${finalYoutubeId}/maxresdefault.jpg`;

    } else if (category === 'personal_video') {
      const driveId = extractDriveId(driveUrl);
      if (!driveId) return res.status(400).json({ message: 'Invalid Google Drive link. Share the file and paste the sharing URL.' });
      finalMediaUrl  = driveEmbedUrl(driveId);
      if (!finalThumbnail) finalThumbnail = driveThumbUrl(driveId);

    } else if (category === 'personal_photo') {
      const driveId = extractDriveId(driveUrl);
      if (!driveId) return res.status(400).json({ message: 'Invalid Google Drive link. Share the file and paste the sharing URL.' });
      finalMediaUrl = driveFullUrl(driveId);
      if (!finalThumbnail) finalThumbnail = driveThumbUrl(driveId);

    } else if (category === 'instagram_reel' || category === 'instagram_post') {
      if (!instagramUrl || !instagramUrl.includes('instagram.com')) {
        return res.status(400).json({ message: 'Invalid Instagram URL' });
      }
      finalMediaUrl = instagramUrl;
    }

    const { rows } = await db.query(
      `INSERT INTO videos (title,description,category,media_type,media_url,youtube_id,thumbnail,featured,display_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [
        title, description || '', category, category,
        finalMediaUrl, finalYoutubeId, finalThumbnail,
        featured === 'true' || featured === true,
        parseInt(order) || 0,
      ]
    );
    res.status(201).json(toVideo(rows[0]));
  } catch (err) {
    console.error('Create error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

// PUT /api/videos/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const { rows: existing } = await db.query('SELECT * FROM videos WHERE id=$1', [req.params.id]);
    if (!existing.length) return res.status(404).json({ message: 'Not found' });
    const v = existing[0];

    const {
      title, description, category,
      featured, order,
      youtubeUrl, driveUrl, instagramUrl,
      thumbnail,
    } = req.body;

    const newCategory = category || v.category;
    let newYoutubeId  = v.youtube_id;
    let newMediaUrl   = v.media_url;
    let newThumbnail  = thumbnail !== undefined ? normalizeThumbnail(thumbnail) : v.thumbnail;

    if (newCategory === 'youtube_video' || newCategory === 'youtube_short') {
      if (youtubeUrl) {
        const ytId = extractYoutubeId(youtubeUrl);
        if (ytId) {
          newYoutubeId = ytId;
          if (thumbnail === undefined || thumbnail === '') {
            newThumbnail = `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`;
          }
        }
      }
      newMediaUrl = '';

    } else if (newCategory === 'personal_video') {
      if (driveUrl) {
        const driveId = extractDriveId(driveUrl);
        if (driveId) {
          newMediaUrl = driveEmbedUrl(driveId);
          if (thumbnail === undefined || thumbnail === '') newThumbnail = driveThumbUrl(driveId);
        }
      }
      newYoutubeId = '';

    } else if (newCategory === 'personal_photo') {
      if (driveUrl) {
        const driveId = extractDriveId(driveUrl);
        if (driveId) {
          newMediaUrl = driveFullUrl(driveId);
          if (thumbnail === undefined || thumbnail === '') newThumbnail = driveThumbUrl(driveId);
        }
      }
      newYoutubeId = '';

    } else if (newCategory === 'instagram_reel' || newCategory === 'instagram_post') {
      if (instagramUrl) newMediaUrl = instagramUrl;
      newYoutubeId = '';
      if (newCategory === 'instagram_post' && thumbnail === undefined) newThumbnail = '';
    }

    const { rows } = await db.query(
      `UPDATE videos SET
        title         = COALESCE($1, title),
        description   = COALESCE($2, description),
        category      = $3,
        media_type    = $3,
        media_url     = $4,
        youtube_id    = $5,
        thumbnail     = $6,
        featured      = COALESCE($7, featured),
        display_order = COALESCE($8, display_order),
        updated_at    = NOW()
       WHERE id=$9 RETURNING *`,
      [
        title || null, description || null, newCategory,
        newMediaUrl, newYoutubeId, newThumbnail,
        featured !== undefined ? (featured === 'true' || featured === true) : null,
        order !== undefined ? parseInt(order) || 0 : null,
        req.params.id,
      ]
    );
    res.json(toVideo(rows[0]));
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/videos/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const { rowCount } = await db.query('DELETE FROM videos WHERE id=$1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
