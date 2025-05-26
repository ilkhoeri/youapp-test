import user_db from '@/resource/db/user';

export async function getVerificationTokenByToken(token: string) {
  try {
    const verificationToken = await user_db.verificationToken.findUnique({
      where: { token }
    });

    return verificationToken;
  } catch {
    return null;
  }
}

export async function getVerificationTokenByEmail(email: string) {
  try {
    const verificationToken = await user_db.verificationToken.findFirst({
      where: { email }
    });

    return verificationToken;
  } catch {
    return null;
  }
}

export async function getInvitationToken(token: string | undefined | null) {
  if (!token) return null;
  try {
    const verificationToken = await user_db.invitationToken.findUnique({
      where: { token, isUsed: false }
    });
    return verificationToken;
  } catch {
    return null;
  }
}

/** Validasi sebelum mencoba menggunakan token */
export async function validateToken(token: string) {
  try {
    const invitationToken = await user_db.invitationToken.findUnique({
      where: { token }
    });

    if (!invitationToken) {
      throw new Error('Token tidak ditemukan');
    }

    if (invitationToken.isUsed) {
      throw new Error('Token sudah digunakan');
    }

    if (invitationToken.expires < new Date()) {
      throw new Error('Token sudah kadaluarsa');
    }

    if (invitationToken.usageCount >= invitationToken.maxUsageCount) {
      throw new Error('Token sudah mencapai batas penggunaan maksimum');
    }

    return invitationToken;
  } catch (error) {
    throw new Error('Terjadi error');
  }
}
