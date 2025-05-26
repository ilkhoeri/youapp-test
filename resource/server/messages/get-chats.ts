import db from '@/resource/db/user';
import { getCurrentUser } from '@/resource/db/user/get-accounts';

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
        users: true,
        messages: {
          include: {
            sender: true,
            seen: true
          }
        }
      }
    });
  } catch (error: any) {
    return [];
  }
}

export async function getChatById(chatId: string) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser?.email) return null;

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

export async function getMessages(chatId: string) {
  try {
    const messages = await db.message.findMany({
      where: {
        chatId: chatId
      },
      include: {
        sender: true,
        seen: true
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
