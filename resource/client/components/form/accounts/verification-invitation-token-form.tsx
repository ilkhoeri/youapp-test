'use client';
import * as React from 'react';
import * as z from 'zod';
import { toast } from 'sonner';
import { encrypt } from '@/resource/const/encrypt-decrypt';
import { getInvitationHandler } from '@/auth/tokens/invitation-token';
import { AuthButtonSubmit, DirectLink, HeadImageSign, styleForm } from './components';
import { Form, useForm } from '@/resource/client/components/fields/form';
import { Alert } from '../../alert';
import { cn } from 'cn';
import { ClientMount } from '../../client-mount';
// import { getInvitationToken } from '@/auth/tokens/verification-token';

const classes = styleForm().auth();

interface InvitationVerificationTokenFormProps extends React.ComponentPropsWithoutRef<'form'> {
  tokens: string[] | null;
}

export function InvitationVerificationTokenForm(_props: InvitationVerificationTokenFormProps) {
  const { className, tokens, ...props } = _props;
  const [transition, setTransition] = React.useTransition();

  const [alert, setAlert] = React.useState<{ success?: string | null; error?: string | null; description?: string | null }>({
    success: undefined,
    error: undefined,
    description: undefined
  });

  const InputTokenSchema = z.object({
    token: z
      .string()
      .min(12, {
        message: 'Enter the token correctly'
      })
      .refine(value => tokens?.includes(value), {
        message: 'Incorrect or unregistered token'
      })
  });

  type InputTokenValues = z.infer<typeof InputTokenSchema>;

  const {
    form,
    loading: load,
    setLoading,
    router
  } = useForm<InputTokenValues>({
    schema: InputTokenSchema,
    defaultValues: { token: '' }
  });

  function onSubmit({ token }: InputTokenValues) {
    setLoading(true);
    const toastId = toast.loading('Wait a moment.');

    setTransition(async () => {
      getInvitationHandler(token)
        .then(data => {
          if (data.error) {
            console.log('SIGN_UP ERROR:', data.error);
            // alert(data.error.toUpperCase());
            setLoading(false);
            setAlert(data);
            toast.dismiss(toastId);
            toast.error(data.error);
          }
          if (data.success) {
            setLoading(false);
            toast.dismiss(toastId);
            toast.success(data.success, { description: data.description });
            setAlert(data);
            form.reset();
            router.refresh();

            if (token && token.trim() !== '') {
              const encryptedToken = encrypt(token);
              const inviteURL = `/auth/sign-up?invitation_token=${encodeURIComponent(encryptedToken)}`;
              router.push(inviteURL);
            }
          }
        })
        .catch(error => {
          setLoading(false);
          console.error('CATCH_ERROR:', error);
          toast.dismiss(toastId);
          toast.error('Something went wrong!');
        });
    });
  }

  const loading = load || transition;

  return (
    <ClientMount>
      <Form.Provider {...form}>
        <Form {...props} onSubmit={form.handleSubmit(onSubmit)} className={cn('group flex flex-col gap-4 w-full min-h-max [--scroll-bg:red]', className)}>
          <HeadImageSign imageUrl="/images/key.png" className="lg:-mt-14" />

          <Alert {...alert} />

          <Form.Field
            control={form.control}
            name="token"
            render={({ field }) => <Form.InputField size="lg" disabled={loading} label="Invitation Token" placeholder="Enter Your Token" classNames={classes.focused()} {...field} />}
          />

          <AuthButtonSubmit label="Verify" disabled={loading} className="mt-2" />

          <DirectLink disabled={loading} href="/auth/sign-in" label={['Have an account?', 'Login here']} />
        </Form>
      </Form.Provider>
    </ClientMount>
  );
}
