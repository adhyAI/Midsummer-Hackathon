'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth, getInsforgeClient } from '../providers';
import { Terminal, Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// ---------------------------------------------------------------------------
// Google SVG icon
// ---------------------------------------------------------------------------
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Inner component that reads searchParams
// ---------------------------------------------------------------------------
function AuthForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, loading: authLoading, refresh } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>(
    params.get('mode') === 'signup' ? 'signup' : 'signin'
  );
  const [step, setStep] = useState<'form' | 'verify'>('form');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  useEffect(() => {
    if (!authLoading && user) router.replace('/dashboard');
  }, [user, authLoading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const insforge = getInsforgeClient();

    try {
      if (mode === 'signin') {
        const { data, error } = await insforge.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data) {
          await refresh();
          router.replace('/dashboard');
        }
      } else {
        const { data, error } = await insforge.auth.signUp({
          email,
          password,
          name,
          redirectTo: `${window.location.origin}/auth?mode=signin`,
        });
        if (error) throw error;
        if (data?.requireEmailVerification) {
          setStep('verify');
          setInfo('We sent a 6-digit code to ' + email);
        } else if (data?.accessToken) {
          await refresh();
          router.replace('/dashboard');
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const insforge = getInsforgeClient();
    try {
      const { data, error } = await insforge.auth.verifyEmail({ email, otp });
      if (error) throw error;
      if (data) {
        await refresh();
        router.replace('/dashboard');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid code');
    } finally {
      setLoading(false);
    }
  }

  async function handleOAuth(provider: 'google' | 'github') {
    setError('');
    const insforge = getInsforgeClient();
    await insforge.auth.signInWithOAuth(provider, {
      redirectTo: `${window.location.origin}/dashboard`,
    });
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 size={28} className="text-violet-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center justify-center px-4">
      {/* Back to landing */}
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition"
      >
        <ArrowLeft size={14} /> Home
      </Link>

      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-8">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
          <Terminal size={17} className="text-white" />
        </div>
        <span className="font-bold text-lg tracking-tight">ArchitectAI</span>
      </div>

      <div className="w-full max-w-sm">
        {/* Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          {step === 'verify' ? (
            /* ── OTP verification step ── */
            <>
              <h1 className="text-xl font-bold mb-1">Check your email</h1>
              <p className="text-sm text-gray-500 mb-6">{info}</p>

              <form onSubmit={handleVerify} className="space-y-4">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-center text-2xl tracking-[0.5em] font-mono focus:outline-none focus:border-violet-500 transition"
                  required
                />
                {error && <p className="text-sm text-red-400">{error}</p>}
                <button
                  type="submit"
                  disabled={loading || otp.length < 6}
                  className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : 'Verify email'}
                </button>
              </form>

              <button
                onClick={() => setStep('form')}
                className="mt-4 w-full text-sm text-gray-500 hover:text-gray-300 transition text-center"
              >
                ← Back
              </button>
            </>
          ) : (
            /* ── Sign in / Sign up form ── */
            <>
              <h1 className="text-xl font-bold mb-1">
                {mode === 'signin' ? 'Welcome back' : 'Create your account'}
              </h1>
              <p className="text-sm text-gray-500 mb-6">
                {mode === 'signin'
                  ? 'Sign in to continue to ArchitectAI'
                  : 'Start debugging your database with AI'}
              </p>

              {/* OAuth buttons */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <button
                  onClick={() => handleOAuth('google')}
                  className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-gray-600 rounded-xl py-2.5 text-sm font-medium transition"
                >
                  <GoogleIcon /> Google
                </button>
                <button
                  onClick={() => handleOAuth('github')}
                  className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-gray-600 rounded-xl py-2.5 text-sm font-medium transition"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
                  GitHub
                </button>
              </div>

              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-gray-800" />
                <span className="text-xs text-gray-600">or continue with email</span>
                <div className="flex-1 h-px bg-gray-800" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                {mode === 'signup' && (
                  <input
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500 transition placeholder-gray-600"
                    required
                  />
                )}
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500 transition placeholder-gray-600"
                  required
                />
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:border-violet-500 transition placeholder-gray-600"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {error && <p className="text-sm text-red-400">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2 mt-1"
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : mode === 'signin' ? (
                    'Sign in'
                  ) : (
                    'Create account'
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Toggle mode */}
        {step === 'form' && (
          <p className="text-center text-sm text-gray-500 mt-5">
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin');
                setError('');
              }}
              className="text-violet-400 hover:text-violet-300 transition font-medium"
            >
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page — wrapped in Suspense for useSearchParams
// ---------------------------------------------------------------------------
export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 size={28} className="text-violet-400 animate-spin" />
      </div>
    }>
      <AuthForm />
    </Suspense>
  );
}
