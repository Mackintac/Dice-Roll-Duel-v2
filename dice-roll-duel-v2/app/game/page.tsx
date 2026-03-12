import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { prisma } from '@/app/lib/db';
import { redirect } from 'next/navigation';
import GameClient from './GameClient';

export default async function GamePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/auth/signin');

  // Get or create the player profile linked to this user
  let player = await prisma.player.findFirst({
    where: { userId: session.user.id },
  });

  if (!player) {
    player = await prisma.player.create({
      data: {
        name: session.user.name ?? session.user.email ?? 'Player',
        userId: session.user.id,
      },
    });
  }

  return <GameClient playerId={player.id} playerName={player.name} />;
}
