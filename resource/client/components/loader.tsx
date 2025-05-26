import * as React from 'react';
import Image from 'next/image';
import { cn } from 'cn';
import { ocx, type cvxResult } from 'xuxi';

import classes from '@/resource/styles/app.module.css';

type SubKeys = {
  spinner: 'root' | 'bar';
  orbit: 'root' | 'inner' | 'orbit';
  clockwise: 'root' | 'clockwise';
  dots: 'root' | 'dots';
  buffer: 'root' | 'buffer';
  rises: 'root' | 'rises';
  progressbar: 'root' | 'wrap' | 'inner';
  logo: 'container' | 'root' | 'wrap' | 'inner' | 'logo' | 'ringX' | 'ringY';
};

type classes = {
  [K in keyof SubKeys]: Record<SubKeys[K], string>;
};

type __Loader = keyof SubKeys;
type __Selector<T extends __Loader> = NonNullable<cvxResult<classes>[T]>;

type StylesNames<T extends __Loader> = {
  // @ts-ignore
  unstyled?: Partial<Record<__Selector<T>, boolean>>;
  className?: string;
  style?: React.CSSProperties & { [key: string]: any };
  classNames?: Partial<Record<SubKeys[T], string>>;
  // @ts-ignore
  styles?: Partial<Record<__Selector<T>, React.CSSProperties & { [key: string]: any }>>;
  color?: React.CSSProperties['color'] | 'currentColor';
  size?: string | number;
  duration?: number;
};

type LoaderSyntheticProps<K extends __Loader, T extends React.ElementType = 'div', Exclude extends string = never> = StylesNames<K> &
  Omit<React.ComponentPropsWithoutRef<T>, 'style' | 'color' | Exclude>;

function clamp(value: number, precision: number = 1): number {
  const factor = Math.pow(10, precision);
  return Math.round(value * factor) / factor;
}

function getStyles<T extends __Loader>(loader: T, selector: __Selector<T>, options?: StylesNames<T>) {
  const dynamicStyles = ['duration', 'color', 'size'].reduce(
    (acc, key) => {
      const value = options?.[key as keyof typeof options];
      if (value !== undefined) {
        acc[`--${loader}-${key}`] = key === 'duration' ? `${clamp(value as number)}s` : key === 'size' && typeof value === 'number' ? `${value}px` : String(value);
      }
      return acc;
    },
    {} as Record<string, string>
  );
  return {
    'data-loader': loader,
    [`data-${loader}`]: selector,
    className: cn({ 'stylelayer-loader': selector === 'root' }, !options?.unstyled?.[selector], options?.classNames?.[selector], options?.className),
    style: ocx(dynamicStyles, options?.styles?.[selector], options?.style)
  };
}

export function LoaderProgress(props: LoaderSyntheticProps<'progressbar'>) {
  const { className, classNames, ...rest } = props;
  return (
    <div {...rest} className={cn('overflow-hidden size-full min-w-full min-h-full m-auto flex items-center justify-center relative', className, classNames?.root)}>
      <div {...{ className: cn(classes.progress, classNames?.wrap), role: 'progressbar' }}>
        <div className={cn(classes.progress_bar, classNames?.inner)} />
      </div>
    </div>
  );
}

interface LoaderLogoProps extends LoaderSyntheticProps<'logo'> {
  image?: string;
}

export function LoaderLogo(props: LoaderLogoProps) {
  const { className, classNames, image = '/icons/assets-logo.png', ...rest } = props;
  return (
    <div {...rest} className={cn('overflow-hidden size-full min-w-full min-h-full m-auto flex items-center justify-center relative', className, classNames?.container)}>
      <div className={cn(classes.logoloadRoot, classNames?.root)}>
        <div className={cn(classes.logoloadWrap, classNames?.wrap)}>
          <div className={cn(classes.logoloadS, classNames?.inner)}>
            <Image alt="" width={86} height={86} src={image} className={cn('size-full', classNames?.logo)} />
          </div>
          <div data-loader-ring="x" className={cn(classes.boxloadX, classNames?.ringX)} />
          <div data-loader-ring="y" className={cn(classes.boxloadY, classNames?.ringY)} />
        </div>
      </div>
    </div>
  );
}

export const LoaderSpinner = React.forwardRef<HTMLDivElement, LoaderSyntheticProps<'spinner'>>(function LoaderSpinner(_props, ref) {
  const { size = '20px', color, duration = 1.2, unstyled, className, classNames, style, styles, ...props } = _props;
  return (
    <div {...{ ref, ...getStyles<'spinner'>('spinner', 'root', { size, color, duration, unstyled, className, classNames, style, styles }), ...props }}>
      {[...Array(12)].map((_, index) => (
        <div
          key={index}
          {...getStyles<'spinner'>('spinner', 'bar', {
            unstyled,
            classNames,
            style: {
              '--child-delay': `${clamp(-duration - index / -10)}s`,
              transform: `rotate(${clamp(30 * index)}deg) translate(146%)`
            },
            styles
          })}
        />
      ))}
    </div>
  );
});
LoaderSpinner.displayName = 'LoaderSpinner';

