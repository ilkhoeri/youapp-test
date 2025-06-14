import axios from 'axios';
import type { Message } from '@/resource/types/user';

export async function markMessagesAsSeenSequentially(chatId: string, messages: Message[], currentUserId: string) {
  const unseenMessages = messages.filter(m => !m.seenIds.includes(currentUserId));

  for (const message of unseenMessages) {
    try {
      await axios.post(`/api/chats/${chatId}/seen`, { messageId: message.id });
      // Optional: Delay antar request
      await new Promise(res => setTimeout(res, 100)); // delay 100ms
    } catch (error) {
      console.error('Failed to mark as seen:', message.id, error);
      break; // atau continue, sesuai kebutuhan
    }
  }
}
