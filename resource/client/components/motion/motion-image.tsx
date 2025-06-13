'use client';
import * as React from 'react';
import * as motion from 'motion/react-client';
import { XIcon } from '../icons';
import { cn } from 'cn';
import { Portal } from '@/resource/hooks/use-open-state';
import { useModal } from '@/resource/hooks/use-modal';

type MotionImageTrees = 'container' | 'image' | 'containerModal' | 'imageModal' | 'closeModal' | 'portalModal';
interface MotionImageProps extends Omit<React.ComponentProps<typeof motion.div>, 'children'> {
  src: string;
  name: string;
  modal?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: React.SetStateAction<boolean>) => void;
  children?: React.ReactNode;
  disabled?: boolean;
  classNames?: Partial<Record<MotionImageTrees, string>>;
  unstyled?: boolean | Partial<Record<MotionImageTrees, boolean>>;
}

export const MotionImage = React.forwardRef<React.ElementRef<typeof motion.div>, MotionImageProps>((_props, ref) => {
  const { src, name, modal, open: openProp, defaultOpen = false, onOpenChange: setOpenProp, children, disabled, className, classNames, unstyled: u, ...props } = _props;

  const { open, setOpen, isRender } = useModal({ modal, defaultOpen, open: openProp, onOpenChange: setOpenProp });

  const isUnstyled = (k: MotionImageTrees) => (typeof u === 'object' ? u[k] : u);

  return (
    <>
      <motion.div
        {...props}
        ref={ref}
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
        layoutId={`container-${name}`}
        onClick={() => setOpen(o => !o)}
        className={cn(!isUnstyled('container') && '', classNames?.container, className)}
        aria-disabled={disabled ? 'true' : undefined}
      >
        <motion.img
          layoutId={`image-${name}`}
          src={src}
          alt={name ?? ''}
          aria-disabled={disabled ? 'true' : undefined}
          className={cn(!isUnstyled('image') && 'size-full absolute inset-0 object-cover bg-transparent rounded-[inherit] object-center align-middle', classNames?.image)}
        />
      </motion.div>

      {/* {open && ( )} */}
      <Portal render={isRender}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn(!isUnstyled('portalModal') && 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70', classNames?.portalModal)}
          onClick={() => setOpen(false)}
        >
          <motion.div
            layoutId={`container-${name}`}
            className={cn(!isUnstyled('containerModal') && 'relative max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden bg-background', classNames?.containerModal)}
            onClick={e => e.stopPropagation()}
          >
            <motion.img
              aria-disabled={disabled ? 'true' : undefined}
              layoutId={`image-${name}`}
              src={src}
              alt={name ?? ''}
              className={cn(!isUnstyled('imageModal') && 'w-full h-auto object-contain aria-disabled:opacity-50', classNames?.imageModal)}
            />
            {children}
            <motion.button
              disabled={disabled}
              aria-disabled={disabled ? 'true' : undefined}
              className={cn(
                !isUnstyled('closeModal') &&
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
      </Portal>
    </>
  );
});
MotionImage.displayName = 'MotionImage';
