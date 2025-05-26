import user_db from '@/resource/db/user';
import { NextResponse } from 'next/server';
import { currentUser } from '@/resource/db/user/get-accounts';
import { strictRole } from '@/resource/const/role-status';

export async function GET(req: Request, { params }: { params: Promise<{ userId: string; addressId: string }> }) {
  try {
    const [session, { userId, addressId }] = await Promise.all([currentUser(), params]);

    if (!session || !userId || !addressId) return new NextResponse('UNAUTHORIZED', { status: 400 });

    const address = await user_db.address.findUnique({ where: { id: addressId } });

    return NextResponse.json(address);
  } catch (error) {
    console.log('[ADDRESS_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ userId: string; addressId: string }> }) {
  try {
    const [session, { userId, addressId }] = await Promise.all([currentUser(), params]);

    if (!session) return new NextResponse('UNAUTHORIZED', { status: 403 });

    if (!userId || !addressId) return new NextResponse('UNAUTHORIZED', { status: 400 });

    const address = await user_db.address.delete({ where: { id: addressId } });

    return NextResponse.json(address);
  } catch (error) {
    console.log('[ADDRESS_DELETE]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ userId: string; addressId: string }> }) {
  try {
    const [session, { userId, addressId }, { country, state, postalcode, city, regency, district, subdistrict, village }] = await Promise.all([currentUser(), params, req.json()]);

    if (!session) return new NextResponse('UNAUTHORIZED', { status: 403 });

    if (!userId || !addressId) return new NextResponse('UNAUTHORIZED', { status: 400 });

    const address = await user_db.address.update({
      where: {
        id: addressId,
        userId: strictRole(session) ? undefined : session.refId
      },
      data: { country, state, postalcode, city, regency, district, subdistrict, village }
    });

    return NextResponse.json(address);
  } catch (error) {
    console.log('[ADDRESS_PATCH]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
