import React from 'react';
import { Handle as ResizableHandle } from '../ui/resizable';
import { cn } from 'cn';
import { cvx, cvxVariants } from 'xuxi';

interface ContainerSkeletonProps {
  layouts?: Array<number>;
  className?: string;
}
const classes = 'h-full max-xl:min-h-[176dvh] max-xl:max-h-[176dvh] xl:min-h-[80dvh] xl:max-h-[82dvh] items-stretch border rounded-2xl';

export function ContainerSkeleton(props: ContainerSkeletonProps) {
  const { layouts = [15, 30, 55], className } = props;

  const handle = (
    <div className="relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 max-xl:h-px max-xl:w-full max-xl:after:left-0 max-xl:after:h-1 max-xl:after:w-full max-xl:after:-translate-y-1/2 max-xl:after:translate-x-0 [&>div]:max-xl:rotate-90">
      <ResizableHandle />
    </div>
  );

  return (
    <div className={cn('flex w-full flex-col xl:flex-row overflow-hidden cursor-not-allowed', classes, className)}>
      {layouts?.map((grow, idx) => (
        <React.Fragment key={idx}>
          <div className="animate-pulse bg-muted/30" style={{ flex: `${grow} 1 0`, overflow: 'hidden', animationDelay: `${grow * 10}ms` }}></div>
          {idx < layouts.length - 1 && handle}
        </React.Fragment>
      ))}
    </div>
  );
}

const bubbleClasses = cvx({
  variants: {
    selector: {
      root: 'flex flex-row items-start gap-x-1 max-w-[80%]',
      avatar: 'size-8 bg-muted rounded-full animate-pulse [animation-delay:250ms]',
      container: 'relative flex-1 flex flex-col gap-1 animate-pulse',
      arrow: 'size-3 bg-muted rounded-none absolute top-0 z-[10]',
      body: 'h-16 w-full bg-muted rounded-lg',
      date: 'h-2.5 w-1/6 bg-muted invert rounded-[3.5px] absolute bottom-1'
    }
  }
});

const bubbleStyles = (isLeft = false): Record<ChatBubbleTrees, CSSProperties> => ({
  root: {
    '--padd': '0.625rem',
    '--safe-date': '0.25rem',
    [isLeft ? 'marginRight' : 'marginLeft']: 'auto'
  },
  avatar: {
    order: isLeft ? '0' : '1',
    msOrder: isLeft ? '0' : '1',
    WebkitOrder: isLeft ? '0' : '1'
  },
  container: {
    [isLeft ? 'paddingLeft' : 'paddingRight']: 'var(--padd)',
    order: isLeft ? '1' : '0',
    msOrder: isLeft ? '1' : '0',
    WebkitOrder: isLeft ? '1' : '0'
  },
  arrow: {
    clipPath: isLeft ? 'polygon(100% 0,0 0,100% 100%)' : 'polygon(100% 0, 0 0, 0 100%)',
    [isLeft ? 'left' : 'right']: 0
  },
  body: {
    [isLeft ? 'borderTopLeftRadius' : 'borderTopRightRadius']: 0
  },
  date: {
    right: isLeft ? 'calc(var(--safe-date) * 1)' : 'calc((var(--padd) + var(--safe-date)) * 1)'
  }
});

type CSSProperties = React.CSSProperties & Record<string, any>;
type ChatBubbleTrees = NonNullable<cvxVariants<typeof bubbleClasses>['selector']>;

interface GetStyles {
  className?: string;
  style?: CSSProperties;
}

function getStyles(selector: ChatBubbleTrees, { isLeft = false }): GetStyles {
  return {
    className: bubbleClasses({ selector }),
    style: bubbleStyles(isLeft)[selector]
  };
}

export function ChatSkeleton() {
  return (
    <div className="size-full flex flex-col gap-6 rounded-lg shadow-md p-2">
      <div className="h-10 bg-muted rounded w-full animate-pulse delay-500" />

      <div className="space-y-6 size-full p-2 pt-0">
        {[...Array(5)].map((_, i) => {
          const isLeft = i % 2 === 0;
          return (
            <div key={i} {...getStyles('root', { isLeft })}>
              <div {...getStyles('avatar', { isLeft })} />
              <div {...getStyles('container', { isLeft })}>
                <div {...getStyles('arrow', { isLeft })} />
                <div {...getStyles('body', { isLeft })} />
                <div {...getStyles('date', { isLeft })} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const Skeleton: Component = () => <div />;

// Export as a composite component
interface Component extends React.FC<any> {
  Container: typeof ContainerSkeleton;
  Chat: typeof ChatSkeleton;
  ContainerClasses: typeof classes;
}
// Attach sub-components
Skeleton.Container = ContainerSkeleton;
Skeleton.Chat = ChatSkeleton;
Skeleton.ContainerClasses = classes;
