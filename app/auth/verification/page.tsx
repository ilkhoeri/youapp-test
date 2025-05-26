import { VerificationTokenForm } from '@/resource/client/components/form/accounts/verification-form';

import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const url = process.env.NEXT_PUBLIC_SITE_URL;
  const namePage = 'Verifikasi';
  return {
    title: namePage,
    description: namePage,
    openGraph: {
      title: namePage,
      description: namePage,
      url: url + '/auth/verification/',
      locale: 'en_US',
      type: 'website'
    }
  };
}

export default function VerificationPage() {
  return <VerificationTokenForm />;
}
