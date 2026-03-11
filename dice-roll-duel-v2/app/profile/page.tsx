import Link from 'next/link';
import { Metadata } from 'next';
import { Player } from '../lib/types';

export const metadata: Metadata = {
  title: 'My Profile - Dice Roll Duel',
  description:
    'View your player statistics, ELO rating, rank and match history.',
};

// temporary mock data for demonstration
const mockPlayer: Player = {
  id: '1',
  name: 'PlayerOne',
  elo: 1200,
  rank: 42,
  wins: 56,
  losses: 27,
  createdAt: new Date().toISOString(),
};

export default function ProfilePage() {
  const player = mockPlayer;

  return (
    <div className='min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 flex items-center justify-center p-4'>
      <div className='max-w-xl w-full bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20 text-center'>
        <h1 className='text-5xl font-bold text-yellow-400 mb-4'>My Profile</h1>
        <div className='flex flex-col items-center mb-6'>
          <div className='w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center text-4xl text-gray-600 mb-4'>
            {player.name.charAt(0)}
          </div>
          <h2 className='text-2xl font-semibold text-white'>{player.name}</h2>
        </div>

        <div className='grid grid-cols-2 gap-4 text-left text-white'>
          <div>
            <p className='text-sm uppercase text-gray-300'>ELO</p>
            <p className='text-xl font-bold'>{player.elo}</p>
          </div>
          <div>
            <p className='text-sm uppercase text-gray-300'>Rank</p>
            <p className='text-xl font-bold'>#{player.rank}</p>
          </div>
          <div>
            <p className='text-sm uppercase text-gray-300'>Wins</p>
            <p className='text-xl font-bold'>{player.wins}</p>
          </div>
          <div>
            <p className='text-sm uppercase text-gray-300'>Losses</p>
            <p className='text-xl font-bold'>{player.losses}</p>
          </div>
        </div>

        <div className='mt-8'>
          <Link
            href='/'
            className='inline-block bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-6 py-3 rounded-full shadow transition-transform duration-200 hover:scale-105'
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
