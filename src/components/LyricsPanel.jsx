import React, { useEffect, useRef } from 'react';
import { usePlayerStore } from '../store/playerStore';

export const LyricsPanel = () => {
  const {
    parsedLyrics,
    activeLyricIndex,
    currentTime,
    seek,
    autoScroll,
    syncStatus,
    playlist,
    currentTrackIndex,
  } = usePlayerStore();

  const currentTrack = playlist[currentTrackIndex] || {};
  const containerRef = useRef(null);
  const activeLineRef = useRef(null);

  // Auto-scroll to keep active line centered
  useEffect(() => {
    if (autoScroll && activeLineRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeLyricIndex, autoScroll]);

  const handleLineClick = (timestamp) => {
    seek(timestamp);
  };

  const lines = parsedLyrics?.lines || [];

  return (
    <div className="flex-1 h-full border border-cyber-neon bg-cyber-bgCard/80 shadow-neon flex flex-col relative overflow-hidden">
      {/* Terminal Tab Header */}
      <div className="h-8 border-b border-cyber-border/70 bg-cyber-bgDark/90 px-3 flex items-center justify-between select-none">
        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="text-cyber-neon text-glow font-bold">&gt; lyrics</span>
          {currentTrack.lyricSource && (
            <span className="text-[10px] text-cyber-cyan border border-cyber-cyanDim px-1.5 py-0.2">
              {currentTrack.lyricSource}
            </span>
          )}
          <span className="text-[10px] text-cyber-textDim hidden sm:inline">
            [{lines.length} lines parsed]
          </span>
        </div>

        <div className="flex items-center space-x-2 text-[11px] font-mono text-cyber-cyan text-glow-cyan">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyber-cyan shadow-[0_0_6px_#05d9e8]" />
          <span>{syncStatus}</span>
        </div>
      </div>

      {/* Synchronized Lyrics Scroll Container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-4 py-8 space-y-4 font-mono scroll-smooth relative"
      >
        {lines.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-cyber-textDim text-sm space-y-2">
            <p>&gt; NO SYNCHRONIZED LRC DATA DETECTED</p>
            <p className="text-xs text-cyber-pinkMuted">Upload an audio or .lrc file via the LOAD button</p>
          </div>
        ) : (
          lines.map((line, idx) => {
            const isActive = idx === activeLyricIndex;
            const isPast = idx < activeLyricIndex;

            return (
              <div
                key={`${idx}-${line.time}`}
                ref={isActive ? activeLineRef : null}
                onClick={() => handleLineClick(line.time)}
                className={`group cursor-pointer transition-all duration-300 py-1.5 px-3 rounded-none border border-transparent select-text ${
                  isActive
                    ? 'bg-[#ff2a6d]/20 border-l-4 border-l-white border-y-cyber-border/40 text-white font-bold text-base sm:text-lg text-glow-white shadow-neon-sm scale-[1.01]'
                    : isPast
                    ? 'text-cyber-textDim/70 hover:text-white hover:bg-cyber-bgCardLight text-sm sm:text-base'
                    : 'text-cyber-textDim hover:text-white hover:bg-cyber-bgCardLight text-sm sm:text-base'
                }`}
              >
                <div className="flex items-baseline space-x-3">
                  {/* Line Timestamp on Hover */}
                  <span className="text-[10px] text-cyber-pinkMuted font-mono group-hover:text-cyber-cyan transition-colors hidden sm:inline-block w-12 shrink-0">
                    {formatTimestamp(line.time)}
                  </span>

                  {/* Lyric Text */}
                  <span className="leading-relaxed tracking-wide">
                    {line.text}
                  </span>
                </div>
              </div>
            );
          })
        )}

        {/* Bottom padding for center scrolling */}
        <div className="h-40" />
      </div>

      {/* Subtle CRT scanline overlay inside terminal */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.2)_50%)] bg-[length:100%_4px] pointer-events-none opacity-40" />
    </div>
  );
};

function formatTimestamp(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `[${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}]`;
}
