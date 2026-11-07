import React, { useEffect, useState } from 'react';
import { sound } from '../services/audio';
import { useAuthStore } from '../store/authStore';
import { RotateCcw, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Card {
  id: number;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const SYMBOLS = ['⚡', '💎', '🚀', '🔮', '🎯', '🪐', '🛡️', '👑'];

export const MemoryMatch3D: React.FC<{ onScoreUpdate: (score: number) => void }> = ({ onScoreUpdate }) => {
  const { recordGameStats } = useAuthStore();
  const [cards, setCards] = useState<Card[]>(() => initCards());
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [isWon, setIsWon] = useState(false);

  function initCards(): Card[] {
    const deck = [...SYMBOLS, ...SYMBOLS]
      .sort(() => Math.random() - 0.5)
      .map((symbol, idx) => ({
        id: idx,
        symbol,
        isFlipped: false,
        isMatched: false,
      }));
    return deck;
  }

  const handleCardClick = (idx: number) => {
    if (cards[idx].isFlipped || cards[idx].isMatched || flippedIndices.length >= 2) return;

    sound.playSelect();
    const newCards = [...cards];
    newCards[idx].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedIndices, idx];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [firstIdx, secondIdx] = newFlipped;

      if (cards[firstIdx].symbol === cards[secondIdx].symbol) {
        // Match!
        sound.playPoint();
        setTimeout(() => {
          newCards[firstIdx].isMatched = true;
          newCards[secondIdx].isMatched = true;
          setCards([...newCards]);
          setFlippedIndices([]);
          const nextPairs = matchedPairs + 1;
          setMatchedPairs(nextPairs);
          const score = nextPairs * 100 - moves * 5;
          onScoreUpdate(Math.max(0, score));

          if (nextPairs === SYMBOLS.length) {
            sound.playWin();
            confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
            setIsWon(true);
            recordGameStats('memory-match', Math.max(100, 1000 - moves * 20), true);
          }
        }, 300);
      } else {
        // No match: flip back
        setTimeout(() => {
          newCards[firstIdx].isFlipped = false;
          newCards[secondIdx].isFlipped = false;
          setCards([...newCards]);
          setFlippedIndices([]);
        }, 900);
      }
    }
  };

  const handleRestart = () => {
    sound.playClick();
    setCards(initCards());
    setFlippedIndices([]);
    setMoves(0);
    setMatchedPairs(0);
    setIsWon(false);
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
      {/* Comic Card Deck Grid Container */}
      <div className="relative p-6 rounded-3xl comic-panel bg-white border-4 border-black shadow-[6px_6px_0px_#000000]">
        <div className="flex items-center justify-between mb-4 px-1">
          <span className="comic-badge bg-yellow-300 text-black border-2 border-black px-3 py-1 font-comic font-black text-sm shadow-[2px_2px_0px_#000000]">
            MOVES: {moves}
          </span>
          <span className="comic-badge bg-cyan-300 text-black border-2 border-black px-3 py-1 font-comic font-black text-sm shadow-[2px_2px_0px_#000000]">
            PAIRS: {matchedPairs} / {SYMBOLS.length}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-3 sm:gap-4 w-72 sm:w-96">
          {cards.map((card, idx) => (
            <button
              key={card.id}
              onClick={() => handleCardClick(idx)}
              className={`h-20 sm:h-24 rounded-2xl border-3 border-black text-3xl sm:text-4xl flex items-center justify-center transition-all duration-200 transform active:translate-x-[1px] active:translate-y-[1px] ${
                card.isFlipped || card.isMatched
                  ? 'bg-yellow-300 shadow-[3px_3px_0px_#000000]'
                  : 'comic-btn bg-cyan-400 hover:bg-cyan-300 shadow-[3px_3px_0px_#000000]'
              }`}
            >
              {card.isFlipped || card.isMatched ? (
                <span className="animate-in zoom-in-50">{card.symbol}</span>
              ) : (
                <div className="w-8 h-8 rounded-full bg-black text-yellow-300 flex items-center justify-center font-comic font-black text-base border-2 border-black">
                  ?
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Victory Modal */}
        {isWon && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95">
            <div className="comic-panel p-6 bg-yellow-300 border-4 border-black rounded-3xl shadow-[8px_8px_0px_#000000] max-w-xs w-full">
              <h3 className="font-comic font-black text-3xl mb-1 text-black">🎉 SUPER MEMORY!</h3>
              <p className="text-sm font-bold text-black mb-4">Matched in {moves} moves!</p>
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
