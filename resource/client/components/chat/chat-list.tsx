'use client';
import * as React from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { pusherClient } from '@/resource/configs/pusher/pusher';
import { OptimisticChat } from '@/resource/types/chats';
import { ContextMenu as CtxMenu } from '@/resource/client/components/ui/context-menu';
import { useDebounceSearch } from '@/resource/hooks/use-debounce-search';
import { formatShortTime } from '@/resource/const/times-helper';
import { SheetsBreakpoint } from '../sheets-breakpoint';
import { ChatListItemSkeleton } from './chat-skeleton';
import { useApp } from '../../contexts/app-provider';
import { useSwitchChat } from './hooks/use-switcher';
import { Account } from '@/resource/types/user';
import { ChatProfile } from './chat-profile';
import { classTabs } from './chat-container';
import { ChatAvatars } from './chat-avatar';
import { Input } from '../fields/input';
import { SearchIcon } from '../icons';
import { chattype } from './types';
import { Tabs } from '../ui/tabs';
import { find } from 'lodash';
import { cn } from 'cn';
import { ChatDeleteAlert } from './chat-alert';

interface ChatListProps {
  items: OptimisticChat[];
  title?: string;
}

export function ChatList(_props: ChatListProps) {
  const { items: initialItems } = _props;

  const mockApiSearch = async (query: string): Promise<OptimisticChat[]> => {
    const normalizedData = initialItems.filter(c => {
      const data = {
        ...c,
        name: c.name ?? c?.users.find(u => u?.username?.toLowerCase().includes(query.toLowerCase()))?.username
      };
      return data?.name?.toLowerCase().includes(query.toLowerCase());
    });
    return new Promise(resolve => setTimeout(() => resolve(normalizedData), 1000));
  };

  const { query, setQuery, isSearching, results, error } = useDebounceSearch<OptimisticChat[]>({
    delay: 400,
    minLength: 2,
    onSearch: mockApiSearch
  });

  const [items, setItems] = React.useState(initialItems);

  const { user } = useApp();

  const pusherKey = React.useMemo(() => {
    return user?.email;
  }, [user?.email]);

  React.useEffect(() => {
    if (!pusherKey) return;

    pusherClient.subscribe(pusherKey);

    const newHandler = (chat: OptimisticChat) => {
      setItems(current => {
        if (find(current, { id: chat.id })) return current;
        return [chat, ...current];
      });
    };

    const updateHandler = (chat: OptimisticChat) => {
      setItems(current =>
        current?.map(currentChat => {
          if (currentChat.id === chat.id) {
            return { ...currentChat, messages: chat.messages };
          }
          return currentChat;
        })
      );
    };

    const removeHandler = (chat: OptimisticChat) => {
      setItems(current => {
        return [...current.filter(convo => convo.id !== chat.id)];
      });
    };

    pusherClient.bind('chat:new', newHandler);
    pusherClient.bind('chat:update', updateHandler);
    pusherClient.bind('chat:remove', removeHandler);
  }, [pusherKey, query, items.length]);

  const newItems = React.useMemo(() => {
    return !!query && results ? results : items;
  }, [query, results, items]);

  const groupItems = newItems.filter(item => item.type === 'GROUP');

  const listItems = (chats: OptimisticChat[]) => (isSearching ? <ChatListItemSkeleton /> : chats?.map(item => <ChatListItem key={item.id} chat={item} />));

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
      <Tabs.Panel value="group" className={classTabs.panel}>
        {listItems(groupItems)}
      </Tabs.Panel>
    </>
  );
  // return items?.map(item => <ChatListItem key={item.id} chat={item} />);
}

