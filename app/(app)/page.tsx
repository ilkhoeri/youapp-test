import Link from 'next/link';
import { currentUser } from '@/resource/db/user/get-accounts';
import { buttonVariants } from '@/resource/client/components/ui/button';
import { ChatMultipleFillIcon, SettingFillIcon, SignOutFillIcon } from '@/resource/client/components/icons-fill';
import { DashboardPresentative } from '@/resource/client/components/icons-illustration';
import { getFromUser } from '@/resource/const/get-from-user';
import { strictRole } from '@/resource/const/role-status';
import { type Account } from '@/resource/types/user';
import { cvx, cvxVariants } from 'xuxi';
import { signOut } from '@/auth/auth';
import { cn } from 'cn';

export default async function Page() {
  const user = await currentUser();

  if (!user) return null;

  return (
    <div {...getStyles('page-root')}>
      <section {...getStyles('page-container')}>
        <div {...getStyles('page-block-1')}>
          <div {...getStyles('page-block-1-wrapper')}>
            <GreetingSection user={user} />
            <div {...getStyles('page-block-1-inner')}>
              <DashboardPresentative size={195} image={{ href: '/assets/characters/character-3.webp' }} {...getStyles('page-block-1-present')} />
            </div>
          </div>
        </div>

        <div {...getStyles('page-block-2')}></div>
        <div {...getStyles('page-block-3')}></div>
        <div {...getStyles('page-block-4')}></div>
      </section>
    </div>
  );
}

async function GreetingSection({ user }: { user: Account }) {
  if (!user) return null;

  const isAdmin = strictRole(user, ['ADMIN', 'SUPERADMIN']);
  function linkByRole() {
    if (isAdmin) return `/${user?.refId}/dashboard`;
    return `/settings/${user?.username}`;
  }

  return (
    <div role="presentation" {...getStyles('greeting-wrapper')}>
      <h4 {...getStyles('greeting-header')}>
        Welcome 👋 <hr {...getStyles('greeting-hr')} /> {getFromUser(user).username()}
      </h4>
      <p {...getStyles('greeting-paragraph')}>
        Manage data and features easily. <br /> All the information you need is available here.
      </p>

      <div {...getStyles('greeting-inner')}>
        <Link href={linkByRole()} tabIndex={0} {...getStyles('greeting-action-1')}>
          <SettingFillIcon size="200%" {...getStyles('greeting-action-filled')} />
          <SettingFillIcon size={24} />
          {isAdmin ? 'Manage Now' : 'Settings'}
        </Link>
        <Link href="/chat" tabIndex={0} {...getStyles('greeting-action-2')}>
          <ChatMultipleFillIcon size="200%" {...getStyles('greeting-action-filled')} />
          <ChatMultipleFillIcon size={24} />
          Chat
        </Link>
        <button
          type="button"
          role="button"
          tabIndex={0}
          {...getStyles('greeting-action-3')}
          onClick={async function () {
            'use server';
            await signOut();
          }}
        >
          <SignOutFillIcon size="200%" {...getStyles('greeting-action-filled')} />
          <SignOutFillIcon size={24} />
          Sign Out
        </button>
      </div>
    </div>
  );
}

const classes = cvx({
  variants: {
    page: {
      root: 'size-full flex flex-col max-w-full gap-8 -mt-9 mb-20',
      container: 'grid auto-rows-min [flex-flow:wrap] gap-y-6 lg:gap-x-6 md:grid-cols-2 lg:grid-cols-12',
      'block-1': 'sm:grid-cols-2 md:col-span-3 lg:col-span-8',
      'block-2': 'max-lg:hidden flex items-center justify-center col-auto md:col-span-full lg:col-span-4 size-full rounded-2xl bg-card min-h-[10rem]',
      'block-3': 'grid col-auto md:col-span-full lg:col-span-4 size-full rounded-2xl min-h-[10rem] 2xl:group-[[data-sidebar][data-state=open]]/main:grid-cols-1 gap-6',
      'block-4': 'grid content-baseline md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 md:col-span-full lg:col-span-8 gap-6',
      'block-1-wrapper':
        'bg-cover bg-no-repeat bg-center py-10 px-6 gap-10 rounded-2xl flex relative items-center text-color border border-gray-300 dark:border-[var(--palette-grey-800)] text-center flex-col lg:h-full lg:pl-10 lg:text-left lg:flex-row [--gradient:linear-gradient(to_right,#cccccc91_0%,#ffffffe8_75%)] dark:[--gradient:linear-gradient(to_right,_#141a21e0_0%,#141a21_75%)]',
      'block-1-inner': 'min-w-[260px]',
      'block-1-present': '[--primary-light:var(--palette-primary-light)] [--primary-dark:var(--palette-primary-dark)]'
    },
    greeting: {
      wrapper: 'grid grid-flow-row [flex:1_1_auto] items-center lg:items-start',
      hr: 'my-1 border-0 bg-transparent',
      header: 'scroll-m-20 text-[clamp(1.25rem,0.75rem+4vw,2.25rem)] leading-9 font-bold tracking-tight pb-2 first:mt-0 whitespace-pre-line mb-2 truncate',
      paragraph: 'leading-7 [&:not(:first-child)]:mt-4 mb-6 max-w-1/2 opacity-[0.64]',
      inner: 'grid max-xl:grid-cols-2 xl:grid-flow-col xl:gap-4',
      'action-1': cn(buttonVariants({ variant: 'green', size: 'sm' }), 'relative overflow-hidden gap-2 h-12 rounded-xl max-xl:rounded-tr-none max-xl:rounded-b-none'),
      'action-2': cn(buttonVariants({ variant: 'blue', size: 'sm' }), 'relative overflow-hidden gap-2 h-12 rounded-xl max-xl:rounded-tl-none max-xl:rounded-b-none'),
      'action-3': cn(buttonVariants({ variant: 'danger', size: 'sm' }), 'relative overflow-hidden max-xl:col-span-2 gap-2 h-12 rounded-xl max-xl:rounded-t-none'),
      'action-filled': 'absolute opacity-20 right-[-15%]'
    }
  }
});

type PageSelector = NonNullable<cvxVariants<typeof classes>['page']>;
type GreetingSelector = NonNullable<cvxVariants<typeof classes>['greeting']>;
type Selector = `page-${PageSelector}` | `greeting-${GreetingSelector}`;

function getSelector<T>(suffix: 'page' | 'greeting', selector: Selector) {
  return selector.startsWith(`${suffix}-`) ? (selector.substring(suffix.length + 1) as T) : undefined;
}

function getStyles(selector: Selector) {
  const page = getSelector<PageSelector>('page', selector);
  const greeting = getSelector<GreetingSelector>('greeting', selector);
  return {
    className: classes({ ...(page && { page }), ...(greeting && { greeting }) }),
    style: selector === 'page-block-1-wrapper' ? { backgroundImage: 'var(--gradient), url(/assets/background/background-5.webp)' } : undefined
  };
}
