import React from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { PlayCircle } from 'lucide-react';

const TrackItem = ({ track, index }) => {
  const { currentTrack, playTrack, isPlaying, searchQuery } = usePlayer();
  const isActive = currentTrack?.id === track.id;

  console.log(`🟣 رندر آیتم ${index}:`, track.title);

  const highlightText = (text, query) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((p, i) =>
      p.toLowerCase() === query.toLowerCase() ? (
        <span key={i} className="bg-purple-500/30 px-0.5 rounded">
          {p}
        </span>
      ) : (
        p
      )
    );
  };

  return (
    <div
      className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all duration-300 ${
        isActive
          ? 'bg-purple-600/20 border border-purple-500/30 shadow-lg shadow-purple-500/10'
          : 'hover:bg-white/5'
      }`}
      onClick={() => playTrack(index)}
    >
      <img
        src={track.cover}
        alt={track.title}
        className="w-12 h-12 rounded-lg object-cover shadow-md"
        onError={(e) => {
          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
            track.artist
          )}&background=3b0764&color=fff&size=50`;
        }}
      />
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium truncate ${
            isActive ? 'text-purple-300' : 'text-white/80'
          }`}
        >
          {highlightText(track.title, searchQuery)}
        </p>
        <p className="text-xs text-white/40 truncate">
          {highlightText(track.artist, searchQuery)}
        </p>
      </div>
      <div className="text-white/30 flex items-center gap-2">
        {isActive && isPlaying ? (
          <div className="flex gap-0.5 items-end h-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="visualizer-bar"
                style={{ height: `${8 + i * 4}px` }}
              ></div>
            ))}
          </div>
        ) : (
          <PlayCircle size={18} />
        )}
      </div>
    </div>
  );
};

export default TrackItem;
