import * as z from 'zod';
import { isValidURL, isValidUrl } from '../utils/text-parser';

export const siteUrl = (message: string) =>
  z
    .string()
    .min(11)
    .refine(url => isValidURL(url), { message });

export const LinkSchema = z.object({
  id: z.optional(z.string()),
  name: z.optional(z.string()),
  url: siteUrl('URL harus dimulai dengan "https://"')
  // imageUrl: z.optional(z.string()),
});

export const LinksSchema = z.object({
  /** Link media sosial */
  links: z.array(LinkSchema).optional()
});

export const description = z.string().optional().nullable();
export const notes = z.optional(z.array(z.string()));
export const JsonRecordAny = z.record(z.any()).optional().nullable();
