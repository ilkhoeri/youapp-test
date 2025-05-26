import * as React from 'react';
import { cvx, type cvxVariants } from 'xuxi';
import { cn } from 'cn';

export const badgeVariants = cvx({
  assign:
    'inline-flex flex-row items-center text-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors backdrop-blur-[25px] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-default',
  variants: {
    color: {
      default: 'border-transparent bg-primary dark:bg-[#ffffff0f] text-color hover:bg-primary/80',
      gold: 'border-yellow-600 bg-yellow-100 text-yellow-600 hover:bg-yellow-200/80',
      secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
      destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
      constructive: 'border-cyan-600 bg-cyan-100 text-blue-500 hover:bg-cyan-200/80',
      conservative: 'border-green-600 bg-green-400/10 text-green-500 hover:bg-green-200/80',
      outline: 'text-foreground'
    },
    size: {
      md: '',
      lg: 'py-2 px-4 gap-2.5 border-0 text-sm font-medium'
    }
  }
  // defaultVariants: {
  //   variant: 'default'
  // }
});

export interface BadgeProps extends Omit<React.ComponentPropsWithRef<'div'>, 'color'>, cvxVariants<typeof badgeVariants> {}

export function Badge(_props: BadgeProps) {
  const { className, color = 'default', size = 'md', ...props } = _props;
  return <div {...props} className={cn(badgeVariants({ color, size }), className)} />;
}
