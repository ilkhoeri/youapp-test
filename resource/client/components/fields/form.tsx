'use client';
import * as React from 'react';
import * as ReactSelect from 'react-select';
import * as CreatableReactSelect from 'react-select/creatable';
import * as SelectPrimitive from '@radix-ui/react-select';
import { CountryDropdown, RegionDropdown } from 'react-country-region-selector';
import { ImageUpload, AvatarUpload, type ImageUploadProps, AvatarUploadProps, UnstyledAvatarUpload } from './image';
import { classesInput, Input, InputPasswordProps, InputPinProps, InputProps, numberRegEx, numericValue } from './input';
import { DatePicker, DatePickerProps } from '@/resource/client/components/calendar';
import { classesReactSelect, ReactSelectClassesVariant } from './classes-react-select';
import { transform, formatTitle } from '@/resource/utils/text-parser';
import { Slot } from '@radix-ui/react-slot';
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
  FormProvider,
  useFormContext,
  useForm as useFormPrimitive,
  type UseFormProps as UseFormPrimitiveProps
} from 'react-hook-form';
import { ZodType } from 'zod';
import { Svg } from '../ui/svg';
import { Label } from './label';
import { twMerge } from 'tailwind-merge';
import { Textarea, TextareaProps } from './textarea';
import { useParams, useRouter } from 'next/navigation';
import { Select } from '@/resource/client/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { cvx, type cvxVariants } from 'xuxi';
import { initialValues } from './helper';
import { cn } from 'cn';

export { FormProvider };

export interface UseFormProps<TFieldValues extends FieldValues = FieldValues, TContext = any> extends UseFormPrimitiveProps<TFieldValues, TContext> {
  schema?: ZodType<any, any, any>;
}

export function useForm<TFieldValues extends FieldValues = FieldValues, TContext = any>(props: UseFormProps<TFieldValues, TContext> = {}) {
  const { resolver, schema, ...rest } = props;
  const form = useFormPrimitive({ resolver: resolver || (schema && zodResolver(schema)), ...rest });
  const params = useParams();
  const router = useRouter();

  const [loading, setLoading] = React.useState(false);
  const [preview, setPreview] = React.useState(false);

  return { form, params, router, loading, setLoading, preview, setPreview };
}

export const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue);

export function useFormField() {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>');
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: fieldContext.name,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState
  };
}

export type FormFieldContextValue<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>> = {
  name: TName;
};

export const FormField = <TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>(
  props: ControllerProps<TFieldValues, TName>
) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

export interface FormProps extends React.ComponentProps<'form'> {}
export const Form = React.forwardRef<HTMLFormElement, FormProps>((props, ref) => <form ref={ref} {...props} />) as FormComponent;

export interface FormItemContextValue {
  id: string;
}

export const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue);

export const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { unstyled?: boolean }>(({ className, unstyled, ...props }, ref) => {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div ref={ref} className={twMerge(!unstyled && 'space-y-2 relative', className)} {...props} />
    </FormItemContext.Provider>
  );
});
FormItem.displayName = 'FormItem';

export const FormLabel = React.forwardRef<React.ElementRef<typeof Label>, React.ComponentPropsWithoutRef<typeof Label>>(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField();

  return <Label ref={ref} className={twMerge(error ? 'text-destructive' : 'text-color', className)} htmlFor={formItemId} {...props} />;
});
FormLabel.displayName = 'FormLabel';

