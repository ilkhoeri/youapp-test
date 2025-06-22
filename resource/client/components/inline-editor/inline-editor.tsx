'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { cn } from 'cn';
import DOMPurify from 'dompurify';
import { EmojiEntry, User } from './types';
import emojiJson from './emoji.json' with { type: 'json' };

import './inline-editor.css';
import { useElementRect } from '@/resource/hooks/use-element-info';
import { getVarsPositions, useUpdatedPositions } from '@/resource/hooks/use-open-state';
import { mergeRefs } from '@/resource/hooks/use-merged-ref';

export type TValues<T extends unknown = string> = Record<string, T>;

export type ReadValues<T extends unknown = string> = TValues<T> | Readonly<TValues<T>>;

export interface TagPattern<TTag extends keyof React.JSX.IntrinsicElements = keyof React.JSX.IntrinsicElements, TShortcut = string> {
  tag: TTag;
  regex: RegExp;
  open?: string;
  close?: string;
  shortcut?: TShortcut | undefined;
  /** **EXPERIMENTAL** */
  getProps?: (match: RegExpExecArray, props?: React.ComponentProps<TTag>) => React.ComponentProps<TTag>;
}

export type TTagPatterns<TTag extends keyof React.JSX.IntrinsicElements = keyof React.JSX.IntrinsicElements, TShortcut = string> = ReadonlyArray<TagPattern<TTag, TShortcut>>;

export interface InlineEditorConfig<TTag extends TTagPatterns = TTagPatterns> {
  tagPattern?: TTag;
  charPair?: ReadValues;
  /** `:emoji_name:` */
  emoji?: ReadValues;
  users?: User[] | null | undefined;
}

type GetProp<T = any> = {
  root?: T;
  editor?: T;
};

type __Excludes = 'dir' | 'style' | 'onChange' | 'onSubmit';
type Selector = NonNullable<keyof GetProp>;
type CSSProperties = React.CSSProperties & Record<string, any>;

interface RootStyles {
  className?: string;
  style?: CSSProperties;
}

interface InlineEditorStyles extends RootStyles {
  unstyled?: boolean | GetProp<boolean>;
  classNames?: GetProp<string>;
  styles?: GetProp<CSSProperties>;
}

export interface InlineEditorProps<TData, TTag extends TTagPatterns = TTagPatterns>
  extends InlineEditorConfig<TTag>,
    Omit<React.ComponentPropsWithRef<'div'>, __Excludes>,
    InlineEditorStyles {
  disabled?: boolean;
  dir?: 'ltr' | 'rtl' | 'auto';
  value?: string | null | undefined; // controlled
  defaultValue?: string; // uncontrolled
  onChange?: (value: string) => void;
  autoFocus?: boolean;
  placeholder?: string;
  onSubmit?(data?: TData): void;
}

interface UndoRedoStack {
  html: string;
  caret: number;
}

function getStyles(selector: Selector, opts: InlineEditorStyles = {}) {
  const { className, style, classNames, styles, unstyled: _u } = opts;
  const unstyled = typeof _u === 'object' ? _u?.[selector] : _u;
  const classes: Record<Selector, string> = {
    root: 'group/ie-root',
    editor:
      'group ie-editor relative ring-offset-transparent focus-visible:outline-0 focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 [&::-webkit-resizer]:hidden [field-sizing:content]'
  };
  return {
    className: cn(!unstyled && classes[selector], classNames?.[selector], className),
    style: { ...styles?.[selector], ...style }
  };
}

