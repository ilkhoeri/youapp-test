'use client';
import * as React from 'react';
import * as x from 'xuxi';
import { Button } from '@/resource/client/components/ui/button';
import { HoroscopeIcon, ShioIcon } from '@/resource/client/components/icons';
import { AccountLinks } from '@/resource/client/components/form/accounts/account-links';
import { SettingPasswordForm } from '@/resource/client/components/form/accounts/password-form';
import { useCloudinaryUpload } from '@/resource/client/components/fields/cloudinary-handler-client';
import { SettingInterestsForm } from '@/resource/client/components/form/accounts/interests-form';
import { SettingAboutForm } from '@/resource/client/components/form/accounts/account-form';
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

interface BadgeInfo {
  key: string;
  label: string | null | undefined;
  icon: typeof HoroscopeIcon | typeof ShioIcon;
}

const UserInfo: React.FC<{ user: Account }> = ({ user }) => {
  if (!user) return null;

  const birthDate = user.about?.birthDay,
    horoscope = user.about?.horoscope,
    shio = user.about?.zodiac;

  const birth = getAge(birthDate),
    userInfoParts = [getFromUser(user).username(), birth.yearDiff].filter(Boolean);

  if (userInfoParts.length === 0) return null;

  const badgeInfo: BadgeInfo[] = [
      { key: 'horoscope', label: horoscope, icon: HoroscopeIcon },
      { key: 'shio', label: shio, icon: ShioIcon }
    ],
    someInfo = badgeInfo.some(info => !!info.label);

  return (
    <div suppressHydrationWarning className="relative z-[3] mt-auto grid grid-flow-row gap-y-1">
      <h3 className={cn('text-base font-bold')}>{userInfoParts.join(', ')}</h3>
      {user.about?.gender && <p className="text-[13px] font-medium tracking-tight">{user.about?.gender}</p>}
      {someInfo && (
        <div className="inline-flex flex-row gap-4 mt-1.5">
          {badgeInfo?.map(info => (
            <Badge key={info.key} size="lg">
              <info.icon {...{ ...({ [`${info.key}`]: info.label } as any) }} size={20} />
              {shio}
            </Badge>
          ))}
        </div>
      )}
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
