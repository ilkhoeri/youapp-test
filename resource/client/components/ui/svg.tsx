import * as React from 'react';

export enum sizeEnum {
  unset = 'unset',
  xs = 'xs',
  xxs = 'xxs',
  xxxs = 'xxxs',
  base = 'base',
  sm = 'sm',
  md = 'md',
  lg = 'lg',
  xl = 'xl',
  xxl = 'xxl',
  xxxl = 'xxxl',
  full = 'full'
}

export type Value = (string & {}) | number | undefined;

export type sizeInitials = (typeof sizeInitials)[number];

export type Sizes = sizeInitials | Value;

export type Colors = React.CSSProperties['color'] | 'currentColor';

export type IconType = (props: DetailedSvgProps) => React.JSX.Element;

export type SvgProps<OverrideProps = object> = Omit<DetailedSvgProps, 'children' | 'currentFill' | 'ratio'> & {
  ref?: React.Ref<SVGSVGElement>;
} & OverrideProps;

export interface IconTree {
  tag: string;
  child: IconTree[];
  attr: { [key: string]: string };
}

export interface DetailedSvgProps extends Omit<React.SVGAttributes<SVGElement>, 'stroke'>, SizesProps {
  color?: Colors;
  stroke?: number | Colors;
  style?: React.CSSProperties & { [key: string]: any };
  currentFill?: 'fill' | 'stroke' | 'fill-stroke' | 'none';
}

type SizeType = {
  /** Menentukan `lebar`/`rasio lebar` area tampilan dalam unit yang digunakan. */
  w?: Sizes;
  /** Menentukan `tinggi`/`rasio tinggi` area tampilan dalam unit yang digunakan. */
  h?: Sizes;
};

export interface SizesProps extends SizeType {
  width?: string | number;
  height?: string | number;
  /**
   * @type
   * ```ts
   * Sizes | { h?: Sizes; w?: Sizes };
   * ```
   * Initial:
   *
   * `unset: undefined` | `xs: "10px"` | `xxs: "12px"` | `xxxs: "14px"` | `base: "16px"` | `sm: "18px"` | `md: "22px"` | `lg: "32px"` | `xl: "48px"` | `xxl: "86px"` | `xxxl: "112px"` | `full: "100%"`
   */
  size?: Sizes | SizeType;
  /**
   * Nilai viewBox="0 0 24 24" merujuk pada sistem koordinat yang digunakan untuk menggambarkan ruang gambar dalam elemen SVG. Nilai ini terdiri dari empat angka:
   *
   * - **0** (nilai pertama) – Posisi horizontal **x** dari sudut kiri atas area tampilan (viewBox). Jadi, posisi horizontal dimulai dari koordinat x = 0.
   * - **0** (nilai kedua) – Posisi vertikal **y** dari sudut kiri atas area tampilan. Posisi vertikal dimulai dari koordinat y = 0.
   * - **24** (nilai ketiga) – Lebar area tampilan dalam unit yang digunakan (biasanya pixel atau unit SVG). Dengan kata lain, lebar area tampilan adalah 24 unit.
   * - **24** (nilai keempat) – Tinggi area tampilan dalam unit yang digunakan (biasanya pixel atau unit SVG). Jadi, tinggi area tampilan adalah 24 unit.
   */
  ratio?: Sizes | SizeType;
}

export declare function SvgIcon(data: IconTree): (props: DetailedSvgProps) => React.JSX.Element;
export declare function SvgBase(props: DetailedSvgProps & { attr?: Record<string, string> }): React.JSX.Element;

export const colorRegex = /^[a-zA-Z]+$/;
export const hexRegex = /^#[0-9A-Fa-f]{3,6}$/;
export const rgbRegex = /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/;
export const rgbaRegex = /^rgba\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3}),\s*(0|1|0?\.\d+)\)$/;

export const emRemRegex = /^[-+]?(?:\d+|\d*\.\d+)(px|em|rem|%|vw|vh|vmin|vmax|svw|svh|ch|ex|cm|mm|in|pt|pc)$/;

/** `margin`, `padding`, etc. `%` → relative to parent */
export const lengthUnits = ['px', 'em', 'rem', 'in', 'cm', 'mm', 'pt', 'pc', '%'] as const;
/** `width`, `height`, etc. */
export const viewportUnits = ['vh', 'vw', 'svh', 'svw', 'dvh', 'dvw', 'lvh', 'lvw', 'vmin', 'vmax'] as const;
/** `font-size` etc. */
export const typographicUnits = ['ch', 'ex', 'cap', 'ic', 'lh', 'rlh'] as const;
/** `margin`, `padding`, `width`, `height`, `font-size` etc. */
export const cssUnits = [...lengthUnits, ...viewportUnits, ...typographicUnits] as const;

