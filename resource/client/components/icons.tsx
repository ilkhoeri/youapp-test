import { Horoscope } from '@/resource/const/horoscope';
import { Svg, type SvgProps } from './ui/svg';
import { ShioAnimals } from '@/resource/const/shio';

export function UsersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export function SettingsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export function Spinner() {
  return (
    <div className="absolute right-0 top-0 bottom-0 flex items-center justify-center">
      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    </div>
  );
}

export function Logo() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-gray-100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" rx="16" fill="currentColor" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17.6482 10.1305L15.8785 7.02583L7.02979 22.5499H10.5278L17.6482 10.1305ZM19.8798 14.0457L18.11 17.1983L19.394 19.4511H16.8453L15.1056 22.5499H24.7272L19.8798 14.0457Z"
        fill="black"
      />
    </svg>
  );
}

export function VercelLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} aria-label="Vercel logomark" height="64" role="img" viewBox="0 0 74 64">
      <path d="M37.5896 0.25L74.5396 64.25H0.639648L37.5896 0.25Z" fill="currentColor"></path>
    </svg>
  );
}

export function MonitorSmartphoneIcon(props: SvgProps) {
  return (
    <Svg {...props}>
      <path d="M18 8V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h8" />
      <path d="M10 19v-3.96 3.15" />
      <path d="M7 19h5" />
      <rect width="6" height="10" x="16" y="12" rx="2" />
    </Svg>
  );
}

export function MoonStarIcon(props: SvgProps) {
  return (
    <Svg {...props}>
      <path d="m5.15,5.3v-3.3m-1.65,1.65h3.3" />
      <path d="m3.65,14.5v-3.3m-1.65,1.65h3.3" />
      <path d="m9.67,10.18v-3.3m-1.65,1.65h3.3" />
      <path d="m14.23,15.27c.36-.03.68.25.71.61s-.25.68-.61.71-.68-.25-.71-.61m2.47-5.14c.62-.38,1.44-.19,1.82.44.38.63.19,1.44-.44,1.82-.62.38-1.44.19-1.82-.44m1.85-7.45c-1.03-.6-2.14-.96-3.25-1.12,2.19,2.81,2.59,6.76.7,10.03-1.89,3.27-5.52,4.9-9.04,4.41.69.89,1.56,1.66,2.59,2.26,4.3,2.49,9.81,1.01,12.29-3.29,2.49-4.3,1.01-9.81-3.29-12.29Zm-.62,6.76h0" />
    </Svg>
  );
}

export function SunIcon(props: SvgProps) {
  return (
    <Svg {...props}>
      <path d="M14.828 14.828a4 4 0 1 0 -5.656 -5.656a4 4 0 0 0 5.656 5.656z" />
      <g data-g="high">
        <path d="M4 12h-3" />
        <path d="M12 4v-3" />
        <path d="M20 12h3" />
        <path d="M12 20v3" />
      </g>
      <g data-g="low">
        <path d="M6.343 17.657l-1.414 1.414" />
        <path d="M6.343 6.343l-1.414 -1.414" />
        <path d="M17.657 6.343l1.414 -1.414" />
        <path d="M17.657 17.657l1.414 1.414" />
      </g>
    </Svg>
  );
}

