'use client';
import * as React from 'react';
import axios from 'axios';
import { MinimalAccount } from '@/resource/types/user';
import { OptimisticMessage } from '@/resource/types/chats';
import { pusherClient } from '@/resource/configs/pusher/pusher';
import { formatDayLabel, groupMessagesByDate } from './messages/message-helper';
import { OptimisticMessageLocal } from './hooks/use-optimistic';
import { MessageBubble } from './messages/message-bubble';
import { DateDivider } from './messages/date-divider';
import { useActiveChat } from './chat-context';
import { ChatScrollBotton } from './chat-components';
import { createPortal } from 'react-dom';

export interface ChatBodyProps {
  members?: MinimalAccount[] | null | undefined;
}

function mergeMessage(prevMsg: OptimisticMessage, newMsg: OptimisticMessage): OptimisticMessage {
  return {
    ...prevMsg,
    ...newMsg,
    status: newMsg.status ?? 'SENT',
    // seenIds: newMsg.seenIds && newMsg.seenIds.length >= oldMsg.seenIds.length ? newMsg.seenIds : oldMsg.seenIds,
    // seen: newMsg.seen && newMsg.seen.length >= oldMsg.seen.length ? newMsg.seen : oldMsg.seen,
    seenIds: Array.from(new Set([...(prevMsg.seenIds ?? []), ...(newMsg.seenIds ?? [])])),
    seen: Array.from(new Set([...(prevMsg.seen ?? []), ...(newMsg.seen ?? [])]))
  };
}

