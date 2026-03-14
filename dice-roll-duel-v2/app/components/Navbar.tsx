import Link from 'next/link';
import NavbarClient from './NavbarClient';

export default function Navbar() {
  return (
    <nav className='fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10'>
      <div className='max-w-6xl mx-auto px-4 h-16 flex items-center justify-between'>
        <Link
          href='/'
          className='font-bold text-white text-xl tracking-widest hover:text-yellow-400 transition-colors'
        >
          DICE DUEL
        </Link>
        <NavbarClient />
      </div>
    </nav>
  );
}
