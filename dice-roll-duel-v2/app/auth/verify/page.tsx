'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';

function VerifyContent() {
  const searchParams = useSearchParams();
  const success = searchParams.get('success');
  const error = searchParams.get('error');

  return (
    <main className='min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4'>
      <div className='max-w-md w-full mx-auto text-center'>
        <div className='bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-10'>
          {success ? (
            <>
              <div className='text-6xl mb-4'>✅</div>
              <h1 className='text-3xl font-bold text-white mb-2'>
                Email Verified!
              </h1>
              <p className='text-gray-300 mb-8'>
                Your account is now active. You can sign in.
              </p>
              <Link
                href='/auth/signin'
                className='inline-block bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-8 py-3 rounded-full transition-all duration-200'
              >
                Sign In
              </Link>
            </>
          ) : error ? (
            <>
              <div className='text-6xl mb-4'>❌</div>
              <h1 className='text-3xl font-bold text-white mb-2'>
                Invalid Link
              </h1>
              <p className='text-gray-300 mb-8'>
                This verification link is invalid or has already been used.
              </p>
              <Link
                href='/auth/signin'
                className='inline-block bg-white/20 hover:bg-white/30 text-white font-semibold px-8 py-3 rounded-full border border-white/30 transition-all duration-200'
              >
                Back to Sign In
              </Link>
            </>
          ) : (
            <>
              <div className='text-6xl mb-4'>📧</div>
              <h1 className='text-3xl font-bold text-white mb-2'>
                Check your email
              </h1>
              <p className='text-gray-300 mb-2'>
                We sent a verification link to your email address.
              </p>
              <p className='text-gray-400 text-sm mb-8'>
                Click the link in the email to activate your account.
              </p>
              <Link
                href='/auth/signin'
                className='inline-block text-gray-400 hover:text-white text-sm transition-colors'
              >
                &larr; Back to Sign In
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyContent />
    </Suspense>
  );
}
