import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';
import { sendVerificationEmail } from '@/app/lib/email';
import { randomUUID } from 'crypto';

export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    // Don't reveal whether the email exists
    return NextResponse.json({ success: true });
  }

  if (user.emailVerified) {
    return NextResponse.json(
      { error: 'Email already verified' },
      { status: 400 },
    );
  }

  const verificationToken = randomUUID();

  await prisma.user.update({
    where: { id: user.id },
    data: { verificationToken },
  });

  await sendVerificationEmail(email, verificationToken, user.name ?? 'Player');

  return NextResponse.json({ success: true });
}
