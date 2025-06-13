'use client';
import * as React from 'react';
// import * as CtxMenu from '@radix-ui/react-context-menu';
import { CheckIcon, DoubleCheckIcon } from '../../icons';
import { cn } from 'cn';
import { MotionImage } from '../../motion/motion-image';
import { ArrowMessageBoxFillIcon, ChevronFillIcon, StickerSmileFillIcon } from '../../icons-fill';
import { formatPrettyDate, formatShortTime } from '@/resource/const/times-helper';
import { Account, Message as MessageProp, MessageReaction, MinimalAccount } from '@/resource/types/user';
import { ContextMenu as CtxMenu } from '@/resource/client/components/ui/context-menu';
import * as motion from 'motion/react-client';
import { Avatar, getInitialsColor } from '../../ui/avatar-oeri';
import { useHover } from '@/resource/hooks/use-hover';
import { getEmoji } from '../emoji/config';
import { x } from 'xuxi';

import { EnrichedMessage } from './helper';
import { SafeInlineDisplay } from '../../inline-editor/inline-display';

import css from './msg.module.css';

const reactions: MessageReaction[] = [
  { emoji: '❤️', createdAt: new Date(Date.now()), id: '1', messageId: '1', userId: '1', user: null },
  { emoji: '👍', createdAt: new Date(Date.now()), id: '2', messageId: '2', userId: '2', user: null },
  { emoji: '😉', createdAt: new Date(Date.now()), id: '3', messageId: '3', userId: '3', user: null }
];

function onPrevent<TEvent extends React.MouseEvent<HTMLElement, MouseEvent>>(e: TEvent) {
  e.preventDefault();
  e.stopPropagation();
}

interface DefFloat<T> {
  in: T;
  out: T;
}

// type MCTrees = 'container' | 'root' | 'wrapper' | 'box' | 'icon';
interface MessageBoxProps extends React.ComponentPropsWithRef<'div'> {
  data: EnrichedMessage;
  members?: (MinimalAccount | null)[] | null | undefined;
  // classNames?: Partial<Record<MCTrees, string>>;
}

