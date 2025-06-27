import db from '@/resource/db/user';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/resource/db/user/get-accounts';
import { pusherServer } from '@/resource/configs/pusher/pusher';
import { MinimalAccount } from '@/resource/types/user';
import { pickFromOtherUser } from '@/resource/types/chats';

interface Params {
  chatId?: string;
}

/**
export async function POST(req: Request, { params }: { params: Promise<Params> }) {
  try {
    const [currentUser, { chatId }] = await Promise.all([getCurrentUser(), params]);

    if (!currentUser?.id || !currentUser?.email) return new NextResponse('Unauthorized', { status: 401 });

    // Find existing chat
    const chat = await db.chat.findUnique({
      where: {
        id: chatId
      }
    });

    if (!chat) return new NextResponse('Invalid ID', { status: 400 });

    const { messageId } = await req.json();

    // Find message
    // const findMessage = chat.messages.find(m => m.id === messageId);
    const findMessage = await db.message.findUnique({
      where: { id: messageId },
      include: {
        seen: { select: pickFromOtherUser }
      }
    });

    if (!findMessage) return NextResponse.json(chat);

    // Update seen of last message
    const updatedMessage = await db.message.update({
      where: {
        id: messageId
      },
      include: {
        seen: { select: pickFromOtherUser },
        sender: { select: pickFromOtherUser },
        chat: {
          include: {
            users: { select: pickFromOtherUser }
          }
        }
      },
      data: {
        seen: {
          connect: { id: currentUser.id }
        }
      }
    });

    const resUpdateMessage = {
      id: updatedMessage.id,
      chatId: updatedMessage.chatId,
      status: updatedMessage.status,
      sender: {
        id: updatedMessage.sender.id,
        email: updatedMessage.sender.email,
        username: updatedMessage.sender.username,
        createdAt: updatedMessage.sender.createdAt,
        image: updatedMessage.sender.image
      } as MinimalAccount,
      senderId: updatedMessage.senderId,
      // body: updatedMessage.body,
      // mediaUrl: updatedMessage.mediaUrl,
      seenIds: Array.from(new Set([...(updatedMessage.seenIds ?? [])])),
      seen: Array.from(new Set([...(updatedMessage.seen ?? [])])),
      createdAt: updatedMessage.createdAt
      // chat: {
      //   id: updatedMessage.chat.id,
      //   userIds: updatedMessage.chat.userIds,
      //   // avatarUrl: updatedMessage.chat.avatarUrl,
      //   // name: updatedMessage.chat.name,
      //   // users: updatedMessage.chat.users,,
      //   type: updatedMessage.chat.type
      // }
    };

    await pusherServer.trigger(currentUser.email, 'chat:update', {
      id: chatId,
      messages: [resUpdateMessage]
    });

    if (findMessage.seenIds.indexOf(currentUser.id) !== -1) return NextResponse.json(chat);

    await pusherServer.trigger(chatId!, 'message:update', resUpdateMessage);

    const isPrevent = resUpdateMessage.senderId === currentUser?.id || resUpdateMessage.seenIds?.includes(currentUser?.id);

    if (isPrevent) return NextResponse.json(chat);
    return new NextResponse('Success');
  } catch (error) {
    console.log(error, 'ERROR_MESSAGES_SEEN');
    return new NextResponse('Error', { status: 500 });
  }
}
  */

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
            seen: { select: pickFromOtherUser }
          }
        },
        users: { select: pickFromOtherUser }
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
        sender: { select: pickFromOtherUser },
        seen: { select: pickFromOtherUser }
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

    const resUpdateMessage = {
      id: updatedMessage.id,
      chatId: updatedMessage.chatId,
      status: updatedMessage.status,
      sender: updatedMessage.sender as MinimalAccount,
      senderId: updatedMessage.senderId,
      // body: updatedMessage.body,
      // mediaUrl: updatedMessage.mediaUrl,
      seenIds: Array.from(new Set([...(updatedMessage.seenIds ?? [])])),
      seen: Array.from(new Set([...(updatedMessage.seen ?? [])])),
      createdAt: updatedMessage.createdAt
    };

    const isPrevent = updatedMessage.senderId === currentUser?.id || updatedMessage.seenIds?.includes(currentUser?.id);

    // Update all connections with new seen
    await pusherServer.trigger(currentUser.email, 'chat:update', {
      id: chatId,
      // messages: [updatedMessage]
      messages: [updatedMessage]
    });

    if (isPrevent) return NextResponse.json(chat);

    // If user has already seen the message, no need to go further
    if (lastMessage.seenIds.indexOf(currentUser.id) !== -1) return NextResponse.json(chat);

    // Update last message seen
    await pusherServer.trigger(chatId!, 'message:update', updatedMessage);

    return new NextResponse('Success');
  } catch (error) {
    console.log('ERROR_MESSAGES_SEEN:', error);
    return new NextResponse('Error', { status: 500 });
  }
}
