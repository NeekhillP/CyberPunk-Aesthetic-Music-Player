import React, { useState } from 'react';
import { usePlayerStore } from '../store/playerStore';
import { X, Play, Music, Radio, Trash2, Plus, Database, RefreshCw, ChevronUp, ChevronDown, GripVertical } from 'lucide-react';
import { formatTime } from '../utils/lrcParser';

export const PlaylistModal = () => {
  const {
    playlist,
    currentTrackIndex,
    playTrack,
    removeTrack,
    clearVaultTracks,
    moveTrackUp,
    moveTrackDown,
    reorderPlaylist,
    isPlaylistOpen,
    setPlaylistOpen,
    setUploadOpen,
    isPlaying,
  } = usePlayerStore();

  const [draggedIdx, setDraggedIdx] = useState(null);

  if (!isPlaylistOpen) return null;

  const hasVaultTracks = playlist.some(t => t.isVaultTrack || t.id.startsWith('custom-'));

  const handleClearVault = async () => {
    if (window.confirm('PURGE MEDIA VAULT: Remove all custom imported tracks from IndexedDB storage?')) {
      await clearVaultTracks();
    }
  };

  const handleDragStart = (e, index) => {
    setDraggedIdx(index);
    e.dataTransfer.setData('text/plain', index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedIdx !== null && draggedIdx !== targetIndex) {
      reorderPlaylist(draggedIdx, targetIndex);
    }
    setDraggedIdx(null);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg border border-cyber-neon bg-cyber-bgCard p-5 shadow-neon-strong relative font-mono text-xs select-none">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-cyber-border pb-3 mb-4">
          <div className="flex items-center space-x-2 text-cyber-neon text-glow font-bold text-sm">
            <Radio size={16} />
            <span>&gt; STATION QUEUE // VAULT ({playlist.length})</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setPlaylistOpen(false);
                setUploadOpen(true);
              }}
              className="flex items-center space-x-1 px-2 py-0.5 border border-cyber-cyan text-cyber-cyan hover:bg-cyber-cyan/15 text-[10px]"
            >
              <Plus size={12} />
              <span>IMPORT</span>
            </button>
            <button
              onClick={() => setPlaylistOpen(false)}
              className="text-cyber-textDim hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Track List with Drag & Drop + Move Up/Down */}
        <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
          {playlist.map((track, idx) => {
            const isCurrent = idx === currentTrackIndex;
            return (
              <div
                key={track.id || idx}
                draggable
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, idx)}
                className={`p-2 border transition-all flex items-center justify-between group ${
                  isCurrent
                    ? 'border-cyber-neon bg-cyber-neon/15 text-white shadow-neon-sm'
                    : 'border-cyber-borderDim bg-cyber-bgDark hover:border-cyber-neon/60 hover:bg-cyber-bgCardLight text-cyber-textDim'
                } ${draggedIdx === idx ? 'opacity-40 border-dashed border-cyber-cyan' : ''}`}
              >
                {/* Drag Handle & Index */}
                <div className="flex items-center space-x-1.5 cursor-grab text-cyber-pinkMuted group-hover:text-cyber-cyan shrink-0">
                  <GripVertical size={13} />
                  <div className="w-5 text-center font-bold text-cyber-neon shrink-0">
                    {isCurrent && isPlaying ? '*' : (idx + 1).toString().padStart(2, '0')}
                  </div>
                </div>

                {/* Track Details & Cover Thumbnail */}
                <div
                  onClick={() => {
                    playTrack(idx);
                    setPlaylistOpen(false);
                  }}
                  className="flex items-center space-x-2.5 cursor-pointer flex-1 min-w-0 mx-2"
                >
                  <img
                    src={track.coverUrl || track.cover || '/album_covers/loving_machine.jpg'}
                    alt="art"
                    className="w-7 h-7 object-cover border border-cyber-borderDim shrink-0 duotone-filter"
                    onError={(e) => { e.currentTarget.src = '/album_covers/loving_machine.jpg'; }}
                  />
                  <div className="min-w-0">
                    <div className="font-bold text-white tracking-wide truncate font-sans md:font-mono">
                      {track.title}
                    </div>
                    <div className="text-[10px] text-cyber-pinkDim truncate font-sans md:font-mono">
                      {track.artist} • {track.station || 'SEVEN.FM'}
                    </div>
                  </div>
                </div>

                {/* Controls: Reorder Up/Down, Play, Delete */}
                <div className="flex items-center space-x-1.5 shrink-0">
                  <span className="text-[10px] text-cyber-cyan border border-cyber-cyanDim px-1 py-0.2 hidden sm:inline">
                    {formatTime(track.duration || 180)}
                  </span>

                  {/* Move Up Button */}
                  <button
                    disabled={idx === 0}
                    onClick={(e) => {
                      e.stopPropagation();
                      moveTrackUp(idx);
                    }}
                    className="p-0.5 text-cyber-textDim hover:text-cyber-cyan disabled:opacity-20 transition-colors"
                    title="Move Track Up"
                  >
                    <ChevronUp size={13} />
                  </button>

                  {/* Move Down Button */}
                  <button
                    disabled={idx === playlist.length - 1}
                    onClick={(e) => {
                      e.stopPropagation();
                      moveTrackDown(idx);
                    }}
                    className="p-0.5 text-cyber-textDim hover:text-cyber-cyan disabled:opacity-20 transition-colors"
                    title="Move Track Down"
                  >
                    <ChevronDown size={13} />
                  </button>
                  
                  {/* Play Button */}
                  <button
                    onClick={() => {
                      playTrack(idx);
                      setPlaylistOpen(false);
                    }}
                    className="p-1 hover:text-white"
                  >
                    <Play size={12} className={isCurrent ? 'text-cyber-neon fill-cyber-neon' : 'text-cyber-textDim'} />
                  </button>

                  {/* Delete Button */}
                  {playlist.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeTrack(idx);
                      }}
                      className="p-1 text-cyber-pinkMuted hover:text-cyber-neon transition-colors"
                      title="Remove from queue"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer with Clear Vault Button */}
        <div className="mt-4 pt-3 border-t border-cyber-borderDim/60 text-[10px] text-cyber-textDim flex justify-between items-center">
          <div className="flex items-center space-x-1.5">
            <Database size={11} className="text-cyber-cyan" />
            <span>INDEXEDDB MEDIA VAULT</span>
          </div>

          {hasVaultTracks && (
            <button
              onClick={handleClearVault}
              className="flex items-center space-x-1 text-cyber-pinkDim hover:text-cyber-neon transition-colors border border-cyber-borderDim/60 px-1.5 py-0.5"
              title="Clear all stored media from IndexedDB"
            >
              <RefreshCw size={10} />
              <span>[ CLEAR VAULT ]</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
