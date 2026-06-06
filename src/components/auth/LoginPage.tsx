'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export function LoginPage() {
  const { signIn, signUp, resetPassword, firebaseEnabled } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!firebaseEnabled) {
    return (
      <div className="min-h-full flex items-center justify-center bg-slate-950 p-6">
        <div className="glass-panel max-w-md w-full rounded-2xl p-8 text-center">
          <Image src="/its-my-plan.png" alt="its my plan" width={48} height={48} className="mx-auto rounded-xl mb-4" />
          <h1 className="text-lg font-semibold text-slate-200 mb-2">Firebase Not Configured</h1>
          <p className="text-sm text-slate-400 mb-6">
            Add your Firebase environment variables to enable cloud sign-in and sync.
            You can still use the app in Zero Server mode.
          </p>
          <Link
            href="/"
            className="inline-block px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-medium text-white transition-colors"
          >
            Continue as Guest
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
    } catch (err) {
      setError((err as Error).message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Enter your email address first');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await resetPassword(email);
      setMessage('Password reset email sent — check your inbox');
    } catch (err) {
      setError((err as Error).message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full flex items-center justify-center bg-slate-950 p-6">
      <div className="glass-panel max-w-md w-full rounded-2xl overflow-hidden">
        <div className="px-8 pt-8 pb-4 text-center border-b border-slate-800/60">
          <Image src="/its-my-plan.png" alt="its my plan" width={56} height={56} className="mx-auto rounded-xl mb-3" priority />
          <h1 className="text-xl font-semibold text-slate-100">its my plan</h1>
          <p className="text-xs text-slate-500 mt-1">Draw rooms in 2D, see them in 3D</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          <div>
            <label className="prop-label">Email</label>
            <input
              type="email"
              className="prop-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="prop-label">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="prop-input pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {mode === 'signin' && (
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              Forgot password?
            </button>
          )}

          {error && <p className="text-xs text-red-400">{error}</p>}
          {message && <p className="text-xs text-emerald-400">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-sm font-medium text-white transition-colors"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>

          <div className="text-center text-xs text-slate-500">
            {mode === 'signin' ? (
              <>
                No account?{' '}
                <button type="button" onClick={() => setMode('signup')} className="text-blue-400 hover:text-blue-300">
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button type="button" onClick={() => setMode('signin')} className="text-blue-400 hover:text-blue-300">
                  Sign in
                </button>
              </>
            )}
          </div>

          <div className="pt-2 border-t border-slate-800/60 text-center">
            <Link href="/" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
              Continue without signing in (Zero Server mode)
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
