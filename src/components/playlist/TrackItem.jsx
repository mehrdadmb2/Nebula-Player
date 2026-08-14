// src/components/playlist/TrackItem.jsx
import React from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { Play, Pause, Music2, FileAudio, AlertCircle } from 'lucide-react';
import UploadButton from '../UploadButton';

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

  // نمایش اطلاعات متادیتا اگر موجود باشد
  const hasMetadata = track.metadata && track.metadata.artist !== 'Unknown Artist';
  const displayArtist = hasMetadata ? track.metadata.artist : track.artist;
  const displayTitle = hasMetadata ? track.metadata.title : track.title;
  const displayAlbum = track.metadata?.album || track.album || '';
  const displayYear = track.metadata?.year || '';

  return (
    <div 
      className={`track-item ${isActive ? 'active' : ''} ${!track.hasFile ? 'opacity-70' : ''}`}
      onClick={() => track.hasFile && playTrack(index)}
      style={{ cursor: track.hasFile ? 'pointer' : 'default' }}
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
        <div className="flex items-center gap-2">
          <p className={`text-sm font-medium truncate ${isActive ? 'text-purple-300' : 'text-white/80'}`}>
            {highlightText(displayTitle, searchQuery)}
          </p>
          {/* نشانگر فایل */}
          {track.hasFile ? (
            <FileAudio size={12} className="text-green-400 flex-shrink-0" />
          ) : (
            <AlertCircle size={12} className="text-yellow-500/50 flex-shrink-0" title="فایل آپلود نشده" />
          )}
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-white/40 truncate">{highlightText(displayArtist, searchQuery)}</span>
          {displayAlbum && (
            <>
              <span className="text-white/20">•</span>
              <span className="text-white/30 truncate">{displayAlbum}</span>
            </>
          )}
          {displayYear && (
            <>
              <span className="text-white/20">•</span>
              <span className="text-white/30">{displayYear}</span>
            </>
          )}
          {track.metadata?.duration > 0 && (
            <>
              <span className="text-white/20">•</span>
              <span className="text-white/30">{Math.floor(track.metadata.duration / 60)}:{String(Math.floor(track.metadata.duration % 60)).padStart(2, '0')}</span>
            </>
          )}
          {track.metadata?.bitrate > 0 && (
            <>
              <span className="text-white/20">•</span>
              <span className="text-white/30">{Math.floor(track.metadata.bitrate / 1000)}kbps</span>
            </>
          )}
        </div>
      </div>

      {/* دکمه‌های کناری */}
      <div className="flex items-center gap-1">
        {/* دکمه آپلود */}
        <UploadButton track={track} />
        
        {/* دکمه پلی سریع (فقط اگر فایل دارد) */}
        {track.hasFile && (
          <button 
            className="text-white/20 hover:text-white transition p-1.5 rounded-full hover:bg-white/5"
            onClick={(e) => {
              e.stopPropagation();
              playTrack(index);
            }}
            title="پخش"
          >
            {isActive && isPlaying ? (
              <Pause size={16} className="text-purple-400" />
            ) : (
              <Play size={16} />
            )}
          </button>
        )}
        
        {/* آیکون نشان‌دهنده‌ی عدم وجود فایل */}
        {!track.hasFile && (
          <div className="text-xs text-yellow-500/40 px-2 py-0.5 rounded-full bg-yellow-500/5 border border-yellow-500/10">
            فایل نداره
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackItem;
