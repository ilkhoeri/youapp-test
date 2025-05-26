'use client';

import { useEffect } from 'react';
import { Button } from '@/resource/client/components/ui/button';
import { StatusError } from '@/resource/client/components/status/403';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Log the error to an error reporting service
    if (process.env.NODE_ENV !== 'production') {
      console.error(error);
    }
  }, [error]);

  const errorMessage = process.env.NODE_ENV === 'production' ? null : error.message;

  return (
    <main className="h-full w-full overflow-hidden relative flex flex-col items-center justify-center">
      <StatusError status="internal-error">
        {errorMessage && (
          <span className="w-full max-w-2xl rounded-lg bg-muted p-1.5 -mt-10 mb-8 text-wrap whitespace-pre font-geist-mono text-sm md:text-base font-normal text-[--palette-text-secondary]">
            {errorMessage}
          </span>
        )}

        <div className="grid grid-flow-col gap-4 w-full max-w-xs">
          <Button onClick={() => window.location.reload()} className="w-full">
            Reload
          </Button>
          <Button onClick={() => reset()} className="w-full">
            Reset
          </Button>
          <Button onClick={() => (window.location.href = '/')} className="w-full">
            Home
          </Button>
        </div>
      </StatusError>
    </main>
  );
}
