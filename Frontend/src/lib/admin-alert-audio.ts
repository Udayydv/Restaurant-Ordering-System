let sharedAudioContext: AudioContext | null = null;
let audioPermissionUnlocked = false;
let fallbackAudio: HTMLAudioElement | null = null;
let fallbackAudioUnlocked = false;

function getContext(): AudioContext | null {
  if (sharedAudioContext) return sharedAudioContext;
  if (typeof window === "undefined") return null;

  const AudioContextCtor =
    window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;

  if (!AudioContextCtor) return null;

  sharedAudioContext = new AudioContextCtor();
  return sharedAudioContext;
}

function getFallbackAudio(): HTMLAudioElement | null {
  if (fallbackAudio) return fallbackAudio;
  if (typeof window === "undefined") return null;

  fallbackAudio = new Audio("/admin-order-bell.wav");
  fallbackAudio.preload = "auto";
  fallbackAudio.volume = 1;
  return fallbackAudio;
}

export function isAdminAlertAudioReady() {
  return (
    (audioPermissionUnlocked && sharedAudioContext?.state === "running") ||
    fallbackAudioUnlocked
  );
}

/**
 * Call from a real user interaction (pointer/key/click). It unlocks BOTH audio
 * paths so an order still has a chance to ring if Chrome later suspends the
 * WebAudio context while the admin tab is in the background.
 */
export async function unlockAdminAlertAudio(): Promise<boolean> {
  const context = getContext();
  const media = getFallbackAudio();

  let contextReady = false;
  let mediaReady = fallbackAudioUnlocked;

  const jobs: Promise<void>[] = [];

  if (context) {
    jobs.push(
      (async () => {
        try {
          if (context.state !== "running") await context.resume();
          contextReady = context.state === "running";
          audioPermissionUnlocked = contextReady;
        } catch (error) {
          audioPermissionUnlocked = false;
          console.warn("WebAudio unlock failed:", error);
        }
      })(),
    );
  }

  if (media && !fallbackAudioUnlocked) {
    jobs.push(
      (async () => {
        try {
          // Prime the HTMLAudioElement during the user's gesture at an almost
          // inaudible level, then reuse it as the independent fallback path.
          media.volume = 0.001;
          media.currentTime = 0;
          await media.play();
          media.pause();
          media.currentTime = 0;
          media.volume = 1;
          fallbackAudioUnlocked = true;
          mediaReady = true;
        } catch (error) {
          media.volume = 1;
          fallbackAudioUnlocked = false;
          console.warn("Fallback audio unlock failed:", error);
        }
      })(),
    );
  }

  await Promise.allSettled(jobs);

  if (
    typeof Notification !== "undefined" &&
    Notification.permission === "default"
  ) {
    try {
      await Notification.requestPermission();
    } catch {
      // Browser notification permission is optional.
    }
  }

  return contextReady || mediaReady || isAdminAlertAudioReady();
}

async function playWebAudioBell(): Promise<boolean> {
  const context = getContext();
  if (!context) return false;

  try {
    if (context.state !== "running") await context.resume();
    if (context.state !== "running") {
      audioPermissionUnlocked = false;
      return false;
    }

    audioPermissionUnlocked = true;

    const ring = (offset: number, frequency: number) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const startAt = context.currentTime + offset;
      const endAt = startAt + 0.26;

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, startAt);
      gain.gain.setValueAtTime(0.0001, startAt);
      gain.gain.exponentialRampToValueAtTime(0.95, startAt + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, endAt);

      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(startAt);
      oscillator.stop(endAt + 0.03);
    };

    ring(0, 880);
    ring(0.32, 660);
    ring(0.76, 880);
    ring(1.08, 660);
    return true;
  } catch (error) {
    audioPermissionUnlocked = false;
    console.warn("WebAudio bell failed; trying media fallback:", error);
    return false;
  }
}

async function playFallbackBell(): Promise<boolean> {
  const media = getFallbackAudio();
  if (!media || !fallbackAudioUnlocked) return false;

  try {
    media.pause();
    media.currentTime = 0;
    media.volume = 1;
    await media.play();
    return true;
  } catch (error) {
    fallbackAudioUnlocked = false;
    console.warn("HTML audio bell fallback failed:", error);
    return false;
  }
}

export async function playAdminOrderBell(): Promise<boolean> {
  if (await playWebAudioBell()) return true;
  return playFallbackBell();
}
