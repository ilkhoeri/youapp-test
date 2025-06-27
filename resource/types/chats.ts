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

export const pickFromOtherUser = {
  id: true,
  // refId: true,
  email: true,
  image: true,
  // name: true,
  username: true,
  // firstName: true,
  // lastName: true,
  // lastOnline: true,
  lastSeen: true
  // chatIds: true,
  // createdAt: true
}; // as db.Prisma.UserSelect;
