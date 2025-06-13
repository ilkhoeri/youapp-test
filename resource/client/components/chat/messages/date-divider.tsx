import React from 'react';
import { cn } from 'cn';

interface DateDividerProps {
  date: string; // Sudah diformat, misal: "Today", "Yesterday", "Tuesday, May 28"
  count?: number; // Jumlah pesan hari itu (opsional)
}

export function DateDivider({ date, count }: DateDividerProps) {
  return (
    <div className="my-6 flex items-center justify-center text-center">
      <div className="flex items-center w-full max-w-md px-4">
        <div className="flex-grow border-t border-gray-300 dark:border-gray-600" />
        <div
          className={cn(
            'mx-4 text-gray-600 dark:text-gray-400 whitespace-nowrap',
            'pt-[5px] pb-1.5 px-3 text-center relative flex flex-row items-center flex-[0_0_auto] border dark:border-[#182229] rounded-md text-[.78125rem] backdrop-blur-sm'
          )}
        >
          {date}
          {typeof count === 'number' && count > 0 && (
            <span className="ml-2 text-xs text-gray-400">
              ({count} message{count > 1 ? 's' : ''})
            </span>
          )}
        </div>
        <div className="flex-grow border-t border-gray-300 dark:border-gray-600" />
      </div>
    </div>
  );
}
