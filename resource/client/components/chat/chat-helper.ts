import { getSafeInlineText } from '../inline-editor/helper';

import type { MinimalAccount } from '@/resource/types/user';
import type { MemberInfo } from './types';
import { truncate } from '@/resource/utils/text-parser';

type MergedUser = {
  accounts: MinimalAccount;
  members: MemberInfo;
};

export function getMatchingMembers(accounts: MinimalAccount[], members: MemberInfo[]): MergedUser[] {
  const memberMap = new Map(members.map(m => [m.email, m]));

  return accounts
    .filter(user => memberMap.has(user.email))
    .map(user => ({
      accounts: user,
      members: memberMap.get(user.email)!
    }));
}

export function getMatchingAccounts(accounts: MinimalAccount[], members: MemberInfo[]): MinimalAccount[] {
  const memberMap = new Map(members.map(m => [m.email, m]));
  return accounts.filter(user => memberMap.has(user.email));
}

export function escapeText(text: string | null | undefined): string {
  if (!text) return '';

  const parseText = getSafeInlineText(text);

  return (
    parseText
      // Inline formatting: _, *, ~
      .replace(/___/g, '')
      .replace(/---/g, '')
      .replace(/_(.*?)_/g, '$1')
      .replace(/~(.*?)~/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/```([\s\S]*?)```/g, '$1') // block code (multiline)
      .replace(/`([^`]+)`/g, '$1') // inline code

      // Headings (remove markdown symbols only)
      .replace(/^###### (.*)$/gim, '$1')
      .replace(/^##### (.*)$/gim, '$1')
      .replace(/^#### (.*)$/gim, '$1')
      .replace(/^### (.*)$/gim, '$1')
      .replace(/^## (.*)$/gim, '$1')
      .replace(/^# (.*)$/gim, '$1')

      // Blockquote and pseudo block elements
      .replace(/^> (.*)$/gim, '$1')
      .replace(/^< (.*)$/gim, '$1')

      // Ordered and unordered list items
      .replace(/^\d+\.\s+(.*)$/gm, '$1')
      .replace(/^- (.*)$/gm, '$1')
      .replace(/^\* (.*)$/gm, '$1')

      // HTML cleanup (list artifacts, if any)
      .replace(/(<li>(.*?)<\/li>)/gim, '$2')
      .replace(/<\/?(ul|ol)>/gim, '')
      .replace(/<\/li>\s*<li>/gim, '\n')

      // Remove extra line breaks or trim spaces
      // .replace(/\n{3,}/g, '\n\n') // reduce 3+ newlines to 2
      .replace(/\n+/g, ' ')
      .trim()
  );
}

export function escapeTruncate(text: string | null | undefined, maxWord: number = 180) {
  const input = escapeText(text);
  return truncate(input, maxWord);
}
