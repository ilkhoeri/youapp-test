'use client';
import * as React from 'react';
import Link from 'next/link';

import { cn } from 'cn';
import { x } from 'xuxi';
import { Tabs } from '../ui/tabs';
import { IconType } from '../ui/svg';
import { SearchIcon } from '../icons';
import { ChatList } from './chat-list';
import { Input } from '../fields/input';
import { Skeleton } from './chat-skeleton';
import { useMount } from '../client-mount';
import { Resizable } from '../ui/resizable';
import { Separator } from '../ui/separator';
import { buttonVariants } from '../ui/button';
import { ChatSwitcher, UserSwitcher } from './chat-switcher';
import { CreateChatGroup } from './chat-group';
import { Tag2DuotoneIcon } from '../icons-duotone';
import { useApp } from '../../contexts/app-provider';
import { useDeviceQuery } from '@/resource/hooks/use-device-query';
import { MinimalAccount } from '@/resource/types/user';
import { OptimisticChat } from '@/resource/types/chats';
import { ArchiveFillIcon, ArchiveJunkFillIcon, CartShoppingFillIcon, FileDraftFillIcon, InboxFillIcon, MailFillIcon, SendFillIcon, TrashFillIcon, RefreshFillIcon } from '../icons-fill';
import { ChatClient } from './chat-client';
import { useActiveChat } from './chat-context';

export const classTabs = {
  list: 'inline-flex h-9 items-center justify-center rounded-lg bg-background-theme border p-1 aria-disabled:opacity-50',
  tab: 'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 aria-selected:bg-color data-[active]:text-background aria-selected:shadow text-muted-foreground',
  panel: 'px-4 m-0 space-y-0.5 overflow-y-auto max-h-[calc(100%-7.5rem)]'
};

interface ChatContainerProps {
  accounts: MinimalAccount[];
  defaultLayout?: number[] | undefined;
  defaultCollapsed?: boolean;
  navCollapsedSize?: number;
}

type ContainerActionsProps = { accounts: MinimalAccount[]; chats: OptimisticChat[] };

function useContainerActions(props: ContainerActionsProps) {
  const { accounts, chats: allChat } = props;
  const app = useApp();

  const inbox = allChat?.flatMap(chat => chat.messages.filter(msg => (app.user?.id ? msg.seenIds?.includes(app.user?.id) : [])));

  const links = {
    '1': [
      {
        title: 'All',
        label: x.cnx(allChat?.length),
        icon: MailFillIcon,
        variant: 'default'
      },
      {
        title: 'Inbox',
        label: x.cnx(inbox?.length),
        icon: InboxFillIcon,
        variant: 'ghost'
      },
      {
        title: 'Drafts',
        label: x.cnx(0),
        icon: FileDraftFillIcon,
        variant: 'ghost'
      },
      {
        title: 'Sent',
        label: x.cnx(0),
        icon: SendFillIcon,
        variant: 'ghost'
      },
      {
        title: 'Junk',
        label: x.cnx(0),
        icon: ArchiveJunkFillIcon,
        variant: 'ghost'
      },
      {
        title: 'Trash',
        label: x.cnx(0),
        icon: TrashFillIcon,
        variant: 'ghost'
      },
      {
        title: 'Archive',
        label: x.cnx(0),
        icon: ArchiveFillIcon,
        variant: 'ghost'
      }
    ] as ChatNavProps['links'],

    '2': [
      {
        title: 'Updates',
        label: x.cnx(0),
        icon: RefreshFillIcon,
        variant: 'ghost'
      },
      {
        title: 'Shopping',
        label: x.cnx(0),
        icon: CartShoppingFillIcon,
        variant: 'ghost'
      },
      {
        title: 'Social',
        label: x.cnx(0),
        icon: Tag2DuotoneIcon,
        color: '#00a76f',
        variant: 'ghost'
      },
      {
        title: 'Forums',
        label: x.cnx(0),
        icon: Tag2DuotoneIcon,
        color: '#ffab00',
        variant: 'ghost'
      },
      {
        title: 'Promotions',
        label: x.cnx(0),
        icon: Tag2DuotoneIcon,
        color: '#ff5630',
        variant: 'ghost'
      }
    ] as ChatNavProps['links']
  };

  return links;
}

export function ChatContainer(_props: ChatContainerProps) {
  const desktopQuery = useDeviceQuery('xl');
  const { accounts, defaultLayout = desktopQuery ? [20, 32, 48] : [19, 31, 50], defaultCollapsed = false, navCollapsedSize } = _props;

  const { chats: allChat, currentUser } = useActiveChat();

  const mount = useMount();

  const links = useContainerActions({ accounts, chats: allChat });

  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);

  const chatsIsDefined = allChat && allChat.length > 0;

  if (!mount) return <Skeleton.Container layouts={defaultLayout} />;

  return (
    <Resizable
      direction={desktopQuery ? 'horizontal' : 'vertical'}
      onLayout={(sizes: number[]) => {
        document.cookie = `__resizable-panels:layout:chat_container=${JSON.stringify(sizes)}`;
      }}
      className={Skeleton.ContainerClasses}
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
          <UserSwitcher currentUser={currentUser} isCollapsed={isCollapsed} accounts={accounts} chats={allChat} />
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
            <ChatSwitcher isCollapsed={isCollapsed} accounts={accounts} chats={allChat} />
            <Tabs.List aria-disabled={!chatsIsDefined} className={classTabs.list}>
              <Tabs.Tab value="all" className={classTabs.tab}>
                All
              </Tabs.Tab>
              <Tabs.Tab value="group" className={classTabs.tab}>
                Group
              </Tabs.Tab>
            </Tabs.List>
          </div>
          <Separator />
          <ChatList items={allChat} />
        </Tabs>
      </Resizable.Panel>

      <Resizable.Handle withHandle />

      <Resizable.Panel defaultSize={defaultLayout[2]} minSize={desktopQuery ? 55 : 30} className="relative">
        <ChatClient />
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
    disabled?: boolean;
  }[];
  className?: string;
}

export function ChatNav({ links, isCollapsed, className }: ChatNavProps) {
  return (
    <div data-collapsed={isCollapsed} className={cn('group flex flex-col gap-4 py-2 data-[collapsed=true]:py-2', className)}>
      <nav className={cn('grid gap-1 px-2', isCollapsed && 'justify-center px-2')}>
        {links.map(({ title, label, icon: Icon, color, variant, disabled }, index) => {
          const isIconOnly = isCollapsed;
          const isDefault = variant === 'default';

          const baseClasses = buttonVariants({ variant, size: isIconOnly ? 'icon' : 'sm' });
          const stateClasses = cn(isDefault && 'transition-colors bg-color text-background', isIconOnly ? 'h-9 w-9' : 'justify-start gap-2');

          return (
            <Link key={index} href="#" aria-disabled={disabled} className={cn(baseClasses, stateClasses)}>
              {Icon && <Icon color={color} />}
              {isIconOnly ? <span className="sr-only">{title}</span> : title}
              {!isIconOnly && label && <span className={cn('ml-auto', isDefault && 'text-background')}>{label}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
