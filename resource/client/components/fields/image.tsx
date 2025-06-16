'use client';
import React from 'react';
import Image from 'next/image';
import { Svg } from '../ui/svg';
import { Alert } from '../alert';
import { Button } from '../ui/button';
import { twMerge } from 'tailwind-merge';
import { FolderFilesColorIcon } from '../icons-color';
import { formatBytesToMB } from '@/resource/utils/text-parser';
import { CldUploadWidget, CldUploadWidgetPropsChildren, CloudinaryUploadWidgetInfo, CloudinaryUploadWidgetOptions } from 'next-cloudinary';
import { TrashFillIcon } from '../icons-fill';

export interface ExtendedCldUploadWidget extends CloudinaryUploadWidgetOptions {}

export interface UploadPresetProps {
  preset: 'assets' | 'avatar' | 'event' | 'gallery' | 'blog' | 'news';
}

export const uploadPreset = (preset: UploadPresetProps['preset']): string => {
  const presetMap: Record<UploadPresetProps['preset'], string> = {
    assets: 'assets',
    avatar: 'avatar',
    blog: 'assets',
    event: 'assets',
    news: 'assets',
    gallery: 'gallery'
  };
  return presetMap[preset as UploadPresetProps['preset']];
};

type Selector = 'root' | 'wrapper' | 'figure' | 'figureOnValue' | 'image' | 'svg' | 'button' | 'title' | 'description';

export interface ImageUploadProps extends ExtendedCldUploadWidget, UploadPresetProps {
  cleanTitle?: boolean;
  disabled?: boolean;
  onChange: (value: string) => void;
  onRemove: (value: string) => void;
  value: (string | string[]) | null | undefined;
  name?: string;
  classNames?: Partial<Record<Selector, string>>;
}

export function ImageUpload(props: ImageUploadProps) {
  const { disabled, onChange, onRemove, value, name, maxFiles, maxFileSize = 2097152, sources = ['local'], classNames, cleanTitle, preset, ...options } = props;

  const onSuccess = (result: any) => {
    onChange(result.info.secure_url);
  };

  const lengthValue = (value && typeof value === 'string') || (Array.isArray(value) && value.length > 0);

  const classFigure =
    'sizer [--sz-h:268px] flex-[1_0_0] flex justify-center items-center relative border-2 border-dashed border-border select-none box-border transition-all duration-100 rounded-lg bg-muted-foreground/[0.08] hover:bg-muted-foreground/[0.04]';

  return (
    <div id={name} className={twMerge('m-0 flex flex-wrap items-center justify-between gap-4 transition-all duration-100', classNames?.root)}>
      {value &&
        Array.isArray(value) &&
        value.map((url: string, index: number) => (
          <figure key={index} className={twMerge(classFigure, lengthValue ? '[--sz-w:134px] cursor-default' : '', classNames?.figure, classNames?.figureOnValue)}>
            <button
              type="button"
              role="button"
              onClick={() => onRemove(url)}
              className={twMerge(
                'flex items-center justify-center focus-visible:ring-offset-2 text-white bg-red-600 hover:bg-red-600/80 shadow z-10 absolute -top-2 -right-2 size-8 rounded-lg',
                classNames?.button
              )}
            >
              <Svg size={20} currentFill="fill">
                <path d="M3 6.386c0-.484.345-.877.771-.877h2.665c.529-.016.996-.399 1.176-.965l.03-.1l.115-.391c.07-.24.131-.45.217-.637c.338-.739.964-1.252 1.687-1.383c.184-.033.378-.033.6-.033h3.478c.223 0 .417 0 .6.033c.723.131 1.35.644 1.687 1.383c.086.187.147.396.218.637l.114.391l.03.1c.18.566.74.95 1.27.965h2.57c.427 0 .772.393.772.877s-.345.877-.771.877H3.77c-.425 0-.77-.393-.77-.877" />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M11.596 22h.808c2.783 0 4.174 0 5.08-.886c.904-.886.996-2.339 1.181-5.245l.267-4.188c.1-1.577.15-2.366-.303-2.865c-.454-.5-1.22-.5-2.753-.5H8.124c-1.533 0-2.3 0-2.753.5s-.404 1.288-.303 2.865l.267 4.188c.185 2.906.277 4.36 1.182 5.245c.905.886 2.296.886 5.079.886m-1.35-9.811c-.04-.434-.408-.75-.82-.707c-.413.043-.713.43-.672.864l.5 5.263c.04.434.408.75.82.707c.413-.043.713-.43.672-.864zm4.329-.707c.412.043.713.43.671.864l-.5 5.263c-.04.434-.409.75-.82.707c-.413-.043-.713-.43-.672-.864l.5-5.263c.04-.434.409-.75.82-.707"
                />
              </Svg>
              <span className="sr-only hidden">Remove image</span>
            </button>
            <Image fill sizes="100" className={twMerge('object-cover rounded-[inherit] overflow-hidden', classNames?.image)} alt="Image" src={url} />
          </figure>
        ))}

      <CldUploadWidget
        onSuccess={onSuccess}
        uploadPreset={uploadPreset(preset)}
        options={{
          ...options,
          maxFiles,
          maxFileSize,
          sources
        }}
      >
        {({ open }) => {
          const onClick = () => {
            open();
          };

          return (
            <figure onClick={onClick} className={twMerge(classFigure, lengthValue ? '[--sz-w:134px] cursor-pointer' : 'px-4 w-full cursor-pointer', classNames?.figure)}>
              {value && typeof value === 'string' && <Image fill sizes="100" className="object-cover rounded-[inherit] overflow-hidden" alt="Image" src={value} />}

              {value && typeof value === 'string' ? null : (
                <div className="flex items-center flex-col justify-center">
                  <FolderFilesColorIcon />
                  <div className="flex items-center flex-col gap-2">
                    <div className="font-semibold text-[1.0625rem] leading-normal md:text-[1.125rem]">Select file</div>
                    <div className="font-normal text-[0.875rem] leading-normal text-muted-foreground">
                      {/* Click to <span className="hover:underline mx-0.5 text-[var(--palette-primary-main)]">browse</span> through your device. */}
                      Attach <span className="hover:underline mx-0.5 text-[var(--palette-primary-main)]">image</span> should not exceed {formatBytesToMB(maxFileSize)}
                    </div>
                  </div>
                </div>
              )}
            </figure>
          );
        }}
      </CldUploadWidget>
    </div>
  );
}

