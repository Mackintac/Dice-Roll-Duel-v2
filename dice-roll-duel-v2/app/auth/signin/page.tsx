'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get('registered');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    if (!email.trim() || !password.trim()) {
      setError('Email and password are required.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error === 'EMAIL_NOT_VERIFIED') {
        setError('Please verify your email before signing in.');
        return;
      }

      if (result?.error) {
        setError('Invalid email or password.');
        return;
      }

      router.push('/');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className='min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4'>
      <div className='max-w-md w-full mx-auto'>
        {/* Header */}
        <div className='text-center mb-8'>
          <h1 className='text-4xl font-bold text-white tracking-wider mb-2'>
            SIGN IN
          </h1>
          <p className='text-gray-400 text-sm'>Welcome back. Ready to duel?</p>
        </div>

        {/* Success message after registration */}
        {registered && (
          <div className='bg-green-500/20 border border-green-500/30 rounded-xl px-4 py-3 text-green-400 text-sm text-center mb-6'>
            Account created! Sign in to continue.
          </div>
        )}

        {/* Form */}
        <div className='bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8 space-y-5'>
          <div>
            <label className='block text-sm font-semibold text-gray-300 mb-2 tracking-wider uppercase'>
              Email
            </label>
            <input
              type='email'
              placeholder='you@example.com'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition-colors'
            />
          </div>

          <div>
            <label className='block text-sm font-semibold text-gray-300 mb-2 tracking-wider uppercase'>
              Password
            </label>
            <input
              type='password'
              placeholder='Your password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSignIn()}
              className='w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition-colors'
            />
          </div>

          {error && <p className='text-red-400 text-sm text-center'>{error}</p>}

          <button
            onClick={handleSignIn}
            disabled={loading}
            className='w-full bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold text-lg py-4 rounded-full shadow-lg hover:scale-105 transition-all duration-200'
          >
            {loading ? 'Signing in...' : 'SIGN IN'}
          </button>

          <div className='relative flex items-center gap-4'>
            <div className='flex-1 h-px bg-white/20' />
            <span className='text-gray-500 text-xs tracking-widest'>OR</span>
            <div className='flex-1 h-px bg-white/20' />
          </div>

          <button
            onClick={() => signIn('google', { callbackUrl: '/' })}
            className='flex items-center justify-center gap-3 w-full bg-white hover:bg-gray-100 text-gray-800 font-semibold py-3 rounded-full transition-all duration-200'
          >
            <svg className='w-5 h-5' viewBox='0 0 24 24'>
              <path
                fill='#4285F4'
                d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
              />
              <path
                fill='#34A853'
                d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
              />
              <path
                fill='#FBBC05'
                d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
              />
              <path
                fill='#EA4335'
                d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
              />
            </svg>
            Continue with Google
          </button>
        </div>

        <p className='text-center text-gray-400 text-sm mt-6'>
          Don&apos;t have an account?{' '}
          <Link
            href='/auth/register'
            className='text-yellow-400 hover:text-yellow-300 font-semibold transition-colors'
          >
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
