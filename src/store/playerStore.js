import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_TRACKS } from '../data/defaultTracks';
import { parseLRC, getActiveLyricIndex } from '../utils/lrcParser';
import { audioEngine } from '../audio/audioEngine';

export const usePlayerStore = create(
  persist(
    (set, get) => ({
      playlist: DEFAULT_TRACKS,
      currentTrackIndex: 0,
      isPlaying: false,
      currentTime: 0,
      duration: DEFAULT_TRACKS[0].duration,
      volume: 0.8,
      isMuted: false,
      autoScroll: true,
      
      // Active parsed lyrics
      parsedLyrics: parseLRC(DEFAULT_TRACKS[0].lrc),
      activeLyricIndex: 0,

      // Modal states
      isPlaylistOpen: false,
      isUploadOpen: false,
      isSettingsOpen: false,

      // Station info
      stationName: '◆ S E V E N . F M ◆',
      syncStatus: 'online • sync ✔',

      // Initialize audio callbacks
      initAudioEngine: () => {
        audioEngine.onEndedCallback = () => {
          get().nextTrack();
        };

        audioEngine.onTimeUpdateCallback = (time) => {
          const { parsedLyrics } = get();
          const activeIdx = getActiveLyricIndex(parsedLyrics.lines, time);
          set({ currentTime: time, activeLyricIndex: activeIdx });
        };

        audioEngine.onDurationChangeCallback = (dur) => {
          if (dur && !isNaN(dur)) {
            set({ duration: dur });
          }
        };

        const { volume, isMuted } = get();
        audioEngine.setVolume(volume);
        audioEngine.setMute(isMuted);
      },

      // Actions
      togglePlay: async () => {
        const { isPlaying, playlist, currentTrackIndex, currentTime } = get();
        const currentTrack = playlist[currentTrackIndex] || playlist[0];

        if (isPlaying) {
          audioEngine.pause();
          set({ isPlaying: false });
        } else {
          set({ isPlaying: true });
          if (currentTrack?.audioUrl) {
            await audioEngine.loadAndPlay(currentTrack.audioUrl, currentTime);
          }
        }
      },

      playTrack: async (index) => {
        const { playlist } = get();
        if (index < 0 || index >= playlist.length) return;

        const track = playlist[index];
        const parsed = parseLRC(track.lrc || '');

        set({
          currentTrackIndex: index,
          currentTime: 0,
          duration: track.duration || 180,
          parsedLyrics: parsed,
          activeLyricIndex: 0,
          isPlaying: true,
        });

        if (track.audioUrl) {
          await audioEngine.loadAndPlay(track.audioUrl, 0);
        }
      },

      nextTrack: () => {
        const { currentTrackIndex, playlist, playTrack } = get();
        const nextIndex = (currentTrackIndex + 1) % playlist.length;
        playTrack(nextIndex);
      },

      prevTrack: () => {
        const { currentTrackIndex, playlist, playTrack, currentTime, seek } = get();
        if (currentTime > 3) {
          seek(0);
          return;
        }
        const prevIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
        playTrack(prevIndex);
      },

      seek: (seconds) => {
        const { duration, parsedLyrics } = get();
        const target = Math.max(0, Math.min(duration || 100, seconds));
        audioEngine.seek(target);
        
        const activeIdx = getActiveLyricIndex(parsedLyrics.lines, target);
        set({ currentTime: target, activeLyricIndex: activeIdx });
      },

      setVolume: (val) => {
        audioEngine.setVolume(val);
        set({ volume: val, isMuted: val === 0 });
      },

      toggleMute: () => {
        const { isMuted } = get();
        audioEngine.setMute(!isMuted);
        set({ isMuted: !isMuted });
      },

      toggleAutoScroll: () => {
        set((state) => ({ autoScroll: !state.autoScroll }));
      },

      setCurrentTime: (time) => {
        const { parsedLyrics } = get();
        const activeIdx = getActiveLyricIndex(parsedLyrics.lines, time);
        set({ currentTime: time, activeLyricIndex: activeIdx });
      },

      setDuration: (duration) => {
        set({ duration });
      },

      // Update current track's lyrics dynamically (from manual paste or live edit)
      updateActiveTrackLyrics: (lrcText, sourceLabel = 'MANUAL PASTE') => {
        const { playlist, currentTrackIndex, currentTime } = get();
        const parsed = parseLRC(lrcText);
        const updatedPlaylist = [...playlist];
        if (updatedPlaylist[currentTrackIndex]) {
          updatedPlaylist[currentTrackIndex] = {
            ...updatedPlaylist[currentTrackIndex],
            lrc: lrcText,
            lyricSource: sourceLabel,
            isSynced: lrcText.includes('['),
          };
        }

        const activeIdx = getActiveLyricIndex(parsed.lines, currentTime);
        set({
          playlist: updatedPlaylist,
          parsedLyrics: parsed,
          activeLyricIndex: activeIdx,
        });
      },

      addBatchTracks: (newTracks) => {
        if (!newTracks || newTracks.length === 0) return;
        set((state) => {
          const updated = [...state.playlist, ...newTracks];
          return { playlist: updated };
        });
        // Auto play the first newly added track
        const { playlist, playTrack } = get();
        playTrack(playlist.length - newTracks.length);
      },

      removeTrack: (index) => {
        const { playlist, currentTrackIndex, playTrack } = get();
        if (playlist.length <= 1) return;
        
        const updated = playlist.filter((_, i) => i !== index);
        let newIndex = currentTrackIndex;
        if (index === currentTrackIndex) {
          newIndex = Math.min(index, updated.length - 1);
        } else if (index < currentTrackIndex) {
          newIndex = currentTrackIndex - 1;
        }

        set({ playlist: updated, currentTrackIndex: newIndex });
        if (index === currentTrackIndex) {
          playTrack(newIndex);
        }
      },

      setPlaylistOpen: (open) => set({ isPlaylistOpen: open }),
      setUploadOpen: (open) => set({ isUploadOpen: open }),
      setSettingsOpen: (open) => set({ isSettingsOpen: open }),
    }),
    {
      name: 'seven-fm-player-settings',
      partialize: (state) => ({
        volume: state.volume,
        isMuted: state.isMuted,
        autoScroll: state.autoScroll,
        currentTrackIndex: state.currentTrackIndex,
      }),
    }
  )
);
