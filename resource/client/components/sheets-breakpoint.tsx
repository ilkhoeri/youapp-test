'use client';

import * as React from 'react';
import { Dialog } from './ui/dialog';
import { Drawer } from './ui/drawer';
import { Popover } from './ui/popover';
import { twMerge as cn } from 'tailwind-merge';

import type { FieldError } from 'react-hook-form';

export interface ContentProps {
  modal?: boolean;
  disabled?: boolean;
  error?: FieldError;
  open?: boolean;
  setOpen?: (prev: boolean | ((prev: boolean) => boolean)) => void;
}

type ComponentType = React.ReactNode | ((rest: ContentProps) => React.ReactNode);

export interface __SheetsBreakpointProps extends Omit<ContentProps, 'setOpen'> {
  openWith?: 'popover' | 'dialog' | 'alert-dialog' | 'drawer';
  mobileBreakpoint?: number | `${number}`;
  name?: string;
  formItemId?: string;
  formDescriptionId?: string;
  formMessageId?: string;
  classNames?: Partial<Record<'trigger' | 'content', string>>;
  defaultOpen?: boolean;
  onOpenChange?: ContentProps['setOpen'];
}

export type SheetsBreakpointProps = __SheetsBreakpointProps &
  Omit<React.ComponentProps<'button'>, 'children' | 'content'> & {
    trigger: ComponentType;
    content: ComponentType;
  };

export const SheetsBreakpoint = React.forwardRef<HTMLButtonElement, SheetsBreakpointProps>((_props, ref) => {
  const {
    hidden,
    openWith = 'popover',
    type = 'button',
    role = 'button',
    disabled,
    'aria-disabled': ariaDisabled,
    formItemId,
    formDescriptionId,
    formMessageId,
    error,
    id,
    name,
    className,
    classNames,
    defaultOpen = false,
    open: openProp,
    onOpenChange: setOpenProp,
    trigger: triggerProp,
    content: contentProp,
    mobileBreakpoint = 768,
    modal = true,
    ...props
  } = _props;

  if (hidden) return null;

  const BREAKPOINT = Number(mobileBreakpoint);

  const [_isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);
  const isMobile = !!_isMobile;

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < BREAKPOINT);
    };
    mql.addEventListener('change', onChange);
    setIsMobile(window.innerWidth < BREAKPOINT);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  const hasPushedStateRef = React.useRef(false);

  const [_open, _setOpen] = React.useState(defaultOpen);
  const open = openProp ?? _open;
  const setOpen = React.useCallback(
    (prev: boolean | ((prev: boolean) => boolean)) => {
      const openState = typeof prev === 'function' ? prev(open) : prev;
      if (setOpenProp) setOpenProp(openState);
      else _setOpen(openState);
    },
    [setOpenProp, open]
  );

  React.useEffect(() => {
    if (!isMobile) return;
    if (open && !hasPushedStateRef.current && window.history.state?.open !== true) {
      window.history.pushState({ open: true }, '');
      hasPushedStateRef.current = true;
    } else if (!open && hasPushedStateRef.current) {
      window.history.back();
      hasPushedStateRef.current = false;
    }
  }, [isMobile, open, hasPushedStateRef.current]);

  React.useEffect(() => {
    if (!isMobile) return;
    const handlePopState = (event: PopStateEvent) => {
      if (open) {
        setOpen(false);
        hasPushedStateRef.current = false;
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isMobile, open, setOpen, hasPushedStateRef.current]);

  const restProp: ContentProps = { setOpen, open, error, disabled, modal };

  const content = typeof contentProp === 'function' ? contentProp(restProp) : contentProp;
  const triggerFn = typeof triggerProp === 'function' && triggerProp(restProp);

  const apiProps = {
    asChild: true,
    ref,
    type,
    role,
    id: id || name || formItemId,
    name: name || formItemId,
    'aria-invalid': !!error,
    disabled,
    'aria-disabled': ariaDisabled || (disabled ? 'true' : undefined),
    'aria-describedby': !error ? cn(formDescriptionId) : cn(formDescriptionId, formMessageId),
    className: cn(className, classNames?.trigger),
    ...props
  };

  switch (openWith) {
    case 'popover':
      return (
        <Popover modal={modal} open={open} onOpenChange={setOpen}>
          {typeof triggerProp === 'function' ? triggerFn : <Popover.Trigger {...apiProps}>{triggerProp}</Popover.Trigger>}
          <Popover.Content align="end" className={cn('p-0 h-[356px] w-[--radix-popper-anchor-width] [--p-select-content:0]', classNames?.content)}>
            {content}
          </Popover.Content>
        </Popover>
      );

    case 'dialog':
    case 'alert-dialog':
      return (
        <Dialog modal={modal} open={open} onOpenChange={setOpen}>
          {typeof triggerProp === 'function' ? triggerFn : <Dialog.Trigger {...apiProps}>{triggerProp}</Dialog.Trigger>}
          <Dialog.Content
            important={openWith === 'alert-dialog'}
            classNames={{
              content: cn('p-4 h-[372px] max-lg:max-w-[80dvw] rounded-[1.25rem]', classNames?.content),
              close: cn('-top-2 -right-2 p-[0.375rem] bg-background-theme opacity-50 hover:opacity-100 hover:scale-110 transition-all rounded-full')
            }}
          >
            {content}
          </Dialog.Content>
        </Dialog>
      );

    case 'drawer':
      return (
        <Drawer modal={modal} open={open} onOpenChange={setOpen}>
          {typeof triggerProp === 'function' ? triggerFn : <Drawer.Trigger {...apiProps}>{triggerProp}</Drawer.Trigger>}
          <Drawer.Content
            classNames={{
              content: cn('p-4 rounded-t-[1.25rem] h-[86%] lg:max-h-[68.5%] mt-24', classNames?.content),
              close: cn('-mt-1 mb-4')
            }}
          >
            {content}
          </Drawer.Content>
        </Drawer>
      );

    default:
      return null;
  }
});
SheetsBreakpoint.displayName = 'SheetsBreakpoint';
