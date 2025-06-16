import { cookies } from 'next/headers';
import { classResizable } from '@/resource/client/components/chat/chat-container';
import { ContainerSkeleton } from '@/resource/client/components/chat/chat-skeleton';

export default async function Loading() {
  const cookieStore = await cookies();
  const layout = cookieStore.get('__resizable-panels:layout:chat_container');
  const defaultLayout = layout ? JSON.parse(layout.value) : [15, 30, 55];

  return <ContainerSkeleton layouts={defaultLayout}  className={classResizable.root} />;
}
