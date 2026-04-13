import { prisma } from '@/app/lib/db';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function LeaderboardPage() {
  const players = await prisma.player.findMany({
    orderBy: { elo: 'desc' },
  });

  // Fetch all matches for records
  const allMatches = await prisma.match.findMany({
    include: {
      player1: true,
      player2: true,
      rounds: true,
      winner: true,
    },
    orderBy: { playedAt: 'asc' },
  });

  // Longest game
  const longestMatch = allMatches.reduce(
    (max, match) => (match.rounds.length > max.rounds.length ? match : max),
    allMatches[0] ?? null,
  );

  // Win/loss streaks across all players
  function calculateStreaks(playerId: string) {
    const playerMatches = allMatches.filter(
      (m) => m.player1Id === playerId || m.player2Id === playerId,
    );
    let longest = 0;
    let current = 0;
    playerMatches.forEach((m) => {
      if (m.winnerId === playerId) {
        current++;
        if (current > longest) longest = current;
      } else {
        current = 0;
      }
    });
    return longest;
  }

  function calculateLossStreaks(playerId: string) {
    const playerMatches = allMatches.filter(
      (m) => m.player1Id === playerId || m.player2Id === playerId,
    );
    let longest = 0;
    let current = 0;
    playerMatches.forEach((m) => {
      if (m.winnerId !== playerId) {
        current++;
        if (current > longest) longest = current;
      } else {
        current = 0;
      }
    });
    return longest;
  }

  const winStreakRecord = players.reduce(
    (best, player) => {
      const streak = calculateStreaks(player.id);
      return streak > best.streak ? { player, streak } : best;
    },
    { player: players[0], streak: 0 },
  );

  const lossStreakRecord = players.reduce(
    (best, player) => {
      const streak = calculateLossStreaks(player.id);
      return streak > best.streak ? { player, streak } : best;
    },
    { player: players[0], streak: 0 },
  );

  // All time lowest ELO — reconstruct from match history
  const playerEloHistory: Record<string, number[]> = {};
  allMatches.forEach((match) => {
    const winnerId = match.winnerId;
    const loserId =
      match.player1Id === winnerId ? match.player2Id : match.player1Id;

    if (!playerEloHistory[winnerId]) playerEloHistory[winnerId] = [1000];
    if (!playerEloHistory[loserId]) playerEloHistory[loserId] = [1000];

    const prevWinner =
      playerEloHistory[winnerId][playerEloHistory[winnerId].length - 1];
    const prevLoser =
      playerEloHistory[loserId][playerEloHistory[loserId].length - 1];

    playerEloHistory[winnerId].push(prevWinner + match.eloChange);
    playerEloHistory[loserId].push(prevLoser - match.eloChange);
  });

  let highestEloEver = 1000;
  let highestEloPlayerName = '—';
  let lowestEloEver = 1000;
  let lowestEloPlayerName = '—';

  for (const [playerId, history] of Object.entries(playerEloHistory)) {
    const max = Math.max(...history);
    const min = Math.min(...history);
    const player = players.find((p) => p.id === playerId);
    if (!player) continue;

    if (max > highestEloEver) {
      highestEloEver = max;
      highestEloPlayerName = player.name;
    }
    if (min < lowestEloEver) {
      lowestEloEver = min;
      lowestEloPlayerName = player.name;
    }
  }

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
        {/* Records */}
        {players.length > 0 && allMatches.length > 0 && (
          <div className='bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 mb-6'>
            <h2 className='text-white font-bold text-lg mb-4'>🏅 Records</h2>
            <div className='grid grid-cols-2 sm:grid-cols-3 gap-4'>
              <div className='bg-white/10 rounded-xl p-4'>
                <p className='text-yellow-400 font-bold text-2xl font-mono'>
                  {highestEloEver}
                </p>
                <p className='text-gray-400 text-xs uppercase tracking-wider mt-1'>
                  All Time Highest ELO
                </p>
                <p className='text-white text-sm mt-1'>
                  {highestEloPlayerName}
                </p>
              </div>
              <div className='bg-white/10 rounded-xl p-4'>
                <p className='text-red-400 font-bold text-2xl font-mono'>
                  {lowestEloEver}
                </p>
                <p className='text-gray-400 text-xs uppercase tracking-wider mt-1'>
                  All Time Lowest ELO
                </p>
                <p className='text-white text-sm mt-1'>{lowestEloPlayerName}</p>
              </div>
              <div className='bg-white/10 rounded-xl p-4'>
                <p className='text-white font-bold text-2xl font-mono'>
                  {longestMatch?.rounds.length ?? '—'}
                </p>
                <p className='text-gray-400 text-xs uppercase tracking-wider mt-1'>
                  Longest Game
                </p>
                <p className='text-white text-sm mt-1'>
                  {longestMatch
                    ? `${longestMatch.player1.name} vs ${longestMatch.player2.name}`
                    : '—'}
                </p>
              </div>
              <div className='bg-white/10 rounded-xl p-4'>
                <p className='text-green-400 font-bold text-2xl font-mono'>
                  {winStreakRecord.streak}
                </p>
                <p className='text-gray-400 text-xs uppercase tracking-wider mt-1'>
                  Longest Win Streak
                </p>
                <p className='text-white text-sm mt-1'>
                  {winStreakRecord.player?.name}
                </p>
              </div>
              <div className='bg-white/10 rounded-xl p-4'>
                <p className='text-red-400 font-bold text-2xl font-mono'>
                  {lossStreakRecord.streak}
                </p>
                <p className='text-gray-400 text-xs uppercase tracking-wider mt-1'>
                  Longest Loss Streak
                </p>
                <p className='text-white text-sm mt-1'>
                  {lossStreakRecord.player?.name}
                </p>
              </div>
            </div>
          </div>
        )}
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
