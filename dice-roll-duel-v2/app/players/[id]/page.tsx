import { prisma } from '@/app/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import EloChart from '@/app/components/EloChart';

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const player = await prisma.player.findUnique({
    where: { id },
  });

  if (!player) notFound();

  const matchesAsP1 = await prisma.match.findMany({
    where: { player1Id: player.id },
    include: {
      player2: true,
      rounds: { orderBy: { index: 'asc' } },
    },
    orderBy: { playedAt: 'desc' },
  });

  const matchesAsP2 = await prisma.match.findMany({
    where: { player2Id: player.id },
    include: {
      player1: true,
      rounds: { orderBy: { index: 'asc' } },
    },
    orderBy: { playedAt: 'desc' },
  });

  const allMatches = [
    ...matchesAsP1.map((m) => ({
      id: m.id,
      opponent: m.player2,
      won: m.winnerId === player.id,
      eloChange: m.winnerId === player.id ? m.eloChange : -m.eloChange,
      rounds: m.rounds,
      playedAt: m.playedAt,
    })),
    ...matchesAsP2.map((m) => ({
      id: m.id,
      opponent: m.player1,
      won: m.winnerId === player.id,
      eloChange: m.winnerId === player.id ? m.eloChange : -m.eloChange,
      rounds: m.rounds,
      playedAt: m.playedAt,
    })),
  ].sort(
    (a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime(),
  );

  const eloHistory = [...allMatches].reverse().reduce(
    (acc, match, index) => {
      const prev = acc[acc.length - 1];
      acc.push({
        game: index + 1,
        elo: prev.elo + match.eloChange,
      });
      return acc;
    },
    [{ game: 0, elo: 1000 }],
  );

  const total = player.wins + player.losses;
  const winRate = total > 0 ? Math.round((player.wins / total) * 100) : 0;

  const rank = await prisma.player.count({
    where: { elo: { gt: player.elo } },
  });

  return (
    <main className='min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-4'>
      <div className='max-w-3xl mx-auto py-8'>
        {/* Header */}
        <div className='bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8 mb-6'>
          <div className='flex items-center justify-between flex-wrap gap-4'>
            <div>
              <h1 className='text-3xl font-bold text-white tracking-wide'>
                {player.name}
              </h1>
              <p className='text-gray-400 text-sm mt-1'>Rank #{rank + 1}</p>
            </div>
            <div className='text-right'>
              <p className='text-yellow-400 font-bold text-4xl font-mono'>
                {player.elo}
              </p>
              <p className='text-gray-400 text-sm'>ELO</p>
            </div>
          </div>

          <div className='grid grid-cols-3 gap-4 mt-6'>
            <div className='bg-white/10 rounded-xl p-4 text-center'>
              <p className='text-green-400 font-bold text-2xl'>{player.wins}</p>
              <p className='text-gray-400 text-xs uppercase tracking-wider mt-1'>
                Wins
              </p>
            </div>
            <div className='bg-white/10 rounded-xl p-4 text-center'>
              <p className='text-red-400 font-bold text-2xl'>{player.losses}</p>
              <p className='text-gray-400 text-xs uppercase tracking-wider mt-1'>
                Losses
              </p>
            </div>
            <div className='bg-white/10 rounded-xl p-4 text-center'>
              <p className='text-yellow-400 font-bold text-2xl'>{winRate}%</p>
              <p className='text-gray-400 text-xs uppercase tracking-wider mt-1'>
                Win Rate
              </p>
            </div>
          </div>
        </div>

        {/* ELO Chart */}
        {eloHistory.length > 1 && (
          <div className='bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 mb-6'>
            <h2 className='text-white font-bold text-lg mb-4'>ELO History</h2>
            <EloChart data={eloHistory} />
          </div>
        )}

        {/* Match History */}
        <div className='bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden'>
          <div className='px-6 py-4 border-b border-white/20'>
            <h2 className='text-white font-bold text-lg'>Match History</h2>
          </div>

          {allMatches.length === 0 ? (
            <div className='p-12 text-center'>
              <p className='text-4xl mb-3'>🎲</p>
              <p className='text-gray-400'>No matches played yet</p>
            </div>
          ) : (
            <div className='divide-y divide-white/10'>
              {allMatches.map((match) => (
                <div
                  key={match.id}
                  className='px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors'
                >
                  <div className='flex items-center gap-4'>
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded-full ${
                        match.won
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {match.won ? 'WIN' : 'LOSS'}
                    </span>
                    <div>
                      <Link
                        href={`/players/${match.opponent.id}`}
                        className='text-white text-sm font-semibold hover:text-yellow-400 transition-colors'
                      >
                        vs {match.opponent.name}
                      </Link>
                      <p className='text-gray-500 text-xs'>
                        {new Date(match.playedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className='text-right'>
                    <p
                      className={`font-bold font-mono ${match.eloChange >= 0 ? 'text-green-400' : 'text-red-400'}`}
                    >
                      {match.eloChange >= 0 ? '+' : ''}
                      {match.eloChange}
                    </p>
                    <p className='text-gray-500 text-xs'>
                      {match.rounds
                        .map((r) =>
                          r.winnerId === player.id
                            ? 'W'
                            : r.winnerId === null
                              ? 'T'
                              : 'L',
                        )
                        .join(' · ')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className='text-center mt-8'>
          <Link
            href='/leaderboard'
            className='text-gray-400 hover:text-white text-sm transition-colors'
          >
            &larr; Back to leaderboard
          </Link>
        </div>
      </div>
    </main>
  );
}
