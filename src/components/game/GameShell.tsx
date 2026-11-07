import React, { useState } from 'react';
import { GameMetadata } from '../../store/gameStore';
import { useAuthStore } from '../../store/authStore';
import { useAudioStore } from '../../store/audioStore';
import { sound } from '../../services/audio';
import { 
  ArrowLeft, 
  Pause, 
  Play, 
  RotateCcw, 
  HelpCircle, 
  Volume2, 
  VolumeX, 
  ChevronDown, 
  ChevronUp, 
  Trophy 
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface GameShellProps {
  game: GameMetadata;
  onBackToHub: () => void;
  children: React.ReactNode;
  score: number;
  timeElapsed: number;
  onRestart: () => void;
}

export const GameShell: React.FC<GameShellProps> = ({
  game,
  onBackToHub,
  children,
  score,
  timeElapsed,
  onRestart,
}) => {
  const { user } = useAuthStore();
  const { soundEnabled, toggleSound } = useAudioStore();

  const [isPaused, setIsPaused] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [dockCollapsed, setDockCollapsed] = useState(false);

  const userStats = user?.stats[game.id];
  const bestScore = userStats?.highScore || 0;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handlePauseToggle = () => {
    sound.playClick();
    setIsPaused(!isPaused);
  };

  const handleRestart = () => {
    sound.playClick();
    setIsPaused(false);
    onRestart();
  };

  return (
    <div className="relative w-full h-[calc(100vh-65px)] min-h-[580px] comic-dots-dark overflow-hidden select-none">
      {/* 1. Top Comic HUD Bar */}
      <div className="absolute top-4 inset-x-4 sm:inset-x-8 z-30 flex items-center justify-between pointer-events-none">
        {/* Left: Back & Game Title */}
        <div className="flex items-center gap-2.5 pointer-events-auto">
          <button
            onClick={() => {
              sound.playClick();
              onBackToHub();
            }}
            className="comic-btn px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-yellow-300 text-black text-xs font-comic flex items-center gap-1.5 cursor-pointer shadow-[3px_3px_0px_#000000]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>EXIT TO HUB</span>
          </button>

          <div className="comic-badge px-3 py-1 rounded-xl bg-white text-black border-2 border-black shadow-[2px_2px_0px_#000000]">
            <span className="font-comic text-sm uppercase">{game.title}</span>
          </div>
        </div>

        {/* Center: Live Score & Timer HUD */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="comic-badge px-3 py-1 rounded-xl bg-amber-300 text-black border-2 border-black shadow-[2px_2px_0px_#000000] flex items-center gap-1.5">
            <span className="text-[10px] text-slate-800 font-bold uppercase">SCORE:</span>
            <span className="font-mono font-black text-sm tabular-nums">
              {score}
            </span>
          </div>

          <div className="hidden sm:flex comic-badge px-3 py-1 rounded-xl bg-white text-black border-2 border-black shadow-[2px_2px_0px_#000000] items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            <span className="text-[10px] text-slate-800 font-bold uppercase">BEST:</span>
            <span className="font-mono font-bold text-sm tabular-nums">
              {bestScore}
            </span>
          </div>

          <div className="comic-badge px-3 py-1 rounded-xl bg-cyan-300 text-black border-2 border-black shadow-[2px_2px_0px_#000000] font-mono text-xs font-bold tabular-nums">
            {formatTime(timeElapsed)}
          </div>
        </div>

        {/* Right: Quick Actions */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => {
              sound.playClick();
              setShowRules(true);
            }}
            aria-label="How to play"
            className="comic-btn p-2 rounded-xl bg-white hover:bg-slate-100 text-black cursor-pointer shadow-[2px_2px_0px_#000000]"
          >
            <HelpCircle className="w-4 h-4 text-slate-900" />
          </button>

          <button
            onClick={handlePauseToggle}
            aria-label={isPaused ? 'Resume game' : 'Pause game'}
            className="comic-btn p-2 rounded-xl bg-amber-400 hover:bg-yellow-300 text-black cursor-pointer shadow-[2px_2px_0px_#000000]"
          >
            {isPaused ? <Play className="w-4 h-4 fill-black" /> : <Pause className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 2. Main 3D Viewport Render Zone */}
      <div className="w-full h-full relative">
        {children}
      </div>

      {/* 3. Unified Collapsible Comic Bottom Dock */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 w-auto max-w-[94vw] flex flex-col items-center">
        {/* Collapse / Expand Tab */}
        <button
          onClick={() => {
            sound.playClick();
            setDockCollapsed(!dockCollapsed);
          }}
          className="mb-1 comic-btn px-3 py-0.5 rounded-t-lg bg-amber-400 hover:bg-yellow-300 text-[10px] font-comic text-black flex items-center gap-1 shadow-[2px_2px_0px_#000000] cursor-pointer"
        >
          {dockCollapsed ? (
            <>
              <ChevronUp className="w-3 h-3" />
              <span>SHOW CONTROLS</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3 h-3" />
              <span>CINEMA MODE</span>
            </>
          )}
        </button>

        {/* Dock Bar */}
        {!dockCollapsed && (
          <div className="comic-panel flex items-center gap-2 p-1.5 px-3 rounded-2xl bg-white shadow-[4px_4px_0px_#000000]">
            {/* Audio Toggle */}
            <button
              onClick={toggleSound}
              aria-label={soundEnabled ? 'Mute sound' : 'Unmute sound'}
              className="comic-btn p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-black cursor-pointer"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <VolumeX className="w-4 h-4 text-rose-600" />
              )}
            </button>

            <div className="w-0.5 h-6 bg-black" />

            {/* Restart Button */}
            <button
              onClick={handleRestart}
              className="comic-btn flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-yellow-300 text-xs font-comic text-black cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>RESTART</span>
            </button>

            <div className="w-0.5 h-6 bg-black" />

            {/* Comic Sticker */}
            <span className="comic-badge text-[10px] bg-rose-400 text-white px-2 py-0.5 rounded">
              ★ READY!
            </span>
          </div>
        )}
      </div>

      {/* 4. Comic Pause Overlay Modal */}
      {isPaused && (
        <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="comic-panel w-full max-w-sm rounded-3xl p-6 sm:p-8 bg-white border-4 border-black text-center text-slate-900 shadow-[8px_8px_0px_#000000] animate-in zoom-in-95">
            <div className="comic-badge inline-block p-3 rounded-2xl bg-amber-400 border-3 border-black text-black mb-3 rotate-[-4deg]">
              <Pause className="w-8 h-8" />
            </div>
            <h2 className="font-comic text-3xl tracking-wide text-black mb-1">GAME PAUSED!</h2>
            <p className="text-xs font-bold text-slate-600 mb-6">
              Take a breath! Your 3D positions and score are safely held.
            </p>

            <div className="space-y-2.5">
              <button
                onClick={handlePauseToggle}
                className="comic-btn w-full py-2.5 bg-emerald-400 hover:bg-emerald-300 text-black text-base rounded-xl cursor-pointer"
              >
                RESUME PLAYING!
              </button>
              <button
                onClick={handleRestart}
                className="comic-btn w-full py-2.5 bg-amber-400 hover:bg-yellow-300 text-black text-base rounded-xl cursor-pointer"
              >
                RESTART SESSION
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  onBackToHub();
                }}
                className="comic-btn w-full py-2 bg-slate-100 hover:bg-slate-200 text-black text-xs rounded-xl cursor-pointer"
              >
                EXIT TO ARCADE HUB
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Comic Rules & Tutorial Modal */}
      {showRules && (
        <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="comic-panel w-full max-w-md rounded-3xl p-6 sm:p-8 bg-white border-4 border-black text-slate-900 shadow-[8px_8px_0px_#000000] animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b-3 border-black mb-4">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-6 h-6 text-rose-500" />
                <h3 className="font-comic text-2xl text-black">HOW TO PLAY</h3>
              </div>
              <button
                onClick={() => {
                  sound.playClick();
                  setShowRules(false);
                }}
                className="comic-btn p-1 rounded-lg bg-rose-400 text-white font-bold"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-medium text-slate-800 leading-relaxed mb-6">
              <p className="bg-amber-100 p-3 rounded-xl border-2 border-black font-semibold">
                {game.rulesDesc}
              </p>

              <div className="p-3 rounded-xl bg-slate-100 border-2 border-black space-y-1.5">
                <div className="font-comic text-sm text-black tracking-wider uppercase">
                  GAME FEATURES & CONTROLS:
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-700 text-xs font-bold">
                  {game.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                setShowRules(false);
              }}
              className="comic-btn w-full py-2.5 bg-amber-400 hover:bg-yellow-300 text-black font-comic text-base rounded-xl cursor-pointer"
            >
              GOT IT, LET'S PLAY!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
