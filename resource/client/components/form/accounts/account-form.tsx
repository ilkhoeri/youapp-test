'use client';
import * as React from 'react';
import { toast } from 'sonner';
import { Button } from '../../ui/button';
import { Account } from '@/resource/types/user';
import { Form, FormInputFieldProps } from '../../fields/form';
import { createField, createFields, Field, renderFormField } from '../../fields/utils';
import { updateAccount } from '../../../../../auth/handler-server';
import { useSettingsForm } from '../../../../../auth/handler-client';
import { containerVariants, itemVariants } from '@/resource/styles/motion-styles';
import { SettingGeneralFormValues, SettingGeneralSchema } from '@/resource/schemas/user';
import { formatBirthDay, getAge } from '@/resource/utils/age-generated';
import { getHoroscopeSign } from '@/resource/const/horoscope';
import { getShioEntry } from '@/resource/const/shio';
import { SettingAvatarForm } from './avatar-form';
import { PencilIcon } from '../../icons';
import { styleForm } from './components';
import { cvx, ocx } from 'xuxi';
import * as motion from 'motion/react-client';
import { transform } from '@/resource/utils/text-parser';
import { cn } from 'cn';
import { getDispaly } from '@/resource/const/get-name';

const classes = styleForm().account();

const classesSelector = cvx({
  assign: cn(
    classes.className,
    "[&>input]:transition-all after:content-[var(--content)] after:absolute after:right-4 after:text-[13px] [&>input]:has-[input[data-field='valid']]:!pr-[var(--inset-end)]"
  ),
  variants: {
    name: {
      height: "has-[input[data-field='valid']]:[--content:'_cm'] [--inset-end:2.5rem]",
      weight: "has-[input[data-field='valid']]:[--content:'_kg'] [--inset-end:2.25rem]"
    }
  }
});

const formFields = [
  createField('input', { name: 'name', label: 'Display name:', placeholder: 'Enter name', errorMessage: 'placeholder', autoComplete: 'off', ...classes }),
  createField('select-item', {
    name: 'about.gender',
    label: 'Gender:',
    placeholder: 'Select Gender',
    errorMessage: 'placeholder',
    withReset: null,
    withSearch: false,
    data: ['Male', 'Female'],
    ...classes
  })
];

function sameInputFields<TPath extends string, TName extends string>(
  path: TPath,
  names: TName[],
  { readOnly = false } = {}
): Field<'input', `${TPath}.${TName}`, FormInputFieldProps<`${TPath}.${TName}`>>[] {
  return names.map(name => {
    return createField('input', {
      readOnly,
      name: `${path}.${name}` as `${TPath}.${TName}`,
      type: readOnly ? 'text' : 'number',
      label: transform.capitalizeFirst(`${name}:`),
      placeholder: readOnly ? '--' : `Add ${name}`,
      ...(readOnly
        ? classes
        : {
            invalidValues: { string: ['0'], number: [0] },
            className: classesSelector({ name: name as any }),
            classNames: classes.classNames
          })
    });
  });
}

const formFields2 = createFields([...sameInputFields('about', ['horoscope', 'zodiac'], { readOnly: true }), ...sameInputFields('about', ['height', 'weight'])] as const);