interface CldUploadWidgetChildrenProps extends CldUploadWidgetPropsChildren {}

export interface __AvatarUploadProps {
  maxFileSize?: number | `${number}`;
  sources?: CloudinaryUploadWidgetOptions['sources'];
  disabled?: boolean;
  onChange?: (value: string | null) => void;
  onRemove?: (value: string) => void;
  value: string | null | undefined;
  size?: 'avatar' | 'icon';
  children: (event: CldUploadWidgetChildrenProps) => JSX.Element;
}

export interface UnstyledAvatarUploadProps extends Omit<React.ComponentProps<typeof CldUploadWidget>, 'children'>, __AvatarUploadProps {
  onOpenDialog?: (open: boolean | ((prev: boolean) => boolean)) => void;
}
export function UnstyledAvatarUpload(_props: UnstyledAvatarUploadProps) {
  const {
    options,
    children,
    onSuccess,
    size = 'avatar',
    onChange,
    value,
    onRemove,
    disabled,
    maxFileSize = 2097152,
    onOpenDialog,
    sources = ['local', 'camera', 'google_drive', 'instagram', 'url'],
    ...props
  } = _props;

  React.useEffect(() => {
    if (!onOpenDialog) return;
    const cleanupTimeout = setTimeout(() => {
      if (!value) onOpenDialog?.(false);
    }, 1000);
    return () => clearTimeout(cleanupTimeout);
  }, [value, onOpenDialog]);

  const lastUrlRef = React.useRef<typeof value>(value);

  React.useEffect(() => {
    const cleanupTimeout = setTimeout(() => {
      if (lastUrlRef?.current !== value) {
        lastUrlRef.current = value;
        document.body.style.overflow = '';
      }
    }, 100);
    return () => clearTimeout(cleanupTimeout);
  }, [value]);

  return (
    <CldUploadWidget
      {...props}
      onSuccess={(result, widget) => {
        onSuccess?.(result, widget);
        onChange?.((result?.info as CloudinaryUploadWidgetInfo)?.secure_url);
        // document.body.style.overflow = '';
      }}
      options={{
        ...options,
        maxFiles: options?.maxFiles ?? 1,
        maxFileSize: options?.maxFileSize ?? Number(maxFileSize),
        sources: options?.sources ?? sources
      }}
    >
      {event => children({ ...event })}
    </CldUploadWidget>
  );
}

