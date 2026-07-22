import type { ReactNode } from 'react';
import { useInView } from '../../hooks/useInView';

type Direction = 'up' | 'left' | 'right' | 'none';

const HIDDEN: Record<Direction, string> = {
  up: 'translate-y-8',
  left: '-translate-x-8',
  right: 'translate-x-8',
  none: '',
};

/**
 * Fades + slides its children in the first time they scroll into view. Purely
 * decorative — useInView returns visible immediately under reduced-motion, and
 * the transition itself is disabled there too, so nothing stays hidden.
 */
export function Reveal({
  children,
  delay = 0,
  direction = 'up',
  className = '',
}: {
  children: ReactNode;
  delay?: number;
  direction?: Direction;
  className?: string;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: inView ? `${delay}ms` : '0ms' }}
      className={`transition-all duration-700 ease-out will-change-transform motion-reduce:!transition-none motion-reduce:!transform-none ${
        inView ? 'opacity-100 translate-x-0 translate-y-0' : `opacity-0 ${HIDDEN[direction]}`
      } ${className}`}
    >
      {children}
    </div>
  );
}
