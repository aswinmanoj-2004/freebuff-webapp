import React, { useState } from 'react';
import { useAuthStore, getPasswordStrength } from '../../store/authStore';
import { sound } from '../../services/audio';
import { X, Lock, Mail, User, ShieldCheck, Eye, EyeOff, Sparkles, Zap } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    authModalOpen,
    authModalTab,
    setAuthModal,
    isLoading,
    error,
    loginWithEmail,
    signupWithEmail,
    loginWithGoogle,
    sendPasswordReset,
    loginAsGuest,
  } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [localValidationErr, setLocalValidationErr] = useState<string | null>(null);

  if (!authModalOpen) return null;

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalValidationErr(null);

    if (authModalTab === 'signin') {
      if (!email.trim() || !password) {
        setLocalValidationErr('Please enter both email and password.');
        return;
      }
      sound.playClick();
      await loginWithEmail(email, password, rememberMe);
    } else if (authModalTab === 'signup') {
      if (!name.trim()) {
        setLocalValidationErr('Please enter your player name.');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setLocalValidationErr('Please enter a valid email address.');
        return;
      }
      if (password.length < 6) {
        setLocalValidationErr('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setLocalValidationErr('Passwords do not match.');
        return;
      }
      sound.playClick();
      await signupWithEmail(name, email, password);
    } else if (authModalTab === 'forgot') {
      if (!email.trim() || !email.includes('@')) {
        setLocalValidationErr('Please enter your email to receive a reset link.');
        return;
      }
      sound.playClick();
      const ok = await sendPasswordReset(email);
      if (ok) setResetSent(true);
    }
  };

  const handleGuestPlay = () => {
    sound.playSelect();
    loginAsGuest();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="comic-panel relative w-full max-w-md rounded-3xl p-6 sm:p-8 bg-white border-4 border-black text-slate-900 shadow-[8px_8px_0px_#000000]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => {
            sound.playClick();
            setAuthModal(false);
          }}
          className="comic-btn absolute top-4 right-4 p-1.5 rounded-lg bg-rose-400 text-white font-bold cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="comic-badge inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-400 border-3 border-black text-black mb-2 rotate-[-4deg]">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="font-comic text-3xl tracking-wide text-black">
            {authModalTab === 'signin' && 'WELCOME BACK, HERO!'}
            {authModalTab === 'signup' && 'JOIN THE ARCADE SQUAD!'}
            {authModalTab === 'forgot' && 'RESET SECRET CODE'}
          </h2>
          <p className="text-xs font-bold text-slate-600 mt-1">
            {authModalTab === 'signin' && 'Sign in to save 3D scores and unlock leaderboards.'}
            {authModalTab === 'signup' && 'Create your player profile and choose an avatar.'}
            {authModalTab === 'forgot' && 'Enter your email to receive recovery instructions.'}
          </p>
        </div>

        {/* Tab Switcher */}
        {authModalTab !== 'forgot' && (
          <div className="flex p-1 mb-5 bg-slate-100 rounded-2xl border-3 border-black">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setAuthModal(true, 'signin');
                setLocalValidationErr(null);
              }}
              className={`flex-1 py-2 font-comic text-base tracking-wider rounded-xl transition-all cursor-pointer ${
                authModalTab === 'signin'
                  ? 'bg-amber-400 text-black border-2 border-black shadow-[2px_2px_0px_#000000]'
                  : 'text-slate-600 hover:text-black'
              }`}
            >
              SIGN IN
            </button>
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setAuthModal(true, 'signup');
                setLocalValidationErr(null);
              }}
              className={`flex-1 py-2 font-comic text-base tracking-wider rounded-xl transition-all cursor-pointer ${
                authModalTab === 'signup'
                  ? 'bg-amber-400 text-black border-2 border-black shadow-[2px_2px_0px_#000000]'
                  : 'text-slate-600 hover:text-black'
              }`}
            >
              SIGN UP
            </button>
          </div>
        )}

        {/* Error Feedback */}
        {(error || localValidationErr) && (
          <div className="mb-4 p-3 rounded-xl bg-rose-100 border-2 border-rose-500 font-bold text-xs text-rose-800">
            {localValidationErr || error}
          </div>
        )}

        {/* Reset Email Sent Confirmation */}
        {authModalTab === 'forgot' && resetSent ? (
          <div className="text-center py-4 space-y-4">
            <div className="p-3 bg-emerald-100 border-2 border-emerald-500 rounded-xl text-xs font-bold text-emerald-900">
              Password reset link sent to <strong>{email}</strong>!
            </div>
            <button
              onClick={() => {
                setResetSent(false);
                setAuthModal(true, 'signin');
              }}
              className="comic-btn px-4 py-2 bg-amber-400 text-black rounded-xl font-comic text-sm"
            >
              RETURN TO SIGN IN
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {authModalTab === 'signup' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1">
                  Player Codename
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-600" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="PixelKnight"
                    required
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border-2 border-black rounded-xl text-black font-bold focus:outline-none focus:bg-amber-50"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-600" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hero@comicarcade.com"
                  required
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border-2 border-black rounded-xl text-black font-bold focus:outline-none focus:bg-amber-50"
                />
              </div>
            </div>

            {authModalTab !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-black">
                    Secret Password
                  </label>
                  {authModalTab === 'signin' && (
                    <button
                      type="button"
                      onClick={() => setAuthModal(true, 'forgot')}
                      className="text-[11px] font-bold text-rose-600 hover:underline"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-600" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-9 pr-9 py-2 text-sm bg-slate-50 border-2 border-black rounded-xl text-black font-bold focus:outline-none focus:bg-amber-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Meter */}
                {authModalTab === 'signup' && password.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-slate-600">STRENGTH:</span>
                      <span className="text-black uppercase">{strength.label}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 border border-black rounded-full overflow-hidden">
                      <div
                        className={`h-full ${strength.color}`}
                        style={{ width: `${strength.score}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {authModalTab === 'signup' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-black mb-1">
                  Confirm Secret Password
                </label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-2.5 w-4 h-4 text-slate-600" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border-2 border-black rounded-xl text-black font-bold focus:outline-none focus:bg-amber-50"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="comic-btn w-full py-3 bg-amber-400 hover:bg-yellow-300 text-black font-comic text-lg tracking-wider rounded-xl cursor-pointer shadow-[3px_3px_0px_#000000] active:scale-95 transition-all"
            >
              {isLoading ? (
                <span>VERIFYING...</span>
              ) : (
                <span>
                  {authModalTab === 'signin' && 'ENTER ARCADE!'}
                  {authModalTab === 'signup' && 'CREATE HERO PASS!'}
                  {authModalTab === 'forgot' && 'SEND RESET LINK'}
                </span>
              )}
            </button>
          </form>
        )}

        {/* Divider */}
        {authModalTab !== 'forgot' && (
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-black"></div>
            </div>
            <div className="relative flex justify-center text-[10px] font-comic tracking-wider">
              <span className="bg-white px-3 text-slate-600 uppercase">OR QUICK JUMP</span>
            </div>
          </div>
        )}

        {/* Social & Guest Buttons */}
        {authModalTab !== 'forgot' && (
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                loginWithGoogle();
              }}
              disabled={isLoading}
              className="comic-btn w-full py-2 px-4 rounded-xl bg-white hover:bg-slate-100 text-black text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-[2px_2px_0px_#000000]"
            >
              <span>CONNECT WITH GOOGLE</span>
            </button>

            <button
              type="button"
              onClick={handleGuestPlay}
              className="comic-btn w-full py-2 px-4 rounded-xl bg-cyan-300 hover:bg-cyan-200 text-black text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#000000]"
            >
              <Zap className="w-4 h-4 fill-black" />
              <span>INSTANT GUEST PASS (NO SIGNUP)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
