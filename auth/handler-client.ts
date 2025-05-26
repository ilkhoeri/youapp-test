'use client';

import * as React from 'react';
import * as z from 'zod';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { DefaultValues, useForm } from 'react-hook-form';
import { Alert } from '@/resource/client/components/alert';
import { useRouter, useSearchParams } from 'next/navigation';
import { SignInSchema, SignUpSchema } from '@/resource/schemas/user';
import { zodResolver } from '@hookform/resolvers/zod';
import { FieldValues } from 'react-hook-form';
import { signup } from '@/auth/signup';
import { signin } from '@/auth/signin';
import { toast } from 'sonner';

import { Session } from '@/resource/types/user';
import { initialValues } from '@/resource/client/components/fields/helper';
import { generateInvitationToken } from '@/resource/server/handler/token/generate-invitation-token';
import { GenerateInvitationTokenSchema, RegisterUserWithTokenSchema } from '@/resource/schemas/user/token/invitation-token';
import { invitationToken, registerWithToken } from './tokens/invitation-token';
import { getTime } from '@/resource/const/times-helper';
import { useApp } from '@/resource/client/contexts/app-provider';
import { ObjectId } from 'bson';

type AsyncDefaultValues<TFieldValues> = (payload?: unknown) => Promise<TFieldValues>;
type OptionsFieldValues<TFieldValues> = { schema: z.ZodType<any, any, any>; defaultValues: DefaultValues<TFieldValues> | AsyncDefaultValues<TFieldValues> };

export function useSettingsForm<T extends FieldValues = FieldValues, TCtx = any>(session: Session['session'], options: OptionsFieldValues<T>) {
  const { schema, defaultValues } = options;
  const router = useRouter();
  const { update } = useSession();

  // const { birthday, ageString } = getFullAge(String(about?.birthDay));
  const { error, setError, success, setSuccess } = Alert.hooks();

  const [loading, setLoading] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const [isValue, setIsValue] = React.useState('');

  const form = useForm<T, TCtx>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as any
  });

  return { form, router, update, error, setError, success, setSuccess, loading, setLoading, isOpen, setIsOpen, isValue, setIsValue };
}

interface StateOption {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (o: boolean) => void;
}

type SignUpFormValues = z.infer<typeof SignUpSchema>;

type SignInFormValues = z.infer<typeof SignInSchema>;

interface UseSignUpOption extends StateOption {
  emailParam?: string;
  defaultValues?: Nullable<SignUpFormValues, never, undefined>;
}
export function useSignUp(opts: UseSignUpOption = {}) {
  const { defaultOpen = false, open: openProp, onOpenChange: setOpenProp, emailParam, defaultValues = {} } = opts;
  const router = useRouter();

  const {
    name = '',
    email = '',
    password = '',
    confirmPassword = '',
    role = undefined
    // address = { country: 'Indonesia' }
  } = defaultValues;

  const [transition, setTransition] = React.useTransition();
  const [loading, setLoading] = React.useState(false);
  const [_open, _setOpen] = React.useState(defaultOpen);

  const [signUpResult, setSignUpResult] = React.useState<SignUpFormValues | null | undefined>(null);

  const open = openProp ?? _open;
  const setOpen = setOpenProp ?? _setOpen;

  const redirectAfterSuccess = emailParam && emailParam.trim() !== '' ? `/auth/sign-in?email=${encodeURIComponent(emailParam)}` : '/auth/sign-in';

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: { name, email, password, confirmPassword, role }
  });

  const [roll, setRoll] = React.useState({ year: new Date().getFullYear()?.toString(), number: '0001' });

  const isStrictUser = form.watch('role') === 'USER' || form.watch('role') === 'ADMIN';

  function onSubmit(values: SignUpFormValues) {
    setLoading(true);
    // const toastId = toast.loading('Wait a moment.');

    setTransition(async () => {
      signup(values)
        .then(data => {
          if (data.error) {
            console.log('SIGN_UP ERROR:', data.error);
            // alert(data.error.toUpperCase());
            setLoading(false);
            //  toast.dismiss(toastId);
            toast.error(data.error);
          }
          if (data.success) {
            // toast.dismiss(toastId);
            toast.success(data.success, emailParam ? { description: 'Page will be redirected...' } : undefined);
            setSignUpResult(values);
            form.reset();
            setLoading(false);
            setOpen(false);
            router.refresh();
            if (emailParam && emailParam.trim() !== '') {
              router.push(redirectAfterSuccess);
            }
          }
        })
        .catch(error => {
          // alert('Something went wrong!');
          setLoading(false);
          console.error('CATCH_ERROR:', error);
          // toast.dismiss(toastId);
          toast.error('Something went wrong!');
        });
    });
  }

  return { form, onSubmit, signUpResult, setSignUpResult, loading: loading || transition, setLoading, open, setOpen, roll, setRoll, isStrictUser };
}