export const colorFunctions = ['rgb', 'hsl', 'hwb', 'lch', 'oklch', 'lab', 'oklab', 'color', 'rgba', 'hsla', 'hwba', 'lcha', 'laba'] as const;
export const mathFunctions = ['calc', 'clamp', 'min', 'max'] as const;
export const variableFunction = ['var'] as const;
export const cssFunctions = [...colorFunctions, ...mathFunctions, ...variableFunction] as const;

export const unitsRegex = getSuffixSizeRegex();

export type lengthUnits = (typeof lengthUnits)[number];
export type viewportUnits = (typeof viewportUnits)[number];
export type typographicUnits = (typeof typographicUnits)[number];
export type cssUnits = (typeof cssUnits)[number];
export type colorFunctions = (typeof colorFunctions)[number];
export type mathFunctions = (typeof mathFunctions)[number];
export type variableFunction = (typeof variableFunction)[number];
export type cssFunctions = (typeof cssFunctions)[number];

type TRegExp<T> = (string & {}) | T | (T[] | readonly T[]);

export function getPrefixSizeRegex(value: TRegExp<cssFunctions> = cssFunctions) {
  const rg = typeof value === 'string' ? value : value?.join('|');
  return new RegExp(`^(${rg})$`);
}
export function getSuffixSizeRegex(value: TRegExp<cssUnits> = cssUnits) {
  const rg = typeof value === 'string' ? value : value?.join('|');
  return new RegExp(`^([-+]?(?:\\d+|\\d*\\.\\d+))(${rg})$`);
}

export const sizeInitials = Object.values<`${sizeEnum}`>(sizeEnum);

export const sizeMap: Record<sizeInitials, Value> = {
  unset: undefined,
  xs: '10px',
  xxs: '12px',
  xxxs: '14px',
  base: '16px',
  sm: '18px',
  md: '22px',
  lg: '32px',
  xl: '48px',
  xxl: '86px',
  xxxl: '112px',
  full: '100%'
} as const;

export function isNumber<T>(value: T): boolean {
  return !isNaN(Number(value)) && Number(value) > 0;
}

export function isString<T>(value: T): boolean {
  const parseValue = String(value).trim().toLowerCase();
  const _values = ['', 'undefined', 'false', 'null', 'NaN'].map(i => i.toLowerCase());
  return typeof value === 'string' && !_values.includes(parseValue);
}

export function isValidSize<T extends Value>(value: T): boolean {
  switch (typeof value) {
    case 'string':
      return isString(value) && !getPrefixSizeRegex().test(value);
    case 'number':
      return isNumber(value);
    default:
      return false;
  }
}

export function isColor<T>(value: T): boolean {
  return typeof value === 'string' && isString(value) && (hexRegex.test(value) || rgbRegex.test(value) || rgbaRegex.test(value) || colorRegex.test(value));
}

export function parseUnit(value: string): { value: number; unit: string } | null {
  const match = value.match(unitsRegex);
  return match ? { value: parseFloat(match[1]), unit: match[2] } : null;
}

export function parseSize(size: Sizes): Value {
  const isInitial = sizeInitials.includes(size as sizeInitials);
  return isInitial ? sizeMap[size as sizeInitials] : size;
}

interface toPxOpts {
  shouldNumber?: number | boolean;
  shouldPercent?: number | boolean;
}
export function toPixel<R extends Value>(size: Sizes, opts: toPxOpts = {}): R {
  const { shouldNumber = true, shouldPercent = false } = opts;
  const parseValue: Value = parseSize(size);
  let newValue: Value = typeof shouldNumber === 'number' ? shouldNumber : 16;

  switch (typeof parseValue) {
    case 'string':
      const mv = [...mathFunctions, ...variableFunction].join('|');
      const rg = new RegExp(`^(${mv})\\(|auto|inherit`);
      const isSfx = (rg: string) => parseValue.match(getSuffixSizeRegex(rg));
      const em = isSfx('em|rem');
      const px = isSfx('px');
      const percent = isSfx('%');
      if (rg.test(parseValue) && !shouldNumber) newValue = parseValue;
      if (isNumber(parseValue)) newValue = Number(parseValue);
      if (em) newValue = parseFloat(em[1]) * 16;
      if (px) newValue = parseFloat(px[1]);
      if (percent) newValue = !!shouldPercent ? (parseFloat(percent[1]) / 100) * ((shouldPercent as number) ?? 16) : parseValue;
      break;

    case 'number':
      newValue = parseValue;
      break;
  }

  return newValue as R;
}

