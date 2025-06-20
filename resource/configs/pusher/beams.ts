import * as PusherPushNotifications from '@pusher/push-notifications-web';

/**
 * ```bash
    curl -H "Content-Type: application/json" \
     -H "Authorization: Bearer <process.env.BEAMS_PRIMARY_KEY>" \
     -X POST "https://<instanceId>.pushnotifications.pusher.com/publish_api/v1/instances/<instanceId>/publishes" \
     -d '{"interests":["hello"],"web":{"notification":{"title":"Hello","body":"Hello, world!"}}}'
 * ```
 * @example
 * beamsClient.start().then(() => {
 *   // Build something beatiful 🌈
 * });
 */
export const beamsClient = new PusherPushNotifications.Client({
  instanceId: process.env.NEXT_PUBLIC_BEAMS_INSTANCE_ID! as string
});
