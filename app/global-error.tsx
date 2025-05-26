'use client';

import { Button } from '@/resource/client/components/ui/button';
import { InternalError500 } from '@/resource/client/components/icons-illustration';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const errorMessage = process.env.NODE_ENV === 'production' ? null : error.message;

  return (
    <html>
      <body className="bg-background flex flex-col items-center justify-center gap-4">
        <h2 className="font-medium">Something went wrong!</h2>
        {/* <p className="text-muted-foreground text-[13px] font-mono">{String(error)}</p> */}
        <p className="text-muted-foreground text-[13px] font-mono">Some loads occur which cause the page to fail to load, please select the appropriate action.</p>

        <InternalError500 className="my-10 md:my-20" />

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
      </body>
    </html>
  );
}
