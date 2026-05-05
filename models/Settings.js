const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    adminPassword: { type: String, required: true },
    contactEmail: { type: String, default: 'contact@example.com' },
    contactPhone: { type: String, default: '+91 9999999999' },
    instagramUrl: { type: String, default: 'https://instagram.com/' },
    youtubeUrl: { type: String, default: 'https://youtube.com/' },
    heroTitle: { type: String, default: 'TADURY SRINIVAS ADITYA' },
    heroSubtitle: {
      type: String,
      default: 'Videographer • Photographer • Video Editor',
    },
    displayName: { type: String, default: 'Tadury Srinivas Aditya' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);
