import React from 'react';
import { GameMetadata } from '../../store/gameStore';
import { useAuthStore } from '../../store/authStore';
import { sound } from '../../services/audio';
import { Play, Trophy, Sparkles, Zap } from 'lucide-react';

interface GameCardProps {
  game: GameMetadata;
  onSelect: (gameId: string) => void;
}

const CATEGORY_COLORS: Record<string, { bg: string; badge: string }> = {
  board: { bg: 'bg-emerald-100', badge: 'bg-emerald-400' },
  logic: { bg: 'bg-indigo-100', badge: 'bg-indigo-400 text-white' },
  arcade: { bg: 'bg-rose-100', badge: 'bg-rose-400 text-white' },
  math: { bg: 'bg-amber-100', badge: 'bg-amber-400' },
};

export const GameCard: React.FC<GameCardProps> = ({ game, onSelect }) => {
  const { user, loginAsGuest } = useAuthStore();
  const userStats = user?.stats[game.id];
  const highScore = userStats?.highScore || 0;

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playSelect();

    if (!user) {
      loginAsGuest();
    }

    onSelect(game.id);
  };

  const theme = CATEGORY_COLORS[game.category] || { bg: 'bg-cyan-100', badge: 'bg-cyan-400' };

  return (
    <div
      onClick={handlePlayClick}
      className="comic-card group relative rounded-2xl p-5 sm:p-6 flex flex-col justify-between cursor-pointer overflow-hidden"
    >
      {/* Comic Header: Category Tag & Difficulty Badge */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={`comic-badge px-2.5 py-0.5 rounded-md text-[11px] font-bold ${theme.badge}`}>
            {game.categoryLabel}
          </span>
          <span className="comic-badge px-2 py-0.5 rounded-md text-[10px] bg-white text-slate-800 border-2 border-black">
            ★ {game.difficulty}
          </span>
        </div>

        {/* Big Comic Game Title */}
        <h3 className="font-comic text-2xl sm:text-3xl text-black tracking-wide group-hover:text-rose-600 transition-colors leading-tight">
          {game.title}
        </h3>

        {/* Comic Description */}
        <p className="text-xs text-slate-700 font-medium mt-2 leading-relaxed">
          {game.shortDesc}
        </p>

        {/* Comic Feature Tags */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {game.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 border border-black text-black"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Card Footer: High Score & Comic Play Button */}
      <div className="mt-6 pt-3.5 border-t-2 border-black/80 flex items-center justify-between gap-2">
        <div>
          {highScore > 0 ? (
            <div className="flex items-center gap-1.5 font-comic text-sm text-emerald-700">
              <Trophy className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span>RECORD: {highScore}</span>
            </div>
          ) : (
            <div className="text-[11px] font-comic tracking-wider text-slate-500 uppercase">
              NEW ISSUE!
            </div>
          )}
        </div>

        <button
          type="button"
          className="comic-btn px-4 py-1.5 rounded-xl bg-amber-400 hover:bg-yellow-300 text-black text-sm flex items-center gap-1.5 cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-black" />
          <span>PLAY NOW!</span>
        </button>
      </div>
    </div>
  );
};
