'use client';
import * as React from 'react';
import * as motion from 'motion/react-client';
import { useRouter } from 'next/navigation';
import { Separator } from '../ui/separator';
import { Button } from '../ui/button';
import Image from 'next/image';
import axios from 'axios';
import {
  ArchiveFillIcon,
  ArchiveJunkFillIcon,
  ChevronFillIcon,
  DotsFillIcon,
  ForwardFillIcon,
  PaperPlaneFillIcon,
  PhotoPlusFillIcon,
  ReplyAllFillIcon,
  ReplyFillIcon,
  TrashFillIcon,
  UserFillIcon,
  User2FillIcon,
  User3FillIcon
} from '../icons-fill';
import { Chat } from '@prisma/client';
import { Form, useForm } from '../fields/form';
import { useApp } from '../../contexts/app-provider';
import { SheetsBreakpoint } from '../sheets-breakpoint';
import { pusherClient } from '@/resource/configs/pusher/pusher';
import { formatPrettyDate } from '@/resource/const/times-helper';
import { ChatSchema, ChatValues } from '@/resource/schemas/chat';
import { Message as MessageProp, MinimalAccount } from '@/resource/types/user';
import { useOtherUser, useActiveChat } from './chat-context';
import { formatDayLabel, groupMessagesByDate } from './messages/helper';
import { useIsMobile } from '@/resource/hooks/use-device-query';
import { InlineEditor } from '../inline-editor/inline-editor';
import { DateDivider } from './messages/date-divider';
import { MessageBubble } from './messages/message-bubble';
import { ChatAvatars } from './chat-avatar';
import { find, debounce } from 'lodash';
import { AlertModal } from '../alert';
import { toast } from 'sonner';
import { cn } from 'cn';
import { useOnlinePresence } from './chat-hooks';

const ICON_SIZE: number = 20;

export type ChatHeaderProps = Pick<GroupProfileProps, 'chat'>;

