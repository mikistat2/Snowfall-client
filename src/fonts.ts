/**
 * Self-hosted webfonts.
 *
 * These used to come from the Google Fonts CDN via a <link> in index.html,
 * which the Android app cannot rely on: the WebView has no network at all
 * when the gym's connection drops, and Amharic silently fell back to a system
 * font that clips Ethiopic glyphs. Bundling them means the app renders
 * correctly offline and on first launch.
 *
 * Only the weights the UI actually uses are imported — each one is a separate
 * woff2 file in the bundle.
 */

// UI text
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';

// Amharic — must ship locally, this is the whole point of the change
import '@fontsource/noto-sans-ethiopic/400.css';
import '@fontsource/noto-sans-ethiopic/600.css';

// Snowfall brand mark / gym-name display treatment
import '@fontsource/orbitron/400.css';
import '@fontsource/orbitron/600.css';
import '@fontsource/orbitron/700.css';
import '@fontsource/orbitron/800.css';
