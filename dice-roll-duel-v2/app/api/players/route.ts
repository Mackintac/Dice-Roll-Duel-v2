import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';

export async function GET() {
  const players = await prisma.prisma.player.findMany({
    orderBy: { elo: 'desc' },
  });

  return NextResponse.json(players);
}
export async function POST(req: Request) {
  const { name } = await req.json();
  const player = await prisma.prisma.player.create({
    data: { name },
  });
  return NextResponse.json(player, { status: 201 });
}
