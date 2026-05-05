import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Footer = ({ settings }) => {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-wrap">
        <motion.div
          className="footer-top"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Brand */}
          <div className="footer-brand">
            <span className="footer-logo">TSA</span>
            <p className="footer-tagline">
              {settings?.heroSubtitle || 'Videographer • Photographer • Video Editor'}
            </p>
          </div>

          {/* Nav */}
          <div className="footer-nav">
            <a href="#videographer" className="footer-link">Videographer</a>
            <a href="#photographer" className="footer-link">Photographer</a>
            <a href="#video_editing" className="footer-link">Video Editing</a>
            <a href="#contact" className="footer-link">Contact</a>
          </div>

          {/* Socials */}
          <div className="footer-socials">
            {settings?.instagramUrl && (
              <motion.a
                href={settings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="social-btn"
                whileHover={{ scale: 1.12, y: -3 }}
                title="Instagram"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </motion.a>
            )}
            {settings?.youtubeUrl && (
              <motion.a
                href={settings.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="social-btn"
                whileHover={{ scale: 1.12, y: -3 }}
                title="YouTube"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" />
                </svg>
              </motion.a>
            )}
          </div>
        </motion.div>

        <div className="footer-bottom">
          <p>
            © {year} {settings?.displayName || 'Tadury Srinivas Aditya'}. All rights reserved.
          </p>
          <Link to="/admin" className="footer-admin-link">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
