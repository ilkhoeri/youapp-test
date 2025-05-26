'use client';
import * as React from 'react';
import * as z from 'zod';
import bcrypt from 'bcryptjs';
import { Button } from '../../ui/button';
import { twMerge } from 'tailwind-merge';
import { Dialog } from '../../ui/dialog';
import { Form, FormCard, useForm } from '../../fields/form';
import { passwordMessage, passwordSchema } from '@/resource/schemas/user';
import { toast } from 'sonner';
import { deleteAccount } from '../../../../../auth/handler-server';
import { strictRole } from '@/resource/const/role-status';

import type { Account } from '@/resource/types/user';
import type { Session } from 'next-auth';

const regulations = [
  'Akun hanya dapat dihapus oleh SUPERADMIN.',
  'Akun yang dihapus tidak dapat dikembalikan.',
  'Pastikan akun yang dihapus tidak memiliki tanggungan atau keterkaitan dengan data penting.',
  'Jika akun memiliki peran penting dalam sistem, pastikan ada penggantinya.',
  'Konfirmasi penghapusan akun harus dilakukan dengan memasukkan kata sandi akun SUPERADMIN.',
  'SUPERADMIN tidak dapat menghapus akun mereka sendiri.',
  'Pastikan sudah melakukan backup data yang diperlukan sebelum menghapus akun.'
];

export function AccountDeleteForm({ account, session, currentAccount }: { account: Account; currentAccount: Account; session: Session | null | undefined }) {
  const isStrictRole = strictRole(currentAccount);

  if (!account && isStrictRole) return null;

  if (!account || !isStrictRole || session?.user.isOAuth !== false || session.user.isOAuth) return null;

  return (
    <FormCard className={twMerge('border-red-600')}>
      <div className="absolute rounded-[inherit] inset-0 -z-1 bg-danger-area opacity-50" />
      <h3 className="relative z-[3] font-bold text-xl mb-4">Delete Account</h3>
      <div className="relative z-[3] flex flex-col [&_label]:mt-4 [&_select]:mt-2">
        <div className="relative z-[3] md:col-span-2 flex flex-col">
          <span className="font-medium text-sm">Jika ingin menghapus akun pastikan regulasi sudah terpenuhi.</span>
          <span className="font-normal text-sm mb-1 text-muted-foreground">Regulasi menghapus akun sebagai berikut:</span>
          <ul className="w-full md:col-span-2 text-sm ml-6 rtl:ml-0 rtl:mr-6 list-decimal marker:font-normal" role="list">
            {regulations.map((rg, index) => (
              <li key={index} role="listitem" className="w-full pl-2 list-item [text-align:-webkit-match-parent] [unicode-bidi:isolate] text-wrap font-normal text-color">
                {rg}
              </li>
            ))}
          </ul>
        </div>

        <AccountDeleteDialog account={account} session={session} currentAccount={currentAccount} />
      </div>
    </FormCard>
  );
}

function AccountDeleteDialog({ account, session, currentAccount }: { account: Account; currentAccount: Account; session: Session | null | undefined }) {
  const [open, setOpen] = React.useState(false);

  const isStrictRole = strictRole(currentAccount);

  if (!account && !isStrictRole) return null;

  const SettingsDeleteSchema = z.object({
    // name: z.string().min(2),
    email: z.string().email(),
    password: passwordSchema(passwordMessage),
    verify: z.string().refine(value => value === `delete ${account?.email} account`, {
      message: `Ketik persis: "delete ${account?.email} account"`
    })
  });
  // .refine(data => containsLetters(data.name), {
  //   message: `Nama lengkap harus sesuai dengan pemilik akun ${account?.email}`,
  //   path: ['name']
  // });

  type SettingsFormValues = z.infer<typeof SettingsDeleteSchema>;

  const { form, loading, router, setLoading } = useForm<SettingsFormValues>({
    schema: SettingsDeleteSchema,
    defaultValues: {
      email: '',
      verify: '',
      password: ''
    }
  });

  async function onSubmit(values: SettingsFormValues) {
    if (!account) return;

    // @ts-ignore
    if (values.password && currentAccount?.password) {
      // @ts-ignore
      const passwordsMatch = await bcrypt.compare(values.password, currentAccount?.password);

      if (values.email !== account.email || !passwordsMatch) {
        toast.error('Kesalahan Pada Data Yang Dimasukkan!', { description: 'Pastikan semua data yang diisi sudah benar.' });
        return;
      }
    }

    setLoading(true);

    try {
      toast.promise(deleteAccount(account.id), {
        loading: 'Menghapus...',
        success: data => {
          setLoading(false);
          setOpen(false);
          return `${data.data?.email} Berhasil Dihapus`;
        },
        error: error => `Terjadi Kesalahan: ${error.message || 'Gagal menghapus akun'}`
      });
    } catch (error) {
      toast.error('Terjadi Kesalahan', { description: 'Something went wrong' });
    } finally {
      router.replace(`/settings/account/${currentAccount?.refId}`);
      router.refresh();
      form.reset();
      // setLoading(false);
      // setOpen(false);
    }
  }

  if (!account || !strictRole(currentAccount) || session?.user.isOAuth !== false || session.user.isOAuth) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button variant="danger" className="w-max mt-6 relative z-[3] ">
          Delete Account
        </Button>
      </Dialog.Trigger>
      <Dialog.Content className="border-red-600">
        <Dialog.Header>
          <Dialog.Title>Konfirmasi Penghapusan Akun</Dialog.Title>
          <Dialog.Description>
            <b className="text-lg">⚠️</b>
            <b>PERINGATAN:</b> Proses ini <b>tidak dapat dibatalkan</b>. <br />
            Pastikan Anda telah memahami regulasi sebelum melanjutkan. <br />
            Akun yang dihapus akan hilang secara permanen beserta semua data yang terkait.
          </Dialog.Description>
        </Dialog.Header>
        <Form.Provider {...form}>
          <Form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <Form.Field
                control={form.control}
                name="password"
                render={({ field }) => <Form.InputField label="Kata Sandi Anda *" disabled={loading} description="Masukkan kata sandi Anda untuk konfirmasi" {...field} />}
              />

              <Form.Field
                control={form.control}
                name="email"
                render={({ field }) => <Form.InputField label="Email Akun yang akan dihapus *" disabled={loading} description="Masukkan email akun yang akan dihapus" {...field} />}
              />

              <Form.Field
                control={form.control}
                name="verify"
                render={({ field }) => (
                  <Form.InputField label="Konfirmasi Penghapusan Akun *" disabled={loading} description={`Kolom verifikasi harus berisi "delete ${account?.email} account"`} {...field} />
                )}
              />
            </div>
            <Dialog.Footer className="mt-4">
              <Button type="submit" variant="danger">
                Hapus Akun
              </Button>
            </Dialog.Footer>
          </Form>
        </Form.Provider>
      </Dialog.Content>
    </Dialog>
  );
}
