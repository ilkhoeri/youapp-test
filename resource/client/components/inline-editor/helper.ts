import { allowedEmoji } from './inline-editor';

const emojiRegex = /:([a-z0-9_+-]+):/g;

export function getSafeInlineText(text: string | null | undefined) {
  if (!text) return '';
  let parsed = text.replace(/\u200B/g, '').replace(emojiRegex, (_, name) => allowedEmoji[name] ?? `:${name}:`);
  return parsed;
}
