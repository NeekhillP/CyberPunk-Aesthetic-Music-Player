import * as musicMetadata from 'music-metadata-browser';
import { cleanClutter } from './sanitizeQuery';

/**
 * Extracts ID3 metadata, embedded album art, and embedded lyrics from an Audio File
 * Automatically strips YouTube video clutter from extracted titles.
 */
export async function extractAudioMetadata(file) {
  const result = {
    title: '',
    artist: '',
    album: '',
    duration: 0,
    artworkUrl: null,
    embeddedLyrics: '',
  };

  // 1. Default clean title & artist inferred from filename
  const baseName = file.name.replace(/\.[^/.]+$/, '');
  if (baseName.includes(' - ')) {
    const parts = baseName.split(' - ');
    result.artist = cleanClutter(parts[0].trim());
    result.title = cleanClutter(parts.slice(1).join(' - ').trim());
  } else {
    result.title = cleanClutter(baseName);
    result.artist = 'Unknown Artist';
  }

  // 2. Parse using music-metadata-browser (supports ID3v1, ID3v2, Vorbis, FLAC, MP4/M4A)
  try {
    const metadata = await musicMetadata.parseBlob(file, { duration: true });
    
    if (metadata.common) {
      if (metadata.common.title) result.title = cleanClutter(metadata.common.title);
      if (metadata.common.artist) result.artist = cleanClutter(metadata.common.artist);
      if (metadata.common.album) result.album = cleanClutter(metadata.common.album);

      // Embedded Cover Art (APIC / picture)
      if (metadata.common.picture && metadata.common.picture.length > 0) {
        const pic = metadata.common.picture[0];
        const blob = new Blob([pic.data], { type: pic.format || 'image/jpeg' });
        result.artworkUrl = URL.createObjectURL(blob);
      }

      // Embedded Lyrics (USLT / lyrics tags)
      if (metadata.common.lyrics && metadata.common.lyrics.length > 0) {
        result.embeddedLyrics = metadata.common.lyrics.join('\n');
      }
    }

    if (metadata.format && metadata.format.duration) {
      result.duration = Math.round(metadata.format.duration);
    }
  } catch (err) {
    console.warn('music-metadata extraction note:', err);
  }

  // 3. Duration fallback using Audio element if metadata did not contain duration
  if (!result.duration) {
    try {
      const tempAudio = new Audio(URL.createObjectURL(file));
      await new Promise((resolve) => {
        tempAudio.onloadedmetadata = () => {
          if (!isNaN(tempAudio.duration)) {
            result.duration = Math.round(tempAudio.duration);
          }
          resolve();
        };
        tempAudio.onerror = () => resolve();
        setTimeout(resolve, 1500);
      });
    } catch (_) {}
  }

  return result;
}
