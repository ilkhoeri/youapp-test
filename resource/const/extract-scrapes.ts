import * as cheerio from 'cheerio';

export interface DataScrape {
  title?: string;
  description?: string;
  sub?: Array<DataScrape>;
}

export interface ScrapeSelector {
  /** main selector (required) */
  container: string;
  /** title selector (optional) */
  title?: string;
  /** description selector (opstional) */
  description?: string;
  /** nested child selectors */
  children?: Array<ScrapeSelector>;
}

export function extractScrapes($: cheerio.CheerioAPI, config: ScrapeSelector): DataScrape[] {
  const items: DataScrape[] = [];

  $(config.container).each((_, el) => {
    const $el = $(el);
    const title = config.title ? $el.find(config.title).first().text().trim() : undefined;
    const description = config.description ? $el.find(config.description).first().text().trim() : undefined;

    let sub: DataScrape[] | undefined;

    if (config.children && config.children.length > 0) {
      sub = config.children.flatMap(
        child => extractScrapes(cheerio.load($.html(el)), child) // use scoped cheerio
      );
    }

    items.push({ title, description, sub });
  });

  return items;
}
