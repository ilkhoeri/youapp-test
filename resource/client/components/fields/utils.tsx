'use client';
import * as React from 'react';
import * as Rhf from 'react-hook-form';
import { FormField, FormInputField, FormInputFieldProps, FormReactSelectFieldProps, FormSelectField, FormSelectItemField, SelectDataOption } from './form';
import { cn } from 'cn';

// Helper

/** @example type MyNames = FieldNames<typeof fields>; */
export type FieldNames<T extends readonly { name: string }[]> = T[number]['name'];

type Modifier = 'partial' | 'required' | 'readonly' | 'default';

type FieldComponent<TComp, TModifier extends Modifier = 'default'> = TModifier extends 'required'
  ? Required<TComp>
  : TModifier extends 'readonly'
    ? Readonly<TComp>
    : TModifier extends 'partial'
      ? Partial<TComp>
      : TComp;

// Bagian metadata yang umum untuk semua field
type FieldMeta<TField extends string, TName extends string> = {
  formField: TField;
  name: TName;
};

/**
 * discriminated union fleksibel dengan type generik yang berbeda
 * @example type MyField = Field<'input', 'user.name', { value: string }, 'required'>;
 */
export type Field<TField extends string, TName extends string, TComp, TModifier extends Modifier = 'default'> = FieldMeta<TField, TName> & FieldComponent<TComp, TModifier>;

type FormFieldMap<TName extends string = string> = {
  input: FormInputFieldProps<TName>;
  select: FormReactSelectFieldProps<SelectDataOption[], any, boolean, any, TName>;
  'select-item': FormSelectItemField<SelectDataOption[], TName>;
};

type StripFields<TName extends string> = {
  [Key in keyof FormFieldMap<TName>]: Field<Key, TName, FormFieldMap<TName>[Key]>;
}[keyof FormFieldMap<TName>];

type StripOmit<TName extends string, K extends keyof any> = {
  [Key in keyof FormFieldMap<TName>]: Omit<FormFieldMap<TName>[Key], K>;
}[keyof FormFieldMap<TName>];

// export type FormFields<TName extends string> = FormFieldMap<TName>[keyof FormFieldMap<TName>];
export type FormFields<TName extends string> = StripFields<TName>;

export type FormFieldsArray<TName extends string> = readonly FormFields<TName>[];

type FieldEntry<TField extends keyof FormFieldMap<TName>, TName extends string> = Partial<Omit<FormFieldMap<TName>[TField], 'formField'>> & {
  name: TName;
};

/** @example */
export function isField<TName extends string, TField extends string>(field: FormFields<TName>): field is Extract<FormFields<TName>, { formField: TField; name: TName }> {
  return field.formField === field.formField;
}

/**
 * ✨ inference-aware
 * @example
 * const field = createField('input', {
 *   name: 'about.height',
 *   label: 'Height',
 *   placeholder: 'Enter height',
 *   type: 'number'
 * });
 * @param formField
 * @param props
 * @returns
 */
export function createField<TField extends keyof FormFieldMap, TName extends string>(
  formField: TField,
  props: FieldEntry<TField, TName>
): Field<TField, TName, FormFieldMap<TName>[TField]> {
  return { ...props, formField } as Field<TField, TName, FormFieldMap<TName>[TField]>;
}

/**
 * 🔥 array helper inference-aware
 * @example
 * const Fields = createFields([
 *   {
 *     formField: 'input',
 *     name: 'about.horoscope',
 *     label: 'Horoscope',
 *     placeholder: '--',
 *     readOnly: true
 *   },
 *   {
 *     formField: 'select-item',
 *     name: 'about.gender',
 *     label: 'Gender',
 *     placeholder: 'Select Gender',
 *     data: ['Male', 'Female']
 *   }
 * ] as const);
 * @param items
 * @returns
 */

export function createFields<
  Items extends {
    formField: keyof FormFieldMap;
    name: string;
    [key: string]: any;
  }[]
>(
  items: [...Items]
): {
  [K in keyof Items]: Items[K] extends {
    formField: infer TField extends keyof FormFieldMap;
    name: infer TName extends string;
  }
    ? Field<TField, TName, FormFieldMap<TName>[TField]>
    : never;
} {
  return items.map(item => createField(item.formField, item)) as any;
}

function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj };
  keys.forEach(k => delete result[k]);
  return result;
}

export type PartialControlFields<TName extends string> = Partial<Omit<FormFields<TName>, 'name' | 'formField'>>;
export type ControlFields<TName extends string> = FormFieldMap<TName>[keyof FormFieldMap<TName>];

/** @default type GetFieldProps<K extends string, P> = P extends { name: K } ? Partial<Omit<P, 'name' | 'formField'>> : never; */
type GetFieldProps<KName extends string, TField> = TField extends { name: KName }
  ? { [P in keyof TField extends keyof FieldMeta<string, string> ? never : keyof TField]?: TField[P] }
  : never;

/** `⤷` Render */
type RenderProps<TControl extends Rhf.FieldValues, KName extends string, TNameRfh extends Rhf.FieldPath<TControl> = Rhf.FieldPath<TControl>> = {
  field: Omit<Rhf.ControllerRenderProps<TControl, TNameRfh>, 'value'> & { value: PathValue<TControl, KName> };
  fieldState: Rhf.ControllerFieldState;
  formState: Rhf.UseFormStateReturn<TControl>;
};

/** @example
 * const fields: createFields([
 * { formField: 'input', field: 'name', label: 'Display name:', placeholder: 'Enter name' },
 * { formField: 'select-item', field: 'about.gender', label: 'Gender:', placeholder: 'Select Gender', data: ['Male', 'Female'] }
 * ] as const);
 *
 * <Form.Provider {...form}>
 *   <Form onSubmit={form.handleSubmit(onSubmit)}>
 *     {fields.map(field => renderFormField(form.control, field, loading))}
 *   </Form>
 * </Form.Provider>
 */
export function renderFormField<TControl extends Rhf.FieldValues, TName extends string, TField extends FormFields<TName>>(
  control: Rhf.Control<TControl>,
  field: TField,
  loading = false
) {
  return (
    <FormField
      key={field.name}
      control={control}
      name={field.name as any}
      render={args => {
        const props = {
          ...omit(field, ['formField']),
          disabled: loading,
          ...args.field
        } as FormFieldMap<TName>[typeof field.formField];

        switch (field.formField) {
          case 'input':
            return <FormInputField {...(props as FormFieldMap<TName>['input'])} />;

          case 'select':
            return <FormSelectField {...(props as FormFieldMap<TName>['select'])} />;

          case 'select-item':
            return <FormSelectItemField {...(props as FormFieldMap<TName>['select-item'])} />;

          default:
            return <React.Fragment />;
        }
      }}
    />
  );
}
