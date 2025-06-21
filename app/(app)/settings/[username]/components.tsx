'use client';
import axios from 'axios';
import * as React from 'react';
import * as x from 'xuxi';
import * as cheerio from 'cheerio';
import { Button } from '@/resource/client/components/ui/button';
import { HoroscopeIcon, ShioIcon } from '@/resource/client/components/icons';
import { AccountLinks } from '@/resource/client/components/form/accounts/account-links';
import { SettingPasswordForm } from '@/resource/client/components/form/accounts/password-form';
import { useCloudinaryUpload } from '@/resource/client/components/fields/cloudinary-handler-client';
import { SettingInterestsForm } from '@/resource/client/components/form/accounts/interests-form';
import { DataScrape, extractScrapes, ScrapeSelector } from '@/resource/const/extract-scrapes';
import { SettingAboutForm } from '@/resource/client/components/form/accounts/account-form';
import { SheetsBreakpoint } from '@/resource/client/components/sheets-breakpoint';
import { getShioEntry, ShioAnimals, ShioElements } from '@/resource/const/shio';
import { useDeviceSession } from '@/resource/hooks/use-device-session';
import { Avatar } from '@/resource/client/components/ui/avatar-oeri';
import { FormCard } from '@/resource/client/components/fields/form';
import { useDeviceQuery } from '@/resource/hooks/use-device-query';
import { Navigation } from '@/resource/client/components/actions';
import { useApp } from '@/resource/client/contexts/app-provider';
import { Badge } from '@/resource/client/components/ui/badge';
import { getFromUser } from '@/resource/const/get-from-user';
import { Loader } from '@/resource/client/components/loader';
import { Card } from '@/resource/client/components/ui/card';
import { getAge } from '@/resource/utils/age-generated';
import { Account } from '@/resource/types/user';
import { cn } from 'cn';

interface SettingsAccountsProps {}
export function SettingsAccounts({}: SettingsAccountsProps) {
  const { session, user } = useApp();
  const isQuery = useDeviceQuery('xl');

  if (!(session || user)) return null;

  return (
    <>
      <div className="mb-6 grid grid-cols-3 justify-items-center items-center">
        <Navigation instance="back" className="mr-auto" />
        {user?.name && <p className="text-sm font-semibold">@{user?.username}</p>}
        <span className="ml-auto"></span>
      </div>
      <div className="gap-6 grid grid-flow-row lg:grid-flow-col lg:grid-cols-7">
        <div className="space-y-6 col-span-1 lg:col-span-3 lg:order-2">
          <UserWidget key={user?.refId} account={user} />
          {isQuery && (
            <>
              <AccountLinks account={user} links={user?.links} className="hidden lg:grid" />
              <SessionsActive className="hidden lg:grid" />
            </>
          )}
        </div>
        <div className="space-y-6 lg:col-span-4 lg:order-1">
          <SettingAboutForm account={user} />
          <SettingInterestsForm account={user} />
          {/* <SettingAddressForm data={user?.address} account={user} /> */}
          <SettingPasswordForm session={session} account={user} currentAccount={user} />
          {!isQuery && (
            <>
              <AccountLinks account={user} links={user?.links} className="grid lg:hidden" />
              <SessionsActive className="grid lg:hidden" />
            </>
          )}
        </div>
      </div>
    </>
  );
}

interface BadgeInfoProps {
  prop: 'horoscope' | 'shio' | (string & {});
  label: string | null | undefined;
  icon: typeof HoroscopeIcon | typeof ShioIcon;
  animal?: ShioAnimals;
  element?: ShioElements;
}

