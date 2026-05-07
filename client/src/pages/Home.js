import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import VideoRow from '../components/VideoRow';
import VideoModal from '../components/VideoModal';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import api from '../utils/api';

const Home = () => {
  const [videos, setVideos] = useState([]);
  const [settings, setSettings] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vRes, sRes] = await Promise.all([api.get('/videos'), api.get('/settings')]);
        setVideos(vRes.data);
        setSettings(sRes.data);
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const byCategory = (cat) => videos.filter((v) => v.category === cat);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-logo">TSA</div>
        <div className="loading-bar">
          <div className="loading-progress" />
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      <Navbar settings={settings} videos={videos} />

      <Hero videos={videos} settings={settings} onVideoSelect={setSelectedVideo} />

      <motion.div
        className="rows-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <VideoRow title="YouTube Videos"  category="youtube_video"  videos={byCategory('youtube_video')}  onVideoSelect={setSelectedVideo} />
        <VideoRow title="YouTube Shorts"  category="youtube_short"  videos={byCategory('youtube_short')}  onVideoSelect={setSelectedVideo} />
        <VideoRow title="Personal Videos" category="personal_video" videos={byCategory('personal_video')} onVideoSelect={setSelectedVideo} />
        <VideoRow title="Instagram Reels" category="instagram_reel" videos={byCategory('instagram_reel')} onVideoSelect={setSelectedVideo} />
        <VideoRow title="Instagram Posts" category="instagram_post" videos={byCategory('instagram_post')} onVideoSelect={setSelectedVideo} />
        <VideoRow title="Personal Photos" category="personal_photo" videos={byCategory('personal_photo')} onVideoSelect={setSelectedVideo} />
        {/* Legacy categories — videos uploaded before the 6-type update */}
        <VideoRow title="Videographer"  category="videographer"  videos={byCategory('videographer')}  onVideoSelect={setSelectedVideo} />
        <VideoRow title="Photographer"  category="photographer"  videos={byCategory('photographer')}  onVideoSelect={setSelectedVideo} />
        <VideoRow title="Video Editing" category="video_editing" videos={byCategory('video_editing')} onVideoSelect={setSelectedVideo} />

        {videos.length === 0 && (
          <motion.div
            className="empty-state"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <p className="empty-icon">🎬</p>
            <h3>No content yet</h3>
            <p>Visit the admin panel to start uploading your work.</p>
          </motion.div>
        )}
      </motion.div>

      <Contact settings={settings} />
      <Footer settings={settings} />

      <AnimatePresence>
        {selectedVideo && (
          <VideoModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
