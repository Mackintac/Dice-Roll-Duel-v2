import { NextResponse } from 'next/server';
import { calculateElo } from '@/app/lib/elo';
import { prisma } from '@/app/lib/db';
import { Prisma } from '@/app/generated/prisma/client';

export async function POST(req: Request) {
  const { player1Id, player2Id, winnerId, rounds } = await req.json();

  const [p1, p2] = await Promise.all([
    prisma.player.findUniqueOrThrow({ where: { id: player1Id } }),
    prisma.player.findUniqueOrThrow({ where: { id: player2Id } }),
  ]);

  const loserId = winnerId === player1Id ? player2Id : player1Id;
  const winnerRating = winnerId === player1Id ? p1.elo : p2.elo;
  const loserRating = winnerId === player1Id ? p2.elo : p1.elo;

  const { newWinner, newLoser, delta } = calculateElo(
    winnerRating,
    loserRating,
  );

  const match = await prisma.$transaction(
    async (tx: Prisma.TransactionClient) => {
      const match = await tx.match.create({
        data: {
          player1Id,
          player2Id,
          winnerId,
          eloChange: delta,
          rounds: {
            create: rounds.map((r: any, i: number) => ({
              roll1: r.roll1,
              roll2: r.roll2,
              winnerId: r.winnerId,
              index: i,
            })),
          },
        },
        include: { rounds: true },
      });

      // updates player data depending on win/lose
      await tx.player.update({
        where: { id: winnerId },
        data: { elo: newWinner, wins: { increment: 1 } },
      });

      await tx.player.update({
        where: { id: loserId },
        data: { elo: newLoser, losses: { increment: 1 } },
      });

      return match;
    },
  );

  return NextResponse.json({ match, delta }, { status: 201 });
}
