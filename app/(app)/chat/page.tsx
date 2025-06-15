import { cookies } from 'next/headers';
import { currentUser, getUsers } from '@/resource/db/user/get-accounts';
import { getChatById, getChats, getMessages } from '@/resource/server/messages/get-chats';
import { ChatContainer } from '@/resource/client/components/chat/chat-container';
import { ChatSkeleton } from '@/resource/client/components/chat/chat-skeleton';
import { Suspense } from 'react';
// import { EmptyRoomChat } from '@/resource/client/components/chat/chat-room';
// import { redirect } from 'next/navigation';

import type { Metadata } from 'next';
import { ActiveChatProvider } from '@/resource/client/components/chat/chat-context';

const QUERY = 'chatgroup';

interface Params {
  searchParams: Promise<{ [QUERY]: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  const [session] = await Promise.all([currentUser()]);

  const url = process.env.NEXT_PUBLIC_SITE_URL;
  const slug = `/chat/`;
  const namePage = session?.name || 'NotFound!';

  return {
    title: 'Chats',
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
        }
      ],
      url: url + slug,
      locale: 'en_US',
      type: 'website'
    }
  };
}

export default async function ChatPage(params: Params) {
  const [chats, users, { chatgroup: groupChatId }] = await Promise.all([getChats(), getUsers(), params.searchParams]);

  const cookieStore = await cookies();
  const layout = cookieStore.get('__resizable-panels:layout:chat_container');
  const collapsed = cookieStore.get('__resizable-panels:collapsed');

  const defaultLayout = layout ? JSON.parse(layout.value) : undefined;
  const defaultCollapsed = collapsed ? JSON.parse(collapsed.value) : undefined;

  // const [session] = await Promise.all([currentUser()]);
  // if (!session) redirect('/auth/sign-in');

  // const chat = chats?.find(chat => chat.type === 'GROUP' && chat.id === groupChatId);

  return (
    <ActiveChatProvider searchQuery={QUERY}>
      <ChatContainer searchQuery={QUERY} accounts={users} chats={chats} defaultLayout={defaultLayout} defaultCollapsed={defaultCollapsed} navCollapsedSize={4} />
    </ActiveChatProvider>
  );
}
