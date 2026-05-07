import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactPlayer from 'react-player';

const CATEGORY_LABELS = {
  youtube_video:  'YouTube Video',
  youtube_short:  'YouTube Short',
  personal_video: 'Personal Video',
  instagram_reel: 'Instagram Reel',
  instagram_post: 'Instagram Post',
  personal_photo: 'Personal Photo',
};

const VideoModal = ({ video, onClose }) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const cat = video.category || video.mediaType;
  const isYoutubeVideo = cat === 'youtube_video';
  const isYoutubeShort = cat === 'youtube_short';
  const isYoutube      = isYoutubeVideo || isYoutubeShort;
  const isDriveVideo   = cat === 'personal_video';
  const isDrivePhoto   = cat === 'personal_photo';
  const isInstagram    = cat === 'instagram_reel' || cat === 'instagram_post';

  const ytUrl = video.youtubeId
    ? (isYoutubeShort
        ? `https://www.youtube.com/shorts/${video.youtubeId}`
        : `https://www.youtube.com/watch?v=${video.youtubeId}`)
    : null;

  return (
    <AnimatePresence>
      <motion.div
        className="modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className={`modal-box${isYoutubeShort ? ' modal-box-portrait' : ''}`}
          initial={{ scale: 0.75, opacity: 0, y: 60 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.75, opacity: 0, y: 40 }}
          transition={{ type: 'spring', damping: 26, stiffness: 280 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>

          {/* ── Media ── */}
          <div className={`modal-media${isYoutubeShort ? ' modal-media-portrait' : ''}`}>

            {isYoutube && ytUrl && (
              <ReactPlayer
                url={ytUrl}
                width="100%"
                height="100%"
                controls
                playing
                config={{ youtube: { playerVars: { modestbranding: 1 } } }}
              />
            )}

            {isDriveVideo && (
              <iframe
                src={video.mediaUrl}
                className="modal-drive-frame"
                allow="autoplay"
                allowFullScreen
                title={video.title}
              />
            )}

            {isDrivePhoto && (
              <img
                src={video.mediaUrl}
                alt={video.title}
                className="modal-full-img"
              />
            )}

            {isInstagram && (
              <div className="modal-ig-block">
                {video.thumbnail && (
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="modal-ig-thumb"
                    onError={(e) => (e.target.style.display = 'none')}
                  />
                )}
                <a
                  href={video.mediaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="modal-ig-btn"
                >
                  <span>Open on Instagram</span>
                  <span style={{ fontSize: '1.2rem' }}>↗</span>
                </a>
              </div>
            )}
          </div>

          {/* ── Info ── */}
          <div className="modal-info">
            <div className="modal-info-top">
              <h2 className="modal-title">{video.title}</h2>
              <div className="modal-tags">
                <span className="modal-tag cat">
                  {CATEGORY_LABELS[cat] || cat}
                </span>
                {video.featured && <span className="modal-tag feat">★ Featured</span>}
              </div>
            </div>
            {video.description && (
              <p className="modal-desc">{video.description}</p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VideoModal;
