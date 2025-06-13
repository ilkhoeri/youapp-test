'use client';
import * as React from 'react';
import DOMPurify, { Config } from 'dompurify';
import { cn } from 'cn';

export type ProseProps<T extends React.ElementType = 'div'> = React.PropsWithoutRef<React.ComponentProps<T>> & {
  el?: T | React.ElementType;
  unstyled?: boolean;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties & Record<string, any>;
  ref?: React.ComponentPropsWithRef<T>['ref'];
  __html?: string | TrustedHTML;
  dangerouslySetInnerHTML?: { __html: string | TrustedHTML };
} & VariantKeys;

type ProseElement = <T extends React.ElementType = 'div'>(_props: ProseProps<T>) => React.ReactElement;

export const Prose = React.forwardRef(function Prose<T extends React.ElementType>(_props: Omit<ProseProps<T>, 'ref'>, ref: React.ComponentPropsWithRef<T>['ref']) {
  const {
    el,
    children,
    unstyled,
    className,
    __html,
    dangerouslySetInnerHTML,
    suppressHydrationWarning = true,
    suppressContentEditableWarning = true,
    color = 'based',
    size = 'lg',
    dir = 'auto',
    ...props
  } = _props;

  const Component = (el || 'div') as React.ElementType;
  const setInnerHTML = __html
    ? { dangerouslySetInnerHTML: htmlPurify(__html) }
    : dangerouslySetInnerHTML
      ? { dangerouslySetInnerHTML: htmlPurify(dangerouslySetInnerHTML.__html) }
      : undefined;

  // Validation
  if (setInnerHTML && children) {
    throw new Error('Prose component: Cannot use both `children` and `__html` or `dangerouslySetInnerHTML`. Please choose one.');
  }

  return (
    <Component
      {...{ ...props, suppressHydrationWarning, suppressContentEditableWarning }}
      data-prose-container
      ref={ref}
      {...getStyles({ unstyled, className, color, size, dir })}
      {...setInnerHTML}
    >
      {!setInnerHTML ? children : null}
    </Component>
  );
}) as ProseElement;

type VariantKeys = {
  color?: 'based' | 'muted';
  size?: 'lg' | 'md' | 'sm';
  dir?: 'auto' | 'ltr' | 'rtl';
};

// type classes = {
//   [K in keyof SubKeys]: Record<SubKeys[K], string>;
// };

interface GetStylesOptions extends VariantKeys {
  unstyled?: boolean;
  className?: string;
}

function getStyles(opts: GetStylesOptions = {}) {
  return {
    'data-prose-color': opts.color,
    'data-prose-size': opts.size,
    dir: opts.dir !== 'auto' ? opts.dir : undefined,
    className: cn(!opts.unstyled && 'stylelayer-prose relative', opts.className)
  };
}

const config: Config = {
  ADD_TAGS: ['iframe', 'use'],
  ADD_ATTR: ['src', 'width', 'height', 'frameborder', 'allow', 'allowfullscreen', 'xlink:href'],
  ALLOWED_URI_REGEXP: /^https:\/\/(www\.youtube\.com|player\.vimeo\.com)/ // strict
  // ALLOWED_TAGS: ["b", "span"],
  // ALLOWED_ATTR: ["style"],
};

function removeEmptyElements(html: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const emptyElements = doc.querySelectorAll('p:empty:not(:only-child), div:empty:not(:only-child), span:empty:not(:only-child)');
  emptyElements.forEach(el => el.remove());
  return doc.body.innerHTML;
}
export function cleanHTML(html: string): string {
  if (typeof window !== 'undefined') return DOMPurify.sanitize(html, config);
  return html;
}

// export function textPurify(text: string | null | undefined): string {
//   if (!text) return '';
//   if (typeof window !== 'undefined') return DOMPurify.sanitize(text);
//   return text;
// }
export function textPurify(text: string | null | undefined): string {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export function htmlPurify(html: string) {
  if (typeof window !== 'undefined') {
    const sanitizedHTML = DOMPurify.sanitize(html, config);
    return { __html: removeEmptyElements(sanitizedHTML) };
  }
  return { __html: html };
}
