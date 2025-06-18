'use client';
import * as React from 'react';
import { AllChatProps, MinimalAccount } from '@/resource/types/user';
import { useActiveChat } from './chat-context';
import { User3FillIcon } from '../icons-fill';
import { Select, SelectItemProps } from '../ui/select';
import { x } from 'xuxi';
import { cn } from 'cn';
import { useSwitchChat } from './chat-hooks';
import { useRouter } from 'next/navigation';

interface SwitcherProps {
  chats: AllChatProps[] | null;
  isCollapsed: boolean;
  accounts: MinimalAccount[];
}
export function ChatSwitcher(_props: SwitcherProps) {
  const { accounts, chats, isCollapsed } = _props;
  const router = useRouter();

  const { loading, setLoading, searchQuery: query, searchSlug: chatId } = useActiveChat();

  const chatsIsDefined = chats && chats.length > 0;

  const defaultSelectedChat = React.useMemo(() => {
    // return chatsIsDefined ? chats![0]?.id : undefined;
    if (!chatsIsDefined) return;
    return chatId ?? undefined;
  }, [chatId, chats]);

  const [selectedChat, setSelectedChat] = React.useState<string | undefined>(defaultSelectedChat);

  React.useEffect(() => {
    if (!chatsIsDefined) {
      setSelectedChat(undefined);
      return;
    }
    // const stillValid = chats!.some(chat => chat.type === 'GROUP' && chat.id === selectedChat);
    const stillValid = chats!.some(chat => chat.id === selectedChat);
    if (chatId) setSelectedChat(chatId);
    if (!stillValid) setSelectedChat(defaultSelectedChat);
  }, [chatId, chats, selectedChat, defaultSelectedChat]);

  // const chat = chats?.find(chat => chat.type === 'GROUP' && chat.id === selectedChat);
  const chat = chats?.find(chat => chat.id === chatId);

  const setValueChange = React.useCallback(
    (id: string | undefined) => {
      const route = query ? `/chat?${query}=${id}` : `/chat/${id}`;
      setLoading(true);
      setSelectedChat(id);
      router.push(route, { scroll: false });
    },
    [query]
  );

  return (
    <Select key={chat?.id} value={selectedChat} onValueChange={setValueChange}>
      <Select.Trigger
        chevronIcon={<User3FillIcon size={24} />}
        disabled={!chatsIsDefined}
        aria-label="Select group"
        className={cn(
          'flex items-center gap-2 [&>span]:line-clamp-1 [&>span]:flex [&>span]:w-full [&>span]:items-center [&>span]:gap-1 [&>span]:truncate [&_svg]:shrink-0 bg-background-theme',
          isCollapsed && 'flex size-9 shrink-0 items-center justify-center p-0 [&>span]:w-auto [&>span]:hidden',
          loading && 'text-transparent bg-muted/30 animate-pulse'
        )}
      >
        {!isCollapsed && <Select.Value placeholder="Select chat">{chat ? chat.name : 'Select chat'}</Select.Value>}
      </Select.Trigger>
      {chatsIsDefined && <Select.Content>{chats?.map(chat => <SwitchItem key={chat?.id} id={chat?.id} name={chat?.name} total={chat?.userIds?.length} />)}</Select.Content>}
    </Select>
  );
}

export function UserSwitcher(_props: SwitcherProps) {
  const { accounts, chats, isCollapsed } = _props;

  const accountsIsDefined = accounts && accounts.length > 0;

  // Gunakan useMemo untuk menentukan user pertama yang valid
  const defaultSelectedUser = React.useMemo(() => {
    return accountsIsDefined ? accounts![0]?.id : undefined;
  }, [accounts]);

  const [selectedUser, setSelectedUser] = React.useState<string | undefined>(defaultSelectedUser);

  // Sinkronisasi: jika accounts berubah dan selectedUser tidak valid, reset ke default
  React.useEffect(() => {
    if (!accountsIsDefined) {
      setSelectedUser(undefined);
      return;
    }

    // const stillValid = accounts!.some(user => user.type === 'GROUP' && user.id === selectedUser);
    const stillValid = accounts!.some(user => user.id === selectedUser);
    if (!stillValid) {
      setSelectedUser(defaultSelectedUser);
    }
  }, [accounts, selectedUser, defaultSelectedUser]);

  // const user = accounts?.find(user => user.type === 'GROUP' && user.id === selectedUser);
  const user = accounts?.find(user => user.id === selectedUser);

  return (
    <Select key={user?.id} value={selectedUser} onValueChange={setSelectedUser}>
      <Select.Trigger
        chevronIcon={<User3FillIcon size={24} />}
        disabled={!accountsIsDefined}
        className={cn(
          'flex items-center gap-2 [&>span]:line-clamp-1 [&>span]:flex [&>span]:w-full [&>span]:items-center [&>span]:gap-1 [&>span]:truncate [&_svg]:shrink-0 bg-background-theme',
          isCollapsed && 'flex size-9 shrink-0 items-center justify-center p-0 [&>span]:w-auto [&>span]:hidden'
        )}
        aria-label="Select group"
      >
        {!isCollapsed && <Select.Value placeholder="Select an group">{accounts ? accounts?.find(user => user?.id === selectedUser)?.name : ''}</Select.Value>}
      </Select.Trigger>
      {accountsIsDefined && (
        <Select.Content>
          {accounts?.map(user => <SwitchItem key={user?.id} id={user?.id} name={user?.name} />)}
          {/* {accounts && accounts.length > 0 && <Select.Separator />} */}
        </Select.Content>
      )}
    </Select>
  );
}

type SwitchType = Partial<Record<'id' | 'name' | 'total', string | number | null | undefined>>;

interface ChatSwitchProps {
  data: AllChatProps;
}
function ChatSwitch(data: AllChatProps) {
  const { setValueChange, selected, otherUser, lastMessage, hasSeen, lastMessageText } = useSwitchChat(data);
  return <SwitchItem onClick={() => setValueChange()} id={data.id} name={data.name} total={data?.userIds?.length} />;
}

interface SwitchItemProps extends SwitchType, Omit<SelectItemProps, 'value' | 'id'> {
  selected?: boolean;
}
function SwitchItem(_props: SwitchItemProps) {
  const { id, name, total, ...props } = _props;
  if (!id) return null;
  return (
    <Select.Item key={id} value={x.cnx(id)} {...props}>
      <div className="flex items-center gap-3 [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0 [&_svg]:text-foreground">
        {name}
        {total && <span className="text-muted-foreground">&#40;{total}&#41;</span>}
      </div>
    </Select.Item>
  );
}
