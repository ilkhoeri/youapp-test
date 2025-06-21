import db from '@/resource/db/user';
import { getCurrentUser } from '@/resource/db/user/get-accounts';
import { pusherServer } from '@/resource/configs/pusher/pusher';
import { NextResponse } from 'next/server';
import { ChatValues } from '@/resource/schemas/chat';

export async function POST(req: Request) {
  try {
    const [currentUser, body] = await Promise.all([getCurrentUser(), req.json()]);

    const { message, mediaUrl, chatId } = body as ChatValues;

    if (!currentUser?.id || !currentUser?.email) return new NextResponse('Unauthorized', { status: 401 });

    const newMessage = await db.message.create({
      include: {
        seen: true,
        sender: true
      },
      data: {
        body: message && message?.replace(/\u200B/g, '')?.trim(),
        mediaUrl: mediaUrl,
        chat: { connect: { id: chatId } },
        sender: {
          connect: { id: currentUser.id }
        },
        seen: {
          // connect: { id: currentUser.id }
        }
      }
    });

    const updatedChat = await db.chat.update({
      where: { id: chatId },
      data: {
        lastMessageAt: new Date(),
        messages: {
          connect: { id: newMessage.id }
        }
      },
      include: {
        users: true,
        messages: {
          include: {
            seen: true
          }
        }
      }
    });

    await pusherServer.trigger(chatId, 'messages:new', newMessage);

    const lastMessage = updatedChat.messages[updatedChat.messages.length - 1];

    updatedChat.users.map(user => {
      pusherServer.trigger(user.email!, 'chat:update', {
        id: chatId,
        messages: [lastMessage]
      });
    });

    return NextResponse.json(newMessage);
  } catch (error) {
    console.log(error, 'ERROR_MESSAGES');
    return new NextResponse('Error', { status: 500 });
  }
}
