'use client';
import * as React from 'react';
import { Svg } from '../ui/svg';
import { cn } from 'cn';
import { cvx, cvxVariants } from 'xuxi';

// export const passwordRegEx = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+?<>{}\/]).{8,}$/;
export const passwordRegEx = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$&+,:;=?@#|'<>.^*()%!-])[a-zA-Z0-9$&+,:;=?@#|'<>.^*()%!-]{8,}$/;

export const phoneRegEx = /^(?:0|\+62)(?:\d{3}-\d{4}-\d{4}|\d{3}-\d{3}-\d{4}|\d{4}-\d{4}-\d{3}|\d{4}-\d{4}-\d{4})$/;

export const numberRegEx = /^[0-9+-]*$/;

export const numericValue = (value: string) => value.replace(/[^0-9+-]/g, '');

export function floatNumber(value: string, locales: Intl.LocalesArgument = 'id-ID', options?: Intl.NumberFormatOptions) {
  // Remove semua karakter non-digit (kecuali minus buat split)
  return value
    .split('-')
    .map(part => {
      const cleaned = part.replace(/\D/g, '');
      if (!cleaned) return '';
      return parseInt(cleaned, 10).toLocaleString(locales, options);
    })
    .join('-');
}

export const classesInput = cvx({
  assign:
    'inline-flex items-center whitespace-nowrap transition-colors disabled:pointer-events-none py-2 w-full pl-3 text-left rounded-lg font-normal placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
  variants: {
    variant: {
      outline: 'bg-background-theme hover:bg-background-theme border border-border focus-visible:ring-0 focus-visible:outline-none',
      'outline-ring':
        'border border-border bg-background focus-visible:border-transparent focus-visible:ring-[#2f81f7] focus-visible:ring-offset-0 hover:bg-background ring-offset-background focus-visible:outline-none focus-visible:ring-2 read-only:focus-visible:border-border read-only:focus-visible:ring-0 file:border-0 file:bg-transparent',
      filled:
        'border-0 bg-[#ffffff0f] hover:bg-[#ffffff0f] focus-visible:border-transparent focus-visible:ring-transparent focus-visible:ring-offset-0 ring-offset-transparent focus-visible:outline-0 focus-visible:ring-0 read-only:focus-visible:border-transparent read-only:focus-visible:ring-0 file:border-0'
    },
    size: {
      sm: 'h-9 px-4 text-sm file:text-sm file:font-medium',
      lg: 'h-[51px] rounded-[9px] text-[13px] font-medium file:text-[13px] placeholder:text-[13px] px-5'
    }
  }
});
const classesButtonPassword = cvx({
  assign: 'absolute rounded-lg right-0 bottom-0 !bg-transparent flex items-center justify-center cursor-pointer z-99 border-0 outline-0 pointer-events-auto [&>svg]:transition-colors',
  variants: {
    variant: {
      outline: 'text-color',
      'outline-ring': 'text-color',
      filled: 'text-color-muted'
    },
    open: {
      true: '',
      false: 'text-muted-foreground'
    },
    size: {
      sm: 'size-9 [--size-icon:20px]',
      lg: 'size-[51px] rounded-[9px] [--size-icon:26px]'
    }
  }
});

export type InputVariants = cvxVariants<typeof classesInput>;

export interface InputProps extends Omit<React.ComponentProps<'input'>, keyof InputVariants>, InputVariants {
  unstyled?: boolean;
  type?: 'numeric' | 'phone' | 'float' | React.HTMLInputTypeAttribute;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    className,
    type = 'text',
    value,
    disabled,
    onChange,
    spellCheck = false,
    autoComplete = 'off',
    readOnly,
    'aria-readonly': ariaReadOnly,
    tabIndex,
    unstyled,
    variant = 'filled',
    size = 'sm',
    ...props
  },
  ref
) {
  const [numeric, setNumeric] = React.useState(value ?? '');

  const isNumeric = type === 'numeric';

  const isFloat = type === 'float';

  const isFormatText = isNumeric || isFloat;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e);
    const numeric = numericValue(e.target.value);
    if (numberRegEx.test(numeric)) {
      if (isNumeric) setNumeric(numeric);
    }
    if (isFloat) {
      const rawValue = e.target.value;
      const formattedValue = floatNumber(rawValue);
      setNumeric(formattedValue);
    }
  };

  return (
    <input
      type={isFormatText ? 'text' : type}
      className={cn(
        !unstyled && [
          classesInput({ variant, size }),
          type === 'number' &&
            '[&[type=number]::-webkit-inner-spin-button]:[-webkit-appearance:none] [&[type=number]::-webkit-outer-spin-button]:[-webkit-appearance:none] [appearance:textfield] [-moz-appearance:textfield]'
        ],
        className
      )}
      // inputMode={isNumber ? 'numeric' : 'text'}
      value={isFormatText ? numeric : value}
      {...{
        ref,
        disabled,
        spellCheck,
        autoComplete,
        onChange: handleChange,
        readOnly,
        tabIndex: tabIndex || (readOnly ? -1 : undefined),
        'aria-readonly': ariaReadOnly || (readOnly ? 'true' : undefined),
        'aria-invalid': 'false',
        'aria-disabled': disabled ? 'true' : undefined,
        ...props
      }}
    />
  );
}) as InputComponent;
Input.displayName = 'Input';

