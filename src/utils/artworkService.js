import { sanitizeMetadata } from './sanitizeQuery';

/**
 * Robust Multi-Tier, Multi-Provider Cover Art Resolution Service
 * Handles multilingual titles (e.g. Nepali / Devanagari), iTunes 600x600 HD, and Deezer fallback.
 */

const DEFAULT_COVER = '/album_covers/loving_machine.jpg';

export async function resolveTrackArtwork({ title, artist, album, embeddedArtworkUrl }) {
  // --- Tier 1: Embedded ID3 APIC Art ---
  if (embeddedArtworkUrl) {
    return {
      artworkUrl: embeddedArtworkUrl,
      source: 'ID3 EMBEDDED APIC',
      isCustom: true,
    };
  }

  // --- Tier 2 & 3: Multi-Provider Remote Lookups with Multilingual Candidates ---
  const sanitized = sanitizeMetadata(title, artist, album);
  const candidates = sanitized.searchCandidates;

  for (const query of candidates) {
    if (!query || query.length < 2) continue;

    // 1. Try iTunes Search API
    try {
      const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=1`;
      const res = await fetch(itunesUrl);
      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0 && data.results[0].artworkUrl100) {
          const highRes = data.results[0].artworkUrl100
            .replace('100x100bb', '600x600bb')
            .replace('100x100', '600x600');

          return {
            artworkUrl: highRes,
            source: 'ITUNES HD TELEMETRY',
            isCustom: true,
          };
        }
      }
    } catch (e) {
      console.warn('iTunes query attempt failed for query:', query, e);
    }

    // 2. Try Deezer Search API Fallback (using JSONP or CORS proxy)
    try {
      const deezerUrl = `https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=1`;
      // We attempt direct fetch first, and fallback to corsproxy if blocked by browser
      let deezerRes;
      try {
        deezerRes = await fetch(deezerUrl);
      } catch (_) {
        deezerRes = await fetch(`https://corsproxy.io/?${encodeURIComponent(deezerUrl)}`);
      }

      if (deezerRes && deezerRes.ok) {
        const data = await deezerRes.json();
        if (data.data && data.data.length > 0 && data.data[0].album) {
          const albumObj = data.data[0].album;
          const artUrl = albumObj.cover_xl || albumObj.cover_big || albumObj.cover_medium;
          if (artUrl) {
            return {
              artworkUrl: artUrl,
              source: 'DEEZER HD TELEMETRY',
              isCustom: true,
            };
          }
        }
      }
    } catch (e) {
      // Deezer failed, continue to next candidate
    }
  }

  // Fallback: Try iTunes Album search with clean artist or album name
  if (sanitized.romanArtist && sanitized.romanArtist !== 'Unknown Artist') {
    try {
      const artistUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(sanitized.romanArtist)}&entity=album&limit=1`;
      const res = await fetch(artistUrl);
      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0 && data.results[0].artworkUrl100) {
          const highRes = data.results[0].artworkUrl100.replace('100x100bb', '600x600bb');
          return {
            artworkUrl: highRes,
            source: 'ITUNES ARTIST HD',
            isCustom: true,
          };
        }
      }
    } catch (_) {}
  }

  // --- Tier 4: Cyberpunk Station Artwork Fallback ---
  return {
    artworkUrl: DEFAULT_COVER,
    source: 'SEVEN.FM DEFAULT',
    isCustom: false,
  };
}
