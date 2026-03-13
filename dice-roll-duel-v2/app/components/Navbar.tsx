import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import Link from 'next/link';
import SignOutButton from './SignOutButton';

export default async function Navbar() {
  const session = await getServerSession(authOptions);

  return (
    <nav className='fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10'>
      <div className='max-w-6xl mx-auto px-4 h-16 flex items-center justify-between'>
        {/* Logo */}
        <Link
          href='/'
          className='font-bold text-white text-xl tracking-widest hover:text-yellow-400 transition-colors'
        >
          DICE DUEL
        </Link>

        {/* Links */}
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
              <SignOutButton />
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
      </div>
    </nav>
  );
}