type UnstyledClasses<T extends string> = {
  classNames?: Partial<Record<T, string>>;
  unstyled?: boolean | Partial<Record<T, boolean>>;
};

type InputPasswordTrees = 'wrapper' | 'input' | 'rightSection';

export type InputPasswordProps = Omit<InputProps, 'type' | 'unstyled'> &
  UnstyledClasses<InputPasswordTrees> & {
    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  };

export const InputPassword = React.forwardRef<HTMLInputElement, InputPasswordProps>((_props, ref) => {
  const {
    className,
    classNames,
    disabled,
    value: valueProp,
    onChange: onChangeProp,
    autoComplete = 'off',
    spellCheck = false,
    defaultOpen = false,
    placeholder = '***********',
    open: openProp,
    onOpenChange: setOpenProp,
    unstyled,
    variant = 'filled',
    size = 'sm',
    ...props
  } = _props;

  const [_value, setValue] = React.useState('');

  const [_open, _setOpen] = React.useState(defaultOpen);

  const open = openProp ?? _open;
  const setOpen = React.useCallback(
    (prev: boolean | ((prev: boolean) => boolean)) => {
      const openState = typeof prev === 'function' ? prev(open) : prev;
      if (setOpenProp) {
        setOpenProp(openState);
      } else {
        _setOpen(openState);
      }
    },
    [setOpenProp, open]
  );

  const value = valueProp ?? _value;
  const onChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (onChangeProp) onChangeProp(event);
      else setValue(event.target.value);
    },
    [onChangeProp, value]
  );

  const pathMap = {
    true: [
      'M245.48 125.57c-.34-.78-8.66-19.23-27.24-37.81C201 70.54 171.38 50 128 50S55 70.54 37.76 87.76c-18.58 18.58-26.9 37-27.24 37.81a6 6 0 0 0 0 4.88c.34.77 8.66 19.22 27.24 37.8C55 185.47 84.62 206 128 206s73-20.53 90.24-37.75c18.58-18.58 26.9-37 27.24-37.8a6 6 0 0 0 0-4.88M128 194c-31.38 0-58.78-11.42-81.45-33.93A134.8 134.8 0 0 1 22.69 128a134.6 134.6 0 0 1 23.86-32.06C69.22 73.42 96.62 62 128 62s58.78 11.42 81.45 33.94A134.6 134.6 0 0 1 233.31 128C226.94 140.21 195 194 128 194m0-112a46 46 0 1 0 46 46a46.06 46.06 0 0 0-46-46m0 80a34 34 0 1 1 34-34a34 34 0 0 1-34 34'
    ],
    false: [
      'M52.44 36a6 6 0 0 0-8.88 8l20.88 23c-37.28 21.9-53.23 57-53.92 58.57a6 6 0 0 0 0 4.88c.34.77 8.66 19.22 27.24 37.8C55 185.47 84.62 206 128 206a124.9 124.9 0 0 0 52.57-11.25l23 25.29a6 6 0 0 0 8.88-8.08Zm48.62 71.32l45 49.52a34 34 0 0 1-45-49.52M128 194c-31.38 0-58.78-11.42-81.45-33.93A134.6 134.6 0 0 1 22.69 128c4.29-8.2 20.1-35.18 50-51.91l20.2 22.21a46 46 0 0 0 61.35 67.48l17.81 19.6A113.5 113.5 0 0 1 128 194m6.4-99.4a6 6 0 0 1 2.25-11.79a46.17 46.17 0 0 1 37.15 40.87a6 6 0 0 1-5.42 6.53h-.56a6 6 0 0 1-6-5.45A34.1 34.1 0 0 0 134.4 94.6m111.08 35.85c-.41.92-10.37 23-32.86 43.12a6 6 0 1 1-8-8.94A134.1 134.1 0 0 0 233.31 128a134.7 134.7 0 0 0-23.86-32.07C186.78 73.42 159.38 62 128 62a120 120 0 0 0-19.69 1.6a6 6 0 1 1-2-11.83A131 131 0 0 1 128 50c43.38 0 73 20.54 90.24 37.76c18.58 18.58 26.9 37 27.24 37.81a6 6 0 0 1 0 4.88'
    ]
  };

  const isUnstyled = (selector: InputPasswordTrees) => (typeof unstyled === 'boolean' ? unstyled : unstyled?.[selector]);

  return (
    <div data-field className={cn(!isUnstyled('wrapper') && 'w-full flex items-center relative', classNames?.wrapper)}>
      <input
        ref={ref}
        {...props}
        aria-invalid="false"
        className={cn(!isUnstyled('input') && [classesInput({ variant, size }), 'pr-10', !open && '[-webkit-text-security:disc]'], classNames?.input)}
        type={open ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        {...{ 'aria-disabled': disabled ? 'true' : 'false', disabled, autoComplete, spellCheck, placeholder }}
      />

      <button
        type="button"
        tabIndex={-1}
        onClick={() => setOpen(!open)}
        aria-label={!open ? 'View password toggle' : 'Hidden Password toggle'}
        className={cn(!isUnstyled('rightSection') && classesButtonPassword({ open, variant, size }), classNames?.rightSection)}
      >
        <Svg currentFill="fill" size="var(--size-icon)" viewBox="0 0 256 256" style={{ color: 'var(--eye-color, currentColor)' }}>
          {pathMap[String(open) as keyof typeof pathMap].map((d, key) => (
            <path key={key} d={d} />
          ))}
        </Svg>
      </button>
    </div>
  );
});
InputPassword.displayName = 'InputPassword';

