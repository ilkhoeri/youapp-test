'use client';
import * as React from 'react';
import { InferTag, ReadValues, User } from './types';
import { cn } from 'cn';
import { allowedEmoji, allowedPatterns, InlineEditorConfig, UsersType } from './inline-editor';

type TokensRendererSelector = 'a' | 'mention' | 'text' | InferTag<typeof allowedPatterns>;
type InlineSelector = 'root' | 'expand' | 'ellipsis' | TokensRendererSelector;
type CSSProperties = React.CSSProperties & Record<string, any>;

interface StylesProps<TSelector extends string> {
  unstyled?: boolean | Partial<Record<TSelector, boolean>>;
  styles?: Partial<Record<TSelector, CSSProperties>>;
  classNames?: Partial<Record<TSelector, string>>;
}

type BaseProps<T = object> = T & {
  style?: CSSProperties;
  className?: string;
  dir?: 'auto' | 'ltr' | 'rtl';
};

type TagPatterns = typeof parsedPatterns;

interface GetProps<TSelector extends string> extends StylesProps<TSelector>, BaseProps {}

type ComponentProps = Omit<React.ComponentProps<'div'>, keyof GetProps<string>>;

export interface SafeInlineRendererProps<TUser = User> extends ComponentProps, InlineEditorConfig<TUser>, GetProps<InlineSelector> {
  value: string | null | undefined;
  expandSteps?: number[];
  defaultExpand?: number;
  expand?: number;
  onExpandChange?: (prev: number | ((prev: number) => number)) => void;
  onExpandClick?: React.MouseEventHandler<HTMLButtonElement>;
  ellipsis?: React.ReactNode;
}

function getProps<TSelector extends string = TokensRendererSelector>(selector: TSelector, opts: GetProps<TSelector> = {}) {
  const { classNames, dir, styles, unstyled: unstyledProp, className, style } = opts;
  const unstyled = typeof unstyledProp === 'object' ? unstyledProp?.[selector] : unstyledProp;

  return {
    dir,
    className: classNames?.[selector] || className ? cn(!unstyled && `${selector}`, classNames?.[selector], className) : undefined,
    style: { ...styles?.[selector], ...style }
  };
}

type TokenType = 'emoji' | TokensRendererSelector;
type Token = {
  type: TokenType;
  content: string;
  match?: RegExpExecArray;
};

export function tokenize(text: string, patterns: TagPatterns = parsedPatterns): Token[] {
  const tokens: Token[] = [];
  let input = text;

  while (input.length > 0) {
    let earliestMatch: {
      pattern: (typeof patterns)[number];
      match: RegExpExecArray;
      index: number;
    } | null = null;

    for (const pattern of patterns) {
      // const regex = new RegExp(pattern.regex.source, pattern.regex.flags.replace('g', '')); // disable global
      const regex = new RegExp(pattern.regex.source, 'gm'); // multiline
      const match = regex.exec(input);
      if (match && (earliestMatch === null || match.index < earliestMatch.index)) {
        const index = match.index;
        if (pattern.tag.startsWith('h') && pattern.regex.source.startsWith('^')) {
          if (index !== 0 && input[index - 1] !== '\n') continue; // hanya match awal baris
        }

        earliestMatch = { pattern, match, index };
      }
    }

    if (!earliestMatch) {
      tokens.push({ type: 'text', content: input });
      break;
    }

    const { pattern, match, index: i } = earliestMatch;

    // Add any plain text before this match
    if (i > 0) {
      tokens.push({ type: 'text', content: input.slice(0, i) });
    }

    // Push token based on match
    tokens.push({ type: pattern.tag, content: match[1] ?? match[0], match: match.length > 1 ? match : undefined });

    // Slice the input and continue
    input = input.slice(i + match[0].length);
  }

  return tokens;
}

export function safeTruncate(text: string, max: number): string {
  if (!text || text.length <= max) return text;

  const sliced = text.slice(0, max);

  const lastSpace = sliced.lastIndexOf(' ');
  if (lastSpace === -1) return ''; // tidak ada spasi sama sekali

  return sliced.slice(0, lastSpace).trim();
}

export function safeTokensByTruncate(data: Token[], plaintext: string): Token[] {
  const result: Token[] = [];
  let remaining = plaintext;

  for (const { type, content, match } of data) {
    if (!remaining) break;

    if (remaining.length >= content.length) {
      result.push({ type, content, match });
      remaining = remaining.slice(content.length);
    } else {
      // safe truncate: clean cut based on words
      const cleanCut = safeTruncate(content, remaining.length);
      result.push({ type, content: cleanCut, match });
      remaining = '';
    }
  }

  return result;
}

