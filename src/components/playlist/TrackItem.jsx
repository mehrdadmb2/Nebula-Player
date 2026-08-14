import React from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { Play, Pause } from 'lucide-react';

const TrackItem = ({ track, index }) => {
  const { currentTrack, playTrack, isPlaying, searchQuery } = usePlayer();
  const isActive = currentTrack?.id === track.id;

  const highlightText = (text, query) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((p, i) => 
      p.toLowerCase() === query.toLowerCase() 
        ? <span key={i} className="bg-purple-500/30 px-0.5 rounded text-purple-200">{p}</span> 
        : p
    );
  };

  return (
    <div 
      className={`track-item ${isActive ? 'active' : ''}`}
      onClick={() => playTrack(index)}
    >
      {/* شماره یا نشانگر پخش */}
      <div className="track-number">
        {isActive && isPlaying ? (
          <div className="flex gap-0.5 items-end h-4">
            {[...Array(4)].map((_, i) => (
              <div 
                key={i} 
                className="w-0.5 bg-purple-400 rounded-full"
                style={{ 
                  height: `${6 + i * 3}px`,
                  animation: 'visualize 0.5s ease-in-out infinite alternate',
                  animationDelay: `${i * 0.1}s`
                }}
              ></div>
            ))}
          </div>
        ) : (
          <span className="text-white/20 text-xs">{index + 1}</span>
        )}
      </div>

      {/* کاور کوچک */}
      <img 
        src={track.cover} 
        alt={track.title}
        className="w-10 h-10 rounded-lg object-cover shadow-md flex-shrink-0"
        onError={(e) => {
          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(track.artist)}&background=3b0764&color=fff&size=50`;
        }}
      />

      {/* اطلاعات */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isActive ? 'text-purple-300' : 'text-white/80'}`}>
          {highlightText(track.title, searchQuery)}
        </p>
        <p className="text-xs text-white/40 truncate">{highlightText(track.artist, searchQuery)}</p>
      </div>

      {/* دکمه پلی سریع */}
      <button 
        className="text-white/20 hover:text-white transition p-1"
        onClick={(e) => {
          e.stopPropagation();
          playTrack(index);
        }}
      >
        {isActive && isPlaying ? (
          <Pause size={16} className="text-purple-400" />
        ) : (
          <Play size={16} />
        )}
      </button>
    </div>
  );
};

export default TrackItem;
