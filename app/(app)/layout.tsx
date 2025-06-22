import { auth } from '@/auth/auth';
import { currentUser } from '@/resource/db/user/get-accounts';

type LayoutProps = Readonly<{ children: React.ReactNode }>;

export default async function AppLayout({ children }: Readonly<LayoutProps>) {
  const [session, user] = await Promise.all([auth(), currentUser()]);

  if (!session || !user || session?.user.id !== user?.id) return null;

  return <main className="[--x:0.625rem] md:[--x:1.25rem] lg:[--x:2rem] px-[--x] py-12 md:py-16 flex flex-col w-full max-w-full">{children}</main>;
}
