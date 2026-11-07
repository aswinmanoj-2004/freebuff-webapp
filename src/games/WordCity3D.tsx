import React, { useState } from 'react';
import { sound } from '../services/audio';
import { useAuthStore } from '../store/authStore';
import { RotateCcw, Building2, Sparkles, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CityBuilding {
  id: string;
  name: string;
  height: number;
  color: string;
  word: string;
  solved: boolean;
}

export const WordCity3D: React.FC<{ onScoreUpdate: (score: number) => void }> = ({ onScoreUpdate }) => {
  const { recordGameStats } = useAuthStore();
  const LETTERS = ['C', 'I', 'T', 'Y', 'O', 'K'];

  const [buildings, setBuildings] = useState<CityBuilding[]>([
    { id: 'b1', name: 'City Hall', height: 120, color: 'from-emerald-500 to-teal-700', word: 'CITY', solved: false },
    { id: 'b2', name: 'Sky Tower', height: 160, color: 'from-cyan-500 to-blue-700', word: 'TOY', solved: false },
    { id: 'b3', name: 'Tech Hub', height: 90, color: 'from-violet-500 to-purple-700', word: 'COT', solved: false },
    { id: 'b4', name: 'Cyber Park', height: 75, color: 'from-amber-500 to-orange-700', word: 'KIT', solved: false },
  ]);

  const [currentWord, setCurrentWord] = useState('');
  const [score, setScore] = useState(0);

  const handleLetterTap = (letter: string) => {
    sound.playClick();
    setCurrentWord((w) => w + letter);
  };

  const handleBackspace = () => {
    sound.playPop();
    setCurrentWord((w) => w.slice(0, -1));
  };

  const handleSubmitWord = () => {
    const wordUpper = currentWord.toUpperCase();
    const match = buildings.find((b) => b.word === wordUpper && !b.solved);

    if (match) {
      sound.playWin();
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
      const nextBuildings = buildings.map((b) =>
        b.id === match.id ? { ...b, solved: true } : b
      );
      setBuildings(nextBuildings);
      const nextScore = score + 250;
      setScore(nextScore);
      onScoreUpdate(nextScore);
      setCurrentWord('');

      if (nextBuildings.every((b) => b.solved)) {
        recordGameStats('word-city', nextScore, true);
      }
    } else {
      sound.playLose();
      setCurrentWord('');
    }
  };

  const handleRestart = () => {
    sound.playClick();
    setBuildings(buildings.map((b) => ({ ...b, solved: false })));
    setScore(0);
    setCurrentWord('');
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
      {/* Comic Skyline City View */}
      <div className="relative w-full max-w-lg p-6 rounded-3xl comic-panel bg-white border-4 border-black shadow-[6px_6px_0px_#000000]">
        <div className="flex items-center justify-between mb-4 px-1">
          <span className="comic-badge bg-yellow-300 text-black border-2 border-black px-3 py-1 font-comic font-black text-sm shadow-[2px_2px_0px_#000000] flex items-center gap-1.5">
            <Building2 className="w-4 h-4 stroke-[2.5]" />
            <span>WORD METROPOLIS</span>
          </span>
          <span className="comic-badge bg-cyan-300 text-black border-2 border-black px-3 py-1 font-comic font-black text-sm shadow-[2px_2px_0px_#000000]">
            TOWERS: {buildings.filter((b) => b.solved).length}/{buildings.length}
          </span>
        </div>

        {/* Dynamic Comic City Skyline Platform */}
        <div className="relative w-full h-44 bg-amber-50 rounded-2xl border-3 border-black flex items-end justify-center gap-6 px-6 pb-2 overflow-hidden shadow-inner">
          {buildings.map((b) => (
            <div key={b.id} className="flex flex-col items-center">
              <div
                className={`w-14 rounded-t-xl border-3 border-black transition-all duration-700 ease-out flex flex-col items-center justify-between py-2 shadow-[3px_3px_0px_#000000] ${
                  b.color
                } ${b.solved ? 'opacity-100' : 'h-6 opacity-30 grayscale'}`}
                style={{ height: b.solved ? `${b.height}px` : '24px' }}
              >
                {b.solved && (
                  <span className="text-[11px] font-comic font-black text-white tracking-widest">
                    {b.word}
                  </span>
                )}
                {b.solved && <div className="w-2.5 h-2.5 rounded-full bg-yellow-300 border border-black animate-pulse" />}
              </div>
              <span className="text-[11px] font-comic font-black text-black mt-1">{b.name}</span>
            </div>
          ))}
        </div>

        {/* Current Guess Display */}
        <div className="my-4 h-14 rounded-2xl bg-yellow-300 border-3 border-black flex items-center justify-between px-4 shadow-[3px_3px_0px_#000000]">
          <span className="text-2xl font-comic font-black tracking-widest text-black">
            {currentWord || <span className="text-xs font-sans font-bold text-slate-700 tracking-normal">Tap letters below to spell...</span>}
          </span>
          {currentWord && (
            <button
              onClick={handleBackspace}
              className="comic-btn px-3 py-1 rounded-lg bg-rose-500 text-white font-comic font-black text-xs border-2 border-black shadow-[2px_2px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px]"
            >
              CLEAR
            </button>
          )}
        </div>

        {/* Letter Wheel / Anagram Buttons */}
        <div className="grid grid-cols-6 gap-2 mb-4">
          {LETTERS.map((letter, idx) => (
            <button
              key={`${letter}-${idx}`}
              onClick={() => handleLetterTap(letter)}
              className="comic-btn py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-comic font-black text-2xl border-3 border-black shadow-[3px_3px_0px_#000000] transition-all active:translate-x-[1px] active:translate-y-[1px]"
            >
              {letter}
            </button>
          ))}
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmitWord}
          disabled={!currentWord}
          className="comic-btn w-full py-3 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-black font-comic font-black text-lg uppercase tracking-wider border-3 border-black shadow-[4px_4px_0px_#000000] transition-all active:translate-x-[2px] active:translate-y-[2px] disabled:opacity-40"
        >
          BUILD TOWER!
        </button>
      </div>
    </div>
  );
};
