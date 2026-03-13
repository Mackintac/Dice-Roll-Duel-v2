'use client';

import { signOut } from 'next-auth/react';

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/' })}
      className='text-gray-300 hover:text-white text-sm px-3 py-2 rounded-lg hover:bg-white/10 transition-all'
    >
      Sign Out
    </button>
  );
}
