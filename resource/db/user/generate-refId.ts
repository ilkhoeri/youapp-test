import db from '@/resource/db/user';
import { UserRole } from '@prisma/client';
import { ObjectId } from 'bson';

async function countUserByStatus(padStart: number = 4) {
  try {
    const userCount = await db.user.count();
    const entryNumber = String(userCount + 1).padStart(padStart, '0');
    return { count: userCount, entry: entryNumber };
  } catch (error) {
    console.error('[ERROR]:', error);
    return { count: 0, entry: 'Error' };
  }
}

export async function generateRefId(role: UserRole | undefined) {
  try {
    const objectId = new ObjectId().toHexString();
    let refId: string = objectId;
    return refId;
  } catch (error) {
    console.error('[GENERATE REFID ERROR]:', error);
    return 'Error';
  }
}
