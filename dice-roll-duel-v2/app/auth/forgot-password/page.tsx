'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? 'Something went wrong');
      return;
    }

    setSubmitted(true);
  }

  return (
    <main className='min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4'>
      <div className='max-w-md w-full mx-auto'>
        <div className='bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8'>
          {submitted ? (
            <div className='text-center'>
              <div className='text-5xl mb-4'>📧</div>
              <h1 className='text-2xl font-bold text-white mb-2'>
                Check your email
              </h1>
              <p className='text-gray-400 text-sm mb-6'>
                If an account exists for {email}, you'll receive a password
                reset link shortly.
              </p>
              <Link
                href='/auth/signin'
                className='text-yellow-400 hover:text-yellow-300 text-sm transition-colors'
              >
                &larr; Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <div className='mb-6'>
                <h1 className='text-2xl font-bold text-white mb-1'>
                  Forgot Password
                </h1>
                <p className='text-gray-400 text-sm'>
                  Enter your email and we'll send you a reset link.
                </p>
              </div>

              {error && (
                <div className='bg-red-500/20 border border-red-500/50 rounded-lg px-4 py-3 mb-4'>
                  <p className='text-red-300 text-sm'>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-300 mb-1'>
                    Email
                  </label>
                  <input
                    type='email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className='w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition-colors'
                    placeholder='you@example.com'
                  />
                </div>

                <button
                  type='submit'
                  disabled={loading}
                  className='w-full bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-3 rounded-full transition-all duration-200'
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>

              <div className='mt-6 text-center'>
                <Link
                  href='/auth/signin'
                  className='text-gray-400 hover:text-white text-sm transition-colors'
                >
                  &larr; Back to Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
