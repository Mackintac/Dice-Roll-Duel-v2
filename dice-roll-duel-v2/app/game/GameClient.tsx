'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSocket } from '../lib/socket';
import ScorePips from '../components/ScorePips';
import DiceRoller from '../components/DiceRoller';

interface Player {
  id: string;
  name: string;
  elo: number;
}

interface Round {
  roll1: number;
  roll2: number;
  winnerId: string | null;
}

type GamePhase = 'idle' | 'queuing' | 'rolling' | 'round_result' | 'match_over';

interface GameClientProps {
  playerId: string;
  playerName: string;
}

export default function GameClient({ playerId, playerName }: GameClientProps) {
  const [opponentReady, setOpponentReady] = useState(false);
  const [iReady, setIReady] = useState(false);
  const router = useRouter();
  const [phase, setPhase] = useState<GamePhase>('idle');
  const [roomId, setRoomId] = useState<string | null>(null);
  const [me, setMe] = useState<Player | null>(null);
  const [opponent, setOpponent] = useState<Player | null>(null);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [currentRolls, setCurrentRolls] = useState<{
    roll1: number;
    roll2: number;
  } | null>(null);
  const playerIdRef = useRef(playerId);
  const [myRoundWins, setMyRoundWins] = useState(0);
  const [opponentRoundWins, setOpponentRoundWins] = useState(0);
  const [matchResult, setMatchResult] = useState<{
    winnerId: string;
    winnerName: string;
    delta: number;
  } | null>(null);

  useEffect(() => {
    const socket = getSocket();
    socket.connect();

    socket.on('queue_joined', () => {
      setPhase('queuing');
    });

    socket.on(
      'match_found',
      (data: { roomId: string; player1: Player; player2: Player }) => {
        setRoomId(data.roomId);
        const iAmPlayer1 = data.player1.id === playerId;
        setMe(iAmPlayer1 ? data.player1 : data.player2);
        setOpponent(iAmPlayer1 ? data.player2 : data.player1);
        setPhase('round_result'); // ← was 'rolling', now 'round_result' so button is enabled
      },
    );

    socket.on(
      'round_result',
      (data: {
        roll1: number;
        roll2: number;
        winnerId: string | null;
        p1RoundWins: number;
        p2RoundWins: number;
      }) => {
        setIReady(false);
        setOpponentReady(false);
        setCurrentRolls({ roll1: data.roll1, roll2: data.roll2 });
        setRounds((prev) => [
          ...prev,
          {
            roll1: data.roll1,
            roll2: data.roll2,
            winnerId: data.winnerId,
          },
        ]);

        setMe((currentMe) => {
          const iAmPlayer1 = currentMe?.id === playerIdRef.current;
          setMyRoundWins(iAmPlayer1 ? data.p1RoundWins : data.p2RoundWins);
          setOpponentRoundWins(
            iAmPlayer1 ? data.p2RoundWins : data.p1RoundWins,
          );
          return currentMe;
        });

        setPhase('round_result');
      },
    );

    socket.on('roll_ready', (data: { count: number }) => {
      if (data.count === 1) {
        // One player ready, waiting for other
        setOpponentReady(false); // will be updated below
      }
      if (data.count === 2) {
        setOpponentReady(true);
      }
    });

    socket.on(
      'match_over',
      (data: {
        winnerId: string;
        winnerName: string;
        delta: number;
        rounds: Round[];
      }) => {
        setMatchResult(data);
        setPhase('match_over');

        setTimeout(() => router.push('/leaderboard'), 4000);
      },
    );

    socket.on('opponent_disconnected', () => {
      alert('Your opponent disconnected.');
      resetGame();
    });

    socket.on('error', (data: { message: string }) => {
      console.error('Socket error:', data.message);
    });

    return () => {
      socket.off('queue_joined');
      socket.off('match_found');
      socket.off('round_result');
      socket.off('roll_ready');
      socket.off('match_over');
      socket.off('opponent_disconnected');
      socket.off('error');
      socket.disconnect();
    };
  }, [playerId]);

  function handleFindMatch() {
    const socket = getSocket();
    socket.emit('join_queue', { playerId });
  }

  function handleCancelQueue() {
    const socket = getSocket();
    socket.emit('leave_queue');
    setPhase('idle');
  }

  function handleRoll() {
    if (!roomId || iReady) return;
    const socket = getSocket();
    setIReady(true);
    setPhase('rolling');
    socket.emit('roll', { roomId, playerId });
  }

  function resetGame() {
    setPhase('idle');
    setRoomId(null);
    setMe(null);
    setOpponent(null);
    setRounds([]);
    setCurrentRolls(null);
    setMyRoundWins(0);
    setOpponentRoundWins(0);
    setMatchResult(null);
  }

  // IDLE — find a match
  if (phase === 'idle') {
    return (
      <main className='min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4'>
        <div className='max-w-md w-full mx-auto text-center'>
          <div className='mb-10'>
            <h1 className='text-5xl font-bold text-white tracking-wider mb-2'>
              FIND MATCH
            </h1>
            <p className='text-gray-400'>
              Signed in as{' '}
              <span className='text-yellow-400 font-semibold'>
                {playerName}
              </span>
            </p>
          </div>

          <div className='bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-10'>
            <div className='text-6xl mb-6'>🎲</div>
            <p className='text-gray-300 mb-8'>
              Click below to enter the matchmaking queue. You'll be paired with
              the next available player.
            </p>
            <button
              onClick={handleFindMatch}
              className='w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-lg py-4 rounded-full shadow-lg hover:scale-105 transition-all duration-200'
            >
              FIND MATCH
            </button>
          </div>

          <div className='mt-6'>
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

  // QUEUING — waiting for opponent
  if (phase === 'queuing') {
    return (
      <main className='min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4'>
        <div className='max-w-md w-full mx-auto text-center'>
          <div className='bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-10'>
            <div className='text-6xl mb-6 animate-bounce'>🎲</div>
            <h2 className='text-2xl font-bold text-white mb-2'>
              Searching for opponent...
            </h2>
            <p className='text-gray-400 text-sm mb-8'>
              You'll be matched automatically when another player is ready.
            </p>

            <div className='flex justify-center gap-2 mb-8'>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className='w-2 h-2 bg-yellow-400 rounded-full animate-bounce'
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>

            <button
              onClick={handleCancelQueue}
              className='bg-white/20 hover:bg-white/30 text-white font-semibold px-8 py-3 rounded-full border border-white/30 transition-all duration-200'
            >
              Cancel
            </button>
          </div>
        </div>
      </main>
    );
  }

  // MATCH OVER
  if (phase === 'match_over' && matchResult) {
    const iWon = matchResult.winnerId === playerId;
    return (
      <main className='min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4'>
        <div className='max-w-md w-full mx-auto text-center'>
          <div className='bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-10'>
            <div className='text-6xl mb-4'>{iWon ? '🏆' : '💀'}</div>
            <h2
              className={`text-4xl font-bold mb-2 ${iWon ? 'text-yellow-400' : 'text-red-400'}`}
            >
              {iWon ? 'YOU WIN!' : 'YOU LOSE!'}
            </h2>
            <p className='text-gray-300 mb-2'>
              {matchResult.winnerName} wins the match
            </p>
            <p
              className={`font-bold text-lg mb-6 ${iWon ? 'text-green-400' : 'text-red-400'}`}
            >
              {iWon ? `+${matchResult.delta}` : `-${matchResult.delta}`} ELO
            </p>

            {/* Round history */}
            <div className='flex gap-2 flex-wrap justify-center mb-6'>
              {rounds.map((r, i) => (
                <div
                  key={i}
                  className='bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-xs text-gray-300'
                >
                  R{i + 1}: {r.roll1} vs {r.roll2}{' '}
                  {r.winnerId === null
                    ? '· Tie'
                    : r.winnerId === playerId
                      ? '· You'
                      : '· Them'}
                </div>
              ))}
            </div>

            <p className='text-gray-500 text-xs'>
              Redirecting to leaderboard...
            </p>
          </div>
        </div>
      </main>
    );
  }

  // IN MATCH
  return (
    <main className='min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4'>
      <div className='max-w-2xl w-full mx-auto'>
        <div className='bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8'>
          {/* Players */}
          <div className='flex items-center justify-between mb-6'>
            <div className='text-center flex-1'>
              <p className='text-white font-bold text-xl'>
                {me?.name ?? '...'}
              </p>
              <p className='text-gray-400 text-sm'>{me?.elo} ELO</p>
              <ScorePips wins={myRoundWins} />
            </div>

            <div className='text-yellow-400 font-bold text-2xl tracking-widest px-4'>
              VS
            </div>

            <div className='text-center flex-1'>
              <p className='text-white font-bold text-xl'>
                {opponent?.name ?? '...'}
              </p>
              <p className='text-gray-400 text-sm'>{opponent?.elo} ELO</p>
              <ScorePips wins={opponentRoundWins} />
            </div>
          </div>

          {/* Dice */}
          <DiceRoller
            roll1={currentRolls?.roll1 ?? null}
            roll2={currentRolls?.roll2 ?? null}
            rolling={phase === 'rolling'}
          />

          {/* Round result message */}
          {phase === 'round_result' && currentRolls && (
            <p className='text-center text-white/80 text-sm mb-4'>
              {currentRolls.roll1 === currentRolls.roll2
                ? 'Tie — no point awarded'
                : currentRolls.roll1 > currentRolls.roll2
                  ? `${me?.name} wins the round!`
                  : `${opponent?.name} wins the round!`}
            </p>
          )}

          {/* Round history */}
          {rounds.length > 0 && (
            <div className='flex gap-2 flex-wrap justify-center mb-6'>
              {rounds.map((r, i) => (
                <div
                  key={i}
                  className='bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-xs text-gray-300'
                >
                  R{i + 1}: {r.roll1} vs {r.roll2}{' '}
                  {r.winnerId === null
                    ? '· Tie'
                    : r.winnerId === playerId
                      ? '· You'
                      : '· Them'}
                </div>
              ))}
            </div>
          )}

          {/* Roll button */}
          <div className='flex flex-col items-center gap-3'>
            <div className='flex gap-6 text-sm'>
              <span className={iReady ? 'text-green-400' : 'text-gray-500'}>
                {iReady ? '✓ You are ready' : '· Waiting for you'}
              </span>
              <span
                className={opponentReady ? 'text-green-400' : 'text-gray-500'}
              >
                {opponentReady
                  ? `✓ ${opponent?.name} is ready`
                  : `· Waiting for ${opponent?.name}`}
              </span>
            </div>
            <button
              onClick={handleRoll}
              disabled={iReady}
              className='bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold text-lg px-12 py-4 rounded-full shadow-lg hover:scale-105 transition-all duration-200'
            >
              {iReady
                ? 'Waiting for opponent...'
                : rounds.length === 0
                  ? 'ROLL'
                  : 'NEXT ROLL'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
