import db from '@/resource/db/user';
import { NextResponse } from 'next/server';
import { pusherServer } from '@/resource/configs/pusher/pusher';
import { getCurrentUser } from '@/resource/db/user/get-accounts';
import { pickFromOtherUser } from '@/resource/types/user';

interface Params {
  chatId?: string;
}

export async function POST(req: Request, { params }: { params: Promise<Params> }) {
  try {
    const [currentUser, body, { chatId }] = await Promise.all([getCurrentUser(), req.json(), params]);

    const { body: message, mediaUrl } = body;

    if (!currentUser?.id || !currentUser?.email || !chatId) return new NextResponse('Unauthorized', { status: 401 });

    const newMessage = await db.message.create({
      include: {
        seen: { select: pickFromOtherUser },
        sender: { select: pickFromOtherUser }
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
        users: { select: pickFromOtherUser },
        messages: {
          include: {
            seen: { select: pickFromOtherUser }
          }
        }
      }
    });

    await pusherServer.trigger(chatId, 'messages:new', { ...newMessage, localId: body.localId });

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

export async function GET(req: Request, { params }: { params: Promise<Params> }) {
  try {
    const [currentUser, { chatId }] = await Promise.all([getCurrentUser(), params]);

    // Simulasi delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (!currentUser?.id || !currentUser?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const chat = await db.message.findMany({
      where: {
        chatId
      },
      orderBy: {
        chat: {
          lastMessageAt: 'desc'
        }
      },
      include: {
        sender: { select: pickFromOtherUser },
        seen: { select: pickFromOtherUser }
      }
    });

    if (!chat) {
      return NextResponse.json({ error: 'Chat group not found' }, { status: 404 });
    }

    return NextResponse.json(chat);
  } catch (error) {
    console.error('Error fetching chat group:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

/**
export type UpdatedSeenIds = {
  chatId?: string;
  messageIds?: string[] | undefined;
};

export async function PATCH(req: Request) {
  try {
    const [currentUser, body] = await Promise.all([getCurrentUser(), req.json()]);
    const { chatId, messageIds } = body as UpdatedSeenIds;

    if (!currentUser) return new NextResponse('Unauthorized', { status: 401 });

    if (!chatId) return new NextResponse('Unauthorized', { status: 402 });

    if (!messageIds) return new NextResponse('Invalid field', { status: 400 });

    const updatedMessages = await db.message.updateMany({
      where: {
        // id: { in: ['id1', 'id2', 'id3'] } // filter pesan yang akan diupdate (berdasarkan id)
        id: { in: messageIds ?? undefined },
        status: 'SEEN'
      },
      data: {
        seenIds: {
          // set: ['userId1', 'userId2'] // array userId baru yang akan di-set
          set: [currentUser.id]
        }
      }
    });

    const unseenMessages = await db.message.findMany({
      where: { id: { in: messageIds } },
      include: { seen: true }
    });

    // Trigger ke user sendiri (untuk list chat / sidebar update)
    unseenMessages.map(m => {
      m.seen.map(user => {
        pusherServer.trigger(user.email!, 'chat:update', {
          id: chatId,
          messages: unseenMessages
        });
      });
    });

    // Trigger ke channel chatId (untuk lawan bicara)
    await Promise.all(unseenMessages.map(m => pusherServer.trigger(chatId!, 'message:update', m)));

    return NextResponse.json(updatedMessages);
  } catch (error) {
    console.log('[MSG_PATCH]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
 */
