import type { ReactNode } from 'react';

/**
 * Icons for shared form controls (Select, search fields, …), as inline SVG on
 * the same 24x24 / 1.8px-stroke grid as the navigation set in
 * `components/mobile/icons.tsx`. Kept separate so a form control never has to
 * import from the mobile shell.
 */

type IconProps = { className?: string };

function Svg({ className = 'h-5 w-5', children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m6 9 6 6 6-6" />
    </Svg>
  );
}

export function ChevronLeftIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m15 18-6-6 6-6" />
    </Svg>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m9 18 6-6-6-6" />
    </Svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m5 13 4 4L19 7" />
    </Svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.2-3.2" />
    </Svg>
  );
}

export function PhoneIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M6.5 3h-2A1.5 1.5 0 0 0 3 4.6C3 12.5 11.5 21 19.4 21a1.5 1.5 0 0 0 1.6-1.5v-2a1 1 0 0 0-.8-1l-3-.6a1 1 0 0 0-1 .4l-.9 1.2a12.6 12.6 0 0 1-5.8-5.8l1.2-.9a1 1 0 0 0 .4-1l-.6-3a1 1 0 0 0-1-.8Z" />
    </Svg>
  );
}

/** Membership plan / package. */
export function TicketIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3 8.5V6.5a1.5 1.5 0 0 1 1.5-1.5h15A1.5 1.5 0 0 1 21 6.5v2a2.5 2.5 0 0 0 0 7v2a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5v-2a2.5 2.5 0 0 0 0-7Z" />
      <path d="M14 5v14" strokeDasharray="2 2.5" />
    </Svg>
  );
}

export function XIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </Svg>
  );
}

/** Camera body with a lens — "take a photo now". */
export function CameraIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3 8.5A1.5 1.5 0 0 1 4.5 7h2.2a1.5 1.5 0 0 0 1.24-.66l.72-1.08A1.5 1.5 0 0 1 9.9 4.6h4.2a1.5 1.5 0 0 1 1.24.66l.72 1.08A1.5 1.5 0 0 0 17.3 7h2.2A1.5 1.5 0 0 1 21 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z" />
      <circle cx="12" cy="12.5" r="3.2" />
    </Svg>
  );
}

/** Picture frame with a horizon — "choose an existing photo". */
export function ImageIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3" y="4.5" width="18" height="15" rx="2.5" />
      <circle cx="8.5" cy="10" r="1.6" />
      <path d="m4 17 4.5-4.5a2 2 0 0 1 2.8 0L16 17" />
      <path d="m14 15 1.6-1.6a2 2 0 0 1 2.8 0L20 15" />
    </Svg>
  );
}

/** Bin — removing something that is already stored. */
export function TrashIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 7h16" />
      <path d="M10 11v6M14 11v6" />
      <path d="M6 7l1 12.5A1.5 1.5 0 0 0 8.5 21h7a1.5 1.5 0 0 0 1.5-1.5L18 7" />
      <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" />
    </Svg>
  );
}

/** Head and shoulders — the placeholder where a member has no picture. */
export function UserIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="8.5" r="3.8" />
      <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
    </Svg>
  );
}

/** Camera with a pair of turning arrows — swap between front and back lens. */
export function FlipCameraIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3 8.5A1.5 1.5 0 0 1 4.5 7h2.2a1.5 1.5 0 0 0 1.24-.66l.72-1.08A1.5 1.5 0 0 1 9.9 4.6h4.2a1.5 1.5 0 0 1 1.24.66l.72 1.08A1.5 1.5 0 0 0 17.3 7h2.2A1.5 1.5 0 0 1 21 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z" />
      <path d="M9.4 12.8a2.7 2.7 0 0 1 4.5-2M14.6 12.2a2.7 2.7 0 0 1-4.5 2" />
      <path d="M9.4 10.6v2.2h2.2M14.6 14.4v-2.2h-2.2" />
    </Svg>
  );
}

/** Two figures — the roster as a whole, rather than one member. */
export function UsersIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="9.5" cy="8" r="3.4" />
      <path d="M3.2 19.5a6.5 6.5 0 0 1 12.6 0" />
      <path d="M16.4 5.1a3.4 3.4 0 0 1 0 6.4" />
      <path d="M18.1 14.2a6.5 6.5 0 0 1 2.7 4.4" />
    </Svg>
  );
}

/** Banknote — money taken, on the dashboard's revenue tiles. */
export function CashIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="2.6" y="6" width="18.8" height="12" rx="2.2" />
      <circle cx="12" cy="12" r="2.6" />
      <path d="M6.2 10v4M17.8 10v4" />
    </Svg>
  );
}

/** Clock — time running out on a membership. */
export function ClockIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M12 7.4V12l3 1.8" />
    </Svg>
  );
}

/* No UserPlusIcon here on purpose — the mobile set already has one, and two
   icons of the same name in two files is how a screen ends up importing the
   wrong one. Screens that need it take it from components/mobile/icons. */

/** A door with an arrow going in — someone checking in. */
export function DoorInIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M13.5 3.4H18a1.8 1.8 0 0 1 1.8 1.8v13.6A1.8 1.8 0 0 1 18 20.6h-4.5" />
      <path d="M9.6 8.4 13.2 12l-3.6 3.6" />
      <path d="M13.2 12H4.2" />
    </Svg>
  );
}

/** Four arrows pushing outward — open this at full size. */
export function ExpandIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M9.2 3.6H3.6v5.6" />
      <path d="M14.8 3.6h5.6v5.6" />
      <path d="M20.4 14.8v5.6h-5.6" />
      <path d="M3.6 14.8v5.6h5.6" />
    </Svg>
  );
}

/** Triangle with an exclamation — a blocked action, not a fatal error. */
export function WarningIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M10.3 3.9 2.6 17.2A2 2 0 0 0 4.3 20h15.4a2 2 0 0 0 1.7-2.8L13.7 3.9a2 2 0 0 0-3.4 0z" />
      <path d="M12 9v4.5" />
      <path d="M12 17h.01" />
    </Svg>
  );
}