const horoscopeMap: Record<Horoscope, string[]> = {
  Aquarius: ['m3 10l3-3l3 3l3-3l3 3l3-3l3 3M3 17l3-3l3 3l3-3l3 3l3-3l3 3'],
  Aries: ['M12 5a5 5 0 1 0-4 8m8 0a5 5 0 1 0-4-8m0 16V5'],
  Cancer: ['M3 12a3 3 0 1 0 6 0a3 3 0 1 0-6 0m12 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0', 'M3 12a10 6.5 0 0 1 14-6.5m4 6.5a10 6.5 0 0 1-14 6.5'],
  Capricorn: ['M4 4a3 3 0 0 1 3 3v9m0-9a3 3 0 0 1 6 0v11a3 3 0 0 1-3 3m3-4a3 3 0 1 0 6 0a3 3 0 1 0-6 0'],
  Gemini: ['M3 3a21 21 0 0 0 18 0M3 21a21 21 0 0 1 18 0M7 4.5v15m10-15v15'],
  Leo: ['M13 17a4 4 0 1 0 8 0M3 16a3 3 0 1 0 6 0a3 3 0 1 0-6 0m4-9a4 4 0 1 0 8 0a4 4 0 1 0-8 0', 'M7 7c0 3 2 5 2 9m6-9c0 4-2 6-2 10'],
  Libra: ['M5 20h14M5 17h5v-.3a7 7 0 1 1 4 0v.3h5'],
  Pisces: ['M5 3a21 21 0 0 1 0 18M19 3a21 21 0 0 0 0 18M5 12h14'],
  Sagittarius: ['M4 20L20 4m-7 0h7v7M6.5 12.5l5 5'],
  Scorpio: ['M3 4a2 2 0 0 1 2 2v9m0-9a2 2 0 0 1 4 0v9m0-9a2 2 0 0 1 4 0v10a3 3 0 0 0 3 3h5l-3-3m0 6l3-3'],
  Taurus: ['M6 3a6 6 0 0 0 12 0', 'M6 15a6 6 0 1 0 12 0a6 6 0 1 0-12 0'],
  Virgo: ['M3 4a2 2 0 0 1 2 2v9m0-9a2 2 0 0 1 4 0v9m0-9a2 2 0 0 1 4 0v10a7 5 0 0 0 7 5', 'M12 21a7 5 0 0 0 7-5v-2a3 3 0 0 0-6 0']
};

export function HoroscopeIcon({ horoscope, ...props }: SvgProps<{ horoscope: Horoscope }>) {
  return (
    <Svg {...props} stroke={1.75}>
      {horoscopeMap[horoscope].map((path, key) => (
        <path key={key} d={path} />
      ))}
    </Svg>
  );
}

