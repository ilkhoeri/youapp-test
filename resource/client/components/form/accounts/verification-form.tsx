'use client';
import React from 'react';
import { useRegisterWithToken } from '@/auth/handler-client';
import { Form } from '@/resource/client/components/fields/form';
import { AuthButtonSubmit, HeadImageSign, LoaderAuthPage, styleForm } from './components';
import { useRouter, useSearchParams } from 'next/navigation';
import { verification } from '@/auth/tokens/verification';
import { cn } from 'cn';

const classes = styleForm().auth();

export function VerificationTokenForm({ className, ...props }: React.ComponentPropsWithoutRef<'form'>) {
  const { form, loading, onSubmit: _onSubmit } = useRegisterWithToken();

  const router = useRouter();
  const [error, setError] = React.useState<string | undefined>();
  const [success, setSuccess] = React.useState<string | undefined>();

  const searchParams = useSearchParams();

  const token = searchParams.get('token');

  const onSubmit = React.useCallback(() => {
    if (success || error) return;

    if (!token) {
      setError('Missing token!');
      return;
    }

    verification(token)
      .then(data => {
        if (data?.error) {
          setError(data.error);
        }

        if (data?.success) {
          router.push('/auth/sign-in');
          router.refresh();
          setSuccess(data.success);
        }
      })
      .catch(() => {
        setError('Ada sesuatu yang salah!');
      });
  }, [token, success, error, router]);

  React.useEffect(() => {
    if (token) onSubmit();
  }, [token, onSubmit]);

  return (
    <Form.Provider {...form}>
      <LoaderAuthPage loading={loading} />
      <Form {...props} onSubmit={form.handleSubmit(onSubmit)} className={cn('group flex flex-col gap-4 w-full min-h-max', className)}>
        <HeadImageSign imageUrl="/images/key.png" className="lg:-mt-14" />

        <Form.Field
          control={form.control}
          name="token"
          render={({ field }) => <Form.InputField label="Token" placeholder="Enter Your Token" size="lg" disabled={loading} classNames={classes.focused()} {...field} />}
        />

        <AuthButtonSubmit label="Verify" loading={loading} className="mt-2" />
      </Form>
    </Form.Provider>
  );
}
