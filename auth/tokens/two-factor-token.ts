import user_db from '@/resource/db/user';

export async function getTwoFactorTokenByToken(token: string) {
  try {
    const twoFactorToken = await user_db.twoFactorToken.findUnique({
      where: { token }
    });
    return twoFactorToken;
  } catch {
    return null;
  }
}

export async function getTwoFactorTokenByEmail(email: string) {
  try {
    const twoFactorToken = await user_db.twoFactorToken.findFirst({
      where: { email }
    });
    return twoFactorToken;
  } catch {
    return null;
  }
}
