import { auth } from '@/auth/auth';
import { currentUser } from '@/resource/db/user/get-accounts';

type LayoutProps = Readonly<{ children: React.ReactNode }>;

export default async function AppLayout({ children }: Readonly<LayoutProps>) {
  const [session, user] = await Promise.all([auth(), currentUser()]);

  if (!session || !user || session?.user.id !== user?.id) return null;

  return <main className="px-2.5 md:px-5 lg:px-8 py-12 md:py-16 flex flex-col w-full max-w-full">{children}</main>;
}
