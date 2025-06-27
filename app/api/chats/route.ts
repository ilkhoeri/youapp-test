import db from '@/resource/db/user';
import { NextResponse } from 'next/server';
import { pusherServer } from '@/resource/configs/pusher/pusher';
import { getCurrentUser } from '@/resource/db/user/get-accounts';
import { CreateChatTypes } from '@/resource/schemas/chat';
import { OptimisticChat, pickFromOtherUser } from '@/resource/types/chats';

const getResponse = (body: BodyInit, status: number) => new NextResponse(body, { status });

type ID = { id: string };

type ConnectProps = Omit<CreateChatTypes, 'type'> & { currentUser: ID };

function getConnect(type: CreateChatTypes['type'], props: ConnectProps) {
  const { currentUser, userId, members, name } = props;
  const isGroupValue = <T>(v: T) => (type === 'GROUP' ? v : undefined);
  const self = { id: currentUser.id };
  const memberIds = members.map(m => ({ id: m.value! }));
  const membersMap = [self, ...memberIds];
  const connectMap: Record<CreateChatTypes['type'], ID[]> = {
    PRIVATE: userId ? [self, { id: userId }] : membersMap,
    GROUP: membersMap,
    CHANNEL: [self],
    BOT: [self]
  };

  return {
    type,
    name: isGroupValue(name),
    users: { connect: connectMap[type] },
    admins: isGroupValue({ set: [currentUser.id] })
  };
}

export async function POST(req: Request) {
  try {
    const [currentUser, data] = await Promise.all([getCurrentUser(), req.json()]);

    const { userId, type, members, name } = data as CreateChatTypes;

    if (!currentUser || !currentUser?.email) return getResponse('Unauthorized', 401);

    if (type === 'GROUP' && (!members || members.length < 1 || !name)) return getResponse('Invalid Group Fields', 402);

    if (type === 'PRIVATE' && !userId && (!members || members.length !== 2)) return getResponse('Invalid Private Fields', 402);

    const newChat = await db.chat.create({
      data: getConnect(type, { currentUser, userId, members, name }),
      include: { users: { select: pickFromOtherUser } }
    });

    // Update all connections with new chat
    newChat.users.map(user => {
      if (!user.email) return;
      pusherServer.trigger(user.email!, 'chat:new', newChat);
    });

    return NextResponse.json(newChat);
  } catch (error) {
    return getResponse('Internal Error', 500);
  }
}

export async function GET(req: Request) {
  try {
    const currentUser = await getCurrentUser();

    // Simulasi delay
    // await new Promise(resolve => setTimeout(resolve, 1000));

    if (!currentUser?.id || !currentUser?.email) return getResponse('Unauthorized', 401);

    const allChat: Array<OptimisticChat> = await db.chat.findMany({
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
    return getResponse('Internal Error', 500);
  }
}

/**
export async function POST(request: Request) {
  try {
    const [currentUser, { userId, type, members, name }] = await Promise.all([getCurrentUser(), request.json()]);

    if (!currentUser?.id || !currentUser?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const isGroup = type === 'GROUP';

    if (isGroup && (!members || members.length < 1 || !name)) {
      return new NextResponse('Invalid data', { status: 402 });
    }

    if (isGroup) {
      const newChat = await db.chat.create({
        data: {
          name,
          type: 'GROUP',
          users: {
            connect: [
              ...members.map((member: { value: string }) => ({
                id: member.value
              })),
              { id: currentUser.id }
            ]
          },
          admins: { set: [currentUser.id] }
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
          connect: [{ id: currentUser.id }, { id: userId }]
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
 */
