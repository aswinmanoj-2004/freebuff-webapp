import React, { useEffect, useState } from 'react';
import { sound } from '../services/audio';
import { useAuthStore } from '../store/authStore';
import { RotateCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

type Grid = number[][];

export const Game20483D: React.FC<{ onScoreUpdate: (score: number) => void }> = ({ onScoreUpdate }) => {
  const { recordGameStats } = useAuthStore();
  const [grid, setGrid] = useState<Grid>(() => initGrid());
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  function initGrid(): Grid {
    const g = Array(4).fill(0).map(() => Array(4).fill(0));
    spawnTile(g);
    spawnTile(g);
    return g;
  }

  function spawnTile(g: Grid) {
    const empty: [number, number][] = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (g[r][c] === 0) empty.push([r, c]);
      }
    }
    if (empty.length > 0) {
      const [r, c] = empty[Math.floor(Math.random() * empty.length)];
      g[r][c] = Math.random() < 0.9 ? 2 : 4;
    }
  }

  const slideRow = (row: number[]): { newRow: number[]; gained: number } => {
    let arr = row.filter((val) => val !== 0);
    let gained = 0;
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] === arr[i + 1]) {
        arr[i] *= 2;
        gained += arr[i];
        arr[i + 1] = 0;
      }
    }
    arr = arr.filter((val) => val !== 0);
    while (arr.length < 4) arr.push(0);
    return { newRow: arr, gained };
  };

  const move = (direction: 'left' | 'right' | 'up' | 'down') => {
    if (gameOver) return;
    let moved = false;
    let points = 0;
    const newGrid: Grid = Array(4).fill(0).map(() => Array(4).fill(0));

    if (direction === 'left' || direction === 'right') {
      for (let r = 0; r < 4; r++) {
        const row = grid[r];
        const targetRow = direction === 'left' ? [...row] : [...row].reverse();
        const { newRow, gained } = slideRow(targetRow);
        points += gained;
        const finalRow = direction === 'left' ? newRow : newRow.reverse();
        newGrid[r] = finalRow;
        if (JSON.stringify(row) !== JSON.stringify(finalRow)) moved = true;
      }
    } else {
      for (let c = 0; c < 4; c++) {
        const col = [grid[0][c], grid[1][c], grid[2][c], grid[3][c]];
        const targetCol = direction === 'up' ? [...col] : [...col].reverse();
        const { newRow, gained } = slideRow(targetCol);
        points += gained;
        const finalCol = direction === 'up' ? newRow : newRow.reverse();
        for (let r = 0; r < 4; r++) {
          newGrid[r][c] = finalCol[r];
        }
        if (JSON.stringify(col) !== JSON.stringify(finalCol)) moved = true;
      }
    }

    if (moved) {
      sound.playPop();
      spawnTile(newGrid);
      const nextScore = score + points;
      setScore(nextScore);
      onScoreUpdate(nextScore);
      setBestScore((b) => Math.max(b, nextScore));
      setGrid(newGrid);

      // Check 2048 victory condition
      if (newGrid.some((row) => row.includes(2048))) {
        sound.playWin();
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      }

      // Check Game Over
      if (checkGameOver(newGrid)) {
        sound.playLose();
        setGameOver(true);
        recordGameStats('game-2048', nextScore, nextScore > 2048);
      }
    }
  };

  const checkGameOver = (g: Grid): boolean => {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (g[r][c] === 0) return false;
        if (r < 3 && g[r][c] === g[r + 1][c]) return false;
        if (c < 3 && g[r][c] === g[r][c + 1]) return false;
      }
    }
    return true;
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w') move('up');
      if (e.key === 'ArrowDown' || e.key === 's') move('down');
      if (e.key === 'ArrowLeft' || e.key === 'a') move('left');
      if (e.key === 'ArrowRight' || e.key === 'd') move('right');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [grid, gameOver]);

  const handleRestart = () => {
    sound.playClick();
    setGrid(initGrid());
    setScore(0);
    setGameOver(false);
  };

  // Cube Color Palette with Comic Pop-Art Colors
  const getCubeColor = (val: number): string => {
    switch (val) {
      case 2: return 'bg-white text-black border-3 border-black shadow-[3px_3px_0px_#000000]';
      case 4: return 'bg-yellow-200 text-black border-3 border-black shadow-[3px_3px_0px_#000000]';
      case 8: return 'bg-yellow-400 text-black border-3 border-black shadow-[3px_3px_0px_#000000]';
      case 16: return 'bg-amber-400 text-black border-3 border-black shadow-[3px_3px_0px_#000000]';
      case 32: return 'bg-orange-400 text-black border-3 border-black shadow-[3px_3px_0px_#000000]';
      case 64: return 'bg-rose-500 text-white border-3 border-black shadow-[3px_3px_0px_#000000]';
      case 128: return 'bg-pink-500 text-white border-3 border-black shadow-[3px_3px_0px_#000000]';
      case 256: return 'bg-purple-500 text-white border-3 border-black shadow-[3px_3px_0px_#000000]';
      case 512: return 'bg-indigo-500 text-white border-3 border-black shadow-[3px_3px_0px_#000000]';
      case 1024: return 'bg-cyan-400 text-black border-3 border-black shadow-[3px_3px_0px_#000000]';
      case 2048: return 'bg-emerald-400 text-black border-4 border-black shadow-[4px_4px_0px_#000000] ring-2 ring-yellow-400';
      default: return 'bg-amber-100/60 text-transparent border-2 border-dashed border-black/20';
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
      {/* Comic 2048 Board Container */}
      <div className="relative p-4 rounded-3xl comic-panel bg-white border-4 border-black shadow-[6px_6px_0px_#000000]">
        <div className="w-72 h-72 sm:w-80 sm:h-80 grid grid-cols-4 gap-2.5 p-2 bg-amber-50 rounded-2xl border-3 border-black">
          {grid.map((row, r) =>
            row.map((val, c) => (
              <div
                key={`${r}-${c}`}
                className={`relative rounded-xl flex items-center justify-center font-comic font-black text-2xl sm:text-3xl transition-all duration-150 transform hover:scale-[1.03] select-none ${getCubeColor(
                  val
                )}`}
              >
                {val > 0 && <span>{val}</span>}
              </div>
            ))
          )}
        </div>

        {/* Game Over Banner */}
        {gameOver && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95">
            <div className="comic-panel p-6 bg-yellow-300 border-4 border-black rounded-3xl shadow-[8px_8px_0px_#000000] max-w-xs w-full">
              <h3 className="font-comic font-black text-3xl mb-1 text-black">💥 GAME OVER</h3>
              <p className="text-sm font-bold text-black mb-4">No more moves possible!</p>
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

      {/* Touch / D-Pad Controls for Mobile and Ease of Access */}
      <div className="mt-6 flex flex-col items-center gap-1.5 sm:hidden">
        <button
          onClick={() => move('up')}
          aria-label="Move Up"
          className="comic-btn p-3 rounded-xl bg-yellow-400 border-3 border-black text-black shadow-[3px_3px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px]"
        >
          <ArrowUp className="w-6 h-6 stroke-[3]" />
        </button>
        <div className="flex items-center gap-6">
          <button
            onClick={() => move('left')}
            aria-label="Move Left"
            className="comic-btn p-3 rounded-xl bg-yellow-400 border-3 border-black text-black shadow-[3px_3px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px]"
          >
            <ArrowLeft className="w-6 h-6 stroke-[3]" />
          </button>
          <button
            onClick={() => move('down')}
            aria-label="Move Down"
            className="comic-btn p-3 rounded-xl bg-yellow-400 border-3 border-black text-black shadow-[3px_3px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px]"
          >
            <ArrowDown className="w-6 h-6 stroke-[3]" />
          </button>
          <button
            onClick={() => move('right')}
            aria-label="Move Right"
            className="comic-btn p-3 rounded-xl bg-yellow-400 border-3 border-black text-black shadow-[3px_3px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px]"
          >
            <ArrowRight className="w-6 h-6 stroke-[3]" />
          </button>
        </div>
      </div>

      <div className="mt-4 text-center text-xs font-bold text-slate-800 hidden sm:block">
        Use <kbd className="px-2 py-1 rounded-lg bg-yellow-300 border-2 border-black text-black font-comic font-black text-xs shadow-[2px_2px_0px_#000000]">ARROW KEYS</kbd> or <kbd className="px-2 py-1 rounded-lg bg-yellow-300 border-2 border-black text-black font-comic font-black text-xs shadow-[2px_2px_0px_#000000]">WASD</kbd> to slide tactical comic tiles.
      </div>
    </div>
  );
};
