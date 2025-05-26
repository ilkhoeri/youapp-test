'use client';
import * as React from 'react';

export function ClientRender({ children }: Readonly<{ children: React.ReactNode }>) {
  const [mount, setMount] = React.useState<boolean>(false);
  React.useEffect(() => setMount(true), []);
  if (!mount) return null;
  return <>{children}</>;
}
