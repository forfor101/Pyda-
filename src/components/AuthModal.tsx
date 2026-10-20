import React, { useState } from 'react';
import {
  Lock,
  Mail,
  KeyRound,
  User,
  Phone,
  Building2,
  X,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PageView } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessNavigate?: (page: PageView) => void;
  defaultMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccessNavigate,
  defaultMode = 'login',
}) => {
  const {
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInWithDemoUser,
    error,
    clearError,
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!email.trim() || !password.trim()) {
      setLocalError('Please enter both your email address and password.');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        await signInWithEmail(email, password);
      } else {
        if (!fullName.trim()) {
          setLocalError('Please enter your full name.');
          setIsSubmitting(false);
          return;
        }
        await signUpWithEmail(email, password, fullName, phone, companyName);
      }
      onClose();
      if (onSuccessNavigate) {
        onSuccessNavigate('dashboard');
      }
    } catch (err: any) {
      setLocalError(err.message || 'Authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    setLocalError(null);
    try {
      await signInWithGoogle();
      onClose();
      if (onSuccessNavigate) {
        onSuccessNavigate('dashboard');
      }
    } catch (err: any) {
      setLocalError(err.message || 'Google authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoSignIn = async (role: 'vip' | 'corporate') => {
    setIsSubmitting(true);
    setLocalError(null);
    try {
      await signInWithDemoUser(role);
      onClose();
      if (onSuccessNavigate) {
        onSuccessNavigate('dashboard');
      }
    } catch (err: any) {
      setLocalError(err.message || 'Demo authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden relative">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20">
              <Lock className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>Client Portal Authentication</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold uppercase">
                  Firebase Auth
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                View your active shipments, GPS convoys, and Document Vault.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            id="auth-modal-close-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 relative z-10 max-h-[80vh] overflow-y-auto">
          {/* Mode Switcher */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setLocalError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'login' ? 'bg-amber-500 text-slate-950 shadow font-black' : 'text-slate-400 hover:text-white'
              }`}
              id="auth-tab-login"
            >
              Sign In to Portal
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setLocalError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'register' ? 'bg-amber-500 text-slate-950 shadow font-black' : 'text-slate-400 hover:text-white'
              }`}
              id="auth-tab-register"
            >
              Create Account
            </button>
          </div>

          {/* Error Banner */}
          {(localError || error) && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{localError || error}</span>
            </div>
          )}

          {/* Quick Demo Access Bar */}
          <div className="bg-slate-950/80 border border-amber-500/20 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-amber-400">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Instant Demo Access (Live Firebase Session)</span>
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleDemoSignIn('vip')}
                className="py-2 px-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 hover:text-amber-400 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                id="demo-vip-login-btn"
              >
                <span>👑 VIP Client (Chief Adeleke)</span>
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleDemoSignIn('corporate')}
                className="py-2 px-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 hover:text-amber-400 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                id="demo-corp-login-btn"
              >
                <span>🏢 Corporate Dispatch</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">or with credentials</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. Chief Emeka Adeleke"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 text-white text-xs rounded-xl pl-10 pr-3.5 py-2.5 outline-none"
                      required={mode === 'register'}
                      id="auth-fullname-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        placeholder="+234 803 000 0000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 text-white text-xs rounded-xl pl-10 pr-3.5 py-2.5 outline-none"
                        id="auth-phone-input"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Company (Optional)</label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Company / Org"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 text-white text-xs rounded-xl pl-10 pr-3.5 py-2.5 outline-none"
                        id="auth-company-input"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="client@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 text-white text-xs rounded-xl pl-10 pr-3.5 py-2.5 outline-none"
                  required
                  id="auth-email-input"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Password</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 text-white text-xs rounded-xl pl-10 pr-3.5 py-2.5 outline-none"
                  required
                  id="auth-password-input"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
              id="auth-submit-btn"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating with Firebase...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 stroke-[2.5]" />
                  <span>{mode === 'login' ? 'Sign In to Client Portal' : 'Register & Create Portal Profile'}</span>
                </>
              )}
            </button>
          </form>

          {/* Social Sign-In Button */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleGoogleSignIn}
            className="w-full bg-slate-950 hover:bg-slate-850 border border-slate-800 text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors"
            id="auth-google-btn"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google Account</span>
          </button>
        </div>

        {/* Footer Security Badge */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Encrypted Token-Based Auth</span>
          </div>
          <span>Pyda Identity Gateway</span>
        </div>
      </div>
    </div>
  );
};
