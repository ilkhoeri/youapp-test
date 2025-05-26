'use client';
import * as React from 'react';
import Link from 'next/link';
import axios from 'axios';
import { Chat } from '@prisma/client';
import { Account, AllMessageProps } from '@/resource/types/user';
import { useChat, useOtherUser } from '@/resource/client/components/chat/chat';
import { Avatar } from '@/resource/client/components/ui/avatar-oeri';
import { ChevronIcon, DoubleCheckIcon, PhotoCirclePlusIcon, XIcon } from '@/resource/client/components/icons';
import { DotsFillIcon, PaperPlaneFillIcon, TrashFillIcon } from '@/resource/client/components/icons-fill';
import { Button } from '@/resource/client/components/ui/button';
import { useActiveList } from './active-list';
import { pusherClient } from '@/resource/server/messages/pusher';
import { find } from 'lodash';
import { CldUploadButton } from 'next-cloudinary';
import { useForm, Form } from '@/resource/client/components/fields/form';
import { ChatSchema, ChatValues } from '@/resource/schemas/chat';
import { useSession } from 'next-auth/react';
import { cn } from 'cn';
import { formatPrettyDate, formatShortTime } from '@/resource/const/times-helper';
import { MotionImage } from '@/resource/client/components/motion/motion-image';
import { MotionCard, MotionCardModal } from '@/resource/client/components/motion/motion-card';
import Image from 'next/image';
import { ChatAvatars } from '@/resource/client/components/chat/component';
import { AlertModal } from '@/resource/client/components/alert';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { MotionButton, MotionButtonModal } from '@/resource/client/components/motion/motion-button';
import { classesInput } from '@/resource/client/components/fields/input';
import { Textarea } from '@/resource/client/components/fields/textarea';
import { SheetsBreakpoint } from '@/resource/client/components/sheets-breakpoint';

interface HeaderProps {
  chat: Chat & {
    users: Account[];
  };
}

export function Header({ chat }: HeaderProps) {
  const otherUser = useOtherUser(chat);
  const [isOpen, setIsOpen] = React.useState(false);

  const { members } = useActiveList();
  const isActive = members.indexOf(otherUser?.email!) !== -1;
  const statusText = React.useMemo(() => {
    if (chat.isGroup) {
      return `${chat.users.length} members`;
    }

    return isActive ? 'Active' : 'Offline';
  }, [chat, isActive]);

  return (
    <>
      <div className="w-full flex border-b-[1px] sm:px-4 py-3 px-4 lg:px-6 justify-between items-center">
        <div className="flex gap-3 items-center">
          <ChatAvatars data={chat} otherUser={otherUser} />

          <div className="flex flex-col">
            <div>{chat?.name || otherUser?.name}</div>
            <div className="text-sm font-light text-neutral-500">{statusText}</div>
          </div>
        </div>

        <SheetsBreakpoint
          openWith="drawer"
          classNames={{}}
          trigger={
            <Button unstyled className="group text-muted-foreground hover:text-color transition-colors" onClick={() => setIsOpen(true)}>
              <DotsFillIcon size={22} />
            </Button>
          }
          content={<GroupProfile data={chat} open={isOpen} onOpenChange={setIsOpen} />}
        />
      </div>
    </>
  );
}

interface GroupProfileProps extends Pick<React.ComponentProps<typeof MotionCardModal>, 'open' | 'onOpenChange'> {
  data: Chat & {
    users: Account[];
  };
}

