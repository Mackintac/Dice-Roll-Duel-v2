import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function sendVerificationEmail(
  to: string,
  token: string,
  name: string,
) {
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${token}`;

  await sgMail.send({
    to,
    from: process.env.SENDGRID_FROM_EMAIL!,
    replyTo: process.env.SENDGRID_FROM_EMAIL!,
    subject: 'Verify your Dice Duel account',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h1 style="font-size: 28px; font-weight: bold; margin-bottom: 8px;">DICE DUEL 🎲</h1>
        <p style="color: #666; margin-bottom: 24px;">Hey ${name}, welcome to Dice Duel!</p>
        <p style="margin-bottom: 24px;">Click the button below to verify your email address and activate your account.</p>
        
          href="${verifyUrl}"
          style="display: inline-block; background: #eab308; color: #000; font-weight: bold; padding: 14px 28px; border-radius: 999px; text-decoration: none; margin-bottom: 24px;"
        >
          Verify Email
        </a>
        <p style="color: #999; font-size: 12px;">If you didn't create an account, you can safely ignore this email.</p>
        <p style="color: #999; font-size: 12px;">Or copy this link: ${verifyUrl}</p>
      </div>
    `,
  });
}
