'use client';
import * as React from 'react';
import * as motion from 'motion/react-client';
import { toast } from 'sonner';
import { Button } from '../../ui/button';
import { Form } from '../../fields/form';
import { Account } from '@/resource/types/user';
import { updateAccount } from '../../../../../auth/handler-server';
import { useSettingsForm } from '../../../../../auth/handler-client';
import { SettingGeneralFormValues, SettingGeneralSchema } from '@/resource/schemas/user';
import { containerVariants, itemVariants } from '@/resource/styles/motion-styles';
import { useMobileHistoryState } from '@/resource/hooks/use-mobile-history-state';
import { MotionCard, MotionCardModal } from '../../motion/motion-card';
import { ActionBack } from '../../actions';
import { PencilIcon } from '../../icons';
import { styleForm } from './components';
import { Badge } from '../../ui/badge';
import { cn } from 'cn';
import { useModal } from '@/resource/hooks/use-modal';

const classes = styleForm().auth().focused();

interface Options {
  readonly value: string;
  readonly label: string;
}

interface GroupedOption {
  readonly label: string;
  readonly options: readonly Options[];
}
const transform = (opts: string[]): readonly Options[] => opts.map(opt => ({ value: opt.replace(/\s+/g, '-'), label: opt }) as const);

export const groupedOptions: readonly GroupedOption[] = [
  {
    label: 'Music & Arts',
    options: transform(['Music', 'Singing', 'Drawing', 'Painting', 'Photography', 'Acting', 'Dancing', 'Writing', 'Podcasting', 'Film Making'])
  },
  {
    label: 'Sports & Fitness',
    options: transform(['Basketball', 'Football', 'Running', 'Fitness', 'Yoga', 'Swimming', 'Cycling', 'Tennis', 'Hiking', 'Martial Arts'])
  },
  {
    label: 'Gaming & Esports',
    options: transform(['Gaming', 'Esports', 'Streaming', 'Game Development', 'Board Games', 'VR Gaming', 'Puzzle Games'])
  },
  {
    label: 'Science & Technology',
    options: transform(['Programming', 'AI & Machine Learning', 'Web Development', 'Cybersecurity', 'Astronomy', 'Engineering', '3D Printing', 'Robotics'])
  },
  {
    label: 'Lifestyle & Wellness',
    options: transform(['Cooking', 'Traveling', 'Meditation', 'Gardening', 'Journaling', 'Home Decor', 'Volunteering'])
  },
  {
    label: 'Education & Learning',
    options: transform(['Reading', 'Language Learning', 'History', 'Economics', 'Philosophy', 'Public Speaking', 'Teaching'])
  },
  {
    label: 'Business & Career',
    options: transform(['Entrepreneurship', 'Investing', 'Marketing', 'Sales', 'Productivity', 'Project Management', 'Networking'])
  }
];

function stylingMotionCards() {
  return {
    card() {
      return {
        classNames: {
          root: 'relative rounded-2xl border bg-card shadow-sm',
          content: 'px-6 py-4 grid grid-cols-1 text-color gap-4',
          header: 'inline-flex flex-row items-center justify-between w-full',
          body: 'w-full'
        }
      };
    },
    modal() {
      return {
        classNames: {
          container: 'bg-gradient-theme flex items-center justify-center px-2.5 !mt-0',
          root: 'mb-auto',
          content: '',
          header: 'mb-6 mt-8 grid grid-cols-3 justify-items-center items-center',
          body: 'mt-16'
        }
      };
    }
  };
}