export function Message(_props: MessageBoxProps) {
  const { data, className, members, ...props } = _props;
  // const [openImage, setOpenImage] = React.useState(false);

  const refAvatar = React.useRef<HTMLDivElement>(null);
  const refContent = React.useRef<HTMLDivElement>(null);
  const { hovered } = useHover([refAvatar, refContent], { touch: true });
  const { ref: refRootHovered, hovered: rootHovered } = useHover([], { touch: true });

  const colorByInitial = getInitialsColor(data?.sender.name);
  const isOwn = data.isFromCurrentUser;

  const seenList = (data.seen || []).filter(user => user.email !== data?.sender?.email).map(user => user.name);

  const seenBy = JSON.stringify(`Seen by: [${seenList}]`, null, 2);

  const dateTime = formatShortTime(new Date(data.createdAt)),
    dateMessage = formatPrettyDate(new Date(data.createdAt), { locale: 'en-US', year: 'numeric', month: '2-digit' });
  const plaintext = x.cnx(`[${dateTime}, ${dateMessage}]`, `${data.sender.name}:`);
  const isSend = seenList.length > 0;

  const defFloat = <T,>(define: DefFloat<T>): T => (isOwn ? define.out : define.in);

  const container = cn('relative', data.isFirst ? 'my-3' : data.isLast ? 'mb-6' : 'mb-3', data.isRepeatInDay && '-mt-2.5', className),
    root = defFloat({ in: css._rpin, out: css._rpout }),
    arrow = defFloat({ in: css._arin, out: css._arout }),
    reaction = defFloat({ in: css._rctin, out: css._rctout }),
    avatar = defFloat({ in: css._avtin, out: css._avtout }),
    box = defFloat({ in: css._bxin, out: css._bxout }),
    header = defFloat({ in: css._hdrin, out: css._hdrout }),
    cntpict = defFloat({ in: css._pictin, out: css._pictout }),
    emoji = defFloat({ in: css._emjin, out: css._emjout });

  return (
    <CtxMenu>
      <article {...{ ...props, role: 'row', suppressHydrationWarning: true, tabIndex: -1 }}>
        <div tabIndex={-1} className={container}>
          <div ref={refRootHovered} className={root}>
            <div
              className={defFloat({ in: css._wrpI, out: css._wrpO })}
              // onContextMenu={onContextMenu}
              {...{
                suppressHydrationWarning: true,
                style: {
                  '--color-themes': 'var(--color-themes)'
                } as React.CSSProperties
              }}
            >
              {!data.isRepeatInDay && (
                <span aria-hidden className={arrow}>
                  <ArrowMessageBoxFillIcon message={isOwn ? 'out' : 'in'} style={{ color: 'var(--bg-themes)' }} />
                </span>
              )}
              {!isOwn && (
                <Avatar
                  unstyled={{ root: true, fallback: true }}
                  size={28}
                  src={data.sender?.image}
                  fallback={data.sender.name}
                  className={avatar}
                  rootProps={{ ref: refAvatar, tabIndex: 0, onContextMenu: onPrevent }}
                />
              )}
              <CtxMenu.Trigger asChild>
                <div ref={refContent} className={box} {...{ style: { backgroundColor: 'var(--bg-themes)', boxShadow: '0 1px .5px var(--shadow)' } }}>
                  <span aria-label={defFloat({ in: data.sender.name, out: 'You:' })} />

                  <div>
                    <div className={css._ctn}>
                      {!isOwn && (
                        <div className={header}>
                          <span dir="auto" className={css._snd} {...{ style: { color: colorByInitial } }}>
                            {data.sender.name}
                          </span>
                        </div>
                      )}

                      <div data-pre-plain-text={plaintext}>
                        <div className={css._msg}>
                          {data?.mediaUrl && <MotionImage src={data.mediaUrl} name={data.id} modal unstyled={{ container: true, image: true }} className={cntpict} />}

                          <ExpandableMessageBody members={members} text={data.body} dir="ltr" className={css._msgbd} />
                          <SpacerMessageBody dateTime={dateTime} />
                        </div>
                      </div>

                      {/* Message Time & Checked */}
                      <div className={css._ft}>
                        <div role="button" className={css._ftw}>
                          {dateTime && (
                            <time dateTime={dateTime} dir="auto">
                              {dateTime}
                            </time>
                          )}

                          {isOwn && (
                            <div aria-label={isSend ? 'Sent' : 'Unread'} className={css._ftch}>
                              {isSend ? (
                                <>
                                  <DoubleCheckIcon size={17} style={{ color: '#53bdeb' }} />
                                  <span className="hidden sr-only">{seenBy}</span>
                                </>
                              ) : (
                                <CheckIcon size={17} />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <ActionOnHovered
                      aria-label="Context menu"
                      withShadow={!data?.mediaUrl}
                      onClick={() => {}}
                      onContextMenu={onPrevent}
                      visibleFrom={isOwn ? 'left' : 'right'}
                      hovered={hovered}
                      classNames={{ root: css._stmnin }}
                    >
                      <span aria-hidden data-icon="down-context">
                        <ChevronFillIcon size={20} chevron="down" />
                      </span>
                    </ActionOnHovered>
                  </div>

                  <div></div>
                </div>
              </CtxMenu.Trigger>

              <ActionOnHovered
                aria-label="Add Emoji Sticker"
                onClick={() => {}}
                onContextMenu={onPrevent}
                visibleFrom={isOwn ? 'right' : 'left'}
                hovered={rootHovered}
                classNames={{ root: emoji }}
              >
                <span aria-hidden data-icon="Sticker">
                  <StickerSmileFillIcon size={20} />
                </span>
              </ActionOnHovered>
            </div>

            <Reactions reactions={data?.reactions} classNames={{ root: reaction }} />
          </div>
        </div>
      </article>

      <ContextMenuContent />
    </CtxMenu>
  );
}

interface ExpandableMessageProps extends React.ComponentProps<'div'> {
  text: string | null | undefined;
  members?: (MinimalAccount | null)[] | null | undefined;
}

const SLICE_STEPS = [768, 3839, 6869, 10420, 13750]; // dan seterusnya

// Fungsi utilitas: menghasilkan batas slice bertahap
function generateSliceSteps(start: number, step: number, max: number): number[] {
  const steps = [];
  let current = start;
  while (current < max) {
    steps.push(current);
    current += step;
  }
  return steps;
}
/**
function removeZeroWidthSpace(root: HTMLElement) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);

  let node: Text | null;
  while ((node = walker.nextNode() as Text | null)) {
    if (node.nodeValue?.includes('\u200B')) {
      node.nodeValue = node.nodeValue.replace(/\u200B/g, '');
    }
  }
}

    const containerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      if (containerRef.current){
        removeZeroWidthSpace(containerRef.current);
      }
    }, [containerRef.current])
 */

const ExpandableMessageBody = React.forwardRef<HTMLDivElement, ExpandableMessageProps>((_props, ref) => {
  const { text = '', members: initialMembers, ...props } = _props;

  const fullText: string = text ?? '';

  const SLICE_STEPS = generateSliceSteps(2768, 3071, fullText?.length);
  const [currentStepIndex, setCurrentStepIndex] = React.useState(0);

  const visibleLength = SLICE_STEPS[currentStepIndex] || fullText?.length;
  const isTruncated = fullText?.length > visibleLength;

  const members = React.useMemo(() => (initialMembers ?? [])?.map(member => ({ id: member?.refId!, name: member?.username! })), [initialMembers]);

  const handleReadMore = () => {
    setCurrentStepIndex(prev => Math.min(prev + 1, SLICE_STEPS.length));
  };

  /**
const [stepIndex, setStepIndex] = useState(0);
const visibleLength = SLICE_STEPS[stepIndex] || fullText.length;

const handleReadMore = () => {
  setStepIndex((prev) => Math.min(prev + 1, SLICE_STEPS.length));
};
*/

  return (
    <div {...props} ref={ref}>
      {/* {fullText?.slice(0, visibleLength)} */}
      <SafeInlineDisplay users={members} text={fullText?.slice(0, visibleLength)} classNames={{ mention: css._mention }} />
      {/* <p dangerouslySetInnerHTML={{ __html: fullText?.slice(0, visibleLength) }} /> */}
      {isTruncated && '...'}
      {isTruncated && (
        <button type="button" role="button" onClick={handleReadMore} className="text-[#53bdeb] hover:underline text-sm font-system">
          Read more
        </button>
      )}
    </div>
  );
});
ExpandableMessageBody.displayName = 'ExpandableMessageBody';

interface SpacerMessageBodyProps {
  dateTime?: string;
}
function SpacerMessageBody({ dateTime }: SpacerMessageBodyProps) {
  return (
    <span>
      <span aria-hidden className={css._block}>
        <span datatype="block" />
        <span datatype="time">{dateTime}</span>
      </span>
    </span>
  );
}

interface ActionOnHoveredProps extends React.ComponentPropsWithRef<typeof motion.div> {
  visibleFrom: 'left' | 'right';
  hovered?: boolean;
  withShadow?: boolean | React.CSSProperties['backgroundImage'];
  classNames?: Partial<Record<'root', string>>;
}
function ActionOnHovered(_props: ActionOnHoveredProps) {
  const { visibleFrom, hovered, withShadow, classNames, ...props } = _props;
  const [isVisible, setIsVisible] = React.useState(hovered);

  const BREAKPOINT = '58.1623%';
  const point = {
    left: `-${BREAKPOINT}`,
    right: BREAKPOINT
  };
  const x = point[visibleFrom];
  const background = typeof withShadow === 'boolean' ? (withShadow ? 'radial-gradient(var(--bg-deg), var(--bg-themes) 60%, #0000 80%)' : undefined) : withShadow;

  React.useEffect(() => {
    if (hovered) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 500);
      return () => clearTimeout(timer);
    }
  }, [hovered]);

  if (!isVisible) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={hovered ? { opacity: 1, background } : { opacity: 0 }} className={classNames?.root}>
      <motion.div
        {...props}
        tabIndex={0}
        aria-expanded="false"
        role="button"
        initial={{ x }}
        whileHover={{ scale: 1.1 }}
        animate={hovered ? { x: 0, opacity: 1 } : { x, opacity: 0 }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 25,
          duration: 0.3
        }}
      />
    </motion.div>
  );
}

