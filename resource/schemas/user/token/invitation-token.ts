import * as z from 'zod';
import { containsLetters, passwordMessage, passwordSchema, roleEnum } from '../index';

export const GenerateInvitationTokenSchema = z.object({
  adminId: z.string().min(1, 'Admin ID is required'),
  /** - Jika role='USER' gunakan refId
   * - Jika selain itu, gunakan randomUUID sebagai token dan sekaligus akan menjadi refId nantinya.
   */
  assignedRole: z.optional(roleEnum),
  /** Masa berlaku token dalam hitungan hari.
   * - `Min 1 = 1 days / 24 hours` | `Max 7 = 7 days / 168 hours`
   * - default `1` */
  expiresInDays: z.number().min(1).max(7).optional(),
  maxUsageCount: z.number().min(1).max(100).optional()
});

export type GenerateInvitationTokenValues = z.infer<typeof GenerateInvitationTokenSchema>;

export const RegisterUserWithTokenSchema = z
  .object({
    token: z.string().min(12, {
      message: 'Incorrect or unregistered token'
    }),
    name: z.string().min(2, {
      message: 'Name is required'
    }),
    email: z.string().email(),
    phone: z.string().optional(),
    password: passwordSchema(passwordMessage),
    confirmPassword: passwordSchema('Password does not match')
  })
  .refine(data => data.password === data.confirmPassword, {
    message: passwordMessage,
    path: ['confirmPassword']
  })
  .refine(data => containsLetters(data.name), {
    message: 'Name must contain at least two letters',
    path: ['name']
  });

export type RegisterUserWithTokenValues = z.infer<typeof RegisterUserWithTokenSchema>;
