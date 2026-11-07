import React, { useState, useEffect } from 'react';
import { sound } from '../services/audio';
import { useAuthStore } from '../store/authStore';
import { RotateCcw, Edit3, Eraser, Lightbulb, CheckCircle2, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

type Board = number[][];

// Pre-generated valid puzzles with solutions
const PUZZLE_EASY = {
  initial: [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9],
  ],
  solution: [
    [5, 3, 4, 6, 7, 8, 9, 1, 2],
    [6, 7, 2, 1, 9, 5, 3, 4, 8],
    [1, 9, 8, 3, 4, 2, 5, 6, 7],
    [8, 5, 9, 7, 6, 1, 4, 2, 3],
    [4, 2, 6, 8, 5, 3, 7, 9, 1],
    [7, 1, 3, 9, 2, 4, 8, 5, 6],
    [9, 6, 1, 5, 3, 7, 2, 8, 4],
    [2, 8, 7, 4, 1, 9, 6, 3, 5],
    [3, 4, 5, 2, 8, 6, 1, 7, 9],
  ],
};

export const Sudoku3D: React.FC<{ onScoreUpdate: (score: number) => void }> = ({ onScoreUpdate }) => {
  const { recordGameStats } = useAuthStore();
  const [initialBoard] = useState<Board>(PUZZLE_EASY.initial);
  const [currentBoard, setCurrentBoard] = useState<Board>(() =>
    PUZZLE_EASY.initial.map((row) => [...row])
  );
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>([0, 2]);
  const [notesMode, setNotesMode] = useState(false);
  const [notes, setNotes] = useState<Record<string, number[]>>({});
  const [mistakes, setMistakes] = useState(0);
  const [isWon, setIsWon] = useState(false);

  const handleCellClick = (r: number, c: number) => {
    sound.playClick();
    setSelectedCell([r, c]);
  };

  const handleNumberInput = (num: number) => {
    if (!selectedCell || isWon || mistakes >= 3) return;
    const [r, c] = selectedCell;

    // Fixed initial clue cannot be overwritten
    if (initialBoard[r][c] !== 0) return;

    if (notesMode) {
      // Toggle pencil notes
      sound.playPop();
      const key = `${r}-${c}`;
      const curNotes = notes[key] || [];
      const nextNotes = curNotes.includes(num)
        ? curNotes.filter((n) => n !== num)
        : [...curNotes, num].sort();
      setNotes({ ...notes, [key]: nextNotes });
      return;
    }

    // Direct input
    const correctVal = PUZZLE_EASY.solution[r][c];
    if (num === correctVal) {
      sound.playPoint();
      const nextBoard = currentBoard.map((row) => [...row]);
      nextBoard[r][c] = num;
      setCurrentBoard(nextBoard);

      // Check win condition
      const allFilled = nextBoard.every((row, rowIdx) =>
        row.every((val, colIdx) => val === PUZZLE_EASY.solution[rowIdx][colIdx])
      );
      if (allFilled) {
        sound.playWin();
        confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
        setIsWon(true);
        recordGameStats('sudoku', 1000 - mistakes * 150, true);
        onScoreUpdate(1000 - mistakes * 150);
      }
    } else {
      sound.playLose();
      const nextMistakes = mistakes + 1;
      setMistakes(nextMistakes);
      if (nextMistakes >= 3) {
        recordGameStats('sudoku', 100, false);
      }
    }
  };

  const handleErase = () => {
    if (!selectedCell) return;
    const [r, c] = selectedCell;
    if (initialBoard[r][c] !== 0) return;
    sound.playClick();
    const nextBoard = currentBoard.map((row) => [...row]);
    nextBoard[r][c] = 0;
    setCurrentBoard(nextBoard);
  };

  const handleHint = () => {
    if (!selectedCell || isWon) return;
    const [r, c] = selectedCell;
    if (initialBoard[r][c] !== 0) return;
    sound.playWin();
    const correctVal = PUZZLE_EASY.solution[r][c];
    const nextBoard = currentBoard.map((row) => [...row]);
    nextBoard[r][c] = correctVal;
    setCurrentBoard(nextBoard);
  };

  const handleRestart = () => {
    sound.playClick();
    setCurrentBoard(PUZZLE_EASY.initial.map((row) => [...row]));
    setNotes({});
    setMistakes(0);
    setIsWon(false);
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
      {/* Comic Sudoku Board Container */}
      <div className="relative p-4 sm:p-6 rounded-3xl comic-panel bg-white border-4 border-black shadow-[6px_6px_0px_#000000] max-w-lg w-full">
        {/* Top Info Bar */}
        <div className="flex items-center justify-between mb-4 px-1">
          <span className="comic-badge bg-yellow-300 text-black border-2 border-black px-3 py-1 font-comic font-black text-sm shadow-[2px_2px_0px_#000000]">
            9×9 CLASSIC COMIC
          </span>
          <div className="flex items-center gap-1.5 comic-badge bg-rose-400 text-black border-2 border-black px-3 py-1 font-comic font-black text-sm shadow-[2px_2px_0px_#000000]">
            <AlertCircle className="w-4 h-4 stroke-[2.5]" />
            <span>MISTAKES: {mistakes}/3</span>
          </div>
        </div>

        {/* 9x9 Grid */}
        <div className="grid grid-cols-9 gap-1 p-2 bg-amber-50 rounded-2xl border-3 border-black shadow-inner">
          {currentBoard.map((row, r) =>
            row.map((val, c) => {
              const isSelected = selectedCell && selectedCell[0] === r && selectedCell[1] === c;
              const isInitial = initialBoard[r][c] !== 0;
              const thickRight = c === 2 || c === 5;
              const thickBottom = r === 2 || r === 5;
              const key = `${r}-${c}`;
              const cellNotes = notes[key] || [];

              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  className={`relative w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center font-comic font-black text-base sm:text-xl border-2 border-black transition-all ${
                    isSelected
                      ? 'bg-yellow-300 text-black ring-2 ring-black font-extrabold shadow-[2px_2px_0px_#000000] scale-105 z-10'
                      : isInitial
                      ? 'bg-slate-900 text-yellow-300 font-black'
                      : val > 0
                      ? 'bg-cyan-200 text-black font-black'
                      : 'bg-white hover:bg-yellow-100 text-slate-700'
                  } ${thickRight ? 'mr-1 border-r-4 border-r-black' : ''} ${
                    thickBottom ? 'mb-1 border-b-4 border-b-black' : ''
                  }`}
                >
                  {val > 0 ? (
                    val
                  ) : cellNotes.length > 0 ? (
                    <span className="text-[9px] text-slate-700 grid grid-cols-3 leading-tight font-sans font-bold">
                      {cellNotes.map((n) => (
                        <span key={n}>{n}</span>
                      ))}
                    </span>
                  ) : null}
                </button>
              );
            })
          )}
        </div>

        {/* Controls: Notes, Eraser, Hint */}
        <div className="flex items-center justify-between gap-2 mt-4 px-1">
          <button
            onClick={() => {
              sound.playClick();
              setNotesMode(!notesMode);
            }}
            className={`comic-btn flex-1 py-2 rounded-xl border-2 border-black font-comic font-black text-sm flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#000000] transition-all active:translate-x-[1px] active:translate-y-[1px] ${
              notesMode
                ? 'bg-emerald-400 text-black'
                : 'bg-white text-black hover:bg-slate-100'
            }`}
          >
            <Edit3 className="w-4 h-4 stroke-[2.5]" />
            <span>PENCIL {notesMode ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={handleErase}
            className="comic-btn flex-1 py-2 rounded-xl bg-white hover:bg-slate-100 border-2 border-black text-black font-comic font-black text-sm flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#000000] transition-all active:translate-x-[1px] active:translate-y-[1px]"
          >
            <Eraser className="w-4 h-4 stroke-[2.5]" />
            <span>ERASE</span>
          </button>

          <button
            onClick={handleHint}
            className="comic-btn flex-1 py-2 rounded-xl bg-amber-300 hover:bg-amber-200 border-2 border-black text-black font-comic font-black text-sm flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#000000] transition-all active:translate-x-[1px] active:translate-y-[1px]"
          >
            <Lightbulb className="w-4 h-4 stroke-[2.5]" />
            <span>HINT</span>
          </button>
        </div>

        {/* Numpad 1-9 */}
        <div className="grid grid-cols-9 gap-1.5 mt-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleNumberInput(num)}
              className="comic-btn py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-comic font-black text-2xl border-3 border-black shadow-[3px_3px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] transition-all"
            >
              {num}
            </button>
          ))}
        </div>

        {/* Game Over / Win Modal */}
        {(isWon || mistakes >= 3) && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95">
            <div className="comic-panel p-6 bg-yellow-300 border-4 border-black rounded-3xl shadow-[8px_8px_0px_#000000] max-w-xs w-full">
              <h3 className="font-comic font-black text-3xl mb-2 text-black">
                {isWon ? '🎉 PUZZLE CRACKED!' : '💥 3 MISTAKES!'}
              </h3>
              <p className="text-sm font-bold text-black mb-5">
                {isWon ? 'All 81 numbers placed like a superhero!' : 'Use pencil notes next round to deduce moves!'}
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
