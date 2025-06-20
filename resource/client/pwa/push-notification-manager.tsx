'use client';
import * as React from 'react';
import { urlBase64ToUint8Array } from './base64String';
import { sendNotification, subscribeUser, unsubscribeUser } from './actions';
import { beamsClient } from '@/resource/configs/pusher/beams';
import { toast } from 'sonner';

export function PushNotificationManager() {
  const [isSupported, setIsSupported] = React.useState(false);
  const [subscription, setSubscription] = React.useState<PushSubscription | null>(null);
  const [message, setMessage] = React.useState('');

  React.useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      registerServiceWorker();
    }
  }, []);

  async function registerServiceWorker() {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none'
    });
    const sub = await registration.pushManager.getSubscription();
    setSubscription(sub);
  }

  async function subscribeToPush() {
    const registration = await navigator.serviceWorker.ready;
    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!)
    });
    setSubscription(sub);
    const serializedSub = JSON.parse(JSON.stringify(sub));
    await subscribeUser(serializedSub);
  }

  async function unsubscribeFromPush() {
    await subscription?.unsubscribe();
    setSubscription(null);
    await unsubscribeUser();
  }

  async function sendTestNotification() {
    if (subscription) {
      await sendNotification(message);
      setMessage('');
    }
  }

  const pushBeams = React.useCallback(() => {
    // if (typeof window === 'undefined') return;
    beamsClient
      .start()
      .then(() => beamsClient.addDeviceInterest('notification'))
      .then(() => {
        console.log('Successfully registered and subscribed!');
        toast('Successfully registered and subscribed!');
      })
      .catch(console.error);
  }, []);

  if (!isSupported) {
    return <p>Push notifications are not supported in this browser.</p>;
  }

  return (
    <div>
      <button type="button" onClick={pushBeams}>
        Push Beams
      </button>
      <h3>Push Notifications</h3>
      {subscription ? (
        <>
          <p>You are subscribed to push notifications.</p>
          <button type="button" role="button" onClick={unsubscribeFromPush}>
            Unsubscribe
          </button>
          <input type="text" placeholder="Enter notification message" value={message} onChange={e => setMessage(e.target.value)} />
          <button type="button" role="button" onClick={sendTestNotification}>
            Send Test
          </button>
        </>
      ) : (
        <>
          <p>You are not subscribed to push notifications.</p>
          <button type="button" role="button" onClick={subscribeToPush}>
            Subscribe
          </button>
        </>
      )}
    </div>
  );
}
