'use client';
import * as React from 'react';
import * as motion from 'motion/react-client';
import { XIcon } from '../icons';
import { cn } from 'cn';

interface MotionImageProps extends Omit<React.ComponentProps<typeof motion.div>, 'children'> {
  src: string;
  name: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: React.SetStateAction<boolean>) => void;
  children?: React.ReactNode;
  disabled?: boolean;
  classNames?: Partial<Record<'container' | 'image' | 'containerModal' | 'imageModal' | 'closeModal' | 'portalModal', string>>;
}

export const MotionImage = React.forwardRef<React.ElementRef<typeof motion.div>, MotionImageProps>((_props, ref) => {
  const { src, name, open: openProp, defaultOpen = false, onOpenChange: setOpenProp, children, disabled, className, classNames, ...props } = _props;

  const [_open, _setOpen] = React.useState(defaultOpen);
  const open = openProp ?? _open;
  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === 'function' ? value(open) : value;
      if (setOpenProp) setOpenProp(openState);
      else _setOpen(openState);
    },
    [setOpenProp, open]
  );

  return (
    <>
      <motion.div
        {...props}
        ref={ref}
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
        layoutId={`container-${name}`}
        onClick={() => setOpen(o => !o)}
        className={cn(classNames?.container, className)}
        aria-disabled={disabled ? 'true' : undefined}
      >
        <motion.img
          layoutId={`image-${name}`}
          src={src}
          alt={name ?? ''}
          aria-disabled={disabled ? 'true' : undefined}
          className={cn('size-full absolute inset-0 object-cover bg-transparent rounded-[inherit] object-center align-middle', classNames?.image)}
        />
      </motion.div>

      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn('fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70', classNames?.portalModal)}
          onClick={() => setOpen(false)}
        >
          <motion.div
            layoutId={`container-${name}`}
            className={cn('relative max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden bg-background', classNames?.containerModal)}
            onClick={e => e.stopPropagation()}
          >
            <motion.img
              aria-disabled={disabled ? 'true' : undefined}
              layoutId={`image-${name}`}
              src={src}
              alt={name ?? ''}
              className={cn('w-full h-auto object-contain aria-disabled:opacity-50', classNames?.imageModal)}
            />
            {children}
            <motion.button
              disabled={disabled}
              aria-disabled={disabled ? 'true' : undefined}
              className={cn(
                'aria-disabled:pointer-events-none disabled:pointer-events-none disabled:opacity-50 absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-background-theme/50 text-white/80 hover:bg-background-theme hover:text-white',
                classNames?.closeModal
              )}
              onClick={() => setOpen(false)}
              whileHover={{ scale: 1.1, opacity: 1 }}
              whileTap={{ scale: 0.9, opacity: 1 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.2 } }}
            >
              <XIcon size={20} />
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </>
  );
});
MotionImage.displayName = 'MotionImage';
