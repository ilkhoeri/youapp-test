'use server';

import user_db from '@/resource/db/user';
import { auth } from '@/auth/auth';
import { strictRole } from '@/resource/const/role-status';

export async function deleteAccount(userId: string | null | undefined) {
  try {
    const [session] = await Promise.all([auth()]);
    const isSuperAdmin = session?.user;

    if (!session || (!isSuperAdmin && strictRole(session.user))) return { success: false, error: 'UNAUTHORIZED', status: 401 };

    const admin = await user_db.user.findUnique({ where: { id: isSuperAdmin?.id } });
    if (!admin) return { success: false, error: 'UNAUTHENTICATED', status: 403 };

    if (!userId) return { success: false, error: 'MISSING_ACCOUNT_ID', status: 405 };

    const deletedAccount = await user_db.user.delete({ where: { id: userId } });

    return { success: true, data: deletedAccount, status: 200 };
  } catch (error) {
    console.log('[DELETING_ACCOUNT]', error);
    return { success: false, error: 'INTERNAL_ERROR', status: 500 };
  }
}

type KeyMap = { [key: string]: any };

export async function updateAccount<T extends KeyMap = KeyMap>(userId: string | null | undefined, data: T) {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, error: 'UNAUTHORIZED', status: 403 };

    if (!userId) return { success: false, error: 'MISSING_ACCOUNT_ID', status: 400 };

    if (!data || Object.keys(data).length === 0) return { success: false, error: 'EMPTY_UPDATE_DATA', status: 400 };

    const admin = await user_db.user.findUnique({ where: { id: session.user.id } });

    if (!admin) return { success: false, error: 'UNAUTHENTICATED', status: 403 };

    const updatedAccount = await user_db.user.update({
      where: { id: userId },
      data,
      include: { address: true, links: true, about: true }
    });

    return { success: true, data: updatedAccount, status: 200 };
  } catch (error) {
    console.error('[UPDATED_ACCOUNT_ERROR]', error);
    return { success: false, error: 'INTERNAL_SERVER_ERROR', status: 500 };
  }
}

type UserId = string | null | undefined;
type PingData = { lastSeen?: Date; lastOnline?: Date };

export async function dbPing(userId: UserId, body: PingData) {
  try {
    if (!userId || !body) return null;
    await user_db.user.update({
      where: { id: userId },
      data: body
    });

    return { status: 200 };
  } catch (err) {
    return null;
  }
}
