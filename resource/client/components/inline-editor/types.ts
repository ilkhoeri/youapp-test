import { TTagPatterns } from './inline-editor';

export interface User {
  id: string;
  name: string;
  image?: string | null | undefined;
}

export interface EmojiEntry {
  emoji: string;
  aliases: string[];
}

/** @example type Tags = InferTag<typeof allowedPatterns>; // "code" | "s" | "strong" | ... */
export type InferTag<T extends TTagPatterns = TTagPatterns> = NonNullable<T[number]['tag']>;

/** @example type Shortcuts = InferShortcut<typeof allowedPatterns>; // "ctrl + `" | "s" | "shift + s" | ... */
export type InferShortcut<T extends TTagPatterns = TTagPatterns> = NonNullable<T[number]['shortcut']>;

export type TValues<T extends unknown = string> = Record<string, T>;

export type ReadValues<T extends unknown = string> = TValues<T> | Readonly<TValues<T>>;
