
import { twMerge } from 'tailwind-merge';
import { cnx, cnxValues } from 'xuxi';

export function cn(...i: cnxValues[]) {
  return twMerge(cnx(...i));
}