export function InlineEditor<TData, TTag extends TTagPatterns = TTagPatterns>(_props: InlineEditorProps<TData, TTag>) {
  const {
    placeholder,
    role = 'textbox',
    dir = 'ltr',
    value,
    defaultValue,
    disabled,
    'aria-disabled': arDisabled,
    onSubmit,
    onKeyDown,
    onBeforeInput,
    onChange,
    onInput,
    className,
    style,
    unstyled,
    classNames,
    styles,
    users,
    autoFocus,
    ref,
    emoji = allowedEmoji,
    charPair = allowedPairs,
    tagPattern = allowedPatterns,
    contentEditable = true,
    suppressHydrationWarning = true,
    suppressContentEditableWarning = true,
    children: __,
    dangerouslySetInnerHTML: _,
    ...props
  } = _props;

  const editorRef = React.useRef<HTMLDivElement>(null);
  const isControlled = value !== undefined || value !== null || value === '';
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? '');

  const rawText = isControlled ? (value ?? '') : internalValue;
  const formattedHTML = likeMdx(rawText).trim();

  const usersList = React.useMemo(() => (users ?? [])?.map(user => `@${user.name}`), [users]);
  const findUser = React.useCallback((query: string) => (users ?? [])?.find(user => user.name === query), [users]);

  const [mentionActive, setMentionActive] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [filteredUsers, setFilteredUsers] = React.useState<typeof users>([]);

  const rootRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLUListElement>(null);
  const root = useElementRect<HTMLDivElement>(rootRef?.current);
  const content = useElementRect<HTMLUListElement>(contentRef?.current);

  const { newAlign, newSide } = useUpdatedPositions({
    triggerRect: root.rect,
    contentRect: content.rect,
    align: 'center',
    side: 'top',
    sideOffset: 8,
    alignOffset: 0
  });

  const { vars } = getVarsPositions({
    sideOffset: 8,
    alignOffset: 0,
    align: newAlign,
    side: newSide,
    triggerRect: root.rect,
    contentRect: content.rect,
    contentSize: content.size
  });

  function emptyUsers() {
    setMentionActive(false);
    setFilteredUsers([]);
    // setPosition(null);
  }

  // Cek input untuk aktifkan mention mode
  function inputMention(e: React.FormEvent<HTMLDivElement>) {
    const sel = window.getSelection();

    if (!users || !sel || !sel.focusNode || sel.rangeCount === 0) return;

    const textBeforeCursor = getTextBeforeCursor(sel);
    const range = sel.getRangeAt(0);
    const container = e.currentTarget;

    // Jika caret berada di dalam mention, geser keluar
    const mention = range.startContainer.parentElement?.closest('.mention');
    if (mention && container.contains(mention)) {
      // Geser caret ke setelah mention
      const after = mention.nextSibling;
      if (after && after.nodeType === Node.TEXT_NODE) {
        const newRange = document.createRange();
        newRange.setStart(after, 0);
        newRange.collapse(true);
        sel.removeAllRanges();
        sel.addRange(newRange);
      } else {
        setCaretOffset(container, findOffsetAfterNode(container, mention));
      }
    }

    // Cek apakah ada '@' yang baru saja diketik tanpa spasi setelahnya
    const atIndex = textBeforeCursor.lastIndexOf('@');
    if (atIndex >= 0) {
      const query = textBeforeCursor.slice(atIndex + 1);
      if (/^[\w]*$/.test(query)) {
        // hanya alphanumeric untuk mention query
        setMentionActive(true);
        setFilteredUsers(users.filter(u => u.name.startsWith(query)));

        const user = users.find(u => u.name === query);
        if (user) {
          // insertMention(user);
          emptyUsers();
        }
      } else {
        emptyUsers();
      }
    } else {
      emptyUsers();
    }
  }

  function handleMentionKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (!mentionActive || !users || !filteredUsers?.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredUsers.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev === 0 ? filteredUsers.length - 1 : prev - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selectedUser = filteredUsers[selectedIndex];
      if (selectedUser) {
        insertMention(selectedUser);
        setMentionActive(false);
        setSelectedIndex(0); // reset index
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setMentionActive(false);
      setSelectedIndex(0); // optional reset
    }
  }

  // console.log('[EMOJI]:', JSON.stringify(convertToEmoji(emojiJson), null, 2));

  const undoStack: UndoRedoStack[] = [];
  const redoStack: UndoRedoStack[] = [];
  let lastHtmlSnapshot: string | null = null;

  const currentTags: string[] = React.useMemo(() => tagPattern?.map(allowed => allowed.tag.toUpperCase()), [tagPattern]);

  const handleInput = React.useCallback(
    (e: React.FormEvent<HTMLDivElement>) => {
      const el = e.currentTarget;
      if (!el) return;
      const text = el.textContent;

      const caretOffset = getCaretOffset(el);

      // setTimeout(() => {
      //   inputTagFormatting(tagPattern);
      //   // handleTagFormatting(tagPattern);
      // }, 300);

      autoLinkSync();

      inputMention(e);

      inputAutoEmoji(emoji);

      setCaretOffset(el, caretOffset);

      // console.log('[[ TEXT CONTENT ]]:', text);

      cleanEmptyNodes(el, currentTags);

      // console.log('TEXT:', text);
      // console.log('TEXT.LENGTH:', text?.length);
      // console.log('innerHTML:', editorRef.current?.innerHTML);
      // console.log('isControlled:', isControlled);

      el.classList.toggle('empty', text?.trim() === '');

      // const plainText = parseFromHTML(el);
      // if (!isControlled) setInternalValue(plainText);
      // if (!editorRef.current) return;
      const plainText = getPlainTextFromDOM(e.currentTarget, tagPattern, emoji);
      // onChange?.(plainText);

      if (!isControlled) setInternalValue(plainText);
      onChange?.(plainText);
    },
    [onChange]
  );

  function pushToUndoStack() {
    const html = editorRef.current?.innerHTML ?? '';
    if (html === lastHtmlSnapshot) return; // abaikan jika tidak berubah

    const caret = getCaretCharacterOffsetWithin(editorRef.current!);
    undoStack.push({ html, caret });
    redoStack.length = 0;
    lastHtmlSnapshot = html;
  }

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      // handleMentionKeyDown(e);
      const target = e.currentTarget;

      const isTagKey = [' ', 'Enter', 'Tab'].includes(e.key);
      const isMentionKey = ['ArrowUp', 'ArrowDown', 'Enter', 'Escape'].includes(e.key);

      handleMention(e);

      if (mentionActive && isMentionKey) {
        e.preventDefault(); // cegah caret berpindah
        return;
      }

      applyShortcuts(e, tagPattern);

      handleAutoLink(e.nativeEvent);

      if (isTagKey && !e.shiftKey) {
        inputTagFormatting(e, tagPattern);
        // handleTagFormatting(e, tagPattern);
        // Setelah DOM update
        // if (isCaretAtEndOfInline(currentTags)) {
        //   e.preventDefault(); // Mencegah spasi atau enter di dalam <tag> ditambahkan
        //   moveCaretAfterInline(currentTags);
        //   // Menambah spasi atau enter secara manual di luar tag
        //   insertManualChar(e);
        // }
        // if (isCaretAtEndOfBlock()) {
        //   e.preventDefault();
        //   moveCaretAfterBlock();
        // }
        // cleanEmptyNodes(e.currentTarget, currentTags);
      }

      if (isUndo(e) && undoStack.length > 1) {
        e.preventDefault();
        const last = undoStack.pop();
        if (last) redoStack.push(last);
        const prev = undoStack[undoStack.length - 1];
        target.innerHTML = prev.html;
        setCaretAtCharacterOffset(target, prev.caret);
        lastHtmlSnapshot = prev.html;
        return;
      }

      if (isRedo(e) && redoStack.length) {
        e.preventDefault();
        const next = redoStack.pop();
        if (next) {
          undoStack.push(next);
          target.innerHTML = next.html;
          setCaretAtCharacterOffset(target, next.caret);
          lastHtmlSnapshot = next.html;
        }
        return;
      }

      // Trigger push state after regular typing
      if (!e.ctrlKey && !e.metaKey && !['Shift', 'Alt'].includes(e.key)) {
        setTimeout(pushToUndoStack, 0);
      }

      const pair = charPair?.[e.key];
      if (pair && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const sel = window.getSelection();
        if (sel?.toString()) {
          e.preventDefault(); // Stop browser default behavior
          wrapSelectionWithPair(e.key, pair ?? e.key);
          return;
        }
      }

      onKeyDown?.(e);
    },
    [onKeyDown]
  );

  const handleBeforeInput = React.useCallback(
    (e: React.InputEvent<HTMLDivElement>) => {
      onBeforeInput?.(e);
    },
    [onBeforeInput]
  );

  React.useEffect(() => {
    const el = editorRef.current;
    if (!el) return;

    if (value === '') {
      el.innerHTML = '';
      cleanEmptyNodes(el, currentTags);
      el.append(document.createTextNode('')); // agar bisa diketik
      // el.focus();
    }
  }, [value]);

  // Render value (markdown) ke dalam HTML (formatted)
  // React.useEffect(() => {
  //   if (editorRef.current && editorRef.current.innerHTML !== formattedHTML) {
  //     editorRef.current.innerHTML = formattedHTML + '\n';
  //     // moveCaretToEnd(editorRef.current);
  //   }
  // }, [formattedHTML]);

  // Handle autoFocus
  React.useEffect(() => {
    if (autoFocus && editorRef.current) {
      editorRef.current.focus();
      placeCaretAtEnd(editorRef.current);
    }
  }, [autoFocus, editorRef.current]);

  const stylesApi = { unstyled, classNames, styles };

  const isMentions = users && users.length > 0 && mentionActive && filteredUsers;

  return (
    <>
      <div ref={rootRef} onKeyDown={handleMentionKeyDown} {...getStyles('root', { className, style, ...stylesApi })}>
        <div
          {...{
            ...props,
            role,
            contentEditable,
            suppressHydrationWarning,
            suppressContentEditableWarning,
            'aria-disabled': arDisabled || disabled,
            disabled,
            dir
          }}
          ref={mergeRefs(ref, editorRef)}
          // ref={node => {
          //   if (typeof ref === 'function') ref(node);
          //   else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
          //   (editorRef.current as HTMLDivElement | null) = node;
          // }}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onBeforeInput={handleBeforeInput}
          data-placeholder={placeholder}
          {...getStyles('editor', stylesApi)}
        />
      </div>

      <InlineMention users={users} open={mentionActive} onOpenChange={setMentionActive} selectedUser={selectedIndex} onSelectedUser={user => insertMention(user)} />

      {/* {createPortal(
        <ul
          ref={contentRef}
          data-portal-ie=""
          className={isMentions ? 'u-list' : undefined}
          style={isMentions ? { top: 'var(--top)', left: 'var(--left)', width: 'var(--measure-trigger-w)', ...vars.triggerSize, ...vars.triggerInset } : undefined}
        >
          {isMentions &&
            filteredUsers?.map((user, i) => (
              <li
                key={user.id}
                dir="auto"
                data-focused={i === selectedIndex}
                className={cn('u-item')}
                onMouseDown={e => {
                  e.preventDefault();
                  insertMention(user);
                  setMentionActive(false);
                }}
                ref={el => {
                  if (i === selectedIndex && el) {
                    el.scrollIntoView({ block: 'nearest' });
                  }
                }}
              >
                <i className="i-avatar" style={{ '--user-avatar': user?.image && `url("${user?.image}")` } as React.CSSProperties} />
                <span dir="ltr">{user.name}</span>
              </li>
            ))}
          {filteredUsers?.length === 0 && <li style={{ color: '#999' }}>No users</li>}
        </ul>,
        document.body
      )} */}
    </>
  );
}
InlineEditor.displayName = 'InlineEditor';