export function SettingAboutForm({ account }: { account: Account }) {
  const defaultValues = Form.initialValues(account, {
    string: ['name', 'about.birthPlace', 'about.bio', 'about.resume', 'about.nationalId', 'about.taxId', 'about.horoscope', 'about.zodiac', 'about.height', 'about.weight'],
    undefined: ['about.birthDay', 'about.gender'],
    array: ['about.goals', 'about.hobby', 'about.interests', 'about.languages', 'about.skills', 'about.notes'],
    number: [],
    date: []
  });

  const [isEdit, setIsEdit] = React.useState(false);

  const { form, router, loading, setLoading } = useSettingsForm<SettingGeneralFormValues>(account, {
    schema: SettingGeneralSchema,
    defaultValues
  });

  if (!account) return null;

  function onSubmit({ name, about }: SettingGeneralFormValues) {
    setLoading(true);
    try {
      toast.promise(
        updateAccount(account?.id, {
          name: name ? getDispaly(name).name() : name,
          about: {
            upsert: {
              create: about,
              update: about
            }
          }
        }),
        {
          loading: 'Updating...',
          success: () => {
            router.refresh();
            setLoading(false);
            setTimeout(() => setIsEdit(false), 300);
            return 'Your information has been updated';
          },
          error: 'There is an error'
        }
      );
    } catch (error) {
      toast.error('Error');
    } finally {
      router.refresh();
      setLoading(false);
    }
  }

  return (
    <Form.Card>
      <div className="inline-flex flex-row items-center justify-between">
        <h3 className="font-bold text-sm">About</h3>
        <Button
          type={isEdit ? 'submit' : 'button'}
          form={isEdit ? 'about-section-form' : undefined}
          onClick={() => {
            if (!isEdit) setTimeout(() => setIsEdit(true), 35);
          }}
          className={cn('w-max text-xs font-medium text-gradient')}
        >
          {isEdit ? 'Save & Update' : <PencilIcon size={18} />}
        </Button>
      </div>

      {/* Static text when not editing */}
      <motion.div initial={false} animate={!isEdit ? 'open' : 'closed'} variants={containerVariants()} className="overflow-hidden">
        <AboutSectionFallback user={account} />
      </motion.div>

      <motion.div initial={false} animate={isEdit ? 'open' : 'closed'} variants={containerVariants()}>
        <motion.div variants={itemVariants()}>
          <SettingAvatarForm account={account} />
        </motion.div>
        <Form.Provider {...form}>
          <Form id={isEdit ? 'about-section-form' : undefined} onSubmit={form.handleSubmit(onSubmit)} className="my-2 grid grid-cols-1 lg:grid-cols-2 gap-3">
            {formFields.map(field => (
              <motion.div key={field.name} variants={itemVariants()}>
                {renderFormField(form.control, field, loading)}
              </motion.div>
            ))}

            <motion.div variants={itemVariants()}>
              <Form.Field
                control={form.control}
                name="about.birthDay"
                render={({ field }) => (
                  <Form.DateField
                    type="single"
                    name="about.birthDay"
                    label="Birthday:"
                    openWith="drawer"
                    disabled={loading}
                    value={field.value}
                    onChange={date => {
                      field.onChange(date);
                      form.setValue('about.horoscope', getHoroscopeSign(date), { shouldValidate: true });
                      form.setValue('about.zodiac', getShioEntry(date)?.animal, { shouldValidate: true });
                    }}
                    placeholder="DD MM YYYY"
                    className={classes.className}
                    classNames={{
                      content: '[&>.rdp]:w-full [&>.rdp]:min-w-[366px] [&>.rdp]:max-w-[478px] [&>.rdp]:p-0 [&>.rdp]:mx-auto flex flex-col items-center justify-start',
                      ...classes.classNames
                    }}
                  />
                )}
              />
            </motion.div>

            {formFields2.map(field => (
              <motion.div key={field.name} variants={itemVariants()}>
                {renderFormField(form.control, field, loading)}
              </motion.div>
            ))}

            <Button
              type="button"
              onClick={() => {
                if (isEdit) setTimeout(() => setIsEdit(false), 35);
              }}
              className={cn('w-max text-xs font-medium text-gradient ml-auto')}
            >
              Cancel
            </Button>
          </Form>
        </Form.Provider>
      </motion.div>
    </Form.Card>
  );
}

interface AboutSectionFallbackProps {
  user: Account;
}
function AboutSectionFallback({ user }: AboutSectionFallbackProps) {
  if (!user) return null;

  const filter = <T,>(i: T) => i !== null && i !== undefined && i !== 0 && i !== '0';

  const formatted = formatBirthDay(user.about?.birthDay);

  const aboutInfo = ocx({
    Birthday: filter(user.about?.birthDay) && `${formatted} (Age ${getAge(user.about?.birthDay).yearDiff})`,
    Horoscope: filter(user.about?.birthDay) && getHoroscopeSign(user.about?.birthDay),
    Zodiac: filter(user.about?.birthDay) && getShioEntry(user.about?.birthDay)?.animal,
    Height: filter(user.about?.height) && `${user.about?.height} cm`,
    Weight: filter(user.about?.weight) && `${user.about?.weight} kg`
  });

  const displayInfo = Object.entries(aboutInfo)
    .filter(([_, value]) => {
      return filter(value);
    })
    .map(([label, value]) => ({
      label,
      value: String(value)
    }));

  if (!user.about || !displayInfo || displayInfo.length === 0) {
    return <p className="text-sm font-medium text-muted-foreground ">Add in your profile to help others know you better</p>;
  }

  return (
    <div className="grid grid-flow-row gap-3">
      {displayInfo.map(({ label, value }) => (
        <div key={label} className="flex flex-row items-center gap-1 font-medium text-color text-[13px]">
          <span className="text-muted">{label}:</span>
          <span>{value}</span>
        </div>
      ))}
    </div>
  );
}
