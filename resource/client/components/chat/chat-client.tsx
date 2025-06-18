'use client';
import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { ChatSkeleton } from './chat-skeleton';
import { useActiveChat } from './chat-context';
import { AllChatProps, Message as MessageProp } from '@/resource/types/user';
import { ChatBody, ChatBodyProps, ChatBackground, ChatForm, ChatHeader, ChatHeaderProps } from './chat-contents';
import { EmptyChat } from './chat-room';
import { useApp } from '../../contexts/app-provider';
import { getChats, getMessages } from '@/resource/server/messages/get-chats';

interface ChatGroup {
  id: string;
  name: string;
  messages: Array<MessageProp>;
}

export type ChatDisplayProps = Nullable<ChatHeaderProps & ChatBodyProps, 'messages.required' | 'chat.required'>;

export function ChatClient({ chats }: { chats: Array<AllChatProps> | null }) {
  const { user } = useApp();
  const { loading, setLoading, searchSlug: chatGroupId } = useActiveChat();

  // const [allChat, setAllChat] = React.useState<Array<AllChatProps> | null>(null);
  const [chatGroup, setChatGroup] = React.useState<Array<MessageProp> | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!chatGroupId) {
      // setAllChat(null);
      setChatGroup(null);
      return;
    }

    const fetchChatGroup = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`api/chats/${chatGroupId}`);
        if (!response.ok) throw new Error('Failed to fetch chat group');
        const data = await response.json();
        setChatGroup(data);
        // await getMessages(chatGroupId).then(data => setChatGroup(data));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchChatGroup();
  }, [chatGroupId]);

  if (loading) return <ChatSkeleton />;

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!chatGroupId) {
    return (
      <div className="flex h-full flex-col py-8">
        <EmptyChat />
      </div>
    );
  }

  if (!chats || !chatGroup) {
    return (
      <div className="flex h-full flex-col py-8">
        <EmptyChat content="Chat group tidak ditemukan" className="text-red-500 dark:text-red-600" />
      </div>
    );
  }

  const chat = chats?.find(chat => chat.id === chatGroupId);
  const members = chat?.users?.filter(find => find.email !== user?.email);

  return (
    <div className="flex h-full flex-col">
      <div className="h-full flex flex-col relative z-[9]">
        <ChatHeader chat={chat} />
        <ChatBody members={members} messages={chatGroup} />
        <ChatForm members={members} messages={chatGroup} />
      </div>
      <ChatBackground />
    </div>
  );
}
