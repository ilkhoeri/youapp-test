'use client';
import * as React from 'react';

import { Chat } from '@prisma/client';
import { Account, AllChatProps, AllMessageProps } from '@/resource/types/user';
import { Avatar } from '../ui/avatar-oeri';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../ui/resizable';
import { Separator } from '../ui/separator';
import { cn } from 'cn';
import Link from 'next/link';
import { buttonVariants } from '../ui/button';
import { IconType } from '../ui/svg';
import { Tabs } from '../ui/tabs';
import { Input } from '../fields/input';
import { ChatList } from './chat-list';
import { SearchIcon } from '../icons';
import { ArchiveFillIcon, ArchiveJunkFillIcon, CartShoppingFillIcon, FileDraftFillIcon, InboxFillIcon, MailFillIcon, SendFillIcon, TrashFillIcon, RefreshFillIcon } from '../icons-fill';
import { ChatGroupSwitcher, CreateChatGroup } from './chat-group-switcher';
import { useDeviceQuery } from '@/resource/hooks/use-device-query';
import { ClientRender } from '../client-render';
import { Tag2DuotoneIcon } from '../icons-duotone';

interface ChatAvatarsProps {
  data: Chat & {
    users: Account[];
  };
  otherUser: Account;
}
export function ChatAvatars({ data, otherUser }: ChatAvatarsProps) {
  if (data?.isGroup) {
    return <Avatar.Group>{data?.users?.map(user => <Avatar size={32} key={user?.refId} src={user?.image} fallback={user?.name} alt={user?.firstName} />)}</Avatar.Group>;
  }
  return <Avatar src={otherUser?.image} fallback={otherUser?.name} alt={otherUser?.firstName} />;
}

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

const classTabs = {
  list: 'inline-flex h-9 items-center justify-center rounded-lg bg-background-theme border p-1',
  tab: 'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 aria-selected:bg-color data-[active]:text-background aria-selected:shadow text-muted-foreground',
  panel: 'px-4 m-0 space-y-0.5 overflow-y-auto max-h-[calc(100%-7.5rem)]'
};

interface ChatContainerProps {
  accounts: Account[];
  chats: AllChatProps[];
  defaultLayout?: number[] | undefined;
  defaultCollapsed?: boolean;
  navCollapsedSize?: number;
}

export function ChatContainer(_props: ChatContainerProps) {
  const isLarge = useDeviceQuery('lg');
  const { accounts, chats, defaultLayout = isLarge ? [20, 32, 48] : [19, 31, 50], defaultCollapsed = false, navCollapsedSize } = _props;
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);

  return (
    <ClientRender>
      <ResizablePanelGroup
        direction={isLarge ? 'horizontal' : 'vertical'}
        onLayout={(sizes: number[]) => {
          document.cookie = `react-resizable-panels:layout:chat_container=${JSON.stringify(sizes)}`;
        }}
        className="h-full min-h-[75dvh] lg:min-h-[520px] items-stretch border rounded-2xl"
      >
        <ResizablePanel
          defaultSize={defaultLayout[0]}
          collapsedSize={navCollapsedSize}
          collapsible={isLarge ? true : false}
          minSize={isLarge ? 15 : 14.25}
          maxSize={isLarge ? 20 : undefined}
          onCollapse={() => {
            setIsCollapsed(true);
            document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(true)}`;
          }}
          onResize={() => {
            setIsCollapsed(false);
            document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(false)}`;
          }}
          className={cn('max-lg:grid max-lg:grid-cols-2 relative', isCollapsed && 'min-w-[50px] transition-all duration-300 ease-in-out')}
        >
          <div className={cn('max-lg:col-span-full flex h-[52px] items-center justify-center', isCollapsed ? 'h-[52px]' : 'px-2')}>
            <ChatGroupSwitcher isCollapsed={isCollapsed} chats={chats} accounts={accounts} />
          </div>
          <Separator className="max-lg:absolute max-lg:top-[52px] max-lg:w-full max-lg:inset-x-0" />
          <ChatNav isCollapsed={isCollapsed} links={links[1]} className="max-lg:border-r overflow-y-auto" />
          <Separator className="max-lg:hidden max-lg:sr-only" />
          <ChatNav isCollapsed={isCollapsed} links={links[2]} className="overflow-y-auto" />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
          <Tabs defaultValue="all" className="h-full">
            <div className="flex items-center px-4 py-2 gap-2">
              <h1 className="text-xl font-bold">Inbox</h1>
              {/* <CreateChatGroup accounts={accounts} /> */}
              <Tabs.List className={classTabs.list}>
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
                  <Input placeholder="Search" className="pl-8" />
                </div>
              </form>
            </div>
            <Tabs.Panel value="all" className={classTabs.panel}>
              <ChatList accounts={accounts} items={chats} />
            </Tabs.Panel>
            <Tabs.Panel value="unread" className={classTabs.panel}>
              <ChatList accounts={accounts} items={chats.filter(item => !item.messages.map(ms => ms.seenIds.length > 0))} />
            </Tabs.Panel>
          </Tabs>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[2]} minSize={30}>
          <div className="size-full top-0 left-0 absolute bg-repeat" {...{ style: { opacity: '0.06', backgroundImage: 'url(/images/message-bg.png)' } }} />
          {/* <ChatDisplay mail={chats.find(item => item.id === mail.selected) || null} /> */}
          CHATDISPLAY
        </ResizablePanel>
      </ResizablePanelGroup>
    </ClientRender>
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
        {links.map((link, index) =>
          isCollapsed ? (
            <Link
              key={link.title}
              href="#"
              className={cn(buttonVariants({ variant: link.variant, size: 'icon' }), 'h-9 w-9', link.variant === 'default' && 'transition-colors bg-color text-background')}
            >
              {link?.icon && <link.icon color={link?.color} />}
              <span className="sr-only">{link.title}</span>
            </Link>
          ) : (
            <Link
              key={index}
              href="#"
              className={cn(buttonVariants({ variant: link.variant, size: 'sm' }), link.variant === 'default' && 'transition-colors bg-color text-background', 'justify-start gap-2')}
            >
              {link?.icon && <link.icon color={link?.color} />}
              {link.title}
              {link.label && <span className={cn('ml-auto', link.variant === 'default' && 'text-background')}>{link.label}</span>}
            </Link>
          )
        )}
      </nav>
    </div>
  );
}
