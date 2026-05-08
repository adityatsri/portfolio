import React from 'react';
import { motion } from 'framer-motion';

// Convert old broken Drive thumbnail URLs to public lh3 CDN format
const fixProfilePicUrl = (url) => {
  if (!url) return url;
  const m = url.match(/drive\.google\.com\/thumbnail\?id=([^&]+)/);
  return m ? `https://lh3.googleusercontent.com/d/${m[1]}` : url;
};

const Contact = ({ settings }) => {
  const cards = [
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="28" height="28">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      ),
      label: 'Email',
      value: settings?.contactEmail || 'adityatadury@gmail.com',
      href: `mailto:${settings?.contactEmail || 'adityatadury@gmail.com'}`,
      color: '#E50914',
      external: false,
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="28" height="28">
          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.01 1.18 2 2 0 012 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14v2.92z" />
        </svg>
      ),
      label: 'Phone',
      value: settings?.contactPhone || '+91 9999999999',
      href: `tel:${(settings?.contactPhone || '').replace(/\s/g, '')}`,
      color: '#00aaff',
      external: false,
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
      label: 'Instagram',
      value: '@adityatadury',
      href: settings?.instagramUrl || 'https://instagram.com/',
      color: '#e1306c',
      external: true,
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
          <path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" />
        </svg>
      ),
      label: 'YouTube',
      value: 'Subscribe',
      href: settings?.youtubeUrl || 'https://youtube.com/',
      color: '#FF0000',
      external: true,
    },
  ];

  return (
    <section className="contact-section" id="contact">
      <div className="contact-glow-bg" aria-hidden="true" />

      <div className="contact-wrap">
        <motion.div
          className="contact-header"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65 }}
        >
          {settings?.profilePicUrl && (
            <motion.div
              className="contact-profile-wrap"
              initial={{ opacity: 0, scale: 0.7 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
            >
              <img
                src={fixProfilePicUrl(settings.profilePicUrl)}
                alt={settings?.displayName || 'Tadury Srinivas Aditya'}
                className="contact-profile-pic"
                onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.style.display = 'none'; }}
              />
            </motion.div>
          )}
          <span className="section-eyebrow">GET IN TOUCH</span>
          <h2 className="section-heading">Let's Create Together</h2>
          <p className="section-sub">
            Ready to bring your vision to life? Reach out and let's make something extraordinary.
          </p>
        </motion.div>

        <div className="contact-grid">
          {cards.map((card, i) => (
            <motion.a
              key={card.label}
              href={card.href}
              className="contact-card"
              target={card.external ? '_blank' : '_self'}
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.55 }}
              whileHover={{ y: -12, scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{ '--accent': card.color }}
            >
              <div className="cc-icon-wrap" style={{ color: card.color }}>
                {card.icon}
              </div>
              <span className="cc-label">{card.label}</span>
              <span className="cc-value">{card.value}</span>
              <div className="cc-shine" />
              <div className="cc-border" style={{ background: card.color }} />
            </motion.a>
          ))}
        </div>

        <motion.p
          className="contact-name-tag"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
        >
          — {settings?.displayName || 'Tadury Srinivas Aditya'}
        </motion.p>
      </div>
    </section>
  );
};

export default Contact;