function BadgeInfo(info: BadgeInfoProps) {
  const [data, setData] = React.useState<DataScrape | null>(null),
    [error, setError] = React.useState<string | null>(null),
    [loading, setLoading] = React.useState<boolean>(false),
    [open, setOpen] = React.useState<boolean>(false);

  let result: DataScrape = {},
    resSub: Array<DataScrape> = [],
    content: React.ReactNode = null;

  React.useEffect(() => {
    async function fetchHoroscope() {
      if (info.prop !== 'horoscope') {
        setData(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const ninjas = await axios.get('https://api.api-ninjas.com/v1/horoscope', {
          headers: { 'X-Api-Key': process.env.NEXT_PUBLIC_API_NINJAS_PUBLIC_KEY },
          params: { zodiac: 'taurus' }
        });

        result = {
          title: ninjas?.data?.sign,
          description: ninjas?.data?.horoscope
        };

        setData(x.clean(result));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    async function fetchZodiac() {
      if (info.prop !== 'shio' || (!info.element && !info.animal)) {
        setData(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const element = info.element?.split(' ')?.[1]?.toLowerCase();
        const animal = `${info.animal}`?.toLowerCase();

        const res2 = await axios.get(`https://www.yourchineseastrology.com/zodiac/${animal}.htm`);
        const $$ = cheerio.load(res2.data);

        const res1 = await axios.get(`https://www.yourchineseastrology.com/zodiac/${element}-${animal}.htm`);
        const $ = cheerio.load(res1.data);

        const firstParagraph = $('.main-content-box').find('div.py05.max-width-4.mx-auto').first().text().trim();

        const headings = $('#main-content-box').find('h3.h3.mb05.mt2.caps-1');
        const paragraphs = $('#main-content-box').find('div.pt05.pb2');

        headings.each((i, el) => {
          const title = $(el).text().trim();
          const description = $(paragraphs[i]).text().trim();
          if (title && description) {
            resSub?.push({ title, description });
          }
        });

        const config1: ScrapeSelector = {
          container: '.container.main-content-box',
          children: [
            {
              container: 'div.lucky-wrapper.flex.flex-column.p2',
              title: 'h2.h2.mb05',
              description: 'p'
            }
          ]
        };
        const config2: ScrapeSelector = {
          container: 'body',
          children: [
            {
              container: '.birth-time-wrapper',
              children: [
                {
                  container: '.birth-block',
                  title: '.birth-title',
                  description: 'p.px1.flex-auto'
                }
              ]
            },
            {
              container: '.container.main-content-box',
              children: [
                {
                  container: 'div.lucky-wrapper.p2',
                  title: 'div.h3.bold.mb1',
                  children: [{ container: 'ul.ul-square', description: 'li' }]
                }
              ]
            }
          ]
        };

        const scrapes1 = extractScrapes($$, config1);
        const scrapes2 = extractScrapes($$, config2);

        result = {
          title: `${info.element} ${info.animal}`,
          description: firstParagraph,
          sub: [...resSub, ...scrapes1, ...scrapes2]
        };

        setData(x.clean(result));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchHoroscope();
    fetchZodiac();
  }, [open, info]);

  if (loading) {
    content = (
      <div className="size-full flex flex-col gap-4 [&_[data-load]]:animate-pulse [&_[data-load]]:bg-muted/40 [&_[data-load]]:rounded-md [&_[data-load]]:text-transparent">
        <span data-load className="min-h-11 min-w-11 size-11 mx-auto" />
        <span data-load className="min-h-8 w-full" />
        <span data-load className="size-full" />
      </div>
    );
  } else {
    content = (
      <div className="size-full relative flex flex-col gap-4 overflow-y-auto">
        <info.icon {...({ [`${info.prop}`]: info.label } as any)} size={44} stroke={4} className="mx-auto" />
        <RenderScrapes title={data?.title} description={data?.description} classNames={{ title: 'text-h3 mx-auto' }} />
        <div className="size-full max-h-max grid grid-flow-row gap-4 overflow-y-auto pb-10 relative z-[20]">
          {data?.sub && data?.sub?.map((sub, idx) => <RenderScrapes key={idx} {...sub} />)}
        </div>
        <info.icon {...({ [`${info.prop}`]: info.label } as any)} size={{ w: 'auto', h: '100%' }} stroke={8} className="absolute z-0 opacity-10 top-[-8%] left-[20%]" />
      </div>
    );
  }

  return (
    <SheetsBreakpoint
      open={open}
      onOpenChange={setOpen}
      openWith="drawer"
      trigger={
        <Badge key={info.prop} size="lg" className="cursor-pointer hover:text-blue-400 transition-colors">
          <info.icon {...({ [`${info.prop}`]: info.label } as any)} size={20} />
          {info.label}
        </Badge>
      }
      content={content}
    />
  );
}

function RenderScrapes({ title, description, sub, classNames }: DataScrape & { classNames?: { title?: string; description?: string } }) {
  return (
    <>
      {title && <h4 className={cn('text-h6 font-bold empty:hidden', classNames?.title)}>{title}</h4>}
      {description && (
        <p
          className={cn(
            'relative max-h-full w-full rounded-xl text-justify [text-wrap-mode:wrap] text-sm text-muted-foreground md:text-sm max-w-3xl mx-auto -mt-2 empty:hidden',
            classNames?.description
          )}
        >
          {description}
        </p>
      )}

      {sub &&
        sub.map((s, idx) => (
          <React.Fragment key={idx}>
            <RenderScrapes {...s} />
            {idx < sub?.length - 1 && <hr className="w-full h-px border-b border-border" />}
          </React.Fragment>
        ))}
    </>
  );
}

const UserInfo: React.FC<{ user: Account }> = ({ user }) => {
  if (!user) return null;

  const birthDate = user.about?.birthDay,
    horoscope = user.about?.horoscope,
    shio = user.about?.zodiac,
    birth = getAge(birthDate),
    userInfoParts = [getFromUser(user).username(), birth.yearDiff].filter(Boolean);

  if (userInfoParts.length === 0) return null;

  const shioEntry = getShioEntry(birthDate);

  const badgeInfo: BadgeInfoProps[] = [
      { prop: 'horoscope', label: horoscope, icon: HoroscopeIcon, ...shioEntry },
      { prop: 'shio', label: shio, icon: ShioIcon, ...shioEntry }
    ].filter(info => !!info.label),
    someInfo = badgeInfo.some(info => !!info.label);

  return (
    <div suppressHydrationWarning className="relative z-[3] mt-auto grid grid-flow-row gap-y-1">
      <h3 className="text-base font-bold">{userInfoParts.join(', ')}</h3>
      {user.about?.gender && <p className="text-[13px] font-medium tracking-tight">{user.about?.gender}</p>}
      {someInfo && <div className="inline-flex flex-row gap-4 mt-1.5">{badgeInfo?.map(info => <BadgeInfo key={info.prop} {...info} />)}</div>}
    </div>
  );
};

export function UserWidget({ account }: { account: Account }) {
  const cld = useCloudinaryUpload(`/api/auth/avatar/${account?.id}`, { _prevent: !account || account?.image });

  return (
    <Card
      suppressHydrationWarning
      data-placeholder={!account?.image ? (cld.isDragging ? 'Drop your image' : 'Drag image here to upload') : undefined}
      className={cn(
        'bg-card-foreground flex flex-col p-4 pt-4 lg:p-6 gap-4 overflow-hidden h-[190px] lg:min-h-80',
        !account?.image && [
          'after:content-[attr(data-placeholder)] after:absolute after:z-[50] after:text-h4 after:font-bold after:left-1/2 after:top-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:text-nowrap after:duration-500',
          cld.isDragging ? 'bg-blue-500/20 border-blue-400 text-blue-400 after:opacity-80' : 'after:opacity-0 hover:after:opacity-40'
        ]
      )}
      onDrop={cld.handleDrop}
      onDragOver={cld.handleDragOver}
      onDragLeave={cld.handleDragLeave}
    >
      <UserInfo user={account} />

      {account?.image && (
        <Avatar
          suppressHydrationWarning
          alt=""
          src={account?.image}
          color="transparent"
          style={({ hasLoad }) => ({ objectFit: 'cover', '--avatar-size': '100%' })}
          className={cn('size-full absolute border-0 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[inherit]')}
          classNames={{ image: 'bg-transparent object-center align-middle' }}
        >
          {({ hasLoad }) => (
            <div
              aria-description="overlay"
              className="absolute size-full z-[1] rounded-[inherit] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              {...{ style: { background: hasLoad ? 'linear-gradient(180deg, rgba(0, 0, 0, 0.76) 0%, rgba(0, 0, 0, 0) 45.83%, #000000 100%)' : undefined } }}
            />
          )}
        </Avatar>
      )}

      {!account?.image && cld.loading && (
        <Loader type="spinner" size={16} className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ position: 'absolute', '--spinner-color': 'hsl(var(--color))' }} />
      )}
    </Card>
  );
}

export function SessionsActive({ className }: { className?: string }) {
  const sessionActive = useDeviceSession();

  function pulse(className?: string) {
    return cn(!sessionActive && ['bg-background/60 rounded-md text-transparent [&_*]:text-transparent animate-pulse mt-0.5', className]);
  }

  return (
    <FormCard className={className}>
      <h3 className="font-bold text-sm">Session</h3>
      <ul className="divide-y">
        <li className={cn('flex flex-col sm:flex-row sm:items-center py-4 gap-4 w-full max-w-full')}>
          <div className={cn('flex-shrink-0 [--sz:32px] size-[--sz]', pulse('mt-0'))}>{sessionActive?.icon && <sessionActive.icon size="var(--sz)" />}</div>
          <div className="flex flex-col sm:max-w-[52.5%]">
            <p className={cn('font-normal text-sm truncate', pulse('h-[22px] w-[200px]'))}>{x.cnx(sessionActive?.address)}</p>
            <p className={cn('font-normal text-sm truncate text-muted-foreground', pulse('h-[18px] w-[240px]'))}>{x.cnx(sessionActive?.device)}</p>
            <time suppressHydrationWarning dateTime={x.cnx(sessionActive?.lastSeen)} className={cn('font-normal text-sm truncate text-muted-foreground', pulse('h-[18px] w-[180px]'))}>
              {x.cnx(sessionActive?.lastSeen)}
            </time>
          </div>
          {sessionActive && <Button className="w-max ml-auto sr-only hidden">Revoke</Button>}
        </li>
      </ul>
      <Button variant="outline" className="w-max mt-6 sr-only hidden">
        See More
      </Button>
    </FormCard>
  );
}
