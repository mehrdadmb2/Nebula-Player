import React from 'react';
import { usePlayer } from '../context/PlayerContext';
import { Search, X } from 'lucide-react';

const SearchBar = () => {
  const { searchQuery, setSearchQuery } = usePlayer();
  
  return (
    <div className="relative w-full max-w-xs">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={16} />
      <input 
        type="text" 
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="جستجو در آهنگ‌ها..."
        className="w-full glass-premium py-2 pl-9 pr-9 rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:border-purple-500/30 transition-all duration-200"
      />
      {searchQuery && (
        <button 
          onClick={() => setSearchQuery('')} 
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