export interface AvatarUploadProps extends __AvatarUploadProps {
  name: string | undefined;
  bio?: string | undefined;
  maxFileSize?: number | `${number}`;
  sources?: CloudinaryUploadWidgetOptions['sources'];
  disabled?: boolean;
}
export function AvatarUpload(props: AvatarUploadProps) {
  const { size = 'avatar', onChange, value, name, bio, onRemove, disabled, maxFileSize = 2097152, sources = ['local', 'camera', 'google_drive', 'instagram', 'url'] } = props;
  const [open, setOpen] = React.useState(false);

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    const cleanupTimeout = setTimeout(() => {
      if (!value) setOpen(false);
    }, 1000);
    return () => clearTimeout(cleanupTimeout);
  }, [value]);

  return (
    <>
      <CldUploadWidget
        onSuccess={result => onChange?.((result?.info as CloudinaryUploadWidgetInfo)?.secure_url)}
        uploadPreset={uploadPreset(size === 'avatar' ? 'avatar' : 'assets')}
        // signatureEndpoint="/api/sign-cloudinary-params"
        options={{
          maxFiles: 1,
          maxFileSize: Number(maxFileSize),
          sources
        }}
      >
        {({ open }) => {
          if (size === 'avatar') {
            return (
              <>
                <figure className="mb-4 relative flex items-center md:block size-28 aspect-square">
                  <Image key={value} fill sizes="120" alt={name || ''} src={value || '/images/pict-user.svg'} className="md:mb-4 rounded-lg bg-muted/35 align-middle object-cover" />
                </figure>

                <figcaption className="flex flex-col" {...{ 'aria-disabled': !mounted || disabled }}>
                  <h3 className="font-bold text-2xl mb-1">{name}</h3>
                  {bio && <p className="text-muted-foreground font-normal text-base">{bio}</p>}

                  <div className="w-full flex flex-row items-center justify-start gap-2 mt-6">
                    <Button
                      disabled={!value || !mounted || disabled}
                      onClick={() => value && setOpen(true)}
                      variant="danger"
                      className="w-8 min-w-8 px-0 transition-all active:scale-[0.99]"
                    >
                      <TrashFillIcon size="20" />
                      <span className="sr-only hidden">Remove Avatar</span>
                    </Button>
                    <hr className="w-px h-8 bg-border" />
                    <Button disabled={!mounted || disabled} onClick={() => open()} className="w-max font-medium transition-all active:scale-[0.99] gap-2">
                      <span>Change Avatar</span>
                    </Button>
                  </div>
                </figcaption>
              </>
            );
          }
          if (size === 'icon') {
            return (
              <ImagePlaceholder
                toggle="upload"
                onRemove={() => onRemove?.(value || '')}
                name={name}
                value={value}
                onClick={() => open()}
                childrens={{
                  imageIcon: (
                    <Svg size={28} className="text-muted-foreground">
                      <circle cx="12" cy="12" r="10" />
                      <path d="m4.9 4.9 14.2 14.2" />
                    </Svg>
                  )
                }}
                classNames={{
                  root: 'w-[68px] h-[68px] mt-0 [--padding:0px] p-0',
                  wrapper: 'icon-wrapper p-2',
                  inner: 'p-0 w-[90%] h-[90%]',
                  image: 'bg-background'
                }}
              />
            );
          }
          return <div />;
        }}
      </CldUploadWidget>

      <Alert.Modal
        open={open}
        onOpenChange={setOpen}
        disabled={!value || disabled}
        onConfirm={() => {
          if (value) {
            if (!onRemove) onChange?.(null);
            if (onRemove) onRemove?.(value);
          }
        }}
        title="Delete Avatar"
        description={[
          'This action cannot be undone.',
          'Once you delete, there is no going back. Please be certain.',
          'If you delete an image but then cancel the action, please refresh the page to ensure the changes are correctly reflected.'
        ]}
      />
    </>
  );
}

export interface ToggleImagePlaceholderType {
  toggle?: 'edit' | 'upload';
  loading?: boolean;
  disabled?: boolean;
  onRemove?: () => void;
}

export type ChildImagePlaceholderType = {
  childrens?: {
    imageIcon?: React.ReactNode;
    remove?: React.ReactNode;
    button?: React.ReactNode;
  };
};

export type ClassImagePlaceholderType = {
  classNames?: Partial<Record<'root' | 'wrapper' | 'inner' | 'image' | 'imageIcon' | 'remove' | 'button', string>>;
};

export interface ImagePlaceholderProps extends ToggleImagePlaceholderType, ChildImagePlaceholderType, ClassImagePlaceholderType {
  name?: string;
  value: string | null | undefined;
  onClick?: React.MouseEventHandler<HTMLElement>;
}

