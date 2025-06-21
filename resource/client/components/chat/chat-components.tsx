import * as React from 'react';
import * as motion from 'motion/react-client';
import { ChevronFillIcon } from '../icons-fill';

interface ScrollToBottomProps extends React.ComponentPropsWithRef<typeof motion.div> {
  visible?: boolean;
}
export function ChatScrollBotton(_props: ScrollToBottomProps) {
  const { visible, ...props } = _props;
  return (
    <motion.div
      {...props}
      role="button"
      whileHover={visible ? { scale: 1.15 } : {}}
      animate={visible ? { scale: 1 } : { scale: 0 }}
      aria-label="Scroll To Bottom"
      className="[--sz:42px] size-[--sz] min-h-[--sz] min-w-[--sz] max-h-[--sz] max-w-[--sz] rounded-full centered absolute right-[11px] top-[calc((70px+17px)*-0.75)] z-[20] bg-muted dark:bg-[#182229] text-muted-foreground"
      onContextMenu={e => e.preventDefault()}
    >
      <ChevronFillIcon chevron="down" size={32} />
    </motion.div>
  );
}
