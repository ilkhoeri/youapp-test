'use client';

import * as React from 'react';
import { Drawer as DrawerPrimitive } from 'vaul';
import { cn } from 'cn';

type DrawerProps = React.ComponentProps<typeof DrawerPrimitive.Root>;
const DrawerRoot = ({ shouldScaleBackground = true, setBackgroundColorOnScale = false, ...props }: DrawerProps) => (
  <DrawerPrimitive.Root shouldScaleBackground={shouldScaleBackground} setBackgroundColorOnScale={setBackgroundColorOnScale} {...props} />
);
DrawerRoot.displayName = 'Drawer';

const Drawer = DrawerRoot as DrawerComponent;

const DrawerTrigger = DrawerPrimitive.Trigger;

const DrawerPortal = DrawerPrimitive.Portal;

const DrawerClose = DrawerPrimitive.Close;

const DrawerOverlay = React.forwardRef<React.ElementRef<typeof DrawerPrimitive.Overlay>, React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>>(
  ({ className, ...props }, ref) => (
    <DrawerPrimitive.Overlay
      ref={ref}
      className={cn(
        'fixed inset-0 z-[50] bg-background/80 backdrop-blur-sm transition-all duration-100 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in',
        className
      )}
      {...props}
    />
  )
);
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName;

interface DrawerContentProps extends React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content> {
  classNames?: Partial<Record<'overlay' | 'close' | 'content', string>>;
}
const DrawerContent = React.forwardRef<React.ElementRef<typeof DrawerPrimitive.Content>, DrawerContentProps>(({ className, children, classNames, ...props }, ref) => (
  <DrawerPortal>
    <DrawerOverlay className={classNames?.overlay} />
    <DrawerPrimitive.Content
      ref={ref}
      className={cn('fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border bg-background-theme', className, classNames?.content)}
      {...props}
    >
      <div className={cn('mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted', classNames?.close)} />
      {children}
    </DrawerPrimitive.Content>
    <DrawerPrimitive.Title className="hidden sr-only" />
  </DrawerPortal>
));
DrawerContent.displayName = 'DrawerContent';

const DrawerHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn('grid gap-1.5 p-4 text-center sm:text-left', className)} {...props} />;
DrawerHeader.displayName = 'DrawerHeader';

const DrawerFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn('mt-auto flex flex-col gap-2 p-4', className)} {...props} />;
DrawerFooter.displayName = 'DrawerFooter';

const DrawerTitle = React.forwardRef<React.ElementRef<typeof DrawerPrimitive.Title>, React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Title ref={ref} className={cn('text-lg font-semibold leading-none tracking-tight', className)} {...props} />
));
DrawerTitle.displayName = DrawerPrimitive.Title.displayName;

const DrawerDescription = React.forwardRef<React.ElementRef<typeof DrawerPrimitive.Description>, React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>>(
  ({ className, ...props }, ref) => <DrawerPrimitive.Description ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
);
DrawerDescription.displayName = DrawerPrimitive.Description.displayName;

export { Drawer, DrawerPortal, DrawerOverlay, DrawerTrigger, DrawerClose, DrawerContent, DrawerHeader, DrawerFooter, DrawerTitle, DrawerDescription };

// Export as a composite component
interface DrawerComponent extends React.FC<DrawerProps> {
  Trigger: typeof DrawerTrigger;
  Content: typeof DrawerContent;
  Header: typeof DrawerHeader;
  Footer: typeof DrawerFooter;
  Title: typeof DrawerTitle;
  Description: typeof DrawerDescription;
}
// Attach sub-components
Drawer.Trigger = DrawerTrigger;
Drawer.Content = DrawerContent;
Drawer.Header = DrawerHeader;
Drawer.Footer = DrawerFooter;
Drawer.Title = DrawerTitle;
Drawer.Description = DrawerDescription;
