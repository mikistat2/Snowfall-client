import { NATIVE } from './platform';

/**
 * Haptic feedback, reserved for actions with real consequences — a payment
 * marked, an entry override, a completed enrollment. Deliberately *not* wired
 * to navigation: buzzing on every tab tap is noise, not feedback.
 *
 * All calls are fire-and-forget no-ops in the browser.
 */

async function impact(style: 'Light' | 'Medium' | 'Heavy'): Promise<void> {
  if (!NATIVE) return;
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    await Haptics.impact({ style: ImpactStyle[style] });
  } catch {
    /* device without a vibrator, or permission withheld */
  }
}

async function notify(type: 'Success' | 'Warning' | 'Error'): Promise<void> {
  if (!NATIVE) return;
  try {
    const { Haptics, NotificationType } = await import('@capacitor/haptics');
    await Haptics.notification({ type: NotificationType[type] });
  } catch {
    /* as above */
  }
}

/** A destructive or high-stakes confirmation landed. */
export function hapticSuccess(): void {
  void notify('Success');
}

export function hapticError(): void {
  void notify('Error');
}

/** Light tap for a committed action (e.g. an override applied). */
export function hapticTap(): void {
  void impact('Light');
}
