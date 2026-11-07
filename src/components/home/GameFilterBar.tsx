import React from 'react';
import { GameCategory } from '../../store/gameStore';
import { sound } from '../../services/audio';
import { Search, X, Sparkles } from 'lucide-react';

interface GameFilterBarProps {
  activeCategory: GameCategory;
  onSelectCategory: (cat: GameCategory) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  totalGames: number;
}

const CATEGORIES: { id: GameCategory; label: string; activeColor: string }[] = [
  { id: 'all', label: '💥 ALL GAMES', activeColor: 'bg-amber-400' },
  { id: 'board', label: '🎲 3D BOARD', activeColor: 'bg-emerald-400' },
  { id: 'logic', label: '🧩 PUZZLE', activeColor: 'bg-indigo-400 text-white' },
  { id: 'arcade', label: '🚀 ARCADE', activeColor: 'bg-rose-500 text-white' },
  { id: 'math', label: '⚡ BRAIN MATH', activeColor: 'bg-cyan-400' },
];

export const GameFilterBar: React.FC<GameFilterBarProps> = ({
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  totalGames,
}) => {
  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 py-3">
      {/* Category Tabs (Comic Action Buttons) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                sound.playClick();
                onSelectCategory(cat.id);
              }}
              className={`comic-btn px-4 py-1.5 text-xs sm:text-sm font-comic rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                isActive
                  ? `${cat.activeColor} shadow-[4px_4px_0px_#000000]`
                  : 'bg-white hover:bg-slate-100 text-black'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Comic Search Input */}
      <div className="relative min-w-[240px] md:w-80">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-700" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={`SEARCH ${totalGames} COMIC GAMES...`}
          className="w-full pl-10 pr-9 py-2.5 bg-white border-3 border-black rounded-xl text-black placeholder-slate-500 font-bold text-xs uppercase tracking-wider focus:outline-none focus:bg-amber-100/60 shadow-[3px_3px_0px_#000000]"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-2.5 text-slate-600 hover:text-black font-bold"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