export function ImagePlaceholder(props: ImagePlaceholderProps) {
  const { name, value, onClick, loading, disabled, toggle, onRemove, childrens, classNames } = props;
  return (
    <div
      className={twMerge(
        'relative flex items-center justify-center mt-4 [--padding:12px] h-[calc(var(--avatar-sz,200px)_+_var(--padding))] w-[calc(var(--avatar-sz,200px)_+_var(--padding))]',
        disabled && 'cursor-not-allowed',
        loading && 'load_ [--bgc-load_:hsl(var(--background)/0.75)]',
        classNames?.root
      )}
    >
      <div
        id={name}
        onClick={onClick}
        role="presentation"
        title={`${value ? 'Edit' : 'Upload'} icon`}
        tabIndex={0}
        data-idle="true"
        aria-controls={name}
        className={twMerge(
          'w-full h-full flex items-center justify-center relative bg-background hover:bg-muted border border-dashed border-color select-none cursor-pointer box-border p-4 rounded-full transition-colors duration-300',
          disabled && 'cursor-not-allowed pointer-events-none',
          classNames?.wrapper
        )}
      >
        <div
          className={twMerge(
            'p-[var(--padding)] h-full w-full relative z-10 rounded-full flex items-center justify-center flex-nowrap overflow-hidden select-none pointer-events-none text-border',
            classNames?.inner
          )}
        >
          {value ? (
            <Image
              fill
              sizes="200"
              src={value}
              alt="images"
              aria-disabled={disabled}
              style={{ objectFit: 'cover' }}
              className={twMerge('bg-[#f3f1f4] dark:bg-black', classNames?.image)}
            />
          ) : (
            childrens?.imageIcon || (
              <Svg stroke={1} className={twMerge('size-full text-color', classNames?.imageIcon)}>
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="10" r="3" />
                <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" />
              </Svg>
            )
          )}
        </div>
      </div>

      {value && onRemove && (
        <Button
          type="button"
          onClick={onRemove}
          variant="danger"
          disabled={disabled}
          className={twMerge('absolute bottom-1 font-bold left-0 z-20 h-8 min-h-[32px] gap-2 px-2 py-1 !mt-0 !mb-0', classNames?.remove)}
        >
          {childrens?.remove || (
            <>
              <Svg size={20}>
                <path d="M4 7l16 0" />
                <path d="M10 11l0 6" />
                <path d="M14 11l0 6" />
                <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
                <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
              </Svg>
              Remove
            </>
          )}
        </Button>
      )}

      {toggle && (
        <Button
          type="button"
          onClick={onClick}
          disabled={disabled}
          className={twMerge(
            '_button_ h-8 min-h-[32px] flex flex-row flex-nowrap items-center gap-2 absolute z-20 bg-background hover:bg-muted rounded-md text-foreground text-[14px] px-2 py-1 right-0 bottom-1 border border-color/50 cursor-pointer',
            classNames?.button
          )}
        >
          {toggle === 'edit' && (
            <>
              {childrens?.button || (
                <>
                  <Svg size={18}>
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                    <path d="m15 5 3 3" />
                  </Svg>
                  Edit
                </>
              )}
            </>
          )}
          {toggle === 'upload' && (
            <>
              {childrens?.button || (
                <>
                  <Svg currentFill="fill" size={18}>
                    <path d="M8.456 14.494a.75.75 0 0 1 1.068.17 3.08 3.08 0 0 0 .572.492A3.381 3.381 0 0 0 12 15.72c.855 0 1.487-.283 1.904-.562a3.081 3.081 0 0 0 .572-.492l.021-.026a.75.75 0 0 1 1.197.905l-.027.034c-.013.016-.03.038-.052.063-.044.05-.105.119-.184.198a4.569 4.569 0 0 1-.695.566A4.88 4.88 0 0 1 12 17.22a4.88 4.88 0 0 1-2.736-.814 4.57 4.57 0 0 1-.695-.566 3.253 3.253 0 0 1-.236-.261c-.259-.332-.223-.824.123-1.084Z" />
                    <path d="M12 1c6.075 0 11 4.925 11 11s-4.925 11-11 11S1 18.075 1 12 5.925 1 12 1ZM2.5 12a9.5 9.5 0 0 0 9.5 9.5 9.5 9.5 0 0 0 9.5-9.5A9.5 9.5 0 0 0 12 2.5 9.5 9.5 0 0 0 2.5 12Z" />
                    <path d="M9 10.75a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0ZM16.25 12a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Z" />
                  </Svg>
                  Upload
                </>
              )}
            </>
          )}
        </Button>
      )}
    </div>
  );
}
