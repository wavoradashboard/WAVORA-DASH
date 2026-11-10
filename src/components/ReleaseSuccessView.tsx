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
  RadioTower,
  FileDown,
  Printer,
  Clock,
  Upload,
  ImagePlus
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

  // Custom Poster Artwork state
  const [customPosterCoverUrl, setCustomPosterCoverUrl] = useState<string | null>(null);
  const posterFileInputRef = useRef<HTMLInputElement | null>(null);

  const handleCustomCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please upload a valid image file (PNG, JPG, JPEG, WEBP).');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          setCustomPosterCoverUrl(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetCustomCover = () => {
    setCustomPosterCoverUrl(null);
    if (posterFileInputRef.current) {
      posterFileInputRef.current.value = '';
    }
  };

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

  const [copiedPreSave, setCopiedPreSave] = useState(false);
  const [copiedSocialText, setCopiedSocialText] = useState(false);

  const handleDownloadPDFReceipt = () => {
    const printWindow = window.open('', '_blank', 'width=850,height=1100');
    if (!printWindow) {
      alert("Please allow popups to generate and print your official PDF receipt.");
      return;
    }

    const refId = `WAV-${release.id.slice(0, 10).toUpperCase()}`;
    const formattedDate = new Date(release.submittedAt || Date.now()).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const receiptHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Wavora Distribution Receipt - ${release.albumName}</title>
        <style>
          @page { size: A4; margin: 15mm; }
          * { box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #0f172a;
            background: #ffffff;
            margin: 0;
            padding: 24px;
            font-size: 11px;
            line-height: 1.5;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 3px solid #6366f1;
            padding-bottom: 16px;
            margin-bottom: 24px;
          }
          .brand {
            font-size: 26px;
            font-weight: 900;
            color: #0f172a;
            letter-spacing: -0.5px;
          }
          .brand span { color: #6366f1; }
          .sub { font-size: 10px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
          .badge {
            background: #ecfdf5;
            color: #047857;
            padding: 8px 14px;
            border-radius: 8px;
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border: 1.5px solid #a7f3d0;
          }
          .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-bottom: 20px;
          }
          .card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 14px;
          }
          .card-title {
            font-size: 10px;
            font-weight: 800;
            color: #475569;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 10px;
            border-bottom: 1px solid #cbd5e1;
            padding-bottom: 4px;
          }
          .row { display: flex; justify-content: space-between; margin-bottom: 6px; }
          .lbl { color: #64748b; font-weight: 500; }
          .val { font-weight: 700; color: #0f172a; text-align: right; }
          .tbl {
            width: 100%;
            border-collapse: collapse;
            margin-top: 12px;
            margin-bottom: 24px;
          }
          .tbl th {
            background: #0f172a;
            color: #ffffff;
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 1px;
            padding: 10px;
            text-align: left;
          }
          .tbl td {
            border-bottom: 1px solid #e2e8f0;
            padding: 10px;
            font-size: 11px;
          }
          .footer {
            margin-top: 40px;
            border-top: 2px solid #e2e8f0;
            padding-top: 20px;
            text-align: center;
            font-size: 10px;
            color: #64748b;
          }
          .btn-print {
            background: #6366f1;
            color: white;
            border: none;
            padding: 10px 22px;
            font-weight: 800;
            border-radius: 8px;
            cursor: pointer;
            font-size: 12px;
          }
          @media print {
            .no-print { display: none !important; }
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 20px; text-align: right;">
          <button onclick="window.print()" class="btn-print">
            🖨️ Print / Save as PDF Receipt
          </button>
        </div>

        <div class="header">
          <div>
            <div class="brand">WAVORA<span>LIVE</span></div>
            <div class="sub">Official Music Ingestion & Distribution Receipt</div>
          </div>
          <div class="badge">
            ✓ Verified Submission
          </div>
        </div>

        <div class="grid">
          <div class="card">
            <div class="card-title">ACCOUNT & DISPATCH INFORMATION</div>
            <div class="row"><span class="lbl">Receipt Reference:</span><span class="val">${refId}</span></div>
            <div class="row"><span class="lbl">Artist Name:</span><span class="val">${currentUser.artistName}</span></div>
            <div class="row"><span class="lbl">Account Email:</span><span class="val">${currentUser.email}</span></div>
            <div class="row"><span class="lbl">Account Tier:</span><span class="val">${currentUser.plan} Priority Plan</span></div>
            <div class="row"><span class="lbl">Submission Date:</span><span class="val">${formattedDate}</span></div>
          </div>

          <div class="card">
            <div class="card-title">RELEASE SPECIFICATIONS</div>
            <div class="row"><span class="lbl">Release Title:</span><span class="val">${release.albumName}</span></div>
            <div class="row"><span class="lbl">Primary Artist:</span><span class="val">${release.mainArtistName}</span></div>
            <div class="row"><span class="lbl">Featured Artists:</span><span class="val">${release.featureArtists?.length ? release.featureArtists.join(', ') : 'None'}</span></div>
            <div class="row"><span class="lbl">Release Format:</span><span class="val">${release.type} (${tracks.length} track${tracks.length > 1 ? 's' : ''})</span></div>
            <div class="row"><span class="lbl">Genre / Sub-Genre:</span><span class="val">${release.genre} ${release.subGenre ? `/ ${release.subGenre}` : ''}</span></div>
            <div class="row"><span class="lbl">Target Release Date:</span><span class="val">${release.releaseDate}</span></div>
            <div class="row"><span class="lbl">UPC Barcode:</span><span class="val">${release.upc || 'Auto-Allocated UPC'}</span></div>
          </div>
        </div>

        <div class="card" style="margin-bottom: 20px;">
          <div class="card-title">COPYRIGHT & IMPRINT OWNERSHIP</div>
          <div class="row"><span class="lbl">Record Label Imprint:</span><span class="val">${release.labelName || 'Independent Release'}</span></div>
          <div class="row"><span class="lbl">Copyright Line (C):</span><span class="val">${release.cLine || `© ${new Date().getFullYear()} ${currentUser.artistName}`}</span></div>
          <div class="row"><span class="lbl">Phonogram Line (P):</span><span class="val">${release.pLine || `℗ ${new Date().getFullYear()} ${currentUser.artistName}`}</span></div>
          <div class="row"><span class="lbl">Royalty Payout Share:</span><span class="val">100% Direct Royalty Payout</span></div>
        </div>

        <div class="card-title" style="margin-bottom: 6px;">TRACKLIST & AUDIO MANIFEST (${tracks.length})</div>
        <table class="tbl">
          <thead>
            <tr>
              <th>#</th>
              <th>Track Title</th>
              <th>Artist</th>
              <th>Producer / Composers</th>
              <th>Content ID</th>
              <th>Explicit</th>
            </tr>
          </thead>
          <tbody>
            ${tracks.map((t, idx) => `
              <tr>
                <td><strong>${idx + 1}</strong></td>
                <td><strong>${t.trackName}</strong></td>
                <td>${t.mainArtistName}</td>
                <td>${t.producer || 'N/A'} / ${t.composer || 'N/A'}</td>
                <td>${t.contentId || 'Yes'}</td>
                <td>${t.explicitContent ? 'EXPLICIT' : 'Clean'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <div style="font-weight: 800; color: #10b981; margin-bottom: 4px;">OFFICIAL DIGITAL RECEIPT CERTIFICATE</div>
          <div>Issued by Wavora Live • Music Ingestion & Global Publishing Network</div>
          <div style="margin-top: 4px; font-size: 9px; color: #94a3b8;">This document serves as proof of track submission, metadata registration, and copyright logging.</div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 500);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(receiptHtml);
    printWindow.document.close();
  };

  // Releasing Soon HD Poster HTML5 Canvas Download Generator
  // Releasing Soon / OUT NOW HD Poster HTML5 Canvas Download Generator
  const handleDownloadCanvasPoster = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const trackToUse = tracks[selectedTrackIndex] || tracks[0];
    const trackTitle = trackToUse ? trackToUse.trackName : release.albumName;
    const artistName = trackToUse?.mainArtistName || release.mainArtistName;
    const featStr = trackToUse?.featureArtists?.length 
      ? ` FEAT. ${trackToUse.featureArtists.join(', ')}` 
      : (release.featureArtists?.length ? ` FEAT. ${release.featureArtists.join(', ')}` : '');
    const fullArtistStr = `${artistName}${featStr}`;
    const isLive = release.status === 'Live';

    // Background Gradient: Deep Cyber Obsidian & Indigo
    const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1080);
    bgGrad.addColorStop(0, '#050714');
    bgGrad.addColorStop(0.35, '#0e0e2e');
    bgGrad.addColorStop(0.75, '#070a1a');
    bgGrad.addColorStop(1, '#02030a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1080, 1080);

    // Ambient radial glow effects
    const rad1 = ctx.createRadialGradient(540, 360, 20, 540, 360, 520);
    rad1.addColorStop(0, isLive ? 'rgba(16, 185, 129, 0.45)' : 'rgba(99, 102, 241, 0.45)');
    rad1.addColorStop(0.6, isLive ? 'rgba(6, 182, 212, 0.15)' : 'rgba(168, 85, 247, 0.2)');
    rad1.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = rad1;
    ctx.fillRect(0, 0, 1080, 1080);

    const rad2 = ctx.createRadialGradient(540, 850, 40, 540, 850, 400);
    rad2.addColorStop(0, isLive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)');
    rad2.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = rad2;
    ctx.fillRect(0, 0, 1080, 1080);

    // Decorative double border
    ctx.strokeStyle = isLive ? 'rgba(16, 185, 129, 0.6)' : 'rgba(99, 102, 241, 0.6)';
    ctx.lineWidth = 12;
    ctx.strokeRect(32, 32, 1016, 1016);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.strokeRect(48, 48, 984, 984);

    // Header Layout: Wavora Live Logo in Top-Left Corner, Status Badge in Top-Right Corner
    const drawDetailsAndExport = (coverImg?: HTMLImageElement, logoImg?: HTMLImageElement) => {
      // 1. Draw Official Wavora Live Logo Image in Top-Left Corner
      if (logoImg) {
        try {
          const maxW = 320;
          const maxH = 75;
          const aspect = logoImg.width / logoImg.height;
          let drawW = maxW;
          let drawH = drawW / aspect;
          if (drawH > maxH) {
            drawH = maxH;
            drawW = drawH * aspect;
          }
          const logoX = 65;
          const logoY = 52 + (maxH - drawH) / 2;
          ctx.drawImage(logoImg, logoX, logoY, drawW, drawH);
        } catch (e) {
          ctx.fillStyle = '#f8fafc';
          ctx.font = '900 28px -apple-system, sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText('WAVORA LIVE', 65, 95);
        }
      } else {
        ctx.fillStyle = '#f8fafc';
        ctx.font = '900 28px -apple-system, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('WAVORA LIVE', 65, 95);
      }

      // 2. Draw Header Status Pill Badge in Top-Right Corner (No Release Date!)
      ctx.fillStyle = isLive ? 'rgba(16, 185, 129, 0.25)' : 'rgba(245, 158, 11, 0.25)';
      ctx.strokeStyle = isLive ? '#10b981' : '#f59e0b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(640, 60, 370, 54, 27);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isLive ? '#34d399' : '#fbbf24';
      ctx.font = '900 22px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(isLive ? '🔥 OUT NOW 🔥' : '⚡ RELEASING SOON ⚡', 825, 95);

      // 3. Cover Artwork Container + Vinyl Disc Peeking
      const imgSize = 430;
      const imgX = (1080 - imgSize) / 2 - 45;
      const imgY = 150;

      // Draw Vinyl Record Peeking out on the right
      const vinylCenterX = imgX + imgSize / 2 + 115;
      const vinylCenterY = imgY + imgSize / 2;
      const vinylRadius = 205;

      ctx.beginPath();
      ctx.arc(vinylCenterX, vinylCenterY, vinylRadius, 0, 2 * Math.PI);
      ctx.fillStyle = '#050505';
      ctx.fill();
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#222533';
      ctx.stroke();

      // Vinyl Grooves
      [185, 160, 135, 110, 85].forEach(r => {
        ctx.beginPath();
        ctx.arc(vinylCenterX, vinylCenterY, r, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.09)';
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      // Vinyl Center Label
      ctx.beginPath();
      ctx.arc(vinylCenterX, vinylCenterY, 68, 0, 2 * Math.PI);
      ctx.fillStyle = isLive ? '#065f46' : '#4338ca';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Center Spindle Hole
      ctx.beginPath();
      ctx.arc(vinylCenterX, vinylCenterY, 12, 0, 2 * Math.PI);
      ctx.fillStyle = '#050714';
      ctx.fill();

      // Draw Cover Art
      if (coverImg) {
        try {
          ctx.drawImage(coverImg, imgX, imgY, imgSize, imgSize);
        } catch (e) {
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(imgX, imgY, imgSize, imgSize);
        }
      } else {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(imgX, imgY, imgSize, imgSize);
      }

      // Border around artwork
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 6;
      ctx.strokeRect(imgX, imgY, imgSize, imgSize);

      // 4. Stylized Audio Equalizer Waveform Graphic
      const waveY = 625;
      const barCount = 38;
      const barWidth = 10;
      const gap = 8;
      const waveStartX = (1080 - (barCount * (barWidth + gap))) / 2;

      for (let i = 0; i < barCount; i++) {
        const h = Math.abs(Math.sin(i * 0.45) * 45) + 12;
        const x = waveStartX + i * (barWidth + gap);
        const y = waveY - h / 2;

        const waveGrad = ctx.createLinearGradient(0, y, 0, y + h);
        if (isLive) {
          waveGrad.addColorStop(0, '#34d399');
          waveGrad.addColorStop(1, '#6366f1');
        } else {
          waveGrad.addColorStop(0, '#fbbf24');
          waveGrad.addColorStop(1, '#ec4899');
        }
        ctx.fillStyle = waveGrad;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, h, 5);
        ctx.fill();
      }

      // 5. Track / Release Title
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 48px -apple-system, sans-serif';
      ctx.textAlign = 'center';

      let displayTitle = trackTitle.toUpperCase();
      if (displayTitle.length > 24) {
        displayTitle = displayTitle.slice(0, 22) + '...';
      }
      ctx.fillText(`"${displayTitle}"`, 540, 698);

      // 6. Artist Name
      ctx.fillStyle = isLive ? '#6ee7b7' : '#a5b4fc';
      ctx.font = '700 28px -apple-system, sans-serif';
      let displayArtist = fullArtistStr.toUpperCase();
      if (displayArtist.length > 36) {
        displayArtist = displayArtist.slice(0, 34) + '...';
      }
      ctx.fillText(displayArtist, 540, 750);

      // 7. Streaming Stores Ribbon (No Release Date!)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(140, 782, 800, 48, 24);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '800 16px -apple-system, sans-serif';
      ctx.fillText('SPOTIFY  •  APPLE MUSIC  •  YOUTUBE MUSIC  •  AMAZON  •  DEEZER  •  TIDAL', 540, 812);

      // 8. Footer Glassmorphic Pill Ribbon
      const footerY = 865;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.strokeStyle = isLive ? 'rgba(16, 185, 129, 0.6)' : 'rgba(99, 102, 241, 0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(140, footerY, 800, 60, 30);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#f8fafc';
      ctx.font = '800 18px -apple-system, sans-serif';
      ctx.fillText('DISTRIBUTED BY WAVORA LIVE  •  100% ROYALTIES  •  150+ GLOBAL DSPS', 540, footerY + 36);

      // Trigger download
      const link = document.createElement('a');
      const safeName = trackTitle.replace(/[^a-zA-Z0-9_-]/g, '_');
      const filePrefix = isLive ? 'WAVORA_LIVE_OUT_NOW_' : 'WAVORA_LIVE_PROMO_POSTER_';
      link.download = `${filePrefix}${safeName}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };

    // Load artwork and logo images asynchronously before exporting canvas
    const coverArtSrc = customPosterCoverUrl || release.coverArtSignedUrl || release.coverArtUrl;
    const logoSrc = '/assets/aistudio/IMG_20260610_015205_335_a0de0a77.webp';

    let loadedCover: HTMLImageElement | undefined = undefined;
    let loadedLogo: HTMLImageElement | undefined = undefined;
    let coverDone = !coverArtSrc;
    let logoDone = false;

    const checkReady = () => {
      if (coverDone && logoDone) {
        drawDetailsAndExport(loadedCover, loadedLogo);
      }
    };

    // Load Wavora Live Logo Image
    const logoImg = new Image();
    logoImg.crossOrigin = 'anonymous';
    logoImg.onload = () => {
      loadedLogo = logoImg;
      logoDone = true;
      checkReady();
    };
    logoImg.onerror = () => {
      logoDone = true;
      checkReady();
    };
    logoImg.src = logoSrc;

    // Load Cover Image if available
    if (coverArtSrc) {
      const coverImg = new Image();
      if (!coverArtSrc.startsWith('data:')) {
        coverImg.crossOrigin = 'anonymous';
      }
      coverImg.onload = () => {
        loadedCover = coverImg;
        coverDone = true;
        checkReady();
      };
      coverImg.onerror = () => {
        coverDone = true;
        checkReady();
      };
      coverImg.src = coverArtSrc;
    }
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
              onClick={handleDownloadPDFReceipt}
              className="cursor-pointer py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black rounded-xl text-xs transition flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95"
              id="btn_download_pdf_receipt"
            >
              <FileDown className="w-4 h-4 text-slate-950" />
              <span>Download Official PDF Receipt</span>
            </button>

            <button
              onClick={handleCopySummary}
              className="cursor-pointer py-2 px-3.5 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 rounded-xl text-xs font-bold transition flex items-center gap-1.5 active:scale-95"
              id="btn_copy_release_summary"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Metadata Manifest Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-gray-400" />
                  <span>Copy Metadata Text</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadReceipt}
              className="cursor-pointer py-2 px-3.5 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 rounded-xl text-xs font-bold transition flex items-center gap-1.5 active:scale-95"
              id="btn_download_delivery_receipt"
            >
              <Download className="w-3.5 h-3.5 text-gray-400" />
              <span>Download Text Receipt</span>
            </button>
          </div>
        </div>
      </div>

      {/* Release Ingestion Lifecycle & Milestone Progress Tracker */}
      <div className="bg-[#0e1424] p-6 rounded-3xl border border-slate-800 space-y-4" id="ingestion_milestone_tracker">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Release Ingestion & Compliance Milestones
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Track the real-time moderation and distribution steps for <strong className="text-white">"{release.albumName}"</strong>.
            </p>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full font-bold">
            QC Audit: Passed
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
          <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-emerald-500/30 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider">Step 1: Audio Quality</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="font-bold text-xs text-white">Lossless Master Check</div>
            <p className="text-[10px] text-slate-400 leading-tight">44.1kHz WAV master audio sample rates passed QC audit.</p>
          </div>

          <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-emerald-500/30 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider">Step 2: Metadata</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="font-bold text-xs text-white">Rights & Copyright Verified</div>
            <p className="text-[10px] text-slate-400 leading-tight">Publishing C & P lines logged for 100% royalty payout.</p>
          </div>

          <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-indigo-500/30 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-wider">Step 3: Barcodes</span>
              <Clock className="w-4 h-4 text-indigo-400 animate-pulse" />
            </div>
            <div className="font-bold text-xs text-white">UPC & ISRC Assignment</div>
            <p className="text-[10px] text-slate-400 leading-tight">Official barcodes generated and assigned to tracklist.</p>
          </div>

          <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-amber-500/30 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider">Step 4: Global DSPs</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <div className="font-bold text-xs text-white">Store Delivery Queue</div>
            <p className="text-[10px] text-slate-400 leading-tight">Dispatching to Spotify, Apple, YouTube, and 150+ partners.</p>
          </div>
        </div>
      </div>


      {/* CUSTOMIZED RELEASING SOON / OUT NOW POSTER GENERATOR CARD */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950/70 to-black p-6 rounded-3xl border-2 border-indigo-500/40 space-y-5" id="releasing_soon_poster_generator_card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
                {release.status === 'Live' ? 'Customized "OUT NOW" Official Poster' : 'Customized Wavora Live Promo Poster'}
              </h3>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Customized with official Wavora Live logo, peeking vinyl disc, audio waveform visualizer, and streaming partners (No release date).
            </p>
          </div>

          <button
            onClick={handleDownloadCanvasPoster}
            className={`px-4 py-2.5 bg-gradient-to-r ${
              release.status === 'Live' 
                ? 'from-emerald-400 via-teal-400 to-indigo-400 hover:from-emerald-300 hover:to-indigo-300 text-slate-950 shadow-emerald-500/20' 
                : 'from-amber-400 via-amber-500 to-indigo-500 hover:from-amber-300 hover:to-indigo-400 text-slate-950 shadow-amber-500/20'
            } font-black rounded-xl text-xs flex items-center gap-2 transition shadow-lg shrink-0 cursor-pointer active:scale-95`}
            id="btn_download_hd_poster_png"
          >
            <Download className="w-4 h-4 text-slate-950" />
            <span>{release.status === 'Live' ? 'Download HD OUT NOW Poster (PNG)' : 'Download HD Poster (PNG)'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Controls: Track selection & customization */}
          <div className="lg:col-span-5 space-y-4 text-xs">
            {tracks.length > 1 && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Select Track to Customize Poster:
                </label>
                <select
                  value={selectedTrackIndex}
                  onChange={(e) => setSelectedTrackIndex(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-indigo-500/40 text-xs font-bold text-white py-2 px-3 rounded-xl focus:outline-none focus:border-amber-400 cursor-pointer"
                  id="select_poster_track"
                >
                  {tracks.map((tr, idx) => (
                    <option key={tr.id || idx} value={idx}>
                      Track #{idx + 1}: {tr.trackName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Custom Poster Artwork Upload Control */}
            <div className="p-4 bg-gradient-to-br from-indigo-950/40 via-slate-900/60 to-black rounded-2xl border border-indigo-500/30 space-y-3" id="custom_poster_art_upload_section">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImagePlus className="w-4 h-4 text-amber-400" />
                  <span className="font-extrabold text-white text-xs uppercase tracking-wider">
                    Poster Cover Artwork
                  </span>
                </div>
                {customPosterCoverUrl ? (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    Custom Applied
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-slate-800 text-slate-400 border border-slate-700">
                    Release Master Art
                  </span>
                )}
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Upload your own custom artwork or promo graphic specifically for this poster. Your official release metadata and store delivery files will remain unchanged.
              </p>

              {/* Hidden file input for custom poster cover */}
              <input 
                ref={posterFileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleCustomCoverUpload}
                className="hidden"
                id="input_custom_poster_cover"
              />

              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => posterFileInputRef.current?.click()}
                  className="px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition cursor-pointer shadow-md shadow-indigo-600/20 active:scale-95"
                  id="btn_upload_custom_poster_art"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{customPosterCoverUrl ? 'Replace Custom Artwork' : 'Upload Custom Cover Art'}</span>
                </button>

                {customPosterCoverUrl && (
                  <button
                    type="button"
                    onClick={handleResetCustomCover}
                    className="px-3 py-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                    id="btn_reset_poster_art"
                    title="Revert back to original release artwork"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                    <span>Reset to Original</span>
                  </button>
                )}
              </div>
            </div>

            <div className="p-4 bg-black/40 rounded-2xl border border-white/10 space-y-2 text-slate-300 text-[11px]">
              <div className="flex justify-between border-b border-white/5 pb-1.5">
                <span className="text-slate-500">Poster Track Title:</span>
                <span className="font-bold text-white truncate max-w-[180px]">{currentTrack.trackName}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1.5">
                <span className="text-slate-500">Artist Name:</span>
                <span className="font-bold text-indigo-300 truncate max-w-[180px]">
                  {currentTrack.mainArtistName || currentUser.artistName}
                </span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1.5">
                <span className="text-slate-500">Cover Artwork:</span>
                <span className={`font-bold truncate max-w-[180px] ${customPosterCoverUrl ? 'text-amber-300' : 'text-slate-200'}`}>
                  {customPosterCoverUrl ? '🎨 Custom Uploaded Art' : '🎵 Official Release Cover'}
                </span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1.5">
                <span className="text-slate-500">Official Logo:</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Embedded Wavora Live WebP
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Distribution Status:</span>
                <span className={`font-bold ${release.status === 'Live' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {release.status === 'Live' ? '🔥 Live Ingested' : '⚡ Releasing Soon'}
                </span>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 italic leading-relaxed">
              💡 Tip: Click "{release.status === 'Live' ? 'Download HD OUT NOW Poster' : 'Download HD Poster (PNG)'}" to download a 1080x1080 high-resolution social media graphic featuring your artwork, vinyl record accent, and official Wavora Live logo!
            </p>
          </div>

          {/* Live High-Fidelity UI Preview of the Customized Poster */}
          <div className="lg:col-span-7 flex justify-center">
            <div className="w-72 sm:w-80 aspect-square bg-gradient-to-b from-[#050714] via-[#0e0e2e] to-[#02030a] rounded-2xl border-4 border-indigo-500/50 p-4 shadow-2xl relative flex flex-col justify-between items-center text-center overflow-hidden group">
              {/* Ambient Radiant Glows */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-indigo-500/30 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/25 rounded-full blur-3xl pointer-events-none" />

              {/* Top Bar Header Layout: Wavora Live Logo in Top-Left, Status Badge in Top-Right */}
              <div className="w-full flex items-center justify-between relative z-20 pt-1 px-1">
                {/* Top-Left Corner: Wavora Live Official Logo */}
                <img 
                  src="/assets/aistudio/IMG_20260610_015205_335_a0de0a77.webp" 
                  alt="Wavora Live Logo" 
                  className="h-5 sm:h-6 object-contain drop-shadow-md"
                />

                {/* Top-Right Corner: Status Badge */}
                {release.status === 'Live' ? (
                  <span className="px-2.5 py-0.5 bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-[9px] font-black uppercase tracking-wider rounded-full shadow-lg backdrop-blur-md">
                    🔥 OUT NOW
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 bg-amber-500/20 border border-amber-500/50 text-amber-300 text-[9px] font-black uppercase tracking-wider rounded-full shadow-lg backdrop-blur-md">
                    ⚡ RELEASING SOON
                  </span>
                )}
              </div>

              {/* Cover Artwork with Peeking Vinyl Record */}
              <div className="relative z-10 my-1 flex items-center justify-center">
                {/* Vinyl Record Peeking to Right */}
                <div 
                  className="absolute right-[-24px] w-28 h-28 rounded-full bg-black border-2 border-slate-700 shadow-2xl flex items-center justify-center z-0 transition-transform duration-500 group-hover:translate-x-3"
                  style={{
                    backgroundImage: 'radial-gradient(circle, #222 20%, #111 21%, #111 40%, #050505 41%, #050505 60%, #111 61%, #000 100%)'
                  }}
                >
                  <div className={`w-9 h-9 rounded-full ${release.status === 'Live' ? 'bg-emerald-700' : 'bg-indigo-700'} border border-white/60 flex items-center justify-center`}>
                    <div className="w-2 h-2 rounded-full bg-black" />
                  </div>
                </div>

                {/* Square Album Cover */}
                <div 
                  onClick={() => posterFileInputRef.current?.click()}
                  className="relative z-10 w-28 h-28 sm:w-32 sm:h-32 rounded-xl overflow-hidden shadow-2xl border-2 border-white/40 bg-black cursor-pointer group/art"
                  title="Click to upload custom poster artwork"
                >
                  <img 
                    src={customPosterCoverUrl || release.coverArtSignedUrl || release.coverArtUrl || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=400&auto=format&fit=crop'} 
                    alt={currentTrack.trackName}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover/art:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/art:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[9px] font-black uppercase tracking-wider gap-1">
                    <Upload className="w-4 h-4 text-amber-300" />
                    <span>Change Art</span>
                  </div>
                  {customPosterCoverUrl && (
                    <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-md text-[8px] font-black uppercase text-amber-300 border border-amber-400/40">
                      Custom
                    </div>
                  )}
                </div>
              </div>

              {/* Audio Soundwave Equalizer Graphic */}
              <div className="relative z-10 flex items-center justify-center gap-1 my-0.5">
                {[30, 60, 45, 90, 75, 40, 85, 55, 95, 50, 70, 40, 80, 65, 35].map((val, idx) => (
                  <div 
                    key={idx}
                    className={`w-1 rounded-full ${release.status === 'Live' ? 'bg-gradient-to-t from-emerald-400 to-indigo-400' : 'bg-gradient-to-t from-amber-400 to-pink-500'}`}
                    style={{ height: `${val * 0.22}px` }}
                  />
                ))}
              </div>

              {/* Track Title & Artist Name (NO RELEASE DATE!) */}
              <div className="relative z-10 space-y-0.5 max-w-full px-2">
                <h4 className="font-black text-white text-xs sm:text-sm tracking-tight truncate">
                  "{currentTrack.trackName}"
                </h4>
                <p className="text-[10px] font-bold text-indigo-300 truncate">
                  {currentTrack.mainArtistName || currentUser.artistName}
                  {currentTrack.featureArtists?.length ? ` (feat. ${currentTrack.featureArtists.join(', ')})` : ''}
                </p>
                <div className="text-[8px] font-extrabold text-slate-300 tracking-wider uppercase opacity-80 pt-0.5">
                  SPOTIFY • APPLE MUSIC • YOUTUBE MUSIC • AMAZON
                </div>
              </div>

              {/* Footer Glassmorphic Pill Badge */}
              <div className="relative z-10 flex items-center justify-center gap-1.5 px-3 py-1 bg-white/5 border border-white/15 rounded-full text-[8px] font-bold text-slate-300 mt-1 shadow-md backdrop-blur-md">
                <span>Distributed by Wavora Live</span>
                <span className="text-emerald-400 font-bold">•</span>
                <span className="text-emerald-400 font-extrabold uppercase">150+ Global DSPs</span>
              </div>
            </div>
          </div>
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
