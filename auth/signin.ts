'use server';

import * as z from 'zod';
import { AuthError } from 'next-auth';
import { SignInSchema } from '@/resource/schemas/user';
import { getUserByIdentifier } from '../resource/db/user/get-accounts';
import { DEFAULT_SIGN_IN_REDIRECT } from '../routes/auth';
import { signIn } from './auth';
import { isEmail } from '@/resource/utils/text-parser';

/** uncomment if activate resend for verificationToken */
// import { generateTwoFactorToken, generateVerificationToken } from './tokens';
// import { sendTwoFactorTokenEmail, sendVerificationEmail } from '../resource/server/mail';
// import { getTwoFactorConfirmationByUserId } from './tokens/two-factor-confirmation';
// import { getTwoFactorTokenByEmail } from './tokens/two-factor-token';

export async function signin(values: z.infer<typeof SignInSchema>, callbackUrl?: string | null) {
  const validatedFields = SignInSchema.safeParse(values);

  if (!validatedFields.success) return { error: 'Invalid input!', description: 'Make sure your inputs are correct.' };

  const { identifier, password, code } = validatedFields.data;

  const existingUser = await getUserByIdentifier(identifier);
  const identifierIsEmail = isEmail(identifier);

  if (!existingUser || !existingUser.email || !existingUser?.password) {
    return {
      error: identifierIsEmail ? 'Email not registered!' : 'Username not found!',
      description: identifierIsEmail ? 'Make sure your email are correct.' : 'Make sure your username are correct.'
    };
  }

  /**
   * Aktifkan jika berlangganan resend (plugin)
  if (!existingUser.emailVerified) {
    const verificationToken = await generateVerificationToken(existingUser.email);

    await sendVerificationEmail(verificationToken.email, verificationToken.token);

    return { success: 'token verifikasi telah terkirim! Cek Email Anda.' };
  }

  if (existingUser.isTwoFactorEnabled && existingUser.email) {
    if (code) {
      const twoFactorToken = await getTwoFactorTokenByEmail(existingUser.email);

      if (!twoFactorToken) return { error: 'Token tidak sah!' };

      if (twoFactorToken.token !== code) return { error: 'Token tidak sah!' };

      const hasExpired = new Date(twoFactorToken.expires) < new Date();

      if (hasExpired) return { error: 'Token kedaluwarsa!' };

      await db.twoFactorToken.delete({
        where: { id: twoFactorToken.id }
      });

      const existingConfirmation = await getTwoFactorConfirmationByUserId(existingUser.id);

      if (existingConfirmation) {
        await db.twoFactorConfirmation.delete({
          where: { id: existingConfirmation.id }
        });
      }

      await db.twoFactorConfirmation.create({
        data: { userId: existingUser.id }
      });
    } else {
      const twoFactorToken = await generateTwoFactorToken(existingUser.email);
      await sendTwoFactorTokenEmail(twoFactorToken.email, twoFactorToken.token);

      return { twoFactor: true };
    }
  }
   */

  try {
    await signIn('credentials', {
      email: existingUser.email, // tetap gunakan email sebagai identitas ke signIn()
      password,
      redirectTo: callbackUrl || DEFAULT_SIGN_IN_REDIRECT
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'User does not found.', description: 'Make sure your username/email and password are correct.' };
        default:
          return { error: 'Error', description: 'Something went wrong.' };
      }
    }

    throw error;
  }

  return { success: 'Login successful', description: 'Welcome back, please wait a moment.' };
}
