import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { redirect } from 'next/navigation';
import GameClient from './GameClient';

export default async function GamePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/auth/signin');

  return <GameClient />;
}
