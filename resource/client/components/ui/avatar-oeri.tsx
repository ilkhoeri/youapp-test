'use client';
import * as React from 'react';
import { default as NextImage, type ImageProps } from 'next/image';
import { cnx, cvx, ocx, rem } from 'xuxi';
import { Slot as PolymorphicSlot } from '@radix-ui/react-slot';
import { getContrastColor } from '@/resource/hooks/use-random-colors';
import { cn } from 'cn';

const classes = cvx({
  variants: {
    selector: {
      root: 'relative flex items-center justify-center select-none overflow-hidden p-0 border',
      image: 'object-cover size-full block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
      fallback: 'absolute flex size-full items-center justify-center font-bold select-none text-[calc(var(--avatar-fz))]',
      group: 'flex pl-[var(--ag-spacing)]'
    }
  }
});

type Selector = 'image' | 'root' | 'fallback';
type SelectorGroup = 'group' | Selector;
type CSSProperties = React.CSSProperties & { [key: string]: any };
type NestedRecord<U extends [string, unknown], T extends string> = {
  [K in U as K[0]]?: Partial<Record<T, K[1]>>;
};
type Styles = ['unstyled', boolean] | ['classNames', string | ((state: StateProps) => string)] | ['styles', CSSProperties | ((state: StateProps) => CSSProperties)];
type StylesGroup = ['unstyled', boolean] | ['classNames', string] | ['styles', CSSProperties];
type StylesNames<T extends string, TStyles extends [string, unknown] = Styles> = NestedRecord<TStyles, T> & {
  className?: string | ((state: StateProps) => string);
  style?: CSSProperties | ((state: StateProps) => CSSProperties);
};
interface Options extends StylesNames<SelectorGroup>, Partial<__CtxProps>, __AvatarProps, Partial<StateProps> {
  gap?: (string & {}) | number;
  withinGroup?: boolean;
  isInitials?: boolean;
  lengthInitial?: number;
}

// prettier-ignore
const DEFAULT_COLORS = ["aqua", "aquamarine", "azure", "beige", "bisque", "black", "blanchedalmond", "blue", "blueviolet", "brown", "burlywood", "cadetblue", "chartreuse", "chocolate", "coral", "cornflowerblue", "cornsilk", "crimson", "currentColor", "currentcolor", "cyan", "darkblue", "darkcyan", "darkgoldenrod", "darkgray", "darkgreen", "darkgrey", "darkkhaki", "darkmagenta", "darkolivegreen", "darkorange", "darkorchid", "darkred", "darksalmon", "darkseagreen", "darkslateblue", "darkslategray", "darkslategrey", "darkturquoise", "darkviolet", "deeppink", "deepskyblue", "dimgray", "dimgrey", "dodgerblue", "firebrick", "floralwhite", "forestgreen", "fuchsia", "gainsboro", "ghostwhite", "gold", "goldenrod", "gray", "green", "greenyellow", "grey", "honeydew", "hotpink", "indianred", "indigo", "ivory", "khaki", "lavender", "lavenderblush", "lawngreen", "lemonchiffon", "lightblue", "lightcoral", "lightcyan", "lightgoldenrodyellow", "lightgray", "lightgreen", "lightgrey", "lightpink", "lightsalmon", "lightseagreen", "lightskyblue", "lightslategray", "lightslategrey", "lightsteelblue", "lightyellow", "lime", "limegreen", "linen", "magenta", "maroon", "mediumaquamarine", "mediumblue", "mediumorchid", "mediumpurple", "mediumseagreen", "mediumslateblue", "mediumspringgreen", "mediumturquoise", "mediumvioletred", "midnightblue", "mintcream", "mistyrose", "moccasin", "navajowhite", "navy", "oldlace", "olive", "olivedrab", "orange", "orangered", "orchid", "palegoldenrod", "palegreen", "paleturquoise", "palevioletred", "papayawhip", "peachpuff", "peru", "pink", "plum", "powderblue", "purple", "rebeccapurple", "red", "rosybrown", "royalblue", "saddlebrown", "salmon", "sandybrown", "seagreen", "seashell", "sienna", "silver", "skyblue", "slateblue", "slategray", "slategrey", "snow", "springgreen", "steelblue", "tan", "teal", "thistle", "tomato", "turquoise", "violet", "wheat", "white", "whitesmoke", "yellow", "yellowgreen"];
export const DEFAULT_NULLSRC = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs%3D';
const DEFAULT_CONJUNCTIONS = ['and', 'or', 'of', 'the'];
const DEFAULT_SIZE = 38;

