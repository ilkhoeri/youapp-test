'use server';

import * as z from 'zod';
import bcrypt from 'bcryptjs';
import db from '@/resource/db/user';
import { ObjectId } from 'bson';
import { SignUpSchema } from '@/resource/schemas/user';
import { getUserByEmail, getUserByRefId } from '../resource/db/user/get-accounts';
import { getFromUser, getNameParts } from '@/resource/const/get-from-user';
import { sanitizedWord } from '@/resource/utils/text-parser';

/** uncomment if activate resend for verificationToken */
// import { generateVerificationToken } from '../tokens';
// import { sendVerificationEmail } from '../mail';

export async function signup(values: z.infer<typeof SignUpSchema>) {
  const validatedFields = SignUpSchema.safeParse(values);

  if (!validatedFields.success) return { error: 'Invalid input' };

  const { email, password, name, role } = validatedFields.data;

  const hashedPassword = await bcrypt.hash(password, 10);

  const [firstName, lastName] = getNameParts(name);

  try {
    const refId: string = new ObjectId().toHexString(),
      username = sanitizedWord(name);

    const existingEmail = await getUserByEmail(email),
      existingRefId = await getUserByRefId(sanitizedWord(name));

    if (existingEmail && existingRefId) return { error: 'Email and Name already exists' };
    if (existingEmail) return { error: 'Email already exists' };
    if (existingRefId) return { error: 'Name already used' };

    const newUser = await db.user?.create({
      data: {
        refId,
        username,
        name: getFromUser().name(name),
        firstName,
        lastName,
        email,
        role,
        // image: 'https://res.cloudinary.com/dh0fqf3bn/image/upload/v1742880445/dt3nzfjzi7ogmw6ltdwh.gif',
        // banner: 'https://res.cloudinary.com/dh0fqf3bn/image/upload/v1742880445/dt3nzfjzi7ogmw6ltdwh.gif',
        // address: { create: { country: address?.country || undefined } },
        password: hashedPassword
      }
    });

    /** if activate resend for verificationToken */
    // const verificationToken = await generateVerificationToken(email);
    // await sendVerificationEmail(verificationToken.email, verificationToken.token);
    // return { success: "Confirmation email sent!" };

    return { newUser, success: 'Registration successful, please login.' };
  } catch (error) {
    console.error('Signup Error:', error);
    return { error: 'Error' };
  }
}

export async function signupWithCreateChat(values: z.infer<typeof SignUpSchema>) {
  try {
    const { newUser } = await signup(values);

    if (!newUser) return { error: 'No Users Created Previously' };

    // 2. Ambil semua user lama (kecuali user baru)
    const existingUsers = await db.user.findMany({
      where: { id: { not: newUser.id } }
    });

    // 3. Untuk setiap user lama, buat Chat baru dengan user lama dan user baru
    for (const user of existingUsers) {
      await db.chat.create({
        data: {
          type: 'PRIVATE',
          userIds: [user.id, newUser.id]
          // field lain sesuai kebutuhan
        }
      });
    }

    return { success: 'Registration successful, please login.' };
  } catch (error) {
    console.error('Signup Error:', error);
    return { error: 'Error' };
  }
}
