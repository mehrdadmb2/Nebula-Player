import React from 'react';
import { usePlayer } from '../../context/PlayerContext';
import TrackItem from './TrackItem';
import SearchBar from '../SearchBar';
import { Music } from 'lucide-react';

const TrackList = () => {
  const { filteredTracks, tracks } = usePlayer();
  
  return (
    <div className="space-y-3">
      {/* هدر لیست */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <Music size={18} className="text-white/30" />
          <span className="text-white/30 text-sm">
            {filteredTracks.length} آهنگ از {tracks.length}
          </span>
        </div>
        <SearchBar />
      </div>

      {/* لیست آهنگ‌ها */}
      <div className="max-h-[400px] overflow-y-auto pr-1 space-y-0.5">
        {filteredTracks.map((track, idx) => (
          <TrackItem key={track.id} track={track} index={idx} />
        ))}
        
        {filteredTracks.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4 opacity-30">🔍</div>
            <p className="text-white/30">هیچ آهنگی با این جستجو پیدا نشد</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackList;
