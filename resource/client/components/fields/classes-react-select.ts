import * as ReactSelect from 'react-select';
import { cn } from 'cn';

export interface ReactSelectClassesVariant {
  variant?: 'chip' | 'default';
}

interface ClassesReactSelectType<Option, IsMulti extends boolean, Group extends ReactSelect.GroupBase<Option>> {
  classNames?: ReactSelect.ClassNamesConfig<Option, IsMulti, Group>;
  styles?: ReactSelect.StylesConfig<Option, IsMulti, Group>;
}

interface ClassesReactSelectProps<Option, IsMulti extends boolean, Group extends ReactSelect.GroupBase<Option>>
  extends ClassesReactSelectType<Option, IsMulti, Group>,
    ReactSelectClassesVariant {
  inputPlaceholder: string | undefined;
}
export function classesReactSelect<Option, IsMulti extends boolean, Group extends ReactSelect.GroupBase<Option>>(
  props: ClassesReactSelectProps<Option, IsMulti, Group>
): ClassesReactSelectType<Option, IsMulti, Group> {
  const { classNames, styles, variant, inputPlaceholder } = props;

  const isDefault = variant === 'default';
  const isChip = variant === 'chip';

  return {
    classNames: {
      ...classNames,
      container: props => cn('focus-visible:!ring-0', classNames?.container?.(props)),
      control: props =>
        cn(
          'flex flex-row flex-wrap items-center ring-offset-background transition-colors hover:!border-border focus-visible:outline-none focus-visible:ring-2 pl-2 pr-1.5 rtl:pl-1.5 rtl:pr-2 py-1 text-left focus:ring-2 focus:ring-[hsl(var(--ring-color))] focus-visible:ring-[hsl(var(--ring-color))] ring-offset-0 focus:ring-offset-0 focus-visible:ring-offset-0 has-[.item-value]:py-2',
          inputPlaceholder && '[&:not(:has(.item-value))_.input-control_input]:placeholder:text-transparent',
          classNames?.control?.(props)
        ),
      valueContainer: props => cn('value-container focus-visible:ring-0', classNames?.valueContainer?.(props)),
      placeholder: props => cn('placeholder focus-visible:ring-0', classNames?.placeholder?.(props)),
      multiValue: props => cn('item-value', classNames?.multiValue?.(props)),
      multiValueLabel: props => cn('!text-color', classNames?.multiValueLabel?.(props)),
      multiValueRemove: props => cn('hover:!bg-[hsl(var(--remove-color)/25%)] hover:!text-[hsl(var(--remove-color))]', classNames?.multiValueRemove?.(props)),
      input: props =>
        cn('input-control focus-visible:[&_input]:!ring-0', inputPlaceholder && '[&_input]:!min-w-max [&_input]:placeholder:text-muted-foreground', classNames?.input?.(props)),
      indicatorsContainer: props => cn('right-section [&_svg]:size-[14px]', '[&_.dropdown-toggle]:has-[.remove-toggle]:hidden', classNames?.indicatorsContainer?.(props)),
      clearIndicator: props => cn('remove-toggle', props.isFocused ? 'hover:!text-[hsl(0_70%_50%)]' : 'hover:!text-[hsl(var(--remove-color))]', classNames?.clearIndicator?.(props)),
      dropdownIndicator: props =>
        cn(
          'dropdown-toggle',
          props.isFocused ? 'hover:!text-[hsl(var(--ring-color))]' : '[&_svg_path]:[transform:rotateZ(90deg)_translate(0%,-100%)] hover:!text-color',
          classNames?.dropdownIndicator?.(props)
        ),
      menu: props => cn('!shadow-md blur-popover', classNames?.menu?.(props)),
      menuList: props =>
        cn(
          '!bg-transparent !py-0 !rounded-md !gap-1',
          isChip &&
            '!flex !flex-wrap !flex-row !w-full !max-w-full has-[.css-1s9izoc]:!flex-col has-[.css-1s9izoc]:!flex-nowrap [&_[id*="react-select"]+div]:has-[.css-1s9izoc]:flex [&_[id*="react-select"]+div]:has-[.css-1s9izoc]:flex-row [&_[id*="react-select"]+div]:has-[.css-1s9izoc]:flex-wrap [&_[id*="react-select"]+div]:has-[.css-1s9izoc]:gap-1',
          isDefault && '!grid !grid-flow-row',
          classNames?.menuList?.(props)
        ),
      option: props =>
        cn(
          '!relative !flex !items-center !cursor-pointer !select-none !px-2 !text-sm !font-medium !outline-0 hover:!outline-0 hover:!ring-0 hover:!text-accent-foreground data-[disabled]:!pointer-events-none data-[disabled]:!opacity-50 hover:!bg-[var(--chip-bg)]',
          isChip && '!w-max !min-w-max !justify-center !grow !py-1',
          isDefault && '!py-2',
          classNames?.option?.(props)
        )
    },
    styles: {
      ...styles,
      container: (base, props) => ({
        ...base,
        ...styles?.container?.(base, props)
      }),
      control: (base, props) => ({
        ...base,
        '--ring-color': '215.4deg 92.59% 57.65%',
        '--remove-color': '0 85% 60%',
        width: '100%',
        minHeight: '2.25rem',
        borderRadius: 'var(--radius)',
        whiteSpace: 'wrap',
        fontWeight: '400',
        fontSize: '0.875rem',
        lineHeight: '1.25rem',
        borderWidth: '1px',
        color: 'hsl(var(--color))',
        backgroundColor: 'hsl(var(--background))',
        opacity: props.isDisabled ? '0.5' : '1',
        pointerEvents: props.isDisabled ? 'none' : 'auto',
        cursor: props.isDisabled ? 'not-allowed' : 'pointer',
        borderColor: props.isFocused ? 'transparent' : 'hsl(var(--border))',
        outline: 'none',
        boxShadow: props.isFocused
          ? 'var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color), var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color), var(--tw-shadow, 0 0 #0000)'
          : undefined,
        ...styles?.control?.(base, props)
      }),
      valueContainer: (base, props) => ({
        ...base,
        gap: '4px',
        padding: '0px 2px',
        backgroundColor: 'hsl(var(--background))',
        ...styles?.valueContainer?.(base, props)
      }),
      placeholder: (base, props) => ({
        ...base,
        display: 'flex',
        alignItems: 'center',
        gridArea: 'auto',
        position: 'absolute',
        color: 'hsl(var(--muted-foreground))',
        ...styles?.placeholder?.(base, props)
      }),
      multiValue: (base, props) => ({
        ...base,
        display: 'flex',
        margin: '0',
        alignItems: 'center',
        backgroundColor: 'rgba(var(--palette-grey-500Channel) / 0.16)',
        borderRadius: 'calc(var(--radius) * 1)',
        paddingInlineEnd: '0px',
        WebkitTapHighlightColor: 'transparent',
        userSelect: 'none',
        appearance: 'none',
        ...styles?.multiValue?.(base, props)
      }),
      multiValueLabel: (base, props) => ({
        ...base,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        paddingLeft: '8px',
        paddingRight: '8px',
        fontWeight: '500',
        ...styles?.multiValueLabel?.(base, props)
      }),
      multiValueRemove: (base, props) => ({
        ...base,
        borderRadius: '9999px',
        marginRight: '4px',
        marginLeft: '-4px',
        height: '16px',
        width: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft: '0',
        paddingRight: '0',
        paddingTop: '0',
        paddingBottom: '0',
        backgroundColor: 'hsl(var(--color) / 25%)',
        WebkitTapHighlightColor: 'transparent',
        userSelect: 'none',
        appearance: 'none',
        ...styles?.multiValueRemove?.(base, props)
      }),
      input: (base, props) => ({
        ...base,
        margin: '0 0 0 2px',
        paddingBottom: '0px',
        paddingTop: '0px',
        paddingLeft: '0',
        paddingRight: '0',
        color: 'hsl(var(--color))',
        backgroundColor: 'hsl(var(--background))',
        ...styles?.input?.(base, props)
      }),
      menu: (base, props) => ({
        ...base,
        '--chip-bg': 'rgba(var(--palette-grey-500Channel) / 0.16)',
        '--menu-padding': '0.5rem',
        padding: 'var(--menu-padding) 0rem',
        marginTop: '0.25rem',
        zIndex: '11',
        overflow: 'hidden',
        maxHeight: 'var(--menu-max-h, 14rem)',
        borderRadius: 'var(--radius)',
        border: '1px solid hsl(var(--border))',
        color: 'hsl(var(--popover-foreground))',
        backgroundColor: 'hsl(var(--popover))',
        ...styles?.menu?.(base, props)
      }),
      menuList: (base, props) => ({
        ...base,
        padding: '0rem var(--menu-padding)',
        maxHeight: 'calc(var(--menu-max-h, 14rem) - (var(--menu-padding) * 3))',
        scrollbarColor: 'var(--scroll-color, #adb3bd) var(--scroll-bg, #0000)',
        scrollbarWidth: 'var(--scroll-w, thin)' as any,
        scrollbarGutter: 'auto',
        ...styles?.menuList?.(base, props)
      }),
      groupHeading: (base, props) => ({
        ...base,
        textTransform: 'unset',
        ...styles?.groupHeading?.(base, props)
      }),
      option: (base, props) => ({
        ...base,
        WebkitTapHighlightColor: 'transparent',
        userSelect: 'none',
        appearance: 'none',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        fontWeight: '500',
        backgroundColor: cn(isChip && 'var(--chip-bg)', isDefault && 'transparent'),
        borderRadius: cn(isChip && 'calc(var(--radius) * 1)', isDefault && 'calc(var(--radius) - 2px)'),
        ...styles?.option?.(base, props)
      }),
      noOptionsMessage: (base, props) => ({
        ...base,
        ...styles?.noOptionsMessage?.(base, props)
      }),
      indicatorSeparator: (base, props) => ({
        ...base,
        backgroundColor: 'hsl(var(--muted))',
        display: 'none',
        ...styles?.indicatorSeparator?.(base, props)
      }),
      indicatorsContainer: (base, props) => ({
        ...base,
        flexDirection: 'column-reverse',
        gap: '6px',
        marginBlock: 'auto',
        ...styles?.indicatorsContainer?.(base, props)
      }),
      clearIndicator: (base, props) => ({
        ...base,
        padding: '2.5px',
        marginLeft: '4px',
        marginRight: '2px',
        borderRadius: '5px',
        color: 'hsl(var(--remove-color))',
        background: 'hsl(var(--remove-color) / 10%)',
        height: '1.25rem',
        width: '1.25rem',
        minHeight: '1.25rem',
        minWidth: '1.25rem',
        justifyContent: 'center',
        alignItems: 'center',
        ...styles?.clearIndicator?.(base, props)
      }),
      dropdownIndicator: (base, props) => ({
        ...base,
        padding: '2.5px',
        marginLeft: '4px',
        marginRight: '2px',
        borderRadius: '5px',
        height: '1.25rem',
        width: '1.25rem',
        minHeight: '1.25rem',
        minWidth: '1.25rem',
        justifyContent: 'center',
        alignItems: 'center',
        color: props.isFocused ? 'hsl(var(--ring-color))' : 'hsl(var(--color))',
        background: props.isFocused ? 'hsl(var(--ring-color) / 25%)' : 'hsl(var(--color) / 10%)',
        ...styles?.dropdownIndicator?.(base, props)
      })
    }
  };
}
