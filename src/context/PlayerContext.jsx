// src/context/PlayerContext.jsx
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import ReactAudioPlayer from 'react-audio-player';
import { generateTrackCover } from '../utils/avatarGenerator';
import { getAudioFile, hasAudioFile, getAllAudioFiles, saveAudioFile, deleteAudioFile } from '../utils/fileStorage';
import { readAudioMetadata, createAudioUrl, revokeAudioUrl } from '../utils/metadataReader';

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
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  
  const audioRef = useRef(null);
  const currentAudioUrl = useRef(null);

  // بارگذاری فایل‌های ذخیره شده از IndexedDB
  useEffect(() => {
    const loadSavedFiles = async () => {
      try {
        const files = await getAllAudioFiles();
        const fileMap = {};
        files.forEach(item => {
          fileMap[item.trackId] = item;
        });
        setUploadedFiles(fileMap);
        console.log('📁 فایل‌های ذخیره شده:', Object.keys(fileMap).length);
      } catch (error) {
        console.warn('⚠️ خطا در بارگذاری فایل‌ها:', error);
      }
    };
    loadSavedFiles();
  }, []);

  // وقتی ترک‌ها تغییر می‌کنند، کاور تولید کن و وضعیت فایل‌ها را بررسی کن
  useEffect(() => {
    const enriched = initialTracks.map(t => ({
      ...t,
      cover: t.cover || generateTrackCover(t.artist, t.title, 300),
      hasFile: uploadedFiles[t.id] ? true : false,
      metadata: uploadedFiles[t.id]?.metadata || null,
    }));
    setTracks(enriched);
    setFilteredTracks(enriched);
    console.log('📦 تعداد آهنگ‌های داخل Context:', enriched.length);
    console.log('📦 تعداد فایل‌های آپلود شده:', Object.keys(uploadedFiles).length);
  }, [initialTracks, uploadedFiles]);

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

  // آپلود فایل برای یک آهنگ
  const uploadFileForTrack = async (trackId, file) => {
    setIsUploading(true);
    try {
      // خواندن متادیتا
      const metadata = await readAudioMetadata(file);
      
      // ذخیره در IndexedDB
      await saveAudioFile(trackId, file, metadata);
      
      // ایجاد URL برای پخش
      const audioUrl = createAudioUrl(file);
      
      // به‌روزرسانی state
      setUploadedFiles(prev => ({
        ...prev,
        [trackId]: { file, metadata, audioUrl }
      }));
      
      // به‌روزرسانی ترک
      setTracks(prev => prev.map(t => 
        t.id === trackId 
          ? { 
              ...t, 
              hasFile: true, 
              metadata: metadata,
              audioUrl: audioUrl,
              // اگر متادیتا اطلاعات بهتری دارد، جایگزین کن
              title: metadata.title || t.title,
              artist: metadata.artist || t.artist,
              album: metadata.album || t.album,
              cover: metadata.cover || t.cover,
              duration: metadata.duration || t.duration,
            }
          : t
      ));
      
      console.log('✅ فایل با موفقیت آپلود شد:', file.name);
      return { success: true, metadata };
    } catch (error) {
      console.error('❌ خطا در آپلود فایل:', error);
      return { success: false, error: error.message };
    } finally {
      setIsUploading(false);
    }
  };

  // حذف فایل آپلود شده
  const removeFileFromTrack = async (trackId) => {
    try {
      // آزادسازی URL
      if (uploadedFiles[trackId]?.audioUrl) {
        revokeAudioUrl(uploadedFiles[trackId].audioUrl);
      }
      
      await deleteAudioFile(trackId);
      
      setUploadedFiles(prev => {
        const newFiles = { ...prev };
        delete newFiles[trackId];
        return newFiles;
      });
      
      setTracks(prev => prev.map(t => 
        t.id === trackId 
          ? { ...t, hasFile: false, audioUrl: null, metadata: null }
          : t
      ));
      
      console.log('🗑️ فایل حذف شد');
    } catch (error) {
      console.error('❌ خطا در حذف فایل:', error);
    }
  };

  // پخش آهنگ با فایل آپلود شده
  const playTrack = useCallback((index) => {
    if (index < 0 || index >= tracks.length) return;
    const track = tracks[index];
    
    // اگر فایل ندارد، پیام بده
    if (!track.hasFile) {
      console.warn('⚠️ این آهنگ فایل ندارد، لطفاً فایل را آپلود کنید');
      // می‌توانید یک اعلان به کاربر نمایش دهید
      return;
    }
    
    setCurrentIndex(index);
    setProgress(0);
    setIsPlaying(true);
    console.log('▶️ پخش آهنگ:', track.title);
  }, [tracks]);

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
    if (!currentTrack?.hasFile) {
      // اگر آهنگ فعلی فایل ندارد، اولین آهنگی که فایل دارد را پیدا کن
      const firstWithFile = tracks.findIndex(t => t.hasFile);
      if (firstWithFile !== -1) {
        playTrack(firstWithFile);
      } else {
        console.warn('⚠️ هیچ آهنگی فایل ندارد');
        return;
      }
    }
    setIsPlaying(prev => !prev);
  }, [currentTrack, tracks, playTrack]);

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
    uploadedFiles,
    isUploading,
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
    uploadFileForTrack,
    removeFileFromTrack,
    audioRef,
    setProgress,
    setDuration,
    setIsPlaying,
    setCurrentIndex,
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
      {currentTrack && currentTrack.hasFile && currentTrack.audioUrl && (
        <ReactAudioPlayer
          ref={audioRef}
          src={currentTrack.audioUrl}
          autoPlay={isPlaying}
          volume={volume}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={nextTrack}
          onError={(e) => {
            console.warn('⚠️ خطا در پخش آهنگ، رفتن به بعدی:', e);
            nextTrack();
          }}
          onLoadedMetadata={() => {
            if (audioRef.current) {
              const dur = audioRef.current.audioEl.current.duration || 0;
              setDuration(dur);
              // اگر duration از متادیتا گرفته نشده، اینجا ست کن
              if (currentTrack.duration === 0) {
                setTracks(prev => prev.map(t => 
                  t.id === currentTrack.id ? { ...t, duration: dur } : t
                ));
              }
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
