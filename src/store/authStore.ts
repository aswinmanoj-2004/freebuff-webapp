import { create } from 'zustand';

export interface GameScoreEntry {
  highScore: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  lastPlayed?: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  avatarSeed: string;
  isGuest: boolean;
  createdAt: string;
  stats: Record<string, GameScoreEntry>;
}

interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  authModalOpen: boolean;
  authModalTab: 'signin' | 'signup' | 'forgot';
  profileDrawerOpen: boolean;
  leaderboardModalOpen: boolean;
  settingsModalOpen: boolean;
  
  // Actions
  setAuthModal: (open: boolean, tab?: 'signin' | 'signup' | 'forgot') => void;
  setProfileDrawer: (open: boolean) => void;
  setLeaderboardModal: (open: boolean) => void;
  setSettingsModal: (open: boolean) => void;
  setError: (err: string | null) => void;
  
  loginAsGuest: () => void;
  loginWithEmail: (email: string, pass: string, remember: boolean) => Promise<boolean>;
  signupWithEmail: (name: string, email: string, pass: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  sendPasswordReset: (email: string) => Promise<boolean>;
  logout: () => void;
  
  recordGameStats: (gameId: string, score: number, didWin: boolean) => void;
}

const STORAGE_KEY = 'freebuff_user_session';
const PROFILES_KEY = 'freebuff_local_accounts';

const getInitialUser = (): UserProfile | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return null;
};

