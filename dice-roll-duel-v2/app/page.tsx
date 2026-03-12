import Link from 'next/link';

export default function Home() {
  return (
    <main className='home-page'>
      <h1 className='logo'>DICE DUEL</h1>
      <p className='tagline'>Best of 3. Fully random. ELO ranked.</p>

      <div className='home-actions'>
        <Link href='/game' className='btn-primary'>
          Play
        </Link>
      </div>

      <div className='min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4'>
        <div className='max-w-4xl mx-auto text-center'>
          {/* Game Title */}
          <div className='mb-12'>
            <h1 className='text-6xl md:text-8xl font-bold text-white mb-4 tracking-wider'>
              DICE ROLL
            </h1>
            <h2 className='text-4xl md:text-6xl font-bold text-yellow-400 mb-6 tracking-wider'>
              DUEL
            </h2>
            <div className='flex justify-center space-x-4 mb-8'>
              <div className='w-16 h-16 bg-white rounded-lg shadow-lg flex items-center justify-center text-3xl font-bold text-gray-800'>
                ⚄
              </div>
              <div className='w-16 h-16 bg-white rounded-lg shadow-lg flex items-center justify-center text-3xl font-bold text-gray-800'>
                ⚅
              </div>
              <div className='w-16 h-16 bg-white rounded-lg shadow-lg flex items-center justify-center text-3xl font-bold text-gray-800'>
                ⚂
              </div>
            </div>
          </div>

          {/* Game Description */}
          <div className='mb-12'>
            <p className='text-xl md:text-2xl text-gray-200 mb-6 max-w-2xl mx-auto leading-relaxed'>
              Challenge players from around the world in this thrilling 1v1 dice
              rolling competition. Roll higher than your opponent to win rounds
              and climb the leaderboard!
            </p>
            <div className='grid md:grid-cols-3 gap-6 max-w-3xl mx-auto'>
              <div className='bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20'>
                <div className='text-4xl mb-3'>🎯</div>
                <h3 className='text-lg font-semibold text-white mb-2'>
                  &quotSkill-based&quot Player versus Player!
                </h3>
                <p className='text-gray-300 text-sm'>
                  Outsmart your opponents with luck
                </p>
              </div>
              <div className='bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20'>
                <div className='text-4xl mb-3'>🏆</div>
                <h3 className='text-lg font-semibold text-white mb-2'>
                  Ranked Matches
                </h3>
                <p className='text-gray-300 text-sm'>
                  Climb the global leaderboard with ELO ratings
                </p>
              </div>
              <div className='bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20'>
                <div className='text-4xl mb-3'>⚡</div>
                <h3 className='text-lg font-semibold text-white mb-2'>
                  Fast Paced
                </h3>
                <p className='text-gray-300 text-sm'>
                  Quick matches that keep you engaged
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='space-y-4'>
            <Link
              href='/game'
              className='inline-block bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xl px-12 py-4 rounded-full shadow-lg transform hover:scale-105 transition-all duration-200'
            >
              QUEUE
            </Link>
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <Link
                href='/leaderboard'
                className='bg-white/20 hover:bg-white/30 text-white font-semibold px-8 py-3 rounded-full border border-white/30 transition-all duration-200'
              >
                View Leaderboard
              </Link>
              <Link
                href='/profile'
                className='bg-white/20 hover:bg-white/30 text-white font-semibold px-8 py-3 rounded-full border border-white/30 transition-all duration-200'
              >
                My Profile
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className='mt-16 text-gray-400 text-sm'>
            <p>Roll the dice and test your luck! 🎲</p>
          </div>
        </div>
      </div>
    </main>
  );
}
