import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_TRACKS } from '../data/defaultTracks';
import { parseLRC, getActiveLyricIndex } from '../utils/lrcParser';
import { audioEngine, EQ_PRESETS } from '../audio/audioEngine';
import { resolveTrackArtwork } from '../utils/artworkService';
import { resolveTrackLyrics } from '../utils/lyricsService';
import { saveBatchTracksToVault, getAllVaultTracks, clearVault, deleteTrackFromVault } from '../services/dbService';

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
      playbackRate: 1.0,
      visualizerMode: 'BARS', // 'BARS' | 'WAVE' | 'RADAR'
      
      // Playback Modes
      repeatMode: 'ALL', // 'OFF' | 'ALL' | 'ONE'
      isShuffle: false,

      // DSP & EQ State
      isDspOpen: false,
      isDspEnabled: true,
      eqPreset: 'FLAT',
      eqGains: [0, 0, 0, 0, 0],

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

      // Initialize audio & IndexedDB vault on launch
      initAudioEngine: async () => {
        audioEngine.onEndedCallback = () => {
          const { repeatMode, isShuffle, playlist, currentTrackIndex, playTrack, seek } = get();

          if (repeatMode === 'ONE') {
            seek(0);
            playTrack(currentTrackIndex);
            return;
          }

          if (isShuffle && playlist.length > 1) {
            let nextIdx;
            do {
              nextIdx = Math.floor(Math.random() * playlist.length);
            } while (nextIdx === currentTrackIndex);
            playTrack(nextIdx);
            return;
          }

          if (repeatMode === 'ALL') {
            const nextIdx = (currentTrackIndex + 1) % playlist.length;
            playTrack(nextIdx);
            return;
          }

          // repeatMode === 'OFF'
          if (currentTrackIndex < playlist.length - 1) {
            playTrack(currentTrackIndex + 1);
          } else {
            set({ isPlaying: false, currentTime: 0 });
          }
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

        const { volume, isMuted, playbackRate, isDspEnabled, eqPreset, eqGains } = get();
        audioEngine.setVolume(volume);
        audioEngine.setMute(isMuted);
        audioEngine.setPlaybackRate(playbackRate || 1.0);
        audioEngine.isDspEnabled = isDspEnabled;
        audioEngine.eqGains = eqGains || [0, 0, 0, 0, 0];
        audioEngine.setEqPreset(eqPreset || 'FLAT');

        // Hydrate from IndexedDB Media Vault
        await get().loadVaultTracks();
      },

      loadVaultTracks: async () => {
        try {
          const vaultTracks = await getAllVaultTracks();
          if (vaultTracks && vaultTracks.length > 0) {
            set((state) => {
              const merged = [...DEFAULT_TRACKS, ...vaultTracks];
              const unique = Array.from(new Map(merged.map(t => [t.id, t])).values());
              return { playlist: unique };
            });
          }
        } catch (e) {
          console.warn('Vault hydration error:', e);
        }
      },

      clearVaultTracks: async () => {
        await clearVault();
        set({
          playlist: DEFAULT_TRACKS,
          currentTrackIndex: 0,
        });
        get().playTrack(0);
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
        const { playlist, playbackRate } = get();
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

        audioEngine.setPlaybackRate(playbackRate || 1.0);

        if (track.audioUrl) {
          await audioEngine.loadAndPlay(track.audioUrl, 0);
        }
      },

      nextTrack: () => {
        const { currentTrackIndex, playlist, playTrack, isShuffle } = get();
        if (isShuffle && playlist.length > 1) {
          let nextIdx;
          do {
            nextIdx = Math.floor(Math.random() * playlist.length);
          } while (nextIdx === currentTrackIndex);
          playTrack(nextIdx);
          return;
        }
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

      setPlaybackRate: (rate) => {
        audioEngine.setPlaybackRate(rate);
        set({ playbackRate: rate });
      },

      setVisualizerMode: (mode) => {
        set({ visualizerMode: mode });
      },

      // Playback Modes
      toggleRepeatMode: () => {
        const modes = ['OFF', 'ALL', 'ONE'];
        const current = get().repeatMode;
        const nextMode = modes[(modes.indexOf(current) + 1) % modes.length];
        set({ repeatMode: nextMode });
      },

      toggleShuffle: () => {
        set((state) => ({ isShuffle: !state.isShuffle }));
      },

      // Reordering & Queue Management
      moveTrackUp: (index) => {
        if (index <= 0) return;
        const { playlist, currentTrackIndex } = get();
        const updated = [...playlist];
        const temp = updated[index];
        updated[index] = updated[index - 1];
        updated[index - 1] = temp;

        let newCurrent = currentTrackIndex;
        if (currentTrackIndex === index) newCurrent = index - 1;
        else if (currentTrackIndex === index - 1) newCurrent = index;

        set({ playlist: updated, currentTrackIndex: newCurrent });
      },

      moveTrackDown: (index) => {
        const { playlist, currentTrackIndex } = get();
        if (index >= playlist.length - 1) return;
        const updated = [...playlist];
        const temp = updated[index];
        updated[index] = updated[index + 1];
        updated[index + 1] = temp;

        let newCurrent = currentTrackIndex;
        if (currentTrackIndex === index) newCurrent = index + 1;
        else if (currentTrackIndex === index + 1) newCurrent = index;

        set({ playlist: updated, currentTrackIndex: newCurrent });
      },

      reorderPlaylist: (startIndex, endIndex) => {
        const { playlist, currentTrackIndex } = get();
        const updated = Array.from(playlist);
        const [removed] = updated.splice(startIndex, 1);
        updated.splice(endIndex, 0, removed);

        let newCurrent = currentTrackIndex;
        if (currentTrackIndex === startIndex) {
          newCurrent = endIndex;
        } else if (startIndex < currentTrackIndex && endIndex >= currentTrackIndex) {
          newCurrent = currentTrackIndex - 1;
        } else if (startIndex > currentTrackIndex && endIndex <= currentTrackIndex) {
          newCurrent = currentTrackIndex + 1;
        }

        set({ playlist: updated, currentTrackIndex: newCurrent });
      },

      // DSP Actions
      setDspOpen: (open) => set({ isDspOpen: open }),
      
      toggleDsp: () => {
        const { isDspEnabled } = get();
        const updated = !isDspEnabled;
        audioEngine.toggleDsp(updated);
        set({ isDspEnabled: updated });
      },

      setEqPreset: (presetName) => {
        audioEngine.setEqPreset(presetName);
        set({
          eqPreset: presetName,
          eqGains: [...(EQ_PRESETS[presetName] || [0, 0, 0, 0, 0])],
        });
      },

      setEqBandGain: (bandIdx, gainDb) => {
        audioEngine.setEqBandGain(bandIdx, gainDb);
        const newGains = [...get().eqGains];
        newGains[bandIdx] = gainDb;
        set({
          eqGains: newGains,
          eqPreset: 'CUSTOM',
        });
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

      swapTrackMetadata: async (index) => {
        const { playlist, currentTrackIndex, currentTime } = get();
        const targetIndex = index !== undefined ? index : currentTrackIndex;
        const track = playlist[targetIndex];
        if (!track) return;

        const newTitle = track.artist || 'Unknown Track';
        const newArtist = track.title || 'Unknown Artist';

        const artworkResult = await resolveTrackArtwork({
          title: newTitle,
          artist: newArtist,
          album: track.album,
        });

        const lyricResult = await resolveTrackLyrics({
          title: newTitle,
          artist: newArtist,
          album: track.album,
          duration: track.duration,
        });

        const updatedPlaylist = [...playlist];
        const parsed = parseLRC(lyricResult.lrc);

        updatedPlaylist[targetIndex] = {
          ...track,
          title: newTitle,
          artist: newArtist,
          coverUrl: artworkResult.artworkUrl,
          artwork: artworkResult.artworkUrl,
          cover: artworkResult.artworkUrl,
          artworkSource: artworkResult.source,
          lrc: lyricResult.lrc,
          lyricSource: lyricResult.source,
          isSynced: lyricResult.isSynced,
        };

        set({
          playlist: updatedPlaylist,
          parsedLyrics: parsed,
          activeLyricIndex: getActiveLyricIndex(parsed.lines, currentTime),
        });
      },

      editTrackMetadata: async (index, newTitle, newArtist) => {
        const { playlist, currentTrackIndex, currentTime } = get();
        const targetIndex = index !== undefined ? index : currentTrackIndex;
        const track = playlist[targetIndex];
        if (!track) return;

        const artworkResult = await resolveTrackArtwork({
          title: newTitle,
          artist: newArtist,
          album: track.album,
        });

        const lyricResult = await resolveTrackLyrics({
          title: newTitle,
          artist: newArtist,
          album: track.album,
          duration: track.duration,
        });

        const updatedPlaylist = [...playlist];
        const parsed = parseLRC(lyricResult.lrc);

        updatedPlaylist[targetIndex] = {
          ...track,
          title: newTitle,
          artist: newArtist,
          coverUrl: artworkResult.artworkUrl,
          artwork: artworkResult.artworkUrl,
          cover: artworkResult.artworkUrl,
          artworkSource: artworkResult.source,
          lrc: lyricResult.lrc,
          lyricSource: lyricResult.source,
          isSynced: lyricResult.isSynced,
        };

        set({
          playlist: updatedPlaylist,
          parsedLyrics: parsed,
          activeLyricIndex: getActiveLyricIndex(parsed.lines, currentTime),
        });
      },

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

      addBatchTracks: async (newTracks) => {
        if (!newTracks || newTracks.length === 0) return;
        
        await saveBatchTracksToVault(newTracks);

        set((state) => {
          const updated = [...state.playlist, ...newTracks];
          return { playlist: updated };
        });
        const { playlist, playTrack } = get();
        playTrack(playlist.length - newTracks.length);
      },

      removeTrack: async (index) => {
        const { playlist, currentTrackIndex, playTrack } = get();
        if (playlist.length <= 1) return;
        
        const trackToRemove = playlist[index];
        if (trackToRemove && trackToRemove.id) {
          await deleteTrackFromVault(trackToRemove.id);
        }

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
        playbackRate: state.playbackRate,
        visualizerMode: state.visualizerMode,
        repeatMode: state.repeatMode,
        isShuffle: state.isShuffle,
        isDspEnabled: state.isDspEnabled,
        eqPreset: state.eqPreset,
        eqGains: state.eqGains,
        currentTrackIndex: state.currentTrackIndex,
      }),
    }
  )
);
