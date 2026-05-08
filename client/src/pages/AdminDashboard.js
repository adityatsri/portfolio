import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../utils/api';

// ─── Category metadata ────────────────────────────────────────────────────────
const CATEGORY_META = {
  youtube_video:  { label: '▶ YouTube Video',    urlType: 'youtube',    showThumb: true,  badge: 'YT',    icon: '▶', color: '#E50914' },
  youtube_short:  { label: '📱 YouTube Short',   urlType: 'youtube',    showThumb: true,  badge: 'SHORT', icon: '📱', color: '#ff6b35' },
  personal_video: { label: '🎥 Personal Video',  urlType: 'drive',      showThumb: true,  badge: 'DRIVE', icon: '🎥', color: '#00aaff' },
  instagram_reel: { label: '🎭 Instagram Reel',  urlType: 'instagram',  showThumb: true,  badge: 'REEL',  icon: '🎭', color: '#e1306c' },
  instagram_post: { label: '📷 Instagram Post',  urlType: 'instagram',  showThumb: false, badge: 'POST',  icon: '📷', color: '#a855f7' },
  personal_photo: { label: '🖼️ Personal Photo', urlType: 'drive',      showThumb: false, badge: 'PHOTO', icon: '🖼️', color: '#10b981' },
};
const CATEGORY_LIST = Object.entries(CATEGORY_META).map(([value, meta]) => ({ value, ...meta }));

const CATEGORY_COLORS = Object.fromEntries(CATEGORY_LIST.map((c) => [c.value, c.color]));

const getThumb = (v) =>
  v.thumbnail ||
  (v.youtubeId ? `https://img.youtube.com/vi/${v.youtubeId}/maxresdefault.jpg` : null) ||
  (v.category === 'personal_photo' && v.mediaUrl ? v.mediaUrl : null);

