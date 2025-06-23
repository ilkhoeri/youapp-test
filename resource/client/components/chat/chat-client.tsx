'use client';
import * as React from 'react';
import { ChatSkeleton } from './chat-skeleton';
import { useActiveChat } from './chat-context';
import { AllChatProps, Message as MessageProp } from '@/resource/types/user';
import { ChatHeader } from '@/resource/client/components/chat/chat-header';
import { ChatBody } from '@/resource/client/components/chat/chat-body';
import { ChatForm } from './chat-form';
import { ChatBackground } from './chat-background';
import { useApp } from '../../contexts/app-provider';
import { EmptyChat } from './chat-room';

interface ChatClientProps {
  messages: Array<MessageProp>;
  chats: Array<AllChatProps> | null;
}

export function ChatClient({ chats, messages }: ChatClientProps) {
  const { user } = useApp();
  const { slug: chatId, loading, setLoading, onReload } = useActiveChat();

  const [_, setMessages] = React.useState<Array<MessageProp> | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  /**
  React.useEffect(() => {
    if (!chatId) {
      setMessages(null);
      return;
    }

    const fetchMessages = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`api/chats/${chatId}`);
        if (!response.ok) throw new Error('Failed to fetch chat group');
        const data = await response.json();
        setMessages(data);
        // await getMessages(chatId).then(data => setMessages(data));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
        onReload();
      }
    };

    fetchMessages();
  }, [chatId]);
*/

  React.useEffect(() => {
    if (!chatId) {
      setMessages(null);
      return;
    }
    setLoading(true);
    setError(null);
    const cleanupTimeout = setTimeout(() => {
      setLoading(false);
      setMessages(messages);
      onReload();
    }, 0);
    return () => clearTimeout(cleanupTimeout);
  }, [chatId]);

  if (loading) return <ChatSkeleton />;

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!chatId) {
    return (
      <div className="flex h-full flex-col py-8">
        <EmptyChat />
      </div>
    );
  }

  if (((!chats && messages.length < 1) || !chats?.some(c => c.id === chatId)) && !loading) {
    return (
      <div className="flex h-full flex-col py-8">
        <EmptyChat content="Chat group tidak ditemukan" className="text-red-500 dark:text-red-600" />
      </div>
    );
  }

  const chat = chats?.find(chat => chat.id === chatId);
  const membersForm = chat?.users?.filter(find => find.email !== user?.email!);

  return (
    <React.Suspense fallback={<ChatSkeleton />}>
      <div className="flex h-full flex-col">
        <div className="h-full flex flex-col relative z-[9]">
          <ChatHeader chat={chat} />
          <ChatBody members={chat?.users} messages={messages!} />
          <ChatForm members={membersForm} messages={messages!} />
        </div>
        <ChatBackground />
      </div>
    </React.Suspense>
  );
}
