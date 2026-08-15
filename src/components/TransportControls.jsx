import React from 'react';
import { usePlayerStore } from '../store/playerStore';
import { Gauge } from 'lucide-react';

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
    playbackRate,
    setPlaybackRate,
  } = usePlayerStore();

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
  };

  const handleRateChange = (e) => {
    const val = parseFloat(e.target.value);
    setPlaybackRate(val);
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
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 bg-cyber-neon/40 pointer-events-none"
            style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
          />
        </div>

        <span className="text-[10px] text-cyber-textDim w-7 text-right">
          {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
        </span>
      </div>

      {/* Playback Speed / Lo-Fi Modulation Section */}
      <div className="pt-1 border-t border-cyber-borderDim/50 space-y-1.5">
        <div className="flex items-center justify-between text-[10px] text-cyber-textDim">
          <span className="flex items-center gap-1">
            <Gauge size={11} className="text-cyber-cyan" />
            <span>&gt; SPEED</span>
          </span>
          <span className="text-cyber-cyan text-glow-cyan font-bold">
            {playbackRate.toFixed(2)}x
          </span>
        </div>

        {/* Speed Slider */}
        <div className="relative flex items-center">
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.05"
            value={playbackRate}
            onChange={handleRateChange}
            className="w-full h-2 bg-[#120207] border border-cyber-borderDim rounded-none appearance-none cursor-pointer accent-cyber-cyan [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-cyber-cyan [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-[0_0_8px_#05d9e8]"
          />
        </div>

        {/* Speed Preset Badges */}
        <div className="grid grid-cols-3 gap-1 pt-0.5 text-[9px]">
          <button
            onClick={() => setPlaybackRate(0.8)}
            className={`py-0.5 border transition-all text-center ${
              playbackRate === 0.8
                ? 'border-cyber-cyan bg-cyber-cyan/20 text-white font-bold shadow-cyan'
                : 'border-cyber-borderDim bg-cyber-bgDark text-cyber-textDim hover:border-cyber-cyan/50 hover:text-white'
            }`}
          >
            0.8x SLOWED
          </button>
          <button
            onClick={() => setPlaybackRate(1.0)}
            className={`py-0.5 border transition-all text-center ${
              playbackRate === 1.0
                ? 'border-cyber-neon bg-cyber-neon/20 text-white font-bold shadow-neon-sm'
                : 'border-cyber-borderDim bg-cyber-bgDark text-cyber-textDim hover:border-cyber-neon/50 hover:text-white'
            }`}
          >
            1.0x NORMAL
          </button>
          <button
            onClick={() => setPlaybackRate(1.25)}
            className={`py-0.5 border transition-all text-center ${
              playbackRate === 1.25
                ? 'border-cyber-hotPink bg-cyber-hotPink/20 text-white font-bold shadow-neon-sm'
                : 'border-cyber-borderDim bg-cyber-bgDark text-cyber-textDim hover:border-cyber-hotPink/50 hover:text-white'
            }`}
          >
            1.25x NIGHT
          </button>
        </div>
      </div>

      {/* Auto-scroll Toggle Button */}
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
