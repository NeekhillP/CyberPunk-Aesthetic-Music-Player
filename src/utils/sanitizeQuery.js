/**
 * Multilingual and Regional Query Sanitizer with Comprehensive Clutter & YouTube Video Noise Stripper
 * Handles mixed scripts (e.g. Romanized + Devanagari / Nepali: "Kasari कसरी"),
 * strips YouTube/web video noise flags like "(Official Music Video)", "(Audio)", "[Lyrics]",
 * and produces clean display titles and prioritized search candidate queries for APIs.
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

  // 1. Primary Latin Combination (e.g. "Sushant KC Ji Chanta Matina" or "Yabesh Thapa Kasari")
  if (romanArtist && romanTitle && romanArtist !== 'Unknown Artist' && romanArtist !== 'Local Audio') {
    candidates.push(`${romanArtist} ${romanTitle}`.trim());
  }

  // 2. Primary Latin Song Title (e.g. "Ji Chanta Matina")
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
    searchCandidates: uniqueCandidates.length > 0 ? uniqueCandidates : [cleanTitleStr || rawTitle],
  };
}

/**
 * Strips bracketed clutter, audio suffixes, production tags, YouTube video metadata, and video notes
 * Examples:
 * - "Ji Chanta Matina (Official Music Video)" -> "Ji Chanta Matina"
 * - "Kasari कसरी (Official Audio) [Prod. by Storenvy]" -> "Kasari कसरी"
 * - "Sushant KC - Sarangi (Official Video) [4K]" -> "Sushant KC - Sarangi"
 */
export function cleanClutter(text) {
  if (!text || typeof text !== 'string') return '';

  return text
    // 1. Strip file extensions like .mp3, .wav, .m4a, .flac
    .replace(/\.[a-zA-Z0-9]{2,5}$/, '')
    // 2. Strip bracketed YouTube/Media metadata tags
    .replace(/\s*[\(\[](official\s*(music)?\s*video|music\s*video|official\s*audio|full\s*audio|audio|lyrics?|lyrical\s*video|4k|hd|hq|prod\..*?|produced\s*by.*?|visualizer|mv|full\s*song|remastered?|clean|explicit|studio\s*version|acoustic\s*version|live\s*session)[\)\]]/gi, '')
    // 3. Strip trailing separators followed by official video/audio keywords
    .replace(/\s*[-–—|]\s*(official\s*(music)?\s*video|music\s*video|official\s*audio|audio|lyrics?|lyrical\s*video|4k|hd|hq|mv).*$/gi, '')
    // 4. Strip trailing feature/producer credits if isolated at end
    .replace(/\s*(feat\.|ft\.|prod\.|produced\s*by).*$/gi, '')
    // 5. Clean extra whitespace
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Splits a string containing mixed alphabets (e.g., Latin + Devanagari/Non-Latin)
 */
export function splitScripts(str) {
  if (!str) return { latin: '', native: '' };

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
