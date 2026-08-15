import React from 'react';
import { usePlayerStore } from '../store/playerStore';
import { Volume2, VolumeX, Play, Pause, SkipBack, SkipForward } from 'lucide-react';

export const TransportControls = () => {
  const {
    isPlaying,
    togglePlay,
    prevTrack,
    nextTrack,
    volume,
    setVolume,
    isMuted,
    toggleMute,
    autoScroll,
    toggleAutoScroll,
  } = usePlayerStore();

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
  };

  return (
    <div className="w-full border border-cyber-neon/80 bg-cyber-bgCard/90 p-2.5 shadow-inner-glow space-y-2.5 font-mono select-none">
      {/* Transport Playback Buttons */}
      <div className="grid grid-cols-3 gap-2">
        {/* Prev */}
        <button
          onClick={prevTrack}
          className="flex items-center justify-center py-1.5 px-2 bg-cyber-bgCardLight border border-cyber-neon hover:bg-cyber-neon/20 active:scale-95 transition-all text-cyber-neon hover:text-white shadow-neon-sm text-xs font-bold"
          title="Previous Track (or start of track)"
        >
          <span className="tracking-tighter">[ |&lt;&lt; ]</span>
        </button>

        {/* Play/Pause */}
        <button
          onClick={togglePlay}
          className="flex items-center justify-center py-1.5 px-2 bg-cyber-bgCardLight border border-cyber-neon hover:bg-cyber-neon/25 active:scale-95 transition-all text-white shadow-neon text-xs font-bold"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          <span className="tracking-tighter">
            {isPlaying ? '[ || ]' : '[ > ]'}
          </span>
        </button>

        {/* Next */}
        <button
          onClick={nextTrack}
          className="flex items-center justify-center py-1.5 px-2 bg-cyber-bgCardLight border border-cyber-neon hover:bg-cyber-neon/20 active:scale-95 transition-all text-cyber-neon hover:text-white shadow-neon-sm text-xs font-bold"
          title="Next Track"
        >
          <span className="tracking-tighter">[ &gt;&gt;| ]</span>
        </button>
      </div>

      {/* Volume Bar & Control */}
      <div className="flex items-center space-x-2 text-[11px]">
        <button
          onClick={toggleMute}
          className="text-cyber-textDim hover:text-cyber-neon transition-colors"
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          <span className="text-[10px]">&gt; VOL</span>
        </button>

        {/* Custom Retro Volume Slider */}
        <div className="relative flex-1 flex items-center">
          <input
            type="range"
            min="0"
            max="1"
            step="0.02"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-full h-3 bg-[#120207] border border-cyber-borderDim rounded-none appearance-none cursor-pointer accent-cyber-neon [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:bg-cyber-neon [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-[0_0_8px_#ff2a6d]"
          />
          {/* Visual volume level fill */}
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 bg-cyber-neon/40 pointer-events-none"
            style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
          />
        </div>

        <span className="text-[10px] text-cyber-textDim w-7 text-right">
          {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
        </span>
      </div>

      {/* Auto-scroll Button matching the reference screenshot */}
      <button
        onClick={toggleAutoScroll}
        className={`w-full py-1 px-3 border transition-all text-center text-xs font-mono tracking-wider ${
          autoScroll
            ? 'bg-cyber-bgCardLight border-cyber-border text-white shadow-neon-sm'
            : 'bg-cyber-bgDark/60 border-cyber-borderDim text-cyber-textDim hover:border-cyber-neon/50'
        }`}
      >
        <span className="tracking-widest">
          auto-scroll: {autoScroll ? '[0 on]' : '[off]'}
        </span>
      </button>
    </div>
  );
};
