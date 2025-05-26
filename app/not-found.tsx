import { StatusError } from '@/resource/client/components/status/403';

export default function NotFound() {
  return <StatusError status="NotFound" />;
}