export const FormControl = React.forwardRef<React.ElementRef<typeof Slot>, React.ComponentPropsWithoutRef<typeof Slot>>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();

  return <Slot ref={ref} id={formItemId} aria-describedby={!error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`} aria-invalid={!!error} {...props} />;
});
FormControl.displayName = 'FormControl';

export const FormMessage = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField();
  const body = error ? children || String(error?.message) : null;

  if (!body) return null;

  return (
    <div {...props} ref={ref} id={formMessageId} className={twMerge('text-xs font-medium text-destructive', className)}>
      {body}
    </div>
  );
});
FormMessage.displayName = 'FormMessage';

export const FormDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className, children, ...props }, ref) => {
  const { error, formDescriptionId } = useFormField();
  if (!children || error) return null;

  return (
    <p ref={ref} id={formDescriptionId} className={twMerge('text-xs text-muted-foreground font-normal break-words', className)} {...props}>
      {children}
    </p>
  );
});
FormDescription.displayName = 'FormDescription';

interface FormDescriptionList {
  description: string;
  list: { bold?: string; thin?: string }[];
}
export function FormDescriptionList(_props: FormDescriptionList) {
  const { description, list } = _props;
  return (
    <>
      {description}
      <br />
      {list?.map((i, index) => (
        <React.Fragment key={index}>
          {i?.bold && <b className="mr-1">{i.bold}</b>}
          {i?.thin}
          {index < list.length - 1 && <br />}
        </React.Fragment>
      ))}
    </>
  );
}

type IsValidOptions = {
  string?: string[];
  number?: number[];
  boolean?: boolean[];
  // Add if want to support other types in the future
};

function isValidValue<T>(value: T, options?: IsValidOptions): boolean {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '') return false;
    if (options?.string?.includes(trimmed)) return false;
    return true;
  }

  if (typeof value === 'number') {
    if (options?.number?.includes(value)) return false;
    return true;
  }

  if (typeof value === 'boolean') {
    if (options?.boolean?.includes(value)) return false;
    return true;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return !!value;
}

export function getLastPath(path: string): string {
  const segments = path.split('.');
  return segments[segments.length - 1];
}

const arrow = cn(
  'absolute !h-[9px] !w-[23px] group-data-[align=center]/content:group-data-[side=bottom]/content:inset-x-auto group-data-[align=center]/content:group-data-[side=left]/content:inset-y-auto group-data-[align=center]/content:group-data-[side=right]/content:inset-y-auto group-data-[align=center]/content:group-data-[side=top]/content:inset-x-auto group-data-[align=end]/content:group-data-[side=bottom]/content:right-2 group-data-[align=end]/content:group-data-[side=left]/content:bottom-4 group-data-[align=end]/content:group-data-[side=right]/content:bottom-4 group-data-[align=end]/content:group-data-[side=top]/content:right-2 group-data-[align=start]/content:group-data-[side=bottom]/content:left-2 group-data-[align=start]/content:group-data-[side=left]/content:top-4 group-data-[align=start]/content:group-data-[side=right]/content:top-4 group-data-[align=start]/content:group-data-[side=top]/content:left-2 group-data-[side=bottom]/content:bottom-[calc(100%-0px)] group-data-[side=left]/content:left-[calc(100%-7px)] group-data-[side=right]/content:right-[calc(100%-7px)] group-data-[side=top]/content:top-[calc(100%-0px)] group-data-[side=bottom]/content:rotate-180 group-data-[side=left]/content:-rotate-90 group-data-[side=right]/content:rotate-90 group-data-[side=top]/content:rotate-0 [&_[data-arrow=border]]:text-border'
);

// Field
export type AssertFieldProps<TName extends string = string> = {
  name: TName;
  className?: string;
  disabled?: boolean;
  label?: React.ReactNode;
  description?: React.ReactNode;
  errorMessage?: React.ReactNode | 'placeholder';
  formItemProps?: React.ComponentPropsWithRef<typeof FormItem>;
  classNames?: Partial<Record<'item' | 'control' | 'input' | 'label' | 'description' | 'message', string>>;
};

type FormImageUrlFieldProps<TName extends string = string> = ImageUploadProps & AssertFieldProps<TName>;
export function FormImageUrlField<TName extends string>(_props: FormImageUrlFieldProps<TName>) {
  const { name, description, className, classNames, cleanTitle = true, maxFiles = 1, label, formItemProps, ...props } = _props;

  return (
    <FormItem {...formItemProps} className={className}>
      <FormControl className={classNames?.control}>
        <ImageUpload classNames={{ root: classNames?.input }} {...{ name: name || 'imageUrl', cleanTitle, maxFiles, ...props }} />
      </FormControl>
      <FormMessage className={classNames?.message} />
      <FormDescription className={classNames?.description}>{description}</FormDescription>
    </FormItem>
  );
}
FormImageUrlField.displayName = 'FormImageUrlField';

type FormAvatarFieldProps<TName extends string = string> = AvatarUploadProps & AssertFieldProps<TName>;
export function FormAvatarField<TName extends string>(_props: FormAvatarFieldProps<TName>) {
  const { name, description, className, classNames, label, disabled, formItemProps, ...props } = _props;

  return (
    <FormItem aria-disabled={disabled} {...formItemProps} className={className}>
      <FormControl aria-disabled={disabled} className={classNames?.control}>
        <AvatarUpload {...{ name: name || 'Avatar', disabled, ...props }} />
      </FormControl>
      <FormMessage className={classNames?.message} />
      <FormDescription className={classNames?.description}>{description}</FormDescription>
    </FormItem>
  );
}
FormAvatarField.displayName = 'FormAvatarField';

type TextareaFieldTypes<TName extends string = string> = TextareaProps & AssertFieldProps<TName>;
export interface FormTextAreaFieldProps<TName extends string = string> extends TextareaFieldTypes<TName> {
  withPreview?: boolean;
  preview?: React.ReactNode | ((state: PreviewState) => React.ReactNode);
}
interface PreviewState {
  isPreview?: boolean;
}
export const FormTextAreaField = React.forwardRef<HTMLTextAreaElement, FormTextAreaFieldProps>((_props, ref) => {
  const { name, label, disabled, description, className, classNames, placeholder, formItemProps, withPreview, value, preview: nodePreview, ...props } = _props;
  const [isPreview, setPreview] = React.useState(false);

  const currentStyle = {
    true: 'text-teal-900 bg-teal-900/10 [box-shadow:0_0_0_0.05rem_hsl(var(--teal-900))]',
    false: 'bg-muted/60'
  } as const;

  const renderLabel =
    typeof label === 'string' ? (
      <FormLabel
        htmlFor={name}
        onClick={e => {
          if (withPreview) {
            e.preventDefault();
            e.stopPropagation();
            setPreview(false);
          }
        }}
        className={cn(withPreview && ['cursor-pointer rounded-sm py-0.5 px-2', currentStyle[String(!isPreview) as keyof typeof currentStyle]], classNames?.label)}
      >
        {label}
      </FormLabel>
    ) : (
      label
    );

  return (
    <FormItem aria-disabled={disabled && 'true'} unstyled {...formItemProps} className={cn(withPreview ? 'overflow-x-auto' : 'overflow-x-visible', classNames?.item, className)}>
      {!withPreview ? (
        renderLabel
      ) : (
        <div className="grid grid-flow-col w-max p-1 gap-1 bg-background rounded-lg">
          {renderLabel}
          <button
            type="button"
            role="button"
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              setPreview(o => !o);
            }}
            className={cn('relative inline-flex items-center rounded-sm text-sm cursor-pointer py-0.5 px-2', currentStyle[String(isPreview) as keyof typeof currentStyle])}
          >
            Preview
          </button>
        </div>
      )}

      <FormControl hidden={withPreview && isPreview} aria-disabled={disabled && 'true'} className={cn({ 'hidden sr-only': withPreview && isPreview }, classNames?.control)}>
        <Textarea ref={ref} data-field disabled={disabled} aria-disabled={disabled && 'true'} value={value} {...props} className={cn('resize-y my-2', classNames?.input)} />
      </FormControl>

      {withPreview && (typeof nodePreview === 'function' ? nodePreview({ isPreview }) : nodePreview)}

      <FormMessage className={classNames?.message} />
      <FormDescription className={classNames?.description}>{description}</FormDescription>
    </FormItem>
  );
});
FormTextAreaField.displayName = 'FormTextAreaField';

interface InputDataOptionItem {
  label?: string;
  value?: string;
}
export type InputDataOption = (string | InputDataOptionItem)[];

export function transformSelectData(data: InputDataOption | null | undefined): InputDataOptionItem[] | null {
  if (!data) return null;
  return data?.map(item => {
    if (typeof item === 'string') {
      return { label: '', value: item };
    }

    return { value: item.value, label: transform.capitalizeFirst(item.label) };
  });
}

// Fungsi untuk memformat URL dengan validasi tambahan, memastikan URL memiliki "https://"
export function formatUrl(input: string | undefined): string {
  if (!input) return '';
  const trimmed = input.trim();
  const hasTLD = /(?:\.[a-zA-Z]{2,}|localhost)/.test(trimmed);
  const hasProtocol = /^https?:\/\//i.test(trimmed);

  if (hasTLD && !hasProtocol) {
    try {
      return new URL(`https://${trimmed}`).href;
    } catch {
      return `https://${trimmed}`;
    }
  }
  return trimmed;
}

