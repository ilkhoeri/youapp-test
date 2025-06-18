import db from '@/resource/db/user';
import { getCurrentUser } from '@/resource/db/user/get-accounts';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const session = await getCurrentUser();
  if (!session) return new NextResponse('Unauthorized', { status: 403 });

  await db.user.update({
    where: { id: session.id },
    data: { lastSeen: new Date() }
  });

  return new NextResponse('OK');
}
