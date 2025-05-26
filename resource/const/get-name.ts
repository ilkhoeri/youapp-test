export function getDispaly(name: string) {
  const naming = (i: string, r?: string) => (i.startsWith('@') ? i.slice(1) : r ? r : i);
  return {
    refId() {
      return `@${name}`;
    },
    name() {
      return naming(name);
    }
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
  firstName = getDispaly(firstName).name();
  lastName = lastName && getDispaly(lastName).name();
  return [firstName, lastName] as const;
}
