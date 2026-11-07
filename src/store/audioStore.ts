import { create } from 'zustand';
import { sound } from '../services/audio';

interface AudioState {
  soundEnabled: boolean;
  musicEnabled: boolean;
  soundVolume: number;
  musicVolume: number;
  toggleSound: () => void;
  toggleMusic: () => void;
  setSoundVolume: (val: number) => void;
  setMusicVolume: (val: number) => void;
}

const getStored = <T>(key: string, def: T): T => {
  try {
    const val = localStorage.getItem(`freebuff_${key}`);
    return val !== null ? JSON.parse(val) : def;
  } catch {
    return def;
  }
};

export const useAudioStore = create<AudioState>((set, get) => ({
  soundEnabled: getStored('soundEnabled', true),
  musicEnabled: getStored('musicEnabled', true),
  soundVolume: getStored('soundVolume', 0.8),
  musicVolume: getStored('musicVolume', 0.4),

  toggleSound: () => {
    const next = !get().soundEnabled;
    sound.setMute(!next);
    localStorage.setItem('freebuff_soundEnabled', JSON.stringify(next));
    set({ soundEnabled: next });
    if (next) sound.playClick();
  },

  toggleMusic: () => {
    const next = !get().musicEnabled;
    localStorage.setItem('freebuff_musicEnabled', JSON.stringify(next));
    if (next) {
      sound.startAmbientBgm();
    } else {
      sound.stopAmbientBgm();
    }
    set({ musicEnabled: next });
  },

  setSoundVolume: (val: number) => {
    sound.setSfxVolume(val);
    localStorage.setItem('freebuff_soundVolume', JSON.stringify(val));
    set({ soundVolume: val });
  },

  setMusicVolume: (val: number) => {
    sound.setMusicVolume(val);
    localStorage.setItem('freebuff_musicVolume', JSON.stringify(val));
    set({ musicVolume: val });
  },
}));
