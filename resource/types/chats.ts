import * as db from '@prisma/client';
import { MinimalAccount } from './user';

export type MessageReaction = db.Reaction & {
  user: MinimalAccount | null | undefined;
};

export type OptimisticMessage = db.Message & {
  sender: MinimalAccount;
  seen: MinimalAccount[];
  reactions?: MessageReaction[] | null | undefined;
};

export type OptimisticChat = db.Chat & {
  users: MinimalAccount[];
  messages: OptimisticMessage[];
};

export const payloadMessage = {
  id: true,
  chatId: true,
  status: true,
  senderId: true,
  body: true,
  mediaUrl: true,
  seenIds: true,
  createdAt: true
};
