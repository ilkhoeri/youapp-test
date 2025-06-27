import { cookies } from 'next/headers';
import { getChats } from '@/resource/server/messages/get-chats';
import { currentUser, getUsers } from '@/resource/db/user/get-accounts';
import { ChatContainer } from '@/resource/client/components/chat/chat-container';
import { ActiveChatProvider } from '@/resource/client/components/chat/chat-context';
import { ChatQuerys } from '@/resource/client/components/chat/types';

import type { Metadata } from 'next';

// const QUERY: chattype = '';

interface Params {
  searchParams: Promise<ChatQuerys>;
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
  const [chats, users, querys] = await Promise.all([getChats(), getUsers(), params.searchParams]);

  const cookieStore = await cookies();
  const layout = cookieStore.get('__resizable-panels:layout:chat_container');
  const collapsed = cookieStore.get('__resizable-panels:collapsed');

  const defaultLayout = layout ? JSON.parse(layout.value) : undefined;
  const defaultCollapsed = collapsed ? JSON.parse(collapsed.value) : undefined;

  return (
    <ActiveChatProvider querys={querys} chats={chats}>
      <ChatContainer accounts={users} defaultLayout={defaultLayout} defaultCollapsed={defaultCollapsed} navCollapsedSize={4} />
    </ActiveChatProvider>
  );
}