type ItemsProps<T> = T | ((user: User, index: number) => T);

export interface InlineMentionProps extends React.ComponentProps<'ul'> {
  users?: User[] | null | undefined;
  open: boolean;
  onOpenChange: (prev: boolean | ((prev: boolean) => boolean)) => void;
  classNames?: {
    list?: string;
    items?: ItemsProps<string>;
  };
  styles?: {
    list?: CSSProperties;
    items?: ItemsProps<CSSProperties>;
  };
  itemsProps?: ItemsProps<React.ComponentProps<'li'>>;
  selectedUser?: number;
  onSelectedUser?: (user: User) => void;
}
export function InlineMention(_props: InlineMentionProps) {
  const { users, role = 'listbox', open, onOpenChange, className, classNames, style, styles, itemsProps, selectedUser, onSelectedUser, ...props } = _props;

  const [mount, setMount] = React.useState(false);

  React.useEffect(() => setMount(true), []);

  if (!mount) return null;

  const isOpened = users && users.length > 0 && open;

  return createPortal(
    <ul
      {...props}
      {...{
        role,
        'data-portal-ie': '',
        className: cn(classNames?.list, className),
        style: { ...styles?.list, ...styles }
      }}
    >
      {isOpened &&
        users?.map((user, i) => {
          const itemProps = typeof itemsProps === 'function' ? itemsProps(user, i + 1) : itemsProps;
          const className = typeof classNames?.items === 'function' ? classNames?.items(user, i + 1) : classNames?.items;
          const style = typeof styles?.items === 'function' ? styles?.items(user, i + 1) : styles?.items;
          const itemRef = itemProps?.ref;

          return (
            <li
              {...itemProps}
              key={user.id}
              data-index={i + 1}
              data-focused={i === selectedUser}
              {...{
                dir: itemProps?.dir ?? 'auto',
                role: itemProps?.role ?? 'listitem',
                className: cn(className, itemProps?.className),
                style: { ...style, ...itemProps }
              }}
              onMouseDown={e => {
                e.preventDefault();
                onOpenChange(false);
                onSelectedUser?.(user);
                itemProps?.onMouseDown?.(e);
              }}
              ref={el => {
                if (i === selectedUser && el) {
                  el.scrollIntoView({ block: 'nearest' });
                }
                if (typeof itemRef === 'function') itemRef(el);
                else if (itemRef) (itemRef as React.MutableRefObject<HTMLLIElement | null>).current = el;
              }}
            >
              <i className="i-avatar" style={{ '--user-avatar': user?.image && `url("${user?.image}")` } as React.CSSProperties} />
              <span dir="ltr">{user.name}</span>
            </li>
          );
        })}
      {/* {filteredUsers?.length === 0 && <li style={{ color: '#999' }}>No users</li>} */}
    </ul>,
    document.body,
    users?.length
  );
}

type InteractionEvent<T = Element> = KeyboardEvent | React.KeyboardEvent<T>;

/** Zero-width space (dummy agar bisa diposisikan) */
const ZWSP = '\u200B';

/** non-breaking space */
const NBSP = '\u00A0';

/** NBSP + ZWSP */
const NBZWSP = '\u00A0\u200B';

function cursorHold(after: string): string {
  return after ? '' : ZWSP;
}

export const allowedPairs: ReadValues = {
  '`': '`',
  "'": "'",
  '"': '"',
  '(': ')',
  '[': ']',
  '{': '}',
  '<': '>',
  '*': '*',
  '~': '~',
  '-': '-',
  _: '_'
} as const;

export const allowedPatterns = [
  { tag: 'blockquote', shortcut: 'shift + q', open: '> ', close: '', regex: /^> ([^\s].+)$/ },
  { tag: 'pre', shortcut: 'shift + `', open: '```\n', close: '\n```', regex: /```[\r\n]+([\s\S]+?)[\r\n]+```/g },
  { tag: 'code', shortcut: '`', open: '`', close: '`', regex: /`([^`]+)`/ },
  { tag: 'u', shortcut: 'u', open: '!', close: '!', regex: /!([^!]+)!/ },
  { tag: 'u', shortcut: 'u', open: '__', close: '__', regex: /__([^_]+)__/ },
  { tag: 'i', shortcut: 'i', open: '_', close: '_', regex: /_([^_]+)_/ },
  { tag: 'i', shortcut: '/', open: '_', close: '_', regex: /_([^_]+)_/ },
  { tag: 's', shortcut: 's', open: '~', close: '~', regex: /~([^~]+)~/ },
  { tag: 'strong', shortcut: 'b', open: '*', close: '*', regex: /\*([^\*]+)\*/ },
  { tag: 'hr', shortcut: '_', open: '___', close: '', regex: /___/ },
  { tag: 'h6', shortcut: 'shift + 6', open: '###### ', close: '', regex: /^###### ([^\s].+)$/ },
  { tag: 'h5', shortcut: 'shift + 5', open: '##### ', close: '', regex: /^##### ([^\s].+)$/ },
  { tag: 'h4', shortcut: 'shift + 4', open: '#### ', close: '', regex: /^#### ([^\s].+)$/ },
  { tag: 'h3', shortcut: 'shift + 3', open: '### ', close: '', regex: /^### ([^\s].+)$/ },
  { tag: 'h2', shortcut: 'shift + 2', open: '## ', close: '', regex: /^## ([^\s].+)$/ },
  { tag: 'h1', shortcut: 'shift + 1', open: '# ', close: '', regex: /^# ([^\s].+)$/ }
] as const;

function trim(text: string | null | undefined): string {
  return (text === '\n' ? '' : text) ?? '';
}

/** Convert from HTML back to plaintext */
function getPlainTextFromDOM<TTag extends TTagPatterns>(el: HTMLElement, patterns?: TTag, emoji?: ReadValues<string>): string {
  let result = '';

  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      let text = node.textContent || '';

      // Ganti emoji jadi :emoji_name:
      text = text.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, char => {
        const emojiName = reverseEmojiMap(emoji)[char];
        return emojiName ? `:${emojiName}:` : char;
      });

      result += text;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;

      if (el.tagName === 'PRE' && el.firstElementChild?.tagName === 'CODE') {
        const content = getPlainTextFromDOM(el.firstElementChild as HTMLElement);
        const pattern = allowedPatterns.find(p => p.tag === 'pre');
        if (pattern) {
          result += `${pattern.open}${content}${pattern.close}`;
        }
        return;
      }

      if (el.dataset.isMention) {
        result += '@' + el.textContent?.replace(/^@/, '');
      } else if (el.tagName === 'BR') {
        result += '\n'; // atau hanya '___'
      } else {
        // lookup otomatis dari patterns
        const tag = el.tagName.toLowerCase();
        const pattern = patterns?.find(p => p.tag === tag);

        if (pattern) {
          const content = getPlainTextFromDOM(el);

          // if (/^h[1-6]$/.test(tag) || tag === 'hr') {
          // }

          result += pattern.open + content + (pattern?.close || '\n');
        } else {
          result += getPlainTextFromDOM(el); // fallback
        }
      }
    }
  };

  el.childNodes.forEach(walk);
  return trim(result);
}

/** Convert from HTML back to plaintext */
function getPlainTextFromDOMX<T extends HTMLElement = HTMLElement>(el: T): string {
  let result = '';

  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      result += node.textContent;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;

      if (el.dataset.isMention) {
        result += '@' + el.textContent?.replace(/^@/, '');
      } else if (el.tagName === 'I') {
        result += `_${getPlainTextFromDOM(el)}_`;
      } else if (el.tagName === 'STRONG') {
        result += `*${getPlainTextFromDOM(el)}*`;
      } else if (el.tagName === 'S') {
        result += `~${getPlainTextFromDOM(el)}~`;
      } else if (el.tagName === 'CODE') {
        result += `\`${getPlainTextFromDOM(el)}\``;
      } else {
        // Untuk emoji atau tag lainnya
        result += getPlainTextFromDOM(el);
      }
    }
  };

  el.childNodes.forEach(walk);
  return result;
}

