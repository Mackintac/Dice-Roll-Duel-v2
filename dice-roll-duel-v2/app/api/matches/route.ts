import { NextResponse } from 'next/server';
import { calculateElo } from '@/app/lib/elo';
import { prisma } from '@/app/lib/db';

export async function POST(req: Request) {
  const { player1Id, player2Id, winnerId, rounds } = await req.json();

  const [p1, p2] = await Promise.all([
    prisma.prisma.player.findUniqueOrThrow({ where: { id: player1Id } }),
    prisma.prisma.player.findUniqueOrThrow({ where: { id: player2Id } }),
  ]);
}
