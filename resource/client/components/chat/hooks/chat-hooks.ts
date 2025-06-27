'use client';
import React from 'react';
import axios from 'axios';
import { debounce } from 'lodash';
import { dbPing } from '@/auth/handler-server';

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
        await axios.patch(`/api/chats/${chatId}/messages/${messageIds[0]}`, {
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
