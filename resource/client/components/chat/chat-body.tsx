'use client';
import * as React from 'react';
import axios from 'axios';
import { useApp } from '../../contexts/app-provider';
import { pusherClient } from '@/resource/configs/pusher/pusher';
import { Account, Message, Message as MessageProp, MinimalAccount } from '@/resource/types/user';
import { formatDayLabel, groupMessagesByDate } from './messages/helper';
import { DateDivider } from './messages/date-divider';
import { MessageBubble } from './messages/message-bubble';
import { useActiveChat } from './chat-context';
import { find, debounce } from 'lodash';

export interface ChatBodyProps {
  messages: MessageProp[];
  members?: MinimalAccount[] | null | undefined;
}

async function markMessagesAsSeenSequentially(chatId: string, messages: Message[], currentUserId: string) {
  const unseenMessages = messages.filter(m => !m.seenIds.includes(currentUserId));

  for (const message of unseenMessages) {
    try {
      await axios.post(`/api/chats/${chatId}/seen`, { messageId: message.id });
      await new Promise(res => setTimeout(res, 100)); // delay 100ms
    } catch (error) {
      console.error('Failed to mark as seen:', message.id, error);
      break; // atau continue, sesuai kebutuhan
    }
  }
}

function useMarkMessagesAsSeenSequentially(initialMessages: Message[], user: Account) {
  const lastMessageRef = React.useRef<HTMLDivElement>(null);

  const [messages, setMessages] = React.useState(initialMessages);

  const { scrollableRef, targetRef, slug: chatId } = useActiveChat();

  const { lastMessage, ...groupMessages } = groupMessagesByDate(messages, user!!);

  const isPrevent = user?.id && messages.some(m => m.senderId === user?.id || (m.seenIds ?? [])?.includes(user?.id));

  const markAsSeen = debounce(() => axios.post(`/api/chats/${chatId}/seen`), 100); // kasih delay agar tidak terlalu sering

  // React.useEffect(() => {
  //   if (!lastMessageRef.current || !chatId) return;
  //   const observer = new IntersectionObserver(
  //     ([entry]) => {
  //       if (entry.isIntersecting) {
  //         markMessagesAsSeenSequentially(chatId, messages, user?.id!);
  //       }
  //     },
  //     { threshold: 1.0 }
  //   );
  //   observer.observe(lastMessageRef.current);
  //   return () => observer.disconnect();
  // }, [chatId, lastMessage?.id, messages.length]);

  React.useEffect(() => {
    if (!chatId || isPrevent) return;
    markAsSeen();
  }, [chatId, lastMessage?.id, messages.length, isPrevent]);

  React.useEffect(() => {
    if (!chatId) return;
    // const channelName = `chat:${chatId}`;
    // pusherClient.subscribe(channelName);

    pusherClient.subscribe(chatId);
    targetRef?.current?.scrollIntoView();

    const messageHandler = (message: MessageProp) => {
      // axios.post(`/api/chats/${chatId}/seen`);
      if (!isPrevent) markAsSeen();

      setMessages(current => {
        if (find(current, { id: message.id })) return current;
        return [...current, message];
      });

      targetRef?.current?.scrollIntoView();
    };

    const updateMessageHandler = (newMessage: MessageProp) => {
      setMessages(current => current.map(m => (m.id === newMessage.id ? newMessage : m)));
    };

    const removeMessageHandler = (data: MessageProp) => {
      setMessages(current => current.filter(m => m.id !== data.id));
    };

    pusherClient.bind('messages:new', messageHandler);
    pusherClient.bind('message:update', updateMessageHandler);
    pusherClient.bind('message:remove', removeMessageHandler);

    return () => {
      pusherClient.unsubscribe(chatId);
      pusherClient.unbind('messages:new', messageHandler);
      pusherClient.unbind('message:update', updateMessageHandler);
      pusherClient.unbind('message:remove', removeMessageHandler);
    };
  }, [chatId, isPrevent]);

  // React.useEffect(() => {
  //   targetRef?.current?.scrollIntoView({ behavior: 'smooth' });
  // }, [messages.length]);

  return { messages, scrollableRef, targetRef, lastMessage, ...groupMessages };
}

export function ChatBody({ messages: initialMessages = [], members }: ChatBodyProps) {
  const { user } = useApp();

  const { scrollableRef, targetRef, lastMessage, dateKeys, byDate } = useMarkMessagesAsSeenSequentially(initialMessages, user);

  return (
    <div className="relative h-full contents overflow-y-auto">
      <div ref={scrollableRef} className="overflow-y-auto flex-1">
        {dateKeys.map(date => (
          <React.Fragment key={date}>
            <DateDivider date={formatDayLabel(date, { options: { dateStyle: 'short' } })} count={byDate[date].count} />
            {byDate[date].messages.map((msg, i) => (
              <MessageBubble key={msg.id} data={msg} members={members} targetRef={lastMessage?.id === msg.id ? targetRef : undefined} lastMessage={lastMessage} />
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function useInviewMap<T extends Array<object>>(data: T, scrollableRef: React.RefObject<HTMLElement> | null) {
  const [inViewMap, setInViewMap] = React.useState<boolean[]>([]);

  const refs = React.useMemo(() => data.map(() => React.createRef<HTMLDivElement>()), [data]);

  React.useEffect(() => {
    const scrollContainer = scrollableRef?.current;
    if (!scrollContainer) return;

    const observers: IntersectionObserver[] = [];
    const inViewStatus = Array(refs.length).fill(false);

    refs.forEach((ref, index) => {
      if (!ref.current) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          inViewStatus[index] = entry.isIntersecting;
          setInViewMap([...inViewStatus]);
        },
        {
          root: scrollContainer,
          threshold: 1.0 // Trigger when 100% is visible
        }
      );

      observer.observe(ref.current);
      observers.push(observer);
    });

    return () => {
      observers.forEach(observer => observer.disconnect());
    };
  }, [refs, scrollableRef]);

  return { refs, inViewMap };
}
