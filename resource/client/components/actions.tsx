'use client';

import * as React from 'react';
import axios from 'axios';
import { usePathname, useRouter } from 'next/navigation';
import { useDialog } from '@/resource/client/components/ui/dialog';
import { useApp } from '@/resource/client/contexts/app-provider';
import { DisketteIcon, TrashFillIcon } from './icons-fill';
import { strictRole } from '@/resource/const/role-status';
import { StatusError } from './status/403';
import { twMerge } from 'tailwind-merge';
import { ChevronIcon } from './icons';
import { Button } from './ui/button';
import { Alert } from './alert';
import { toast } from 'sonner';
import { cn } from 'cn';

enum PrefetchKind {
  AUTO = 'auto',
  FULL = 'full',
  TEMPORARY = 'temporary'
}
interface NavigateOptions {
  scroll?: boolean;
}
interface PrefetchOptions {
  kind: PrefetchKind;
}
interface NavigationBaseProps extends React.ComponentPropsWithRef<typeof Button> {
  label?: string;
}

export type NavigationProps =
  | ({ instance: 'forward' | 'refresh' | 'break' } & NavigationBaseProps)
  | ({ instance: 'back'; onBackResolve?: (location: Location) => string | null } & NavigationBaseProps)
  | ({ instance: 'push'; href: string; options?: NavigateOptions } & NavigationBaseProps)
  | ({ instance: 'replace'; href: string; options?: NavigateOptions } & NavigationBaseProps)
  | ({ instance: 'prefetch'; href: string; options?: PrefetchOptions } & NavigationBaseProps);

export function Navigation(_props: NavigationProps) {
  const { label = 'Back', children, onClick, className, instance, 'aria-label': aL, disabled, ...props } = _props;
  const router = useRouter();

  const hasRecentPushState = React.useRef(false);

  const [canGoBack, setCanGoBack] = React.useState(true);

  React.useEffect(() => {
    // Aturan umum: jika history length <= 1, maka tidak ada halaman sebelumnya
    setCanGoBack(window.history.length > 1);
  }, []);

  // Override pushState to detect open:true
  React.useEffect(() => {
    const originalPushState = window.history.pushState;

    window.history.pushState = function (state, title, url) {
      if (state && state.open) {
        hasRecentPushState.current = true;

        // Reset flag after a short time, to not persist across unrelated navigations
        setTimeout(() => {
          hasRecentPushState.current = false;
        }, 300);
      }

      return originalPushState.apply(this, arguments as any);
    };

    return () => {
      window.history.pushState = originalPushState;
    };
  }, []);

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    switch (instance) {
      case 'back': {
        if (!canGoBack) return; // tidak bisa kembali

        if (!hasRecentPushState.current) {
          const resolved = _props.onBackResolve?.(window.location);
          if (resolved) {
            router.replace(resolved);
            break;
          }
        }

        router.back();
        break;
      }

      case 'forward':
      case 'refresh':
        router[instance]();
        break;

      case 'push':
      case 'replace':
        router[instance](_props.href, _props.options);
        break;

      case 'prefetch':
        router[instance](_props.href, _props.options);
        break;

      case 'break':
        break;
    }
    onClick?.(e);
  }

  return (
    <Button {...props} onClick={handleClick} disabled={disabled || (instance === 'back' && !canGoBack)} aria-label={aL || label} className={cn('text-sm font-bold', className)}>
      {children ?? (
        <>
          <ChevronIcon chevron="left" size={28} />
          {label}
        </>
      )}
    </Button>
  );
}

interface SubmitActionProps extends React.ComponentProps<typeof Button> {
  data?: any;
  loading?: boolean;
}
export const SubmitAction = React.forwardRef<HTMLButtonElement, SubmitActionProps>((_props, ref) => {
  const { data, className, loading, disabled, ...props } = _props;
  return (
    <Button
      ref={ref}
      {...props}
      disabled={disabled || loading}
      className={twMerge('flex flex-row items-center gap-2 min-h-8 min-w-[80px] max-md:w-full md:w-[108px]', className)}
      type="submit"
    >
      {data ? <DisketteIcon /> : <DisketteIcon />}
      <span>{data ? 'Update' : 'Save'}</span>
    </Button>
  );
});

