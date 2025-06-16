'use client';
import * as React from 'react';
import Link from 'next/link';

import { cn } from 'cn';
import { Tabs } from '../ui/tabs';
import { IconType } from '../ui/svg';
import { SearchIcon } from '../icons';
import { ChatList } from './chat-list';
import { Input } from '../fields/input';
import { ChatClient } from './chat-client';
import { useMount } from '../client-mount';
import { Resizable } from '../ui/resizable';
import { Separator } from '../ui/separator';
import { buttonVariants } from '../ui/button';
import { ChatSwitcher } from './chat-switcher';
import { CreateChatGroup } from './chat-group';
import { useActiveChat, UseChatOptions } from './chat-context';
import { Tag2DuotoneIcon } from '../icons-duotone';
import { useDeviceQuery } from '@/resource/hooks/use-device-query';
import { AllChatProps, MinimalAccount } from '@/resource/types/user';
import { ArchiveFillIcon, ArchiveJunkFillIcon, CartShoppingFillIcon, FileDraftFillIcon, InboxFillIcon, MailFillIcon, SendFillIcon, TrashFillIcon, RefreshFillIcon } from '../icons-fill';
import { ContainerSkeleton } from './chat-skeleton';
import { getChats } from '@/resource/server/messages/get-chats';

const links = {
  '1': [
    {
      title: 'All',
      label: '128',
      icon: MailFillIcon,
      variant: 'default'
    },
    {
      title: 'Inbox',
      label: '128',
      icon: InboxFillIcon,
      variant: 'ghost'
    },
    {
      title: 'Drafts',
      label: '9',
      icon: FileDraftFillIcon,
      variant: 'ghost'
    },
    {
      title: 'Sent',
      label: '',
      icon: SendFillIcon,
      variant: 'ghost'
    },
    {
      title: 'Junk',
      label: '23',
      icon: ArchiveJunkFillIcon,
      variant: 'ghost'
    },
    {
      title: 'Trash',
      label: '',
      icon: TrashFillIcon,
      variant: 'ghost'
    },
    {
      title: 'Archive',
      label: '',
      icon: ArchiveFillIcon,
      variant: 'ghost'
    }
  ] as ChatNavProps['links'],
  '2': [
    {
      title: 'Updates',
      label: '342',
      icon: RefreshFillIcon,
      variant: 'ghost'
    },
    {
      title: 'Shopping',
      label: '8',
      icon: CartShoppingFillIcon,
      variant: 'ghost'
    },
    {
      title: 'Social',
      label: '972',
      icon: Tag2DuotoneIcon,
      color: '#00a76f',
      variant: 'ghost'
    },
    {
      title: 'Forums',
      label: '128',
      icon: Tag2DuotoneIcon,
      color: '#ffab00',
      variant: 'ghost'
    },
    {
      title: 'Promotions',
      label: '21',
      icon: Tag2DuotoneIcon,
      color: '#ff5630',
      variant: 'ghost'
    }
  ] as ChatNavProps['links']
};

export const classResizable = {
  root: 'h-full max-xl:min-h-[176dvh] max-xl:max-h-[176dvh] xl:min-h-[80dvh] xl:max-h-[82dvh] items-stretch border rounded-2xl'
};

const classTabs = {
  list: 'inline-flex h-9 items-center justify-center rounded-lg bg-background-theme border p-1 aria-disabled:opacity-50',
  tab: 'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 aria-selected:bg-color data-[active]:text-background aria-selected:shadow text-muted-foreground',
  panel: 'px-4 m-0 space-y-0.5 overflow-y-auto max-h-[calc(100%-7.5rem)]'
};

interface ChatContainerProps extends UseChatOptions {
  accounts: MinimalAccount[];
  chats: AllChatProps[];
  defaultLayout?: number[] | undefined;
  defaultCollapsed?: boolean;
  navCollapsedSize?: number;
}

