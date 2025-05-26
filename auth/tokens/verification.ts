'use server';

import user_db from '@/resource/db/user';
import { getVerificationTokenByToken } from './verification-token';

export async function verification(token: string) {
  try {
    const existingToken = await getVerificationTokenByToken(token);

    if (!existingToken) return { error: 'Token tidak ditemukan!' };

    const hasExpired = new Date(existingToken.expires) < new Date();

    if (hasExpired) return { error: 'Token sudah kadaluwarsa!' };

    const existingUser = await user_db.user.findUnique({
      where: { email: existingToken.email },
      select: { id: true, email: true }
    });

    if (!existingUser) return { error: 'Akun tidak ditemukan!' };

    await user_db.user.update({
      where: { id: existingUser.id },
      data: {
        emailVerified: new Date(),
        email: existingToken.email
      }
    });

    await user_db.verificationToken.delete({
      where: { id: existingToken.id }
    });

    return { success: 'Email terverfikasi!' };
  } catch (error) {
    console.error('[VERIFICATION ERROR]:', error);
    return { error: 'Verification Error!' };
  }
}
