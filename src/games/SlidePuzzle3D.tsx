import React, { useState } from 'react';
import { sound } from '../services/audio';
import { useAuthStore } from '../store/authStore';
import { RotateCcw, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export const SlidePuzzle3D: React.FC<{ onScoreUpdate: (score: number) => void }> = ({ onScoreUpdate }) => {
  const { recordGameStats } = useAuthStore();
  const [tiles, setTiles] = useState<number[]>(() => generateSolvableBoard());
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);

  function generateSolvableBoard(): number[] {
    // Start with solved state and apply 40 random valid sliding moves
    const board = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0];
    let emptyIdx = 15;

    for (let i = 0; i < 40; i++) {
      const neighbors: number[] = [];
      const r = Math.floor(emptyIdx / 4);
      const c = emptyIdx % 4;

      if (r > 0) neighbors.push(emptyIdx - 4);
      if (r < 3) neighbors.push(emptyIdx + 4);
      if (c > 0) neighbors.push(emptyIdx - 1);
      if (c < 3) neighbors.push(emptyIdx + 1);

      const chosen = neighbors[Math.floor(Math.random() * neighbors.length)];
      board[emptyIdx] = board[chosen];
      board[chosen] = 0;
      emptyIdx = chosen;
    }
    return board;
  }

  const handleTileClick = (idx: number) => {
    if (tiles[idx] === 0 || isWon) return;

    const emptyIdx = tiles.indexOf(0);
    const r1 = Math.floor(idx / 4);
    const c1 = idx % 4;
    const r2 = Math.floor(emptyIdx / 4);
    const c2 = emptyIdx % 4;

    const isAdjacent = Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1;
    if (!isAdjacent) return;

    sound.playPop();
    const nextTiles = [...tiles];
    nextTiles[emptyIdx] = nextTiles[idx];
    nextTiles[idx] = 0;

    setTiles(nextTiles);
    setMoves((m) => m + 1);

    // Check Win
    const solved = nextTiles.slice(0, 15).every((val, i) => val === i + 1);
    if (solved) {
      sound.playWin();
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      setIsWon(true);
      const score = Math.max(100, 1000 - moves * 15);
      recordGameStats('slide-puzzle', score, true);
      onScoreUpdate(score);
    }
  };

  const handleRestart = () => {
    sound.playClick();
    setTiles(generateSolvableBoard());
    setMoves(0);
    setIsWon(false);
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
      <div className="relative p-6 rounded-3xl comic-panel bg-white border-4 border-black shadow-[6px_6px_0px_#000000] max-w-sm w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 px-1">
          <span className="comic-badge bg-yellow-300 text-black border-2 border-black px-3 py-1 font-comic font-black text-sm shadow-[2px_2px_0px_#000000]">
            15-SLIDE COMIC
          </span>
          <span className="comic-badge bg-cyan-300 text-black border-2 border-black px-3 py-1 font-comic font-black text-sm shadow-[2px_2px_0px_#000000]">
            MOVES: {moves}
          </span>
        </div>

        {/* 4x4 Tiles Grid */}
        <div className="grid grid-cols-4 gap-2 p-2 bg-amber-50 rounded-2xl border-3 border-black shadow-inner">
          {tiles.map((val, idx) => (
            <button
              key={idx}
              onClick={() => handleTileClick(idx)}
              className={`h-16 sm:h-20 rounded-xl font-comic font-black text-2xl sm:text-3xl flex items-center justify-center transition-all duration-150 ${
                val > 0
                  ? 'comic-btn bg-yellow-400 hover:bg-yellow-300 border-3 border-black text-black shadow-[3px_3px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px]'
                  : 'bg-amber-100/60 border-2 border-dashed border-black/20 pointer-events-none'
              }`}
            >
              {val > 0 ? val : ''}
            </button>
          ))}
        </div>

        {/* Win Modal */}
        {isWon && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95">
            <div className="comic-panel p-6 bg-yellow-300 border-4 border-black rounded-3xl shadow-[8px_8px_0px_#000000] max-w-xs w-full">
              <h3 className="font-comic font-black text-3xl mb-1 text-black">🎉 PUZZLE SOLVED!</h3>
              <p className="text-sm font-bold text-black mb-4">Completed in {moves} moves!</p>
              <button
                onClick={handleRestart}
                className="comic-btn w-full px-6 py-3 rounded-2xl bg-black text-yellow-300 hover:bg-neutral-800 font-comic font-black text-lg uppercase tracking-wider border-3 border-black shadow-[4px_4px_0px_rgba(0,0,0,0.5)] active:translate-x-[2px] active:translate-y-[2px]"
              >
                PLAY AGAIN
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
