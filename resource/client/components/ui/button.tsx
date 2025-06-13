import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cvx, type cvxVariants } from 'xuxi';
import { cn } from 'cn';

const buttonVariants = cvx({
  assign:
    'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-transform active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-transparent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  variants: {
    variant: {
      green: 'text-white font-bold bg-[#238636] hover:bg-[#2ea043] shadow',
      danger: 'text-white font-bold bg-red-600 hover:bg-red-600/80 hover:bg[#da3633] shadow',
      blue: 'text-white font-bold bg-[#0b6ec5] hover:bg-[#3b82f6] shadow',
      default: 'text-primary-foreground bg-primary hover:bg-primary/90',
      destructive: 'text-destructive-foreground bg-destructive hover:bg-destructive/90',
      outline: 'border bg-background hover:bg-muted',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      ghost: 'hover:bg-[#e4ebf1] dark:hover:bg-[#1c252e] text-muted-foreground hover:text-color transition-[transform,color,background-color,border-color]',
      link: 'text-primary underline-offset-4 hover:underline',
      base: 'bg-background hover:bg-muted',
      'rounded-tile': 'bg-background hover:bg-muted rounded-full'
    },
    size: {
      default: 'h-9 px-4 py-2',
      sm: 'h-8 px-3',
      lg: 'h-10 px-8',
      xl: 'h-12 px-8',
      '2xl': 'h-12 text-base font-semibold px-8',
      icon: '[--sz:32px] size-[var(--sz)] min-h-[var(--sz)] min-w-[var(--sz)]'
    }
  }
});

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, cvxVariants<typeof buttonVariants> {
  asChild?: boolean;
  unstyled?: boolean;
  // @ts-ignore
  formAction?: any;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, type = 'button', role = 'button', unstyled, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';
  return <Comp className={cn(!unstyled && buttonVariants({ variant, size }), className)} {...{ ref, type, role, ...props }} />;
});
Button.displayName = 'Button';

export { Button, buttonVariants };
