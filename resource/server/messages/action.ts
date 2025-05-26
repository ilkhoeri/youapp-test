'use server';

import { pusherServer } from './pusher';

interface SendMessageProps {
  channel: string | Array<string>;
  event: string;
  message: string;
}
/**
 * @example
 * PusherServer.trigger({
 *   channel: 'my-channel',
 *   event: 'my-event',
 *   message: 'hello world'
 * });
 * @param params @see SendMessageProps
 * @returns
 */
export async function sendMessage(params: SendMessageProps) {
  const { channel, event, message } = params;
  try {
    // Store the message inside our db
    pusherServer.trigger(channel, event, {
      message
    });
  } catch (error) {
    return 'Error';
  }
}
