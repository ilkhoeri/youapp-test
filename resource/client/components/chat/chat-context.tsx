'use client';
import * as React from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Account, MinimalAccount } from '@/resource/types/user';
import { OptimisticChat } from '@/resource/types/chats';
import { useReload } from '@/resource/hooks/use-reload';
import { ChatQuerys } from './types';
import { useApp } from '../../contexts/app-provider';
import { OptimisticMessageLocal, useOptimisticMessages } from './hooks/use-optimistic';
import { EnrichedMessage, GroupedMessages, groupMessagesByDate } from './messages/message-helper';

interface getChatId {
  searchQuery: string;
}

export type UseChatOptions = Partial<getChatId>;

interface UseChat {
  isOpen: boolean;
  chatId: string;
}

export function useChat(opts: UseChatOptions = {}): UseChat {
  const { searchQuery } = opts;
  const params = useParams();
  const searchParams = useSearchParams();

  const chatId = React.useMemo(() => {
    const groupchatId = searchQuery && searchParams?.get(searchQuery);
    if (groupchatId) return groupchatId;

    if (!params?.chatId) return '';
    return params.chatId as string;
  }, [searchParams, searchQuery, params?.chatId]);

  const isOpen = React.useMemo(() => !!chatId, [chatId]);

  return React.useMemo<UseChat>(
    () => ({
      isOpen,
      chatId
    }),
    [isOpen, chatId]
  );
}

type UseOtherUserProps = (OptimisticChat | { users: MinimalAccount[] }) | null | undefined;

export function useOtherUser(chat: (OptimisticChat | { users: MinimalAccount[] }) | null | undefined): MinimalAccount | null {
  // const session = useSession();
  const { user: session } = useApp();

  try {
    if (!session || !chat) return null;

    // const currentUserEmail = session.data?.user?.email;
    const currentUserEmail = session?.email;

    const otherUser = React.useMemo(() => {
      // const parseUser = chats?.users.filter(user => user?.email !== currentUserEmail);
      // return parseUser?.[0];

      let parseUser: MinimalAccount | null = null;

      if ('userIds' in chat) {
        const userIds = chat.userIds ?? [];
        if (userIds.length === 2) {
          parseUser = chat.users.find(u => u.email !== currentUserEmail) ?? null;
        }
      }

      parseUser = chat?.users.filter(user => user?.email !== currentUserEmail)?.[0];

      return parseUser;
    }, [currentUserEmail, chat?.users]);

    return otherUser;
  } catch (error: any) {
    console.log('Errror,', error.message);
    return null;
  }
}

type ExpandedStore = { querys: ChatQuerys; chats: OptimisticChat[] };

type UnseenFilter = (msg: EnrichedMessage, index: number) => boolean;

type MessageFilterOptions = {
  includeOwnMessages?: boolean;
  includeSeen?: boolean;
};

interface ActiveChatStore extends ExpandedStore, GroupedMessages, InferType<typeof useReload>, InferType<typeof useOptimisticMessages> {
  members: string[];
  add: (id: string) => void;
  remove: (id: string) => void;
  set: (ids: string[]) => void;
  querys: ChatQuerys;
  chatId: string | undefined;
  currentUser: Account;
  chat: OptimisticChat | undefined;
  users: MinimalAccount[] | undefined;
  otherUsers: MinimalAccount[] | undefined;
  getOtherUser: (chat: OptimisticChat | undefined) => MinimalAccount | undefined;
  getUnseenMessages: (filter?: UnseenFilter, options?: MessageFilterOptions) => EnrichedMessage[];
  getGroupMessagesByDate: (messages: OptimisticMessageLocal[] | undefined) => GroupedMessages;
}

const ActiveChatCtx = React.createContext<ActiveChatStore | undefined>(undefined);

interface ActiveChatProviderProps extends ExpandedStore {
  children: React.ReactNode;
}

export function ActiveChatProvider({ children, querys, chats }: ActiveChatProviderProps) {
  const { user: currentUser } = useApp();

  const reload = useReload();

  const chatId = querys?.private || querys?.group || querys?.channel || querys?.bot;

  const chat = chats?.find(chat => chat.id === chatId);

  const users = chat?.users;

  const initialMessages = chats?.find(c => c.id === chatId)?.messages ?? [];

  const optimistic = useOptimisticMessages(chatId, initialMessages, currentUser);

  const [members, setMembers] = React.useState<string[]>(chat?.userIds ?? []);

  const add = React.useCallback((id: string) => {
    setMembers(prev => [...prev, id]);
  }, []);

  const remove = React.useCallback((id: string) => {
    setMembers(prev => prev.filter(memberId => memberId !== id));
  }, []);

  const set = React.useCallback((ids: string[]) => {
    setMembers(ids);
  }, []);

  const { lastMessage, dateKeys, byDate, ...groupMessages } = groupMessagesByDate(optimistic.messages, currentUser!!);

  const getGroupMessagesByDate = React.useCallback(
    (messages: OptimisticMessageLocal[] | undefined) => {
      return groupMessagesByDate(messages ?? [], currentUser!!);
    },
    [currentUser]
  );

  const otherUsers = React.useMemo(() => {
    if (!chat?.users || chat?.users?.length < 1) return;
    return chat?.users?.filter(user => user.email !== currentUser?.email);
  }, [chatId]);

  const getUnseenMessages = React.useCallback(
    (filter?: UnseenFilter, options: MessageFilterOptions = {}) => {
      return dateKeys.flatMap(date =>
        byDate[date].messages.filter((m, i) => {
          if (!filter?.(m, i)) return false;
          if (!options.includeOwnMessages && m.senderId === currentUser?.id) return false;
          if (!options.includeSeen && m.seenIds.includes(currentUser?.id!)) return false;
          return true;
        })
      );
    },
    [dateKeys, byDate, currentUser?.id]
  );

  const getOtherUser = React.useCallback(
    (chat: OptimisticChat | undefined) => {
      if (!chat) return;

      if ('userIds' in chat) {
        const userIds = chat.userIds ?? [];

        if (userIds.length === 2) {
          return chat.users.find(user => user.email !== currentUser?.email);
        }
      }

      return chat.users.find(user => user?.email !== currentUser?.email);
    },
    [chat?.userIds.length, currentUser?.email]
  );

  return (
    <ActiveChatCtx.Provider
      value={{
        currentUser,
        chats,
        chat,
        users,
        otherUsers,
        getOtherUser,
        members,
        add,
        querys,
        chatId,
        remove,
        set,
        getGroupMessagesByDate,
        getUnseenMessages,
        lastMessage,
        dateKeys,
        byDate,
        ...groupMessages,
        ...optimistic,
        ...reload
      }}
    >
      {children}
    </ActiveChatCtx.Provider>
  );
}

/**
 *
 * @example
 * const Example = () => {
 *   const { members, add, remove, set } = useActiveChat();
 *   return (
 *     <div>
 *       <button onClick={() => add('user123')}>Add</button>
 *       <button onClick={() => remove('user123')}>Remove</button>
 *       <div>{JSON.stringify(members)}</div>
 *     </div>
 *   );
 * };
 */
export function useActiveChat(): ActiveChatStore {
  const context = React.useContext(ActiveChatCtx);
  if (!context) throw new Error('useActiveChat must be used within an ActiveChatProvider');

  return context;
}
