'use client';

import * as React from 'react';

import { cvx, type cvxVariants } from 'xuxi';
import { cn } from 'cn';

export const labelVariants = cvx({
  assign: 'relative z-[9] select-none text-left peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
  variants: {
    size: {
      lg: 'inline whitespace-nowrap text-base text-color font-semibold mr-auto mt-[calc(var(--space-y,0.5rem)/2)]',
      md: 'inline-flex items-center text-sm font-medium leading-none'
    },
    variant: {
      'split-button': 'cursor-pointer whitespace-nowrap',
      button: 'cursor-pointer rounded-sm py-0.5 px-1 font-medium whitespace-nowrap bg-color text-background active:bg-red-600 active:text-white'
    }
  },
  defaultVariants: {
    size: 'md'
  }
});

export const Label = React.forwardRef<React.ElementRef<'label'>, React.ComponentPropsWithoutRef<'label'> & cvxVariants<typeof labelVariants>>(
  ({ className, size = 'md', ...props }, ref) => <label ref={ref} className={cn(labelVariants({ size }), className)} {...props} />
);
Label.displayName = 'Label';
