import React, { useState } from 'react';
import { sound } from '../services/audio';
import { useAuthStore } from '../store/authStore';
import { RotateCcw, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

type Grid = number[][];

interface Shape {
  id: number;
  matrix: number[][];
  color: string;
}

const AVAILABLE_SHAPES: Omit<Shape, 'id'>[] = [
  { matrix: [[1, 1], [1, 1]], color: 'bg-emerald-500 border-emerald-400' }, // 2x2
  { matrix: [[1, 1, 1]], color: 'bg-cyan-500 border-cyan-400' }, // 1x3
  { matrix: [[1], [1], [1]], color: 'bg-cyan-500 border-cyan-400' }, // 3x1
  { matrix: [[1, 0], [1, 1]], color: 'bg-amber-500 border-amber-400' }, // L
  { matrix: [[1, 1, 1], [0, 1, 0]], color: 'bg-violet-500 border-violet-400' }, // T
  { matrix: [[1]], color: 'bg-rose-500 border-rose-400' }, // 1x1
  { matrix: [[1, 1]], color: 'bg-indigo-500 border-indigo-400' }, // 1x2
];

export const BlockyBlast3D: React.FC<{ onScoreUpdate: (score: number) => void }> = ({ onScoreUpdate }) => {
  const { recordGameStats } = useAuthStore();
  const GRID_SIZE = 8;
  const [grid, setGrid] = useState<Grid>(() =>
    Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(0))
  );
  const [score, setScore] = useState(0);
  const [selectedShape, setSelectedShape] = useState<Shape | null>(null);
  const [shapesQueue, setShapesQueue] = useState<Shape[]>(() => generateShapes());
  const [gameOver, setGameOver] = useState(false);

  function generateShapes(): Shape[] {
    return [0, 1, 2].map((id) => {
      const template = AVAILABLE_SHAPES[Math.floor(Math.random() * AVAILABLE_SHAPES.length)];
      return { id, matrix: template.matrix, color: template.color };
    });
  }

  const handleCellClick = (r: number, c: number) => {
    if (!selectedShape || gameOver) return;

    // Check if shape fits at (r, c)
    const shapeRows = selectedShape.matrix.length;
    const shapeCols = selectedShape.matrix[0].length;

    if (r + shapeRows > GRID_SIZE || c + shapeCols > GRID_SIZE) {
      sound.playLose();
      return;
    }

    for (let dr = 0; dr < shapeRows; dr++) {
      for (let dc = 0; dc < shapeCols; dc++) {
        if (selectedShape.matrix[dr][dc] === 1 && grid[r + dr][c + dc] !== 0) {
          sound.playLose();
          return;
        }
      }
    }

    // Valid placement!
    sound.playPop();
    const nextGrid = grid.map((row) => [...row]);
    for (let dr = 0; dr < shapeRows; dr++) {
      for (let dc = 0; dc < shapeCols; dc++) {
        if (selectedShape.matrix[dr][dc] === 1) {
          nextGrid[r + dr][c + dc] = 1;
        }
      }
    }

    // Check complete rows and columns to clear
    const rowsToClear: number[] = [];
    const colsToClear: number[] = [];

    for (let i = 0; i < GRID_SIZE; i++) {
      if (nextGrid[i].every((val) => val === 1)) rowsToClear.push(i);
      if (nextGrid.every((row) => row[i] === 1)) colsToClear.push(i);
    }

    let clearedLines = rowsToClear.length + colsToClear.length;
    if (clearedLines > 0) {
      sound.playWin();
      confetti({ particleCount: 50 * clearedLines, spread: 60, origin: { y: 0.6 } });
      rowsToClear.forEach((rowIdx) => {
        for (let colIdx = 0; colIdx < GRID_SIZE; colIdx++) nextGrid[rowIdx][colIdx] = 0;
      });
      colsToClear.forEach((colIdx) => {
        for (let rowIdx = 0; rowIdx < GRID_SIZE; rowIdx++) nextGrid[rowIdx][colIdx] = 0;
      });
    }

    const points = 20 + clearedLines * 100;
    const nextScore = score + points;
    setScore(nextScore);
    onScoreUpdate(nextScore);
    setGrid(nextGrid);

    // Consume used shape
    const remaining = shapesQueue.filter((s) => s.id !== selectedShape.id);
    if (remaining.length === 0) {
      setShapesQueue(generateShapes());
    } else {
      setShapesQueue(remaining);
    }
    setSelectedShape(null);
  };

  const handleRestart = () => {
    sound.playClick();
    setGrid(Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(0)));
    setScore(0);
    setShapesQueue(generateShapes());
    setSelectedShape(null);
    setGameOver(false);
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
      {/* 8x8 Grid Container */}
      <div className="relative p-4 sm:p-6 rounded-3xl comic-panel bg-white border-4 border-black shadow-[6px_6px_0px_#000000] max-w-md w-full">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="comic-badge bg-yellow-300 text-black border-2 border-black px-3 py-1 font-comic font-black text-sm shadow-[2px_2px_0px_#000000]">
            BLOCKY BLAST 8×8
          </span>
          <span className="comic-badge bg-cyan-300 text-black border-2 border-black px-3 py-1 font-comic font-black text-sm shadow-[2px_2px_0px_#000000]">
            SCORE: {score}
          </span>
        </div>

        <div className="grid grid-cols-8 gap-1 p-2 bg-amber-50 rounded-2xl border-3 border-black shadow-inner">
          {grid.map((row, r) =>
            row.map((val, c) => (
              <button
                key={`${r}-${c}`}
                onClick={() => handleCellClick(r, c)}
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg border-2 border-black transition-all ${
                  val === 1
                    ? 'bg-yellow-400 shadow-[2px_2px_0px_#000000]'
                    : 'bg-white hover:bg-yellow-100'
                }`}
              />
            ))
          )}
        </div>

        {/* Shapes Drawer: Select a shape to place */}
        <div className="mt-4 pt-3 border-t-2 border-black">
          <div className="text-xs font-comic font-black text-black text-center mb-2">
            {selectedShape ? '⚡ SHAPE CHOSEN! CLICK ON GRID TO DROP.' : 'SELECT A BLOCK SHAPE BELOW:'}
          </div>
          <div className="flex items-center justify-center gap-4">
            {shapesQueue.map((s) => {
              const isSelected = selectedShape?.id === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    sound.playSelect();
                    setSelectedShape(s);
                  }}
                  className={`comic-btn p-2 rounded-xl border-2 border-black flex flex-col gap-0.5 items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-yellow-300 ring-2 ring-black scale-105 shadow-[3px_3px_0px_#000000]'
                      : 'bg-white hover:bg-amber-100 shadow-[2px_2px_0px_#000000]'
                  }`}
                >
                  {s.matrix.map((row, r) => (
                    <div key={r} className="flex gap-0.5">
                      {row.map((cell, c) => (
                        <div
                          key={c}
                          className={`w-3.5 h-3.5 rounded-sm border border-black ${
                            cell === 1 ? s.color : 'opacity-0 border-none'
                          }`}
                        />
                      ))}
                    </div>
                  ))}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
