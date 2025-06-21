'use client';
import * as React from 'react';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { ArchiveFillIcon, ArchiveJunkFillIcon, DotsFillIcon, ForwardFillIcon, ReplyAllFillIcon, ReplyFillIcon, TrashFillIcon } from '../icons-fill';
import { formatPrettyDate } from '@/resource/const/times-helper';
import { useIsMobile } from '@/resource/hooks/use-device-query';
import { useOtherUser, useActiveChat } from './chat-context';
import { SheetsBreakpoint } from '../sheets-breakpoint';
import { MinimalAccount } from '@/resource/types/user';
import { useOnlinePresence } from './chat-hooks';
import { ChatAvatars } from './chat-avatar';
import { useRouter } from 'next/navigation';
import { AlertModal } from '../alert';
import { Chat } from '@prisma/client';
import { toast } from 'sonner';
import axios from 'axios';

const ICON_SIZE: number = 20;

export type ChatHeaderProps = Pick<GroupProfileProps, 'chat'>;

export function ChatHeader({ chat }: ChatHeaderProps) {
  const otherUser = useOtherUser(chat);
  const isMediaQuery = useIsMobile();

  const [confirm, onConfirm] = React.useState(false);

  const { members } = useActiveChat();

  const { isOnline } = useOnlinePresence();

  const isActive = members.indexOf(otherUser?.email!) !== -1;

  const statusText = React.useMemo(() => {
    if (chat?.type === 'GROUP') return `${chat?.users.length} members`;
    if ((otherUser && isOnline(otherUser?.id)) || isActive) return 'Online';
    return 'Offline';
  }, [chat, otherUser?.id, isOnline, isActive]);

  const sheetsContent = <GroupProfile chat={chat} confirm={confirm} onConfirm={() => onConfirm(true)} />;

  return (
    <>
      <DeleteGroupAlert confirm={confirm} onConfirm={onConfirm} />

      <div className="relative z-[8] border-b p-2 flex items-center bg-background-theme [&>*>button]:rounded-full">
        <div className="flex items-center gap-1">
          <div className="flex gap-3 items-center">
            {otherUser && chat?.userIds && <SheetsBreakpoint openWith="drawer" trigger={<ChatAvatars data={chat} otherUser={otherUser} />} content={sheetsContent} />}
            <div className="flex flex-col">
              <h4 className="text-sm font-semibold">{chat?.name || otherUser?.name}</h4>
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

interface GroupProfileProps extends DeleteGroupAlertProps {
  chat: (Chat & { users: MinimalAccount[] }) | undefined;
}

function GroupProfile({ chat: data, confirm, onConfirm }: GroupProfileProps) {
  if (!data) return null;

  const otherUser = useOtherUser(data);

  const isGroup = data.type === 'GROUP';

  const joinedDate = React.useMemo(() => {
    return formatPrettyDate(new Date(otherUser?.createdAt ?? Date.now()));
  }, [otherUser?.createdAt]);

  const title = React.useMemo(() => {
    return data.name || otherUser?.name;
  }, [data.name, otherUser?.name]);

  const { members } = useActiveChat();
  const isActive = members.indexOf(otherUser?.email!) !== -1;

  const statusText = React.useMemo(() => {
    if (isGroup) {
      return `${data.users.length} members`;
    }
    return isActive ? 'Active' : 'Offline';
  }, [data, isActive]);

  return (
    <>
      <div className="relative mt-6 flex-1 px-4 sm:px-6">
        <div className="flex flex-col items-center">
          <p className="font-semibold">{title}</p>
          <div className="mt-4 mb-2">
            <ChatAvatars data={data} otherUser={otherUser} />
          </div>
          <div className="text-sm text-muted-foreground">{statusText}</div>
          <div className="flex gap-10 my-8">
            <div onClick={() => onConfirm(true)} className="flex flex-col gap-1 items-center cursor-pointer hover:opacity-75 rounded-full text-white">
              <TrashFillIcon size={20} />
              <span className="text-xs font-light text-muted-foreground">Delete</span>
            </div>
          </div>
          <div className="w-full pb-5 pt-5 sm:px-0 sm:pt-0">
            <dl className="space-y-8 px-4 sm:space-y-6 sm:px-6">
              {isGroup && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground sm:w-40 sm:flex-shrink-0">Members</dt>
                  <dd className="mt-1 text-sm text-muted-foreground sm:col-span-2">{data.users.map(user => user?.name).join(', ')}</dd>
                </div>
              )}
              {!isGroup && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground sm:w-40 sm:flex-shrink-0">Email</dt>
                  <dd className="mt-1 text-sm text-muted-foreground sm:col-span-2">{otherUser?.email}</dd>
                </div>
              )}
              {!isGroup && (
                <>
                  <div className="h-px border-t w-full" />
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground sm:w-40 sm:flex-shrink-0">Joined</dt>
                    <dd className="mt-1 text-sm text-muted-foreground sm:col-span-2">
                      <time dateTime={joinedDate}>{joinedDate}</time>
                    </dd>
                  </div>
                </>
              )}
            </dl>
          </div>
        </div>
      </div>
    </>
  );
}

interface DeleteGroupAlertProps {
  confirm: boolean;
  onConfirm: (value: React.SetStateAction<boolean>) => void;
  url?: string;
}

export function DeleteGroupAlert({ confirm, onConfirm, url }: DeleteGroupAlertProps) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const { slug: chatId } = useActiveChat();

  const onDelete = React.useCallback(() => {
    setLoading(true);
    axios
      .delete(url || `/api/chats/${chatId}`)
      .then(() => {
        onConfirm(false);
        router.push('/chat');
        router.refresh();
      })
      .catch(() => toast.error('Something went wrong!'))
      .finally(() => {
        setLoading(false);
        router.refresh();
      });
  }, [router, chatId, url]);

  return (
    <AlertModal
      open={confirm}
      onOpenChange={onConfirm}
      disabled={loading}
      onConfirm={onDelete}
      title="Delete Group"
      description="Are you sure you want to delete this conversation? This action cannot be undone."
      classNames={{
        overlay: 'dark:bg-[#111b21fa]',
        content: 'dark:bg-[#182229] rounded-[28px] max-sm:rounded-[28px]',
        onCancle: 'rounded-full bg-transparent transition-colors text-muted-foreground hover:text-color',
        onConfirm: 'rounded-full bg-transparent transition-colors border text-red-500 hover:text-black'
      }}
    />
  );
}
