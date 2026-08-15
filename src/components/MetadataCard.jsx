import React from 'react';
import { usePlayerStore } from '../store/playerStore';

export const MetadataCard = () => {
  const { playlist, currentTrackIndex, isPlaying } = usePlayerStore();
  const currentTrack = playlist[currentTrackIndex] || {
    title: 'Loving Machine',
    artist: 'TV Girl',
    album: 'Who Really Cares'
  };

  return (
    <div className="w-full border border-cyber-neon/80 bg-cyber-bgCard/90 p-3 shadow-inner-glow relative flex flex-col justify-between select-none">
      <div className="space-y-2 font-mono">
        {/* Track Title */}
        <div>
          <div className="text-[10px] text-cyber-textDim uppercase tracking-wider font-semibold">
            TRACK
          </div>
          <div className="text-white text-glow-white font-bold text-sm sm:text-base truncate tracking-wide">
            {currentTrack.title}
          </div>
        </div>

        {/* Artist Name */}
        <div>
          <div className="text-[10px] text-cyber-textDim uppercase tracking-wider font-semibold">
            ARTIST
          </div>
          <div className="text-cyber-textBright text-xs sm:text-sm font-medium truncate tracking-wide">
            {currentTrack.artist}
          </div>
        </div>
      </div>

      {/* Playback Status Indicator at bottom right */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-cyber-borderDim/50 text-[11px] font-mono">
        <span className="text-[10px] text-cyber-cyan text-glow-cyan">
          {currentTrack.genre || 'CYBER_LO-FI'}
        </span>

        <div className="flex items-center space-x-1">
          {isPlaying ? (
            <span className="text-cyber-neon text-glow font-bold flex items-center gap-1 animate-flicker">
              <span className="animate-spin text-xs">*</span> playing
            </span>
          ) : (
            <span className="text-cyber-textDim flex items-center gap-1">
              <span>||</span> paused
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