export function ChatHeader({ chat }: ChatHeaderProps) {
  const otherUser = useOtherUser(chat);
  const isMediaQuery = useIsMobile();

  const [confirm, onConfirm] = React.useState(false);

  const { members } = useActiveChat();

  const { isOnline } = useOnlinePresence();

  const isActive = members.indexOf(otherUser?.email!) !== -1;

  const statusText = React.useMemo(() => {
    if (chat?.type === 'GROUP') return `${chat?.users.length} members`;
    if ((otherUser && isOnline(otherUser?.id)) || isActive) return 'Online';
    return 'Offline';
  }, [chat, otherUser?.id, isOnline, isActive]);

  const sheetsContent = <GroupProfile chat={chat} confirm={confirm} onConfirm={() => onConfirm(true)} />;

  return (
    <>
      <DeleteGroupAlert confirm={confirm} onConfirm={onConfirm} />

      <div className="relative z-[8] border-b p-2 flex items-center bg-background-theme [&>*>button]:rounded-full">
        <div className="flex items-center gap-1">
          <div className="flex gap-3 items-center">
            {otherUser && chat?.userIds && <SheetsBreakpoint openWith="drawer" trigger={<ChatAvatars data={chat} otherUser={otherUser} />} content={sheetsContent} />}
            <div className="flex flex-col">
              <h4 className="text-sm font-semibold">{chat?.name || otherUser?.name}</h4>
              <p className="text-xs font-light text-neutral-500">{statusText}</p>
            </div>
          </div>

          {!isMediaQuery && (
            <>
              <Separator orientation="vertical" className="mx-1 h-6 max-md:hidden max-md:sr-only" />
              <Button variant="ghost" size="icon" disabled={!chat} className="max-md:hidden max-md:sr-only">
                <ReplyFillIcon size={ICON_SIZE} />
                <span className="sr-only">Reply</span>
              </Button>

              <Button variant="ghost" size="icon" disabled={!chat} className="max-md:hidden max-md:sr-only">
                <ReplyAllFillIcon size={ICON_SIZE} />
                <span className="sr-only">Reply all</span>
              </Button>

              <Button variant="ghost" size="icon" disabled={!chat} className="max-md:hidden max-md:sr-only">
                <ForwardFillIcon size={ICON_SIZE} />
                <span className="sr-only">Forward</span>
              </Button>

              <Separator orientation="vertical" className="mx-1 h-6 max-md:hidden max-md:sr-only" />
            </>
          )}

          {/* <Tooltip>
        <Popover>
          <PopoverTrigger asChild>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!chat}>
                <Clock  size={ICON_SIZE} />
                <span className="sr-only">Snooze</span>
              </Button>
            </TooltipTrigger>
          </PopoverTrigger>
          <PopoverContent className="flex w-[535px] p-0">
            <div className="flex flex-col gap-2 border-r px-2 py-4">
              <div className="px-4 text-sm font-medium">Snooze until</div>
              <div className="grid min-w-[250px] gap-1">
                <Button variant="ghost" className="justify-start font-normal">
                  Later today <span className="ml-auto text-muted-foreground">{format(addHours(today, 4), 'E, h:m b')}</span>
                </Button>
                <Button variant="ghost" className="justify-start font-normal">
                  Tomorrow
                  <span className="ml-auto text-muted-foreground">{format(addDays(today, 1), 'E, h:m b')}</span>
                </Button>
                <Button variant="ghost" className="justify-start font-normal">
                  This weekend
                  <span className="ml-auto text-muted-foreground">{format(nextSaturday(today), 'E, h:m b')}</span>
                </Button>
                <Button variant="ghost" className="justify-start font-normal">
                  Next week
                  <span className="ml-auto text-muted-foreground">{format(addDays(today, 7), 'E, h:m b')}</span>
                </Button>
              </div>
            </div>
            <div className="p-2">
              <Calendar />
            </div>
          </PopoverContent>
        </Popover>
        <TooltipContent>Snooze</TooltipContent>
      </Tooltip> */}
        </div>

        {!isMediaQuery && (
          <div className="ml-auto flex items-center gap-1 max-md:hidden max-md:sr-only">
            <Button variant="ghost" size="icon" disabled={!chat} className="max-md:hidden max-md:sr-only">
              <ArchiveFillIcon size={ICON_SIZE} />
              <span className="sr-only">Archive</span>
            </Button>
            <Button variant="ghost" size="icon" disabled={!chat} className="max-md:hidden max-md:sr-only">
              <ArchiveJunkFillIcon size={ICON_SIZE} />
              <span className="sr-only">Move to junk</span>
            </Button>
            <Button variant="ghost" size="icon" disabled={!chat} className="max-md:hidden max-md:sr-only" onClick={() => onConfirm(true)}>
              <TrashFillIcon size={ICON_SIZE} />
              <span className="sr-only">Move to trash</span>
            </Button>
          </div>
        )}
        <Separator orientation="vertical" className="mx-2 h-6 max-md:ml-auto rtl:max-md:mr-auto" />

        <SheetsBreakpoint
          openWith="drawer"
          trigger={
            <Button variant="ghost" size="icon" className="group rounded-full">
              <DotsFillIcon size={ICON_SIZE} />
            </Button>
          }
          content={sheetsContent}
        />
        {/* <Dropdown>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" disabled={!mail}>
          <MoreVertical  size={ICON_SIZE} />
          <span className="sr-only">More</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>Mark as unread</DropdownMenuItem>
        <DropdownMenuItem>Star thread</DropdownMenuItem>
        <DropdownMenuItem>Add label</DropdownMenuItem>
        <DropdownMenuItem>Mute thread</DropdownMenuItem>
      </DropdownMenuContent>
    </Dropdown> */}
      </div>
    </>
  );
}

interface GroupProfileProps extends DeleteGroupAlertProps {
  chat: (Chat & { users: MinimalAccount[] }) | undefined;
}

