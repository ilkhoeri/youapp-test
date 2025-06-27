'use client';
import * as React from 'react';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { ArchiveFillIcon, ArchiveJunkFillIcon, DotsFillIcon, ForwardFillIcon, PencilFillIcon, ReplyAllFillIcon, ReplyFillIcon, TrashFillIcon } from '../icons-fill';
import { formatPrettyDate } from '@/resource/const/times-helper';
import { useIsMobile } from '@/resource/hooks/use-device-query';
import { useOtherUser, useActiveChat } from './chat-context';
import { SheetsBreakpoint } from '../sheets-breakpoint';
import { MinimalAccount } from '@/resource/types/user';
import { useOnlinePresence } from './hooks/use-online-presence';
import { ChatAvatars } from './chat-avatar';
import { useRouter } from 'next/navigation';
import { AlertModal } from '../alert';
import { Chat } from '@prisma/client';
import { toast } from 'sonner';
import axios from 'axios';
import { cloudinaryUpload } from '../fields/cloudinary-handler';
import { InlineEditable } from '../inline-editor/inline-editable';

const ICON_SIZE: number = 20;

// type ChatHeaderProps = Pick<GroupProfileProps, 'chat'>;

export function ChatHeader() {
  // const otherUser = useOtherUser(chat);

  const isMediaQuery = useIsMobile();

  const [confirm, onConfirm] = React.useState(false);

  const { members, chat, otherUser } = useActiveChat();

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

interface GroupProfileProps extends DeleteGroupAlertProps {
  chat: (Chat & { users: MinimalAccount[] }) | undefined;
}

function GroupProfile({ chat, confirm, onConfirm }: GroupProfileProps) {
  if (!chat) return null;
  const [loading, setLoading] = React.useState<boolean>(false);

  const otherUser = useOtherUser(chat);

  const isGroup = chat.type === 'GROUP';

  const lastSeen = React.useMemo(() => {
    if (!otherUser?.lastSeen) return null;
    return formatPrettyDate(new Date(otherUser?.lastSeen));
  }, [otherUser?.lastSeen]);

  const title = React.useMemo(() => {
    return chat.name || otherUser?.username;
  }, [chat.name, otherUser?.username]);

  const { members, onReload } = useActiveChat();
  const { isOnline } = useOnlinePresence();

  const isActive = members.indexOf(otherUser?.email!) !== -1;

  const statusText = React.useMemo(() => {
    if (chat?.type === 'GROUP') return `${chat?.users.length} members`;
    if ((otherUser && isOnline(otherUser?.id)) || isActive) return 'Online';
    return 'Offline';
  }, [chat, otherUser?.id, isOnline, isActive]);

  const handleChange = React.useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isGroup) return;
      setLoading(true);

      const file = e.target.files?.[0];
      if (!file) return;

      const res = await cloudinaryUpload(file);

      if (res.data) {
        try {
          await axios.patch(`/api/chats/${chat.id}`, { avatarUrl: res.data.secure_url });
          onReload();
        } catch (error) {
          console.error('Upload to DB failed', error);
        }
      } else {
        console.error('Cloudinary error:', res?.error?.message);
      }
      setLoading(false);
    },
    [chat.id, isGroup]
  );

  return (
    <>
      <div className="relative mt-6 flex-1 px-4 sm:px-6 max-h-full overflow-hidden">
        <div className="flex flex-col items-center max-h-full">
          <InlineEditable
            className="font-semibold cursor-text w-max flex items-center justify-center"
            defaultValue={title}
            onBlurOrSubmit={async ({ value, defaultValue, onChange }) => {
              if (chat.type === 'GROUP' && value !== defaultValue) {
                const prev = defaultValue;
                onChange(value); // Optimistic update
                try {
                  const res = await fetch(`/api/chats/${chat.id}`, {
                    method: 'PATCH',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name: value })
                  });

                  if (!res.ok) {
                    console.error('Failed to update');
                  }

                  onReload();
                } catch (error) {
                  onChange(prev); // Revert jika gagal
                  console.error('Error:', error);
                }
              }
            }}
          >
            {({ editing, value }) => {
              if (!editing) return value;
              return (
                <input
                  type="text"
                  name="change-name"
                  id="change-name"
                  aria-label="change-name"
                  value={value as string}
                  className="bg-transparent w-max max-w-fit text-center border-0 outline-0 focus-visible:ring-0 focus-visible:outline-0"
                  // onChange={() => {}} // akan diinject ulang oleh cloneElement
                />
              );
            }}
          </InlineEditable>

          <div className="pt-4 pb-2 relative">
            <ChatAvatars size={84} data={chat} otherUser={otherUser} />
            {isGroup && (
              <label htmlFor="change-avatar" className="absolute -right-1 bottom-1 p-[5px] bg-muted/20 hover:bg-muted/35 cursor-pointer rounded-full">
                <PencilFillIcon size={20} />
                <input type="file" accept="image/*" id="change-avatar" name="change-avatar" aria-label="change-avatar" hidden className="sr-only" onChange={handleChange} />
              </label>
            )}
          </div>
          <div className="text-sm text-muted-foreground">{statusText}</div>
          <div className="flex gap-10 py-8">
            <div onClick={() => onConfirm(true)} className="flex flex-col gap-1 items-center cursor-pointer hover:opacity-75 rounded-full text-white">
              <TrashFillIcon size={20} />
              <span className="text-xs font-light text-muted-foreground">Delete</span>
            </div>
          </div>
          <div className="text-sm font-medium text-muted-foreground mr-auto pl-6 py-2">{isGroup ? 'Members' : 'Email'}</div>
          <div className="w-full pb-5 pt-5 sm:pt-0 px-4 sm:px-6 max-h-full overflow-y-auto">
            <dl className="grid grid-flow-row overflow-y-auto max-h-full">
              {isGroup &&
                chat.users.map(user => {
                  const online = isOnline(user.id);
                  return (
                    <div key={user.id} className="flex flex-row items-center gap-4 p-4 rounded-lg cursor-pointer transition-colors max-md:active:bg-muted/60 md:hover:bg-muted/60">
                      <dt
                        className="i-avatar"
                        style={
                          {
                            '--user-avatar-size': '32px',
                            '--user-avatar': user?.image && `url("${user?.image}")`
                          } as React.CSSProperties
                        }
                      >
                        {online && <span className="absolute -left-px -top-px size-2.5 z-[50] rounded-full bg-green-600" />}
                      </dt>
                      <dd className="flex flex-row items-center text-sm text-muted-foreground size-full">
                        <span className="mr-auto">{user?.username}</span>
                        {(online || lastSeen) && (
                          <span className="text-[80%]">
                            {online ? 'Online' : lastSeen && 'Last '}
                            {lastSeen && <time dateTime={lastSeen}>{lastSeen}</time>}
                          </span>
                        )}
                      </dd>
                    </div>
                  );
                })}
              {!isGroup && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground sm:w-40 sm:flex-shrink-0"></dt>
                  <dd className="mt-1 text-sm text-muted-foreground sm:col-span-2">{otherUser?.email}</dd>
                </div>
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
  const { chatId } = useActiveChat();

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