type ContextMenuMap = {
  label: string;
  shortcut?: string | undefined;
  separator?: boolean | undefined;
  onAction?: () => void;
  sub?: ContextMenuMap[];
};
const contextMenuMap: ContextMenuMap[] = [
  { label: 'Message info', shortcut: '⌘I', onAction: () => {} },
  { label: 'Reply', shortcut: '⌘R', onAction: () => {} },
  { label: 'Copy', shortcut: '⌘P', onAction: () => {} },
  { label: 'React', shortcut: '⌘E', onAction: () => {} },
  { label: 'Forward', shortcut: '⌘F', onAction: () => {} },
  { label: 'Pin', shortcut: '', onAction: () => {} },
  { label: 'Star', shortcut: '', onAction: () => {} },
  { label: 'Delete', onAction: () => {} },
  {
    label: 'More',
    separator: true,
    sub: [
      { label: 'Save Page', shortcut: '⇧⌘S', onAction: () => {} },
      { label: 'Create Shortcut', onAction: () => {} },
      { label: 'Developer', separator: true, onAction: () => {} }
    ]
  }
];

function renderMenuItems(items: ContextMenuMap[]) {
  return items.flatMap(item => {
    const elements: React.ReactNode[] = [];

    if (item.separator) {
      elements.push(<CtxMenu.Separator key={`sep-${item.label}`} />);
    }

    if (item.sub && item.sub.length > 0) {
      elements.push(
        <CtxMenu.Sub key={item.label}>
          <CtxMenu.SubTrigger inset>{item.label}</CtxMenu.SubTrigger>
          <CtxMenu.SubContent className="w-48">{renderMenuItems(item.sub)}</CtxMenu.SubContent>
        </CtxMenu.Sub>
      );
    } else {
      elements.push(
        <CtxMenu.Item inset key={item.label} onClick={item.onAction}>
          {item.label}
          {item.shortcut && <CtxMenu.Shortcut>{item.shortcut}</CtxMenu.Shortcut>}
        </CtxMenu.Item>
      );
    }

    return elements;
  });
}

