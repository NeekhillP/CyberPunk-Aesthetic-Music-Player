import React from 'react';
import { usePlayerStore } from '../store/playerStore';
import { Settings, ListMusic, UploadCloud, Radio, Sparkles } from 'lucide-react';

export const TopBar = () => {
  const { 
    stationName, 
    syncStatus, 
    isPlaying, 
    setPlaylistOpen, 
    setUploadOpen, 
    setSettingsOpen 
  } = usePlayerStore();

  return (
    <header className="h-10 border-b border-cyber-border/70 bg-cyber-bgDark/90 backdrop-blur flex items-center justify-between px-3 text-xs tracking-widest select-none z-30">
      {/* Brand Station Logo */}
      <div className="flex items-center space-x-3">
        <span className="text-cyber-neon text-glow font-bold text-sm tracking-[0.25em] flex items-center gap-1.5">
          <span className={`inline-block w-2 h-2 rounded-full ${isPlaying ? 'bg-cyber-neon shadow-[0_0_8px_#ff2a6d] animate-ping' : 'bg-cyber-pinkMuted'}`} />
          {stationName}
        </span>
        <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-cyber-bgCard border border-cyber-borderDim text-cyber-cyan text-glow-cyan font-mono">
          FREQ: 98.40 MHz
        </span>
      </div>

      {/* Action Buttons & Status Indicators */}
      <div className="flex items-center space-x-3">
        {/* Sync Status Badge */}
        <div className="flex items-center space-x-1.5 text-cyber-cyan text-glow-cyan font-mono text-[11px]">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyber-cyan shadow-[0_0_6px_#05d9e8]" />
          <span>{syncStatus}</span>
        </div>

        <div className="h-3.5 w-px bg-cyber-borderDim" />

        {/* Playlist Queue Button */}
        <button
          onClick={() => setPlaylistOpen(true)}
          className="flex items-center space-x-1 px-2 py-0.5 bg-cyber-bgCard border border-cyber-border/60 hover:border-cyber-neon hover:bg-cyber-neon/10 hover:text-white transition-all text-cyber-textDim text-[11px]"
          title="Track Queue / Playlist"
        >
          <ListMusic size={13} className="text-cyber-neon" />
          <span className="hidden md:inline">QUEUE</span>
        </button>

        {/* Load Audio / LRC File */}
        <button
          onClick={() => setUploadOpen(true)}
          className="flex items-center space-x-1 px-2 py-0.5 bg-cyber-bgCard border border-cyber-border/60 hover:border-cyber-cyan hover:text-cyber-cyan transition-all text-cyber-textDim text-[11px]"
          title="Load Custom Audio & LRC"
        >
          <UploadCloud size={13} className="text-cyber-cyan" />
          <span className="hidden md:inline">LOAD</span>
        </button>

        {/* Settings */}
        <button
          onClick={() => setSettingsOpen(true)}
          className="p-1 hover:text-cyber-neon text-cyber-textDim hover:rotate-45 transition-transform"
          title="Terminal Settings"
        >
          <Settings size={14} />
        </button>
      </div>
    </header>
  );
};
