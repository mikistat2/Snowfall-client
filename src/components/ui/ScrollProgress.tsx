import { useEffect, useState } from 'react';

/**
 * Thin gradient bar pinned to the top of the viewport that fills as the visitor
 * scrolls the page — a small "you're making progress" cue on the long landing
 * page. Fixed + pointer-events-none so it never interferes with the layout.
 */
export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="fixed inset-x-0 top-0 z-50 h-1 bg-transparent" aria-hidden="true">
      <div
        className="h-full origin-left bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-400 shadow-[0_0_10px_rgba(56,189,248,0.7)]"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
}
