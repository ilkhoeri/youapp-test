import React from 'react';
import { cn } from 'cn';

interface ChatBackgroundProps extends React.ComponentProps<'div'> {
  visible?: boolean | null;
  style?: React.CSSProperties & Record<string, any>;
}
export function ChatBackground(_props: ChatBackgroundProps) {
  const { visible, className, style, ...props } = _props;

  return (
    <div
      {...props}
      className={cn('size-full top-0 left-0 absolute bg-repeat bg-[#efeae2] dark:opacity-[0.06] dark:bg-background-theme', className)}
      {...{ style: { backgroundImage: 'url(/images/message-bg.png)', ...style } }}
    />
  );
}
