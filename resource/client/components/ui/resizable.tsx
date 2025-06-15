'use client';
import * as ResizablePrimitive from 'react-resizable-panels';
import { GripVerticalIcon } from '../icons';
import { cn } from 'cn';

export interface ResizablePanelGroupProps extends React.ComponentProps<typeof ResizablePrimitive.PanelGroup> {}

function ResizablePanelGroup({ className, ...props }: ResizablePanelGroupProps) {
  return <ResizablePrimitive.PanelGroup className={cn('flex h-full w-full data-[panel-group-direction=vertical]:flex-col', className)} {...props} />;
}

const ResizablePanel = ResizablePrimitive.Panel;

export interface ResizableHandleProps extends React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> {
  withHandle?: boolean;
}

function ResizableHandle({ withHandle, className, ...props }: ResizableHandleProps) {
  return (
    <ResizablePrimitive.PanelResizeHandle
      {...props}
      className={cn(
        'relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90',
        className
      )}
    >
      {withHandle && <Handle />}
    </ResizablePrimitive.PanelResizeHandle>
  );
}

function Handle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div {...props} className={cn('z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border [--sz-grip:0.625rem]', className)}>
      <GripVerticalIcon size="var(--sz-grip)" />
    </div>
  );
}

const Resizable = ResizablePanelGroup as ResizableComponent;

export { Resizable, Handle, ResizablePanelGroup, ResizablePanel, ResizableHandle };

// Export as a composite component
interface ResizableComponent extends React.FC<ResizablePrimitive.PanelGroupProps> {
  Panel: typeof ResizablePanel;
  Handle: typeof ResizableHandle;
}
// Attach sub-components
Resizable.Panel = ResizablePanel;
Resizable.Handle = ResizableHandle;
