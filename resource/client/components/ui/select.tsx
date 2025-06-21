'use client';

import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';

import { twMerge } from 'tailwind-merge';
import { Svg, type SvgProps } from './svg';

type SelectValueType = { value?: string };

export const Select = SelectPrimitive.Root as SelectComponent;

export const SelectGroup = SelectPrimitive.Group;
export const SelectValue = SelectPrimitive.Value;

export function SelectTriggerArrowIcon({ size = 32, className, chevronOnly, ...props }: SvgProps<{ chevronOnly?: boolean }>) {
  return (
    <Svg
      {...props}
      size={size}
      currentFill="fill"
      className={twMerge(
        'text-[inherit] group-data-[state=open]/selecttrigger:text-[var(--ring-color,#d1ae0e)] [transform:rotate(-90deg)] transition-transform duration-300 -mr-3',
        className
      )}
    >
      {!chevronOnly && (
        <path
          opacity="0.45"
          className="opacity-10 group-data-[state=open]/selecttrigger:opacity-0 transition-opacity"
          d="M3.464 20.536C4.93 22 7.286 22 12 22s7.071 0 8.535-1.465C22 19.072 22 16.714 22 12s0-7.071-1.465-8.536C19.072 2 16.714 2 12 2S4.929 2 3.464 3.464C2 4.93 2 7.286 2 12s0 7.071 1.464 8.535"
        />
      )}
      <g className="group-data-[state=closed]/selecttrigger:[--shift-x:8%] [&_*]:transition-transform [&_*]:duration-300">
        <path d="M12.03 9.53a.75.75 0 0 0-1.06-1.06l-3 3a.75.75 0 0 0 0 1.06l3 3a.75.75 0 1 0 1.06-1.06L9.56 12z" {...{ style: { transform: 'translateX(calc(var(--shift-x) * 1))' } }} />
        <path
          d="M16.03 9.53a.75.75 0 0 0-1.06-1.06l-3 3a.75.75 0 0 0 0 1.06l3 3a.75.75 0 1 0 1.06-1.06L13.56 12z"
          {...{ style: { transform: 'translateX(calc(var(--shift-x) * -1))' } }}
        />
      </g>
    </Svg>
  );
}

interface SelectTrigerProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> {
  unstyled?: boolean;
  iconChevronOnly?: boolean;
  chevronIcon?: React.ReactNode;
}
export const SelectTrigger = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Trigger>, SelectTrigerProps>(
  ({ className, unstyled, children, iconChevronOnly = true, chevronIcon, ...props }, ref) => (
    <SelectPrimitive.Trigger
      ref={ref}
      className={twMerge(
        !unstyled &&
          'group/selecttrigger flex h-9 w-full items-center justify-between whitespace-nowrap rounded-lg border border-input pl-3 pr-1.5 rtl:pl-1.5 rtl:pr-3 py-2 text-sm shadow-sm bg-background ring-offset-background placeholder:text-color text-color focus:outline-none focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:truncate [&>span]:max-w-[calc(100%-1.75rem)] focus:outline-0 focus-visible:outline-0 focus:ring-0 focus-visible:ring-0 lg:focus:ring-2 lg:focus-visible:ring-2 lg:focus:ring-blue-500 lg:focus-visible:ring-blue-500',
        className
      )}
      {...props}
    >
      {children}
      {chevronIcon ?? (
        <SelectPrimitive.Icon asChild>
          <SelectTriggerArrowIcon chevronOnly={iconChevronOnly} />
        </SelectPrimitive.Icon>
      )}
    </SelectPrimitive.Trigger>
  )
);
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

