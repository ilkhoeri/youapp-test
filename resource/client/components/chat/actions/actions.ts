import axios from 'axios';
// import type { OptimisticMessage } from '@/resource/types/chats';
import { EnrichedMessage } from '../messages/message-helper';

export async function markMessagesAsSeenSequentially(chatId: string | undefined, unseenMessages: EnrichedMessage[]) {
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
