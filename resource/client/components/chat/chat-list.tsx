'use client';
import * as React from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { pusherClient } from '@/resource/configs/pusher/pusher';
import { AllChatProps, MinimalAccount } from '@/resource/types/user';
import { ContextMenu as CtxMenu } from '@/resource/client/components/ui/context-menu';
import { useDebounceSearch } from '@/resource/hooks/use-debounce-search';
import { formatShortTime } from '@/resource/const/times-helper';
import { truncate } from '@/resource/utils/text-parser';
import { ChatListItemSkeleton } from './chat-skeleton';
import { useApp } from '../../contexts/app-provider';
import { useSwitchChat } from './chat-hooks';
import { classTabs } from './chat-container';
import { ChatAvatars } from './chat-avatar';
import { Input } from '../fields/input';
import { SearchIcon } from '../icons';
import { Tabs } from '../ui/tabs';
import { find } from 'lodash';
import { cn } from 'cn';
import { chattype } from './types';

interface ChatListProps {
  items: AllChatProps[];
  accounts: MinimalAccount[];
  title?: string;
}

export function ChatList(_props: ChatListProps) {
  const { items: initialItems, accounts: users } = _props;

  const mockApiSearch = async (query: string): Promise<AllChatProps[]> => {
    const normalizedData = initialItems.filter(c => {
      const data = {
        ...c,
        name: c.name ?? c?.users.find(u => u?.username?.toLowerCase().includes(query.toLowerCase()))?.username
      };
      return data?.name?.toLowerCase().includes(query.toLowerCase());
    });
    return new Promise(resolve => setTimeout(() => resolve(normalizedData), 1000));
  };

  const { query, setQuery, isSearching, results, error } = useDebounceSearch<AllChatProps[]>({
    delay: 400,
    minLength: 2,
    onSearch: mockApiSearch
  });

  const [items, setItems] = React.useState(initialItems);

  // const router = useRouter();
  const { user } = useApp();

  const pusherKey = React.useMemo(() => {
    return user?.email;
  }, [user?.email]);

  React.useEffect(() => {
    if (!pusherKey) return;

    pusherClient.subscribe(pusherKey);

    const updateHandler = (chat: AllChatProps) => {
      setItems(current =>
        current?.map(currentChat => {
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
  }, [pusherKey, query]);

  const newItems = !!query && results ? results : items;
  const unreadItems = newItems.filter(item => !item.messages?.map(ms => ms.seenIds.length > 0));

  const listItems = (chats: AllChatProps[]) => (isSearching ? <ChatListItemSkeleton /> : chats?.map(item => <ChatListItem key={item.id} data={item} />));

  return (
    <>
      <div className="bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <form>
          <div className="relative">
            <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search" variant="outline" className="pl-8" value={query} onChange={e => setQuery(e.target.value)} />
          </div>
        </form>
      </div>
      <Tabs.Panel value="all" className={classTabs.panel}>
        {listItems(newItems)}
      </Tabs.Panel>
      <Tabs.Panel value="unread" className={classTabs.panel}>
        {listItems(unreadItems)}
      </Tabs.Panel>
    </>
  );
  // return items?.map(item => <ChatListItem key={item.id} data={item} />);
}

interface ChatListItemProps {
  data: AllChatProps;
  // selected?: boolean;
}
export function ChatListItem(_props: ChatListItemProps) {
  const { data } = _props;

  const { onSwitch, isSelect, otherUser, lastMessage, hasSeen, lastMessageText } = useSwitchChat(data);

  const query = data.type.toLowerCase() as chattype;

  return (
    <CtxMenu>
      <CtxMenu.Trigger asChild>
        <div
          onClick={() => onSwitch(query, data.id)}
          className={cn(
            'w-full relative flex items-center space-x-3 py-3 px-4 rounded-lg transition cursor-pointer [--bg:#e4ebf1] dark:[--bg:#1c252e] hover:bg-[var(--bg)]',
            isSelect && 'bg-[var(--bg)]'
          )}
        >
          <ChatAvatars data={data} otherUser={otherUser} />
          <div className="min-w-0 flex-1">
            <div className="focus:outline-none">
              <span className="absolute inset-0" aria-hidden="true" />
              <div className="flex justify-between items-center mb-1">
                <p className="text-md font-medium text-color">{data?.name || otherUser?.name}</p>
                {lastMessage?.createdAt && <p className="text-xs text-muted-foreground font-light">{formatShortTime(new Date(lastMessage.createdAt))}</p>}
              </div>
              <p className={cn('truncate text-xs', hasSeen || !lastMessage?.body ? 'text-muted-foreground' : 'text-color')}>{truncate(escapeText(lastMessageText), 200)}</p>
            </div>
          </div>
        </div>
      </CtxMenu.Trigger>

      {contextMenu(data)}
    </CtxMenu>
  );
}

export function contextMenu(data: AllChatProps) {
  const menuMap = useMenuMap(data);
  return <CtxMenu.Content className="w-48">{renderMenuItems(menuMap)}</CtxMenu.Content>;
}

function useMenuMap(data: AllChatProps) {
  const router = useRouter();

  const handleDelete = React.useCallback(async () => {
    const confirmDelete = window.confirm(`Apakah kamu yakin ingin menghapus Group ${data.name}?`);
    if (!confirmDelete) return;

    try {
      await axios.delete(`/api/chats/${data.id}`);
      router.replace('/chat');
      router.refresh();
    } catch (_e) {
      console.error(`Gagal menghapus GroupChat ${data.name}`, _e);
    }
  }, [data.id, router]);

  const menuMap: MenuMap[] = [
    { label: 'Group Info', onAction: () => {} },
    { label: 'Group Media', onAction: () => {} },
    { label: 'Back', onAction: () => router.back() },
    { label: 'Forward', disabled: true, onAction: () => {} },
    { label: 'Reload', onAction: () => {} },
    { label: 'Pin', onAction: () => {} },
    {
      label: 'More',
      separator: true,
      sub: [
        { label: 'Exit group', onAction: () => {} },
        { label: 'Delete Group', separator: true, variant: 'destructive', onAction: handleDelete }
      ]
    }
  ];

  return menuMap;
}

type MenuMap = {
  label: string;
  shortcut?: string | undefined;
  separator?: boolean | undefined;
  onAction?: React.MouseEventHandler<HTMLDivElement>;
  sub?: MenuMap[];
  disabled?: boolean;
  variant?: React.ComponentProps<typeof CtxMenu.Item>['variant'];
};

function renderMenuItems(items: MenuMap[]) {
  return items.flatMap(item => {
    const elements: React.ReactNode[] = [];

    if (item.separator) {
      elements.push(<CtxMenu.Separator key={`sep-${item.label}`} />);
    }

    if (item.sub && item.sub.length > 0) {
      elements.push(
        <CtxMenu.Sub key={item.label}>
          <CtxMenu.SubTrigger>{item.label}</CtxMenu.SubTrigger>
          <CtxMenu.SubContent className="w-40">{renderMenuItems(item.sub)}</CtxMenu.SubContent>
        </CtxMenu.Sub>
      );
    } else {
      elements.push(
        <CtxMenu.Item key={item.label} disabled={item.disabled} variant={item.variant} onClick={item.onAction}>
          {item.label}
          {item.shortcut && <CtxMenu.Shortcut>{item.shortcut}</CtxMenu.Shortcut>}
        </CtxMenu.Item>
      );
    }

    return elements;
  });
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
