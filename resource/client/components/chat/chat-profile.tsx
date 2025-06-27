'use client';
import * as React from 'react';
import axios from 'axios';
import { ChatAvatars } from './chat-avatar';
import { useActiveChat } from './chat-context';
import { ChatDeleteAlertProps } from './chat-alert';
import { OptimisticChat } from '@/resource/types/chats';
import { PencilFillIcon, TrashFillIcon } from '../icons-fill';
import { useOnlinePresence } from './hooks/use-online-presence';
import { cloudinaryUpload } from '../fields/cloudinary-handler';
import { formatPrettyDate } from '@/resource/const/times-helper';
import { InlineEditable } from '../inline-editor/inline-editable';
import { Account, MinimalAccount } from '@/resource/types/user';

interface ChatProfileProps {
  chat: OptimisticChat | undefined;
  onConfirmChange?: ChatDeleteAlertProps['onConfirm'];
}

export function ChatProfile({ chat, onConfirmChange }: ChatProfileProps) {
  const { members, onReload, getOtherUser, currentUser } = useActiveChat();

  if (!chat) return null;

  const { isOnline } = useOnlinePresence();

  const [loading, setLoading] = React.useState<boolean>(false);

  const otherUser = getOtherUser(chat);

  const isGroup = chat?.type === 'GROUP';

  const isActive = members.indexOf(otherUser?.email!) !== -1;

  const statusText = React.useMemo(() => {
    if (chat?.type === 'GROUP') return `${chat?.users.length} members`;
    if ((otherUser && isOnline(otherUser?.id)) || isActive) return 'Online';
    return 'Offline';
  }, [chat, otherUser?.id, isOnline, isActive]);

  const shared = { chat, otherUser };

  const isDeleted = onConfirmChange && chat?.admins.includes(currentUser?.id!) && !['CHANNEL', 'BOT'].includes(chat?.type!);

  return (
    <>
      <div className="relative mt-6 flex-1 px-4 sm:px-6 max-h-full overflow-hidden">
        <div className="flex flex-col items-center max-h-full">
          <ProfileName onReload={onReload} {...shared} />

          <ProfileAvatar onReload={onReload} onLoadingChange={setLoading} {...shared} />

          <div className="text-sm text-muted-foreground">{statusText}</div>
          <div className="flex gap-10 py-8">
            {isDeleted && (
              <div onClick={() => onConfirmChange?.(true)} className="flex flex-col gap-1 items-center cursor-pointer hover:opacity-75 rounded-full text-white">
                <TrashFillIcon size={20} />
                <span className="text-xs font-light text-muted-foreground">Delete</span>
              </div>
            )}
          </div>
          <div className="text-sm font-medium text-muted-foreground mr-auto pl-6 py-2">{isGroup ? 'Members' : 'Email'}</div>
          <div className="w-full pb-5 pt-5 sm:pt-0 px-4 sm:px-6 max-h-full overflow-y-auto">
            <ProfileList currentUser={currentUser} isOnline={isOnline} {...shared} />
          </div>
        </div>
      </div>
    </>
  );
}

function ProfileAvatar({
  chat,
  otherUser,
  onReload,
  onLoadingChange
}: Pick<ChatProfileProps, 'chat'> & { otherUser: MinimalAccount | undefined; onReload: () => void; onLoadingChange: (prev: boolean) => void }) {
  if (!chat) return null;

  const handleChange = React.useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (chat?.type !== 'GROUP') return;
      onLoadingChange(true);

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
      onLoadingChange(false);
    },
    [chat.id, chat?.type]
  );

  return (
    <div className="pt-4 pb-2 relative">
      <ChatAvatars size={84} chat={chat} otherUser={otherUser} />
      {chat?.type === 'GROUP' && (
        <label htmlFor="change-avatar" className="absolute -right-1 bottom-1 p-[5px] bg-muted/20 hover:bg-muted/35 cursor-pointer rounded-full">
          <PencilFillIcon size={20} />
          <input type="file" accept="image/*" id="change-avatar" name="change-avatar" aria-label="change-avatar" hidden className="sr-only" onChange={handleChange} />
        </label>
      )}
    </div>
  );
}

function ProfileName({ chat, otherUser, onReload }: Pick<ChatProfileProps, 'chat'> & { otherUser: MinimalAccount | undefined; onReload: () => void }) {
  if (!chat) return null;

  const title = React.useMemo(() => {
    if (chat.type === 'PRIVATE') return otherUser?.username ?? '';
    return chat?.name ?? '';
  }, [chat?.name, otherUser?.username, chat?.type]);

  if (chat?.type !== 'GROUP') {
    return (
      <div className="font-semibold cursor-default w-max flex items-center justify-center">
        <h6>{title}</h6>
      </div>
    );
  }

  return (
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
  );
}

function ProfileList({
  chat,
  currentUser,
  otherUser,
  isOnline
}: Pick<ChatProfileProps, 'chat'> & { currentUser: Account | undefined; otherUser: MinimalAccount | undefined; isOnline: (userId: string | null | undefined) => boolean }) {
  if (!chat) return null;

  const isGroup = chat?.type === 'GROUP';

  const lastSeen = React.useMemo(() => {
    if (!otherUser?.lastSeen) return null;
    return formatPrettyDate(new Date(otherUser?.lastSeen));
  }, [otherUser?.lastSeen]);

  return (
    <dl className="grid grid-flow-row overflow-y-auto max-h-full">
      {isGroup &&
        chat?.users?.map(user => {
          const online = isOnline(user.id);
          const username = user?.id === currentUser?.id ? `${user?.username} (You)` : user?.username;

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
              <dd className={`flex flex-row items-center text-sm size-full ${online ? 'text-color' : 'text-muted-foreground'}`}>
                <span className="mr-auto">{username}</span>
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
  );
}
