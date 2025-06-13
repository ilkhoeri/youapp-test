'use client';
import * as React from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { useForm, Form } from '../fields/form';
import { Account } from '@/resource/types/user';
import { ChatGroupSchema, ChatGroupValues } from '@/resource/schemas/chat';
import { MotionButton, MotionButtonModal } from '../motion/motion-button';
import { styleForm } from '../form/accounts/components';
import { MotionCardModal } from '../motion/motion-card';
import { PeopleIcon } from '../icons-fill';
import { useChat } from './chat-context';
import { ActionBack } from '../actions';
import { cn } from 'cn';

const classes = styleForm().auth().focused();

interface GroupChatModalProps extends Pick<React.ComponentProps<typeof MotionCardModal>, 'open' | 'onOpenChange'> {
  users: Account[];
}

export function ChatGroup(_props: GroupChatModalProps) {
  const { open, onOpenChange, users = [] } = _props;

  const { form, router, loading, setLoading } = useForm<ChatGroupValues>({
    schema: ChatGroupSchema,
    defaultValues: {
      name: '',
      members: [],
      isGroup: true,
      userId: ''
    }
  });

  const members = form.watch('members');

  function onSubmit(data: ChatGroupValues) {
    setLoading(true);

    axios
      .post('/api/chats', {
        ...data,
        isGroup: true
      })
      .then(() => {
        router.refresh();
        onOpenChange?.(false);
      })
      .catch(error => toast.error('Something went wrong!', { description: String(error.message) }))
      .finally(() => setLoading(false));
  }
  // https://mcxld6qs-3000.asse.devtunnels.ms/
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
              noOptionsMessage={() => 'Add new\n(select or press Enter)'}
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

interface AddChatGroupProps {
  accounts: Account[];
}
export function AddCharGroup(_props: AddChatGroupProps) {
  const { accounts } = _props;
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const { chatId, isOpen } = useChat();

  return (
    <aside className={cn('relative inset-y-0 pb-20 lg:pb-0 lg:left-20 lg:w-80 lg:block overflow-y-auto border-r border-gray-200;', isOpen ? 'hidden' : 'block w-full left-0')}>
      <div className="px-5">
        <div className="flex justify-between mb-4 pt-4">
          <div className="inline-flex items-center text-color text-2xl font-bold ml-6 rtl:ml-auto rtl:mr-6">Messages</div>
          <MotionButton
            name="chat-group"
            className="rounded-full p-1.5 flex items-center justify-center bg-color/80 text-background cursor-pointer hover:opacity-75 transition"
            onClick={() => setIsModalOpen(true)}
          >
            <PeopleIcon mark="community-add" size={26} />
          </MotionButton>
          <MotionButtonModal
            name="chat-group"
            open={isModalOpen}
            onOpenChange={setIsModalOpen}
            classNames={{
              container: 'bg-gradient-theme flex items-center justify-center px-2.5 !mt-0',
              root: 'mb-auto w-full max-h-[100dvh]',
              content: '',
              header: 'mb-6 mt-8 grid grid-cols-3 justify-items-center items-center',
              body: 'mt-16 size-full'
            }}
            header={
              <>
                <ActionBack instance="stop" onClick={() => setIsModalOpen(false)} className="mr-auto" />
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
        </div>
      </div>
    </aside>
  );
}
