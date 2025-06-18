import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { currentUser, getUserByUserName } from '@/resource/db/user/get-accounts';
import { SettingsAccounts } from './components';

import type { Metadata, ResolvingMetadata } from 'next';

interface Params {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ getAccount: string }>;
}

export async function generateMetadata({ params, searchParams }: Params, parent: ResolvingMetadata): Promise<Metadata> {
  const [session, { username }, user, { openGraph }] = await Promise.all([currentUser(), params, getUserByUserName((await searchParams).getAccount), parent]);

  const previousImages = openGraph?.images || [];

  const url = process.env.NEXT_PUBLIC_SITE_URL;
  const slug = `/settings/${username}` || '';
  const namePage = session?.name || 'NotFound!';

  return {
    title: user?.username && `@${user?.username}`,
    description: namePage,
    openGraph: {
      title: namePage,
      siteName: namePage,
      description: namePage,
      images: [
        {
          url: session?.image || '',
          width: 800,
          height: 800
        },
        ...previousImages
      ],
      url: url + slug,
      locale: 'en_US',
      type: 'website'
    }
  };
}

export default async function Settings({ params, searchParams }: Params) {
  const [session, { username }] = await Promise.all([currentUser(), params]);

  if (!session || username !== session?.username) redirect('/');

  return (
    <section className="w-full max-w-5xl mx-auto">
      <SettingsAccounts />
    </section>
  );
}
