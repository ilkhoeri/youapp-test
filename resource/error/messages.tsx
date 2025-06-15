import { HttpErrorProps } from '@/resource/error/lib';
import { ErrorBlock } from './block';
import { useEffect } from 'react';

type ErrorMessagesProps = Pick<HttpErrorProps, 'error'>;

export function ErrorMessages({ error }: ErrorMessagesProps) {
  const isDev = process.env.NODE_ENV !== 'production';

  function printError(error: unknown) {
    if (error instanceof Error) {
      console.error(error);
    } else {
      console.error('Non-standard error:', error);
    }
  }

  useEffect(() => {
    if (isDev) printError(error); // Log the error to an error reporting service
  }, [isDev, error]);

  const detailItems = [
    { title: 'Status', content: error.status },
    { title: 'Name', content: error.name },
    { title: 'Message', content: error.message },
    { title: 'Digest', content: error.digest },
    {
      title: 'Cause',
      content: typeof error.cause === 'object' ? JSON.stringify(error.cause, null, 2) : error.cause
    },
    {
      title: 'Stack',
      content: error.stack?.replace?.(`${error.name}: ${error.message}\n`, '') ?? error.stack
    }
  ].filter(item => isDev && item.content);

  if (detailItems.length === 0) return null;

  return (
    <div className="w-full max-w-2xl space-y-4 text-left">
      {detailItems.map(err => (
        <ErrorBlock key={err.title} {...err} />
      ))}
    </div>
  );
}