const shioMap: Record<ShioAnimals, string[]> = {
  Rat: ['M19 35H4c0-8 5-18 10-18l2 9m12 9c0-5 2-8.01 9-8', 'M44 28.537C45 33.511 42 35 40 34s-1.5-6-3-10c-3.14-8.375-15-10-22-3'],
  Ox: ['m38 31l6 6M5 44V18C5 13 7 8 16 6l14-2', 'M19 20c1.5 1.5 3.5 5 9 5c3.167 0 10 1.5 10 8v11M16 6c6 0 9 3 9 10', 'M30 44a8 8 0 1 0-16 0'],
  Tiger: [
    'M6 44V15c0-1.5 1-5.2 5-8L8.5 4c1.667 0 5.6.6 8 3c4.167-.333 13.5 2 10 8c-.89 1.335-2.5 2-5.5 2',
    'M19 24c4 0 12 5 12 14c0 2 1 4.883 5.134 4.401C39 42.067 41.627 40.052 43 35.877',
    'M17 44c0-4 2-9 10-9h3'
  ],
  Rabbit: [
    'm6,44v-20c.17-1.67,1.2-6.8,6-10l-4-4c-2-2.45-.5-8,5-6,2,1,3,2.5,4.5,4l6.5,7c.67,1,2.5,2.81,2,7.45m-10,2.55c5,0,15,3,18,11,.67,2.26,1.5,6,2,8m-18,0c0-3.89,2.8-12.04,14-10.55m8.5,8h0'
  ],
  Dragon: [
    'm34.021 42.494l3.74-3.74a6 6 0 0 0 0-8.485v0a6 6 0 0 0-8.485 0L27.045 32.5m-9.97-7l6.544-6.544a6 6 0 0 0 0-8.486v0a6 6 0 0 0-8.485 0l-7.071 7.071m9.012 7.959L8.77 33.806a6 6 0 0 0 0 8.485v0a6 6 0 0 0 8.485 0l9.766-9.766',
    'M13 12V4m25 26l5-5'
  ],
  Snake: [
    'm35.786 39.083l2.828-2.828a6 6 0 0 0 0-8.486v0a6 6 0 0 0-8.485 0l-2.462 2.462m-10.266-6.705l7.071-7.07a6 6 0 0 0 0-8.486v0a6 6 0 0 0-8.485 0l-7.071 7.071',
    'm18.283 22.645l-8.66 8.66a6 6 0 0 0 0 8.486v0a6 6 0 0 0 8.485 0l9.9-9.9',
    'M15 9H7'
  ],
  Horse: [
    'M18 4C13 4 4 8 4 18.298V25m31 5v14M18.014 22c.486 1.5 1.986 4.5 6.382 3.738C26.98 25.427 33.082 26.14 36 31c1.5 2.5 5.447 2.496 8-3.86',
    'm26 16l-2-2.5s-1.617-1.755-3-2.5c-1.383-.744-4-1.5-7 0c-1.297.815-4 2-4 6.943V44',
    'M27 44v-3a5 5 0 0 0-5-5v0a5 5 0 0 0-5 5v3'
  ],
  Goat: [
    'M5 14c-1.5-2.5-2-8 3-9c2-.15 3.5.5 6 3l11 12l-3 4',
    'M19 14c-4.071.707-12 4-11 14c.5 3 1.86 5.946 5 9v5m16-25c4.221-.43 13.312.439 15 8c.563 1.861.066 7.157-5 13v4',
    'M33 42c0-3.866-3.4-6-7-6s-7 2.134-7 6'
  ],
  Monkey: [
    'M21.593 18.135c1.34-1.465 2.915-4.978-1.508-7.32c-1.006-.652-1.585-2.315-2.514-5.37C13.718 3.332 5 3 4 14v30',
    'M17 25c4.582 1.673 11.033 5.254 15 16c1.533 3.754 8.507 4.87 11.5-1c.998-1.957.5-5.496-3.918-7.55C36.462 31 34 26 38.5 24c1.848-.603 3.93.08 5.5 3',
    'M29 35c-4.345-1.106-13.228-.481-14 9'
  ],
  Rooster: [
    'M31 31c-1-4.5.4-13.4 10-17M11 4l4 6m23 21c0 2.889-3.76 7.556-10 9l-2 4m-5-33.726c-5.815-1.022-17.139.263-15.907 13.578C5.093 28.232 7.379 37.197 16 40l2 4',
    'M19 18c.696 3.833 3.5 13 12 13h7c-.696-2.333-.843-7.6 5-10'
  ],
  Dog: ['M6 44V19c0-5 3.6-9.4 14-15v9h7v6', 'M16 25c4.013 1.78 11.354 5.124 13 15c.5 3 6 7 12 0c1.994-2.136 2.321-5.651-3.236-7.432', 'M28 36c-3.333-.377-11 1-11 8'],
  Pig: [
    'M13 27c2.073-.542 6.014-3.167 7-4v-7l-6-2c-.41-1.62-1.685-4.889-3-6l-1.448 4.514C6.95 13.67 2.7 18.889 5 25c1 2 3.077 9 6 14m13-25.794c4.391-.727 13.525.072 14.93 9.08c.292 1.332-.176 7.723-4.391 10.629C33.689 33.5 33 36 33 39',
    'M26 40a4 4 0 0 0-8 0',
    'M39 24c.5 1 2.699 1.67 4.228.102c.89-.913 1.619-3.768-.63-5.102'
  ]
};
export function ShioIcon({ shio, ...props }: SvgProps<{ shio: keyof typeof shioMap }>) {
  return (
    <Svg {...props} stroke={3.5} viewBox="0 0 48 48">
      {shioMap[shio].map((path, key) => (
        <path key={key} d={path} />
      ))}
    </Svg>
  );
}