function ContextMenuContent() {
  return <CtxMenu.Content className="w-64">{renderMenuItems(contextMenuMap)}</CtxMenu.Content>;
}

interface ReactionsProps {
  reactions?: MessageReaction[] | null;
  classNames?: Partial<Record<'root' | 'button' | 'wrapper' | 'total', string>>;
}
function Reactions(_props: ReactionsProps) {
  const { reactions, classNames } = _props;

  const onContextMenu = React.useCallback(<TEvent extends React.MouseEvent<HTMLElement, MouseEvent>>(e: TEvent) => {
    e.preventDefault();
  }, []);

  const popup = x.cnx(css._rct__pu);
  const emjwr = x.cnx(css._rct__emj_wr);
  const emjitttl = x.cnx(css._rct__emj_it_ttl);

  const reactionIsDefined = reactions !== null && reactions && reactions?.length > 1;

  const emojiSrc = (key: PositionType) => `url("https://web.whatsapp.com/emoji/v1/16/0/1/sprite/w/40/${key}.webp")`;

  if (!reactions || reactions?.length === 0) return null;

  return (
    <div className={x.cnx(classNames?.root)}>
      <button type="button" role="button" tabIndex={0} className={popup} aria-haspopup="true" aria-label="reaction 👍">
        <motion.div whileHover={{ scale: 1.05 }} className={emjwr}>
          {/* seharusnya reaction menggunakan mapping */}
          {reactions?.map(reaction => {
            const config = getEmoji(reaction.emoji);
            if (!config) return null;

            return <ReactionItem key={reaction.id} alt={reaction.emoji} src={emojiSrc(config.srcKey)} position={config.position} />;
          })}

          {/* jumlah total reaction */}
          {reactionIsDefined && (
            <div className={emjitttl} onContextMenu={onPrevent}>
              <span>{reactions?.filter(reaction => getEmoji(reaction.emoji))?.length}</span>
            </div>
          )}
        </motion.div>
      </button>
    </div>
  );
}

type PositionType = number | `${number}`;
interface ReactionItemProps extends ImageStyleProps {
  alt?: string;
}
function ReactionItem(_props: ReactionItemProps) {
  const { alt = '', src, position } = _props;

  const emjit = x.cnx(css._rct__emj_it);
  const emjtr = x.cnx(css._rct__emj_tr);
  const emjim = x.cnx(css._rct__emj_im);

  return (
    <motion.div whileHover={{ scale: 1.2 }} className={emjit}>
      <div className={emjtr}>
        <img
          crossOrigin="anonymous"
          alt={alt}
          draggable="false"
          tabIndex={-1}
          src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
          className={emjim}
          style={imageStyle({ src, position })}
          onContextMenu={onPrevent}
        />
      </div>
    </motion.div>
  );
}

interface ImageStyleProps {
  src?: string;
  position?: {
    y?: PositionType;
    x?: PositionType;
  };
}

function imageStyle(props: ImageStyleProps): React.CSSProperties {
  const { src, position } = props;
  return {
    backgroundPosition: `${position?.x}px ${position?.y}px`,
    backgroundImage: `${src}`
  } as React.CSSProperties;
}
