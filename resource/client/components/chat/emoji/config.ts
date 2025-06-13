export type PositionType = number | `${number}`;

export interface EmojiMapItem {
  emoji: string;
  entity: string;
  srcKey: number;
  position: {
    x: PositionType;
    y: PositionType;
  };
}

export const reactionsMap: EmojiMapItem[] = [
  { emoji: '❤️', entity: '', srcKey: 7, position: { x: -80, y: -80 } },
  { emoji: '👍', entity: '', srcKey: 38, position: { x: 0, y: -40 } }
  // tambahkan emoji lainnya di sini
];

/**
 * Mencari konfigurasi emoji berdasarkan emoji string dari database.
 * @param emoji Emoji seperti '❤️', '👍', dll.
 * @returns Object yang berisi srcKey dan position jika ditemukan.
 */
export function getEmoji(emoji: string): Pick<EmojiMapItem, 'srcKey' | 'position'> | undefined {
  const found = reactionsMap.find(item => item.emoji === emoji);
  if (!found) return undefined;
  return {
    srcKey: found.srcKey,
    position: found.position
  };
}
