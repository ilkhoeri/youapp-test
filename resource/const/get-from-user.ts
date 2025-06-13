import { MinimalAccount } from '../types/user';

type SecureUserProps = Partial<MinimalAccount>;

type Options = { message?: string };

/**
 * @example
 * // ✅ via static
 * const utils = UserHelper.from(user);
 * utils.username(); // → "@ilkhoeri"
 * utils.name();     // → "Ilham"
 * utils.refId();    // → "USR123"
 * // ✅ via class
 * const helper = new UserHelper();
 * helper.username(name); // → "@ilkhoeri"
 */
export class SecureUser {
  private user: SecureUserProps;

  constructor(user?: SecureUserProps) {
    this.user = user ?? {};
  }

  private resolveName(key: keyof MinimalAccount, name?: string | null, message = 'Must contain user or name arg'): string {
    const userValue = this.user?.[key];
    if (name) return name;
    if (userValue) return String(userValue);
    throw new Error(message);
  }

  private normalizeName(input: string, fallback?: string): string {
    return input.startsWith('@') ? input.slice(1) : (fallback ?? input);
  }

  public username(name?: string, opts: Options = {}) {
    const resolve = this.resolveName('username', name, opts.message);
    return `@${resolve}`;
  }

  public name(name?: string, opts: Options = {}) {
    const resolve = this.resolveName('name', name, opts.message);
    return this.normalizeName(resolve);
  }

  public refId(opts: Options = {}) {
    const { message = 'user arg is required' } = opts;
    const refId = this.user?.refId;
    if (!refId) throw new Error(message);
    return refId;
  }

  // 🔁 Static shortcut for backward compatibility
  static from(user: SecureUserProps = {}) {
    const instance = new SecureUser(user);
    return {
      username: (name?: string, opts?: Options) => instance.username(name, opts),
      name: (name?: string, opts?: Options) => instance.name(name, opts),
      refId: (opts?: Options) => instance.refId(opts)
    };
  }
}

export function getFromUser(user: SecureUserProps = {}) {
  const instance = new SecureUser(user);
  return {
    username: (name?: string, opts?: Options) => instance.username(name, opts),
    name: (name?: string, opts?: Options) => instance.name(name, opts),
    refId: (opts?: Options) => instance.refId(opts)
  };
}

export function getNameParts(name: string) {
  const nameParts = name.trim().split(/\s+/);
  let firstName: string = name,
    lastName: string | undefined = undefined;
  if (nameParts.length > 1) {
    lastName = nameParts.pop();
    firstName = nameParts.join(' ');
  }
  firstName = getFromUser().name(firstName);
  lastName = lastName && getFromUser().name(lastName);
  return [firstName, lastName] as const;
}
