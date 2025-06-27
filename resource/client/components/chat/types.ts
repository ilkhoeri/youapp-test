import { ChatType } from '@prisma/client';

export type chattype = Lowercase<ChatType>;

export type ChatQuerys = { [P in chattype]: string };

export const chattype = ['private', 'group', 'channel', 'bot'] as const;

export const slugQuerys = (querys: ChatQuerys) => chattype.map(k => querys[k]).find(Boolean);

export const queryEntries = (chatId: string) => Object.fromEntries(chattype.map(type => [type, chatId])) as ChatQuerys;

export type ID = { id: string };

export type SwitchData<TData extends ID> = (TData | null | undefined)[] | null | undefined;

// Member Info
/**
 * @example
 * type Emails = 'janedoe123@gmail.com' | 'johndoe123@gmail.com';
 * const members: MembersPresence<Emails> = {
 *   members: {
 *     'janedoe123@gmail.com': {
 *       id: '684568324a6f3739c22fb2b6',
 *       email: 'janedoe123@gmail.com',
 *       name: 'janedoe',
 *       avatar: ''
 *     },
 *     'johndoe123@gmail.com': {
 *       id: '684567d94a6f3739c22fb2b4',
 *       email: 'johndoe123@gmail.com',
 *       name: 'johndoe',
 *       avatar: ''
 *     }
 *   },
 *   count: 2,
 *   myID: 'johndoe123@gmail.com',
 *   me: {
 *     id: 'johndoe123@gmail.com',
 *     info: {
 *       id: '684567d94a6f3739c22fb2b4',
 *       email: 'johndoe123@gmail.com',
 *       name: 'johndoe',
 *       avatar: ''
 *     }
 *   }
 * };
 */
export type MembersPresence<TEmails extends string = string> = {
  members: MembersMap<TEmails>;
  count: number;
  myID: TEmails;
  me: {
    id: TEmails;
    info: MemberInfo<TEmails>;
  };
};
export type MembersMap<T extends string> = {
  [K in T]: {
    id: string;
    email: K;
    name: string;
    avatar: string;
  };
};
export type MemberInfo<TEmail extends string = string> = {
  id: string;
  email: TEmail;
  name: string;
  avatar: string;
};
