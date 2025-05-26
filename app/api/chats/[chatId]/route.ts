import db from '@/resource/db/user';
import { getCurrentUser } from '@/resource/db/user/get-accounts';
import { pusherServer } from '@/resource/server/messages/pusher';
import { NextResponse } from 'next/server';

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
