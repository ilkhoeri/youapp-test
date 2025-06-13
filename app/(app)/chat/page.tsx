import { cookies } from 'next/headers';
import { currentUser, getUsers } from '@/resource/db/user/get-accounts';
import { getChatById, getChats, getMessages } from '@/resource/server/messages/get-chats';
import { ChatContainer } from '@/resource/client/components/chat/component';
// import { EmptyRoomChat } from '@/resource/client/components/chat/chat-room';
// import { redirect } from 'next/navigation';

import type { Metadata } from 'next';

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
  const [chat, messages] = await Promise.all([getChatById(groupChatId), getMessages(groupChatId)]);

  const cookieStore = await cookies();
  const layout = cookieStore.get('__resizable-panels:layout:chat_container');
  const collapsed = cookieStore.get('__resizable-panels:collapsed');

  const defaultLayout = layout ? JSON.parse(layout.value) : undefined;
  const defaultCollapsed = collapsed ? JSON.parse(collapsed.value) : undefined;

  // const [session] = await Promise.all([currentUser()]);
  // if (!session) redirect('/auth/sign-in');

  return (
    <>
      <ChatContainer
        members={chat?.users}
        searchQuery={QUERY}
        accounts={users}
        chats={chats}
        chat={chat}
        message={null}
        messages={messages}
        defaultLayout={defaultLayout}
        defaultCollapsed={defaultCollapsed}
        navCollapsedSize={4}
      />
      {messages.map((message, i) => (
        <span
          key={i}
          className="relative overflow-x-auto [text-wrap-mode:nowrap] [-webkit-user-modify:read-write-plaintext-only] min-h-20 w-full rounded-xl border border-border p-3 py-2 bg-muted-emphasis font-geist-mono text-sm text-muted-foreground md:text-sm max-w-3xl mt-12 mx-auto"
        >
          {JSON.stringify(message, null, 2)}
        </span>
      ))}
    </>
  );
}
