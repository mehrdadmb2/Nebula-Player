import React, { useState } from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { X, Edit3, Save, Copy } from 'lucide-react';

const LyricsModal = ({ onClose }) => {
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

  const handleCopy = () => {
    navigator.clipboard.writeText(localLyrics || currentTrack.lyrics || '');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md" 
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
          setEditMode(false);
        }
      }}
    >
      <div className="glass-premium w-full max-w-lg p-6 rounded-3xl border border-white/10 max-h-[80vh] overflow-y-auto animate-in fade-in zoom-in duration-300">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-xl font-bold text-white">{currentTrack.title}</h3>
            <p className="text-sm text-white/40">{currentTrack.artist}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleCopy} className="control-btn" title="کپی متن">
              <Copy size={18} />
            </button>
            <button onClick={() => setEditMode(!editMode)} className="control-btn" title="ویرایش متن">
              <Edit3 size={18} />
            </button>
            <button onClick={() => { onClose(); setEditMode(false); }} className="control-btn">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">
          {editMode ? (
            <textarea 
              value={localLyrics} 
              onChange={(e) => setLocalLyrics(e.target.value)}
              className="w-full h-64 bg-black/30 border border-white/10 rounded-xl p-4 text-white/80 focus:outline-none focus:border-purple-500/50 transition resize-none"
              placeholder="📝 متن آهنگ را اینجا کپی کنید..."
            />
          ) : (
            <div className="p-4 bg-white/5 rounded-xl border border-white/5 min-h-[150px]">
              {localLyrics || currentTrack.lyrics || '✨ هنوز متنی اضافه نشده است. دکمه‌ی مداد را بزنید و لیریکس را پیست کنید.'}
            </div>
          )}
        </div>

        {editMode && (
          <button 
            onClick={handleSave} 
            className="mt-4 w-full glass-premium py-2.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition flex items-center justify-center gap-2"
          >
            <Save size={18} /> ذخیره متن
          </button>
        )}
      </div>
    </div>
  );
};

export default LyricsModal;
