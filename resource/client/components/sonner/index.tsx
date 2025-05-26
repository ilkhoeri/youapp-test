'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

export const Toaster = (props: ToasterProps) => {
  const { theme = 'system' } = useTheme();
  return (
    <Sonner
      {...props}
      theme={theme as ToasterProps['theme']}
      position={props.position || 'top-center'}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast *:select-none *:pointer-events-none *:font-inter !z-[calc(121+var(--z-index,0))] group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg bg-background-theme [--border-radius:1rem]',
          description: 'group-[.toast]:text-muted-foreground group-[.toast]:whitespace-pre-wrap',
          actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
          title: 'whitespace-pre-wrap font-bold text-sm',
          icon: '[--sz:1.5rem] size-[var(--sz)] [&_svg]:size-[var(--sz)] relative flex items-center justify-center',
          loader:
            'group loader [&:where(.group.loader)]:![--size:calc(var(--sz)/1.5)] has-[.sonner-spinner]:top-1/2 has-[.sonner-spinner]:left-1/2 has-[.sonner-spinner]:-translate-x-1/2 has-[.sonner-spinner]:-translate-y-1/2 ',
          loading: 'loading'
        }
      }}
    />
  );
};