function placeCaretAtEnd<T extends HTMLElement = HTMLElement>(el: T) {
  el.focus();
  // Tempatkan caret di akhir
  const range = document.createRange();
  const sel = window.getSelection();
  range.selectNodeContents(el);
  range.collapse(false);
  sel?.removeAllRanges();
  sel?.addRange(range);
}

function moveCaretToEnd(el: HTMLElement) {
  const range = document.createRange();
  const sel = window.getSelection();

  if (!sel || !el.lastChild) return;

  // Pindahkan ke node teks terakhir, atau setelah node terakhir
  let node = el.lastChild;
  let offset = node.textContent?.length || 0;

  // Jika node terakhir bukan TEXT, cari teks di dalamnya
  if (node.nodeType !== Node.TEXT_NODE && node.hasChildNodes()) {
    node = node.lastChild!;
    offset = node.textContent?.length || 0;
  }

  try {
    range.setStart(node, offset);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  } catch (e) {
    console.warn('Gagal memindahkan caret:', e);
  }
}

function removeZeroWidthSpace(root: HTMLElement) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);

  let node: Text | null;
  while ((node = walker.nextNode() as Text | null)) {
    if (node.nodeValue?.includes('\u200B')) {
      node.nodeValue = node.nodeValue.replace(/\u200B/g, '');
    }
  }
}

function insertManualChar<T = Element>(e: InteractionEvent<T>) {
  const sel = window.getSelection();
  if (!sel?.rangeCount) return;
  const range = sel.getRangeAt(0);
  const textNode = document.createTextNode(e.key === ' ' ? ' ' : '\n');
  range.insertNode(textNode);
  range.setStartAfter(textNode);
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
}

export function convertToEmoji(data: EmojiEntry[]): ReadValues<string> {
  const result: TValues<string> = {};
  for (const item of data) {
    for (const alias of item.aliases) {
      result[alias] = item.emoji;
      // if (!result[alias]) result[alias] = [];
      // result[alias]?.push(item.emoji);
    }
  }
  return result;
}

interface EmojiListEntry {
  name: string;
  emoji: string;
}

export function convertToEmojiList(data: EmojiEntry[]) {
  const result: EmojiListEntry[] = [];
  for (const item of data) {
    for (const alias of item.aliases) {
      result.push({ name: alias, emoji: item.emoji });
    }
  }
  return result;
}

// Buat emoji reverse map
export function reverseEmojiMap(data?: ReadValues<string>): ReadValues<string> {
  return Object.fromEntries(Object.entries(data ?? {}).map(([k, v]) => [v, k]));
}

export const allowedEmoji = convertToEmoji(emojiJson);

export const emojiList = convertToEmojiList(emojiJson);

function wrapSelectionWithPair(startChar: string, endChar: string = startChar) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;

  const range = sel.getRangeAt(0);
  const selectedText = range.toString();
  if (!selectedText) return;

  // Buat text node yang dibungkus
  const newText = `${startChar}${selectedText}${endChar}`;
  const textNode = document.createTextNode(newText);

  // Ganti selection saat ini
  range.deleteContents();
  range.insertNode(textNode);

  // Buat selection baru hanya untuk teks di tengah
  const newRange = document.createRange();
  newRange.setStart(textNode, startChar.length); // setelah `_`
  // newRange.setEnd(textNode, textNode.length - endChar.length); // sebelum `_`
  newRange.setEnd(textNode, startChar.length + selectedText.length);

  sel.removeAllRanges();
  sel.addRange(newRange);
}

type Shortcut = {
  meta: boolean;
  shift: boolean;
  key: string;
};

function parseShortcut(shortcut: string | undefined): Shortcut {
  const cleaned = shortcut?.replace(/\s+/g, '').toLowerCase();
  const parts = cleaned?.split('+') ?? [];

  let meta: boolean = false,
    shift: boolean = false,
    key: string = '';

  for (const part of parts) {
    // ctrl dianggap aktif default (kecuali ditulis 'noctrl' misalnya)
    if (part === 'noctrl' || part === 'nometa') meta = false;
    if (part === 'ctrl' || part === 'meta') meta = true;
    else if (part === 'shift') shift = true;
    else if (part !== 'ctrl' && part !== 'meta' && part !== 'shift' && part !== '') key = part;
  }
  // Asumsikan meta = true jika tidak disebutkan tapi ada tanda `+`
  if (!meta && cleaned?.includes('+')) meta = true;
  // Asumsikan meta = true juga jika hanya key tunggal tanpa 'ctrl' atau 'meta'
  if (!meta && parts?.length === 1 && key !== '') meta = true;
  // if (!key) throw new Error(`Invalid shortcut: "${shortcut}" must include a key`);
  return { meta, shift, key };
}

// Jangan dihapus,
export function getOfficialShortcutLabel<T = Element>(e: InteractionEvent<T>, shortcut: string): string {
  const parsed = parseShortcut(shortcut);
  const parts: string[] = [];

  if (parsed.meta) {
    if (e.ctrlKey) parts.push('Ctrl');
    else if (e.metaKey) parts.push('⌘');
  }
  if (parsed.shift) parts.push('Shift');
  if (parsed.key) parts.push(parsed.key.toUpperCase());

  return parts.join(' + ');
}

function isShortcutMatch<T = Element>(e: InteractionEvent<T>, shortcut: string | undefined): boolean {
  const actual = parseShortcut(shortcut);

  const key = actual.key.toLowerCase();
  const eventKey = e.key.toLowerCase();

  // Shortcut berbasis huruf atau angka → cocokkan dengan event.code
  const isLetter = /^[a-z]$/.test(key);
  const isDigit = /^[0-9]$/.test(key);

  // Gunakan event.code untuk angka dan huruf (lebih stabil terhadap shift)
  const eventCode = e.code.toLowerCase(); // misalnya "keys", "digit4", dll
  const codeKey = (k: string) => (key.startsWith(k) ? key : `${k}${key}`).toLowerCase();

  let matched = false;

  if (isLetter) {
    matched = eventCode === codeKey('key');
  } else if (isDigit) {
    matched = eventCode === codeKey('digit');
  } else {
    matched = eventKey === key; // fallback untuk simbol seperti `, _, $, dll
  }

  return matched && (e.ctrlKey || e.metaKey) === actual.meta && e.shiftKey === actual.shift;
}

function applyBreak<T = Element>(e: InteractionEvent<T>) {
  if (e.key === 'Enter' && e.shiftKey) {
    e.preventDefault(); // Hindari behavior default (newline di div)

    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;

    const br = document.createElement('br');
    const range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(br);

    // Pindahkan kursor setelah <br>
    range.setStartAfter(br);
    range.setEndAfter(br);
    selection.removeAllRanges();
    selection.addRange(range);
  }
}

