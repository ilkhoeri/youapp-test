import * as z from 'zod';
import { ChatType, MessageType } from '@prisma/client';

export const CreateChatSchema = z.object({
  userId: z.optional(z.string()),
  name: z.optional(z.string()),
  type: z.nativeEnum(ChatType),
  members: z
    .array(
      z.object({
        value: z.optional(z.string()),
        label: z.optional(z.string())
      })
    )
    .optional()
    .default([])
});

export type CreateChatTypes = z.infer<typeof CreateChatSchema>;

export const MessageSchema = z.object({
  message: z.optional(z.string()),
  mediaUrl: z.optional(z.string()),
  chatId: z.string()
});

export const SendMessage = z.object({
  body: z.optional(z.string()),
  mediaUrl: z.optional(z.string()),
  type: z.optional(z.nativeEnum(MessageType).default('TEXT'))
});

export type SendMessage = z.infer<typeof SendMessage>;
