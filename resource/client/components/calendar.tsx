'use client';

import * as React from 'react';
import { twMerge as cn } from 'tailwind-merge';
import * as Primitive from 'react-day-picker';
import { buttonVariants } from './ui/button';
import { classesInput } from './fields/input';
import { cvxVariants } from 'xuxi';
import { SheetsBreakpoint, type __SheetsBreakpointProps } from './sheets-breakpoint';
import { ChevronIcon } from './icons';

export type CalendarProps = React.ComponentProps<typeof Primitive.DayPicker> & {
  classNames?: Partial<Record<'calendar', string>>;
};

export function Calendar(_props: CalendarProps) {
  const {
    components,
    className,
    classNames,
    captionLayout = 'dropdown-buttons',
    fromYear = new Date().getFullYear() - 65,
    toYear = new Date().getFullYear(),
    showOutsideDays = true,
    ...props
  } = _props;
  const currentDate = new Date();
  const fiftyYearsAgoDate = new Date(currentDate);
  fiftyYearsAgoDate.setFullYear(currentDate.getFullYear() - 50);

  return (
    <Primitive.DayPicker
      captionLayout={captionLayout}
      fromYear={fromYear}
      toYear={toYear}
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className, classNames?.calendar)}
      classNames={{
        ...classNames,
        months: cn('flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0', classNames?.months),
        month: cn('space-y-4 w-full', classNames?.month),
        caption: cn('flex justify-center pt-1 relative items-center', classNames?.caption),
        caption_label: cn('text-sm font-medium hidden scale-0', classNames?.caption_label),
        nav: cn('space-x-1 flex items-center', classNames?.nav),
        nav_button: cn(buttonVariants({ variant: 'outline' }), 'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100', classNames?.nav_button),
        nav_button_previous: cn('absolute left-1', classNames?.nav_button_previous),
        nav_button_next: cn('absolute right-1', classNames?.nav_button_next),
        table: cn('w-full border-collapse space-y-1 [--h-tbody:268px] [&_tbody]:h-[var(--h-tbody)] [&_tbody]:min-h-[var(--h-tbody)] [&_tbody]:max-h-[var(--h-tbody)]', classNames?.table),
        head_row: cn('flex', classNames?.head_row),
        head_cell: cn('flex-1 text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]', classNames?.head_cell),
        row: cn('flex w-full mt-2', classNames?.row),
        cell: cn(
          'flex-1 h-9 w-9 text-center rounded-md text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-blue-500/15 [&:has([aria-selected])]:bg-blue-500/15 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
          classNames?.cell
        ),
        day: cn(buttonVariants({ variant: 'ghost' }), 'h-9 w-full p-0 font-normal aria-selected:opacity-100 aria-selected:[box-shadow:0_0_0_1px_#3b82f6]', classNames?.day),
        day_range_end: cn('day-range-end', classNames?.day_range_end),
        day_selected: cn(
          'bg-background text-muted-foreground hover:bg-blue-500/15 hover:text-muted-foreground focus:bg-blue-500/15 focus:text-muted-foreground',
          classNames?.day_selected
        ),
        day_today: cn('bg-blue-500/15 text-muted-foreground', classNames?.day_today),
        day_outside: cn('day-outside text-muted-foreground opacity-50 aria-selected:bg-muted/50 aria-selected:text-muted-foreground aria-selected:opacity-30', classNames?.day_outside),
        day_disabled: cn('text-muted-foreground opacity-50', classNames?.day_disabled),
        day_range_middle: cn('aria-selected:bg-blue-500/15 aria-selected:text-muted-foreground', classNames?.day_range_middle),
        day_hidden: cn('invisible', classNames?.day_hidden),
        vhidden: cn('hidden scale-0', classNames?.vhidden),
        caption_dropdowns: cn('w-[calc(100%-(2.75rem*2))] mx-auto flex item-center gap-3', classNames?.caption_dropdowns),
        dropdown: cn(
          'flex flex-1 w-full item-center justify-center rounded-md text-sm text-center font-medium bg-transparent cursor-pointer focus-visible:outline-0 ring-offset-background h-[28px] [&_option]:bg-background [--scrollbar-sz:2px] webkit-scrollbar',
          classNames?.dropdown
        ),
        dropdown_month: cn('w-[60%] border rounded-md hover:bg-blue-500/15 hover:border-[#3b82f6]', classNames?.dropdown_month),
        dropdown_year: cn('w-[40%] border rounded-md hover:bg-blue-500/15 hover:border-[#3b82f6]', classNames?.dropdown_year)
      }}
      components={{
        ...components,
        IconLeft: components?.IconLeft || (({ ...props }) => <ChevronIcon chevron="left" />),
        IconRight: components?.IconRight || (({ ...props }) => <ChevronIcon chevron="right" />),
        // Caption: components?.Caption || (({ ...props }) => null),
        CaptionLabel: components?.CaptionLabel || (({ ...props }) => null)
        // Months: components?.Months || (({ ...props }) => null),
      }}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';