function isString(value: string) {
  const currentValue = value.replace(/[<>'"[\]{}?/,.`\\%^&~:;*()+$#@!_\-+=\s]/g, '');
  return value !== '' || value !== currentValue;
}

function getInitials(name: string, limit: number = 3, conjunctions: string[] = DEFAULT_CONJUNCTIONS): string {
  const limitProvide = Math.min(Math.max(limit, 1), 5);

  if (!name || limitProvide < 1) return '';

  const words = name.split(/\s+/).filter(Boolean);

  if (words.length === 1) return words[0].slice(0, limitProvide).toUpperCase();

  const filteredWords = words.filter(word => !conjunctions.includes(word.toLowerCase()));
  const targetWords = filteredWords.length ? filteredWords : words;
  const initials = targetWords.slice(0, limitProvide).map(word => word[0].toUpperCase());

  return initials.join('').slice(0, limitProvide);
}

function hashCode(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash + char) >>> 0;
  }
  return hash;
}

export function getInitialsColor(name: string, colors: CSSProperties['color'][] = DEFAULT_COLORS) {
  const hash = hashCode(getInitials(name));
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

function stateProp<T>(prop: T | ((state: StateProps) => T), { hasLoad = false, isError = false } = {}): T {
  if (typeof prop === 'function') return (prop as (state: StateProps) => T)({ hasLoad, isError });
  return prop;
}

function is<T>(state: T) {
  return (state as T) ? 'true' : undefined;
}
function getStyles(selector: SelectorGroup, opts?: Options) {
  function selected<T>(select: Selector, state: T) {
    return selector === select ? (state as T) : undefined;
  }
  // const isGroup = opts?.withinGroup ? selector === "group" : selector === "root";
  const isInitials = opts?.isInitials;
  const state = { hasLoad: opts?.hasLoad, isError: opts?.isError };
  return {
    ...selected('root', { 'data-within-group': is(opts?.withinGroup) }),
    className: cn(
      !opts?.unstyled?.[selector] && [
        classes({ selector }),
        cnx(
          selector === 'root' && [
            opts?.withinGroup && 'ml-[var(--ag-offset)] border-2 border-solid border-background',
            opts?.size ? 'size-[var(--avatar-size)] min-w-[var(--avatar-size)] min-h-[var(--avatar-size)] max-w-[var(--avatar-size)] max-h-[var(--avatar-size)]' : 'size-9',
            opts?.round ? 'rounded-[var(--avatar-round)]' : 'rounded-full',
            opts?.color ? ['bg-[var(--avatar-bg)]', isInitials ? 'text-[var(--avatar-text-color)]' : 'text-color'] : 'bg-background'
          ]
        )
      ],
      stateProp(opts?.classNames?.[selector], state),
      stateProp(opts?.className, state)
    ),
    style: ocx(
      // isGroup && opts?.size && { '--avatar-size': rem(opts?.size) },
      selector === 'root' && opts?.size && { '--avatar-size': rem(opts?.size) },
      selector === 'group' && { '--ag-spacing': rem(opts?.gap), '--ag-offset': ' calc(var(--ag-spacing, calc(var(--avatar-size) / 1.85)) * -1)' },
      selector === 'root' && [
        { '--avatar-fz': `calc(var(--avatar-size) / max(${opts?.lengthInitial}, 2.35))` },
        opts?.round && { '--avatar-round': rem(opts?.round) },
        opts?.color && [{ '--avatar-bg': opts.color }, isInitials && { '--avatar-text-color': getContrastColor(opts.color) }]
      ],
      stateProp(opts?.styles?.[selector], state),
      stateProp(opts?.style, state)
    )
  };
}

interface StateProps {
  hasLoad: boolean;
  isError: boolean;
}

type __CtxProps = {
  size: number | `${number}`;
  round: (string & {}) | number;
  color: CSSProperties['color'] | 'initials';
  initialLimit: 1 | 2 | 3 | `${number}` | number;
};
type CtxProps<TStyles extends [string, unknown] = StylesGroup> = NestedRecord<TStyles, SelectorGroup> & __CtxProps;
const ctx = React.createContext<CtxProps | undefined>(undefined);
export function useAvatarGroupCtx() {
  const _ctx = React.useContext(ctx);
  return { withinGroup: !!_ctx, ..._ctx };
}

interface __AvatarGroupProps extends Partial<CtxProps> {
  gap?: (string & {}) | number;
}

export interface AvatarGroupProps extends __AvatarGroupProps, React.PropsWithoutRef<Omit<React.ComponentProps<'div'>, 'style' | 'color'>> {
  style?: CSSProperties;
}
export const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>((_props, ref) => {
  const { classNames, className, style, styles, unstyled, round, gap = 16, color = 'initials', size = DEFAULT_SIZE, initialLimit = '2', ...props } = _props;

  return (
    <ctx.Provider value={{ size, round: round!, color, initialLimit, unstyled, classNames, styles }}>
      <div {...{ ref, ...getStyles('group', { unstyled, className, classNames, style, styles, size, gap, withinGroup: true }), ...props }} />
    </ctx.Provider>
  );
});
AvatarGroup.displayName = 'AvatarGroup';

type Exclude = 'src' | 'alt' | 'style' | 'color' | 'className' | 'children';

interface __AvatarProps {
  size?: number | `${number}`;
  round?: (string & {}) | number;
  color?: CSSProperties['color'] | 'initials';
  src?: ImageProps['src'] | null;
  alt?: string;
  fallback?: string | React.ReactElement;
  allowedInitialsColors?: CSSProperties['color'][];
  initialLimit?: 1 | 2 | 3 | `${number}` | number;
}
interface AvatarProps extends __AvatarProps, Omit<ImageProps, Exclude>, StylesNames<Selector> {
  rootProps?: React.ComponentPropsWithRef<'div'> & { style?: CSSProperties };
  rootRef?: React.ComponentPropsWithRef<'div'>['ref'];
  children?: React.ReactNode | ((state: StateProps) => React.ReactNode);
}
export const Avatar = React.forwardRef<HTMLImageElement, AvatarProps>((_props, ref) => {
  const {
    round,
    width,
    height,
    style,
    styles,
    unstyled,
    src,
    onLoad,
    fallback,
    children,
    alt = ' ',
    priority,
    className,
    classNames,
    onError,
    onContextMenu,
    color,
    rootRef,
    rootProps = {},
    loading = 'lazy',
    unoptimized = true,
    draggable = 'false',
    allowedInitialsColors,
    initialLimit: limit,
    suppressHydrationWarning = true,
    size,
    ...props
  } = _props;

  const { className: classNameRootProp, style: styleRootProp, ref: refRootProp, ...restRootProp } = rootProps;

  const ctx = useAvatarGroupCtx();
  const [error, setError] = React.useState(!src);
  const [hasLoad, setHasLoad] = React.useState(false);

  const setLoad = React.useCallback(() => setHasLoad(true), [setHasLoad]);

  React.useEffect(() => {
    setError(!src);
    setLoad();
  }, [src]);

  const _size = size ?? ctx?.size ?? DEFAULT_SIZE;
  const _round = round ?? ctx?.round;
  const _color = color ?? ctx?.color ?? 'initials';
  const _name = typeof fallback === 'string' ? fallback : typeof children === 'string' ? children : '';
  const initialLimit = (limit ?? ctx?.initialLimit) || 2;
  const isInitials = _color === 'initials';
  const lengthInitial = getInitials(_name, Number(initialLimit)).split('').length - 0.5;
  const state = { hasLoad, isError: error };
  const stylesApi: Options = {
    classNames: classNames ?? ctx.classNames,
    styles: styles ?? ctx?.styles,
    unstyled: unstyled ?? ctx?.unstyled,
    isInitials,
    lengthInitial,
    round: _round,
    color: isInitials ? getInitialsColor(_name, allowedInitialsColors) : _color,
    ...state
  };

  const stringWrap = (initials: string) => (
    <PolymorphicSlot data-load={is(hasLoad)} role="status" {...getStyles('fallback', stylesApi)}>
      <bdi title={initials} className={cnx(!stylesApi.unstyled && 'line-clamp-1 uppercase text-[var(--avatar-text-color)]')}>
        {getInitials(initials, Number(initialLimit))}
      </bdi>
    </PolymorphicSlot>
  );

  const fallbackContent = typeof fallback === 'string' && isString(fallback) ? stringWrap(fallback) : fallback;

  const fallbackError = (typeof children === 'string' && isString(children) ? stringWrap(children) : hasLoad && error && typeof children !== 'function' && children) ||
    fallbackContent || <AvatarPlaceholderIcon />;

  return (
    <div
      {...{
        'data-initial': getInitials(_name, Number(initialLimit)),
        ...getStyles('root', {
          className: cn(stateProp(className, state), stateProp(classNameRootProp, state)),
          style: ocx(stateProp(style, state), styleRootProp),
          withinGroup: ctx?.withinGroup,
          size: _size,
          ...stylesApi
        }),
        suppressHydrationWarning,
        ...restRootProp,
        ref: rootRef ?? refRootProp
      }}
    >
      {!hasLoad && !error && fallbackContent}
      {typeof children === 'function' ? children(state) : error && fallbackError}
      {!error && (
        <NextImage
          ref={ref}
          alt={alt}
          priority={priority}
          draggable={draggable}
          width={width || _size}
          height={height || _size}
          unoptimized={unoptimized}
          src={(hasLoad ? (typeof src === 'string' ? src.trimEnd() : src) : DEFAULT_NULLSRC) as ImageProps['src']}
          loading={priority ? 'eager' : loading}
          onLoad={e => {
            setLoad();
            onLoad?.(e);
          }}
          onContextMenu={e => {
            e.preventDefault();
            onContextMenu?.(e);
          }}
          onError={e => {
            setError(true);
            onError?.(e);
          }}
          {...{
            ...getStyles('image', stylesApi),
            ...props
          }}
        />
      )}
    </div>
  );
}) as AvatarComponent;
Avatar.displayName = 'Avatar';

export function AvatarPlaceholderIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg {...props} data-avatar-placeholder-icon viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" height="70%" width="70%">
      <path
        d="M0.877014 7.49988C0.877014 3.84219 3.84216 0.877045 7.49985 0.877045C11.1575 0.877045 14.1227 3.84219 14.1227 7.49988C14.1227 11.1575 11.1575 14.1227 7.49985 14.1227C3.84216 14.1227 0.877014 11.1575 0.877014 7.49988ZM7.49985 1.82704C4.36683 1.82704 1.82701 4.36686 1.82701 7.49988C1.82701 8.97196 2.38774 10.3131 3.30727 11.3213C4.19074 9.94119 5.73818 9.02499 7.50023 9.02499C9.26206 9.02499 10.8093 9.94097 11.6929 11.3208C12.6121 10.3127 13.1727 8.97172 13.1727 7.49988C13.1727 4.36686 10.6328 1.82704 7.49985 1.82704ZM10.9818 11.9787C10.2839 10.7795 8.9857 9.97499 7.50023 9.97499C6.01458 9.97499 4.71624 10.7797 4.01845 11.9791C4.97952 12.7272 6.18765 13.1727 7.49985 13.1727C8.81227 13.1727 10.0206 12.727 10.9818 11.9787ZM5.14999 6.50487C5.14999 5.207 6.20212 4.15487 7.49999 4.15487C8.79786 4.15487 9.84999 5.207 9.84999 6.50487C9.84999 7.80274 8.79786 8.85487 7.49999 8.85487C6.20212 8.85487 5.14999 7.80274 5.14999 6.50487ZM7.49999 5.10487C6.72679 5.10487 6.09999 5.73167 6.09999 6.50487C6.09999 7.27807 6.72679 7.90487 7.49999 7.90487C8.27319 7.90487 8.89999 7.27807 8.89999 6.50487C8.89999 5.73167 8.27319 5.10487 7.49999 5.10487Z"
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
      />
    </svg>
  );
}

// Export Card as a composite component
type ForwardRef<T extends React.ElementType, Props> = React.ForwardRefExoticComponent<Props & { ref?: React.ComponentPropsWithRef<T>['ref'] }>;
type AvatarComponent = ForwardRef<'img', AvatarProps> & {
  Group: typeof AvatarGroup;
};
// Attach sub-components
Avatar.Group = AvatarGroup;