export function PencilIcon(props: SvgProps) {
  return (
    <Svg {...props} currentFill="fill" viewBox="0 0 16 16">
      <path
        fillRule="evenodd"
        d="M12.238 3.64a1.854 1.854 0 0 0-1.629-1.628l-.8.8a3.37 3.37 0 0 1 1.63 1.628zM4.74 7.88l3.87-3.868a1.854 1.854 0 0 1 1.628 1.629L6.369 9.51a1.5 1.5 0 0 1-.814.418l-1.48.247l.247-1.48a1.5 1.5 0 0 1 .418-.814M9.72.78l-2 2l-4.04 4.04a3 3 0 0 0-.838 1.628L2.48 10.62a1 1 0 0 0 1.151 1.15l2.17-.36a3 3 0 0 0 1.629-.839l4.04-4.04l2-2c.18-.18.28-.423.28-.677A3.353 3.353 0 0 0 10.397.5c-.254 0-.498.1-.678.28M2.75 13a.75.75 0 0 0 0 1.5h10.5a.75.75 0 0 0 0-1.5z"
        clipRule="evenodd"
      />
    </Svg>
  );
}

export function CameraRotateIcon(props: SvgProps) {
  return (
    <Svg {...props} currentFill="fill">
      <path
        fillRule="evenodd"
        d="M7.598 4.487c.267-1.31 1.433-2.237 2.768-2.237h3.268c1.335 0 2.5.927 2.768 2.237a.656.656 0 0 0 .653.525c1.403.06 2.481.233 3.381.824c.567.372 1.055.85 1.435 1.409c.473.694.681 1.492.781 2.456c.098.943.098 2.124.098 3.62v.085c0 1.496 0 2.678-.098 3.62c-.1.964-.308 1.762-.781 2.457a5.2 5.2 0 0 1-1.435 1.409c-.703.461-1.51.665-2.488.762c-.958.096-2.159.096-3.685.096H9.737c-1.526 0-2.727 0-3.685-.096c-.978-.097-1.785-.3-2.488-.762a5.2 5.2 0 0 1-1.435-1.41c-.473-.694-.681-1.492-.781-2.456c-.098-.942-.098-2.124-.098-3.62v-.085c0-1.496 0-2.677.098-3.62c.1-.964.308-1.762.781-2.456a5.2 5.2 0 0 1 1.435-1.41c.9-.59 1.978-.762 3.381-.823l.033-.001a.656.656 0 0 0 .62-.524m2.768-.737c-.64 0-1.177.443-1.298 1.036c-.195.96-1.047 1.716-2.072 1.725c-1.348.06-2.07.225-2.61.579a3.7 3.7 0 0 0-1.017.999c-.276.405-.442.924-.53 1.767c-.088.856-.089 1.96-.089 3.508s0 2.651.09 3.507c.087.843.253 1.362.53 1.768c.268.394.613.734 1.017.999c.417.273.951.438 1.814.524c.874.087 2 .088 3.577.088h4.444c1.576 0 2.702 0 3.577-.088c.863-.086 1.397-.25 1.814-.524c.404-.265.75-.605 1.018-1c.276-.405.442-.924.53-1.767c.088-.856.089-1.96.089-3.507s0-2.652-.09-3.508c-.087-.843-.253-1.362-.53-1.767a3.7 3.7 0 0 0-1.017-1c-.538-.353-1.26-.518-2.61-.578c-1.024-.01-1.876-.764-2.071-1.725a1.314 1.314 0 0 0-1.298-1.036zm4.154 4.5a.75.75 0 0 1 .75.75v1.68a.75.75 0 0 1-.596.734l-1.52.32a.75.75 0 0 1-.471-1.414a2.417 2.417 0 0 0-2.393 4.03a2.418 2.418 0 0 0 4.112-1.435a.75.75 0 0 1 1.49.17a3.918 3.918 0 1 1-2.123-3.941V9a.75.75 0 0 1 .75-.75"
        clipRule="evenodd"
      />
    </Svg>
  );
}

export function Icon3(props: SvgProps) {
  return <Svg {...props}></Svg>;
}

