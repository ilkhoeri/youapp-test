'use client';
import * as React from 'react';
import { InferTag, User } from './types';
import { cn } from 'cn';
import { allowedEmoji, allowedPatterns, escapeHtml, InlineEditorConfig, TagPattern, TTagPatterns } from './inline-editor';

type InlineTag = 'a' | InferTag<typeof allowedPatterns>;
type InlineSelector = 'mention' | InlineTag;
type CSSProperties = React.CSSProperties & Record<string, any>;

interface ElementProps {
  unstyled?: boolean | Partial<Record<InlineSelector, boolean>>;
  styles?: Partial<Record<InlineSelector, CSSProperties>>;
  classNames?: Partial<Record<InlineSelector, string>>;
  dir?: 'auto' | 'ltr' | 'rtl';
}

export interface SafeInlineDisplayProps<TTag extends TTagPatterns = TTagPatterns> extends InlineEditorConfig<TTag>, ElementProps {
  text: string | null | undefined;
  // users: User[];
}

function getProps(selector: InlineSelector, opts: ElementProps = {}) {
  const { classNames, dir, styles, unstyled: unstyledProp } = opts;
  const unstyled = typeof unstyledProp === 'object' ? unstyledProp?.[selector] : unstyledProp;

  return {
    dir,
    className: cn(!unstyled && selector, classNames?.[selector]),
    style: styles?.[selector]
  };
}

const mentionRegex = /@(\w+)/g;
const emojiRegex = /:([a-z0-9_+-]+):/g;
const combinedRegex = /@(\w+)|:([a-zA-Z0-9_+-]+):/g;

function parseUnicode(text: string): string {
  // text = text.replace(/<[^>]*>/g, '');
  return text
    .replace(/&amp;/g, '&') // harus duluan
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\u200B/g, '');
}

export function SafeInlineDisplay0<TTag extends TTagPatterns = TTagPatterns>(_props: SafeInlineDisplayProps<TTag>) {
  const { text, users, charPair, emoji = allowedEmoji, tagPattern = allowedPatterns, dir = 'auto', ...rest } = _props;

  const propApi = { dir, ...rest };

  if (!text) return null;

  const parts: (string | React.ReactElement)[] = [];

  // Step 1: Replace emoji first (since it’s purely textual, no user lookup needed)
  const emojiParsed = text.replace(emojiRegex, (_, name) => emoji[name] ?? `:${name}:`);

  // Step 2: Parse mention
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = mentionRegex.exec(emojiParsed)) !== null) {
    const start = match.index;
    const end = mentionRegex.lastIndex;
    const username = match[1];

    // Push text before @mention
    if (start > lastIndex) {
      parts.push(emojiParsed.slice(lastIndex, start));
    }

    const user = users?.find(u => u.name === username);
    if (user) {
      parts.push(
        <span key={`mention-${user.id}-${start}`} data-mention-id={user.id} {...getProps('mention', propApi)}>
          @<span dir="ltr">{user.name}</span>
        </span>
      );
    } else {
      const textParsed = emojiParsed.slice(start, end);
      parts.push(textParsed); // keep as text
    }

    lastIndex = end;
  }

  // Sisa teks setelah mention terakhir
  if (lastIndex < emojiParsed.length) {
    parts.push(emojiParsed.slice(lastIndex));
  }

  return <>{parts}</>;
}