function applyShortcuts<T extends TTagPatterns>(e: React.KeyboardEvent<HTMLDivElement>, patterns: T) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;

  for (const pattern of patterns) {
    if (isShortcutMatch(e.nativeEvent, pattern.shortcut)) {
      e.preventDefault();

      // const formattedShortcut = getOfficialShortcutLabel(e.nativeEvent, pattern.shortcut);
      // console.log(`Shortcut ${formattedShortcut} untuk <${pattern.tag}> dipicu!`);

      const range = sel.getRangeAt(0);
      const selectedText = range.toString();

      if (selectedText.length > 0) {
        const el = document.createElement(pattern.tag);
        el.textContent = selectedText;

        // Buat node teks kosong sebagai penanda setelah elemen
        const trailingSpace = document.createTextNode(ZWSP);

        range.deleteContents();
        range.insertNode(trailingSpace); // Masukkan dulu node kosong
        range.insertNode(el); // Lalu elemen baru

        // Sekarang pindahkan kursor ke setelah trailingSpace
        const newRange = document.createRange();
        newRange.setStartAfter(trailingSpace);
        newRange.collapse(true);
        sel.removeAllRanges();
        sel.addRange(newRange);

        break;
      }
    }
  }
}

function isUndo<T = Element>(e: InteractionEvent<T>): boolean {
  const key = e.key.toLowerCase();
  return (e.ctrlKey || e.metaKey) && !e.shiftKey && key === 'z';
}

function isRedo<T = Element>(e: InteractionEvent<T>): boolean {
  const key = e.key.toLowerCase();
  return (e.ctrlKey || e.metaKey) && (key === 'y' || (e.shiftKey && key === 'z'));
}

function isCaretAtEndOfInline(tags: string[]): boolean {
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) return false;

  const range = sel.getRangeAt(0);
  const container = range.endContainer;

  // Pastikan node berada dalam inline tag seperti <i>, <strong>, <s>, dll
  const inline = findInlineParent(container, tags);
  if (!inline) return false;

  // Cek apakah posisi caret berada di akhir dari teks dalam inline
  const isAtEnd = range.endOffset === container.textContent?.length;

  return isAtEnd;
}

function findInlineParent(node: Node, tags: string[]): HTMLElement | null {
  while (node && node.parentNode) {
    node = node.parentNode;
    if (node instanceof HTMLElement) {
      if (tags?.includes(node.tagName)) {
        return node;
      }
    }
  }
  return null;
}

function findBlockParent(node: Node): HTMLElement | null {
  while (node && node.parentNode) {
    node = node.parentNode;
    if (node instanceof HTMLElement) {
      if (/^H[1-6]$/.test(node.tagName)) return node;
    }
  }
  return null;
}

function moveCaretAfterInline(tags: string[]): void {
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) return;

  const range = sel.getRangeAt(0);
  const container = range.endContainer;

  const inline = findInlineParent(container, tags);
  if (!inline || !inline.parentNode) return;

  const parent = inline.parentNode;
  const after = document.createTextNode(ZWSP);

  // Hapus trailing space di dalam inline tag
  if (range?.endContainer?.nodeType === Node.TEXT_NODE) {
    const node = range.endContainer as Text;
    node.textContent = node.textContent?.replace(/\s+$/, '') ?? null;
  }

  parent.insertBefore(after, inline.nextSibling);

  const newRange = document.createRange();
  newRange.setStart(after, 0);
  newRange.collapse(true);

  sel.removeAllRanges();
  sel.addRange(newRange);
}

function moveCaretAfterBlock(): void {
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) return;

  const range = sel.getRangeAt(0);
  const container = range.endContainer;

  const block = findBlockParent(container);
  if (!block || !block.parentNode) return;

  const parent = block.parentNode;
  const after = document.createTextNode(ZWSP);

  // Hapus trailing space di dalam inline tag
  if (range?.endContainer?.nodeType === Node.TEXT_NODE) {
    const node = range.endContainer as Text;
    node.textContent = node.textContent?.replace(/\s+$/, '') ?? null;
  }

  parent.insertBefore(after, block.nextSibling);

  const newRange = document.createRange();
  newRange.setStart(after, 0); // Posisi setelah Zero-width space
  newRange.collapse(true);

  sel.removeAllRanges();
  sel.addRange(newRange);
}

function isCaretAtEndOfBlock(): boolean {
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) return false;

  const range = sel.getRangeAt(0);
  const container = range.endContainer;

  const block = findBlockParent(container);
  if (!block) return false;

  // Cek apakah caret di akhir konten block
  return container.nodeType === Node.TEXT_NODE && range.endOffset === container.textContent?.length;
}

function getCaretOffset(container: HTMLElement): number {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return 0;

  const range = selection.getRangeAt(0);
  const preCaretRange = range.cloneRange();
  preCaretRange.selectNodeContents(container);
  preCaretRange.setEnd(range.endContainer, range.endOffset);

  return preCaretRange.toString().length;
}

function getNodeOffset(container: HTMLElement, targetNode: Text): number {
  let offset = 0;
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null);

  while (walker.nextNode()) {
    const node = walker.currentNode as Text;
    if (node === targetNode) break;
    offset += node.textContent?.length ?? 0;
  }

  return offset;
}

function getCaretCoordinates(): { top: number; left: number } {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return { top: 0, left: 0 };

  const range = sel.getRangeAt(0).cloneRange();
  range.collapse(true);
  const rect = range.getBoundingClientRect();
  return { top: rect.top + window.scrollY + 20, left: rect.left + window.scrollX };
}

// Helper: get text sebelum cursor
function getTextBeforeCursor(sel: Selection) {
  if (!sel.rangeCount) return '';

  const range = sel.getRangeAt(0).cloneRange();
  range.collapse(true);
  range.setStart(range.startContainer, 0);

  return range.toString();
}

function getCaretCharacterOffsetWithin(element: HTMLElement): number {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return 0;
  const range = sel.getRangeAt(0);
  const preCaretRange = range.cloneRange();
  preCaretRange.selectNodeContents(element);
  preCaretRange.setEnd(range.endContainer, range.endOffset);
  return preCaretRange.toString().length;
}

function setCaretAtCharacterOffset(container: HTMLElement, offset: number) {
  const range = document.createRange();
  const sel = window.getSelection();
  let currentOffset = 0;

  function recurse(node: Node): boolean {
    if (node.nodeType === Node.TEXT_NODE) {
      const len = node.textContent?.length || 0;
      if (currentOffset + len >= offset) {
        range.setStart(node, offset - currentOffset);
        range.collapse(true);
        return true;
      }
      currentOffset += len;
    } else {
      for (const child of node.childNodes) {
        if (recurse(child)) return true;
      }
    }
    return false;
  }

  recurse(container);
  sel?.removeAllRanges();
  sel?.addRange(range);
}

function setCaretOffset(container: HTMLElement, offset: number) {
  const sel = window.getSelection();
  if (!sel) return;

  let currentOffset = 0;
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null);

  while (walker.nextNode()) {
    const node = walker.currentNode as Text;
    const nodeLength = node.textContent?.length ?? 0;

    if (currentOffset + nodeLength >= offset) {
      const range = document.createRange();
      const localOffset = offset - currentOffset;

      // Hindari offset melebihi panjang node
      const safeOffset = Math.min(localOffset, node.length);

      range.setStart(node, safeOffset);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
      return;
    }

    currentOffset += nodeLength;
  }

  // Jika offset melebihi total, letakkan di akhir
  if (container.lastChild) {
    const range = document.createRange();
    range.selectNodeContents(container);
    range.collapse(false); // ke posisi akhir
    sel.removeAllRanges();
    sel.addRange(range);
  }
}

function findOffsetAfterNode(container: HTMLElement, node: Node): number {
  let offset = 0;
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null);
  while (walker.nextNode()) {
    const current = walker.currentNode!;
    if (current === node) {
      return offset + (current.textContent?.length || 0);
    }
    offset += current.textContent?.length || 0;
  }
  return offset;
}

function cleanEmptyNodes(container: HTMLElement, tags: string[]): void {
  const allNodes = container?.querySelectorAll(tags.join(', '));
  // const inclues = allNodes.length === 0 && el.tagName === 'BR'
  allNodes?.forEach(el => {
    if (el?.textContent?.trim() === '' && !['HR'].includes(el.tagName)) el?.remove();
  });
}

