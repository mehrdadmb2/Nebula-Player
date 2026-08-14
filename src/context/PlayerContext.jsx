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
  
  const audioRef = useRef(null);

  // 🔥 این useEffect هر بار که initialTracks تغییر کند اجرا می‌شود
  useEffect(() => {
    if (initialTracks.length === 0) return;
    
    const enriched = initialTracks.map(t => ({
      ...t,
      cover: t.cover || generateTrackCover(t.artist, t.title, 300),
      hasFile: true,
    }));
    
    setTracks(enriched);
    setFilteredTracks(enriched);
    console.log('📦 تعداد آهنگ‌های داخل Context (از initialTracks):', enriched.length);
    console.log('📦 نمونه اولین آهنگ در Context:', enriched[0]);
  }, [initialTracks]); // ← وابستگی به initialTracks

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

  const togglePlay = useCallback(() => setIsPlaying(prev => !prev), []);

  const seekTo = useCallback((value) => {
    if (audioRef.current) {
      audioRef.current.audioEl.current.currentTime = value;
      setProgress(value);
    }
  }, []);

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
          onEnded={nextTrack}
          onError={(e) => {
            console.warn('⚠️ خطا در پخش آهنگ:', e);
            // اگر خطا داشت، به آهنگ بعدی برو
            nextTrack();
          }}
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
