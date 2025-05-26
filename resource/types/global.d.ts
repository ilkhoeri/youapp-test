type RequiredKeys<T> = T extends string ? T | `${T}.required` : never;

/** Parses a key string like `'field-required'` into { key: 'field', required: true } */
type SplitKey<K> = K extends `${infer Key}.required` ? { key: Key; required: true } : { key: K; required: false };

/**
 * Used to decrease depth level in recursive type `Paths<T, D>`.
 * Extend this array to allow deeper nesting.
 */
type Prev = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];

type Prefix<T> = [T] extends [never] ? '' : T;

/** To match numeric string paths (such as '0', '1', etc.) in an array. */
type ArrayKey = `${number}`;

declare global {
  type nullable = null | undefined;
  type falsy = false | 0 | '' | null | undefined | (number & { __falsyNaN__: void });
  type Booleanish = boolean | 'true' | 'false';
  type Direction = 'ltr' | 'rtl';

  type IgnoringSuffix<T> = Date | string[] | number[] | Array<T>;

  type DeepValueType<T, P extends string> = P extends `${infer K}.${infer Rest}` ? (K extends keyof T ? DeepValueType<T[K], Rest> : never) : P extends keyof T ? T[P] : never;

  /** Extracts keys from `K` that should be optional or required based on suffix. */
  type ExtractParsedKey<T, K extends string, IsRequired extends boolean> = {
    [P in K]: SplitKey<P> extends infer R ? (R extends { key: infer K2; required: infer R2 } ? (K2 extends keyof T ? (R2 extends IsRequired ? K2 : never) : never) : never) : never;
  }[K];

  /** Builds union of key names parsed from `K` (ignoring suffix). */
  type ParsedKeyUnion<K extends string> = {
    [P in K]: SplitKey<P>['key'];
  }[K];
  /**
   * Joins two string keys `K` and `P` with a dot for key paths.
   * Example: Join<'a', 'b'> = 'a.b'
   */
  type Join<K, P> = K extends string | number ? (P extends string | number ? `${K}.${P}` : never) : never;
  /**
   * The instruction passed to a {@link Dispatch} function in {@link useState}
   * to tell React what the next value of the {@link useState} should be.
   *
   * Often found wrapped in {@link Dispatch}.
   *
   * @template S The type of the state.
   *
   * @example
   *
   * ```tsx
   * // This return type correctly represents the type of
   * // `setCount` in the example below.
   * const useCustomState = (): Dispatch<SetStateAction<number>> => {
   *   const [count, setCount] = React.useState(0);
   *
   *   return setCount;
   * }
   * ```
   */
  type SetStateAction<S> = S | ((prevState: S) => S);
  /**
   * A utility type that infers the return type of a given function type.
   *
   * @template T - The input type, which should ideally be a function.
   * @returns The inferred return type of the function if `T` is a function type; otherwise, `never`.
   *
   * @example
   * const MyFunction = () => '';
   * type Result = inferType<typeof MyFunction>; // Result will be `string`.
   *
   * @example
   * type NotAFunction = string | number;
   * type Result = inferType<NotAFunction>; // Result will be `never`.
   */
  type InferType<T> = T extends (...args: any[]) => infer R ? R : never;

  /**
   * Recursively generates dot-separated key paths from a nested object `T`.
   * Stops recursion at arrays.
   *
   * Example:
   * ```ts
   * type Example = { a: { b: { c: number }, d: string[] } };
   * type Paths = DeepPaths<Example>; // "a" | "a.b" | "a.b.c" | "a.d"
   * ```
   */
  type DeepPaths<T, P extends string = '', K1 extends never | true = true> = {
    [K in keyof T & string]: T[K] extends object
      ? T[K] extends Array<T>
        ? `${Prefix<P>}${K}` // Stop recursion on arrays
        : (K1 extends true ? `${Prefix<P>}${K}` : never) | `${Prefix<P>}${K}.${DeepPaths<T[K], '', K1>}`
      : `${Prefix<P>}${K}`;
  }[keyof T & string];

  /**
   * Recursively generates dot-separated key paths from a nested object `T`,
   * up to a specified maximum depth `D` (default: 4).
   *
   * Example:
   * ```ts
   * type Example = { a: { b: { c: number }, d: string[] } };
   * type Paths = Paths<Example, 2>; // "a" | "a.b" | "a.d"
   * ```
   */
  type Paths<T, D extends number = 4> = [D] extends [never]
    ? never
    : T extends object
      ? {
          [K in keyof T & string]: T[K] extends IgnoringSuffix<T[K]> ? K : T[K] extends object ? K | Join<K, Paths<T[K], Prev[D]>> : K;
        }[keyof T & string]
      : never;

  /** Merges intersected types into a single flat object type. @merges `{a} & {b}` to `{a, b}` */
  type Merge<T> = { [K in keyof T]: T[K] };

  /**
   * Transforms the properties of an object type `T` into nullable types, with fine-grained control over which keys become optional.
   *
   * @template T The base type to transform. Can be an object or a primitive.
   * @template K Keys of `T` to make optional + nullable, or suffixed with `.required` to make them required + nullable.
   *             - If omitted (`never`), all keys become optional + nullable.
   *             - Example: `'name' | 'age.required'`
   * @template N The `nullable` type to apply. Defaults to `null`.
   *
   * @example
   * type User = {
   *   id: string;
   *   name: string;
   *   age: number;
   * };
   *
   * // All keys optional + nullable (default behavior)
   * type A = Nullable<User>;
   * // Result: { id?: string | null; name?: string | null; age?: number | null; }
   *
   * // Specific keys control: 'id' optional + nullable, 'name' required + nullable
   * type B = Nullable<User, 'id' | 'name.required', null | undefined>;
   * // Result: { id?: string | null | undefined; name: string | null | undefined; age: number; }
   *
   * // Applied to primitive type (e.g., string)
   * type C = Nullable<string>;
   * // Result: string | null
   */
  type Nullable<T, K extends RequiredKeys<keyof T> | void = never, N extends nullable = null> = T extends object
    ? [K] extends [never]
      ? { [P in keyof T]?: T[P] | N }
      : [K] extends [void]
        ? { [P in keyof T]: T[P] | N }
        : Merge<
            {
              [P in ExtractParsedKey<T, K, true>]: T[P] | N;
            } & {
              [P in ExtractParsedKey<T, K, false>]?: T[P] | N;
            } & {
              [P in Exclude<keyof T, ParsedKeyUnion<K>>]: T[P];
            }
          >
    : T | N;

  /** Extended construct a type with the properties of T except for those in type K. */
  type Except<T, K extends keyof T> = { [P in Exclude<keyof T, K>]: T[P] };

  type NonNullables<T> = {
    [K in keyof Required<T>]: NonNullable<T[K]>;
  };
  // clarity
  type DeepNonNullables<T, N = never> = T extends object
    ? T extends Function
      ? NonNullable<T> | N
      : T extends Date
        ? NonNullable<T> | N
        : T extends Array<T>
          ? NonNullable<T> | N
          : {
              [K in keyof Required<T>]: DeepNonNullables<T[K], N>;
            }
    : NonNullable<T> | N;

  type KeysConstructor<U extends [string, unknown]> = {
    [K in U as K[0]]: `${K[0]}-${Extract<keyof K[1], string>}`;
  }[U[0]];

  /**
   * Returns a union of all possible path keys as a string.
   * @example
   * type UserPaths = PathKeys<UserData>
   * // 'about.birthPlace' | 'about.address.street.name' | 'posts.0.title' | ...
   */
  type PathKeys<T> = T extends object
    ? {
        [K in keyof T & (string | number)]: T[K] extends ReadonlyArray<infer V> ? `${K}` | Join<K, PathKeys<V>> : T[K] extends object ? `${K}` | Join<K, PathKeys<T[K]>> : `${K}`;
      }[keyof T & (string | number)]
    : never;

  /**
   * Gets the value type based on a path string, supports deep keys (e.g. `'about.birthPlace'`, `'posts.0.tags.1'`, etc.)
   * @example
   * type BirthDayValue = PathValue<UserData, 'about.birthDay'>; // string | undefined
   */
  type PathValue<T, P extends string> = T extends any
    ? P extends `${infer K}.${infer R}`
      ? K extends keyof T
        ? PathValue<NonNullable<T[K]>, R>
        : K extends ArrayKey
          ? T extends ReadonlyArray<infer V>
            ? PathValue<NonNullable<V>, R>
            : never
          : never
      : P extends keyof T
        ? T[P]
        : P extends ArrayKey
          ? T extends ReadonlyArray<infer V>
            ? V
            : never
          : never
    : never;
}

