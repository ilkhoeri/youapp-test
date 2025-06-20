import { Avatar } from '../ui/avatar-oeri';
import { UserFillIcon, User3FillIcon, User2FillIcon } from '../icons-fill';
import type { Chat } from '@prisma/client';
import type { MinimalAccount } from '@/resource/types/user';

interface ChatAvatarsProps {
  data: (Chat & { users: MinimalAccount[] }) | null;
  otherUser: MinimalAccount | null | undefined;
  grouping?: boolean;
}
export function ChatAvatars({ data, otherUser, grouping }: ChatAvatarsProps) {
  const imageUrl = data?.type === 'PRIVATE' ? otherUser?.image : data?.avatarUrl;
  const fallbackIcon = data ? (
    data?.userIds.length === 2 && data.type === 'GROUP' ? (
      <User2FillIcon size={28} />
    ) : data?.userIds.length > 2 ? (
      <User3FillIcon size={28} />
    ) : (
      <UserFillIcon size={28} />
    )
  ) : undefined;

  if (data?.type === 'GROUP' && grouping) {
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

  // 1-on-1 avatar
  return (
    <Avatar
      src={imageUrl}
      fallback={fallbackIcon}
      alt={otherUser?.username}
      size={32}
      rootProps={{
        role: 'button',
        tabIndex: 0,
        'aria-label': otherUser?.firstName,
        className: 'rounded-full bg-muted/35 text-color/50'
      }}
    />
  );
  // return <Avatar src={otherUser?.image} fallback={otherUser?.name} alt={otherUser?.firstName} />;
}
