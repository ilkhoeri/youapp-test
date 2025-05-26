const chineseNewYearDates = [
  '1924-02-05',
  '1925-01-24',
  '1926-02-13',
  '1927-02-02',
  '1928-01-23',
  '1929-02-10',
  '1930-01-30',
  '1931-02-17',
  '1932-02-06',
  '1933-01-26',
  '1934-02-14',
  '1935-02-04',
  '1936-01-24',
  '1937-02-11',
  '1938-01-31',
  '1939-02-19',
  '1940-02-08',
  '1941-01-27',
  '1942-02-15',
  '1943-02-05',
  '1944-01-25',
  '1945-02-13',
  '1946-02-02',
  '1947-01-22',
  '1948-02-10',
  '1949-01-29',
  '1950-02-17',
  '1951-02-06',
  '1952-01-27',
  '1953-02-14',
  '1954-02-03',
  '1955-01-24',
  '1956-02-12',
  '1957-01-31',
  '1958-02-18',
  '1959-02-08',
  '1960-01-28',
  '1961-02-15',
  '1962-02-05',
  '1963-01-25',
  '1964-02-13',
  '1965-02-02',
  '1966-01-21',
  '1967-02-09',
  '1968-01-30',
  '1969-02-17',
  '1970-02-06',
  '1971-01-27',
  '1972-02-15',
  '1973-02-03',
  '1974-01-23',
  '1975-02-11',
  '1976-01-31',
  '1977-02-18',
  '1978-02-07',
  '1979-01-28',
  '1980-02-16',
  '1981-02-05',
  '1982-01-25',
  '1983-02-13',
  '1984-02-02',
  '1985-02-20',
  '1986-02-09',
  '1987-01-29',
  '1988-02-17',
  '1989-02-06',
  '1990-01-27',
  '1991-02-15',
  '1992-02-04',
  '1993-01-23',
  '1994-02-10',
  '1995-01-31',
  '1996-02-19',
  '1997-02-07',
  '1998-01-28',
  '1999-02-16',
  '2000-02-05',
  '2001-01-24',
  '2002-02-12',
  '2003-02-01',
  '2004-01-22',
  '2005-02-09',
  '2006-01-29',
  '2007-02-18',
  '2008-02-07',
  '2009-01-26',
  '2010-02-14',
  '2011-02-03',
  '2012-01-23',
  '2013-02-10',
  '2014-01-31',
  '2015-02-19',
  '2016-02-08',
  '2017-01-28',
  '2018-02-16',
  '2019-02-05',
  '2020-01-25',
  '2021-02-12',
  '2022-02-01',
  '2023-01-22',
  '2024-02-10',
  '2025-01-29',
  '2025-01-29',
  '2026-02-17',
  '2027-02-06',
  '2028-01-26',
  '2029-02-13',
  '2030-02-03',
  '2031-01-23',
  '2032-02-11',
  '2033-01-31',
  '2034-02-19',
  '2035-02-08',
  '2036-01-28',
  '2037-02-15',
  '2038-02-04',
  '2039-01-24',
  '2040-02-12',
  '2041-02-01',
  '2042-01-22',
  '2043-02-10'
];

export const ShioAnimals = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'] as const;
export const ShioElements = ['Yang Wood', 'Yin Wood', 'Yang Fire', 'Yin Fire', 'Yang Earth', 'Yin Earth', 'Yang Metal', 'Yin Metal', 'Yang Water', 'Yin Water'] as const;

export type ShioAnimals = (typeof ShioAnimals)[number];
export type ShioElements = (typeof ShioElements)[number];

interface ShioEntry {
  startDate: string;
  endDate: string;
  animal: ShioAnimals;
  element: ShioElements;
}

/**
 * - Tanggal awal siklus: `1924-02-05` - `1925-01-23`
 * - Format tanggal: `YYYY-MM-DD` */
export function generateShioEntries(): ShioEntry[] {
  const result: ShioEntry[] = [];

  for (let i = 0; i < chineseNewYearDates.length - 1; i++) {
    const startDate = chineseNewYearDates[i];
    const endDate = new Date(new Date(chineseNewYearDates[i + 1]).getTime() - 1); // sehari sebelum next startDate

    const animal = ShioAnimals[i % ShioAnimals.length];
    const element = ShioElements[i % ShioElements.length];

    const format = (d: Date) => d.toISOString().split('T')[0];

    result.push({
      startDate,
      endDate: format(endDate),
      animal,
      element
    });
  }

  return result;
}

/** 🐲 */
export function getShioEntry(date: Date | string | undefined | null): ShioEntry | undefined {
  if (!date) return;
  const shioEntries = generateShioEntries();
  const time = new Date(date).getTime();
  for (const entry of shioEntries) {
    const start = new Date(entry.startDate).getTime();
    const end = new Date(entry.endDate).getTime();
    if (time >= start && time <= end) return entry;
  }
  return;

  // return shioEntries.find(({ startDate, endDate }) => target >= startDate && target <= endDate);

  // const time = dateDiff.getTime();
  // return (
  //   shioEntries.find(({ startDate, endDate }) => {
  //     const start = new Date(startDate).getTime();
  //     const end = new Date(endDate).getTime();
  //     return time >= start && time <= end;
  //   })
  // );
}
