import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Disc, 
  Volume2, 
  VolumeX, 
  RotateCw, 
  X, 
  CheckCircle2, 
  Share2, 
  Copy, 
  Flame, 
  Zap, 
  AudioWaveform as WaveformIcon,
  Headphones
} from 'lucide-react';
import { MusicFact, getRandomMusicFact } from '../data/musicFacts';

interface CrazyMusicFactModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSubmissionSuccess?: boolean;
  releaseTitle?: string;
  artistName?: string;
  coverArtUrl?: string;
  tracksCount?: number;
  trackName?: string;
  fileName?: string;
  trackNumber?: number;
}

export default function CrazyMusicFactModal({
  isOpen,
  onClose,
  isSubmissionSuccess = false,
  releaseTitle,
  artistName,
  coverArtUrl,
  tracksCount,
  trackName = 'Vault Audio Master',
  fileName,
  trackNumber
}: CrazyMusicFactModalProps) {
  const [currentFact, setCurrentFact] = useState<MusicFact>(() => getRandomMusicFact());
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [copied, setCopied] = useState(false);
  const [factIndex, setFactIndex] = useState(1);
  const [isSpinning, setIsSpinning] = useState(true);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Play a harmonious celebratory synthesizer chime upon appearance
  const playSynthesizerChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      
      const ctx = audioCtxRef.current || new AudioContextClass();
      audioCtxRef.current = ctx;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      // C Major 9 chord frequencies: C4, E4, G4, B4, D5
      const notes = [261.63, 329.63, 392.00, 493.88, 587.33];
      
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = i % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.07);
        
        gain.gain.setValueAtTime(0, now + i * 0.07);
        gain.gain.linearRampToValueAtTime(0.08, now + i * 0.07 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.07 + 1.2);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(now + i * 0.07);
        osc.stop(now + i * 0.07 + 1.3);
      });
    } catch (e) {
      // AudioContext might be blocked until user gesture, safely ignore
    }
  };

  // Roll new fact
  const handleRollFact = () => {
    const nextFact = getRandomMusicFact(currentFact.id);
    setCurrentFact(nextFact);
    setFactIndex(prev => prev + 1);
    playSynthesizerChime();
  };

  useEffect(() => {
    if (isOpen) {
      setCurrentFact(getRandomMusicFact());
      setFactIndex(1);
      playSynthesizerChime();
    }
    // Cleanup audio context on unmount
    return () => {
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        try {
          audioCtxRef.current.close();
        } catch (e) {}
      }
    };
  }, [isOpen]);

  // Copy fact to clipboard
  const handleCopyFact = () => {
    const textToCopy = `🎵 Crazy Music Fact #${factIndex}: "${currentFact.title}"\n${currentFact.fact}\n\nVia Wavora Live Distribution`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-xl"
        id="crazy_music_fact_backdrop"
      >
        {/* Animated ambient background lights */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-violet-600/30 rounded-full blur-[140px] animate-pulse" />
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-fuchsia-600/30 rounded-full blur-[140px] animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/15 rounded-full blur-[160px]" />
          
          {/* Floating musical note glyphs */}
          {['♪', '♫', '♬', '✦', '⚡', '🎹', '✨'].map((glyph, idx) => (
            <motion.div
              key={idx}
              initial={{ 
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 800), 
                y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 50,
                opacity: 0 
              }}
              animate={{ 
                y: -100, 
                opacity: [0, 0.4, 0.8, 0],
                rotate: [0, 360 * (idx % 2 === 0 ? 1 : -1)]
              }}
              transition={{ 
                duration: 6 + (idx * 1.5), 
                repeat: Infinity, 
                delay: idx * 0.8,
                ease: "linear"
              }}
              className="absolute text-violet-400/40 text-2xl font-bold select-none"
            >
              {glyph}
            </motion.div>
          ))}
        </div>

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className="relative w-full max-w-2xl bg-gradient-to-b from-[#13182e] via-[#0d1222] to-[#080b16] border-2 border-indigo-500/40 rounded-3xl shadow-[0_0_80px_rgba(99,102,241,0.35)] overflow-hidden z-10"
          id="crazy_music_fact_card"
        >
          {/* Top Status Bar & Upload Pill - Full Sized Sticky Header */}
          <div className="sticky top-0 z-30 flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-white/10 bg-[#0d1222]/95 backdrop-blur-md">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <span className="flex h-3.5 w-3.5 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 shadow-[0_0_10px_#10B981]"></span>
              </span>
              <div className="min-w-0">
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{isSubmissionSuccess ? 'Release Successfully Ingested' : 'Wavora Music Lore & Ingestion'}</span>
                </span>
                <p className="text-xs sm:text-sm font-bold text-white truncate max-w-[180px] sm:max-w-xs md:max-w-md">
                  {releaseTitle || (trackNumber ? `Track #${trackNumber}: ` : '') + (trackName || fileName || 'Vault Audio Master')}
                </p>
              </div>
            </div>

            {/* Top Action Controls with High-Visibility Cut/Close Button */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-center ${
                  soundEnabled 
                    ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300 hover:text-white hover:bg-indigo-600/30' 
                    : 'bg-white/5 border-white/10 text-gray-500 hover:text-gray-300'
                }`}
                title={soundEnabled ? "Mute synth FX" : "Unmute synth FX"}
                id="btn_fact_sound_toggle"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              {/* Ultra High Visibility Cut / Close Button for ALL Devices */}
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer group flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 border-2 border-red-500/40 hover:border-red-500 text-red-400 hover:text-red-200 transition duration-150 shadow-lg shadow-red-500/10 active:scale-95"
                title="Close and Return to Dashboard"
                id="btn_fact_close"
                aria-label="Close modal"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                <span className="text-xs font-black uppercase tracking-wider hidden xs:inline sm:inline">Cut / Close</span>
              </button>
            </div>
          </div>

          {/* Equalizer Visualizer Ribbon */}
          <div className="flex items-center justify-center gap-1.5 py-2.5 bg-black/40 border-b border-white/5 px-6 overflow-hidden">
            {[40, 75, 25, 90, 50, 85, 30, 95, 60, 45, 80, 35, 90, 65, 30, 85, 50, 95, 40, 70, 30, 90, 55].map((h, i) => (
              <motion.div
                key={i}
                animate={{ 
                  height: [
                    `${Math.max(15, h * 0.3)}%`, 
                    `${Math.min(100, h * 1.2)}%`, 
                    `${Math.max(20, h * 0.5)}%`
                  ] 
                }}
                transition={{ 
                  duration: 0.6 + (i % 5) * 0.15, 
                  repeat: Infinity, 
                  repeatType: "reverse", 
                  ease: "easeInOut",
                  delay: (i * 0.04)
                }}
                className="w-1 rounded-full bg-gradient-to-t from-[#6366F1] via-[#A855F7] to-[#EC4899] h-5"
              />
            ))}
            <div className="ml-3 text-[10px] font-mono font-bold text-indigo-300/80 uppercase tracking-widest hidden sm:flex items-center gap-1">
              <Headphones className="w-3 h-3 text-pink-400" /> 44.1kHz • 24-Bit Studio Vault Master
            </div>
          </div>

          {/* Main Fact Showcase Body */}
          <div className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
            
            {/* Release Submission Celebration Banner (shown when a full release is submitted) */}
            {isSubmissionSuccess && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-indigo-950/60 to-purple-950/60 border-2 border-emerald-500/50 shadow-lg relative overflow-hidden"
              >
                <div className="flex items-start sm:items-center gap-4">
                  {coverArtUrl ? (
                    <img 
                      src={coverArtUrl} 
                      alt={releaseTitle || "Release Cover"} 
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border-2 border-emerald-400/50 shadow-md shrink-0" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center shrink-0">
                      <Disc className="w-8 h-8 text-emerald-400 animate-spin" style={{ animationDuration: '8s' }} />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 border border-emerald-500/50 text-emerald-300">
                        ✓ Ingestion Initiated
                      </span>
                      {tracksCount && (
                        <span className="text-[10px] font-mono text-gray-400">
                          {tracksCount} {tracksCount === 1 ? 'Track' : 'Tracks'}
                        </span>
                      )}
                    </div>
                    <h2 className="text-base sm:text-xl font-black text-white leading-tight">
                      🎉 Your Release Has Been Submitted!
                    </h2>
                    <p className="text-xs text-slate-300 truncate mt-0.5">
                      <strong className="text-white">{releaseTitle || 'New Release'}</strong>
                      {artistName ? ` • by ${artistName}` : ''}
                    </p>
                    <p className="text-[11px] text-emerald-400/90 font-medium mt-1">
                      Your master files are queued for QA & DSP distribution.
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2 text-[11px] text-indigo-300 font-mono">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                  <span>While our systems process your master audio, here is a crazy music fact:</span>
                </div>
              </motion.div>
            )}

            {/* Header / Category / Mind-Blow Meter */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 border border-violet-500/40 text-violet-300 flex items-center gap-1.5 shadow-inner">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin" />
                  {currentFact.category}
                </span>
                <span className="text-xs font-mono text-gray-400">
                  Fact #{factIndex}
                </span>
              </div>

              {/* Mind-Blow Meter */}
              <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1 rounded-full border border-white/10">
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 flex items-center gap-1">
                  <Zap className="w-3 h-3 fill-current" /> Mind-Blow Index:
                </span>
                <div className="flex items-center gap-0.5 text-amber-400 text-xs">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={i < currentFact.mindBlowLevel ? 'opacity-100' : 'opacity-20'}>
                      ⚡
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Fact Card Content with Spring Transition */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentFact.id}
                initial={{ opacity: 0, y: 15, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -15, scale: 0.96 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                {/* Hero Emoji & Tagline */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {/* Spinning Vinyl Background */}
                    <motion.div 
                      animate={isSpinning ? { rotate: 360 } : { rotate: 0 }}
                      transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-neutral-900 via-neutral-800 to-black border-2 border-indigo-500/50 flex items-center justify-center shadow-xl relative overflow-hidden"
                    >
                      {/* Vinyl Groove Rings */}
                      <div className="absolute inset-2 rounded-full border border-white/10" />
                      <div className="absolute inset-4 rounded-full border border-white/5" />
                      <div className="absolute inset-6 rounded-full border border-white/10" />
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-black" />
                      </div>
                    </motion.div>
                    <span className="absolute -bottom-1 -right-1 text-2xl filter drop-shadow">
                      {currentFact.emoji}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-indigo-400 block mb-1">
                      {currentFact.tagline}
                    </span>
                    <h3 className="text-lg sm:text-2xl font-black text-white leading-tight tracking-tight">
                      {currentFact.title}
                    </h3>
                  </div>
                </div>

                {/* Fact Story Paragraph */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.04] border border-white/10 relative overflow-hidden backdrop-blur-sm">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                  <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
                    {currentFact.fact}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Modal Bottom Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleRollFact}
                  className="flex-1 sm:flex-initial px-4 py-2.5 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#5558E6] hover:to-[#7C4EE8] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]"
                  id="btn_roll_another_fact"
                >
                  <RotateCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '3s' }} />
                  <span>🎲 Roll Another Fact</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyFact}
                  className="px-3.5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
                  id="btn_copy_fact"
                  title="Copy fact to clipboard"
                >
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 hover:text-emerald-200 font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                id="btn_fact_dismiss"
              >
                <span>{isSubmissionSuccess ? 'View in Catalogue 🚀' : 'Continue 🚀'}</span>
              </button>
            </div>

          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
