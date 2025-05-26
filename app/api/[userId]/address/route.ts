import user_db from '@/resource/db/user';
import { NextResponse } from 'next/server';
import { currentUser } from '@/resource/db/user/get-accounts';

export async function POST(req: Request, { params }: { params: Promise<{ protectedId: string; userId: string }> }) {
  try {
    const [session, { protectedId, userId }, { country, state, postalcode, city, regency, district, subdistrict, village }] = await Promise.all([currentUser(), params, req.json()]);

    if (!session) return new NextResponse('Unauthorized', { status: 401 });

    if (!protectedId || !userId) return new NextResponse('Invalid parameters', { status: 400 });

    const address = await user_db.address.create({
      data: { country, state, postalcode, city, regency, district, subdistrict, village }
    });

    return NextResponse.json(address);
  } catch (error) {
    console.log('[ADDRESS_POST]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ protectedId: string; userId: string }> }) {
  try {
    const [session, { protectedId, userId }] = await Promise.all([currentUser(), params]);

    if (!session || !protectedId || !userId) return new NextResponse('UNAUTHORIZED', { status: 400 });

    if (!protectedId) return new NextResponse('Status 400', { status: 400 });

    const addresses = await user_db.address.findMany({ where: { userId: userId } });

    return NextResponse.json(addresses);
  } catch (error) {
    console.log('[ADDRESS_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
