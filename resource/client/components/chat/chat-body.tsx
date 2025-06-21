'use client';
import * as React from 'react';
import axios from 'axios';
import { useApp } from '../../contexts/app-provider';
import { pusherClient } from '@/resource/configs/pusher/pusher';
import { Account, Message, Message as MessageProp, MinimalAccount } from '@/resource/types/user';
import { useActiveChat } from './chat-context';
import { formatDayLabel, groupMessagesByDate } from './messages/helper';
import { DateDivider } from './messages/date-divider';
import { MessageBubble } from './messages/message-bubble';
import { find, debounce } from 'lodash';

interface ChatSubscriptionProps {
  data: MessageProp[];
  targetRef: React.RefObject<HTMLDivElement>;
  chatId: string | null | undefined;
}
interface ChatSubscriptionProps {
  chatId: string | null | undefined;
  data: MessageProp[];
  userId: string | undefined;
  key: number;
}

function preventedMessage(messages: Array<MessageProp>, currentUserId: string | undefined) {
  const lastMessage = messages?.[messages.length - 1];

  const newMessages = messages.map(m => ({
    isLastMessage: m.id === lastMessage?.id,
    hasUserId: (m.seenIds ?? [])?.includes(currentUserId!),
    isFromCurrentUser: m.senderId === currentUserId,
    ...m
  }));

  const isMessages = messages && messages?.length > 0;

  const isPrevent = newMessages.some(m => m.isFromCurrentUser || m.hasUserId);

  const unseenMessages = newMessages.filter(m => !m.isFromCurrentUser && !m.hasUserId);

  return { lastMessage, isPrevent, isMessages, unseenMessages };
}

function useChatSubscription(props: ChatSubscriptionProps) {
  const { data, chatId, targetRef, userId, key } = props;
  const [messages, setMessages] = React.useState(data);

  const { isPrevent, lastMessage, ...rest } = preventedMessage(messages, userId);

  const markAsSeen = React.useCallback(
    debounce((messageId: string) => {
      axios.post(`/api/chats/${chatId}/seen`, { messageId });
    }, 500),
    []
  );

  // 👁️ Intersection observer to mark as seen
  React.useEffect(() => {
    if (!targetRef.current || !chatId || !lastMessage?.id || isPrevent) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) markAsSeen(lastMessage.id); // kirim ID terakhir
      },
      { threshold: 0.8 } // hanya saat 100% terlihat
    );

    observer.observe(targetRef.current);

    return () => observer.disconnect();
  }, [chatId, lastMessage?.id, markAsSeen]);

  // 🔔 Realtime pusher events
  React.useEffect(() => {
    if (!chatId || isPrevent) return;

    pusherClient.subscribe(chatId);

    const handleNew = (message: MessageProp) => {
      setMessages(current => {
        if (find(current, { id: message.id })) return current;
        return [...current, message];
      });
    };

    const handleUpdate = (newMessage: MessageProp) => {
      setMessages(current => current.map(m => (m.id === newMessage.id ? newMessage : m)));
    };

    pusherClient.bind('messages:new', handleNew);
    pusherClient.bind('message:update', handleUpdate);

    return () => {
      pusherClient.unsubscribe(chatId);
      pusherClient.unbind('messages:new', handleNew);
      pusherClient.unbind('message:update', handleUpdate);
    };
  }, [chatId, key]);

  return { messages, isPrevent, lastMessage, ...rest };
}

export interface ChatBodyProps {
  messages: MessageProp[];
  members?: (MinimalAccount | null)[] | null | undefined;
}