function GroupProfile({ chat: data, confirm, onConfirm }: GroupProfileProps) {
  if (!data) return null;

  const otherUser = useOtherUser(data);

  const isGroup = data.type === 'GROUP';

  const joinedDate = React.useMemo(() => {
    return formatPrettyDate(new Date(otherUser?.createdAt ?? Date.now()));
  }, [otherUser?.createdAt]);

  const title = React.useMemo(() => {
    return data.name || otherUser?.name;
  }, [data.name, otherUser?.name]);

  const { members } = useActiveChat();
  const isActive = members.indexOf(otherUser?.email!) !== -1;

  const statusText = React.useMemo(() => {
    if (isGroup) {
      return `${data.users.length} members`;
    }
    return isActive ? 'Active' : 'Offline';
  }, [data, isActive]);

  return (
    <>
      <div className="relative mt-6 flex-1 px-4 sm:px-6">
        <div className="flex flex-col items-center">
          <p className="font-semibold">{title}</p>
          <div className="mt-4 mb-2">
            <ChatAvatars data={data} otherUser={otherUser} />
          </div>
          <div className="text-sm text-muted-foreground">{statusText}</div>
          <div className="flex gap-10 my-8">
            <div onClick={() => onConfirm(true)} className="flex flex-col gap-1 items-center cursor-pointer hover:opacity-75 rounded-full text-white">
              <TrashFillIcon size={20} />
              <span className="text-xs font-light text-muted-foreground">Delete</span>
            </div>
          </div>
          <div className="w-full pb-5 pt-5 sm:px-0 sm:pt-0">
            <dl className="space-y-8 px-4 sm:space-y-6 sm:px-6">
              {isGroup && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground sm:w-40 sm:flex-shrink-0">Members</dt>
                  <dd className="mt-1 text-sm text-muted-foreground sm:col-span-2">{data.users.map(user => user?.name).join(', ')}</dd>
                </div>
              )}
              {!isGroup && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground sm:w-40 sm:flex-shrink-0">Email</dt>
                  <dd className="mt-1 text-sm text-muted-foreground sm:col-span-2">{otherUser?.email}</dd>
                </div>
              )}
              {!isGroup && (
                <>
                  <div className="h-px border-t w-full" />
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground sm:w-40 sm:flex-shrink-0">Joined</dt>
                    <dd className="mt-1 text-sm text-muted-foreground sm:col-span-2">
                      <time dateTime={joinedDate}>{joinedDate}</time>
                    </dd>
                  </div>
                </>
              )}
            </dl>
          </div>
        </div>
      </div>
    </>
  );
}

interface DeleteGroupAlertProps {
  confirm: boolean;
  onConfirm: (value: React.SetStateAction<boolean>) => void;
  url?: string;
}

export function DeleteGroupAlert({ confirm, onConfirm, url }: DeleteGroupAlertProps) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const { slug: chatId } = useActiveChat();

  const onDelete = React.useCallback(() => {
    setLoading(true);
    axios
      .delete(url || `/api/chats/${chatId}`)
      .then(() => {
        onConfirm(false);
        router.push('/chat');
        router.refresh();
      })
      .catch(() => toast.error('Something went wrong!'))
      .finally(() => {
        setLoading(false);
        router.refresh();
      });
  }, [router, chatId, url]);

  return (
    <AlertModal
      open={confirm}
      onOpenChange={onConfirm}
      disabled={loading}
      onConfirm={onDelete}
      title="Delete Group"
      description="Are you sure you want to delete this conversation? This action cannot be undone."
      classNames={{
        overlay: 'dark:bg-[#111b21fa]',
        content: 'dark:bg-[#182229] rounded-[28px] max-sm:rounded-[28px]',
        onCancle: 'rounded-full bg-transparent transition-colors text-muted-foreground hover:text-color',
        onConfirm: 'rounded-full bg-transparent transition-colors border text-red-500 hover:text-black'
      }}
    />
  );
}

interface ChatSubscriptionProps {
  data: MessageProp[];
  targetRef: React.RefObject<HTMLDivElement>;
  chatId: string | null | undefined;
}
interface ChatSubscriptionProps {
  chatId: string | null | undefined;
  data: MessageProp[];
  userId: string | undefined;
  key: number;
  // refs: React.RefObject<HTMLElement>[];
  // containerRef: React.RefObject<HTMLElement>;
}

