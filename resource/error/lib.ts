export type HttpErrorProps = {
  error: Error & { digest?: string; status?: number };
  reset: () => void;
};

/**
 * @example throw new HttpError('Unauthorized access', 401);
 *
 * @example
 * export async function GET() {
 *   const unauthorized = true;
 *   if (unauthorized) throw new HttpError('Unauthorized access', 401);
 *   return new Response('OK');
 * }
 */
export class HttpError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

export function httpError(message: string, status = 500) {
  const error = new Error(message);
  (error as any).status = status;
  throw error;
}
