// src/components/NowPlaying.jsx
import React from 'react';
import { usePlayer } from '../context/PlayerContext';
import { 
  Play, Pause, SkipForward, SkipBack, 
  Volume2, VolumeX, Shuffle, Repeat, 
  Mic2, Heart, ListMusic, AlertCircle 
} from 'lucide-react';

const NowPlaying = () => {
  const {
    currentTrack, isPlaying, togglePlay, nextTrack, prevTrack,
    progress, duration, volume, setVolume, seekTo, 
    repeat, shuffle, setRepeat, setShuffle,
    setShowLyrics, showLyrics, tracks, error, setError
  } = usePlayer();

  if (!currentTrack) {
    return (
      <div className="glass-premium p-12 rounded-3xl text-center">
        <div className="text-6xl mb-4">🎵</div>
        <h3 className="text-white/40 text-lg">هیچ آهنگی در پلی‌لیست نیست</h3>
        <p className="text-white/20 text-sm mt-2">لطفاً یک فایل M3U8 معتبر بارگذاری کنید</p>
      </div>
    );
  }

  const formatTime = (s) => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <div className="glass-premium p-6 rounded-3xl w-full max-w-5xl mx-auto transition-all duration-500 hover:border-white/15">
      
      {/* نمایش خطا */}
      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
          <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-400 text-sm font-medium">خطا در پخش</p>
            <p className="text-white/60 text-sm">{error.message}</p>
            <p className="text-white/30 text-xs mt-1">آهنگ: {error.track}</p>
            <button 
              onClick={() => setError(null)}
              className="mt-2 text-xs text-white/40 hover:text-white transition underline"
            >
              رد کردن خطا
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row items-center gap-8">
        <div className="relative flex-shrink-0">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-purple-500/20 to-pink-500/20 blur-2xl -z-10"></div>
          <img 
            src={currentTrack.cover} 
            alt={currentTrack.title}
            className="w-40 h-40 lg:w-56 lg:h-56 rounded-2xl shadow-2xl object-cover border border-white/10 pulse-glow"
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentTrack.artist)}&background=7c3aed&color=fff&size=300`;
            }}
          />
          {isPlaying && !error && (
            <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-green-400 border border-green-400/20 flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              زنده
            </div>
          )}
          {error && (
            <div className="absolute bottom-3 right-3 bg-red-500/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-white flex items-center gap-1.5">
              <AlertCircle size={12} />
              خطا
            </div>
          )}
        </div>

        <div className="flex-1 text-center lg:text-left">
          <h2 className="text-2xl lg:text-4xl font-bold bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent leading-tight">
            {currentTrack.title}
          </h2>
          <p className="text-purple-300/80 text-lg font-light mt-1">{currentTrack.artist}</p>
          
          <div className="flex justify-center lg:justify-start gap-1 mt-4">
            {[...Array(8)].map((_, i) => (
              <div 
                key={i} 
                className={`visualizer-bar ${!isPlaying || error ? 'inactive' : ''}`}
                style={{ 
                  height: isPlaying && !error ? `${8 + Math.random() * 20}px` : '6px',
                  animationDelay: `${i * 0.08}s` 
                }}
              ></div>
            ))}
          </div>

          <div className="flex flex-wrap justify-center lg:justify-start gap-2 mt-4">
            <span className="badge">🎵 {tracks.length} آهنگ</span>
            <span className="badge">⏱️ ~{Math.round(tracks.length * 3.5)} دقیقه</span>
            <span className={`badge ${isPlaying && !error ? 'badge-success' : error ? 'bg-red-500/20 text-red-400 border-red-500/20' : ''}`}>
              {error ? '❌ خطا' : isPlaying ? '🔊 در حال پخش' : '⏸ مکث'}
            </span>
            {currentTrack.audioUrl && (
              <span className="badge badge-primary">🎧 قابل پخش</span>
            )}
          </div>
        </div>

        <div className="flex lg:flex-col gap-2">
          <button 
            onClick={() => setShowLyrics(!showLyrics)}
            className={`control-btn ${showLyrics ? 'active' : ''}`}
            title="مشاهده متن آهنگ"
          >
            <Mic2 size={22} />
          </button>
          <button className="control-btn" title="افزودن به علاقه‌مندی‌ها">
            <Heart size={22} />
          </button>
          <button className="control-btn" title="لیست پخش">
            <ListMusic size={22} />
          </button>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center gap-3">
          <span className="text-white/40 text-xs font-mono w-12 text-right">{formatTime(progress)}</span>
          <div className="flex-1 relative">
            <input 
              type="range" 
              min="0" 
              max={duration || 100} 
              value={progress || 0}
              onChange={(e) => seekTo(parseFloat(e.target.value))}
              className="w-full"
              style={{
                background: error 
                  ? 'rgba(255,255,255,0.1)' 
                  : `linear-gradient(to right, #a855f7 0%, #ec4899 ${progressPercent}%, rgba(255,255,255,0.1) ${progressPercent}%, rgba(255,255,255,0.1) 100%)`
              }}
            />
          </div>
          <span className="text-white/40 text-xs font-mono w-12">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setVolume(volume > 0 ? 0 : 0.8)} 
            className="text-white/40 hover:text-white transition"
          >
            {volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-20 lg:w-28"
            style={{
              background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${volume * 100}%, rgba(255,255,255,0.1) ${volume * 100}%, rgba(255,255,255,0.1) 100%)`
            }}
          />
        </div>

        <div className="flex items-center gap-1 lg:gap-3">
          <button 
            onClick={() => setShuffle(!shuffle)} 
            className={`control-btn ${shuffle ? 'active' : ''}`}
            title="پخش تصادفی"
          >
            <Shuffle size={22} />
          </button>
          
          <button onClick={prevTrack} className="control-btn hover:scale-110 transition-transform">
            <SkipBack size={28} />
          </button>
          
          <button 
            onClick={togglePlay} 
            className={`bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-full shadow-2xl shadow-purple-500/30 hover:scale-105 transition-transform duration-200 ${error ? 'opacity-50' : ''}`}
            disabled={!!error}
          >
            {isPlaying && !error ? <Pause size={32} fill="white" color="white" /> : <Play size={32} fill="white" color="white" />}
          </button>
          
          <button onClick={nextTrack} className="control-btn hover:scale-110 transition-transform">
            <SkipForward size={28} />
          </button>
          
          <button 
            onClick={() => setRepeat(!repeat)} 
            className={`control-btn ${repeat ? 'active' : ''}`}
            title="تکرار"
          >
            <Repeat size={22} />
          </button>
        </div>

        <div className="w-20 lg:w-28"></div>
      </div>
    </div>
  );
};

export default NowPlaying;
