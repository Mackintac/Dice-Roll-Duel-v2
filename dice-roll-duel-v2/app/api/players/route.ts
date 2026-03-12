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

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const player = await prisma.prisma.player.upsert({
    where: { name: name.trim() },
    update: {}, // already exists, return as-is, no changes
    create: { name: name.trim() },
  });

  return NextResponse.json(player, { status: 201 });
}