export function formatPhoneNumber(input: string | undefined) {
  if (!input) return '';
  let cleaned = input.replace(/[^\d+]/g, ''); // Hilangkan karakter non-digit kecuali "+"

  // Ganti 0 di awal menjadi +62
  if (cleaned.startsWith('0')) {
    cleaned = '+62' + cleaned.slice(1);
  }

  // Jika tidak ada + di depan, tambahkan +62
  if (!cleaned.startsWith('+62')) {
    cleaned = '+62' + cleaned.replace(/^\+/, '');
  }

  // Ambil hanya angka setelah +62
  const numberPart = cleaned.slice(3).replace(/\D/g, '');

  // Format ulang menjadi +62XXX-XXXX-XXXX atau +62XXX-XXXX-XXX
  let formatted = `+62${numberPart.slice(0, 3)}`;
  if (numberPart.length > 3) {
    formatted += `-${numberPart.slice(3, 7)}`;
  }
  if (numberPart.length > 7) {
    formatted += `-${numberPart.slice(7, 11)}`;
  }
  if (numberPart.length > 11) {
    formatted += numberPart.slice(11); // Tambahkan sisa jika lebih panjang
  }

  return formatted;
}

export interface FormInputFieldProps<TName extends string = string> extends Omit<InputProps, 'name'>, AssertFieldProps<TName> {
  data?: InputDataOption | null | undefined;
  __setValue?: any;
  invalidValues?: IsValidOptions;
}
export const FormInputField = React.forwardRef<HTMLInputElement, FormInputFieldProps>((_props, ref) => {
  const {
    name,
    disabled,
    autoComplete,
    label,
    className,
    classNames,
    description,
    formItemProps,
    data,
    list,
    type = 'text',
    onChange,
    onBlur,
    onKeyDown,
    __setValue,
    value: _value,
    errorMessage,
    placeholder,
    invalidValues,
    ...props
  } = _props;
  const transformData = transformSelectData(data),
    [value, setValue] = React.useState(_value || ''),
    { error } = useFormField(),
    messageInPlaceholder = error && typeof errorMessage === 'string' && errorMessage === 'placeholder',
    placeholderMessage = messageInPlaceholder ? (error.message ?? placeholder) : placeholder;

  function valueByType() {
    if (type === 'phone' || type === 'url') return String(value);
    return _value;
  }

  const handleFormatURL = (event: React.FocusEvent<HTMLInputElement> | React.KeyboardEvent<HTMLInputElement>) => {
    const input = event.currentTarget.value;
    const formatted = formatUrl(input);
    setValue(formatted);
    __setValue?.('phone', formatted, { shouldValidate: true });
  };

  const handleFormatPhone = (event: React.FocusEvent<HTMLInputElement> | React.KeyboardEvent<HTMLInputElement>) => {
    const input = event.currentTarget.value,
      formatted = formatPhoneNumber(input);
    setValue(formatted);
    __setValue?.('phone', formatted, { shouldValidate: true });
  };

  return (
    <FormItem aria-disabled={disabled && 'true'} {...formItemProps} className={cn(classNames?.item, className)}>
      {typeof label === 'string' ? (
        <FormLabel htmlFor={name} className={classNames?.label}>
          {label}
        </FormLabel>
      ) : (
        label
      )}

      <FormControl aria-disabled={disabled && 'true'} className={classNames?.control}>
        <Input
          {...props}
          ref={ref}
          autoComplete={autoComplete || getLastPath(name)}
          type={type === 'phone' ? 'text' : type}
          data-field={isValidValue(_value, invalidValues) ? 'valid' : ''}
          disabled={disabled}
          placeholder={placeholderMessage}
          value={valueByType()}
          list={list || data ? `${name}-list` : undefined}
          onChange={e => {
            const input = e.currentTarget.value;
            if (type === 'url') setValue(input);
            if (type === 'phone') {
              const numeric = numericValue(input);
              if (numberRegEx.test(numeric)) setValue(numeric);
            }
            onChange?.(e);
          }}
          onBlur={e => {
            if (type === 'url') handleFormatURL(e);
            if (type === 'phone') handleFormatPhone(e);
            onBlur?.(e);
          }}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              if (type === 'url') handleFormatURL(e);
              if (type === 'phone') handleFormatPhone(e);
            }
            onKeyDown?.(e);
          }}
          className={cn({ 'placeholder:text-red-500 [&:where(:not(:placeholder-shown))]:![box-shadow:0_0_0_1px_#ef4444]': messageInPlaceholder }, classNames?.input)}
        />
      </FormControl>

      {transformData && (
        <datalist id={`${name}-list`}>
          {transformData?.map(i => (
            <option key={i?.value} value={i?.value} className="h-4 cursor-pointer">
              {i?.label}
            </option>
          ))}
        </datalist>
      )}
      {!messageInPlaceholder && <FormMessage className={classNames?.message}>{errorMessage}</FormMessage>}
      <FormDescription className={classNames?.description}>{description}</FormDescription>
    </FormItem>
  );
});
FormInputField.displayName = 'FormInputField';

