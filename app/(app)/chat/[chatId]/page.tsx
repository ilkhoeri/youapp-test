import { redirect } from 'next/navigation';
import { currentUser, getUserByRefId } from '@/resource/db/user/get-accounts';

import type { Metadata, ResolvingMetadata } from 'next';
import { EmptyChat } from '@/resource/client/components/chat/chat-room';
import { getChatById, getMessages } from '@/resource/server/messages/get-chats';
import { ChatBody, ChatForm, ChatHeader } from '@/resource/client/components/chat/chat-contents';
import { ActiveChatProvider } from '../../../../resource/client/components/chat/chat-context';

interface Params {
  params: Promise<{ chatId: string }>;
  searchParams: Promise<{ getAccount: string }>;
}

export async function generateMetadata({ params, searchParams }: Params, parent: ResolvingMetadata): Promise<Metadata> {
  const [session, { chatId }, { openGraph }] = await Promise.all([currentUser(), params, parent]);

  const previousImages = openGraph?.images || [];

  const url = process.env.NEXT_PUBLIC_SITE_URL;
  const slug = `/chat/${chatId}` || '';
  const namePage = session?.name || 'NotFound!';

  return {
    title: 'Chat Group',
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

export default async function ChatIdPage({ params, searchParams }: Params) {
  const [session, searchAccount, { chatId }] = await Promise.all([currentUser(), getUserByRefId((await searchParams).getAccount), params]);
  const [chat, messages] = await Promise.all([getChatById(chatId), getMessages(chatId)]);
  // if (!session) redirect('/auth/sign-in');

  if (!chat) {
    return (
      <div className="lg:pl-80 h-full">
        <div className="h-full flex flex-col">
          <EmptyChat />
        </div>
      </div>
    );
  }

  return (
    <ActiveChatProvider searchQuery="">
      <section className="w-full max-w-5xl mx-auto">
        <div className="lg:pl-80 h-full">
          <div className="h-full flex flex-col">
            <ChatHeader chat={chat} />
            <ChatBody messages={messages} />
            <ChatForm messages={messages} />
          </div>
        </div>
      </section>
    </ActiveChatProvider>
  );
}