function autoLinkSync() {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;

  const container = sel.anchorNode;
  if (!container) return;

  // Cek apakah kursor ada di dalam <a>
  const anchorElement = findClosestAnchor(container);
  if (!anchorElement) return;

  // Ambil teks dalam <a>
  const newText = anchorElement.textContent ?? '';

  // Cek apakah newText adalah URL valid (sederhana)
  if (isValidUrl(newText)) {
    // Jika valid, update href-nya juga
    anchorElement.setAttribute('href', newText.startsWith('http') ? newText : 'https://' + newText);
  } else {
    // Kalau teks bukan URL valid, bisa hapus href atau biarkan
    // anchorElement.removeAttribute('href');
  }
}

// Utility untuk cari elemen <a> terdekat dari node
function findClosestAnchor(node: Node | null): HTMLAnchorElement | null {
  while (node && node.nodeType === Node.TEXT_NODE) {
    node = node.parentNode;
  }
  if (node && node instanceof HTMLAnchorElement) return node;
  return null;
}

// Utility validasi URL sederhana (bisa kamu kembangkan)
function isValidUrl(text: string): boolean {
  try {
    new URL(text.startsWith('http') ? text : 'https://' + text);
    return true;
  } catch {
    return false;
  }
}

function handleAutoLink(event: KeyboardEvent) {
  if (!(event.key === ' ' || event.key === 'Enter')) return;

  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;

  const range = sel.getRangeAt(0);
  const container = range.startContainer;

  if (container.nodeType !== Node.TEXT_NODE) return;

  const textNode = container as Text;
  const typedText = textNode.data.slice(0, range.startOffset).trimEnd();

  const markdownLinkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/;
  const telMailRegex = /(tel:|mailto:)([^\s]+)$/;
  const urlRegex = /(?:https?:\/\/|www\.)[^\s<]+|(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s]*)?$/i;

  let matched = null;

  if ((matched = typedText.match(markdownLinkRegex))) {
    const [full, label, href] = matched;
    insertAutoLink({ textNode, matchText: full, href, label, event });
  } else if ((matched = typedText.match(telMailRegex))) {
    const [full, prefix, number] = matched;
    insertAutoLink({ textNode, matchText: full, href: `${prefix}${number}`, label: number, event });
  } else if ((matched = typedText.match(urlRegex))) {
    const url = matched[0];
    const href = url.startsWith('http') ? url : `https://${url}`;
    insertAutoLink({ textNode, matchText: url, href, label: url, event });
  }
}

function insertAutoLink({ textNode, matchText, href, label }: { textNode: Node; matchText: string; href: string; label: string; event: KeyboardEvent }) {
  const fullText = (textNode as Text).textContent!;
  const index = fullText.lastIndexOf(matchText);

  const before = fullText.slice(0, index);
  const after = fullText.slice(index + matchText.length);

  const a = document.createElement('a');
  a.href = href;
  a.textContent = label;
  a.target = '_blank';
  a.rel = 'noopener noreferrer nofollow';

  const parent = textNode.parentNode!;
  const afterNode = document.createTextNode(after);
  const beforeNode = document.createTextNode(before);

  parent.insertBefore(beforeNode, textNode);
  parent.insertBefore(a, textNode);
  parent.insertBefore(afterNode, textNode);
  parent.removeChild(textNode);

  // Tempatkan caret setelah link
  const sel = window.getSelection();
  if (!sel) return;

  const newRange = document.createRange();
  newRange.setStartAfter(a);
  newRange.collapse(true);
  sel.removeAllRanges();
  sel.addRange(newRange);
}

export const emojiRegex = /:([a-z0-9_+-]+):/gi;

function inputAutoEmoji(emojis: ReadValues) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;

  const range = sel.getRangeAt(0);
  const container = range.startContainer;

  const textNode = container.nodeType === Node.TEXT_NODE ? container : container.childNodes[range.startOffset - 1];

  if (!textNode || textNode.nodeType !== Node.TEXT_NODE) return;

  let text = (textNode as Text).textContent!;
  if (!text) return;

  const matches = Array.from(text.matchAll(emojiRegex));
  if (!matches.length) return;

  // Ambil posisi awal cursor relatif terhadap textNode
  const offsetInNode = range.startOffset;

  for (const match of matches) {
    const [fullMatch, name] = match;
    const start = match.index!;
    const end = start + fullMatch.length;

    const emoji = emojis?.[name];
    if (!emoji) continue;

    // Cek apakah kursor berada di dalam atau setelah match
    if (offsetInNode < start || offsetInNode > end) continue;

    const before = text.slice(0, start);
    const after = text.slice(end);

    const beforeNode = document.createTextNode(before);
    const emojiNode = document.createTextNode(emoji);
    const afterNode = document.createTextNode(after);

    const parent = textNode.parentNode!;
    parent.insertBefore(beforeNode, textNode);
    parent.insertBefore(emojiNode, textNode);
    parent.insertBefore(afterNode, textNode);
    parent.removeChild(textNode);

    // Kembalikan kursor setelah emoji
    const newRange = document.createRange();
    newRange.setStart(afterNode, 0);
    newRange.collapse(true);
    sel.removeAllRanges();
    sel.addRange(newRange);

    break; // hanya proses 1 emoji per input
  }
}

function inputTagFormatting<T, TTag extends TTagPatterns>(e: InteractionEvent<T>, patterns: TTag) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;

  const range = sel.getRangeAt(0);
  const container = range.startContainer;

  const textNode = container.nodeType === Node.TEXT_NODE ? container : container.childNodes[range.startOffset - 1];

  if (!textNode || textNode.nodeType !== Node.TEXT_NODE) return;

  const text = textNode.textContent!;
  let matched = false;

  for (const { tag, regex } of patterns) {
    const match = regex.exec(text);
    if (!match) continue;

    // console.log('Checking pattern:', regex);
    // console.log('Matched:', match?.[0]);

    matched = true;

    const matchStart = match.index!;
    const matchEnd = matchStart + match[0].length;
    const innerText = match[1]; // ini undefined jika tidak ada capture group

    const before = text.slice(0, matchStart);
    const after = text.slice(matchEnd);

    const beforeNode = document.createTextNode(before);
    const parent = textNode.parentNode!;

    if (tag === 'hr') {
      const hrNode = document.createElement('hr');
      const afterNode = document.createTextNode(after || '\u200B');

      parent.insertBefore(beforeNode, textNode);
      parent.insertBefore(hrNode, textNode);
      parent.insertBefore(afterNode, textNode);
      parent.removeChild(textNode);

      const newRange = document.createRange();
      newRange.setStart(afterNode, after ? 0 : 1);
      newRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(newRange);

      break;
    }

    if (tag === 'pre') {
      const preNode = document.createElement('pre');
      const codeNode = document.createElement('code');
      codeNode.textContent = innerText;

      preNode.appendChild(codeNode);

      const afterNode = document.createTextNode(after || '\u200B');

      parent.insertBefore(beforeNode, textNode);
      parent.insertBefore(preNode, textNode);
      parent.insertBefore(afterNode, textNode);
      parent.removeChild(textNode);

      const newRange = document.createRange();
      newRange.setStart(afterNode, after ? 0 : 1);
      newRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(newRange);

      break;
    }

    // Default handler untuk tag lain
    const tagNode = document.createElement(tag);
    tagNode.textContent = innerText;

    const afterNode = document.createTextNode(after || '\u200B');

    parent.insertBefore(beforeNode, textNode);
    parent.insertBefore(tagNode, textNode);
    parent.insertBefore(afterNode, textNode);
    parent.removeChild(textNode);

    const newRange = document.createRange();
    newRange.setStart(afterNode, after ? 0 : 1);
    newRange.collapse(true);
    sel.removeAllRanges();
    sel.addRange(newRange);

    // e.preventDefault();

    break;
  }

  return matched;
}

