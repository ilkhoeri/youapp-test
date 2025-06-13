import Link from 'next/link';
import { currentUser } from '@/resource/db/user/get-accounts';
import { DashboardPresentative } from '@/resource/client/components/icons-illustration';
import { Typography } from '@/resource/client/components/ui/typography';
import { Button, buttonVariants } from '@/resource/client/components/ui/button';
import { cn } from 'cn';
import { strictRole } from '@/resource/const/role-status';
import { getFromUser } from '@/resource/const/get-from-user';
import { signOut } from '@/auth/auth';
import { ChatMultipleFillIcon, SettingFillIcon, SignOutFillIcon } from '@/resource/client/components/icons-fill';

export default async function Page(props: { searchParams: Promise<{ q: string; tab: string }> }) {
  const [session, searchParams] = await Promise.all([currentUser(), props.searchParams]);

  if (!session) return null;
  const isAdmin = strictRole(session, ['ADMIN', 'SUPERADMIN']);
  function linkByRole() {
    if (isAdmin) return `/${session?.refId}/dashboard`;
    return `/settings/${session?.username}`;
  }

  return (
    <div className="size-full flex flex-col max-w-full gap-8 -mt-9 mb-20">
      <section id="total" className="grid auto-rows-min [flex-flow:wrap] gap-y-6 lg:gap-x-6 md:grid-cols-2 lg:grid-cols-12">
        <div className="sm:grid-cols-2 md:col-span-3 lg:col-span-8">
          <div
            className="bg-cover bg-no-repeat bg-center py-10 px-6 gap-10 rounded-2xl flex relative items-center text-color border border-gray-300 dark:border-[var(--palette-grey-800)] text-center flex-col lg:h-full lg:pl-10 lg:text-left lg:flex-row [--gradient:linear-gradient(to_right,#cccccc91_0%,#ffffffe8_75%)] dark:[--gradient:linear-gradient(to_right,_#141a21e0_0%,#141a21_75%)]"
            {...{
              style: {
                backgroundImage: 'var(--gradient), url(/assets/background/background-5.webp)'
              }
            }}
          >
            <div className="grid grid-flow-row [flex:1_1_auto] items-center lg:items-start">
              <Typography prose="h2" el="h4" className="whitespace-pre-line mb-2 truncate">
                Welcome 👋 <hr className="my-1 border-0 bg-transparent" /> {getFromUser(session).username()}
              </Typography>
              <Typography prose="p" className="mb-6 max-w-1/2 opacity-[0.64]">
                Manage data and features easily.
                <br />
                All the information you need is available here.
              </Typography>

              <div className="grid max-lg:grid-cols-2 lg:grid-flow-col gap-4">
                <Link href={linkByRole()} tabIndex={0} className={cn(buttonVariants({ variant: 'green', size: 'sm' }), 'gap-2')}>
                  <SettingFillIcon size={20} />
                  {isAdmin ? 'Manage Now' : 'Settings'}
                </Link>
                <Link href="/chat" tabIndex={0} className={cn(buttonVariants({ variant: 'blue', size: 'sm' }), 'gap-2')}>
                  <ChatMultipleFillIcon size={20} />
                  Chat
                </Link>
                <Button
                  variant="danger"
                  size="sm"
                  className="max-lg:col-span-2 gap-2"
                  onClick={async () => {
                    'use server';
                    await signOut();
                  }}
                >
                  <SignOutFillIcon size={20} />
                  Sign Out
                </Button>
              </div>
            </div>
            <div className="min-w-[260px]">
              <DashboardPresentative
                size={195}
                image={{ href: '/assets/characters/character-3.webp' }}
                className="[--primary-light:var(--palette-primary-light)] [--primary-dark:var(--palette-primary-dark)]"
              />
            </div>
          </div>
        </div>

        <div className="max-lg:hidden flex items-center justify-center col-auto md:col-span-full lg:col-span-4 size-full rounded-2xl bg-card min-h-[10rem]"></div>

        <div
          className={cn(
            'grid col-auto md:col-span-full lg:col-span-4 size-full rounded-2xl min-h-[10rem]',
            true ? '2xl:group-[[data-sidebar][data-state=open]]/main:grid-cols-1 gap-6' : '2xl:grid-cols-2 bg-card max-lg:hidden'
          )}
        ></div>

        <div className={cn('grid content-baseline md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 md:col-span-full lg:col-span-8 gap-6')}></div>
      </section>
    </div>
  );
}
