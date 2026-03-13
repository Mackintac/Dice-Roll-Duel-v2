import { prisma } from '@/app/lib/db';
import Link from 'next/link';

export const revalidate = 30;

export default async function LeaderboardPage() {
  const players = await prisma.player.findMany({
    orderBy: { elo: 'desc' },
  });

  return (
    <main className='min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-4'>
      <div className='max-w-3xl mx-auto'>
        {/* Header */}
        <div className='flex items-center justify-between py-10 mb-6'>
          <div>
            <h1 className='text-4xl font-bold text-white tracking-wider'>
              LEADERBOARD
            </h1>
            <p className='text-gray-400 text-sm mt-1'>Ranked by ELO</p>
          </div>
          <Link
            href='/game'
            className='bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-6 py-3 rounded-full transition-all duration-200 hover:scale-105'
          >
            Play
          </Link>
        </div>

        {/* Table */}
        {players.length === 0 ? (
          <div className='bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-16 text-center'>
            <p className='text-4xl mb-4'>🎲</p>
            <p className='text-white font-semibold text-lg'>No players yet</p>
            <p className='text-gray-400 text-sm mt-2'>
              Play a match to appear on the leaderboard
            </p>
          </div>
        ) : (
          <div className='bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden'>
            <table className='w-full'>
              <thead>
                <tr className='border-b border-white/20'>
                  <th className='text-left px-6 py-4 text-xs font-semibold text-gray-400 tracking-widest uppercase'>
                    #
                  </th>
                  <th className='text-left px-6 py-4 text-xs font-semibold text-gray-400 tracking-widest uppercase'>
                    Player
                  </th>
                  <th className='text-left px-6 py-4 text-xs font-semibold text-gray-400 tracking-widest uppercase'>
                    ELO
                  </th>
                  <th className='text-left px-6 py-4 text-xs font-semibold text-gray-400 tracking-widest uppercase'>
                    W
                  </th>
                  <th className='text-left px-6 py-4 text-xs font-semibold text-gray-400 tracking-widest uppercase'>
                    L
                  </th>
                  <th className='text-left px-6 py-4 text-xs font-semibold text-gray-400 tracking-widest uppercase'>
                    Win Rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {players.map((player, i) => {
                  const total = player.wins + player.losses;
                  const winRate =
                    total > 0 ? Math.round((player.wins / total) * 100) : 0;

                  return (
                    <tr
                      key={player.id}
                      className='border-b border-white/10 last:border-none hover:bg-white/5 transition-colors'
                    >
                      <td className='px-6 py-4'>
                        <span
                          className={`font-bold text-lg ${
                            i === 0
                              ? 'text-yellow-400'
                              : i === 1
                                ? 'text-gray-300'
                                : i === 2
                                  ? 'text-amber-600'
                                  : 'text-gray-500'
                          }`}
                        >
                          {i === 0
                            ? '🥇'
                            : i === 1
                              ? '🥈'
                              : i === 2
                                ? '🥉'
                                : i + 1}
                        </span>
                      </td>
                      <td className='px-6 py-4'>
                        <Link
                          href={`/players/${player.id}`}
                          className='text-white font-semibold hover:text-yellow-400 transition-colors'
                        >
                          {player.name}
                        </Link>
                      </td>
                      <td className='px-6 py-4 text-yellow-400 font-bold font-mono'>
                        {player.elo}
                      </td>
                      <td className='px-6 py-4 text-green-400'>
                        {player.wins}
                      </td>
                      <td className='px-6 py-4 text-red-400'>
                        {player.losses}
                      </td>
                      <td className='px-6 py-4'>
                        <div className='flex items-center gap-3'>
                          <div className='w-20 h-1.5 bg-white/20 rounded-full overflow-hidden'>
                            <div
                              className='h-full bg-yellow-400 rounded-full'
                              style={{ width: `${winRate}%` }}
                            />
                          </div>
                          <span className='text-gray-300 text-sm'>
                            {total > 0 ? `${winRate}%` : '—'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className='text-center mt-8'>
          <Link
            href='/'
            className='text-gray-400 hover:text-white text-sm transition-colors'
          >
            &larr; Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
