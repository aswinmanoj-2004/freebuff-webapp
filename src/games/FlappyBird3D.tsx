import React, { useEffect, useRef, useState } from 'react';
import { sound } from '../services/audio';
import { useAuthStore } from '../store/authStore';
import { Play, RotateCcw, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Pipe {
  x: number;
  gapY: number;
  passed: boolean;
}

interface Biome {
  name: string;
  bgColor: string;
  pipeColor: string;
  pipeCapColor: string;
  cloudColor: string;
}

const BIOMES: Biome[] = [
  { name: 'Sunny Day', bgColor: '#7dd3fc', pipeColor: '#22c55e', pipeCapColor: '#16a34a', cloudColor: '#ffffff' },
  { name: 'Sunset Glow', bgColor: '#fdba74', pipeColor: '#f97316', pipeCapColor: '#ea580c', cloudColor: '#fef08a' },
  { name: 'Night Sky', bgColor: '#312e81', pipeColor: '#06b6d4', pipeCapColor: '#0891b2', cloudColor: '#4338ca' },
  { name: 'Cosmic Galaxy', bgColor: '#0f172a', pipeColor: '#ec4899', pipeCapColor: '#db2777', cloudColor: '#334155' },
  { name: 'Electric Storm', bgColor: '#18181b', pipeColor: '#eab308', pipeCapColor: '#ca8a04', cloudColor: '#3f3f46' },
];

export const FlappyBird3D: React.FC<{ onScoreUpdate: (score: number) => void }> = ({ onScoreUpdate }) => {
  const { recordGameStats, user } = useAuthStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(user?.stats?.['flappy-bird']?.highScore || 0);
  const [biomeIndex, setBiomeIndex] = useState(0);
  const [checkpointText, setCheckpointText] = useState<string | null>(null);

  // Physics & Game loop refs
  const birdRef = useRef({
    y: 200,
    velY: 0,
    radius: 18,
    angle: 0,
    wingAngle: 0,
  });

  const pipesRef = useRef<Pipe[]>([]);
  const frameCountRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);

  const GRAVITY = 0.38;
  const JUMP_FORCE = -7.5;
  const PIPE_SPEED = 2.4;
  const PIPE_GAP = 135;
  const PIPE_WIDTH = 58;

  const handleFlap = () => {
    if (gameState === 'idle') {
      sound.playFlap();
      birdRef.current.velY = JUMP_FORCE;
      setGameState('playing');
    } else if (gameState === 'playing') {
      sound.playFlap();
      birdRef.current.velY = JUMP_FORCE;
      birdRef.current.wingAngle = -0.6;
    }
  };

  const handleRestart = () => {
    sound.playClick();
    birdRef.current = { y: 200, velY: 0, radius: 18, angle: 0, wingAngle: 0 };
    pipesRef.current = [];
    setScore(0);
    setBiomeIndex(0);
    setCheckpointText(null);
    setGameState('idle');
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        handleFlap();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  // Main 2D Canvas Engine Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;

      const width = canvas.width;
      const height = canvas.height;
      const currentBiome = BIOMES[biomeIndex];

      // 1. Draw Biome Sky Background
      ctx.fillStyle = currentBiome.bgColor;
      ctx.fillRect(0, 0, width, height);

      // Draw stylized comic background clouds / mountains
      ctx.fillStyle = currentBiome.cloudColor;
      ctx.beginPath();
      ctx.arc(80, 70, 35, 0, Math.PI * 2);
      ctx.arc(120, 60, 45, 0, Math.PI * 2);
      ctx.arc(160, 70, 35, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(320, 110, 30, 0, Math.PI * 2);
      ctx.arc(355, 100, 40, 0, Math.PI * 2);
      ctx.arc(390, 110, 30, 0, Math.PI * 2);
      ctx.fill();

      // 2. Update & Draw Pipes
      if (gameState === 'playing') {
        frameCountRef.current++;

        // Spawn pipes every 115 frames
        if (frameCountRef.current % 115 === 0) {
          const minGapY = 110;
          const maxGapY = height - 160;
          const gapY = Math.floor(Math.random() * (maxGapY - minGapY)) + minGapY;
          pipesRef.current.push({ x: width + 20, gapY, passed: false });
        }

        // Update pipes position & collision
        for (let i = pipesRef.current.length - 1; i >= 0; i--) {
          const pipe = pipesRef.current[i];
          pipe.x -= PIPE_SPEED;

          const bird = birdRef.current;
          const birdX = 90;

          // Score check
          if (!pipe.passed && pipe.x + PIPE_WIDTH < birdX) {
            pipe.passed = true;
            sound.playPoint();
            setScore((prev) => {
              const newScore = prev + 1;
              onScoreUpdate(newScore);
              setHighScore((h: number) => Math.max(h, newScore));

              // Checkpoint every 10 pipes
              if (newScore > 0 && newScore % 10 === 0) {
                sound.playWin();
                confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
                const nextBiome = (Math.floor(newScore / 10)) % BIOMES.length;
                setBiomeIndex(nextBiome);
                setCheckpointText(`CHECKPOINT! ${BIOMES[nextBiome].name.toUpperCase()}`);
                setTimeout(() => setCheckpointText(null), 2500);
              }
              return newScore;
            });
          }

          // AABB Box collision check
          if (
            birdX + bird.radius - 4 > pipe.x &&
            birdX - bird.radius + 4 < pipe.x + PIPE_WIDTH
          ) {
            if (
              bird.y - bird.radius + 4 < pipe.gapY - PIPE_GAP / 2 ||
              bird.y + bird.radius - 4 > pipe.gapY + PIPE_GAP / 2
            ) {
              sound.playLose();
              setGameState('gameover');
            }
          }

          // Remove offscreen
          if (pipe.x < -PIPE_WIDTH - 20) {
            pipesRef.current.splice(i, 1);
          }
        }

        // 3. Update Bird Physics
        birdRef.current.velY += GRAVITY;
        birdRef.current.y += birdRef.current.velY;
        birdRef.current.angle = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, birdRef.current.velY * 0.08));
        birdRef.current.wingAngle = Math.sin(frameCountRef.current * 0.25) * 0.5;

        // Ground / Ceiling collision
        if (birdRef.current.y + birdRef.current.radius >= height - 35) {
          birdRef.current.y = height - 35 - birdRef.current.radius;
          sound.playLose();
          setGameState('gameover');
        }
        if (birdRef.current.y - birdRef.current.radius <= 0) {
          birdRef.current.y = birdRef.current.radius;
          birdRef.current.velY = 0;
        }
      }

      // Draw Pipes
      pipesRef.current.forEach((pipe) => {
        const topHeight = pipe.gapY - PIPE_GAP / 2;
        const bottomY = pipe.gapY + PIPE_GAP / 2;
        const bottomHeight = height - 35 - bottomY;

        // Top Pipe Body
        ctx.fillStyle = currentBiome.pipeColor;
        ctx.fillRect(pipe.x, 0, PIPE_WIDTH, topHeight);
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#000000';
        ctx.strokeRect(pipe.x, 0, PIPE_WIDTH, topHeight);

        // Top Pipe Cap
        ctx.fillStyle = currentBiome.pipeCapColor;
        ctx.fillRect(pipe.x - 4, topHeight - 24, PIPE_WIDTH + 8, 24);
        ctx.strokeRect(pipe.x - 4, topHeight - 24, PIPE_WIDTH + 8, 24);

        // Bottom Pipe Body
        ctx.fillStyle = currentBiome.pipeColor;
        ctx.fillRect(pipe.x, bottomY, PIPE_WIDTH, bottomHeight);
        ctx.strokeRect(pipe.x, bottomY, PIPE_WIDTH, bottomHeight);

        // Bottom Pipe Cap
        ctx.fillStyle = currentBiome.pipeCapColor;
        ctx.fillRect(pipe.x - 4, bottomY, PIPE_WIDTH + 8, 24);
        ctx.strokeRect(pipe.x - 4, bottomY, PIPE_WIDTH + 8, 24);
      });

      // 4. Draw Comic Ground Strip
      ctx.fillStyle = '#15803d';
      ctx.fillRect(0, height - 35, width, 12);
      ctx.fillStyle = '#854d0e';
      ctx.fillRect(0, height - 23, width, 23);
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#000000';
      ctx.strokeRect(0, height - 35, width, 35);

      // 5. Draw Animated Comic Flappy Bird
      ctx.save();
      const bird = birdRef.current;
      const birdX = 90;
      ctx.translate(birdX, bird.y);
      ctx.rotate(bird.angle);

      // Yellow Bird Body
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(0, 0, bird.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#000000';
      ctx.stroke();

      // Flapping Wing
      ctx.save();
      ctx.translate(-6, 2);
      ctx.rotate(bird.wingAngle);
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.ellipse(0, 0, 10, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Big Cartoon Eye
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(7, -5, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Pupil
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(9, -5, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Orange Beak
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.moveTo(14, -2);
      ctx.lineTo(24, 2);
      ctx.lineTo(14, 6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [gameState, biomeIndex]);

  // Handle Game Over stats sync
  useEffect(() => {
    if (gameState === 'gameover') {
      recordGameStats('flappy-bird', score, score >= 10);
    }
  }, [gameState, score, recordGameStats]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-2 sm:p-4 select-none">
      {/* 2D Comic Canvas Wrapper */}
      <div className="relative w-full max-w-[460px] h-[520px] rounded-3xl comic-panel bg-white border-4 border-black shadow-[8px_8px_0px_#000000] overflow-hidden flex flex-col items-center justify-center">
        <canvas
          ref={canvasRef}
          width={460}
          height={520}
          onClick={handleFlap}
          className="w-full h-full cursor-pointer block"
        />

        {/* Top Biome Banner */}
        <div className="absolute top-4 left-4 z-20 px-3 py-1 rounded-xl comic-badge bg-yellow-300 text-black border-2 border-black text-xs font-comic font-black shadow-[2px_2px_0px_#000000] flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>BIOME: {BIOMES[biomeIndex].name.toUpperCase()}</span>
        </div>

        {/* Checkpoint Toast Banner */}
        {checkpointText && (
          <div className="absolute top-16 z-30 px-5 py-2 rounded-2xl comic-panel bg-cyan-300 text-black font-comic font-black text-sm uppercase tracking-wider border-3 border-black shadow-[4px_4px_0px_#000000] animate-bounce">
            🌟 {checkpointText}
          </div>
        )}

        {/* Floating In-Game Live Score */}
        {gameState === 'playing' && (
          <div className="absolute top-6 font-comic font-black text-6xl text-yellow-300 drop-shadow-[4px_4px_0px_#000000] pointer-events-none tabular-nums z-20">
            {score}
          </div>
        )}

        {/* Idle Start Prompt */}
        {gameState === 'idle' && (
          <div className="absolute z-30 max-w-xs mx-auto p-6 rounded-3xl comic-panel bg-white border-4 border-black text-center shadow-[6px_6px_0px_#000000]">
            <h2 className="text-3xl font-comic font-black text-black mb-1">FLAPPY BIRD</h2>
            <p className="text-xs font-bold text-slate-800 mb-5 leading-relaxed">
              Tap screen or press <kbd className="px-1.5 py-0.5 rounded bg-yellow-300 border border-black text-black font-comic font-black text-xs">SPACE</kbd> to flap! Dodge pipes & unlock new biomes every 10 pipes!
            </p>
            <button
              onClick={handleFlap}
              className="comic-btn w-full py-3 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-black font-comic font-black text-lg uppercase tracking-wider border-3 border-black shadow-[4px_4px_0px_#000000] flex items-center justify-center gap-2 active:translate-x-[2px] active:translate-y-[2px]"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>TAP TO FLAP & START!</span>
            </button>
          </div>
        )}

        {/* Game Over Dialog */}
        {gameState === 'gameover' && (
          <div className="absolute z-30 max-w-xs mx-auto p-6 rounded-3xl comic-panel bg-yellow-300 border-4 border-black text-center shadow-[8px_8px_0px_#000000] animate-in zoom-in-95">
            <h2 className="text-3xl font-comic font-black text-black mb-1">💥 CRASHED!</h2>
            <p className="text-xs font-bold text-black mb-4">You bumped into an obstacle!</p>

            <div className="grid grid-cols-2 gap-3 p-3 bg-white rounded-2xl border-3 border-black mb-5">
              <div>
                <div className="text-[10px] font-comic font-black text-slate-600 uppercase">SCORE</div>
                <div className="text-3xl font-comic font-black text-black tabular-nums">{score}</div>
              </div>
              <div>
                <div className="text-[10px] font-comic font-black text-slate-600 uppercase">BEST</div>
                <div className="text-3xl font-comic font-black text-black tabular-nums">{highScore}</div>
              </div>
            </div>

            <button
              onClick={handleRestart}
              className="comic-btn w-full py-3 rounded-2xl bg-black text-yellow-300 hover:bg-neutral-800 font-comic font-black text-base uppercase tracking-wider border-3 border-black shadow-[4px_4px_0px_rgba(0,0,0,0.5)] flex items-center justify-center gap-2 active:translate-x-[2px] active:translate-y-[2px]"
            >
              <RotateCcw className="w-4 h-4 stroke-[2.5]" />
              <span>TRY AGAIN</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
