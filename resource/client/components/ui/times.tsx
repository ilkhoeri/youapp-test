'use client';
import React from 'react';
import Svg from './svg';
import x from 'xuxi';
import { cn } from 'cn';
import { getTime, getTimeAgo, getTimeInterval, isSameDate, type TimeAgoFormat } from '../../../const/times-helper';

const classesTime = x.cnx('flex flex-row items-center justify-start gap-1 text-xs text-muted-foreground');
const classes = x.cvx({
  variants: {
    selector: {
      root: 'grid grid-flow-row gap-1 text-sm',
      createdAt: classesTime,
      updatedAt: classesTime,
      interval: classesTime
    }
  }
});

export type StoreSubscriber<Value> = (value: Value) => void;
export type __Selector = NonNullable<x.cvxVariants<typeof classes>['selector']>;
type Options = StylesNames<__Selector> & {};
type CSSProperties = React.CSSProperties & { [key: string]: any };
type StylesNames<T extends string, Exclude extends string = never> = Omit<
  {
    unstyled?: Partial<Record<T, boolean>>;
    className?: string;
    style?: CSSProperties;
    classNames?: Partial<Record<T, string>>;
    styles?: Partial<Record<T, CSSProperties>>;
  },
  Exclude
>;
type ComponentProps<T extends React.ElementType, Exclude extends string = never> = StylesNames<__Selector> & {
  className?: string;
  style?: CSSProperties;
  color?: CSSProperties['color'];
} & React.PropsWithoutRef<Omit<React.ComponentProps<T>, 'style' | 'color' | Exclude>>;

function getStyles(selector: __Selector, options?: Options) {
  return {
    'data-card': cn(selector),
    className: cn(!options?.unstyled?.[selector] && classes({ selector }), options?.classNames?.[selector], options?.className),
    style: { ...options?.styles?.[selector], ...options?.style }
  };
}

export interface __TimesProps {
  diff?: TimeAgoFormat['diff'];
  locales?: TimeAgoFormat['locales'];
}

interface DefaultTimePropsConstructor extends ComponentProps<'time'> {
  time?: string | Date;
  locales?: TimeAgoFormat['locales'];
}

export interface TimeDefaultProps extends DefaultTimePropsConstructor {
  localeString?: Intl.DateTimeFormatOptions;
}
export interface TimeAgoProps extends DefaultTimePropsConstructor {
  diff?: TimeAgoFormat['diff'];
}

export type TimesProps = (TimeDefaultProps & { format?: 'default' }) | (TimeAgoProps & { format?: 'time-ago' });

export const Times = React.forwardRef<HTMLTimeElement, TimesProps>((_props, ref) => {
  const { time, children, suppressHydrationWarning, format = 'default', ...props } = _props;
  if (format === 'default') {
    const { localeString, locales, ...rest } = props as TimeDefaultProps;
    const content = children || (time && getTime(time, { locales, ...localeString }));
    return <time {...{ ref, dateTime: String(time), suppressHydrationWarning, ...rest }}>{content}</time>;
  }

  if (format === 'time-ago') {
    const { locales, diff, ...rest } = props as TimeAgoProps;
    const content = children || (time && getTimeAgo(new Date(String(time)), { locales, diff }));
    return <time {...{ ref, dateTime: String(time), suppressHydrationWarning, ...rest }}>{content}</time>;
  }

  return null;
}) as TimesComponent;
Times.displayName = 'Times';

export interface TimesPostedProps extends ComponentProps<'time'>, __TimesProps, StylesNames<__Selector> {
  withInterval?: boolean;
  times?: {
    createdAt?: string | Date;
    updatedAt?: string | Date;
  };
}
export const TimesPosted = React.forwardRef<HTMLTimeElement, TimesPostedProps>((_props, ref) => {
  const { times, diff, locales, unstyled, className, classNames, style, styles, withInterval, ...props } = _props;
  if (!times) {
    return null;
  }
  const sameDate = isSameDate(times?.createdAt, times?.updatedAt);
  const stylesApi = { unstyled, classNames, styles };
  const formatApi = { diff, locales };
  return (
    <div {...getStyles('root', { className, style, ...stylesApi })}>
      {times?.createdAt && (
        <Times time={times?.createdAt} {...{ ref, ...getStyles('createdAt', stylesApi), ...props, title: `Posted: ${getTimeAgo(new Date(times?.createdAt), formatApi)}` }}>
          <Svg>
            <path d="M20.983 12.548a9 9 0 1 0 -8.45 8.436" />
            <path d="M19 22v-6" />
            <path d="M22 19l-3 -3l-3 3" />
            <path d="M12 7v5l2.5 2.5" />
          </Svg>
          {getTimeAgo(new Date(times?.createdAt), formatApi)}
        </Times>
      )}
      {times?.updatedAt && !sameDate && (
        <Times time={times?.updatedAt} {...{ ref, ...getStyles('updatedAt', stylesApi), ...props, title: `Updated: ${getTimeAgo(new Date(times?.updatedAt), formatApi)}` }}>
          <Svg>
            <path d="M12 8l0 4l2 2" />
            <path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5" />
          </Svg>
          {getTimeAgo(new Date(times?.updatedAt), formatApi)}
        </Times>
      )}
      {withInterval && times?.createdAt && times?.updatedAt && !sameDate && (
        <Times time={times?.updatedAt} {...{ ref, ...getStyles('interval', stylesApi), ...props }}>
          <Svg>
            <path d="M14 10.5v3a1.5 1.5 0 0 0 3 0v-3a1.5 1.5 0 0 0 -3 0z" />
            <path d="M8 9h1.5a1.5 1.5 0 0 1 0 3h-.5h.5a1.5 1.5 0 0 1 0 3h-1.5" />
            <path d="M3 12v.01" />
            <path d="M7.5 4.2v.01" />
            <path d="M7.5 19.8v.01" />
            <path d="M4.2 16.5v.01" />
            <path d="M4.2 7.5v.01" />
            <path d="M12 21a9 9 0 0 0 0 -18" />
          </Svg>
          Interval: {getTimeInterval(new Date(times?.createdAt), new Date(times?.updatedAt))}
        </Times>
      )}
    </div>
  );
});
TimesPosted.displayName = 'TimesPosted';

// Export Timeline as a composite component
type TimesComponent = React.ForwardRefExoticComponent<TimesProps> & {
  Posted: typeof TimesPosted;
};
// Attach sub-components
Times.Posted = TimesPosted;
