'use client';
import * as React from 'react';

interface ActiveListStore {
  members: string[];
  add: (id: string) => void;
  remove: (id: string) => void;
  set: (ids: string[]) => void;
}

const ActiveListContext = React.createContext<ActiveListStore | undefined>(undefined);

/**
 *
 * @example
 * const App = () => (
 *   <ActiveListProvider>
 *     <YourComponent />
 *   </ActiveListProvider>
 * );
 */
export function ActiveListProvider({ children }: { children: React.ReactNode }) {
  const [members, setMembers] = React.useState<string[]>([]);

  const add = React.useCallback((id: string) => {
    setMembers(prev => [...prev, id]);
  }, []);

  const remove = React.useCallback((id: string) => {
    setMembers(prev => prev.filter(memberId => memberId !== id));
  }, []);

  const set = React.useCallback((ids: string[]) => {
    setMembers(ids);
  }, []);

  return <ActiveListContext.Provider value={{ members, add, remove, set }}>{children}</ActiveListContext.Provider>;
}

/**
 *
 * @example
 * const Example = () => {
 *   const { members, add, remove, set } = useActiveList();
 *   return (
 *     <div>
 *       <button onClick={() => add('user123')}>Add</button>
 *       <button onClick={() => remove('user123')}>Remove</button>
 *       <div>{JSON.stringify(members)}</div>
 *     </div>
 *   );
 * };
 */
export function useActiveList(): ActiveListStore {
  const context = React.useContext(ActiveListContext);
  if (!context) {
    throw new Error('useActiveList must be used within an ActiveListProvider');
  }
  return context;
}
