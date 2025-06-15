'use client';
import * as React from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Account, AllChatProps, MinimalAccount } from '@/resource/types/user';
import { useSession } from 'next-auth/react';
import { ScrollIntoViewAnimation, useScrollIntoView } from '@/resource/hooks/use-scroll-into-view';

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

export function useOtherUser(chats: (AllChatProps | { users: MinimalAccount[] }) | null | undefined): MinimalAccount | null {
  const session = useSession();

  try {
    if (!session || !chats) return null;

    const otherUser = React.useMemo(() => {
      const currentUserEmail = session.data?.user?.email;

      const otherUser = chats?.users.filter(user => user?.email !== currentUserEmail);

      return otherUser?.[0];
    }, [session.data?.user?.email, chats?.users]);

    return otherUser;
  } catch (error: any) {
    console.log('Errror,', error.message);
    return null;
  }
}

export type ExpandedState = string | string[] | null | boolean;
export type ExpandedOptions = { multiple?: boolean | undefined };

interface ActiveChatStore extends UseChat, getChatId, InferType<typeof useScrollIntoView> {
  members: string[];
  add: (id: string) => void;
  remove: (id: string) => void;
  set: (ids: string[]) => void;
  scrollableRef: React.RefObject<HTMLDivElement>;
  targetRef: React.RefObject<HTMLDivElement>;
  loading: boolean;
  setLoading: (prev: boolean | ((prev: boolean) => boolean)) => void;
  expanded: (targetId?: string) => boolean;
  setExpanded: (value: string | null | boolean | undefined, opts?: ExpandedOptions) => void;
}

const ActiveListContext = React.createContext<ActiveChatStore | undefined>(undefined);

interface ActiveChatProviderProps extends getChatId {
  children: React.ReactNode;
}

export function ActiveChatProvider({ children, searchQuery }: ActiveChatProviderProps) {
  const [members, setMembers] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [_expanded, _setExpanded] = React.useState<ExpandedState>(false);

  const scrollIntoView = useScrollIntoView<HTMLDivElement, HTMLDivElement>();

  const getChat = useChat({ searchQuery });

  const add = React.useCallback((id: string) => {
    setMembers(prev => [...prev, id]);
  }, []);

  const remove = React.useCallback((id: string) => {
    setMembers(prev => prev.filter(memberId => memberId !== id));
  }, []);

  const set = React.useCallback((ids: string[]) => {
    setMembers(ids);
  }, []);

  const expanded = React.useCallback(
    (targetId?: string) => {
      if (typeof _expanded === 'boolean') {
        return _expanded;
      }
      if (typeof _expanded === 'string') {
        return _expanded === targetId;
      }
      if (Array.isArray(_expanded) && targetId) {
        return _expanded.includes(targetId);
      }
      return false;
    },
    [_expanded]
  );

  const setExpanded = React.useCallback(
    (value: string | null | boolean = !_expanded, opts: ExpandedOptions = {}) => {
      const { multiple = true } = opts;
      _setExpanded(prev => {
        // if (typeof prev === 'boolean' && prev === true && allIds) {
        //   // Kalau masih true (global open), ubah jadi semua ID terbuka
        //   return allIds;
        // }

        if (typeof value === 'boolean' || value === null) {
          return value;
        }

        if (multiple) {
          // Multiple mode: array of ids
          if (Array.isArray(prev)) {
            // Sudah array, toggle id
            if (prev.includes(value)) {
              return prev.filter(id => id !== value);
            } else {
              return [...prev, value];
            }
          } else if (typeof prev === 'string') {
            // Sebelumnya single string → jadikan array
            return prev === value ? [] : [prev, value];
          } else {
            // Sebelumnya null atau boolean
            return [value];
          }
        } else {
          // Single mode
          if (typeof value === 'string' && prev === value) {
            // Kalau klik ID yang sama → tutup
            return null;
          }
          return value;
        }
      });
    },
    [_expanded]
  );

  return (
    <ActiveListContext.Provider value={{ members, add, searchQuery, remove, set, loading, setLoading, expanded, setExpanded, ...getChat, ...scrollIntoView }}>
      {children}
    </ActiveListContext.Provider>
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
  const context = React.useContext(ActiveListContext);
  if (!context) throw new Error('useActiveChat must be used within an ActiveChatProvider');

  return context;
}
