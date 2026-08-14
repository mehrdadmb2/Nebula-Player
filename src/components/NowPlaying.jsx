import React from 'react';
import { usePlayer } from '../context/PlayerContext';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Mic2 } from 'lucide-react';

const NowPlaying = () => {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    nextTrack,
    prevTrack,
    progress,
    duration,
    volume,
    setVolume,
    seekTo,
    setShowLyrics,
    showLyrics,
  } = usePlayer();

  if (!currentTrack) {
    return <div className="glass p-6 text-white/60 text-center">هیچ آهنگی در لیست پخش نیست</div>;
  }

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const handleVolumeChange = (e) => setVolume(parseFloat(e.target.value));
  const handleSeekChange = (e) => seekTo(parseFloat(e.target.value));

  const coverUrl = currentTrack.cover || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentTrack.artist)}&background=7c3aed&color=fff&size=200`;

  return (
    <div className="glass p-6 rounded-3xl w-full max-w-4xl mx-auto transition-all duration-500 hover:border-white/20">
      
      {/* بخش بالا: کاور و اطلاعات */}
      <div className="flex flex-col md:flex-row items-center gap-6">
        <img 
          src={coverUrl} 
          alt={currentTrack.title}
          className="w-32 h-32 md:w-40 md:h-40 rounded-2xl shadow-2xl object-cover border border-white/10 pulse-glow"
          onError={(e) => e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentTrack.artist)}&background=7c3aed&color=fff&size=200`}
        />
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg truncate max-w-xs md:max-w-md">
            {currentTrack.title}
          </h2>
          <p className="text-purple-300/80 text-lg font-light">{currentTrack.artist}</p>
          {currentTrack.album && <p className="text-white/40 text-sm">{currentTrack.album}</p>}
        </div>
        <button 
          onClick={() => setShowLyrics(!showLyrics)}
          className="p-3 rounded-full glass glass-hover text-white/70 hover:text-white transition"
          title="مشاهده متن آهنگ"
        >
          <Mic2 size={24} />
        </button>
      </div>

      {/* نوار پیشرفت */}
      <div className="mt-4 flex items-center gap-3">
        <span className="text-white/50 text-sm font-mono w-12">{formatTime(progress)}</span>
        <input 
          type="range" 
          min="0" 
          max={duration || 100} 
          value={progress || 0}
          onChange={handleSeekChange}
          className="flex-1 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-purple-500 [&::-webkit-slider-thumb]:to-pink-500"
        />
        <span className="text-white/50 text-sm font-mono w-12">{formatTime(duration)}</span>
      </div>

      {/* دکمه‌ها و صدا */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <button onClick={() => setVolume(volume > 0 ? 0 : 0.8)} className="text-white/60 hover:text-white transition">
            {volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            value={volume}
            onChange={handleVolumeChange}
            className="w-20 accent-purple-500 bg-white/10 rounded-full h-1"
          />
        </div>

        <div className="flex items-center gap-4">
          <button onClick={prevTrack} className="text-white/60 hover:text-white transition p-2">
            <SkipBack size={28} />
          </button>
          <button 
            onClick={togglePlay} 
            className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-full shadow-2xl shadow-purple-500/30 hover:scale-105 transition-transform"
          >
            {isPlaying ? <Pause size={32} fill="white" color="white" /> : <Play size={32} fill="white" color="white" />}
          </button>
          <button onClick={nextTrack} className="text-white/60 hover:text-white transition p-2">
            <SkipForward size={28} />
          </button>
        </div>
        <div className="w-20"></div> {/* Spacer */}
      </div>
    </div>
  );
};

export default NowPlaying;
