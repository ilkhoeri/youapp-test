import db from '@/resource/db/user';
import { NextRequest, NextResponse } from 'next/server';
import { pusherServer } from '@/resource/server/messages/pusher';
import { getCurrentUser } from '@/resource/db/user/get-accounts';
import { ChatGroupValues } from '@/resource/schemas/chat';
import { AllChatProps, pickFromOtherUser } from '@/resource/types/user';

export async function POST(req: Request) {
  try {
    const [currentUser, data] = await Promise.all([getCurrentUser(), req.json()]);

    const { userId, type, members, name } = data as ChatGroupValues;

    if (!currentUser?.id || !currentUser?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    if (type === 'GROUP' && (!members || members.length < 1 || !name)) {
      return new NextResponse('Invalid data', { status: 402 });
    }

    if (type === 'GROUP') {
      const newChat = await db.chat.create({
        data: {
          name,
          type,
          users: {
            connect: [
              ...members.map(member => ({
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

export async function GET(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    // Simulasi delay
    // await new Promise(resolve => setTimeout(resolve, 1000));

    if (!currentUser?.id) return [];

    if (!currentUser?.id || !currentUser?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const allChat: Array<AllChatProps> = await db.chat.findMany({
      orderBy: {
        lastMessageAt: 'desc'
      },
      where: {
        userIds: {
          has: currentUser.id
        }
      },
      include: {
        users: { select: pickFromOtherUser },
        messages: {
          include: {
            sender: { select: pickFromOtherUser },
            seen: { select: pickFromOtherUser }
          }
        }
      }
    });

    if (!allChat) return NextResponse.json({ error: 'Chat group not found' }, { status: 404 });

    return NextResponse.json(allChat);
  } catch (error) {
    console.error('Error fetching chat group:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
