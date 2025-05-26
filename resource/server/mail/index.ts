import { Resend } from 'resend';

import { HTMLVerificationEmail } from './html/html-verification';
import { HTML2FA } from './html/html-2fa';
import { HTMLResetPsw } from './html/reset-password';

const resend = new Resend(process.env.RESEND_API_KEY);
const emailServer = process.env.EMAIL_SERVER;
const domain = process.env.NEXT_PUBLIC_SITE_URL;

export const sendTwoFactorTokenEmail = async (email: string, token: string) => {
  await resend.emails.send({
    from: emailServer as string,
    to: email,
    subject: 'Authentication Code',
    html: HTML2FA({ token, domain })
  });
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${domain}/auth/new-password?token=${token}`;

  await resend.emails.send({
    from: emailServer as string,
    to: email,
    subject: 'Reset Password',
    html: HTMLResetPsw({ resetLink, domain })
  });
};

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${domain}/auth/verification?token=${token}`;

  await resend.emails.send({
    from: emailServer as string,
    to: email,
    subject: 'Verification Email Address',
    html: HTMLVerificationEmail({ confirmLink, domain })
  });
};
