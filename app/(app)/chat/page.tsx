import { redirect } from 'next/navigation';
import { currentUser, getUserByRefId, getUsers } from '@/resource/db/user/get-accounts';
import { EmptyRoomChat } from '@/resource/client/components/chat/chat-room';
import { getChats } from '@/resource/server/messages/get-chats';
import { ChatContainer } from '@/resource/client/components/chat/component';

import type { Metadata, ResolvingMetadata } from 'next';
import { cookies } from 'next/headers';

export async function generateMetadata(parent: ResolvingMetadata): Promise<Metadata> {
  const [session, { openGraph }] = await Promise.all([currentUser(), parent]);

  const previousImages = openGraph?.images || [];

  const url = process.env.NEXT_PUBLIC_SITE_URL;
  const slug = `/chat/`;
  const namePage = session?.name || 'NotFound!';

  return {
    title: 'chat',
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

export default async function ChatPage() {
  const [chats, users] = await Promise.all([getChats(), getUsers()]);

  const cookieStore = await cookies();
  const layout = cookieStore.get('react-resizable-panels:layout:chat_container');
  const collapsed = cookieStore.get('react-resizable-panels:collapsed');

  const defaultLayout = layout ? JSON.parse(layout.value) : undefined;
  const defaultCollapsed = collapsed ? JSON.parse(collapsed.value) : undefined;

  // const [session] = await Promise.all([currentUser()]);
  // if (!session) redirect('/auth/sign-in');

  // <EmptyRoomChat />
  return <ChatContainer accounts={users} chats={chats} defaultLayout={defaultLayout} defaultCollapsed={defaultCollapsed} navCollapsedSize={4} />;
}
