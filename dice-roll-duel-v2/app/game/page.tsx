'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import MatchArena from '../components/MatchArena';

type GamePhase = 'setup' | 'playing';

interface PlayerForm {
  name: string;
}

export default function GamePage() {
  const router = useRouter();
  const [phase, setPhase] = useState<GamePhase>('setup');
  const [p1Form, setP1Form] = useState<PlayerForm>({ name: '' });
  const [p2Form, setP2Form] = useState<PlayerForm>({ name: '' });
  const [player1, setPlayer1] = useState<{
    id: string;
    name: string;
    elo: number;
  } | null>(null);
  const [player2, setPlayer2] = useState<{
    id: string;
    name: string;
    elo: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function getOrCreatePlayer(name: string) {
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
    if (!p1Form.name.trim() || !p2Form.name.trim()) {
      setError('Both player names are required.');
      return;
    }

    if (p1Form.name.trim().toLowerCase() === p2Form.name.trim().toLowerCase()) {
      setError('Player names must be different.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const [p1, p2] = await Promise.all([
        getOrCreatePlayer(p1Form.name),
        getOrCreatePlayer(p2Form.name),
      ]);

      setPlayer1(p1);
      setPlayer2(p2);
      setPhase('playing');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleMatchComplete() {
    // Give a brief moment to show result before redirecting
    setTimeout(() => router.push('/'), 3000);
  }

  if (phase === 'setup') {
    return (
      <main className='game-page'>
        <h1 className='page-title'>New Match</h1>

        <div className='setup-form'>
          <div className='player-inputs'>
            <div className='player-input-group'>
              <label htmlFor='p1'>Player 1</label>
              <input
                id='p1'
                type='text'
                placeholder='Enter name...'
                value={p1Form.name}
                onChange={(e) => setP1Form({ name: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleStartGame()}
              />
            </div>

            <span className='vs-divider'>VS</span>

            <div className='player-input-group'>
              <label htmlFor='p2'>Player 2</label>
              <input
                id='p2'
                type='text'
                placeholder='Enter name...'
                value={p2Form.name}
                onChange={(e) => setP2Form({ name: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleStartGame()}
              />
            </div>
          </div>

          {error && <p className='error-msg'>{error}</p>}

          <button
            className='btn-primary'
            onClick={handleStartGame}
            disabled={loading}
          >
            {loading ? 'Starting...' : 'Start Match'}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className='game-page'>
      <MatchArena
        player1={player1!}
        player2={player2!}
        onMatchComplete={handleMatchComplete}
      />
    </main>
  );
}
