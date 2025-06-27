import db from '@/resource/db/user';
import { getCurrentUser } from '@/resource/db/user/get-accounts';
import { pusherServer } from '@/resource/configs/pusher/pusher';
import { NextResponse } from 'next/server';
import { Message } from '@prisma/client';
import { pickFromOtherUser } from '@/resource/types/chats';

interface Params {
  chatId: string;
  messageId: string;
}

export const payloadMessage = {
  id: true,
  chatId: true,
  status: true,
  senderId: true,
  body: true,
  mediaUrl: true,
  seenIds: true,
  createdAt: true
};

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
    const [currentUser, { chatId, messageId }] = await Promise.all([getCurrentUser(), params]);

    if (!currentUser) return new NextResponse('Unauthorized', { status: 400 });

    const existingMessage = await db.message.findUnique({
      where: { id: messageId, chatId },
      include: { sender: { select: pickFromOtherUser } }
    });

    if (!existingMessage) return new NextResponse('Invalid ID', { status: 401 });

    const deletedMessage = await db.message.delete({
      where: {
        chatId,
        id: messageId,
        senderId: currentUser.id
      }
      // include: {
      //   seen: { select: pickFromOtherUser },
      //   chat: {
      //     include: { users: true }
      //   }
      // }
    });

    const remainingMessages = await db.chat.findUnique({
      where: {
        id: chatId,
        userIds: {
          hasSome: [currentUser.id]
        }
      },
      select: {
        messages: {
          select: payloadMessage
        }
      }
    });

    const lastMessage = remainingMessages?.messages?.at(-1); // atau remainingMessages?.messages[remainingMessages.length - 1]

    await pusherServer.trigger(currentUser.email, 'chat:update', {
      id: chatId,
      messages: lastMessage ? [lastMessage] : []
    });

    // await pusherServer.trigger(`chat:${deletedMessage.chatId}`, 'message:remove', { id: deletedMessage.id });

    await pusherServer.trigger(deletedMessage.chatId, 'message:remove', { id: deletedMessage.id });

    return new NextResponse(`Deleted [${deletedMessage.id}] Successfully!`);
  } catch (error) {
    return NextResponse.json(null);
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<Params> }) {
  try {
    const [currentUser, body, { chatId, messageId }] = await Promise.all([getCurrentUser(), req.json(), params]);

    if (!currentUser) return new NextResponse('Unauthorized', { status: 401 });

    if (!messageId) return new NextResponse('Unauthorized', { status: 402 });

    // type UpdateMessage = {
    //   id: string;
    //   chatId: string;
    //   status: 'SENDING' | 'SENT' | 'FAILED' | 'SEEN';
    //   senderId: string;
    //   body: string | null;
    //   mediaUrl: string | null;
    //   seenIds: string[];
    //   createdAt: Date;
    // };

    const updatedMessage = await db.message.update({
      where: { id: messageId, chatId },
      data: {
        ...body,
        seenIds: { set: [currentUser.id] }
      },
      select: payloadMessage
      // include: {
      //   seen: { select: pickFromOtherUser },
      //   sender: { select: pickFromOtherUser }
      //   // chat: {
      //   //   include: {
      //   //     users: { select: pickFromOtherUser }
      //   //   }
      //   // }
      // }
    });

    await db.user.update({
      where: { id: currentUser.id },
      data: { lastSeen: new Date() }
    });

    // const resUpdateMessage = {
    //   id: updatedMessage.id,
    //   chatId: updatedMessage.chatId,
    //   status: updatedMessage.status,
    //   senderId: updatedMessage.senderId,
    //   // sender: updatedMessage.sender as MinimalAccount,
    //   body: updatedMessage.body,
    //   mediaUrl: updatedMessage.mediaUrl,
    //   seenIds: Array.from(new Set([...(updatedMessage.seenIds ?? [])])),
    //   // seen: Array.from(new Set([...(updatedMessage.seen ?? [])])),
    //   createdAt: updatedMessage.createdAt
    // };

    await pusherServer.trigger(currentUser.email, 'chat:update', {
      id: updatedMessage.chatId,
      messages: [updatedMessage]
    });

    await pusherServer.trigger(updatedMessage.chatId!, 'message:update', updatedMessage);

    // const payload = JSON.stringify({ id: chatId, messages: [resUpdateMessage] });
    // console.log('Payload size:', Buffer.byteLength(payload, 'utf-8'), 'bytes');

    // If user has already seen the message, no need to go further
    if (updatedMessage.seenIds.indexOf(currentUser.id) !== -1) return new NextResponse('Rest');

    return new NextResponse('Success');
  } catch (error) {
    console.log('[MSG_PATCH]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
