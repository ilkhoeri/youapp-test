'use client';

import * as React from 'react';
import { twMerge } from 'tailwind-merge';

interface DescriptionProps {
  className?: string;
  desc?: string;
  children?: React.ReactNode;
}

type descRef = React.ForwardRefExoticComponent<DescriptionProps & React.RefAttributes<HTMLParagraphElement>>;

export const Description = React.forwardRef<React.ElementRef<descRef>, React.ComponentPropsWithoutRef<descRef>>(({ className, children, desc, ...props }, ref) => (
  <p ref={ref} className={twMerge('w-full text-muted-foreground leading-none text-[12px] text-left truncate', className)} {...props}>
    {children || desc}
  </p>
));
Description.displayName = Description.displayName;
