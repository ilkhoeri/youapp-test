'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Account, AllChatProps } from '@/resource/types/user';
import { pusherClient } from '@/resource/server/messages/pusher';
import { useChat, useOtherUser, type UseChatOptions } from './chat-context';
import { ContextMenu as CtxMenu } from '@/resource/client/components/ui/context-menu';
import { formatShortTime } from '@/resource/const/times-helper';
import { useSearchQuery } from '../link-search-query';
import { useApp } from '../../contexts/app-provider';
import { ChatAvatars, ChatGroupAvatar } from './component';
import { find } from 'lodash';
import { cn } from 'cn';

interface ChatListProps extends UseChatOptions {
  items: AllChatProps[];
  accounts: Account[];
  title?: string;
}

export function ChatList(_props: ChatListProps) {
  const { items: initialItems, accounts: users, searchQuery } = _props;
  const [items, setItems] = React.useState(initialItems);

  // const router = useRouter();
  const { session } = useApp();

  const { chatId } = useChat({ searchQuery });

  const pusherKey = React.useMemo(() => {
    return session?.user?.email;
  }, [session?.user?.email]);

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
  }, [pusherKey]);

  return items.map(item => <ChatListItem key={item.id} searchQuery={searchQuery} data={item} selected={chatId === item.id} />);
}

interface ChatListItemProps extends UseChatOptions {
  data: AllChatProps;
  selected?: boolean;
}

export function ChatListItem(_props: ChatListItemProps) {
  const { data, selected, searchQuery } = _props;
  const otherUser = useOtherUser(data);
  const { session } = useApp();
  const router = useRouter();
  const { createQuery } = useSearchQuery('');

  const handleClick = React.useCallback(() => {
    const route = searchQuery ? createQuery(searchQuery, data.id) : `/chat/${data.id}`;
    router.push(route, { scroll: false });
  }, [data, router, searchQuery]);

  const lastMessage = React.useMemo(() => {
    const messages = data.messages || [];

    return messages[messages.length - 1];
  }, [data.messages]);

  const userEmail = React.useMemo(() => session?.user?.email, [session?.user?.email]);

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

  return (
    <CtxMenu>
      <CtxMenu.Trigger asChild>
        <div
          onClick={handleClick}
          className={cn(
            'w-full relative flex items-center space-x-3 py-3 px-4 rounded-lg transition cursor-pointer hover:bg-[#e4ebf1] dark:hover:bg-[#1c252e]',
            selected && 'bg-[#e4ebf1] dark:bg-[#1c252e]'
          )}
        >
          {/* <ChatAvatars data={data} otherUser={otherUser} /> */}
          <ChatGroupAvatar data={data} />
          <div className="min-w-0 flex-1">
            <div className="focus:outline-none">
              <span className="absolute inset-0" aria-hidden="true" />
              <div className="flex justify-between items-center mb-1">
                <p className="text-md font-medium text-color">{data?.name || otherUser?.name}</p>
                {lastMessage?.createdAt && <p className="text-xs text-muted-foreground font-light">{formatShortTime(new Date(lastMessage.createdAt))}</p>}
              </div>
              <p className={cn('truncate text-xs', hasSeen || !lastMessage?.body ? 'text-muted-foreground' : 'text-color')}>{escapeText(lastMessageText)}</p>
            </div>
          </div>
        </div>
      </CtxMenu.Trigger>

      <ContextMenuContent />
    </CtxMenu>
  );
}

export function ContextMenuContent() {
  return (
    <CtxMenu.Content className="w-52">
      <CtxMenu.Item>Group Info</CtxMenu.Item>
      <CtxMenu.Item>Group Media</CtxMenu.Item>

      <CtxMenu.Item>Back</CtxMenu.Item>
      <CtxMenu.Item disabled>Forward</CtxMenu.Item>
      <CtxMenu.Item>Reload</CtxMenu.Item>

      <CtxMenu.Sub>
        <CtxMenu.SubTrigger>More</CtxMenu.SubTrigger>
        <CtxMenu.SubContent className="w-44">
          <CtxMenu.Item>Exit group</CtxMenu.Item>
          <CtxMenu.Separator />
          <CtxMenu.Item variant="destructive">Delete</CtxMenu.Item>
        </CtxMenu.SubContent>
      </CtxMenu.Sub>
    </CtxMenu.Content>
  );
}

function escapeText(text: string | null | undefined): string {
  if (!text) return '';

  return (
    text
      // Inline formatting: _, *, ~
      .replace(/___/g, '')
      .replace(/---/g, '')
      .replace(/_(.*?)_/g, '$1')
      .replace(/~(.*?)~/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/```([\s\S]*?)```/g, '$1') // block code (multiline)
      .replace(/`([^`]+)`/g, '$1') // inline code

      // Headings (remove markdown symbols only)
      .replace(/^###### (.*)$/gim, '$1')
      .replace(/^##### (.*)$/gim, '$1')
      .replace(/^#### (.*)$/gim, '$1')
      .replace(/^### (.*)$/gim, '$1')
      .replace(/^## (.*)$/gim, '$1')
      .replace(/^# (.*)$/gim, '$1')

      // Blockquote and pseudo block elements
      .replace(/^> (.*)$/gim, '$1')
      .replace(/^< (.*)$/gim, '$1')

      // Ordered and unordered list items
      .replace(/^\d+\.\s+(.*)$/gm, '$1')
      .replace(/^- (.*)$/gm, '$1')
      .replace(/^\* (.*)$/gm, '$1')

      // HTML cleanup (list artifacts, if any)
      .replace(/(<li>(.*?)<\/li>)/gim, '$2')
      .replace(/<\/?(ul|ol)>/gim, '')
      .replace(/<\/li>\s*<li>/gim, '\n')

      // Remove extra line breaks or trim spaces
      // .replace(/\n{3,}/g, '\n\n') // reduce 3+ newlines to 2
      .replace(/\n+/g, ' ')
      .trim()
  );
}
