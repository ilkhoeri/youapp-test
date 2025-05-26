export function assetSrc(src?: string | null | undefined, defaultSrc: 'logo' | 'avatar' | (string & {}) = 'logo'): string {
  const webUrl: string = process.env.NODE_ENV !== 'production' ? '' : (process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? '');

  let defaultPath: string = defaultSrc || '',
    path: string = src || defaultPath;

  if (defaultSrc === 'logo') {
    defaultPath = '/icons/assets-logo.png';
  } else if (defaultSrc === 'avatar') {
    defaultPath = '/images/pict-user2.png';
  }

  if (path.startsWith('https://') || path.startsWith('http://')) {
    path = path;
  } else if (path.startsWith('/public')) {
    path = webUrl + path.replace(/^\/public/, '/');
  } else if (!path.startsWith('/')) {
    path = webUrl + '/' + path;
  }

  return path;
}

export const assetUrl = assetSrc;
