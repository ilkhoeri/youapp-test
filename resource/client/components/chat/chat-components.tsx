import * as React from 'react';
import { motion } from 'framer-motion';
import { ChevronFillIcon } from '../icons-fill';
import { cn } from 'cn';

interface ScrollToBottomProps extends React.ComponentPropsWithRef<typeof motion.div> {
  visible?: boolean;
  unseenTotal?: number | null | undefined;
}
export function ChatScrollBotton(_props: ScrollToBottomProps) {
  const { visible, unseenTotal, className, ...props } = _props;

  const unvisible = !visible;

  const unseen = unseenTotal && unseenTotal > 0;

  return (
    <motion.div
      {...props}
      role="button"
      whileHover={unvisible ? { scale: 1.15 } : {}}
      animate={unvisible ? { scale: 1 } : { scale: 0 }}
      initial={{ scale: 0 }}
      aria-label="Scroll To Bottom"
      className={cn(
        'absolute rounded-full centered',
        unseen
          ? 'px-3 py-1 min-h-9 w-max bg-muted/20 backdrop-blur-sm text-sm font-medium flex-row top-[calc(70px*-0.75)] z-[20] left-1/2 -translate-x-1/2 text-blue-400'
          : '[--sz:42px] size-[--sz] min-h-[--sz] min-w-[--sz] max-h-[--sz] max-w-[--sz] right-[11px] top-[calc((70px+17px)*-0.75)] z-[20] bg-muted dark:bg-[#182229] text-muted-foreground',
        className
      )}
      onContextMenu={e => e.preventDefault()}
    >
      {unseen ? `New (${unseenTotal})` : <ChevronFillIcon chevron="down" size={32} />}
    </motion.div>
  );
}
