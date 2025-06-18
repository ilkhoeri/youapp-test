'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../contexts/app-provider';
import { AllChatProps } from '@/resource/types/user';
import { useActiveChat, useOtherUser } from './chat-context';

export function useSwitchChat(data: AllChatProps | undefined) {
  const { searchSlug: chatId, setLoading, searchQuery: query } = useActiveChat();
  const otherUser = useOtherUser(data);
  const router = useRouter();
  const app = useApp();
  const selected = chatId === data?.id;

  const setValueChange = React.useCallback(
    (id: string | undefined = data?.id) => {
      if (selected) return;
      const route = query ? `/chat?${query}=${id}` : `/chat/${id}`;
      setLoading(true);
      router.push(route, { scroll: false });
    },
    [data, query, selected]
  );

  const lastMessage = React.useMemo(() => {
    const messages = data?.messages || [];

    return messages[messages.length - 1];
  }, [data?.messages]);

  const userEmail = React.useMemo(() => app.session?.user?.email, [app.session?.user?.email]);

  const hasSeen = React.useMemo(() => {
    if (!lastMessage) return false;

    const seenArray = lastMessage.seen || [];

    if (!userEmail) return false;

    return seenArray.filter(user => user.email === userEmail).length !== 0;
  }, [userEmail, lastMessage]);

  const lastMessageText = React.useMemo(() => {
    if (lastMessage?.mediaUrl) return 'Sent an image';

    if (lastMessage?.body) return lastMessage?.body;

    return 'Started a conversation';
  }, [lastMessage]);

  return { setValueChange, selected, otherUser, lastMessage, hasSeen, lastMessageText };
}
