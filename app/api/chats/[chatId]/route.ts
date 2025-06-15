import db from '@/resource/db/user';
import { getCurrentUser } from '@/resource/db/user/get-accounts';
import { pusherServer } from '@/resource/server/messages/pusher';
import { Message, pickFromOtherUser } from '@/resource/types/user';
import { NextRequest, NextResponse } from 'next/server';

interface Params {
  chatId?: string;
}

export async function DELETE(request: Request, { params }: { params: Promise<Params> }) {
  try {
    const [currentUser, { chatId }] = await Promise.all([getCurrentUser(), params]);

    if (!currentUser?.id) return NextResponse.json(null);

    const existingChat = await db.chat.findUnique({
      where: {
        id: chatId
      },
      include: {
        users: true
      }
    });

    if (!existingChat) {
      return new NextResponse('Invalid ID', { status: 400 });
    }

    const deletedChat = await db.chat.deleteMany({
      where: {
        id: chatId,
        userIds: {
          hasSome: [currentUser.id]
        }
      }
    });

    existingChat.users.forEach(user => {
      if (user.email) {
        pusherServer.trigger(user.email, 'chat:remove', existingChat);
      }
    });

    return NextResponse.json(deletedChat);
  } catch (error) {
    return NextResponse.json(null);
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ chatId: string }> }) {
  try {
    const [currentUser, { chatId }] = await Promise.all([getCurrentUser(), params]);

    // Simulasi delay
    // await new Promise(resolve => setTimeout(resolve, 1000));

    if (!currentUser?.id || !currentUser?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    if (!chatId) return [];

    const chatGroup: Array<Message> = await db.message.findMany({
      where: {
        chatId: chatId
      },
      include: {
        sender: { select: pickFromOtherUser },
        seen: { select: pickFromOtherUser },
        reactions: {
          include: {
            user: { select: pickFromOtherUser }
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    // const chatGroup = await db.chat.findUnique({
    //   where: { id: chatId },
    //   include: {
    //     messages: {
    //       orderBy: { createdAt: 'asc' },
    //       include: { sender: true }
    //     }
    //   }
    // });

    if (!chatGroup) return NextResponse.json({ error: 'Chat group not found' }, { status: 404 });

    return NextResponse.json(chatGroup);
  } catch (error) {
    console.error('Error fetching chat group:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
