/**
 * Native Tauri v2 Desktop Bridge
 * Detects Tauri environment, wires system tray events, native file dialogs,
 * and global hardware shortcut hooks.
 */

export function isTauri() {
  return typeof window !== 'undefined' && (Boolean(window.__TAURI_INTERNALS__) || Boolean(window.__TAURI__));
}

/**
 * Triggers native OS file picker when running as desktop application
 */
export async function openNativeFileDialog() {
  if (!isTauri()) return null;

  try {
    const { open } = await import('@tauri-apps/plugin-dialog');
    const { readFile } = await import('@tauri-apps/plugin-fs');

    const selected = await open({
      multiple: true,
      filters: [
        {
          name: 'Audio & Lyrics',
          extensions: ['mp3', 'wav', 'flac', 'ogg', 'm4a', 'aac', 'lrc', 'txt'],
        },
      ],
    });

    if (!selected) return null;

    const filePaths = Array.isArray(selected) ? selected : [selected];
    const fileObjects = [];

    for (const filePath of filePaths) {
      const fileName = filePath.split(/[/\\]/).pop() || 'audio_file';
      const fileBytes = await readFile(filePath);
      const isLrc = /\.(lrc|txt)$/i.test(fileName);
      const mimeType = isLrc ? 'text/plain' : 'audio/mpeg';

      const file = new File([fileBytes], fileName, { type: mimeType });
      fileObjects.push(file);
    }

    return fileObjects;
  } catch (err) {
    console.warn('Native file dialog error:', err);
    return null;
  }
}

/**
 * Connects system tray and desktop event listeners
 */
export async function initTauriDesktopEvents({ togglePlay, nextTrack, prevTrack }) {
  if (!isTauri()) return () => {};

  try {
    const { listen } = await import('@tauri-apps/api/event');
    const { register, isRegistered } = await import('@tauri-apps/plugin-global-shortcut');

    // 1. Listen for Tray events
    const unlistenPlay = await listen('media-toggle-play', () => togglePlay());
    const unlistenNext = await listen('media-next-track', () => nextTrack());

    // 2. Register Global OS Media Key shortcuts
    try {
      const playRegistered = await isRegistered('MediaPlayPause');
      if (!playRegistered) {
        await register('MediaPlayPause', (event) => {
          if (event.state === 'Pressed') togglePlay();
        });
      }

      const nextRegistered = await isRegistered('MediaTrackNext');
      if (!nextRegistered) {
        await register('MediaTrackNext', (event) => {
          if (event.state === 'Pressed') nextTrack();
        });
      }

      const prevRegistered = await isRegistered('MediaTrackPrevious');
      if (!prevRegistered) {
        await register('MediaTrackPrevious', (event) => {
          if (event.state === 'Pressed') prevTrack();
        });
      }
    } catch (shortcutErr) {
      console.warn('Tauri global shortcut registration note:', shortcutErr);
    }

    return () => {
      unlistenPlay();
      unlistenNext();
    };
  } catch (e) {
    console.warn('Tauri event initialization note:', e);
    return () => {};
  }
}