export function SafeInlineDisplay<TTag extends TTagPatterns = TTagPatterns>(_props: SafeInlineDisplayProps<TTag>) {
  const { text, users, charPair, emoji = allowedEmoji, tagPattern = allowedPatterns, dir = 'auto', ...rest } = _props;

  const propApi = { dir, ...rest };

  if (!text) return null;

  // Step 1: Replace emoji codes with actual emoji
  // let parsed = text.replace(emojiRegex, (_, name) => emoji[name] ?? `:${name}:`);
  let parsed = text.replace(/\u200B/g, '').replace(emojiRegex, (_, name) => emoji[name] ?? `:${name}:`);

  // Step 2: Parse inline tags (bold, italic, etc.) using allowedPatterns
  function parseInlineTags0(input: string): (string | React.ReactElement)[] {
    if (!input) return [];

    let earliestMatch: {
      pattern: (typeof allowedPatterns)[number];
      match: RegExpExecArray;
      index: number;
    } | null = null;

    for (const pattern of allowedPatterns) {
      const re = new RegExp(pattern.regex.source, 'g'); // fresh regex
      const match = re.exec(input);
      if (match && (earliestMatch === null || match.index < earliestMatch.index)) {
        earliestMatch = { pattern, match, index: match.index };
      }
    }

    if (!earliestMatch) return [input];

    const { pattern, match, index } = earliestMatch;
    const fullMatch = match[0];

    // Calculate content inside open/close (without assuming match[1])
    const openLength = pattern?.open?.length ?? 0;
    const closeLength = pattern?.close?.length ?? 0;

    const innerStart = index + openLength;
    const innerEnd = index + fullMatch.length - closeLength;

    const before = input.slice(0, index);
    const innerRaw = input.slice(innerStart, innerEnd);
    const after = input.slice(index + fullMatch.length);

    // Special tag handling: hr is self-closing, no inner
    if (pattern.tag === 'hr') {
      return [
        ...parseInlineTags(before),
        React.createElement(pattern.tag, {
          key: `${pattern.tag}-${index}`,
          ...getProps?.(pattern.tag, propApi)
        }),
        ...parseInlineTags(after)
      ];
    }

    return [
      ...parseInlineTags(before),
      React.createElement(
        pattern.tag,
        {
          key: `${pattern.tag}-${index}`,
          ...getProps?.(pattern.tag, propApi)
        },
        parseInlineTags(innerRaw) // recursive!
      ),
      ...parseInlineTags(after)
    ];
  }

  function wrapWithParagraphs(input: (string | React.ReactElement)[]): React.ReactNode[] {
    const result: React.ReactNode[] = [];

    for (const item of input) {
      if (typeof item === 'string') {
        const lines = item.split(/\r?\n/);

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          if (line.trim() === '') {
            result.push(<br key={`br-${i}-${line}`} />);
          } else {
            result.push(<p key={`p-${i}-${line}`}>{line}</p>);
          }
        }
      } else {
        // Biarkan komponen seperti <pre>, <a>, <strong> tetap tampil apa adanya
        result.push(item);
      }
    }

    return result;
  }

  const parsedPatterns: TTagPatterns<InlineTag> = [
    {
      tag: 'a',
      regex: /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/,
      open: '[',
      close: ')',
      getProps(match) {
        return {
          href: match[2],
          target: '_blank',
          rel: 'noopener noreferrer nofollow',
          children: match[1]
        };
      }
    },
    {
      tag: 'a',
      regex: /\b(https?:\/\/[^\s<>"'`()[\]]+)/,
      open: '',
      close: '',
      shortcut: '',
      getProps: match => ({
        href: match[1],
        target: '_blank',
        rel: 'noopener noreferrer nofollow',
        children: match[1]
      })
    },
    ...(tagPattern as TTagPatterns<InlineTag>)
  ] as const;

  function parseInlineTags(input: string): (string | React.ReactElement)[] {
    if (!input) return [];

    let earliestMatch: {
      pattern: (typeof parsedPatterns)[number];
      match: RegExpExecArray;
      index: number;
    } | null = null;

    for (const pattern of parsedPatterns) {
      const re = new RegExp(pattern.regex.source, 'gm'); // multiline
      let match: RegExpExecArray | null;

      while ((match = re.exec(input)) !== null) {
        const index = match.index;

        // Untuk heading, hanya izinkan jika match di awal string (atau awal baris)
        if (pattern.tag.startsWith('h') && pattern.regex.source.startsWith('^')) {
          // Cek jika match bukan di awal string, kita skip (jangan nested heading)
          if (index !== 0 && input[index - 1] !== '\n') continue;
        }

        if (!earliestMatch || index < earliestMatch.index) {
          earliestMatch = { pattern, match, index };
        }

        break; // Ambil hanya match pertama
      }
    }

    if (!earliestMatch) return [input];

    const { pattern, match, index } = earliestMatch;
    const fullMatch = match[0];

    const before = input.slice(0, index);
    const after = input.slice(index + fullMatch.length);
    const idx = `${index}-${Math.random()}`;

    // Special: self-closing (like <hr>)
    // Special: <hr>
    if (pattern.tag === 'hr') {
      return [
        ...parseInlineTags(before),
        React.createElement(pattern.tag, {
          key: `${pattern.tag}-${idx}`,
          ...getProps?.(pattern.tag, propApi)
        }),
        ...parseInlineTags(after)
      ];
    }

    // Special case for links

    // Special: <a> anchor
    if (pattern.tag === 'a') {
      const propAnchor = pattern?.getProps?.(match) ?? {};
      return [...parseInlineTags(before), <a key={`a-${idx}`} {...(propAnchor as React.ComponentProps<'a'>)} {...getProps?.('a', propApi)} />, ...parseInlineTags(after)];
    }

    // if (pattern.tag === 'a') {
    //   // [label](url)
    //   if (match.length >= 3) {
    //     const label = match[1];
    //     const href = match[2];

    //     return [
    //       ...parseInlineTags(before),
    //       <a key={`a-${index}`} href={href} target="_blank" rel="noopener noreferrer nofollow" {...getProps?.('a', propApi)}>
    //         {parseInlineTags(label)}
    //       </a>,
    //       ...parseInlineTags(after)
    //     ];
    //   }

    //   // Plain URL
    //   const href = match[1] ?? match[0];
    //   return [
    //     ...parseInlineTags(before),
    //     <a key={`a-${index}`} href={href} target="_blank" rel="noopener noreferrer nofollow" {...getProps?.('a', propApi)}>
    //       {href}
    //     </a>,
    //     ...parseInlineTags(after)
    //   ];
    // }

    // For heading, use captured group (match[1]) directly
    const inner = match[1] ?? '';

    // pre
    if (pattern.tag === 'pre') {
      return [
        ...parseInlineTags(before),
        <pre key={`pre-${idx}`} {...getProps?.('pre', propApi)}>
          <code>{String(inner)}</code>
        </pre>,
        ...parseInlineTags(after)
      ];
    }
    // code
    if (pattern.tag === 'code') {
      return [
        ...parseInlineTags(before),
        <code key={`code-${idx}`} {...getProps?.('code', propApi)}>
          {String(inner)}
        </code>,
        ...parseInlineTags(after)
      ];
    }

    return [
      ...parseInlineTags(before),
      React.createElement(
        pattern.tag,
        {
          key: `${pattern.tag}-${idx}`,
          ...getProps?.(pattern.tag, propApi)
        },
        parseInlineTags(inner)
      ),
      ...parseInlineTags(after)
    ];
  }

  // Step 3: After emoji and formatting, parse @mention
  const parts: (string | React.ReactElement)[] = [];
  const tagParsed = parseInlineTags(parsed);
  for (const segment of tagParsed) {
    if (typeof segment !== 'string') {
      parts.push(segment);
      continue;
    }

    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = mentionRegex.exec(segment)) !== null) {
      const start = match.index;
      const end = mentionRegex.lastIndex;
      const before = segment.slice(lastIndex, start);
      const username = match[1];
      lastIndex = end;

      if (before) parts.push(before);

      const user = users?.find(u => u.name === username);
      if (user) {
        parts.push(
          <span key={`mention-${user.id}-${start}`} data-mention-id={user.id} {...getProps('mention', propApi)}>
            @<span dir="ltr">{user.name}</span>
          </span>
        );
      } else {
        parts.push(segment.slice(start, end));
      }
    }

    const after = segment.slice(lastIndex);
    if (after) parts.push(after);
  }

  return <>{parts}</>;
}
