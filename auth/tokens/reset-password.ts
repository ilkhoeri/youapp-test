'use server';

import * as z from 'zod';
import { ResetSchema } from '@/resource/schemas/user';
import { getUserByEmail } from '../../resource/db/user/get-accounts';
import { generatePasswordResetToken } from '.';
import { sendPasswordResetEmail } from '../../resource/server/mail';

export async function reset(values: z.infer<typeof ResetSchema>) {
  const validatedFields = ResetSchema.safeParse(values);

  if (!validatedFields.success) return { error: 'Email tidak valid' };

  const { email } = validatedFields.data;

  const existingUser = await getUserByEmail(email);

  if (!existingUser) return { error: 'Email tidak ditemukan.' };

  const passwordResetToken = await generatePasswordResetToken(email);
  await sendPasswordResetEmail(passwordResetToken.email, passwordResetToken.token);

  return { success: 'Setel ulang email terkirim!' };
}
