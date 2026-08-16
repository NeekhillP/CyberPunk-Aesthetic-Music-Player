/**
 * IndexedDB Media Vault Service for SEVEN.FM
 * Permanently stores custom uploaded audio files (Blob), cover art, and lyrics
 * so imported tracks persist across browser reloads.
 */

const DB_NAME = 'SevenFM_Vault_DB';
const DB_VERSION = 1;
const STORE_NAME = 'tracks';

let dbInstance = null;

export async function getDB() {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = (e) => {
      dbInstance = e.target.result;
      resolve(dbInstance);
    };

    request.onerror = (e) => {
      console.error('IndexedDB open error:', e);
      reject(e);
    };
  });
}

/**
 * Saves a track to IndexedDB. If the audioUrl is an active blob URL, fetches the blob to store binary.
 */
export async function saveTrackToVault(track) {
  try {
    const db = await getDB();
    let audioBlob = track.audioBlob || null;
    let coverBlob = track.coverBlob || null;

    // Convert audioUrl to blob if needed
    if (!audioBlob && track.audioUrl && track.audioUrl.startsWith('blob:')) {
      try {
        const res = await fetch(track.audioUrl);
        audioBlob = await res.blob();
      } catch (_) {}
    }

    // Convert coverUrl to blob if needed
    if (!coverBlob && track.coverUrl && track.coverUrl.startsWith('blob:')) {
      try {
        const res = await fetch(track.coverUrl);
        coverBlob = await res.blob();
      } catch (_) {}
    }

    const record = {
      id: track.id,
      title: track.title,
      artist: track.artist,
      album: track.album || '',
      duration: track.duration || 180,
      lrc: track.lrc || '',
      lyricSource: track.lyricSource || 'VAULT STORED',
      isSynced: Boolean(track.isSynced),
      station: track.station || 'VAULT // LOCAL',
      genre: track.genre || 'LOCAL MEDIA',
      coverUrl: track.coverUrl && !track.coverUrl.startsWith('blob:') ? track.coverUrl : null,
      audioBlob,
      coverBlob,
      savedAt: Date.now(),
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(record);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to save track to vault:', err);
    return false;
  }
}

/**
 * Saves a batch of tracks to IndexedDB
 */
export async function saveBatchTracksToVault(tracks) {
  for (const track of tracks) {
    await saveTrackToVault(track);
  }
}

/**
 * Retrieves all stored tracks from the vault and creates live Object URLs
 */
export async function getAllVaultTracks() {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => {
        const records = req.result || [];
        const hydrated = records.map((rec) => {
          let audioUrl = null;
          let coverUrl = rec.coverUrl || '/album_covers/loving_machine.jpg';

          if (rec.audioBlob) {
            audioUrl = URL.createObjectURL(rec.audioBlob);
          }
          if (rec.coverBlob) {
            coverUrl = URL.createObjectURL(rec.coverBlob);
          }

          return {
            id: rec.id,
            title: rec.title,
            artist: rec.artist,
            album: rec.album,
            duration: rec.duration,
            lrc: rec.lrc,
            lyricSource: rec.lyricSource,
            isSynced: rec.isSynced,
            station: rec.station,
            genre: rec.genre,
            coverUrl,
            artwork: coverUrl,
            cover: coverUrl,
            audioUrl,
            audioBlob: rec.audioBlob,
            coverBlob: rec.coverBlob,
            isVaultTrack: true,
          };
        });
        resolve(hydrated);
      };

      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to read vault tracks:', err);
    return [];
  }
}

/**
 * Deletes a single track from the vault
 */
export async function deleteTrackFromVault(id) {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to delete track from vault:', err);
    return false;
  }
}

/**
 * Clears all custom tracks from IndexedDB
 */
export async function clearVault() {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.clear();
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to clear vault:', err);
    return false;
  }
}
