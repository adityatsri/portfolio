const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const Video = require('../models/Video');
const auth = require('../middleware/auth');

// ── Configure Cloudinary ──────────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── Multer – in-memory storage ────────────────────────────────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB
});

// ── Helpers ───────────────────────────────────────────────────────────────────
const uploadToCloudinary = (buffer, options) =>
  new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(options, (error, result) => (error ? reject(error) : resolve(result)))
      .end(buffer);
  });

const extractYoutubeId = (url) => {
  const match = url.match(/(?:youtu\.be\/|v\/|watch\?v=|embed\/|&v=)([^#&?]{11})/);
  return match ? match[1] : null;
};

// ── GET /api/videos ───────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const query = req.query.category ? { category: req.query.category } : {};
    const videos = await Video.find(query).sort({ order: 1, createdAt: -1 });
    res.json(videos);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── GET /api/videos/:id ───────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Not found' });
    res.json(video);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── POST /api/videos ──────────────────────────────────────────────────────────
router.post(
  '/',
  auth,
  upload.fields([
    { name: 'media', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { title, description, category, mediaType, youtubeUrl, featured, order } = req.body;

      let mediaUrl = '',
        youtubeId = '',
        thumbnail = '',
        cloudinaryPublicId = '',
        thumbnailPublicId = '';

      if (mediaType === 'youtube') {
        youtubeId = extractYoutubeId(youtubeUrl || '');
        if (!youtubeId) return res.status(400).json({ message: 'Invalid YouTube URL' });
        thumbnail = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
      } else {
        if (!req.files?.media) return res.status(400).json({ message: 'Media file required' });
        const file = req.files.media[0];
        const resourceType = file.mimetype.startsWith('image/') ? 'image' : 'video';
        const result = await uploadToCloudinary(file.buffer, {
          folder: 'adhi_portfolio/media',
          resource_type: resourceType,
        });
        mediaUrl = result.secure_url;
        cloudinaryPublicId = result.public_id;
      }

      if (req.files?.thumbnail) {
        const result = await uploadToCloudinary(req.files.thumbnail[0].buffer, {
          folder: 'adhi_portfolio/thumbnails',
          resource_type: 'image',
        });
        thumbnail = result.secure_url;
        thumbnailPublicId = result.public_id;
      }

      const video = await Video.create({
        title,
        description,
        category,
        mediaType,
        mediaUrl,
        youtubeId,
        thumbnail,
        cloudinaryPublicId,
        thumbnailPublicId,
        featured: featured === 'true' || featured === true,
        order: parseInt(order) || 0,
      });

      res.status(201).json(video);
    } catch (err) {
      console.error('Create error:', err);
      res.status(500).json({ message: err.message || 'Server error' });
    }
  }
);

// ── PUT /api/videos/:id ───────────────────────────────────────────────────────
router.put(
  '/:id',
  auth,
  upload.fields([
    { name: 'media', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const video = await Video.findById(req.params.id);
      if (!video) return res.status(404).json({ message: 'Not found' });

      const { title, description, category, featured, order, youtubeUrl, mediaType } = req.body;

      if (title !== undefined) video.title = title;
      if (description !== undefined) video.description = description;
      if (category) video.category = category;
      if (featured !== undefined) video.featured = featured === 'true' || featured === true;
      if (order !== undefined) video.order = parseInt(order) || 0;

      if (mediaType === 'youtube' && youtubeUrl) {
        const ytId = extractYoutubeId(youtubeUrl);
        if (ytId) {
          video.youtubeId = ytId;
          video.mediaType = 'youtube';
          if (!req.files?.thumbnail) {
            video.thumbnail = `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`;
          }
        }
      }

      if (req.files?.media) {
        if (video.cloudinaryPublicId) {
          const prevType = video.mediaUrl.match(/\.(mp4|webm|ogg|mov)$/i) ? 'video' : 'image';
          await cloudinary.uploader.destroy(video.cloudinaryPublicId, { resource_type: prevType }).catch(() => {});
        }
        const file = req.files.media[0];
        const resourceType = file.mimetype.startsWith('image/') ? 'image' : 'video';
        const result = await uploadToCloudinary(file.buffer, {
          folder: 'adhi_portfolio/media',
          resource_type: resourceType,
        });
        video.mediaUrl = result.secure_url;
        video.cloudinaryPublicId = result.public_id;
        video.mediaType = 'direct';
      }

      if (req.files?.thumbnail) {
        if (video.thumbnailPublicId) {
          await cloudinary.uploader.destroy(video.thumbnailPublicId).catch(() => {});
        }
        const result = await uploadToCloudinary(req.files.thumbnail[0].buffer, {
          folder: 'adhi_portfolio/thumbnails',
          resource_type: 'image',
        });
        video.thumbnail = result.secure_url;
        video.thumbnailPublicId = result.public_id;
      }

      await video.save();
      res.json(video);
    } catch (err) {
      console.error('Update error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// ── DELETE /api/videos/:id ────────────────────────────────────────────────────
router.delete('/:id', auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Not found' });

    if (video.cloudinaryPublicId) {
      const rt = video.mediaUrl.match(/\.(mp4|webm|ogg|mov)$/i) ? 'video' : 'image';
      await cloudinary.uploader.destroy(video.cloudinaryPublicId, { resource_type: rt }).catch(() => {});
    }
    if (video.thumbnailPublicId) {
      await cloudinary.uploader.destroy(video.thumbnailPublicId).catch(() => {});
    }

    await Video.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
