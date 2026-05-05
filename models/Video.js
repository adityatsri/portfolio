const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    category: {
      type: String,
      enum: ['videographer', 'photographer', 'video_editing'],
      required: true,
    },
    mediaType: { type: String, enum: ['youtube', 'direct'], required: true },
    mediaUrl: { type: String, default: '' },
    youtubeId: { type: String, default: '' },
    thumbnail: { type: String, default: '' },
    cloudinaryPublicId: { type: String, default: '' },
    thumbnailPublicId: { type: String, default: '' },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Video', videoSchema);
