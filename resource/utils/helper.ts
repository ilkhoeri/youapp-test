import { transform } from './text-parser';

export function formatTime(time: Date) {
  return time.toLocaleString('id-ID', {
    day: '2-digit',
    year: 'numeric',
    month: 'short'
  });
}

export function formatDateToInputX(date: Date) {
  return date.toString().slice(0, 16); // conversion to "YYYY-MM-DDTHH:MM"
}

export function formatDateToInput(date: Date): string {
  const pad = (n: number) => (n < 10 ? `0${n}` : n);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export const price = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR'
});

export function capitalizeString(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function camelToKebab(n: string): string {
  if (n === undefined) {
    return '';
  }
  return n.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

export function capitalizeWords(str: string | undefined): string {
  const string = str ?? '---';
  const words = string.split('-');
  const capitalizedWords = words.map(word => capitalizeString(word));
  return capitalizedWords.join(' ');
}

export function remakeName(str: string) {
  str = camelToKebab(str);
  str = transform.uppercaseFirst(str);
  str = str.replace(/-/g, ' ');
  return str;
}
