'use client';
import * as React from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { useForm, Form } from '../fields/form';
import { MinimalAccount } from '@/resource/types/user';
import { ChatGroupSchema, ChatGroupValues } from '@/resource/schemas/chat';
import { MotionButton, MotionButtonModal } from '../motion/motion-button';
import { styleForm } from '../form/accounts/components';
import { MotionCardModal } from '../motion/motion-card';
import { PeopleChatFillIcon, PeopleIcon } from '../icons-fill';
import { useChat } from './chat-context';
import { Navigation } from '../actions';
import { cn } from 'cn';

const classes = styleForm().auth().focused();

interface GroupChatModalProps extends Pick<React.ComponentProps<typeof MotionCardModal>, 'open' | 'onOpenChange'> {
  users: MinimalAccount[];
}

export function ChatGroup(_props: GroupChatModalProps) {
  const { open, onOpenChange, users = [] } = _props;

  const { form, router, loading, setLoading } = useForm<ChatGroupValues>({
    schema: ChatGroupSchema,
    defaultValues: {
      name: '',
      members: [],
      type: 'GROUP',
      userId: ''
    }
  });

  // const members = form.watch('members');

  function onSubmit(data: ChatGroupValues) {
    setLoading(true);

    axios
      .post('/api/chats', {
        ...data,
        type: 'GROUP'
      })
      .then(() => {
        router.refresh();
        onOpenChange?.(false);
      })
      .catch(error => toast.error('Something went wrong!', { description: String(error.message) }))
      .finally(() => setLoading(false));
  }

  const options = users.map(user => ({ value: user?.id!, label: user?.name! }));

  return (
    <Form.Provider {...form}>
      <Form id="create-chat-group" onSubmit={form.handleSubmit(onSubmit)} className="px-4">
        <p className="text-sm font-bold text-gradient ml-6 rtl:ml-auto rtl:mr-6 mb-1.5">Create a chat with more than 2 people.</p>
        <Form.Field
          control={form.control}
          name="name"
          render={({ field }) => (
            <Form.InputField
              label="Create a group chat"
              placeholder="Group name"
              disabled={loading}
              {...field}
              classNames={{ item: 'mb-6', label: classes.label, input: cn('min-h-[46px] ') }}
            />
          )}
        />

        <Form.Field
          control={form.control}
          name="members"
          render={({ field }) => (
            <Form.SelectField
              disabled={loading}
              variant="chip"
              placeholder="Add members"
              {...field}
              isMulti
              options={options}
              // value={field.value}
              // onChange={selected => field.onChange(selected)}
              className="dark:[--bg-control:#d9d9d90f] [&_.value-container:not(:has(.item-value))]:[--space-x:7px] [&_.placeholder:not(:has(.item-value))]:[--ml:calc(var(--space-x)+1px)]"
              classNames={{ label: classes.label }}
              styles={{
                option: base => ({ ...base, backgroundColor: 'var(--chip-bg)' }),
                control: base => ({
                  ...base,
                  backgroundColor: 'var(--bg-control)',
                  minHeight: '46px',
                  borderRadius: '10px',
                  borderColor: 'transparent',
                  borderWidth: '0px',
                  boxShadow: 'none'
                }),
                placeholder: base => ({ marginLeft: 'var(--ml)', marginRight: '2px' }),
                valueContainer: base => ({ ...base, padding: '0 var(--space-x, 2px)', backgroundColor: 'transparent' }),
                input: base => ({ ...base, backgroundColor: 'transparent', color: 'hsl(var(--color))' }),
                indicatorsContainer: base => ({ ...base, display: 'none' }),
                menu: base => ({ borderRadius: '10px' })
              }}
            />
          )}
        />
      </Form>
    </Form.Provider>
  );
}

interface CreateChatGroupProps {
  accounts: MinimalAccount[];
}
export function CreateChatGroup({ accounts }: CreateChatGroupProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  return (
    <>
      <MotionButton name="chat-group" className={cn('flex items-center justify-center border rounded-lg ml-auto p-0.5 size-9')} onClick={() => setIsModalOpen(true)}>
        <PeopleChatFillIcon size={24} className="transition-colors" />
        <span className="sr-only hidden">Create Chat Group</span>
      </MotionButton>

      <MotionButtonModal
        name="chat-group"
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        classNames={{
          container: 'bg-gradient-theme flex items-center justify-center px-2.5 !mt-0 z-[150]',
          root: 'mb-auto w-full max-h-[100dvh]',
          content: '',
          header: 'mb-6 mt-8 grid grid-cols-3 justify-items-center items-center',
          body: 'mt-16 size-full'
        }}
        header={
          <>
            <Navigation instance="break" onClick={() => setIsModalOpen(false)} className="mr-auto" />
            <p className="text-sm font-semibold"></p>
            <Button
              type="submit"
              suppressHydrationWarning
              form="create-chat-group"
              className={cn(
                'w-max mr-4 rtl:mr-0 rtl:ml-4 text-sm font-semibold ml-auto py-0 rounded-none bg-clip-text group-[:not(:has(.item-value))]/content:opacity-50 group-[:not(:has(.item-value))]/content:pointer-events-none'
              )}
              style={{ background: '40% 40% / 200% no-repeat text linear-gradient(134.86deg, #ABFFFD 2.64%, #4599DB 102.4%, #AADAFF 102.4%)' }}
            >
              Create
            </Button>
          </>
        }
      >
        <ChatGroup users={accounts} open={isModalOpen} onOpenChange={setIsModalOpen} />
      </MotionButtonModal>
    </>
  );
}
