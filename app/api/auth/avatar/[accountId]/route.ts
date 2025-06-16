import user_db from '@/resource/db/user';
import { auth } from '@/auth/auth';
import { NextResponse } from 'next/server';

export async function PATCH(req: Request, { params }: { params: Promise<{ accountId: string }> }) {
  try {
    const [session, { accountId }, { image }] = await Promise.all([auth(), params, req.json()]);

    if (!session) return new NextResponse('UNAUTHENTICATED', { status: 403 });

    if (!accountId) return new NextResponse('UNAUTHORIZED', { status: 400 });

    const updateUser = await user_db.user.findUnique({ where: { id: accountId }, select: { refId: true } });

    if (!updateUser) return new NextResponse('UNAUTHORIZED_MEMBER', { status: 401 });

    const updateAvatar = await user_db.user.updateMany({
      where: { id: accountId },
      data: { image }
    });

    return NextResponse.json(updateAvatar);
  } catch (error) {
    console.error('[IMAGE_PATCH]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
