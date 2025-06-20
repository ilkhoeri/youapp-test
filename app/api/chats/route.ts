import db from '@/resource/db/user';
import { NextResponse } from 'next/server';
import { pusherServer } from '@/resource/configs/pusher/pusher';
import { getCurrentUser } from '@/resource/db/user/get-accounts';
import { CreateChatTypes } from '@/resource/schemas/chat';
import { AllChatProps, pickFromOtherUser } from '@/resource/types/user';

const getResponse = (body: BodyInit, status: number) => new NextResponse(body, { status });

type ID = { id: string };

type ConnectProps = Omit<CreateChatTypes, 'type'> & { currentUser: ID };

function getConnect(type: CreateChatTypes['type'], props: ConnectProps) {
  const { currentUser, userId, members, name } = props;
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
    name: type === 'GROUP' ? name : undefined,
    users: { connect: connectMap[type] }
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
      include: { users: true }
    });

    /** Update all connections with new chat */
    newChat.users.map(user => {
      if (user.email) pusherServer.trigger(user.email, 'chat:new', newChat);
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
    return getResponse('Internal Error', 500);
  }
}
