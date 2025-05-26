'use client';
import * as React from 'react';
import bcrypt from 'bcryptjs';

import { Alert } from '../../alert';
import { Button } from '../../ui/button';
import { Form } from '../../fields/form';
import { useSettingsForm } from '../../../../../auth/handler-client';
import { RequirementPassword } from './requirements-password';
import { updateAccount } from '../../../../../auth/handler-server';
import { SettingPasswordFormValues, SettingPasswordSchema, SettingPasswordSchemaBySuperAdmin } from '@/resource/schemas/user';
import { strictRole } from '@/resource/const/role-status';
import { styleForm } from './components';
import { toast } from 'sonner';
import { cn } from 'cn';

import type { Account } from '@/resource/types/user';
import type { Session } from 'next-auth';

const classes = {
  className: cn('max-lg:flex max-lg:flex-row max-lg:items-center max-lg:justify-between max-lg:[&_div[data-field]]:max-w-[65%] max-lg:[&_div[data-field]_input]:max-w-full space-y-0'),
  classNames: {
    label: styleForm().account().classNames.label,
    input: cn(styleForm().account().classNames.input, 'lg:max-w-full')
  }
};

export function SettingPasswordForm({ account, session, currentAccount }: { account: Account; session: Session | null | undefined; currentAccount: Account }) {
  const isStrictRole = strictRole(currentAccount);

  const { form, update, router, success, setSuccess, error, setError, loading, setLoading } = useSettingsForm<SettingPasswordFormValues>(account, {
    schema: isStrictRole ? SettingPasswordSchemaBySuperAdmin : SettingPasswordSchema,
    defaultValues: { email: account?.email || '', password: '', newPassword: '', confirmPassword: '' }
  });

  if (!account || session?.user.isOAuth !== false) return null;

  const isAnyFieldDirty = Object.keys(form.formState.dirtyFields).length > 0;
  const toastError = (msg: string) => toast(<Alert error={msg} withCloseButton={false} className="my-0 w-full rounded-[inherit]" />, { classNames: { toast: 'p-0 h-max' } });

  function successState() {
    form.reset();
    router.refresh();
    setLoading(false);
  }

  async function onSubmit(values: SettingPasswordFormValues) {
    const { confirmPassword, newPassword, ...validValues } = values;
    if (!account) return;
    const hashedNewPassword = await bcrypt.hash(newPassword!!, 10);
    if (validValues.password && account?.password && newPassword) {
      const passwordsMatch = await bcrypt.compare(validValues.password, account?.password),
        newPasswordsMatch = await bcrypt.compare(newPassword, account?.password),
        confirmPasswordMatch = newPassword === confirmPassword;
      if (values.email !== account.email) {
        toastError('Email not match.');
        return;
      }
      if (!passwordsMatch) {
        toastError('Make sure current password is correct');
        return;
      }
      if (newPasswordsMatch) {
        toastError('Make sure old & new password is different');
        return;
      }
      if (!confirmPasswordMatch) {
        toastError('Make sure confirm password is correct');
        return;
      }
    }

    setLoading(true);
    try {
      toast.promise(
        updateAccount(account.id, {
          password: hashedNewPassword
        }),
        {
          loading: 'Updating...',
          success: data => {
            successState();
            return 'Password Successfully Updated';
          },
          error: data => {
            setError(data.error);
            setLoading(false);
            return 'There is an error';
          }
        }
      );

      router.refresh();
    } catch (error) {
      toast.error('Error', { description: 'Something when wrong!' });
    } finally {
      successState();
    }
  }

  return (
    <Form.Card>
      <h3 className="font-bold text-sm">Password</h3>
      <Form.Provider {...form}>
        <Form onSubmit={form.handleSubmit(onSubmit)} className="group [&_[data-field]]:mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Form.Field
              control={form.control}
              name="email"
              render={({ field }) => (
                <Form.InputField
                  name="email"
                  label="Email (read-only):"
                  disabled={loading}
                  // className="cursor-not-allowed [&_input]:cursor-not-allowed"
                  readOnly
                  value={field.value}
                  {...classes}
                />
              )}
            />

            {!isStrictRole ? (
              <Form.Field
                control={form.control}
                name="password"
                render={({ field }) => (
                  <Form.InputField label="Current Password:" autoComplete="off" disabled={loading} placeholder="Current Password" errorMessage="placeholder" {...field} {...classes} />
                )}
              />
            ) : (
              <div className="max-md:hidden max-md:sr-only" />
            )}

            <Form.Field
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <Form.InputPasswordField label="New Password:" autoComplete="off" disabled={loading} placeholder="New Password" errorMessage="placeholder" {...field} {...classes} />
              )}
            />

            <Form.Field
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <Form.InputPasswordField
                  id="confirmPassword"
                  label="Confirm Password:"
                  autoComplete="off"
                  disabled={loading}
                  placeholder="Confirm Password"
                  errorMessage="placeholder"
                  {...field}
                  {...classes}
                />
              )}
            />

            <Form.Field
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <div className="md:col-span-2 flex flex-col *:text-[13px] text-muted-foreground">
                  <span className="font-medium text-sm">Password Requirement:</span>
                  <span className="font-normal text-sm mb-1">Make sure the following requirements are met:</span>
                  <RequirementPassword
                    value={field.value ?? ''}
                    classNames={{ root: 'ml-1.5 rtl:ml-0 rtl:mr-1.5', item: 'text-[13px] text-muted-foreground data-[state=pass]:text-muted data-[state=pass]:line-through' }}
                  />
                </div>
              )}
            />
          </div>

          <Button
            type="submit"
            disabled={loading || !isAnyFieldDirty || form.formState.isSubmitting}
            className="w-max mt-6 ml-auto block transition-colors active:scale-100 group-[:not(:has(input[value='']))]:text-gradient group-has-[input[value='']]:opacity-50 group-has-[input[value='']]:pointer-events-none"
          >
            Save
          </Button>
        </Form>
      </Form.Provider>
    </Form.Card>
  );
}
