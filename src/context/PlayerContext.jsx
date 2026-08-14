// src/context/PlayerContext.jsx
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import ReactAudioPlayer from 'react-audio-player';
import { generateTrackCover } from '../utils/avatarGenerator';

const PlayerContext = createContext();

export const usePlayer = () => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
};

export const PlayerProvider = ({ children, initialTracks = [] }) => {
  const [tracks, setTracks] = useState([]);
  const [filteredTracks, setFilteredTracks] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [repeat, setRepeat] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLyrics, setShowLyrics] = useState(false);
  const [error, setError] = useState(null); // ← برای نمایش خطا
  
  const audioRef = useRef(null);

  useEffect(() => {
    if (initialTracks.length === 0) return;
    
    const enriched = initialTracks.map(t => ({
      ...t,
      cover: t.cover || generateTrackCover(t.artist, t.title, 300),
      hasFile: true,
    }));
    
    setTracks(enriched);
    setFilteredTracks(enriched);
    console.log('📦 تعداد آهنگ‌های داخل Context:', enriched.length);
  }, [initialTracks]);

  // فیلتر جستجو
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredTracks(tracks);
      return;
    }
    const q = searchQuery.toLowerCase();
    const filtered = tracks.filter(t => 
      t.title.toLowerCase().includes(q) || 
      t.artist.toLowerCase().includes(q)
    );
    setFilteredTracks(filtered);
  }, [searchQuery, tracks]);

  const currentTrack = tracks[currentIndex] || null;

  const getNextIndex = useCallback(() => {
    if (shuffle) {
      let randomIdx;
      do {
        randomIdx = Math.floor(Math.random() * tracks.length);
      } while (tracks.length > 1 && randomIdx === currentIndex);
      return randomIdx;
    }
    return (currentIndex + 1) % tracks.length;
  }, [shuffle, currentIndex, tracks.length]);

  const playTrack = useCallback((index) => {
    if (index < 0 || index >= tracks.length) return;
    setError(null); // پاک کردن خطا
    setCurrentIndex(index);
    setProgress(0);
    setIsPlaying(true);
    console.log('▶️ پخش آهنگ:', tracks[index]?.title);
  }, [tracks]);

  const nextTrack = useCallback(() => {
    if (tracks.length === 0) return;
    if (repeat) {
      playTrack(currentIndex);
      return;
    }
    const nextIdx = getNextIndex();
    playTrack(nextIdx);
  }, [repeat, currentIndex, getNextIndex, playTrack, tracks.length]);

  const prevTrack = useCallback(() => {
    if (tracks.length === 0) return;
    if (progress > 3) {
      setProgress(0);
      if (audioRef.current) audioRef.current.audioEl.current.currentTime = 0;
      return;
    }
    const prevIdx = (currentIndex - 1 + tracks.length) % tracks.length;
    playTrack(prevIdx);
  }, [currentIndex, progress, tracks.length, playTrack]);

  const togglePlay = useCallback(() => {
    if (!currentTrack) return;
    // اگر خطا داشت، ریست کن
    if (error) {
      setError(null);
      playTrack(currentIndex);
      return;
    }
    setIsPlaying(prev => !prev);
  }, [currentTrack, error, currentIndex, playTrack]);

  const seekTo = useCallback((value) => {
    if (audioRef.current) {
      audioRef.current.audioEl.current.currentTime = value;
      setProgress(value);
    }
  }, []);

  // مدیریت خطای پخش
  const handleAudioError = useCallback((e) => {
    console.warn('⚠️ خطا در پخش آهنگ:', e);
    setError({
      message: 'فایل صوتی یافت نشد. لطفاً فایل را در پوشه‌ی /music/ قرار دهید.',
      track: currentTrack?.title
    });
    setIsPlaying(false);
    // 🔥 به جای رفتن به آهنگ بعدی، متوقف می‌شویم
  }, [currentTrack]);

  // ذخیره در لوکال استوریج
  useEffect(() => {
    const saved = localStorage.getItem('nebula_state');
    if (saved) {
      try {
        const { index, progress: p, volume: v } = JSON.parse(saved);
        setCurrentIndex(index || 0);
        setProgress(p || 0);
        setVolume(v || 0.8);
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('nebula_state', JSON.stringify({
      index: currentIndex,
      progress,
      volume,
    }));
  }, [currentIndex, progress, volume]);

  const value = {
    tracks,
    filteredTracks,
    setTracks,
    currentTrack,
    currentIndex,
    isPlaying,
    progress,
    duration,
    volume,
    repeat,
    shuffle,
    searchQuery,
    showLyrics,
    error,
    setError,
    setShowLyrics,
    setSearchQuery,
    togglePlay,
    nextTrack,
    prevTrack,
    seekTo,
    setVolume,
    setRepeat,
    setShuffle,
    playTrack,
    audioRef,
    setProgress,
    setDuration,
    setIsPlaying,
    setCurrentIndex,
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
      {currentTrack && currentTrack.audioUrl && (
        <ReactAudioPlayer
          ref={audioRef}
          src={currentTrack.audioUrl}
          autoPlay={isPlaying}
          volume={volume}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => {
            // اگر خطایی نبود، برو به بعدی
            if (!error) {
              nextTrack();
            }
          }}
          onError={handleAudioError}
          onLoadedMetadata={() => {
            if (audioRef.current) {
              setDuration(audioRef.current.audioEl.current.duration || 0);
            }
          }}
          onListen={() => {
            if (audioRef.current) {
              setProgress(audioRef.current.audioEl.current.currentTime || 0);
            }
          }}
          listenInterval={200}
          style={{ display: 'none' }}
        />
      )}
    </PlayerContext.Provider>
  );
};