export function SettingInterestsForm({ account }: { account: Account }) {
  const defaultValues = Form.initialValues(account, {
    string: ['name', 'about.birthPlace', 'about.bio', 'about.resume', 'about.nationalId', 'about.taxId', 'about.horoscope', 'about.zodiac', 'about.height', 'about.weight'],
    undefined: ['about.birthDay', 'about.gender'],
    array: ['about.goals', 'about.hobby', 'about.interests', 'about.languages', 'about.skills', 'about.notes'],
    number: [],
    date: []
  });

  const { open, setOpen: setIsEdit, isRender: isEdit } = useModal({ modal: true });

  const { form, update, router, loading, setLoading } = useSettingsForm<SettingGeneralFormValues>(account, {
    schema: SettingGeneralSchema,
    defaultValues
  });

  const onOpen = () => {
      setIsEdit(true);
    },
    onClose = () => {
      setIsEdit(false);
    };

  useMobileHistoryState(true, { open: isEdit, onOpenChange: setIsEdit });

  if (!account) return null;

  function onSubmit({ name, about }: SettingGeneralFormValues) {
    setLoading(true);
    try {
      toast.promise(
        updateAccount(account?.id, {
          name,
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
            setTimeout(() => onClose(), 300);
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
    <>
      <MotionCard
        key={`${!!account.about?.interests}`}
        name="interests"
        {...stylingMotionCards().card()}
        header={
          <>
            <h3 className="font-bold text-sm">Interest</h3>
            <Button type="button" onClick={onOpen} className={cn('w-max text-xs font-medium text-gradient')}>
              <PencilIcon size={18} />
            </Button>
          </>
        }
      >
        <AboutSectionFallback user={account} open={isEdit} />
      </MotionCard>
      <MotionCardModal
        name="interests"
        open={isEdit}
        onOpenChange={setIsEdit}
        {...stylingMotionCards().modal()}
        header={
          <>
            <ActionBack instance="back" className="mr-auto" />
            <p className="text-sm font-semibold"></p>
            <Button
              type="submit"
              suppressHydrationWarning
              disabled={loading}
              form="about-interests-form"
              className={cn(
                'w-max mr-4 rtl:mr-0 rtl:ml-4 text-sm font-semibold ml-auto py-0 rounded-none bg-clip-text group-[:not(:has(.item-value))]/content:opacity-50 group-[:not(:has(.item-value))]/content:pointer-events-none'
              )}
              style={{ background: '40% 40% / 200% no-repeat text linear-gradient(134.86deg, #ABFFFD 2.64%, #4599DB 102.4%, #AADAFF 102.4%)' }}
            >
              Save
            </Button>
          </>
        }
      >
        <Form.Provider {...form}>
          <motion.form
            id="about-interests-form"
            initial={false}
            animate={isEdit ? 'open' : 'closed'}
            variants={containerVariants()}
            onSubmit={form.handleSubmit(onSubmit)}
            className="my-2 px-4 gap-3"
          >
            <p className="text-sm font-bold text-gradient ml-6 rtl:ml-auto rtl:mr-6 mb-1.5">Tell everyone about yourself</p>

            <Form.Field
              control={form.control}
              name="about.interests"
              render={({ field }) => (
                <Form.CreatableSelectField
                  disabled={loading}
                  label="What interest you?"
                  variant="chip"
                  placeholder=" "
                  noOptionsMessage={() => 'Add new\n(select or press Enter)'}
                  {...field}
                  isMulti
                  // menuIsOpen
                  options={groupedOptions}
                  value={field.value?.map(int => ({ label: int, value: int }))}
                  onChange={selected => field.onChange(selected.map(option => option.value))}
                  className="dark:[--bg-control:#d9d9d90f] [&_.value-container:not(:has(.item-value))]:[--space-x:7px] [&_.placeholder:not(:has(.item-value))]:[--ml:calc(var(--space-x)+1px)]"
                  classNames={{ label: classes.label }}
                  styles={{
                    option: base => ({ ...base, backgroundColor: 'var(--chip-bg)' }),
                    control: base => ({
                      ...base,
                      backgroundColor: 'var(--bg-control)',
                      minHeight: '46px',
                      borderRadius: '10px',
                      borderColor: 'transparent',
                      borderWidth: '0px',
                      boxShadow: 'none'
                    }),
                    placeholder: base => ({ marginLeft: 'var(--ml)', marginRight: '2px' }),
                    valueContainer: base => ({ ...base, padding: '0 var(--space-x, 2px)', backgroundColor: 'transparent' }),
                    input: base => ({ ...base, backgroundColor: 'transparent', color: 'hsl(var(--color))' }),
                    indicatorsContainer: base => ({ ...base, display: 'none' }),
                    menu: base => ({ borderRadius: '10px' })
                  }}
                />
              )}
            />
          </motion.form>
        </Form.Provider>
      </MotionCardModal>
    </>
  );
}

interface AboutSectionFallbackProps {
  user: Account;
  open?: boolean;
}
function AboutSectionFallback({ user, open }: AboutSectionFallbackProps) {
  if (!user) return null;

  const interests = user.about?.interests;

  if (!interests || interests.length === 0) {
    return <p className="text-sm font-medium text-muted-foreground ">Add in your interest to find a better match</p>;
  }

  return (
    <motion.div initial={false} animate={!open ? 'open' : 'closed'} variants={itemVariants({ closed: { scale: 0, height: 0 } })} className="flex flex-row items-center flex-wrap gap-3">
      {interests?.map(int => (
        <Badge key={int} size="lg">
          {int}
        </Badge>
      ))}
    </motion.div>
  );
}
