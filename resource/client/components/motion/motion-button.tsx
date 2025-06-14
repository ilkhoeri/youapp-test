'use client';
import * as React from 'react';
import * as motion from 'motion/react-client';
import { cn } from 'cn';
import { Portal } from '@/resource/hooks/use-open-state';
import { useModal } from '@/resource/hooks/use-modal';

export interface MotionButtonProps extends React.ComponentProps<typeof motion.button> {
  name: string;
}

export const MotionButton = React.forwardRef<React.ElementRef<typeof motion.button>, MotionButtonProps>((_props, ref) => {
  const { name, className, ...props } = _props;
  return <motion.button {...props} ref={ref} layoutId={`button-content-${name}`} className={cn(className)} />;
});
MotionButton.displayName = 'MotionButton';

export type MotionButtonModalProps = {
  header?: React.ReactNode;
  modal?: boolean;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (prev: boolean | ((prev: boolean) => boolean)) => void;
  name: string;
  children: React.ReactNode;
  classNames?: Partial<Record<'root' | 'container' | 'content' | 'header' | 'body', string>>;
};

export const MotionButtonModal = React.forwardRef<React.ElementRef<typeof motion.div>, MotionButtonModalProps>((_props, ref) => {
  const { name, modal, defaultOpen, open: openProp, onOpenChange: setOpenProp, header, classNames, ...props } = _props;

  const { open, setOpen, isRender } = useModal({ modal, defaultOpen, open: openProp, onOpenChange: setOpenProp });

  if (!open) return null;

  return (
    <Portal render={isRender}>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: open ? 1 : 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className={cn('fixed inset-0 z-50 p-4', classNames?.container)}
      >
        <motion.div
          key="modal"
          layoutId={`button-${name}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: open ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className={cn('overflow-hidden max-w-2xl w-full max-h-[90vh] h-full overflow-y-auto', classNames?.root)}
          onClick={e => e.stopPropagation()}
        >
          <motion.div
            layoutId={`button-content-${name}`}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30
            }}
            className={cn('group/content', classNames?.content)}
          >
            {header && (
              <motion.div layoutId={`button-header-${name}`} className={cn(classNames?.header)}>
                {header}
              </motion.div>
            )}
            <motion.div {...props} ref={ref} layoutId={`button-body-${name}`} className={cn(classNames?.body)} />
          </motion.div>
        </motion.div>
      </motion.div>
    </Portal>
  );
});
MotionButtonModal.displayName = 'MotionButtonModal';
