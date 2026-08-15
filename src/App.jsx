import React, { useEffect } from 'react';
import { usePlayerStore } from './store/playerStore';
import { audioEngine } from './audio/audioEngine';
import { TopBar } from './components/TopBar';
import { AlbumArt } from './components/AlbumArt';
import { MetadataCard } from './components/MetadataCard';
import { AudioVisualizer } from './components/AudioVisualizer';
import { TransportControls } from './components/TransportControls';
import { LyricsPanel } from './components/LyricsPanel';
import { BottomBar } from './components/BottomBar';
import { PlaylistModal } from './components/PlaylistModal';
import { UploadModal } from './components/UploadModal';
import { SettingsModal } from './components/SettingsModal';

export const App = () => {
  const {
    isPlaying,
    setCurrentTime,
    togglePlay,
    seek,
    currentTime,
    duration,
    volume,
    setVolume,
    toggleMute,
    toggleAutoScroll,
    nextTrack,
    prevTrack,
  } = usePlayerStore();

  // High-frequency playback sync loop
  useEffect(() => {
    let animId;
    const updateLoop = () => {
      if (isPlaying) {
        const time = audioEngine.getCurrentTime();
        setCurrentTime(time);
      }
      animId = requestAnimationFrame(updateLoop);
    };

    animId = requestAnimationFrame(updateLoop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, setCurrentTime]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if typing in an input / textarea
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          seek(Math.max(0, currentTime - 5));
          break;
        case 'ArrowRight':
          e.preventDefault();
          seek(Math.min(duration, currentTime + 5));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(Math.min(1, volume + 0.05));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(Math.max(0, volume - 0.05));
          break;
        case 'KeyM':
          toggleMute();
          break;
        case 'KeyA':
          toggleAutoScroll();
          break;
        case 'KeyN':
          nextTrack();
          break;
        case 'KeyP':
          prevTrack();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, seek, currentTime, duration, volume, setVolume, toggleMute, toggleAutoScroll, nextTrack, prevTrack]);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0c0205] text-[#ff2a6d] font-mono select-none overflow-hidden relative">
      {/* CRT Scanline and Screen Filters */}
      <div className="crt-overlay" />
      <div className="crt-vignette" />

      {/* Top Navigation / Brand Header */}
      <TopBar />

      {/* Main Terminal Workspace Layout */}
      <main className="flex-1 flex flex-col md:flex-row gap-3 p-3 min-h-0 overflow-hidden relative z-10">
        {/* Left Column: Cover, Info, Spectrum, Transport Controls (~35% width) */}
        <section className="w-full md:w-[36%] lg:w-[32%] flex flex-col gap-2.5 min-h-0 overflow-y-auto pr-1">
          {/* Duotone Album Cover Frame */}
          <AlbumArt />

          {/* Track & Artist Terminal Metadata */}
          <MetadataCard />

          {/* Segmented Frequency Visualizer */}
          <AudioVisualizer />

          {/* Transport Controls & Volume & Auto-Scroll */}
          <TransportControls />
        </section>

        {/* Right Column: Synchronized Scrolling Lyrics (~65% width) */}
        <section className="flex-1 flex flex-col min-h-0 h-full">
          <LyricsPanel />
        </section>
      </main>

      {/* Full-width Bottom Seek Bar */}
      <BottomBar />

      {/* Modals */}
      <PlaylistModal />
      <UploadModal />
      <SettingsModal />
    </div>
  );
};

export default App;
