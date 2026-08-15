/**
 * Multi-Tier Lyric Resolution Pipeline
 * - Tier 1: Embedded ID3 Lyrics (SYLT / USLT)
 * - Tier 2: Companion .lrc file
 * - Tier 3: LRCLIB Online API (Synced > Plain)
 * - Tier 4: Terminal Telemetry Fallback
 */

export async function resolveTrackLyrics({ title, artist, album, duration, embeddedLyrics, companionLrc }) {
  // --- Tier 1: Companion .lrc file if provided ---
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
      // Plain text embedded lyrics -> format for display
      return {
        lrc: convertPlainTextToLrc(embeddedLyrics, duration),
        source: 'ID3 EMBEDDED (PLAIN)',
        isSynced: false,
      };
    }
  }

  // --- Tier 3: LRCLIB Online Telemetry Fetch ---
  if (title && title !== 'Unknown Track') {
    try {
      const cleanTitle = cleanSearchTerm(title);
      const cleanArtist = artist && artist !== 'Unknown Artist' ? cleanSearchTerm(artist) : '';

      // 1. Direct Get Query
      let queryUrl = `https://lrclib.net/api/get?track_name=${encodeURIComponent(cleanTitle)}`;
      if (cleanArtist) queryUrl += `&artist_name=${encodeURIComponent(cleanArtist)}`;
      if (duration && duration > 0) queryUrl += `&duration=${Math.round(duration)}`;

      let response = await fetch(queryUrl, {
        headers: { 'User-Agent': 'SevenFM-Terminal-Music-Player/0.2.5 (https://github.com/NeekhillP)' },
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

      // 2. Search Fallback Query if exact match didn't resolve
      const searchUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(`${cleanArtist} ${cleanTitle}`.trim())}`;
      response = await fetch(searchUrl, {
        headers: { 'User-Agent': 'SevenFM-Terminal-Music-Player/0.2.5' },
      });

      if (response.ok) {
        const results = await response.json();
        if (Array.isArray(results) && results.length > 0) {
          // Find first result with synced lyrics or plain lyrics
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
      console.warn('LRCLIB lyric fetch telemetry failed:', err);
    }
  }

  // --- Tier 4: Terminal Telemetry Fallback ---
  return {
    lrc: `[00:00.00]◆ S E V E N . F M ◆ AUDIO BROADCAST
[00:02.00]TRACK: ${title || 'Audio Stream'}
[00:04.00]ARTIST: ${artist || 'Local Broadcast'}
[00:08.00]♪ Synchronized lyric telemetry not found on satellite network ♪
[00:15.00]♪ Direct audio feed streaming nominal ♪`,
    source: 'BROADCAST TELEMETRY',
    isSynced: false,
  };
}

/**
 * Converts un-timestamped plain lyrics into structured line items spread across duration
 */
function convertPlainTextToLrc(plainText, totalDuration = 180) {
  const lines = plainText.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return '[00:00.00]♪ Instrumental / No Lyrics ♪';

  const interval = Math.max(3, (totalDuration - 10) / lines.length);
  let result = `[00:00.00]◆ PLAIN LYRICS TELEMETRY ◆\n`;

  lines.forEach((line, idx) => {
    const timeSec = Math.round(5 + idx * interval);
    const mins = Math.floor(timeSec / 60).toString().padStart(2, '0');
    const secs = (timeSec % 60).toString().padStart(2, '0');
    result += `[${mins}:${secs}.00] ${line}\n`;
  });

  return result;
}

/**
 * Strips bracket tags like (Official Video), [Remastered], etc. for cleaner search
 */
function cleanSearchTerm(term) {
  return term
    .replace(/\s*(\(|\[)(feat\.|ft\.|official|audio|video|remaster|live|explicit|lyrics).*?(\)|\])/gi, '')
    .replace(/\.[^/.]+$/, '')
    .trim();
}
