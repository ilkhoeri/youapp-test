'use client';

import { mergeRefs } from '@/resource/hooks/use-merged-ref';
import { cvx, cvxVariants } from 'xuxi';
import React, { useState, createContext, useEffect, useRef, useContext, useCallback } from 'react';
import { twMerge } from 'tailwind-merge';

interface AccordionContextProps {
  openId: string | null;
  setOpenId: React.Dispatch<React.SetStateAction<string | null>>;
  defaultOpen: string | null;
}

type ElementType<T extends React.ElementType> = React.ComponentPropsWithoutRef<T> & { unstyled?: boolean };

export const AccordionContext = createContext<AccordionContextProps | undefined>(undefined);

export const useAccordionContext = () => {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error('useAccordionContext must be used within an Accordion');
  }
  return context;
};

export interface AccordionProps extends React.ComponentPropsWithRef<'div'> {
  defaultOpen?: string | null;
  unstyled?: boolean;
}

/**
```js
// usage
<Accordion>
  {data.map((item, index) => (
    <AccordionItem key={index} id={String(item.title.toLowerCase().replace(/\s/g, "-"))}>
      <AccordionTrigger>{item.title}</AccordionTrigger>
      <AccordionContent>{item.description}</AccordionContent>
    </AccordionItem>
  ))}
</Accordion>
```
 */
export const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(({ defaultOpen = null, ...props }, ref) => {
  const [openId, setOpenId] = useState<string | null>(defaultOpen);
  return (
    <AccordionContext.Provider value={{ openId, setOpenId, defaultOpen }}>
      <div {...props} ref={ref} />
    </AccordionContext.Provider>
  );
}) as AccordionComponent;
Accordion.displayName = 'Accordion';

export const AccordionTrigger = React.forwardRef<HTMLButtonElement, ElementType<'button'>>((_props, ref) => {
  const { unstyled, ...props } = _props;
  const { triggerRef, toggle } = useAccordionItemContext();
  return <button ref={mergeRefs(triggerRef, ref)} onClick={() => toggle()} {...classes('trigger', { unstyled, ...props })} {...props} />;
});
AccordionTrigger.displayName = 'AccordionTrigger';

interface AccordionItemContextProps {
  isOpen: boolean;
  triggerRef: React.RefObject<HTMLButtonElement>;
  contentRef: React.RefObject<HTMLDivElement>;
  contentHeight: number;
  value: string | undefined;
  toggle: () => void;
}

const AccordionItemContext = createContext<AccordionItemContextProps | undefined>(undefined);

const useAccordionItemContext = () => {
  const context = useContext(AccordionItemContext);
  if (!context) {
    throw new Error('useAccordionItemContext must be used within an AccordionItem');
  }
  return context;
};

export interface AccordionItemProps extends ElementType<'div'> {
  value?: string;
}
export const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>((_props, ref) => {
  const { unstyled, value, ...props } = _props;
  const { openId, setOpenId } = useAccordionContext();

  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [contentHeight, setContentHeight] = useState(0);
  const isOpen = openId === value;

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [isOpen]);

  const toggle = useCallback(() => {
    value && setOpenId(isOpen ? null : value);
  }, [isOpen, setOpenId]);

  // useEffect(() => {
  //   const el = triggerRef.current;
  //   if (el) {
  //     el.addEventListener("click", toggle);
  //     return () => {
  //       el.removeEventListener("click", toggle);
  //     };
  //   }
  // }, [toggle]);

  return (
    <AccordionItemContext.Provider value={{ isOpen, triggerRef, contentRef, contentHeight, value, toggle }}>
      <div ref={ref} {...classes('item', { unstyled, ...props })} {...props} />
    </AccordionItemContext.Provider>
  );
});
AccordionItem.displayName = 'AccordionItem';

export const AccordionContent = React.forwardRef<HTMLDivElement, ElementType<'div'>>((_props, ref) => {
  const { unstyled, ...props } = _props;
  const { contentRef, contentHeight, isOpen, value } = useAccordionItemContext();
  return (
    <div
      ref={mergeRefs(contentRef, ref)}
      {...{
        ...classes('content', { unstyled, ...props }),
        role: props?.role || 'region',
        'aria-labelledby': props['aria-labelledby'] || value,
        style: {
          ...props?.style,
          height: isOpen ? contentHeight : 0,
          overflow: 'hidden',
          transition: 'height 0.3s ease'
        }
      }}
      {...props}
    />
  );
});
AccordionContent.displayName = 'AccordionContent';

// Export as a composite component
type AccordionComponent = React.ForwardRefExoticComponent<AccordionProps> & {
  Root: typeof Accordion;
  Item: typeof AccordionItem;
  Trigger: typeof AccordionTrigger;
  Content: typeof AccordionContent;
};
// Attach sub-components
Accordion.Root = Accordion;
Accordion.Item = AccordionItem;
Accordion.Trigger = AccordionTrigger;
Accordion.Content = AccordionContent;

const classesVariant = cvx({
  variants: {
    selector: {
      root: '',
      trigger: 'relative z-9 w-full flex flex-row items-center justify-between flex-1 py-4 rounded-none font-medium hover:underline [&[data-state=open]>svg]:rotate-180',
      item: 'group relative flex flex-col h-auto select-none border-b',
      content: 'overflow-hidden transition-[height] bg-transparent m-0 p-0 w-full text-left'
    }
  }
});

type Selector = NonNullable<cvxVariants<typeof classesVariant>['selector']>;

interface ClassesProps {
  unstyled?: boolean;
  className?: string;
}

function classes(selector: Selector, options: ClassesProps) {
  const { unstyled, className } = options;

  return {
    className: twMerge(!unstyled && classesVariant({ selector }), className)
  };
}
