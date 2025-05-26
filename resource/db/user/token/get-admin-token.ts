import user_db from '@/resource/db/user';

// lib/handlers/getAdminTokens.ts
export async function getAdminTokens(adminId: string) {
  return user_db.invitationToken.findMany({
    where: { createdById: adminId },
    orderBy: { createdAt: 'desc' }
  });
}
