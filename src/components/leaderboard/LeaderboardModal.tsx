import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { GAME_CATALOG } from '../../store/gameStore';
import { sound } from '../../services/audio';
import { X, Trophy, Medal, Crown } from 'lucide-react';

interface MockLeaderboardEntry {
  rank: number;
  name: string;
  avatarSeed: string;
  score: number;
  wins: number;
  isCurrentUser?: boolean;
}

export const LeaderboardModal: React.FC = () => {
  const { leaderboardModalOpen, setLeaderboardModal, user } = useAuthStore();
  const [selectedGameId, setSelectedGameId] = useState<string>('snake-ladder');

  if (!leaderboardModalOpen) return null;

  const baseScores: Record<string, number> = {
    'snake-ladder': 940,
    'tic-tac-toe': 28,
    'flappy-bird': 142,
    'sudoku': 1850,
    'word-city': 3240,
    'nuts-bolts': 4500,
    'blocky-blast': 8920,
    'game-2048': 16384,
    'memory-match': 980,
    'minesweeper': 840,
    'math-quiz': 560,
    'connect-four': 34,
    'slide-puzzle': 910,
  };

  const topBase = baseScores[selectedGameId] || 1000;
  const mockBoard: MockLeaderboardEntry[] = [
    { rank: 1, name: 'CyberViper', avatarSeed: 'CV', score: topBase, wins: 48 },
    { rank: 2, name: 'NeonKnight', avatarSeed: 'NK', score: Math.round(topBase * 0.92), wins: 41 },
    { rank: 3, name: 'AeroAce', avatarSeed: 'AA', score: Math.round(topBase * 0.85), wins: 36 },
    { rank: 4, name: 'QuantumSolve', avatarSeed: 'QS', score: Math.round(topBase * 0.77), wins: 29 },
    { rank: 5, name: 'PixelPawn', avatarSeed: 'PP', score: Math.round(topBase * 0.71), wins: 24 },
  ];

  const userScore = user?.stats[selectedGameId]?.highScore || 0;
  if (user && userScore > 0) {
    mockBoard.push({
      rank: userScore >= topBase ? 1 : 6,
      name: user.displayName,
      avatarSeed: user.avatarSeed,
      score: userScore,
      wins: user.stats[selectedGameId]?.wins || 0,
      isCurrentUser: true,
    });
    mockBoard.sort((a, b) => b.score - a.score);
    mockBoard.forEach((p, idx) => (p.rank = idx + 1));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="comic-panel relative w-full max-w-2xl rounded-3xl p-6 sm:p-8 bg-white border-4 border-black text-slate-900 shadow-[8px_8px_0px_#000000] flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b-3 border-black">
          <div className="flex items-center gap-3">
            <div className="comic-badge p-2 rounded-xl bg-amber-400 border-2 border-black rotate-[-4deg]">
              <Trophy className="w-6 h-6 text-black fill-black" />
            </div>
            <div>
              <h2 className="font-comic text-3xl text-black">HALL OF FAME</h2>
              <p className="text-xs font-bold text-slate-600">Top Arcade records and leaderboard legends.</p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              setLeaderboardModal(false);
            }}
            className="comic-btn p-1.5 rounded-lg bg-rose-400 text-white font-bold cursor-pointer"
            aria-label="Close leaderboard"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Game Selector Buttons */}
        <div className="py-4 flex gap-1.5 overflow-x-auto scrollbar-none border-b-2 border-black/60">
          {GAME_CATALOG.map((g) => {
            const isSelected = selectedGameId === g.id;
            return (
              <button
                key={g.id}
                onClick={() => {
                  sound.playClick();
                  setSelectedGameId(g.id);
                }}
                className={`comic-btn px-3 py-1 rounded-xl text-xs font-comic whitespace-nowrap cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-amber-400 text-black shadow-[3px_3px_0px_#000000]'
                    : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                }`}
              >
                {g.title}
              </button>
            );
          })}
        </div>

        {/* Board Content */}
        <div className="py-4 overflow-y-auto flex-1 space-y-2.5 pr-1">
          {mockBoard.map((entry) => {
            const isTop1 = entry.rank === 1;
            const isTop2 = entry.rank === 2;
            const isTop3 = entry.rank === 3;

            return (
              <div
                key={`${entry.name}-${entry.rank}`}
                className={`p-3.5 rounded-2xl border-3 border-black flex items-center justify-between transition-all ${
                  entry.isCurrentUser
                    ? 'bg-amber-100 shadow-[4px_4px_0px_#000000]'
                    : isTop1
                    ? 'bg-yellow-200 shadow-[3px_3px_0px_#000000]'
                    : 'bg-white shadow-[2px_2px_0px_#000000]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 flex items-center justify-center font-comic text-xl">
                    {isTop1 ? (
                      <Crown className="w-6 h-6 text-amber-500 fill-amber-400" />
                    ) : isTop2 ? (
                      <Medal className="w-6 h-6 text-slate-400 fill-slate-300" />
                    ) : isTop3 ? (
                      <Medal className="w-6 h-6 text-amber-700 fill-amber-600" />
                    ) : (
                      <span className="font-comic text-slate-700">#{entry.rank}</span>
                    )}
                  </div>

                  <div className="w-9 h-9 rounded-xl bg-black text-white font-comic text-sm flex items-center justify-center font-bold">
                    {entry.avatarSeed}
                  </div>
                  <div>
                    <div className="font-comic text-lg text-black flex items-center gap-2">
                      <span>{entry.name}</span>
                      {entry.isCurrentUser && (
                        <span className="comic-badge text-[10px] bg-emerald-400 text-black px-1.5 py-0.2 rounded">
                          YOU!
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] font-bold text-slate-600">
                      {entry.wins} VICTORIES LOGGED
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-comic text-2xl text-black tabular-nums">
                    {entry.score.toLocaleString()} PTS
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="pt-3 border-t-3 border-black text-center text-xs font-bold text-slate-700">
          Play matches while signed in to submit verified times and climb the ranks!
        </div>
      </div>
    </div>
  );
};
