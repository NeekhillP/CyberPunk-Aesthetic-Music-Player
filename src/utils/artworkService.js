/**
 * Robust Multi-Tier Cover Art Resolution Service
 * Tier 1: Embedded ID3 APIC image (passed as blob URL or data URL)
 * Tier 2: Online iTunes Search API (returns high-res 600x600 artwork)
 * Tier 3: Cyberpunk Default Terminal Artwork Fallback
 */

const DEFAULT_COVER = '/album_covers/loving_machine.jpg';

export async function resolveTrackArtwork({ title, artist, album, embeddedArtworkUrl }) {
  // --- Tier 1: Embedded ID3 Art ---
  if (embeddedArtworkUrl) {
    return {
      artworkUrl: embeddedArtworkUrl,
      source: 'ID3 EMBEDDED APIC',
      isCustom: true,
    };
  }

  // --- Tier 2: Online iTunes Search API Lookup ---
  if (title && title !== 'Unknown Track' && title !== 'Custom Terminal Track') {
    try {
      const cleanTitle = cleanTrackTitle(title);
      const cleanArtist = artist && artist !== 'Unknown Artist' && artist !== 'Local Audio' 
        ? cleanTrackTitle(artist) 
        : '';

      const searchTerms = [
        `${cleanArtist} ${cleanTitle}`.trim(),
        cleanTitle,
      ];

      for (const query of searchTerms) {
        if (!query) continue;

        const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=1`;
        const res = await fetch(url);

        if (res.ok) {
          const data = await res.json();
          if (data.results && data.results.length > 0) {
            const item = data.results[0];
            if (item.artworkUrl100) {
              // Replace standard 100x100 thumbnail with high-resolution 600x600 or 1000x1000
              const highResArtwork = item.artworkUrl100
                .replace('100x100bb', '600x600bb')
                .replace('100x100', '600x600');

              return {
                artworkUrl: highResArtwork,
                source: 'ITUNES HD TELEMETRY',
                isCustom: true,
              };
            }
          }
        }
      }

      // Try searching for album entity if available
      if (album && album !== 'Local Broadcast') {
        const albumUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(`${cleanArtist} ${album}`.trim())}&entity=album&limit=1`;
        const res = await fetch(albumUrl);
        if (res.ok) {
          const data = await res.json();
          if (data.results && data.results.length > 0 && data.results[0].artworkUrl100) {
            const highResArtwork = data.results[0].artworkUrl100.replace('100x100bb', '600x600bb');
            return {
              artworkUrl: highResArtwork,
              source: 'ITUNES ALBUM HD',
              isCustom: true,
            };
          }
        }
      }
    } catch (err) {
      console.warn('Online iTunes artwork fetch warning:', err);
    }
  }

  // --- Tier 3: Cyberpunk Default Artwork Fallback ---
  return {
    artworkUrl: DEFAULT_COVER,
    source: 'SEVEN.FM DEFAULT',
    isCustom: false,
  };
}

/**
 * Strips bracketed text, feature tags, audio extensions, and noise from track titles
 */
function cleanTrackTitle(title) {
  return title
    .replace(/\s*[\(\[](feat\.|ft\.|official|audio|video|remaster|live|explicit|lyrics|hd|4k|hq|music video).*?[\)\]]/gi, '')
    .replace(/\.[^/.]+$/, '') // strip file extension
    .trim();
}
