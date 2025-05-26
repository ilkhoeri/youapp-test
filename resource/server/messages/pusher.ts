import PusherServer from 'pusher';
import PusherClient from 'pusher-js';

/**
 * @example
 * PusherServer.trigger('my-channel', 'my-event', {
 *   message: 'hello world'
 * });
 */
export const pusherServer = new PusherServer({
  appId: process.env.NEXT_PUBLIC_PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
  secret: process.env.PUSHER_SECRET_KEY!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true
});

export const pusherClient = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_APP_KEY!, {
  channelAuthorization: {
    endpoint: '/api/pusher/auth',
    transport: 'ajax'
  },
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!
});