export {}; // <- Wajib, agar TypeScript treat ini sebagai modul dan apply declare global

/*
type DeepNonNullables<T, N = never> =
  T extends (...args: any[]) => any
    ? T // fungsi tidak diproses
    : T extends Array<infer U>
      ? Array<DeepNonNullables<U, N>> // array diproses elementnya
      : T extends object
        ? {
            [K in keyof Required<T>]: DeepNonNullables<T[K], N>;
          }
        : NonNullable<T> | N;

*/

/*
type Join<K, P> = K extends string ? (P extends string ? `${K}.${P}` : never) : never;

type Paths<T, D extends number = 4> = [D] extends [never]
  ? never
  : T extends object
    ? {
        [K in keyof T & string]: T[K] extends object ? K | Join<K, Paths<T[K], Prev[D]>> : K;
      }[keyof T & string]
    : never;

type Prev = [never, 0, 1, 2, 3, 4, 5];

type Split<S extends string, Delimiter extends string = '.'> = S extends `${infer Head}${Delimiter}${infer Tail}` ? [Head, ...Split<Tail, Delimiter>] : [S];

type Head<T extends string[]> = T extends [infer H, ...any[]] ? H : never;
type Tail<T extends string[]> = T extends [any, ...infer R] ? R : never;

type PathStartsWith<PathA extends string[], PathB extends string[]> = PathA extends [infer H1, ...infer R1]
  ? PathB extends [infer H2, ...infer R2]
    ? H1 extends H2
      ? PathStartsWith<R1 & string[], R2 & string[]>
      : false
    : true
  : true;

type ParsePath<K extends string> = K extends `${infer P}-required` ? { path: P; required: true } : { path: K; required: false };

type MatchPath<KPaths extends string, Path extends string> = KPaths extends any
  ? ParsePath<KPaths> extends infer P
    ? P extends { path: infer PP; required: infer R }
      ? PP extends Path
        ? { matched: true; required: R }
        : never
      : never
    : never
  : never;

type IsMatch<KPaths extends string, Path extends string> =
  MatchPath<KPaths, Path> extends infer M ? (M extends { matched: true; required: boolean } ? M : { matched: false }) : { matched: false };

type AppendPath<P1 extends string, P2 extends string> = P1 extends '' ? P2 : `${P1}.${P2}`;

type NullableDeepApply<T, KPaths extends string, O, CurrPath extends string = ''> = T extends Function
  ? T
  : T extends Array<infer U>
    ? Array<NullableDeepApply<U, KPaths, O, CurrPath>> | O
    : T extends object
      ? {
          [P in keyof T]-?: NullableDeepProperty<T[P], P & string, KPaths, O, CurrPath>;
        }
      : MatchPath<KPaths, CurrPath> extends { matched: true }
        ? T | O
        : T;

type NullableDeepProperty<V, K extends string, KPaths extends string, O, CurrPath extends string> =
  AppendPath<CurrPath, K> extends infer NewPath extends string
    ? MatchPath<KPaths, NewPath> extends { matched: true; required: infer R }
      ? R extends true
        ? NullableDeepApply<V, KPaths, O, NewPath> | O
        : NullableDeepApply<V, KPaths, O, NewPath> | O | undefined
      : // Jika tidak match full path, tapi nested child match → tetap lanjut recurse
        KHasNestedMatch<KPaths, NewPath> extends true
        ? NullableDeepApply<V, KPaths, O, NewPath>
        : V
    : never;

type KHasNestedMatch<KPaths extends string, CurrPath extends string> = KPaths extends any
  ? Split<KPaths> extends infer KP extends string[]
    ? Split<CurrPath> extends infer CP extends string[]
      ? PathStartsWith<KP, CP> extends true
        ? true
        : false
      : false
    : false
  : false;

export type NullableDeep<T, K extends Paths<T> | `${Paths<T>}-required` = never, O = null> = Merge<NullableDeepApply<T, K, O>>;
*/

/*
  type NullableOptional<T, K extends keyof T = never, O = null> = [K] extends [never]
    ? { [P in keyof T]?: T[P] | O }
    : {
        [P in Exclude<keyof T, K>]: T[P];
      } & {
        [P in K]?: T[P] | O;
      };

//
type Keys<T> = T extends string ? `${T}.required` : never;

type Nullable<T, K extends keyof T = never, O = null> = T extends object
  ? [K] extends [never]
    ? { [P in keyof T]?: T[P] | O }
    : {
        [P in Exclude<keyof T, K>]: T[P];
      } & {
        [P in K & keyof T]?: T[P] | O;
      }
  : T | O;

//


export type Nullable<T, K extends keyof T | void = void, N extends nullable = null, M extends 'required' | 'nullable' = 'nullable'> = T extends object
  ? [K] extends [never]
    ? { [P in keyof T]?: T[P] | N }
    : [K] extends [void]
      ? { [P in keyof T]: T[P] | N }
      : {
          [P in Exclude<keyof T, K>]: T[P];
        } & ([M] extends ['required']
          ? {
              [P in K & keyof T]: T[P] | N;
            }
          : {
              [P in K & keyof T]?: T[P] | N;
            })
  : T | N;
*/
