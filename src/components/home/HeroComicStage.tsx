import React, { useState } from 'react';
import { sound } from '../../services/audio';
import { useGameStore, GAME_CATALOG } from '../../store/gameStore';
import { Dices, Sparkles, Trophy, Zap, Flame, Play } from 'lucide-react';
import confetti from 'canvas-confetti';

const COMIC_EFFECTS = ['POW! 💥', 'BOOM! 🔥', 'BAM! ⚡', 'CRUNCH! 🐍', 'SUPER! 🌟', 'LUCKY 6! 🎲'];

export const HeroComicStage: React.FC = () => {
  const { selectGame, resetGameSession } = useGameStore();
  const [diceFace, setDiceFace] = useState(6);
  const [isRolling, setIsRolling] = useState(false);
  const [activeBurst, setActiveBurst] = useState<string | null>(null);

  const handleRollDice = () => {
    if (isRolling) return;
    setIsRolling(true);
    sound.playRollDice();

    let count = 0;
    const interval = setInterval(() => {
      setDiceFace(Math.floor(Math.random() * 6) + 1);
      count++;
      if (count > 7) {
        clearInterval(interval);
        const finalVal = Math.floor(Math.random() * 6) + 1;
        setDiceFace(finalVal);
        setIsRolling(false);
        sound.playPop();

        const burst = COMIC_EFFECTS[Math.floor(Math.random() * COMIC_EFFECTS.length)];
        setActiveBurst(burst);
        setTimeout(() => setActiveBurst(null), 1600);

        if (finalVal === 6) {
          confetti({ particleCount: 40, spread: 60, origin: { y: 0.5 } });
        }
      }
    }, 70);
  };

  const handleQuickPlay = () => {
    sound.playSelect();
    resetGameSession();
    const randomGame = GAME_CATALOG[Math.floor(Math.random() * GAME_CATALOG.length)];
    selectGame(randomGame.id);
  };

  const renderDiceDots = (num: number) => {
    switch (num) {
      case 1:
        return (
          <div className="w-full h-full flex items-center justify-center">
            <span className="w-6 h-6 rounded-full bg-rose-600 border-2 border-black shadow-inner" />
          </div>
        );
      case 2:
        return (
          <div className="w-full h-full flex justify-between p-3">
            <span className="w-5 h-5 rounded-full bg-black self-start" />
            <span className="w-5 h-5 rounded-full bg-black self-end" />
          </div>
        );
      case 3:
        return (
          <div className="w-full h-full flex justify-between p-2.5">
            <span className="w-5 h-5 rounded-full bg-black self-start" />
            <span className="w-5 h-5 rounded-full bg-black self-center" />
            <span className="w-5 h-5 rounded-full bg-black self-end" />
          </div>
        );
      case 4:
        return (
          <div className="w-full h-full grid grid-cols-2 p-2.5 gap-2 place-items-center">
            <span className="w-5 h-5 rounded-full bg-black" />
            <span className="w-5 h-5 rounded-full bg-black" />
            <span className="w-5 h-5 rounded-full bg-black" />
            <span className="w-5 h-5 rounded-full bg-black" />
          </div>
        );
      case 5:
        return (
          <div className="w-full h-full relative p-2.5">
            <span className="absolute top-3 left-3 w-4 h-4 rounded-full bg-black" />
            <span className="absolute top-3 right-3 w-4 h-4 rounded-full bg-black" />
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-rose-600 border border-black" />
            <span className="absolute bottom-3 left-3 w-4 h-4 rounded-full bg-black" />
            <span className="absolute bottom-3 right-3 w-4 h-4 rounded-full bg-black" />
          </div>
        );
      case 6:
      default:
        return (
          <div className="w-full h-full grid grid-cols-2 p-2.5 gap-1.5 place-items-center">
            <span className="w-4 h-4 rounded-full bg-black" />
            <span className="w-4 h-4 rounded-full bg-black" />
            <span className="w-4 h-4 rounded-full bg-black" />
            <span className="w-4 h-4 rounded-full bg-black" />
            <span className="w-4 h-4 rounded-full bg-black" />
            <span className="w-4 h-4 rounded-full bg-black" />
          </div>
        );
    }
  };

  return (
    <div className="relative w-full h-[360px] sm:h-[400px] comic-panel bg-yellow-300 border-4 border-black rounded-3xl p-6 shadow-[8px_8px_0px_#000000] overflow-hidden flex flex-col justify-between select-none">
      {/* Background Comic Halftone Accent & Action Stripes */}
      <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-amber-400 border-4 border-black pointer-events-none opacity-60" />
      <div className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full bg-rose-400 border-4 border-black pointer-events-none opacity-50" />

      {/* Comic Header Ribbon */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="comic-badge bg-black text-yellow-300 border-2 border-black px-3.5 py-1 rounded-xl font-comic font-black text-sm shadow-[3px_3px_0px_rgba(0,0,0,0.5)] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-yellow-300 stroke-[2.5]" />
          <span>INTERACTIVE ARENA</span>
        </div>
        <div className="comic-badge bg-white text-black border-2 border-black px-3 py-1 rounded-xl font-comic font-black text-xs shadow-[2px_2px_0px_#000000]">
          TAP DIE TO ROLL!
        </div>
      </div>

      {/* Center Interactive Tumbling Die & Comic Onomatopoeia */}
      <div className="relative z-10 my-auto flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10">
        {/* The 2D Bouncing Comic Die */}
        <div className="relative group cursor-pointer" onClick={handleRollDice}>
          {/* Action Burst Speech Bubble */}
          {activeBurst && (
            <div className="absolute -top-12 -right-14 z-30 comic-badge bg-rose-500 text-white border-3 border-black px-3 py-1 font-comic font-black text-lg rotate-12 shadow-[4px_4px_0px_#000000] animate-bounce">
              {activeBurst}
            </div>
          )}

          <div
            className={`w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-white border-4 border-black shadow-[6px_6px_0px_#000000] transition-all duration-150 flex items-center justify-center ${
              isRolling
                ? 'rotate-45 scale-90 bg-yellow-200'
                : 'group-hover:rotate-6 group-hover:scale-105 active:translate-x-[2px] active:translate-y-[2px]'
            }`}
          >
            {renderDiceDots(diceFace)}
          </div>

          <div className="text-center mt-2 font-comic font-black text-xs text-black tracking-wide">
            {isRolling ? 'ROLLING...' : `ROLLED A ${diceFace}!`}
          </div>
        </div>

        {/* Comic Feature Stickers */}
        <div className="flex flex-col gap-2.5 text-left">
          <div className="comic-panel bg-white border-3 border-black p-2.5 rounded-2xl shadow-[3px_3px_0px_#000000] flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-emerald-400 border-2 border-black flex items-center justify-center text-lg">
              🐍
            </span>
            <div>
              <div className="font-comic font-black text-sm text-black leading-tight">REAL SNAKE BITE ANIMATION</div>
              <div className="text-[10px] font-bold text-slate-700">Swallowed & sliding down the viper body!</div>
            </div>
          </div>

          <div className="comic-panel bg-white border-3 border-black p-2.5 rounded-2xl shadow-[3px_3px_0px_#000000] flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-cyan-400 border-2 border-black flex items-center justify-center text-lg">
              🪜
            </span>
            <div>
              <div className="font-comic font-black text-sm text-black leading-tight">RUNG-BY-RUNG CLIMB</div>
              <div className="text-[10px] font-bold text-slate-700">Pawn hops tile to tile & ascends ladders!</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Comic Action Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pt-2 border-t-2 border-black/30">
        <button
          onClick={handleRollDice}
          disabled={isRolling}
          className="comic-btn px-4 py-2 bg-white hover:bg-yellow-200 text-black border-2 border-black rounded-xl font-comic font-black text-sm flex items-center gap-2 shadow-[2px_2px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px]"
        >
          <Dices className={`w-4 h-4 stroke-[2.5] ${isRolling ? 'animate-spin' : ''}`} />
          <span>ROLL DIE AGAIN</span>
        </button>

        <button
          onClick={handleQuickPlay}
          className="comic-btn px-5 py-2.5 bg-rose-500 hover:bg-rose-400 text-white border-3 border-black rounded-xl font-comic font-black text-sm flex items-center gap-2 shadow-[3px_3px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px]"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>RANDOM QUICK-PLAY!</span>
        </button>
      </div>
    </div>
  );
};
