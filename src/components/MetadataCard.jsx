import React, { useState } from 'react';
import { usePlayerStore } from '../store/playerStore';
import { ArrowLeftRight, Edit3, Check, X, Loader2 } from 'lucide-react';

export const MetadataCard = () => {
  const {
    playlist,
    currentTrackIndex,
    isPlaying,
    swapTrackMetadata,
    editTrackMetadata,
  } = usePlayerStore();

  const currentTrack = playlist[currentTrackIndex] || {
    title: 'Loving Machine',
    artist: 'TV Girl',
    album: 'Who Really Cares'
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editArtist, setEditArtist] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleOpenEdit = () => {
    setEditTitle(currentTrack.title || '');
    setEditArtist(currentTrack.artist || '');
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) return;
    setIsUpdating(true);
    await editTrackMetadata(currentTrackIndex, editTitle.trim(), editArtist.trim() || 'Unknown Artist');
    setIsUpdating(false);
    setIsEditing(false);
  };

  const handleSwap = async () => {
    setIsUpdating(true);
    await swapTrackMetadata(currentTrackIndex);
    setIsUpdating(false);
  };

  return (
    <div className="w-full border border-cyber-neon/80 bg-cyber-bgCard/90 p-3 shadow-inner-glow relative flex flex-col justify-between select-none">
      {/* Updating Loader Overlay */}
      {isUpdating && (
        <div className="absolute inset-0 bg-black/85 z-20 flex items-center justify-center space-x-2 text-cyber-cyan text-xs font-mono">
          <Loader2 size={14} className="animate-spin" />
          <span>RE-RESOLVING TELEMETRY...</span>
        </div>
      )}

      {/* Edit Mode Inline Prompt */}
      {isEditing ? (
        <div className="space-y-2 font-mono text-xs z-10">
          <div>
            <label className="text-[10px] text-cyber-textDim uppercase">Edit Title</label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full bg-cyber-bgDark border border-cyber-cyan px-2 py-1 text-white text-xs outline-none"
              autoFocus
            />
          </div>
          <div>
            <label className="text-[10px] text-cyber-textDim uppercase">Edit Artist</label>
            <input
              type="text"
              value={editArtist}
              onChange={(e) => setEditArtist(e.target.value)}
              className="w-full bg-cyber-bgDark border border-cyber-cyan px-2 py-1 text-white text-xs outline-none"
            />
          </div>
          <div className="flex space-x-2 pt-1">
            <button
              onClick={handleSaveEdit}
              className="flex-1 py-1 bg-cyber-bgCardLight border border-cyber-cyan text-cyber-cyan hover:bg-cyber-cyan hover:text-black font-bold text-[11px] flex items-center justify-center space-x-1"
            >
              <Check size={12} />
              <span>SAVE &amp; FETCH</span>
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-2 py-1 bg-cyber-bgDark border border-cyber-borderDim text-cyber-textDim hover:text-white text-[11px]"
            >
              <X size={12} />
            </button>
          </div>
        </div>
      ) : (
        /* Normal Display Mode */
        <div className="space-y-2 font-mono">
          {/* Header row with Track title & utility buttons */}
          <div>
            <div className="flex items-center justify-between text-[10px] text-cyber-textDim uppercase tracking-wider font-semibold">
              <span>TRACK</span>
              <div className="flex items-center space-x-1">
                {/* 1-Click Swap Button */}
                <button
                  onClick={handleSwap}
                  className="px-1.5 py-0.5 border border-cyber-borderDim hover:border-cyber-cyan hover:text-cyber-cyan text-cyber-textDim transition-colors text-[9px] flex items-center space-x-1"
                  title="Swap Title and Artist (1-click fix)"
                >
                  <ArrowLeftRight size={10} />
                  <span>⇄ SWAP</span>
                </button>
                {/* Edit Button */}
                <button
                  onClick={handleOpenEdit}
                  className="px-1.5 py-0.5 border border-cyber-borderDim hover:border-cyber-neon hover:text-white text-cyber-textDim transition-colors text-[9px] flex items-center space-x-1"
                  title="Edit Track Title & Artist manually"
                >
                  <Edit3 size={10} />
                  <span>EDIT</span>
                </button>
              </div>
            </div>
            <div className="text-white text-glow-white font-bold text-sm sm:text-base truncate tracking-wide font-sans md:font-mono">
              {currentTrack.title}
            </div>
          </div>

          {/* Artist Name */}
          <div>
            <div className="text-[10px] text-cyber-textDim uppercase tracking-wider font-semibold">
              ARTIST
            </div>
            <div className="text-cyber-textBright text-xs sm:text-sm font-medium truncate tracking-wide font-sans md:font-mono">
              {currentTrack.artist}
            </div>
          </div>
        </div>
      )}

      {/* Playback Status Indicator at bottom right */}
      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-cyber-borderDim/50 text-[11px] font-mono">
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