type InputPinTrees = 'wrapper' | 'inputs' | 'input';
type InputPinValue = string | string[];
export type InputPinProps = Omit<InputProps, 'type' | 'unstyled' | 'value'> &
  UnstyledClasses<InputPinTrees> & {
    type?: 'alphanumeric' | 'numeric';
    length?: number;
    value?: InputPinValue;
    onChange?: string | React.ChangeEventHandler<HTMLInputElement> | undefined;
    triggerLast?: () => void;
  };

export const InputPin = React.forwardRef<HTMLInputElement, InputPinProps>((_props, ref) => {
  const {
    className,
    classNames,
    unstyled,
    placeholder = '○',
    type = 'numeric',
    onChange,
    length = 4,
    value,
    disabled,
    autoComplete = 'one-time-code',
    defaultValue,
    size,
    ...props
  } = _props;
  const __defaultValue: string[] = Array(length).fill('');
  const [inputPin, setInputPin] = React.useState<InputPinValue>(value ?? Array(length).fill(''));

  const isNumeric = type === 'numeric';

  const isUnstyled = (selector: InputPinTrees) => (typeof unstyled === 'boolean' ? unstyled : unstyled?.[selector]);

  const fakeEvent = (value: string) =>
    ({
      target: {
        value
      }
    }) as React.ChangeEvent<HTMLInputElement>;

  const handleChange = (index: number, inputValue: string) => {
    if (inputValue.length > 1) {
      // Hanya ambil karakter pertama jika lebih dari satu karakter dimasukkan
      inputValue = inputValue.charAt(0);
    }

    const newNum = [...inputPin];
    const numeric = inputValue.replace(/[^0-9]/g, '');
    const alphanumeric = inputValue.replace(/[<'|">[\]{}?/,.`\\%^&~:;*()+$#@!_\-\+=]/g, '');
    newNum[index] = isNumeric ? numeric : alphanumeric;
    setInputPin(newNum);

    // Pindahkan fokus ke input berikutnya jika karakter sudah dimasukkan
    if (index < length - 1 && inputValue.length === 1) {
      const nextInput = document.getElementById(`pin-input-${index + 1}`);

      // Validasi karakter berdasarkan tipe
      if ((isNumeric && !/^\d$/.test(inputValue)) || (!isNumeric && !/^[a-zA-Z0-9]$/.test(inputValue))) {
        return; // Hentikan proses jika karakter tidak sesuai dengan tipe
      } else if (nextInput) {
        nextInput.focus();
      }
    } else if (index > 0 && inputValue.length === 0) {
      // Kembali ke input sebelumnya jika karakter dihapus
      const prevInput = document.getElementById(`pin-input-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
      }
    }

    // Gabungkan nilai-nilai dan kirim ke fungsi onChange jika tersedia
    if (onChange) {
      onChange(fakeEvent(newNum.join('')));
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasteData = event.clipboardData.getData('text/plain');
    // Validasi karakter berdasarkan tipe
    const numeric = pasteData
      .replace(/[^0-9]/g, '')
      .split('')
      .slice(0, length);
    const alphanumeric = pasteData
      .replace(/[<'|">[\]{}?/,.`\\%^&~:;*()+$#@!_\-\+=]/g, '')
      .split('')
      .slice(0, length);
    const newValues = isNumeric ? numeric : alphanumeric;

    const newNum = [...inputPin];
    newValues.forEach((value, index) => {
      if (index < length) {
        newNum[index] = value;
      }
    });

    setInputPin(newNum);

    // Pindahkan fokus ke input berikutnya jika karakter sudah dimasukkan
    if (newValues.length > 0) {
      const nextInput = document.getElementById(`pin-input-${newValues.length}`);
      if (nextInput) {
        nextInput.focus();
      }
    }

    // Gabungkan nilai-nilai dan kirim ke fungsi onChange jika tersedia
    if (onChange) {
      onChange(fakeEvent(newNum.join('')));
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, currentIndex: number) => {
    if (event.key === 'ArrowLeft') {
      // Handle ketika tombol panah kiri ditekan
      event.preventDefault(); // Mencegah perpindahan kursor default di dalam input
      const prevIndex = Math.max(0, currentIndex - 1);
      const prevInput = document.getElementById(`pin-input-${prevIndex}`);
      if (prevInput) {
        prevInput.focus();
      }
    } else if (event.key === 'ArrowRight') {
      // Handle ketika tombol panah kanan ditekan
      event.preventDefault();
      const nextIndex = Math.min(length - 1, currentIndex + 1);
      const nextInput = document.getElementById(`pin-input-${nextIndex}`);
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  const inputs = Array.from({ length }, (_, index) => {
    return (
      <input
        key={index}
        inputMode={isNumeric ? 'numeric' : 'text'}
        id={`pin-input-${index}`}
        name={`pin-input-${index}`}
        aria-label={`pin-input-${index}`}
        value={inputPin[index]}
        onPaste={handlePaste}
        onFocus={e => e.target.select()}
        onKeyDown={e => handleKeyDown(e, index)}
        onChange={e => handleChange(index, e.target.value)}
        className={cn(
          !isUnstyled('inputs') && [
            "max-w-full relative flex items-center justify-center aria-[disabled='true']:opacity-65 aria-[disabled='true']:cursor-not-allowed focus:placeholder:opacity-0 placeholder:text-muted-foreground/80 placeholder:text-[24px] text-[20px] leading-[20px] font-bold text-center h-10 w-10 rounded-md border border-muted-foreground bg-transparent shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-0 focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-[#2f81f7] focus-visible:ring-offset-0",
            'focus-visible:pt-0 focus:pt-0',
            classesInput({ size })
          ],
          inputPin[index] ? 'p-0' : 'pt-0.5',
          className,
          classNames?.inputs
        )}
        {...{
          spellCheck: false,
          disabled,
          autoComplete,
          placeholder,
          'aria-invalid': false,
          type: isNumeric ? 'tel' : 'text',
          'aria-disabled': disabled ? true : false
        }}
      />
    );
  });

  return (
    <>
      <input
        ref={ref}
        type="hidden"
        tabIndex={-1}
        data-input={type}
        // value={num.join("")}
        value={Array.isArray(inputPin) ? inputPin.join('') : inputPin} // Memberikan hint tipe sebagai string[]
        className={classNames?.input}
        {...{ onChange, style: { display: 'none', visibility: 'hidden' } }}
        {...props}
      />

      <div className={cn(!isUnstyled('wrapper') && 'w-full max-w-full flex items-center flex-row flex-nowrap justify-between', classNames?.wrapper)}>{inputs}</div>
    </>
  );
});
InputPin.displayName = 'InputPin';

// Export as a composite component
interface InputComponent extends React.ForwardRefExoticComponent<InputProps> {
  Password: typeof InputPassword;
  Pin: typeof InputPin;
}
// Attach sub-components
Input.Password = InputPassword;
Input.Pin = InputPin;
