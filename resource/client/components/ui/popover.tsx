'use client';

import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';

import { twMerge } from 'tailwind-merge';

export const Popover = PopoverPrimitive.Root as PopoverComponent;

export const PopoverTrigger = PopoverPrimitive.Trigger;

export const PopoverAnchor = PopoverPrimitive.Anchor;

interface PopoverTriggerProps extends React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> {
  unstyled?: boolean;
}
export const PopoverContent = React.forwardRef<React.ElementRef<typeof PopoverPrimitive.Content>, PopoverTriggerProps>(
  ({ className, unstyled, align = 'center', sideOffset = 4, ...props }, ref) => (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        className={twMerge(
          !unstyled &&
            'relative z-[106] max-h-96 min-w-[162px] w-72 rounded-lg border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
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
          'relative flex cursor-pointer select-none items-center rounded-md px-2 py-1.5 text-sm font-medium outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus-visible:ring-0 hover:bg-muted/60',
        className
      )}
      {...props}
    />
  );
});
PopoverItem.displayName = 'PopoverItem';

// Export as a composite component
interface PopoverComponent extends React.FC<PopoverPrimitive.PopoverProps> {
  Trigger: typeof PopoverTrigger;
  Anchor: typeof PopoverAnchor;
  Content: typeof PopoverContent;
  Item: typeof PopoverItem;
}
// Attach sub-components
Popover.Trigger = PopoverTrigger;
Popover.Anchor = PopoverAnchor;
Popover.Content = PopoverContent;
Popover.Item = PopoverItem;
