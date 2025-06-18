'use client';
import React from 'react';
import axios from 'axios';
import Pusher from 'pusher-js';
import { debounce } from 'lodash';
import { useRouter } from 'next/navigation';
import { useApp } from '../../contexts/app-provider';
import { AllChatProps, MinimalAccount } from '@/resource/types/user';
import { useActiveChat, useOtherUser } from './chat-context';
import { pusherClient } from '@/resource/server/messages/pusher';

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

// untuk UI lokal, misal tampilkan badge "You're offline"
export function useOnlineStatus(userId?: string | null) {
  const [isOnline, setIsOnline] = React.useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : false);

  React.useEffect(() => {
    if (!userId) return;
    const interval = setInterval(() => {
      fetch(`/api/${userId}/ping`, { method: 'POST' });
    }, 20_000); // tiap 20 detik

    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    if (userId) return;
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

export function isUserOnline(lastSeen: Date): boolean {
  const THRESHOLD = 30 * 1000; // 30 detik
  return new Date().getTime() - new Date(lastSeen).getTime() < THRESHOLD;
}

//
export function useOnlinePresence() {
  const [onlineUsers, setOnlineUsers] = React.useState<string[]>([]);

  React.useEffect(() => {
    const channel = pusherClient.subscribe('presence-users');

    channel.bind('pusher:subscription_succeeded', (members: any) => {
      const ids = members.map((member: any) => member.id);
      setOnlineUsers(ids);
    });

    channel.bind('pusher:member_added', (member: any) => {
      setOnlineUsers(prev => [...new Set([...prev, member.id])]);
    });

    channel.bind('pusher:member_removed', (member: any) => {
      setOnlineUsers(prev => prev.filter(id => id !== member.id));
    });

    return () => {
      pusherClient.unsubscribe('presence-users');
    };
  }, []);

  const isOnline = (userId: string) => onlineUsers.includes(userId);
  return { onlineUsers, isOnline };
}

export function usePresenceUsers() {
  const [onlineUsers, setOnlineUsers] = React.useState<MinimalAccount[]>([]);

  React.useEffect(() => {
    const channel = pusherClient.subscribe('presence-user-status');

    channel.bind('pusher:subscription_succeeded', (members: any) => {
      const users: MinimalAccount[] = [];
      members.each((member: any) => users.push(member.info));
      setOnlineUsers(users);
    });

    channel.bind('pusher:member_added', (member: any) => {
      setOnlineUsers(prev => [...prev, member.info]);
    });

    channel.bind('pusher:member_removed', (member: any) => {
      setOnlineUsers(prev => prev.filter(user => user.email !== member.info.email));
    });

    return () => {
      pusherClient.unsubscribe('presence-user-status');
    };
  }, []);

  // const isOnline = (userId: string) => onlineUsers.flatMap(user => user.id).includes(userId);
  const isOnline = (userId: string) => onlineUsers.some(u => u.id === userId);

  return { onlineUsers, isOnline };
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
        { threshold: 0.8 }
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
