import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';
import { sendVerificationEmail } from '@/app/lib/email';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

export async function POST(req: Request) {
  const { email, password, name } = await req.json();

  if (!email || !password || !name) {
    return NextResponse.json(
      { error: 'Name, email and password are required' },
      { status: 400 },
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: 'Password must be at least 8 characters' },
      { status: 400 },
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: 'Email already in use' },
      { status: 409 },
    );
  }
  const existingPlayer = await prisma.player.findUnique({ where: { name } });
  if (existingPlayer) {
    return NextResponse.json(
      { error: 'That username is already taken' },
      { status: 409 },
    );
  }
  const hashed = await bcrypt.hash(password, 12);
  const verificationToken = randomUUID();

  const user = await prisma.user.create({
    data: {
      email,
      password: hashed,
      name,
      verificationToken,
      player: {
        create: { name },
      },
    },
  });

  await sendVerificationEmail(email, verificationToken, name);

  return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
}
