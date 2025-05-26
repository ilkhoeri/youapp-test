import user_db from '@/resource/db/user';
import { USER } from '@/resource/types/user';
import { cookiesValues } from '@/resource/client/contexts/cookies-server';

export async function getLinks(search: string = '', tab: string = '0', options: { takePerPage?: number } = {}) {
  try {
    const { takePerPage: setTakePerPage } = options;
    const takePerPage = setTakePerPage ?? (await cookiesValues()).tableTakePerPage;

    const data: USER.LINK[] = await user_db.link?.findMany({
      where: { name: { contains: search, mode: 'insensitive' } },
      orderBy: { createdAt: 'desc' },
      take: takePerPage,
      skip: Number(tab)
    });

    const total = await user_db.link?.count({
      where: { url: { contains: search, mode: 'insensitive' } }
    });

    const tabValue = data.length >= takePerPage ? Number(tab) + takePerPage : null;

    return { links: data, total, tabValue };
  } catch (error) {
    return { links: [], total: 0, tabValue: 0 };
  }
}

export async function getLinkById(id: string) {
  try {
    return await user_db.link.findUnique({ where: { id } });
  } catch (error) {
    return null;
  }
}
