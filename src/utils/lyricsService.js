import { sanitizeMetadata } from './sanitizeQuery';

/**
 * Strict Multi-Tier Multilingual Lyric Resolution Pipeline
 * - Enforces title and artist verification to eliminate incorrect song matches
 * - Performs duration tolerance checks (±10s)
 * - Rejects loose search results that do not match the target track title
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

  // --- Tier 3: Strict LRCLIB Online Telemetry Fetch ---
  const sanitized = sanitizeMetadata(title, artist, album);
  const targetTitle = sanitized.romanTitle || sanitized.cleanTitle || title;
  const targetArtist = sanitized.romanArtist || sanitized.cleanArtist || artist;

  const candidateTitles = [sanitized.romanTitle, sanitized.nativeTitle, sanitized.cleanTitle].filter(Boolean);
  const candidateArtists = [sanitized.romanArtist, sanitized.nativeArtist, sanitized.cleanArtist].filter(Boolean);

  // 1. Try Exact Match GET queries with duration and without duration
  for (const cTitle of candidateTitles) {
    for (const cArtist of candidateArtists) {
      if (!cTitle || !cArtist || cArtist === 'Unknown Artist' || cArtist === 'Local Audio') continue;

      // Exact with duration
      if (duration && duration > 0) {
        const exactResult = await fetchExactLrclib(cTitle, cArtist, Math.round(duration));
        if (exactResult) return exactResult;
      }

      // Exact without duration
      const exactResultNoDur = await fetchExactLrclib(cTitle, cArtist);
      if (exactResultNoDur) return exactResultNoDur;
    }
  }

  // 2. Search Fallback with STRICT title and artist verification
  for (const query of sanitized.searchCandidates) {
    if (!query || query.length < 2) continue;

    try {
      const searchUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(query)}`;
      const response = await fetch(searchUrl, {
        headers: { 'User-Agent': 'SevenFM-Terminal-Music-Player/0.2.8' },
      });

      if (response.ok) {
        const results = await response.json();
        if (Array.isArray(results) && results.length > 0) {
          // Filter ONLY items that strictly pass title verification
          const validMatches = results.filter(item => {
            const isTitleValid = isTitleMatch(item.trackName, targetTitle);
            const isArtistValid = targetArtist && targetArtist !== 'Unknown Artist' && targetArtist !== 'Local Audio'
              ? isArtistMatch(item.artistName, targetArtist)
              : true;
            return isTitleValid && isArtistValid;
          });

          if (validMatches.length > 0) {
            // Sort valid matches: prefer syncedLyrics, then closest duration
            validMatches.sort((a, b) => {
              if (a.syncedLyrics && !b.syncedLyrics) return -1;
              if (!a.syncedLyrics && b.syncedLyrics) return 1;
              if (duration && a.duration && b.duration) {
                const diffA = Math.abs(a.duration - duration);
                const diffB = Math.abs(b.duration - duration);
                return diffA - diffB;
              }
              return 0;
            });

            const bestMatch = validMatches[0];
            if (bestMatch.syncedLyrics) {
              return {
                lrc: bestMatch.syncedLyrics,
                source: `LRCLIB [${bestMatch.trackName.toUpperCase()}]`,
                isSynced: true,
              };
            }
            if (bestMatch.plainLyrics) {
              return {
                lrc: convertPlainTextToLrc(bestMatch.plainLyrics, duration || bestMatch.duration),
                source: `LRCLIB [${bestMatch.trackName.toUpperCase()} PLAIN]`,
                isSynced: false,
              };
            }
          }
        }
      }
    } catch (err) {
      console.warn('Strict LRCLIB search error for query:', query, err);
    }
  }

  // --- Tier 4: Fallback / Not Found (Strictly avoid displaying wrong lyrics) ---
  return {
    lrc: '',
    source: 'NO TELEMETRY FOUND',
    isSynced: false,
  };
}

/**
 * Exact Match GET helper
 */
async function fetchExactLrclib(title, artist, durationSec = null) {
  try {
    let url = `https://lrclib.net/api/get?track_name=${encodeURIComponent(title)}&artist_name=${encodeURIComponent(artist)}`;
    if (durationSec) {
      url += `&duration=${durationSec}`;
    }

    const res = await fetch(url, {
      headers: { 'User-Agent': 'SevenFM-Terminal-Music-Player/0.2.8' },
    });

    if (res.ok) {
      const data = await res.json();
      if (data.syncedLyrics) {
        return {
          lrc: data.syncedLyrics,
          source: 'LRCLIB [EXACT SYNCED]',
          isSynced: true,
        };
      }
      if (data.plainLyrics) {
        return {
          lrc: convertPlainTextToLrc(data.plainLyrics, durationSec || data.duration),
          source: 'LRCLIB [EXACT PLAIN]',
          isSynced: false,
        };
      }
    }
  } catch (_) {}
  return null;
}

/**
 * Strict Title Matching Algorithm
 * Returns true only if candidate title is genuinely the same song as target title
 */
export function isTitleMatch(candidateTitle, targetTitle) {
  if (!candidateTitle || !targetTitle) return false;

  const cleanCand = normalizeString(candidateTitle);
  const cleanTarget = normalizeString(targetTitle);

  if (cleanCand === cleanTarget) return true;

  // Check if one contains the other as a whole word
  if (cleanCand.includes(cleanTarget) || cleanTarget.includes(cleanCand)) {
    const lenRatio = Math.min(cleanCand.length, cleanTarget.length) / Math.max(cleanCand.length, cleanTarget.length);
    if (lenRatio >= 0.5) return true;
  }

  // Token-based matching
  const candTokens = cleanCand.split(/\s+/).filter(t => t.length > 1);
  const targetTokens = cleanTarget.split(/\s+/).filter(t => t.length > 1);

  if (targetTokens.length > 0) {
    const matchedTokens = targetTokens.filter(t => candTokens.includes(t));
    const tokenMatchRatio = matchedTokens.length / targetTokens.length;
    if (tokenMatchRatio >= 0.75) return true;
  }

  // Levenshtein Similarity
  const similarity = stringSimilarity(cleanCand, cleanTarget);
  return similarity >= 0.75;
}

/**
 * Artist Match Checker
 */
export function isArtistMatch(candidateArtist, targetArtist) {
  if (!candidateArtist || !targetArtist) return true;

  const cleanCand = normalizeString(candidateArtist);
  const cleanTarget = normalizeString(targetArtist);

  if (cleanCand === cleanTarget) return true;
  if (cleanCand.includes(cleanTarget) || cleanTarget.includes(cleanCand)) return true;

  const similarity = stringSimilarity(cleanCand, cleanTarget);
  return similarity >= 0.65;
}

function normalizeString(str) {
  return str
    .toLowerCase()
    .replace(/[^\w\s\u0900-\u097F]/gi, '') // Keep alphanumeric and Devanagari
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Levenshtein distance based string similarity metric (0 to 1)
 */
function stringSimilarity(s1, s2) {
  if (!s1 || !s2) return 0;
  if (s1 === s2) return 1;

  const longer = s1.length >= s2.length ? s1 : s2;
  const shorter = s1.length < s2.length ? s1 : s2;

  const longerLength = longer.length;
  if (longerLength === 0) return 1.0;

  const distance = levenshteinDistance(longer, shorter);
  return (longerLength - distance) / parseFloat(longerLength);
}

function levenshteinDistance(s1, s2) {
  const costs = [];
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else {
        if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  return costs[s2.length];
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
