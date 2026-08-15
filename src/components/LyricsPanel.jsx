import React, { useEffect, useRef, useState } from 'react';
import { usePlayerStore } from '../store/playerStore';
import { FileEdit, Check, X, Sparkles, FileText } from 'lucide-react';
import { convertPlainTextToLrc } from '../utils/lyricsService';

export const LyricsPanel = () => {
  const {
    parsedLyrics,
    activeLyricIndex,
    currentTime,
    duration,
    seek,
    autoScroll,
    syncStatus,
    playlist,
    currentTrackIndex,
    updateActiveTrackLyrics,
  } = usePlayerStore();

  const currentTrack = playlist[currentTrackIndex] || {};
  const containerRef = useRef(null);
  const activeLineRef = useRef(null);

  // In-app paste terminal modal state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [pastedText, setPastedText] = useState('');

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

  const handleSavePastedLyrics = () => {
    if (!pastedText.trim()) return;

    let finalLrc = pastedText.trim();
    const hasTimestamps = /\[\d{2}:\d{2}/.test(finalLrc);

    if (!hasTimestamps) {
      // Convert plain text into evenly spaced lyrics over song duration
      finalLrc = convertPlainTextToLrc(finalLrc, duration || 180);
    }

    updateActiveTrackLyrics(finalLrc, hasTimestamps ? 'MANUAL LRC' : 'MANUAL PLAIN');
    setIsEditorOpen(false);
    setPastedText('');
  };

  const lines = parsedLyrics?.lines || [];

  return (
    <div className="flex-1 h-full border border-cyber-neon bg-cyber-bgCard/80 shadow-neon flex flex-col relative overflow-hidden font-mono">
      {/* Terminal Tab Header */}
      <div className="h-8 border-b border-cyber-border/70 bg-cyber-bgDark/90 px-3 flex items-center justify-between select-none">
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-cyber-neon text-glow font-bold">&gt; lyrics</span>
          {currentTrack.lyricSource && (
            <span className="text-[10px] text-cyber-cyan border border-cyber-cyanDim px-1.5 py-0.2">
              {currentTrack.lyricSource}
            </span>
          )}
          <span className="text-[10px] text-cyber-textDim hidden sm:inline">
            [{lines.length} lines]
          </span>
        </div>

        <div className="flex items-center space-x-3 text-[11px]">
          {/* Quick In-App Paste Button */}
          <button
            onClick={() => setIsEditorOpen(true)}
            className="flex items-center space-x-1 px-1.5 py-0.5 border border-cyber-borderDim hover:border-cyber-cyan text-cyber-textDim hover:text-cyber-cyan transition-colors text-[10px]"
            title="Paste custom LRC or text lyrics"
          >
            <FileEdit size={11} />
            <span className="hidden sm:inline">PASTE LRC</span>
          </button>

          <div className="flex items-center space-x-1.5 text-cyber-cyan text-glow-cyan">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyber-cyan shadow-[0_0_6px_#05d9e8]" />
            <span>{syncStatus}</span>
          </div>
        </div>
      </div>

      {/* Synchronized Lyrics Scroll Container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-4 py-8 space-y-4 scroll-smooth relative"
      >
        {lines.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
            <p className="text-sm text-cyber-textDim tracking-wider">
              &gt; NO SYNCHRONIZED LRC TELEMETRY FOUND
            </p>
            <p className="text-xs text-cyber-pinkDim max-w-sm">
              Online satellite lookup did not find matched lyrics for "{currentTrack.title}".
            </p>
            <button
              onClick={() => setIsEditorOpen(true)}
              className="mt-3 px-4 py-2 border border-cyber-neon bg-cyber-bgCardLight hover:bg-cyber-neon/20 text-white font-bold text-xs tracking-widest shadow-neon flex items-center space-x-2 transition-all"
            >
              <FileText size={14} className="text-cyber-neon" />
              <span>[ + PASTE LRC / TEXT LYRICS ]</span>
            </button>
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
                  {/* Line Timestamp */}
                  <span className="text-[10px] text-cyber-pinkMuted font-mono group-hover:text-cyber-cyan transition-colors hidden sm:inline-block w-12 shrink-0">
                    {formatTimestamp(line.time)}
                  </span>

                  {/* Lyric Text (with unicode / Devanagari font support) */}
                  <span className="leading-relaxed tracking-wide font-sans md:font-mono">
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

      {/* Inline Terminal Lyric Paste Modal */}
      {isEditorOpen && (
        <div className="absolute inset-0 bg-black/92 backdrop-blur-md z-30 flex flex-col p-4 border-t border-cyber-neon animate-in fade-in">
          <div className="flex items-center justify-between border-b border-cyber-neon/50 pb-2 mb-3">
            <div className="flex items-center space-x-2 text-cyber-neon text-glow font-bold text-xs">
              <FileEdit size={14} />
              <span>&gt; TERMINAL LYRIC TELEMETRY INJECTION</span>
            </div>
            <button
              onClick={() => setIsEditorOpen(false)}
              className="text-cyber-textDim hover:text-white"
            >
              <X size={15} />
            </button>
          </div>

          <p className="text-[11px] text-cyber-textDim mb-2">
            Paste timestamped <span className="text-cyber-cyan">[mm:ss.xx]</span> lines or unformatted plain lyrics for <strong className="text-white">"{currentTrack.title}"</strong>:
          </p>

          <textarea
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder="[00:05.00] Timed lyric line 1&#10;[00:10.50] Timed lyric line 2...&#10;&#10;Or paste plain text lyrics (will auto-distribute)"
            rows={8}
            className="flex-1 w-full bg-cyber-bgDark border border-cyber-borderDim p-3 text-xs text-white focus:border-cyber-cyan outline-none font-mono resize-none mb-3 selection:bg-cyber-cyan selection:text-black"
          />

          <div className="flex space-x-2">
            <button
              onClick={handleSavePastedLyrics}
              disabled={!pastedText.trim()}
              className="flex-1 py-2 bg-cyber-bgCardLight border border-cyber-neon hover:bg-cyber-neon/25 text-white font-bold text-xs shadow-neon flex items-center justify-center space-x-2 transition-all disabled:opacity-40"
            >
              <Check size={14} className="text-cyber-neon" />
              <span>INJECT &amp; BIND TO TRACK</span>
            </button>
            <button
              onClick={() => setIsEditorOpen(false)}
              className="px-4 py-2 bg-cyber-bgDark border border-cyber-borderDim text-cyber-textDim hover:text-white text-xs"
            >
              CANCEL
            </button>
          </div>
        </div>
      )}

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
