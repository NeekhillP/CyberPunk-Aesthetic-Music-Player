import React, { useState } from 'react';
import { usePlayerStore } from '../store/playerStore';
import { X, Upload, FileAudio, FileText, CheckCircle2, Music, Trash2 } from 'lucide-react';

export const UploadModal = () => {
  const { isUploadOpen, setUploadOpen, addBatchTracks } = usePlayerStore();
  const [stagedFiles, setStagedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  if (!isUploadOpen) return null;

  const processFileList = async (files) => {
    const fileArray = Array.from(files);
    const audioFiles = fileArray.filter(f => f.type.startsWith('audio/') || /\.(mp3|wav|ogg|flac|m4a|aac)$/i.test(f.name));
    const lrcFiles = fileArray.filter(f => /\.(lrc|txt)$/i.test(f.name));

    // Read all LRC contents
    const lrcMap = new Map();
    for (const lrcFile of lrcFiles) {
      const text = await lrcFile.text();
      const baseName = lrcFile.name.replace(/\.[^/.]+$/, '').toLowerCase();
      lrcMap.set(baseName, text);
    }

    const newTracks = [];

    // Pair audio with corresponding LRC
    for (const audio of audioFiles) {
      const baseName = audio.name.replace(/\.[^/.]+$/, '');
      const cleanBase = baseName.toLowerCase();
      const matchedLrc = lrcMap.get(cleanBase) || (lrcFiles.length === 1 ? await lrcFiles[0].text() : '');

      // Parse metadata from filename if formatted as "Artist - Title"
      let artist = 'Local Audio';
      let title = baseName;
      if (baseName.includes(' - ')) {
        const parts = baseName.split(' - ');
        artist = parts[0].trim();
        title = parts.slice(1).join(' - ').trim();
      }

      newTracks.push({
        id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title,
        artist,
        cover: '/album_covers/loving_machine.jpg',
        audioUrl: URL.createObjectURL(audio),
        lrc: matchedLrc || `[00:00.00]${title} - ${artist}\n[00:04.00]♪ Audio telemetry streaming ♪`,
        duration: 180,
        station: 'LOCAL // STORAGE',
        genre: 'LOCAL // MEDIA',
        hasLrc: Boolean(matchedLrc),
      });
    }

    if (newTracks.length > 0) {
      setStagedFiles(prev => [...prev, ...newTracks]);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      await processFileList(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = async (e) => {
    if (e.target.files) {
      await processFileList(e.target.files);
    }
  };

  const handleCommit = () => {
    if (stagedFiles.length === 0) return;
    addBatchTracks(stagedFiles);
    setStagedFiles([]);
    setUploadOpen(false);
  };

  const handleRemoveStaged = (index) => {
    setStagedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl border border-cyber-cyan bg-cyber-bgCard p-5 shadow-cyan relative font-mono text-xs">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyber-cyan/50 pb-3 mb-4">
          <div className="flex items-center space-x-2 text-cyber-cyan text-glow-cyan font-bold text-sm">
            <Upload size={16} />
            <span>&gt; BATCH MEDIA & LRC TELEMETRY IMPORT</span>
          </div>
          <button
            onClick={() => setUploadOpen(false)}
            className="text-cyber-textDim hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Drag & Drop Target Area */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed p-6 text-center transition-all ${
              isDragging
                ? 'border-cyber-cyan bg-cyber-cyan/15 scale-[1.01]'
                : 'border-cyber-borderDim bg-cyber-bgDark/70 hover:border-cyber-cyan/60'
            }`}
          >
            <div className="flex flex-col items-center justify-center space-y-2">
              <Upload size={28} className={isDragging ? 'text-cyber-cyan animate-bounce' : 'text-cyber-textDim'} />
              <p className="text-white font-bold text-sm">
                DROP AUDIO (.mp3, .wav, .flac) &amp; .LRC FILES HERE
              </p>
              <p className="text-[11px] text-cyber-textDim">
                Matching filenames (e.g. Song.mp3 + Song.lrc) will automatically synchronize
              </p>

              <label className="mt-2 inline-block px-3 py-1.5 bg-cyber-bgCardLight border border-cyber-cyan text-cyber-cyan hover:bg-cyber-cyan hover:text-black cursor-pointer transition-colors font-bold text-xs">
                BROWSE FILES
                <input
                  type="file"
                  multiple
                  accept="audio/*,.lrc,.txt"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Staged Tracks Queue */}
          {stagedFiles.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-[11px] text-cyber-textDim">
                <span>STAGED FILES ({stagedFiles.length})</span>
                <span className="text-cyber-cyan">READY FOR PLAYBACK PIPELINE</span>
              </div>

              <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1">
                {stagedFiles.map((track, idx) => (
                  <div
                    key={track.id || idx}
                    className="p-2 border border-cyber-borderDim bg-cyber-bgDark flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <Music size={14} className="text-cyber-neon shrink-0" />
                      <span className="text-white font-bold truncate">{track.title}</span>
                      <span className="text-[10px] text-cyber-pinkDim truncate">({track.artist})</span>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      {track.hasLrc ? (
                        <span className="text-[9px] bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan px-1">
                          LRC SYNCED
                        </span>
                      ) : (
                        <span className="text-[9px] text-cyber-textDim border border-cyber-borderDim px-1">
                          NO LRC
                        </span>
                      )}
                      <button
                        onClick={() => handleRemoveStaged(idx)}
                        className="text-cyber-textDim hover:text-cyber-neon"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Commit Button */}
          <button
            onClick={handleCommit}
            disabled={stagedFiles.length === 0}
            className={`w-full py-2.5 border transition-all font-bold tracking-widest text-xs flex items-center justify-center space-x-2 ${
              stagedFiles.length > 0
                ? 'bg-cyber-bgCardLight border-cyber-cyan text-cyber-cyan hover:bg-cyber-cyan/20 hover:text-white shadow-cyan cursor-pointer'
                : 'bg-cyber-bgDark border-cyber-borderDim text-cyber-textDim/40 cursor-not-allowed'
            }`}
          >
            <CheckCircle2 size={16} />
            <span>TRANSMIT {stagedFiles.length} TRACKS TO QUEUE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
