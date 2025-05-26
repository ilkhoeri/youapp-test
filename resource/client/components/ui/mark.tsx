import React from 'react';
import { twMerge } from 'tailwind-merge';

export interface MarkProps extends React.ComponentProps<'mark'> {
  className?: string;
  childTrue?: React.ReactNode;
  childFalse?: React.ReactNode;
  value: boolean | string | number;
}

export const Mark = React.forwardRef<HTMLElement, MarkProps>((_props, ref) => {
  const { children, className, value, ...props } = _props;

  const parseValue = (typeof value === 'boolean' && value === true) || (typeof value === 'string' && value !== '') || (typeof value === 'number' && value > 0);

  return (
    <mark
      ref={ref}
      className={twMerge(
        'px-1 h-4 leading-[16px] font-mono font-bold text-center uppercase rounded text-black w-max text-[0.75rem] ',
        parseValue ? 'bg-[#2ea043] tracking-wide' : 'bg-[#e54b4b] tracking-[0]',
        className
      )}
      {...props}
    >
      {children || String(value)}
    </mark>
  );
});
Mark.displayName = 'Mark';
