/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Noto Sans Ethiopic renders Amharic cleanly; falls back to system sans
        sans: ['Inter', 'Noto Sans Ethiopic', 'system-ui', 'sans-serif'],
        // Orbitron — geometric/techy display font for the Snowfall brand mark
        display: ['Orbitron', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