/** **update db** [Commit 1e67d5f] */
function useMarkMessagesThird(initialMessages: Message[], user: Account) {
  const [messages, setMessages] = React.useState(initialMessages);

  const lastMessageRef = React.useRef<HTMLDivElement>(null);

  const { slug: chatId, targetRef, ...activeChat } = useActiveChat();

  const { lastMessage, ...groupMessages } = groupMessagesByDate(messages, user!!);

  /**
  React.useEffect(() => {
    if (!chatId) return;
    axios.post(`/api/chats/${chatId}/seen`);
  }, [chatId]);

  React.useEffect(() => {
    pusherClient.subscribe(chatId);
    targetRef?.current?.scrollIntoView();

    const messageHandler = (message: MessageProp) => {
      if (!chatId) return;
      axios.post(`/api/chats/${chatId}/seen`);

      setMessages(current => {
        if (find(current, { id: message.id })) return current;
        return [...current, message];
      });

      targetRef?.current?.scrollIntoView();
    };

    const updateMessageHandler = (newMessage: MessageProp) => {
      setMessages(current =>
        current.map(currentMessage => {
          if (currentMessage.id === newMessage.id) return newMessage;
          return currentMessage;
        })
      );
    };

    pusherClient.bind('messages:new', messageHandler);
    pusherClient.bind('message:update', updateMessageHandler);

    return () => {
      if (chatId) pusherClient.unsubscribe(chatId);
      pusherClient.unbind('messages:new', messageHandler);
      pusherClient.unbind('message:update', updateMessageHandler);
    };
  }, [chatId]);
 */

  React.useEffect(() => {
    if (!lastMessageRef.current || !chatId) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          axios.post(`/api/chats/${chatId}/seen`);
        }
      },
      { threshold: 1.0 } //
    );

    observer.observe(lastMessageRef.current);

    return () => observer.disconnect();
  }, [chatId, lastMessage?.id]); // bergantung pada id terakhir

  // const markAsSeen = debounce((messageId: string) => {
  //   axios.post(`/api/chats/${chatId}/seen`, { messageId });
  // }, 500); // delay 500ms agar tidak terlalu sering

  // React.useEffect(() => {
  //   if (!lastMessageRef.current || !chatId || !lastMessage?.id) return;

  //   const observer = new IntersectionObserver(
  //     ([entry]) => {
  //       if (entry.isIntersecting) {
  //         markAsSeen(lastMessage.id); // kirim ID terakhir
  //       }
  //     },
  //     { threshold: 1.0 } // hanya saat 100% terlihat
  //   );

  //   observer.observe(lastMessageRef.current);

  //   return () => observer.disconnect();
  // }, [chatId, lastMessage?.id, markAsSeen]);

  React.useEffect(() => {
    if (chatId) {
      pusherClient.subscribe(chatId);

      const messageHandler = (message: MessageProp) => {
        setMessages(current => {
          if (find(current, { id: message.id })) return current;
          return [...current, message];
        });
      };

      const updateMessageHandler = (newMessage: MessageProp) => {
        setMessages(current => current.map(m => (m.id === newMessage.id ? newMessage : m)));
      };

      pusherClient.bind('messages:new', messageHandler);
      pusherClient.bind('message:update', updateMessageHandler);

      return () => {
        pusherClient.unsubscribe(chatId);
        pusherClient.unbind('messages:new', messageHandler);
        pusherClient.unbind('message:update', updateMessageHandler);
      };
    }
  }, [chatId]);

  React.useEffect(() => {
    targetRef?.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  return { messages, targetRef, slug: chatId, lastMessage, ...activeChat, ...groupMessages };
}

/** **update message bubble** [Commit 316e2d4] */
async function markMessagesAsSeenSequentially(chatId: string, messages: Message[], currentUserId: string) {
  const unseenMessages = messages.filter(m => !m.seenIds.includes(currentUserId));

  // const { unseenMessages } = preventedMessage(messages, currentUserId);

  const markAsSeen = debounce((messageId: string) => {
    axios.post(`/api/chats/${chatId}/seen`);
  }, 100); // delay

  for (const message of unseenMessages) {
    try {
      // markAsSeen(message.id);
      await axios.post(`/api/chats/${chatId}/seen`, { messageId: message.id });
      // Optional: Delay antar request
      await new Promise(res => setTimeout(res, 100)); // delay 100ms
    } catch (error) {
      console.error('Failed to mark as seen:', message.id, error);
      break; // atau continue, sesuai kebutuhan
    }
  }
}
/** **update message bubble** [Commit 316e2d4] */
function useMarkMessagesAsSeenSequentially(initialMessages: Message[], user: Account) {
  const lastMessageRef = React.useRef<HTMLDivElement>(null);

  const [messages, setMessages] = React.useState(initialMessages);

  const { scrollableRef, targetRef, slug: chatId } = useActiveChat();

  const { lastMessage, ...groupMessages } = groupMessagesByDate(messages, user!!);

  // const { isPrevent, ...rest } = preventedMessage(messages, user?.id);

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
    if (!chatId) return;
    markAsSeen();
  }, [chatId, lastMessage?.id, messages.length]);

  React.useEffect(() => {
    if (!chatId) return;
    // const channelName = `chat:${chatId}`;
    // pusherClient.subscribe(channelName);

    pusherClient.subscribe(chatId);
    targetRef?.current?.scrollIntoView();

    const messageHandler = (message: MessageProp) => {
      // axios.post(`/api/chats/${chatId}/seen`);
      markAsSeen();

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
  }, [chatId]);

  // React.useEffect(() => {
  //   targetRef?.current?.scrollIntoView({ behavior: 'smooth' });
  // }, [messages.length]);

  return { messages, scrollableRef, targetRef, lastMessage, ...groupMessages };
}

