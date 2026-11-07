import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { GAME_CATALOG } from '../../store/gameStore';
import { sound } from '../../services/audio';
import { X, Trophy, LogOut, Flame, Award, Gamepad2, Shield } from 'lucide-react';

export const ProfileDrawer: React.FC = () => {
  const { user, profileDrawerOpen, setProfileDrawer, logout } = useAuthStore();

  if (!profileDrawerOpen || !user) return null;

  const totalGamesPlayed = Object.values(user.stats).reduce((acc, s) => acc + s.gamesPlayed, 0);
  const totalWins = Object.values(user.stats).reduce((acc, s) => acc + s.wins, 0);
  const winRate = totalGamesPlayed > 0 ? Math.round((totalWins / totalGamesPlayed) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="fixed inset-y-0 right-0 max-w-full flex pl-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-screen max-w-md bg-white border-l-4 border-black shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] flex flex-col justify-between p-6 sm:p-8 text-slate-900 overflow-y-auto">
          {/* Header */}
          <div>
            <div className="flex items-center justify-between pb-4 border-b-3 border-black">
              <h2 className="font-comic text-2xl text-black flex items-center gap-2">
                <Gamepad2 className="w-6 h-6 text-rose-500" />
                <span>PLAYER PASSPORT</span>
              </h2>
              <button
                onClick={() => {
                  sound.playClick();
                  setProfileDrawer(false);
                }}
                className="comic-btn p-1.5 rounded-lg bg-rose-400 text-white font-bold cursor-pointer"
                aria-label="Close profile drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Avatar & User Info */}
            <div className="py-6 flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-400 border-3 border-black shadow-[4px_4px_0px_#000000] flex items-center justify-center font-comic text-2xl font-bold text-black rotate-[-3deg]">
                {user.avatarSeed}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-comic text-xl text-black">{user.displayName}</h3>
                  {user.isGuest && (
                    <span className="comic-badge text-[10px] bg-rose-500 text-white px-1.5 py-0.5 rounded">
                      GUEST PASS
                    </span>
                  )}
                </div>
                <p className="text-xs font-bold text-slate-600 truncate max-w-[220px]">{user.email}</p>
                <p className="text-[11px] font-bold text-slate-500 uppercase">
                  ACTIVE SINCE {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Lifetime Stats Strip */}
            <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-amber-100 border-3 border-black shadow-[3px_3px_0px_#000000] mb-6">
              <div className="text-center">
                <div className="flex items-center justify-center text-rose-600 mb-1">
                  <Flame className="w-5 h-5 fill-rose-500" />
                </div>
                <div className="text-xl font-comic text-black tabular-nums">{totalGamesPlayed}</div>
                <div className="text-[10px] font-bold text-slate-700 uppercase">Played</div>
              </div>
              <div className="text-center border-x-2 border-black">
                <div className="flex items-center justify-center text-amber-600 mb-1">
                  <Trophy className="w-5 h-5 fill-amber-500" />
                </div>
                <div className="text-xl font-comic text-black tabular-nums">{totalWins}</div>
                <div className="text-[10px] font-bold text-slate-700 uppercase">Victories</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center text-cyan-600 mb-1">
                  <Award className="w-5 h-5 fill-cyan-500" />
                </div>
                <div className="text-xl font-comic text-black tabular-nums">{winRate}%</div>
                <div className="text-[10px] font-bold text-slate-700 uppercase">Win Rate</div>
              </div>
            </div>

            {/* High Scores per Game */}
            <div>
              <h4 className="font-comic text-lg text-black mb-3">
                ★ GAME HIGH SCORE VAULT
              </h4>
              <div className="space-y-2">
                {GAME_CATALOG.map((g) => {
                  const stat = user.stats[g.id];
                  const hasPlayed = stat && stat.gamesPlayed > 0;
                  return (
                    <div
                      key={g.id}
                      className="p-3 rounded-xl bg-slate-50 border-2 border-black flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-black">{g.title}</div>
                        <div className="text-[11px] font-medium text-slate-500">
                          {g.categoryLabel}
                        </div>
                      </div>
                      <div className="text-right">
                        {hasPlayed ? (
                          <>
                            <div className="font-comic text-base text-emerald-700 tabular-nums">
                              {stat.highScore} PTS
                            </div>
                            <div className="text-[10px] font-bold text-slate-600">
                              {stat.wins}W / {stat.losses}L
                            </div>
                          </>
                        ) : (
                          <div className="text-[11px] font-bold text-slate-400 uppercase">UNPLAYED</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer Sign Out */}
          <div className="pt-6 mt-6 border-t-3 border-black">
            <button
              onClick={() => {
                sound.playClick();
                logout();
              }}
              className="comic-btn w-full py-2.5 px-4 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-comic text-base flex items-center justify-center gap-2 cursor-pointer shadow-[3px_3px_0px_#000000]"
            >
              <LogOut className="w-4 h-4" />
              <span>LOG OUT OF PASSPORT</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
