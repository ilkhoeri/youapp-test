import * as React from 'react';
import { cn } from 'cn';

export const CardHeader = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
));
CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef<HTMLParagraphElement, React.ComponentProps<'h3'>>(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn('text-2xl font-semibold leading-none tracking-tight', className)} {...props} />
));
CardTitle.displayName = 'CardTitle';

export const CardDescription = React.forwardRef<HTMLParagraphElement, React.ComponentProps<'p'>>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
));
CardDescription.displayName = 'CardDescription';

export const CardContent = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

export const CardFooter = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...props} />
));
CardFooter.displayName = 'CardFooter';

export interface CardData {
  title?: React.ReactNode;
  description?: React.ReactNode;
  content?: React.ReactNode | React.ReactNode[];
  foot?: React.ReactNode;
}
type CardTrees = 'root' | 'header' | 'title' | 'description' | 'content' | 'footer';
export interface CardProps extends React.ComponentProps<'div'> {
  data?: CardData | CardData[];
  classNames?: Partial<Record<CardTrees, string>>;
}
export const Card = React.forwardRef<HTMLDivElement, CardProps>(({ data, className, classNames, children, ...props }, ref) => {
  function renderRoot(children: React.ReactNode) {
    return (
      <div ref={ref} className={cn('relative rounded-2xl text-color bg-card shadow-card', className, classNames?.root)} {...props}>
        {children}
      </div>
    );
  }

  function renderContent(props: CardData) {
    return (
      <>
        {(props?.title || props?.description) && (
          <CardHeader className={cn('pb-4', classNames?.header)}>
            {props?.title && <CardTitle className={cn(classNames?.title)}>{props?.title}</CardTitle>}
            {props?.description && <CardDescription className={cn(classNames?.description)}>{props?.description}</CardDescription>}
          </CardHeader>
        )}
        {props?.content && (
          <CardContent className={cn(classNames?.content)}>
            {Array.isArray(props.content) ? props.content.map((content, index) => <React.Fragment key={index}>{content}</React.Fragment>) : props?.content}
          </CardContent>
        )}
        {props?.foot && <CardFooter className={cn(classNames?.footer)}>{props?.foot}</CardFooter>}
      </>
    );
  }

  if (data) {
    return Array.isArray(data) ? data.map((cntn, index) => <React.Fragment key={index}>{renderRoot(renderContent(cntn))}</React.Fragment>) : renderRoot(renderContent(data));
  }

  return renderRoot(children);
}) as CardComponent;
Card.displayName = 'Card';

interface CardContentListItemDataProps {
  label?: React.ReactNode;
  value?: React.ReactNode;
}
export type CardContentListDataProps = (string | CardContentListItemDataProps)[];
type CardContentListTrees = 'list' | 'item';
interface CardContentListProps extends React.ComponentProps<'ul'> {
  listProps?: React.ComponentPropsWithRef<'li'>;
  data?: CardContentListDataProps;
  classNames?: Partial<Record<CardContentListTrees, string>>;
  visible?: boolean;
}

export const CardContentList = React.forwardRef<HTMLUListElement, CardContentListProps>((_props, ref) => {
  const { data, className, classNames, visible, listProps, ...props } = _props;

  function transformSelectData(data: CardContentListDataProps): CardContentListItemDataProps[] {
    return data.map(item => {
      if (typeof item === 'string') {
        return { label: '', value: item };
      }

      return { label: item.label, value: item.value };
    });
  }
  const transformData = data && transformSelectData(data);

  return (
    <ul
      {...props}
      ref={ref}
      className={cn('text-sm mt-2 space-y-0.5 rounded-md', { 'bg-muted animate-pulse text-transparent [&_*]:!text-transparent': visible }, className, classNames?.list)}
    >
      {transformData?.map((item, index) => (
        <li key={index} {...listProps} className={cn(classNames?.item, listProps?.className)}>
          {item?.label} {item?.value}
        </li>
      ))}
    </ul>
  );
});
CardContentList.displayName = 'CardContentList';

// Export as a composite component
interface CardComponent extends React.ForwardRefExoticComponent<CardProps> {
  Header: typeof CardHeader;
  Title: typeof CardTitle;
  Description: typeof CardDescription;
  Content: typeof CardContent;
  ContentList: typeof CardContentList;
  Footer: typeof CardFooter;
}
// Attach sub-components
Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;
Card.ContentList = CardContentList;
Card.Footer = CardFooter;
