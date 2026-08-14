import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import ReactAudioPlayer from 'react-audio-player';

const PlayerContext = createContext();

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) throw new Error('usePlayer must be used within PlayerProvider');
  return context;
};

export const PlayerProvider = ({ children, initialTracks = [] }) => {
  const [tracks, setTracks] = useState(initialTracks);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [showLyrics, setShowLyrics] = useState(false);
  
  const audioRef = useRef(null);
  const currentTrack = tracks[currentTrackIndex] || null;

  // --- کنترل‌های پلیر ---
  const play = useCallback(() => setIsPlaying(true), []);
  const pause = useCallback(() => setIsPlaying(false), []);
  const togglePlay = useCallback(() => setIsPlaying(prev => !prev), []);

  const nextTrack = useCallback(() => {
    if (tracks.length === 0) return;
    setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
    setProgress(0);
    setIsPlaying(true);
  }, [tracks]);

  const prevTrack = useCallback(() => {
    if (tracks.length === 0) return;
    setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
    setProgress(0);
    setIsPlaying(true);
  }, [tracks]);

  const seekTo = useCallback((value) => {
    if (audioRef.current) {
      audioRef.current.audioEl.current.currentTime = value;
      setProgress(value);
    }
  }, []);

  // --- Event handlers برای پلیر ---
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.audioEl.current.duration || 0);
    }
  };

  const handleProgress = () => {
    if (audioRef.current) {
      const current = audioRef.current.audioEl.current.currentTime || 0;
      setProgress(current);
    }
  };

  // اگر آهنگ تمام شد، برو به بعدی
  const handleEnded = () => {
    nextTrack();
  };

  // خطای پخش (مثلاً فایل پیدا نشد) -> برو بعدی
  const handleError = (e) => {
    console.warn('Audio error, skipping to next:', e);
    nextTrack();
  };

  // --- ذخیره وضعیت در LocalStorage برای ادامه بعد از رفرش ---
  useEffect(() => {
    const saved = localStorage.getItem('nebula_player_state');
    if (saved) {
      try {
        const { index, progress: savedProgress, volume: savedVolume } = JSON.parse(saved);
        setCurrentTrackIndex(index || 0);
        setProgress(savedProgress || 0);
        setVolume(savedVolume || 0.8);
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('nebula_player_state', JSON.stringify({
      index: currentTrackIndex,
      progress,
      volume,
    }));
  }, [currentTrackIndex, progress, volume]);

  const value = {
    tracks,
    setTracks,
    currentTrack,
    currentTrackIndex,
    setCurrentTrackIndex,
    isPlaying,
    play,
    pause,
    togglePlay,
    nextTrack,
    prevTrack,
    progress,
    duration,
    volume,
    setVolume,
    seekTo,
    showLyrics,
    setShowLyrics,
    audioRef,
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
      {/* پلیر مخفی که در پس‌زمینه کار می‌کند */}
      {currentTrack && (
        <ReactAudioPlayer
          ref={audioRef}
          src={currentTrack.audioUrl}
          autoPlay={isPlaying}
          volume={volume}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={handleEnded}
          onError={handleError}
          onLoadedMetadata={handleLoadedMetadata}
          onListen={handleProgress}
          listenInterval={200}
          style={{ display: 'none' }}
        />
      )}
    </PlayerContext.Provider>
  );
};
