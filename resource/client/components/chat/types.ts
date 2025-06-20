import { ChatType } from '@prisma/client';

export type chattype = Lowercase<ChatType>;

export type ChatQuerys = { [P in chattype]: string };

export const chattype = ['private', 'group', 'channel', 'bot'] as const;

export const slugQuerys = (querys: ChatQuerys) => chattype.map(k => querys[k]).find(Boolean);

export const queryEntries = (chatId: string) => Object.fromEntries(chattype.map(type => [type, chatId])) as ChatQuerys;

export type ID = { id: string };

export type SwitchData<TData extends ID> = (TData | null | undefined)[] | null | undefined;
