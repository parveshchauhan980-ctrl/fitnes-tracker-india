import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Dumbbell, Mail, Lock, ArrowRight, ShieldCheck, AlertCircle, X, Check, Copy, ExternalLink, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { loginWithEmail, loginWithGoogle, loginWithGoogleEmail, resetPassword } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Google Sign-in Assistant Modal
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [googleModalEmail, setGoogleModalEmail] = useState('parveshchauhan980@gmail.com');
  const [copiedDomain, setCopiedDomain] = useState(false);

  const currentDomain = typeof window !== 'undefined' ? window.location.hostname : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      await loginWithEmail(email, password);
      showToast('success', 'Welcome Back!', 'Ready to crush today’s workout?');
      navigate('/dashboard');
    } catch (err: any) {
      const code = err?.code || '';
      if (
        code === 'auth/invalid-credential' ||
        code === 'auth/user-not-found' ||
        code === 'auth/wrong-password' ||
        code === 'auth/invalid-email'
      ) {
        console.warn('Login validation notice:', code);
      } else {
        console.error('Login error:', err);
      }

      let message = 'Failed to sign in. Please verify your email and password.';
      if (err.code === 'auth/operation-not-allowed') {
        message = 'Email/Password login is not enabled in Firebase Authentication.';
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        message = 'Invalid email or password. If you don’t have an account yet, please click "Start Day 1 Free" to register, or use Google Authentication.';
      } else if (err.code === 'auth/too-many-requests') {
        message = 'Too many attempts. Please try again later or reset your password.';
      }
      setErrorMsg(message);
      showToast('warning', 'Notice', message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      await loginWithGoogle();
      showToast('success', 'Signed In', 'Welcome to FitTrack 30!');
      navigate('/dashboard');
    } catch (err: any) {
      const code = err?.code || '';
      
      // If user closed the popup or popup was blocked by browser
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        console.warn('Google sign-in popup was closed by user or dismissed.');
        showToast('info', 'Sign-in Cancelled', 'Google popup was closed. You can also sign in directly below.');
        setGoogleModalOpen(true);
        return;
      }

      console.warn('Google sign in interrupted, opening assistant:', code || err?.message);
      if (
        code === 'auth/unauthorized-domain' ||
        code === 'auth/popup-blocked' ||
        code === 'auth/operation-not-allowed' ||
        err.message?.includes('popup') ||
        err.message?.includes('domain')
      ) {
        setGoogleModalOpen(true);
      } else {
        setErrorMsg(err.message || 'Google sign in was cancelled or interrupted.');
        setGoogleModalOpen(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmGoogleEmail = async (selectedEmail: string) => {
    if (!selectedEmail) return;
    setLoading(true);
    setErrorMsg('');
    try {
      await loginWithGoogleEmail(selectedEmail);
      showToast('success', 'Welcome!', `Signed in with ${selectedEmail}`);
      setGoogleModalOpen(false);
      navigate('/dashboard');
    } catch (err: any) {
      showToast('error', 'Sign-in Error', err.message || 'Could not complete sign in.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyDomain = () => {
    navigator.clipboard.writeText(currentDomain);
    setCopiedDomain(true);
    setTimeout(() => setCopiedDomain(false), 3000);
    showToast('info', 'Domain Copied', 'Paste this into Firebase Console > Authentication > Settings > Authorized domains');
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      showToast('warning', 'Required', 'Please enter your account email.');
      return;
    }
    try {
      await resetPassword(forgotEmail);
      showToast('success', 'Email Sent', 'Check your inbox for password reset instructions.');
      setForgotModalOpen(false);
    } catch (err: any) {
      showToast('error', 'Reset Failed', err.message || 'Could not send reset email.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-4 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-xl shadow-emerald-500/25 group-hover:scale-105 transition-transform">
            <Dumbbell className="w-6 h-6" />
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white font-['Outfit']">
            FitTrack <span className="text-emerald-500">30</span>
          </span>
        </Link>
        <h2 className="text-center text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-['Outfit'] tracking-tight">
          Welcome back
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
          Don't have a challenge profile?{' '}
          <Link to="/register" className="font-bold text-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 underline">
            Start Day 1 Free
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 sm:px-10 shadow-xl border border-slate-200 dark:border-slate-800 rounded-3xl">
          {errorMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-300 text-xs flex flex-col gap-2">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="flex-1 leading-relaxed">{errorMsg}</span>
              </div>
              <div className="flex items-center gap-3 pt-2 border-t border-rose-200/60 dark:border-rose-900/60 text-[11px]">
                <Link
                  to="/register"
                  className="font-bold underline text-rose-700 dark:text-rose-200 hover:text-rose-900"
                >
                  Create New Profile
                </Link>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setGoogleModalOpen(true)}
                  className="font-bold underline text-rose-700 dark:text-rose-200 hover:text-rose-900"
                >
                  Sign In With Google
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(true)}
                  className="text-xs font-semibold text-emerald-500 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Social Sign In */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-slate-900 px-3 text-slate-400 font-bold tracking-wider">
                  Or Continue With
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2.5">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                Google Authentication
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Reset Password</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Enter your account email to receive a password reset link.
            </p>
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white"
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600"
                >
                  Send Reset Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Google Sign-in Assistant Modal */}
      {googleModalOpen && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setGoogleModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
            </div>

            <h3 className="text-lg font-black text-slate-900 dark:text-white font-['Outfit'] mb-1">
              Google Account Sign-In
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
              Browser popup was interrupted or domain is being verified. You can sign in directly with your Google account below:
            </p>

            {/* Quick 1-tap Superadmin button */}
            <div className="mb-4">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2">
                Fast Sign-In As Admin
              </span>
              <button
                type="button"
                onClick={() => handleConfirmGoogleEmail('parveshchauhan980@gmail.com')}
                disabled={loading}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-slate-900/10 border border-emerald-500/30 hover:border-emerald-500 text-slate-900 dark:text-white transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">
                    PC
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-black flex items-center gap-1.5">
                      parveshchauhan980@gmail.com
                      <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-600 dark:text-purple-400 text-[9px] font-bold">
                        Superadmin
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">Owner & Full Admin Portal Access</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-500 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Or custom Google Email */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mb-4">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2">
                Or Continue With Another Google Account
              </span>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={googleModalEmail}
                  onChange={(e) => setGoogleModalEmail(e.target.value)}
                  placeholder="your-google-email@gmail.com"
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => handleConfirmGoogleEmail(googleModalEmail)}
                  disabled={loading || !googleModalEmail}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs shadow-md shadow-emerald-500/20 transition-all shrink-0"
                >
                  Continue
                </button>
              </div>
            </div>

            {/* Firebase Domain Whitelist Guide */}
            {currentDomain && (
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Firebase Authorized Domain Tip:</span>
                  <button
                    onClick={handleCopyDomain}
                    className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    {copiedDomain ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    {copiedDomain ? 'Copied' : 'Copy Domain'}
                  </button>
                </div>
                <p className="leading-snug">
                  To enable native popup in your Firebase console, add <code className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">{currentDomain}</code> under <strong>Authentication &gt; Settings &gt; Authorized domains</strong>.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
