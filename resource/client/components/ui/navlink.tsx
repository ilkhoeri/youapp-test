'use client';
import * as React from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import Link, { type LinkProps } from 'next/link';
import type { IconType, DetailedSvgProps } from '@/resource/client/components/ui/svg';
import { cn } from 'cn';

type NavLinkTrees = 'link' | 'active' | 'icon' | 'img' | 'title' | 'mark';
export type NavLinkClass = {
  classNames?: Partial<Record<NavLinkTrees, string>>;
};

export interface NavLinkItemProps {
  href: string;
  title?: string;
  icon?: IconType | undefined;
  iconProps?: DetailedSvgProps;
  image?: string | undefined;
  isNew?: boolean | undefined;
  style?: React.CSSProperties & { [key: string]: any };
}
export interface NavLinkProps extends Omit<LinkProps, 'href'>, Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>, NavLinkClass {
  items: NavLinkItemProps[];
  includePath?: boolean;
  children?: React.ReactNode;
}

export const getPathSegments = (path: string) => path.toLowerCase().split('/').filter(Boolean);

export function NavLink({ items, ...props }: NavLinkProps) {
  return items.map((item, index) => <NavLinkItem key={index} href={item.href} title={item.title} icon={item.icon} {...props} />);
}

interface NavLinkItemTypes extends Omit<LinkProps, 'href'>, Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'style'>, NavLinkItemProps, NavLinkClass {
  includePath?: boolean;
}
export function NavLinkItem(_props: NavLinkItemTypes) {
  const { href = '', title, icon: Icon, image, isNew, scroll = false, className, classNames, includePath, iconProps, style, ...props } = _props;
  const pathname = usePathname();

  const pathSegments = getPathSegments(pathname);
  const pathActive = includePath ? pathSegments.includes(href) : pathname === `${href}/`;

  return (
    <>
      <Link
        {...{
          href,
          scroll,
          'data-path': pathActive ? 'active' : undefined,
          'data-mark': isNew ? 'true' : undefined,
          className: cn(className, classNames?.link, pathActive && classNames?.active),
          style,
          ...props
        }}
      >
        {image && (
          <Image
            alt=""
            draggable="false"
            src={image || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs%3D'}
            height={20}
            width={20}
            loading="lazy"
            data-linkitem="img"
            className={classNames?.img}
            onContextMenu={e => e.preventDefault()}
          />
        )}
        {Icon && <Icon data-linkitem="icon" className={cn(classNames?.icon, iconProps?.className)} {...iconProps} />}
        <span data-linkitem="title" className={classNames?.title}>
          {title}
        </span>
      </Link>

      {isNew && <Mark mark={true} childTrue="NEW" className={classNames?.mark} />}
    </>
  );
}

export type MarkProps = {
  className?: string;
  childTrue?: React.ReactNode;
  childFalse?: React.ReactNode;
  mark: boolean;
} & React.HTMLAttributes<HTMLElement>;

export const Mark = React.forwardRef<HTMLElement, MarkProps>(function Mark({ childTrue, childFalse, className, mark, ...props }, ref) {
  return (
    <mark
      ref={ref}
      className={cn(
        'h-4 w-max select-none rounded px-1 text-center font-mono text-[10px] font-semibold uppercase leading-[16px] text-white',
        mark === true ? 'bg-[#2ea043] tracking-wide' : 'bg-[#e54b4b] tracking-[0]',
        className
      )}
      {...props}
    >
      {mark === true ? (childTrue ?? 'True') : (childFalse ?? 'False')}
    </mark>
  );
});
Mark.displayName = 'Mark';
