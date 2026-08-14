import React from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { Music, PlayCircle } from 'lucide-react';

const TrackItem = ({ track, index }) => {
  const { currentTrack, setCurrentTrackIndex, togglePlay, isPlaying } = usePlayer();
  const isActive = currentTrack?.id === track.id;

  const handlePlay = () => {
    setCurrentTrackIndex(index);
    // اگر می‌خواهید فایل صوتی را امتحان کنید، اینجا می‌توانید track.audioUrl را ست کنید
    // فعلاً فقط وضعیت پلی را تغییر می‌دهیم (اگر فایل موجود نباشد خطا می‌دهد و به بعدی می‌رود)
    togglePlay();
  };

  const cover = track.cover || `https://ui-avatars.com/api/?name=${encodeURIComponent(track.artist)}&background=3b0764&color=fff&size=50`;

  return (
    <div 
      className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all duration-300 ${
        isActive ? 'bg-purple-600/20 border border-purple-500/30 shadow-lg shadow-purple-500/10' : 'hover:bg-white/5'
      }`}
      onClick={handlePlay}
    >
      <img src={cover} alt={track.title} className="w-12 h-12 rounded-lg object-cover shadow-md" />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isActive ? 'text-purple-300' : 'text-white/80'}`}>
          {track.title}
        </p>
        <p className="text-xs text-white/40 truncate">{track.artist}</p>
      </div>
      <div className="text-white/30">
        {isActive && isPlaying ? <Music size={18} className="text-purple-400 animate-pulse" /> : <PlayCircle size={18} />}
      </div>
    </div>
  );
};

const TrackList = ({ tracks }) => {
  return (
    <div className="max-h-[400px] overflow-y-auto pr-2 space-y-1">
      {tracks.map((track, idx) => (
        <TrackItem key={track.id || idx} track={track} index={idx} />
      ))}
    </div>
  );
};

export default TrackList;
