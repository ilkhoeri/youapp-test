import { Account } from '@/resource/types/user';
import user_db from './user';
import { strictRole } from '@/resource/const/role-status';

async function all() {
  try {
    return await user_db.link.findMany({
      include: { user: { select: { name: true } } }
    });
  } catch (error) {
    return null;
  }
}
const assignUser = {
  bySuperUser: async (user: Account) => {
    try {
      if (!user || !strictRole(user)) return null;
      return await user_db?.link?.findFirst({ where: { userId: user?.id } });
    } catch {
      return null;
    }
  }
};
export const getLinks = Object.assign(all, assignUser);
