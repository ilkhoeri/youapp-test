import type { Message, MinimalAccount } from '@/resource/types/user';

type GroupPosition = 'only' | 'top' | 'middle' | 'bottom';

export interface EnrichedMessage extends Message {
  isFirst: boolean;
  isLast: boolean;
  isFirstInDay: boolean;
  isLastInDay: boolean;
  isRepeat: boolean;
  isRepeatInDay: boolean;
  isFromCurrentUser: boolean;
  dayKey: string; // contoh: "2025-05-29"
  groupPosition: GroupPosition;
  isEdited: boolean;
  totalCount: number;
}

export function getGroupPosition(prev: Message | undefined, next: Message | undefined, current: Message): GroupPosition {
  const currentDay = getDayKey(new Date(current.createdAt));
  const sameAsPrev = prev && prev.senderId === current.senderId && getDayKey(new Date(prev.createdAt)) === currentDay;
  const sameAsNext = next && next.senderId === current.senderId && getDayKey(new Date(next.createdAt)) === currentDay;

  if (!sameAsPrev && !sameAsNext) return 'only';
  if (!sameAsPrev && sameAsNext) return 'top';
  if (sameAsPrev && !sameAsNext) return 'bottom';
  return 'middle';
}

function getDayKeyUTC(date: Date): string {
  return date.toISOString().split('T')[0]; // yyyy-mm-dd // e.g., "2025-05-29"
}

function getDayKey(date: Date): string {
  // Keluarkan "YYYY-MM-DD" dari waktu lokal (bukan UTC)
  return date.toLocaleDateString('sv-SE'); // "2025-06-11"
}

export function enrichMessages(messages: Message[], user: MinimalAccount): EnrichedMessage[] {
  return messages.map((message, index, arr) => {
    const currentDate = new Date(message.createdAt);
    const currentDayKey = getDayKey(currentDate);

    const prev = arr[index - 1];
    const next = arr[index + 1];

    const totalCount = messages.length;

    const prevDayKey = prev ? getDayKey(new Date(prev.createdAt)) : null;
    const nextDayKey = next ? getDayKey(new Date(next?.createdAt)) : null;

    const isFirst = index === 0;
    const isLast = index === arr.length - 1;

    const isFirstInDay = !prev || prevDayKey !== currentDayKey;
    const isLastInDay = !next || nextDayKey !== currentDayKey;

    const isRepeat = !!prev && prev.senderId === message.senderId;
    const isRepeatInDay = isRepeat && prevDayKey === currentDayKey;

    // const isOwn = message?.sender?.email === user?.email;
    // const isFromCurrentUser = message.senderId === currentUserId;
    const isFromCurrentUser = message?.sender?.email === user?.email;

    // const isEdited = message.editedAt !== undefined && message.editedAt !== null && new Date(message.editedAt).getTime() !== currentDate.getTime();
    // opsi kedua - menangani lebih hati-hati
    // const isEdited = message.editedAt != null && new Date(message.editedAt).getTime() > new Date(message.createdAt).getTime();
    const isEdited = message.editedAt != null && Math.abs(new Date(message.editedAt).getTime() - new Date(message.createdAt).getTime()) > 1000;
    // tentukan groupPosition

    // const sameAsPrev = prev && prev.senderId === message.senderId && prevDayKey === currentDayKey;
    // const sameAsNext = next && next.senderId === message.senderId && nextDayKey === currentDayKey;
    // const groupPosition: GroupPosition = !sameAsPrev && !sameAsNext ? 'only' : !sameAsPrev && sameAsNext ? 'top' : sameAsPrev && !sameAsNext ? 'bottom' : 'middle';

    const groupPosition = getGroupPosition(prev, next, message);

    return {
      ...message,
      totalCount,
      isFirst,
      isLast,
      isFirstInDay,
      isLastInDay,
      isRepeat,
      isRepeatInDay,
      isFromCurrentUser,
      isEdited,
      dayKey: currentDayKey,
      groupPosition
    };
  });
}

type MessagesByDate = Record<
  string,
  {
    messages: EnrichedMessage[];
    count: number;
    label: string;
  }
>;

export type GroupedMessages = {
  byDate: MessagesByDate;
  totalCount: number;
  dateKeys: string[]; // ordered list of dateKeys, untuk urutan tampilan
  lastMessage: EnrichedMessage | undefined;
};

export function groupMessagesByDate(messages: Message[], user: MinimalAccount): GroupedMessages {
  const enriched = enrichMessages(messages, user);

  const byDate: MessagesByDate = {};

  for (const msg of enriched) {
    const dayKey = msg.dayKey;

    if (!byDate[dayKey]) {
      byDate[dayKey] = {
        messages: [],
        count: 0,
        label: formatDayLabel(dayKey)
      };
    }

    byDate[dayKey].messages.push(msg);
    byDate[dayKey].count++;
  }

  // pastikan tanggal terurut naik (dari awal ke akhir)←
  const dateKeys = Object.keys(byDate).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  const totalCount = enriched.length;

  const lastMessage = getLastMessage({ byDate, dateKeys });

  return {
    totalCount,
    byDate,
    dateKeys,
    lastMessage
  };
}

type LastMessage = Pick<GroupedMessages, 'byDate' | 'dateKeys'>;

export function getLastMessage(grouped: LastMessage): EnrichedMessage | undefined {
  const lastDateKey = grouped.dateKeys[grouped.dateKeys.length - 1];
  const lastMessages = grouped.byDate[lastDateKey]?.messages;
  return lastMessages?.[lastMessages.length - 1];
}

/**
 * @example
 * {Object.entries(groupedMessagesByDay).map(([day, messages]) => (
 *   <div key={day}>
 *     <DateDivider date={day} count={countByDay[day]} />
 *     {messages.map((msg) => (
 *       <MessageBubble key={msg.id} data={msg} />
 *     ))}
 *   </div>
 * ))}
 * @param messages Message[]
 * @param user MinimalAccount
 * @returns
 */
export function groupMessagesByDay(messages: Message[], user: MinimalAccount) {
  const enriched = enrichMessages(messages, user);

  const groupedMessagesByDay: Record<string, EnrichedMessage[]> = {};
  const countByDay: Record<string, number> = {};

  for (const msg of enriched) {
    if (!groupedMessagesByDay[msg.dayKey]) {
      groupedMessagesByDay[msg.dayKey] = [];
    }
    groupedMessagesByDay[msg.dayKey].push(msg);
  }

  for (const [dayKey, messages] of Object.entries(groupedMessagesByDay)) {
    countByDay[dayKey] = messages.length;
  }

  return {
    enrichedMessages: enriched,
    groupedMessagesByDay,
    countByDay,
    totalCount: enriched.length
  };
}

interface FDLOptions {
  options?: Intl.DateTimeFormatOptions;
  locale?: 'en-US' | 'id-ID' | 'fr-FR' | 'ja-JP' | (string & {});
}
export function formatDayLabel(dayKey: string, opts: FDLOptions = {}): string {
  const { locale = 'en-US', options: optionsProp } = opts;
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const targetDate = new Date(dayKey + 'T00:00:00');

  const isSameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  if (isSameDay(targetDate, today)) return 'Today';
  if (isSameDay(targetDate, yesterday)) return 'Yesterday';

  const nowYear = today.getFullYear();
  const targetYear = targetDate.getFullYear();

  const options: Intl.DateTimeFormatOptions =
    optionsProp ?? (nowYear === targetYear ? { weekday: 'long', month: 'short', day: 'numeric' } : { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });

  return targetDate.toLocaleDateString(locale, options);
}
