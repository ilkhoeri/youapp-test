'use server';

import * as z from 'zod';
import bcrypt from 'bcryptjs';
import db from '@/resource/db/user';
import { ObjectId } from 'bson';
import { SignUpSchema } from '@/resource/schemas/user';
import { getUserByEmail, getUserByRefId } from '../resource/db/user/get-accounts';
import { getDispaly, getNameParts } from '@/resource/const/get-name';
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
    let refId: string = new ObjectId().toHexString();

    const existingEmail = await getUserByEmail(email),
      existingRefId = await getUserByRefId(sanitizedWord(name));

    if (existingEmail && existingRefId) return { error: 'Email and Name already exists' };
    if (existingEmail) return { error: 'Email already exists' };
    if (existingRefId) return { error: 'Name already used' };
    if (!existingRefId) refId = sanitizedWord(name);

    await db.user?.create({
      data: {
        refId,
        name: getDispaly(name).name(),
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

    return { success: 'Registration successful, please login.' };
  } catch (error) {
    console.error('Signup Error:', error);
    return { error: 'Error' };
  }
}
