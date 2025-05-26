import { Suspense } from 'react';
import { signIn } from '@/auth/auth';
import { Button } from '@/resource/client/components/ui/button';
import { GithubFillIcon } from '@/resource/client/components/icons-fill';
import { RegisterForm, RegisterWithTokenForm } from '@/resource/client/components/form/accounts/signup-form';
import { getInvitationToken } from '@/auth/tokens/verification-token';
import { StatusError } from '@/resource/client/components/status/403';
import { decrypt } from '@/resource/const/encrypt-decrypt';

import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const url = process.env.NEXT_PUBLIC_SITE_URL;
  const namePage = 'Register';
  return {
    title: namePage,
    description: namePage,
    openGraph: {
      title: namePage,
      description: namePage,
      url: url + '/auth/sign-up/',
      locale: 'en_US',
      type: 'website'
    }
  };
}

type Params = Readonly<{
  searchParams: Promise<{ invitation_token: string }>;
}>;

export default async function RegisterPage(params: Params) {
  const { invitation_token } = await params.searchParams;
  let originalToken: string | null = null;

  try {
    originalToken = decrypt(invitation_token);
  } catch (error) {
    console.error('[DECRYPTION ERROR]:', error);
    originalToken = null;
    // return <StatusError status="internal-error" />;
  }

  const invitation = await getInvitationToken(originalToken);

  if (originalToken && invitation) {
    return (
      <Suspense>
        <RegisterWithTokenForm invitation={invitation} />
      </Suspense>
    );
  }

  return <RegisterForm />;
}

function SignInGithub() {
  return (
    <form
      className="w-full"
      action={async () => {
        'use server';
        await signIn('github');
      }}
    >
      <Button type="submit" className="w-full">
        <GithubFillIcon className="mr-2 size-5" />
        <span>GitHub</span>
      </Button>
    </form>
  );
}
