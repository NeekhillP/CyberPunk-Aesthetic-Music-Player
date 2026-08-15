import React, { useState } from 'react';
import { usePlayerStore } from '../store/playerStore';
import { formatTime } from '../utils/lrcParser';

export const BottomBar = () => {
  const { currentTime, duration, seek, isPlaying } = usePlayerStore();
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubTime, setScrubTime] = useState(0);

  const displayTime = isScrubbing ? scrubTime : currentTime;
  const progressPercent = duration > 0 ? (displayTime / duration) * 100 : 0;

  const handleSeekChange = (e) => {
    const val = parseFloat(e.target.value);
    setScrubTime(val);
  };

  const handleSeekStart = () => {
    setIsScrubbing(true);
    setScrubTime(currentTime);
  };

  const handleSeekEnd = (e) => {
    const val = parseFloat(e.target.value);
    seek(val);
    setIsScrubbing(false);
  };

  return (
    <footer className="h-10 border-t border-cyber-border/70 bg-cyber-bgDark/95 px-4 flex items-center space-x-3 select-none font-mono text-xs z-30">
      {/* Current Time Elapsed */}
      <span className="text-white text-glow-white font-bold w-12 text-left text-[11px]">
        {formatTime(displayTime)}
      </span>

      {/* Interactive Progress / Seek Bar */}
      <div className="relative flex-1 flex items-center group py-2">
        <input
          type="range"
          min="0"
          max={duration || 100}
          step="0.1"
          value={displayTime}
          onMouseDown={handleSeekStart}
          onTouchStart={handleSeekStart}
          onChange={handleSeekChange}
          onMouseUp={handleSeekEnd}
          onTouchEnd={handleSeekEnd}
          className="w-full h-1.5 bg-[#1a050d] rounded-none appearance-none cursor-pointer accent-cyber-neon z-20 opacity-0 group-hover:opacity-100 transition-opacity"
        />

        {/* Visual Track Background */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-[#1a050d] border border-cyber-borderDim pointer-events-none">
          {/* Progress Filled Glow Bar */}
          <div
            className="h-full bg-cyber-neon shadow-neon transition-all duration-75 relative"
            style={{ width: `${progressPercent}%` }}
          >
            {/* Scrubber Knob Indicator */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-3 bg-white border border-cyber-neon shadow-[0_0_8px_#ff2a6d]" />
          </div>
        </div>
      </div>

      {/* Total Duration */}
      <span className="text-cyber-textDim w-12 text-right text-[11px]">
        {formatTime(duration)}
      </span>
    </footer>
  );
};
