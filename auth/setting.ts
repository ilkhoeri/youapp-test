'use server';

import bcrypt from 'bcryptjs';
import user_db from '@/resource/db/user';
import { auth, update } from './auth';
import { gerUserById, getUserByEmail } from '../resource/db/user/get-accounts';
import { generateVerificationToken } from './tokens';
import { sendVerificationEmail } from '../resource/server/mail';

type KeyMap = { [key: string]: any };

export async function settings<T extends KeyMap = KeyMap>(values: T) {
  const current = (await auth())?.user;

  if (!current) return { error: 'Akses tidak sah!' };

  const dbCurrent = await gerUserById(current.id);

  if (!dbCurrent) return { error: 'Akses tidak sah!' };

  if (current.isOAuth) {
    (values as any).email = undefined;
    (values as any).password = undefined;
    (values as any).newPassword = undefined;
    (values as any).isTwoFactorEnabled = undefined;
  }

  if (values.email && values.email !== current.email) {
    const existing = await getUserByEmail(values.email);

    if (existing && existing.id !== current.id) return { error: 'Email sudah digunakan.' };

    const verificationToken = await generateVerificationToken(values.email);
    await sendVerificationEmail(verificationToken.email, verificationToken.token);

    return { success: 'Email verifikasi telah terkirim!' };
  }

  if (values.password && values.newPassword && dbCurrent.password) {
    const passwordsMatch = await bcrypt.compare(values.password, dbCurrent.password);

    if (!passwordsMatch) return { error: 'Kata sandi salah!' };

    const hashedPassword = await bcrypt.hash(values.newPassword, 10);
    (values as any).password = hashedPassword;
    (values as any).newPassword = undefined;
  }

  const updated = await user_db.user.update({
    where: { id: dbCurrent.id },
    data: { ...values },
    include: { address: true }
  });

  update({
    user: updated
  });

  return { success: 'Updated Successfully!' };
}
