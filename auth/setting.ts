// @ts-nocheck
'use server';

import * as z from 'zod';
import bcrypt from 'bcryptjs';
import user_db from '@/resource/db/user';
import { auth, update } from './auth';
import { gerUserById, getUserByEmail } from '../resource/db/user/get-accounts';
import { SettingsSchema } from '@/resource/schemas/user';
import { generateVerificationToken } from './tokens';
import { sendVerificationEmail } from '../resource/server/mail';

type KeyMap = { [key: string]: any };

export async function settings<T extends KeyMap = KeyMap>(values: T) {
  const current = (await auth())?.user;

  if (!current) return { error: 'Akses tidak sah!' };

  const dbCurrent = await gerUserById(current.id);

  if (!dbCurrent) return { error: 'Akses tidak sah!' };

  if (current.isOAuth) {
    values.email = undefined;
    values.password = undefined;
    values.newPassword = undefined;
    values.isTwoFactorEnabled = undefined;
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
    values.password = hashedPassword;
    values.newPassword = undefined;
  }

  const updated = await user_db.user.update({
    where: { id: dbCurrent.id },
    data: { ...values },
    include: { address: true }
  });

  update({
    user: {
      firstName: updated.firstName,
      lastName: updated.lastName,
      name: updated.name || `${updated.firstName} ${updated.lastName}`.trim(),
      email: updated.email,
      isTwoFactorEnabled: updated.isTwoFactorEnabled,
      role: updated.role,
      accountStatus: updated.accountStatus,
      status: updated.status,
      birthPlace: updated.birthPlace,
      birthDate: updated.birthDate,
      phone: updated.phone,
      bio: updated.bio,
      resume: updated.resume,
      gender: updated.gender
    }
  });

  return { success: 'Updated Successfully!' };
}