function useChatSubscriptionXX(props: ChatSubscriptionProps) {
  const { data, chatId, targetRef, userId } = props;
  const [messages, setMessages] = React.useState(data);

  const lastMessage = data?.[data.length - 1];

  // Ambil semua message yang belum dilihat oleh current user
  // const unseenMessages = messages.filter(m => !m.seenIds?.includes(userId!));

  // React.useEffect(() => {
  //   if (!chatId || prevent) return;

  //   const observers: IntersectionObserver[] = [];

  //   unseenMessages.forEach(msg => {
  //     const el = document.getElementById(`message-${msg.id}`);
  //     if (!el) return;

  //     const observer = new IntersectionObserver(
  //       ([entry]) => {
  //         if (entry.isIntersecting) {
  //           markAsSeen(msg.id);
  //         }
  //       },
  //       { threshold: 1.0 }
  //     );

  //     observer.observe(el);
  //     observers.push(observer);
  //   });

  //   return () => {
  //     observers.forEach(observer => observer.disconnect());
  //   };
  // }, [chatId, unseenMessages]);

  const seenMap = React.useRef(new Set<string>()); // simpan ID yang sudah dikirim seen

  const markAsSeen = debounce((ids: string[]) => {
    if (!chatId || ids.length === 0) return;
    axios.post(`/api/chats/${chatId}/seen`, { seenIds: ids });
  }, 300);

  React.useEffect(() => {
    if (!chatId) return;

    const observer = new IntersectionObserver(
      entries => {
        const newlySeenIds: string[] = [];

        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          const messageId = el.dataset.messageId;
          if (!messageId) continue;

          if (entry.isIntersecting && !seenMap.current.has(messageId)) {
            seenMap.current.add(messageId);
            newlySeenIds.push(messageId);
          }
        }

        if (newlySeenIds.length > 0) {
          markAsSeen(newlySeenIds);
        }
      },
      { threshold: 1 }
    );

    const bubbleEls = document.querySelectorAll('[data-message-id]');
    bubbleEls.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [chatId, messages]);

  React.useEffect(() => {
    if (!chatId) return;

    pusherClient.subscribe(chatId);

    const handleNew = (message: MessageProp) => {
      setMessages(current => {
        if (find(current, { id: message.id })) return current;
        return [...current, message];
      });
    };

    const handleUpdate = (newMessage: MessageProp) => {
      setMessages(current => current.map(m => (m.id === newMessage.id ? newMessage : m)));
    };

    pusherClient.bind('messages:new', handleNew);
    pusherClient.bind('message:update', handleUpdate);

    return () => {
      pusherClient.unsubscribe(chatId);
      pusherClient.unbind('messages:new', handleNew);
      pusherClient.unbind('message:update', handleUpdate);
    };
  }, [chatId]);

  return messages;
}

function preventedMessage(messages: Array<MessageProp>, userId: string | undefined) {
  const lastMessage = messages?.[messages.length - 1];

  const unseenMessages = messages.map(i => ({
    // body: i.body,
    // seenIds: i.seenIds,
    isLastMessage: i.id === lastMessage?.id,
    hasUserId: i.seenIds?.includes(userId!),
    isFromCurrentUser: i.senderId === userId
  }));

  const isMessages = messages && messages?.length > 0;

  const isPrevent = unseenMessages.some(msg => msg.isFromCurrentUser || msg.hasUserId);

  return { lastMessage, isPrevent, isMessages };
}

