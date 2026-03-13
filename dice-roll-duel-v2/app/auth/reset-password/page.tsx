'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? 'Something went wrong');
      return;
    }

    router.push('/auth/signin?reset=true');
  }

  if (!token) {
    return (
      <div className='text-center'>
        <div className='text-5xl mb-4'>❌</div>
        <h1 className='text-2xl font-bold text-white mb-2'>Invalid Link</h1>
        <p className='text-gray-400 text-sm mb-6'>
          This reset link is invalid or has expired.
        </p>
        <Link
          href='/auth/forgot-password'
          className='text-yellow-400 hover:text-yellow-300 text-sm'
        >
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-white mb-1'>Reset Password</h1>
        <p className='text-gray-400 text-sm'>Enter your new password below.</p>
      </div>

      {error && (
        <div className='bg-red-500/20 border border-red-500/50 rounded-lg px-4 py-3 mb-4'>
          <p className='text-red-300 text-sm'>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <label className='block text-sm font-medium text-gray-300 mb-1'>
            New Password
          </label>
          <input
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className='w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition-colors'
            placeholder='Min. 8 characters'
          />
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-300 mb-1'>
            Confirm Password
          </label>
          <input
            type='password'
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            className='w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 transition-colors'
            placeholder='Repeat your password'
          />
        </div>

        <button
          type='submit'
          disabled={loading}
          className='w-full bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-3 rounded-full transition-all duration-200'
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className='min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4'>
      <div className='max-w-md w-full mx-auto'>
        <div className='bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8'>
          <Suspense>
            <ResetPasswordContent />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
