'use client';
import * as React from 'react';
import * as x from 'xuxi';
import * as motion from 'motion/react-client';
import { MotionImage } from '../../motion/motion-image';
import { CheckIcon, DoubleCheckIcon, XIcon } from '../../icons';
import { ChevronFillIcon, StickerSmileFillIcon } from '../../icons-fill';
import { formatPrettyDate, formatShortTime } from '@/resource/const/times-helper';
import { ContextMenu as CtxMenu } from '@/resource/client/components/ui/context-menu';
import { MinimalAccount } from '@/resource/types/user';
import { MessageReaction } from '@/resource/types/chats';
import { Avatar, getInitialsColor } from '../../ui/avatar-oeri';
import { getEmoji } from '../emoji/config';

import { EnrichedMessage } from './message-helper';
import { SafeInlineRenderer } from '../../inline-editor/inline-display';
import { useOnlinePresence } from '../hooks/use-online-presence';
import { useIsMobile } from '@/resource/hooks/use-device-query';
import { mergeRefs } from '@/resource/hooks/use-merged-ref';
import { useMouseEnter } from '@/resource/hooks/use-hover';
import { SheetsBreakpoint } from '../../sheets-breakpoint';
import { Svg, SvgProps } from '../../ui/svg';
import { Popover } from '../../ui/popover';

import { cn } from 'cn';
import { toast } from 'sonner';
import { useActiveChat } from '../chat-context';
import { getSafeInlineText } from '../../inline-editor/helper';

import css from './msg.module.css';

const reactions: MessageReaction[] = [
  { emoji: '❤️', createdAt: new Date(Date.now()), id: '1', messageId: '1', userId: '1', user: null },
  { emoji: '👍', createdAt: new Date(Date.now()), id: '2', messageId: '2', userId: '2', user: null },
  { emoji: '😉', createdAt: new Date(Date.now()), id: '3', messageId: '3', userId: '3', user: null }
];

function onPrevent<TEvent extends React.MouseEvent<HTMLElement, MouseEvent>>(e: TEvent) {
  e.preventDefault();
}

type InOut<T> = { in: T; out: T };

interface MessageBubbleProps extends React.ComponentPropsWithRef<'div'> {
  message: EnrichedMessage;
  lastMessage: EnrichedMessage | undefined;
  members?: MinimalAccount[] | null | undefined;
  targetRef?: React.RefObject<HTMLElement> | null;
  isInView?: boolean;
}