function useChatSubscription(props: ChatSubscriptionProps) {
  const { data, chatId, targetRef, userId, key } = props;
  const [messages, setMessages] = React.useState(data);

  const { isPrevent, lastMessage, ...rest } = preventedMessage(messages, userId);

  const markAsSeen = React.useCallback(
    debounce((messageId: string) => {
      axios.post(`/api/chats/${chatId}/seen`, { messageId });
    }, 500),
    []
  );

  // 👁️ Intersection observer to mark as seen
  React.useEffect(() => {
    if (!targetRef.current || !chatId || !lastMessage?.id || isPrevent) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) markAsSeen(lastMessage.id); // kirim ID terakhir
      },
      { threshold: 0.8 } // hanya saat 100% terlihat
    );

    observer.observe(targetRef.current);

    return () => observer.disconnect();
  }, [chatId, lastMessage?.id]);

  // 🔔 Realtime pusher events
  React.useEffect(() => {
    if (!chatId || isPrevent) return;

    pusherClient.subscribe(chatId);

    const handleNew = (message: MessageProp) => {
      setMessages(current => {
        if (find(current, { id: message.id })) return current;
        return [...current, message];
      });
    };

    const handleUpdate = (newMessage: MessageProp) => {
      setMessages(current => current.map(m => (m.id === newMessage.id ? newMessage : m)));
    };

    pusherClient.bind('messages:new', handleNew);
    pusherClient.bind('message:update', handleUpdate);

    return () => {
      pusherClient.unsubscribe(chatId);
      pusherClient.unbind('messages:new', handleNew);
      pusherClient.unbind('message:update', handleUpdate);
    };
  }, [chatId, key]);

  return { messages, isPrevent, lastMessage, ...rest };
}