export const SelectScrollUpButton = React.forwardRef<React.ElementRef<typeof SelectPrimitive.ScrollUpButton>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>>(
  ({ className, ...props }, ref) => (
    <SelectPrimitive.ScrollUpButton ref={ref} className={twMerge('flex cursor-default items-center justify-center py-1', className)} {...props}>
      <svg stroke="currentColor" fill="none" strokeWidth="0" viewBox="0 0 15 15" height="16" width="16" xmlns="http://www.w3.org/2000/svg">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          fill="currentColor"
          d="M3.13523 8.84197C3.3241 9.04343 3.64052 9.05363 3.84197 8.86477L7.5 5.43536L11.158 8.86477C11.3595 9.05363 11.6759 9.04343 11.8648 8.84197C12.0536 8.64051 12.0434 8.32409 11.842 8.13523L7.84197 4.38523C7.64964 4.20492 7.35036 4.20492 7.15803 4.38523L3.15803 8.13523C2.95657 8.32409 2.94637 8.64051 3.13523 8.84197Z"
        />
      </svg>
    </SelectPrimitive.ScrollUpButton>
  )
);
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

export const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton ref={ref} className={twMerge('flex cursor-default items-center justify-center py-1', className)} {...props}>
    <svg stroke="currentColor" fill="none" strokeWidth="0" viewBox="0 0 15 15" height="16" width="16" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        fill="currentColor"
        d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z"
      />
    </svg>
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;

