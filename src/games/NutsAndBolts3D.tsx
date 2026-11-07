import React, { useState, useEffect } from 'react';
import { sound } from '../services/audio';
import { useAuthStore } from '../store/authStore';
import { RotateCcw, Wrench, Sparkles, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Hole {
  id: string;
  x: number;
  y: number;
  hasBolt: boolean;
  boltColor?: string;
}

interface Plate {
  id: string;
  color: string;
  width: number;
  height: number;
  x: number;
  y: number;
  requiredHoles: string[];
  isFallen: boolean;
}

export const NutsAndBolts3D: React.FC<{ onScoreUpdate: (score: number) => void }> = ({ onScoreUpdate }) => {
  const { recordGameStats } = useAuthStore();
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [selectedBolt, setSelectedBolt] = useState<string | null>(null);

  // Holes grid
  const [holes, setHoles] = useState<Hole[]>([
    { id: 'h1', x: 20, y: 25, hasBolt: true, boltColor: '#10b981' },
    { id: 'h2', x: 80, y: 25, hasBolt: true, boltColor: '#06b6d4' },
    { id: 'h3', x: 50, y: 50, hasBolt: false },
    { id: 'h4', x: 20, y: 75, hasBolt: true, boltColor: '#f59e0b' },
    { id: 'h5', x: 80, y: 75, hasBolt: false },
  ]);

  // Physical plates hanging on the bolts
  const [plates, setPlates] = useState<Plate[]>([
    {
      id: 'p1',
      color: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
      width: 220,
      height: 70,
      x: 50,
      y: 25,
      requiredHoles: ['h1', 'h2'],
      isFallen: false,
    },
    {
      id: 'p2',
      color: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300',
      width: 70,
      height: 180,
      x: 20,
      y: 50,
      requiredHoles: ['h1', 'h4'],
      isFallen: false,
    },
  ]);

  const [isLevelCleared, setIsLevelCleared] = useState(false);

  const handleHoleClick = (holeId: string) => {
    const target = holes.find((h) => h.id === holeId);
    if (!target) return;

    if (target.hasBolt) {
      // Unscrew the bolt
      sound.playScrew();
      setSelectedBolt(holeId);
    } else if (selectedBolt) {
      // Move bolt to empty hole
      sound.playScrew();
      const boltHole = holes.find((h) => h.id === selectedBolt);
      if (!boltHole) return;

      const nextHoles = holes.map((h) => {
        if (h.id === selectedBolt) return { ...h, hasBolt: false, boltColor: undefined };
        if (h.id === holeId) return { ...h, hasBolt: true, boltColor: boltHole.boltColor || '#10b981' };
        return h;
      });

      setHoles(nextHoles);
      setSelectedBolt(null);

      // Check which plates are freed (no bolts in their required holes)
      setTimeout(() => {
        checkPlates(nextHoles);
      }, 250);
    }
  };

  const checkPlates = (currentHoles: Hole[]) => {
    const boltHoleIds = new Set(currentHoles.filter((h) => h.hasBolt).map((h) => h.id));

    let freedCount = 0;
    const nextPlates = plates.map((plate) => {
      if (plate.isFallen) return plate;
      const stillHeld = plate.requiredHoles.some((req) => boltHoleIds.has(req));
      if (!stillHeld) {
        sound.playHop();
        freedCount++;
        return { ...plate, isFallen: true };
      }
      return plate;
    });

    setPlates(nextPlates);

    if (freedCount > 0) {
      const nextScore = score + freedCount * 150;
      setScore(nextScore);
      onScoreUpdate(nextScore);
    }

    // All plates fallen = level clear
    if (nextPlates.every((p) => p.isFallen)) {
      sound.playWin();
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      setIsLevelCleared(true);
      recordGameStats('nuts-bolts', score + 300, true);
    }
  };

  const handleRestart = () => {
    sound.playClick();
    setSelectedBolt(null);
    setIsLevelCleared(false);
    setHoles([
      { id: 'h1', x: 20, y: 25, hasBolt: true, boltColor: '#10b981' },
      { id: 'h2', x: 80, y: 25, hasBolt: true, boltColor: '#06b6d4' },
      { id: 'h3', x: 50, y: 50, hasBolt: false },
      { id: 'h4', x: 20, y: 75, hasBolt: true, boltColor: '#f59e0b' },
      { id: 'h5', x: 80, y: 75, hasBolt: false },
    ]);
    setPlates([
      {
        id: 'p1',
        color: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
        width: 220,
        height: 70,
        x: 50,
        y: 25,
        requiredHoles: ['h1', 'h2'],
        isFallen: false,
      },
      {
        id: 'p2',
        color: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300',
        width: 70,
        height: 180,
        x: 20,
        y: 50,
        requiredHoles: ['h1', 'h4'],
        isFallen: false,
      },
    ]);
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
      {/* Comic Mechanical Board */}
      <div className="relative w-80 sm:w-96 h-96 p-4 rounded-3xl comic-panel bg-white border-4 border-black shadow-[6px_6px_0px_#000000] flex flex-col justify-between overflow-hidden">
        {/* Top Info */}
        <div className="flex items-center justify-between px-1 z-20">
          <span className="comic-badge bg-yellow-300 text-black border-2 border-black px-2.5 py-0.5 font-comic font-black text-xs shadow-[2px_2px_0px_#000000] flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>LEVEL {level}</span>
          </span>
          <span className="comic-badge bg-cyan-300 text-black border-2 border-black px-2.5 py-0.5 font-comic font-black text-xs shadow-[2px_2px_0px_#000000]">
            PLATES LEFT: {plates.filter((p) => !p.isFallen).length}
          </span>
        </div>

        {/* Comic Work Surface Area */}
        <div className="relative w-full h-72 bg-amber-50 rounded-2xl border-3 border-black shadow-inner overflow-hidden">
          {/* Overlapping Comic Plates */}
          {plates.map((plate) => (
            <div
              key={plate.id}
              className={`absolute rounded-2xl border-3 border-black transition-all duration-700 ease-out flex items-center justify-center font-comic font-black text-xs pointer-events-none shadow-[3px_3px_0px_#000000] ${
                plate.color
              } ${plate.isFallen ? 'translate-y-96 opacity-0 rotate-12' : ''}`}
              style={{
                width: `${plate.width}px`,
                height: `${plate.height}px`,
                left: `${plate.x}%`,
                top: `${plate.y}%`,
                transform: `translate(-50%, -50%)`,
              }}
            >
              {!plate.isFallen && <span className="text-black font-comic tracking-wider">PLATE {plate.id.toUpperCase()}</span>}
            </div>
          ))}

          {/* Screw Holes & Screws */}
          {holes.map((hole) => {
            const isSelected = selectedBolt === hole.id;
            return (
              <button
                key={hole.id}
                onClick={() => handleHoleClick(hole.id)}
                className={`absolute w-10 h-10 -ml-5 -mt-5 rounded-full border-3 border-black flex items-center justify-center transition-all cursor-pointer z-10 ${
                  hole.hasBolt
                    ? 'shadow-[2px_2px_0px_#000000] hover:scale-110 active:scale-95'
                    : isSelected
                    ? 'bg-yellow-300 animate-pulse'
                    : 'bg-slate-300 hover:bg-slate-200'
                }`}
                style={{
                  left: `${hole.x}%`,
                  top: `${hole.y}%`,
                  backgroundColor: hole.hasBolt ? hole.boltColor : undefined,
                }}
              >
                {hole.hasBolt ? (
                  <div className="w-5 h-5 rounded-full border-2 border-black bg-white/40 flex items-center justify-center text-[10px] text-black font-black">
                    ✕
                  </div>
                ) : (
                  <div className="w-2.5 h-2.5 rounded-full bg-black" />
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Helper text */}
        <div className="text-center text-xs font-comic font-black text-black z-20">
          {selectedBolt
            ? '⚡ BOLT UNSCREWED! TAP AN EMPTY HOLE TO SCREW IT.'
            : 'TAP ANY COLORED BOLT TO UNSCREW IT.'}
        </div>

        {/* Level Complete Modal */}
        {isLevelCleared && (
          <div className="absolute inset-0 z-30 bg-black/80 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95">
            <div className="comic-panel p-6 bg-yellow-300 border-4 border-black rounded-3xl shadow-[8px_8px_0px_#000000] max-w-xs w-full">
              <h3 className="font-comic font-black text-3xl mb-1 text-black">🎉 STRUCTURE CLEARED!</h3>
              <p className="text-sm font-bold text-black mb-4">All plates successfully dropped!</p>
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
