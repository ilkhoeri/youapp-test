import * as z from 'zod';

export const ChatGroupSchema = z.object({
  userId: z.string(),
  name: z.optional(z.string()),
  isGroup: z.optional(z.boolean()),
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

export type ChatGroupValues = z.infer<typeof ChatGroupSchema>;

export const ChatSchema = z.object({
  message: z.optional(z.string()),
  image: z.optional(z.string()),
  chatId: z.string()
});

export type ChatValues = z.infer<typeof ChatSchema>;
