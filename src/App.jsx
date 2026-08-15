import React, { useEffect, useState } from 'react';
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
import { Upload } from 'lucide-react';

export const App = () => {
  const {
    isPlaying,
    initAudioEngine,
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
    addBatchTracks,
  } = usePlayerStore();

  const [isWindowDragging, setIsWindowDragging] = useState(false);

  // Initialize Web Audio Engine lifecycle
  useEffect(() => {
    initAudioEngine();
  }, [initAudioEngine]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
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

  // Global Window Drag and Drop
  const handleWindowDragOver = (e) => {
    e.preventDefault();
    setIsWindowDragging(true);
  };

  const handleWindowDragLeave = (e) => {
    if (e.clientX === 0 || e.clientY === 0) {
      setIsWindowDragging(false);
    }
  };

  const handleWindowDrop = async (e) => {
    e.preventDefault();
    setIsWindowDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const fileArray = Array.from(e.dataTransfer.files);
      const audioFiles = fileArray.filter(f => f.type.startsWith('audio/') || /\.(mp3|wav|ogg|flac|m4a|aac)$/i.test(f.name));
      const lrcFiles = fileArray.filter(f => /\.(lrc|txt)$/i.test(f.name));

      const lrcMap = new Map();
      for (const lrc of lrcFiles) {
        const text = await lrc.text();
        const baseName = lrc.name.replace(/\.[^/.]+$/, '').toLowerCase();
        lrcMap.set(baseName, text);
      }

      const newTracks = [];
      for (const audio of audioFiles) {
        const baseName = audio.name.replace(/\.[^/.]+$/, '');
        const cleanBase = baseName.toLowerCase();
        const matchedLrc = lrcMap.get(cleanBase) || (lrcFiles.length === 1 ? await lrcFiles[0].text() : '');

        let artist = 'Local Audio';
        let title = baseName;
        if (baseName.includes(' - ')) {
          const parts = baseName.split(' - ');
          artist = parts[0].trim();
          title = parts.slice(1).join(' - ').trim();
        }

        newTracks.push({
          id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          title,
          artist,
          cover: '/album_covers/loving_machine.jpg',
          audioUrl: URL.createObjectURL(audio),
          lrc: matchedLrc || `[00:00.00]${title} - ${artist}\n[00:04.00]♪ Direct terminal playback ♪`,
          duration: 180,
          station: 'LOCAL // MEDIA',
          genre: 'DIRECT // STREAM',
        });
      }

      if (newTracks.length > 0) {
        addBatchTracks(newTracks);
      }
    }
  };

  return (
    <div
      onDragOver={handleWindowDragOver}
      onDragLeave={handleWindowDragLeave}
      onDrop={handleWindowDrop}
      className="flex flex-col h-screen w-screen bg-[#0c0205] text-[#ff2a6d] font-mono select-none overflow-hidden relative"
    >
      {/* CRT Scanline and Screen Filters */}
      <div className="crt-overlay" />
      <div className="crt-vignette" />

      {/* Drag & Drop Visual HUD Overlay */}
      {isWindowDragging && (
        <div className="fixed inset-0 z-50 bg-[#0c0205]/90 border-4 border-cyber-cyan border-dashed flex flex-col items-center justify-center p-8 backdrop-blur-sm pointer-events-none">
          <Upload size={48} className="text-cyber-cyan animate-bounce mb-4" />
          <h2 className="text-2xl font-bold text-white text-glow-cyan tracking-widest">
            &gt; DETECTED AUDIO / LRC TELEMETRY
          </h2>
          <p className="text-sm text-cyber-cyan mt-2">
            RELEASE TO IMPORT DIRECTLY INTO AUDIO ENGINE PIPELINE
          </p>
        </div>
      )}

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
