import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Live reload against a dev machine on the gym's LAN.
 *
 * Set CAP_DEV_SERVER to the Vite dev URL (e.g. http://192.168.1.20:5173) and
 * re-run `npm run mobile:sync` — the WebView then loads from that machine
 * instead of the bundled files, so edits hot-reload on the phone.
 *
 * It is read from the environment rather than hardcoded so a release build
 * physically cannot ship pointing at someone's laptop: with the variable
 * unset, `server.url` and cleartext HTTP are both absent from the generated
 * native config. See MOBILE.md.
 */
const devServer = process.env.CAP_DEV_SERVER?.trim();

if (devServer) {
  // eslint-disable-next-line no-console
  console.warn(`[capacitor] DEV BUILD — WebView will load from ${devServer}. Do not ship this build.`);
}

const config: CapacitorConfig = {
  // appId is the app's permanent Play Store identity and can never be changed
  // once published, so it stays as originally generated. appName is only the
  // launcher label and is free to change — it now matches the branding used
  // everywhere else in the product (login logo, i18n `app.name`, README).
  appId: 'et.gymflow.app',
  appName: 'Snowfall Gym',
  webDir: 'dist',

  server: {
    // Android serves the bundle from https://localhost, which keeps the
    // WebView on a secure origin (required by getUserMedia and the
    // Preferences-backed session storage).
    androidScheme: 'https',
    ...(devServer ? { url: devServer, cleartext: true } : {}),
  },

  android: {
    // Only ever true for LAN live reload; a release build has no cleartext.
    allowMixedContent: Boolean(devServer),
  },

  plugins: {
    SplashScreen: {
      launchAutoHide: false, // hidden from main.tsx once the first render lands
      backgroundColor: '#0f172a',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