export function SafeInlineRenderer<TUser extends User = User>(_props: SafeInlineRendererProps<TUser>) {
  const {
    value,
    users,
    charPair,
    emoji = allowedEmoji,
    tagPattern = allowedPatterns,
    dir = 'auto',
    className,
    style,
    classNames,
    styles,
    unstyled,
    expandSteps,
    defaultExpand = 0,
    expand: expandProp,
    onExpandChange: setExpandedProp,
    onExpandClick,
    ellipsis = '...',
    ...props
  } = _props;

  let text: string = value ?? '';

  const STEPS = expandSteps ?? safeSliceSteps(768, 3071, text?.length);

  const [_expanded, _setExpanded] = React.useState(defaultExpand);
  const expanded = expandProp ?? _expanded;
  const setExpanded = React.useCallback(
    (prev: number | ((prev: number) => number)) => {
      const expandState = typeof prev === 'function' ? prev(expanded) : prev;
      if (setExpandedProp) setExpandedProp(expandState);
      else _setExpanded(expandState);
    },
    [expanded, STEPS]
  );

  const visibleLength = STEPS[expanded] || text?.length;
  const isTruncated = text?.length > visibleLength;

  const propsApi = { dir, classNames, styles, unstyled };

  const addEllipsis = typeof ellipsis === 'string' ? <span {...getProps('ellipsis', { classNames, styles })}>{ellipsis}</span> : ellipsis;

  return (
    <div {...props} {...getProps('root', { className, style, ...propsApi })}>
      <TokensRenderer text={text} users={users} limit={visibleLength} emoji={emoji} {...propsApi} />
      {isTruncated && addEllipsis}
      {isTruncated && (
        <button
          type="button"
          role="button"
          {...getProps('expand', propsApi)}
          onClick={e => {
            setExpanded(prev => Math.min(prev + 1, STEPS.length));
            onExpandClick?.(e);
          }}
        >
          Read more
        </button>
      )}
    </div>
  );
}
SafeInlineRenderer.displayName = 'SafeInlineRenderer';

function safeSliceSteps(start: number, step: number, max: number): number[] {
  const steps = [];
  let current = start;
  while (current < max) {
    steps.push(current);
    current += step;
  }
  return steps;
}

export interface TokensRendererProps<TUser extends User = User> extends StylesProps<TokensRendererSelector> {
  text: string;
  limit?: number;
  dir?: 'auto' | 'ltr' | 'rtl';
  emoji?: ReadValues<string>;
  tagPattern?: TagPatterns;
  users?: UsersType<TUser>;
}

export function TokensRenderer<TUser extends User = User>(props: TokensRendererProps<TUser>) {
  const { text, limit = 1000000, emoji = allowedEmoji, tagPattern, users, ...rest } = props;

  const tokens = tokenize(text, tagPattern);
  const parseText = safeTruncate(text, limit);
  const safeTokens = safeTokensByTruncate(tokens, parseText);

  return safeTokens.map((t, i) => {
    switch (t.type) {
      case 'emoji':
        return <Emoji key={i} name={t.content} emoji={emoji} />;
      case 'mention':
        return <Mention key={i} username={t.content} users={users} {...getProps('mention', rest)} />;
      case 'a':
        return <Link key={i} exec={t.match} content={t.content} {...getProps('a', rest)} />;
      case 'pre':
        return <Pre key={i} content={t.content} {...getProps('pre', rest)} />;
      case 'i':
        return (
          <em key={i} {...getProps('i', rest)}>
            {t.content}
          </em>
        );
      case 'hr':
        return <hr key={i} {...getProps('hr')} />;
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6':
      case 'i':
      case 's':
      case 'u':
      case 'code':
      case 'strong':
      case 'blockquote':
        let Component: React.ElementType = t.type;
        return (
          <Component key={i} {...getProps(t.type, rest)}>
            {t.content}
          </Component>
        );
      case 'text':
        return (
          <span key={i} {...getProps('text', rest)}>
            {t.content}
          </span>
        );

      default:
        return (
          <span key={i} {...getProps('text', rest)}>
            {t.content}
          </span>
        );
    }
  });
}