// For form field - with default values

type ExtendsProps<Props extends Record<string, any>> = {
  classNames?: Partial<Record<'calendar', string>>;
  placeholder?: React.ReactNode;
  defaultValue?: Props['defaultMonth'];
  value?: Props['selected'];
  onChange?: Props['onSelect'];
} & Omit<Props, 'mode' | 'defaultMonth' | 'selected' | 'onSelect'> &
  __SheetsBreakpointProps &
  cvxVariants<typeof classesInput>;

export type DatePickerDefaultProps = ExtendsProps<Primitive.DayPickerDefaultProps>;
export type DatePickerSingleProps = ExtendsProps<Primitive.DayPickerSingleProps>;
export type DatePickerMultipleProps = ExtendsProps<Primitive.DayPickerMultipleProps>;
export type DatePickerRangeProps = ExtendsProps<Primitive.DayPickerRangeProps>;

export type DatePickerProps =
  | ({ type: 'default' } & DatePickerDefaultProps)
  | ({ type: 'single' } & DatePickerSingleProps)
  | ({ type: 'multiple' } & DatePickerMultipleProps)
  | ({ type: 'range' } & DatePickerRangeProps);

export const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>((_props, ref) => {
  const { type, variant = 'filled', size = 'sm', placeholder = 'Pick a date', name, openWith, mobileBreakpoint, modal, defaultOpen, open, onOpenChange, ...props } = _props;

  const shareProps = {
    ref,
    name,
    openWith,
    mobileBreakpoint,
    modal,
    defaultOpen,
    open,
    onOpenChange,
    'data-field': '',
    className: classesInput({ variant, size })
  };

  const currentPlaceholder = typeof placeholder === 'string' ? <span>{placeholder}</span> : placeholder;

  if (type === 'default') {
    const { classNames, defaultValue, value, onChange, ...rest } = props as DatePickerDefaultProps;
    return (
      <SheetsBreakpoint
        {...shareProps}
        classNames={classNames}
        trigger={<button type="button">{currentPlaceholder}</button>}
        content={<Calendar mode="default" {...{ classNames, ...({ defaultMonth: defaultValue, selected: value, onSelect: onChange } as any), ...rest }} />}
      />
    );
  }

  if (type === 'single') {
    const { disabled, initialFocus = true, defaultValue: _defaultValue, value: _value, onChange, classNames, ...rest } = props as DatePickerSingleProps;

    const value = typeof _value === 'string' ? new Date(_value) : _value;
    const defaultValue = typeof _defaultValue === 'undefined' ? value : typeof _defaultValue === 'string' ? new Date(_defaultValue) : _defaultValue;
    const dateValue =
      value &&
      new Date(value).toLocaleString('id-ID', {
        day: '2-digit',
        year: 'numeric',
        month: 'long'
      });

    return (
      <SheetsBreakpoint
        {...shareProps}
        classNames={classNames}
        trigger={
          <button type="button" {...{ 'aria-selected': !!value }} className={cn(!value && 'text-muted-foreground')}>
            {value ? <span>{dateValue}</span> : currentPlaceholder}
          </button>
        }
        content={
          <Calendar
            mode="single"
            defaultMonth={defaultValue}
            selected={value}
            onSelect={onChange}
            disabled={disabled || (date => date > new Date() || date < new Date('1900-01-01'))}
            {...{ initialFocus, classNames, ...rest }}
          />
        }
      />
    );
  }

  if (type === 'multiple') {
    const { classNames, defaultValue, value, onChange, ...rest } = props as DatePickerMultipleProps;
    return (
      <SheetsBreakpoint
        {...shareProps}
        classNames={classNames}
        trigger={<button type="button">{currentPlaceholder}</button>}
        content={<Calendar mode="multiple" defaultMonth={defaultValue} selected={value} onSelect={onChange} {...{ classNames, ...rest }} />}
      />
    );
  }

  if (type === 'range') {
    const { classNames, defaultValue, value, onChange, ...rest } = props as DatePickerRangeProps;
    return (
      <SheetsBreakpoint
        {...shareProps}
        classNames={classNames}
        trigger={<button type="button">{currentPlaceholder}</button>}
        content={<Calendar mode="range" defaultMonth={defaultValue} selected={value} onSelect={onChange} {...{ classNames, ...rest }} />}
      />
    );
  }
});
