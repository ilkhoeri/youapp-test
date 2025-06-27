'use client';
import React from 'react';
import { useApp } from '../../../contexts/app-provider';
import { useActiveChat, useOtherUser } from '../chat-context';
import { chattype, ID, SwitchData } from '../types';
import { OptimisticChat } from '@/resource/types/chats';

interface SwitcherProps {
  selectedId?: string | null;
}

export function useSwitcher<TData extends ID>(items: SwitchData<TData>, opts: SwitcherProps = {}) {
  const { selectedId: _id } = opts;

  const { router, setLoading, chatId, onReload, ...rest } = useActiveChat();

  const selectedId = _id || chatId;

  const itemsIsDefined = items && items?.length > 0;

  const defaultSelectedId = React.useMemo(() => {
    // return itemsIsDefined ? items[0]?.id : undefined;
    if (!itemsIsDefined) return;
    return selectedId ?? undefined;
  }, [selectedId, items]);

  const [selectedItemId, setSelectedItemId] = React.useState<string | undefined>(selectedId ?? defaultSelectedId);

  React.useEffect(() => {
    if (!itemsIsDefined) {
      setSelectedItemId(undefined);
      return;
    }
    const stillValid = items?.some(item => item?.id === selectedItemId);
    if (selectedId) setSelectedItemId(selectedId);
    if (!stillValid) setSelectedItemId(defaultSelectedId);
  }, [selectedId, items, selectedItemId, defaultSelectedId]);

  const selectedItem = items?.find(item => item?.id === selectedItemId);

  const isSelect = selectedId === selectedItem?.id;

  const onSwitch = React.useCallback(
    (query: chattype | null, slug: string | null | undefined) => {
      if (!slug) return;
      const route = query ? `/chat?${query}=${slug}` : `/chat/${slug}`;
      router.push(route, { scroll: false });
      setSelectedItemId(slug);
      setLoading(true);
      onReload();
    },
    [selectedItem, isSelect]
  );

  return { selectedItemId, selectedItem, isSelect, onSwitch, setLoading, router, slug: chatId, onReload, ...rest };
}

type ChatProps = OptimisticChat | null | undefined;
// type SwitchChatParams = ChatProps | (ChatProps[] | null | undefined);

export function useSwitchChat(data: ChatProps) {
  const { setLoading, chatId, onReload, router, ...rest } = useActiveChat();
  // const data = params && Array.isArray(params) ? params.find(c => c?.id === chatId) : params;
  const otherUser = useOtherUser(data);
  const app = useApp();
  const isSelect = chatId === data?.id;

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

  const onSwitch = React.useCallback(
    (query: chattype | null, slug: string | null | undefined) => {
      if (isSelect || !slug) return;
      const route = query ? `/chat?${query}=${slug}` : `/chat/${slug}`;
      router.push(route, { scroll: false });
      setLoading(true);
      onReload();
    },
    [data, isSelect]
  );

  return { onSwitch, isSelect, otherUser, lastMessage, hasSeen, lastMessageText, setLoading, slug: chatId, onReload, router, ...rest };
}
