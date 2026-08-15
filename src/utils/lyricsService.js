import { sanitizeMetadata } from './sanitizeQuery';

/**
 * Multi-Tier Multilingual Lyric Resolution Pipeline
 * - Tier 1: Local Companion .LRC
 * - Tier 2: Embedded ID3 Lyrics (SYLT / USLT)
 * - Tier 3: LRCLIB Online API with Multilingual Script Candidates (Latin & Devanagari)
 * - Tier 4: Terminal Placeholder
 */

export async function resolveTrackLyrics({ title, artist, album, duration, embeddedLyrics, companionLrc }) {
  // --- Tier 1: Companion .lrc file ---
  if (companionLrc && companionLrc.trim()) {
    return {
      lrc: companionLrc,
      source: 'LOCAL .LRC FILE',
      isSynced: companionLrc.includes('['),
    };
  }

  // --- Tier 2: Embedded ID3 Lyrics ---
  if (embeddedLyrics && embeddedLyrics.trim()) {
    const isSynced = /\[\d{2}:\d{2}/.test(embeddedLyrics);
    if (isSynced) {
      return {
        lrc: embeddedLyrics,
        source: 'ID3 EMBEDDED (SYNCED)',
        isSynced: true,
      };
    } else {
      return {
        lrc: convertPlainTextToLrc(embeddedLyrics, duration),
        source: 'ID3 EMBEDDED (PLAIN)',
        isSynced: false,
      };
    }
  }

  // --- Tier 3: LRCLIB Online Telemetry Fetch with Multilingual Candidates ---
  const sanitized = sanitizeMetadata(title, artist, album);
  const candidates = sanitized.searchCandidates;

  for (const query of candidates) {
    if (!query || query.length < 2) continue;

    try {
      // 1. Direct GET by title and artist if both separated
      let getUrl = `https://lrclib.net/api/get?track_name=${encodeURIComponent(sanitized.romanTitle || query)}`;
      if (sanitized.romanArtist && sanitized.romanArtist !== 'Unknown Artist') {
        getUrl += `&artist_name=${encodeURIComponent(sanitized.romanArtist)}`;
      }
      if (duration && duration > 0) {
        getUrl += `&duration=${Math.round(duration)}`;
      }

      let response = await fetch(getUrl, {
        headers: { 'User-Agent': 'SevenFM-Terminal-Music-Player/0.2.7' },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.syncedLyrics) {
          return {
            lrc: data.syncedLyrics,
            source: 'LRCLIB [AUTO-SYNCED]',
            isSynced: true,
          };
        }
        if (data.plainLyrics) {
          return {
            lrc: convertPlainTextToLrc(data.plainLyrics, duration),
            source: 'LRCLIB [PLAIN TELEMETRY]',
            isSynced: false,
          };
        }
      }

      // 2. Search Fallback Query with current candidate string
      const searchUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(query)}`;
      response = await fetch(searchUrl, {
        headers: { 'User-Agent': 'SevenFM-Terminal-Music-Player/0.2.7' },
      });

      if (response.ok) {
        const results = await response.json();
        if (Array.isArray(results) && results.length > 0) {
          const syncedResult = results.find(r => r.syncedLyrics);
          if (syncedResult) {
            return {
              lrc: syncedResult.syncedLyrics,
              source: 'LRCLIB [AUTO-SYNCED]',
              isSynced: true,
            };
          }
          if (results[0].plainLyrics) {
            return {
              lrc: convertPlainTextToLrc(results[0].plainLyrics, duration),
              source: 'LRCLIB [PLAIN TELEMETRY]',
              isSynced: false,
            };
          }
        }
      }
    } catch (err) {
      console.warn('LRCLIB candidate query error:', query, err);
    }
  }

  // --- Tier 4: Terminal Telemetry Fallback ---
  return {
    lrc: '', // Empty to let user trigger [ + PASTE LRC / TEXT LYRICS ] or view telemetry message
    source: 'NO TELEMETRY FOUND',
    isSynced: false,
  };
}

export function convertPlainTextToLrc(plainText, totalDuration = 180) {
  const lines = plainText.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return '[00:00.00]♪ Instrumental / No Lyrics ♪';

  const interval = Math.max(3, (totalDuration - 10) / lines.length);
  let result = `[00:00.00]◆ PLAIN LYRICS TELEMETRY ◆\n`;

  lines.forEach((line, idx) => {
    const timeSec = Math.round(4 + idx * interval);
    const mins = Math.floor(timeSec / 60).toString().padStart(2, '0');
    const secs = (timeSec % 60).toString().padStart(2, '0');
    result += `[${mins}:${secs}.00] ${line}\n`;
  });

  return result;
}
