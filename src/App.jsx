import React, { useEffect } from 'react';
import { PlayerProvider, usePlayer } from './context/PlayerContext';
import { parseM3U } from './utils/parseM3U';
import { generateTrackCover } from './utils/avatarGenerator';
import NowPlaying from './components/NowPlaying';
import TrackList from './components/playlist/TrackList';

// کامپوننت داخلی برای بارگذاری و مدیریت داده
const AppContent = () => {
  const { setTracks, tracks } = usePlayer();

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
        console.log('📄 محتوای فایل (۱۰۰ کاراکتر اول):', text.substring(0, 100));

        const parsed = parseM3U(text);
        console.log('🎵 تعداد آهنگ‌های پارس شده:', parsed.length);

        const withCovers = parsed.map((t) => ({
          ...t,
          cover: t.cover || generateTrackCover(t.artist, t.title, 200),
        }));

        console.log('✅ تعداد آهنگ‌های ارسالی به PlayerContext:', withCovers.length);
        console.log('✅ نمونه اولین آهنگ:', withCovers[0]);

        setTracks(withCovers);
      } catch (err) {
        console.error('❌ خطای بارگذاری پلی‌لیست:', err);
        setTracks([]);
      }
    };

    loadPlaylist();
  }, [setTracks]);

  // دیباگ: نمایش تعداد آهنگ‌های داخل Context
  useEffect(() => {
    console.log('📦 تعداد آهنگ‌های داخل Context (در AppContent):', tracks.length);
  }, [tracks]);

  return (
    <div className="relative z-10 container mx-auto px-4 py-6 flex flex-col items-center gap-8">
      <header className="text-center flex flex-col items-center gap-2">
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent drop-shadow-2xl">
          🌌 Nebula Player
        </h1>
        <div className="flex flex-wrap justify-center gap-2">
          <span className="px-3 py-1 rounded-full glass text-xs text-white/60">
            🎵 {tracks.length} Track
          </span>
          <span className="px-3 py-1 rounded-full glass text-xs text-white/60">
            ⚡ ۱۰۰% آفلاین
          </span>
          <span className="px-3 py-1 rounded-full glass text-xs text-white/60">
            ⌨️ Space = پلی/مکث
          </span>
        </div>
      </header>

      <NowPlaying />
      <div className="w-full max-w-4xl glass p-4 rounded-2xl">
        <TrackList />
      </div>
    </div>
  );
};

const App = () => {
  return (
    <PlayerProvider>
      <div className="animated-bg"></div>
      <AppContent />
    </PlayerProvider>
  );
};

export default App;
