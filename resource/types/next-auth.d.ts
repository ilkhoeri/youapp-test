import { type DefaultSession } from 'next-auth';
import type { ElaboratedUser } from './user';

export type ExtendedUser = DefaultSession['user'] & ElaboratedUser & { isOAuth: boolean };

declare module 'next-auth' {
  interface Session {
    user: ExtendedUser;
  }
}
