'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export default function NavbarClient() {
  const { data: session, status } = useSession();

  if (status === 'loading') return null;

  return (
    <div className='flex items-center gap-2'>
      <Link
        href='/'
        className='text-gray-300 hover:text-white text-sm px-3 py-2 rounded-lg hover:bg-white/10 transition-all'
      >
        Home
      </Link>
      <Link
        href='/leaderboard'
        className='text-gray-300 hover:text-white text-sm px-3 py-2 rounded-lg hover:bg-white/10 transition-all'
      >
        Leaderboard
      </Link>

      {session ? (
        <>
          <Link
            href='/profile'
            className='text-gray-300 hover:text-white text-sm px-3 py-2 rounded-lg hover:bg-white/10 transition-all'
          >
            Profile
          </Link>
          <div className='w-px h-4 bg-white/20 mx-1' />
          <span className='text-gray-400 text-sm hidden sm:block'>
            {session.user.name ?? session.user.email}
          </span>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className='text-gray-300 hover:text-white text-sm px-3 py-2 rounded-lg hover:bg-white/10 transition-all'
          >
            Sign Out
          </button>
        </>
      ) : (
        <>
          <Link
            href='/auth/signin'
            className='text-gray-300 hover:text-white text-sm px-3 py-2 rounded-lg hover:bg-white/10 transition-all'
          >
            Sign In
          </Link>
          <Link
            href='/auth/register'
            className='bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-sm px-4 py-2 rounded-full transition-all'
          >
            Register
          </Link>
        </>
      )}
    </div>
  );
}
