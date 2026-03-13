import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function sendVerificationEmail(
  to: string,
  token: string,
  name: string,
) {
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify?token=${token}`;
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
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td>
          <table cellpadding="0" cellspacing="0">
            <tr>
              <td style="background: #eab308; border-radius: 999px; padding: 14px 28px;">
                <a href="${verifyUrl}" style="color: #000; font-weight: bold; text-decoration: none; display: inline-block;">Verify Email</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    <p style="color: #999; font-size: 12px; margin-top: 24px;">If you didn't create an account, you can safely ignore this email.</p>
    <p style="color: #999; font-size: 12px;">Or copy this link: <a href="${verifyUrl}" style="color: #999;">${verifyUrl}</a></p>
  </div>
`,
  });
}

export async function sendPasswordResetEmail(
  to: string,
  token: string,
  name: string,
) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`;

  await sgMail.send({
    to,
    from: process.env.SENDGRID_FROM_EMAIL!,
    replyTo: process.env.SENDGRID_FROM_EMAIL!,
    subject: 'Reset your Dice Duel password',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h1 style="font-size: 28px; font-weight: bold; margin-bottom: 8px;">DICE DUEL 🎲</h1>
        <p style="color: #666; margin-bottom: 24px;">Hey ${name}, we received a request to reset your password.</p>
        <p style="margin-bottom: 24px;">Click the button below to set a new password. This link expires in 1 hour.</p>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background: #eab308; border-radius: 999px; padding: 14px 28px;">
                    <a href="${resetUrl}" style="color: #000; font-weight: bold; text-decoration: none; display: inline-block;">Reset Password</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <p style="color: #999; font-size: 12px; margin-top: 24px;">If you didn't request a password reset, you can safely ignore this email.</p>
        <p style="color: #999; font-size: 12px;">Or copy this link: <a href="${resetUrl}" style="color: #999;">${resetUrl}</a></p>
        <p style="color: #999; font-size: 12px;">This link expires in 1 hour.</p>
      </div>
    `,
  });
}
