import React, { useState } from 'react';
import { usePlayerStore } from '../store/playerStore';
import { extractAudioMetadata } from '../utils/metadataExtractor';
import { resolveTrackLyrics } from '../utils/lyricsService';
import { X, Upload, FileAudio, FileText, CheckCircle2, Music, Trash2, Loader2, Sparkles } from 'lucide-react';

export const UploadModal = () => {
  const { isUploadOpen, setUploadOpen, addBatchTracks } = usePlayerStore();
  const [stagedFiles, setStagedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanningStatus, setScanningStatus] = useState('');

  if (!isUploadOpen) return null;

  const processFileList = async (files) => {
    const fileArray = Array.from(files);
    const audioFiles = fileArray.filter(f => f.type.startsWith('audio/') || /\.(mp3|wav|ogg|flac|m4a|aac)$/i.test(f.name));
    const lrcFiles = fileArray.filter(f => /\.(lrc|txt)$/i.test(f.name));

    if (audioFiles.length === 0 && lrcFiles.length === 0) return;

    setIsProcessing(true);

    // Read companion LRC files
    const lrcMap = new Map();
    for (const lrcFile of lrcFiles) {
      const text = await lrcFile.text();
      const baseName = lrcFile.name.replace(/\.[^/.]+$/, '').toLowerCase();
      lrcMap.set(baseName, text);
    }

    const newTracks = [];

    for (let i = 0; i < audioFiles.length; i++) {
      const audio = audioFiles[i];
      setScanningStatus(`[SCANNING ID3/TELEMETRY ${i + 1}/${audioFiles.length}: ${audio.name}]`);

      // 1. Extract embedded ID3 metadata & cover art
      const meta = await extractAudioMetadata(audio);
      const baseName = audio.name.replace(/\.[^/.]+$/, '').toLowerCase();
      const companionLrc = lrcMap.get(baseName) || (lrcFiles.length === 1 ? await lrcFiles[0].text() : '');

      // 2. Resolve Synced / Plain / LRCLIB Lyrics
      setScanningStatus(`[RESOLVING LYRICS: ${meta.title}...]`);
      const lyricResult = await resolveTrackLyrics({
        title: meta.title,
        artist: meta.artist,
        album: meta.album,
        duration: meta.duration,
        embeddedLyrics: meta.embeddedLyrics,
        companionLrc,
      });

      newTracks.push({
        id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title: meta.title || audio.name,
        artist: meta.artist || 'Local Audio',
        album: meta.album || 'Local Broadcast',
        cover: meta.artworkUrl || '/album_covers/loving_machine.jpg',
        hasCustomArt: Boolean(meta.artworkUrl),
        audioUrl: URL.createObjectURL(audio),
        lrc: lyricResult.lrc,
        lyricSource: lyricResult.source,
        isSynced: lyricResult.isSynced,
        duration: meta.duration || 180,
        station: 'LOCAL // TELEMETRY',
        genre: meta.album ? `${meta.album.substring(0, 14).toUpperCase()}` : 'LOCAL MEDIA',
      });
    }

    if (newTracks.length > 0) {
      setStagedFiles(prev => [...prev, ...newTracks]);
    }

    setIsProcessing(false);
    setScanningStatus('');
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
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl border border-cyber-cyan bg-cyber-bgCard p-5 shadow-cyan relative font-mono text-xs">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyber-cyan/50 pb-3 mb-4">
          <div className="flex items-center space-x-2 text-cyber-cyan text-glow-cyan font-bold text-sm">
            <Upload size={16} />
            <span>&gt; ID3 EXTRACTION &amp; TELEMETRY INGESTION</span>
          </div>
          <button
            onClick={() => setUploadOpen(false)}
            className="text-cyber-textDim hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Scanning Progress HUD */}
          {isProcessing ? (
            <div className="border border-cyber-cyan bg-cyber-bgDark p-6 text-center space-y-3 animate-pulse">
              <Loader2 size={28} className="text-cyber-cyan animate-spin mx-auto" />
              <div className="text-white font-bold tracking-wider">
                {scanningStatus || '[SCANNING ID3/TELEMETRY...]'}
              </div>
              <p className="text-[10px] text-cyber-cyan">
                Extracting embedded cover art &amp; querying LRCLIB satellite database...
              </p>
            </div>
          ) : (
            /* Drag & Drop Target Area */
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
                  DROP AUDIO (.mp3, .wav, .flac, .m4a) &amp; .LRC FILES HERE
                </p>
                <p className="text-[11px] text-cyber-textDim">
                  Automatic ID3 Cover Art Extraction • Multi-tier LRCLIB Lyric Auto-Sync
                </p>

                <label className="mt-2 inline-block px-3 py-1.5 bg-cyber-bgCardLight border border-cyber-cyan text-cyber-cyan hover:bg-cyber-cyan hover:text-black cursor-pointer transition-colors font-bold text-xs">
                  SELECT AUDIO FILES
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
          )}

          {/* Staged Tracks Queue with extracted metadata & art thumbnails */}
          {stagedFiles.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-[11px] text-cyber-textDim">
                <span>TELEMETRY READY ({stagedFiles.length})</span>
                <span className="text-cyber-cyan">METADATA &amp; ART EXTRACTED</span>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                {stagedFiles.map((track, idx) => (
                  <div
                    key={track.id || idx}
                    className="p-2 border border-cyber-borderDim bg-cyber-bgDark flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      {/* Album Art Thumbnail */}
                      <img
                        src={track.cover}
                        alt="art"
                        className="w-8 h-8 object-cover border border-cyber-neon/50 shrink-0 duotone-filter"
                      />
                      <div className="min-w-0">
                        <div className="text-white font-bold truncate tracking-wide text-xs">
                          {track.title}
                        </div>
                        <div className="text-[10px] text-cyber-pinkDim truncate">
                          {track.artist}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <span className={`text-[9px] px-1.5 py-0.5 border ${
                        track.isSynced
                          ? 'border-cyber-cyan bg-cyber-cyan/15 text-cyber-cyan'
                          : 'border-cyber-borderDim text-cyber-textDim'
                      }`}>
                        {track.lyricSource || 'TELEMETRY'}
                      </span>
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
            disabled={stagedFiles.length === 0 || isProcessing}
            className={`w-full py-2.5 border transition-all font-bold tracking-widest text-xs flex items-center justify-center space-x-2 ${
              stagedFiles.length > 0 && !isProcessing
                ? 'bg-cyber-bgCardLight border-cyber-cyan text-cyber-cyan hover:bg-cyber-cyan/20 hover:text-white shadow-cyan cursor-pointer'
                : 'bg-cyber-bgDark border-cyber-borderDim text-cyber-textDim/40 cursor-not-allowed'
            }`}
          >
            <CheckCircle2 size={16} />
            <span>TRANSMIT {stagedFiles.length} EXTRACTED TRACKS TO PLAYER</span>
          </button>
        </div>
      </div>
    </div>
  );
};
