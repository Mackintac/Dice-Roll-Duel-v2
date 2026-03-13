'use client';

import { signOut } from 'next-auth/react';

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/' })}
      className='bg-white/20 hover:bg-white/30 text-white font-semibold px-8 py-3 rounded-full border border-white/30 transition-all duration-200'
    >
      Sign Out
    </button>
  );
}
