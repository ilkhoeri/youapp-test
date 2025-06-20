'use client';
import React from 'react';
import * as motion from 'motion/react-client';
import { Form } from '@/resource/client/components/fields/form';
import { useRegisterWithToken, useSignUp } from '@/auth/handler-client';
import { LoaderAuthPage, AuthButtonSubmit, DirectLink, styleForm } from './components';
import { RequirementPassword, requirements } from './requirements-password';
import { containerVariants } from '@/resource/styles/motion-styles';
import { decrypt } from '@/resource/const/encrypt-decrypt';
import { InvitationToken } from '@prisma/client';
import { cn } from 'cn';

const classes = styleForm().auth();

type RegisterFormProps = React.ComponentPropsWithoutRef<'form'>;

export function RegisterForm({ className, ...props }: RegisterFormProps) {
  const [viewPsw, setViewPsw] = React.useState(false);
  const [email, setEmail] = React.useState('');

  const { form, onSubmit, loading } = useSignUp({
    emailParam: email,
    defaultValues: { role: 'USER' }
  });

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get('email');
    if (emailParam) setEmail(emailParam);
  }, []);

  return (
    <Form.Provider {...form}>
      <LoaderAuthPage loading={loading} />

      <Form {...props} onSubmit={form.handleSubmit(onSubmit)} className={cn('group flex flex-col gap-6 w-full min-h-max [--eye-color:#f1eba4]', className)}>
        <div className="grid gap-4">
          <Form.Field
            control={form.control}
            name="email"
            render={({ field }) => (
              <Form.InputField
                size="lg"
                disabled={loading}
                label="Register"
                placeholder="Enter Email"
                errorMessage="placeholder"
                classNames={classes.focused()}
                {...field}
                onChange={e => {
                  field.onChange(e);
                  setEmail(e.target.value);
                }}
              />
            )}
          />

          <Form.Field
            control={form.control}
            name="name"
            render={({ field }) => <Form.InputField size="lg" placeholder="Create Username" errorMessage="placeholder" disabled={loading} className={classes.item()} {...field} />}
          />

          <Form.Field
            control={form.control}
            name="password"
            render={({ field }) => (
              <Form.InputPasswordField
                autoComplete="off"
                size="lg"
                placeholder="Create Password"
                className={classes.item()}
                disabled={loading}
                {...field}
                open={viewPsw}
                onOpenChange={setViewPsw}
                errorMessage="placeholder"
              />
            )}
          />

          <Form.Field
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <Form.InputPasswordField
                id="confirmPassword"
                autoComplete="off"
                size="lg"
                disabled={loading}
                placeholder="Confirm Password"
                errorMessage="placeholder"
                className={classes.item()}
                {...field}
                open={viewPsw}
                onOpenChange={setViewPsw}
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

        <AuthButtonSubmit label="Register" loading={loading} />

        <DirectLink disabled={loading} href="/auth/sign-in" label={['Have an account?', 'Login here']} />
      </Form>
    </Form.Provider>
  );
}

interface SignUpFormProps {
  invitation: InvitationToken | null;
}

type RegisterWithTokenForm = React.ComponentProps<'form'> & SignUpFormProps;
export function RegisterWithTokenForm(_props: RegisterWithTokenForm) {
  const { className, invitation, ...props } = _props;
  const [open, setOpen] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const { form, loading, onSubmit } = useRegisterWithToken({ emailParam: email });

  // get invitation_token from query
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const encryptedToken = urlParams.get('invitation_token');

    if (encryptedToken) {
      try {
        const originalToken = decrypt(encryptedToken);
        form.setValue('token', originalToken);
      } catch (error) {
        console.error('Token tidak valid');
      }
    }
  }, [form]);

  return (
    <Form.Provider {...form}>
      <LoaderAuthPage loading={loading} />
      <Form {...props} onSubmit={form.handleSubmit(onSubmit)} className={cn('group flex flex-col gap-6 w-full min-h-max [--eye-color:#f1eba4]', className)}>
        <div className="grid gap-4">
          <Form.Field
            control={form.control}
            name="email"
            render={({ field }) => (
              <Form.InputField
                size="lg"
                disabled={loading}
                label="Register"
                placeholder="Enter Email"
                classNames={classes.focused()}
                {...field}
                onChange={e => {
                  field.onChange(e);
                  setEmail(e.target.value);
                }}
              />
            )}
          />

          <Form.Field
            control={form.control}
            name="name"
            render={({ field }) => <Form.InputField placeholder="Create Username" size="lg" disabled={loading} className={classes.item()} {...field} />}
          />

          <Form.Field
            control={form.control}
            name="password"
            render={({ field }) => (
              <Form.InputPasswordField autoComplete="off" disabled={loading} placeholder="Create Password" className={classes.item()} {...field} open={open} onOpenChange={setOpen} />
            )}
          />

          <Form.Field
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <Form.InputPasswordField
                id="confirmPassword"
                autoComplete="off"
                size="lg"
                placeholder="Confirm Password"
                className={classes.item()}
                disabled={loading}
                {...field}
                open={open}
                onOpenChange={setOpen}
              />
            )}
          />
        </div>

        <AuthButtonSubmit label="Register" loading={loading} />

        <DirectLink disabled={loading} href="/auth/sign-in" label={['Have an account?', 'Login here']} />
      </Form>
    </Form.Provider>
  );
}
