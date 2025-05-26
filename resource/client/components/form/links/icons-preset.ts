'use client';
import * as React from 'react';
import * as Icon from '../../icons-brands';

export type IconPresetType =
  | 'apple'
  | 'facebook'
  | 'x'
  | 'github'
  | 'dribbble'
  | 'youtube'
  | 'blogspot'
  | 'threads'
  | 'instagram'
  | 'tiktok'
  | 'linktr'
  | 'linktree'
  | 'linkedin'
  | 'twitter'
  | 'discord'
  | 'myspace'
  | 'medium'
  | 'steampowered'
  | 'slack'
  | 'pinterest'
  | 'skype'
  | 'tumblr'
  | 'wix'
  | 'xbox'
  | 'yahoo'
  | 'disney'
  | 'google'
  | 'shopee'
  | 'netflix'
  | 'evernote'
  | 'telegram'
  | 'whatsapp'
  | 'snapchat'
  | 'tripadvisor'
  | '';

const IconBase = Icon.GlobeSearchIcon;

export type IconProps = typeof IconBase;

export type IconPreset = IconPresetType | (string & {}) | undefined | null;

export function iconsPreset(preset: IconPreset): IconProps {
  const presetMap: Record<IconPresetType, IconProps> = {
    apple: Icon.BrandAppleIcon,
    blogspot: IconBase,
    discord: IconBase,
    disney: IconBase,
    dribbble: IconBase,
    evernote: IconBase,
    facebook: IconBase,
    google: IconBase,
    github: IconBase,
    instagram: IconBase,
    linkedin: IconBase,
    linktr: IconBase,
    linktree: IconBase,
    myspace: IconBase,
    medium: IconBase,
    netflix: IconBase,
    pinterest: IconBase,
    skype: IconBase,
    snapchat: IconBase,
    slack: IconBase,
    shopee: IconBase,
    steampowered: IconBase,
    tripadvisor: IconBase,
    telegram: IconBase,
    threads: IconBase,
    tiktok: IconBase,
    tumblr: IconBase,
    twitter: IconBase,
    whatsapp: IconBase,
    wix: IconBase,
    x: IconBase,
    xbox: IconBase,
    yahoo: IconBase,
    youtube: IconBase,
    '': IconBase
  };

  const presetKey = Object.keys(presetMap);

  if (!preset || !presetKey.includes(preset)) return IconBase;

  return presetMap[preset as IconPresetType];
}

type FieldValues = {
  [x: string]: any;
};

interface UseNameFromURL {
  siteUrl: string | undefined;
}

export function useNameFromURL(props: UseNameFromURL) {
  const { siteUrl } = props;

  const [Icon, setIcon] = React.useState<IconProps>(() => IconBase);
  const [siteName, setSiteName] = React.useState<string>('');

  React.useEffect(() => {
    if (siteUrl) {
      try {
        const newUrl = new URL(siteUrl?.startsWith('http') ? siteUrl : `https://${siteUrl}`);
        const domainParts = newUrl.hostname.split('.');
        const isSubdomain = domainParts.length > 2;

        // Ambil hanya domain utama (tanpa subdomain & tanpa LTD)
        const siteName = isSubdomain ? domainParts[domainParts.length - 2] : domainParts[0];

        setSiteName(siteName);
        // setValue('name', siteName);

        // Set icon berdasarkan siteName
        setIcon(() => iconsPreset(siteName));
      } catch (error) {
        console.error('Invalid URL');
        setSiteName('');
        setIcon(() => IconBase);
      }
    }
  }, [siteUrl, setSiteName]);

  return { Icon, siteUrl, siteName };
}
