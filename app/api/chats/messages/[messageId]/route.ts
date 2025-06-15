import db from '@/resource/db/user';
import { getCurrentUser } from '@/resource/db/user/get-accounts';
import { pusherServer } from '@/resource/server/messages/pusher';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: Promise<{ messageId: string }> }) {
  try {
    const [currentUser, { messageId }] = await Promise.all([getCurrentUser(), params]);

    // Simulasi delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (!currentUser?.id || !currentUser?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const chatGroup = await db.message.findUnique({
      where: { id: messageId },
      include: { sender: true }
    });

    if (!chatGroup) {
      return NextResponse.json({ error: 'Chat group not found' }, { status: 404 });
    }

    return NextResponse.json(chatGroup);
  } catch (error) {
    console.error('Error fetching chat group:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
