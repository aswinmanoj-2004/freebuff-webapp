import React, { useState, useEffect } from 'react';
import { sound } from '../services/audio';
import { useAuthStore } from '../store/authStore';
import { RotateCcw, Bot, Users, Trophy, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

type Player = 'X' | 'O';
type Board = (Player | null)[];
type Difficulty = 'easy' | 'medium' | 'hard';

export const TicTacToe3D: React.FC<{ onScoreUpdate: (score: number) => void }> = ({ onScoreUpdate }) => {
  const { recordGameStats } = useAuthStore();

  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [turn, setTurn] = useState<Player>('X');
  const [winner, setWinner] = useState<Player | 'draw' | null>(null);
  const [winningCombo, setWinningCombo] = useState<number[] | null>(null);
  const [mode, setMode] = useState<'pve' | 'pvp'>('pve');
  const [difficulty, setDifficulty] = useState<Difficulty>('hard');
  const [scores, setScores] = useState({ X: 0, O: 0, ties: 0 });
  const [isAiThinking, setIsAiThinking] = useState(false);

  // Winning combinations
  const WINNING_COMBOS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6],            // Diagonals
  ];

  const checkWinner = (b: Board): { winner: Player | 'draw' | null; combo?: number[] } => {
    for (const combo of WINNING_COMBOS) {
      const [a, bIdx, c] = combo;
      if (b[a] && b[a] === b[bIdx] && b[a] === b[c]) {
        return { winner: b[a], combo };
      }
    }
    if (b.every((cell) => cell !== null)) {
      return { winner: 'draw' };
    }
    return { winner: null };
  };

  // Minimax Algorithm for Hard AI
  const minimax = (b: Board, depth: number, isMaximizing: boolean): { score: number; move?: number } => {
    const res = checkWinner(b);
    if (res.winner === 'O') return { score: 10 - depth };
    if (res.winner === 'X') return { score: depth - 10 };
    if (res.winner === 'draw') return { score: 0 };

    const availableMoves: number[] = [];
    b.forEach((val, idx) => {
      if (val === null) availableMoves.push(idx);
    });

    if (isMaximizing) {
      let maxEval = -Infinity;
      let bestMove = availableMoves[0];
      for (const move of availableMoves) {
        b[move] = 'O';
        const evaluation = minimax(b, depth + 1, false).score;
        b[move] = null;
        if (evaluation > maxEval) {
          maxEval = evaluation;
          bestMove = move;
        }
      }
      return { score: maxEval, move: bestMove };
    } else {
      let minEval = Infinity;
      let bestMove = availableMoves[0];
      for (const move of availableMoves) {
        b[move] = 'X';
        const evaluation = minimax(b, depth + 1, true).score;
        b[move] = null;
        if (evaluation < minEval) {
          minEval = evaluation;
          bestMove = move;
        }
      }
      return { score: minEval, move: bestMove };
    }
  };

  const getAiMove = (b: Board): number => {
    const availableMoves: number[] = [];
    b.forEach((val, idx) => {
      if (val === null) availableMoves.push(idx);
    });

    if (availableMoves.length === 0) return 0;

    if (difficulty === 'easy') {
      return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }

    if (difficulty === 'medium') {
      // 50% minimax, 50% random
      if (Math.random() > 0.5) {
        const result = minimax(b, 0, true);
        return result.move !== undefined ? result.move : availableMoves[0];
      }
      return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }

    // Hard: pure minimax
    const result = minimax(b, 0, true);
    return result.move !== undefined ? result.move : availableMoves[0];
  };

  const makeMove = (index: number, player: Player) => {
    if (board[index] || winner || isAiThinking) return;

    sound.playSelect();
    const newBoard = [...board];
    newBoard[index] = player;
    setBoard(newBoard);

    const result = checkWinner(newBoard);

    if (result.winner) {
      setWinner(result.winner);
      if (result.combo) setWinningCombo(result.combo);

      if (result.winner === 'X') {
        sound.playWin();
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        setScores((s) => ({ ...s, X: s.X + 1 }));
        recordGameStats('tic-tac-toe', 200, true);
        onScoreUpdate(200);
      } else if (result.winner === 'O') {
        sound.playLose();
        setScores((s) => ({ ...s, O: s.O + 1 }));
        recordGameStats('tic-tac-toe', 50, false);
      } else {
        sound.playPop();
        setScores((s) => ({ ...s, ties: s.ties + 1 }));
      }
      return;
    }

    const nextTurn = player === 'X' ? 'O' : 'X';
    setTurn(nextTurn);

    // AI Turn in PvE
    if (mode === 'pve' && nextTurn === 'O') {
      setIsAiThinking(true);
      setTimeout(() => {
        const aiIndex = getAiMove(newBoard);
        setIsAiThinking(false);
        makeMove(aiIndex, 'O');
      }, 450);
    }
  };

  const handleRestart = () => {
    sound.playClick();
    setBoard(Array(9).fill(null));
    setTurn('X');
    setWinner(null);
    setWinningCombo(null);
    setIsAiThinking(false);
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-4 select-none">
      {/* Top Floating Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2 rounded-2xl comic-panel bg-yellow-300 border-3 border-black shadow-[4px_4px_0px_#000000] max-w-md w-full mb-4">
        {/* Mode Selector */}
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
            <Bot className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>VS BOT</span>
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
            <Users className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>2-PLAYER</span>
          </button>
        </div>

        {/* Difficulty Pill (PvE only) */}
        {mode === 'pve' && (
          <div className="flex items-center gap-1">
            {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
              <button
                key={d}
                onClick={() => {
                  sound.playClick();
                  setDifficulty(d);
                  handleRestart();
                }}
                className={`px-2 py-0.5 text-[10px] font-comic font-black uppercase rounded border border-black ${
                  difficulty === d ? 'bg-rose-500 text-white' : 'bg-white text-black'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Comic Score Chips */}
      <div className="flex items-center justify-center gap-4 mb-3 font-comic font-black text-xs">
        <div className="comic-badge bg-rose-400 text-black border-2 border-black px-3 py-1 rounded-xl shadow-[2px_2px_0px_#000000]">
          P1 (X): {scores.X}
        </div>
        <div className="comic-badge bg-cyan-400 text-black border-2 border-black px-3 py-1 rounded-xl shadow-[2px_2px_0px_#000000]">
          {mode === 'pve' ? 'BOT' : 'P2'} (O): {scores.O}
        </div>
        <div className="comic-badge bg-white text-black border-2 border-black px-3 py-1 rounded-xl shadow-[2px_2px_0px_#000000]">
          DRAWS: {scores.ties}
        </div>
      </div>

      {/* 2D Comic 3x3 Grid Board */}
      <div className="relative p-4 sm:p-6 rounded-3xl comic-panel bg-white border-4 border-black shadow-[8px_8px_0px_#000000] max-w-sm w-full">
        {/* Turn Indicator Banner */}
        <div className="text-center mb-3">
          <span className="comic-badge bg-yellow-300 text-black border-2 border-black px-4 py-1 rounded-xl font-comic font-black text-sm shadow-[2px_2px_0px_#000000]">
            {winner
              ? winner === 'draw'
                ? "IT'S A DRAW!"
                : `🎉 ${winner === 'X' ? 'P1 (X)' : mode === 'pve' ? 'BOT (O)' : 'P2 (O)'} WINS!`
              : isAiThinking
              ? 'BOT IS THINKING...'
              : `CURRENT TURN: ${turn === 'X' ? 'P1 (X)' : mode === 'pve' ? 'BOT (O)' : 'P2 (O)'}`}
          </span>
        </div>

        {/* 3x3 Cells */}
        <div className="grid grid-cols-3 gap-2.5 p-3 bg-amber-50 rounded-2xl border-3 border-black">
          {board.map((cell, idx) => {
            const isWinningCell = winningCombo?.includes(idx);
            return (
              <button
                key={idx}
                onClick={() => makeMove(idx, turn)}
                disabled={cell !== null || winner !== null || isAiThinking}
                className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-3 border-black font-comic font-black text-5xl sm:text-6xl flex items-center justify-center transition-all duration-150 ${
                  cell === null
                    ? 'bg-white hover:bg-yellow-100 hover:scale-[1.03] active:scale-95 cursor-pointer shadow-[3px_3px_0px_#000000]'
                    : isWinningCell
                    ? 'bg-yellow-300 text-black ring-4 ring-black scale-105 shadow-[4px_4px_0px_#000000] animate-pulse'
                    : cell === 'X'
                    ? 'bg-rose-100 text-rose-600 shadow-[2px_2px_0px_#000000]'
                    : 'bg-cyan-100 text-cyan-600 shadow-[2px_2px_0px_#000000]'
                }`}
              >
                {cell === 'X' ? '✕' : cell === 'O' ? '○' : ''}
              </button>
            );
          })}
        </div>

        {/* Restart Button */}
        <div className="mt-4 flex justify-center">
          <button
            onClick={handleRestart}
            className="comic-btn px-6 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-comic font-black text-sm uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_#000000] flex items-center gap-2 active:translate-x-[1px] active:translate-y-[1px]"
          >
            <RotateCcw className="w-4 h-4 stroke-[2.5]" />
            <span>RESET BOARD</span>
          </button>
        </div>
      </div>
    </div>
  );
};
