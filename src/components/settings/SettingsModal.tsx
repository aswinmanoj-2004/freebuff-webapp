import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useAudioStore } from '../../store/audioStore';
import { sound } from '../../services/audio';
import { X, Volume2, VolumeX, Music, Monitor, Sparkles } from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const { settingsModalOpen, setSettingsModal } = useAuthStore();
  const { soundEnabled, musicEnabled, soundVolume, musicVolume, toggleSound, toggleMusic, setSoundVolume, setMusicVolume } = useAudioStore();

  const [reducedMotion, setReducedMotion] = useState(() => {
    return localStorage.getItem('freebuff_reduced_motion') === 'true';
  });

  const [graphicsQuality, setGraphicsQuality] = useState<'high' | 'balanced'>(() => {
    return (localStorage.getItem('freebuff_graphics') as 'high' | 'balanced') || 'high';
  });

  if (!settingsModalOpen) return null;

  const handleReducedMotionToggle = () => {
    const next = !reducedMotion;
    setReducedMotion(next);
    localStorage.setItem('freebuff_reduced_motion', String(next));
  };

  const handleQualityChange = (q: 'high' | 'balanced') => {
    sound.playClick();
    setGraphicsQuality(q);
    localStorage.setItem('freebuff_graphics', q);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="comic-panel relative w-full max-w-md rounded-3xl p-6 sm:p-8 bg-white border-4 border-black text-slate-900 shadow-[8px_8px_0px_#000000]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b-3 border-black">
          <div>
            <h2 className="font-comic text-3xl text-black">SYSTEM SETTINGS</h2>
            <p className="text-xs font-bold text-slate-600">Audio synthesis & comic visual options.</p>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              setSettingsModal(false);
            }}
            className="comic-btn p-1.5 rounded-lg bg-rose-400 text-white font-bold cursor-pointer"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options */}
        <div className="py-6 space-y-6">
          {/* Sound FX Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-emerald-600" />
                <span className="font-comic text-lg text-black">SOUND EFFECTS</span>
              </div>
              <button
                type="button"
                onClick={toggleSound}
                className={`comic-badge px-3 py-1 text-xs rounded-lg cursor-pointer ${
                  soundEnabled ? 'bg-emerald-400 text-black' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {soundEnabled ? 'ON' : 'OFF'}
              </button>
            </div>

            {soundEnabled && (
              <div className="space-y-1.5 pl-6">
                <div className="flex justify-between text-xs font-bold text-slate-600">
                  <span>SFX Volume</span>
                  <span className="font-mono tabular-nums">{Math.round(soundVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={soundVolume}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setSoundVolume(val);
                    sound.playClick();
                  }}
                  className="w-full accent-amber-500 bg-slate-200 h-2 rounded-lg cursor-pointer border border-black"
                />
              </div>
            )}
          </div>

          {/* Procedural Music Section */}
          <div className="space-y-3 pt-4 border-t-2 border-black/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Music className="w-5 h-5 text-indigo-600" />
                <div>
                  <span className="font-comic text-lg text-black">COMIC AMBIENT CHORDS</span>
                  <p className="text-[11px] font-bold text-slate-500">Procedural Web Audio synthesis</p>
                </div>
              </div>
              <button
                type="button"
                onClick={toggleMusic}
                className={`comic-badge px-3 py-1 text-xs rounded-lg cursor-pointer ${
                  musicEnabled ? 'bg-emerald-400 text-black' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {musicEnabled ? 'ON' : 'OFF'}
              </button>
            </div>

            {musicEnabled && (
              <div className="space-y-1.5 pl-6">
                <div className="flex justify-between text-xs font-bold text-slate-600">
                  <span>Music Volume</span>
                  <span className="font-mono tabular-nums">{Math.round(musicVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={musicVolume}
                  onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 bg-slate-200 h-2 rounded-lg cursor-pointer border border-black"
                />
              </div>
            )}
          </div>

          {/* Graphics Quality */}
          <div className="space-y-2.5 pt-4 border-t-2 border-black/20">
            <div className="flex items-center gap-2 font-comic text-lg text-black">
              <Monitor className="w-5 h-5 text-amber-500" />
              <span>3D GRAPHICS PRESET</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleQualityChange('high')}
                className={`comic-btn p-3 rounded-2xl border-2 border-black text-left cursor-pointer ${
                  graphicsQuality === 'high'
                    ? 'bg-amber-300 text-black shadow-[3px_3px_0px_#000000]'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                <div className="font-comic text-sm">HIGH (60 FPS)</div>
                <div className="text-[10px] font-bold text-slate-600">Full Toon Cel-Shading</div>
              </button>

              <button
                onClick={() => handleQualityChange('balanced')}
                className={`comic-btn p-3 rounded-2xl border-2 border-black text-left cursor-pointer ${
                  graphicsQuality === 'balanced'
                    ? 'bg-amber-300 text-black shadow-[3px_3px_0px_#000000]'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                <div className="font-comic text-sm">BATTERY SAVER</div>
                <div className="text-[10px] font-bold text-slate-600">Optimized Low-Power</div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t-3 border-black text-center">
          <button
            onClick={() => {
              sound.playClick();
              setSettingsModal(false);
            }}
            className="comic-btn w-full py-2.5 bg-amber-400 hover:bg-yellow-300 text-black font-comic text-lg tracking-wider rounded-xl cursor-pointer"
          >
            APPLY & CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
