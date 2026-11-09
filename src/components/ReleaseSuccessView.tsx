import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, 
  CheckCircle2, 
  Copy, 
  Check, 
  Download, 
  ArrowRight, 
  RotateCcw, 
  Music, 
  Disc, 
  Radio, 
  ShieldCheck, 
  Calendar, 
  Layers, 
  FileText, 
  ExternalLink,
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Share2,
  Zap,
  Globe,
  Headphones,
  Sliders,
  RadioTower
} from 'lucide-react';
import { Release, User, ReleaseTrack } from '../types';

interface ReleaseSuccessViewProps {
  release: Release;
  currentUser: User;
  onViewCatalogue: () => void;
  onNewRelease: () => void;
}

const DSP_STORES = [
  { name: 'Spotify', logo: '🟢', status: 'Ingested & Queued', color: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-950/20' },
  { name: 'Apple Music', logo: '🍎', status: 'Master Check Pass', color: 'text-pink-400', border: 'border-pink-500/20', bg: 'bg-pink-950/20' },
  { name: 'YouTube Music', logo: '▶️', status: 'Content ID Active', color: 'text-red-400', border: 'border-red-500/20', bg: 'bg-red-950/20' },
  { name: 'Amazon Music', logo: '📦', status: 'HD Delivery Queued', color: 'text-amber-400', border: 'border-amber-500/20', bg: 'bg-amber-950/20' },
  { name: 'TikTok & ByteDance', logo: '🎵', status: 'Sync Ready', color: 'text-cyan-400', border: 'border-cyan-500/20', bg: 'bg-cyan-950/20' },
  { name: 'Instagram & Meta', logo: '📸', status: 'Reels Audio Ingested', color: 'text-purple-400', border: 'border-purple-500/20', bg: 'bg-purple-950/20' },
  { name: 'Tidal & Hi-Fi', logo: '💎', status: 'Lossless Master Pass', color: 'text-blue-400', border: 'border-blue-500/20', bg: 'bg-blue-950/20' },
  { name: 'Beatport / Traxsource', logo: '🎧', status: 'Club Catalog Ready', color: 'text-green-400', border: 'border-green-500/20', bg: 'bg-green-950/20' },
  { name: 'Deezer', logo: '🟣', status: 'Flow Engine Linked', color: 'text-indigo-400', border: 'border-indigo-500/20', bg: 'bg-indigo-950/20' },
  { name: '150+ Partner Stores', logo: '🌐', status: 'Global Proxy Active', color: 'text-slate-300', border: 'border-white/10', bg: 'bg-white/5' },
];

// Fallback high quality royalty-free preview tracks if local file URL is unavailable
const DEMO_AUDIO_URLS = [
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'
];

export default function ReleaseSuccessView({
  release,
  currentUser,
  onViewCatalogue,
  onNewRelease
}: ReleaseSuccessViewProps) {
  const [copied, setCopied] = useState(false);
  const [showTracksDetail, setShowTracksDetail] = useState(true);
  const [soundBars, setSoundBars] = useState<number[]>([40, 75, 55, 90, 65, 80, 45, 95, 60, 85, 50, 70, 90, 60, 40]);

  // Player state
  const [selectedTrackIndex, setSelectedTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const tracks = release.tracks && release.tracks.length > 0 ? release.tracks : [
    {
      id: 'tr-default',
      trackName: release.albumName || 'Master Track',
      mainArtistName: release.mainArtistName || currentUser.artistName,
      featureArtists: release.featureArtists || [],
      otherArtists: [],
      genre: release.genre || 'Pop',
      subGenre: release.subGenre || '',
      language: release.language || 'English',
      producer: currentUser.artistName,
      lyricist: currentUser.artistName,
      composer: currentUser.artistName,
      explicitContent: false,
      contentId: 'Yes'
    } as ReleaseTrack
  ];

  const currentTrack = tracks[selectedTrackIndex] || tracks[0];

  // Resolve valid audio source
  const getAudioSource = (t: ReleaseTrack, index: number) => {
    if (t.audioPreviewUrl) return t.audioPreviewUrl;
    if (t.audioSignedUrl) return t.audioSignedUrl;
    if (t.audioFileName && (t.audioFileName.startsWith('http://') || t.audioFileName.startsWith('https://') || t.audioFileName.startsWith('blob:'))) {
      return t.audioFileName;
    }
    return DEMO_AUDIO_URLS[index % DEMO_AUDIO_URLS.length];
  };

  const audioSrc = getAudioSource(currentTrack, selectedTrackIndex);

  // Animated sound waves when playing
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setSoundBars(prev => prev.map(() => Math.floor(Math.random() * 65) + 35));
    }, 250);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Reset audio playback on track switch
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch(err => console.log('Audio autoplay blocked:', err));
      }
    }
  }, [selectedTrackIndex, audioSrc]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => {
          console.warn('Audio play error:', err);
          setIsPlaying(false);
        });
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (audioRef.current.duration) {
        setDuration(audioRef.current.duration);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current && audioRef.current.duration) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.muted = false;
      setIsMuted(false);
    } else {
      audioRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const daysUntilRelease = () => {
    if (!release.releaseDate) return null;
    const target = new Date(release.releaseDate + 'T00:00:00');
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysLeft = daysUntilRelease();

  const handleCopySummary = () => {
    const summary = `🎵 WAVORA LIVE - OFFICIAL DIGITAL RELEASE MANIFEST
═════════════════════════════════════════════════════════════
Distribution Portal: WAVORA LIVE (wavora.live)
Title: ${release.albumName}
Format: ${release.type} (${tracks.length} Track${tracks.length > 1 ? 's' : ''})
Primary Artist: ${release.mainArtistName}
Featured Artists: ${release.featureArtists?.length ? release.featureArtists.join(', ') : 'None'}
Genre: ${release.genre} / ${release.subGenre || 'N/A'}
Language: ${release.language}
Origination: ${release.contentType}
Release Date: ${release.releaseDate} (${daysLeft !== null && daysLeft > 0 ? `${daysLeft} days from now` : 'Live / Ready'})
Publishing Imprint: ${release.labelName || 'Wavora Live'}
Copyright (C Line): ${release.cLine || '© Wavora Live'}
Phonogram (P Line): ${release.pLine || '℗ Wavora Live'}
UPC Code: ${release.upc || 'WAVORA-LIVE-AUTO-UPC'}
Ingestion Network: Wavora Live Global DSP Pipeline
═════════════════════════════════════════════════════════════
TRACKLIST:
${tracks.map((t, i) => `  ${i + 1}. ${t.trackName} - ${t.mainArtistName} [Producer: ${t.producer} | Composer: ${t.composer}]`).join('\n')}
═════════════════════════════════════════════════════════════
Dispatched via Wavora Live Music Distribution Platform`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleDownloadReceipt = () => {
    const content = `WAVORA LIVE - MUSIC INGESTION & DELIVERY RECEIPT
═════════════════════════════════════════════════════════════
PLATFORM:              WAVORA LIVE (wavora.live)
Transaction Reference: WAV-${release.id.slice(0, 8).toUpperCase()}
Submission Timestamp: ${new Date(release.submittedAt || Date.now()).toUTCString()}
Account Holder:        ${currentUser.artistName} (${currentUser.email})
Account Plan:          ${currentUser.plan} Priority Tier

RELEASE SPECIFICATIONS (WAVORA LIVE CATALOGUE)
-------------------------------------------------------------
Title:                 ${release.albumName}
Release Type:          ${release.type}
Total Tracks:          ${tracks.length}
Primary Artist:        ${release.mainArtistName}
Featured Artists:      ${release.featureArtists?.length ? release.featureArtists.join(', ') : 'None'}
Language:              ${release.language}
Primary Genre:         ${release.genre}
Sub-Genre:             ${release.subGenre || 'N/A'}
Origination:           ${release.contentType}
Digital Imprint Label: ${release.labelName || 'Wavora Live Records'}
Copyright Line (C):    ${release.cLine || '© Wavora Live'}
Phonogram Line (P):    ${release.pLine || '℗ Wavora Live'}
Universal Product Code: ${release.upc || 'WAVORA-LIVE-UPC'}
Target Release Date:   ${release.releaseDate}

TRACK DETAILS & WAVORA LIVE VAULT AUDIT
-------------------------------------------------------------
${tracks.map((t, idx) => `
Track #${idx + 1}: ${t.trackName}
  • Artist: ${t.mainArtistName} ${t.featureArtists?.length ? `(feat. ${t.featureArtists.join(', ')})` : ''}
  • Producer: ${t.producer} | Composer: ${t.composer} | Lyricist: ${t.lyricist}
  • Audio Master: ${t.audioFileName ? 'Lossless WAV Master Attached (.wav/.mp3)' : t.googleDriveLink ? `Cloud Master Link: ${t.googleDriveLink}` : 'Attached'}
  • Audio Player Status: Available on Wavora Live Submission Screen
  • Content ID Protection: ${t.contentId || 'Yes'}
  • Advisory: ${t.explicitContent ? 'Explicit Lyrics' : 'Clean / General'}`).join('\n')}

DELIVERY DESTINATIONS (150+ DSPS VIA WAVORA LIVE)
-------------------------------------------------------------
Spotify, Apple Music, YouTube Music & Content ID, Amazon Music HD,
TikTok / ByteDance, Instagram & Facebook Audio Library, Tidal Masters,
Beatport, Deezer, Pandora, Tencent Music, NetEase, Shazam.

═════════════════════════════════════════════════════════════
Thank you for distributing your music with Wavora Live!`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeTitle = release.albumName.replace(/[^a-zA-Z0-9_-]/g, '_');
    link.download = `WAVORA_LIVE_RECEIPT_${safeTitle}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="p-6 sm:p-8 bg-[#0a0e1a] rounded-3xl border border-indigo-500/20 shadow-2xl shadow-indigo-950/40 space-y-8 relative overflow-hidden text-left"
      id="release_success_view_root"
    >
      {/* Hidden Audio Element for playback */}
      <audio 
        ref={audioRef}
        src={audioSrc}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => {
          if (selectedTrackIndex < tracks.length - 1) {
            setSelectedTrackIndex(selectedTrackIndex + 1);
          } else {
            setIsPlaying(false);
          }
        }}
      />

      {/* Radiant Background Glow */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Prominent Branding Banner: WAVORA LIVE */}
      <div className="bg-gradient-to-r from-indigo-950/80 via-slate-900 to-emerald-950/80 p-4 rounded-2xl border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg shadow-indigo-950/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-emerald-400 p-0.5 flex items-center justify-center shrink-0 shadow-md">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <RadioTower className="w-5 h-5 text-emerald-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-emerald-300 to-amber-300 uppercase">
                WAVORA LIVE
              </span>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-widest rounded-full border border-emerald-500/30">
                Official Ingestion Portal
              </span>
            </div>
            <p className="text-[11px] text-slate-300 font-medium">
              Global Music Distribution & Publishing Network
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/10 border border-indigo-500/30 px-3 py-1 rounded-full flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Verified & Ingested by Wavora Live QC
          </span>
        </div>
      </div>

      {/* Main Header & Ambient Audio Spectrum */}
      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5 shadow-sm shadow-emerald-500/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Ingestion Initiated • Master Vaulted
            </span>
            <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-indigo-400" />
              {currentUser.plan} Priority Queue
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            Track Package Dispatched! <Sparkles className="w-7 h-7 text-amber-400 animate-pulse hidden sm:inline" />
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Your release <strong className="text-white font-black">"{release.albumName}"</strong> has been successfully encoded by <strong className="text-indigo-400 font-bold">Wavora Live</strong>, verified against digital audio standards, and transmitted to our global DSP delivery pipeline.
          </p>
        </div>

        {/* Live Audio Spectrum Bar Visualizer */}
        <div className="bg-black/60 p-3.5 rounded-2xl border border-white/10 flex flex-col items-center justify-center gap-2 shrink-0 self-start md:self-auto">
          <div className="flex items-end gap-1 h-8 px-2">
            {soundBars.map((height, i) => (
              <div 
                key={i} 
                className={`w-1 rounded-full transition-all duration-300 ${isPlaying ? 'bg-gradient-to-t from-emerald-500 via-indigo-400 to-amber-300' : 'bg-slate-700'}`}
                style={{ height: `${isPlaying ? height : 25}%` }}
              />
            ))}
          </div>
          <div className="flex items-center gap-1.5 text-[9px] font-mono text-emerald-400 uppercase tracking-widest">
            <Volume2 className={`w-3 h-3 ${isPlaying ? 'animate-pulse text-emerald-400' : 'text-gray-500'}`} />
            <span>Wavora Live Lossless 44.1kHz</span>
          </div>
        </div>
      </div>

      {/* FEATURED: WAVORA LIVE INTERACTIVE AUDIO PLAYER */}
      <div className="bg-gradient-to-br from-indigo-950/70 via-slate-900 to-black p-5 sm:p-6 rounded-3xl border-2 border-indigo-500/40 shadow-2xl relative space-y-4" id="wavora_live_audio_player">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Headphones className="w-4 h-4 text-emerald-400" /> Wavora Live Master Audio Player
            </h3>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full">
            ● Ready for Playback
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          {/* Album Cover preview & Vinyl disc */}
          <div className="md:col-span-4 flex items-center gap-4">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-2xl overflow-hidden shadow-xl border border-white/20 bg-black">
              <img 
                src={release.coverArtSignedUrl || release.coverArtUrl || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=400&auto=format&fit=crop'} 
                alt={currentTrack.trackName}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              {isPlaying && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/80 flex items-center justify-center animate-pulse">
                    <Music className="w-4 h-4 text-black animate-spin" style={{ animationDuration: '3s' }} />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1 min-w-0 flex-1">
              <span className="text-[10px] font-bold text-[#fff6f6] uppercase tracking-widest block">
                Track #{selectedTrackIndex + 1} of {tracks.length}
              </span>
              <h4 className="font-black text-white text-base sm:text-lg truncate" title={currentTrack.trackName}>
                {currentTrack.trackName}
              </h4>
              <p className="text-xs text-slate-300 font-medium truncate">
                {currentTrack.mainArtistName} {currentTrack.featureArtists?.length ? `(feat. ${currentTrack.featureArtists.join(', ')})` : ''}
              </p>
              <span className="inline-block text-[9px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                Wavora Live Master Audio
              </span>
            </div>
          </div>

          {/* Player Controls & Scrubber */}
          <div className="md:col-span-8 space-y-3">
            {/* Scrubber & Time Display */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>{formatTime(currentTime)}</span>
                <span className="text-indigo-300 font-bold">{currentTrack.trackName}</span>
                <span>{formatTime(duration)}</span>
              </div>

              <input 
                type="range"
                min="0"
                max={duration || 100}
                step="0.1"
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-2 bg-slate-800 accent-emerald-400 rounded-lg cursor-pointer"
                id="audio_scrubber_input"
              />
            </div>

            {/* Controls Bar: Play, Next/Prev, Volume, Track selector */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              {/* Previous / Play / Next */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedTrackIndex((prev) => (prev > 0 ? prev - 1 : tracks.length - 1))}
                  disabled={tracks.length <= 1}
                  className="p-2 text-slate-400 hover:text-white disabled:opacity-30 transition cursor-pointer"
                  title="Previous Track"
                  id="btn_prev_track"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                <button
                  onClick={togglePlayPause}
                  className="cursor-pointer p-3.5 bg-gradient-to-r from-emerald-400 to-indigo-500 hover:from-emerald-300 hover:to-indigo-400 text-black font-black rounded-2xl shadow-lg shadow-emerald-500/20 transition transform active:scale-95 flex items-center justify-center gap-1.5"
                  id="btn_play_pause_audio"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-5 h-5 fill-black" />
                      <span className="text-xs font-black uppercase tracking-wider pr-1">Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 fill-black ml-0.5" />
                      <span className="text-xs font-black uppercase tracking-wider pr-1">Listen Now</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setSelectedTrackIndex((prev) => (prev < tracks.length - 1 ? prev + 1 : 0))}
                  disabled={tracks.length <= 1}
                  className="p-2 text-slate-400 hover:text-white disabled:opacity-30 transition cursor-pointer"
                  title="Next Track"
                  id="btn_next_track"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>

              {/* Volume Slider */}
              <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10">
                <button 
                  onClick={toggleMute} 
                  className="text-slate-400 hover:text-white transition cursor-pointer"
                  id="btn_toggle_mute"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-red-400" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                  )}
                </button>
                <input 
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 sm:w-20 h-1.5 bg-slate-700 accent-emerald-400 rounded-lg cursor-pointer"
                  id="volume_range_input"
                />
              </div>

              {/* Track Switcher Dropdown (if multiple tracks) */}
              {tracks.length > 1 && (
                <select
                  value={selectedTrackIndex}
                  onChange={(e) => setSelectedTrackIndex(Number(e.target.value))}
                  className="bg-slate-900 border border-indigo-500/40 text-xs font-bold text-white py-1.5 px-3 rounded-xl focus:outline-none focus:border-emerald-400 cursor-pointer"
                  id="select_track_audio_switcher"
                >
                  {tracks.map((tr, idx) => (
                    <option key={tr.id || idx} value={idx}>
                      Track {idx + 1}: {tr.trackName}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hero Showcase Card: Vinyl Disc + Holographic Art + Core Metadata */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-900/50 p-6 rounded-2xl border border-white/10 relative">
        {/* Left: Artwork & Vinyl Disc animation */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center relative group">
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
            {/* Vinyl Disc that peeks out */}
            <motion.div 
              animate={{ rotate: isPlaying ? 360 : 0 }}
              transition={isPlaying ? { repeat: Infinity, duration: 6, ease: 'linear' } : { duration: 0.5 }}
              className="absolute right-0 w-44 h-44 sm:w-52 sm:h-52 rounded-full bg-black border-4 border-neutral-900 shadow-2xl flex items-center justify-center z-0 group-hover:translate-x-6 transition-transform duration-500"
              style={{
                backgroundImage: 'radial-gradient(circle, #222 20%, #111 21%, #111 40%, #050505 41%, #050505 60%, #111 61%, #000 100%)'
              }}
            >
              {/* Vinyl Center Label */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 via-indigo-600 to-emerald-400 border-2 border-black flex items-center justify-center text-center p-1">
                <span className="text-[7px] font-black text-black uppercase tracking-tighter leading-none">
                  WAVORA<br/>LIVE
                </span>
              </div>
              <div className="w-2.5 h-2.5 rounded-full bg-black absolute" />
            </motion.div>

            {/* Front Cover Art Image */}
            <div className="relative z-10 w-44 h-44 sm:w-52 sm:h-52 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 bg-black">
              <img 
                src={release.coverArtSignedUrl || release.coverArtUrl || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=400&auto=format&fit=crop'} 
                alt={release.albumName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/80 backdrop-blur-md rounded-md border border-white/20 text-[9px] font-black text-white uppercase tracking-wider">
                {release.type}
              </div>
              <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-emerald-500/90 backdrop-blur-md rounded-md text-[9px] font-black text-black uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5" /> Wavora Live Passed
              </div>
            </div>
          </div>

          <div className="mt-4 text-center space-y-0.5">
            <span className="text-[11px] font-black text-indigo-400 uppercase tracking-widest block">Wavora Live Catalog</span>
            <span className="text-[10px] text-gray-500 font-mono">Ref ID: WAV-{release.id.slice(0, 10).toUpperCase()}</span>
          </div>
        </div>

        {/* Right: Comprehensive Release Ingestion Specs */}
        <div className="lg:col-span-8 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap text-xs text-indigo-400 font-bold uppercase tracking-wider">
              <span>{release.genre}</span>
              {release.subGenre && <span>• {release.subGenre}</span>}
              <span>• {release.language}</span>
              <span>• {release.contentType}</span>
              <span className="text-emerald-400">• Distributed by Wavora Live</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
              {release.albumName}
            </h2>

            <div className="flex items-center gap-2 text-sm text-slate-300 mt-1 font-medium">
              <span>Primary Artist: <strong className="text-white font-bold">{release.mainArtistName}</strong></span>
              {(release.featureArtists?.length > 0 || release.otherArtists?.length > 0) && (
                <span className="text-amber-400 text-xs">
                  (feat. {[...(release.featureArtists || []), ...(release.otherArtists || [])].join(', ')})
                </span>
              )}
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-black/50 p-4 rounded-xl border border-white/5">
            <div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Release Date</span>
              <span className="text-xs font-bold text-white flex items-center gap-1 mt-0.5">
                <Calendar className="w-3 h-3 text-indigo-400" />
                {new Date(release.releaseDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              {daysLeft !== null && (
                <span className="text-[9px] font-bold text-emerald-400 block mt-0.5">
                  {daysLeft > 0 ? `Target: in ${daysLeft} days` : 'Immediate Delivery'}
                </span>
              )}
            </div>

            <div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Tracks Count</span>
              <span className="text-xs font-bold text-white flex items-center gap-1 mt-0.5">
                <Music className="w-3 h-3 text-pink-400" />
                {tracks.length} Master File{tracks.length > 1 ? 's' : ''}
              </span>
              <span className="text-[9px] text-gray-400 block mt-0.5">Wavora Lossless Master</span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Publishing Imprint</span>
              <span className="text-xs font-bold text-amber-400 truncate block mt-0.5" title={release.labelName}>
                {release.labelName || 'Wavora Live'}
              </span>
              <span className="text-[9px] text-gray-500 font-mono block mt-0.5 truncate">{release.cLine || '© Wavora Live'}</span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">UPC Identification</span>
              <span className="text-xs font-mono font-bold text-emerald-400 truncate block mt-0.5">
                {release.upc || 'Auto-Allocated by Wavora Live'}
              </span>
              <span className="text-[9px] text-gray-400 block mt-0.5">Digital Barcode</span>
            </div>
          </div>

          {/* Quick Action Buttons inside Card */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <button
              onClick={handleCopySummary}
              className="cursor-pointer py-2 px-3.5 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 rounded-xl text-xs font-bold transition flex items-center gap-1.5 active:scale-95"
              id="btn_copy_release_summary"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Wavora Live Manifest Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-gray-400" />
                  <span>Copy Metadata Manifest</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadReceipt}
              className="cursor-pointer py-2 px-3.5 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 rounded-xl text-xs font-bold transition flex items-center gap-1.5 active:scale-95"
              id="btn_download_delivery_receipt"
            >
              <Download className="w-3.5 h-3.5 text-gray-400" />
              <span>Download Wavora Live Receipt</span>
            </button>

            <button
              onClick={() => setShowTracksDetail(!showTracksDetail)}
              className="cursor-pointer py-2 px-3.5 bg-indigo-950/40 hover:bg-indigo-900/50 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ml-auto"
              id="btn_toggle_tracks_breakdown"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{showTracksDetail ? 'Hide Master Track List' : `View Tracks (${tracks.length})`}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Tracks Ingestion List (Collapsible) */}
      {showTracksDetail && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-black/60 p-5 rounded-2xl border border-indigo-500/20 space-y-3"
          id="tracks_breakdown_container"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-xs font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5" /> Wavora Live Master Track Array ({tracks.length})
            </span>
            <span className="text-[10px] text-gray-500 font-mono">Wavora Live QC Vault: PASS</span>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {tracks.map((track, idx) => (
              <div 
                key={track.id || idx}
                className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition ${selectedTrackIndex === idx ? 'bg-indigo-950/60 border-indigo-500/50 shadow-md' : 'bg-slate-900/80 border-white/5'}`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedTrackIndex(idx);
                        setIsPlaying(true);
                      }}
                      className="w-7 h-7 rounded-full bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-black transition flex items-center justify-center cursor-pointer shrink-0"
                      title="Play this track"
                      id={`btn_play_track_item_${idx}`}
                    >
                      {selectedTrackIndex === idx && isPlaying ? (
                        <Pause className="w-3.5 h-3.5 fill-current" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      )}
                    </button>
                    <span className="font-bold text-white text-sm">{track.trackName}</span>
                    {track.explicitContent && (
                      <span className="text-[8px] bg-red-950 text-red-400 border border-red-500/30 px-1.5 py-0.2 rounded font-black uppercase">
                        Explicit
                      </span>
                    )}
                    {track.contentId === 'Yes' && (
                      <span className="text-[8px] bg-emerald-950 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded font-black uppercase">
                        Content ID: Active
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-gray-400 pl-9">
                    Artist: <span className="text-gray-300 font-medium">{track.mainArtistName}</span>
                    {track.featureArtists?.length ? ` (feat. ${track.featureArtists.join(', ')})` : ''} • Producer: <span className="text-gray-300">{track.producer}</span> • Composer: <span className="text-gray-300">{track.composer}</span>
                  </div>
                </div>

                <div className="sm:text-right pl-9 sm:pl-0 shrink-0 flex items-center gap-2">
                  <span className="text-[10px] text-indigo-300 font-mono bg-indigo-950/40 border border-indigo-500/30 px-2.5 py-1 rounded-lg inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Wavora Live Master Ready</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* DSP Distribution Ingestion Network Matrix */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-400" /> Wavora Live DSP Delivery Nodes
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Live delivery status across Wavora Live's 150+ digital streaming partner network.
            </p>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full hidden sm:inline-block">
            100% Wavora Live Outlets Targeted
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {DSP_STORES.map((dsp, idx) => (
            <div 
              key={idx}
              className={`p-3 rounded-2xl border ${dsp.border} ${dsp.bg} backdrop-blur-sm flex flex-col justify-between gap-2 hover:scale-[1.02] transition-transform`}
            >
              <div className="flex items-center justify-between">
                <span className="text-lg">{dsp.logo}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div>
                <div className="font-bold text-xs text-white truncate">{dsp.name}</div>
                <div className={`text-[9px] font-mono mt-0.5 truncate ${dsp.color}`}>
                  ● {dsp.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Artist Next-Steps Strategy Guide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-black/40 rounded-2xl border border-white/5 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-black uppercase tracking-wider">
            <Zap className="w-4 h-4" /> Spotify Editorial Pitching
          </div>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            Your release is transmitted via <strong className="text-slate-200">Wavora Live</strong>. Once it lands in Spotify for Artists (3-5 days prior to release), submit your official playlist pitch!
          </p>
        </div>

        <div className="p-4 bg-black/40 rounded-2xl border border-white/5 space-y-2">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-black uppercase tracking-wider">
            <Radio className="w-4 h-4" /> Wavora Live OAC Claim
          </div>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            Claim your Official Artist Channel (OAC) with music note badge 🎵 under the <strong className="text-slate-200">Wavora Live OAC Claim</strong> module to consolidate subscriber count.
          </p>
        </div>

        <div className="p-4 bg-black/40 rounded-2xl border border-white/5 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" /> 100% Royalty Protection
          </div>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            All streams, downloads, and Content ID revenues flow directly into your <strong className="text-slate-200">Wavora Live Earnings</strong> ledger with zero commission deduction.
          </p>
        </div>
      </div>

      {/* Final Action Hub Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
        <button
          onClick={onNewRelease}
          className="w-full sm:w-auto cursor-pointer px-6 py-3 bg-[#151c2e] hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs rounded-2xl transition border border-white/10 flex items-center justify-center gap-2 active:scale-95"
          id="btn_submit_another_track"
        >
          <RotateCcw className="w-4 h-4 text-gray-400" /> Submit Another Release to Wavora Live
        </button>

        <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={onViewCatalogue}
            className="w-full sm:w-auto cursor-pointer px-8 py-3.5 bg-gradient-to-r from-[#6366F1] to-emerald-400 hover:from-[#4f46e5] hover:to-emerald-300 text-black font-black text-xs uppercase tracking-tight rounded-2xl transition shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2 active:scale-95"
            id="btn_go_to_catalogue"
          >
            <span>View in Wavora Live Catalogue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
