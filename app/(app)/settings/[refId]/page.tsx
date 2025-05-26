import { redirect } from 'next/navigation';
import { currentUser, getUserByRefId } from '@/resource/db/user/get-accounts';
import { getLinks } from '@/resource/db/db-get';
import { SettingsAccounts } from './components';

import type { Metadata, ResolvingMetadata } from 'next';

interface Params {
  params: Promise<{ refId: string }>;
  searchParams: Promise<{ getAccount: string }>;
}

export async function generateMetadata({ params, searchParams }: Params, parent: ResolvingMetadata): Promise<Metadata> {
  const [session, { refId }, user, { openGraph }] = await Promise.all([currentUser(), params, getUserByRefId((await searchParams).getAccount), parent]);

  const previousImages = openGraph?.images || [];

  const url = process.env.NEXT_PUBLIC_SITE_URL;
  const slug = `/settings/${refId}` || '';
  const namePage = session?.name || 'NotFound!';

  return {
    title: user?.refId && `@${user?.refId}`,
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
  const [session, searchAccount, links, { refId }] = await Promise.all([currentUser(), getUserByRefId((await searchParams).getAccount), getLinks(), params]);

  if (!session) redirect('/');

  if (refId !== session?.refId) redirect('/');

  return (
    <section className="w-full max-w-5xl mx-auto">
      <SettingsAccounts />
    </section>
  );
}
