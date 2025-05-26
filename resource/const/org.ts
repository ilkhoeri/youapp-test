import { assetSrc } from './src';

interface Fallback {
  logo: 'full' | 'square' | (string & {});
}
interface Org {
  /** @default `YouApp` */
  name(): string;
  /** @default `https://youapp.ai` */
  url(fallback?: string): string;
  /** @default `full` */
  logo(fallback?: Fallback['logo']): string;
}
export function org(): Org {
  return {
    name() {
      return 'YouApp';
    },
    url(fallback = 'https://youapp.ai') {
      return fallback;
      // process.env.NEXT_PUBLIC_FRONTEND_URL as string
    },
    logo(fallback = 'square') {
      if (fallback === 'full') return assetSrc('/icons/logo-full.svg', 'logo');
      if (fallback === 'square') return assetSrc('/icons/small-assets-logo.png', 'logo');
      return assetSrc(fallback, 'logo');
      // https://youapp.ai/static/images/youapp-full-purple-light.svg
    }
  };
}
