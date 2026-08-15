/**
 * Multilingual and Regional Query Sanitizer
 * Handles mixed scripts (e.g. Romanized + Devanagari / Nepali: "Kasari कसरी"),
 * removes title clutter, and produces prioritized search candidate queries for APIs.
 */

export function sanitizeMetadata(rawTitle = '', rawArtist = '', rawAlbum = '') {
  const cleanTitleStr = cleanClutter(rawTitle);
  const cleanArtistStr = cleanClutter(rawArtist);
  const cleanAlbumStr = cleanClutter(rawAlbum);

  // Split into Latin (Romanized) and Native scripts
  const titleScripts = splitScripts(cleanTitleStr);
  const artistScripts = splitScripts(cleanArtistStr);

  const romanTitle = titleScripts.latin || cleanTitleStr;
  const nativeTitle = titleScripts.native || '';
  const romanArtist = artistScripts.latin || cleanArtistStr;
  const nativeArtist = artistScripts.native || '';

  // Generate prioritized search candidates
  const candidates = [];

  // 1. Primary Latin Combination (e.g. "Yabesh Thapa Kasari")
  if (romanArtist && romanTitle && romanArtist !== 'Unknown Artist' && romanArtist !== 'Local Audio') {
    candidates.push(`${romanArtist} ${romanTitle}`.trim());
  }

  // 2. Primary Latin Song Title (e.g. "Kasari")
  if (romanTitle) {
    candidates.push(romanTitle.trim());
  }

  // 3. Native Script Combination (e.g. "Yabesh Thapa कसरी" or "याबेश थापा कसरी")
  if (nativeTitle) {
    const artistToUse = nativeArtist || romanArtist;
    if (artistToUse && artistToUse !== 'Unknown Artist') {
      candidates.push(`${artistToUse} ${nativeTitle}`.trim());
    }
    candidates.push(nativeTitle.trim());
  }

  // 4. Raw Clean fallback
  if (cleanTitleStr && !candidates.includes(cleanTitleStr)) {
    candidates.push(cleanTitleStr);
  }

  // Deduplicate and filter non-empty
  const uniqueCandidates = Array.from(new Set(candidates.filter(Boolean)));

  return {
    rawTitle,
    rawArtist,
    cleanTitle: cleanTitleStr,
    cleanArtist: cleanArtistStr,
    cleanAlbum: cleanAlbumStr,
    romanTitle,
    nativeTitle,
    romanArtist,
    nativeArtist,
    searchCandidates: uniqueCandidates.length > 0 ? uniqueCandidates : [rawTitle],
  };
}

/**
 * Strips bracketed clutter, audio suffixes, production tags, and video notes
 */
export function cleanClutter(text) {
  if (!text || typeof text !== 'string') return '';

  return text
    .replace(/\.[a-zA-Z0-9]{2,5}$/, '') // Strip extensions like .mp3, .wav
    .replace(/\s*[\(\[](feat\.|ft\.|official|audio|video|remaster|live|explicit|lyrics|hd|4k|hq|music video|prod\.|produced by|prod by|lyrical video|visualizer|mv|neer|full audio|special).*?[\)\]]/gi, '')
    .replace(/\s*-\s*(official|audio|video|lyrics|hd|4k|hq|mv).*$/gi, '')
    .replace(/\s*(feat\.|ft\.|prod\.|produced by).*$/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Splits a string containing mixed alphabets (e.g., Latin + Devanagari/Non-Latin)
 */
export function splitScripts(str) {
  if (!str) return { latin: '', native: '' };

  // Devanagari range: \u0900-\u097F
  // General Non-Latin: \u0900-\u097F\u0400-\u04FF\u4E00-\u9FFF\u3040-\u30FF\uAC00-\uD7AF
  const devanagariRegex = /[\u0900-\u097F]+/g;
  const latinRegex = /[a-zA-Z0-9\s'’-]+/g;

  const devanagariMatches = str.match(devanagariRegex);
  const latinMatches = str.match(latinRegex);

  const native = devanagariMatches ? devanagariMatches.join(' ').trim() : '';
  const latin = latinMatches ? latinMatches.join(' ').replace(/\s{2,}/g, ' ').trim() : '';

  return {
    latin: latin.length >= 2 ? latin : '',
    native: native.length >= 1 ? native : '',
  };
}
