import React, { useEffect, useState } from 'react';
import { usePlayerStore } from './store/playerStore';
import { extractAudioMetadata } from './utils/metadataExtractor';
import { resolveTrackLyrics } from './utils/lyricsService';
import { resolveTrackArtwork } from './utils/artworkService';
import { useMediaSession } from './hooks/useMediaSession';
import { initTauriDesktopEvents } from './services/tauriService';
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
import { AudioRack } from './components/AudioRack';
import { Upload, Loader2 } from 'lucide-react';

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
  const [isGlobalProcessing, setIsGlobalProcessing] = useState(false);
  const [globalScanStatus, setGlobalScanStatus] = useState('');

  // 1. Initialize Web Audio Engine & IndexedDB Vault
  useEffect(() => {
    initAudioEngine();
  }, [initAudioEngine]);

  // 2. Initialize Native Tauri Desktop Events (Tray & Global Shortcuts)
  useEffect(() => {
    let cleanup = () => {};
    initTauriDesktopEvents({ togglePlay, nextTrack, prevTrack }).then((cleaner) => {
      cleanup = cleaner || (() => {});
    });
    return () => cleanup();
  }, [togglePlay, nextTrack, prevTrack]);

  // 3. Activate Native OS Media Session (Lockscreen & Media Keys)
  useMediaSession();

  // 4. Global Keyboard Shortcuts
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

  // 5. Global Window Drag and Drop with Auto Title De-Clutter & LRCLIB Pipeline
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

      if (audioFiles.length === 0) return;

      setIsGlobalProcessing(true);

      const lrcMap = new Map();
      for (const lrc of lrcFiles) {
        const text = await lrc.text();
        const baseName = lrc.name.replace(/\.[^/.]+$/, '').toLowerCase();
        lrcMap.set(baseName, text);
      }

      const newTracks = [];
      for (let i = 0; i < audioFiles.length; i++) {
        const audio = audioFiles[i];
        setGlobalScanStatus(`[SCANNING ID3 ${i + 1}/${audioFiles.length}: ${audio.name}]`);

        const meta = await extractAudioMetadata(audio);
        const baseName = audio.name.replace(/\.[^/.]+$/, '').toLowerCase();
        const companionLrc = lrcMap.get(baseName) || (lrcFiles.length === 1 ? await lrcFiles[0].text() : '');

        // Resolve Artwork
        setGlobalScanStatus(`[RESOLVING ARTWORK: ${meta.title}...]`);
        const artworkResult = await resolveTrackArtwork({
          title: meta.title,
          artist: meta.artist,
          album: meta.album,
          embeddedArtworkUrl: meta.artworkUrl,
        });

        // Resolve Lyrics
        setGlobalScanStatus(`[RESOLVING LYRICS: ${meta.title}...]`);
        const lyricResult = await resolveTrackLyrics({
          title: meta.title,
          artist: meta.artist,
          album: meta.album,
          duration: meta.duration,
          embeddedLyrics: meta.embeddedLyrics,
          companionLrc,
        });

        newTracks.push({
          id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          title: meta.title || audio.name,
          artist: meta.artist || 'Local Audio',
          album: meta.album || 'Local Broadcast',
          coverUrl: artworkResult.artworkUrl,
          artwork: artworkResult.artworkUrl,
          cover: artworkResult.artworkUrl,
          artworkSource: artworkResult.source,
          hasCustomArt: artworkResult.isCustom,
          audioUrl: URL.createObjectURL(audio),
          audioBlob: audio,
          lrc: lyricResult.lrc,
          lyricSource: lyricResult.source,
          isSynced: lyricResult.isSynced,
          duration: meta.duration || 180,
          station: 'LOCAL // VAULT',
          genre: meta.album ? `${meta.album.substring(0, 14).toUpperCase()}` : 'LOCAL MEDIA',
          isVaultTrack: true,
        });
      }

      if (newTracks.length > 0) {
        await addBatchTracks(newTracks);
      }

      setIsGlobalProcessing(false);
      setGlobalScanStatus('');
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
        <div className="fixed inset-0 z-50 bg-[#0c0205]/92 border-4 border-cyber-cyan border-dashed flex flex-col items-center justify-center p-8 backdrop-blur-sm pointer-events-none">
          <Upload size={48} className="text-cyber-cyan animate-bounce mb-4" />
          <h2 className="text-2xl font-bold text-white text-glow-cyan tracking-widest">
            &gt; DETECTED AUDIO / LRC TELEMETRY
          </h2>
          <p className="text-sm text-cyber-cyan mt-2">
            RELEASE TO AUTO-STRIP CLUTTER, PERSIST TO VAULT &amp; AUTO-SYNC LYRICS
          </p>
        </div>
      )}

      {/* Global Ingestion Loader HUD */}
      {isGlobalProcessing && (
        <div className="fixed inset-0 z-50 bg-[#0c0205]/90 border-2 border-cyber-cyan flex flex-col items-center justify-center p-8 backdrop-blur-sm">
          <Loader2 size={44} className="text-cyber-cyan animate-spin mb-4" />
          <h3 className="text-lg font-bold text-white tracking-widest">
            {globalScanStatus || '[SCANNING ID3/TELEMETRY...]'}
          </h3>
          <p className="text-xs text-cyber-cyan mt-2">
            Writing to IndexedDB Media Vault and querying satellite databases...
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

      {/* Modals & Slide-Out Drawers */}
      <AudioRack />
      <PlaylistModal />
      <UploadModal />
      <SettingsModal />
    </div>
  );
};

export default App;
