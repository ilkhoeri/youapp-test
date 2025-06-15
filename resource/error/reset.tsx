'use client';

import { Button } from '@/resource/client/components/ui/button';
import { HttpErrorProps } from '@/resource/error/lib';

type ErrorResetProps = Pick<HttpErrorProps, 'reset'>;

export function ErrorReset({ reset }: ErrorResetProps) {
  const detailActions = [
    { label: 'Reload', onClick: () => window.location.reload() },
    { label: 'Reset', onClick: reset },
    { label: 'Home', onClick: () => (window.location.href = '/') }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-sm mt-6 [&>button]:w-full">
      {detailActions.map(({ label, onClick }) => (
        <Button key={label} onClick={onClick}>
          {label}
        </Button>
      ))}
    </div>
  );
}
