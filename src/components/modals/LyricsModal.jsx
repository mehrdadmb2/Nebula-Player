import React, { useState } from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { X, Edit3, Save } from 'lucide-react';

const LyricsModal = () => {
  const { currentTrack, tracks, setTracks } = usePlayer();
  const [editMode, setEditMode] = useState(false);
  const [localLyrics, setLocalLyrics] = useState(currentTrack?.lyrics || '');

  if (!currentTrack) return null;

  const handleSave = () => {
    const updated = tracks.map(t => 
      t.id === currentTrack.id ? { ...t, lyrics: localLyrics } : t
    );
    setTracks(updated);
    setEditMode(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={(e) => {
      if (e.target === e.currentTarget) setEditMode(false);
    }}>
      <div className="glass w-full max-w-lg p-6 rounded-3xl border border-white/10 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">{currentTrack.title}</h3>
          <div className="flex gap-2">
            <button onClick={() => setEditMode(!editMode)} className="text-white/40 hover:text-white transition p-1">
              <Edit3 size={18} />
            </button>
            <button onClick={() => setEditMode(false)} className="text-white/40 hover:text-white transition p-1">
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">
          {editMode ? (
            <textarea 
              value={localLyrics} 
              onChange={(e) => setLocalLyrics(e.target.value)}
              className="w-full h-64 bg-black/30 border border-white/10 rounded-xl p-4 text-white/80 focus:outline-none focus:border-purple-500"
              placeholder="📝 متن آهنگ را اینجا کپی کنید..."
            />
          ) : (
            localLyrics || '✨ هنوز متنی اضافه نشده است. دکمه‌ی مداد را بزنید و لیریکس را پیست کنید.'
          )}
        </div>
        {editMode && (
          <button onClick={handleSave} className="mt-4 w-full glass py-2.5 rounded-xl text-white/80 hover:bg-white/10 transition flex items-center justify-center gap-2">
            <Save size={18} /> ذخیره متن
          </button>
        )}
      </div>
    </div>
  );
};

export default LyricsModal;