export function ChatListItem({ chat }: { chat: OptimisticChat }) {
  const { onSwitch, isSelect, lastMessage, hasSeen, lastMessageText, otherUser, currentUser } = useSwitchChat(chat);

  const [open, setOpen] = React.useState(false);
  const [confirm, onConfirm] = React.useState(false);

  const query = chat?.type.toLowerCase() as chattype;

  const groupIndicator = chat?.type === 'GROUP' ? <span className="absolute left-1 bottom-1 rounded bg-muted/35 border-[0.5px] px-px py-[0.5px] text-[8px]">group</span> : null;

  return (
    <>
      <CtxMenu>
        <CtxMenu.Trigger asChild>
          <div
            onClick={() => onSwitch(query, chat?.id)}
            className={cn(
              'w-full relative flex items-center space-x-3 py-3 px-4 rounded-lg transition cursor-pointer [--bg:#e4ebf1] dark:[--bg:#1c252e] hover:bg-[var(--bg)]',
              isSelect && 'bg-[var(--bg)]'
            )}
          >
            <ChatAvatars chat={chat} otherUser={otherUser} />
            <div className="min-w-0 flex-1">
              <div className="focus:outline-none">
                <span className="absolute inset-0" aria-hidden="true" />
                <div className="flex justify-between items-center mb-1">
                  <p className="text-md font-medium text-color">{chat?.name || otherUser?.username}</p>
                  {lastMessage?.createdAt && <p className="text-xs text-muted-foreground font-light">{formatShortTime(new Date(lastMessage.createdAt))}</p>}
                </div>
                {groupIndicator}
                <p className={cn('truncate text-xs', hasSeen || !lastMessage?.body ? 'text-muted-foreground' : 'text-color')}>{lastMessageText}</p>
              </div>
            </div>
          </div>
        </CtxMenu.Trigger>

        {contextMenu(chat, { currentUser, onOpenChange: setOpen })}
      </CtxMenu>

      <ChatDeleteAlert url={`/api/chats/${chat.id}`} confirm={confirm} onConfirm={onConfirm} onOpenChange={setOpen} />
      <SheetsBreakpoint openWith="drawer" open={open} onOpenChange={setOpen} trigger={null} content={<ChatProfile chat={chat} onConfirmChange={onConfirm} />} />
    </>
  );
}

export function contextMenu(chat: OptimisticChat | undefined, opts: MenuMapOptions = {}) {
  const menuMap = useMenuMap(chat, opts);
  return <CtxMenu.Content className="w-48">{renderMenuItems(menuMap)}</CtxMenu.Content>;
}

interface MenuMapOptions {
  currentUser?: Account;
  onOpenChange?: (prev: boolean) => void;
}

function useMenuMap(chat: OptimisticChat | undefined, options: MenuMapOptions = {}) {
  const { onOpenChange, currentUser } = options;
  const router = useRouter();

  const handleInfo = React.useCallback(() => {
    onOpenChange?.(true);
  }, [onOpenChange]);

  const handleDelete = React.useCallback(async () => {
    const confirmDelete = window.confirm(`Apakah kamu yakin ingin menghapus Group ${chat?.name}?`);
    if (!confirmDelete) return;

    try {
      await axios.delete(`/api/chats/${chat?.id}`);
      router.replace('/chat');
      router.refresh();
    } catch (_e) {
      console.error(`Gagal menghapus GroupChat ${chat?.name}`, _e);
    }
  }, [chat?.id, router]);

  const opt = <T,>(params: T, obj: MenuMap) => (params ? [obj] : []);

  const menuMap: MenuMap[] = [
    { label: 'Group Info', onAction: handleInfo },
    { label: 'Back', onAction: () => router.back() },
    { label: 'Forward', disabled: true, onAction: () => {} },
    { label: 'Reload', onAction: () => {} },
    ...opt(chat?.type === 'GROUP', { label: 'Exit group', onAction: () => {} }),
    ...opt(currentUser && chat?.type === 'GROUP' && chat?.admins.includes(currentUser?.id!), { label: 'Delete Group', separator: true, variant: 'destructive', onAction: handleDelete })
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
          <CtxMenu.SubContent side="bottom" className="w-40">
            {renderMenuItems(item.sub)}
          </CtxMenu.SubContent>
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
