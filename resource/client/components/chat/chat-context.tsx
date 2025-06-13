'use client';
import * as React from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Account, AllChatProps, MinimalAccount } from '@/resource/types/user';
import { useSession } from 'next-auth/react';
import { ScrollIntoViewAnimation, useScrollIntoView } from '@/resource/hooks/use-scroll-into-view';

export interface UseChatOptions {
  searchQuery?: string;
}

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

export function useOtherUser(chats: AllChatProps | { users: MinimalAccount[] }) {
  const session = useSession();

  const otherUser = React.useMemo(() => {
    const currentUserEmail = session.data?.user?.email;

    const otherUser = chats.users.filter(user => user?.email !== currentUserEmail);

    return otherUser[0];
  }, [session.data?.user?.email, chats.users]);

  return otherUser;
}

interface ActiveChatStore extends InferType<typeof useScrollIntoView> {
  members: string[];
  add: (id: string) => void;
  remove: (id: string) => void;
  set: (ids: string[]) => void;
  scrollableRef: React.RefObject<HTMLDivElement>;
  targetRef: React.RefObject<HTMLDivElement>;
}

const ActiveListContext = React.createContext<ActiveChatStore | undefined>(undefined);

/**
 *
 * @example
 * const App = () => (
 *   <ActiveChatProvider>
 *     <YourComponent />
 *   </ActiveChatProvider>
 * );
 */
export function ActiveChatProvider({ children }: { children: React.ReactNode }) {
  const [members, setMembers] = React.useState<string[]>([]);

  const scrollIntoView = useScrollIntoView<HTMLDivElement, HTMLDivElement>();

  const add = React.useCallback((id: string) => {
    setMembers(prev => [...prev, id]);
  }, []);

  const remove = React.useCallback((id: string) => {
    setMembers(prev => prev.filter(memberId => memberId !== id));
  }, []);

  const set = React.useCallback((ids: string[]) => {
    setMembers(ids);
  }, []);

  return <ActiveListContext.Provider value={{ members, add, remove, set, ...scrollIntoView }}>{children}</ActiveListContext.Provider>;
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
  const context = React.useContext(ActiveListContext);
  if (!context) throw new Error('useActiveChat must be used within an ActiveChatProvider');

  return context;
}
