'use client';
import * as React from 'react';
import { ArrowMessageBoxFillIcon } from '../icons-fill';
import { cn } from 'cn';
import { CheckIcon, DoubleCheckIcon } from '../icons';

type MCTrees = 'container' | 'root' | 'wrapper' | 'box' | 'icon';

interface DefFloat<T> {
  in: T;
  out: T;
}
function defFloat<T>(flow: keyof DefFloat<T>, define: DefFloat<T>) {
  return define[flow];
}

interface MessagesContentProps extends React.ComponentPropsWithRef<'div'> {
  float: 'in' | 'out';
  classNames?: Partial<Record<MCTrees, string>>;
  message: string | null | undefined;
  dateTime: string | null | undefined;
  isRead?: boolean;
}
export function MessagesContent(_props: MessagesContentProps) {
  const { float, className, classNames, message, dateTime, isRead, ...props } = _props;

  return (
    <div {...{ ...props, flow: 'row', tabIndex: -1 }} className={cn(classNames?.container, className)}>
      <div tabIndex={-1} className={cn('mb-3 relative', classNames?.root)}>
        <div className={cn('flex flex-col select-text px-[63px]', defFloat(float, { in: 'items-start', out: 'items-end' }), classNames?.wrapper)}>
          <div
            className={cn('lg:max-w-[65%] relative flex-none text-[14.2px] leading-[19px] text-color rounded-lg', classNames?.box)}
            {...{
              style: {
                '--color-themes': 'var(--color-themes)',
                '--bg-themes': defFloat(float, { in: '#202c33', out: '#005c4b' })
              } as React.CSSProperties
            }}
          >
            <span
              aria-hidden
              data-icon={`flow-${float}`}
              className={cn('absolute top-0 z-[10] block w-2 h-[13px]', defFloat(float, { in: '-left-2', out: '-right-2' }), classNames?.icon)}
            >
              <ArrowMessageBoxFillIcon message={float} style={{ color: 'var(--bg-themes)' }} />
            </span>
            <div className={cn('rounded-tr-none rounded-lg bg-[var(--bg-themes)] [box-shadow:0_1px_.5px_#0b141a21] relative z-[20]')}>
              <span aria-label={defFloat(float, { in: 'From:', out: 'You:' })} />
              <div className={cn('pb-2 pt-1.5 select-text', defFloat(float, { in: 'pr-[9px] pl-[7px]', out: 'pl-[9px] pr-[7px]' }))}>
                {/* Message Content */}
                <div className="relative whitespace-pre-wrap [word-wrap:break-word]" pre-plain-text={`[14:38, 5/27/2025] username: `}>
                  <span className="min-h-0 visible select-text">{message}</span>
                </div>
                {/* Message Time & Checked */}
                <div className={cn('mb-[-5px] -mt-2.5 z-[4] relative mr-0 ml-2 float-right')}>
                  <div className={cn('h-[15px] whitespace-nowrap flex items-center leading-[15px] text-muted-foreground text-[.6875rem]')}>
                    {dateTime && (
                      <time dateTime={dateTime} dir="auto" className={cn('inline-block align-top')}>
                        {dateTime}
                      </time>
                    )}
                    {float === 'out' && typeof isRead !== 'undefined' && (
                      <span className={cn('inline-block text-muted-foreground ml-[3px]')}>{isRead ? <DoubleCheckIcon /> : <CheckIcon />}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div
              className={cn(
                'emoji absolute top-1/2 w-[101px] py-0 px-1 -mt-[13px] flex flex-row flex-nowrap items-center justify-self-auto',
                defFloat(float, { in: 'justify-start', out: 'justify-end' })
              )}
            >
              {/* Icon Emoji When Box is Hover */}
            </div>
          </div>
          {/* <div className={cn('', classNames)}></div> */}
        </div>
      </div>
    </div>
  );
}
