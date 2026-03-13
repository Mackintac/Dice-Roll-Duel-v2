import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';
import { sendPasswordResetEmail } from '@/app/lib/email';
import { randomUUID } from 'crypto';

export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  // Don't reveal whether the email exists
  if (!user) {
    return NextResponse.json({ success: true });
  }

  const resetToken = randomUUID();
  const resetTokenExpiry = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken, resetTokenExpiry },
  });

  await sendPasswordResetEmail(email, resetToken, user.name ?? 'Player');

  return NextResponse.json({ success: true });
}
