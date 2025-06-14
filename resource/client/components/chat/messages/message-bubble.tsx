'use client';
import * as React from 'react';
// import * as CtxMenu from '@radix-ui/react-context-menu';
import { CheckIcon, DoubleCheckIcon } from '../../icons';
import { cn } from 'cn';
import { MotionImage } from '../../motion/motion-image';
import { ChevronFillIcon, StickerSmileFillIcon } from '../../icons-fill';
import { formatPrettyDate, formatShortTime } from '@/resource/const/times-helper';
import { Account, Message as MessageProp, MessageReaction, MinimalAccount } from '@/resource/types/user';
import { ContextMenu as CtxMenu } from '@/resource/client/components/ui/context-menu';
import * as motion from 'motion/react-client';
import { Avatar, getInitialsColor } from '../../ui/avatar-oeri';
import { useHover } from '@/resource/hooks/use-hover';
import { getEmoji } from '../emoji/config';
import { toast } from 'sonner';
import { x } from 'xuxi';

import { EnrichedMessage } from './helper';
import { SafeInlineDisplay } from '../../inline-editor/inline-display';
import { SheetsBreakpoint } from '../../sheets-breakpoint';
import { Popover } from '../../ui/popover';
import { useIsMobile } from '@/resource/hooks/use-device-query';
import { Svg, SvgProps } from '../../ui/svg';

import css from './msg.module.css';
import { debounce } from 'lodash';
import axios from 'axios';
import { useChat, UseChatOptions } from '../chat-context';
import { useMergedRef } from '@/resource/hooks/use-merged-ref';
import { useApp } from '@/resource/client/contexts/app-provider';
import { useRouter } from 'next/navigation';

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
interface MessageBubbleProps extends React.ComponentPropsWithRef<'div'>, UseChatOptions {
  data: EnrichedMessage;
  lastMessage: EnrichedMessage | undefined;
  members?: (MinimalAccount | null)[] | null | undefined;
  targetRef: React.RefObject<HTMLDivElement> | null;
  // classNames?: Partial<Record<MCTrees, string>>;
}

