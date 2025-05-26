import user_db from '@/resource/db/user';
import { Suspense } from 'react';
import { InvitationVerificationTokenForm } from '@/resource/client/components/form/accounts/verification-invitation-token-form';

import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const url = process.env.NEXT_PUBLIC_SITE_URL;
  const namePage = 'Invitation';
  return {
    title: namePage,
    description: namePage,
    openGraph: {
      title: namePage,
      description: namePage,
      url: url + '/auth/invitation/',
      locale: 'en_US',
      type: 'website'
    }
  };
}

async function getInvitationTokens() {
  try {
    const invitation_token = await user_db.invitationToken.findMany({
      where: { isUsed: false },
      select: { token: true }
    });
    return invitation_token.map(invitation => invitation.token);
  } catch {
    return null;
  }
}

export default async function InvitationPage() {
  const tokens = await getInvitationTokens();

  return (
    <Suspense>
      <InvitationVerificationTokenForm tokens={tokens} />
    </Suspense>
  );
}
