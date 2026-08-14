import React, { useEffect } from 'react';
import { PlayerProvider, usePlayer } from './context/PlayerContext';
import { parseM3U } from './utils/parseM3U';
import NowPlaying from './components/NowPlaying';
import TrackList from './components/playlist/TrackList';
import LyricsModal from './components/modals/LyricsModal';
import { generateTrackCover } from './utils/avatarGenerator';

const AppContent = () => {
  const { setTracks, tracks, currentTrack, nextTrack, prevTrack, togglePlay } = usePlayer();

  // لود کردن پلی‌لیست
  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}playlist.m3u8`)
      .then(res => {
        if (!res.ok) throw new Error('فایل پلی‌لیست پیدا نشد');
        return res.text();
      })
      .then(text => {
        const parsed = parseM3U(text);
        const withCovers = parsed.map(t => ({
          ...t,
          cover: generateTrackCover(t.artist, t.title, 200)
        }));
        setTracks(withCovers);
      })
      .catch(err => {
        console.error(err);
        setTracks([]);
      });
  }, [setTracks]);

  // کیبورد شورت‌کات (Space, ArrowRight, ArrowLeft)
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

  return (
    <div className="relative z-10 container mx-auto px-4 py-6 flex flex-col items-center gap-8">
      <header className="text-center flex flex-col items-center gap-2">
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent drop-shadow-2xl">
          🌌 Nebula Player
        </h1>
        <div className="flex flex-wrap justify-center gap-2">
          <span className="px-3 py-1 rounded-full glass text-xs text-white/60">🎵 {tracks.length} Track</span>
          <span className="px-3 py-1 rounded-full glass text-xs text-white/60">⚡ ۱۰۰% آفلاین</span>
          <span className="px-3 py-1 rounded-full glass text-xs text-white/60">⌨️ Space = پلی/مکث</span>
        </div>
      </header>

      <NowPlaying />
      <div className="w-full max-w-4xl glass p-4 rounded-2xl">
        <TrackList />
      </div>
      {currentTrack?.lyrics && <LyricsModal />} {/* در صورت نیاز باز می‌شود */}
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
