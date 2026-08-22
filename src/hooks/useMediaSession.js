import { useEffect } from 'react';
import { usePlayerStore } from '../store/playerStore';

/**
 * OS Media Session API Hook
 * Connects SEVEN.FM to operating system media notifications, lock screen widgets,
 * and hardware media keys (Play, Pause, Prev, Next, Seek).
 */
export function useMediaSession() {
  const {
    playlist,
    currentTrackIndex,
    isPlaying,
    currentTime,
    duration,
    playbackRate,
    togglePlay,
    prevTrack,
    nextTrack,
    seek,
  } = usePlayerStore();

  const currentTrack = playlist[currentTrackIndex] || {};

  // 1. Update Media Metadata (Title, Artist, Album, Cover Art)
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;

    const coverSrc = currentTrack.coverUrl || currentTrack.artwork || currentTrack.cover || '/album_covers/loving_machine.jpg';
    
    // Resolve absolute URL for OS notification center
    const absoluteCoverUrl = coverSrc.startsWith('http') || coverSrc.startsWith('blob:') 
      ? coverSrc 
      : `${window.location.origin}${coverSrc}`;

    try {
      navigator.mediaSession.metadata = new window.MediaMetadata({
        title: currentTrack.title || 'SEVEN.FM Broadcast',
        artist: currentTrack.artist || 'Cyberpunk Audio Terminal',
        album: currentTrack.album || 'SEVEN.FM Session',
        artwork: [
          { src: absoluteCoverUrl, sizes: '96x96', type: 'image/jpeg' },
          { src: absoluteCoverUrl, sizes: '128x128', type: 'image/jpeg' },
          { src: absoluteCoverUrl, sizes: '192x192', type: 'image/jpeg' },
          { src: absoluteCoverUrl, sizes: '256x256', type: 'image/jpeg' },
          { src: absoluteCoverUrl, sizes: '384x384', type: 'image/jpeg' },
          { src: absoluteCoverUrl, sizes: '512x512', type: 'image/jpeg' },
        ],
      });
    } catch (e) {
      console.warn('MediaSession metadata error:', e);
    }
  }, [currentTrack.title, currentTrack.artist, currentTrack.album, currentTrack.coverUrl, currentTrack.cover]);

  // 2. Update Playback State ('playing' / 'paused')
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
  }, [isPlaying]);

  // 3. Update Position State for OS Seekbar & Lockscreen Scrubber
  useEffect(() => {
    if (!('mediaSession' in navigator) || !navigator.mediaSession.setPositionState) return;

    if (duration && duration > 0 && !isNaN(currentTime)) {
      try {
        navigator.mediaSession.setPositionState({
          duration: Math.max(0, duration),
          playbackRate: Math.max(0.1, playbackRate || 1.0),
          position: Math.min(duration, Math.max(0, currentTime)),
        });
      } catch (e) {
        // Silently catch state out of range errors
      }
    }
  }, [currentTime, duration, playbackRate]);

  // 4. Register Hardware Action Handlers
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;

    const actionHandlers = [
      ['play', () => togglePlay()],
      ['pause', () => togglePlay()],
      ['previoustrack', () => prevTrack()],
      ['nexttrack', () => nextTrack()],
      ['seekto', (details) => {
        if (details.seekTime !== undefined) {
          seek(details.seekTime);
        }
      }],
      ['seekbackward', (details) => {
        const offset = details.seekOffset || 5;
        seek(Math.max(0, currentTime - offset));
      }],
      ['seekforward', (details) => {
        const offset = details.seekOffset || 5;
        seek(Math.min(duration, currentTime + offset));
      }],
      ['stop', () => togglePlay()],
    ];

    actionHandlers.forEach(([action, handler]) => {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch (e) {
        // Action might not be supported in this browser
      }
    });

    return () => {
      actionHandlers.forEach(([action]) => {
        try {
          navigator.mediaSession.setActionHandler(action, null);
        } catch (_) {}
      });
    };
  }, [togglePlay, prevTrack, nextTrack, seek, currentTime, duration]);
}