interface FormInputsFieldProps<TName extends string = string> extends Omit<InputProps, 'name'>, AssertFieldProps<TName> {
  names?: { key: string; label: string }[];
}
/** Jika ada `fields`, gunakan `.map()`, jika tidak render satu field saja */
export const FormInputsField = React.forwardRef<HTMLInputElement, FormInputsFieldProps>((_props, ref) => {
  const { name, names, disabled, autoComplete, label, className, classNames, description, formItemProps, errorMessage, placeholder, ...props } = _props;

  const { error } = useFormField(),
    messageInPlaceholder = error && typeof errorMessage === 'string' && errorMessage === 'placeholder',
    placeholderMessage = messageInPlaceholder ? (error.message ?? placeholder) : placeholder;

  return (
    <FormItem aria-disabled={disabled && 'true'} {...formItemProps} className={className}>
      {(names ?? [{ key: name, label }]).map(({ key, label }) => (
        <React.Fragment key={key}>
          {typeof label === 'string' ? (
            <FormLabel htmlFor={key} className={classNames?.label}>
              {label || formatTitle(key)}
            </FormLabel>
          ) : (
            label
          )}
          <FormControl aria-disabled={disabled && 'true'} className={classNames?.control}>
            <Input
              ref={ref}
              data-field={key}
              name={key}
              disabled={disabled}
              autoComplete={autoComplete || key}
              placeholder={placeholderMessage}
              className={cn({ 'placeholder:text-red-500 [&:where(:not(:placeholder-shown))]:![box-shadow:0_0_0_1px_#ef4444]': messageInPlaceholder }, classNames?.input)}
              {...props}
            />
          </FormControl>
        </React.Fragment>
      ))}
      {!messageInPlaceholder && <FormMessage className={classNames?.message}>{errorMessage}</FormMessage>}
      <FormDescription className={classNames?.description}>{description}</FormDescription>
    </FormItem>
  );
});
FormInputsField.displayName = 'FormInputsField';

type FormInputPasswordFieldProps<TName extends string = string> = InputPasswordProps & AssertFieldProps<TName>;
export const FormInputPasswordField = React.forwardRef<HTMLInputElement, FormInputPasswordFieldProps>((_props, ref) => {
  const { name, disabled, label, className, classNames, description, formItemProps, id, autoComplete = 'off', errorMessage, placeholder, ...props } = _props;
  const { error } = useFormField(),
    messageInPlaceholder = error && typeof errorMessage === 'string' && errorMessage === 'placeholder',
    placeholderMessage = messageInPlaceholder ? (error.message ?? placeholder) : placeholder;
  return (
    <FormItem aria-disabled={disabled && 'true'} {...formItemProps} className={className}>
      {typeof label === 'string' ? (
        <FormLabel htmlFor={name} className={classNames?.label}>
          {label}
        </FormLabel>
      ) : (
        label
      )}
      <FormControl aria-disabled={disabled && 'true'} className={classNames?.control}>
        <Input.Password
          ref={ref}
          data-field
          id={id || name}
          disabled={disabled}
          autoComplete={autoComplete || getLastPath(name)}
          placeholder={placeholderMessage}
          classNames={{ input: cn({ 'placeholder:text-red-500 [&:where(:not(:placeholder-shown))]:![box-shadow:0_0_0_1px_#ef4444]': messageInPlaceholder }, classNames?.input) }}
          {...props}
        />
      </FormControl>
      {!messageInPlaceholder && <FormMessage className={classNames?.message}>{errorMessage}</FormMessage>}
      <FormDescription className={classNames?.description}>{description}</FormDescription>
    </FormItem>
  );
});
FormInputPasswordField.displayName = 'FormInputPasswordField';

type FormInputPinFieldProps<TName extends string = string> = InputPinProps & AssertFieldProps<TName>;
export const FormInputPinField = React.forwardRef<HTMLInputElement, FormInputPinFieldProps>((_props, ref) => {
  const { name, disabled, label, className, classNames, description, formItemProps, id, autoComplete = 'off', errorMessage, ...props } = _props;
  const { error } = useFormField(),
    messageInPlaceholder = error && typeof errorMessage === 'string' && errorMessage === 'placeholder';
  return (
    <FormItem aria-disabled={disabled && 'true'} {...formItemProps} className={className}>
      {typeof label === 'string' ? (
        <FormLabel htmlFor={name} className={classNames?.label}>
          {label}
        </FormLabel>
      ) : (
        label
      )}
      <FormControl aria-disabled={disabled && 'true'}>
        <Input.Pin
          ref={ref}
          data-field
          id={id || name}
          disabled={disabled}
          autoComplete={autoComplete || getLastPath(name)}
          classNames={{ input: cn({ 'placeholder:text-red-500 [&:where(:not(:placeholder-shown))]:![box-shadow:0_0_0_1px_#ef4444]': messageInPlaceholder }, classNames?.input) }}
          {...props}
        />
      </FormControl>
      <FormMessage className={classNames?.message}>{errorMessage}</FormMessage>
      <FormDescription className={classNames?.description}>{description}</FormDescription>
    </FormItem>
  );
});
FormInputPinField.displayName = 'FormInputPinField';

