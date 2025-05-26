'use server';

import * as z from 'zod';
import { ObjectId } from 'bson';
import { auth } from '@/auth/auth';
import user_db from '@/resource/db/user';
import { LinkSchema } from '@/resource/schemas/shared';
import { currentUser } from '@/resource/db/user/get-accounts';

type HandlerModel = 'create' | 'update' | 'delete';

export async function handlerLinkUser(model: HandlerModel, id: string | null | undefined, values: Partial<z.infer<typeof LinkSchema>>) {
  if (!id) return { error: 'Required ID' };

  if (!ObjectId.isValid(id)) return { error: 'ID tidak valid!' };

  const validatedFields = LinkSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Field tidak valid!', details: JSON.stringify(validatedFields.error.format()) };
  }

  const fields = validatedFields.data;

  const successByModel = {
    create: `Tautan ${fields.name ?? 'Tanpa Nama'} berhasil ditambahkan`,
    update: `Tautan ${fields.name ?? 'Tanpa Nama'} berhasil diperbarui`,
    delete: `Tautan ${fields.name ?? 'Tanpa Nama'} berhasil dihapus`
  };

  try {
    const session = await user_db.user.findUnique({ where: { id: (await auth())?.user?.id } });
    if (!session) {
      return { error: 'Required session!' };
    }

    const existingUser = await user_db.user.findUnique({ where: { id } });
    if (!existingUser) {
      return { error: 'User tidak ditemukan!' };
    }

    if (model === 'create') {
      await user_db.link.create({
        data: { ...fields, name: fields.name ?? '', userId: id }
      });
    } else if (model === 'update') {
      if (!fields.id) return { error: 'Required Link ID!' };

      await user_db.link.update({
        where: { id: fields.id, userId: id },
        data: { name: fields.name ?? '', url: fields.url }
      });
    } else if (model === 'delete') {
      if (!fields.id) return { error: 'Required Link ID!' };

      await user_db.link.delete({
        where: { id: fields.id, userId: id }
      });
    }

    return { success: successByModel[model] };
  } catch (error) {
    console.error('Catch Error:', error);
    return { error: 'Error', details: String(error) };
  }
}
