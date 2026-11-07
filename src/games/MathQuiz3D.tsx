import React, { useEffect, useState } from 'react';
import { sound } from '../services/audio';
import { useAuthStore } from '../store/authStore';
import { RotateCcw, Zap, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Question {
  text: string;
  answer: number;
  options: number[];
}

export const MathQuiz3D: React.FC<{ onScoreUpdate: (score: number) => void }> = ({ onScoreUpdate }) => {
  const { recordGameStats } = useAuthStore();
  const [question, setQuestion] = useState<Question>(() => generateQuestion());
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [gameOver, setGameOver] = useState(false);

  function generateQuestion(): Question {
    const ops = ['+', '-', '×'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a = Math.floor(Math.random() * 12) + 2;
    let b = Math.floor(Math.random() * 12) + 2;
    let ans = 0;

    if (op === '+') {
      ans = a + b;
    } else if (op === '-') {
      if (a < b) [a, b] = [b, a];
      ans = a - b;
    } else {
      a = Math.floor(Math.random() * 10) + 2;
      b = Math.floor(Math.random() * 10) + 2;
      ans = a * b;
    }

    const options = new Set<number>([ans]);
    while (options.size < 4) {
      const delta = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 6) + 1);
      const fake = Math.max(0, ans + delta);
      options.add(fake);
    }

    return {
      text: `${a} ${op} ${b}`,
      answer: ans,
      options: Array.from(options).sort(() => Math.random() - 0.5),
    };
  }

  // Timer countdown
  useEffect(() => {
    if (gameOver) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameOver]);

  // Handle game over side effects safely outside render
  useEffect(() => {
    if (timeLeft === 0 && !gameOver) {
      sound.playLose();
      setGameOver(true);
      recordGameStats('math-quiz', score, score > 200);
    }
  }, [timeLeft, gameOver, score, recordGameStats]);

  const handleSelectAnswer = (chosen: number) => {
    if (gameOver) return;

    if (chosen === question.answer) {
      sound.playPoint();
      const nextStreak = streak + 1;
      const pts = 50 + nextStreak * 10;
      const nextScore = score + pts;
      setScore(nextScore);
      onScoreUpdate(nextScore);
      setStreak(nextStreak);
      setTimeLeft((t) => Math.min(15, t + 3)); // reward extra time
      setQuestion(generateQuestion());

      if (nextStreak % 5 === 0) {
        sound.playWin();
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      }
    } else {
      sound.playLose();
      setStreak(0);
      setTimeLeft((t) => Math.max(1, t - 3)); // time penalty
    }
  };

  const handleRestart = () => {
    sound.playClick();
    setScore(0);
    setStreak(0);
    setTimeLeft(10);
    setGameOver(false);
    setQuestion(generateQuestion());
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
      <div className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl comic-panel bg-white border-4 border-black shadow-[6px_6px_0px_#000000] text-center">
        {/* Streak & Timer Bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5 comic-badge bg-yellow-300 text-black border-2 border-black px-3 py-1 font-comic font-black text-sm shadow-[2px_2px_0px_#000000]">
            <Flame className="w-4 h-4 stroke-[2.5]" />
            <span>STREAK: {streak}×</span>
          </div>
          <div className="flex items-center gap-1.5 comic-badge bg-rose-400 text-black border-2 border-black px-3 py-1 font-comic font-black text-sm shadow-[2px_2px_0px_#000000]">
            <Zap className="w-4 h-4 stroke-[2.5]" />
            <span>TIME: {timeLeft}S</span>
          </div>
        </div>

        {/* Comic Energy Gauge */}
        <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden border-3 border-black mb-6">
          <div
            className={`h-full transition-all duration-300 ${
              timeLeft > 6 ? 'bg-emerald-400' : timeLeft > 3 ? 'bg-yellow-400' : 'bg-rose-500 animate-pulse'
            }`}
            style={{ width: `${(timeLeft / 15) * 100}%` }}
          />
        </div>

        {/* Math Equation Comic Bubble */}
        <div className="py-6 px-4 rounded-2xl bg-yellow-300 border-3 border-black shadow-[4px_4px_0px_#000000] mb-6">
          <span className="text-4xl sm:text-6xl font-comic font-black text-black tracking-wider">
            {question.text} = ?
          </span>
        </div>

        {/* 4 Choices */}
        <div className="grid grid-cols-2 gap-3">
          {question.options.map((opt) => (
            <button
              key={opt}
              onClick={() => handleSelectAnswer(opt)}
              disabled={gameOver}
              className="comic-btn py-4 px-3 rounded-2xl bg-cyan-400 hover:bg-yellow-400 text-black font-comic font-black text-2xl sm:text-3xl border-3 border-black shadow-[4px_4px_0px_#000000] transition-all active:translate-x-[2px] active:translate-y-[2px] disabled:opacity-50"
            >
              {opt}
            </button>
          ))}
        </div>

        {/* Game Over Modal */}
        {gameOver && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95">
            <div className="comic-panel p-6 bg-yellow-300 border-4 border-black rounded-3xl shadow-[8px_8px_0px_#000000] max-w-xs w-full">
              <h3 className="font-comic font-black text-3xl mb-1 text-black">⏰ TIME'S UP!</h3>
              <p className="text-sm font-bold text-black mb-4">
                Final Score: <strong className="font-comic text-xl">{score} PTS</strong>
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