export function useSignIn() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');
  const oAuthError = searchParams.get('error') === 'OAuthAccountNotLinked';
  const icon = oAuthError ? 'error' : 'success';

  const catchUrl = oAuthError ? 'Email already in use!' : 'Login Successful';
  const description = oAuthError ? 'Use an email that is not registered.' : 'Welcome, the page will be redirected.';

  const [loading, setLoading] = React.useState<boolean>(false);
  const [transition, setTransition] = React.useTransition();

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(SignInSchema),
    defaultValues: { identifier: '', password: '' }
  });

  function onSubmit(values: SignInFormValues) {
    setLoading(true);
    // const toastId = toast.loading('Wait a moment.');
    setTransition(() => {
      signin(values, callbackUrl)
        .then(data => {
          if (data?.error) {
            console.log('SIGN_IN ERROR:', data.error);
            // alert(data.error);
            setLoading(false);
            // toast.dismiss(toastId);
            toast.error(data.error, { description: data.description });
          }
          if (data?.success) {
            form.reset();
            setLoading(false);
            // toast.dismiss(toastId);
            toast.success(data.success);
          }
        })
        .catch(() => {
          // alert(urlError);
          setLoading(false);
          // toast.dismiss(toastId);
          toast[icon](catchUrl, { description });
        });
    });
  }

  return { form, onSubmit, loading: loading || transition };
}

interface UseGenerateInvitationToken extends StateOption {
  adminId: string | undefined;
}
export function useGenerateInvitationToken(opts: UseGenerateInvitationToken) {
  const { defaultOpen = false, open: openProp, onOpenChange: setOpenProp, adminId } = opts;
  const router = useRouter();

  const { user } = useApp();

  const [transition, setTransition] = React.useTransition();
  const [loading, setLoading] = React.useState(false);
  const [_open, _setOpen] = React.useState(defaultOpen);

  const [result, setResult] = React.useState<
    | {
        raw: string | undefined;
        token: string | undefined;
        expires: string | undefined;
        maxUsageCount: number | undefined;
      }
    | null
    | undefined
  >(null);

  const open = openProp ?? _open;
  const setOpen = setOpenProp ?? _setOpen;

  type Values = z.infer<typeof GenerateInvitationTokenSchema>;

  const defaultValues = initialValues(GenerateInvitationTokenSchema._type, {
    string: [],
    undefined: [],
    enum: { adminId, assignedRole: 'USER', expiresInDays: 1, maxUsageCount: 1 }
  });

  const form = useForm<Values>({
    resolver: zodResolver(GenerateInvitationTokenSchema),
    defaultValues
  });

  async function onSubmit(values: Values) {
    try {
      if (!user) return;

      setLoading(true);

      // const token = crypto.randomUUID();
      const token = new ObjectId().toHexString();
      const days = (values?.expiresInDays || 1) * 24;
      const expires = new Date(Date.now() + days * 60 * 60 * 1000);

      toast.promise(axios.post(`/api/${user.refId}/generate-invitation-token`, { token, expires, ...values }), {
        loading: 'Wait a moment.',
        success: () => {
          const expiresAt = getTime(expires);
          setResult({
            token,
            maxUsageCount: values.maxUsageCount,
            expires: expiresAt,
            raw: `Token: ${token}\nBerlaku sampai: ${expiresAt}\nMaksimum penggunaan: ${values.maxUsageCount} kali`
          });
          form.reset();
          setLoading(false);
          setOpen(false);
          router.refresh();
          return 'Token berhasil dibuat';
        },
        error: 'Error'
      });
    } catch (error) {
      setLoading(false);
      console.error('CATCH_ERROR:', error);
      toast.error('Something went wrong!');
    } finally {
      setLoading(false);
    }
  }

  return { form, onSubmit, result, setResult, loading: loading || transition, setLoading, open, setOpen };
}

interface UseRegisterWithTokenProp extends StateOption {
  emailParam?: string;
}
export function useRegisterWithToken(opts: UseRegisterWithTokenProp = {}) {
  const { defaultOpen = false, open: openProp, onOpenChange: setOpenProp, emailParam } = opts;
  const router = useRouter();

  const [transition, setTransition] = React.useTransition();
  const [loading, setLoading] = React.useState(false);
  const [_open, _setOpen] = React.useState(defaultOpen);

  const redirectAfterSuccess = emailParam && emailParam.trim() !== '' ? `/auth/sign-in?email=${encodeURIComponent(emailParam)}` : '/auth/sign-in';

  const open = openProp ?? _open;
  const setOpen = setOpenProp ?? _setOpen;

  type Values = z.infer<typeof RegisterUserWithTokenSchema>;

  const defaultValues = initialValues(RegisterUserWithTokenSchema._type, {
    string: ['token', 'name', 'email', 'password', 'phone'],
    enum: {}
  });

  const form = useForm<Values>({
    resolver: zodResolver(RegisterUserWithTokenSchema),
    defaultValues
  });

  function onSubmit(values: Values) {
    setLoading(true);
    const toastId = toast.loading('Wait a moment.');

    setTransition(async () => {
      registerWithToken(values)
        .then(data => {
          if (data.error) {
            console.log('SIGN_UP ERROR:', data.error);
            // alert(data.error.toUpperCase());
            setLoading(false);
            toast.dismiss(toastId);
            toast.error(data.error);
          }
          if (data.success) {
            toast.dismiss(toastId);
            toast.success(data.success, { description: 'You can continue to log in to your account..' });
            form.reset();
            setLoading(false);
            setOpen(false);
            router.refresh();
            if (emailParam && emailParam.trim() !== '') {
              router.push(redirectAfterSuccess);
            }
          }
        })
        .catch(error => {
          // alert('Something went wrong!');
          setLoading(false);
          console.error('CATCH_ERROR:', error);
          toast.dismiss(toastId);
          toast.error('Something went wrong!');
        });
    });
  }

  return { form, onSubmit, loading: loading || transition, setLoading, open, setOpen };
}
