import { Suspense } from 'react';
import { SignInForm } from '@/resource/client/components/form/accounts/signin-form';

import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const url = process.env.NEXT_PUBLIC_SITE_URL;
  const namePage = 'Login';
  return {
    title: namePage,
    description: namePage,
    openGraph: {
      title: namePage,
      description: namePage,
      url: url + '/auth/sign-in/',
      locale: 'en_US',
      type: 'website'
    }
  };
}

export default function Page() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
