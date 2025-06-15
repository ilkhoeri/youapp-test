import db from '@/resource/db/user';
import { getCurrentUser } from '@/resource/db/user/get-accounts';
import { Message, pickFromOtherUser } from '@/resource/types/user';

export async function getChats() {
  const currentUser = await getCurrentUser();

  if (!currentUser?.id) return [];

  try {
    return await db.chat.findMany({
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
  } catch (error: any) {
    return [];
  }
}

export async function getChatById(chatId: string | null | undefined) {
  try {
    const currentUser = await getCurrentUser();

    // Simulasi delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (!currentUser?.email || !chatId) return null;

    const chat = await db.chat.findUnique({
      where: {
        id: chatId
      },
      include: {
        users: true
      }
    });

    return chat;
  } catch (error: any) {
    console.log(error, 'SERVER_ERROR');
    return null;
  }
}

export async function getMessages(chatId: string | null | undefined) {
  try {
    if (!chatId) return [];

    const messages: Array<Message> = await db.message.findMany({
      where: {
        chatId: chatId
      },
      include: {
        sender: { select: pickFromOtherUser },
        seen: { select: pickFromOtherUser },
        reactions: {
          include: {
            user: { select: pickFromOtherUser }
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return messages;
  } catch (error: any) {
    return [];
  }
}