export function GripVerticalIcon(props: SvgProps) {
  return (
    <Svg {...props}>
      <path d="M8 5a1 1 0 1 0 2 0a1 1 0 1 0-2 0m0 7a1 1 0 1 0 2 0a1 1 0 1 0-2 0m0 7a1 1 0 1 0 2 0a1 1 0 1 0-2 0m6-14a1 1 0 1 0 2 0a1 1 0 1 0-2 0m0 7a1 1 0 1 0 2 0a1 1 0 1 0-2 0m0 7a1 1 0 1 0 2 0a1 1 0 1 0-2 0" />
    </Svg>
  );
}

export function CheckIcon(props: SvgProps) {
  return (
    <Svg {...props}>
      <path d="m5 13l4 4L19 7" />
    </Svg>
  );
}

export function DoubleCheckIcon(props: SvgProps) {
  return (
    <Svg {...props}>
      <path d="m1.5 12.5l4.076 4.076a.6.6 0 0 0 .848 0L9 14m7-7l-4 4" />
      <path d="m7 12l4.576 4.576a.6.6 0 0 0 .848 0L22 7" />
    </Svg>
  );
}

export function PhotoCirclePlusIcon(props: SvgProps) {
  return (
    <Svg {...props}>
      <path d="M15 8h.01m5.954 4.806A9 9 0 0 0 12 3a9 9 0 0 0-9 9a9 9 0 0 0 9.397 8.991" />
      <path d="m4 15l4-4c.928-.893 2.072-.893 3 0l4 4" />
      <path d="m14 14l1-1c.928-.893 2.072-.893 3 0m-2 6.33h6m-3-3v6" />
    </Svg>
  );
}

export function XIcon(props: SvgProps) {
  return (
    <Svg {...props}>
      <path d="M18 6l-12 12"></path>
      <path d="M6 6l12 12"></path>
    </Svg>
  );
}

export function HeartIcon(props: SvgProps) {
  return (
    <Svg {...props}>
      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </Svg>
  );
}

export function BrandOeriIcon(props: SvgProps) {
  return (
    <Svg {...props}>
      <path d="m18.09,4.07c-2.74-2.1-6.49-2.72-9.91-1.3S2.54,7.27,2.09,10.7" />
      <path d="m5.91,19.93c2.74,2.1,6.49,2.72,9.91,1.3s5.63-4.51,6.09-7.93" />
      <line x1="13.85" y1="15.95" x2="18.25" y2="14.13" />
      <path d="m9.12,17.62l1.11-2.69c.61-1.47-.09-3.15-1.56-3.76l-2.69-1.11" />
    </Svg>
  );
}

export function BrandGithubFillIcon({ role = 'img', fill = '#24292f', ...props }: SvgProps) {
  return (
    <Svg currentFill="fill" {...{ role, fill, ...props }}>
      <path d="m12.01,1C5.92,1,1,5.96,1,12.09c0,4.9,3.15,9.05,7.53,10.52.55.11.75-.24.75-.53,0-.26-.02-1.14-.02-2.06-3.06.66-3.7-1.32-3.7-1.32-.49-1.29-1.22-1.62-1.22-1.62-1-.68.07-.68.07-.68,1.11.07,1.7,1.14,1.7,1.14.98,1.69,2.57,1.21,3.21.92.09-.72.38-1.21.69-1.49-2.44-.26-5.01-1.21-5.01-5.47,0-1.21.44-2.2,1.13-2.97-.11-.28-.49-1.41.11-2.94,0,0,.93-.29,3.03,1.14.9-.24,1.82-.37,2.75-.37.93,0,1.88.13,2.75.37,2.1-1.43,3.03-1.14,3.03-1.14.6,1.52.22,2.66.11,2.94.71.77,1.13,1.76,1.13,2.97,0,4.26-2.57,5.2-5.03,5.47.4.35.75,1.01.75,2.06,0,1.49-.02,2.68-.02,3.05,0,.29.2.64.75.53,4.37-1.47,7.53-5.62,7.53-10.52.02-6.13-4.92-11.09-10.99-11.09Z" />
    </Svg>
  );
}

