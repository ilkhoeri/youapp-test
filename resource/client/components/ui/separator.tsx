'use client';

import * as React from 'react';
import { cvx, cvxVariants } from 'xuxi';
import { cn } from 'cn';

const separatorVariant = cvx({
  assign: 'shrink-0 m-0 bg-transparent',
  variants: {
    variant: {
      default: 'border-solid',
      dashed: 'border-dashed'
    },
    orientation: {
      horizontal: 'h-0 w-full border-b border-b-[var(--palette-divider)]',
      vertical: 'h-full w-0 border-r border-r-[var(--palette-divider)]'
    }
  }
});

export interface SeparatorProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, cvxVariants<typeof separatorVariant> {}

export const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(({ className, variant = 'default', orientation = 'horizontal', ...props }, ref) => (
  <div ref={ref} data-orientation={orientation} className={cn(separatorVariant({ variant, orientation }), className)} {...props} />
));
Separator.displayName = 'Separator';
