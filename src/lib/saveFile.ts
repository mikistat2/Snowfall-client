import { NATIVE } from './platform';

/**
 * Hand a generated file (a PDF export, today) to the user.
 *
 * On the web this is the ordinary anchor-download dance. In the Android app it
 * cannot be: the WebView has no download manager behind it, so `doc.save()` —
 * and any other `<a download>` — did precisely nothing, with no error to show
 * for it. The export button looked broken because it was.
 *
 * The native path writes the bytes into the app's own cache directory and
 * hands the file to the system share sheet, which is how a phone lets you keep
 * something or send it on. Cache is deliberate: it needs no storage
 * permission, it is already covered by the FileProvider this app declares
 * (`res/xml/file_paths.xml`), and Android reclaims it on its own.
 *
 * The file type is taken from the extension, which is what the share sheet
 * reads to decide which apps can open it.
 */
export async function saveFile(filename: string, blob: Blob): Promise<void> {
  if (!NATIVE) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    // Revoked on the next tick — Safari drops the download if it goes too soon.
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
    return;
  }

  const [{ Filesystem, Directory }, { Share }] = await Promise.all([
    import('@capacitor/filesystem'),
    import('@capacitor/share'),
  ]);

  await Filesystem.writeFile({
    path: filename,
    data: await toBase64(blob),
    directory: Directory.Cache,
    recursive: true,
  });
  const { uri } = await Filesystem.getUri({ path: filename, directory: Directory.Cache });

  try {
    await Share.share({ title: filename, files: [uri], dialogTitle: filename });
  } catch (err) {
    // Dismissing the share sheet is a decision, not a failure — the file is
    // written either way, so it must not surface as an error.
    if (isCancellation(err)) return;
    throw err;
  }
}

/** Capacitor's Filesystem takes base64, without the data: prefix. */
async function toBase64(blob: Blob): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error('Could not read the generated file'));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(blob);
  });
  return dataUrl.slice(dataUrl.indexOf(',') + 1);
}

function isCancellation(err: unknown): boolean {
  const message = (err as { message?: string })?.message?.toLowerCase() ?? '';
  return message.includes('cancel') || message.includes('abort');
}
