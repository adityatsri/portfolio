import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const getThumbnail = (video) => {
  if (video?.thumbnail) return video.thumbnail;
  if (video?.youtubeId)
    return `https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`;
  return null;
};

const Hero = ({ videos, settings, onVideoSelect }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const featured = videos?.filter((v) => v.featured);
  const heroItems = featured?.length > 0 ? featured : videos?.slice(0, 6) || [];

  const next = useCallback(() => {
    setCurrentIndex((i) => (i + 1) % (heroItems.length || 1));
  }, [heroItems.length]);

  useEffect(() => {
    if (heroItems.length <= 1) return;
    const timer = setInterval(next, 7000);
    return () => clearInterval(timer);
  }, [next, heroItems.length]);

  useEffect(() => {
    setLoaded(true);
  }, []);

  const current = heroItems[currentIndex];
  const thumb = current ? getThumbnail(current) : null;

  const words = (settings?.heroTitle || 'TADURY SRINIVAS ADITYA').split(' ');

  return (
    <section className="hero">
      {/* Background slideshow */}
      <AnimatePresence mode="wait">
        {thumb && (
          <motion.div
            key={`bg-${currentIndex}`}
            className="hero-bg"
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: 'easeInOut' }}
          >
            <img src={thumb} alt="" className="hero-bg-img" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gradient overlays */}
      <div className="hero-overlay-left" />
      <div className="hero-overlay-bottom" />
      <div className="hero-overlay-full" />

      {/* Floating particles */}
      <div className="hero-particles" aria-hidden="true">
        {Array.from({ length: 25 }).map((_, i) => (
          <span key={i} className={`hparticle hp-${i}`} />
        ))}
      </div>

      {/* Content */}
      <div className="hero-content">
        {loaded && (
          <>
            <motion.div
              className="hero-eyebrow"
              initial={{ x: -60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.7, type: 'spring', stiffness: 80 }}
            >
              ◆ CREATIVE PORTFOLIO
            </motion.div>

            <h1 className="hero-title">
              {words.map((word, i) => (
                <motion.span
                  key={i}
                  className="hero-word"
                  initial={{ y: 60, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    delay: 0.6 + i * 0.12,
                    duration: 0.7,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                >
                  {word}
                </motion.span>
              ))}
            </h1>

            <motion.p
              className="hero-subtitle"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.6 }}
            >
              {settings?.heroSubtitle || 'Videographer • Photographer • Video Editor'}
            </motion.p>

            {current && (
              <motion.div
                className="hero-now-playing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                key={currentIndex}
              >
                <span className="np-dot" />
                <span className="np-label">Now Featuring:</span>
                <span className="np-title">{current.title}</span>
              </motion.div>
            )}

            <motion.div
              className="hero-actions"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.6, duration: 0.5 }}
            >
              {current && (
                <motion.button
                  className="btn-play"
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => onVideoSelect(current)}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  <span>Watch Now</span>
                </motion.button>
              )}
              <motion.a
                href="#contact"
                className="btn-outline"
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.96 }}
              >
                <span>Contact Me</span>
              </motion.a>
            </motion.div>
          </>
        )}
      </div>

      {/* Slide dots */}
      {heroItems.length > 1 && (
        <div className="hero-dots">
          {heroItems.map((_, i) => (
            <button
              key={i}
              className={`hero-dot ${i === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(i)}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Scroll cue */}
      <motion.div
        className="scroll-cue"
        animate={{ y: [0, 12, 0] }}
        transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
        aria-hidden="true"
      >
        <div className="scroll-cue-line" />
      </motion.div>
    </section>
  );
};

export default Hero;
