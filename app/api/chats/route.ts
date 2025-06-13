import db from '@/resource/db/user';
import { NextResponse } from 'next/server';
import { pusherServer } from '@/resource/server/messages/pusher';
import { getCurrentUser } from '@/resource/db/user/get-accounts';

export async function POST(request: Request) {
  try {
    const [currentUser, { userId, isGroup, members, name }] = await Promise.all([getCurrentUser(), request.json()]);

    if (!currentUser?.id || !currentUser?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    if (isGroup && (!members || members.length < 1 || !name)) {
      return new NextResponse('Invalid data', { status: 402 });
    }

    if (isGroup) {
      const newChat = await db.chat.create({
        data: {
          name,
          isGroup,
          users: {
            connect: [
              ...members.map((member: { value: string }) => ({
                id: member.value
              })),
              {
                id: currentUser.id
              }
            ]
          }
        },
        include: {
          users: true
        }
      });

      // Update all connections with new chat
      newChat.users.forEach(user => {
        if (user.email) {
          pusherServer.trigger(user.email, 'chat:new', newChat);
        }
      });

      return NextResponse.json(newChat);
    }

    const existingChats = await db.chat.findMany({
      where: {
        OR: [
          {
            userIds: {
              equals: [currentUser.id, userId]
            }
          },
          {
            userIds: {
              equals: [userId, currentUser.id]
            }
          }
        ]
      }
    });

    const singleChat = existingChats[0];

    if (singleChat) {
      return NextResponse.json(singleChat);
    }

    const newChat = await db.chat.create({
      data: {
        users: {
          connect: [
            {
              id: currentUser.id
            },
            {
              id: userId
            }
          ]
        }
      },
      include: {
        users: true
      }
    });

    // Update all connections with new chat
    newChat.users.map(user => {
      if (user.email) {
        pusherServer.trigger(user.email, 'chat:new', newChat);
      }
    });

    return NextResponse.json(newChat);
  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 });
  }
}
