const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

const extractYoutubeId = (url) => {
  const match = (url || '').match(/(?:youtu\.be\/|v\/|watch\?v=|embed\/|&v=)([^#&?]{11})/);
  return match ? match[1] : null;
};

// Map DB row → camelCase for frontend
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
    const { title, description, category, mediaType, youtubeUrl, mediaUrl, thumbnail, featured, order } = req.body;

    let finalYoutubeId = '';
    let finalMediaUrl = mediaUrl || '';
    let finalThumbnail = thumbnail || '';

    if (mediaType === 'youtube') {
      finalYoutubeId = extractYoutubeId(youtubeUrl);
      if (!finalYoutubeId) return res.status(400).json({ message: 'Invalid YouTube URL' });
      if (!finalThumbnail) finalThumbnail = `https://img.youtube.com/vi/${finalYoutubeId}/maxresdefault.jpg`;
    } else {
      if (!finalMediaUrl) return res.status(400).json({ message: 'Media URL is required' });
    }

    const { rows } = await db.query(
      `INSERT INTO videos (title,description,category,media_type,media_url,youtube_id,thumbnail,featured,display_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [title, description||'', category, mediaType, finalMediaUrl, finalYoutubeId, finalThumbnail,
       featured === 'true' || featured === true, parseInt(order)||0]
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

    const { title, description, category, featured, order, youtubeUrl, mediaType, mediaUrl, thumbnail } = req.body;

    let newYoutubeId = v.youtube_id;
    let newMediaUrl  = mediaUrl  !== undefined ? mediaUrl  : v.media_url;
    let newThumbnail = thumbnail !== undefined && thumbnail ? thumbnail : v.thumbnail;
    let newMediaType = mediaType || v.media_type;

    if (mediaType === 'youtube' && youtubeUrl) {
      const ytId = extractYoutubeId(youtubeUrl);
      if (ytId) {
        newYoutubeId = ytId;
        newMediaType = 'youtube';
        if (!thumbnail) newThumbnail = `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`;
      }
    }

    const { rows } = await db.query(
      `UPDATE videos SET
        title         = COALESCE($1, title),
        description   = COALESCE($2, description),
        category      = COALESCE($3, category),
        media_type    = $4,
        media_url     = $5,
        youtube_id    = $6,
        thumbnail     = $7,
        featured      = COALESCE($8, featured),
        display_order = COALESCE($9, display_order),
        updated_at    = NOW()
       WHERE id=$10 RETURNING *`,
      [title||null, description||null, category||null, newMediaType, newMediaUrl, newYoutubeId, newThumbnail,
       featured !== undefined ? (featured === 'true' || featured === true) : null,
       order !== undefined ? parseInt(order)||0 : null,
       req.params.id]
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




// GET /api/videos
router.get('/', async (req, res) => {
  try {
    const query = req.query.category ? { category: req.query.category } : {};
    const videos = await Video.find(query).sort({ order: 1, createdAt: -1 });
    res.json(videos);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/videos/:id
router.get('/:id', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Not found' });
    res.json(video);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/videos
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, category, mediaType, youtubeUrl, mediaUrl, thumbnail, featured, order } = req.body;

    let finalYoutubeId = '';
    let finalMediaUrl = mediaUrl || '';
    let finalThumbnail = thumbnail || '';

    if (mediaType === 'youtube') {
      finalYoutubeId = extractYoutubeId(youtubeUrl || '');
      if (!finalYoutubeId) return res.status(400).json({ message: 'Invalid YouTube URL' });
      if (!finalThumbnail) {
        finalThumbnail = `https://img.youtube.com/vi/${finalYoutubeId}/maxresdefault.jpg`;
      }
    } else {
      if (!finalMediaUrl) return res.status(400).json({ message: 'Media URL is required' });
    }

    const video = await Video.create({
      title, description, category, mediaType,
      mediaUrl: finalMediaUrl,
      youtubeId: finalYoutubeId,
      thumbnail: finalThumbnail,
      featured: featured === 'true' || featured === true,
      order: parseInt(order) || 0,
    });

    res.status(201).json(video);
  } catch (err) {
    console.error('Create error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

// PUT /api/videos/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Not found' });

    const { title, description, category, featured, order, youtubeUrl, mediaType, mediaUrl, thumbnail } = req.body;

    if (title !== undefined)       video.title = title;
    if (description !== undefined) video.description = description;
    if (category)                  video.category = category;
    if (featured !== undefined)    video.featured = featured === 'true' || featured === true;
    if (order !== undefined)       video.order = parseInt(order) || 0;
    if (thumbnail)                 video.thumbnail = thumbnail;
    if (mediaUrl)                  video.mediaUrl = mediaUrl;

    if (mediaType === 'youtube' && youtubeUrl) {
      const ytId = extractYoutubeId(youtubeUrl);
      if (ytId) {
        video.youtubeId = ytId;
        video.mediaType = 'youtube';
        if (!thumbnail) video.thumbnail = `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`;
      }
    } else if (mediaType === 'direct') {
      video.mediaType = 'direct';
    }

    await video.save();
    res.json(video);
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/videos/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Not found' });
    await Video.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
