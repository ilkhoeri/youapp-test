'use client';
import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '../../ui/button';
import { Loader } from '../../loader';
import { cn } from 'cn';

interface Options {
  className?: string;
}

export function styleForm() {
  return {
    auth() {
      return {
        focused() {
          return {
            label: 'text-2xl font-bold cursor-pointer !mb-4 ml-6 rtl:ml-auto rtl:mr-6',
            input: 'transition-all placeholder-shown:opacity-50 group-focus-within:opacity-100'
          };
        },
        item(opt: Options = {}) {
          return cn('transition-all duration-300 has-[input:placeholder-shown]:opacity-50 group-focus-within:opacity-100', opt.className);
        },
        submit(opt: Options = {}) {
          return cn(
            "w-full bg-gradient-button transition-[transform,opacity] duration-500 group-focus-within:opacity-100 group-has-[input[value='']]:opacity-25 group-has-[input[value='']]:pointer-events-none",
            opt.className
          );
        }
      };
    },
    account() {
      return {
        className: 'flex flex-row items-center justify-between space-y-0',
        classNames: {
          label: 'text-[13px] font-medium text-[#ffffff54]',
          input:
            'border dark:border-[#ffffff38] text-right text-[13px] dark:read-only:text-[#ffffff4d] placeholder:text-[13px] dark:placeholder:text-[#ffffff4d] w-full max-w-[65%] read-only:focus-visible:border-[#ffffff38] *:text-[13px] *:text-[#ffffff4d] [&_span]:ml-auto [&_span]:aria-selected:text-color'
        }
      };
    }
  };
}

interface ButtonSubmitProps extends React.ComponentPropsWithRef<typeof Button> {
  label: string;
}
export function AuthButtonSubmit(_props: ButtonSubmitProps) {
  const { label, className, ...props } = _props;
  return (
    <Button {...props} type="submit" size="2xl" className={styleForm().auth().submit({ className })}>
      <span className="text-white relative z-[3]">{label}</span>
      <span className="backdrop-gradient transition-[transform,opacity] duration-500 group-focus-within:opacity-100 group-has-[input[value='']]:opacity-0 group-has-[input[value='']]:[transform:translate(-50%,-50%)]" />
    </Button>
  );
}

interface DirectLinkProps extends React.ComponentPropsWithRef<typeof Link> {
  label: string[];
  disabled?: boolean;
}
export function DirectLink(_props: DirectLinkProps) {
  const { label, disabled, href, className, ...props } = _props;
  return (
    <div {...{ 'aria-disabled': disabled }} className={cn('mt-4 text-center text-[13px] font-medium flex items-center justify-center gap-1 aria-disabled:opacity-50', className)}>
      <span className="text-white">{label[0]}</span>
      <Link {...props} aria-disabled={disabled} tabIndex={-1} href={href} className="underline-hover text-gradient">
        {label[1]}
      </Link>
    </div>
  );
}

interface HeadImageSignProps extends React.ComponentPropsWithRef<'div'> {
  imageUrl?: string;
  title?: string;
  description?: string;
}
export function HeadImageSign(_props: HeadImageSignProps) {
  const { imageUrl = '/icons/logo-full.svg', title, description, className, ...props } = _props;
  return (
    <div {...props} className={cn('flex w-full flex-col items-center gap-2 text-center', className)}>
      <Image alt="" height={120} width={120} src={imageUrl} />
      {title && <h1 className="text-2xl font-bold">{title}</h1>}
      {description && <p className="text-balance [text-wrap-style:stable] text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}

interface LoaderAuthPageProps {
  loading?: boolean;
}
export function LoaderAuthPage(_props: LoaderAuthPageProps) {
  const { loading } = _props;
  if (!loading) return null;
  return (
    <div className="fixed size-full centered bg-[linear-gradient(108.32deg,#62cdcb0a_24.88%,#4599db0a_78.49%)] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[120]">
      <Loader type="spinner" size="22px" />
    </div>
  );
}
