'use client';
import { cn } from 'cn';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Account, AllChatProps } from '@/resource/types/user';
import { useChat } from './chat';
import { pusherClient } from '@/resource/server/messages/pusher';
import { find } from 'lodash';
import { ChatGroup } from './chat-group';
import { MotionCard, MotionCardModal } from '../motion/motion-card';
import { ChatBox } from './chat-box';
import { PeopleIcon } from '../icons-fill';
import { MotionButton, MotionButtonModal } from '../motion/motion-button';
import { ActionBack } from '../actions';
import { Button } from '../ui/button';

interface ChatListProps {
  items: AllChatProps[];
  accounts: Account[];
  title?: string;
}

export function ChatList(_props: ChatListProps) {
  const { items: initialItems, accounts: users } = _props;
  const [items, setItems] = React.useState(initialItems);

  const router = useRouter();
  const session = useSession();

  const { chatId } = useChat();

  const pusherKey = React.useMemo(() => {
    return session.data?.user?.email;
  }, [session.data?.user?.email]);

  React.useEffect(() => {
    if (!pusherKey) return;

    pusherClient.subscribe(pusherKey);

    const updateHandler = (chat: AllChatProps) => {
      setItems(current =>
        current.map(currentChat => {
          if (currentChat.id === chat.id) {
            return {
              ...currentChat,
              messages: chat.messages
            };
          }

          return currentChat;
        })
      );
    };

    const newHandler = (chat: AllChatProps) => {
      setItems(current => {
        if (find(current, { id: chat.id })) return current;

        return [chat, ...current];
      });
    };

    const removeHandler = (chat: AllChatProps) => {
      setItems(current => {
        return [...current.filter(convo => convo.id !== chat.id)];
      });
    };

    pusherClient.bind('chat:update', updateHandler);
    pusherClient.bind('chat:new', newHandler);
    pusherClient.bind('chat:remove', removeHandler);
  }, [pusherKey, router]);

  return items.map(item => <ChatBox key={item.id} data={item} selected={chatId === item.id} />);
}
