export function cleanNulls<T>(obj: T): T {
  if (obj === null) return undefined as any;

  if (typeof obj !== 'object' || obj instanceof Date) return obj; // Preserve Date

  if (Array.isArray(obj)) {
    return obj.map(item => cleanNulls(item)) as any;
  }

  if (typeof obj === 'object' && obj !== undefined) {
    const result: any = {};
    for (const key in obj) {
      const value = (obj as any)[key];
      result[key] = value === null ? undefined : cleanNulls(value);
    }
    return result;
  }

  return obj;
}

function setNestedValue<T, V>(obj: T, path: string[], value: V) {
  let current = obj;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    if (!(key in (current as any)) || typeof (current as any)[key] !== 'object' || (current as any)[key] === null) {
      (current as any)[key] = {};
    }
    current = (current as any)[key];
  }

  const finalKey = path[path.length - 1];
  (current as any)[finalKey] = value instanceof Date ? new Date(value) : value;
}

function getNestedValue(obj: any, path: string[]): any {
  return path.reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
}

type FieldGroups<T> = {
  string?: Paths<T>[];
  number?: Paths<T>[];
  date?: Paths<T>[];
  array?: Paths<T>[];
  object?: Paths<T>[];
  undefined?: Paths<T>[];
  enum?: Partial<{ [K in keyof T]: T[K] }>;
};

export function initialValues<T>(data: T | null | undefined, fields: FieldGroups<DeepNonNullables<T>>) {
  const result: Partial<T> = {};

  const cleanedData = cleanNulls(data ?? {});

  function processField<F>(keyPath: string, fallback: F) {
    const path = keyPath.split('.');
    const existingValue = getNestedValue(cleanedData, path);
    setNestedValue(result, path, existingValue ?? (fallback as F));
  }

  fields.string?.forEach(path => processField(path as string, ''));
  fields.number?.forEach(path => processField(path as string, 0));
  fields.date?.forEach(path => processField(path as string, new Date()));
  fields.undefined?.forEach(path => processField(path as string, undefined));
  fields.array?.forEach(path => processField(path as string, []));
  fields.object?.forEach(path => processField(path as string, {}));

  if (fields.enum) {
    for (const keyPath in fields.enum) {
      const fallback = (fields.enum as any)[keyPath];
      const path = keyPath.split('.');
      const existingValue = getNestedValue(cleanedData, path);
      setNestedValue(result, path, existingValue ?? fallback ?? undefined);
    }
  }

  return result as DeepNonNullables<T>;
}
