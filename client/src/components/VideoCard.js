import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PLACEHOLDER = (title) =>
  `https://placehold.co/320x180/1a1a1a/E50914?text=${encodeURIComponent(
    title?.charAt(0) || '?'
  )}`;

const CATEGORY_COLORS = {
  youtube_video:  '#E50914',
  youtube_short:  '#ff6b35',
  personal_video: '#00aaff',
  instagram_reel: '#e1306c',
  instagram_post: '#a855f7',
  personal_photo: '#10b981',
  // legacy
  videographer:   '#E50914',
  photographer:   '#00aaff',
  video_editing:  '#a855f7',
};

const CATEGORY_LABELS = {
  youtube_video:  'YouTube Video',
  youtube_short:  'YouTube Short',
  personal_video: 'Personal Video',
  instagram_reel: 'Instagram Reel',
  instagram_post: 'Instagram Post',
  personal_photo: 'Personal Photo',
  // legacy
  videographer:   'Videographer',
  photographer:   'Photographer',
  video_editing:  'Video Editing',
};

const CATEGORY_BADGES = {
  youtube_video:  'YT',
  youtube_short:  'SHORT',
  personal_video: 'DRIVE',
  instagram_reel: 'REEL',
  instagram_post: 'POST',
  personal_photo: 'PHOTO',
  // legacy
  videographer:   'VID',
  photographer:   'PHOTO',
  video_editing:  'EDIT',
};

const VideoCard = ({ video, index, onSelect }) => {
  const [hovered, setHovered] = useState(false);

  const cat = video.category || video.mediaType;
  const accentColor = CATEGORY_COLORS[cat] || '#E50914';

  const thumb =
    video.thumbnail ||
    (video.youtubeId ? `https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg` : null) ||
    (cat === 'personal_photo' && video.mediaUrl ? video.mediaUrl : null) ||
    PLACEHOLDER(video.title);

  return (
    <motion.article
      className="vcard"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.4, ease: 'easeOut' }}
      whileHover={{ scale: 1.28, zIndex: 50 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect()}
    >
      <div className="vcard-img-wrap">
        <img
          src={thumb}
          alt={video.title}
          className="vcard-img"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = PLACEHOLDER(video.title);
          }}
        />
        <span
          className="vcard-badge type-badge"
          style={{ background: accentColor }}
        >
          {CATEGORY_BADGES[cat] || 'MEDIA'}
        </span>
        {video.featured && <span className="vcard-badge star">★</span>}
        <div
          className="vcard-accent"
          style={{ background: `linear-gradient(90deg, ${accentColor}, transparent)` }}
        />
      </div>

      <AnimatePresence>
        {hovered && (
          <motion.div
            className="vcard-overlay"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <div className="vcard-overlay-top">
              <motion.button
                className="vcard-play"
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </motion.button>
              <motion.button className="vcard-more" whileHover={{ scale: 1.12 }}>+</motion.button>
            </div>
            <div className="vcard-overlay-info">
              <h4 className="vcard-title">{video.title}</h4>
              {video.description && (
                <p className="vcard-desc">
                  {video.description.length > 70
                    ? video.description.substring(0, 70) + '…'
                    : video.description}
                </p>
              )}
              <span className="vcard-cat" style={{ color: accentColor }}>
                {CATEGORY_LABELS[cat] || cat}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
};

export default VideoCard;

const VideoCard = ({ video, index, onSelect }) => {
  const [hovered, setHovered] = useState(false);

  const thumb =
    video.thumbnail ||
    (video.youtubeId
      ? `https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`
      : PLACEHOLDER(video.title));

  const accentColor = CATEGORY_COLORS[video.category] || '#E50914';

  return (
    <motion.article
      className="vcard"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.4, ease: 'easeOut' }}
      whileHover={{ scale: 1.28, zIndex: 50 }}
      transition2={{ duration: 0.25, ease: 'easeOut' }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect()}
    >
      <div className="vcard-img-wrap">
        <img
          src={thumb}
          alt={video.title}
          className="vcard-img"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = PLACEHOLDER(video.title);
          }}
        />
        {/* Badges */}
        {video.mediaType === 'youtube' && <span className="vcard-badge yt">YT</span>}
        {video.featured && <span className="vcard-badge star">★</span>}
        {/* Category accent bar */}
        <div
          className="vcard-accent"
          style={{ background: `linear-gradient(90deg, ${accentColor}, transparent)` }}
        />
      </div>

      {/* Hover overlay */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            className="vcard-overlay"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <div className="vcard-overlay-top">
              <motion.button
                className="vcard-play"
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </motion.button>
              <motion.button className="vcard-more" whileHover={{ scale: 1.12 }}>
                +
              </motion.button>
            </div>
            <div className="vcard-overlay-info">
              <h4 className="vcard-title">{video.title}</h4>
              {video.description && (
                <p className="vcard-desc">
                  {video.description.length > 70
                    ? video.description.substring(0, 70) + '…'
                    : video.description}
                </p>
              )}
              <span className="vcard-cat" style={{ color: accentColor }}>
                {CATEGORY_LABELS[video.category]}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
};

export default VideoCard;
