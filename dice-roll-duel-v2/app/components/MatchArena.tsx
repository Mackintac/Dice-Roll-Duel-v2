'use client';

import { useState } from 'react';
import ScorePips from './ScorePips';
import DiceRoller from './DiceRoller';

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

interface MatchArenaProps {
  player1: Player;
  player2: Player;
  onMatchComplete?: () => void;
}

type MatchPhase = 'idle' | 'rolling' | 'round_result' | 'match_over';

export default function MatchArena({
  player1,
  player2,
  onMatchComplete,
}: MatchArenaProps) {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [phase, setPhase] = useState<MatchPhase>('idle');
  const [currentRolls, setCurrentRolls] = useState<{
    roll1: number;
    roll2: number;
  } | null>(null);
  const [matchWinnerId, setMatchWinnerId] = useState<string | null>(null);
  const [eloChange, setEloChange] = useState<number | null>(null);

  const p1RoundWins = rounds.filter((r) => r.winnerId === player1.id).length;
  const p2RoundWins = rounds.filter((r) => r.winnerId === player2.id).length;

  function rollDie(): number {
    return Math.floor(Math.random() * 6) + 1;
  }

  function getRoundWinnerId(roll1: number, roll2: number): string | null {
    if (roll1 > roll2) return player1.id;
    if (roll2 > roll1) return player2.id;
    return null;
  }

  function getMatchWinner(completedRounds: Round[]): string | null {
    const p1Wins = completedRounds.filter(
      (r) => r.winnerId === player1.id,
    ).length;
    const p2Wins = completedRounds.filter(
      (r) => r.winnerId === player2.id,
    ).length;
    if (p1Wins >= 2) return player1.id;
    if (p2Wins >= 2) return player2.id;
    return null;
  }

  async function handleRoll() {
    if (phase === 'rolling' || phase === 'match_over') return;

    setPhase('rolling');
    await new Promise((res) => setTimeout(res, 600));

    const roll1 = rollDie();
    const roll2 = rollDie();
    const roundWinnerId = getRoundWinnerId(roll1, roll2);
    const newRound: Round = { roll1, roll2, winnerId: roundWinnerId };
    const updatedRounds = [...rounds, newRound];

    setCurrentRolls({ roll1, roll2 });
    setRounds(updatedRounds);
    setPhase('round_result');

    const matchWinner = getMatchWinner(updatedRounds);
    if (matchWinner) {
      await submitMatch(updatedRounds, matchWinner);
    }
  }

  async function submitMatch(completedRounds: Round[], winnerId: string) {
    try {
      const res = await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player1Id: player1.id,
          player2Id: player2.id,
          winnerId,
          rounds: completedRounds,
        }),
      });
      const data = await res.json();
      setMatchWinnerId(winnerId);
      setEloChange(data.delta);
      setPhase('match_over');
      onMatchComplete?.();
    } catch (err) {
      console.error('Failed to submit match:', err);
    }
  }

  function resetMatch() {
    setRounds([]);
    setPhase('idle');
    setCurrentRolls(null);
    setMatchWinnerId(null);
    setEloChange(null);
  }

  const matchWinner = matchWinnerId === player1.id ? player1 : player2;
  const matchLoser = matchWinnerId === player1.id ? player2 : player1;

  return (
    <div className='bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8'>
      {/* Players + scores */}
      <div className='flex items-center justify-between mb-6'>
        <div className='text-center flex-1'>
          <p className='text-white font-bold text-xl tracking-wide'>
            {player1.name}
          </p>
          <p className='text-gray-400 text-sm'>{player1.elo} ELO</p>
          <ScorePips wins={p1RoundWins} />
        </div>

        <div className='text-yellow-400 font-bold text-2xl tracking-widest px-4'>
          VS
        </div>

        <div className='text-center flex-1'>
          <p className='text-white font-bold text-xl tracking-wide'>
            {player2.name}
          </p>
          <p className='text-gray-400 text-sm'>{player2.elo} ELO</p>
          <ScorePips wins={p2RoundWins} />
        </div>
      </div>

      {/* Dice */}
      <DiceRoller
        roll1={currentRolls?.roll1 ?? null}
        roll2={currentRolls?.roll2 ?? null}
        rolling={phase === 'rolling'}
      />

      {/* Round result */}
      {phase === 'round_result' && currentRolls && !matchWinnerId && (
        <p className='text-center text-white/80 text-sm mb-4'>
          {getRoundWinnerId(currentRolls.roll1, currentRolls.roll2) === null
            ? 'Tie — no point awarded'
            : `${getRoundWinnerId(currentRolls.roll1, currentRolls.roll2) === player1.id ? player1.name : player2.name} wins the round!`}
        </p>
      )}

      {/* Match over banner */}
      {phase === 'match_over' && matchWinnerId && (
        <div className='text-center mb-6 p-4 bg-yellow-500/20 rounded-xl border border-yellow-500/30'>
          <p className='text-yellow-400 font-bold text-2xl mb-1'>
            {matchWinner.name} wins!
          </p>
          <p className='text-gray-300 text-sm'>
            {matchWinner.name}
            <span className='text-green-400 font-semibold'> +{eloChange}</span>
            {'  ·  '}
            {matchLoser.name}
            <span className='text-red-400 font-semibold'> -{eloChange}</span>
          </p>
          <p className='text-white/50 text-xs mt-1'>
            Redirecting to home in 3 seconds...
          </p>
        </div>
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
                : `· ${r.winnerId === player1.id ? player1.name : player2.name}`}
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className='flex justify-center'>
        {phase !== 'match_over' && (
          <button
            onClick={handleRoll}
            disabled={phase === 'rolling'}
            className='bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold text-lg px-12 py-4 rounded-full shadow-lg hover:scale-105 transition-all duration-200'
          >
            {phase === 'idle'
              ? 'ROLL'
              : phase === 'rolling'
                ? 'Rolling...'
                : 'NEXT ROLL'}
          </button>
        )}
        {phase === 'match_over' && (
          <button
            onClick={resetMatch}
            className='bg-white/20 hover:bg-white/30 text-white font-semibold px-8 py-3 rounded-full border border-white/30 transition-all duration-200'
          >
            Play Again
          </button>
        )}
      </div>
    </div>
  );
}
