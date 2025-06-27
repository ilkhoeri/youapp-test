'use client';
import * as React from 'react';
import { ObjectId } from 'bson';
import { OptimisticMessage } from '@/resource/types/chats';
import { Account } from '@/resource/types/user';
import { SendMessage } from '@/resource/schemas/chat';

type ChatMessage = {
  id: string; // UUID atau id sementara
  body: string;
  senderId: string;
  status: 'sending' | 'sent' | 'failed';
  createdAt: Date;
};

export type OptimisticMessageLocal = OptimisticMessage & {
  localId?: string | null;
};

/**
 * @example
 * {messages.map((msg) => (
 *   <div key={msg.id} className="flex items-center space-x-2">
 *     <p className="bg-gray-200 px-3 py-1 rounded">{msg.body}</p>
 *     {msg.status === 'sending' && <span className="text-xs text-gray-500">Sending...</span>}
 *     {msg.status === 'failed' && (
 *       <button onClick={() => retrySend(msg)} className="text-red-500 text-xs">Retry</button>
 *     )}
 *   </div>
 * ))}
 */
export function useOptimisticMessages(chatId: string | null | undefined, initialMessages: OptimisticMessage[], currentUser: Account) {
  const [messages, setMessages] = React.useState<OptimisticMessageLocal[]>(initialMessages);

  const sendMessage = React.useCallback(
    async (value: SendMessage) => {
      // if (!currentChatId || !value.body || !value.mediaUrl) return;

      const localId = new ObjectId().toHexString();

      const now = new Date();

      const body = { body: value.body ?? null, mediaUrl: value.mediaUrl ?? null, chatId: chatId!, localId, type: 'TEXT' as OptimisticMessageLocal['type'] };

      const optimisticMessage: OptimisticMessageLocal = {
        ...body,
        id: localId,
        localId,
        status: 'SENDING',
        sender: currentUser!,
        senderId: currentUser?.id!,
        createdAt: now,
        editedAt: now,
        seen: [],
        seenIds: [],
        deletedForUserIds: [],
        isSystemMessage: false,
        isEdited: false,
        isDeleted: false,
        reactions: null,
        replyToId: null,
        mediaType: null,
        forwardedFromMessageId: null,
        forwardedFromId: null
      };

      // ⏱️ 1. Optimistic UI
      setMessages(prev => [...prev, optimisticMessage]);

      try {
        const res = await fetch(`/api/chats/${chatId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });

        const result = await res.json();

        // ✅ 2. Update message with real ID
        setMessages(prev => prev.map(msg => (msg.id === localId ? { ...msg, id: result.id, status: 'SENT', createdAt: new Date(result.createdAt) } : msg)));
      } catch (err) {
        // ❌ 3. Mark as failed
        setMessages(prev => prev.map(msg => (msg.id === localId ? { ...msg, status: 'FAILED' } : msg)));
      }
    },
    [chatId]
  );

  const retrySend = React.useCallback(async (msg: OptimisticMessage) => {
    await sendMessage({ body: msg.body ?? undefined, mediaUrl: msg.mediaUrl ?? undefined });
  }, []);

  /** Optimistically remove from UI */
  const deleteMessage = React.useCallback(
    async (messageId: string) => {
      // 1. snapshot for rollback
      const prev = [...messages];
      // 2. Optimistically remove message dari UI
      setMessages(curr => curr.filter(msg => msg.id !== messageId));
      // setMessages(curr => curr.map(msg => (msg.id === messageId ? { ...msg, isDeleted: true } : msg))); // soft deleting
      try {
        const res = await fetch(`/api/chats/${chatId}/messages/${messageId}`, {
          method: 'DELETE'
        });
        if (!res.ok) throw new Error('Delete failed');
        // ✅ Success — do nothing, message already removed
      } catch (err) {
        console.error('Delete failed, restoring message', err);
        // ❌ Gagal — restore message
        setMessages(prev); // rollback: tampilkan kembali jika gagal
      }
    },
    [messages.length, chatId]
  );

  return { messages, setMessages, sendMessage, retrySend, deleteMessage };
}
