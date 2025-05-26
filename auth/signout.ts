// 'use server';

import { signOut as out } from '@/auth/auth';

interface SignOutOption {
  redirectTo?: string;
  redirect?: true | undefined;
}

export async function signOut(opts?: SignOutOption) {
  'use server';
  try {
    await out(opts);
  } catch {
    console.log('Signout Error');
  }
}

// export async function signOut(opts?: SignOutOption) {
//   try {
//     await out(opts);
//   } catch {
//     console.log('Signout Error');
//   }
// }
