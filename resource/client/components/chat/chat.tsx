'use client';
import * as React from 'react';
import { useParams } from 'next/navigation';
import { Account, AllChatProps } from '@/resource/types/user';
import { useSession } from 'next-auth/react';

interface UseChat {
  isOpen: boolean;
  chatId: string;
}

export function useChat(): UseChat {
  const params = useParams();

  const chatId = React.useMemo(() => {
    if (!params?.chatId) {
      return '';
    }

    return params.chatId as string;
  }, [params?.chatId]);

  const isOpen = React.useMemo(() => !!chatId, [chatId]);

  return React.useMemo<UseChat>(
    () => ({
      isOpen,
      chatId
    }),
    [isOpen, chatId]
  );
}

export function useOtherUser(chats: AllChatProps | { users: Account[] }) {
  const session = useSession();

  const otherUser = React.useMemo(() => {
    const currentUserEmail = session.data?.user?.email;

    const otherUser = chats.users.filter(user => user?.email !== currentUserEmail);

    return otherUser[0];
  }, [session.data?.user?.email, chats.users]);

  return otherUser;
}
