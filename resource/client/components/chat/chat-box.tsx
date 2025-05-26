'use client';
import * as React from 'react';
import { AllChatProps } from '@/resource/types/user';
import { useSession } from 'next-auth/react';
import { formatShortTime } from '@/resource/const/times-helper';
import { useRouter } from 'next/navigation';
import { Avatar } from '../ui/avatar-oeri';
import { useOtherUser } from './chat';
import { cn } from 'cn';
import { ChatAvatars } from './component';

interface ChatBoxProps {
  data: AllChatProps;
  selected?: boolean;
}

export function ChatBox(_props: ChatBoxProps) {
  const { data, selected } = _props;
  const otherUser = useOtherUser(data);
  const session = useSession();
  const router = useRouter();

  const handleClick = React.useCallback(() => {
    router.push(`/chat/${data.id}`);
  }, [data, router]);

  const lastMessage = React.useMemo(() => {
    const messages = data.messages || [];

    return messages[messages.length - 1];
  }, [data.messages]);

  const userEmail = React.useMemo(() => session.data?.user?.email, [session.data?.user?.email]);

  const hasSeen = React.useMemo(() => {
    if (!lastMessage) return false;

    const seenArray = lastMessage.seen || [];

    if (!userEmail) return false;

    return seenArray.filter(user => user.email === userEmail).length !== 0;
  }, [userEmail, lastMessage]);

  const lastMessageText = React.useMemo(() => {
    if (lastMessage?.image) return 'Sent an image';

    if (lastMessage?.body) return lastMessage?.body;

    return 'Started a conversation';
  }, [lastMessage]);

  return (
    <div onClick={handleClick} className={cn('w-full relative flex items-center space-x-3 py-3 px-4 rounded-lg transition cursor-pointer', selected && 'bg-color text-background')}>
      <ChatAvatars data={data} otherUser={otherUser} />
      <div className="min-w-0 flex-1">
        <div className="focus:outline-none">
          <span className="absolute inset-0" aria-hidden="true" />
          <div className="flex justify-between items-center mb-1">
            <p className="text-md font-medium text-color">{data?.name || otherUser?.name}</p>
            {lastMessage?.createdAt && <p className="text-xs text-muted-foreground font-light">{formatShortTime(new Date(lastMessage.createdAt))}</p>}
          </div>
          <p className={cn('truncate text-xs', hasSeen ? 'text-muted-foreground' : 'text-color')}>{lastMessageText}</p>
        </div>
      </div>
    </div>
  );
}
