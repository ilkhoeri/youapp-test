'use client';
import * as React from 'react';
import { useChat } from './chat';
import { cn } from 'cn';

export function EmptyRoomChat() {
  const { isOpen } = useChat();

  return (
    <div className={cn('lg:pl-80 lg:block h-full', isOpen ? 'block' : 'hidden')}>
      <EmptyChat />
    </div>
  );
}

export function EmptyChat() {
  return (
    <div className="px-4 py-10 sm:px-6 lg:px-8 lg:py-6 h-full flex justify-center items-center bg-background-theme">
      <div className="text-center items-center flex flex-col">
        <h3 className="mt-2 text-2xl font-semibold text-gray-800 dark:text-gray-400">Select a chat or start a new conversation</h3>
      </div>
    </div>
  );
}
