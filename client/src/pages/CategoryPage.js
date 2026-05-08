import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import VideoCard from '../components/VideoCard';
import VideoModal from '../components/VideoModal';
import api from '../utils/api';

const CATEGORY_META = {
  youtube_video:  { label: 'YouTube Videos',    icon: '▶' },
  youtube_short:  { label: 'YouTube Shorts',     icon: '📱' },
  personal_video: { label: 'Personal Videos',    icon: '🎥' },
  instagram_reel: { label: 'Instagram Reels',    icon: '🎦' },
  instagram_post: { label: 'Instagram Posts',    icon: '📷' },
  personal_photo: { label: 'Personal Photos',    icon: '🖼️' },
  videographer:   { label: 'Videography',        icon: '🎬' },
  photographer:   { label: 'Photography',        icon: '📸' },
  video_editing:  { label: 'Video Editing',      icon: '✂️' },
};

const CategoryPage = () => {
  const { categoryName } = useParams();
  const [videos, setVideos] = useState([]);
  const [allVideos, setAllVideos] = useState([]);
  const [settings, setSettings] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vRes, sRes] = await Promise.all([api.get('/videos'), api.get('/settings')]);
        setAllVideos(vRes.data);
        setVideos(vRes.data.filter((v) => (v.category || v.mediaType) === categoryName));
        setSettings(sRes.data);
      } catch {
        // fail silently
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [categoryName]);

  const meta = CATEGORY_META[categoryName] || { label: categoryName, icon: '🎞️' };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-logo">TSA</div>
        <div className="loading-bar"><div className="loading-progress" /></div>
      </div>
    );
  }

  return (
    <div className="cat-page">
      <Navbar videos={allVideos} settings={settings} />

      <div className="cat-page-inner">
        <div className="cat-page-header">
          <Link to="/" className="cat-back-btn">← Back</Link>
          <div className="cat-page-title-wrap">
            <span className="cat-page-icon">{meta.icon}</span>
            <h1 className="cat-page-title">{meta.label}</h1>
            <span className="cat-page-count">{videos.length} items</span>
          </div>
        </div>

        {videos.length === 0 ? (
          <div className="cat-empty">No content in this category yet.</div>
        ) : (
          <motion.div
            className="cat-grid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            {videos.map((video, i) => (
              <VideoCard
                key={video._id}
                video={video}
                index={i}
                onSelect={() => setSelected(video)}
              />
            ))}
          </motion.div>
        )}
      </div>

      {selected && <VideoModal video={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

export default CategoryPage;
