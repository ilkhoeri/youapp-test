import user_db from '@/resource/db/user';
import bcrypt from 'bcryptjs';
import Github from 'next-auth/providers/github';
// import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';

import { CredentialsSchema } from '@/resource/schemas/user';

import type { NextAuthConfig } from 'next-auth';

async function getUser(email: string) {
  try {
    return await user_db.user.findUnique({ where: { email } });
  } catch {
    return null;
  }
}

export default {
  providers: [
    // Google({
    //   clientId: process.env.GOOGLE_CLIENT_ID as string,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
    // }),
    Github({
      clientId: process.env.AUTH_GITHUB_ID as string,
      clientSecret: process.env.AUTH_GITHUB_SECRET as string
    }),
    Credentials({
      async authorize(credentials) {
        const validatedFields = CredentialsSchema.safeParse(credentials);

        if (validatedFields.success) {
          const { email, password } = validatedFields.data;

          const user = await getUser(email);
          if (!user || !user.password) return null;

          const passwordsMatch = await bcrypt.compare(password, user.password);

          if (passwordsMatch) return user;
        }

        return null;
      }
    })
  ]
} satisfies NextAuthConfig;
