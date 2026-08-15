/**
 * Robust LRC lyric parser with timestamp sorting and metadata extraction
 */

export function parseLRC(lrcText) {
  if (!lrcText || typeof lrcText !== 'string') {
    return { metadata: {}, lines: [] };
  }

  const lines = lrcText.split('\n');
  const parsedLines = [];
  const metadata = {};

  const timeRegex = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/g;
  const metaRegex = /\[(ti|ar|al|au|by|length):([^\]]+)\]/i;

  for (let rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    // Check for metadata tags
    const metaMatch = trimmed.match(metaRegex);
    if (metaMatch) {
      metadata[metaMatch[1].toLowerCase()] = metaMatch[2].trim();
      continue;
    }

    // Match all timestamps on the line (e.g. [00:12.30][01:14.20] text)
    const timestamps = [];
    let match;
    timeRegex.lastIndex = 0;

    while ((match = timeRegex.exec(trimmed)) !== null) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const milliseconds = match[3] 
        ? (match[3].length === 2 ? parseInt(match[3], 10) * 10 : parseInt(match[3], 10))
        : 0;
      
      const totalSeconds = minutes * 60 + seconds + milliseconds / 1000;
      timestamps.push(totalSeconds);
    }

    // Extract text after stripping out all [xx:xx.xx] tags
    const text = trimmed.replace(timeRegex, '').trim();

    if (timestamps.length > 0) {
      for (const time of timestamps) {
        parsedLines.push({
          time,
          text: text || '♪',
        });
      }
    }
  }

  // Sort chronologically
  parsedLines.sort((a, b) => a.time - b.time);

  return {
    metadata,
    lines: parsedLines,
  };
}

/**
 * Finds the index of the currently active lyric line for a given time
 */
export function getActiveLyricIndex(lines, currentTime) {
  if (!lines || lines.length === 0) return -1;
  if (currentTime < lines[0].time) return 0;

  // Binary search for efficiency
  let low = 0;
  let high = lines.length - 1;
  let result = 0;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (lines[mid].time <= currentTime) {
      result = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return result;
}

/**
 * Format seconds to terminal mm:ss format
 */
export function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
