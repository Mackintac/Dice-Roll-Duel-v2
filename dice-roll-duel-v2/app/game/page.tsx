'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import MatchArena from '../components/MatchArena';

interface Player {
  id: string;
  name: string;
  elo: number;
}

type GamePhase = 'setup' | 'playing';

export default function GamePage() {
  const router = useRouter();
  const [phase, setPhase] = useState<GamePhase>('setup');
  const [p1Name, setP1Name] = useState('');
  const [p2Name, setP2Name] = useState('');
  const [player1, setPlayer1] = useState<Player | null>(null);
  const [player2, setPlayer2] = useState<Player | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function getOrCreatePlayer(name: string): Promise<Player> {
    const res = await fetch('/api/players', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error ?? 'Failed to create player');
    }
    return res.json();
  }

  async function handleStartGame() {
    if (!p1Name.trim() || !p2Name.trim()) {
      setError('Both player names are required.');
      return;
    }
    if (p1Name.trim().toLowerCase() === p2Name.trim().toLowerCase()) {
      setError('Player names must be different.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const [p1, p2] = await Promise.all([
        getOrCreatePlayer(p1Name),
        getOrCreatePlayer(p2Name),
      ]);
      setPlayer1(p1);
      setPlayer2(p2);
      setPhase('playing');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  function handleMatchComplete() {
    setTimeout(() => router.push('/'), 3000);
  }

  if (phase === 'playing' && player1 && player2) {
    return (
      <main className='min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4'>
        <div className='max-w-2xl w-full mx-auto'>
          <MatchArena
            player1={player1}
            player2={player2}
            onMatchComplete={handleMatchComplete}
          />
        </div>
      </main>
    );
  }

  return (
    <main className='min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4'>
      <div className='max-w-lg w-full mx-auto'>
        {/* Header */}
        <div className='text-center mb-10'>
          <h1 className='text-5xl font-bold text-white tracking-wider mb-2'>
            NEW MATCH
          </h1>
          <p className='text-gray-300'>Enter both player names to begin</p>
        </div>

        {/* Form */}
        <div className='bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8 space-y-6'>
          {/* Player 1 */}
          <div>
            <label className='block text-sm font-semibold text-gray-300 mb-2 tracking-wider uppercase'>
              Player 1
            </label>
            <input
              type='text'
              placeholder='Enter name...'
              value={p1Name}
              onChange={(e) => setP1Name(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleStartGame()}
              className='w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-colors'
            />
          </div>

          {/* VS divider */}
          <div className='flex items-center gap-4'>
            <div className='flex-1 h-px bg-white/20' />
            <span className='text-yellow-400 font-bold tracking-widest text-sm'>
              VS
            </span>
            <div className='flex-1 h-px bg-white/20' />
          </div>

          {/* Player 2 */}
          <div>
            <label className='block text-sm font-semibold text-gray-300 mb-2 tracking-wider uppercase'>
              Player 2
            </label>
            <input
              type='text'
              placeholder='Enter name...'
              value={p2Name}
              onChange={(e) => setP2Name(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleStartGame()}
              className='w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-colors'
            />
          </div>

          {/* Error */}
          {error && <p className='text-red-400 text-sm text-center'>{error}</p>}

          {/* Submit */}
          <button
            onClick={handleStartGame}
            disabled={loading}
            className='w-full bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold text-lg py-4 rounded-full shadow-lg hover:scale-105 transition-all duration-200'
          >
            {loading ? 'Starting...' : 'START MATCH'}
          </button>
        </div>

        {/* Back link */}
        <div className='text-center mt-6'>
          <a
            href='/'
            className='text-gray-400 hover:text-white text-sm transition-colors'
          >
            &larr; Back to home
          </a>
        </div>
      </div>
    </main>
  );
}
