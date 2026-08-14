import React from 'react';
import { usePlayer } from '../../context/PlayerContext';
import TrackItem from './TrackItem';
import SearchBar from '../SearchBar';

const TrackList = () => {
  const { filteredTracks } = usePlayer();

  console.log('🎵 تعداد آهنگ‌های دریافتی در TrackList:', filteredTracks.length);
  if (filteredTracks.length > 0) {
    console.log('🎵 نمونه اولین آهنگ در TrackList:', filteredTracks[0]);
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center mb-4">
        <span className="text-white/30 text-sm">📋 لیست پخش</span>
        <SearchBar />
      </div>
      <div className="max-h-[320px] overflow-y-auto pr-1 space-y-1">
        {filteredTracks.length === 0 ? (
          <div className="text-center text-white/30 py-10">
            🎵 هیچ آهنگی در لیست پخش وجود ندارد
          </div>
        ) : (
          filteredTracks.map((track, idx) => (
            <TrackItem key={track.id || `track-${idx}`} track={track} index={idx} />
          ))
        )}
      </div>
    </div>
  );
};

export default TrackList;
