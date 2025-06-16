import user_db from '@/resource/db/user';
import { auth } from '@/auth/auth';
import { NextResponse } from 'next/server';

export async function DELETE(req: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const [session, { userId }] = await Promise.all([auth(), params]);

    if (!session) return new NextResponse('UNAUTHENTICATED', { status: 403 });

    if (!userId) return new NextResponse('UNAUTHORIZED', { status: 400 });

    const updateUser = await user_db.user.findUnique({ where: { id: userId }, select: { refId: true } });

    if (!updateUser) return new NextResponse('UNAUTHORIZED_MEMBER', { status: 401 });

    const deleteAvatar = await user_db.user.deleteMany({
      where: { id: userId }
    });

    return NextResponse.json(deleteAvatar);
  } catch (error) {
    console.error('[IMAGE_DELETE]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
