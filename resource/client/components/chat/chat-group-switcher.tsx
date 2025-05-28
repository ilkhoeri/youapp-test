'use client';
import * as React from 'react';
import { Account, AllChatProps } from '@/resource/types/user';
import { MotionButton, MotionButtonModal } from '../motion/motion-button';
import { Portal } from '@/resource/hooks/use-open-state';
import { ChatGroup } from './chat-group';
import { ActionBack } from '../actions';
import { ChevronIcon } from '../icons';
import { Select } from '../ui/select';
import { Button } from '../ui/button';
import { cn } from 'cn';
import { ChatSquareCallFillIcon, User3FillIcon } from '../icons-fill';

interface ChatGroupSwitcherProps {
  accounts: Account[];
  chats: AllChatProps[] | null;
  isCollapsed: boolean;
}
export function ChatGroupSwitcher(_props: ChatGroupSwitcherProps) {
  const { chats, isCollapsed, accounts } = _props;
  const [selectedChat, setSelectedChat] = React.useState<string | undefined>(chats?.[0]?.id);

  return (
    <>
      <Select defaultValue={selectedChat} onValueChange={setSelectedChat}>
        <Select.Trigger
          chevronIcon={<User3FillIcon size={24} />}
          className={cn(
            'flex items-center gap-2 [&>span]:line-clamp-1 [&>span]:flex [&>span]:w-full [&>span]:items-center [&>span]:gap-1 [&>span]:truncate [&_svg]:shrink-0 bg-background-theme',
            isCollapsed && 'flex size-9 shrink-0 items-center justify-center p-0 [&>span]:w-auto [&>span]:hidden'
          )}
          aria-label="Select group"
        >
          {!isCollapsed && <Select.Value placeholder="Select an group">{chats ? chats?.find(chat => chat?.id === selectedChat)?.name : '0'}</Select.Value>}
        </Select.Trigger>
        <Select.Content>
          {chats &&
            chats?.map(chat => (
              <Select.Item key={chat?.id} value={chat?.id}>
                <div className="flex items-center gap-3 [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0 [&_svg]:text-foreground">
                  {chat?.name}
                  <span className="text-muted-foreground">&#40;{chat?.userIds?.length}&#41;</span>
                </div>
              </Select.Item>
            ))}
          {/* {chats && chats.length > 0 && <Select.Separator />} */}
        </Select.Content>
      </Select>
    </>
  );
}

interface CreateChatGroupProps {
  accounts: Account[];
}
export function CreateChatGroup({ accounts }: CreateChatGroupProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  return (
    <>
      <MotionButton name="chat-group" className={cn('flex items-center justify-center border rounded-lg ml-auto p-0.5 size-9')} onClick={() => setIsModalOpen(true)}>
        <ChatSquareCallFillIcon size={24} className="transition-colors" />
        <span className="sr-only hidden">Create Chat Group</span>
      </MotionButton>

      <Portal render={isModalOpen}>
        <MotionButtonModal
          name="chat-group"
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          classNames={{
            container: 'bg-gradient-theme flex items-center justify-center px-2.5 !mt-0 z-[150]',
            root: 'mb-auto w-full max-h-[100dvh]',
            content: '',
            header: 'mb-6 mt-8 grid grid-cols-3 justify-items-center items-center',
            body: 'mt-16 size-full'
          }}
          header={
            <>
              <ActionBack instance="stop" onClick={() => setIsModalOpen(false)} className="mr-auto" />
              <p className="text-sm font-semibold"></p>
              <Button
                type="submit"
                suppressHydrationWarning
                form="create-chat-group"
                className={cn(
                  'w-max mr-4 rtl:mr-0 rtl:ml-4 text-sm font-semibold ml-auto py-0 rounded-none bg-clip-text group-[:not(:has(.item-value))]/content:opacity-50 group-[:not(:has(.item-value))]/content:pointer-events-none'
                )}
                style={{ background: '40% 40% / 200% no-repeat text linear-gradient(134.86deg, #ABFFFD 2.64%, #4599DB 102.4%, #AADAFF 102.4%)' }}
              >
                Create
              </Button>
            </>
          }
        >
          <ChatGroup users={accounts} open={isModalOpen} onOpenChange={setIsModalOpen} />
        </MotionButtonModal>
      </Portal>
    </>
  );
}