export const NoFieldResult = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    {...props}
    className={cn(
      'text-center relative flex w-full cursor-default select-none items-center justify-center rounded-lg py-1.5 pl-2 pr-8 text-sm font-medium outline-0 focus:outline-0 focus:ring-0 focus:bg-muted focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className
    )}
    role="presentation"
  />
));
NoFieldResult.displayName = 'NoFieldResult';

export const classesSelectVariant = cvx({
  variants: {
    type: {
      input:
        'inline-flex items-center text-color placeholder:text-muted-foreground whitespace-nowrap rounded-lg text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 border bg-background h-9 w-full pl-3 pr-1.5 rtl:pl-1.5 rtl:pr-3 py-2 text-left font-normal focus:border-transparent focus:ring-2 focus:ring-[var(--ring-color)] focus-visible:ring-[var(--ring-color)] ring-offset-0 focus:ring-offset-0 focus-visible:ring-offset-0 data-[state=open]:ring-[var(--ring-color)] data-[state=open]:ring-2 hover:bg-background focus-visible:border-transparent disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-50 [--ring-color:#2f81f7]'
    },
    select: {
      trigger: 'group/selecttrigger justify-between [&>span]:truncate [&>span]:max-w-[calc(100%-1.75rem)] [&_span_p]:hidden [&_span_p]:sr-only',
      content:
        'relative z-[106] max-h-96 overflow-hidden rounded-lg border blur-popover bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 focus-visible:ring-0 focus-visible:border-border data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1 min-w-[162px] w-[--radix-popper-anchor-width] !max-w-[--radix-popper-anchor-width]'
    }
  }
});

type SortByType = 'name' | 'title' | 'label';

export type SelectDataOption =
  | (Partial<Record<SortByType, string>> & {
      id?: string;
      description?: string;
    })
  | string;

export interface FormSelectFieldProps<T extends SelectDataOption[]> {
  onChange(value: string): void;
  value: string | undefined;
  placeholder?: string;
  defaultValue?: string;
  data: T | null | undefined;
  sortBy?: SortByType;
  withReset?: string | null;
  required?: boolean;
  autoComplete?: string;
}

function reactSelectOptionsTransform<T extends SelectDataOption[]>(data: T | null | undefined): { value: string; label: string }[] | undefined {
  const dataResult = data?.map(item => {
    const itemValue = (typeof item === 'string' ? item : item?.id) || '';
    const itemLabel = (typeof item === 'string' ? item : item?.label || item?.name || item?.title || item?.id) || '';
    return {
      value: itemValue,
      label: itemLabel
        ?.replace(/_/g, ' ')
        ?.toLowerCase()
        ?.replace(/(^\w|\s\w)/g, m => m)
    };
  });

  return dataResult;
}

function selectDisplayValue<T extends SelectDataOption[]>(data: T | null | undefined, value: string | null | undefined, display: 'display-label' | 'display-value') {
  const currentValue = data?.find(item => {
    if (typeof item === 'string') {
      return item === value;
    }
    return item?.id === value;
  });

  const displayValue = typeof currentValue === 'string' ? currentValue : currentValue?.id || currentValue?.name || currentValue?.label || currentValue?.title;

  const displayLabel = typeof currentValue === 'string' ? currentValue : currentValue?.label || currentValue?.name || currentValue?.title || currentValue?.id;

  if (display === 'display-value') {
    return displayValue;
  }

  if (display === 'display-label') {
    return displayLabel;
  }
  return undefined;
}

function selectValue<T extends SelectDataOption[], V>(data: T | null | undefined, value: V | null | undefined) {
  const currentValue = data?.find(item => {
    if (typeof item === 'string') {
      return item === value;
    }
    return item?.id === value;
  });

  return currentValue;
}

export type FormReactSelectFieldProps<
  T extends SelectDataOption[],
  Option,
  IsMulti extends boolean,
  Group extends ReactSelect.GroupBase<Option>,
  TName extends string = string
> = AssertFieldProps<TName> &
  ReactSelectClassesVariant &
  React.JSX.LibraryManagedAttributes<typeof ReactSelect.default, ReactSelect.Props<Option, IsMulti, Group>> & {
    data?: T | null | undefined;
  };
export function FormSelectField<T extends SelectDataOption[], Option, IsMulti extends boolean, Group extends ReactSelect.GroupBase<Option>, TName extends string>(
  _props: FormReactSelectFieldProps<T, Option, IsMulti, Group, TName>
) {
  const { variant = 'default', data, name, label, description, disabled, className, defaultValue, required, classNames, styles, placeholder, components, ...props } = _props;

  const inputPlaceholder = typeof placeholder === 'string' ? placeholder : undefined;

  function CustomInput<Option_7, IsMulti_7 extends boolean, Group_7 extends ReactSelect.GroupBase<Option_7>>(props: ReactSelect.InputProps<Option_7, IsMulti_7, Group_7>) {
    if (inputPlaceholder) {
      return <ReactSelect.components.Input {...props} innerRef={props.innerRef} placeholder={inputPlaceholder} />;
    }
    return undefined;
  }

  return (
    <FormItem aria-disabled={disabled && 'true'} className={className}>
      {typeof label === 'string' ? (
        <FormLabel htmlFor={name} className={classNames?.label}>
          {label}
        </FormLabel>
      ) : (
        label
      )}

      <FormControl className={classNames?.control}>
        <ReactSelect.default
          {...props}
          id={name}
          name={name}
          isDisabled={disabled}
          placeholder={placeholder}
          components={{ ...components, Input: components?.Input ?? CustomInput }}
          {...classesReactSelect<Option, IsMulti, Group>({ classNames, styles, variant, inputPlaceholder })}
        />
      </FormControl>

      <FormMessage className={classNames?.message} />
      <FormDescription className={classNames?.description}>{description}</FormDescription>
    </FormItem>
  );
}
FormSelectField.displayName = 'FormSelectField';

