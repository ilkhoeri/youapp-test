import React from 'react';
import { Handle as ResizableHandle } from '../ui/resizable';
import { twMerge as cn } from 'tailwind-merge';

interface ContainerSkeletonProps {
  layouts?: Array<number>;
  className?: string;
}
export function ContainerSkeleton(props: ContainerSkeletonProps) {
  const { layouts = [15, 30, 55], className } = props;

  const handle = (
    <div className="relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 max-xl:h-px max-xl:w-full max-xl:after:left-0 max-xl:after:h-1 max-xl:after:w-full max-xl:after:-translate-y-1/2 max-xl:after:translate-x-0 [&>div]:max-xl:rotate-90">
      <ResizableHandle />
    </div>
  );

  return (
    <div className={cn(className, 'flex w-full flex-col xl:flex-row overflow-hidden cursor-not-allowed')}>
      {layouts?.map((grow, idx) => (
        <React.Fragment key={idx}>
          <div className="animate-pulse bg-muted/30" style={{ flex: `${grow} 1 0`, overflow: 'hidden', animationDelay: `${grow * 10}ms` }}></div>
          {idx < layouts.length - 1 && handle}
        </React.Fragment>
      ))}
    </div>
  );
}

export function ChatSkeleton() {
  return (
    <div className="size-full grid rounded-lg shadow-md p-4 animate-pulse">
      <div className="h-10 bg-muted rounded w-full" />

      <div className="space-y-6 h-full w-3/4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex flex-row items-start space-x-3">
            <div className="size-8 bg-muted rounded-full" />
            <div className="flex-1 flex flex-col gap-1">
              <div className="h-4 bg-muted rounded w-1/4" />
              <div className="h-8 bg-muted rounded w-full" />
              <div className="h-2.5 bg-muted rounded-[2px] w-1/6 ml-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