interface DeletedActionProps extends React.ComponentProps<'div'> {
  redirectAfterSuccess?: string;
  apiRoute?: string | { slug?: string };
  asChild?: boolean;
  open?: boolean;
  onOpenChange?: (o: boolean) => void;
  onConfirm?: () => void;
  onSuccess?: () => void;
  label?: string | null;
  data: {
    id?: string;
    title?: string;
    label?: string;
    name?: string;
    userId?: string;
  };
}

export function DeletedAction(_props: DeletedActionProps) {
  const {
    data,
    children,
    redirectAfterSuccess,
    asChild,
    onClick,
    className,
    open: openProp,
    onOpenChange: setOpenProp,
    onConfirm,
    apiRoute,
    onSuccess,
    label = 'Delete',
    ...props
  } = _props;

  const { user } = useApp();

  const ctxModal = useDialog();

  // const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const [_open, _setOpen] = React.useState(false);

  const open = openProp ?? _open;
  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === 'function' ? value(open) : value;
      if (setOpenProp) {
        setOpenProp(openState);
      } else {
        _setOpen(openState);
      }
    },
    [setOpenProp, open]
  );

  const router = useRouter();

  const name = data?.title || data?.label || data?.name;

  if (!user) return null;

  const strictUser = data && strictRole(user) ? false : user?.refId !== data?.userId;

  if (strictUser) return null;

  async function onDelete() {
    if (!user || strictUser) return;

    if (!apiRoute) {
      alert('⚠️\nYou have not defined the apiRoute prop.');
      return;
    }

    try {
      setLoading(true);
      toast.promise(axios.delete(typeof apiRoute === 'string' ? apiRoute : `/api/${user.refId}/${apiRoute?.slug}/${data?.id}`), {
        loading: 'Wait a moment...',
        success: () => {
          setLoading(false);
          router.refresh();
          onSuccess?.();
          if (ctxModal) ctxModal.setOpenDialog?.(false);
          if (redirectAfterSuccess) {
            router.push(redirectAfterSuccess);
          }
          return `Deleted Successfully`;
        },
        error: 'Error'
      });
    } catch (error) {
      alert(`Something went wrong.\n${error}`);
    } finally {
      setLoading(false);
      setOpen(false);
    }
  }

  return (
    <>
      <div
        tabIndex={0}
        className={twMerge(
          'bg-red-500 hover:bg-red-600 active:bg-red-600 active:dark:bg-red-700 text-white relative flex cursor-pointer select-none items-center rounded-lg px-2 py-1.5 text-sm outline-none transition-colors focus:bg-red-600 focus:text-accent-foreground hover:text-white data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
          label ? 'gap-2 font-bold' : 'h-9 w-9 min-h-9 min-w-9 max-h-9 max-w-9',
          className
        )}
        onClick={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
          setOpen(true);
          onClick?.(e);
        }}
        {...props}
      >
        {children || (
          <>
            <TrashFillIcon size={20} />
            {label && <span>{label}</span>}
          </>
        )}
      </div>

      <Alert.Modal
        open={open}
        onOpenChange={setOpen}
        onConfirm={() => {
          if (strictUser) {
            alert('⚠️\nAccess Denied!');
          } else {
            onDelete();
            onConfirm?.();
          }
        }}
        disabled={loading}
        title="Delete"
        classNames={{ overlay: 'z-[104]' }}
        deniedContent={strictUser && <StatusError status="denied" />}
      >
        {name && (
          <div className="flex flex-col justify-start gap-2">
            <p className="text-muted-foreground bg-muted border m-0 rounded-lg px-4 py-3">{name}</p>
          </div>
        )}
      </Alert.Modal>
    </>
  );
}
