'use client';
import * as React from 'react';
import axios from 'axios';
import { PersonChatFillIcon, User3FillIcon } from '../icons-fill';
import { Select, SelectItemProps } from '../ui/select';
import { AllChatProps, MinimalAccount } from '@/resource/types/user';
import { getMatchingAccounts, useOnlinePresence, useSwitcher } from './chat-hooks';
import { CreateChatTypes } from '@/resource/schemas/chat';
import { useApp } from '../../contexts/app-provider';
import { isSameUserSet } from './messages/helper';
import { ID, SwitchData } from './types';
import { toast } from 'sonner';
import { x } from 'xuxi';
import { cn } from 'cn';

type Align = 'center' | 'end' | 'start';
type Side = 'bottom' | 'top' | 'right' | 'left';

interface GenericSwitcherProps<TData extends ID> {
  items: SwitchData<TData>;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  isCollapsed?: boolean;
  icon?: React.ReactNode;
  getLabel: (item: TData) => string;
  renderExtra?: (item: TData) => SwitchType;
  placeholder?: string;
  loading?: boolean;
  align?: React.ComponentProps<typeof Select.Content>['align'];
  side?: React.ComponentProps<typeof Select.Content>['side'];
}

export function GenericSwitcher<TData extends ID>({
  items = [],
  selectedId,
  onSelect,
  isCollapsed,
  icon,
  getLabel,
  renderExtra,
  placeholder = 'Select item',
  loading,
  align,
  side
}: GenericSwitcherProps<TData>) {
  const itemsIsDefined = items && items?.length > 0;

  const selectedItem = items?.find(item => item?.id === selectedId);

  return (
    <Select key={selectedItem?.id} value={selectedId ?? undefined} onValueChange={onSelect}>
      <Select.Trigger
        aria-label={placeholder}
        disabled={!itemsIsDefined || loading}
        chevronIcon={icon ?? <User3FillIcon size={24} />}
        className={cn(
          'flex items-center gap-2 [&>span]:line-clamp-1 [&>span]:flex [&>span]:w-full [&>span]:items-center [&>span]:gap-1 [&>span]:truncate [&_svg]:shrink-0 bg-background-theme',
          isCollapsed && 'flex size-9 shrink-0 items-center justify-center p-0 [&>span]:w-auto [&>span]:hidden',
          loading && 'text-transparent bg-muted/30 animate-pulse'
        )}
      >
        {!isCollapsed && <Select.Value placeholder={placeholder}>{selectedItem ? getLabel(selectedItem) : placeholder}</Select.Value>}
      </Select.Trigger>

      {itemsIsDefined && (
        <Select.Content align={align} side={side}>
          {items.map(item => (
            <SwitchItem key={item?.id} id={item?.id} name={getLabel(item!)} {...(renderExtra ? renderExtra(item!) : {})} />
          ))}
          {/* {items.length > 0 && <Select.Separator />} */}
        </Select.Content>
      )}
    </Select>
  );
}

interface SwitcherProps {
  chats: AllChatProps[] | null;
  isCollapsed: boolean;
  accounts: MinimalAccount[];
}
export function ChatSwitcher(_props: SwitcherProps) {
  const { accounts, chats, isCollapsed } = _props;

  const { loading, onSwitch, slug } = useSwitcher(chats);

  const { onlineUsers } = useOnlinePresence();

  const memberOnline = getMatchingAccounts(accounts, onlineUsers);

  const totalOnline = (name?: string | null) => x.cnx(name, memberOnline?.length);

  // const [name, setName] = React.useState<string>('');

  // const normalizedData = chats?.map(c => {
  //   return {
  //     ...c,
  //     name: c.name ?? c?.users.find(u => u?.username?.toLowerCase().includes())?.username
  //   };
  // });

  return (
    <GenericSwitcher
      loading={loading}
      items={chats}
      selectedId={slug}
      isCollapsed={true}
      icon={<PersonChatFillIcon size={24} rules="regular" />}
      onSelect={id => onSwitch('group', id)}
      getLabel={chat => {
        const newName = chat.name || chat.users.find(c => chat.userIds?.length === 2 && chat.userIds[1] === c.id)?.username;
        return String(newName);
      }}
      renderExtra={chat => ({ online: chat.userIds?.length > 2 && totalOnline(), total: chat.type === 'GROUP' && chat.userIds?.length })}
      placeholder="Select a group"
    />
  );
}

export function UserSwitcher(_props: SwitcherProps) {
  const { accounts, chats, isCollapsed } = _props;

  const { user: currentUser } = useApp();

  const { loading, onSwitch, slug, setLoading, router } = useSwitcher(accounts);

  if (!currentUser) return null;

  const [roomChat, setRoomChat] = React.useState<boolean | undefined>(false);

  const setValueChange = React.useCallback(
    (id: string) => {
      const members = [currentUser?.id, id];
      const chat = chats?.find(c => isSameUserSet(c.userIds, members));
      const isRoom = chat && isSameUserSet(chat?.userIds, members);
      setRoomChat(isRoom);

      if (isRoom) {
        try {
          onSwitch('private', chat.id);
        } catch (_e) {
        } finally {
          return;
        }
      }

      if (!isRoom) {
        try {
          setLoading(true);
          axios.post('/api/chats', { type: 'PRIVATE', userId: id, members: members } as CreateChatTypes);
        } catch (_e) {
        } finally {
          // setRoomChat will not be available here unless you refetch chats, or handle the new chat
          router.refresh();
          setTimeout(() => {
            const route = `/chat?private=${chat?.id}`;
            router.push(route, { scroll: false });
          }, 500);
          setLoading(false);
          toast.success('Success!');
        }
      }
    },
    [chats, currentUser?.id, onSwitch, router]
  );

  return (
    <GenericSwitcher loading={loading} items={accounts} selectedId={slug} isCollapsed={isCollapsed} onSelect={setValueChange} getLabel={user => x.cnx(user.name)} placeholder="Contact" />
  );
}

type SwitchType = {
  name?: React.ReactNode;
  total?: React.ReactNode;
  online?: React.ReactNode;
};

interface SwitchItemProps extends SwitchType, Omit<SelectItemProps, 'value' | 'id'> {
  selected?: boolean;
  id: string | number | null | undefined;
}
function SwitchItem(_props: SwitchItemProps) {
  const { id, name, total, online, ...props } = _props;
  if (!id) return null;
  return (
    <Select.Item key={id} value={x.cnx(id)} {...props}>
      <div className="flex items-center gap-3">
        <span className="mr-auto">{name}</span>
        {total && <span className="text-muted-foreground text-xs">&#40;{total}&#41;</span>}
        {online && <span className="absolute -left-0.5 size-1.5 z-[50] rounded-full bg-green-600" />}
      </div>
    </Select.Item>
  );
}