interface SelectContentProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> {
  unstyled?: boolean;
  withScrollButton?: boolean;
}
export const SelectContent = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Content>, SelectContentProps>(
  ({ className, unstyled, children, position = 'popper', withScrollButton, ...props }, ref) => (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        className={twMerge(
          !unstyled &&
            'relative z-[106] max-h-96 min-w-[162px] overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 focus-visible:ring-0 focus-visible:border-border',
          !unstyled && position === 'popper' && 'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
          className
        )}
        position={position}
        {...props}
      >
        {withScrollButton && <SelectScrollUpButton />}
        <SelectPrimitive.Viewport
          className={twMerge('p-1.5 space-y-0.5', position === 'popper' && 'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]')}
        >
          {children}
        </SelectPrimitive.Viewport>
        {withScrollButton && <SelectScrollDownButton />}
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
);
SelectContent.displayName = SelectPrimitive.Content.displayName;

export const SelectLabel = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Label>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>>(
  ({ className, ...props }, ref) => <SelectPrimitive.Label ref={ref} className={twMerge('px-2 py-1.5 text-sm font-semibold', className)} {...props} />
);
SelectLabel.displayName = SelectPrimitive.Label.displayName;

export type SelectItemProps = React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>;

export const classesSelectItem =
  'relative flex w-full cursor-pointer select-none items-center rounded-lg py-1.5 pl-2 pr-8 text-sm font-medium outline-0 focus:outline-0 focus:ring-0 focus:bg-sidebar-accent focus:text-color data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-[selected=true]:bg-sidebar-accent data-[selected=true]:text-color [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0';
export const SelectItem = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Item>, SelectItemProps>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item ref={ref} className={twMerge(classesSelectItem, className)} {...props}>
    <SelectPrimitive.ItemText className="block line-clamp-1">{children}</SelectPrimitive.ItemText>
    <SelectPrimitive.ItemIndicator asChild className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
      <svg stroke="currentColor" fill="none" strokeWidth="0" viewBox="0 0 15 15" height="16" width="16" className="h-4 w-4" xmlns="http://www.w3.org/2000/svg">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z"
          fill="currentColor"
        />
      </svg>
    </SelectPrimitive.ItemIndicator>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

interface SelectInputProps extends React.ComponentProps<'input'> {
  classNames?: Partial<Record<'wrapper' | 'input', string>>;
}
export const SelectInput = React.forwardRef<HTMLInputElement, SelectInputProps>((_props, ref) => {
  const { className, classNames, type = 'text', role = 'combobox', autoComplete = 'off', autoCorrect = 'off', spellCheck = 'false', autoFocus = true, onChange, ...props } = _props;
  return (
    <div className={twMerge('flex items-center border-b px-3', classNames?.wrapper)}>
      <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="mr-2 size-4 min-h-4 min-w-4 shrink-0 opacity-50">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m14 14l2.5 2.5m-.067 2.025a1.48 1.48 0 1 1 2.092-2.092l3.042 3.042a1.48 1.48 0 1 1-2.092 2.092zM16 9A7 7 0 1 0 2 9a7 7 0 0 0 14 0"
        />
      </svg>
      <input
        ref={ref}
        {...{ ...props, type, role, autoComplete, autoCorrect, autoFocus, spellCheck, 'aria-expanded': 'true', 'aria-autocomplete': 'list' }}
        className={twMerge(
          'flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-0',
          className,
          classNames?.input
        )}
        onChange={e => {
          e.preventDefault();
          e.stopPropagation();
          onChange?.(e);
        }}
      />
    </div>
  );
});
SelectInput.displayName = 'SelectInput';

// ForwardRefRenderFunction(props: Omit<SelectPrimitive.SelectItemProps & React.RefAttributes<HTMLDivElement>, "ref">, ref: React.ForwardedRef<HTMLDivElement>): React.ReactNode
interface SelectResetProps extends React.HTMLAttributes<HTMLDivElement>, SelectValueType {
  onValueChange?: React.MouseEventHandler<HTMLDivElement>;
  label?: string;
}
export const SelectReset = React.forwardRef<HTMLDivElement, SelectResetProps>(({ className, value, onClick, onValueChange, label = 'Reset', 'aria-label': arLa, ...props }, ref) => {
  return (
    <SelectPrimitive.Item asChild value=" ">
      <div
        role="button"
        ref={ref}
        onClick={e => {
          if (onValueChange) onValueChange?.(e);
          else onClick?.(e);
        }}
        className={twMerge(
          'font-medium relative flex w-full cursor-pointer select-none items-center justify-start text-left rounded-lg py-1.5 pl-8 pr-2 text-sm outline-none focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
          value ? 'bg-danger' : 'hover:bg-muted',
          className
        )}
        aria-label={arLa || label}
        {...props}
      >
        <svg
          stroke="currentColor"
          fill="none"
          strokeWidth="2"
          viewBox="0 0 24 24"
          strokeLinecap="round"
          strokeLinejoin="round"
          height="18"
          width="18"
          className="absolute left-2 flex items-center justify-center"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M21 6H3" />
          <path d="M7 12H3" />
          <path d="M7 18H3" />
          <path d="M12 18a5 5 0 0 0 9-3 4.5 4.5 0 0 0-4.5-4.5c-1.33 0-2.54.54-3.41 1.41L11 14" />
          <path d="M11 10v4h4" />
        </svg>
        {label}
      </div>
    </SelectPrimitive.Item>
  );
});
SelectReset.displayName = 'SelectReset';

export const SelectSeparator = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Separator>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>>(
  ({ className, ...props }, ref) => <SelectPrimitive.Separator ref={ref} className={twMerge('-mx-1 my-1 h-px bg-muted', className)} {...props} />
);
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

// Export as a composite component
interface SelectComponent extends React.FC<SelectPrimitive.SelectProps> {
  Group: typeof SelectGroup;
  Value: typeof SelectValue;
  Trigger: typeof SelectTrigger;
  TriggerArrowIcon: typeof SelectTriggerArrowIcon;
  Content: typeof SelectContent;
  Label: typeof SelectLabel;
  Item: typeof SelectItem;
  Input: typeof SelectInput;
  Separator: typeof SelectSeparator;
  Reset: typeof SelectReset;
  ScrollUpButton: typeof SelectScrollUpButton;
  ScrollDownButton: typeof SelectScrollDownButton;
}
// Attach sub-components
Select.Group = SelectGroup;
Select.Value = SelectValue;
Select.Trigger = SelectTrigger;
Select.TriggerArrowIcon = SelectTriggerArrowIcon;
Select.Content = SelectContent;
Select.Label = SelectLabel;
Select.Item = SelectItem;
Select.Input = SelectInput;
Select.Separator = SelectSeparator;
Select.Reset = SelectReset;
Select.ScrollUpButton = SelectScrollUpButton;
Select.ScrollDownButton = SelectScrollDownButton;
