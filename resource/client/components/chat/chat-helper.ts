import type { MinimalAccount } from '@/resource/types/user';
import type { MemberInfo } from './types';

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
