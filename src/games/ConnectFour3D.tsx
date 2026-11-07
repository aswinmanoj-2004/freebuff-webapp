import React, { useEffect, useState } from 'react';
import { sound } from '../services/audio';
import { useAuthStore } from '../store/authStore';
import { RotateCcw, Bot, Users } from 'lucide-react';
import confetti from 'canvas-confetti';

type Cell = 'red' | 'yellow' | null;

export const ConnectFour3D: React.FC<{ onScoreUpdate: (score: number) => void }> = ({ onScoreUpdate }) => {
  const { recordGameStats } = useAuthStore();
  const ROWS = 6;
  const COLS = 7;

  const [board, setBoard] = useState<Cell[][]>(() => createEmptyBoard());
  const [turn, setTurn] = useState<'red' | 'yellow'>('red');
  const [winner, setWinner] = useState<'red' | 'yellow' | 'draw' | null>(null);
  const [mode, setMode] = useState<'pve' | 'pvp'>('pve');

  function createEmptyBoard(): Cell[][] {
    return Array(ROWS).fill(null).map(() => Array(COLS).fill(null));
  }

  const dropToken = (col: number) => {
    if (winner !== null) return;

    // Find lowest available row in column
    let targetRow = -1;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (board[r][col] === null) {
        targetRow = r;
        break;
      }
    }
    if (targetRow === -1) return; // Column full

    sound.playHop();
    const newBoard = board.map((row) => [...row]);
    newBoard[targetRow][col] = turn;
    setBoard(newBoard);

    if (checkWin(newBoard, targetRow, col, turn)) {
      handleWin(turn);
      return;
    }

    if (newBoard.every((row) => row.every((c) => c !== null))) {
      sound.playPoint();
      setWinner('draw');
      return;
    }

    const nextTurn = turn === 'red' ? 'yellow' : 'red';
    setTurn(nextTurn);

    // AI turn in PvE mode
    if (mode === 'pve' && nextTurn === 'yellow') {
      setTimeout(() => {
        makeAiMove(newBoard);
      }, 450);
    }
  };

  const makeAiMove = (currentBoard: Cell[][]) => {
    // Collect valid columns
    const validCols: number[] = [];
    for (let c = 0; c < COLS; c++) {
      if (currentBoard[0][c] === null) validCols.push(c);
    }
    if (validCols.length === 0) return;

    // Smart heuristic: choose center or random valid column
    let bestCol = validCols[Math.floor(Math.random() * validCols.length)];
    if (validCols.includes(3)) bestCol = 3; // Center column preference

    let targetRow = -1;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (currentBoard[r][bestCol] === null) {
        targetRow = r;
        break;
      }
    }
    if (targetRow === -1) return;

    sound.playHop();
    const newBoard = currentBoard.map((row) => [...row]);
    newBoard[targetRow][bestCol] = 'yellow';
    setBoard(newBoard);

    if (checkWin(newBoard, targetRow, bestCol, 'yellow')) {
      handleWin('yellow');
    } else {
      setTurn('red');
    }
  };

  const checkWin = (b: Cell[][], r: number, c: number, p: Cell): boolean => {
    const directions = [
      [[0, 1], [0, -1]], // Horizontal
      [[1, 0], [-1, 0]], // Vertical
      [[1, 1], [-1, -1]], // Diagonal /
      [[1, -1], [-1, 1]], // Diagonal \
    ];

    for (const [d1, d2] of directions) {
      let count = 1;
      for (const [dr, dc] of [d1, d2]) {
        let step = 1;
        while (true) {
          const nr = r + dr * step;
          const nc = c + dc * step;
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && b[nr][nc] === p) {
            count++;
            step++;
          } else {
            break;
          }
        }
      }
      if (count >= 4) return true;
    }
    return false;
  };

  const handleWin = (wonPlayer: 'red' | 'yellow') => {
    setWinner(wonPlayer);
    if (wonPlayer === 'red') {
      sound.playWin();
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      recordGameStats('connect-four', 250, true);
      onScoreUpdate(250);
    } else {
      sound.playLose();
      recordGameStats('connect-four', 50, false);
    }
  };

  const handleRestart = () => {
    sound.playClick();
    setBoard(createEmptyBoard());
    setTurn('red');
    setWinner(null);
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
      {/* Top Floating Control */}
      <div className="absolute top-16 z-20 flex items-center gap-3 px-4 py-2 rounded-2xl comic-panel bg-yellow-300 border-3 border-black shadow-[4px_4px_0px_#000000]">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              sound.playClick();
              setMode('pve');
              handleRestart();
            }}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-comic font-black uppercase rounded-lg border-2 border-black transition-all ${
              mode === 'pve' ? 'bg-black text-yellow-300 shadow-[2px_2px_0px_rgba(0,0,0,0.4)]' : 'bg-white text-black hover:bg-yellow-100'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>vs Bot</span>
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setMode('pvp');
              handleRestart();
            }}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-comic font-black uppercase rounded-lg border-2 border-black transition-all ${
              mode === 'pvp' ? 'bg-black text-yellow-300 shadow-[2px_2px_0px_rgba(0,0,0,0.4)]' : 'bg-white text-black hover:bg-yellow-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>2-Player</span>
          </button>
        </div>

        <div className="comic-badge bg-white text-black border-2 border-black px-2.5 py-0.5 rounded-lg font-comic font-black text-xs shadow-[2px_2px_0px_#000000]">
          TURN: <span className={turn === 'red' ? 'text-rose-600 font-black' : 'text-amber-500 font-black'}>{turn.toUpperCase()}</span>
        </div>
      </div>

      {/* Comic Pop-Art Connect Four Vertical Grid */}
      <div className="relative p-4 sm:p-6 rounded-3xl comic-panel bg-blue-500 border-4 border-black shadow-[6px_6px_0px_#000000]">
        {/* Column Drop Buttons Header */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {Array(COLS).fill(0).map((_, c) => (
            <button
              key={c}
              onClick={() => dropToken(c)}
              disabled={winner !== null || board[0][c] !== null}
              className="comic-btn py-1.5 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-black text-sm font-comic font-black border-2 border-black shadow-[2px_2px_0px_#000000] transition-all disabled:opacity-20 cursor-pointer active:translate-x-[1px] active:translate-y-[1px]"
            >
              ↓
            </button>
          ))}
        </div>

        {/* 6x7 Grid Slots */}
        <div className="grid grid-cols-7 gap-2 p-3 bg-blue-600 rounded-2xl border-3 border-black shadow-inner">
          {board.map((row, r) =>
            row.map((cell, c) => (
              <div
                key={`${r}-${c}`}
                onClick={() => dropToken(c)}
                className={`w-9 h-9 sm:w-12 sm:h-12 rounded-full border-3 border-black cursor-pointer transition-all flex items-center justify-center ${
                  cell === 'red'
                    ? 'bg-rose-500 shadow-[2px_2px_0px_#000000] scale-95'
                    : cell === 'yellow'
                    ? 'bg-yellow-300 shadow-[2px_2px_0px_#000000] scale-95'
                    : 'bg-blue-800/80 hover:bg-blue-700/80'
                }`}
              />
            ))
          )}
        </div>

        {/* Winner Dialog */}
        {winner && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95">
            <div className="comic-panel p-6 bg-yellow-300 border-4 border-black rounded-3xl shadow-[8px_8px_0px_#000000] max-w-xs w-full">
              <h3 className="font-comic font-black text-3xl mb-2 text-black">
                {winner === 'draw' ? "IT'S A DRAW!" : `🎉 ${winner.toUpperCase()} WINS!`}
              </h3>
              <p className="text-sm font-bold text-black mb-5">
                {winner === 'draw' ? 'Stalemate on the vertical grid!' : 'Connected 4 in a line!'}
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
