'use client';
import * as React from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { useForm, Form } from '../fields/form';
import { MinimalAccount } from '@/resource/types/user';
import { CreateChatSchema, CreateChatTypes } from '@/resource/schemas/chat';
import { styleForm } from '../form/accounts/components';
import { MotionCardModal } from '../motion/motion-card';
import { ChatMultipleIcon } from '../icons-fill';
import { Navigation } from '../actions';
import { cn } from 'cn';
import { SheetsBreakpoint } from '../sheets-breakpoint';

const classes = styleForm().auth().focused();

interface GroupChatModalProps extends Pick<React.ComponentProps<typeof MotionCardModal>, 'open' | 'onOpenChange'> {
  users: MinimalAccount[];
}

export function ChatGroup(_props: GroupChatModalProps) {
  const { open, onOpenChange, users = [] } = _props;

  const { form, router, loading, setLoading } = useForm<CreateChatTypes>({
    schema: CreateChatSchema,
    defaultValues: {
      name: '',
      members: [],
      type: 'GROUP',
      userId: undefined
    }
  });

  // const members = form.watch('members');

  function onSubmit(data: CreateChatTypes) {
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
              autoFocus
              required
              aria-required
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
              autoFocus
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
    <SheetsBreakpoint
      openWith="drawer"
      open={isModalOpen}
      onOpenChange={setIsModalOpen}
      classNames={{
        content:
          'bg-gradient-theme px-2.5 w-full max-w-full h-full max-lg:max-w-full max-h-[100dvh] border-0 rounded-none sm:rounded-none flex flex-col [&_[data-role=button-close]]:sr-only [&_[data-role=button-close]]:hidden'
      }}
      trigger={
        <button type="button" role="button" name="chat-group" className={cn('flex items-center justify-center border rounded-lg ml-auto p-0.5 size-9')}>
          <ChatMultipleIcon mark="plus" size={24} className="transition-colors" />
          <span className="sr-only hidden">Create Chat Group</span>
        </button>
      }
      content={
        <>
          <div role="group" className="mb-6 mt-8 grid grid-cols-3 justify-items-center items-center">
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
          </div>
          <ChatGroup users={accounts} open={isModalOpen} onOpenChange={setIsModalOpen} />
        </>
      }
    />
  );
}
