'use server';

import user_db from '@/resource/db/user';
import { ObjectId } from 'bson';
import { UserRole } from '@prisma/client';
import { GenerateInvitationTokenValues } from '@/resource/schemas/user/token/invitation-token';
import { strictRole } from '@/resource/const/role-status';

interface GenerateInvitationTokenParams {
  adminId: string; // ID user yang membuat token
  assignedRole: UserRole;
  expiresInDays?: number; // default 24 jam
}

/**
**Alur Kerja Sistem Token*

`Pembuatan Token oleh SuperAdmin/Admin`
- User dengan role ADMIN atau SUPERADMIN dapat membuat token
- Token akan menyimpan role yang akan diberikan kepada user baru
- Token memiliki masa berlaku (expires)

`Pendaftaran User Baru:`
- User baru harus memasukkan token yang valid
- Sistem memverifikasi token (belum digunakan dan belum kedaluwarsa)
- Jika valid, user baru dibuat dengan role sesuai yang ditentukan dalam token
- Token ditandai sebagai sudah digunakan

`Implementasi ini memungkinkan untuk:`
1. Membuat token dengan role tertentu (hanya oleh ADMIN/SUPERADMIN)
2. Mendistribusikan token kepada calon user
3. Calon user mendaftar dengan token tersebut dan mendapatkan role yang telah ditentukan
4. Pendekatan ini mirip dengan yang digunakan dalam sistem autentikasi passwordless yang dijelaskan dalam Backend with TypeScript, 5. PostgreSQL & Prisma: Authentication & Authz, meskipun dengan tujuan yang berbeda.
*/
export async function generateInvitationToken(values: GenerateInvitationTokenValues) {
  const { adminId, assignedRole, expiresInDays = 1, maxUsageCount = 1 } = values;

  try {
    // Validate admin privileges
    const creator = await user_db.user.findUnique({
      where: { id: adminId },
      select: { role: true }
    });

    if (!creator) return { error: '403: Permission denied.' };

    if (!strictRole(creator, ['DEVELOPER', 'SUPERADMIN', 'ADMIN'])) {
      return { error: 'UNAUTHORIZED: Hanya SUPERADMIN atau ADMIN yang dapat membuat token.' };
    }

    // const token = crypto.randomUUID();
    const token = new ObjectId().toHexString();
    const days = expiresInDays * 24;
    const expires = new Date(Date.now() + days * 60 * 60 * 1000);

    const invitationToken = await user_db.invitationToken.create({
      data: {
        token,
        expires,
        createdById: adminId,
        assignedRole: assignedRole as UserRole,
        maxUsageCount,
        usageCount: 0
      }
    });

    return {
      token: invitationToken.token,
      expires: invitationToken.expires,
      maxUsageCount: invitationToken.maxUsageCount,
      success: 'Token berhasil dibuat'
    };
  } catch (error) {
    console.error('[GENERATE TOKEN ERROR]:', error);
    return { error: 'Error' };
  }
}
