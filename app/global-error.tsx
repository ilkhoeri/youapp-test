'use client';

import { InternalError500 } from '@/resource/client/components/icons-illustration';
import { HttpErrorProps } from '@/resource/error/lib';
import { ErrorReset } from '@/resource/error/reset';
import { ErrorMessages } from '@/resource/error/messages';

export default function GlobalError({ error, reset }: HttpErrorProps) {
  return (
    <html lang="en">
      <body className="bg-background min-h-screen flex flex-col items-center justify-center pt-12 pb-20 px-4 text-center gap-6">
        <h1 className="text-xl md:text-2xl font-semibold text-destructive">Something went wrong!</h1>

        <p className="text-sm md:text-base text-muted-foreground max-w-md">
          The page failed to load due to an unexpected error. You can try refreshing, resetting the state, or returning to the homepage.
        </p>

        <InternalError500 className="my-10 max-w-[300px] md:max-w-[400px]" />

        <ErrorMessages error={error} />

        <ErrorReset reset={reset} />
      </body>
    </html>
  );
}