export function BrandDiscordFillIcon({ role = 'img', fill = '#436ab2', ...props }: SvgProps) {
  return (
    <Svg currentFill="fill" {...{ role, fill, ...props }}>
      <path d="m19.64,5.07c-1.45-.66-2.97-1.13-4.54-1.4-.21.38-.41.77-.58,1.18-1.67-.24-3.36-.24-5.03,0-.16-.37-.39-.83-.58-1.18-1.58.26-3.11.73-4.57,1.4C1.79,8.69.63,13.13,1.1,17.54h0c1.68,1.24,3.56,2.18,5.56,2.79.45-.6.85-1.25,1.19-1.92-.65-.24-1.27-.54-1.87-.9l.46-.36c3.52,1.66,7.59,1.66,11.11,0,.16.12.3.24.47.36-.6.36-1.23.66-1.89.9.35.68.76,1.32,1.22,1.92,2-.61,3.87-1.55,5.56-2.79h0c.46-4.42-.69-8.85-3.26-12.48Zm-11.29,10c-1.16-.07-2.04-1.06-1.98-2.21,0,0,0,0,0,0-.08-1.15.8-2.15,1.95-2.22,0,0,.02,0,.03,0,1.15.05,2.03,1.02,1.98,2.17,0,.02,0,.03,0,.05.04,1.14-.84,2.11-1.98,2.18v.04Zm7.3,0c-1.16-.07-2.04-1.06-1.98-2.22-.07-1.16.81-2.15,1.97-2.22,0,0,0,0,0,0,1.15.05,2.03,1.02,1.98,2.17,0,.02,0,.03,0,.05.05,1.15-.83,2.12-1.98,2.18v.04Z" />
    </Svg>
  );
}

export function CommandIcon(props: SvgProps) {
  return (
    <Svg {...props}>
      <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
    </Svg>
  );
}

const dirMap = {
  ltr: ['M17 21l2 -2l-2 -2'],
  rtl: ['M7 21l-2 -2l2 -2']
} as const;

export function TextDirectionIcon({ dir = 'ltr', ...props }: SvgProps<{ dir?: 'ltr' | 'rtl' }>) {
  return (
    <Svg {...props}>
      <path d="M5 19h14" />
      <path d="M14 15v-11" />
      <path d="M16 4h-6.5a3.5 3.5 0 0 0 0 7h.5" />
      <path d="M10 15v-11" />
      {dirMap[dir].map((i, _i) => (
        <path key={_i} d={i} />
      ))}
    </Svg>
  );
}

const textMap = {
  png: [
    'M4.75 15.25V12.25M4.75 12.25V8.75H6.25C6.80228 8.75 7.25 9.19772 7.25 9.75V11.25C7.25 11.8023 6.80228 12.25 6.25 12.25H4.75Z',
    'M9.75 15.25V8.75L13.25 15.25V8.75',
    'M19.25 8.75H17.75C16.6454 8.75 15.75 9.64543 15.75 10.75V13.25C15.75 14.3546 16.6454 15.25 17.75 15.25H19.25V12.25H17.75'
  ],
  svg: [
    'M7.25 8.75H6.5C5.5335 8.75 4.75 9.5335 4.75 10.5V11C4.75 11.6904 5.30964 12.25 6 12.25V12.25C6.69036 12.25 7.25 12.8096 7.25 13.5V13.75C7.25 14.5784 6.57843 15.25 5.75 15.25H4.75',
    'M18 12.75H18.25C18.8023 12.75 19.25 13.1977 19.25 13.75V14.25C19.25 14.8023 18.8023 15.25 18.25 15.25H16.75C16.1977 15.25 15.75 14.8023 15.75 14.25V11.25V9.75C15.75 9.19772 16.1977 8.75 16.75 8.75H18.25C18.8023 8.75 19.25 9.19772 19.25 9.75V10.25',
    'M9.75 8.75L11.5 15.25L13.25 8.75'
  ]
} as const;

export function TextIcon({ icon, ...props }: SvgProps<{ icon: 'png' | 'svg' }>) {
  return (
    <Svg {...props} stroke={1.5}>
      {textMap[icon].map((i, _i) => (
        <path key={_i} d={i} />
      ))}
    </Svg>
  );
}