export function MessageBubble(_props: MessageBubbleProps) {
  const { ref, data, className, members, lastMessage, searchQuery, targetRef, ...props } = _props;
  const [openMenu, setOpenMenu] = React.useState<boolean>(false);

  const isMediaQuery = useIsMobile();
  const { user } = useApp();

  const { chatId } = useChat({ searchQuery });

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

  const markAsSeen = debounce((chatId: string, messageId: string) => {
    axios.post(`/api/chats/${chatId}/seen`, { messageId });
  }, 500); // delay 500ms agar tidak terlalu sering

  React.useEffect(() => {
    if (!targetRef?.current || !chatId || !lastMessage?.id || data.senderId === user?.id) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) markAsSeen(chatId, lastMessage.id); // kirim ID terakhir
      },
      { threshold: 1.0 } // hanya saat 100% terlihat
    );

    observer.observe(targetRef.current);

    return () => observer.disconnect();
  }, [chatId, lastMessage?.id]);

  return (
    <CtxMenu>
      <article ref={useMergedRef(ref, targetRef)} {...{ ...props, role: 'row', suppressHydrationWarning: true, tabIndex: -1 }}>
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
                  <ArrowMessageBubble bubble={isOwn ? 'out' : 'in'} style={{ color: 'var(--bg-themes)' }} />
                </span>
              )}
              {!data.isRepeatInDay && !isOwn && (
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
                      {!data.isRepeatInDay && !isOwn && (
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
                          {data.body && <SpacerMessageBody dateTime={dateTime} />}
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
                                  <span className="hidden sr-only" style={{ display: 'none' }}>
                                    {seenBy}
                                  </span>
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
                    {!isMediaQuery && (
                      <SheetsBreakpoint
                        openWith="popover"
                        open={openMenu}
                        onOpenChange={setOpenMenu}
                        trigger={
                          <ActionOnHovered
                            aria-label="Context menu"
                            withShadow={!data?.mediaUrl}
                            onClick={() => {}}
                            onContextMenu={onPrevent}
                            visibleFrom={isOwn ? 'left' : 'right'}
                            hovered={hovered || openMenu}
                            classNames={{ root: css._stmnin }}
                          >
                            <span aria-hidden data-icon="down-context">
                              <ChevronFillIcon size={20} chevron="down" />
                            </span>
                          </ActionOnHovered>
                        }
                        content={<MessageMenu opened data={data} />}
                        classNames={{ content: 'p-1 h-fit w-48' }}
                      />
                    )}
                  </div>

                  <div></div>
                </div>
              </CtxMenu.Trigger>

              {!isMediaQuery && (
                <ActionOnHovered
                  aria-label="Add Emoji Sticker"
                  onClick={() => {}}
                  whileHover={{ scale: 1.1 }}
                  onContextMenu={onPrevent}
                  visibleFrom={isOwn ? 'right' : 'left'}
                  hovered={rootHovered}
                  classNames={{ root: emoji }}
                >
                  <span aria-hidden data-icon="Sticker">
                    <StickerSmileFillIcon size={20} />
                  </span>
                </ActionOnHovered>
              )}
            </div>

            <Reactions reactions={data?.reactions} classNames={{ root: reaction }} />
          </div>
        </div>
      </article>

      <MessageMenu data={data} />
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

  if (!text) return null;

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

interface UseMenuMapOptions {}

function useMenuMap(data: EnrichedMessage) {
  const router = useRouter();
  const isMediaQuery = useIsMobile();

  const handleCopy = React.useCallback(() => {
    if (data.body) {
      navigator.clipboard
        .writeText(data.body)
        .then(() => {
          toast('Text copied to clipboard');
        })
        .catch(err => {
          console.error('Failed to copy: ', err);
        });
    }
  }, [data.body]);

  const handleSaveMedia = React.useCallback(async () => {
    if (!data.mediaUrl) return;

    try {
      const response = await fetch(data.mediaUrl, { mode: 'cors' }); // Pastikan server mendukung CORS
      const blob = await response.blob();

      const fileExtension = data.mediaUrl.split('.').pop()?.split('?')[0] || 'jpg';
      const fileName = `media-${data.sender.username}-${data.id}-${Date.now()}.${fileExtension}`;

      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(blobUrl); // Bersihkan URL blob setelah download
    } catch (error) {
      console.error('Gagal menyimpan media:', error);
      alert('Gagal menyimpan media. Coba lagi.');
    }
  }, [data.mediaUrl]);

  const handleSavePage = React.useCallback(() => {
    const blob = new Blob([document.documentElement.outerHTML], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `page-${Date.now()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const handleDelete = React.useCallback(async () => {
    const confirmDelete = window.confirm('Apakah kamu yakin ingin menghapus pesan ini?');
    if (!confirmDelete) return;

    try {
      await axios.delete(`/api/chats/${data.id}`);
      router.replace('/chat');
      router.refresh();
    } catch (_e) {
      console.error('Gagal menghapus Pesan', _e);
    }
  }, [data.id, router]);

  const menuMap: MenuMap[] = [
    { label: 'Message info', shortcut: '⌘+I', onAction: () => {} },
    ...(data.mediaUrl ? [{ label: 'Save Media', onAction: handleSaveMedia }] : []),
    { label: 'Reply', shortcut: '⌘+R', onAction: () => {} },
    { label: 'Copy', shortcut: '⌘+P', onAction: handleCopy },
    { label: 'React', shortcut: '⌘+E', onAction: () => {} },
    { label: 'Forward', shortcut: '⌘+F', onAction: () => {} },
    { label: 'Pin', shortcut: '', onAction: () => {} },
    { label: 'Star', shortcut: '', onAction: () => {} },
    { label: 'Delete', variant: 'destructive', onAction: handleDelete },
    ...(!isMediaQuery
      ? [
          {
            label: 'More',
            separator: true,
            sub: [
              { label: 'Save Page', shortcut: '⇧⌘+S', onAction: handleSavePage },
              { label: 'Create Shortcut', onAction: () => {} },
              { label: 'Developer', separator: true, onAction: () => {} }
            ]
          }
        ]
      : [])
  ];

  return menuMap;
}

type MenuMap = {
  label: string;
  shortcut?: string | undefined;
  separator?: boolean | undefined;
  onAction?: React.MouseEventHandler<HTMLDivElement>;
  sub?: MenuMap[];
  disabled?: boolean;
  variant?: React.ComponentProps<typeof CtxMenu.Item>['variant'];
};

function renderMenuItemsX(items: MenuMap[]) {
  return items.flatMap(item => {
    const elements: React.ReactNode[] = [];

    if (item.separator) {
      elements.push(<CtxMenu.Separator key={`sep-${item.label}`} />);
    }

    if (item.sub && item.sub.length > 0) {
      elements.push(
        <CtxMenu.Sub key={item.label}>
          <CtxMenu.SubTrigger>{item.label}</CtxMenu.SubTrigger>
          <CtxMenu.SubContent className="w-40">{renderMenuItems(item.sub)}</CtxMenu.SubContent>
        </CtxMenu.Sub>
      );
    } else {
      elements.push(
        <CtxMenu.Item key={item.label} disabled={item.disabled} variant={item.variant} onClick={item.onAction}>
          {item.label}
          {item.shortcut && <CtxMenu.Shortcut>{item.shortcut}</CtxMenu.Shortcut>}
        </CtxMenu.Item>
      );
    }

    return elements;
  });
}

function renderMenuItems(items: MenuMap[], event: 'contextmenu' | 'click' = 'contextmenu') {
  const componentMap = {
    contextmenu: {
      Item: CtxMenu.Item,
      Separator: CtxMenu.Separator,
      Shortcut: CtxMenu.Shortcut,
      Sub: CtxMenu.Sub,
      SubTrigger: CtxMenu.SubTrigger,
      SubContent: CtxMenu.SubContent
    },
    click: {
      Item: Popover.Item,
      Separator: Popover.Separator,
      Shortcut: Popover.Shortcut,
      Sub: Popover.Sub,
      SubTrigger: Popover.SubTrigger,
      SubContent: Popover.SubContent
    }
  };

  const { Item, Separator, Sub, SubTrigger, SubContent, Shortcut } = componentMap[event];

  return items.flatMap(item => {
    const elements: React.ReactNode[] = [];

    if (item.separator) {
      elements.push(<Separator key={`sep-${item.label}`} />);
    }

    if (item.sub && item.sub.length > 0) {
      elements.push(
        <Sub key={item.label}>
          <SubTrigger>{item.label}</SubTrigger>
          <SubContent className="w-40">{renderMenuItems(item.sub, event)}</SubContent>
        </Sub>
      );
    } else {
      elements.push(
        <Item key={item.label} disabled={item.disabled} variant={item.variant} onClick={item.onAction}>
          {item.label}
          {item.shortcut && <Shortcut>{item.shortcut}</Shortcut>}
        </Item>
      );
    }

    return elements;
  });
}

interface MessageMenuProps {
  // event?: 'contextmenu' | 'click';
  opened?: boolean;
  data: EnrichedMessage;
}
function MessageMenu({ opened, ...props }: MessageMenuProps) {
  const menuMap = useMenuMap(props.data);
  // const event = open ? 'click' : 'contextmenu';

  if (opened) return renderMenuItems(menuMap, 'click');

  return <CtxMenu.Content className="w-48">{renderMenuItems(menuMap, 'contextmenu')}</CtxMenu.Content>;
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

export function ArrowMessageBubble({ bubble = 'in', size = 13, ...props }: SvgProps<{ bubble?: 'in' | 'out' }>) {
  return (
    <Svg {...props} size={size} currentFill="fill" viewBox="0 0 8 13" ratio={{ w: 0.6154 }} enableBackground="new 0 0 8 13">
      {bubble === 'in' ? (
        <>
          <path opacity="0.13" d="M1.533,3.568L8,12.193V1H2.812 C1.042,1,0.474,2.156,1.533,3.568z" />
          <path d="M1.533,2.568L8,11.193V0L2.812,0C1.042,0,0.474,1.156,1.533,2.568z" />
        </>
      ) : (
        <>
          <path opacity="0.13" d="M5.188,1H0v11.193l6.467-8.625 C7.526,2.156,6.958,1,5.188,1z" />
          <path d="M5.188,0H0v11.193l6.467-8.625C7.526,1.156,6.958,0,5.188,0z" />
        </>
      )}
    </Svg>
  );
}
