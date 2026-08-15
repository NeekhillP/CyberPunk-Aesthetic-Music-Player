import { create } from 'zustand';
import { DEFAULT_TRACKS } from '../data/defaultTracks';
import { parseLRC, getActiveLyricIndex } from '../utils/lrcParser';
import { audioEngine } from '../audio/audioEngine';

export const usePlayerStore = create((set, get) => ({
  playlist: DEFAULT_TRACKS,
  currentTrackIndex: 0,
  isPlaying: false,
  currentTime: 0,
  duration: DEFAULT_TRACKS[0].duration,
  volume: 0.8,
  isMuted: false,
  autoScroll: true,
  
  // Parsed lyrics for active track
  parsedLyrics: parseLRC(DEFAULT_TRACKS[0].lrc),
  activeLyricIndex: 0,

  // Modals
  isPlaylistOpen: false,
  isUploadOpen: false,
  isSettingsOpen: false,

  // Station info
  stationName: '◆ S E V E N . F M ◆',
  syncStatus: 'online • sync ✔',

  // Actions
  togglePlay: () => {
    const { isPlaying, playlist, currentTrackIndex, currentTime } = get();
    const currentTrack = playlist[currentTrackIndex];

    if (isPlaying) {
      audioEngine.stopSynth();
      if (audioEngine.audioElement) {
        audioEngine.audioElement.pause();
      }
      set({ isPlaying: false });
    } else {
      // Play
      if (currentTrack.audioUrl) {
        audioEngine.loadAudioSource(currentTrack.audioUrl);
        audioEngine.audioElement.currentTime = currentTime;
        audioEngine.audioElement.play().catch(e => console.warn("Audio play error:", e));
      } else {
        // Play synthesizer track
        audioEngine.playSynthTrack(currentTrack, currentTime);
      }
      set({ isPlaying: true });
    }
  },

  playTrack: (index) => {
    const { playlist } = get();
    if (index < 0 || index >= playlist.length) return;

    audioEngine.stopSynth();
    const track = playlist[index];
    const parsed = parseLRC(track.lrc);

    set({
      currentTrackIndex: index,
      currentTime: 0,
      duration: track.duration || 180,
      parsedLyrics: parsed,
      activeLyricIndex: 0,
      isPlaying: true,
    });

    if (track.audioUrl) {
      audioEngine.loadAudioSource(track.audioUrl);
      audioEngine.audioElement.currentTime = 0;
      audioEngine.audioElement.play().catch(e => console.warn(e));
    } else {
      audioEngine.playSynthTrack(track, 0);
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
    const target = Math.max(0, Math.min(duration, seconds));
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
    const { parsedLyrics, duration, isPlaying, nextTrack } = get();
    if (time >= duration && isPlaying) {
      nextTrack();
      return;
    }
    const activeIdx = getActiveLyricIndex(parsedLyrics.lines, time);
    set({ currentTime: time, activeLyricIndex: activeIdx });
  },

  setDuration: (duration) => {
    set({ duration });
  },

  addCustomTrack: (newTrack) => {
    set((state) => ({
      playlist: [...state.playlist, newTrack],
    }));
    get().playTrack(get().playlist.length - 1);
  },

  setPlaylistOpen: (open) => set({ isPlaylistOpen: open }),
  setUploadOpen: (open) => set({ isUploadOpen: open }),
  setSettingsOpen: (open) => set({ isSettingsOpen: open }),
}));
