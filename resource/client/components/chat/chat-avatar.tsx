import { Avatar } from '../ui/avatar-oeri';
import { UserFillIcon, User3FillIcon, User2FillIcon } from '../icons-fill';
import type { Chat } from '@prisma/client';
import type { MinimalAccount } from '@/resource/types/user';
import { useOnlinePresence } from './chat-hooks';

interface ChatAvatarsProps {
  data: (Chat & { users: MinimalAccount[] }) | null;
  otherUser: MinimalAccount | null | undefined;
}
export function ChatAvatars({ data, otherUser }: ChatAvatarsProps) {
  const { isOnline } = useOnlinePresence();

  if (data?.type === 'GROUP') {
    const MAX_VISIBLE = 3,
      users = data.users ?? [],
      visibleUsers = users.slice(0, MAX_VISIBLE),
      remainingCount = users.length - MAX_VISIBLE;

    return (
      <Avatar.Group size={32}>
        {visibleUsers.map(user => (
          <Avatar key={user?.refId} src={user?.image} fallback={user?.name} alt={user?.username} />
        ))}
        {remainingCount > 0 && <Avatar initialLimit={4} fallback={`+${remainingCount}`} />}
      </Avatar.Group>
    );
  }

  // return (
  //   <div className="flex items-center gap-2">
  //     <Avatar src={otherUser?.image} fallback={otherUser?.name} alt={otherUser?.firstName} />
  //     {otherUser && isOnline(otherUser?.id) ? <span className="text-green-500 text-sm">Online</span> : <span className="text-gray-400 text-sm">Offline</span>}
  //   </div>
  // );

  // 1-on-1 avatar
  return <Avatar src={otherUser?.image} fallback={otherUser?.name} alt={otherUser?.firstName} />;
}

export function ChatGroupAvatar({ data }: Pick<ChatAvatarsProps, 'data'>) {
  const fallbackIcon = data?.userIds.length === 2 ? <User2FillIcon size={28} /> : data && data?.userIds.length > 2 ? <User3FillIcon size={28} /> : <UserFillIcon size={28} />;

  return (
    <Avatar
      src={data?.avatarUrl}
      fallback={fallbackIcon}
      alt={data?.name ?? ''}
      size={32}
      rootProps={{
        role: 'button',
        tabIndex: 0,
        'aria-label': `Group - ${data?.name}`,
        className: 'rounded-full bg-muted/35 text-color/50'
      }}
    />
  );
}