export type FormCreatableSelectProps<
  T extends SelectDataOption[],
  Option = unknown,
  IsMulti extends boolean = false,
  Group extends ReactSelect.GroupBase<Option> = ReactSelect.GroupBase<Option>,
  TName extends string = string
> = AssertFieldProps<TName> &
  ReactSelectClassesVariant &
  React.JSX.LibraryManagedAttributes<typeof CreatableReactSelect.default, ReactSelect.Props<Option, IsMulti, Group>> & {
    data?: T | null | undefined;
  };
export function FormCreatableSelectField<T extends SelectDataOption[], Option, IsMulti extends boolean, Group extends ReactSelect.GroupBase<Option>, TName extends string>(
  _props: FormCreatableSelectProps<T, Option, IsMulti, Group, TName>
) {
  const {
    variant = 'default',
    data,
    name,
    label,
    description,
    disabled,
    className,
    defaultValue,
    required,
    classNames,
    styles,
    placeholder,
    components,
    menuPortalTarget,
    ...props
  } = _props;

  const inputPlaceholder = typeof placeholder === 'string' ? placeholder : undefined;

  function CustomInput<Option_7, IsMulti_7 extends boolean, Group_7 extends ReactSelect.GroupBase<Option_7>>(props: ReactSelect.InputProps<Option_7, IsMulti_7, Group_7>) {
    if (inputPlaceholder) {
      return <ReactSelect.components.Input {...props} innerRef={props.innerRef} placeholder={inputPlaceholder} />;
    }
    return undefined;
  }

  return (
    <FormItem aria-disabled={disabled && 'true'} className={className}>
      {typeof label === 'string' ? (
        <FormLabel htmlFor={name} className={classNames?.label}>
          {label}
        </FormLabel>
      ) : (
        label
      )}

      <FormControl className={classNames?.control}>
        <CreatableReactSelect.default
          {...props}
          id={name}
          name={name}
          isDisabled={disabled}
          placeholder={placeholder}
          menuPortalTarget={menuPortalTarget || document.body}
          components={{ ...components, Input: components?.Input ?? CustomInput }}
          {...classesReactSelect<Option, IsMulti, Group>({ classNames, styles, variant, inputPlaceholder })}
        />
      </FormControl>

      <FormMessage className={classNames?.message} />
      <FormDescription className={classNames?.description}>{description}</FormDescription>
    </FormItem>
  );
}
FormCreatableSelectField.displayName = 'FormCreatableSelectField';

function getSortSelect<T extends SelectDataOption[]>(data: T, sortBy: SortByType | undefined) {
  return data?.slice()?.sort((a, b) => {
    if (typeof sortBy !== 'undefined') {
      if (typeof a === 'string' && typeof b === 'string') {
        return a.localeCompare(b);
      }

      if (typeof a === 'object' && typeof b === 'object') {
        const aValue = a?.[sortBy];
        const bValue = b?.[sortBy];

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return aValue.localeCompare(bValue);
        }
      }
    }
    return 0;
  });
}

