'use client';
import React from 'react';
import * as z from 'zod';
import axios from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { SettingAvatarImageSchema } from '@/resource/schemas/user';
import { MotionImage } from '../../motion/motion-image';
import { Form, useForm } from '../../fields/form';
import { Account } from '@/resource/types/user';
import { CameraRotateIcon } from '../../icons';
import { Loader } from '../../loader';
import { toast } from 'sonner';
import { cvx } from 'xuxi';
import { cn } from 'cn';

const stylingImage = cvx({
  assign: 'relative cursor-pointer bg-[#ffffff14] [--sz:57px] size-[var(--sz)] min-h-[var(--sz)] min-w-[var(--sz)] rounded-[17px]',
  variants: {
    hasValue: {
      true: 'group absolute centered bottom-4 left-4 rtl:left-auto rtl:right-4 opacity-65 transition-all duration-300 hover:scale-110 bg-background-theme/50 text-white/80 hover:opacity-100 hover:bg-background-theme hover:text-white',
      false:
        'before:content-[""] before:h-[18px] before:w-0.5 before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:[background:var(--bg-gradient)] before:z-[1] before:rounded-full after:content-[""] after:w-[18px] after:h-0.5 after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:[background:var(--bg-gradient)] after:z-[1] after:rounded-full'
    }
  }
});

const stylingMotionImage: React.ComponentProps<typeof MotionImage>['classNames'] = {
  container: stylingImage()
};

export function SettingAvatarForm({ account }: { account: Account }) {
  type SettingsFormValues = z.infer<typeof SettingAvatarImageSchema>;

  const { form, router, loading, setLoading } = useForm<SettingsFormValues>({
    resolver: zodResolver(SettingAvatarImageSchema),
    defaultValues: { image: account?.image ?? '' }
  });

  async function onSubmit(value: SettingsFormValues) {
    setLoading(true);
    try {
      await axios.patch(`/api/auth/avatar/${account?.id}`, value);
      router.refresh();
    } catch (error: any) {
      toast.error('Error');
    } finally {
      setLoading(false);
      router.refresh();
    }
  }

  const lastUrlRef = React.useRef<string | null>(form.getValues('image'));

  React.useEffect(() => {
    const currentUrl = form.getValues('image');
    if (lastUrlRef?.current !== currentUrl) {
      form.handleSubmit(onSubmit)();
      lastUrlRef.current = currentUrl;
      router.refresh();
    }
  }, [form, onSubmit]);

  return (
    <Form.Provider {...form}>
      <Form.Field
        control={form.control}
        name="image"
        key={account?.image}
        render={({ field }) => {
          const value = account?.image;
          const label = value ? 'Change image' : 'Add Image';

          function RenderWidget() {
            return (
              <Form.UnstyledAvatarField uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET} disabled={loading} {...field}>
                {({ open }) => {
                  return (
                    <button
                      type="button"
                      onClick={() => open()}
                      aria-label={label}
                      className={cn(stylingImage({ hasValue: !!value }))}
                      {...{ style: { '--bg-gradient': !value && '40% 40% / 200% no-repeat linear-gradient(33deg, #a08404, #f9f3b2)' } as React.CSSProperties }}
                    >
                      {value && <CameraRotateIcon size={42} />}
                    </button>
                  );
                }}
              </Form.UnstyledAvatarField>
            );
          }

          return (
            <div {...{ 'aria-disabled': loading }} className="inline-flex aria-disabled:pointer-events-none flex-row items-center gap-4 -mt-2 mb-4">
              {value ? (
                <MotionImage key={account?.image} src={value} name={field.name} disabled={loading} classNames={stylingMotionImage}>
                  <RenderWidget />
                  {loading && (
                    <Loader
                      type="spinner"
                      size={28}
                      className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                      style={{ position: 'absolute', '--spinner-color': 'hsl(var(--color))' }}
                    />
                  )}
                </MotionImage>
              ) : (
                <RenderWidget />
              )}
              <Form.Label className="text-xs font-medium text-color">{label}</Form.Label>
            </div>
          );
        }}
      />
    </Form.Provider>
  );
}
