'use client';
import React from 'react';
import axios from 'axios';
import { debounce } from 'lodash';
import { useApp } from '../../contexts/app-provider';
import { AllChatProps, MinimalAccount } from '@/resource/types/user';
import { pusherClient } from '@/resource/configs/pusher/pusher';
import { useActiveChat, useOtherUser } from './chat-context';
import { dbPing } from '@/auth/handler-server';
import { chattype, ID, SwitchData } from './types';

interface SwitcherProps {
  selectedId?: string | null;
}

export function useSwitcher<TData extends ID>(items: SwitchData<TData>, opts: SwitcherProps = {}) {
  const { selectedId: _id } = opts;

  const { router, setLoading, slug: chatId, onReload, ...rest } = useActiveChat();

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

type ChatProps = AllChatProps | null | undefined;
// type SwitchChatParams = ChatProps | (ChatProps[] | null | undefined);

export function useSwitchChat(data: ChatProps) {
  const { setLoading, slug: chatId, onReload, router, ...rest } = useActiveChat();
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

// untuk UI lokal, misal tampilkan badge "You're offline"
export function useOnlineStatus(userId?: string | null, threshold = 40) {
  const [isOnline, setIsOnline] = React.useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : false);

  const THRESHOLD = threshold * 1000;

  React.useEffect(() => {
    if (!userId) return;
    async function lastSeen() {
      try {
        await dbPing(userId, { lastOnline: new Date() });
        // axios.post(`/api/${userId}/ping`);
      } catch (error) {}
    }
    const interval = setInterval(() => lastSeen(), THRESHOLD); // tiap 20 detik

    return () => clearInterval(interval);
  }, [userId]);

  React.useEffect(() => {
    if (!userId) return;
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [userId]);

  return isOnline;
}

export function isUserOnline(lastSeen: Date | null | undefined, threshold = 50): boolean {
  const THRESHOLD = threshold * 1000;
  if (!lastSeen) return false;
  return new Date().getTime() - new Date(lastSeen).getTime() < THRESHOLD;
}

//
type MergedUser = {
  accounts: MinimalAccount;
  members: MemberInfo;
};

export function getMatchingMembers(accounts: MinimalAccount[], members: MemberInfo[]): MergedUser[] {
  const memberMap = new Map(members.map(m => [m.email, m]));

  return accounts
    .filter(user => memberMap.has(user.email))
    .map(user => ({
      accounts: user,
      members: memberMap.get(user.email)!
    }));
}

export function getMatchingAccounts(accounts: MinimalAccount[], members: MemberInfo[]): MinimalAccount[] {
  const memberMap = new Map(members.map(m => [m.email, m]));
  return accounts.filter(user => memberMap.has(user.email));
}

/**
 * @example
 * type Emails = 'janedoe123@gmail.com' | 'johndoe123@gmail.com';
 * const members: MembersPresence<Emails> = {
 *   members: {
 *     'janedoe123@gmail.com': {
 *       id: '684568324a6f3739c22fb2b6',
 *       email: 'janedoe123@gmail.com',
 *       name: 'janedoe',
 *       avatar: ''
 *     },
 *     'johndoe123@gmail.com': {
 *       id: '684567d94a6f3739c22fb2b4',
 *       email: 'johndoe123@gmail.com',
 *       name: 'johndoe',
 *       avatar: ''
 *     }
 *   },
 *   count: 2,
 *   myID: 'johndoe123@gmail.com',
 *   me: {
 *     id: 'johndoe123@gmail.com',
 *     info: {
 *       id: '684567d94a6f3739c22fb2b4',
 *       email: 'johndoe123@gmail.com',
 *       name: 'johndoe',
 *       avatar: ''
 *     }
 *   }
 * };
 */
export type MembersPresence<TEmails extends string = string> = {
  members: MembersMap<TEmails>;
  count: number;
  myID: TEmails;
  me: {
    id: TEmails;
    info: MemberInfo<TEmails>;
  };
};
export type MembersMap<T extends string> = {
  [K in T]: {
    id: string;
    email: K;
    name: string;
    avatar: string;
  };
};
export type MemberInfo<TEmail extends string = string> = {
  id: string;
  email: TEmail;
  name: string;
  avatar: string;
};

export function useOnlinePresence() {
  const [onlineUsers, setOnlineUsers] = React.useState<MemberInfo[]>([]);

  // 🔔 Realtime pusher events
  React.useEffect(() => {
    const channel = pusherClient.subscribe('presence-user-status');

    channel.bind('pusher:subscription_succeeded', (members: any) => {
      // const users = Object.values(members.members);
      const users: MemberInfo[] = [];
      members.each((member: any) => users.push(member.info));
      setOnlineUsers(users);
    });

    channel.bind('pusher:member_added', (member: any) => {
      // setOnlineUsers(current => [...current, member.info]);
      setOnlineUsers(current => [...new Set([...current, member.info])]);
    });

    channel.bind('pusher:member_removed', (member: any) => {
      setOnlineUsers(current => current.filter(u => u.id !== member.id));
    });

    return () => {
      pusherClient.unsubscribe('presence-user-status');
    };
  }, []);

  const isOnline = (userId: string) => onlineUsers?.some(u => u?.id === userId);

  return { onlineCount: onlineUsers?.length, onlineUsers, isOnline };
}

//
type Options = {
  chatId: string;
  currentUserId: string;
};

export function useBatchSeenTracker({ chatId, currentUserId }: Options) {
  const pendingIds = React.useRef<Set<string>>(new Set());
  const [observedElements, setObservedElements] = React.useState<Record<string, Element | null>>({});

  const markSeen = React.useCallback(
    debounce(async () => {
      if (pendingIds.current.size === 0) return;

      const messageIds = Array.from(pendingIds.current);
      pendingIds.current.clear();

      try {
        await axios.patch(`/api/chats/messages/${messageIds[0]}`, {
          messageIds,
          seenIds: [currentUserId]
        });
      } catch (err) {
        console.error('Failed to mark messages as seen:', err);
      }
    }, 1000),
    [currentUserId]
  );

  const observe = React.useCallback(
    (messageId: string, element: Element | null) => {
      if (!element || observedElements[messageId]) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            pendingIds.current.add(messageId);
            markSeen();
          }
        },
        { threshold: 0.85 }
      );

      observer.observe(element);
      setObservedElements(prev => ({ ...prev, [messageId]: element }));

      return () => {
        observer.disconnect();
        setObservedElements(prev => {
          const copy = { ...prev };
          delete copy[messageId];
          return copy;
        });
      };
    },
    [markSeen, observedElements]
  );

  return { observe };
}
