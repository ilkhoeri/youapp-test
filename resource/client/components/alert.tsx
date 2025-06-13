'use client';

import * as React from 'react';
import { Svg } from './ui/svg';
import { Button } from './ui/button';
import { twMerge as cn } from 'tailwind-merge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';

export function useOnAlert() {
  const [error, setError] = React.useState<string | undefined>();
  const [success, setSuccess] = React.useState<string | undefined>();

  React.useEffect(() => {
    const cleanupTimeout = setTimeout(() => {
      setError(undefined);
      setSuccess(undefined);
    }, 6000);

    return () => clearTimeout(cleanupTimeout);
  }, [error, success]);

  return { error, setError, success, setSuccess };
}

interface AlertProps extends React.ComponentProps<'dialog'> {
  success?: string | null;
  error?: string | null;
  description?: string | null;
  icon?: React.ReactNode;
  withCloseButton?: boolean;
}
export const Alert = React.forwardRef<HTMLDialogElement, AlertProps>((_props, ref) => {
  const { className, success, error, description, icon, children, withCloseButton = true, ...props } = _props;
  const [hidden, setHidden] = React.useState({ fase1: false, fase2: false });

  React.useEffect(() => {
    const cleanupTimeout = setTimeout(() => setHidden({ fase1: false, fase2: false }), 35);
    return () => clearTimeout(cleanupTimeout);
  }, [success, error]);

  const opened = success || error ? true : false;

  if (!(success || error) || hidden.fase2) return null;

  return (
    <dialog
      {...props}
      ref={ref}
      open={opened}
      className={cn(
        'relative w-full flex flex-wrap items-center justify-center my-4 p-3 rounded-md text-[16px] font-medium [transition:all_0.5s_ease] border-solid border border-[var(--cl)] text-[var(--cl)] [&>svg]:text-[var(--cl)] group',
        description && 'flex-col',
        success && '[--cl:#2499dd] bg-blue-500/10',
        error && '[--cl:#b22b2b] bg-red-500/10',
        hidden.fase1 && 'animate-hidden',
        className
      )}
    >
      {withCloseButton && (
        <button
          type="button"
          role="button"
          aria-label="close-button"
          onClick={() => {
            setHidden({ fase1: true, fase2: false });
            if (success || error) {
              setTimeout(() => setHidden({ fase1: false, fase2: true }), 35);
            }
          }}
          className={cn('absolute right-4 p-1 rounded-md transition-opacity border border-[var(--cl)] opacity-20 group-hover:opacity-70')}
        >
          <Svg size={16}>
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </Svg>
        </button>
      )}
      <div className="flex items-center gap-x-4">
        {success &&
          (icon || (
            <Svg currentFill="fill" size={28} xmlns="http://www.w3.org/2000/svg">
              <path d="M16.53 9.78a.75.75 0 0 0-1.06-1.06L11 13.19l-1.97-1.97a.75.75 0 0 0-1.06 1.06l2.5 2.5a.75.75 0 0 0 1.06 0l5-5Z" />
              <path d="m12.54.637 8.25 2.675A1.75 1.75 0 0 1 22 4.976V10c0 6.19-3.771 10.704-9.401 12.83a1.704 1.704 0 0 1-1.198 0C5.77 20.705 2 16.19 2 10V4.976c0-.758.489-1.43 1.21-1.664L11.46.637a1.748 1.748 0 0 1 1.08 0Zm-.617 1.426-8.25 2.676a.249.249 0 0 0-.173.237V10c0 5.46 3.28 9.483 8.43 11.426a.199.199 0 0 0 .14 0C17.22 19.483 20.5 15.461 20.5 10V4.976a.25.25 0 0 0-.173-.237l-8.25-2.676a.253.253 0 0 0-.154 0Z" />
            </Svg>
          ))}
        {error &&
          (icon || (
            <Svg size={28}>
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </Svg>
          ))}
        {children || success || error}
      </div>
      {description && <p className="text-xs mx-auto">{description}</p>}
    </dialog>
  );
}) as AlertComponent;
Alert.displayName = 'Alert';

type Selector = 'overlay' | 'content' | 'header' | 'headerWrap' | 'title' | 'description' | 'body' | 'onCancle' | 'onConfirm';
interface AlertModalProps {
  item?: string;
  onConfirm: () => void;
  icon?: React.ReactNode;
  title?: string;
  description?: string | string[];
  children?: React.ReactNode;
  deniedContent?: React.ReactNode;
  disabled?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classNames?: Partial<Record<Selector, string>>;
  className?: string;
}
export function AlertModal(_props: AlertModalProps) {
  const {
    onConfirm,
    icon,
    disabled,
    item,
    classNames,
    className,
    children,
    deniedContent,
    title = 'Remove Item',
    description = ['Tindakan ini tidak dapat dibatalkan.', 'Setelah Anda menghapusnya, tidak ada jalan kembali.', 'Teliti dahulu.'],
    ...props
  } = _props;
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const isDisabled = !mounted || disabled;

  return (
    <Dialog {...props}>
      <DialogContent
        tabIndex={0}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        classNames={classNames}
        className={cn('p-0 max-sm:max-w-[87dvw] max-sm:rounded-xl', classNames?.content, className)}
      >
        {deniedContent || (
          <>
            <DialogHeader className={cn('pt-6 px-6', classNames?.header)}>
              {icon}
              <div className={cn('grid', classNames?.headerWrap)}>
                {title && <DialogTitle className={cn('text-color mb-4', classNames?.title)}>{title}</DialogTitle>}

                {description && Array.isArray(description) ? (
                  <ul className="text-sm text-muted-foreground pl-5 list-disc marker:font-normal [&>li]:mt-2">
                    {description.map((i, index) => (
                      <li key={index} className={cn('text-[15px] text-red-500', classNames?.description)}>
                        {i}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <DialogDescription className={classNames?.description}>{description}</DialogDescription>
                )}
              </div>
            </DialogHeader>

            <div tabIndex={0} className={cn('px-6 w-full max-w-full overflow-hidden', classNames?.body)}>
              {children ||
                (item && (
                  <p className="mt-2 line-clamp-1" title={item}>
                    {item}
                  </p>
                ))}

              <hr className="absolute w-full min-w-full left-0 right-0 mt-6" />

              <div className="pt-4 pb-6 mt-8 gap-x-4 grid grid-flow-col grid-cols-2 items-center w-full">
                <Button disabled={isDisabled} variant="outline" size="sm" onClick={() => props?.onOpenChange(false)} className={classNames?.onCancle}>
                  Cancel
                </Button>
                <Button type="button" disabled={isDisabled} variant="danger" size="sm" onClick={onConfirm} className={cn(isDisabled && 'load_', classNames?.onConfirm)}>
                  Remove
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Export as a composite component
type AlertComponent = React.ForwardRefExoticComponent<AlertProps> & {
  Modal: typeof AlertModal;
  hooks: typeof useOnAlert;
};
// Attach sub-components
Alert.Modal = AlertModal;
Alert.hooks = useOnAlert;
