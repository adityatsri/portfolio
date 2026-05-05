import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../utils/api';

// ─── helpers ──────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { value: 'videographer', label: '🎬 Videographer' },
  { value: 'photographer', label: '📸 Photographer' },
  { value: 'video_editing', label: '✂️ Video Editing' },
];

const CATEGORY_COLORS = {
  videographer: '#E50914',
  photographer: '#00aaff',
  video_editing: '#a855f7',
};

const getThumb = (v) =>
  v.thumbnail ||
  (v.youtubeId ? `https://img.youtube.com/vi/${v.youtubeId}/maxresdefault.jpg` : null);

// ─── Sub-components ────────────────────────────────────────────────────────────

const UploadTab = () => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'videographer',
    mediaType: 'youtube',
    youtubeUrl: '',
    featured: false,
    order: 0,
  });
  const [mediaFile, setMediaFile] = useState(null);
  const [thumbFile, setThumbFile] = useState(null);
  const [thumbPreview, setThumbPreview] = useState('');
  const [mediaPreview, setMediaPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const mediaRef = useRef();
  const thumbRef = useRef();

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleMedia = (file) => {
    if (!file) return;
    setMediaFile(file);
    if (file.type.startsWith('image/')) {
      setMediaPreview(URL.createObjectURL(file));
    } else {
      setMediaPreview('');
    }
  };

  const handleThumb = (file) => {
    if (!file) return;
    setThumbFile(file);
    setThumbPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (mediaFile) fd.append('media', mediaFile);
      if (thumbFile) fd.append('thumbnail', thumbFile);

      await api.post('/videos', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('✅ Content uploaded successfully!');

      setForm({ title: '', description: '', category: 'videographer', mediaType: 'youtube', youtubeUrl: '', featured: false, order: 0 });
      setMediaFile(null); setThumbFile(null); setMediaPreview(''); setThumbPreview('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  // Auto-generate YT thumb preview
  const ytThumb = form.mediaType === 'youtube' && form.youtubeUrl
    ? (() => {
        const m = form.youtubeUrl.match(/(?:youtu\.be\/|watch\?v=|embed\/|v\/)([^#&?]{11})/);
        return m ? `https://img.youtube.com/vi/${m[1]}/maxresdefault.jpg` : null;
      })()
    : null;

  return (
    <motion.div
      className="tab-panel"
      key="upload"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3 }}
    >
      <form onSubmit={handleSubmit} className="upload-form">
        <div className="form-grid-2">
          {/* Title */}
          <div className="adm-field full">
            <label>Title *</label>
            <input
              className="adm-input"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="Enter title"
              required
            />
          </div>

          {/* Description */}
          <div className="adm-field full">
            <label>Description</label>
            <textarea
              className="adm-input"
              rows={3}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Brief description…"
            />
          </div>

          {/* Category */}
          <div className="adm-field">
            <label>Category *</label>
            <select className="adm-input" value={form.category} onChange={(e) => set('category', e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Media Type */}
          <div className="adm-field">
            <label>Media Type *</label>
            <div className="radio-group">
              {['youtube', 'direct'].map((t) => (
                <label key={t} className={`radio-btn ${form.mediaType === t ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="mediaType"
                    value={t}
                    checked={form.mediaType === t}
                    onChange={() => set('mediaType', t)}
                  />
                  {t === 'youtube' ? '▶ YouTube Link' : '📁 Upload File'}
                </label>
              ))}
            </div>
          </div>

          {/* YouTube URL or File upload */}
          {form.mediaType === 'youtube' ? (
            <div className="adm-field full">
              <label>YouTube URL *</label>
              <input
                className="adm-input"
                value={form.youtubeUrl}
                onChange={(e) => set('youtubeUrl', e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                required={form.mediaType === 'youtube'}
              />
              {ytThumb && (
                <div className="thumb-preview-wrap">
                  <img src={ytThumb} alt="YT thumbnail" className="thumb-preview" onError={(e) => (e.target.style.display = 'none')} />
                  <span className="thumb-auto-label">Auto-detected thumbnail</span>
                </div>
              )}
            </div>
          ) : (
            <div className="adm-field full">
              <label>Upload Video / Image *</label>
              <div className="file-drop" onClick={() => mediaRef.current?.click()}>
                {mediaPreview ? (
                  <img src={mediaPreview} alt="preview" className="file-img-preview" />
                ) : mediaFile ? (
                  <div className="file-selected">
                    <span>🎬</span>
                    <span>{mediaFile.name}</span>
                  </div>
                ) : (
                  <div className="file-placeholder">
                    <span className="file-icon">⬆️</span>
                    <span>Click to select video or image</span>
                    <span className="file-hint">MP4, MOV, WebM, JPG, PNG — max 500 MB</span>
                  </div>
                )}
                <input
                  ref={mediaRef}
                  type="file"
                  accept="video/*,image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => handleMedia(e.target.files[0])}
                  required={form.mediaType === 'direct'}
                />
              </div>
            </div>
          )}

          {/* Thumbnail (always shown for direct; optional override for YT) */}
          {(form.mediaType === 'direct' || form.mediaType === 'youtube') && (
            <div className="adm-field full">
              <label>
                Custom Thumbnail{form.mediaType === 'youtube' ? ' (optional override)' : ' *'}
              </label>
              <div className="file-drop small" onClick={() => thumbRef.current?.click()}>
                {thumbPreview ? (
                  <img src={thumbPreview} alt="thumb" className="file-img-preview" />
                ) : (
                  <div className="file-placeholder">
                    <span className="file-icon">🖼️</span>
                    <span>Click to select thumbnail</span>
                  </div>
                )}
                <input
                  ref={thumbRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => handleThumb(e.target.files[0])}
                />
              </div>
            </div>
          )}

          {/* Order & Featured */}
          <div className="adm-field">
            <label>Display Order</label>
            <input
              type="number"
              className="adm-input"
              value={form.order}
              onChange={(e) => set('order', e.target.value)}
              min={0}
            />
          </div>

          <div className="adm-field" style={{ justifyContent: 'flex-end', paddingTop: 8 }}>
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => set('featured', e.target.checked)}
              />
              <span className="toggle-track"><span className="toggle-knob" /></span>
              Mark as Featured (shows in Hero)
            </label>
          </div>
        </div>

        <motion.button
          type="submit"
          className="adm-btn-primary full"
          disabled={uploading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {uploading ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="spin-sm" /> Uploading…
            </span>
          ) : (
            '⬆️ Upload Content'
          )}
        </motion.button>
      </form>
    </motion.div>
  );
};

// ─── ManageTab ─────────────────────────────────────────────────────────────────
const ManageTab = ({ videos, onDelete, onEdit, onRefresh }) => {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const displayed = videos.filter((v) => {
    const matchCat = filter === 'all' || v.category === filter;
    const matchSearch = v.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <motion.div
      className="tab-panel"
      key="manage"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3 }}
    >
      {/* Filter bar */}
      <div className="manage-toolbar">
        <input
          className="adm-input search-input"
          placeholder="🔍 Search by title…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="filter-tabs">
          {['all', 'videographer', 'photographer', 'video_editing'].map((c) => (
            <button
              key={c}
              className={`filter-tab ${filter === c ? 'active' : ''}`}
              onClick={() => setFilter(c)}
            >
              {c === 'all' ? 'All' : c === 'video_editing' ? 'Editing' : c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
        </div>
        <button className="adm-btn-ghost" onClick={onRefresh}>↻ Refresh</button>
      </div>

      <p className="manage-count">{displayed.length} item{displayed.length !== 1 ? 's' : ''}</p>

      {displayed.length === 0 ? (
        <div className="adm-empty">No items found.</div>
      ) : (
        <div className="manage-grid">
          {displayed.map((v) => (
            <motion.div
              key={v._id}
              className="manage-card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              layout
            >
              <div
                className="mc-thumb-wrap"
                style={{ borderColor: CATEGORY_COLORS[v.category] }}
              >
                {getThumb(v) ? (
                  <img
                    src={getThumb(v)}
                    alt={v.title}
                    className="mc-thumb"
                    onError={(e) => (e.target.style.display = 'none')}
                  />
                ) : (
                  <div className="mc-thumb-placeholder">
                    {v.category === 'photographer' ? '📸' : '🎬'}
                  </div>
                )}
                <span className="mc-type-badge">{v.mediaType === 'youtube' ? 'YT' : '📁'}</span>
              </div>

              <div className="mc-info">
                <h4 className="mc-title">{v.title}</h4>
                <span
                  className="mc-cat"
                  style={{ color: CATEGORY_COLORS[v.category] }}
                >
                  {v.category === 'video_editing' ? 'Editing' : v.category}
                </span>
                {v.featured && <span className="mc-feat">★ Featured</span>}
                {v.description && (
                  <p className="mc-desc">
                    {v.description.length > 60 ? v.description.substring(0, 60) + '…' : v.description}
                  </p>
                )}
              </div>

              <div className="mc-actions">
                <motion.button
                  className="mc-btn edit"
                  onClick={() => onEdit(v)}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.93 }}
                  title="Edit"
                >
                  ✏️
                </motion.button>
                <motion.button
                  className="mc-btn del"
                  onClick={() => onDelete(v._id)}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.93 }}
                  title="Delete"
                >
                  🗑️
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

// ─── SettingsTab ───────────────────────────────────────────────────────────────
const SettingsTab = ({ initial }) => {
  const [form, setForm] = useState({
    contactEmail: '',
    contactPhone: '',
    instagramUrl: '',
    youtubeUrl: '',
    heroTitle: '',
    heroSubtitle: '',
    displayName: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
    ...initial,
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (form.newPassword && form.newPassword !== form.confirmNewPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setSaving(true);
    try {
      await api.put('/settings', form);
      toast.success('✅ Settings saved!');
      setForm((f) => ({ ...f, currentPassword: '', newPassword: '', confirmNewPassword: '' }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      className="tab-panel"
      key="settings"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3 }}
    >
      <form onSubmit={handleSave} className="settings-form">
        {/* Contact Info */}
        <div className="settings-section">
          <h3 className="settings-section-title">📋 Contact Information</h3>
          <div className="form-grid-2">
            <div className="adm-field">
              <label>Display Name</label>
              <input className="adm-input" value={form.displayName} onChange={(e) => set('displayName', e.target.value)} placeholder="Tadury Srinivas Aditya" />
            </div>
            <div className="adm-field">
              <label>Contact Email</label>
              <input className="adm-input" type="email" value={form.contactEmail} onChange={(e) => set('contactEmail', e.target.value)} placeholder="your@email.com" />
            </div>
            <div className="adm-field">
              <label>Contact Phone</label>
              <input className="adm-input" value={form.contactPhone} onChange={(e) => set('contactPhone', e.target.value)} placeholder="+91 9999999999" />
            </div>
          </div>
        </div>

        {/* Hero */}
        <div className="settings-section">
          <h3 className="settings-section-title">🎬 Hero Section</h3>
          <div className="form-grid-2">
            <div className="adm-field full">
              <label>Hero Title</label>
              <input className="adm-input" value={form.heroTitle} onChange={(e) => set('heroTitle', e.target.value)} placeholder="YOUR NAME" />
            </div>
            <div className="adm-field full">
              <label>Hero Subtitle</label>
              <input className="adm-input" value={form.heroSubtitle} onChange={(e) => set('heroSubtitle', e.target.value)} placeholder="Videographer • Photographer • Video Editor" />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="settings-section">
          <h3 className="settings-section-title">🔗 Social Links</h3>
          <div className="form-grid-2">
            <div className="adm-field">
              <label>Instagram URL</label>
              <input className="adm-input" value={form.instagramUrl} onChange={(e) => set('instagramUrl', e.target.value)} placeholder="https://instagram.com/yourusername" />
            </div>
            <div className="adm-field">
              <label>YouTube URL</label>
              <input className="adm-input" value={form.youtubeUrl} onChange={(e) => set('youtubeUrl', e.target.value)} placeholder="https://youtube.com/@yourusername" />
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="settings-section">
          <h3 className="settings-section-title">🔒 Change Admin Password</h3>
          <div className="form-grid-2">
            <div className="adm-field">
              <label>Current Password</label>
              <input className="adm-input" type="password" value={form.currentPassword} onChange={(e) => set('currentPassword', e.target.value)} placeholder="Enter current password" autoComplete="current-password" />
            </div>
            <div className="adm-field">
              <label>New Password</label>
              <input className="adm-input" type="password" value={form.newPassword} onChange={(e) => set('newPassword', e.target.value)} placeholder="Enter new password" autoComplete="new-password" />
            </div>
            <div className="adm-field">
              <label>Confirm New Password</label>
              <input className="adm-input" type="password" value={form.confirmNewPassword} onChange={(e) => set('confirmNewPassword', e.target.value)} placeholder="Repeat new password" autoComplete="new-password" />
            </div>
          </div>
          <p className="settings-note">Leave password fields empty to keep the current password.</p>
        </div>

        <motion.button
          type="submit"
          className="adm-btn-primary"
          disabled={saving}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {saving ? <span className="spin-sm" /> : null}
          {saving ? ' Saving…' : '💾 Save Settings'}
        </motion.button>
      </form>
    </motion.div>
  );
};

// ─── EditModal ─────────────────────────────────────────────────────────────────
const EditModal = ({ video, onClose, onSaved }) => {
  const [form, setForm] = useState({ ...video });
  const [thumbFile, setThumbFile] = useState(null);
  const [thumbPreview, setThumbPreview] = useState(video.thumbnail || '');
  const [saving, setSaving] = useState(false);
  const thumbRef = useRef();

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      const skip = ['_id', '__v', 'createdAt', 'updatedAt', 'cloudinaryPublicId', 'thumbnailPublicId'];
      Object.entries(form).forEach(([k, v]) => { if (!skip.includes(k)) fd.append(k, v); });
      if (thumbFile) fd.append('thumbnail', thumbFile);

      await api.put(`/videos/${video._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('✅ Updated!');
      onSaved();
    } catch (err) {
      toast.error('Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="edit-modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="edit-modal-box"
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.85, opacity: 0 }}
          transition={{ type: 'spring', damping: 24, stiffness: 260 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="edit-modal-header">
            <h3>✏️ Edit: {video.title}</h3>
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>

          <form onSubmit={handleSave} className="edit-form">
            <div className="form-grid-2">
              <div className="adm-field full">
                <label>Title</label>
                <input className="adm-input" value={form.title} onChange={(e) => set('title', e.target.value)} required />
              </div>
              <div className="adm-field full">
                <label>Description</label>
                <textarea className="adm-input" rows={2} value={form.description} onChange={(e) => set('description', e.target.value)} />
              </div>
              <div className="adm-field">
                <label>Category</label>
                <select className="adm-input" value={form.category} onChange={(e) => set('category', e.target.value)}>
                  {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div className="adm-field">
                <label>Display Order</label>
                <input type="number" className="adm-input" value={form.order} onChange={(e) => set('order', e.target.value)} />
              </div>
              {form.mediaType === 'youtube' && (
                <div className="adm-field full">
                  <label>YouTube URL</label>
                  <input className="adm-input" value={form.youtubeUrl || `https://www.youtube.com/watch?v=${form.youtubeId}`} onChange={(e) => set('youtubeUrl', e.target.value)} />
                </div>
              )}
              <div className="adm-field full">
                <label>Replace Thumbnail</label>
                <div className="file-drop small" onClick={() => thumbRef.current?.click()}>
                  {thumbPreview ? (
                    <img src={thumbPreview} alt="thumb" className="file-img-preview" onError={(e) => (e.target.style.display = 'none')} />
                  ) : (
                    <div className="file-placeholder"><span>🖼️ Click to replace thumbnail</span></div>
                  )}
                  <input ref={thumbRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files[0]; if (f) { setThumbFile(f); setThumbPreview(URL.createObjectURL(f)); } }} />
                </div>
              </div>
              <div className="adm-field">
                <label className="toggle-label">
                  <input type="checkbox" checked={form.featured} onChange={(e) => set('featured', e.target.checked)} />
                  <span className="toggle-track"><span className="toggle-knob" /></span>
                  Featured
                </label>
              </div>
            </div>

            <div className="edit-modal-footer">
              <button type="button" className="adm-btn-ghost" onClick={onClose}>Cancel</button>
              <motion.button type="submit" className="adm-btn-primary" disabled={saving} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                {saving ? <><span className="spin-sm" /> Saving…</> : '💾 Save Changes'}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ─── Main AdminDashboard ───────────────────────────────────────────────────────
const AdminDashboard = () => {
  const [tab, setTab] = useState('manage');
  const [videos, setVideos] = useState([]);
  const [settings, setSettings] = useState(null);
  const [editingVideo, setEditingVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [vRes, sRes] = await Promise.all([api.get('/videos'), api.get('/settings')]);
      setVideos(vRes.data);
      setSettings(sRes.data);
    } catch {
      toast.error('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this item?')) return;
    try {
      await api.delete(`/videos/${id}`);
      toast.success('Deleted');
      setVideos((v) => v.filter((x) => x._id !== id));
    } catch {
      toast.error('Delete failed');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.info('Logged out');
  };

  const tabs = [
    { id: 'manage', label: 'Manage', icon: '📋' },
    { id: 'upload', label: 'Upload', icon: '⬆️' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  const counts = {
    videographer: videos.filter((v) => v.category === 'videographer').length,
    photographer: videos.filter((v) => v.category === 'photographer').length,
    video_editing: videos.filter((v) => v.category === 'video_editing').length,
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-logo">TSA</div>
        <div className="loading-bar"><div className="loading-progress" /></div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside className="admin-sidebar">
        <div className="sidebar-logo">
          <span className="sl-badge">TSA</span>
          <span className="sl-label">Admin</span>
        </div>

        <div className="sidebar-stats">
          {Object.entries(counts).map(([cat, count]) => (
            <div key={cat} className="stat-pill" style={{ borderColor: CATEGORY_COLORS[cat] }}>
              <span style={{ color: CATEGORY_COLORS[cat] }}>
                {cat === 'videographer' ? '🎬' : cat === 'photographer' ? '📸' : '✂️'}
              </span>
              <span>{count}</span>
            </div>
          ))}
        </div>

        <nav className="sidebar-nav">
          {tabs.map((t) => (
            <motion.button
              key={t.id}
              className={`sidebar-btn ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="sb-icon">{t.icon}</span>
              <span>{t.label}</span>
              {tab === t.id && (
                <motion.div
                  className="sb-active-bar"
                  layoutId="activeBar"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </motion.button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <a href="/" className="sidebar-btn ghost">
            <span className="sb-icon">🏠</span>
            <span>Portfolio</span>
          </a>
          <motion.button
            className="sidebar-btn logout"
            onClick={handleLogout}
            whileHover={{ x: 4 }}
          >
            <span className="sb-icon">🚪</span>
            <span>Logout</span>
          </motion.button>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────── */}
      <main className="admin-main">
        <div className="admin-topbar">
          <div>
            <h1 className="admin-page-title">
              {tab === 'manage' ? '📋 Manage Content' : tab === 'upload' ? '⬆️ Upload Content' : '⚙️ Settings'}
            </h1>
            <p className="admin-page-sub">
              {tab === 'manage' ? `${videos.length} total items across all categories` : tab === 'upload' ? 'Add new videos, photos or links' : 'Edit contact info, social links & password'}
            </p>
          </div>
          <span className="admin-topbar-badge">Admin</span>
        </div>

        <div className="admin-content">
          <AnimatePresence mode="wait">
            {tab === 'manage' && (
              <ManageTab
                videos={videos}
                onDelete={handleDelete}
                onEdit={setEditingVideo}
                onRefresh={fetchData}
              />
            )}
            {tab === 'upload' && <UploadTab key="upload" />}
            {tab === 'settings' && settings && (
              <SettingsTab key="settings" initial={settings} />
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* ── Edit Modal ───────────────────────────────────────── */}
      <AnimatePresence>
        {editingVideo && (
          <EditModal
            video={editingVideo}
            onClose={() => setEditingVideo(null)}
            onSaved={() => { setEditingVideo(null); fetchData(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
