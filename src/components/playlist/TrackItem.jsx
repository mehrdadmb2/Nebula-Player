// src/components/playlist/TrackItem.jsx
import React from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { Play, Pause, CheckCircle, AlertCircle } from 'lucide-react';

const TrackItem = ({ track, index }) => {
  const { currentTrack, playTrack, isPlaying, searchQuery, error } = usePlayer();
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

  const hasFile = track.audioUrl && !error;

  return (
    <div 
      className={`track-item ${isActive ? 'active' : ''}`}
      onClick={() => hasFile && playTrack(index)}
      style={{ cursor: hasFile ? 'pointer' : 'default' }}
    >
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

      <img 
        src={track.cover} 
        alt={track.title}
        className="w-10 h-10 rounded-lg object-cover shadow-md flex-shrink-0"
        onError={(e) => {
          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(track.artist)}&background=3b0764&color=fff&size=50`;
        }}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={`text-sm font-medium truncate ${isActive ? 'text-purple-300' : 'text-white/80'}`}>
            {highlightText(track.title, searchQuery)}
          </p>
          {track.audioUrl ? (
            <CheckCircle size={12} className="text-green-400 flex-shrink-0" title="فایل موجود است" />
          ) : (
            <AlertCircle size={12} className="text-yellow-500/50 flex-shrink-0" title="فایل موجود نیست" />
          )}
        </div>
        <p className="text-xs text-white/40 truncate">{highlightText(track.artist, searchQuery)}</p>
      </div>

      <button 
        className={`text-white/20 hover:text-white transition p-1.5 rounded-full hover:bg-white/5 ${!track.audioUrl ? 'opacity-30 cursor-not-allowed' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          if (track.audioUrl) playTrack(index);
        }}
        disabled={!track.audioUrl}
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
