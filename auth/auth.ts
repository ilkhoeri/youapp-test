import NextAuth from 'next-auth';
import 'next-auth/jwt';

import user_db from '@/resource/db/user';
import authConfig from '@/auth/config';
import { AccountStatus, UserRole } from '@prisma/client';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { getTwoFactorConfirmationByUserId } from './tokens/two-factor-confirmation';
import { getAccountByUserId, gerUserById } from '@/resource/db/user/get-accounts';
import { DEFAULT_SIGN_IN_REDIRECT } from '@/routes/auth';

import { CredentialsSchema } from '@/resource/schemas/user';

// import { UnstorageAdapter } from '@auth/unstorage-adapter';
// const storage = createStorage({
//   driver: process.env.VERCEL
//     ? vercelKVDriver({
//         url: process.env.AUTH_KV_REST_API_URL,
//         token: process.env.AUTH_KV_REST_API_TOKEN,
//         env: false
//       })
//     : memoryDriver()
// });

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
  unstable_update: update
} = NextAuth({
  adapter: PrismaAdapter(user_db),
  // debug: !!process.env.AUTH_DEBUG,
  // theme: { logo: 'https://authjs.dev/img/logo-sm.png' },
  ...authConfig,
  // experimental: { enableWebAuthn: true },
  session: { strategy: 'jwt' },
  pages: {
    signIn: DEFAULT_SIGN_IN_REDIRECT,
    error: '/auth/error'
  },
  events: {
    async linkAccount({ user }) {
      await user_db.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() }
      });
    }
  },
  callbacks: {
    async signIn({ user, account }) {
      // Allow OAuth without email verification
      if (account?.provider !== 'credentials') return true;

      /**
       * Aktifkan jika plugin resend sudah pro

      const existingUser = await gerUserById(user.id as string);

      // Prevent sign in without email verification
      if (!existingUser?.emailVerified) return false;

      if (existingUser.isTwoFactorEnabled) {
        const twoFactorConfirmation = await getTwoFactorConfirmationByUserId(existingUser.id);

        if (!twoFactorConfirmation) return false;

        // Delete two factor confirmation for next sign in
        await db.twoFactorConfirmation.delete({
          where: { id: twoFactorConfirmation.id }
        });
      }
       */

      return true;
    },
    async session({ token, session }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }

      if (token.role && session.user) {
        session.user.role = token.role as UserRole;
      }

      if (token.accountStatus && session.user) {
        session.user.accountStatus = token.accountStatus as AccountStatus;
      }

      if (session.user) {
        session.user.isTwoFactorEnabled = token.isTwoFactorEnabled as boolean;
      }

      if (session.user) {
        session.user.refId = token.refId as string;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.name = token.name || (`${token.firstName} ${token.lastName}`.trim() as string);
        session.user.email = token.email as string;
        session.user.phone = token.phone as string;
        session.user.isOAuth = token.isOAuth as boolean;
      }

      return session;
    },
    async jwt({ token }) {
      if (!token.sub) return token;

      const existing = await gerUserById(token.sub);

      if (!existing) return token;

      const existingAccount = await getAccountByUserId(existing.id);

      token.isOAuth = !!existingAccount;
      token.refId = existing.refId;
      token.firstName = existing.firstName;
      token.lastName = existing.lastName;
      token.name = existing.name;
      token.email = existing.email;
      token.isTwoFactorEnabled = existing.isTwoFactorEnabled;
      token.role = existing.role;
      token.accountStatus = existing.accountStatus;
      token.phone = existing.phone;

      return token;
    }
  }
});

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
  }
}