// ─── URL field helper ─────────────────────────────────────────────────────────
const UrlField = ({ category, form, set }) => {
  const meta = CATEGORY_META[category] || {};

  const autoThumb = (() => {
    if ((category === 'youtube_video' || category === 'youtube_short') && form.youtubeUrl) {
      const m = form.youtubeUrl.match(/(?:youtu\.be\/|watch\?v=|shorts\/|embed\/|v\/)([^#&?]{11})/);
      return m ? `https://img.youtube.com/vi/${m[1]}/maxresdefault.jpg` : null;
    }
    if (category === 'personal_video' && form.driveUrl) {
      const m = form.driveUrl.match(/drive\.google\.com\/file\/d\/([^/?#]+)/);
      if (m) return `https://drive.google.com/thumbnail?id=${m[1]}&sz=w640`;
      const m2 = form.driveUrl.match(/drive\.google\.com\/open\?id=([^&]+)/);
      if (m2) return `https://drive.google.com/thumbnail?id=${m2[1]}&sz=w640`;
    }
    return null;
  })();

  return (
    <>
      {meta.urlType === 'youtube' && (
        <div className="adm-field full">
          <label>{category === 'youtube_short' ? 'YouTube Shorts URL *' : 'YouTube URL *'}</label>
          <input
            className="adm-input"
            value={form.youtubeUrl}
            onChange={(e) => set('youtubeUrl', e.target.value)}
            placeholder={category === 'youtube_short' ? 'https://www.youtube.com/shorts/...' : 'https://www.youtube.com/watch?v=...'}
            required
          />
          {autoThumb && (
            <div className="thumb-preview-wrap">
              <img src={autoThumb} alt="Auto thumbnail" className="thumb-preview" onError={(e) => (e.target.style.display = 'none')} />
              <span className="thumb-auto-label">Auto-detected thumbnail ✓</span>
            </div>
          )}
        </div>
      )}

      {meta.urlType === 'drive' && (
        <div className="adm-field full">
          <label>Google Drive Share Link *</label>
          <input
            className="adm-input"
            value={form.driveUrl}
            onChange={(e) => set('driveUrl', e.target.value)}
            placeholder="https://drive.google.com/file/d/.../view"
            required
          />
          <span className="field-hint-inline">Make sure the file is shared with "Anyone with the link"</span>
          {autoThumb && (
            <div className="thumb-preview-wrap">
              <img src={autoThumb} alt="Drive thumbnail" className="thumb-preview" onError={(e) => (e.target.style.display = 'none')} />
              <span className="thumb-auto-label">Auto-detected thumbnail ✓</span>
            </div>
          )}
        </div>
      )}

      {meta.urlType === 'instagram' && (
        <div className="adm-field full">
          <label>Instagram URL *</label>
          <input
            className="adm-input"
            value={form.instagramUrl}
            onChange={(e) => set('instagramUrl', e.target.value)}
            placeholder={category === 'instagram_reel' ? 'https://www.instagram.com/reel/...' : 'https://www.instagram.com/p/...'}
            required
          />
        </div>
      )}

      {meta.showThumb && (
        <div className="adm-field full">
          <label>
            Thumbnail URL
            <span className="field-hint-inline">
              {(category === 'youtube_video' || category === 'youtube_short' || category === 'personal_video')
                ? ' (optional — auto-generated)'
                : ' (optional)'}
            </span>
          </label>
          <input
            className="adm-input"
            value={form.thumbnail}
            onChange={(e) => set('thumbnail', e.target.value)}
            placeholder="https://example.com/thumbnail.jpg"
          />
          {form.thumbnail && (
            <div className="thumb-preview-wrap">
              <img src={form.thumbnail} alt="Thumbnail" className="thumb-preview" onError={(e) => (e.target.style.display = 'none')} />
            </div>
          )}
        </div>
      )}
    </>
  );
};

// ─── UploadTab ────────────────────────────────────────────────────────────────
const UploadTab = () => {
  const emptyForm = {
    title: '', description: '', category: 'youtube_video',
    youtubeUrl: '', driveUrl: '', instagramUrl: '',
    thumbnail: '', featured: false, order: 0,
  };
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      const meta = CATEGORY_META[form.category] || {};
      const payload = {
        title: form.title,
        description: form.description,
        category: form.category,
        thumbnail: form.thumbnail,
        featured: form.featured,
        order: form.order,
      };
      if (meta.urlType === 'youtube')    payload.youtubeUrl   = form.youtubeUrl;
      if (meta.urlType === 'drive')      payload.driveUrl     = form.driveUrl;
      if (meta.urlType === 'instagram')  payload.instagramUrl = form.instagramUrl;

      await api.post('/videos', payload);
      toast.success('✅ Content added!');
      setForm(emptyForm);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add content');
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div className="tab-panel" key="upload" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
      <div className="upload-hint-box">
        <span>💡</span>
        <span>Select the content type, paste the link, and add it to your portfolio.</span>
      </div>

      <form onSubmit={handleSubmit} className="upload-form">
        <div className="form-grid-2">
          <div className="adm-field full">
            <label>Title *</label>
            <input className="adm-input" value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Enter title" required />
          </div>

          <div className="adm-field full">
            <label>Description</label>
            <textarea className="adm-input" rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Brief description…" />
          </div>

          <div className="adm-field full">
            <label>Content Type *</label>
            <div className="cat-type-grid">
              {CATEGORY_LIST.map((c) => (
                <label key={c.value} className={`cat-type-btn ${form.category === c.value ? 'active' : ''}`} style={form.category === c.value ? { borderColor: c.color, color: c.color, background: `${c.color}18` } : {}}>
                  <input type="radio" name="category" value={c.value} checked={form.category === c.value} onChange={() => set('category', c.value)} />
                  <span className="ctb-icon">{c.icon}</span>
                  <span className="ctb-label">{c.label.replace(/^[^\s]+\s/, '')}</span>
                </label>
              ))}
            </div>
          </div>

          <UrlField category={form.category} form={form} set={set} />

          <div className="adm-field">
            <label>Display Order</label>
            <input type="number" className="adm-input" value={form.order} onChange={(e) => set('order', e.target.value)} min={0} />
          </div>

          <div className="adm-field" style={{ justifyContent: 'flex-end', paddingTop: 8 }}>
            <label className="toggle-label">
              <input type="checkbox" checked={form.featured} onChange={(e) => set('featured', e.target.checked)} />
              <span className="toggle-track"><span className="toggle-knob" /></span>
              Mark as Featured (shows in Hero)
            </label>
          </div>
        </div>

        <motion.button type="submit" className="adm-btn-primary full" disabled={uploading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          {uploading ? <><span className="spin-sm" /> Adding…</> : '➕ Add Content'}
        </motion.button>
      </form>
    </motion.div>
  );
};

// ─── ManageTab ────────────────────────────────────────────────────────────────
const ManageTab = ({ videos, onDelete, onEdit, onRefresh }) => {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const displayed = videos.filter((v) => {
    const matchCat = filter === 'all' || v.category === filter;
    const matchSearch = v.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <motion.div className="tab-panel" key="manage" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
      <div className="manage-toolbar">
        <input className="adm-input search-input" placeholder="🔍 Search by title…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="filter-tabs">
          {['all', ...CATEGORY_LIST.map((c) => c.value)].map((c) => (
            <button key={c} className={`filter-tab ${filter === c ? 'active' : ''}`} onClick={() => setFilter(c)}>
              {c === 'all' ? 'All' : CATEGORY_META[c]?.icon + ' ' + (CATEGORY_META[c]?.label.replace(/^[^\s]+\s/, '') || c)}
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
            <motion.div key={v._id} className="manage-card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} layout>
              <div className="mc-thumb-wrap" style={{ borderColor: CATEGORY_COLORS[v.category] || '#E50914' }}>
                {getThumb(v) ? (
                  <img src={getThumb(v)} alt={v.title} className="mc-thumb" onError={(e) => (e.target.style.display = 'none')} />
                ) : (
                  <div className="mc-thumb-placeholder">{CATEGORY_META[v.category]?.icon || '🎬'}</div>
                )}
                <span className="mc-type-badge" style={{ background: CATEGORY_COLORS[v.category] || '#E50914' }}>
                  {CATEGORY_META[v.category]?.badge || v.category}
                </span>
              </div>
              <div className="mc-info">
                <h4 className="mc-title">{v.title}</h4>
                <span className="mc-cat" style={{ color: CATEGORY_COLORS[v.category] || '#E50914' }}>
                  {CATEGORY_META[v.category]?.label || v.category}
                </span>
                {v.featured && <span className="mc-feat">★ Featured</span>}
                {v.description && <p className="mc-desc">{v.description.length > 60 ? v.description.substring(0, 60) + '…' : v.description}</p>}
              </div>
              <div className="mc-actions">
                <motion.button className="mc-btn edit" onClick={() => onEdit(v)} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }} title="Edit">✏️</motion.button>
                <motion.button className="mc-btn del" onClick={() => onDelete(v._id)} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }} title="Delete">🗑️</motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

// ─── SettingsTab ──────────────────────────────────────────────────────────────
const extractDriveIdFE = (url) => {
  const m = (url || '').match(/drive\.google\.com\/file\/d\/([^/?#]+)/) ||
            (url || '').match(/drive\.google\.com\/open\?id=([^&]+)/);
  return m ? m[1] : null;
};

const SettingsTab = ({ initial, onSaved }) => {
  const [form, setForm] = useState({
    contactEmail: '', contactPhone: '', instagramUrl: '', youtubeUrl: '',
    heroTitle: '', heroSubtitle: '', displayName: '', profilePicUrl: '',
    currentPassword: '', newPassword: '', confirmNewPassword: '',
    ...initial,
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const setProfilePic = (url) => {
    // Convert Drive sharing link → public lh3 CDN (works without Google login)
    const driveId = extractDriveIdFE(url);
    const finalUrl = driveId ? `https://lh3.googleusercontent.com/d/${driveId}` : url;
    set('profilePicUrl', finalUrl);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (form.newPassword && form.newPassword !== form.confirmNewPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setSaving(true);
    try {
      const { data } = await api.put('/settings', form);
      toast.success('✅ Settings saved!');
      setForm((f) => ({ ...f, ...data, currentPassword: '', newPassword: '', confirmNewPassword: '' }));
      if (onSaved) onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div className="tab-panel" key="settings" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
      <form onSubmit={handleSave} className="settings-form">
        <div className="settings-section">
          <h3 className="settings-section-title">🖼️ Admin Profile</h3>
          <div className="form-grid-2">
            <div className="adm-field">
              <label>Display Name</label>
              <input className="adm-input" value={form.displayName} onChange={(e) => set('displayName', e.target.value)} placeholder="Tadury Srinivas Aditya" />
            </div>
            <div className="adm-field">
              <label>Profile Picture URL</label>
              <input className="adm-input" value={form.profilePicUrl} onChange={(e) => setProfilePic(e.target.value)} placeholder="https://example.com/photo.jpg or Google Drive link" />
            </div>
            {form.profilePicUrl && (
              <div className="adm-field">
                <label>Preview</label>
                <img src={form.profilePicUrl} alt="Profile preview" className="profile-preview" onError={(e) => (e.target.style.display = 'none')} />
              </div>
            )}
          </div>
        </div>

        <div className="settings-section">
          <h3 className="settings-section-title">📋 Contact Information</h3>
          <div className="form-grid-2">
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

        <motion.button type="submit" className="adm-btn-primary" disabled={saving} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          {saving ? <><span className="spin-sm" /> Saving…</> : '💾 Save Settings'}
        </motion.button>
      </form>
    </motion.div>
  );
};

// ─── EditModal ────────────────────────────────────────────────────────────────
const EditModal = ({ video, onClose, onSaved }) => {
  const cat = video.category || video.mediaType;
  const [form, setForm] = useState({
    ...video,
    youtubeUrl: (cat === 'youtube_video' || cat === 'youtube_short')
      ? (video.youtubeId
          ? (cat === 'youtube_short'
              ? `https://www.youtube.com/shorts/${video.youtubeId}`
              : `https://www.youtube.com/watch?v=${video.youtubeId}`)
          : '')
      : '',
    driveUrl: (cat === 'personal_video' || cat === 'personal_photo') ? (video.mediaUrl || '') : '',
    instagramUrl: (cat === 'instagram_reel' || cat === 'instagram_post') ? (video.mediaUrl || '') : '',
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const meta = CATEGORY_META[form.category] || {};
      const payload = {
        title: form.title,
        description: form.description,
        category: form.category,
        featured: form.featured,
        order: form.order,
        thumbnail: meta.showThumb ? form.thumbnail : '',
      };
      if (meta.urlType === 'youtube')   payload.youtubeUrl   = form.youtubeUrl;
      if (meta.urlType === 'drive')     payload.driveUrl     = form.driveUrl;
      if (meta.urlType === 'instagram') payload.instagramUrl = form.instagramUrl;

      await api.put(`/videos/${video._id}`, payload);
      toast.success('✅ Updated!');
      onSaved();
    } catch {
      toast.error('Update failed');
    } finally {
      setSaving(false);
    }
  };

  const editMeta = CATEGORY_META[form.category] || {};

  return (
    <AnimatePresence>
      <motion.div className="edit-modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
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
                <label>Content Type</label>
                <select className="adm-input" value={form.category} onChange={(e) => set('category', e.target.value)}>
                  {CATEGORY_LIST.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div className="adm-field">
                <label>Display Order</label>
                <input type="number" className="adm-input" value={form.order} onChange={(e) => set('order', e.target.value)} />
              </div>

              {editMeta.urlType === 'youtube' && (
                <div className="adm-field full">
                  <label>YouTube URL</label>
                  <input className="adm-input" value={form.youtubeUrl} onChange={(e) => set('youtubeUrl', e.target.value)} placeholder="https://www.youtube.com/watch?v=..." />
                </div>
              )}
              {editMeta.urlType === 'drive' && (
                <div className="adm-field full">
                  <label>Google Drive Share Link</label>
                  <input className="adm-input" value={form.driveUrl} onChange={(e) => set('driveUrl', e.target.value)} placeholder="https://drive.google.com/file/d/.../view" />
                </div>
              )}
              {editMeta.urlType === 'instagram' && (
                <div className="adm-field full">
                  <label>Instagram URL</label>
                  <input className="adm-input" value={form.instagramUrl} onChange={(e) => set('instagramUrl', e.target.value)} placeholder="https://www.instagram.com/..." />
                </div>
              )}

              {editMeta.showThumb && (
                <div className="adm-field full">
                  <label>Thumbnail URL</label>
                  <input className="adm-input" value={form.thumbnail || ''} onChange={(e) => set('thumbnail', e.target.value)} placeholder="https://..." />
                  {form.thumbnail && (
                    <div className="thumb-preview-wrap">
                      <img src={form.thumbnail} alt="thumb" className="thumb-preview" onError={(e) => (e.target.style.display = 'none')} />
                    </div>
                  )}
                </div>
              )}

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

// ─── Main AdminDashboard ──────────────────────────────────────────────────────
const AdminDashboard = () => {
  const [tab, setTab] = useState('manage');
  const [videos, setVideos] = useState([]);
  const [settings, setSettings] = useState(null);
  const [editingVideo, setEditingVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profilePicError, setProfilePicError] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { setProfilePicError(false); }, [settings?.profilePicUrl]);

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
    { id: 'manage',   label: 'Manage',   icon: '📋' },
    { id: 'upload',   label: 'Upload',   icon: '⬆️' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  const counts = {};
  CATEGORY_LIST.forEach((c) => { counts[c.value] = videos.filter((v) => v.category === c.value).length; });

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
      {/* ── Sidebar ── */}
      <aside className="admin-sidebar">
        <div className="sidebar-logo">
          {settings?.profilePicUrl && !profilePicError ? (
            <img src={settings.profilePicUrl} alt="Admin" className="sidebar-avatar" onError={() => setProfilePicError(true)} />
          ) : (
            <span className="sl-badge">TSA</span>
          )}
          <span className="sl-label">Admin</span>
        </div>

        <div className="sidebar-stats">
          {CATEGORY_LIST.map((c) => (
            <div key={c.value} className="stat-pill" style={{ borderColor: c.color }}>
              <span>{c.icon}</span>
              <span style={{ color: c.color }}>{counts[c.value] || 0}</span>
            </div>
          ))}
        </div>

        <nav className="sidebar-nav">
          {tabs.map((t) => (
            <motion.button key={t.id} className={`sidebar-btn ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)} whileHover={{ x: 4 }} whileTap={{ scale: 0.97 }}>
              <span className="sb-icon">{t.icon}</span>
              <span>{t.label}</span>
              {tab === t.id && <motion.div className="sb-active-bar" layoutId="activeBar" transition={{ type: 'spring', stiffness: 400, damping: 30 }} />}
            </motion.button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <a href="/" className="sidebar-btn ghost">
            <span className="sb-icon">🏠</span>
            <span>Portfolio</span>
          </a>
          <motion.button className="sidebar-btn logout" onClick={handleLogout} whileHover={{ x: 4 }}>
            <span className="sb-icon">🚪</span>
            <span>Logout</span>
          </motion.button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="admin-main">
        <div className="admin-topbar">
          <div>
            <h1 className="admin-page-title">
              {tab === 'manage' ? '📋 Manage Content' : tab === 'upload' ? '⬆️ Upload Content' : '⚙️ Settings'}
            </h1>
            <p className="admin-page-sub">
              {tab === 'manage'
                ? `${videos.length} total items across all categories`
                : tab === 'upload'
                ? 'Add new videos, photos or links'
                : 'Edit contact info, social links & password'}
            </p>
          </div>
          <div className="topbar-profile">
            {settings?.profilePicUrl && !profilePicError && (
              <img src={settings.profilePicUrl} alt="Admin" className="topbar-avatar" onError={() => setProfilePicError(true)} />
            )}
            <span className="admin-topbar-badge">Admin</span>
          </div>
        </div>

        <div className="admin-content">
          <AnimatePresence mode="wait">
            {tab === 'manage' && <ManageTab videos={videos} onDelete={handleDelete} onEdit={setEditingVideo} onRefresh={fetchData} />}
            {tab === 'upload' && <UploadTab key="upload" />}
            {tab === 'settings' && settings && <SettingsTab key="settings" initial={settings} onSaved={fetchData} />}
          </AnimatePresence>
        </div>
      </main>

      {/* ── Edit Modal ── */}
      <AnimatePresence>
        {editingVideo && (
          <EditModal video={editingVideo} onClose={() => setEditingVideo(null)} onSaved={() => { setEditingVideo(null); fetchData(); }} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
