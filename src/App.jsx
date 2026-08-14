import React, { useEffect, useState } from 'react';
import { PlayerProvider, usePlayer } from './context/PlayerContext';
import { parseM3U } from './utils/parseM3U';
import { getSpotifyToken, searchTrack } from './api/spotify';
import NowPlaying from './components/NowPlaying';
import TrackList from './components/playlist/TrackList';
import LyricsModal from './components/modals/LyricsModal';

// کامپوننت داخلی برای واکشی اطلاعات
const AppContent = () => {
  const { tracks, setTracks, currentTrack, setShowLyrics, showLyrics } = usePlayer();
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(null);

  // مرحله 1: واکشی فایل لیست و پارس کردن
  useEffect(() => {
    const loadPlaylist = async () => {
      try {
        const response = await fetch('/playlist.m3u8');
        if (!response.ok) throw new Error('Playlist file not found');
        const text = await response.text();
        const parsedTracks = parseM3U(text);
        setTracks(parsedTracks);
      } catch (error) {
        console.error('Failed to load playlist:', error);
        setTracks([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadPlaylist();
  }, [setTracks]);

  // مرحله 2: گرفتن توکن اسپاتیفای
  useEffect(() => {
    getSpotifyToken().then(t => setToken(t));
  }, []);

  // مرحله 3: برای هر آهنگ، اطلاعات کاور را دریافت کن (اما فقط یک بار)
  useEffect(() => {
    if (tracks.length === 0 || !token) return;

    const fetchCovers = async () => {
      const updatedTracks = await Promise.all(
        tracks.map(async (track) => {
          // اگر قبلاً کاور داشت یا در حال دریافت است، رد کن
          if (track.cover) return track;
          
          const result = await searchTrack(track.artist, track.title, token);
          if (result) {
            return { ...track, ...result };
          }
          return track;
        })
      );
      setTracks(updatedTracks);
    };

    fetchCovers();
  }, [tracks.length, token]); // فقط وقتی لیست یا توکن عوض شد اجرا کن

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="relative z-10 container mx-auto px-4 py-8 flex flex-col items-center gap-8">
      <header className="text-center">
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent drop-shadow-2xl">
          🌌 Nebula Player
        </h1>
        <p className="text-white/40 mt-2">{tracks.length} آهنگ در پلی‌لیست</p>
      </header>

      <NowPlaying />
      
      <div className="w-full max-w-4xl glass p-4 rounded-2xl">
        <TrackList tracks={tracks} />
      </div>

      {showLyrics && <LyricsModal />}
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
