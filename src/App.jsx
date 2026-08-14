// src/App.jsx
import React, { useEffect, useState } from 'react';
import { PlayerProvider, usePlayer } from './context/PlayerContext';
import { parseM3U } from './utils/parseM3U';
import { generateTrackCover } from './utils/avatarGenerator';
import NowPlaying from './components/NowPlaying';
import TrackList from './components/playlist/TrackList';
import LyricsModal from './components/modals/LyricsModal';

// کامپوننت داخلی برای بارگذاری داده‌ها
const AppContent = () => {
  const { setTracks, tracks, currentTrack, nextTrack, prevTrack, togglePlay, setShowLyrics, showLyrics } = usePlayer();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPlaylist = async () => {
      try {
        const baseUrl = import.meta.env.BASE_URL || './';
        const url = `${baseUrl}playlist.m3u8`;
        console.log('📂 تلاش برای بارگذاری:', url);
        
        const response = await fetch(url);
        console.log('📡 وضعیت پاسخ:', response.status, response.statusText);
        
        if (!response.ok) {
          throw new Error(`خطای ${response.status}: ${response.statusText}`);
        }
        
        const text = await response.text();
        console.log('📄 محتوای فایل (۵۰ کاراکتر اول):', text.substring(0, 100));
        
        const parsed = parseM3U(text);
        console.log('🎵 تعداد آهنگ‌های پارس شده:', parsed.length);
        
        // تولید کاور برای هر آهنگ
        const withCovers = parsed.map(t => ({
          ...t,
          cover: generateTrackCover(t.artist, t.title, 300),
          hasFile: true, // فرض می‌کنیم همه فایل‌ها در سرور وجود دارند
        }));
        
        console.log('✅ تعداد آهنگ‌های ارسالی به PlayerContext:', withCovers.length);
        console.log('✅ نمونه اولین آهنگ:', withCovers[0]);
        
        // 🔥 ارسال داده‌ها به Context
        setTracks(withCovers);
        setLoading(false);
      } catch (err) {
        console.error('❌ خطای بارگذاری پلی‌لیست:', err);
        setTracks([]);
        setLoading(false);
      }
    };
    
    loadPlaylist();
  }, [setTracks]);

  // کیبورد شورت‌کات
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
      if (e.code === 'ArrowRight') { e.preventDefault(); nextTrack(); }
      if (e.code === 'ArrowLeft') { e.preventDefault(); prevTrack(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [togglePlay, nextTrack, prevTrack]);

  const filesCount = tracks.filter(t => t.hasFile).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">🌌</div>
          <p className="text-white/40">در حال بارگذاری لیست پخش...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 container mx-auto px-4 py-6 flex flex-col items-center gap-8 min-h-screen">
      
      <header className="text-center w-full">
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="text-5xl lg:text-6xl">🌌</div>
            <h1 className="text-4xl lg:text-6xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent drop-shadow-2xl">
              Nebula Player
            </h1>
          </div>
          
          <div className="flex flex-wrap justify-center gap-2">
            <span className="badge">🎵 {tracks.length} آهنگ</span>
            <span className="badge">📁 {filesCount} فایل در سرور</span>
            <span className="badge">⚡ ۱۰۰% آفلاین</span>
            <span className="badge">⌨️ Space = پلی/مکث</span>
            {currentTrack && (
              <span className="badge badge-primary">🎧 {currentTrack.title}</span>
            )}
          </div>
        </div>
      </header>

      <NowPlaying />
      
      <div className="w-full max-w-4xl glass-premium p-4 rounded-2xl">
        <TrackList />
      </div>

      {showLyrics && <LyricsModal onClose={() => setShowLyrics(false)} />}
    </div>
  );
};

// کامپوننت اصلی
const App = () => {
  return (
    <PlayerProvider>
      <div className="galaxy-bg"></div>
      <div className="stars">
        {[...Array(50)].map((_, i) => (
          <div 
            key={i} 
            className="star" 
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${1 + Math.random() * 3}px`,
              height: `${1 + Math.random() * 3}px`,
              animationDuration: `${2 + Math.random() * 4}s`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: 0.1 + Math.random() * 0.4,
            }}
          ></div>
        ))}
      </div>
      <AppContent />
    </PlayerProvider>
  );
};

export default App;
