import React from 'react';
import { usePlayer } from '../context/PlayerContext';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Shuffle, Repeat, Mic2 } from 'lucide-react';

const NowPlaying = () => {
  const {
    currentTrack, isPlaying, togglePlay, nextTrack, prevTrack,
    progress, duration, volume, setVolume, seekTo, repeat, shuffle, setRepeat, setShuffle,
    setSearchQuery, setCurrentIndex, tracks
  } = usePlayer();

  if (!currentTrack) {
    return <div className="glass p-8 text-white/50 text-center rounded-3xl">🎧 لیست پخش خالی است</div>;
  }

  const formatTime = (s) => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="glass p-6 rounded-3xl w-full max-w-4xl mx-auto transition-all duration-500 hover:border-white/15">
      {/* بخش اطلاعات و کاور */}
      <div className="flex flex-col md:flex-row items-center gap-6">
        <img 
          src={currentTrack.cover} 
          alt={currentTrack.title}
          className="w-32 h-32 md:w-40 md:h-40 rounded-2xl shadow-2xl object-cover border border-white/10"
        />
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">
            {currentTrack.title}
          </h2>
          <p className="text-purple-300/80 text-lg font-light">{currentTrack.artist}</p>
          <div className="flex justify-center md:justify-start gap-1 mt-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`visualizer-bar ${isPlaying ? 'opacity-100' : 'opacity-20'}`} style={{height: `${10 + Math.random() * 25}px`}}></div>
            ))}
          </div>
        </div>
        <button 
          onClick={() => setSearchQuery(prev => prev ? '' : '')} 
          className="p-3 rounded-full glass glass-hover text-white/70 hover:text-white"
          title="جستجو در لیست"
        >
          <Mic2 size={22} />
        </button>
      </div>

      {/* نوار پیشرفت */}
      <div className="mt-4 flex items-center gap-3">
        <span className="text-white/40 text-sm font-mono w-12">{formatTime(progress)}</span>
        <input 
          type="range" min="0" max={duration || 100} value={progress || 0}
          onChange={(e) => seekTo(parseFloat(e.target.value))}
          className="flex-1 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-purple-500 [&::-webkit-slider-thumb]:to-pink-500"
        />
        <span className="text-white/40 text-sm font-mono w-12">{formatTime(duration)}</span>
      </div>

      {/* کنترل‌ها */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <button onClick={() => setVolume(volume > 0 ? 0 : 0.8)} className="text-white/50 hover:text-white transition">
            {volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <input type="range" min="0" max="1" step="0.01" value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-20 accent-purple-500 bg-white/10 rounded-full h-1"
          />
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShuffle(!shuffle)} 
            className={`p-2 rounded-full transition ${shuffle ? 'text-purple-400 bg-purple-500/20' : 'text-white/40 hover:text-white'}`}
          >
            <Shuffle size={22} />
          </button>
          <button onClick={prevTrack} className="text-white/60 hover:text-white transition p-2">
            <SkipBack size={28} />
          </button>
          <button onClick={togglePlay} className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-full shadow-2xl shadow-purple-500/30 hover:scale-105 transition-transform">
            {isPlaying ? <Pause size={32} fill="white" color="white" /> : <Play size={32} fill="white" color="white" />}
          </button>
          <button onClick={nextTrack} className="text-white/60 hover:text-white transition p-2">
            <SkipForward size={28} />
          </button>
          <button 
            onClick={() => setRepeat(!repeat)} 
            className={`p-2 rounded-full transition ${repeat ? 'text-purple-400 bg-purple-500/20' : 'text-white/40 hover:text-white'}`}
          >
            <Repeat size={22} />
          </button>
        </div>
        <div className="w-16"></div>
      </div>

      {/* Badge های داینامیک */}
      <div className="flex flex-wrap justify-center gap-3 mt-5 pt-4 border-t border-white/5">
        <span className="px-3 py-1 rounded-full glass text-xs text-white/60">🎵 {tracks.length} آهنگ</span>
        <span className="px-3 py-1 rounded-full glass text-xs text-white/60">⏱️ ~{Math.round(tracks.length * 3.5)} دقیقه</span>
        <span className={`px-3 py-1 rounded-full glass text-xs ${isPlaying ? 'text-green-400 animate-pulse' : 'text-white/40'}`}>
          {isPlaying ? '🔊 در حال پخش' : '⏸ مکث'}
        </span>
      </div>
    </div>
  );
};

export default NowPlaying;