export function ratio(size: Sizes, scale?: Sizes) {
  const inValidSize = (typeof size === 'string' && !isString(size)) || (typeof size === 'number' && !isNumber(size));

  const isInitial = sizeInitials.includes(size as sizeInitials);

  if (!size || inValidSize) return;

  const s = toPixel(size, { shouldNumber: false });
  const r = toPixel(scale, { shouldNumber: 1, shouldPercent: true });

  if (isInitial) return s;

  if (scale) return typeof s === 'number' && typeof r === 'number' ? `${(s * r) / 16}rem` : s;

  return typeof s === 'number' ? `${s / 16}rem` : s;
}

export function getSizes(props: SizesProps) {
  const { size = '16px', ratio: r, ...rest } = props;

  const getRatio = () => (typeof r === 'object' ? { h: parseSize(r?.h), w: parseSize(r?.w) } : { h: parseSize(r), w: parseSize(r) });
  const getHeight = <T extends Sizes>(v: T) => ratio(rest.height || rest.h || v, getRatio().h);
  const getWidth = <T extends Sizes>(v: T) => ratio(rest.width || rest.w || v, getRatio().w);

  switch (typeof size) {
    case 'object':
      return { height: getHeight(size.h), width: getWidth(size.w) };
    default:
      return { height: getHeight(size), width: getWidth(size) };
  }
}

export function svgProps(detail: DetailedSvgProps) {
  const {
    size = '1rem',
    width: _w,
    height: _h,
    w,
    h,
    xmlns = 'http://www.w3.org/2000/svg',
    viewBox = '0 0 24 24',
    'aria-hidden': ariaHidden = 'true',
    currentFill = 'stroke',
    fill,
    stroke,
    strokeWidth,
    strokeLinecap,
    strokeLinejoin,
    ratio,
    color,
    style,
    ...props
  } = detail;

  const s = getSizes({ size, width: _w, height: _h, h, w, ratio });

  // Determine strokeIsColor and strokeIsWidth
  const strokeIsColor = typeof stroke === 'string' && isColor(stroke) ? stroke : undefined;
  // Check if stroke is a valid color or a valid number
  const strokeIsWidth = strokeWidth || (isNumber(stroke) ? stroke : undefined);
  const getColor: Record<typeof currentFill, Record<string, string | undefined> | undefined> = {
    fill: { fill: fill || color },
    stroke: { stroke: strokeIsColor || color },
    'fill-stroke': { fill: fill || color, stroke: strokeIsColor || color },
    none: undefined
  };

  const __props = {
    fill,
    stroke,
    strokeWidth,
    strokeLinecap,
    strokeLinejoin,
    viewBox,
    xmlns,
    /* height: !isValidSize(size) ? height : undefined, */
    /* width: !isValidSize(size) ? width : undefined, */
    style: { ...s, minHeight: s.height, minWidth: s.width, color, ...getColor[currentFill], ...style },
    'aria-hidden': ariaHidden,
    ...props
  } as React.SVGAttributes<SVGSVGElement>;

  switch (currentFill) {
    case 'stroke':
      __props.fill = !fill ? 'none' : undefined;
      __props.stroke = !strokeIsColor ? 'currentColor' : undefined;
      __props.strokeWidth = strokeIsWidth || '2';
      __props.strokeLinecap = strokeLinecap || 'round';
      __props.strokeLinejoin = strokeLinejoin || 'round';
      break;
    case 'fill':
      __props.fill = !fill ? 'currentColor' : undefined;
      __props.stroke = strokeIsColor || 'none';
      __props.strokeWidth = strokeIsWidth || '0';
      __props.strokeLinecap = strokeLinecap;
      __props.strokeLinejoin = strokeLinejoin;
      break;
    case 'fill-stroke':
      __props.fill = !fill ? 'currentColor' : undefined;
      __props.stroke = !strokeIsColor ? 'currentColor' : undefined;
      __props.strokeWidth = strokeIsWidth || '2';
      __props.strokeLinecap = strokeLinecap || 'round';
      __props.strokeLinejoin = strokeLinejoin || 'round';
      break;
    case 'none':
      __props.stroke = strokeIsColor;
      __props.strokeWidth = strokeIsWidth;
      __props.strokeLinecap = strokeLinecap;
      __props.strokeLinejoin = strokeLinejoin;
      break;
    default:
      break;
  }

  return __props;
}

export const Svg = React.forwardRef<React.ComponentRef<'svg'>, DetailedSvgProps>((props, ref) => <svg ref={ref} {...svgProps(props)} />);
Svg.displayName = 'Svg';

export default Svg;