export function MessageBubble(_props: MessageBubbleProps) {
  const { ref, message: msg, className, members, lastMessage, targetRef, isInView, ...props } = _props;

  const [openMenu, setOpenMenu] = React.useState<boolean>(false);
  const [openCtx, setOpenCtx] = React.useState<boolean>(false);

  const users = React.useMemo(() => (members ?? [])?.map(user => ({ id: user?.id!, name: user?.username!, image: user?.image })), [members]);

  const isMediaQuery = useIsMobile();

  const presence = useOnlinePresence();

  const dateTime = formatShortTime(new Date(msg.createdAt));

  const colorByInitial = getInitialsColor(msg?.sender?.username ?? '');

  const { hovered: hoveredMenu, setHovered: __, ...onHoveredMenu } = useMouseEnter<HTMLDivElement>();
  const { hovered: hoveredReacts, setHovered: _, ...onHoveredReacts } = useMouseEnter<HTMLDivElement>();

  const inOut = <T,>(x: InOut<T>): T => (isOwn ? x.out : x.in);

  const isMQ = <T,>(x: T) => (!isMediaQuery ? x : undefined);

  const isOwn = msg.isFromCurrentUser;

  const seenList = msg.seenIds.filter(id => id !== msg?.senderId);

  const seenBy = JSON.stringify(`Seen by: [${seenList}]`, null, 2);
  const dateMessage = formatPrettyDate(new Date(msg.createdAt), { locale: 'en-US', year: 'numeric', month: '2-digit' });
  const plaintext = x.cnx(`[${dateTime}, ${dateMessage}]`, `${msg?.sender?.username}:`);
  const isSeen = seenList.length > 0 || msg.status === 'SEEN';

  const container = cn(css._ctr, msg.isFirst ? 'my-3' : msg.isLast ? 'mb-6' : 'mb-3', msg.isRepeatInDay && '-mt-2.5', className),
    root = inOut({ in: css._rpin, out: css._rpout }),
    arrow = inOut({ in: css._arin, out: css._arout }),
    reaction = inOut({ in: css._rctin, out: css._rctout }),
    avatar = inOut({ in: css._avtin, out: css._avtout }),
    box = inOut({ in: css._bxin, out: css._bxout }),
    header = inOut({ in: css._hdrin, out: css._hdrout }),
    cntpict = inOut({ in: css._pictin, out: css._pictout }),
    emoji = inOut({ in: css._emjin, out: css._emjout });

  return (
    <CtxMenu onOpenChange={setOpenCtx}>
      <article key={msg?.id} {...{ ...props, role: 'row', suppressHydrationWarning: true, tabIndex: -1 }} ref={mergeRefs(ref, targetRef)}>
        <div {...{ role: 'cell', tabIndex: -1 }} className={container} data-focused={isMQ(openCtx || openMenu)}>
          <div className={root} {...onHoveredReacts}>
            <div
              suppressHydrationWarning
              {...{
                className: inOut({ in: css._wrpI, out: css._wrpO }),
                style: { '--color-themes': 'var(--color-themes)', opacity: msg?.isDeleted && 0.3 } as React.CSSProperties
              }}
            >
              {/* <span className="text-[10px] text-gray-500">
                {JSON.stringify(msg.seenIds)} <br /> {msg.status} | {String(seenList)}
              </span> */}

              {!msg.isRepeatInDay && (
                <span aria-hidden className={arrow}>
                  <ArrowMessageBubble bubble={isOwn ? 'out' : 'in'} style={{ color: 'var(--bg-themes)' }} />
                </span>
              )}

              {!msg.isRepeatInDay && !isOwn && (
                <Avatar
                  unstyled={{ root: true, fallback: true }}
                  size={28}
                  src={msg.sender?.image}
                  fallback={msg.sender?.username}
                  className={avatar}
                  rootProps={{ ...onHoveredMenu, tabIndex: 0, onContextMenu: onPrevent }}
                >
                  {() => presence.isOnline(msg.senderId) && <span aria-hidden className={css._dot} />}
                </Avatar>
              )}
              <CtxMenu.Trigger asChild>
                <div className={box} {...{ ...onHoveredMenu, style: { backgroundColor: 'var(--bg-themes)', boxShadow: '0 1px .5px var(--shadow)' } }}>
                  <span aria-label={inOut({ in: msg.sender?.username, out: 'You:' })} />

                  <div>
                    <div className={css._ctn}>
                      {!msg.isRepeatInDay && !isOwn && (
                        <div className={header}>
                          <span dir="auto" className={css._snd} {...{ style: { color: colorByInitial } }}>
                            {msg.sender?.username}
                          </span>
                        </div>
                      )}

                      <div data-pre-plain-text={plaintext}>
                        <div className={css._msg}>
                          {msg?.mediaUrl && <MotionImage src={msg.mediaUrl} name={msg.id} modal unstyled={{ container: true, image: true }} className={cntpict} />}

                          <SafeInlineRenderer
                            dir="ltr"
                            value={msg?.body}
                            users={users}
                            classNames={{ root: css._msgbd, mention: css._mention, expand: 'text-[#53bdeb] hover:underline text-sm font-system' }}
                          />
                          {(msg.body || (!msg.body && !msg.mediaUrl)) && <SpacerMessageBody dateTime={dateTime} />}
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

                          {msg.status !== 'SENDING' && isOwn && (
                            <div
                              aria-label={isSeen ? 'Sent' : 'Unread'}
                              className={css._ftch}
                              // aria-description={isSeen ? seenBy : undefined}
                            >
                              {isSeen ? <DoubleCheckIcon size={17} color="#53bdeb" /> : msg.status === 'FAILED' ? <XIcon size={17} color="red" /> : <CheckIcon size={17} />}
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
                        classNames={{ content: 'p-1 h-fit w-48' }}
                        trigger={
                          <ActionOnHovered
                            aria-label="Context menu"
                            withShadow={!msg?.mediaUrl}
                            onContextMenu={onPrevent}
                            visibleFrom={isOwn ? 'left' : 'right'}
                            hovered={hoveredMenu || openMenu}
                            classNames={{ root: css._stmnin }}
                          >
                            <span aria-hidden data-icon="down-context">
                              <ChevronFillIcon size={20} chevron="down" />
                            </span>
                          </ActionOnHovered>
                        }
                        content={<MessageMenu event="click" msg={msg} onOpenChange={setOpenMenu} />}
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
                  hovered={hoveredReacts}
                  classNames={{ root: emoji }}
                >
                  <span aria-hidden data-icon="Sticker">
                    <StickerSmileFillIcon size={20} />
                  </span>
                </ActionOnHovered>
              )}
            </div>

            <Reactions reactions={msg?.reactions} classNames={{ root: reaction }} />
          </div>
          {(openCtx || openMenu) && <span data-focused />}
        </div>
      </article>

      <MessageMenu event="contextmenu" msg={msg} />
    </CtxMenu>
  );
}

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

