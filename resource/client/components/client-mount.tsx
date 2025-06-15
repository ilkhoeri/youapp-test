'use client';
import * as React from 'react';

export function useMount() {
  const [mount, setMount] = React.useState<boolean>(false);
  React.useEffect(() => setMount(true), []);
  return mount;
}

export function ClientMount({ children }: Readonly<{ children: React.ReactNode }>) {
  const mount = useMount();
  if (!mount) return null;
  return <>{children}</>;
}
