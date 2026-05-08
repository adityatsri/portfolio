import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import VideoCard from './VideoCard';

const CATEGORY_ICONS = {
  youtube_video:  '▶',
  youtube_short:  '📱',
  personal_video: '🎥',
  instagram_reel: '🎦',
  instagram_post: '📷',
  personal_photo: '🖼️',
  // legacy
  videographer:   '🎬',
  photographer:   '📸',
  video_editing:  '✂️',
};

const VideoRow = ({ title, category, videos, onVideoSelect }) => {
  const rowRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = rowRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 5);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [videos]);

  const scroll = (dir) => {
    const el = rowRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'left' ? -700 : 700, behavior: 'smooth' });
    setTimeout(checkScroll, 450);
  };

  if (!videos || videos.length === 0) return null;

  const icon = CATEGORY_ICONS[category] || '🎞️';

  return (
    <motion.section
      className="video-row"
      id={category}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="row-header">
        <div className="row-title-wrap">
          <span className="row-icon">{icon}</span>
          <h2 className="row-title">{title}</h2>
          <span className="row-count">{videos.length} items</span>
        </div>
        <Link className="row-see-all" to={`/category/${category}`}>
          See All →
        </Link>
      </div>

      <div className="row-track-wrap">
        {/* Left arrow */}
        {canScrollLeft && (
          <motion.button
            className="row-arrow row-arrow-left"
            onClick={() => scroll('left')}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Scroll left"
          >
            ‹
          </motion.button>
        )}

        {/* Card track */}
        <div className="row-track" ref={rowRef} onScroll={checkScroll}>
          {videos.map((video, i) => (
            <VideoCard
              key={video._id}
              video={video}
              index={i}
              onSelect={() => onVideoSelect(video)}
            />
          ))}
        </div>

        {/* Right arrow */}
        {canScrollRight && (
          <motion.button
            className="row-arrow row-arrow-right"
            onClick={() => scroll('right')}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Scroll right"
          >
            ›
          </motion.button>
        )}
      </div>
    </motion.section>
  );
};

export default VideoRow;
