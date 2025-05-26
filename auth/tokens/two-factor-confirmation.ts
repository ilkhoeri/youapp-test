import user_db from '@/resource/db/user';

export async function getTwoFactorConfirmationByUserId(userId: string) {
  try {
    return await user_db.twoFactorConfirmation.findUnique({ where: { userId } });
  } catch {
    return null;
  }
}
