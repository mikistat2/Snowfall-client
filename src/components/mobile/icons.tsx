/**
 * Tab-bar and shell icons as inline SVG — no icon library, so nothing is added
 * to the bundle and the strokes inherit currentColor for theming.
 *
 * All are 24x24 on a 2px stroke grid so they sit consistently in a 56px tab.
 */

type IconProps = { className?: string };

const base = 'h-6 w-6';

function Svg({ className, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      className={className ?? base}
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

export function DashboardIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3" y="3" width="7" height="8" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="11" width="7" height="10" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
    </Svg>
  );
}

export function LiveIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3 12h4l2.5-6 5 12 2.5-6h4" />
    </Svg>
  );
}

export function MembersIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
      <path d="M16 5.2a3.2 3.2 0 0 1 0 5.9" />
      <path d="M17.5 14.5a5.5 5.5 0 0 1 3 5.5" />
    </Svg>
  );
}

export function PaymentsIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <path d="M2.5 10h19" />
      <path d="M6.5 15h3" />
    </Svg>
  );
}

export function MoreIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h10" />
    </Svg>
  );
}

export function ChevronLeftIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M15 5l-7 7 7 7" />
    </Svg>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M9 5l7 7-7 7" />
    </Svg>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 5v14M5 12h14" />
    </Svg>
  );
}

export function BellIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M18 8.5a6 6 0 1 0-12 0c0 5-2 6.5-2 6.5h16s-2-1.5-2-6.5" />
      <path d="M10.3 19a2 2 0 0 0 3.4 0" />
    </Svg>
  );
}

export function UserPlusIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="10" cy="8" r="3.4" />
      <path d="M3.6 20a6.4 6.4 0 0 1 12.8 0" />
      <path d="M18.5 6.5v5M16 9h5" />
    </Svg>
  );
}

export function AlertIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 4.5 2.8 19.5h18.4z" />
      <path d="M12 10v4" />
      <path d="M12 17.2h.01" />
    </Svg>
  );
}

/** Spinner arc — pair with `animate-spin` for the refresh indicator. */
export function SpinnerIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 3a9 9 0 1 0 9 9" />
    </Svg>
  );
}

export function ArrowDownIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 4v15" />
      <path d="M6 13.5 12 19.5l6-6" />
    </Svg>
  );
}
