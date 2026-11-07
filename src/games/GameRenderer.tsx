import React from 'react';
import { GameMetadata } from '../store/gameStore';
import { TicTacToe3D } from './TicTacToe3D';
import { SnakeAndLadder3D } from './SnakeAndLadder3D';
import { FlappyBird3D } from './FlappyBird3D';
import { Game20483D } from './Game20483D';
import { MemoryMatch3D } from './MemoryMatch3D';
import { MathQuiz3D } from './MathQuiz3D';
import { ConnectFour3D } from './ConnectFour3D';
import { Sudoku3D } from './Sudoku3D';
import { NutsAndBolts3D } from './NutsAndBolts3D';
import { BlockyBlast3D } from './BlockyBlast3D';
import { WordCity3D } from './WordCity3D';
import { Minesweeper3D } from './Minesweeper3D';
import { SlidePuzzle3D } from './SlidePuzzle3D';
interface GameRendererProps {
  game: GameMetadata;
  score: number;
  onScoreChange: (score: number) => void;
}

export const GameRenderer: React.FC<GameRendererProps> = ({ game, score, onScoreChange }) => {
  switch (game.id) {
    case 'tic-tac-toe':
      return <TicTacToe3D onScoreUpdate={onScoreChange} />;
    case 'snake-ladder':
      return <SnakeAndLadder3D onScoreUpdate={onScoreChange} />;
    case 'flappy-bird':
      return <FlappyBird3D onScoreUpdate={onScoreChange} />;
    case 'game-2048':
      return <Game20483D onScoreUpdate={onScoreChange} />;
    case 'memory-match':
      return <MemoryMatch3D onScoreUpdate={onScoreChange} />;
    case 'math-quiz':
      return <MathQuiz3D onScoreUpdate={onScoreChange} />;
    case 'connect-four':
      return <ConnectFour3D onScoreUpdate={onScoreChange} />;
    case 'sudoku':
      return <Sudoku3D onScoreUpdate={onScoreChange} />;
    case 'nuts-bolts':
      return <NutsAndBolts3D onScoreUpdate={onScoreChange} />;
    case 'blocky-blast':
      return <BlockyBlast3D onScoreUpdate={onScoreChange} />;
    case 'word-city':
      return <WordCity3D onScoreUpdate={onScoreChange} />;
    case 'minesweeper':
      return <Minesweeper3D onScoreUpdate={onScoreChange} />;
    case 'slide-puzzle':
      return <SlidePuzzle3D onScoreUpdate={onScoreChange} />;
    default:
      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
          <div className="comic-panel p-6 bg-yellow-300 border-4 border-black rounded-3xl shadow-[6px_6px_0px_#000000] max-w-sm">
            <h3 className="font-comic font-black text-2xl mb-2 text-black">{game.title}</h3>
            <p className="text-xs font-bold text-black">{game.shortDesc}</p>
          </div>
        </div>
      );
  }
};
