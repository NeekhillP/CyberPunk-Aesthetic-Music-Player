import React from 'react';
import { usePlayerStore } from '../store/playerStore';
import { X, Play, Music, Radio } from 'lucide-react';

export const PlaylistModal = () => {
  const {
    playlist,
    currentTrackIndex,
    playTrack,
    isPlaylistOpen,
    setPlaylistOpen,
    isPlaying,
  } = usePlayerStore();

  if (!isPlaylistOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg border border-cyber-neon bg-cyber-bgCard p-5 shadow-neon-strong relative font-mono text-xs">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-cyber-border pb-3 mb-4">
          <div className="flex items-center space-x-2 text-cyber-neon text-glow font-bold text-sm">
            <Radio size={16} />
            <span>&gt; STATION DIRECTORY // QUEUE</span>
          </div>
          <button
            onClick={() => setPlaylistOpen(false)}
            className="text-cyber-textDim hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Track List */}
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {playlist.map((track, idx) => {
            const isCurrent = idx === currentTrackIndex;
            return (
              <div
                key={track.id || idx}
                onClick={() => {
                  playTrack(idx);
                  setPlaylistOpen(false);
                }}
                className={`p-2.5 border cursor-pointer transition-all flex items-center justify-between ${
                  isCurrent
                    ? 'border-cyber-neon bg-cyber-neon/15 text-white shadow-neon-sm'
                    : 'border-cyber-borderDim bg-cyber-bgDark hover:border-cyber-neon/60 hover:bg-cyber-bgCardLight text-cyber-textDim'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-6 text-center font-bold text-cyber-neon">
                    {isCurrent && isPlaying ? '*' : (idx + 1).toString().padStart(2, '0')}
                  </div>
                  <div>
                    <div className="font-bold text-white tracking-wide">
                      {track.title}
                    </div>
                    <div className="text-[10px] text-cyber-pinkDim">
                      {track.artist} • {track.station || 'SEVEN.FM'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-[10px] text-cyber-cyan border border-cyber-cyanDim px-1 py-0.5">
                    {track.bpm ? `${track.bpm} BPM` : 'AUDIO'}
                  </span>
                  <Play size={14} className={isCurrent ? 'text-cyber-neon fill-cyber-neon' : 'text-cyber-textDim'} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="mt-4 pt-3 border-t border-cyber-borderDim/60 text-[10px] text-cyber-textDim flex justify-between">
          <span>{playlist.length} FREQUENCIES CACHED</span>
          <span>SELECT TO TRANSMIT</span>
        </div>
      </div>
    </div>
  );
};
