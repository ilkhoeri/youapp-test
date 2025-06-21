import db from '@/resource/db/user';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/resource/db/user/get-accounts';
import { pusherServer } from '@/resource/configs/pusher/pusher';

interface Params {
  chatId?: string;
}

export async function POST(req: Request, { params }: { params: Promise<Params> }) {
  try {
    const [currentUser, { chatId }] = await Promise.all([getCurrentUser(), params]);

    if (!currentUser?.id || !currentUser?.email) return new NextResponse('Unauthorized', { status: 401 });

    // Find existing chat
    const chat = await db.chat.findUnique({
      where: {
        id: chatId
      },
      include: {
        messages: {
          include: {
            seen: true
          }
        },
        users: true
      }
    });

    if (!chat) return new NextResponse('Invalid ID', { status: 400 });

    // Find last message
    const lastMessage = chat.messages[chat.messages.length - 1];

    if (!lastMessage) return NextResponse.json(chat);

    // Update seen of last message
    const updatedMessage = await db.message.update({
      where: {
        id: lastMessage.id
      },
      include: {
        sender: true,
        seen: true
      },
      data: {
        seen:
          lastMessage.senderId !== currentUser.id
            ? {
                connect: { id: currentUser.id }
              }
            : undefined
      }
    });

    // Update all connections with new seen
    await pusherServer.trigger(currentUser.email, 'chat:update', {
      id: chatId,
      messages: [updatedMessage]
    });

    // If user has already seen the message, no need to go further
    if (lastMessage.seenIds.indexOf(currentUser.id) !== -1) return NextResponse.json(chat);

    // Update last message seen
    await pusherServer.trigger(chatId!, 'message:update', updatedMessage);

    return new NextResponse('Success');
  } catch (error) {
    console.log(error, 'ERROR_MESSAGES_SEEN');
    return new NextResponse('Error', { status: 500 });
  }
}
