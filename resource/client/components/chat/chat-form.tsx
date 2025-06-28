'use client';
import * as React from 'react';
import Image from 'next/image';
import { Form, useForm } from '../fields/form';
import { useActiveChat } from './chat-context';
import { SendMessage } from '@/resource/schemas/chat';
import { MinimalAccount } from '@/resource/types/user';
import { InlineEditor } from '../inline-editor/inline-editor';
import { PaperPlaneFillIcon, PhotoPlusFillIcon } from '../icons-fill';

export function ChatForm() {
  const { sendMessage, otherUsers, onReload } = useActiveChat();

  const { form } = useForm<SendMessage>({
    schema: SendMessage,
    defaultValues: {
      body: '',
      mediaUrl: undefined,
      type: 'TEXT'
    }
  });

  const isMessage = (form.watch('body') === undefined && form.watch('body')?.trim() === '') || (form.watch('mediaUrl') === undefined && form.watch('mediaUrl')?.trim() === '');

  function onSubmit(data: SendMessage) {
    if ((!data.body && !data.mediaUrl) || (data.body && data.body?.trim() === '') || (data.mediaUrl && data.mediaUrl?.trim() === '')) return;
    try {
      // axios.post(`/api/chats/${chatId}/messages`, {
      //   ...data,
      //   chatId: chatId
      // });
      sendMessage({ body: data.body?.replace(/\u200B/g, '')?.trim(), mediaUrl: data.mediaUrl });
      form.reset();
      onReload();
    } catch (error: any) {
      console.log('Error:', error.message);
    }
  }

  const users = React.useMemo(() => (otherUsers ?? [])?.map(user => ({ id: user?.id!, name: user?.username!, image: user?.image })), [otherUsers?.length]);

  return (
    <Form.Provider {...form}>
      <Form onSubmit={form.handleSubmit(onSubmit)} id="inline-message" className="bg-background-theme flex flex-col max-h-[35%] w-full border-t [--inset-x:0.75rem] [--inset-b:0.75rem]">
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
          name="body"
          render={({ field }) => {
            return (
              <InlineEditor
                dir="ltr"
                placeholder="Type a message"
                users={users}
                {...field}
                classNames={{
                  root: 'px-3 mt-2 overflow-y-auto min-h-20 max-h-[calc(100%-(0.5rem+3.5rem))]',
                  editor: 'my-0 w-full max-w-full text-sm md:text-[15px] bg-transparent h-auto resize-none leading-normal rounded-none border-0'
                }}
                // value={`_text italic_ *text bold* _*italic and bold*_\n\`\`\`\nconstructor(props) {\n  super(props)\n\n  this.state = {\n\n  }\n\n  this.handleEvent = this.handleEvent.bind(this)\n  }\n\`\`\`\n> blockQuotes\u200B> xxx\n\n\n`}
                // onChange={i => {
                // console.log('[VALUE]:', JSON.stringify(i));
                // field.onChange(i);
                // }}
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
