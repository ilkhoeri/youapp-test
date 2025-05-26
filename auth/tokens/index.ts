import crypto from 'crypto';
import user_db from '@/resource/db/user';
import { v4 as uuidv4 } from 'uuid';
import { getTwoFactorTokenByEmail } from './two-factor-token';
import { getPasswordResetTokenByEmail } from './password-reset-token';
import { getVerificationTokenByEmail } from './verification-token';

export async function generateTwoFactorToken(email: string) {
  const token = crypto.randomInt(100_000, 1_000_000).toString();
  const expires = new Date(new Date().getTime() + 5 * 60 * 1000);

  const existingToken = await getTwoFactorTokenByEmail(email);

  if (existingToken) {
    await user_db.twoFactorToken.delete({
      where: {
        id: existingToken.id
      }
    });
  }

  const twoFactorToken = await user_db.twoFactorToken.create({
    data: {
      email,
      token,
      expires
    }
  });

  return twoFactorToken;
}

export async function generatePasswordResetToken(email: string) {
  const token = uuidv4();
  const expires = new Date(new Date().getTime() + 3600 * 1000);

  const existingToken = await getPasswordResetTokenByEmail(email);

  if (existingToken) {
    await user_db.passwordResetToken.delete({
      where: { id: existingToken.id }
    });
  }

  const passwordResetToken = await user_db.passwordResetToken.create({
    data: {
      email,
      token,
      expires
    }
  });

  return passwordResetToken;
}

export async function generateVerificationToken(email: string) {
  const token = uuidv4();
  const expires = new Date(new Date().getTime() + 3600 * 1000);

  const existingToken = await getVerificationTokenByEmail(email);

  if (existingToken) {
    await user_db.verificationToken.delete({
      where: {
        id: existingToken.id
      }
    });
  }

  const verficationToken = await user_db.verificationToken.create({
    data: {
      email,
      token,
      expires
    }
  });

  return verficationToken;
}
