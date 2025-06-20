import db from '@/resource/db/user';
import { getCurrentUser } from '@/resource/db/user/get-accounts';
import { pusherServer } from '@/resource/configs/pusher/pusher';
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

export async function DELETE(req: Request, { params }: { params: Promise<Params> }) {
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
export type UpdatedSeenIds = {
  messageIds: string[];
  seenIds: string[];
};

export async function PATCH(req: Request, { params }: { params: Promise<Params> }) {
  try {
    const [currentUser, { messageId }, data] = await Promise.all([getCurrentUser(), params, req.json()]);
    const { messageIds, seenIds } = data as UpdatedSeenIds;

    if (!currentUser) return new NextResponse('Unauthorized', { status: 401 });

    if (!messageId) return new NextResponse('Unauthorized', { status: 402 });

    if (!messageIds || !seenIds) return new NextResponse('Invalid field', { status: 400 });

    const updatedMessage = await db.message.updateMany({
      where: {
        // id: { in: ['id1', 'id2', 'id3'] } // filter pesan yang akan diupdate (berdasarkan id)
        id: { in: messageIds }
      },
      data: {
        seenIds: {
          // set: ['userId1', 'userId2'] // array userId baru yang akan di-set
          set: seenIds
        }
      }
    });

    return NextResponse.json(updatedMessage);
  } catch (error) {
    console.log('[MSG_PATCH]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
