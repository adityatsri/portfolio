import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const ALL_NAV_LINKS = [
  { label: 'YouTube Videos',  href: '#youtube_video',  cat: 'youtube_video'  },
  { label: 'YouTube Shorts',  href: '#youtube_short',  cat: 'youtube_short'  },
  { label: 'Personal Videos', href: '#personal_video', cat: 'personal_video' },
  { label: 'Instagram Reels', href: '#instagram_reel', cat: 'instagram_reel' },
  { label: 'Instagram Posts', href: '#instagram_post', cat: 'instagram_post' },
  { label: 'Personal Photos', href: '#personal_photo', cat: 'personal_photo' },
  // legacy
  { label: 'Videographer',  href: '#videographer',  cat: 'videographer'  },
  { label: 'Photographer',  href: '#photographer',   cat: 'photographer'  },
  { label: 'Video Editing', href: '#video_editing',  cat: 'video_editing' },
];

const Navbar = ({ settings, videos = [] }) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Only show nav links for categories that have at least 1 video
  const cats = new Set(videos.map((v) => v.category));
  const navLinks = [
    ...ALL_NAV_LINKS.filter((l) => cats.has(l.cat)),
    { label: 'Contact', href: '#contact', cat: null },
  ];

  return (
    <motion.nav
      className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <span className="logo-badge">TSA</span>
          <span className="logo-name">{settings?.displayName || 'Tadury Srinivas Aditya'}</span>
        </Link>

        {/* Desktop Links */}
        <ul className="navbar-links">
          {navLinks.map((link) => (
            <li key={link.label}>
              <a href={link.href} className="nav-link">
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Hamburger only on mobile */}
        <div className="navbar-right">
          <button
            className="hamburger"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Menu"
          >
            <span className={`ham-line ${menuOpen ? 'open' : ''}`} />
            <span className={`ham-line ${menuOpen ? 'open' : ''}`} />
            <span className={`ham-line ${menuOpen ? 'open' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="mobile-link"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;

  return (
