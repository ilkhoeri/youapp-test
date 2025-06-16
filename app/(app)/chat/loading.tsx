import { cookies } from 'next/headers';
import { classResizable } from '@/resource/client/components/chat/chat-container';
import { ContainerSkeleton } from '@/resource/client/components/chat/chat-skeleton';

export default function Loading() {
  const cookieStore = await cookies();
  const layout = cookieStore.get('__resizable-panels:layout:chat_container');
  const defaultLayout = layout ? JSON.parse(layout.value) : undefined;

  return <ContainerSkeleton layouts={defaultLayout}  className={classResizable.root} />;
}
