import { Account } from '@/resource/types/user';

export type TablesParams = Readonly<{
  params: Promise<{ tables: string[] }>;
  searchParams: Promise<{ q: string; tab: string }>;
  // searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}>;

export function getSlugPart(slug: string[], index: 0 | 1 | 2 | 3 | (number & {})) {
  return slug?.[index];
}

export interface HANDLEROUTESPROPS {
  q: string;
  tab: string;
  tables: string[];
  session: Account;
}