// Calculate password strength score (0 to 100)
export function getPasswordStrength(pass: string): { score: number; label: string; color: string } {
  if (!pass) return { score: 0, label: 'Empty', color: 'bg-slate-700' };
  let s = 0;
  if (pass.length >= 6) s += 20;
  if (pass.length >= 10) s += 20;
  if (/[a-z]/.test(pass)) s += 15;
  if (/[A-Z]/.test(pass)) s += 15;
  if (/[0-9]/.test(pass)) s += 15;
  if (/[^a-zA-Z0-9]/.test(pass)) s += 15;

  if (s < 40) return { score: s, label: 'Weak', color: 'bg-rose-500' };
  if (s < 70) return { score: s, label: 'Moderate', color: 'bg-amber-500' };
  return { score: s, label: 'Strong', color: 'bg-emerald-500' };
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: getInitialUser(),
  isLoading: false,
  error: null,
  authModalOpen: false,
  authModalTab: 'signin',
  profileDrawerOpen: false,
  leaderboardModalOpen: false,
  settingsModalOpen: false,

  setAuthModal: (open, tab = 'signin') => set({ authModalOpen: open, authModalTab: tab, error: null }),
  setProfileDrawer: (open) => set({ profileDrawerOpen: open }),
  setLeaderboardModal: (open) => set({ leaderboardModalOpen: open }),
  setSettingsModal: (open) => set({ settingsModalOpen: open }),
  setError: (error) => set({ error }),

  loginAsGuest: () => {
    const guestUser: UserProfile = {
      uid: `guest_${Math.random().toString(36).substring(2, 9)}`,
      displayName: 'Guest Player',
      email: 'guest@freebuff3d.local',
      avatarSeed: 'cyber_guest',
      isGuest: true,
      createdAt: new Date().toISOString(),
      stats: {
        'snake-ladder': { highScore: 0, gamesPlayed: 0, wins: 0, losses: 0 },
        'tic-tac-toe': { highScore: 0, gamesPlayed: 0, wins: 0, losses: 0 },
        'flappy-bird': { highScore: 0, gamesPlayed: 0, wins: 0, losses: 0 },
      },
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(guestUser));
    } catch {
      // ignore
    }
    set({ user: guestUser, authModalOpen: false, error: null });
  },

  loginWithEmail: async (email, pass, remember) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate real auth handshake with local account store
      await new Promise((r) => setTimeout(r, 400));
      const rawAccounts = localStorage.getItem(PROFILES_KEY);
      const accounts = rawAccounts ? JSON.parse(rawAccounts) : {};

      const existing = accounts[email.toLowerCase()];
      if (!existing || existing.password !== pass) {
        set({ isLoading: false, error: 'Invalid email or password. Please check your credentials.' });
        return false;
      }

      const userProfile: UserProfile = existing.profile;
      if (remember) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userProfile));
      } else {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(userProfile));
      }

      set({ user: userProfile, isLoading: false, authModalOpen: false });
      return true;
    } catch {
      set({ isLoading: false, error: 'An error occurred during sign-in. Please try again.' });
      return false;
    }
  },

  signupWithEmail: async (name, email, pass) => {
    set({ isLoading: true, error: null });
    try {
      await new Promise((r) => setTimeout(r, 450));
      const key = email.toLowerCase();
      const rawAccounts = localStorage.getItem(PROFILES_KEY);
      const accounts = rawAccounts ? JSON.parse(rawAccounts) : {};

      if (accounts[key]) {
        set({ isLoading: false, error: 'An account with this email already exists.' });
        return false;
      }

      const newUser: UserProfile = {
        uid: `user_${Math.random().toString(36).substring(2, 10)}`,
        displayName: name.trim() || 'Player',
        email: key,
        avatarSeed: name.slice(0, 2).toUpperCase() || 'P1',
        isGuest: false,
        createdAt: new Date().toISOString(),
        stats: {},
      };

      accounts[key] = {
        password: pass,
        profile: newUser,
      };
      localStorage.setItem(PROFILES_KEY, JSON.stringify(accounts));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));

      set({ user: newUser, isLoading: false, authModalOpen: false });
      return true;
    } catch {
      set({ isLoading: false, error: 'Failed to create account. Please try again.' });
      return false;
    }
  },

  loginWithGoogle: async () => {
    set({ isLoading: true, error: null });
    try {
      await new Promise((r) => setTimeout(r, 500));
      const googleUser: UserProfile = {
        uid: `google_${Math.random().toString(36).substring(2, 9)}`,
        displayName: 'Google Player',
        email: 'player@gmail.com',
        avatarSeed: 'GP',
        isGuest: false,
        createdAt: new Date().toISOString(),
        stats: {},
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(googleUser));
      set({ user: googleUser, isLoading: false, authModalOpen: false });
      return true;
    } catch {
      set({ isLoading: false, error: 'Google sign-in was interrupted.' });
      return false;
    }
  },

  sendPasswordReset: async (email) => {
    set({ isLoading: true, error: null });
    try {
      await new Promise((r) => setTimeout(r, 400));
      if (!email.includes('@')) {
        set({ isLoading: false, error: 'Please enter a valid email address.' });
        return false;
      }
      set({ isLoading: false });
      return true;
    } catch {
      set({ isLoading: false, error: 'Failed to send password reset email.' });
      return false;
    }
  },

  logout: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    set({ user: null, profileDrawerOpen: false });
  },

  recordGameStats: (gameId: string, score: number, didWin: boolean) => {
    const { user } = get();
    if (!user) return;

    const currentStats = user.stats[gameId] || {
      highScore: 0,
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
    };

    const updatedEntry: GameScoreEntry = {
      highScore: Math.max(currentStats.highScore, score),
      gamesPlayed: currentStats.gamesPlayed + 1,
      wins: didWin ? currentStats.wins + 1 : currentStats.wins,
      losses: didWin ? currentStats.losses : currentStats.losses + 1,
      lastPlayed: new Date().toISOString(),
    };

    const updatedUser: UserProfile = {
      ...user,
      stats: {
        ...user.stats,
        [gameId]: updatedEntry,
      },
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
      // update persistent accounts if not guest
      if (!user.isGuest) {
        const rawAccounts = localStorage.getItem(PROFILES_KEY);
        if (rawAccounts) {
          const accounts = JSON.parse(rawAccounts);
          if (accounts[user.email]) {
            accounts[user.email].profile = updatedUser;
            localStorage.setItem(PROFILES_KEY, JSON.stringify(accounts));
          }
        }
      }
    } catch {
      // ignore
    }

    set({ user: updatedUser });
  },
}));
