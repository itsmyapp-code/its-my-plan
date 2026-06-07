'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export function LoginPage() {
  const { signIn, signUp, resetPassword, firebaseEnabled, user, loading } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Redirect when already signed in
  useEffect(() => {
    if (!loading && user) {
      router.replace('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center bg-slate-100 p-6">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  if (!firebaseEnabled) {
    return (
      <div className="min-h-full flex items-center justify-center bg-slate-100 p-6">
        <div className="glass-panel max-w-lg w-full rounded-2xl p-8">
          <div className="text-center mb-6">
            <Image src="/its-my-plan.png" alt="its my plan" width={48} height={48} className="mx-auto rounded-xl mb-4" />
            <h1 className="text-lg font-semibold text-slate-900 mb-2">Firebase Not Configured Yet</h1>
            <p className="text-sm text-slate-600">
              Sign-in code is built in, but the Firebase API keys are missing from your environment.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-700 space-y-3 mb-6">
            <p className="font-medium text-slate-900">To enable login:</p>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-600">
              <li>Create a project at <strong>console.firebase.google.com</strong></li>
              <li>Enable <strong>Email/Password</strong> under Authentication</li>
              <li>Create a <strong>Firestore</strong> database</li>
              <li>Copy your web app config from Project Settings</li>
              <li>Add the keys to <code className="text-xs bg-white px-1 py-0.5 rounded border">.env.local</code> (see <code className="text-xs bg-white px-1 py-0.5 rounded border">.env.example</code>)</li>
              <li>Restart the dev server, or add the same vars in <strong>Vercel → Environment Variables</strong> and redeploy</li>
            </ol>
          </div>

          <div className="flex gap-3 justify-center">
            <Link
              href="/"
              className="inline-block px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-medium text-white transition-colors"
            >
              Continue as Guest
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);
    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
      router.replace('/');
    } catch (err) {
      const msg = (err as { code?: string; message?: string }).message || 'Authentication failed';
      if (msg.includes('auth/invalid-credential') || msg.includes('auth/wrong-password')) {
        setError('Invalid email or password.');
      } else if (msg.includes('auth/email-already-in-use')) {
        setError('An account with this email already exists. Try signing in.');
      } else if (msg.includes('auth/weak-password')) {
        setError('Password must be at least 6 characters.');
      } else {
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Enter your email address first');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await resetPassword(email);
      setMessage('Password reset email sent — check your inbox');
    } catch (err) {
      setError((err as Error).message || 'Failed to send reset email');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-full flex items-center justify-center bg-slate-100 p-6">
      <div className="glass-panel max-w-md w-full rounded-2xl overflow-hidden shadow-lg">
        <div className="px-8 pt-8 pb-4 text-center border-b border-slate-200">
          <Image src="/its-my-plan.png" alt="its my plan" width={56} height={56} className="mx-auto rounded-xl mb-3" priority />
          <h1 className="text-xl font-semibold text-slate-900">its my plan</h1>
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
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
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
              className="text-xs text-blue-600 hover:text-blue-700 transition-colors"
            >
              Forgot password?
            </button>
          )}

          {error && <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}
          {message && <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">{message}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-sm font-medium text-white transition-colors"
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>

          <div className="text-center text-xs text-slate-500">
            {mode === 'signin' ? (
              <>
                No account?{' '}
                <button type="button" onClick={() => setMode('signup')} className="text-blue-600 hover:text-blue-700">
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button type="button" onClick={() => setMode('signin')} className="text-blue-600 hover:text-blue-700">
                  Sign in
                </button>
              </>
            )}
          </div>


        </form>
      </div>
    </div>
  );
}
