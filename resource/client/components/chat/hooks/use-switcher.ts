'use client';
import React from 'react';
import { useActiveChat } from '../chat-context';
import { chattype, ID, SwitchData } from '../types';
import { OptimisticChat } from '@/resource/types/chats';
import { escapeTruncate } from '../chat-helper';

interface SwitcherProps {
  selectedId?: string | null;
}

export function useSwitcher<TData extends ID>(items: SwitchData<TData>, opts: SwitcherProps = {}) {
  const { selectedId: _id } = opts;

  const { router, setLoading, chatId, onReload, loading } = useActiveChat();

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

  return { selectedItemId, selectedItem, isSelect, onSwitch, setLoading, router, chatId, onReload, loading };
}

type ChatProps = OptimisticChat | null | undefined;

// type SwitchChatParams = ChatProps | (ChatProps[] | null | undefined);

export function useSwitchChat(chat: OptimisticChat | undefined) {
  const { setLoading, chatId, onReload, router, getOtherUser, currentUser, getGroupMessagesByDate } = useActiveChat();

  // const data = params && Array.isArray(params) ? params.find(c => c?.id === chatId) : params;
  // const otherUser = useOtherUser(data);

  const isSelect = chatId === chat?.id;

  const otherUser = getOtherUser(chat);

  const _lastMessage = React.useMemo(() => {
    const messages = chat?.messages || [];

    return messages[messages.length - 1];
  }, [chat?.messages.length]);

  const lastMessage = React.useMemo(() => {
    const grouped = getGroupMessagesByDate(chat?.messages);
    return grouped.lastMessage;
  }, [chat?.messages, getGroupMessagesByDate]);

  const userEmail = currentUser?.email;

  const hasSeen = React.useMemo(() => {
    if (!lastMessage || !userEmail) return false;
    return (lastMessage.seen || []).some(user => user.email === userEmail);
  }, [lastMessage, userEmail]);

  const lastMessageText = React.useMemo(() => {
    if (!lastMessage) return 'Started a conversation';

    const { body, mediaUrl } = lastMessage;

    if (mediaUrl && body) return `[image] ${escapeTruncate(body)}`;
    if (mediaUrl) return 'Sent an image';
    if (body) return escapeTruncate(body);

    return 'Started a conversation';
  }, [lastMessage, chat?.messages.length]);

  const onSwitch = React.useCallback(
    (query: chattype | null, slug: string | null | undefined) => {
      if (isSelect || !slug) return;
      const route = query ? `/chat?${query}=${slug}` : `/chat/${slug}`;
      router.push(route, { scroll: false });
      setLoading(true);
      onReload();
    },
    [chat?.id, isSelect]
  );

  return { onSwitch, isSelect, lastMessage, hasSeen, lastMessageText, otherUser, currentUser, router };
}