export function ChatContainer(_props: ChatContainerProps) {
  const desktopQuery = useDeviceQuery('xl');
  const { accounts, chats: allChat, searchQuery, defaultLayout = desktopQuery ? [20, 32, 48] : [19, 31, 50], defaultCollapsed = false, navCollapsedSize } = _props;
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);

  // const { loading, setLoading, searchQuery: query } = useActiveChat();
  // const [allChat, setAllChat] = React.useState<Array<AllChatProps> | null>(null);
  // // const [loading, setLoading] = React.useState<boolean>(false);
  // const [error, setError] = React.useState<string | null>(null);

  // React.useEffect(() => {
  //   const fetchChatGroup = async () => {
  //     setLoading(true);
  //     setError(null);

  //     try {
  //       const response = await fetch('/api/chats');
  //       if (!response.ok) throw new Error('Failed to fetch chat group');
  //       const data = await response.json();
  //       setAllChat(data);
  //       // await getChats().then(data => setAllChat(data));
  //     } catch (err) {
  //       setError(err instanceof Error ? err.message : 'An error occurred');
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchChatGroup();
  // }, []);

  const chatsIsDefined = allChat && allChat.length > 0;

  // const members = chat?.users;
  const mount = useMount();

  if (!mount) {
    return <ContainerSkeleton layouts={defaultLayout} className={classResizable.root} />;
  }

  return (
    <Resizable
      direction={desktopQuery ? 'horizontal' : 'vertical'}
      onLayout={(sizes: number[]) => {
        document.cookie = `__resizable-panels:layout:chat_container=${JSON.stringify(sizes)}`;
      }}
      className={classResizable.root}
    >
      <Resizable.Panel
        defaultSize={defaultLayout[0]}
        collapsedSize={navCollapsedSize}
        collapsible={desktopQuery ? true : false}
        minSize={desktopQuery ? 15 : 14.25}
        maxSize={desktopQuery ? 20 : undefined}
        onCollapse={() => {
          setIsCollapsed(true);
          document.cookie = `__resizable-panels:collapsed=${JSON.stringify(true)}`;
        }}
        onResize={() => {
          setIsCollapsed(false);
          document.cookie = `__resizable-panels:collapsed=${JSON.stringify(false)}`;
        }}
        className={cn('max-xl:grid max-xl:grid-cols-2 relative', isCollapsed && 'min-w-[50px] transition-all duration-300 ease-in-out')}
      >
        <div className={cn('max-xl:col-span-full flex h-[52px] items-center justify-center', isCollapsed ? 'h-[52px]' : 'px-2')}>
          <ChatSwitcher isCollapsed={isCollapsed} chats={allChat} />
        </div>
        <Separator className="max-xl:absolute max-xl:top-[52px] max-xl:w-full max-xl:inset-x-0" />
        <ChatNav isCollapsed={isCollapsed} links={links[1]} className="max-xl:border-r overflow-y-auto" />
        <Separator className="max-xl:hidden max-xl:sr-only" />
        <ChatNav isCollapsed={isCollapsed} links={links[2]} className="overflow-y-auto" />
      </Resizable.Panel>

      <Resizable.Handle withHandle />

      <Resizable.Panel defaultSize={defaultLayout[1]} minSize={desktopQuery ? 30 : 16.5}>
        <Tabs defaultValue="all" className="h-full">
          <div className="flex items-center px-4 py-2 gap-2">
            <h1 className="text-xl font-bold">Inbox</h1>
            <CreateChatGroup accounts={accounts} />
            <Tabs.List aria-disabled={!chatsIsDefined} className={classTabs.list}>
              <Tabs.Tab value="all" className={classTabs.tab}>
                All
              </Tabs.Tab>
              <Tabs.Tab value="unread" className={classTabs.tab}>
                Unread
              </Tabs.Tab>
            </Tabs.List>
          </div>
          <Separator />
          <div className="bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <form>
              <div className="relative">
                <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search" variant="outline" className="pl-8" />
              </div>
            </form>
          </div>
          <Tabs.Panel value="all" className={classTabs.panel}>
            <ChatList accounts={accounts} items={allChat} searchQuery={searchQuery} />
          </Tabs.Panel>
          <Tabs.Panel value="unread" className={classTabs.panel}>
            <ChatList accounts={accounts} items={allChat?.filter(item => !item.messages?.map(ms => ms.seenIds.length > 0))} searchQuery={searchQuery} />
          </Tabs.Panel>
        </Tabs>
      </Resizable.Panel>

      <Resizable.Handle withHandle />

      <Resizable.Panel defaultSize={defaultLayout[2]} minSize={desktopQuery ? 55 : 30} className="relative">
        <ChatClient chats={allChat} />
      </Resizable.Panel>
    </Resizable>
  );
}

interface ChatNavProps {
  isCollapsed: boolean;
  links: {
    title: string;
    label?: string;
    icon?: IconType;
    color?: React.CSSProperties['color'];
    variant: 'default' | 'ghost';
  }[];
  className?: string;
}

export function ChatNav({ links, isCollapsed, className }: ChatNavProps) {
  return (
    <div data-collapsed={isCollapsed} className={cn('group flex flex-col gap-4 py-2 data-[collapsed=true]:py-2', className)}>
      <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
        {links.map((link, index) => {
          if (isCollapsed) {
            return (
              <Link
                key={link.title}
                href="#"
                className={cn(buttonVariants({ variant: link.variant, size: 'icon' }), 'h-9 w-9', link.variant === 'default' && 'transition-colors bg-color text-background')}
              >
                {link?.icon && <link.icon color={link?.color} />}
                <span className="sr-only">{link.title}</span>
              </Link>
            );
          }

          return (
            <Link
              key={index}
              href="#"
              className={cn(buttonVariants({ variant: link.variant, size: 'sm' }), link.variant === 'default' && 'transition-colors bg-color text-background', 'justify-start gap-2')}
            >
              {link?.icon && <link.icon color={link?.color} />}
              {link.title}
              {link.label && <span className={cn('ml-auto', link.variant === 'default' && 'text-background')}>{link.label}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
