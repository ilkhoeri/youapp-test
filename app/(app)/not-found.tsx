import { StatusError } from '@/resource/client/components/status/403';

export default function Page404() {
  return <StatusError status="NotFound" />;
}
