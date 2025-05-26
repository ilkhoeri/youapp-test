'use client';

import * as React from 'react';
import * as z from 'zod';
import { toast } from 'sonner';
import { Account, FORM_USER } from '@/resource/types/user';
import { AddressSchema } from '@/resource/schemas/user';
import { useApp } from '@/resource/client/contexts/app-provider';
import { Form, useForm } from '../fields/form';
import { createFields, renderFormField } from '../fields/utils';
import { twMerge } from 'tailwind-merge';
import { Button } from '../ui/button';
import { updateAccount } from '@/auth/handler-server';
import { truncate } from '@/resource/utils/text-parser';
import { Control } from 'react-hook-form';
import { styleForm } from './accounts/components';

const classes = styleForm().account();

type FieldValues = Partial<Record<string, any>>;
interface AddressFormProps<T extends FieldValues = FieldValues> extends FORM_USER.FORM_ADDRESS {
  account?: Account;
  control?: Control<T>;
  // onSubmit?: (values: T) => Promise<void>;
  onSubmit?: React.FormEventHandler<HTMLFormElement>;
  loading?: boolean;
  field?: string;
  name?: string;
  classNames?: Partial<Record<'form' | 'inner' | 'submit', string>>;
}
export function SettingAddressForm<T extends FieldValues = FieldValues>(_props: AddressFormProps<T>) {
  const { data, account, onSubmit: _onSubmit, loading: _loading, control: _control, field: _field, name, classNames } = _props;
  const { user } = useApp();

  const newField: any = (key: string) => (_field ? `${_field}.${key}` : key);

  const formFields = createFields([
    { formField: 'input', name: newField('district'), label: 'District', placeholder: '' },
    { formField: 'input', name: newField('subdistrict'), label: 'Subdistrict', placeholder: '' },
    { formField: 'input', name: newField('village'), label: 'Village', placeholder: '' }
  ] as const);

  const stateSubProvice = data?.city ? newField('city') : newField('regency');
  const [subProvince, setSubProvince] = React.useState(stateSubProvice);
  const [country, setCountry] = React.useState(data?.country || '');
  const [state, setState] = React.useState(data?.state || '');

  if (!user) return null;

  type ADDRESSFORMVALUES = z.infer<typeof AddressSchema>;

  const defaultValues = Form.initialValues(data, {
    string: ['country', 'state', 'postalcode', 'street', 'city', 'regency', 'district', 'subdistrict', 'village'],
    undefined: undefined,
    object: undefined,
    array: ['notes'],
    enum: { visibility: 'PUBLIC' }
  });

  const {
    form,
    router,
    loading: __loading,
    setLoading
  } = useForm<ADDRESSFORMVALUES>({
    schema: AddressSchema,
    defaultValues
  });

  const loading = __loading ?? _loading;
  const control = (_control ?? form.control) as any;

  async function onSubmit(values: ADDRESSFORMVALUES) {
    if (!account) return;
    setLoading(true);

    try {
      toast.promise(updateAccount(account?.id, { address: { upsert: { create: values, update: values } } }), {
        loading: 'Memperbarui...',
        success: () => {
          router.refresh();
          setLoading(false);
          return `Alamat ${truncate(account?.name)} telah diperbarui.`;
        },
        error: 'Terjadi kesalahan'
      });

      router.refresh();
    } catch (error) {
      toast.error('Error', { description: 'Error' });
    } finally {
      router.refresh();
      setLoading(false);
    }
  }

  const subProvinces = [
    { key: newField('regency'), label: 'Kabupaten' },
    { key: newField('city'), label: 'Kota' }
  ];

  return (
    <Form.Card>
      {!name && <h3 className="font-bold text-sm">Address</h3>}
      <Form.Provider {...form}>
        <Form onSubmit={(_onSubmit as any) ?? form.handleSubmit(onSubmit)} className={twMerge('lg:row-span-2 lg:col-span-4 grid gap-6 w-full', classNames?.form)}>
          <div className={twMerge('grid md:grid-cols-2 gap-6', classNames?.inner)}>
            <Form.Field
              control={control}
              name={newField('country')}
              render={({ field }) => {
                const { onBlur: _, ...rest } = field;
                return (
                  <Form.CountryField
                    label="Negara"
                    {...rest}
                    value={country}
                    disabled={loading}
                    onChange={val => {
                      field.onChange(val);
                      setCountry(val);
                    }}
                  />
                );
              }}
            />

            <Form.Field
              control={control}
              name={newField('state')}
              render={({ field }) => {
                const { onBlur: _, ...rest } = field;
                return (
                  <Form.RegionField
                    label="Negara Bagian / Provinsi"
                    {...rest}
                    disabled={loading}
                    country={country}
                    value={state}
                    onChange={val => {
                      field.onChange(val);
                      setState(val);
                    }}
                  />
                );
              }}
            />

            <Form.Field
              control={control}
              name={newField('postalcode')}
              render={({ field }) => <Form.InputField label="Kode Pos" type="numeric" autoComplete="off" disabled={loading} {...classes} {...field} />}
            />

            <Form.Field control={control} name={newField('street')} render={({ field }) => <Form.InputField label="Jalan" disabled={loading} {...field} />} />

            <div className="space-y-2 relative flex flex-col">
              <div className="w-max flex flex-row items-center gap-2 text-xs font-semibold">
                {subProvinces.map(({ key, label }, index) => (
                  <label
                    key={key}
                    htmlFor={key}
                    onClick={() => setSubProvince(key)}
                    className={twMerge('w-max py-1 px-2 rounded-[4px] cursor-pointer', subProvince === key ? 'bg-color text-background' : 'bg-color/10 text-color/50')}
                  >
                    {label}
                  </label>
                ))}
              </div>

              {subProvinces.map(({ key, label }) =>
                subProvince === key ? (
                  <Form.Field
                    key={key}
                    control={control}
                    name={key as any}
                    render={({ field }) => <Form.InputField label={null} autoComplete="off" disabled={loading} {...field} name={key} className="[&_label]:sr-only [&_input]:!mt-0" />}
                  />
                ) : null
              )}
              <Form.Description className="!mt-2">
                Pilih {subProvince === newField('city') ? 'Kabupaten' : 'Kota'} apabila alamat tercantum adalah {subProvince === newField('city') ? 'Kabupaten' : 'Kota'} sebagai sub
                Provinsi / pusat administrasi daerah.
              </Form.Description>
            </div>

            {/* {formFields.map(field => renderFormField(form.control, field, loading))} */}
          </div>

          <Button type="submit" disabled={loading} className={twMerge('w-max', classNames?.submit)}>
            Save
          </Button>
        </Form>
      </Form.Provider>
    </Form.Card>
  );
}