export interface ChatBodyProps {
  messages: MessageProp[];
  members?: (MinimalAccount | null)[] | null | undefined;
}
export function ChatBody({ messages: initialMessages = [], members }: ChatBodyProps) {
  const { user } = useApp();

  const { scrollableRef, targetRef, slug: chatId, key } = useActiveChat();

  const { messages } = useChatSubscription({ data: initialMessages, chatId, targetRef, userId: user?.id, key });

  const { byDate, dateKeys, lastMessage } = groupMessagesByDate(messages, user!!);

  // const bubleRef = React.useRef<HTMLDivElement>(null);

  // const seenMessageIds = React.useRef<Set<string>>(new Set());
  // const messageRefs = React.useRef<MessageProp[]>([]);
  const [inViewMap, setInViewMap] = React.useState<boolean[]>([]);

  const refs = React.useMemo(() => messages.map(() => React.createRef<HTMLDivElement>()), [messages]);

  React.useEffect(() => {
    const scrollContainer = scrollableRef.current;
    if (!scrollContainer) return;

    const observers: IntersectionObserver[] = [];
    const inViewStatus = Array(refs.length).fill(false);

    refs.forEach((ref, index) => {
      if (!ref.current) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          inViewStatus[index] = entry.isIntersecting;
          setInViewMap([...inViewStatus]); // Trigger re-render with new state
        },
        {
          root: scrollContainer,
          threshold: 1.0 // Trigger when 100% is visible
        }
      );

      observer.observe(ref.current);
      observers.push(observer);
    });

    return () => {
      observers.forEach(observer => observer.disconnect());
    };
  }, [refs, scrollableRef]);

  /**
  React.useEffect(() => {
    if (!chatId) return;
    axios.post(`/api/chats/${chatId}/seen`);
  }, [chatId]);

  React.useEffect(() => {
    pusherClient.subscribe(chatId);
    bottomRef?.current?.scrollIntoView();

    const messageHandler = (message: MessageProp) => {
      if (!chatId) return;
      axios.post(`/api/chats/${chatId}/seen`);

      setMessages(current => {
        if (find(current, { id: message.id })) return current;
        return [...current, message];
      });

      bottomRef?.current?.scrollIntoView();
    };

    const updateMessageHandler = (newMessage: MessageProp) => {
      setMessages(current =>
        current.map(currentMessage => {
          if (currentMessage.id === newMessage.id) return newMessage;
          return currentMessage;
        })
      );
    };

    pusherClient.bind('messages:new', messageHandler);
    pusherClient.bind('message:update', updateMessageHandler);

    return () => {
      if (chatId) pusherClient.unsubscribe(chatId);
      pusherClient.unbind('messages:new', messageHandler);
      pusherClient.unbind('message:update', updateMessageHandler);
    };
  }, [chatId]);
 */

  // React.useEffect(() => {
  //   if (isPrevent) {
  //     targetRef?.current?.scrollIntoView({ behavior: 'smooth' });
  //   }
  // }, [isPrevent, targetRef?.current, messages.length]);

  return (
    <div className="relative h-full contents overflow-y-auto">
      <div ref={scrollableRef} className="overflow-y-auto flex-1">
        {/* {messages?.map((message, i) => (
          <MessageBubble key={message.id} index={i} dataLength={messages.length} ref={i === messages.length - 1 ? targetRef : undefined} user={user} data={message} />
        ))} */}
        {/* ref={lastMessage?.id === msg.id ? (msg.senderId === user?.id ? bottomRef : targetRef) : undefined} */}
        {dateKeys.map(date => (
          <React.Fragment key={date}>
            <DateDivider date={formatDayLabel(date, { options: { dateStyle: 'short' } })} count={byDate[date].count} />
            {byDate[date].messages.map((msg, i) => (
              <MessageBubble
                key={msg.id}
                data={msg}
                members={members}
                // id={`msg-${msg.id}`}
                // data-message-id={msg.id}
                // targetRef={msg.senderId === user?.id ? null : targetRef}
                // targetRef={lastMessage?.senderId !== user?.id ? (msg.senderId === user?.id ? null : targetRef) : null}
                // ref={lastMessage?.id === msg.id ? (msg.senderId === user?.id ? bottomRef : targetRef) : undefined}
                targetRef={targetRef}
                lastMessage={lastMessage}
                ref={refs[i]}
                isInView={inViewMap[i] ? true : undefined}
              />
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

interface ChatFormProps {
  messages: MessageProp[];
  members?: (MinimalAccount | null)[] | null | undefined;
}
export function ChatForm({ messages, members: initialMembers }: ChatFormProps) {
  const { scrollIntoView, isInView, onReload, slug: chatId } = useActiveChat();

  const { form, router } = useForm<ChatValues>({
    schema: ChatSchema,
    defaultValues: {
      message: '',
      mediaUrl: undefined,
      chatId: ''
    }
  });

  const isMessages = messages && messages?.length > 0;

  const isMessage = (form.watch('message') === undefined && form.watch('message')?.trim() === '') || (form.watch('mediaUrl') === undefined && form.watch('mediaUrl')?.trim() === '');

  function onSubmit(data: ChatValues) {
    if ((!data.message && !data.mediaUrl) || (data.message && data.message?.trim() === '') || (data.mediaUrl && data.mediaUrl?.trim() === '')) return;

    try {
      axios.post('/api/chats/messages', {
        ...data,
        chatId: chatId
      });
      form.reset();
      onReload();
    } catch (error: any) {
      console.log('Error:', error.message);
    }
  }

  const members = React.useMemo(() => (initialMembers ?? [])?.map(member => ({ id: member?.refId!, name: member?.username!, image: member?.image })), [initialMembers]);

  return (
    <Form.Provider {...form}>
      <Form onSubmit={form.handleSubmit(onSubmit)} className="bg-background-theme flex flex-col max-h-[35%] w-full border-t [--inset-x:0.75rem] [--inset-b:0.75rem]">
        {isMessages && <ScrollToBottom visible={!isInView} onClick={() => scrollIntoView()} />}

        {/* <CldUploadButton
          options={{ maxFiles: 1 }}
          onSuccess={handleUpload}
          uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
          className="text-muted-foreground hover:text-color transition-colors z-[9] cursor-pointer absolute bottom-[var(--inset-b)] left-[var(--inset-x)]"
        >
          <PhotoPlusFillIcon size={24} />
        </CldUploadButton> */}

        <Form.Field
          control={form.control}
          name="mediaUrl"
          render={({ field }) => {
            if (!field.value) return <React.Fragment />;
            return (
              <div className="relative size-full max-w-full">
                <Image fill alt=" " sizes="600" src={field.value} className="object-cover align-middle rounded-[inherit] overflow-hidden" />
              </div>
            );
          }}
        />

        {/* <Form.Field
          control={form.control}
          name="message"
          render={({ field }) => (
            <Textarea
              className={cn('bg-transparent h-auto min-h-9 resize-none w-full my-0 pb-10 leading-normal rounded-none focus-visible:ring-0 border-0')}
              placeholder="Write a message"
              {...field}
            />
          )}
        /> */}

        <Form.Field
          control={form.control}
          name="message"
          render={({ field }) => {
            return (
              <InlineEditor
                dir="ltr"
                placeholder="Type a message"
                users={members}
                {...field}
                // value={`_text italic_ *text bold* _*italic and bold*_\n\`\`\`\nconstructor(props) {\n  super(props)\n\n  this.state = {\n\n  }\n\n  this.handleEvent = this.handleEvent.bind(this)\n  }\n\`\`\`\n> blockQuotes\u200B> xxx\n\n\n`}
                onChange={i => {
                  // console.log('[VALUE]:', JSON.stringify(i));
                  field.onChange(i);
                }}
                classNames={{
                  root: 'px-3 mt-2 overflow-y-auto min-h-20 max-h-[calc(100%-(0.5rem+3.5rem))]',
                  editor: 'my-0 w-full max-w-full text-sm md:text-[15px] bg-transparent h-auto resize-none leading-normal rounded-none border-0'
                }}
              />
            );
          }}
        />

        <div className="relative w-full flex flex-row items-center justify-between px-[var(--inset-x)] pt-[calc(var(--inset-b)/2)] pb-[var(--inset-b)]">
          <Form.Field
            control={form.control}
            name="mediaUrl"
            render={({ field }) => {
              if (field.value) return <React.Fragment />;
              return (
                <Form.UnstyledAvatarField uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET} value={field.value} onChange={url => field.onChange(url)}>
                  {({ open }) => {
                    return (
                      <button
                        type="button"
                        role="button"
                        tabIndex={-1}
                        onClick={() => open()}
                        className="bg-background-theme/70 backdrop-blur rounded-full p-2 text-muted-foreground hover:text-color transition-colors z-[9] cursor-pointer focus-visible:outline-0 focus-visible:ring-0 focus-visible:border-0"
                      >
                        <PhotoPlusFillIcon size={24} />
                        <span className="hidden sr-only">Upload Image</span>
                      </button>
                    );
                  }}
                </Form.UnstyledAvatarField>
              );
            }}
          />

          <button
            type="submit"
            role="button"
            tabIndex={0}
            disabled={isMessage}
            className="bg-background-theme/70 backdrop-blur rounded-full p-2 text-color hover:text-color transition-colors z-[9] cursor-pointer disabled:text-color/50 focus-visible:text-cyan-600"
          >
            <PaperPlaneFillIcon size={24} />
            <span className="hidden sr-only">Send Message</span>
          </button>
        </div>
      </Form>
    </Form.Provider>
  );
}

interface ChatBackgroundProps extends React.ComponentProps<'div'> {
  visible?: boolean | null;
  style?: React.CSSProperties & Record<string, any>;
}
export function ChatBackground(_props: ChatBackgroundProps) {
  const { visible, className, style, ...props } = _props;

  return (
    <div
      {...props}
      className={cn('size-full top-0 left-0 absolute bg-repeat bg-[#efeae2] dark:opacity-[0.06] dark:bg-background-theme', className)}
      {...{ style: { backgroundImage: 'url(/images/message-bg.png)', ...style } }}
    />
  );
}

interface ScrollToBottomProps extends React.ComponentPropsWithRef<typeof motion.div> {
  visible?: boolean;
}
function ScrollToBottom(_props: ScrollToBottomProps) {
  const { visible, ...props } = _props;
  return (
    <motion.div
      {...props}
      role="button"
      whileHover={visible ? { scale: 1.15 } : {}}
      animate={visible ? { scale: 1 } : { scale: 0 }}
      aria-label="Scroll To Bottom"
      className="[--sz:42px] size-[--sz] min-h-[--sz] min-w-[--sz] max-h-[--sz] max-w-[--sz] rounded-full centered absolute right-[11px] top-[calc((70px+17px)*-0.75)] z-[20] bg-muted dark:bg-[#182229] text-muted-foreground"
      onContextMenu={e => e.preventDefault()}
    >
      <ChevronFillIcon chevron="down" size={32} />
    </motion.div>
  );
}
