'use client';
import * as React from 'react';
import { AccessDenied403, InternalError500, NotFound404 } from '../icons-illustration';
import { cn } from 'cn';

type StatusErrorTrees = 'root' | 'title' | 'description' | 'svg';
type StatusErrorOption = 'NotFound' | 'internal-error' | 'denied';

interface StatusErrorObject {
  title: string;
  description: string | string[];
  icon: typeof AccessDenied403;
}

interface StatusErrorProps extends React.ComponentProps<'div'> {
  svgProps?: React.ComponentPropsWithRef<typeof AccessDenied403>;
  classNames?: Partial<Record<StatusErrorTrees, string>>;
  status: StatusErrorOption;
}

const statusErrorMap: Record<StatusErrorOption, StatusErrorObject> = {
  denied: {
    title: 'Permission denied',
    description: 'You do not have permission to access this page.',
    icon: AccessDenied403
  },
  'internal-error': {
    title: '500 Internal server error',
    description: 'There was an error, please try again later.',
    icon: InternalError500
  },
  NotFound: {
    title: 'Sorry, page not found!',
    description: ['Sorry, we couldn’t find the page you’re looking for.', 'Perhaps you’ve mistyped the URL? Be sure to check your spelling.'],
    icon: NotFound404
  }
} as const;

export const StatusError = React.forwardRef<HTMLDivElement, StatusErrorProps>((_props, ref) => {
  const { classNames, className, svgProps, status, children, ...props } = _props;

  const title = statusErrorMap[status].title;
  const description = statusErrorMap[status].description;
  const Icon = statusErrorMap[status].icon;

  return (
    <div
      ref={ref}
      {...props}
      className={cn('px-4 md:px-6 mx-auto w-full flex flex-col items-center justify-center text-center font-system py-20 illustration-animated', className, classNames?.root)}
    >
      <h3 className={cn('text-[1.125rem] sm:text-[1.5rem] md:text-[1.625rem] lg:text-[1.875rem] xl:text-[2rem] leading-normal my-0 mt-0 mb-4 font-bold', classNames?.title)}>{title}</h3>
      <p className={cn('text-base font-normal text-[--palette-text-secondary]', classNames?.description)}>
        {typeof description === 'string'
          ? description
          : description.map((list, index) => {
              return (
                <React.Fragment key={index}>
                  {list}
                  {index < description?.length - 1 && <br />}
                </React.Fragment>
              );
            })}
      </p>
      <Icon {...svgProps} className={cn('my-10 md:my-20', svgProps?.className, classNames?.svg)} />
      {children}
    </div>
  );
});
StatusError.displayName = 'StatusError';
