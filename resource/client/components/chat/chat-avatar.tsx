import { Avatar } from '../ui/avatar-oeri';
import { UserFillIcon, User3FillIcon, User2FillIcon, BotFillIcon, PersonSyncFillIcon, PersonFillIcon } from '../icons-fill';
import type { Chat } from '@prisma/client';
import type { MinimalAccount } from '@/resource/types/user';

interface ChatAvatarsProps extends React.ComponentProps<typeof Avatar> {
  chat: (Chat & { users: MinimalAccount[] }) | null | undefined;
  otherUser: MinimalAccount | null | undefined;
  grouping?: boolean;
}

const SIZEICON = 'calc(var(--avatar-size) * (87.5 / 100))';

function fallbackMap(chat: ChatAvatarsProps['chat']) {
  const iconMap = {
    BOT: <BotFillIcon size={SIZEICON} />,
    CHANNEL: <PersonSyncFillIcon size={SIZEICON} />,
    PRIVATE: <PersonFillIcon size={SIZEICON} />,
    GROUP: chat && (chat?.userIds.length === 2 ? <User2FillIcon size={SIZEICON} /> : chat?.userIds.length > 2 ? <User3FillIcon size={SIZEICON} /> : <UserFillIcon size={SIZEICON} />)
  };
  if (!chat?.type) return '';
  return iconMap[chat?.type]!;
}

export function ChatAvatars({ chat, otherUser, grouping, size = 32, src, fallback, alt, rootProps, ...avtProps }: ChatAvatarsProps) {
  const imageUrl = chat?.type === 'PRIVATE' ? otherUser?.image : chat?.avatarUrl;

  if (chat?.type === 'GROUP' && grouping) {
    const MAX_VISIBLE = 3,
      users = chat.users ?? [],
      visibleUsers = users.slice(0, MAX_VISIBLE),
      remainingCount = users.length - MAX_VISIBLE;

    return (
      <Avatar.Group size={size}>
        {visibleUsers.map(user => (
          <Avatar {...avtProps} key={user?.id} src={user?.image} fallback={user?.username} alt={user?.username} />
        ))}
        {remainingCount > 0 && <Avatar {...avtProps} initialLimit={4} fallback={`+${remainingCount}`} />}
      </Avatar.Group>
    );
  }

  // 1-on-1 avatar
  return (
    <Avatar
      {...avtProps}
      src={imageUrl}
      fallback={fallbackMap(chat)}
      alt={otherUser?.username}
      size={size}
      rootProps={{
        role: 'button',
        tabIndex: 0,
        'aria-label': otherUser?.username,
        className: 'rounded-full bg-muted/35 text-color/50'
      }}
    />
  );
  // return <Avatar src={otherUser?.image} fallback={otherUser?.name} alt={otherUser?.firstName} />;
}
