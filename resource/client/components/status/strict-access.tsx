'use client';
import * as React from 'react';
import { StatusError } from './403';
import { Account } from '@/resource/types/user';
import { strictRole } from '@/resource/const/role-status';

type Nullish<T> = T | null | undefined;

interface StrictAccessProps {
  user: Account;
  children: React.ReactNode;
  data?: Nullish<{ id?: Nullish<string>; userId?: Nullish<string> }>;
}
export function StrictAccess(props: StrictAccessProps) {
  const { user, children, data } = props;

  if (!user) return null;

  const strictUser = strictRole(user) ? false : user.refId !== data?.userId;

  if (data && strictUser) return <StatusError status="denied" />;

  return <>{children}</>;
}