export const LoaderOrbit = React.forwardRef<HTMLDivElement, LoaderSyntheticProps<'orbit'>>(function LoaderOrbit(_props, ref) {
  const { size = '3rem', color, duration = 1.2, unstyled, className, classNames, style, styles, children, ...props } = _props;
  return (
    <div {...{ ref, ...getStyles<'orbit'>('orbit', 'root', { size, color, duration, unstyled, className, classNames, style, styles }), ...props }}>
      <div {...getStyles<'orbit'>('orbit', 'inner', { unstyled, classNames, styles })}>
        {[...Array(2)].map((_, index) => (
          <div key={index} {...getStyles<'orbit'>('orbit', 'orbit', { unstyled, classNames, styles })} />
        ))}
      </div>
      {children}
    </div>
  );
});

export const LoaderClockWise = React.forwardRef<HTMLDivElement, LoaderSyntheticProps<'clockwise'>>(function LoaderClockWise(_props, ref) {
  const { size = '3rem', color, duration = 1.2, unstyled, className, classNames, style, styles, ...props } = _props;
  return (
    <div {...{ ref, ...getStyles<'clockwise'>('clockwise', 'root', { size, color, duration, unstyled, className, classNames, style, styles }), ...props }}>
      {[...Array(2)].map((_, index) => (
        <div key={index} {...getStyles<'clockwise'>('clockwise', 'clockwise', { unstyled, classNames, styles })} />
      ))}
    </div>
  );
});

export const LoaderDots = React.forwardRef<HTMLDivElement, LoaderSyntheticProps<'dots'>>(function LoaderDots(_props, ref) {
  const { size = '3rem', color, duration = 1.2, unstyled, className, classNames, style, styles, ...props } = _props;
  return (
    <div {...{ ref, ...getStyles<'dots'>('dots', 'root', { size, color, duration, unstyled, className, classNames, style, styles }), ...props }}>
      {[...Array(4)].map((_, index) => (
        <div
          key={index}
          {...getStyles<'dots'>('dots', 'dots', {
            unstyled,
            classNames,
            styles,
            style: { '--dots-delay': `${clamp(0.2 * index)}s` }
          })}
        />
      ))}
    </div>
  );
});

export const LoaderBuffer = React.forwardRef<HTMLDivElement, LoaderSyntheticProps<'buffer'>>(function LoaderBuffer(_props, ref) {
  const { size = '3rem', color, duration = 1, unstyled, className, classNames, style, styles, ...props } = _props;
  return (
    <div {...{ ref, ...getStyles<'buffer'>('buffer', 'root', { size, color, duration, unstyled, className, classNames, style, styles }), ...props }}>
      {[...Array(5)].map((_, index) => (
        <div
          key={index}
          {...getStyles<'buffer'>('buffer', 'buffer', {
            unstyled,
            classNames,
            styles,
            style: { '--buffer-delay': `${clamp(((index + 1) / 5) * duration)}s` }
          })}
        />
      ))}
    </div>
  );
});

export const LoaderRises = React.forwardRef<HTMLDivElement, LoaderSyntheticProps<'rises'>>(function LoaderRises(_props, ref) {
  const { size = '3rem', color, duration = 1, unstyled, className, classNames, style, styles, ...props } = _props;
  return (
    <div {...{ ref, ...getStyles<'rises'>('rises', 'root', { size, color, duration, unstyled, className, classNames, style, styles }), ...props }}>
      <span className="sr-only hidden" />
    </div>
  );
});

export type LoaderProps =
  | ({ type?: 'spinner' } & LoaderSyntheticProps<'spinner'>)
  | ({ type?: 'orbit' } & LoaderSyntheticProps<'orbit'>)
  | ({ type?: 'clockwise' } & LoaderSyntheticProps<'clockwise'>)
  | ({ type?: 'dots' } & LoaderSyntheticProps<'dots'>)
  | ({ type?: 'progressbar' } & LoaderSyntheticProps<'progressbar'>)
  | ({ type?: 'logo' } & LoaderLogoProps)
  | ({ type?: 'buffer' } & LoaderSyntheticProps<'buffer'>)
  | ({ type?: 'rises' } & LoaderSyntheticProps<'rises'>);

const loaderMap = {
  spinner: LoaderSpinner,
  orbit: LoaderOrbit,
  clockwise: LoaderClockWise,
  dots: LoaderDots,
  buffer: LoaderBuffer,
  rises: LoaderRises,
  progressbar: LoaderProgress,
  logo: LoaderLogo
} as const;

export const Loader = React.forwardRef<HTMLDivElement, LoaderProps>((_props, ref) => {
  const { type = 'spinner', ...props } = _props;
  const Component = loaderMap[type];
  return <Component ref={ref} {...(props as LoaderSyntheticProps<typeof type>)} />;
}) as LoaderComponent;
Loader.displayName = 'Loader';

// Export as a composite component
type ForwardRef<T extends React.ElementType, Props> = React.ForwardRefExoticComponent<{ ref?: React.ComponentPropsWithRef<T>['ref'] } & Props>;
type LoaderComponent = ForwardRef<'div', LoaderProps> & {
  Spinner: typeof LoaderSpinner;
  Orbit: typeof LoaderOrbit;
  ClockWise: typeof LoaderClockWise;
  Dots: typeof LoaderDots;
  Buffer: typeof LoaderBuffer;
  Rises: typeof LoaderRises;
};
// Attach sub-components
Loader.Spinner = LoaderSpinner;
Loader.Orbit = LoaderOrbit;
Loader.ClockWise = LoaderClockWise;
Loader.Dots = LoaderDots;
Loader.Buffer = LoaderBuffer;
Loader.Rises = LoaderRises;