function parseNestedTextToDOM<T extends TTagPatterns>(text: string, patterns: T): Node[] {
  for (const { tag, regex } of patterns) {
    const match = regex.exec(text);
    if (match) {
      const before = text.slice(0, match.index);
      const content = match[1];
      const after = text.slice(match.index + match[0].length);

      const nodes: Node[] = [];

      // Recursively parse the before, inside, and after
      if (before) nodes.push(...parseNestedTextToDOM(before, patterns));

      const tagEl = document.createElement(tag);
      const innerNodes = parseNestedTextToDOM(content, patterns);
      innerNodes.forEach(n => tagEl.appendChild(n));
      nodes.push(tagEl);

      if (after) nodes.push(...parseNestedTextToDOM(after, patterns));

      return nodes;
    }
  }

  // No matches: return as plain text
  return [document.createTextNode(text)];
}

function parseWithTagPattern<TTag extends TTagPatterns = TTagPatterns>(text: string, patterns: TTag): Node[] {
  for (const { tag, regex } of patterns) {
    regex.lastIndex = 0; // reset state
    const match = regex.exec(text);
    if (match) {
      const before = text.slice(0, match.index);
      const fullMatch = match[0];
      const hasGroup = match.length > 1;
      const inside = hasGroup ? match[1] : '';
      const after = text.slice(match.index + fullMatch.length);

      const nodes: Node[] = [];

      if (before) nodes.push(...parseWithTagPattern(before, patterns));

      let tagNode: HTMLElement;
      if (tag === 'pre') {
        tagNode = document.createElement('pre');
        const code = document.createElement('code');
        code.textContent = inside;
        tagNode.appendChild(code);
      } else if (tag === 'hr') {
        tagNode = document.createElement('hr');
      } else {
        tagNode = document.createElement(tag);
        const innerNodes = parseWithTagPattern(inside, patterns);
        innerNodes.forEach(n => tagNode.appendChild(n));
      }

      nodes.push(tagNode);

      // Tambahkan newline setelah heading dan hr
      // if (/^h[1-6]$/.test(tag) || tag === 'hr') {
      //   nodes.push(document.createTextNode('\n'));
      //   nodes.push(document.createElement('br'));
      // }

      if (after) nodes.push(...parseWithTagPattern(after, patterns));

      return nodes;
    }
  }

  return [document.createTextNode(text)];
}

function handleTagFormatting<T, TTag extends TTagPatterns>(e: InteractionEvent<T>, patterns: TTag) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;

  const range = sel.getRangeAt(0);
  const container = range.startContainer;

  // Ambil <div> atau <p> container terdekat
  const block = container.nodeType === Node.ELEMENT_NODE ? (container as HTMLElement) : (container.parentElement?.closest('div, p') ?? container.parentElement);

  if (!block) return;

  const originalText = block.textContent ?? '';
  const parsedNodes = parseWithTagPattern(originalText, patterns);

  // Cek jika tidak ada perubahan
  if (parsedNodes.length === 1 && parsedNodes[0].textContent === originalText) return;

  // Bersihkan block
  while (block.firstChild) block.removeChild(block.firstChild);

  parsedNodes.forEach(n => block.appendChild(n));

  // Tambah dummy cursor (ZWSP)
  const dummy = document.createTextNode('\u200B');
  block.appendChild(dummy);

  // Pindahkan kursor
  const newRange = document.createRange();
  newRange.setStart(dummy, 1);
  newRange.collapse(true);
  sel.removeAllRanges();
  sel.addRange(newRange);

  e.preventDefault();
}

function handleMention(e: React.KeyboardEvent<HTMLDivElement>) {
  // const sel = window.getSelection();
  // if (!sel || sel.rangeCount === 0) return;

  // const range = sel.getRangeAt(0);
  // const { startContainer, startOffset } = range;

  // if (e.key === 'Backspace') {
  //   // Jika caret berada di dalam teks, offset > 0
  //   if (startContainer.nodeType === Node.TEXT_NODE && startOffset > 0) {
  //     const textNode = startContainer as Text;
  //     const prevChar = textNode.textContent?.[startOffset - 1];

  //     // Jika karakter sebelumnya adalah ZWSP (\u200B), cek apakah sebelumnya ada mention
  //     if (prevChar === '\u200B') {
  //       const prevNode = textNode.previousSibling;

  //       if (prevNode && (prevNode as HTMLElement).classList?.contains('mention')) {
  //         prevNode.remove();
  //         textNode.textContent = textNode.textContent!.slice(0, startOffset - 1) + textNode.textContent!.slice(startOffset);

  //         // Reset selection ke posisi setelah penghapusan
  //         const newRange = document.createRange();
  //         newRange.setStart(textNode, startOffset - 1);
  //         newRange.collapse(true);
  //         sel.removeAllRanges();
  //         sel.addRange(newRange);

  //         e.preventDefault();
  //       }
  //     }
  //   }

  //   // Alternatif: jika caret berada di awal text node yang tepat setelah mention
  //   else if (startContainer.nodeType === Node.TEXT_NODE && startOffset === 0 && (startContainer.previousSibling as HTMLElement)?.classList?.contains('mention')) {
  //     const mention = startContainer.previousSibling!;
  //     const textNode = startContainer as Text;

  //     // Cek apakah dimulai dengan \u200B, hapus juga
  //     if (textNode.textContent?.startsWith('\u200B')) {
  //       textNode.textContent = textNode.textContent.slice(1);
  //     }

  //     mention.remove();

  //     const newRange = document.createRange();
  //     newRange.setStart(textNode, 0);
  //     newRange.collapse(true);
  //     sel.removeAllRanges();
  //     sel.addRange(newRange);

  //     e.preventDefault();
  //   }
  // }

  // if (e.key === 'Delete') {
  //   if (startContainer.nodeType === Node.TEXT_NODE && startOffset === startContainer.textContent!.length && (startContainer.nextSibling as HTMLElement)?.classList?.contains('mention')) {
  //     const mention = startContainer.nextSibling!;
  //     mention.remove();
  //     e.preventDefault();
  //   }
  // }

  //
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;

  const range = sel.getRangeAt(0);
  const node = range.startContainer;

  if (e.key === 'Backspace') {
    const prev = node.previousSibling;
    if (prev && (prev as HTMLElement).dataset?.isMention === 'true') {
      prev.remove();
      e.preventDefault();
    }
  }

  if (e.key === 'Delete') {
    const next = node.nextSibling;
    if (next && (next as HTMLElement).dataset?.isMention === 'true') {
      next.remove();
      e.preventDefault();
    }
  }
}

function mentionElement(user: User): HTMLSpanElement {
  const span = document.createElement('span');
  span.className = 'mention';
  span.dataset.mentionId = user.id;
  span.textContent = `@${user.name}`;
  span.contentEditable = 'false'; // bukan false
  span.setAttribute('data-is-mention', 'true');
  span.setAttribute('tabIndex', '-1');

  // Blok edit manual via JS
  // Tapi intercept semua event edit
  span.addEventListener('keydown', e => e.preventDefault()); // cegah edit
  span.addEventListener('beforeinput', e => e.preventDefault()); // cegah input langsung
  span.addEventListener('paste', e => e.preventDefault()); // cegah paste ke dalam mention
  span.addEventListener('input', e => e.preventDefault()); // cegah input ke dalam mention
  span.addEventListener('keypress', e => e.preventDefault());
  span.addEventListener('selectionchange', e => e.preventDefault());
  span.addEventListener('change', e => e.preventDefault());

  return span;
}

