import user_db from '@/resource/db/user';

export async function getPasswordResetTokenByToken(token: string) {
  try {
    const passwordResetToken = await user_db.passwordResetToken.findUnique({
      where: { token }
    });

    return passwordResetToken;
  } catch {
    return null;
  }
}

export async function getPasswordResetTokenByEmail(email: string) {
  try {
    const passwordResetToken = await user_db.passwordResetToken.findFirst({
      where: { email }
    });

    return passwordResetToken;
  } catch {
    return null;
  }
}
