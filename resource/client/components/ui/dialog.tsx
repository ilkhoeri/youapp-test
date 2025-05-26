'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import Svg from './svg';
import { IsRole } from '@/resource/types/user';
import { useApp } from '../../contexts/app-provider';
import { cvx, cvxVariants } from 'xuxi';
import { cn } from 'cn';

interface CtxProps {
  strictByRole: boolean;
  openDialog: boolean;
  setOpenDialog: (o: React.SetStateAction<boolean>) => void;
}

interface DialogProps {
  strictRole?: boolean | IsRole | IsRole[];
  children: React.ReactNode | ((ctx: CtxProps) => React.ReactNode);
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?(o: React.SetStateAction<boolean>): void;
  modal?: boolean;
}

const ctx = React.createContext<CtxProps | undefined>(undefined);

export function useDialog() {
  const _ctx = React.useContext(ctx)!;
  return _ctx;
}

export function DialogRoot(_props: DialogProps) {
  const { children, strictRole = false, defaultOpen = false, open: openProp, onOpenChange: setOpenProp, ...props } = _props;
  const { user } = useApp();

  const [_open, _setOpen] = React.useState<boolean>(defaultOpen);
  const openDialog = (openProp ?? _open) as boolean;
  const setOpenDialog = (setOpenProp ?? _setOpen) as React.Dispatch<React.SetStateAction<boolean>>;

  if (!user) return null;

  const strictByRole = strictRole && typeof strictRole !== 'boolean' ? (Array.isArray(strictRole) ? !strictRole.includes(user?.role) : user?.role !== strictRole) : strictRole === true;

  if (strictByRole) return null;

  const contextValue: CtxProps = { strictByRole, openDialog, setOpenDialog };

  return (
    <ctx.Provider value={contextValue}>
      <DialogPrimitive.Root open={openDialog} onOpenChange={setOpenDialog} defaultOpen={defaultOpen} {...props}>
        {typeof children === 'function' ? children(contextValue) : children}
      </DialogPrimitive.Root>
    </ctx.Provider>
  );
}

export const Dialog = DialogRoot as DialogComponent;

// export const Dialog = DialogPrimitive.Root as DialogComponent;

export const DialogTrigger = DialogPrimitive.Trigger;

type classNames = {
  className?: string;
};

export const DialogPortal = ({ className, children, ...props }: DialogPrimitive.DialogPortalProps & classNames) => <DialogPrimitive.Portal {...props}>{children}</DialogPrimitive.Portal>;
DialogPortal.displayName = DialogPrimitive.Portal.displayName;

export const DialogOverlay = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Overlay>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay> & { important?: boolean }>(
  ({ className, important, ...props }, ref) => {
    const Overlay = !important ? DialogPrimitive.Overlay : ('div' as React.ElementType);
    return (
      <Overlay
        ref={ref}
        className={cn(
          'fixed inset-0 z-[101] bg-background/80 backdrop-blur-sm transition-all duration-100 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in',
          className
        )}
        {...props}
      />
    );
  }
);
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const dialogContentClasses = cvx({
  assign:
    'fixed left-[50%] top-[50%] z-[104] w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 bg-background-theme p-6 duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-xl focus-visible:outline-0 [&>*]:focus-visible:outline-0',
  variants: {
    variant: {
      default: 'grid border shadow-lg',
      form: 'flex flex-col max-w-3xl md:shadow-lg max-md:border-0 md:border max-md:rounded-none max-md:h-svh max-md:min-h-svh max-md:w-full max-md:max-w-full md:max-h-[90svh] md:max-w-[90dvw] min-[876px]:max-w-3xl min-[876px]:max-h-[90svh] min-[876px]:h-[90svh]'
    }
  },
  defaultVariants: { variant: 'default' }
});

export interface DialogContentProps extends Omit<React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>, 'title'>, cvxVariants<typeof dialogContentClasses> {
  disabled?: boolean;
  title?: React.ReactNode;
  description?: React.ReactNode;
  important?: boolean;
  classNames?: Partial<Record<'overlay' | 'close' | 'content' | 'header' | 'title' | 'description', string>>;
}
export const DialogContent = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, DialogContentProps>(
  ({ className, disabled, children, classNames, tabIndex = -1, title, description, variant = 'default', important, ...props }, ref) => (
    <DialogPortal>
      <DialogOverlay important={important} tabIndex={-1} className={classNames?.overlay} />
      <DialogPrimitive.Content {...props} ref={ref} tabIndex={tabIndex} aria-disabled={disabled} className={cn(dialogContentClasses({ variant }), className, classNames?.content)}>
        {(title || description) && (
          <div className={cn('flex flex-col flex-nowrap space-y-1.5 text-left', classNames?.header)}>
            {title && (
              <DialogPrimitive.Title className={cn('text-[1.0625rem] md:text-[1.125rem] flex-[0_0_auto] font-semibold leading-none tracking-tight mb-2', classNames?.title)}>
                {title}
              </DialogPrimitive.Title>
            )}
            {description && <p className={cn('text-sm text-muted-foreground mb-6', classNames?.description)}>{description}</p>}
          </div>
        )}
        {children}
        {!important && (
          <DialogPrimitive.Close
            tabIndex={0}
            disabled={disabled}
            className={cn(
              'absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground ring-offset-background focus:ring-0 focus:ring-ring focus:ring-offset-0 focus:outline-0 focus-visible:outline-0 focus-visible:ring-0',
              classNames?.close
            )}
          >
            <Svg size={16}>
              <path d="M18 6l-12 12" />
              <path d="M6 6l12 12" />
            </Svg>
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
        <DialogPrimitive.Title className="hidden sr-only" />
      </DialogPrimitive.Content>
    </DialogPortal>
  )
);
DialogContent.displayName = DialogPrimitive.Content.displayName;

export const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col flex-nowrap space-y-1.5 text-left', className)} {...props} />
);
DialogHeader.displayName = 'DialogHeader';

export const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end', className)} {...props} />
);
DialogFooter.displayName = 'DialogFooter';

export const DialogTitle = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Title>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>>(
  ({ className, ...props }, ref) => <DialogPrimitive.Title ref={ref} className={cn('text-[1.5rem] font-semibold leading-none tracking-tight mb-2', className)} {...props} />
);
DialogTitle.displayName = DialogPrimitive.Title.displayName;

export const DialogDescription = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Description>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>>(
  ({ className, ...props }, ref) => <DialogPrimitive.Description ref={ref} className={cn('text-sm text-muted-foreground mb-6', className)} {...props} />
);
DialogDescription.displayName = DialogPrimitive.Description.displayName;

// Export as a composite component
interface DialogComponent extends React.FC<DialogProps> {
  Trigger: typeof DialogTrigger;
  Content: typeof DialogContent;
  Header: typeof DialogHeader;
  Footer: typeof DialogFooter;
  Title: typeof DialogTitle;
  Description: typeof DialogDescription;
}
// Attach sub-components
Dialog.Trigger = DialogTrigger;
Dialog.Content = DialogContent;
Dialog.Header = DialogHeader;
Dialog.Footer = DialogFooter;
Dialog.Title = DialogTitle;
Dialog.Description = DialogDescription;