interface UseMenuMapProps {
  onOpenChange?: (prev: React.SetStateAction<boolean>) => void;
}

function useMenuMap(msg: EnrichedMessage, { onOpenChange }: UseMenuMapProps) {
  const { currentUser, deleteMessage, onReload, retrySend } = useActiveChat();

  const handleCopy = React.useCallback(() => {
    if (msg.body) {
      navigator.clipboard
        .writeText(getSafeInlineText(msg.body))
        .then(() => {
          toast('Text copied to clipboard');
          setTimeout(() => onOpenChange?.(false), 300);
        })
        .catch(err => {
          console.error('Failed to copy: ', err);
        });
    }
  }, [msg.body]);

  const handleSaveMedia = React.useCallback(async () => {
    if (!msg.mediaUrl) return;

    try {
      const response = await fetch(msg.mediaUrl, { mode: 'cors' }); // Pastikan server mendukung CORS
      const blob = await response.blob();

      const fileExtension = msg.mediaUrl.split('.').pop()?.split('?')[0] || 'jpg';
      const fileName = `media-${msg.sender?.username}-${msg.id}-${Date.now()}.${fileExtension}`;

      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => onOpenChange?.(false), 300);

      URL.revokeObjectURL(blobUrl); // Bersihkan URL blob setelah download
    } catch (error) {
      console.error('Gagal menyimpan media:', error);
      alert('Gagal menyimpan media. Coba lagi.');
    }
  }, [msg.mediaUrl]);

  const handleSavePage = React.useCallback(() => {
    const blob = new Blob([document.documentElement.outerHTML], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `page-${Date.now()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => onOpenChange?.(false), 300);
  }, []);

  const handleDelete = React.useCallback(async () => {
    if (msg.senderId !== currentUser?.id) return;

    const confirmDelete = window.confirm('Are you sure you want to delete this message?');
    if (!confirmDelete) return;

    try {
      setTimeout(() => onOpenChange?.(false), 300);
      // await axios.delete(`/api/chats/${chatId}/messages/${msg.id}`);
      deleteMessage(msg.id);
      onReload();
    } catch (_e) {
      console.error('Failed to delete Message', _e);
    }
  }, [msg.id, msg.senderId, currentUser?.id]);

  const handleRetry = React.useCallback(() => {
    if (msg.status !== 'FAILED') return;
    try {
      retrySend(msg);
    } catch (_e) {}
  }, [msg.status, retrySend]);

  const opts = <T,>(params: T, obj: MenuMap) => (params ? [obj] : []);

  const menuMap: MenuMap[] = [
    ...opts(msg.status === 'FAILED', { label: 'Retry', onAction: handleRetry }),
    { label: 'Message info', shortcut: '⌘+I', disabled: true, onAction: () => {} },
    ...opts(msg.mediaUrl, { label: 'Save Media', onAction: handleSaveMedia }),
    { label: 'Reply', shortcut: '⌘+R', disabled: true, onAction: () => {} },
    ...opts(!!msg.body, { label: 'Copy', shortcut: '⌘+P', onAction: handleCopy }),
    { label: 'React', shortcut: '⌘+E', disabled: true, onAction: () => {} },
    { label: 'Forward', shortcut: '⌘+F', disabled: true, onAction: () => {} },
    { label: 'Pin', shortcut: '', disabled: true, onAction: () => {} },
    { label: 'Star', shortcut: '', disabled: true, onAction: () => {} },
    ...opts(msg.senderId === currentUser?.id, { label: 'Delete', variant: 'destructive', onAction: handleDelete }),
    ...opts(false, {
      label: 'More',
      separator: true,
      sub: [
        { label: 'Save Page', shortcut: '⇧⌘+S', onAction: handleSavePage },
        { label: 'Create Shortcut', disabled: true, onAction: () => {} },
        { label: 'Developer', separator: true, disabled: true, onAction: () => {} }
      ]
    })
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
          <CtxMenu.SubContent className="w-40">{renderMenuItems(item.sub, { event: 'contextmenu' })}</CtxMenu.SubContent>
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

interface MenuItemsProps {
  event: 'contextmenu' | 'click';
}

function renderMenuItems(items: MenuMap[], props: MenuItemsProps) {
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

  const { Item, Separator, Sub, SubTrigger, SubContent, Shortcut } = componentMap[props.event];

  return items.flatMap(item => {
    const elements: React.ReactNode[] = [];

    if (item.separator) {
      elements.push(<Separator key={`sep-${item.label}`} />);
    }

    if (item.sub && item.sub.length > 0) {
      elements.push(
        <Sub key={item.label}>
          <SubTrigger>{item.label}</SubTrigger>
          <SubContent className="w-40">{renderMenuItems(item.sub, props)}</SubContent>
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

interface MessageMenuProps extends UseMenuMapProps, MenuItemsProps {
  msg: EnrichedMessage;
}
function MessageMenu({ msg, event, onOpenChange }: MessageMenuProps) {
  const menuMap = useMenuMap(msg, { onOpenChange });

  switch (event) {
    case 'click':
      return renderMenuItems(menuMap, { event: 'click' });

    case 'contextmenu':
      return <CtxMenu.Content className="w-48">{renderMenuItems(menuMap, { event: 'contextmenu' })}</CtxMenu.Content>;

    default:
      return null;
  }
}

interface ReactionsProps {
  reactions?: MessageReaction[] | null;
  classNames?: Partial<Record<'root' | 'button' | 'wrapper' | 'total', string>>;
}
function Reactions(_props: ReactionsProps) {
  const { reactions, classNames } = _props;

  const popup = css._rct__pu;
  const emjwr = css._rct__emj_wr;
  const emjitttl = css._rct__emj_it_ttl;

  const reactionIsDefined = reactions !== null && reactions && reactions?.length > 1;

  const emojiSrc = (key: PositionType) => `url("https://web.whatsapp.com/emoji/v1/16/0/1/sprite/w/40/${key}.webp")`;

  if (!reactions || reactions?.length === 0) return null;

  return (
    <div className={x.cnx(classNames?.root)}>
      <button type="button" role="button" tabIndex={0} className={popup} aria-haspopup="true" aria-label="reaction 👍">
        <motion.div whileHover={{ scale: 1.05 }} className={emjwr}>
          {reactions?.map(reaction => {
            const config = getEmoji(reaction.emoji);
            if (!config) return null;

            return <ReactionItem key={reaction.id} alt={reaction.emoji} src={emojiSrc(config.srcKey)} position={config.position} />;
          })}

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
  const emjit = css._rct__emj_it;
  const emjtr = css._rct__emj_tr;
  const emjim = css._rct__emj_im;

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
