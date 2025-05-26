'use client';
import * as React from 'react';
import * as z from 'zod';
import axios from 'axios';
import Link from 'next/link';
import { toast } from 'sonner';
import { LinkSchema } from '@/resource/schemas/shared';
import { FORM_USER } from '@/resource/types/user';
import { isValidURL } from '@/resource/utils/text-parser';
import { Form, useForm } from '../../fields/form';
import { Button, buttonVariants } from '../../ui/button';
import { useNameFromURL } from './icons-preset';
import { Account } from '@/resource/types/user';
import { handlerLinkUser } from '@/resource/server/handler/user-link';
import { AddCircleFillIcon, ArrowUpDownRightFillIcon, PencilFillIcon, TrashFillIcon } from '../../icons-fill';
import { styleForm } from '../accounts/components';
import * as motion from 'motion/react-client';
import { cn } from 'cn';
import { containerVariants, itemVariants } from '@/resource/styles/motion-styles';

type LinkFormProps = FORM_USER.FORM_LINK & { setOpenId?: (value: string | null) => void; account?: Account };

export function LinkForm({ data, account, setOpenId }: LinkFormProps) {
  type LINK_VALUES = z.infer<typeof LinkSchema>;

  if (!account || (data && account.id !== data?.userId)) return null;

  const [addLink, setAddLink] = React.useState<boolean>(false);

  const [transition, setTransition] = React.useTransition();

  const [editField, setEditField] = React.useState<boolean>(false);

  const isFieldData = data !== null;

  const {
    form,
    loading: _load,
    setLoading,
    router
  } = useForm<LINK_VALUES>({
    schema: LinkSchema,
    defaultValues: data || { name: '', url: '' }
  });

  const formData = form.getValues();
  const siteUrl = form.watch('url');

  const { Icon, siteName } = useNameFromURL({ siteUrl });

  React.useEffect(() => {
    form.setValue('name', siteName);
  }, [siteName, form.setValue]);

  function onPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const clipboardText = e.clipboardData.getData('text');
    const sanitizedText = clipboardText.trim().replace(/\s+/g, '');
    form.setValue('url', sanitizedText, { shouldValidate: true });
  }

  function onSucces() {
    setLoading(false);
    form.reset();
    router.refresh();
  }

  async function onSubmit() {
    if (!account) return;

    setLoading(true);
    const toastId = toast.loading('Wait a moment.');

    setTransition(async () => {
      handlerLinkUser(data ? 'update' : 'create', account?.id, formData)
        .then(data => {
          if (data.error) {
            setLoading(false);
            toast.dismiss(toastId);
            toast.error(data.error, { description: data.details });
          }
          if (data.success) {
            onSucces();
            setAddLink(false);
            setEditField(false);
            toast.dismiss(toastId);
            toast.success(data.success, { description: data.details });
          }
        })
        .catch(error => {
          setLoading(false);
          console.error('CATCH_ERROR:', error);
          toast.dismiss(toastId);
          toast.error('Something went wrong!');
        });
    });
  }

  async function onDelete() {
    if (!account || !data) return;

    setLoading(true);
    const toastId = toast.loading('Wait a moment.');

    setTransition(async () => {
      handlerLinkUser('delete', account?.id, formData)
        .then(data => {
          if (data.error) {
            setLoading(false);
            toast.dismiss(toastId);
            toast.error(data.error);
          }
          if (data.success) {
            onSucces();
            toast.dismiss(toastId);
            toast.success(data.success);
          }
        })
        .catch(error => {
          setLoading(false);
          toast.dismiss(toastId);
          toast.error('Something went wrong!');
        });
    });
  }

  const loading = transition || _load;

  const renderForm = (
    <Form.Provider {...form}>
      <motion.form
        initial={false}
        animate={!data && addLink ? 'open' : 'closed'}
        variants={containerVariants({ open: { marginBottom: -28 } })}
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('w-full max-w-full px-1 flex flex-col gap-1 mt-2 overflow-hidden')}
      >
        <motion.div variants={itemVariants()} className="flex flex-row items-center gap-4 flex-shrink-0 [--sz:24px] h-[--sz] max-w-full">
          <Icon size="var(--sz)" className="text-gray-400" />
          {isValidURL(formData.url) ? (
            <>
              <Link
                href={formData.url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="group/url inline-flex flex-row items-center gap-1 text-base font-semibold bg-clip-text truncate"
                style={{ background: '40% 40% / 200% no-repeat text linear-gradient(134.86deg, #ABFFFD 2.64%, #4599DB 102.4%, #AADAFF 102.4%)' }}
              >
                {form.watch('name')}
                <ArrowUpDownRightFillIcon size={20} color="#4599db" />
              </Link>
            </>
          ) : (
            <span className="text-base font-semibold text-gray-600 truncate">{form.watch('name')}</span>
          )}
        </motion.div>

        <Form.Field
          control={form.control}
          name="url"
          render={({ field }) => {
            return (
              <motion.div variants={itemVariants()}>
                <Form.InputField
                  type="url"
                  label={null}
                  disabled={loading}
                  placeholder="URL"
                  errorMessage="placeholder"
                  className="md:col-span-5"
                  autoFocus={!data}
                  {...field}
                  onPaste={onPaste}
                />
              </motion.div>
            );
          }}
        />

        <motion.div className="w-full grid grid-flow-row grid-cols-2 items-center justify-center gap-3 md:gap-4 px-1">
          <Button
            disabled={loading}
            onClick={() => {
              if (!data && addLink) {
                setAddLink(false);
                form.reset();
              }
              if (data && editField) {
                setEditField(false);
              }
              if (data) setOpenId?.(null);
            }}
            className="border-transparent hover:border-transparent"
          >
            Cancel
          </Button>

          <Button type="submit" size="default" disabled={loading} className="flex grow">
            Save
          </Button>

          {data && (
            <Button variant="danger" size="default" aria-label="Delete Link" disabled={loading} onClick={onDelete} className={cn('size-9 text-white bg-[#da3633]')}>
              <TrashFillIcon size={20} />
            </Button>
          )}
        </motion.div>
      </motion.form>
    </Form.Provider>
  );

  const renderField = data && (
    <div className="flex flex-row items-center gap-4 flex-shrink-0 h-[--sz] [--sz:32px] w-full max-w-full group">
      <Icon className="size-[--sz] min-w-[--sz] min-h-[--sz]" />
      <div className="flex flex-col max-w-[calc(100%-(var(--sz)+2rem+2rem))]">
        <Link href={data?.url} target="_blank" rel="noopener noreferrer nofollow" className="font-normal text-sm truncate">
          {data?.name}
        </Link>
        <p className="font-normal text-sm truncate text-muted-foreground">{data?.url}</p>
      </div>
      <button
        type="button"
        role="button"
        className="ml-auto h-8 w-8 transition-opacity opacity-20 bg-transparent border-transparent text-color group-hover:opacity-100"
        onClick={() => setEditField(o => !o)}
      >
        <span className="hidden sr-only">Edit</span>
        <PencilFillIcon size={28} />
      </button>
    </div>
  );

  return isFieldData ? (
    !editField ? (
      renderField
    ) : (
      renderForm
    )
  ) : (
    <>
      {renderForm}
      <motion.button
        initial={false}
        animate={!addLink ? 'open' : 'closed'}
        exit={{ opacity: 0, height: 0 }}
        variants={containerVariants({ open: { height: 36 }, closed: { scale: 0 } })}
        type="button"
        role="button"
        onClick={() => setAddLink(true)}
        disabled={loading}
        className={cn(buttonVariants(), styleForm().auth().submit(), 'gap-3 w-full overflow-hidden')}
      >
        <AddCircleFillIcon size={!addLink ? 22 : '0px'} /> Add New
      </motion.button>
    </>
  );
}
