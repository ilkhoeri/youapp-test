'use client';
import React from 'react';
import Link from 'next/link';
import { Button } from '@/resource/client/components/ui/button';
import { AuthButtonSubmit, DirectLink, LoaderAuthPage, styleForm } from './components';
import { RequirementPassword, requirements } from './requirements-password';
import { containerVariants } from '@/resource/styles/motion-styles';
import { useSignIn } from '@/auth/handler-client';
import * as motion from 'motion/react-client';
import { Form } from '../../fields/form';
import { cn } from 'cn';

const classes = styleForm().auth();

export function SignInForm({ className, ...props }: React.ComponentPropsWithoutRef<'form'>) {
  const [email, setEmail] = React.useState('');

  const { form, loading, onSubmit } = useSignIn();

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get('email');

    if (emailParam) {
      setEmail(emailParam);
      form.setValue('identifier', emailParam);
    }
  }, [form]);

  return (
    <Form.Provider {...form}>
      <LoaderAuthPage loading={loading} />

      <Form {...props} onSubmit={form.handleSubmit(onSubmit)} className={cn('group flex flex-col gap-6 w-full', className)}>
        <div className="grid gap-4">
          <Form.Field
            control={form.control}
            name="identifier"
            render={({ field }) => (
              <Form.InputField
                label="Login"
                size="lg"
                autoComplete="off"
                placeholder="Enter Username/Email"
                disabled={loading}
                errorMessage="placeholder"
                classNames={classes.focused()}
                {...field}
                value={field.value || email}
                onChange={e => {
                  field.onChange(e);
                  setEmail(e.target.value);
                }}
              />
            )}
          />

          <Form.Field
            control={form.control}
            name="password"
            render={({ field }) => (
              <Form.InputPasswordField
                size="lg"
                autoComplete="off"
                placeholder="Enter Password"
                disabled={loading}
                className={classes.item({ className: '[--eye-color:#f1eba4]' })}
                errorMessage="placeholder"
                {...field}
              />
            )}
          />

          <Form.Field
            control={form.control}
            name="password"
            render={({ field }) => {
              const meets = !!field.value && !requirements().every(i => i.rg.test(field.value));
              return (
                <motion.div initial={false} animate={meets ? 'open' : 'closed'} variants={containerVariants()} className="overflow-hidden *:text-[13px]">
                  <span className="font-normal mb-1 text-muted-foreground">Make sure the following requirements are met:</span>
                  <RequirementPassword
                    value={field.value}
                    classNames={{ root: 'ml-1.5 rtl:ml-0 rtl:mr-1.5', item: 'text-[13px] text-muted-foreground data-[state=pass]:text-muted data-[state=pass]:line-through' }}
                  />
                </motion.div>
              );
            }}
          />
        </div>

        <AuthButtonSubmit label="Login" loading={loading} />

        <Link
          aria-disabled={loading}
          tabIndex={-1}
          href="#"
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="mt-6 mx-auto text-[13px] transition-colors font-medium underline-hover hover:text-gradient aria-disabled:opacity-50"
        >
          Reset Password
        </Link>

        <DirectLink disabled={loading} href="/auth/sign-up" label={['No account?', 'Register here']} className="mt-0" />
      </Form>
    </Form.Provider>
  );
}

function LoginWithGithub() {
  return (
    <>
      <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
        <span className="relative z-10 bg-background px-2 text-muted-foreground">Or continue with</span>
      </div>
      <Button variant="outline" className="w-full">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mr-2 size-5">
          <path
            d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
            fill="currentColor"
          />
        </svg>
        Login with GitHub
      </Button>
    </>
  );
}
