'use client';

import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';

import { twMerge } from 'tailwind-merge';
import { ChevronIcon } from '../icons';

export const Popover = PopoverPrimitive.Root as PopoverComponent;

export const PopoverTrigger = PopoverPrimitive.Trigger;

export const PopoverAnchor = PopoverPrimitive.Anchor;

interface PopoverContentProps extends React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> {
  unstyled?: boolean;
  orientation?: 'horizontal' | 'vertical';
}
export const PopoverContent = React.forwardRef<React.ElementRef<typeof PopoverPrimitive.Content>, PopoverContentProps>(
  ({ className, unstyled, align = 'center', orientation = 'vertical', sideOffset = 4, onContextMenu, ...props }, ref) => (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        data-orientation={orientation}
        aria-orientation={orientation}
        sideOffset={sideOffset}
        onContextMenu={e => {
          e.preventDefault();
          onContextMenu?.(e);
        }}
        className={twMerge(
          !unstyled &&
            'relative z-[106] max-h-96 min-w-[162px] w-72 rounded-xl border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  )
);
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export const PopoverItem = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement> & {
    orientation?: 'horizontal' | 'vertical';
    el?: React.ElementType;
    ref?: React.Ref<HTMLElement>;
    unstyled?: boolean;
  }
>(({ className, unstyled, el = 'div', orientation = 'horizontal', ...props }, ref) => {
  let Item = el as React.ElementType;
  return (
    <Item
      ref={ref}
      role="menuitem"
      tabIndex={0}
      data-orientation={orientation}
      className={twMerge(
        !unstyled &&
          'relative flex cursor-pointer select-none items-center rounded-md px-2 py-1.5 text-sm font-medium outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus-visible:ring-0 hover:bg-card',
        className
      )}
      {...props}
    />
  );
});
PopoverItem.displayName = 'PopoverItem';

export const PopoverSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    orientation?: 'horizontal' | 'vertical';
    unstyled?: boolean;
  }
>(({ className, unstyled, orientation = 'horizontal', ...props }, ref) => {
  return <div ref={ref} role="separator" tabIndex={-1} data-orientation={orientation} className={twMerge(!unstyled && 'bg-border -mx-1 my-1 h-px', className)} {...props} />;
});
PopoverSeparator.displayName = 'PopoverSeparator';

export const PopoverShortcut = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & {
    unstyled?: boolean;
  }
>(({ className, unstyled, ...props }, ref) => {
  return <span ref={ref} role="note" tabIndex={-1} className={twMerge(!unstyled && 'text-muted-foreground ml-auto text-xs tracking-widest', className)} {...props} />;
});
PopoverShortcut.displayName = 'PopoverShortcut';

export const PopoverSub = PopoverPrimitive.Root;

export const PopoverSubTrigger = React.forwardRef<
  HTMLButtonElement,
  React.HTMLAttributes<HTMLButtonElement> & {
    inset?: boolean;
    unstyled?: boolean;
  }
>(({ className, unstyled, inset, children, ...props }, ref) => {
  return (
    <PopoverPrimitive.Trigger
      ref={ref}
      type="button"
      role="button"
      tabIndex={0}
      data-inset={inset}
      className={twMerge(
        !unstyled &&
          "flex w-full cursor-pointer select-none items-center rounded-lg px-2 py-1.5 text-sm outline-none focus:text-accent-foreground data-[state=open]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        'data-[state=open]:bg-background-theme/20',
        inset && 'pl-8',
        className
      )}
      {...props}
    >
      {children}
      <ChevronIcon chevron="right" className="ml-auto" />
    </PopoverPrimitive.Trigger>
  );
});
PopoverSubTrigger.displayName = 'PopoverSubTrigger';

export const PopoverSubContent = React.forwardRef<React.ElementRef<typeof PopoverPrimitive.Content>, PopoverContentProps>(
  ({ className, unstyled, orientation = 'vertical', align = 'start', side = 'right', onContextMenu, ...props }, ref) => {
    return (
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align={align}
          side={side}
          ref={ref}
          tabIndex={-1}
          data-orientation={orientation}
          aria-orientation={orientation}
          onContextMenu={e => {
            e.preventDefault();
            onContextMenu?.(e);
          }}
          className={twMerge(
            !unstyled &&
              'z-[108] min-w-[8rem] overflow-hidden rounded-xl border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[var(--radix-context-menu-content-transform-origin)]',
            className
          )}
          {...props}
        />
      </PopoverPrimitive.Portal>
    );
  }
);
PopoverSubContent.displayName = 'PopoverSubContent';

// Export as a composite component
interface PopoverComponent extends React.FC<PopoverPrimitive.PopoverProps> {
  Trigger: typeof PopoverTrigger;
  Anchor: typeof PopoverAnchor;
  Content: typeof PopoverContent;
  Item: typeof PopoverItem;
  Separator: typeof PopoverSeparator;
  Shortcut: typeof PopoverShortcut;
  Sub: typeof PopoverSub;
  SubTrigger: typeof PopoverSubTrigger;
  SubContent: typeof PopoverSubContent;
}
// Attach sub-components
Popover.Trigger = PopoverTrigger;
Popover.Anchor = PopoverAnchor;
Popover.Content = PopoverContent;
Popover.Item = PopoverItem;
Popover.Separator = PopoverSeparator;
Popover.Shortcut = PopoverShortcut;
Popover.Sub = PopoverSub;
Popover.SubTrigger = PopoverSubTrigger;
Popover.SubContent = PopoverSubContent;
