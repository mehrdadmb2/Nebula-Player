// src/App.jsx
import React, { useEffect } from 'react';
import { PlayerProvider, usePlayer } from './context/PlayerContext';
import { parseM3U } from './utils/parseM3U';
import { generateTrackCover } from './utils/avatarGenerator';
import NowPlaying from './components/NowPlaying';
import TrackList from './components/playlist/TrackList';
import LyricsModal from './components/modals/LyricsModal';

const AppContent = () => {
  const { setTracks, tracks, currentTrack, nextTrack, prevTrack, togglePlay, setShowLyrics, showLyrics } = usePlayer();

  // بارگذاری پلی‌لیست
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
        
        const withCovers = parsed.map(t => ({
          ...t,
          cover: generateTrackCover(t.artist, t.title, 300),
          hasFile: false,
          metadata: null,
          audioUrl: null,
        }));
        
        console.log('✅ تعداد آهنگ‌های ارسالی به PlayerContext:', withCovers.length);
        setTracks(withCovers);
      } catch (err) {
        console.error('❌ خطای بارگذاری پلی‌لیست:', err);
        setTracks([]);
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

  // بررسی تعداد آهنگ‌های دارای فایل
  const filesCount = tracks.filter(t => t.hasFile).length;

  return (
    <div className="relative z-10 container mx-auto px-4 py-6 flex flex-col items-center gap-8 min-h-screen">
      
      {/* هدر با بج‌های جدید */}
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
            <span className="badge">📁 {filesCount} فایل آپلود شده</span>
            <span className="badge">⚡ ۱۰۰% آفلاین</span>
            <span className="badge">⌨️ Space = پلی/مکث</span>
            {currentTrack && (
              <span className="badge badge-primary">🎧 {currentTrack.title}</span>
            )}
            <span className="badge text-xs text-white/30 border-dashed">
              📤 برای پخش، روی آیکون آپلود کلیک کنید
            </span>
          </div>
          
          {/* راهنمای آپلود */}
          <div className="glass-premium p-4 rounded-2xl max-w-2xl text-center border border-white/5">
            <p className="text-white/40 text-sm">
              💡 <span className="text-white/60">نحوه‌ی آپلود:</span> 
              روی آیکون <UploadIcon /> کنار هر آهنگ کلیک کنید یا فایل صوتی را روی آن بکشید.
              <br />
              <span className="text-white/25 text-xs">پشتیبانی از MP3, FLAC, WAV, M4A, AAC, OGG (حداکثر ۵۰MB)</span>
            </p>
          </div>
        </div>
      </header>

      {/* پلیر اصلی */}
      <NowPlaying />

      {/* لیست آهنگ‌ها */}
      <div className="w-full max-w-4xl glass-premium p-4 rounded-2xl">
        <TrackList />
      </div>

      {/* مودال لیریکس */}
      {showLyrics && <LyricsModal onClose={() => setShowLyrics(false)} />}
    </div>
  );
};

// آیکون کوچک برای راهنما
const UploadIcon = () => (
  <svg className="inline-block w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

const App = () => {
  return (
    <PlayerProvider>
      {/* پس‌زمینه کهکشانی */}
      <div className="galaxy-bg"></div>
      {/* ستاره‌ها */}
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
