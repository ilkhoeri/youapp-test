'use client';

import { StatusError } from '@/resource/client/components/status/403';
import { HttpErrorProps } from '@/resource/error/lib';
import { ErrorReset } from '@/resource/error/reset';
import { ErrorMessages } from '@/resource/error/messages';

export default function Error({ error, reset }: HttpErrorProps) {
  return (
    <main className="h-full w-full overflow-hidden relative flex flex-col items-center justify-center">
      <StatusError status="internal-error">
        <ErrorMessages error={error} />
        <ErrorReset reset={reset} />
      </StatusError>
    </main>
  );
}
