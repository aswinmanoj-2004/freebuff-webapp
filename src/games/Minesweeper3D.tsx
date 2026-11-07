import React, { useState } from 'react';
import { sound } from '../services/audio';
import { useAuthStore } from '../store/authStore';
import { RotateCcw, Flag, Bomb, Shield } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Cell {
  r: number;
  c: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
}

export const Minesweeper3D: React.FC<{ onScoreUpdate: (score: number) => void }> = ({ onScoreUpdate }) => {
  const { recordGameStats } = useAuthStore();
  const ROWS = 8;
  const COLS = 8;
  const MINES_COUNT = 10;

  const [grid, setGrid] = useState<Cell[][]>(() => createInitialGrid());
  const [flagMode, setFlagMode] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [firstClick, setFirstClick] = useState(true);

  function createInitialGrid(): Cell[][] {
    return Array(ROWS).fill(null).map((_, r) =>
      Array(COLS).fill(null).map((__, c) => ({
        r,
        c,
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0,
      }))
    );
  }

  function populateMines(startR: number, startC: number, board: Cell[][]) {
    let placed = 0;
    while (placed < MINES_COUNT) {
      const r = Math.floor(Math.random() * ROWS);
      const c = Math.floor(Math.random() * COLS);
      if (!board[r][c].isMine && !(Math.abs(r - startR) <= 1 && Math.abs(c - startC) <= 1)) {
        board[r][c].isMine = true;
        placed++;
      }
    }

    // Calculate neighboring counts
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (!board[r][c].isMine) {
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = r + dr;
              const nc = c + dc;
              if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc].isMine) {
                count++;
              }
            }
          }
          board[r][c].neighborMines = count;
        }
      }
    }
  }

  const revealCell = (r: number, c: number, board: Cell[][]) => {
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS || board[r][c].isRevealed || board[r][c].isFlagged) {
      return;
    }

    board[r][c].isRevealed = true;
    if (board[r][c].neighborMines === 0 && !board[r][c].isMine) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          revealCell(r + dr, c + dc, board);
        }
      }
    }
  };

  const handleCellClick = (r: number, c: number) => {
    if (gameOver || isWon) return;
    const nextGrid = grid.map((row) => row.map((cell) => ({ ...cell })));
    const target = nextGrid[r][c];

    if (flagMode) {
      sound.playPop();
      target.isFlagged = !target.isFlagged;
      setGrid(nextGrid);
      return;
    }

    if (target.isFlagged) return;

    if (firstClick) {
      populateMines(r, c, nextGrid);
      setFirstClick(false);
    }

    if (nextGrid[r][c].isMine) {
      // Boom! Game Over
      sound.playLose();
      nextGrid.forEach((row) =>
        row.forEach((cell) => {
          if (cell.isMine) cell.isRevealed = true;
        })
      );
      setGrid(nextGrid);
      setGameOver(true);
      recordGameStats('minesweeper', 50, false);
      return;
    }

    sound.playClick();
    revealCell(r, c, nextGrid);
    setGrid(nextGrid);

    // Check Win
    const nonMineCells = ROWS * COLS - MINES_COUNT;
    const revealedCount = nextGrid.flat().filter((cell) => cell.isRevealed && !cell.isMine).length;
    if (revealedCount === nonMineCells) {
      sound.playWin();
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      setIsWon(true);
      recordGameStats('minesweeper', 500, true);
      onScoreUpdate(500);
    }
  };

  const handleRestart = () => {
    sound.playClick();
    setGrid(createInitialGrid());
    setGameOver(false);
    setIsWon(false);
    setFirstClick(true);
  };

  const getNumberColor = (num: number) => {
    switch (num) {
      case 1: return 'text-cyan-400';
      case 2: return 'text-emerald-400';
      case 3: return 'text-amber-400';
      case 4: return 'text-rose-400';
      default: return 'text-purple-400';
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
      <div className="relative p-6 rounded-3xl comic-panel bg-white border-4 border-black shadow-[6px_6px_0px_#000000] max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-1.5 comic-badge bg-rose-400 text-black border-2 border-black px-3 py-1 font-comic font-black text-sm shadow-[2px_2px_0px_#000000]">
            <Bomb className="w-4 h-4 stroke-[2.5]" />
            <span>MINES: {MINES_COUNT}</span>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              setFlagMode(!flagMode);
            }}
            className={`comic-btn px-3 py-1 rounded-xl border-2 border-black font-comic font-black text-xs flex items-center gap-1.5 shadow-[2px_2px_0px_#000000] transition-all active:translate-x-[1px] active:translate-y-[1px] ${
              flagMode
                ? 'bg-rose-500 text-white'
                : 'bg-yellow-300 text-black hover:bg-yellow-200'
            }`}
          >
            <Flag className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>FLAG MODE: {flagMode ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        {/* 8x8 Grid */}
        <div className="grid grid-cols-8 gap-1 p-2 bg-amber-50 rounded-2xl border-3 border-black shadow-inner">
          {grid.map((row) =>
            row.map((cell) => (
              <button
                key={`${cell.r}-${cell.c}`}
                onClick={() => handleCellClick(cell.r, cell.c)}
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg font-comic font-black text-base sm:text-xl flex items-center justify-center transition-all ${
                  cell.isRevealed
                    ? cell.isMine
                      ? 'bg-rose-500 border-2 border-black text-black'
                      : 'bg-amber-100/80 border border-black/20 text-black'
                    : 'bg-slate-200 hover:bg-yellow-200 border-2 border-black shadow-[2px_2px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px]'
                }`}
              >
                {cell.isRevealed ? (
                  cell.isMine ? (
                    '💣'
                  ) : cell.neighborMines > 0 ? (
                    <span className={getNumberColor(cell.neighborMines)}>{cell.neighborMines}</span>
                  ) : null
                ) : cell.isFlagged ? (
                  <Flag className="w-4 h-4 text-rose-600 fill-current" />
                ) : null}
              </button>
            ))
          )}
        </div>

        {/* Win / Loss Modal */}
        {(gameOver || isWon) && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95">
            <div className="comic-panel p-6 bg-yellow-300 border-4 border-black rounded-3xl shadow-[8px_8px_0px_#000000] max-w-xs w-full">
              <h3 className="font-comic font-black text-3xl mb-1 text-black">
                {isWon ? '🎉 MINEFIELD DEFUSED!' : '💥 DETONATION!'}
              </h3>
              <p className="text-sm font-bold text-black mb-4">
                {isWon ? 'All safe sectors uncovered like a superhero!' : 'Step carefully next time, detective!'}
              </p>
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
