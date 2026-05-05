import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactPlayer from 'react-player';

const isImageUrl = (url) => /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(url || '');

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

  const getPlayerUrl = () => {
    if (video.mediaType === 'youtube')
      return `https://www.youtube.com/watch?v=${video.youtubeId}`;
    return video.mediaUrl;
  };

  const showImage =
    video.mediaType === 'direct' && isImageUrl(video.mediaUrl);

  const CATEGORY_LABELS = {
    videographer: 'Videographer',
    photographer: 'Photographer',
    video_editing: 'Video Editing',
  };

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
          className="modal-box"
          initial={{ scale: 0.75, opacity: 0, y: 60 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.75, opacity: 0, y: 40 }}
          transition={{ type: 'spring', damping: 26, stiffness: 280 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>

          {/* Media area */}
          <div className="modal-media">
            {showImage ? (
              <img
                src={video.mediaUrl}
                alt={video.title}
                className="modal-full-img"
              />
            ) : (
              <ReactPlayer
                url={getPlayerUrl()}
                width="100%"
                height="100%"
                controls
                playing
                config={{
                  youtube: { playerVars: { modestbranding: 1 } },
                }}
              />
            )}
          </div>

          {/* Info */}
          <div className="modal-info">
            <div className="modal-info-top">
              <h2 className="modal-title">{video.title}</h2>
              <div className="modal-tags">
                <span className="modal-tag cat">
                  {CATEGORY_LABELS[video.category] || video.category}
                </span>
                <span className="modal-tag type">
                  {video.mediaType === 'youtube' ? '▶ YouTube' : '📁 Direct'}
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
