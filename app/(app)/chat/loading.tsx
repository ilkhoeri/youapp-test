import { classResizable } from '@/resource/client/components/chat/chat-container';
import { ContainerSkeleton } from '@/resource/client/components/chat/chat-skeleton';

export default function Loading() {
  return <ContainerSkeleton className={classResizable.root} />;
}