function Emoji({ name, emoji = allowedEmoji }: { name: string; emoji?: ReadValues<string> }) {
  return <React.Fragment>{emoji[name]}</React.Fragment>;
}
function Mention<TUser extends User = User>({ username, users, ...rest }: BaseProps<{ username: string; users?: UsersType<TUser> }>) {
  const user = users?.find(user => user?.name === username);

  return (
    <span data-mention={user ? `@${user.name}` : undefined} {...rest}>
      @<span dir="ltr">{username}</span>
    </span>
  );
}
function Pre({ content, ...rest }: BaseProps<{ content: string }>) {
  return (
    <pre {...rest}>
      <code>{content}</code>
    </pre>
  );
}
function Link({ exec, content, ...rest }: BaseProps<{ exec?: RegExpExecArray; content: string }>) {
  const isSame = exec && exec?.[0] === exec?.[1];
  return (
    <a href={isSame ? exec?.[1] : exec?.[2]} target="_blank" rel="noopener noreferrer nofollow" {...rest}>
      {content}
    </a>
  );
}

const parsedPatterns = [
  ...allowedPatterns,
  {
    tag: 'mention',
    // regex: /@([a-zA-Z0-9_.]+)/,
    regex: /@(\w+)/,
    open: '@',
    close: ''
  },
  {
    tag: 'a',
    regex: /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/,
    open: '[',
    close: ')',
    getProps(match: RegExpExecArray) {
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
    getProps: (match: RegExpExecArray) => ({
      href: match[1],
      target: '_blank',
      rel: 'noopener noreferrer nofollow',
      children: match[1]
    })
  },
  {
    tag: 'emoji',
    regex: /:([a-zA-Z0-9_+-]+):/,
    open: ':',
    close: ':',
    getProps(match: RegExpExecArray) {
      const name = match[1];
      const emojiChar = allowedEmoji[name];
      return {
        children: emojiChar ?? `:${name}:`
      };
    }
  },
  ...allowedPatterns
] as const;

export function tokenizeOK(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < input.length) {
    const remaining = input.slice(i);

    // 1. PRE block: ```code```
    if (remaining.startsWith('```')) {
      const endIndex = input.indexOf('```', i + 3);
      if (endIndex !== -1) {
        const content = input.slice(i + 3, endIndex).replace(/^\n/, '');
        tokens.push({ type: 'pre', content: content.replace(/\n$/, '') });
        i = endIndex + 3;
        continue;
      } else {
        // safe fallback: treat as plain text
        tokens.push({ type: 'text', content: input.slice(i) });
        break;
      }
    }

    // Bold: *text*
    if (input[i] === '*' && input.indexOf('*', i + 1) !== -1) {
      const end = input.indexOf('*', i + 1);
      if (end > i + 1) {
        const content = input.slice(i + 1, end);
        tokens.push({ type: 'strong', content });
        i = end + 1;
        continue;
      }
    }

    // Italic: _text_
    if (input[i] === '_' && input.indexOf('_', i + 1) !== -1) {
      const end = input.indexOf('_', i + 1);
      if (end > i + 1) {
        const content = input.slice(i + 1, end);
        tokens.push({ type: 'i', content });
        i = end + 1;
        continue;
      }
    }

    // Mention: @username
    if (input[i] === '@') {
      const mentionMatch = /^[a-zA-Z0-9_.]+/.exec(input.slice(i + 1));
      if (mentionMatch) {
        tokens.push({ type: 'mention', content: mentionMatch[0] });
        i += mentionMatch[0].length + 1;
        continue;
      }
    }

    // Emoji: :smile:
    if (input[i] === ':' && input.indexOf(':', i + 1) !== -1) {
      const end = input.indexOf(':', i + 1);
      const name = input.slice(i + 1, end);
      const emojiChar = allowedEmoji[name];
      if (emojiChar) {
        tokens.push({ type: 'emoji', content: emojiChar });
      } else {
        tokens.push({ type: 'text', content: `:${name}:` });
      }
      i = end + 1;
      continue;
    }

    // Link: https://...
    const linkMatch = /^https?:\/\/[^\s)]+/.exec(input.slice(i));
    if (linkMatch) {
      tokens.push({ type: 'a', content: linkMatch[0] });
      i += linkMatch[0].length;
      continue;
    }

    // Fallback: collect text until next special char
    let text = '';
    const start = i;

    while (i < input.length && !input.startsWith('```', i) && !['*', '_', '@', ':'].includes(input[i]) && !/^https?:\/\//.test(input.slice(i))) {
      text += input[i];
      i++;
    }

    if (text) {
      tokens.push({ type: 'text', content: text });
    }

    // 🛑 Pastikan tidak stuck: kalau tidak bergerak, skip 1 char
    if (i === start) {
      tokens.push({ type: 'text', content: input[i] });
      i++;
    }
  }

  return tokens;
}
