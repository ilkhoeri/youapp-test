import { currentUser } from '@/resource/db/user/get-accounts';
import { redirect } from 'next/navigation';

interface Params {
  params: Promise<{ userId: string }>;
}
export default async function Page({ params }: Params) {
  const [session, { userId }] = await Promise.all([currentUser(), params]);
  return redirect(`/settings/account/${session?.refId}`);
}
