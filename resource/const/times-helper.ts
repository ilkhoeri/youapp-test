// You can move the helper below into a separate file (eg: times-helper.ts) to support server-side use.

const DEFAULT_LOCALES: Intl.LocalesArgument = 'id-ID';

interface GetTimeOptions extends Intl.DateTimeFormatOptions {
  locales?: Intl.LocalesArgument;
}
export function getTime(date: Date | string, opts: GetTimeOptions = {}) {
  const { locales = DEFAULT_LOCALES, day = '2-digit', year = 'numeric', month = 'long' } = opts;
  return new Date(date).toLocaleString(locales, {
    day,
    year,
    month
  });
}

export interface TimeAgoFormat {
  diff?: 'days' | 'short' | 'long' | 'growth';
  locales?: Intl.LocalesArgument;
  formatGrowth?: Intl.DateTimeFormatOptions;
}
export const getTimeAgo = (date: Date, format: TimeAgoFormat = {}): string => {
  const { diff = 'short', locales = DEFAULT_LOCALES, formatGrowth = {} } = format;
  const { hour12 = false, minute = '2-digit', hour = '2-digit', day = '2-digit', month = 'short', year = 'numeric', ...opt } = formatGrowth;
  const now = new Date();
  const newdiff = date.getTime() - now.getTime();
  const isFuture = newdiff > 0;

  const seconds = Math.abs(Math.floor(newdiff / 1000));
  const minutes = Math.abs(Math.floor(seconds / 60));
  const hours = Math.abs(Math.floor(minutes / 60));
  const days = Math.abs(Math.floor(hours / 24));
  const months = Math.abs(Math.floor(days / 30));
  const years = Math.abs(Math.floor(days / 365));

  function formatFuture(times: string): string {
    return isFuture ? `In ${times}` : `${times} ago`;
  }

  function formatTime(value: number, unit: string): string {
    const format = `${value} ${unit}${value > 1 ? 's' : ''}`;
    return formatFuture(format);
  }

  function formatRemaining(years?: number, months?: number, days?: number) {
    const formatDays = `${days ? `, ${days} days` : ''}`;
    const format = years !== undefined ? `${years} years${months ? `, ${months} months` : ''}${formatDays}` : `${months} months${formatDays}`;
    return formatFuture(format);
  }

  function constructorTime() {
    if (days > 0) return formatTime(days, 'day');
    if (hours > 0) return formatTime(hours, 'hour');
    if (minutes > 0) return formatTime(minutes, 'minute');
    return isFuture ? 'In a few seconds' : 'Just now';
  }

  date.setHours(date.getHours());
  const formatted = date
    .toLocaleDateString(locales, {
      hour12,
      minute,
      hour,
      day,
      month,
      year,
      ...opt
    })
    .replace('.', ':');

  switch (diff) {
    case 'days':
      return constructorTime();

    case 'short':
      const day = date.getDate().toString().padStart(2, '0');
      const month = date.toLocaleString(locales, { month: 'short' });
      const year = date.getFullYear().toString().slice(-2);
      const format = `${day} ${month} ${year}`;
      return isFuture ? `On ${format}` : format;

    case 'long':
      if (years > 0) {
        const remainingMonths = Math.floor((days % 365) / 30);
        const remainingDays = (days % 365) % 30;
        return formatRemaining(years, remainingMonths, remainingDays);
      } else if (months > 0) {
        const remainingDays = days % 30;
        return formatRemaining(undefined, months, remainingDays);
      }
      return constructorTime();

    case 'growth':
      if (days < 1) {
        if (hours > 0) return `${hours} hours ago`;
        if (minutes > 0) return `${minutes} minutes ago`;
        return 'Just now';
      }
      return isFuture ? `On ${formatted}` : formatted;
  }
};

export function isSameDate(date1?: Date | string, date2?: Date | string) {
  if (!date1 || !date2) return;
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
}

export const getTimeInterval = (date1: Date, date2: Date): string => {
  const diff = Math.abs(date1.getTime() - date2.getTime());
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} days`;
  } else if (hours > 0) {
    return `${hours} hours`;
  } else if (minutes > 0) {
    return `${minutes} minutes`;
  } else {
    return `${seconds} seconds`;
  }
};

/**
 * Convert to 12-hour format (ubah 0 jadi 12)
 * @param date Date
 * @returns example: "10:45 AM"
 */
export function formatShortTime(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();

  const isAM = hours < 12;
  const hour12 = hours % 12 || 12;
  const paddedMinutes = minutes.toString().padStart(2, '0');
  const suffix = isAM ? 'AM' : 'PM';

  return `${hour12}:${paddedMinutes} ${suffix}`;
}

export function formatShortTimeIntl(date: Date, locale = 'en-US'): string {
  return new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(date);
}

/**
 * @example
 * formatPrettyDate('2024-01-20', 'en-US'); // "Jan 20, 2024"
 * formatPrettyDate('2024-01-20', 'id-ID'); // "20 Jan 2024"
 * formatPrettyDate('2024-01-20', 'fr-FR'); // "20 janv. 2024"
 * formatPrettyDate('2024-01-20', 'ja-JP'); // "2024年1月20日"
 * @param date Date | string
 * @param locale string (default: `en-US`)
 * @returns string
 */
export function formatPrettyDate(date: Date | string, locale: string = 'en-US'): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(d);
}