// Insert mention ke content editable
function insertMention(user: User) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;

  const range = sel.getRangeAt(0);
  const focusNode = sel.focusNode;
  if (!focusNode || !focusNode.textContent) return;

  // Jangan insert jika cursor sedang berada di dalam mention
  if ((focusNode.parentElement as HTMLElement)?.closest('.mention')) return;

  const text = focusNode.textContent;
  const atIndex = text.lastIndexOf('@', sel.focusOffset - 1);
  if (atIndex < 0 || atIndex >= sel.focusOffset) return;

  const before = text.slice(0, atIndex);
  const after = text.slice(sel.focusOffset);

  // Buat mention element
  const mentionEl = mentionElement(user);

  // const spaceTextNode = document.createTextNode(after ? '' : '\u200B'); // cursor holder jika tidak ada after
  const spaceTextNode = document.createTextNode(''); // cursor holder jika tidak ada after
  const afterTextNode = after ? document.createTextNode(after) : null;

  focusNode.textContent = before;

  range.setStart(focusNode, before.length);
  range.collapse(true);
  sel.removeAllRanges();

  if (afterTextNode) range.insertNode(afterTextNode);
  range.insertNode(spaceTextNode);
  range.insertNode(mentionEl);

  const newRange = document.createRange();
  newRange.setStartAfter(spaceTextNode);
  newRange.collapse(true);
  sel.removeAllRanges();
  sel.addRange(newRange);
}

function insertMentionXX(user: User) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;

  const range = sel.getRangeAt(0);

  // Delete @query sebelumnya
  const textNode = sel.anchorNode;
  if (textNode && textNode.nodeType === Node.TEXT_NODE) {
    const text = textNode.textContent ?? '';
    const newText = text.replace(/@\w*$/, '');
    textNode.textContent = newText;
  }

  // Buat elemen mention
  const mentionEl = document.createElement('span');
  mentionEl.textContent = `@${user.name}`;
  mentionEl.className = 'mention';
  mentionEl.setAttribute('data-userid', user.id);

  // Insert mention
  range.insertNode(mentionEl);

  // Tambah spasi setelah mention supaya mudah mengetik selanjutnya
  const spaceNode = document.createTextNode(' ');
  mentionEl.after(spaceNode);

  // Pindahkan cursor setelah spasi
  range.setStartAfter(spaceNode);
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
}

const DEFAULT_ALLOWED_TAGS = ['A', ...allowedPatterns?.map(allowed => allowed.tag.toUpperCase())];
export function renderMarkdown(text: string, ALLOWED_TAGS: string[] = DEFAULT_ALLOWED_TAGS): string {
  const escaped = escapeHtml(text);
  const html = likeMdx(escaped);
  const safeHTML = DOMPurify.sanitize(html, {
    // Tidak mengizinkan tag seperti <script>, hanya tag yang sudah ditentukan
    ALLOWED_TAGS,
    ALLOWED_ATTR: [] // Tidak mengizinkan event handler seperti onclick
  });
  return safeHTML;
}

export function likeMdx(text: string | null | undefined): string {
  if (!text) return '';
  let prev: string;
  do {
    prev = text;
    text = limitedMarkdown(text);
  } while (text !== prev);

  return text;
}

function parseLayer(text: string): string {
  return text
    .replace(/___|---/g, '<hr>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/_(.*?)_/g, '<i>$1</i>')
    .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
    .replace(/~(.*?)~/g, '<s>$1</s>')
    .replace(/^###### (.*$)/gim, '<h6>$1</h6>')
    .replace(/^##### (.*$)/gim, '<h5>$1</h5>')
    .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>');
}

export function escapeHtml(text: string): string {
  // text = text.replace(/<[^>]*>/g, '');
  return text
    .replace(/&/g, '&amp;') // harus duluan
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function limitedMarkdown(text: string | null | undefined): string {
  if (!text) return '';
  // Replace ___ with <hr>
  text = text.replace(/___/g, '<hr>');
  // Replace --- with <hr>
  text = text.replace(/---/g, '<hr>');
  // Replace _..._ with <i>...</i>
  text = text.replace(/_(.*?)_/g, '<i>$1</i>');
  // Replace ~...~ with <s>...</s>
  text = text.replace(/~(.*?)~/g, '<s>$1</s>');
  // Replace *...* with <strong>...</strong>
  text = text.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
  // Replace headings
  text = text.replace(/^###### (.*$)/gim, '<h6>$1</h6>');
  text = text.replace(/^##### (.*$)/gim, '<h5>$1</h5>');
  text = text.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
  text = text.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  text = text.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  text = text.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  // Replace links with images (e.g., [![alt](image)](link))
  // text = text.replace(/\[!\[([^\]]*)\]\(([^)]+)\)\]\(([^)]+)\)/g, (_, alt = '', imgSrc, href) => {
  //   const escapedHref = href.replace(/@/g, '&#64;');
  //   return `<a href="${escapedHref}" rel="nofollow"><img src="${imgSrc}" alt="${alt || ''}" data-canonical-src="${imgSrc}" style="max-width: 100%;"></a>`;
  // });
  // // Replace standalone images (e.g., ![alt](src))
  // text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt = '', src) => {
  //   const canonicalSrc = src.replace(/&/g, '&amp;');
  //   return `<a target="_blank" rel="noopener noreferrer nofollow" href=""><img src="${src}" alt="${alt || ''}" data-canonical-src="${canonicalSrc}" style="max-width: 100%;"></a>`;
  // });
  // // Replace standard links (e.g., [text](link))
  // text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, href) => {
  //   const escapedHref = href.replace(/@/g, '&#64;');
  //   return `<a href="${escapedHref}">${text}</a>`;
  // });
  // // Replace email addresses with mailto links
  // text = text.replace(/<([^>]+@[^>]+)>/g, '<a href="mailto:$1">$1</a>');
  // text = text.replace(/^(.*?<a href="mailto:[^>]+>[^<]+<\/a>.*)$/gm, '<p>$1</p>');
  // Replace blockquotes
  text = text.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');
  text = text.replace(/^< (.*$)/gim, '$1');
  // Replace ordered list items (start with a digit followed by space)
  text = text.replace(/^\d+ (.*)$/gm, '<li>$1</li>');
  text = text.replace(/(<li>.*<\/li>)(?!(<\/ol>|<\/ul>))/gim, '<ol dir="auto">$1</ol>');
  // Replace unordered list items (start with a dash followed by space)
  text = text.replace(/^- (.*)$/gm, '<li>$1</li>');
  text = text.replace(/(<li>.*<\/li>)(?!(<\/ul>|<\/ol>))/gim, '<ul dir="auto">$1</ul>');
  // Combine all consecutive <ol> and <ul> tags into one
  text = text.replace(/<\/ol>\s*<ol dir="auto">/gim, '');
  text = text.replace(/<\/ul>\s*<ul dir="auto">/gim, '');

  // Replace code blocks (text wrapped with triple backticks)
  // @ts-ignore
  text = text.replace(/```([^```]+)```/gs, (_, p1) => `<pre class="notranslate"><code>${p1.trim()}</code></pre>`);
  // Replace `...` with <code>...</code>
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
  // Split text into blocks separated by newlines and wrap them with <div dir="auto"></div>
  // const blocks = text.split(/\n\n+/);
  // const wrappedBlocks = blocks.map(block => `<div dir="auto">${block}</div>`);
  // // Join the blocks back into a single string
  // text = wrappedBlocks.join('\n');

  return text;
}
