/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  // Toggled by lib/theme.ts on <html>. Class-based rather than 'media' so the
  // user can override the system setting from Settings.
  darkMode: 'class',
  theme: {
    extend: {
      // Semantic surface/text tokens backed by CSS variables (see index.css).
      // Using these instead of raw slate shades is what lets one set of markup
      // render correctly in both themes.
      colors: {
        canvas: 'rgb(var(--c-bg) / <alpha-value>)',
        surface: 'rgb(var(--c-surface) / <alpha-value>)',
        'surface-2': 'rgb(var(--c-surface-2) / <alpha-value>)',
        fg: 'rgb(var(--c-fg) / <alpha-value>)',
        'fg-muted': 'rgb(var(--c-fg-muted) / <alpha-value>)',
        'fg-subtle': 'rgb(var(--c-fg-subtle) / <alpha-value>)',
        line: 'rgb(var(--c-line) / <alpha-value>)',
        // Single accent for focus rings, selected rows and active tabs.
        accent: 'rgb(var(--c-accent) / <alpha-value>)',
        'accent-soft': 'rgb(var(--c-accent-soft) / <alpha-value>)',
      },
      spacing: {
        // Android status bar / gesture bar. Resolve to 0 in the browser, so the
        // same classes are safe on web.
        'safe-t': 'env(safe-area-inset-top)',
        'safe-b': 'env(safe-area-inset-bottom)',
        'safe-l': 'env(safe-area-inset-left)',
        'safe-r': 'env(safe-area-inset-right)',
        /** Bottom tab bar (56px) + the gesture inset beneath it. */
        'tabbar': 'calc(3.5rem + env(safe-area-inset-bottom))',
        /** Stack header (56px) + the status bar above it. */
        'appbar': 'calc(3.5rem + env(safe-area-inset-top))',
      },
      minHeight: {
        /** Android's minimum comfortable touch target. */
        touch: '44px',
      },
      minWidth: {
        touch: '44px',
      },
      boxShadow: {
        // App-bar elevation: a hairline plus a soft drop, rather than a border
        // that looks drawn-on over a scrolling list.
        appbar: '0 1px 2px rgb(0 0 0 / 0.06), 0 4px 12px -6px rgb(0 0 0 / 0.18)',
      },
      fontFamily: {
        // Noto Sans Ethiopic renders Amharic cleanly; falls back to system sans
        sans: ['Inter', 'Noto Sans Ethiopic', 'system-ui', 'sans-serif'],
        // Orbitron — geometric/techy display font for the Snowfall brand mark
        display: ['Orbitron', 'sans-serif'],
      },
      // Landing-page motion. All decorative and honour prefers-reduced-motion
      // (the components gate on it before applying these).
      keyframes: {
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.85)', opacity: '0.55' },
          '100%': { transform: 'scale(2.4)', opacity: '0' },
        },
        'gradient-pan': {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1100%)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.35' },
        },
        // Mobile bottom sheet (components/mobile/DetailSheet).
        'sheet-up': {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        // Screen enter — a few pixels of rise, enough to read as a push.
        'rise-in': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'float-slow': 'float-slow 6s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 2.4s ease-out infinite',
        'gradient-pan': 'gradient-pan 6s linear infinite',
        scan: 'scan 2.8s ease-in-out infinite',
        blink: 'blink 1.4s ease-in-out infinite',
        'sheet-up': 'sheet-up 260ms cubic-bezier(0.32, 0.72, 0, 1)',
        'fade-in': 'fade-in 200ms ease-out',
        'rise-in': 'rise-in 220ms cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};