function GroupProfile({ data, open, onOpenChange }: GroupProfileProps) {
  const [confirm, setConfirm] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const otherUser = useOtherUser(data);
  const chat = useChat();
  const router = useRouter();

  const joinedDate = React.useMemo(() => {
    return formatPrettyDate(new Date(otherUser?.createdAt ?? Date.now()));
  }, [otherUser?.createdAt]);

  const title = React.useMemo(() => {
    return data.name || otherUser?.name;
  }, [data.name, otherUser?.name]);

  const { members } = useActiveList();
  const isActive = members.indexOf(otherUser?.email!) !== -1;

  const statusText = React.useMemo(() => {
    if (data.isGroup) {
      return `${data.users.length} members`;
    }
    return isActive ? 'Active' : 'Offline';
  }, [data, isActive]);

  const onDelete = React.useCallback(() => {
    setLoading(true);

    axios
      .delete(`/api/chats/${chat.chatId}`)
      .then(() => {
        setConfirm(false);
        router.push('/chats');
        router.refresh();
      })
      .catch(() => toast.error('Something went wrong!'))
      .finally(() => setLoading(false));
  }, [router, chat.chatId]);

  return (
    <>
      <AlertModal
        open={confirm}
        onOpenChange={setConfirm}
        disabled={loading}
        onConfirm={onDelete}
        title="Delete conversation"
        description="Are you sure you want to delete this conversation? This action cannot be undone."
      />

      <div className="relative mt-6 flex-1 px-4 sm:px-6">
        <div className="flex flex-col items-center">
          <div className="mb-2">
            <ChatAvatars data={data} otherUser={otherUser} />
          </div>
          <div>{title}</div>
          <div className="text-sm text-muted-foreground">{statusText}</div>
          <div className="flex gap-10 my-8">
            <div onClick={() => setConfirm(true)} className="flex flex-col gap-1 items-center cursor-pointer hover:opacity-75 rounded-full text-white">
              <TrashFillIcon size={20} />
              <span className="text-xs font-light text-muted-foreground">Delete</span>
            </div>
          </div>
          <div className="w-full pb-5 pt-5 sm:px-0 sm:pt-0">
            <dl className="space-y-8 px-4 sm:space-y-6 sm:px-6">
              {data.isGroup && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground sm:w-40 sm:flex-shrink-0">Member Emails</dt>
                  <dd className="mt-1 text-sm text-muted-foreground sm:col-span-2">{data.users.map(user => user?.email).join(', ')}</dd>
                </div>
              )}
              {!data.isGroup && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground sm:w-40 sm:flex-shrink-0">Email</dt>
                  <dd className="mt-1 text-sm text-muted-foreground sm:col-span-2">{otherUser?.email}</dd>
                </div>
              )}
              {!data.isGroup && (
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

interface BodyProps {
  initialMessages: AllMessageProps[];
}
export function Body({ initialMessages = [] }: BodyProps) {
  const bottomRef = React.useRef<HTMLDivElement>(null);
  const [messages, setMessages] = React.useState(initialMessages);

  const { chatId } = useChat();

  React.useEffect(() => {
    axios.post(`/api/chats/${chatId}/seen`);
  }, [chatId]);

  React.useEffect(() => {
    pusherClient.subscribe(chatId);
    bottomRef?.current?.scrollIntoView();

    const messageHandler = (message: AllMessageProps) => {
      axios.post(`/api/chats/${chatId}/seen`);

      setMessages(current => {
        if (find(current, { id: message.id })) {
          return current;
        }

        return [...current, message];
      });

      bottomRef?.current?.scrollIntoView();
    };

    const updateMessageHandler = (newMessage: AllMessageProps) => {
      setMessages(current =>
        current.map(currentMessage => {
          if (currentMessage.id === newMessage.id) {
            return newMessage;
          }

          return currentMessage;
        })
      );
    };

    pusherClient.bind('messages:new', messageHandler);
    pusherClient.bind('message:update', updateMessageHandler);

    return () => {
      pusherClient.unsubscribe(chatId);
      pusherClient.unbind('messages:new', messageHandler);
      pusherClient.unbind('message:update', updateMessageHandler);
    };
  }, [chatId]);

  return (
    <div className="flex-1 overflow-y-auto">
      {messages.map((message, i) => (
        <MessageBox isLast={i === messages.length - 1} key={message.id} data={message} />
      ))}
      <div className="pt-24" ref={bottomRef} />
    </div>
  );
}

export function ChatForm() {
  const { chatId } = useChat();

  const { form } = useForm<ChatValues>({
    schema: ChatSchema,
    defaultValues: {
      message: '',
      image: undefined,
      chatId: ''
    }
  });

  function onSubmit(data: ChatValues) {
    // form.setValue('message', '', { shouldValidate: true });

    try {
      axios.post('/api/chats/messages', {
        ...data,
        chatId: chatId
      });
      form.reset();
    } catch (error: any) {
      console.log('Error:', error.message);
    }
  }

  const handleUpload = (result: any) => {
    axios.post('/api/chats/messages', {
      image: result.info.secure_url,
      chatId: chatId
    });
  };

  return (
    <Form.Provider {...form}>
      <Form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-2 lg:gap-4 w-full py-4 border-t [--inset-x:0.75rem] [--inset-b:1.75rem]">
        <CldUploadButton
          options={{ maxFiles: 1 }}
          onSuccess={handleUpload}
          uploadPreset="upload_default"
          className="text-muted-foreground hover:text-color transition-colors z-[9] cursor-pointer absolute bottom-[var(--inset-b)] left-[var(--inset-x)]"
        >
          <PhotoCirclePlusIcon size={24} />
        </CldUploadButton>

        <Form.Field
          control={form.control}
          name="message"
          render={({ field }) => (
            <Textarea
              className={cn(classesInput({ variant: 'filled' }), 'h-auto min-h-9 resize-none w-full my-0 pb-10 leading-normal rounded-2xl')}
              placeholder="Write a message"
              {...field}
            />
          )}
        />

        <Button type="submit" unstyled className="text-muted-foreground hover:text-color transition-colors z-[9] cursor-pointer absolute bottom-[var(--inset-b)] right-[var(--inset-x)]">
          <PaperPlaneFillIcon size={24} />
        </Button>
      </Form>
    </Form.Provider>
  );
}

interface MessageBoxProps {
  data: AllMessageProps;
  isLast?: boolean;
}

function MessageBox({ data, isLast }: MessageBoxProps) {
  const session = useSession();
  const [imageModalOpen, setImageModalOpen] = React.useState(false);

  const isOwn = session.data?.user?.email === data?.sender?.email;
  const seenList = (data.seen || [])
    .filter(user => user.email !== data?.sender?.email)
    .map(user => user.name)
    .join(', ');

  const container = cn('flex gap-3 p-4', isOwn && 'justify-end');
  const avatar = cn(isOwn && 'order-2');
  const body = cn('flex flex-col gap-2', isOwn && 'items-end');
  const message = cn('text-sm w-fit overflow-hidden', isOwn ? 'bg-sky-500 text-white' : 'bg-gray-100', data.image ? 'rounded-md p-0' : 'rounded-full py-2 px-3');

  return (
    <div className={container}>
      <div className={avatar}>
        <Avatar src={data.sender?.image} fallback={data.sender.name} />
      </div>
      <div className={body}>
        <div className="flex items-center gap-1">
          <div className="text-sm text-gray-500">{data.sender.name}</div>
          <div className="text-xs text-gray-400">{formatShortTime(new Date(data.createdAt))}</div>
        </div>
        <div className={message}>
          {data.image ? (
            <MotionImage src={data.image} name={data.id} classNames={{ container: '[--sz:57px] size-[var(--sz)] min-h-[var(--sz)] min-w-[var(--sz)] rounded-[17px]' }} />
          ) : (
            <div>{data.body}</div>
          )}
        </div>
        {isLast && isOwn && seenList.length > 0 && (
          <div className="flex items-end flex-row gap-1 text-[11px] font-light text-gray-500 -mt-2">
            <DoubleCheckIcon size={17} className="text-green-500" /> {`Seen by ${seenList}`}
          </div>
        )}
      </div>
    </div>
  );
}
