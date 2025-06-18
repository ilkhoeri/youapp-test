'use client';
import * as React from 'react';
import { AllChatProps } from '@/resource/types/user';
import { User3FillIcon } from '../icons-fill';
import { Select } from '../ui/select';
import { cn } from 'cn';

interface ChatSwitcherProps {
  chats: AllChatProps[] | null;
  isCollapsed: boolean;
}
export function ChatSwitcher(_props: ChatSwitcherProps) {
  const { chats, isCollapsed } = _props;
  const chatsIsDefined = chats && chats.length > 0;

  // Gunakan useMemo untuk menentukan chat pertama yang valid
  const defaultSelectedChat = React.useMemo(() => {
    return chatsIsDefined ? chats![0]?.id : undefined;
  }, [chats]);

  const [selectedChat, setSelectedChat] = React.useState<string | undefined>(defaultSelectedChat);

  // Sinkronisasi: jika chats berubah dan selectedChat tidak valid, reset ke default
  React.useEffect(() => {
    if (!chatsIsDefined) {
      setSelectedChat(undefined);
      return;
    }

    // const stillValid = chats!.some(chat => chat.type === 'GROUP' && chat.id === selectedChat);
    const stillValid = chats!.some(chat => chat.id === selectedChat);
    if (!stillValid) {
      setSelectedChat(defaultSelectedChat);
    }
  }, [chats, selectedChat, defaultSelectedChat]);

  // const chat = chats?.find(chat => chat.type === 'GROUP' && chat.id === selectedChat);
  const chat = chats?.find(chat => chat.id === selectedChat);

  return (
    <Select key={chat?.id} value={selectedChat} onValueChange={setSelectedChat}>
      <Select.Trigger
        chevronIcon={<User3FillIcon size={24} />}
        disabled={!chatsIsDefined}
        className={cn(
          'flex items-center gap-2 [&>span]:line-clamp-1 [&>span]:flex [&>span]:w-full [&>span]:items-center [&>span]:gap-1 [&>span]:truncate [&_svg]:shrink-0 bg-background-theme',
          isCollapsed && 'flex size-9 shrink-0 items-center justify-center p-0 [&>span]:w-auto [&>span]:hidden'
        )}
        aria-label="Select group"
      >
        {!isCollapsed && <Select.Value placeholder="Select an group">{chats ? chats?.find(chat => chat?.id === selectedChat)?.name : '0'}</Select.Value>}
      </Select.Trigger>
      {chatsIsDefined && (
        <Select.Content>
          {chats?.map(chat => (
            <Select.Item key={chat?.id} value={chat?.id}>
              <div className="flex items-center gap-3 [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0 [&_svg]:text-foreground">
                {chat?.name}
                <span className="text-muted-foreground">&#40;{chat?.userIds?.length}&#41;</span>
              </div>
            </Select.Item>
          ))}
          {/* {chats && chats.length > 0 && <Select.Separator />} */}
        </Select.Content>
      )}
    </Select>
  );
}
