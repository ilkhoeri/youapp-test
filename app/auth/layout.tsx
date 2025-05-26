import Image from 'next/image';
import { org } from '@/resource/const/org';
import { ActionBack } from '@/resource/client/components/actions';

export default async function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10 bg-gradient-theme">
        <div className="flex justify-center gap-2 md:justify-start">
          <a
            tabIndex={-1}
            href={org().url()}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="flex max-lg:opacity-0 max-lg:pointer-events-none items-center gap-2 font-bold"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-md border text-primary-foreground">
              <Image alt="log" height={36} width={36} src={org().logo()} className="size-6" />
            </div>
            {org().name()}
          </a>
        </div>
        <div className="flex flex-1 max-lg:items-start lg:items-center justify-center max-lg:min-h-[150svh]">
          <div className="w-full max-w-md">
            <ActionBack instance="back" className="mr-auto rtl:mr-0 rtl:ml-auto" />
            <div className="mt-[3.75rem]">{children}</div>
          </div>
        </div>
      </div>
      <div className="relative hidden bg-background lg:block">
        <img src={org().logo('full')} alt="Image" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-auto w-4/5 aspect-video object-contain" />
      </div>
    </div>
  );
}
