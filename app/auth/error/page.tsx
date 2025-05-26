import { StatusError } from '@/resource/client/components/status/403';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const url = process.env.NEXT_PUBLIC_SITE_URL;
  const namePage = 'Auth Error';
  return {
    title: namePage ? namePage.slice(0, 30) : 'NotFound!',
    description: namePage,
    openGraph: {
      title: namePage || 'NotFound!',
      description: namePage || 'NotFound!',
      url: url + '/auth/error/',
      locale: 'en_US',
      type: 'website'
    }
  };
}

export default function Page() {
  return (
    <div className="size-full flex flex-col justify-center items-center">
      <StatusError status="internal-error" className="-mt-16" />
    </div>
  );
}
