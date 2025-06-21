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
          <div className="animate-pulse bg-muted/30" style={{ flex: `${grow} 1 0`, overflow: 'hidden', animationDelay: `${(idx + 1) * 1000}ms` }}></div>
          {idx < layouts.length - 1 && handle}
        </React.Fragment>
      ))}
    </div>
  );
}

const bubbleClasses = cvx({
  variants: {
    selector: {
      root: 'transition-[height,width] flex flex-row items-start gap-x-1 max-w-[80%] ',
      avatar: 'size-8 bg-muted rounded-full animate-pulse [animation-delay:250ms]',
      container: 'relative flex-1 flex flex-col gap-1 animate-pulse',
      arrow: 'size-3 bg-muted rounded-none absolute top-0 z-[10]',
      body: 'transition-[height,width] h-16 w-full bg-muted rounded-lg',
      date: 'h-2.5 w-16 min-w-16 bg-muted invert rounded-[3.5px] absolute bottom-1'
    }
  }
});

function bubbleStyles(isLeft = false): Record<ChatBubbleTrees, CSSProperties> {
  const randomHeight = `${Math.floor(Math.random() * (146 - 64 + 1)) + 64}px`; // 64px - 146px
  const randomWidth = `${Math.floor(Math.random() * 55) + 30}%`; // antara 35% - 85%
  return {
    root: {
      '--padd': '0.625rem',
      '--safe-date': '0.25rem',
      width: randomWidth,
      minWidth: '200px',
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
      height: randomHeight,
      [isLeft ? 'borderTopLeftRadius' : 'borderTopRightRadius']: 0
    },
    date: {
      right: isLeft ? 'calc(var(--safe-date) * 1)' : 'calc((var(--padd) + var(--safe-date)) * 1)'
    }
  };
}

type CSSProperties = React.CSSProperties & Record<string, any>;
type ChatBubbleTrees = NonNullable<cvxVariants<typeof bubbleClasses>['selector']>;

interface GetStyles {
  className?: string;
  style?: CSSProperties;
}

function getStyles(selector: ChatBubbleTrees, i: number): GetStyles {
  const isLeft = i % 2 === 0;
  const label = selector + '-skeleton-' + (isLeft ? 'left' : 'right');
  return {
    className: cn(label, bubbleClasses({ selector })),
    style: bubbleStyles(isLeft)[selector]
  };
}

export function ChatSkeleton() {
  return (
    <div data-skeleton="chat-bubble" className="size-full flex flex-col gap-6 rounded-lg shadow-md p-2">
      <div className="h-10 min-h-10 bg-muted rounded w-full animate-pulse delay-500" />

      <div data-skeleton="bubble-inner" className="flex flex-col gap-6 size-full p-2 pt-0">
        {[...Array(5)].map((_, i) => {
          return (
            <div key={i} {...getStyles('root', i)}>
              <div {...getStyles('avatar', i)} />
              <div {...getStyles('container', i)}>
                <div {...getStyles('arrow', i)} />
                <div {...getStyles('body', i)} />
                <div {...getStyles('date', i)} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ChatListItemSkeleton() {
  return [...Array(5)].map((_, i) => {
    // Generate random widths for elements Math.floor(Math.random() * X) + Y
    const labelWidth = `${Math.floor(Math.random() * 40) + 10}%`;
    const msgWidth = `${Math.floor(Math.random() * 50) + 40}%`;
    return (
      <div
        key={i}
        className="animate-pulse delay-0 w-full relative flex items-center space-x-3 py-3 px-4 rounded-lg transition cursor-none [--bg:#e4ebf1] dark:[--bg:#1c252e] bg-[var(--bg)]"
      >
        <span className="animate-pulse delay-100 invert bg-[var(--bg)] size-8 rounded-full" />
        <div className="min-w-0 flex-1 flex flex-col gap-1 [&_.animate-pulse]:bg-[var(--bg)] [&_.animate-pulse]:invert">
          <div className="flex justify-between items-center gap-1">
            <span className="animate-pulse delay-150 block h-[22px] w-1/4 rounded-sm" style={{ width: labelWidth }} />
            <span className="animate-pulse delay-200 block h-[14px] w-28 rounded-sm" />
          </div>
          <span className="animate-pulse delay-100 block h-4 w-2/3 rounded-sm" style={{ width: msgWidth }} />
        </div>
      </div>
    );
  });
}

export const Skeleton: Component = () => <div />;

// Export as a composite component
interface Component extends React.FC<any> {
  Container: typeof ContainerSkeleton;
  Chat: typeof ChatSkeleton;
  ListItem: typeof ChatListItemSkeleton;
  ContainerClasses: typeof classes;
}
// Attach sub-components
Skeleton.Container = ContainerSkeleton;
Skeleton.Chat = ChatSkeleton;
Skeleton.ListItem = ChatListItemSkeleton;
Skeleton.ContainerClasses = classes;
