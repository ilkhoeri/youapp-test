'use client';
import React from 'react';
import { pusherClient } from '@/resource/configs/pusher/pusher';

import type { MemberInfo } from '../types';

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

  const isOnline = (userId: string | null | undefined) => onlineUsers?.some(u => u?.id === userId);

  return { onlineCount: onlineUsers?.length, onlineUsers, isOnline };
}