export function LogoIcon({ fill = undefined, ...props }: SvgProps) {
  return (
    <Svg currentFill="fill" {...{ fill, ...props }}>
      {!fill && <path d="m18.58,3.61l3.79,3.99-10.74,12.15L1.62,7.6l3.98-3.99h12.98Z" fill="#142641" />}
      <polygon points="13.36 14.05 8.26 14.05 21.29 6.46 18.94 3.99 16.09 5.65 16.29 6 5.48 12.29 9.27 16.89 14.16 16.89 17.02 13.65 13.36 13.65 13.36 14.05" fill={fill || '#284e83'} />
      <polygon points="13.77 3.61 8.59 3.61 1.65 7.64 3.33 9.68 13.77 3.61 13.77 3.61" fill={fill || '#284e83'} />
      <path d="m19.09,2.4H5.11L0,7.52l11.6,14.08.93-1.05,11.48-12.98-4.91-5.17Zm-7.46,17.35L1.62,7.6l3.98-3.99h12.98l3.79,3.99-10.74,12.15Z" fill={fill || '#3569b2'} />
    </Svg>
  );
}

export function CopyIcon(props: SvgProps) {
  return (
    <Svg {...props}>
      <path d="M7 7m0 2.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667z" />
      <path d="M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1" />
    </Svg>
  );
}

interface CopyIconProps extends SvgProps {
  has: boolean;
}
export function HasCopyIcon({ has, ...props }: CopyIconProps) {
  return has ? <CheckIcon className="animate-fade-in fade-in-0 zoom-in-0 [animation-duration:150ms]" {...props} /> : <CopyIcon {...props} />;
}

export function ChevronDownSquareIcon(props: SvgProps) {
  return (
    <Svg {...props}>
      <path d="M15 11l-3 3l-3 -3" />
      <path d="M12 3c7.2 0 9 1.8 9 9s-1.8 9 -9 9s-9 -1.8 -9 -9s1.8 -9 9 -9z" data-d="square" />
    </Svg>
  );
}

const chevronMap = {
  up: ['M6 15l6 -6l6 6'],
  right: ['M9 6l6 6l-6 6'],
  down: ['M6 9l6 6l6 -6'],
  left: ['M15 6l-6 6l6 6'],
  'up-down': ['m7 9 5-5 5 5', 'm7 15 5 5 5-5'],
  'left-right': ['m9 7-5 5 5 5', 'm15 7 5 5-5 5']
} as const;

export function ChevronIcon(_props: SvgProps<{ chevron?: keyof typeof chevronMap }>) {
  const { chevron = 'up', ...props } = _props;
  return (
    <Svg {...props}>
      {chevronMap[chevron].map(d => (
        <path key={d} d={d} />
      ))}
    </Svg>
  );
}

const arrowMap = {
  down: ['M12 5l0 14', 'M18 13l-6 6', 'M6 13l6 6'],
  'down-left': ['M17 7l-10 10', 'M16 17l-9 0l0 -9'],
  'down-right': ['M7 7l10 10', 'M17 8l0 9l-9 0'],
  left: ['M5 12l14 0', 'M5 12l6 6', 'M5 12l6 -6'],
  right: ['M5 12l14 0', 'M13 18l6 -6', 'M13 6l6 6'],
  up: ['M12 5l0 14', 'M18 11l-6 -6', 'M6 11l6 -6'],
  'up-left': ['M7 7l10 10', 'M16 7l-9 0l0 9'],
  'up-right': ['M17 7l-10 10', 'M8 7l9 0l0 9']
} as const;

export function ArrowIcon(_props: SvgProps<{ arrow?: keyof typeof arrowMap }>) {
  const { arrow = 'up', ...props } = _props;
  return (
    <Svg {...props}>
      {arrowMap[arrow].map(d => (
        <path key={d} d={d} />
      ))}
    </Svg>
  );
}
