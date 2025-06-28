import db from '@/resource/db/user';
import { getCurrentUser } from '@/resource/db/user/get-accounts';
import { pusherServer } from '@/resource/configs/pusher/pusher';
import { OptimisticMessage } from '@/resource/types/chats';
import { pickFromOtherUser } from '@/resource/types/user';
import { NextResponse } from 'next/server';

interface Params {
  chatId?: string;
}

export async function DELETE(req: Request, { params }: { params: Promise<Params> }) {
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

export async function GET(req: Request, { params }: { params: Promise<Params> }) {
  try {
    const [currentUser, { chatId }] = await Promise.all([getCurrentUser(), params]);

    // Simulasi delay
    // await new Promise(resolve => setTimeout(resolve, 1000));

    if (!currentUser?.id || !currentUser?.email || !chatId) return new NextResponse('Unauthorized', { status: 401 });

    const chatGroup: OptimisticMessage[] = await db.message.findMany({
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

    if (!chatGroup) return new NextResponse('Chat group not found', { status: 404 });

    return NextResponse.json(chatGroup);
  } catch (error) {
    console.error('Error fetching chat group:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<Params> }) {
  try {
    const [currentUser, { chatId }, body] = await Promise.all([getCurrentUser(), params, req.json()]);

    if (!currentUser?.id || !currentUser?.email || !body) return new NextResponse('Unauthorized', { status: 401 });

    const { avatarUrl, name } = body;

    // Find existing chat
    const chat = await db.chat.findUnique({
      where: { id: chatId }
    });

    if (!chat) return new NextResponse('Invalid ID', { status: 400 });

    // Update seen of last message
    const updatedMessage = await db.chat.update({
      where: { id: chatId },
      data: {
        avatarUrl: avatarUrl ?? undefined,
        name: name ?? undefined
      }
    });

    // Update all connections with new seen
    await pusherServer.trigger(currentUser.email, 'chat:update', {
      id: chatId,
      messages: [updatedMessage]
    });

    // Update last message seen
    await pusherServer.trigger(chatId!, 'message:update', updatedMessage);

    return new NextResponse('Success');
  } catch (error) {
    console.log(error, 'ERROR_MESSAGES_SEEN');
    return new NextResponse('Error', { status: 500 });
  }
}
