import React from 'react';
import { useAuthStore } from '../store/authStore';
import { useAudioStore } from '../store/audioStore';
import { sound } from '../services/audio';
import { Volume2, VolumeX, Trophy, Settings, LogIn, Sparkles } from 'lucide-react';

interface NavbarProps {
  onNavClick: (section: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavClick }) => {
  const { user, setAuthModal, setProfileDrawer, setLeaderboardModal, setSettingsModal } = useAuthStore();
  const { soundEnabled, toggleSound } = useAudioStore();

  const handleSoundToggle = () => {
    toggleSound();
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-amber-400 border-b-4 border-black px-4 sm:px-8 py-3 flex items-center justify-between gap-4 shadow-[0_4px_0px_#000000]">
      {/* Zone 1: Comic Brand Wordmark */}
      <button 
        onClick={() => onNavClick('home')}
        className="flex items-center gap-2 group transition-transform active:scale-95 text-left cursor-pointer"
      >
        <span className="font-comic text-2xl sm:text-3xl tracking-wider text-black drop-shadow-[2px_2px_0px_#ffffff] flex items-center gap-1.5">
          FREEBUFF
          <span className="inline-block bg-rose-500 text-white text-xs sm:text-sm font-black px-2 py-0.5 rounded-md border-2 border-black rotate-[-6deg] shadow-[2px_2px_0px_#000000] group-hover:rotate-[0deg] transition-transform">
            ARCADE!
          </span>
        </span>
      </button>

      {/* Zone 2: Comic Nav Tabs */}
      <nav className="hidden md:flex items-center gap-4">
        <button
          onClick={() => {
            sound.playClick();
            onNavClick('games');
          }}
          className="comic-btn px-3.5 py-1.5 bg-white hover:bg-cyan-300 text-black text-sm rounded-lg cursor-pointer"
        >
          🎮 GAMES
        </button>
        <button
          onClick={() => {
            sound.playClick();
            setLeaderboardModal(true);
          }}
          className="comic-btn px-3.5 py-1.5 bg-white hover:bg-yellow-300 text-black text-sm rounded-lg flex items-center gap-1.5 cursor-pointer"
        >
          <Trophy className="w-4 h-4 text-amber-500 fill-amber-400" />
          <span>LEADERBOARD</span>
        </button>
        <button
          onClick={() => {
            sound.playClick();
            setSettingsModal(true);
          }}
          className="comic-btn px-3.5 py-1.5 bg-white hover:bg-rose-300 text-black text-sm rounded-lg flex items-center gap-1.5 cursor-pointer"
        >
          <Settings className="w-4 h-4 text-slate-700" />
          <span>SETTINGS</span>
        </button>
      </nav>

      {/* Zone 3: Sound & User Profile Action */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          onClick={handleSoundToggle}
          aria-label={soundEnabled ? 'Mute audio' : 'Unmute audio'}
          className="comic-btn p-2 rounded-xl bg-white hover:bg-amber-200 text-black cursor-pointer"
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <VolumeX className="w-4 h-4 text-rose-600" />
          )}
        </button>

        {user ? (
          <button
            onClick={() => {
              sound.playClick();
              setProfileDrawer(true);
            }}
            className="comic-btn px-3 py-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black flex items-center gap-2 cursor-pointer"
          >
            <div className="w-6 h-6 rounded-md bg-black text-white font-comic text-xs flex items-center justify-center font-bold">
              {user.avatarSeed}
            </div>
            <span className="hidden sm:inline font-bold text-xs uppercase max-w-[120px] truncate">
              {user.displayName}
            </span>
            {user.isGuest && (
              <span className="text-[10px] font-comic bg-amber-300 text-black px-1.5 py-0.2 rounded border border-black">
                GUEST
              </span>
            )}
          </button>
        ) : (
          <button
            onClick={() => {
              sound.playClick();
              setAuthModal(true, 'signin');
            }}
            className="comic-btn px-4 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-comic text-sm tracking-wide cursor-pointer"
          >
            <span className="flex items-center gap-1">
              <LogIn className="w-4 h-4" />
              <span>SIGN IN</span>
            </span>
          </button>
        )}
      </div>
    </header>
  );
};
