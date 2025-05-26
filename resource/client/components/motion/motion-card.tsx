'use client';
import * as React from 'react';
import * as motion from 'motion/react-client';
import { cn } from 'cn';

interface MotionCardDependProps extends Omit<React.ComponentProps<typeof motion.div>, 'children'> {
  name: string;
  header?: React.ReactNode;
  children: React.ReactNode;
  classNames?: Partial<Record<'root' | 'content' | 'header' | 'body', string>>;
}

export interface MotionCardProps extends MotionCardDependProps {}

export const MotionCard = React.forwardRef<React.ElementRef<typeof motion.div>, MotionCardProps>((_props, ref) => {
  const { name, header, children, className, classNames, ...props } = _props;
  return (
    <motion.div {...props} ref={ref} layoutId={`card-${name}`} className={cn(classNames?.root, className)}>
      <motion.div layoutId={`card-content-${name}`} className={cn(classNames?.content)}>
        {header && (
          <motion.div layoutId={`card-header-${name}`} className={cn(classNames?.header)}>
            {header}
          </motion.div>
        )}
        <motion.div layoutId={`card-body-${name}`} className={cn(classNames?.body)}>
          {children}
        </motion.div>
      </motion.div>
    </motion.div>
  );
});
MotionCard.displayName = 'MotionCard';

export type MotionCardModalProps = MotionCardDependProps & {
  open: boolean;
  onOpenChange: (prev: boolean | ((prev: boolean) => boolean)) => void;
  classNames?: Partial<Record<'container', string>>;
};

export const MotionCardModal = React.forwardRef<React.ElementRef<typeof motion.div>, MotionCardModalProps>((_props, ref) => {
  const { name, open, onOpenChange, header, children, classNames, ...props } = _props;

  if (!open) return null;

  return (
    <motion.div {...props} ref={ref} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={cn('fixed inset-0 z-50 p-4', classNames?.container)}>
      <motion.div layoutId={`card-${name}`} className={cn('overflow-hidden max-w-2xl w-full max-h-[90vh] h-full overflow-y-auto', classNames?.root)} onClick={e => e.stopPropagation()}>
        <motion.div layoutId={`card-content-${name}`} className={cn('group/content', classNames?.content)}>
          {header && (
            <motion.div layoutId={`card-header-${name}`} className={cn(classNames?.header)}>
              {header}
            </motion.div>
          )}
          <motion.div layoutId={`card-body-${name}`} className={cn(classNames?.body)}>
            {children}
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
});
MotionCardModal.displayName = 'MotionCardModal';
