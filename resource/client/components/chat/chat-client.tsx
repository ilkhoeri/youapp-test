'use client';
import * as React from 'react';
import { ChatForm } from './chat-form';
import { EmptyChat } from './chat-room';
import { ChatSkeleton } from './chat-skeleton';
import { useActiveChat } from './chat-context';
import { ChatBackground } from './chat-background';
import { ChatBody } from '@/resource/client/components/chat/chat-body';
import { ChatHeader } from '@/resource/client/components/chat/chat-header';

export function ChatClient() {
  const { chatId, loading, setLoading, onReload, chats } = useActiveChat();
  const [error, setError] = React.useState<string | null>(null);

  /**
  const [_, setMessages] = React.useState<Array<OptimisticMessage> | null>(null);

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

  const messages = React.useMemo(() => {
    const data = chats?.find(c => c.id === chatId)?.messages;
    return data ?? [];
  }, [chats, chatId]);

  React.useEffect(() => {
    if (!chatId) return;
    setLoading(true);
    setError(null);
    const cleanupTimeout = setTimeout(() => {
      setLoading(false);
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

  if (((!chats && messages?.length < 1) || !chats?.some(c => c.id === chatId)) && !loading) {
    return (
      <div className="flex h-full flex-col py-8">
        <EmptyChat content="Chat group tidak ditemukan" className="text-red-500 dark:text-red-600" />
      </div>
    );
  }

  return (
    <React.Suspense fallback={<ChatSkeleton />}>
      <div className="flex h-full flex-col">
        <div className="h-full flex flex-col relative z-[9]">
          <ChatHeader />
          <ChatBody />
          <ChatForm />
        </div>
        <ChatBackground />
      </div>
    </React.Suspense>
  );
}
