import logo from '../../assets/images/snowfall-logo.png';

/**
 * Snowfall brand mark. The logo art is white + blue on transparency, so on
 * light surfaces pass `tile` to sit it on a dark rounded backing (otherwise
 * the white silhouette disappears). On dark surfaces use the bare form.
 */
export function Logo({ size = 'h-9 w-9', tile = false }: { size?: string; tile?: boolean }) {
  if (tile) {
    return (
      <span className={`inline-flex shrink-0 items-center justify-center rounded-xl bg-slate-900 ${size}`}>
        <img src={logo} alt="Snowfall Gym" className="h-[82%] w-[82%] object-contain" />
      </span>
    );
  }
  return <img src={logo} alt="Snowfall Gym" className={`shrink-0 object-contain ${size}`} />;
}
