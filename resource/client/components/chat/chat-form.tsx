'use client';
import * as React from 'react';
import Image from 'next/image';
import axios from 'axios';
import { PaperPlaneFillIcon, PhotoPlusFillIcon } from '../icons-fill';
import { Message as MessageProp, MinimalAccount } from '@/resource/types/user';
import { ChatSchema, ChatValues } from '@/resource/schemas/chat';
import { InlineEditor } from '../inline-editor/inline-editor';
import { Form, useForm } from '../fields/form';
import { useActiveChat } from './chat-context';
import { ChatScrollBotton } from './chat-components';

interface ChatFormProps {
  messages: MessageProp[];
  members?: (MinimalAccount | null)[] | null | undefined;
}
export function ChatForm({ messages, members: initialMembers }: ChatFormProps) {
  const { scrollIntoView, isInView, onReload, slug: chatId } = useActiveChat();

  const { form } = useForm<ChatValues>({
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
        {isMessages && <ChatScrollBotton visible={!isInView} onClick={() => scrollIntoView()} />}

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
            className="ml-auto bg-background-theme/70 backdrop-blur rounded-full p-2 text-color hover:text-color transition-colors z-[9] cursor-pointer disabled:text-color/50 focus-visible:text-cyan-600"
          >
            <PaperPlaneFillIcon size={24} />
            <span className="hidden sr-only">Send Message</span>
          </button>
        </div>
      </Form>
    </Form.Provider>
  );
}
