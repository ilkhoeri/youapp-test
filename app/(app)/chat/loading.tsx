import { ContainerSkeleton } from '@/resource/client/components/chat/chat-skeleton';
import { cookies } from 'next/headers';

export default async function Loading() {
  const cookieStore = await cookies();
  const layout = cookieStore.get('__resizable-panels:layout:chat_container');
  const defaultLayout = layout ? JSON.parse(layout.value) : undefined;

  return <ContainerSkeleton layouts={defaultLayout} />;
}
