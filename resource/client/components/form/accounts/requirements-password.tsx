'use client';
import * as React from 'react';
import { Svg } from '../../ui/svg';
import { twMerge } from 'tailwind-merge';

export const requirements = (min: number = 10, max: number = 100) =>
  [
    { rg: new RegExp(`^.{${min},${max}}$`), label: `Minimum ${min} characters and maximum ${max} characters` },
    { rg: /[a-z]/, label: 'Minimum one lowercase character' },
    { rg: /[A-Z]/, label: 'Minimum one uppercase character' },
    { rg: /[0-9]/, label: 'Minimum one number' },
    { rg: /[$&+,:;=?@#|'<>.^*()%!-]/, label: 'Minimum one special character (e.g. !@#?)' }
  ] as const;

type Selector = 'root' | 'item' | 'icon' | 'label' | 'progressRoot' | 'progressIndicator';

const meetsSvgMap = {
  true: ['M5 12l5 5l10 -10'],
  false: ['M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z']
} as const;

interface RequirementPasswordProps extends React.ComponentProps<'ul'> {
  value: string;
  withProgressBars?: boolean;
  pswLength?: { min?: number; max?: number };
  classNames?: Partial<Record<Selector, string>>;
  styles?: Partial<Record<Selector, React.CSSProperties & Record<string, any>>>;
  style?: React.CSSProperties & Record<string, any>;
}
export const RequirementPassword = React.forwardRef<HTMLUListElement, RequirementPasswordProps>((_props, ref) => {
  const { value, role = 'list', withProgressBars = false, pswLength = {}, style, styles, className, classNames, ...props } = _props;

  const { min = 10, max = 100 } = pswLength;
  const rQ = requirements(min, max);
  const rqLength = rQ.length;

  const getStrengthPassword = (psw: string) => {
    let multiplier = psw.length > min - 1 ? 0 : 1;

    rQ.forEach(rq => {
      if (!rq.rg.test(psw)) {
        multiplier += 1;
      }
    });

    return Math.max(100 - (100 / (rQ.length + 1)) * multiplier, 10);
  };

  const progressBars = Array(rqLength)
    .fill(0)
    .map((_, index) => {
      const position = value.length > 0 && index === 0 ? 100 : getStrengthPassword(value) >= ((index + 1) / rqLength) * 100 ? 100 : 0;
      return (
        <div
          key={index}
          {...{
            'aria-valuemax': 100,
            'aria-valuemin': 0,
            'data-state': 'indeterminate',
            'data-max': '100',
            'aria-label': `rqpsw-progress-${index + 1}`,
            role: 'progressbar',
            className: twMerge('relative overflow-hidden flex rounded-full border w-full h-[10px]', classNames?.progressRoot),
            style: styles?.progressRoot
          }}
        >
          <div
            {...{
              'data-state': 'indeterminate',
              'data-max': '100',
              className: twMerge(
                'h-full w-full flex-1 transition-all',
                getStrengthPassword(value) > 90 ? 'bg-[#22c55e]' : getStrengthPassword(value) > 50 ? 'bg-[#ca8a04]' : 'bg-[#dc2626]',
                classNames?.progressIndicator
              ),
              style: { ...styles?.progressIndicator, transform: `translateX(-${100 - position}%)` }
            }}
          />
        </div>
      );
    });

  return (
    <ul
      ref={ref}
      className={twMerge('w-full md:col-span-2 flex flex-col text-[13px] md:text-sm', className, classNames?.root)}
      {...{ role, style: { ...style, ...styles?.root }, ...props }}
    >
      {withProgressBars && (
        <li role="listitem" className={twMerge('w-full grid grid-cols-5 gap-2', classNames?.item)} {...{ style: styles?.item }}>
          {progressBars}
        </li>
      )}
      {rQ.map((rq, index) => {
        const meets = rq.rg.test(value);
        return (
          <li
            key={index}
            role="listitem"
            data-state={meets ? 'pass' : undefined}
            className={twMerge(
              'relative w-full flex items-start flex-row flex-nowrap font-normal gap-1.5 text-wrap truncate text-color data-[state=pass]:text-[#22c55e]',
              classNames?.item
            )}
            {...{ style: styles?.item }}
          >
            <Svg size={12} className={twMerge('relative top-1', classNames?.icon)} {...{ style: styles?.icon }}>
              {meetsSvgMap[String(meets) as keyof typeof meetsSvgMap].map(i => (
                <path key={i} d={i} />
              ))}
            </Svg>
            <p data-state={meets ? 'pass' : undefined} className={classNames?.label} {...{ style: styles?.label }}>
              {rq.label}
            </p>
          </li>
        );
      })}
    </ul>
  );
});
RequirementPassword.displayName = 'RequirementPassword';
