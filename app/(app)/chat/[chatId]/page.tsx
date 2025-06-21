import { EmptyChat } from '@/resource/client/components/chat/chat-room';
import { currentUser } from '@/resource/db/user/get-accounts';
import { getChatById, getMessages } from '@/resource/server/messages/get-chats';
import { ChatForm } from '@/resource/client/components/chat/chat-form';
import { ChatHeader } from '@/resource/client/components/chat/chat-header';
import { ChatBody } from '@/resource/client/components/chat/chat-body';
import { ChatBackground } from '@/resource/client/components/chat/chat-background';
import { ActiveChatProvider } from '../../../../resource/client/components/chat/chat-context';
import { queryEntries } from '@/resource/client/components/chat/types';

import type { Metadata, ResolvingMetadata } from 'next';

interface Params {
  params: Promise<{ chatId: string }>;
  searchParams: Promise<{ getAccount: string }>;
}

export async function generateMetadata({ params }: Params, parent: ResolvingMetadata): Promise<Metadata> {
  const [chat, { chatId }, { openGraph }] = await Promise.all([getChatById((await params).chatId), params, parent]);

  const previousImages = openGraph?.images || [];

  const url = process.env.NEXT_PUBLIC_SITE_URL;
  const slug = `/chat/${chatId}`;
  const namePage = chat?.name ?? '';

  return {
    title: 'Chat Group',
    description: namePage,
    openGraph: {
      title: namePage,
      siteName: namePage,
      description: namePage,
      images: [
        {
          url: chat?.avatarUrl ?? '',
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

export default async function ChatIdPage({ params }: Params) {
  const [{ chatId }] = await Promise.all([params]);
  const [chat, messages] = await Promise.all([getChatById(chatId), getMessages(chatId)]);

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
    <ActiveChatProvider querys={queryEntries(chatId)}>
      <section className="w-full max-w-5xl mx-auto">
        <div className="lg:pl-80 h-full">
          <div className="h-full flex flex-col">
            <ChatHeader chat={chat} />
            <ChatBody messages={messages} />
            <ChatForm messages={messages} />
          </div>
          <ChatBackground />
        </div>
      </section>
    </ActiveChatProvider>
  );
}
