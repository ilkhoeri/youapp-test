import db from '@/resource/db/user';
import { getCurrentUser } from '@/resource/db/user/get-accounts';
import { pusherServer } from '@/resource/server/messages/pusher';
import { NextResponse } from 'next/server';

interface Params {
  messageId?: string;
}

export async function GET(req: Request, { params }: { params: Promise<Params> }) {
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
    return new NextResponse('Internal server error', { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<Params> }) {
  try {
    const [currentUser, { messageId }] = await Promise.all([getCurrentUser(), params]);

    if (!currentUser) return new NextResponse('Unauthorized', { status: 400 });

    const existingMessage = await db.message.findUnique({
      where: {
        id: messageId
      },
      include: {
        sender: true
      }
    });

    if (!existingMessage) {
      return new NextResponse('Invalid ID', { status: 400 });
    }

    const deletedMessage = await db.message.deleteMany({
      where: {
        id: messageId,
        senderId: currentUser.id
      }
    });

    if (existingMessage.sender.email) {
      pusherServer.trigger(existingMessage.sender.email, 'message:remove', existingMessage);
    }

    return NextResponse.json(deletedMessage);
  } catch (error) {
    return NextResponse.json(null);
  }
}
