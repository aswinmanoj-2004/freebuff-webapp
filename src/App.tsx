import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroComicStage } from './components/home/HeroComicStage';
import { GameCard } from './components/home/GameCard';
import { GameFilterBar } from './components/home/GameFilterBar';
import { AuthModal } from './components/auth/AuthModal';
import { ProfileDrawer } from './components/profile/ProfileDrawer';
import { LeaderboardModal } from './components/leaderboard/LeaderboardModal';
import { SettingsModal } from './components/settings/SettingsModal';
import { GameShell } from './components/game/GameShell';
import { GameRenderer } from './games/GameRenderer';
import { useGameStore, GAME_CATALOG } from './store/gameStore';
import { useAuthStore } from './store/authStore';
import { useAudioStore } from './store/audioStore';
import { sound } from './services/audio';
import { Sparkles, Gamepad2, Zap, Flame, ShieldCheck } from 'lucide-react';

export default function App() {
  const {
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    activeGameId,
    selectGame,
    score,
    setScore,
    resetGameSession,
  } = useGameStore();

  const { user, setAuthModal } = useAuthStore();
  const { musicEnabled } = useAudioStore();
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Active game metadata
  const activeGame = activeGameId
    ? GAME_CATALOG.find((g) => g.id === activeGameId)
    : null;

  // Game timer tick
  useEffect(() => {
    let timer: number;
    if (activeGameId) {
      timer = window.setInterval(() => {
        setTimeElapsed((t) => t + 1);
      }, 1000);
    } else {
      setTimeElapsed(0);
    }
    return () => clearInterval(timer);
  }, [activeGameId]);

  // Filter games based on category and search query
  const filteredGames = GAME_CATALOG.filter((game) => {
    const matchesCat = activeCategory === 'all' || game.category === activeCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleNavClick = (section: string) => {
    if (section === 'home' || section === 'games') {
      selectGame(null);
      if (section === 'games') {
        const el = document.getElementById('games-grid');
        el?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleLaunchGame = (gameId: string) => {
    sound.playSelect();
    resetGameSession();
    selectGame(gameId);
  };

  const handleBackToHub = () => {
    sound.playClick();
    selectGame(null);
  };

  return (
    <div className="min-h-screen comic-dots-bg text-slate-900 flex flex-col antialiased selection:bg-amber-400 selection:text-black">
      {/* Comic Book Top Banner */}
      <Navbar onNavClick={handleNavClick} />

      {/* Main View Area */}
      {activeGame ? (
        <GameShell
          game={activeGame}
          score={score}
          timeElapsed={timeElapsed}
          onRestart={resetGameSession}
          onBackToHub={handleBackToHub}
        >
          <GameRenderer
            game={activeGame}
            score={score}
            onScoreChange={setScore}
          />
        </GameShell>
      ) : (
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
          {/* Comic Hero Section: 2-Column Split */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Comic Headline & Actions */}
            <div className="lg:col-span-5 space-y-6">
              {/* Comic Speech Burst Sticker */}
              <div className="inline-block comic-badge bg-rose-500 text-white text-xs px-3.5 py-1.5 rounded-xl rotate-[-3deg] shadow-[3px_3px_0px_#000000]">
                ⚡ ISSUE #01 · 13 RETRO ARCADE CLASSICS!
              </div>

              <h1 className="font-comic text-4xl sm:text-6xl lg:text-7xl tracking-wide text-black leading-[1.02] drop-shadow-[3px_3px_0px_#facc15]">
                PLAY CLASSIC LOGIC IN <span className="text-rose-500 underline decoration-black decoration-wavy">PUNCHY COMIC</span>!
              </h1>

              <div className="speech-bubble p-4 rounded-2xl border-3 border-black bg-white shadow-[4px_4px_0px_#000000]">
                <p className="text-xs sm:text-sm text-slate-800 font-bold leading-relaxed">
                  "Hop pawns in Snake & Ladder with real slithering snakes that bite & ladders you climb, outsmart Minimax AI in Tic Tac Toe, flap past biomes, and solve mechanical puzzles!"
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    sound.playSelect();
                    const el = document.getElementById('games-grid');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="comic-btn px-6 py-3 rounded-2xl bg-amber-400 hover:bg-yellow-300 text-black text-lg tracking-wider flex items-center gap-2 cursor-pointer shadow-[4px_4px_0px_#000000]"
                >
                  <Gamepad2 className="w-5 h-5 fill-black" />
                  <span>PLAY ALL 13 GAMES!</span>
                </button>

                {!user && (
                  <button
                    onClick={() => {
                      sound.playClick();
                      setAuthModal(true, 'signin');
                    }}
                    className="comic-btn px-5 py-3 rounded-2xl bg-white hover:bg-slate-100 text-black text-sm tracking-wider cursor-pointer"
                  >
                    <span>SIGN IN / GUEST</span>
                  </button>
                )}
              </div>

              {/* Comic trust stickers */}
              <div className="pt-2 flex flex-wrap items-center gap-2.5">
                <span className="comic-badge text-[11px] bg-emerald-300 text-black px-2.5 py-1 rounded-md">
                  ✓ 100% FREE
                </span>
                <span className="comic-badge text-[11px] bg-cyan-300 text-black px-2.5 py-1 rounded-md">
                  ✓ ZERO ADS
                </span>
                <span className="comic-badge text-[11px] bg-rose-300 text-black px-2.5 py-1 rounded-md">
                  ✓ REAL-TIME ARCADE
                </span>
              </div>
            </div>

            {/* Right Column: 2D Comic Hero Stage */}
            <div className="lg:col-span-7 w-full">
              <HeroComicStage />
            </div>
          </section>

          {/* Comic Catalog Strip Section */}
          <section id="games-grid" className="space-y-6 pt-4">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b-4 border-black pb-3">
              <div>
                <h2 className="font-comic text-3xl sm:text-4xl text-black tracking-wide">
                  💥 ARCADE & PUZZLE VAULT
                </h2>
                <p className="text-xs font-bold text-slate-700 mt-0.5">
                  Click any issue below to launch the arena and claim the high score.
                </p>
              </div>
              <div className="comic-badge px-3 py-1 bg-amber-300 text-black text-xs font-bold rounded-lg border-2 border-black">
                {filteredGames.length} OF {GAME_CATALOG.length} ISSUES READY
              </div>
            </div>

            {/* Comic Category Filter & Search Bar */}
            <GameFilterBar
              activeCategory={activeCategory}
              onSelectCategory={setActiveCategory}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              totalGames={GAME_CATALOG.length}
            />

            {/* Games Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGames.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  onSelect={handleLaunchGame}
                />
              ))}
            </div>

            {filteredGames.length === 0 && (
              <div className="comic-panel text-center py-16 rounded-3xl border-3 border-black bg-white space-y-3">
                <p className="font-comic text-2xl text-slate-800">NO ISSUES FOUND!</p>
                <p className="text-xs font-bold text-slate-500">Try clearing your search query or selecting All Games.</p>
                <button
                  onClick={() => {
                    setActiveCategory('all');
                    setSearchQuery('');
                  }}
                  className="comic-btn px-5 py-2 bg-amber-400 text-black text-sm rounded-xl cursor-pointer"
                >
                  RESET FILTERS
                </button>
              </div>
            )}
          </section>
        </main>
      )}

      {/* Comic Footer */}
      <footer className="w-full bg-amber-400 border-t-4 border-black py-6 px-4 sm:px-8 mt-12 text-xs font-bold text-black flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_-4px_0px_#000000]">
        <div className="flex items-center gap-2">
          <span className="font-comic text-base tracking-wider">FREEBUFF 3D COMIC ARCADE</span>
          <span>·</span>
          <span>PROCEDURAL WEB AUDIO SYNTHESIS</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              sound.playClick();
              const el = document.getElementById('games-grid');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="comic-btn px-3 py-1 rounded-lg bg-white text-black text-xs hover:bg-slate-100 cursor-pointer"
          >
            TOP OF ARCADE ↑
          </button>
        </div>
      </footer>

      {/* Global Modals & Drawers */}
      <AuthModal />
      <ProfileDrawer />
      <LeaderboardModal />
      <SettingsModal />
    </div>
  );
}
