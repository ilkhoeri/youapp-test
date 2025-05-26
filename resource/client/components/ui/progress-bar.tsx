import * as React from 'react';
import { cn } from 'cn';

export type ProgreessBarType = { value: number | undefined };
export interface ProgressBarProps extends ProgreessBarType, React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement> {
  unstyled?: boolean;
  style?: React.CSSProperties;
  animated?: 'run';
}

export const ProgressBar = React.forwardRef<HTMLSpanElement, ProgressBarProps>(function ProgressBar({ value, animated, className, style, unstyled, ...props }, ref) {
  return (
    <span
      {...{
        ref,
        role: 'progressbar',
        'aria-valuemin': 0,
        'aria-valuemax': 100,
        'aria-valuenow': value,
        'aria-valuetext': `${value}%`,
        'data-animated': animated,
        'data-role': 'progressbar',
        'data-state': 'indeterminate',
        className: cn(!unstyled && 'progressbar_class', className),
        style: {
          '--progress-value': `translateX(-${100 - (value || 0)}%)`,
          ...style
        } as React.CSSProperties,
        ...props
      }}
    />
  );
});
ProgressBar.displayName = 'ProgressBar';
