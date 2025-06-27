'use client';
import * as React from 'react';
import { cn } from 'cn';

export function EmptyRoomChat({ isOpen }: { isOpen?: boolean }) {
  return (
    <div className={cn('lg:pl-80 lg:block h-full', isOpen ? 'block' : 'hidden')}>
      <div className="px-4 py-10 sm:px-6 lg:px-8 lg:py-6 h-full flex justify-center items-center bg-background-theme">
        <div className="text-center items-center flex flex-col">
          <EmptyChat />
        </div>
      </div>
    </div>
  );
}

export function EmptyChat({ className, content = 'Select a chat or start a new conversation', children, ...props }: React.ComponentProps<'h6'>) {
  return (
    <h6 {...props} className={cn('relative m-auto px-9 text-center text-h6 font-semibold text-gray-800 dark:text-gray-400', className)}>
      {children || content}
    </h6>
  );
}