/** **updates** [Commit 3e9a9d6] */
function useMarkMessagesFirst(initialMessages: Message[], user: Account) {
  const [messages, setMessages] = React.useState(initialMessages);

  const { slug: chatId, targetRef, ...activeChat } = useActiveChat();

  const groupMessages = groupMessagesByDate(messages, user!!);

  const [ok, setOk] = React.useState(false);

  React.useEffect(() => {
    if (!chatId) return;
    axios.post(`/api/chats/${chatId}/seen`);
  }, [chatId]);

  React.useEffect(() => {
    if (!chatId) return;
    pusherClient.subscribe(chatId);
    targetRef?.current?.scrollIntoView();

    const messageHandler = (message: MessageProp) => {
      if (!chatId) return;
      axios.post(`/api/chats/${chatId}/seen`);
      setOk(true);

      setMessages(current => {
        if (find(current, { id: message.id })) return current;
        return [...current, message];
      });

      targetRef?.current?.scrollIntoView();
    };

    const updateMessageHandler = (newMessage: MessageProp) => {
      setMessages(current =>
        current.map(currentMessage => {
          if (currentMessage.id === newMessage.id) return newMessage;
          return currentMessage;
        })
      );
    };

    pusherClient.bind('messages:new', messageHandler);
    pusherClient.bind('message:update', updateMessageHandler);

    return () => {
      pusherClient.unsubscribe(chatId);
      pusherClient.unbind('messages:new', messageHandler);
      pusherClient.unbind('message:update', updateMessageHandler);
    };
  }, [chatId]);

  // React.useEffect(() => {
  //   targetRef?.current?.scrollIntoView({ behavior: 'smooth' });
  // }, [messages.length]);

  const isPrevent = messages.some(m => m.senderId === user?.id || m.seenIds.includes(user?.id!));
  React.useEffect(() => {
    if (isPrevent) {
      targetRef?.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isPrevent, targetRef?.current, messages.length]);

  return { ok, messages, targetRef, slug: chatId, ...activeChat, ...groupMessages };
}

export function ChatBody({ messages: initialMessages = [], members }: ChatBodyProps) {
  const { user } = useApp();

  // const { scrollableRef, targetRef, slug: chatId, key } = useActiveChat();

  // const { messages } = useChatSubscription({ data: initialMessages, chatId, targetRef, userId: user?.id, key });

  // const { byDate, dateKeys, lastMessage } = groupMessagesByDate(messages, user!!);

  // const { messages, scrollableRef, targetRef, lastMessage, dateKeys, byDate } = useMarkMessagesThird(initialMessages, user);

  const { messages, scrollableRef, targetRef, lastMessage, dateKeys, byDate } = useMarkMessagesAsSeenSequentially(initialMessages, user);

  // const { messages, scrollableRef, targetRef, lastMessage, dateKeys, byDate } = useMarkMessagesFirst(initialMessages, user);

  // const { refs, inViewMap } = useInviewMap(messages, scrollableRef);

  return (
    <div className="relative h-full contents overflow-y-auto">
      <div ref={scrollableRef} className="overflow-y-auto flex-1">
        {dateKeys.map(date => (
          <React.Fragment key={date}>
            <DateDivider date={formatDayLabel(date, { options: { dateStyle: 'short' } })} count={byDate[date].count} />
            {byDate[date].messages.map((msg, i) => (
              <MessageBubble
                key={msg.id}
                data={msg}
                members={members}
                targetRef={lastMessage?.id === msg.id ? targetRef : undefined}
                lastMessage={lastMessage}
                //
                // data-in-view={inViewMap[i]}
                // isInView={inViewMap[i] ? true : undefined}
                // ref={refs[i]} {JSON.stringify(user?.id, null, 2)}
              />
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
          setInViewMap([...inViewStatus]); // Trigger re-render with new state
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
