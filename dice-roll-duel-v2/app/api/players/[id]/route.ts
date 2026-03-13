import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  const player = await prisma.player.findUnique({
    where: { id: params.id },
    include: {
      matchesAsP1: {
        include: {
          player2: true,
          rounds: { orderBy: { index: 'asc' } },
        },
        orderBy: { playedAt: 'desc' },
        take: 20,
      },
      matchesAsP2: {
        include: {
          player1: true,
          rounds: { orderBy: { index: 'asc' } },
        },
        orderBy: { playedAt: 'desc' },
        take: 20,
      },
    },
  });

  if (!player) {
    return NextResponse.json({ error: 'Player not found' }, { status: 404 });
  }

  return NextResponse.json(player);
}
