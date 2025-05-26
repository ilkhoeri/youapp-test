import user_db from '@/resource/db/user';
import { auth } from '@/auth/auth';
import { Prisma, UserRole } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
import { Account } from '@/resource/types/user';
import { strictRole } from '@/resource/const/role-status';
import { isEmail, sanitizedWord } from '@/resource/utils/text-parser';

export async function getUsers() {
  const session = await auth();

  if (!session?.user?.email) return [];

  try {
    return await user_db.user.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      where: {
        NOT: {
          email: session.user.email
        }
      }
    });
  } catch (error: any) {
    return [];
  }
}

export async function currentRole() {
  try {
    return (await auth())?.user?.role;
  } catch (_e) {
    return undefined;
  }
}

export async function gerUserById(id: string) {
  try {
    return await user_db.user.findUnique({ where: { id } });
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  // return (await auth())?.user;
  try {
    const id = (await auth())?.user?.id,
      data = await user_db.user?.findUnique({
        where: { id },
        include: {
          address: true,
          about: true,
          links: true,
          ownedTeams: true,
          teams: true,
          chats: true,
          seenMessages: true,
          messages: true
        }
      });
    return data as Account;
  } catch (_e) {
    return null;
  }
}

export const currentUser = getCurrentUser;

export async function getUserByEmail(email: string, { include }: { include?: Prisma.UserInclude<DefaultArgs> | null | undefined } = {}) {
  try {
    return await user_db.user.findUnique({ where: { email }, include });
  } catch {
    return null;
  }
}

export async function getUserByRefId(refId: string) {
  try {
    return await user_db.user.findUnique({ where: { refId }, include: { about: true } });
  } catch {
    return null;
  }
}

export async function getUserByIdentifier(identifier: string) {
  try {
    return isEmail(identifier) ? await getUserByEmail(identifier, { include: { about: true } }) : await getUserByRefId(sanitizedWord(identifier));
  } catch {
    return null;
  }
}

export async function getAccountByUserId(userId: string) {
  try {
    const account = await user_db.account.findFirst({
      where: { userId }
    });
    return account;
  } catch {
    return null;
  }
}

export async function getallUserExceptActive(currentSession: Account) {
  try {
    return await user_db.user?.findMany({
      where: strictRole(currentSession)
        ? undefined
        : {
            NOT: { role: 'DEVELOPER', refId: currentSession?.refId, id: currentSession?.id }
          }
    });
  } catch {
    return null;
  }
}

export async function getTeams() {
  try {
    return await user_db.team.findMany();
  } catch {
    return null;
  }
}
