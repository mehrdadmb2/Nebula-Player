import React from 'react';
import { usePlayer } from '../context/PlayerContext';
import { Search, X } from 'lucide-react';

const SearchBar = () => {
  const { searchQuery, setSearchQuery } = usePlayer();
  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
      <input 
        type="text" 
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="🔍 جستجوی آهنگ یا خواننده..."
        className="w-full glass py-2.5 pl-10 pr-10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition"
      />
      {searchQuery && (
        <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white">
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