function useMarkMessagesAsSeenSequentially() {
  const { chat, messages, setMessages, currentUser, chatId } = useActiveChat();

  const { lastMessage, dateKeys, byDate, ...groupMessages } = groupMessagesByDate(messages, currentUser!!);

  const { refs, inViewMap, scrollableRef } = useInviewMap<OptimisticMessageLocal[], HTMLDivElement, HTMLDivElement>(messages);

  const seenQueue = React.useRef<Set<string>>(new Set());

  React.useEffect(() => {
    if (!chatId) return;

    const unseenMessages = dateKeys.flatMap(date =>
      byDate[date].messages.filter((m, i) => inViewMap[i] && m.senderId !== currentUser?.id && !m.seenIds.includes(currentUser?.id!) && !seenQueue.current.has(m.id))
    );

    const hasSeenIds = unseenMessages.find(m => m.chatId === chatId)?.seenIds.includes(currentUser?.id!);

    if (unseenMessages.length === 0 || hasSeenIds) return;

    async function markSeens() {
      for (const message of unseenMessages) {
        if (!message || !message.id) return;
        try {
          seenQueue.current.add(message.id); // ✅ Tambahkan ke cache agar tidak dikirim ulang
          // axios.post(`/api/chats/${chatId}/seen`, { messageId: message?.id });
          await axios.patch(`/api/chats/${chatId}/messages/${message.id}`, { status: 'SEEN' });
          await new Promise(res => setTimeout(res, 100));
        } catch (error) {
          console.error('Failed to mark as seen:', message.id, error);
          // ❌ Rollback jika gagal kirim
          seenQueue.current.delete(message.id);
          break;
        }
      }
    }

    markSeens();
  }, [inViewMap.join(','), chatId]);

  React.useEffect(() => {
    seenQueue.current.clear();
  }, [chatId]);

  const lastMessageRef = React.useRef<HTMLDivElement>(null);
  const [isLastView, setIsLastView] = React.useState(false);

  React.useEffect(() => {
    const target = lastMessageRef.current;
    const root = scrollableRef.current;

    if (!target || !root) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsLastView(entry.isIntersecting && entry.intersectionRatio === 1);
      },
      {
        root,
        threshold: 1.0
      }
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [messages.length, lastMessage?.id]);

  const scrollIntoView = React.useCallback(() => {
    if (!lastMessageRef.current) return;

    lastMessageRef.current.scrollIntoView({ behavior: 'auto', block: 'center', inline: 'nearest' });
  }, [messages.length, lastMessage?.id]);

  const previousLastMessageId = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!messages?.length) return;

    const last = messages[messages.length - 1];
    if (!last || !currentUser?.id) return;

    const isNewMessageFromCurrentUser = last.senderId === currentUser.id && last.id !== previousLastMessageId.current;

    if (isNewMessageFromCurrentUser && !isLastView) {
      scrollIntoView();
    }

    previousLastMessageId.current = last.id;
  }, [messages.length, isLastView, , lastMessage?.id]);

  /**
  const seenId = messages.find(m => m.chatId === chatId)?.seenIds.includes(currentUser?.id!);

  React.useEffect(() => {
    if (!chatId || seenId) return;
    markAsSeen();
  }, [chatId, seenId, lastMessage?.id]);
   */

  React.useEffect(() => {
    if (!chatId) return;
    // const channelName = `chat:${chatId}`;
    // pusherClient.subscribe(channelName);

    pusherClient.subscribe(chatId);
    // targetRef?.current?.scrollIntoView();

    const messageHandler = (message: OptimisticMessageLocal) => {
      // axios.post(`/api/chats/${chatId}/seen`);
      // if (!isPrevent)
      // markAsSeen();

      // setMessages(current => {
      //   if (find(current, { id: message.id })) return current;
      //   return [...current, message];
      // });

      setMessages(current => {
        const exists = current.find(m => m.id === message.id || (message?.localId && m.localId === message.localId));

        if (!exists) return [...current, message];

        // Replace optimistic message with real message
        // return current.map(m => {
        //   const isSameByLocal = message.localId && m.localId === message.localId;
        //   const isSameById = m.id === message.id;

        //   if (isSameByLocal || isSameById) {
        //     return { ...m, ...message, status: 'SENT' };
        //   }

        //   return m;
        // });

        return current.map(m => {
          const isSameByLocal = message.localId && m.localId === message.localId;
          const isSameById = m.id === message.id;

          if (isSameByLocal || isSameById) {
            return mergeMessage(m, message);
          }

          return m;
        });
      });
    };

    const updateMessageHandler = (newMessage: OptimisticMessageLocal) => {
      setMessages(current => current.map(m => (m.id === newMessage.id ? mergeMessage(m, newMessage) : m)));

      if (lastMessage?.id === newMessage.id && lastMessage.senderId === currentUser?.id) {
        setIsLastView(false);
      }
    };

    const removeMessageHandler = (data: OptimisticMessageLocal) => {
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

  const unseenMessages = dateKeys.flatMap(date => byDate[date].messages.filter(m => m.senderId !== currentUser?.id && !m.seenIds.includes(currentUser?.id!)));

  return { chat, lastMessage, dateKeys, byDate, messages, scrollableRef, lastMessageRef, isLastView, scrollIntoView, refs, inViewMap, unseenMessages, ...groupMessages };
}

/** **updates** [Commit 3e9a9d6] */
function useMarkMessagesFirst() {
  const { messages, setMessages, currentUser, chatId } = useActiveChat();

  const { refs, inViewMap, scrollableRef } = useInviewMap<OptimisticMessageLocal[], HTMLDivElement, HTMLDivElement>(messages);

  const groupMessages = groupMessagesByDate(messages, currentUser!!);
  const seenId = messages.find(m => m.chatId === chatId)?.seenIds.includes(currentUser?.id!);

  React.useEffect(() => {
    if (!chatId || seenId) return;
    axios.post(`/api/chats/${chatId}/seen`);
  }, [chatId, seenId]);

  React.useEffect(() => {
    if (!chatId) return;
    pusherClient.subscribe(chatId);
    // targetRef?.current?.scrollIntoView();

    const messageHandler = (message: OptimisticMessageLocal) => {
      if (!chatId) return;
      axios.post(`/api/chats/${chatId}/seen`);

      setMessages(current => {
        const exists = current.find(m => m.id === message.id || (message?.localId && m.localId === message.localId));

        if (!exists) return [...current, message];

        return current.map(m => {
          const isSameByLocal = message.localId && m.localId === message.localId;
          const isSameById = m.id === message.id;

          if (isSameByLocal || isSameById) {
            return mergeMessage(m, message);
          }

          return m;
        });
      });

      // targetRef?.current?.scrollIntoView();
    };

    const updateMessageHandler = (newMessage: OptimisticMessageLocal) => {
      setMessages(current =>
        current.map(currentMessage => {
          if (currentMessage.id === newMessage.id) return newMessage;
          return currentMessage;
        })
      );
    };

    const removeMessageHandler = (data: OptimisticMessageLocal) => {
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

  return { messages, slug: chatId, refs, inViewMap, scrollableRef, ...groupMessages };
}

export function ChatBody() {
  const { chat, lastMessage, dateKeys, byDate, refs, inViewMap, scrollableRef, lastMessageRef, isLastView, scrollIntoView, unseenMessages } = useMarkMessagesAsSeenSequentially();

  const [editorEl, setEditorEl] = React.useState<HTMLElement | null>(null);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    setEditorEl(document.getElementById('inline-message'));
  }, []);

  const isMessages = dateKeys && dateKeys?.length > 0;

  return (
    <div className="relative h-full contents overflow-y-auto">
      <div ref={scrollableRef} className="overflow-y-auto flex-1 scroll-smooth">
        {dateKeys.map(date => (
          <React.Fragment key={date}>
            <DateDivider date={formatDayLabel(date, { options: { dateStyle: 'short' } })} count={byDate[date].count} />
            {byDate[date].messages.map((msg, i) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                members={chat?.users}
                targetRef={lastMessage?.id === msg.id ? lastMessageRef : null}
                data-in-view={inViewMap[i]}
                ref={refs[i]}
                // isInView={inViewMap[i] ? true : undefined}
                lastMessage={lastMessage}
              />
            ))}
          </React.Fragment>
        ))}
      </div>
      {isMessages && editorEl && createPortal(<ChatScrollBotton visible={isLastView} unseenTotal={unseenMessages.length} onClick={() => scrollIntoView()} />, editorEl)}
    </div>
  );
}

function useInviewMap<TData extends Array<object>, TParent extends HTMLElement = HTMLElement, TTargets extends HTMLElement = HTMLElement>(data: TData) {
  const [inViewMap, setInViewMap] = React.useState<boolean[]>([]);

  const refs = React.useMemo(() => data.map(() => React.createRef<TTargets>()), [data]);

  const scrollableRef = React.useRef<TParent>(null);

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

  return { refs, inViewMap, scrollableRef };
}

/**
function useInviewMap<TData extends Array<{ id: string }>, TParent extends HTMLElement = HTMLElement, TTargets extends HTMLElement = HTMLElement>(data: TData) {
  const [inViewIds, setInViewIds] = React.useState<Set<string>>(new Set());
  const refs = React.useMemo(() => data.map(() => React.createRef<TTargets>()), [data]);
  const scrollableRef = React.useRef<TParent>(null);

  const targetRef = refs[refs.length - 1];

  React.useEffect(() => {
    const container = scrollableRef.current;
    if (!container) return;

    const observerList: IntersectionObserver[] = [];

    data.forEach((item, index) => {
      const el = refs[index]?.current;
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          setInViewIds(prev => {
            const updated = new Set(prev);
            if (entry.isIntersecting) {
              updated.add(item.id);
            } else {
              updated.delete(item.id);
            }
            return new Set(updated);
          });
        },
        { root: container, threshold: 1.0 }
      );

      observer.observe(el);
      observerList.push(observer);
    });

    return () => {
      observerList.forEach(obs => obs.disconnect());
    };
  }, [data, refs]);

  return { refs, inViewIds, scrollableRef, targetRef };
}
*/
