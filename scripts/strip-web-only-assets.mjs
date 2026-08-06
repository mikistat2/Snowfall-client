/**
 * Removes web-only downloads from the Android app's bundled assets.
 *
 * `client/public/` is served by the website AND copied verbatim into the APK by
 * `cap copy` (public → dist → android/app/src/main/assets/public). The
 * downloadable APK lives in public/ so the site can serve it, which without
 * this step would ship an 18 MB copy of the app *inside* the app — doubling the
 * download for every phone install.
 *
 * Runs after `cap sync`/`cap copy`. Deleting from the generated assets folder
 * is safe: it is regenerated on every copy and is not the source of truth.
 */
import { readdirSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ASSETS = 'android/app/src/main/assets/public';
const STRIP = /\.(apk|aab)$/i;

let removed = 0;
let freed = 0;

try {
  for (const name of readdirSync(ASSETS)) {
    if (!STRIP.test(name)) continue;
    const path = join(ASSETS, name);
    freed += statSync(path).size;
    rmSync(path);
    removed += 1;
    console.log(`[strip] removed ${name} from the Android bundle`);
  }
} catch (err) {
  if (err.code === 'ENOENT') {
    // No native project synced yet — nothing to strip.
    process.exit(0);
  }
  throw err;
}

if (removed > 0) {
  console.log(`[strip] ${removed} file(s), ${(freed / 1024 / 1024).toFixed(1)} MB kept out of the APK`);
}
