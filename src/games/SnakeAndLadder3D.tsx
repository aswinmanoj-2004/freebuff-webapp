import React, { useEffect, useRef, useState, useId } from 'react';
import { sound } from '../services/audio';
import { useAuthStore } from '../store/authStore';
import { Dices, RotateCcw, Bot, Users, Trophy, Sparkles, Volume2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PlayerState {
  id: number;
  name: string;
  tile: number;
  colorName: string;
  badgeBg: string;
  pawnColor: string;
  avatar: string;
}

// Classical Snakes and Ladders mappings
const LADDERS: Record<number, number> = {
  4: 14,
  9: 31,
  20: 38,
  28: 84, // The mega ladder
  40: 59,
  51: 67,
  63: 81,
  71: 91,
};

const SNAKES: Record<number, number> = {
  17: 7,
  54: 34,
  62: 19,
  64: 60,
  87: 24, // The colossal snake
  93: 73,
  95: 75,
  99: 78,
};

// Snake styling definition for rich realistic SVG illustration
interface SnakeDef {
  head: number;
  tail: number;
  name: string;
  skinColor: string;
  bellyColor: string;
  spotColor: string;
  curveOffset: number; // Curve bias for S-shape
}

const SNAKE_DETAILS: SnakeDef[] = [
  { head: 99, tail: 78, name: 'Royal Python', skinColor: '#15803d', bellyColor: '#86efac', spotColor: '#ca8a04', curveOffset: 12 },
  { head: 95, tail: 75, name: 'Coral Viper', skinColor: '#dc2626', bellyColor: '#fecaca', spotColor: '#000000', curveOffset: -10 },
  { head: 93, tail: 73, name: 'Green Mamba', skinColor: '#16a34a', bellyColor: '#bbf7d0', spotColor: '#14532d', curveOffset: 8 },
  { head: 87, tail: 24, name: 'Giant Anaconda', skinColor: '#365314', bellyColor: '#bef264', spotColor: '#713f12', curveOffset: -18 },
  { head: 64, tail: 60, name: 'Copperhead', skinColor: '#b45309', bellyColor: '#fde68a', spotColor: '#78350f', curveOffset: 6 },
  { head: 62, tail: 19, name: 'Rattlesnake', skinColor: '#d97706', bellyColor: '#fef08a', spotColor: '#451a03', curveOffset: -14 },
  { head: 54, tail: 34, name: 'King Cobra', skinColor: '#0f766e', bellyColor: '#99f6e4', spotColor: '#134e4a', curveOffset: 10 },
  { head: 17, tail: 7, name: 'Forest Adder', skinColor: '#7e22ce', bellyColor: '#e9d5ff', spotColor: '#3b0764', curveOffset: -8 },
];

// Map tile index 1-100 to grid percentages (x: 0-100, y: 0-100)
// Row 0 is at bottom (tiles 1-10), Row 9 is at top (tiles 91-100)
function getTileCoords(tile: number): { x: number; y: number } {
  const index = Math.max(1, Math.min(100, tile)) - 1;
  const row = Math.floor(index / 10);
  let col = index % 10;
  // Zigzag alternating rows
  if (row % 2 === 1) {
    col = 9 - col;
  }
  // Cell center percentages inside 0-100 SVG viewbox
  const x = (col + 0.5) * 10;
  const y = 100 - (row + 0.5) * 10;
  return { x, y };
}

export const SnakeAndLadder3D: React.FC<{ onScoreUpdate: (score: number) => void }> = ({ onScoreUpdate }) => {
  const { recordGameStats } = useAuthStore();
  const [mode, setMode] = useState<'pve' | 'pvp'>('pve');
  const [currentTurn, setCurrentTurn] = useState<number>(0);
  const [diceRoll, setDiceRoll] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [logMessage, setLogMessage] = useState('Roll the animated dice to start the race!');
  const [actionAlert, setActionAlert] = useState<{ text: string; tile: number; type: 'snake' | 'ladder' } | null>(null);

  // Animated visual positions for pawns
  const [players, setPlayers] = useState<PlayerState[]>([
    { id: 0, name: 'Player 1', tile: 1, colorName: 'Red', badgeBg: 'bg-rose-500', pawnColor: '#ef4444', avatar: '🦸' },
    { id: 1, name: 'Computer', tile: 1, colorName: 'Cyan', badgeBg: 'bg-cyan-500', pawnColor: '#06b6d4', avatar: '🤖' },
  ]);

  // Pawns visual coords for smooth step hops
  const [pawnPos, setPawnPos] = useState<Array<{ x: number; y: number; isHopping: boolean }>>([
    { ...getTileCoords(1), isHopping: false },
    { ...getTileCoords(1), isHopping: false },
  ]);

  // Update pawn visual positions when player tiles change (initial sync)
  useEffect(() => {
    setPawnPos([
      { ...getTileCoords(players[0].tile), isHopping: false },
      { ...getTileCoords(players[1].tile), isHopping: false },
    ]);
  }, []);

  const handleResetGame = () => {
    sound.playClick();
    setPlayers([
      { id: 0, name: 'Player 1', tile: 1, colorName: 'Red', badgeBg: 'bg-rose-500', pawnColor: '#ef4444', avatar: '🦸' },
      { id: 1, name: mode === 'pve' ? 'Computer' : 'Player 2', tile: 1, colorName: 'Cyan', badgeBg: 'bg-cyan-500', pawnColor: '#06b6d4', avatar: mode === 'pve' ? '🤖' : '🦹' },
    ]);
    setPawnPos([
      { ...getTileCoords(1), isHopping: false },
      { ...getTileCoords(1), isHopping: false },
    ]);
    setCurrentTurn(0);
    setDiceRoll(null);
    setIsRolling(false);
    setIsAnimating(false);
    setWinner(null);
    setActionAlert(null);
    setLogMessage('Fresh match! Roll the dice to begin.');
  };

  // Perform step-by-step pawn walking animation
  const stepWalkPawn = async (playerIdx: number, fromTile: number, toTile: number) => {
    const steps: number[] = [];
    if (toTile > fromTile) {
      for (let t = fromTile + 1; t <= toTile; t++) steps.push(t);
    } else {
      for (let t = fromTile - 1; t >= toTile; t--) steps.push(t);
    }

    for (const stepTile of steps) {
      const coords = getTileCoords(stepTile);
      sound.playHop();
      setPawnPos((prev) => {
        const next = [...prev];
        next[playerIdx] = { ...coords, isHopping: true };
        return next;
      });

      await new Promise((r) => setTimeout(r, 200));

      setPawnPos((prev) => {
        const next = [...prev];
        next[playerIdx] = { ...coords, isHopping: false };
        return next;
      });

      await new Promise((r) => setTimeout(r, 40));
    }
  };

  // Trigger smooth ladder climb animation
  const climbLadder = async (playerIdx: number, startTile: number, endTile: number) => {
    setActionAlert({ text: '🪜 LADDER CLIMB!', tile: startTile, type: 'ladder' });
    sound.playWin();

    // Climb in 4 intermediate rungs
    const startCoord = getTileCoords(startTile);
    const endCoord = getTileCoords(endTile);

    for (let i = 1; i <= 4; i++) {
      const progress = i / 4;
      const curX = startCoord.x + (endCoord.x - startCoord.x) * progress;
      const curY = startCoord.y + (endCoord.y - startCoord.y) * progress;

      sound.playHop();
      setPawnPos((prev) => {
        const next = [...prev];
        next[playerIdx] = { x: curX, y: curY, isHopping: true };
        return next;
      });
      await new Promise((r) => setTimeout(r, 160));
    }

    setPawnPos((prev) => {
      const next = [...prev];
      next[playerIdx] = { ...endCoord, isHopping: false };
      return next;
    });

    setTimeout(() => setActionAlert(null), 1200);
  };

  // Trigger realistic snake bite / swallow / slide animation
  const snakeBiteSlide = async (playerIdx: number, headTile: number, tailTile: number) => {
    setActionAlert({ text: '🐍 CHOMP! SNAKE BITE!', tile: headTile, type: 'snake' });
    sound.playLose();

    await new Promise((r) => setTimeout(r, 450));

    // Slide down in 5 undulating steps
    const headCoord = getTileCoords(headTile);
    const tailCoord = getTileCoords(tailTile);

    for (let i = 1; i <= 5; i++) {
      const progress = i / 5;
      const wiggle = Math.sin(progress * Math.PI * 3) * 3;
      const curX = headCoord.x + (tailCoord.x - headCoord.x) * progress + wiggle;
      const curY = headCoord.y + (tailCoord.y - headCoord.y) * progress;

      sound.playPop();
      setPawnPos((prev) => {
        const next = [...prev];
        next[playerIdx] = { x: curX, y: curY, isHopping: false };
        return next;
      });
      await new Promise((r) => setTimeout(r, 120));
    }

    setPawnPos((prev) => {
      const next = [...prev];
      next[playerIdx] = { ...tailCoord, isHopping: false };
      return next;
    });

    setTimeout(() => setActionAlert(null), 1400);
  };

  // Main turn logic
  const handleRollDice = async () => {
    if (isRolling || isAnimating || winner) return;

    setIsRolling(true);
    sound.playRollDice();

    // 2D dice tumbling cycle
    let rolls = 0;
    const rollInterval = setInterval(() => {
      setDiceRoll(Math.floor(Math.random() * 6) + 1);
      rolls++;
      if (rolls > 6) {
        clearInterval(rollInterval);
        const finalRoll = Math.floor(Math.random() * 6) + 1;
        setDiceRoll(finalRoll);
        setIsRolling(false);
        processTurn(finalRoll);
      }
    }, 75);
  };

  const processTurn = async (roll: number) => {
    setIsAnimating(true);
    const activePlayer = players[currentTurn];
    const currentTile = activePlayer.tile;
    let targetTile = currentTile + roll;

    // Classic bounce back if roll exceeds 100
    if (targetTile > 100) {
      const excess = targetTile - 100;
      targetTile = 100 - excess;
      setLogMessage(`${activePlayer.name} rolled a ${roll}! Overhot 100, bouncing back to tile ${targetTile}!`);
    } else {
      setLogMessage(`${activePlayer.name} rolled a ${roll}! Stepping from ${currentTile} to ${targetTile}...`);
    }

    // Step 1: Step-by-step walking animation
    await stepWalkPawn(currentTurn, currentTile, targetTile);

    // Step 2: Check for Snake or Ladder
    let finalTile = targetTile;
    if (LADDERS[targetTile]) {
      const ladderTop = LADDERS[targetTile];
      setLogMessage(`🪜 WOW! ${activePlayer.name} found a ladder on tile ${targetTile}! Climbing up to ${ladderTop}!`);
      await climbLadder(currentTurn, targetTile, ladderTop);
      finalTile = ladderTop;
    } else if (SNAKES[targetTile]) {
      const snakeTail = SNAKES[targetTile];
      const snakeInfo = SNAKE_DETAILS.find((s) => s.head === targetTile);
      setLogMessage(`🐍 OUCH! ${activePlayer.name} stepped into the ${snakeInfo?.name || 'Viper'} on tile ${targetTile}! Slid down to ${snakeTail}!`);
      await snakeBiteSlide(currentTurn, targetTile, snakeTail);
      finalTile = snakeTail;
    }

    // Update Player final tile
    const updatedPlayers = [...players];
    updatedPlayers[currentTurn].tile = finalTile;
    setPlayers(updatedPlayers);

    // Step 3: Check Victory (Tile 100)
    if (finalTile === 100) {
      sound.playWin();
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
      setWinner(activePlayer.name);
      setLogMessage(`🏆 VICTORY! ${activePlayer.name} has crossed the finish line at tile 100!`);
      const scoreGain = currentTurn === 0 ? 500 : 100;
      recordGameStats('snake-ladder', scoreGain, currentTurn === 0);
      onScoreUpdate(scoreGain);
      setIsAnimating(false);
      return;
    }

    // Advance turn
    const nextTurn = currentTurn === 0 ? 1 : 0;
    setCurrentTurn(nextTurn);
    setIsAnimating(false);

    // Auto-roll for computer in PvE mode
    if (mode === 'pve' && nextTurn === 1) {
      setTimeout(() => {
        handleRollDice();
      }, 700);
    }
  };

  // Render 2D Die Face Dots
  const renderDiceFace = (val: number | null) => {
    const num = val || 6;
    switch (num) {
      case 1:
        return (
          <div className="w-full h-full flex items-center justify-center">
            <span className="w-4 h-4 rounded-full bg-rose-600 border border-black" />
          </div>
        );
      case 2:
        return (
          <div className="w-full h-full flex justify-between p-2">
            <span className="w-3.5 h-3.5 rounded-full bg-black self-start" />
            <span className="w-3.5 h-3.5 rounded-full bg-black self-end" />
          </div>
        );
      case 3:
        return (
          <div className="w-full h-full flex justify-between p-1.5">
            <span className="w-3 h-3 rounded-full bg-black self-start" />
            <span className="w-3 h-3 rounded-full bg-black self-center" />
            <span className="w-3 h-3 rounded-full bg-black self-end" />
          </div>
        );
      case 4:
        return (
          <div className="w-full h-full grid grid-cols-2 p-1.5 gap-1.5 place-items-center">
            <span className="w-3 h-3 rounded-full bg-black" />
            <span className="w-3 h-3 rounded-full bg-black" />
            <span className="w-3 h-3 rounded-full bg-black" />
            <span className="w-3 h-3 rounded-full bg-black" />
          </div>
        );
      case 5:
        return (
          <div className="w-full h-full relative p-1.5">
            <span className="absolute top-2 left-2 w-3 h-3 rounded-full bg-black" />
            <span className="absolute top-2 right-2 w-3 h-3 rounded-full bg-black" />
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-rose-600 border border-black" />
            <span className="absolute bottom-2 left-2 w-3 h-3 rounded-full bg-black" />
            <span className="absolute bottom-2 right-2 w-3 h-3 rounded-full bg-black" />
          </div>
        );
      case 6:
      default:
        return (
          <div className="w-full h-full grid grid-cols-2 p-1.5 gap-1 place-items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-black" />
            <span className="w-2.5 h-2.5 rounded-full bg-black" />
            <span className="w-2.5 h-2.5 rounded-full bg-black" />
            <span className="w-2.5 h-2.5 rounded-full bg-black" />
            <span className="w-2.5 h-2.5 rounded-full bg-black" />
            <span className="w-2.5 h-2.5 rounded-full bg-black" />
          </div>
        );
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-2 sm:p-4 select-none overflow-y-auto">
      {/* Top Floating Control Bar */}
      <div className="w-full max-w-xl flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2 rounded-2xl comic-panel bg-yellow-300 border-3 border-black shadow-[4px_4px_0px_#000000] z-20">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              sound.playClick();
              setMode('pve');
              handleResetGame();
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
              handleResetGame();
            }}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-comic font-black uppercase rounded-lg border-2 border-black transition-all ${
              mode === 'pvp' ? 'bg-black text-yellow-300 shadow-[2px_2px_0px_rgba(0,0,0,0.4)]' : 'bg-white text-black hover:bg-yellow-100'
            }`}
          >
            <Users className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>2-PLAYER</span>
          </button>
        </div>

        {/* Player Position Chips */}
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg border-2 border-black font-comic text-xs font-black shadow-[2px_2px_0px_#000000] ${
            currentTurn === 0 ? 'bg-rose-400 ring-2 ring-black scale-105' : 'bg-white text-black'
          }`}>
            <span>{players[0].avatar} P1: T{players[0].tile}</span>
          </div>
          <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg border-2 border-black font-comic text-xs font-black shadow-[2px_2px_0px_#000000] ${
            currentTurn === 1 ? 'bg-cyan-400 ring-2 ring-black scale-105' : 'bg-white text-black'
          }`}>
            <span>{players[1].avatar} {mode === 'pve' ? 'BOT' : 'P2'}: T{players[1].tile}</span>
          </div>
        </div>
      </div>

      {/* Main Authentic 100-Tile Illustrated 2D Game Board */}
      <div className="relative w-full max-w-[540px] aspect-square my-2 comic-panel bg-white border-4 border-black rounded-3xl shadow-[8px_8px_0px_#000000] p-2 sm:p-3 overflow-hidden">
        {/* 10x10 Grid Tiles */}
        <div className="w-full h-full grid grid-cols-10 grid-rows-10 border-2 border-black rounded-2xl overflow-hidden relative">
          {Array.from({ length: 100 }, (_, i) => {
            const tileNum = 100 - i; // Row 9 tiles at top, row 0 tiles at bottom
            const row = Math.floor((tileNum - 1) / 10);
            let col = (tileNum - 1) % 10;
            if (row % 2 === 1) col = 9 - col;

            const isDark = (row + col) % 2 === 1;
            const isSnakeHead = Boolean(SNAKES[tileNum]);
            const isLadderBase = Boolean(LADDERS[tileNum]);
            const isStart = tileNum === 1;
            const isFinish = tileNum === 100;

            return (
              <div
                key={tileNum}
                className={`relative flex flex-col justify-between p-0.5 sm:p-1 text-[9px] sm:text-[11px] font-comic font-black border-[0.5px] border-black/20 ${
                  isFinish
                    ? 'bg-amber-300 text-black font-black'
                    : isStart
                    ? 'bg-emerald-300 text-black font-black'
                    : isSnakeHead
                    ? 'bg-rose-100 text-rose-900'
                    : isLadderBase
                    ? 'bg-sky-100 text-sky-900'
                    : isDark
                    ? 'bg-amber-50 text-slate-800'
                    : 'bg-white text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between leading-none">
                  <span>{tileNum}</span>
                  {isFinish && <span>🏆</span>}
                  {isStart && <span>🚩</span>}
                  {isSnakeHead && <span className="text-[10px] animate-pulse">🐍</span>}
                  {isLadderBase && <span className="text-[10px]">🪜</span>}
                </div>
              </div>
            );
          })}

          {/* SVG Overlay for Real Illustrated Snakes & Proper Ladders */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 100 100">
            <defs>
              {/* Snake scale texture gradient */}
              <linearGradient id="ladderWood" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="50%" stopColor="#d97706" />
                <stop offset="100%" stopColor="#78350f" />
              </linearGradient>

              <filter id="shadowFilter" x="-10%" y="-10%" width="130%" height="130%">
                <feDropShadow dx="0.6" dy="0.6" stdDeviation="0.4" floodColor="#000000" floodOpacity="0.7" />
              </filter>
            </defs>

            {/* 1. REAL PROPER LADDERS */}
            {Object.entries(LADDERS).map(([startStr, endStr]) => {
              const start = Number(startStr);
              const end = Number(endStr);
              const p1 = getTileCoords(start);
              const p2 = getTileCoords(end);

              const dx = p2.x - p1.x;
              const dy = p2.y - p1.y;
              const angle = Math.atan2(dy, dx);
              const ladderWidth = 2.6;
              const perpX = -Math.sin(angle) * (ladderWidth / 2);
              const perpY = Math.cos(angle) * (ladderWidth / 2);

              const leftRail = {
                x1: p1.x + perpX,
                y1: p1.y + perpY,
                x2: p2.x + perpX,
                y2: p2.y + perpY,
              };

              const rightRail = {
                x1: p1.x - perpX,
                y1: p1.y - perpY,
                x2: p2.x - perpX,
                y2: p2.y - perpY,
              };

              // Number of rungs along the length
              const dist = Math.hypot(dx, dy);
              const rungCount = Math.max(3, Math.floor(dist / 4.5));
              const rungs = [];

              for (let i = 1; i <= rungCount; i++) {
                const t = i / (rungCount + 1);
                const rx1 = leftRail.x1 + (leftRail.x2 - leftRail.x1) * t;
                const ry1 = leftRail.y1 + (leftRail.y2 - leftRail.y1) * t;
                const rx2 = rightRail.x1 + (rightRail.x2 - rightRail.x1) * t;
                const ry2 = rightRail.y1 + (rightRail.y2 - rightRail.y1) * t;
                rungs.push({ rx1, ry1, rx2, ry2, key: `${start}-${i}` });
              }

              return (
                <g key={`ladder-${start}`} filter="url(#shadowFilter)">
                  {/* Left & Right Rails */}
                  <line
                    x1={leftRail.x1}
                    y1={leftRail.y1}
                    x2={leftRail.x2}
                    y2={leftRail.y2}
                    stroke="#000000"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                  <line
                    x1={leftRail.x1}
                    y1={leftRail.y1}
                    x2={leftRail.x2}
                    y2={leftRail.y2}
                    stroke="#fbbf24"
                    strokeWidth="1.1"
                    strokeLinecap="round"
                  />

                  <line
                    x1={rightRail.x1}
                    y1={rightRail.y1}
                    x2={rightRail.x2}
                    y2={rightRail.y2}
                    stroke="#000000"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                  <line
                    x1={rightRail.x1}
                    y1={rightRail.y1}
                    x2={rightRail.x2}
                    y2={rightRail.y2}
                    stroke="#fbbf24"
                    strokeWidth="1.1"
                    strokeLinecap="round"
                  />

                  {/* Horizontal Rungs */}
                  {rungs.map((r) => (
                    <g key={r.key}>
                      <line
                        x1={r.rx1}
                        y1={r.ry1}
                        x2={r.rx2}
                        y2={r.ry2}
                        stroke="#000000"
                        strokeWidth="1.2"
                      />
                      <line
                        x1={r.rx1}
                        y1={r.ry1}
                        x2={r.rx2}
                        y2={r.ry2}
                        stroke="#f59e0b"
                        strokeWidth="0.8"
                      />
                    </g>
                  ))}
                </g>
              );
            })}

            {/* 2. REAL ANIMATED SLITHERING SNAKES */}
            {SNAKE_DETAILS.map((snake) => {
              const head = getTileCoords(snake.head);
              const tail = getTileCoords(snake.tail);

              // Create smooth S-curving bezier path
              const midX = (head.x + tail.x) / 2 + snake.curveOffset;
              const midY = (head.y + tail.y) / 2;
              const ctrl1X = head.x + (midX - head.x) * 0.6 + snake.curveOffset * 0.8;
              const ctrl1Y = head.y + (midY - head.y) * 0.5;
              const ctrl2X = midX + (tail.x - midX) * 0.5 - snake.curveOffset * 0.8;
              const ctrl2Y = midY + (tail.y - midY) * 0.5;

              const snakePath = `M ${head.x} ${head.y} C ${ctrl1X} ${ctrl1Y}, ${ctrl2X} ${ctrl2Y}, ${tail.x} ${tail.y}`;

              return (
                <g key={`snake-${snake.head}`} filter="url(#shadowFilter)">
                  {/* Thick Black Inked Outer Edge */}
                  <path
                    d={snakePath}
                    fill="none"
                    stroke="#000000"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                  />

                  {/* Snake Scaled Body */}
                  <path
                    d={snakePath}
                    fill="none"
                    stroke={snake.skinColor}
                    strokeWidth="2.3"
                    strokeLinecap="round"
                  />

                  {/* Dorsal Spots / Stripes */}
                  <path
                    d={snakePath}
                    fill="none"
                    stroke={snake.bellyColor}
                    strokeWidth="1.0"
                    strokeDasharray="2 2"
                    strokeLinecap="round"
                  />

                  {/* Realistic Detailed Snake Head at Head Tile */}
                  <g transform={`translate(${head.x}, ${head.y})`}>
                    {/* Forked Flickering Red Tongue */}
                    <path
                      d="M 0 -0.8 L 0 -2.6 L -0.7 -3.3 M 0 -2.6 L 0.7 -3.3"
                      stroke="#ef4444"
                      strokeWidth="0.5"
                      strokeLinecap="round"
                      fill="none"
                    />

                    {/* Head Skull Shape */}
                    <ellipse
                      cx="0"
                      cy="0"
                      rx="2.2"
                      ry="1.8"
                      fill={snake.skinColor}
                      stroke="#000000"
                      strokeWidth="0.6"
                    />

                    {/* Venomous Fangs */}
                    <polygon points="-0.8,-0.2 -0.6,-1.2 -0.4,-0.2" fill="#ffffff" stroke="#000000" strokeWidth="0.2" />
                    <polygon points="0.8,-0.2 0.6,-1.2 0.4,-0.2" fill="#ffffff" stroke="#000000" strokeWidth="0.2" />

                    {/* Fiery Slit Eyes */}
                    <circle cx="-1.1" cy="-0.4" r="0.6" fill="#facc15" stroke="#000000" strokeWidth="0.25" />
                    <ellipse cx="-1.1" cy="-0.4" rx="0.15" ry="0.45" fill="#000000" />

                    <circle cx="1.1" cy="-0.4" r="0.6" fill="#facc15" stroke="#000000" strokeWidth="0.25" />
                    <ellipse cx="1.1" cy="-0.4" rx="0.15" ry="0.45" fill="#000000" />
                  </g>

                  {/* Coiled Tail at Tail Tile */}
                  <g transform={`translate(${tail.x}, ${tail.y})`}>
                    <circle
                      cx="0"
                      cy="0"
                      r="1.1"
                      fill={snake.spotColor}
                      stroke="#000000"
                      strokeWidth="0.5"
                    />
                  </g>
                </g>
              );
            })}
          </svg>

          {/* Player Pawns rendered with Smooth Step Hop Transforms */}
          {players.map((p, pIdx) => {
            const visual = pawnPos[pIdx];
            // If both pawns share the exact same tile, offset them left/right by 2.2%
            const isSharingTile = players[0].tile === players[1].tile;
            const xOffset = isSharingTile ? (pIdx === 0 ? -2.2 : 2.2) : 0;

            return (
              <div
                key={p.id}
                className="absolute pointer-events-none transition-all ease-out z-30"
                style={{
                  left: `${visual.x + xOffset}%`,
                  top: `${visual.y}%`,
                  transform: `translate(-50%, -50%) ${visual.isHopping ? 'translateY(-16px) scale(1.2)' : 'translateY(0px) scale(1)'}`,
                  transitionDuration: visual.isHopping ? '180ms' : '120ms',
                }}
              >
                {/* 2D Comic Pawn Token */}
                <div className="relative flex flex-col items-center">
                  <div
                    className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full border-3 border-black flex items-center justify-center font-comic font-black text-sm sm:text-base shadow-[3px_3px_0px_#000000] ${
                      pIdx === 0 ? 'bg-rose-500 text-white' : 'bg-cyan-400 text-black'
                    }`}
                  >
                    {p.avatar}
                  </div>
                  {/* Comic Pawn Shadow under hop */}
                  <div
                    className="w-5 h-2 rounded-full bg-black/40 blur-[1px] mt-0.5 transition-all"
                    style={{
                      transform: visual.isHopping ? 'scale(0.6)' : 'scale(1)',
                      opacity: visual.isHopping ? 0.3 : 0.7,
                    }}
                  />
                </div>
              </div>
            );
          })}

          {/* Action Popups (CHOMP / LADDER BOOST) */}
          {actionAlert && (
            <div
              className={`absolute z-40 px-3 py-1.5 rounded-xl border-3 border-black font-comic font-black text-xs sm:text-sm uppercase tracking-wider shadow-[4px_4px_0px_#000000] animate-bounce pointer-events-none ${
                actionAlert.type === 'snake' ? 'bg-rose-500 text-white rotate-6' : 'bg-yellow-300 text-black -rotate-6'
              }`}
              style={{
                left: `${getTileCoords(actionAlert.tile).x}%`,
                top: `${getTileCoords(actionAlert.tile).y}%`,
                transform: 'translate(-50%, -100%)',
              }}
            >
              {actionAlert.text}
            </div>
          )}
        </div>
      </div>

      {/* Speech Bubble Status Message */}
      <div className="w-full max-w-xl text-center px-4 py-2 rounded-2xl comic-panel bg-white border-3 border-black text-xs sm:text-sm font-bold text-black shadow-[4px_4px_0px_#000000] z-20">
        💬 {logMessage}
      </div>

      {/* Bottom Dice Action Bar */}
      <div className="w-full max-w-xl flex items-center justify-center gap-4 my-2 z-20">
        {winner ? (
          <button
            onClick={handleResetGame}
            className="comic-btn px-8 py-3.5 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-black font-comic font-black text-xl uppercase tracking-wider border-3 border-black shadow-[5px_5px_0px_#000000] flex items-center gap-2 active:translate-x-[2px] active:translate-y-[2px]"
          >
            <RotateCcw className="w-6 h-6 stroke-[2.5]" />
            <span>PLAY NEW MATCH</span>
          </button>
        ) : (
          <button
            onClick={handleRollDice}
            disabled={isRolling || isAnimating || (mode === 'pve' && currentTurn === 1)}
            className="comic-btn px-6 sm:px-8 py-3 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-black font-comic font-black text-lg sm:text-xl uppercase tracking-wider border-3 border-black shadow-[5px_5px_0px_#000000] flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed active:translate-x-[2px] active:translate-y-[2px] transition-all"
          >
            {/* Animated Tumbling 2D Dice Element */}
            <div
              className={`w-9 h-9 rounded-xl bg-white border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000000] transition-transform ${
                isRolling ? 'rotate-45 scale-90' : 'group-hover:rotate-6'
              }`}
            >
              {renderDiceFace(diceRoll)}
            </div>

            <span>
              {isRolling
                ? 'ROLLING DIE...'
                : mode === 'pve' && currentTurn === 1
                ? 'BOT IS THINKING...'
                : `ROLL DIE (${players[currentTurn].name})`}
            </span>

            {diceRoll && !isRolling && (
              <span className="px-2 py-0.5 rounded-lg bg-black text-yellow-300 font-comic font-black text-xl border border-black">
                {diceRoll}
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