export interface FormSelectItemField<T extends SelectDataOption[], TName extends string = string>
  extends FormSelectFieldProps<T>,
    AssertFieldProps<TName>,
    cvxVariants<typeof classesInput> {
  withSearch?: boolean;
}
export function FormSelectItemField<T extends SelectDataOption[], TName extends string>(props: FormSelectItemField<T, TName>) {
  const {
    name,
    variant = 'filled',
    size = 'sm',
    label,
    description,
    disabled,
    className,
    classNames,
    onChange,
    value,
    defaultValue,
    data,
    sortBy,
    withSearch = true,
    withReset,
    placeholder,
    required,
    errorMessage,
    autoComplete
  } = props;

  const [open, setOpen] = React.useState<boolean>(false);

  const [searchTerm, setSearchTerm] = React.useState<string>('');

  const [inputFocus, setInputFocus] = React.useState<boolean>(false);

  const { error } = useFormField(),
    messageInPlaceholder = error && typeof errorMessage === 'string' && errorMessage === 'placeholder',
    placeholderMessage = messageInPlaceholder ? (error.message ?? placeholder) : placeholder;

  const filteredData = data?.filter(item => {
    const itemLabel = typeof item === 'string' ? item : item?.label || item?.name || item?.title || item?.id;
    return itemLabel?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <FormItem aria-disabled={disabled && 'true'} className={className}>
      {typeof label === 'string' ? (
        <FormLabel htmlFor={name} className={classNames?.label}>
          {label}
        </FormLabel>
      ) : (
        label
      )}
      <Select
        open={open}
        onOpenChange={setOpen}
        autoComplete={autoComplete}
        required={required}
        name={name}
        disabled={disabled}
        defaultValue={defaultValue || value}
        value={value}
        onValueChange={e => {
          onChange?.(e);
          setSearchTerm('');
        }}
      >
        <FormControl className={classNames?.control}>
          <Select.Trigger
            id={name}
            name={name}
            aria-selected={value ? 'true' : undefined}
            unstyled
            className={cn(classesSelectVariant({ select: 'trigger' }), classesInput({ variant, size }), classNames?.input)}
          >
            <Select.Value defaultValue={defaultValue || value} placeholder={placeholderMessage} />
          </Select.Trigger>
        </FormControl>

        {filteredData && (
          <SelectPrimitive.Portal>
            <SelectPrimitive.Content className={classesSelectVariant({ select: 'content' })} position="popper">
              {withSearch && (
                <Select.Input
                  placeholder={placeholder || formatTitle(name)}
                  id={name}
                  name={name}
                  value={searchTerm}
                  autoFocus={open}
                  onChange={e => {
                    setSearchTerm(e.target.value);
                    setInputFocus(true);
                  }}
                  onBlur={() => setInputFocus(false)}
                  onKeyDown={e => {
                    const unfocusKeys = ['Tab', 'ArrowDown'];
                    if (unfocusKeys.includes(e.key)) {
                      setInputFocus(false);
                    }
                  }}
                />
              )}

              <Select.ScrollUpButton />
              <SelectPrimitive.Viewport className={twMerge('p-1.5 space-y-0.5 h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]')}>
                {filteredData?.length > 0 ? (
                  <>
                    {withReset !== null && (
                      <>
                        <Select.Reset value={value} onClick={() => onChange?.(typeof withReset === 'string' ? withReset : '')} />
                        <Select.Separator />
                      </>
                    )}
                    {getSortSelect(filteredData, sortBy).map((item, index) => {
                      const itemKey = typeof item === 'string' ? item : item?.id;
                      const itemValue = typeof item === 'string' ? item : item?.id || String(index);
                      const itemLabel = typeof item === 'string' ? item : item?.label || item?.name || item?.title || item?.id;
                      const itemDescription = typeof item === 'string' ? undefined : item?.description;
                      return (
                        <Select.Item disabled={disabled || inputFocus} key={itemKey} value={itemValue} title={itemLabel} className="has-[s]:grid has-[s]:grid-flow-row">
                          {itemLabel}
                          {itemDescription && <p className="w-full max-w-full text-xs text-start text-wrap text-muted-foreground font-normal">{itemDescription}</p>}
                        </Select.Item>
                      );
                    })}
                  </>
                ) : (
                  <NoFieldResult>No results items.</NoFieldResult>
                )}
              </SelectPrimitive.Viewport>
              <Select.ScrollDownButton />
            </SelectPrimitive.Content>
          </SelectPrimitive.Portal>
        )}
      </Select>
      {!messageInPlaceholder && <FormMessage className={classNames?.message}>{errorMessage}</FormMessage>}
      <FormDescription className={classNames?.description}>{description}</FormDescription>
    </FormItem>
  );
}
FormSelectItemField.displayName = 'FormSelectItemField';

export type FormDateFieldProps<TName extends string = string> = Omit<AssertFieldProps<TName>, 'label' | 'disabled'> &
  DatePickerProps & {
    label?: React.ReactNode;
    'aria-disabled'?: boolean | undefined;
    placeholder?: string;
  };
export const FormDateField = React.forwardRef<HTMLButtonElement, FormDateFieldProps>((_props, ref) => {
  const { disabled, label, name, description, className, classNames, formItemProps, placeholder, errorMessage, ...props } = _props;

  const { error, formItemId, formDescriptionId, formMessageId } = useFormField(),
    messageInPlaceholder = error && typeof errorMessage === 'string' && errorMessage === 'placeholder',
    placeholderMessage = messageInPlaceholder ? (error.message ?? placeholder) : placeholder;

  const isDisabled = typeof disabled !== 'boolean' ? false : disabled;
  return (
    <FormItem aria-disabled={isDisabled && 'true'} unstyled className={cn('space-y-2 relative', className)} {...formItemProps}>
      {typeof label === 'string' ? (
        <FormLabel htmlFor={name} className={classNames?.label}>
          {label}
        </FormLabel>
      ) : (
        label
      )}
      <DatePicker
        disabled={disabled}
        ref={ref}
        formItemId={formItemId}
        formDescriptionId={formDescriptionId}
        formMessageId={formMessageId}
        error={error}
        name={name}
        placeholder={placeholderMessage}
        classNames={{ ...classNames, trigger: cn(classNames?.input, classNames?.trigger) }}
        {...props}
      />
      {!messageInPlaceholder && <FormMessage className={classNames?.message}>{errorMessage}</FormMessage>}
      <FormDescription className={cn('mt-2', classNames?.description)}>{description}</FormDescription>
    </FormItem>
  );
});
FormDateField.displayName = 'FormDateField';

type CountryFieldTrees = 'content';
export type FormCountryFieldProps<TName extends string = string> = Omit<React.ComponentProps<typeof CountryDropdown>, 'name'> &
  Omit<AssertFieldProps<TName>, 'label' | 'className'> & {
    disabled?: boolean;
    label?: React.ReactNode;
    classNames?: Partial<Record<CountryFieldTrees, string>>;
  };
export const FormCountryField = React.forwardRef<HTMLSelectElement, FormCountryFieldProps>((_props, ref) => {
  const { disabled, value, label, description, className, classNames, id, name, autoComplete = 'off', ...props } = _props;
  return (
    <FormItem aria-disabled={disabled && 'true'} unstyled className={className}>
      {typeof label === 'string' ? (
        <FormLabel htmlFor={name} className={classNames?.label}>
          {label}
        </FormLabel>
      ) : (
        label
      )}
      <FormControl aria-disabled={disabled && 'true'} className={classNames?.control}>
        <CountryDropdown
          ref={ref}
          {...props}
          value={value}
          disabled={disabled}
          aria-disabled={disabled}
          className={twMerge(
            classesSelectVariant({ type: 'input' }),
            value ? 'text-default' : 'text-muted-foreground',
            'mt-2 cursor-pointer [&_option]:text-base [&_option]:text-color first:[&_option]:text-muted-foreground webkit-scrollbar',
            className
          )}
          {...{ autoComplete, name, id: id || name }}
        />
      </FormControl>
      <FormMessage className={classNames?.message} />
      <FormDescription className={cn('mt-2', classNames?.description)}>{description}</FormDescription>
    </FormItem>
  );
});
FormCountryField.displayName = 'FormCountryField';

type RegionFieldTrees = 'content';
export type FormRegionFieldProps<TName extends string = string> = Omit<React.ComponentProps<typeof RegionDropdown>, 'name'> &
  Omit<AssertFieldProps<TName>, 'label' | 'className'> & {
    disabled?: boolean;
    label?: React.ReactNode;
    classNames?: Partial<Record<RegionFieldTrees, string>>;
  };
export const FormRegionField = React.forwardRef<HTMLSelectElement, FormRegionFieldProps>((_props, ref) => {
  const { disabled, value, label, description, className, classNames, autoComplete = 'off', name, id, disableWhenEmpty = true, ...props } = _props;
  return (
    <FormItem aria-disabled={disabled && 'true'} unstyled className={className}>
      {typeof label === 'string' ? (
        <FormLabel htmlFor={name} className={classNames?.label}>
          {label}
        </FormLabel>
      ) : (
        label
      )}
      <FormControl aria-disabled={disabled && 'true'} className={classNames?.control}>
        <RegionDropdown
          ref={ref}
          {...props}
          value={value}
          disabled={disabled}
          aria-disabled={disabled}
          className={twMerge(
            classesSelectVariant({ type: 'input' }),
            value ? 'text-default' : 'text-muted-foreground',
            'mt-2 cursor-pointer [&_option]:text-base [&_option]:text-color first:[&_option]:text-muted-foreground webkit-scrollbar',
            classNames?.input
          )}
          {...{ disableWhenEmpty, autoComplete, name, id: id || name }}
        />
      </FormControl>
      <FormMessage className={classNames?.message} />
      <FormDescription className={cn('mt-2', classNames?.description)}>{description}</FormDescription>
    </FormItem>
  );
});
FormRegionField.displayName = 'FormRegionField';

export const formCardVariant = cvx({
  assign: 'relative rounded-2xl border bg-card text-color shadow-sm px-6 py-4 grid grid-cols-1 gap-4',
  variants: {
    grid: {
      lg2: 'lg:grid-cols-2'
    }
  }
});

export interface FormCardProps extends React.ComponentProps<'div'>, cvxVariants<typeof formCardVariant> {}
export const FormCard = React.forwardRef<HTMLDivElement, FormCardProps>(({ className, title, children, grid, ...props }, ref) => {
  return (
    <div ref={ref} {...props} data-title={title} className={cn(formCardVariant({ grid }), className)}>
      {title && <span className="text-base font-semibold font-geist-sans absolute rounded-sm left-2.5 -top-2 bg-background px-1.5 z-3">{title}</span>}
      {children}
    </div>
  );
});

// Export as a composite component
interface FormComponent extends React.ForwardRefExoticComponent<FormProps> {
  hooks: typeof useFormField;
  initialValues: typeof initialValues;
  Provider: typeof FormProvider;
  Item: typeof FormItem;
  Label: typeof FormLabel;
  Control: typeof FormControl;
  Message: typeof FormMessage;
  Field: typeof FormField;
  Description: typeof FormDescription;
  DescripList: typeof FormDescriptionList;
  TextAreaField: typeof FormTextAreaField;
  InputField: typeof FormInputField;
  InputPasswordField: typeof FormInputPasswordField;
  InputPinField: typeof FormInputPinField;
  DateField: typeof FormDateField;
  CountryField: typeof FormCountryField;
  RegionField: typeof FormRegionField;
  AvatarField: typeof FormAvatarField;
  UnstyledAvatarField: typeof UnstyledAvatarUpload;
  ImageUrlField: typeof FormImageUrlField;
  SelectOptionsTransform: typeof reactSelectOptionsTransform;
  SelectField: typeof FormSelectField;
  CreatableSelectField: typeof FormCreatableSelectField;
  SelectItemField: typeof FormSelectItemField;
  Card: typeof FormCard;
}
// Attach sub-components
Form.hooks = useFormField;
Form.initialValues = initialValues;
Form.Provider = FormProvider;
Form.Item = FormItem;
Form.Label = FormLabel;
Form.Control = FormControl;
Form.Message = FormMessage;
Form.Field = FormField;
Form.Description = FormDescription;
Form.DescripList = FormDescriptionList;
Form.TextAreaField = FormTextAreaField;
Form.InputField = FormInputField;
Form.InputPasswordField = FormInputPasswordField;
Form.InputPinField = FormInputPinField;
Form.DateField = FormDateField;
Form.CountryField = FormCountryField;
Form.RegionField = FormRegionField;
Form.AvatarField = FormAvatarField;
Form.UnstyledAvatarField = UnstyledAvatarUpload;
Form.ImageUrlField = FormImageUrlField;
Form.SelectOptionsTransform = reactSelectOptionsTransform;
Form.SelectField = FormSelectField;
Form.CreatableSelectField = FormCreatableSelectField;
Form.SelectItemField = FormSelectItemField;
Form.Card = FormCard;
