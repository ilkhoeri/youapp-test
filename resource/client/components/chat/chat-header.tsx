'use client';
import * as React from 'react';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { ArchiveFillIcon, ArchiveJunkFillIcon, DotsFillIcon, ForwardFillIcon, ReplyAllFillIcon, ReplyFillIcon, TrashFillIcon } from '../icons-fill';
import { useIsMobile } from '@/resource/hooks/use-device-query';
import { useOnlinePresence } from './hooks/use-online-presence';
import { SheetsBreakpoint } from '../sheets-breakpoint';
import { ChatDeleteAlert } from './chat-alert';
import { useActiveChat } from './chat-context';
import { ChatProfile } from './chat-profile';
import { ChatAvatars } from './chat-avatar';

const ICON_SIZE: number = 20;

// { chat }: { chat: OptimisticChat }

export function ChatHeader() {
  // const otherUser = useOtherUser(chat);

  const isMediaQuery = useIsMobile();

  const [confirm, onConfirm] = React.useState(false);

  const { members, getOtherUser, chat } = useActiveChat();

  const otherUser = getOtherUser(chat);

  const { isOnline } = useOnlinePresence();

  const isActive = members.indexOf(otherUser?.email!) !== -1;

  const statusText = React.useMemo(() => {
    if (chat?.type === 'GROUP') return `${chat?.users.length} members`;
    if ((otherUser && isOnline(otherUser?.id)) || isActive) return 'Online';
    return 'Offline';
  }, [chat, otherUser?.id, isOnline, isActive]);

  const sheetsContent = <ChatProfile chat={chat} onConfirmChange={onConfirm} />;

  return (
    <>
      <ChatDeleteAlert url={`/api/chats/${chat?.id}`} confirm={confirm} onConfirm={onConfirm} />

      <div className="relative z-[8] border-b p-2 flex items-center bg-background-theme [&>*>button]:rounded-full">
        <div className="flex items-center gap-1">
          <div className="flex gap-3 items-center">
            {otherUser && chat?.userIds.length && <SheetsBreakpoint openWith="drawer" trigger={<ChatAvatars chat={chat} otherUser={otherUser} />} content={sheetsContent} />}
            <div className="flex flex-col">
              <h4 className="text-sm font-semibold">{chat?.name || otherUser?.username}</h4>
              <p className="text-xs font-light text-neutral-500">{statusText}</p>
            </div>
          </div>

          {!isMediaQuery && (
            <>
              <Separator orientation="vertical" className="mx-1 h-6 max-md:hidden max-md:sr-only" />
              <Button variant="ghost" size="icon" disabled={!chat} className="max-md:hidden max-md:sr-only">
                <ReplyFillIcon size={ICON_SIZE} />
                <span className="sr-only">Reply</span>
              </Button>

              <Button variant="ghost" size="icon" disabled={!chat} className="max-md:hidden max-md:sr-only">
                <ReplyAllFillIcon size={ICON_SIZE} />
                <span className="sr-only">Reply all</span>
              </Button>

              <Button variant="ghost" size="icon" disabled={!chat} className="max-md:hidden max-md:sr-only">
                <ForwardFillIcon size={ICON_SIZE} />
                <span className="sr-only">Forward</span>
              </Button>

              <Separator orientation="vertical" className="mx-1 h-6 max-md:hidden max-md:sr-only" />
            </>
          )}
        </div>

        {!isMediaQuery && (
          <div className="ml-auto flex items-center gap-1 max-md:hidden max-md:sr-only">
            <Button variant="ghost" size="icon" disabled={!chat} className="max-md:hidden max-md:sr-only">
              <ArchiveFillIcon size={ICON_SIZE} />
              <span className="sr-only">Archive</span>
            </Button>
            <Button variant="ghost" size="icon" disabled={!chat} className="max-md:hidden max-md:sr-only">
              <ArchiveJunkFillIcon size={ICON_SIZE} />
              <span className="sr-only">Move to junk</span>
            </Button>
            <Button variant="ghost" size="icon" disabled={!chat} className="max-md:hidden max-md:sr-only" onClick={() => onConfirm(true)}>
              <TrashFillIcon size={ICON_SIZE} />
              <span className="sr-only">Move to trash</span>
            </Button>
          </div>
        )}
        <Separator orientation="vertical" className="mx-2 h-6 max-md:ml-auto rtl:max-md:mr-auto" />

        <SheetsBreakpoint
          openWith="drawer"
          trigger={
            <Button variant="ghost" size="icon" className="group rounded-full">
              <DotsFillIcon size={ICON_SIZE} />
            </Button>
          }
          content={sheetsContent}
        />
      </div>
    </>
  );
}
