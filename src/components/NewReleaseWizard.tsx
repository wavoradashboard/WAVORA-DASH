import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  ChevronRight, 
  ChevronLeft, 
  Music, 
  Image as ImageIcon, 
  Sparkles, 
  FileCheck, 
  AlertCircle,
  AudioLines,
  HelpCircle,
  Compass,
  X,
  Users
} from 'lucide-react';
import { User, Release, ReleaseTrack, ArtistProfile, Label } from '../types';
import { supabase } from '../supabase';

export const GENRE_DATA: Record<string, string[]> = {
  "Alternative": ["Indie Rock", "Grunge", "Gothic Rock", "College Rock", "Britpop", "Dream Pop", "Shoegaze", "Post-Punk", "Noise Rock"],
  "Anime": ["J-Pop", "OST", "Vocaloid", "J-Rock", "Ani-Song"],
  "Blues": ["Delta Blues", "Chicago Blues", "Electric Blues", "Blues Rock", "Acoustic Blues", "Soul Blues"],
  "Brazilian": ["Bossa Nova", "Samba", "MPB", "Forró", "Pagode", "Sertanejo", "Funk Carioca"],
  "Children's Music": ["Nursery Rhymes", "Lullabies", "Educational", "Sing-Along", "Storytelling"],
  "Christian & Gospel": ["Contemporary Christian", "Gospel", "Worship", "Christian Rock", "Christian Hip-Hop"],
  "Classical": ["Baroque", "Romantic", "Classical Period", "Modern Classical", "Orchestral", "Opera", "Chamber Music", "Choral"],
  "Comedy": ["Stand-up", "Parody", "Satire", "Musical Comedy", "Novelty"],
  "Country": ["Traditional Country", "Outlaw Country", "Bluegrass", "Country Pop", "Honky Tonk", "Americana"],
  "Dance": ["House", "Techno", "Trance", "Dubstep", "Drum & Bass", "Hardstyle", "Eurodance", "Bassline", "Garage"],
  "Electronic": ["Ambient", "Downtempo", "IDM", "Synthwave", "Electro", "Chiptune", "Industrial", "Trip-Hop", "Folktronica"],
  "Folk": ["Traditional Folk", "Contemporary Folk", "Indie Folk", "Folk Rock", "Celtic", "Americana"],
  "Hip-Hop / Rap": ["Boom Bap", "Trap", "Lofi Hip Hop", "West Coast", "East Coast", "Conscious Rap", "Drill", "Grime", "Cloud Rap"],
  "Holiday": ["Christmas", "Halloween", "Thanksgiving", "New Year", "Hanukkah"],
  "Indian": ["Bollywood", "Hindustani Classical", "Carnatic Classical", "Ghazal", "Punjabi Pop", "Indie Pop", "Devotional", "Folk Indian"],
  "Instrumental": ["Solo Piano", "Ambient Instrumental", "Acoustic Guitar", "Orchestral Instrumental", "Cinematic", "Post-Rock"],
  "Jazz": ["Swing", "Bebop", "Cool Jazz", "Fusion", "Vocal Jazz", "Smooth Jazz", "Hard Bop", "Acid Jazz"],
  "Latin": ["Reggaeton", "Salsa", "Bachata", "Merengue", "Latin Pop", "Cumbia", "Latin Rock", "Mariachi"],
  "Metal": ["Heavy Metal", "Thrash Metal", "Death Metal", "Black Metal", "Power Metal", "Progressive Metal", "Doom Metal", "Nu Metal", "Metalcore"],
  "New Age": ["Meditation", "Healing", "Nature Sounds", "Spiritual", "Relaxation", "Astral Music"],
  "Pop": ["Synthpop", "Dance-Pop", "Indie Pop", "Teen Pop", "K-Pop", "J-Pop", "Art Pop", "Acoustic Pop"],
  "Punk": ["Pop Punk", "Hardcore Punk", "Post-Punk", "Ska Punk", "Skate Punk", "Anarcho Punk"],
  "R&B / Soul": ["Contemporary R&B", "Neo-Soul", "Motown", "Funk", "Quiet Storm", "Southern Soul", "Disco"],
  "Reggae": ["Roots Reggae", "Dancehall", "Dub", "Ska", "Rocksteady", "Lovers Rock"],
  "Rock": ["Classic Rock", "Hard Rock", "Progressive Rock", "Psychedelic Rock", "Garage Rock", "Glam Rock", "Arena Rock"],
  "Singer/Songwriter": ["Acoustic", "Folk-Pop", "Indie Songwriter", "Chamber Pop", "Bedroom Pop"],
  "Soundtrack": ["Film Score", "Video Game Music", "Television Theme", "Musical Theatre", "Anime OST"],
  "Spoken Word": ["Poetry", "Audiobooks", "Motivating Speech", "ASMR", "Podcast", "Comedy Monologue"],
  "World": ["Afrobeat", "Flamenco", "Celtic Folk", "K-Pop (World)", "Rai", "Reggae (World)", "Middle Eastern", "Carnatic"]
};

export const LANGUAGES_LIST = [
  "English",
  "Spanish",
  "Portuguese",
  "Hindi",
  "Punjabi",
  "Korean",
  "Japanese",
  "French",
  "German",
  "Italian",
  "Mandarin",
  "Cantonese",
  "Turkish",
  "Russian",
  "Arabic",
  "Dutch",
  "Swedish",
  "Polish",
  "Vietnamese",
  "Thai",
  "Indonesian",
  "Swahili",
  "Greek",
  "Tagalog",
  "Tamil",
  "Telugu",
  "Bengali",
  "Marathi",
  "Latin",
  "Instrumental (No Lyrics)"
];

interface NewReleaseWizardProps {
  currentUser: User;
  managedArtists: ArtistProfile[];
  managedLabels: Label[];
  onSubmitRelease: (release: Release) => void;
  setCurrentTab: (tab: string) => void;
}

export default function NewReleaseWizard({
  currentUser,
  managedArtists,
  managedLabels,
  onSubmitRelease,
  setCurrentTab,
}: NewReleaseWizardProps) {
  const filteredArtists = managedArtists.filter(art => art.email === currentUser.email);
  const filteredLabels = managedLabels.filter(lbl => lbl.email === 'admin@g.g' || lbl.email === currentUser.email);

  if (filteredArtists.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-12 text-center bg-[#0f1424] rounded-2xl border border-slate-900 shadow-2xl space-y-6 max-w-2xl mx-auto my-12"
      >
        <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto border border-amber-500/20">
          <Users className="w-10 h-10 text-amber-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Artist Profile Required</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            To maintain metadata compliance across digital platforms, you must configure your artist profile details (links, bio, etc.) before initiating a new release.
          </p>
        </div>
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button 
            onClick={() => setCurrentTab('manage-artists')}
            className="w-full sm:w-auto px-8 py-3 bg-[#1DB954] hover:bg-[#1ed760] text-black font-black rounded-lg transition active:scale-95 flex items-center justify-center gap-2 uppercase tracking-tight text-xs cursor-pointer"
          >
            <Sparkles className="w-4 h-4" /> Add My Artist Profile
          </button>
          <button 
            onClick={() => setCurrentTab('home')}
            className="w-full sm:w-auto px-8 py-3 bg-transparent hover:bg-white/5 text-gray-400 font-bold rounded-lg transition border border-slate-800 uppercase tracking-tight text-xs cursor-pointer"
          >
            Return to Dashboard
          </button>
        </div>
      </motion.div>
    );
  }

  const isBasic = currentUser.plan === 'Basic';
  const isPro = currentUser.plan === 'Pro';
  const isElite = currentUser.plan === 'Elite';

  // Wizard state
  const [step, setStep] = useState(1);
  const [coverArtUploadProgress, setCoverArtUploadProgress] = useState<number>(0);
  const [trackUploadProgress, setTrackUploadProgress] = useState<Record<number, number>>({});
  const [error, setError] = useState('');

  // Step 1 parameters
  const [albumName, setAlbumName] = useState('');
  const [releaseType, setReleaseType] = useState<'Single' | 'EP' | 'Album'>('Single');
  const [featureArtists, setFeatureArtists] = useState<string[]>([]);
  const [otherArtists, setOtherArtists] = useState<string[]>([]);
  const [newCustomFeatureArtist, setNewCustomFeatureArtist] = useState('');
  const [primaryArtists, setPrimaryArtists] = useState<string[]>([currentUser.artistName]);
  const [selectedPrimaryToAdd, setSelectedPrimaryToAdd] = useState('');
  const [language, setLanguage] = useState('English');
  const [contentType, setContentType] = useState<'Original' | 'Licensed' | 'AI'>('Original');
  const [numTracks, setNumTracks] = useState(1);
  const [genre, setGenre] = useState('Electronic');
  const [subGenre, setSubGenre] = useState('Ambient');
  const [selectedLabel, setSelectedLabel] = useState('');
  const [cLine, setCLine] = useState(`© ${new Date().getFullYear()} Wavora Live`);
  const [pLine, setPLine] = useState(`℗ ${new Date().getFullYear()} Wavora Live`);
  const [releaseDate, setReleaseDate] = useState('');

  // Update C & P defaults based on allowed dashboard overrides
  useEffect(() => {
    if (currentUser.allowedCLines && currentUser.allowedCLines.length > 0) {
      setCLine(currentUser.allowedCLines[0]);
    } else {
      setCLine(`© ${new Date().getFullYear()} Wavora Live`);
    }

    if (currentUser.allowedPLines && currentUser.allowedPLines.length > 0) {
      setPLine(currentUser.allowedPLines[0]);
    } else {
      setPLine(`℗ ${new Date().getFullYear()} Wavora Live`);
    }
  }, [currentUser.allowedCLines, currentUser.allowedPLines]);

  // Artwork file info
  const [coverArtFile, setCoverArtFile] = useState<File | null>(null);
  const [coverArtUrl, setCoverArtUrl] = useState('');
  const [artworkWarning, setArtworkWarning] = useState('');

  // Track detail state (holds dynamic array depending on numTracks)
  const [trackList, setTrackList] = useState<ReleaseTrack[]>([]);

  // Step 3 parameter
  const [specialRequest, setSpecialRequest] = useState('');

  // Sync trackList length with numTracks and primaryArtists
  useEffect(() => {
    setTrackList((prev) => {
      let updated = [...prev];
      if (updated.length < numTracks) {
        // Append new empty templates
        for (let i = updated.length; i < numTracks; i++) {
          updated.push({
            id: `trk-temp-${Date.now()}-${i}`,
            trackName: '',
            mainArtistName: primaryArtists.length > 0 ? primaryArtists.join(', ') : 'Unknown Artist',
            featureArtists: [],
            otherArtists: [],
            genre: 'Electronic',
            subGenre: 'Ambient',
            language: 'English',
            producer: '',
            lyricist: '',
            composer: '',
            isrc: '',
            explicitContent: false,
            lyrics: '',
            googleDriveLink: '',
          });
        }
      } else if (updated.length > numTracks) {
        // Trim back
        updated = updated.slice(0, numTracks);
      }
      
      // Update empty main artists (or initialized but user clears it) with standard primary
      return updated.map(t => ({
        ...t,
        mainArtistName: t.mainArtistName ? t.mainArtistName : primaryArtists.join(', ')
      }));
    });
  }, [numTracks, primaryArtists]);

  // Cover Art Preview for UI
  const [coverArtPreview, setCoverArtPreview] = useState('');

  // Cover image validator mock/simulation
  const handleCoverArtChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setArtworkWarning('');
    setCoverArtFile(file);

    // Standard format constraint validation
    const fileType = file.type;
    const isJPEG = fileType === 'image/jpeg' || fileType === 'image/jpg';

    if (!isJPEG) {
      setArtworkWarning('Warning: Cover Art must be in JPEG/JPG format. Please convert your artwork for official DSP ingestion.');
    }

    setCoverArtUploadProgress(1);
    
    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setCoverArtUploadProgress(prev => {
        if (prev >= 95) return 95;
        return prev + Math.floor(Math.random() * 10) + 5;
      });
    }, 200);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('Not authenticated');

      const ext = file.name.split('.').pop() || 'jpg';
      const safeArtist = (primaryArtists.length > 0 ? primaryArtists.join('_') : 'Unknown_Artist').replace(/[^a-zA-Z0-9_-]/g, '_');
      const safeRelease = (albumName || 'Unknown_Release').replace(/[^a-zA-Z0-9_-]/g, '_');
      const storagePath = `${session.user.id}/${safeArtist}/${safeRelease}/cover/cover_${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('app-files')
        .upload(storagePath, file);

      if (uploadError) throw uploadError;

      // Save the storage path for database submission
      setCoverArtUrl(storagePath);
      
      // Get signed URL for preview immediately
      const { data: urlData } = await supabase.storage
        .from('app-files')
        .createSignedUrl(storagePath, 3600);

      if (urlData?.signedUrl) {
        setCoverArtPreview(urlData.signedUrl);
      }
      setCoverArtUploadProgress(100);
      setTimeout(() => setCoverArtUploadProgress(0), 1000);
    } catch(err: any) {
      setArtworkWarning('Failed to upload via Supabase: ' + err.message);
      setCoverArtUploadProgress(0);
    } finally {
      clearInterval(progressInterval);
    }
  };

  const selectPrebuiltCover = (url: string) => {
    setCoverArtUrl(url); // Stored as the raw URL in database since it's an external url
    setCoverArtPreview(url);
    setArtworkWarning('');
  };

  const handleTrackFieldChange = (index: number, field: keyof ReleaseTrack, value: any) => {
    setTrackList((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAudioUploadMock = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isWav = file.name.toLowerCase().endsWith('.wav');
    if (!isWav) {
      alert('Strict Check: Audio is required in high-definition (24-bit/16-bit) .WAV master format only.');
      return;
    }

    setTrackUploadProgress(prev => ({ ...prev, [index]: 1 }));

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setTrackUploadProgress(prev => {
        const current = prev[index] || 1;
        if (current >= 95) return { ...prev, [index]: 95 };
        return { ...prev, [index]: current + Math.floor(Math.random() * 8) + 4 };
      });
    }, 250);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('Not authenticated');

      const safeArtist = (primaryArtists.length > 0 ? primaryArtists.join('_') : 'Unknown_Artist').replace(/[^a-zA-Z0-9_-]/g, '_');
      const safeRelease = (albumName || 'Unknown_Release').replace(/[^a-zA-Z0-9_-]/g, '_');
      const safeTrack = (trackList[index].title || `Track_${index + 1}`).replace(/[^a-zA-Z0-9_-]/g, '_');
      const storagePath = `${session.user.id}/${safeArtist}/${safeRelease}/Track/${safeTrack}_${Date.now()}.wav`;

      const { error: uploadError } = await supabase.storage
        .from('app-files')
        .upload(storagePath, file);

      if (uploadError) throw uploadError;

      handleTrackFieldChange(index, 'audioFileName', storagePath);
      setTrackUploadProgress(prev => ({ ...prev, [index]: 100 }));
      setTimeout(() => {
        setTrackUploadProgress(prev => ({ ...prev, [index]: 0 }));
      }, 1000);
    } catch(err: any) {
      alert('Upload failed: ' + err.message);
      setTrackUploadProgress(prev => ({ ...prev, [index]: 0 }));
    } finally {
      clearInterval(progressInterval);
    }
  };

  const handleRemovePrimaryArtist = (artistToRemove: string) => {
    if (artistToRemove === currentUser.artistName) return; // Main artist is protected
    setPrimaryArtists(prev => prev.filter(name => name !== artistToRemove));
  };

  const handleAddPrimaryArtistClick = () => {
    if (selectedPrimaryToAdd && !primaryArtists.includes(selectedPrimaryToAdd)) {
      setPrimaryArtists(prev => [...prev, selectedPrimaryToAdd]);
      // Remove from featured if already selected
      setOtherArtists(prev => prev.filter(name => name !== selectedPrimaryToAdd));
      setSelectedPrimaryToAdd('');
    }
  };

  // Multiple selectors trigger
  const handleFeatureArtistToggle = (artistName: string) => {
    setFeatureArtists(prev => {
      if (prev.includes(artistName)) {
        return prev.filter(name => name !== artistName);
      } else {
        return [...prev, artistName];
      }
    });
  };

  const handleAddCustomFeatureArtist = () => {
    const trimmed = newCustomFeatureArtist.trim();
    if (trimmed && !featureArtists.includes(trimmed) && !primaryArtists.includes(trimmed)) {
      setFeatureArtists(prev => [...prev, trimmed]);
      setNewCustomFeatureArtist('');
    }
  };

  const handleRemoveFeatureArtist = (nameToRemove: string) => {
    setFeatureArtists(prev => prev.filter(name => name !== nameToRemove));
  };

  const validateStep1 = () => {
    if (!albumName.trim()) return 'Album/Single Name is required';
    if (!releaseDate) return 'Official Release Date is required';
    if (!coverArtUrl) return 'You must upload or select a Cover Art image';
    // Allow empty string to default to 'Wavora Live' as the publishing label
    return '';
  };

  const validateStep2 = () => {
    for (let i = 0; i < trackList.length; i++) {
      const t = trackList[i];
      if (!t.trackName.trim()) return `Track #${i + 1} Name cannot be empty`;
      if (!t.audioFileName && !t.googleDriveLink) return `Upload .WAV audio file or provide a Google Drive link for Track #${i + 1}`;
      if (!t.producer.trim()) return `Producer is required for Track #${i + 1}`;
      if (!t.composer.trim()) return `Composer/Songwriter is required for Track #${i + 1}`;
      if (!t.lyricist.trim()) return `Lyricist metadata is required for Track #${i + 1}`;
    }
    return '';
  };

  const handleNext = () => {
    setError('');
    if (step === 1) {
      const err = validateStep1();
      if (err) {
        setError(err);
        return;
      }
      setStep(2);
    } else if (step === 2) {
      const err = validateStep2();
      if (err) {
        setError(err);
        return;
      }
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    }
  };

  const handleBack = () => {
    setError('');
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleFinalSubmit = () => {
    const isAdmin = currentUser.email === 'admin@g.g';
    const newRelease: Release = {
      id: `rel-${Date.now()}`,
      email: currentUser.email,
      albumName,
      type: releaseType,
      mainArtistName: primaryArtists.join(', '),
      featureArtists,
      otherArtists,
      language,
      contentType,
      numTracks,
      genre,
      subGenre,
      labelName: selectedLabel || 'Wavora Live',
      cLine: cLine || `© ${new Date().getFullYear()} Wavora Live`,
      pLine: pLine || `℗ ${new Date().getFullYear()} Wavora Live`,
      releaseDate,
      coverArtUrl: coverArtUrl || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=600&auto=format&fit=crop',
      tracks: trackList,
      specialRequest,
      status: 'Submitted',
      submittedAt: new Date().toISOString(),
    };

    onSubmitRelease(newRelease);
    setCurrentTab('catalogue');
  };

  return (
    <div className="p-6 bg-[#0f1424] rounded-2xl border border-slate-900 shadow-xl space-y-6" id="wizard_root">
      {/* Step Indicator Header */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-800" id="wizard_header">
        <div>
          <h2 className="text-lg font-bold text-white uppercase tracking-wider">Configure New Digital Release</h2>
          <span className="text-xs text-slate-400">Step {step} of 4 • {
            step === 1 ? 'Release Metadata & Cover Artwork' :
            step === 2 ? 'Track Uploads & Songwriter Metadata' :
            step === 3 ? 'Additional Ingestion Notes' :
            'Verification & Validation Submit'
          }</span>
        </div>

        {/* Level indicator */}
        <div className="text-right">
          <span className="text-[10px] block text-gray-500 font-semibold uppercase tracking-wider">Level Privileges</span>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold text-blue-400 bg-blue-900/10 border border-blue-500/30">
            {currentUser.plan} Plan
          </span>
        </div>
      </div>

      {/* Grid containing Wizard Progress Bar */}
      <div className="relative flex items-center justify-between" id="wizard_tracker_mesh">
        <div className="absolute left-0 right-0 h-0.5 bg-slate-800 pointer-events-none z-0" />
        {[1, 2, 3, 4].map((num) => (
          <div 
            key={num} 
            className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border transition ${
              step >= num 
                ? 'bg-blue-600 text-white border-blue-500' 
                : 'bg-[#151c2e] text-gray-400 border-slate-800'
            }`}
          >
            {num}
          </div>
        ))}
      </div>

      {error && (
        <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-lg text-xs text-red-400 flex items-start gap-2" id="w_error">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Step Components */}
      <div className="min-h-[300px]" id="wizard_step_stage">
        {step === 1 && (
          <div className="space-y-5" id="wizard_step1_inputs">
            {/* Title & Core Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest">Single / Album Title</label>
                <input
                  type="text"
                  className="w-full bg-[#151c2e] border border-slate-800 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-blue-500"
                  placeholder="e.g. Midnight Horizon"
                  value={albumName}
                  onChange={(e) => setAlbumName(e.target.value)}
                  id="w_albumName"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest">Release Concept Format</label>
                <select
                  className="w-full bg-[#151c2e] border border-slate-800 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-blue-500"
                  value={releaseType}
                  onChange={(e) => {
                    const val = e.target.value as 'Single' | 'EP' | 'Album';
                    setReleaseType(val);
                    if (val === 'Single') setNumTracks(1);
                  }}
                  id="w_releaseType"
                >
                  <option value="Single">Single (1 Track)</option>
                  <option value="EP">EP (2-6 Tracks)</option>
                  <option value="Album">Album (7-30 Tracks)</option>
                </select>
              </div>

              <div className="space-y-2" id="primary_artists_section">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest">Primary Artist(s)</label>
                
                {/* Current Primary Artists Chips */}
                <div className="flex flex-wrap gap-1.5 p-2 bg-[#0a0f1d] border border-slate-800 rounded-lg min-h-10 items-center" id="primary_artists_chips_wrapper">
                  {primaryArtists.map((artist, i) => {
                    const isDefaultMain = artist === currentUser.artistName;
                    return (
                      <span 
                        key={i} 
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#1a2333] border border-slate-700/60 rounded-md text-xs font-semibold text-white transition-all hover:bg-[#202b3e]"
                        id={`primary_artist_chip_${i}`}
                      >
                        <span className="truncate max-w-[120px]">{artist}</span>
                        {isDefaultMain ? (
                          <span className="text-[8px] bg-blue-500/10 text-blue-400 px-1 py-0.5 rounded border border-blue-500/25 font-sans font-bold uppercase tracking-wide">Main</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleRemovePrimaryArtist(artist)}
                            className="cursor-pointer p-0.5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded transition"
                            title="Remove Artist"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </span>
                    );
                  })}
                </div>

                {/* Restricted selection list for Extra Primaries */}
                <div className="flex gap-2">
                  <select
                    className="flex-1 bg-[#111726] border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500"
                    value={selectedPrimaryToAdd}
                    onChange={(e) => setSelectedPrimaryToAdd(e.target.value)}
                    id="select_add_primary_artist"
                  >
                    <option value="">-- Choose Managed Artist to Add as Primary --</option>
                    {filteredArtists
                      .filter(m => !primaryArtists.includes(m.name))
                      .map((artist) => (
                        <option key={artist.id} value={artist.name}>
                          {artist.name}
                        </option>
                      ))
                    }
                  </select>
                  <button
                    type="button"
                    onClick={handleAddPrimaryArtistClick}
                    className="cursor-pointer px-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-gray-500 text-white rounded-lg flex items-center justify-center transition active:scale-95 text-xs font-bold gap-1"
                    title="Add Primary Artist"
                    id="btn_add_primary_artist"
                    disabled={!selectedPrimaryToAdd}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-[9px] text-gray-500 block">Adding multiple primary artists enables split-billing profiles. Only pre-configured artists added in <span className="text-blue-400 font-bold">Manage Artists</span> may be designated.</span>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest">Number of Tracks</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  disabled={releaseType === 'Single'}
                  className="w-full bg-[#151c2e] border border-slate-800 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  value={numTracks}
                  onChange={(e) => setNumTracks(Math.max(1, Math.min(30, parseInt(e.target.value) || 1)))}
                  id="w_numTracks"
                />
              </div>
            </div>

            {/* Featured Artists / Collaborators section */}
            <div className="space-y-3" id="featured_artists_section">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest">Featured Artist(s) / Collaborators</label>
              
              {/* Show selected featured artists as chips */}
              {featureArtists.length > 0 && (
                <div className="flex flex-wrap gap-1.5 p-2 bg-[#0a0f1d] border border-slate-800 rounded-lg min-h-10 items-center" id="featured_artists_chips_wrapper">
                  {featureArtists.map((artist, i) => (
                    <span 
                      key={i} 
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-md text-xs font-semibold text-amber-400"
                      id={`featured_artist_chip_${i}`}
                    >
                      <span className="truncate max-w-[120px]">{artist}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeatureArtist(artist)}
                        className="cursor-pointer p-0.5 hover:bg-red-500/20 text-amber-500/75 hover:text-red-400 rounded transition"
                        title="Remove Featured Artist"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Grid with 2 columns: Left column managed artists selection list, Right column custom artists typed input */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Managed selection checkboxes */}
                <div className="space-y-1.5">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Select Managed Artist</span>
                  <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-800 max-h-24 overflow-y-auto space-y-1">
                    {filteredArtists.length === 0 ? (
                      <span className="text-gray-500 text-[10px] block py-2">No artists added in "Manage Artists" yet.</span>
                    ) : (
                      <div className="grid grid-cols-1 gap-1 text-xs text-left">
                        {filteredArtists.map((artist) => {
                          const selected = featureArtists.includes(artist.name);
                          const isAlreadyPrimary = primaryArtists.includes(artist.name);
                          return (
                            <label 
                              key={artist.id} 
                              className={`flex items-center gap-2 cursor-pointer transition ${isAlreadyPrimary ? 'opacity-40 cursor-not-allowed text-gray-500' : 'text-gray-300 hover:text-white'}`}
                            >
                              <input
                                type="checkbox"
                                checked={selected && !isAlreadyPrimary}
                                disabled={isAlreadyPrimary}
                                onChange={() => !isAlreadyPrimary && handleFeatureArtistToggle(artist.name)}
                                className="rounded border-slate-700 text-amber-500 bg-slate-900 focus:ring-0 cursor-pointer disabled:cursor-not-allowed"
                              />
                              <span className="truncate">{artist.name} {isAlreadyPrimary && <span className="text-[8px] text-gray-500 font-bold uppercase tracking-wide ml-1">(Primary)</span>}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Custom addition input with + button */}
                <div className="space-y-1.5">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Add Custom / External Guest</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 bg-[#111726]/80 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500 placeholder:text-gray-600"
                      placeholder="Type custom guest, translator, producer..."
                      value={newCustomFeatureArtist}
                      onChange={(e) => setNewCustomFeatureArtist(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomFeatureArtist();
                        }
                      }}
                      id="input_add_custom_featured_artist"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomFeatureArtist}
                      className="cursor-pointer px-3 bg-[#e0a82e] hover:bg-amber-500 disabled:bg-slate-800 disabled:text-gray-500 text-black font-extrabold rounded-lg flex items-center justify-center transition active:scale-95 text-xs gap-1"
                      title="Add Featured Artist"
                      id="btn_add_custom_featured_artist"
                      disabled={!newCustomFeatureArtist.trim()}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="text-[9px] text-gray-500 block">Allows addition of external vocalists or producers not in managed accounts.</span>
                </div>
              </div>
            </div>

            {/* Custom inputs grid */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest">Language</label>
                <select
                  className="w-full bg-[#151c2e] border border-slate-800 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-blue-500"
                  value={LANGUAGES_LIST.includes(language) ? language : "Custom"}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "Custom") {
                      setLanguage('');
                    } else {
                      setLanguage(val);
                    }
                  }}
                  id="w_language_select"
                >
                  {LANGUAGES_LIST.map((lang) => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                  <option value="Custom">Other (Type Custom...)</option>
                </select>

                {!LANGUAGES_LIST.includes(language) && (
                  <input
                    type="text"
                    className="w-full bg-[#151c2e] border border-slate-800 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none focus:border-blue-500 mt-1.5"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    placeholder="Type custom language..."
                    id="w_language"
                    required
                  />
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest">Content Origination</label>
                <select
                  className="w-full bg-[#151c2e] border border-slate-800 rounded-lg py-2 px-3 text-sm text-white"
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value as any)}
                  id="w_contentType"
                >
                  <option value="Original">Original Music</option>
                  <option value="Licensed">Licensed Cover</option>
                  <option value="AI">AI Voice Assisted</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest">Genre</label>
                <select
                  className="w-full bg-[#151c2e] border border-slate-800 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-blue-500"
                  value={genre}
                  onChange={(e) => {
                    const newGenre = e.target.value;
                    setGenre(newGenre);
                    const list = GENRE_DATA[newGenre] || [];
                    setSubGenre(list[0] || '');
                  }}
                  id="w_genre"
                >
                  {Object.keys(GENRE_DATA).map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest">Sub-Genre</label>
                <select
                  className="w-full bg-[#151c2e] border border-slate-800 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-blue-500"
                  value={subGenre}
                  onChange={(e) => setSubGenre(e.target.value)}
                  id="w_subGenre"
                >
                  {(GENRE_DATA[genre] || []).map((sg) => (
                    <option key={sg} value={sg}>{sg}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Plan Restrictions - C, P Lines and Label Choice */}
            <div className="p-4 bg-slate-950/30 rounded-xl border border-slate-850 space-y-4" id="plan_restrictions_box">
              <span className="text-[10px] font-bold text-indigo-400 block uppercase tracking-wider">Plan Authorized Delivery Tags</span>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Publishing Label Selection */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest">Publishing Label</label>
                  <select
                    className="w-full bg-[#151c2e] border border-slate-800 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-blue-500"
                    value={selectedLabel}
                    onChange={(e) => setSelectedLabel(e.target.value)}
                    id="w_labelName"
                  >
                    <option value="">Wavora Live (Default)</option>
                    {filteredLabels.map((lbl) => (
                      lbl.name !== 'Wavora Live' && <option key={lbl.id} value={lbl.name}>{lbl.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest">Ingestion Release Date</label>
                  <input
                    type="date"
                    className="w-full bg-[#151c2e] border border-slate-800 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-blue-500"
                    value={releaseDate}
                    onChange={(e) => setReleaseDate(e.target.value)}
                    id="w_releaseDate"
                  />
                </div>
              </div>

              {/* Pro and Elite C & P options (Also available to Admin) */}
              {(!isBasic || currentUser.email === 'admin@g.g') ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest">C Line (© Publisher Tag)</label>
                    {currentUser.email === 'admin@g.g' ? (
                      <input
                        type="text"
                        className="w-full bg-[#151c2e] border border-slate-800 rounded-lg py-2 px-3 text-sm text-white focus:outline-none"
                        placeholder={`e.g. © ${new Date().getFullYear()} Wavora Live`}
                        value={cLine}
                        onChange={(e) => setCLine(e.target.value)}
                        id="w_cLine"
                      />
                    ) : (
                      <select
                        className="w-full bg-[#151c2e] border border-slate-800 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-blue-500"
                        value={cLine}
                        onChange={(e) => setCLine(e.target.value)}
                        id="w_cLine"
                      >
                        <option value={`© ${new Date().getFullYear()} Wavora Live`}>© {new Date().getFullYear()} Wavora Live</option>
                        {currentUser.allowedCLines?.map((line, i) => (
                          <option key={`cline-${i}`} value={line}>{line}</option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest">P Line (℗ Phonographic Sound Tag)</label>
                    {currentUser.email === 'admin@g.g' ? (
                      <input
                        type="text"
                        className="w-full bg-[#151c2e] border border-slate-800 rounded-lg py-2 px-3 text-sm text-white focus:outline-none"
                        placeholder={`e.g. ℗ ${new Date().getFullYear()} Wavora Live`}
                        value={pLine}
                        onChange={(e) => setPLine(e.target.value)}
                        id="w_pLine"
                      />
                    ) : (
                      <select
                        className="w-full bg-[#151c2e] border border-slate-800 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-blue-500"
                        value={pLine}
                        onChange={(e) => setPLine(e.target.value)}
                        id="w_pLine"
                      >
                        <option value={`℗ ${new Date().getFullYear()} Wavora Live`}>℗ {new Date().getFullYear()} Wavora Live</option>
                        {currentUser.allowedPLines?.map((line, i) => (
                          <option key={`pline-${i}`} value={line}>{line}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-gray-500 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-slate-600" />
                  <span>C Line & P Line metadata options are restricted on the Basic tier. Standard publisher tags will be generated automatically. Upgrade to Pro/Elite to customize.</span>
                </div>
              )}
            </div>

            {/* Step 1 Cover Artwork Drag and Drop Selection */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest mb-2">High Resolution Cover Art (Constraint: Exactly 3000x3000px, JPEG format)</label>
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-8 flex flex-col justify-center border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-xl p-5 bg-slate-950/35 transition relative">
                  <input
                    type="file"
                    accept=".jpg,.jpeg"
                    onChange={handleCoverArtChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    id="artwork_upload_input"
                  />
                  <div className="text-center space-y-2 relative pointer-events-none w-full">
                    <ImageIcon className="w-8 h-8 text-blue-500 mx-auto" />
                    <span className="block text-xs font-semibold text-gray-300">Drag & Drop or Click to browse your disk</span>
                    <span className="block text-[10px] text-gray-500">Only JPG or JPEG images are accepted. Best quality if 3000x3000px dimensions.</span>
                    {coverArtUploadProgress > 0 && (
                      <div className="w-full bg-slate-800 h-2.5 rounded mt-4 overflow-hidden relative">
                        <div 
                          className="bg-blue-500 h-full transition-all duration-300"
                          style={{ width: `${coverArtUploadProgress}%` }}
                        />
                        <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white uppercase tracking-wider drop-shadow-md">
                          Uploading... {coverArtUploadProgress}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="md:col-span-4 p-3 bg-slate-900 rounded-xl border border-slate-800/80 flex flex-col items-center justify-center">
                  {coverArtPreview || coverArtUrl ? (
                    <div className="text-center space-y-1.5">
                      <img 
                        src={coverArtPreview || coverArtUrl} 
                        alt="Preview" 
                        className="w-24 h-24 rounded object-cover mx-auto"
                        referrerPolicy="no-referrer"
                      />
                      <span className="text-[10px] block text-green-400 font-semibold uppercase tracking-wide">Ready for Delivery</span>
                    </div>
                  ) : (
                    <div className="text-center p-4">
                      <span className="text-[11px] text-gray-500 block mb-2">Or select a mock high-def artwork below:</span>
                      <div className="flex justify-center gap-1.5">
                        {[
                          'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=300&auto=format&fit=crop',
                          'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=300&auto=format&fit=crop',
                          'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=300&auto=format&fit=crop',
                        ].map((u, i) => (
                          <button
                            type="button"
                            key={i}
                            onClick={() => selectPrebuiltCover(u)}
                            className="w-10 h-10 rounded border border-slate-705 overflow-hidden hover:scale-105 transition cursor-pointer"
                          >
                            <img src={u} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {artworkWarning && (
                <div className="mt-2.5 p-2 bg-amber-950/40 border border-amber-600/30 rounded text-[10px] text-amber-300 flex items-start gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" />
                  <span>{artworkWarning}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6" id="wizard_step2_tracks">
            <span className="text-xs text-indigo-400 font-extrabold uppercase tracking-widest block">Metadata Schema for Individual Tracks ({numTracks} track(s) configured)</span>
            
            <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2" id="tracks_builder_scrollarea">
              {trackList.map((track, idx) => (
                <div 
                  key={track.id} 
                  className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-4 relative"
                  id={`track_form_card_${idx}`}
                >
                  <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                    <span className="text-xs font-black text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                      <AudioLines className="w-3.5 h-3.5 text-blue-500" /> Track #{idx + 1} Metadata
                    </span>
                    <span className="text-[10px] text-gray-500">Stereo Wave File Ingestion</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-widest">Track Display Name</label>
                      <input
                        type="text"
                        className="w-full bg-[#151c2e] border border-slate-800 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none focus:border-blue-500"
                        placeholder="e.g. Retro Dreams (Radio Edit)"
                        value={track.trackName}
                        onChange={(e) => handleTrackFieldChange(idx, 'trackName', e.target.value)}
                        id={`w_track_${idx}_name`}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-widest">Main Artist(s)</label>
                      <div className="flex flex-wrap gap-1 mb-1">
                        {track.mainArtistName.split(',').map(a => a.trim()).filter(Boolean).map((artist, i) => (
                          <span key={i} className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#1a2333] border border-slate-700/60 rounded text-[9px] font-semibold text-white">
                            {artist}
                            <button 
                              type="button" 
                              onClick={() => {
                                const newArr = track.mainArtistName.split(',').map(a => a.trim()).filter(Boolean).filter(a => a !== artist);
                                handleTrackFieldChange(idx, 'mainArtistName', newArr.join(', '));
                              }}
                              className="text-gray-400 hover:text-red-400"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <select
                        className="w-full bg-[#151c2e] border border-slate-800 rounded-lg py-1.5 px-3 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
                        onChange={(e) => {
                          const val = e.target.value;
                          if (!val) return;
                          const current = track.mainArtistName.split(',').map(a => a.trim()).filter(Boolean);
                          if (!current.includes(val)) {
                            handleTrackFieldChange(idx, 'mainArtistName', [...current, val].join(', '));
                          }
                          e.target.value = '';
                        }}
                      >
                        <option value="">+ Add Main Artist</option>
                        {managedArtists.map(ma => (
                          <option key={ma.id} value={ma.name}>{ma.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-widest">Feature Artist(s)</label>
                      <div className="flex flex-wrap gap-1 mb-1">
                        {(track.featureArtists || []).map((artist, i) => (
                          <span key={i} className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#1a2333] border border-slate-700/60 rounded text-[9px] font-semibold text-white">
                            {artist}
                            <button 
                              type="button" 
                              onClick={() => {
                                handleTrackFieldChange(idx, 'featureArtists', (track.featureArtists || []).filter(a => a !== artist));
                              }}
                              className="text-gray-400 hover:text-red-400"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <select
                        className="w-full bg-[#151c2e] border border-slate-800 rounded-lg py-1.5 px-3 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
                        onChange={(e) => {
                          const val = e.target.value;
                          if (!val) return;
                          const current = track.featureArtists || [];
                          if (!current.includes(val)) {
                            handleTrackFieldChange(idx, 'featureArtists', [...current, val]);
                          }
                          e.target.value = '';
                        }}
                      >
                        <option value="">+ Add Feature Artist</option>
                        {managedArtists.map(ma => (
                          <option key={ma.id} value={ma.name}>{ma.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-widest">Other Artist(s)</label>
                      <div className="flex flex-wrap gap-1 mb-1">
                        {(track.otherArtists || []).map((artist, i) => (
                          <span key={i} className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#1a2333] border border-slate-700/60 rounded text-[9px] font-semibold text-white">
                            {artist}
                            <button 
                              type="button" 
                              onClick={() => {
                                handleTrackFieldChange(idx, 'otherArtists', (track.otherArtists || []).filter(a => a !== artist));
                              }}
                              className="text-gray-400 hover:text-red-400"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <select
                        className="w-full bg-[#151c2e] border border-slate-800 rounded-lg py-1.5 px-3 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
                        onChange={(e) => {
                          const val = e.target.value;
                          if (!val) return;
                          const current = track.otherArtists || [];
                          if (!current.includes(val)) {
                            handleTrackFieldChange(idx, 'otherArtists', [...current, val]);
                          }
                          e.target.value = '';
                        }}
                      >
                        <option value="">+ Add Other Artist</option>
                        {managedArtists.map(ma => (
                          <option key={ma.id} value={ma.name}>{ma.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-widest">Track Genre (Main)</label>
                      <select
                        className="w-full bg-[#151c2e] border border-slate-800 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none focus:border-blue-500"
                        value={track.genre || 'Electronic'}
                        onChange={(e) => {
                          const newGenre = e.target.value;
                          handleTrackFieldChange(idx, 'genre', newGenre);
                          const list = GENRE_DATA[newGenre] || [];
                          handleTrackFieldChange(idx, 'subGenre', list[0] || '');
                        }}
                        id={`w_track_${idx}_genre`}
                      >
                        {Object.keys(GENRE_DATA).map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-widest">Track Sub-Genre</label>
                      <select
                        className="w-full bg-[#151c2e] border border-slate-800 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none focus:border-blue-500"
                        value={track.subGenre}
                        onChange={(e) => handleTrackFieldChange(idx, 'subGenre', e.target.value)}
                        id={`w_track_${idx}_subgenre`}
                      >
                        {(GENRE_DATA[track.genre || 'Electronic'] || []).map((sg) => (
                          <option key={sg} value={sg}>{sg}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-widest">Production Producer</label>
                      <input
                        type="text"
                        className="w-full bg-[#151c2e] border border-slate-800 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none focus:border-blue-500"
                        placeholder="Full Name (eg. Albert Smith)"
                        value={track.producer}
                        onChange={(e) => handleTrackFieldChange(idx, 'producer', e.target.value)}
                        id={`w_track_${idx}_producer`}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-widest">Lyricist (Songwriter Name)</label>
                      <input
                        type="text"
                        className="w-full bg-[#151c2e] border border-slate-800 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none focus:border-blue-500"
                        placeholder="Full Name (eg. Albert Smith)"
                        value={track.lyricist}
                        onChange={(e) => handleTrackFieldChange(idx, 'lyricist', e.target.value)}
                        id={`w_track_${idx}_lyricist`}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-widest">Composer (Songwriter Name)</label>
                      <input
                        type="text"
                        className="w-full bg-[#151c2e] border border-slate-800 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none focus:border-blue-500"
                        placeholder="Full Name (eg. Albert Smith)"
                        value={track.composer}
                        onChange={(e) => handleTrackFieldChange(idx, 'composer', e.target.value)}
                        id={`w_track_${idx}_composer`}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-widest">ISRC (Optional Metadata Code)</label>
                      <input
                        type="text"
                        className="w-full bg-[#151c2e] border border-slate-800 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none focus:border-blue-500 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-300 font-mono"
                        placeholder="e.g. US-WV-26-XXXXX"
                        value={track.isrc}
                        onChange={(e) => handleTrackFieldChange(idx, 'isrc', e.target.value)}
                        id={`w_track_${idx}_isrc`}
                      />
                    </div>
                  </div>

                  {/* Explicit Tag check */}
                  <div className="flex flex-col gap-3 p-3.5 bg-slate-950/45 rounded-lg border border-slate-800">
                    <div>
                      <span className="text-xs font-bold text-gray-200 block">Explicit Parental Advisory Tagging</span>
                      <p className="text-[10px] text-gray-400">Strictly flag if the vocals contain strong profanity, drug references, or offensive content.</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleTrackFieldChange(idx, 'explicitContent', true)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg border text-xs font-bold tracking-wider uppercase transition cursor-pointer ${
                          track.explicitContent
                            ? 'bg-red-950/50 text-red-400 border-red-500/40 shadow-lg shadow-red-950/30'
                            : 'bg-[#121c2c]/40 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                        id={`w_track_${idx}_explicit_yes`}
                      >
                        ⚠️ Yes (Explicit)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTrackFieldChange(idx, 'explicitContent', false)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg border text-xs font-bold tracking-wider uppercase transition cursor-pointer ${
                          !track.explicitContent
                            ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/40 shadow-lg shadow-emerald-950/30'
                            : 'bg-[#121c2c]/40 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                        id={`w_track_${idx}_explicit_no`}
                      >
                        ✓ No (Clean/Instrumental)
                      </button>
                    </div>
                  </div>

                  {/* Audio Upload Element */}
                  <div className="p-3 border border-dashed border-slate-800 rounded-xl bg-slate-950/20">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold block text-slate-300 uppercase tracking-wider">Audio File Ingestion (.WAV master)</span>
                        {track.audioFileName ? (
                          <span className="text-xs font-semibold text-green-400 mt-1 block font-mono">
                            ✓ File attached: {track.audioFileName}
                          </span>
                        ) : (
                          <span className="text-xs text-amber-500 mt-1 block">Awaiting raw .wav file attachment...</span>
                        )}
                      </div>

                      <div className="relative">
                        <input
                          type="file"
                          accept=".wav"
                          onChange={(e) => handleAudioUploadMock(idx, e)}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          disabled={trackUploadProgress[idx] > 0}
                        />
                        <button
                          type="button"
                          disabled={trackUploadProgress[idx] > 0}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 disabled:bg-slate-800/50 disabled:text-slate-500 text-white text-[11px] font-bold rounded-lg transition"
                        >
                          Select WAV Master File
                        </button>
                      </div>
                    </div>
                    {trackUploadProgress[idx] > 0 && (
                      <div className="mt-3 w-full bg-slate-800 h-2 rounded overflow-hidden relative">
                        <div 
                          className="bg-green-500 h-full transition-all duration-300"
                          style={{ width: `${trackUploadProgress[idx]}%` }}
                        />
                        <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-white uppercase tracking-wider drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                          Uploading to Vault: {trackUploadProgress[idx]}%
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Fallback Google Drive Link */}
                  <div className="space-y-1.5 p-3 rounded-xl bg-blue-900/5 border border-blue-500/10 active:border-blue-500/20 transition-colors">
                    <label className="block text-[10px] font-bold text-blue-300 uppercase tracking-widest">
                      Alternative: Google Drive Link (If upload fails)
                    </label>
                    <div className="flex items-center gap-2">
                       <input
                        type="url"
                        className="flex-1 bg-[#151c2e]/50 border border-slate-800 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none focus:border-blue-500/50"
                        placeholder="Paste Public Google Drive Link"
                        value={track.googleDriveLink || ''}
                        onChange={(e) => handleTrackFieldChange(idx, 'googleDriveLink', e.target.value)}
                        id={`w_track_${idx}_drive`}
                      />
                    </div>
                    <span className="text-[9px] text-gray-500 block italic leading-tight">
                      Add a public Google Drive link if you face any issues with the WAV master file upload above. Ensure link sharing is set to "Anyone with the link".
                    </span>
                  </div>

                  {/* Lyrics area */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Full Lyrics (Optional)</label>
                    <textarea
                      rows={2}
                      className="w-full bg-[#151c2e] border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none"
                      placeholder="Line by line lyrics for Sync publishing ingestion..."
                      value={track.lyrics || ''}
                      onChange={(e) => handleTrackFieldChange(idx, 'lyrics', e.target.value)}
                      id={`w_track_${idx}_lyrics`}
                    />
                  </div>
                </div>
              ))}

              {releaseType !== 'Single' && numTracks < 30 && (
                <button
                  type="button"
                  onClick={() => setNumTracks(prev => prev + 1)}
                  className="w-full py-3 border border-dashed border-slate-700 hover:border-slate-500 rounded-xl bg-slate-900/40 hover:bg-slate-800/60 text-slate-400 hover:text-white text-xs font-bold transition flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Another Track
                </button>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4" id="wizard_step3_special">
            <div>
              <span className="text-xs text-indigo-400 font-extrabold uppercase tracking-widest block">Step 3: Streaming Store Ingestion Notes</span>
              <h3 className="text-sm font-bold text-gray-200 mt-1">Special Delivery Requests</h3>
              <p className="text-xs text-gray-400 mt-1">Provide helpful commands or specific target playlists pitching references for the platform reviewing agents to execute.</p>
            </div>

            <textarea
              rows={8}
              className="w-full bg-[#151c2e] border border-slate-850 rounded-xl p-4 text-xs text-white focus:outline-none focus:border-blue-500 md:text-sm"
              placeholder="e.g. I would like immediate submission to Beatport. Please configure the primary genre as Acid House instead of standard Trance. Also register under the active Apple Artist profile ID: 29841..."
              value={specialRequest}
              onChange={(e) => setSpecialRequest(e.target.value)}
              id="w_specialRequest"
            />
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6" id="wizard_step4_review">
            <div>
              <span className="text-xs text-indigo-400 font-extrabold uppercase tracking-widest block">Step 4: Audit & Verification</span>
              <h3 className="text-sm font-bold text-gray-200 mt-1">Confirm and Dispatch Tracks</h3>
              <p className="text-xs text-slate-400 mt-1">A brief audit of all package details before global ingestion transmission.</p>
            </div>

            <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800 space-y-4" id="review_summary">
              {/* Primary Details */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b border-slate-800/80 pb-4">
                <img 
                  src={coverArtPreview || coverArtUrl || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=200&auto=format&fit=crop'} 
                  alt="Artwork Summary" 
                  className="w-16 h-16 rounded object-cover flex-shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="font-extrabold text-base text-white">{albumName}</h4>
                  <div className="text-xs text-gray-400 flex flex-wrap gap-2 mt-1">
                    <span>{releaseType}</span>
                    <span>•</span>
                    <span>{currentUser.artistName}</span>
                    {otherArtists.length > 0 && (
                      <>
                        <span>•</span>
                        <span>ft. {otherArtists.join(', ')}</span>
                      </>
                    )}
                  </div>
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    Origination: {contentType} • Tone Language: {language}
                  </div>
                </div>
              </div>

              {/* Subgenre & Dates */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs border-b border-slate-800/80 pb-4">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-bold">Release Date</span>
                  <span className="text-gray-300 font-medium">{new Date(releaseDate).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-bold">Main Genre</span>
                  <span className="text-gray-300 font-medium">{genre} / {subGenre || 'N/A'}</span>
                </div>
                {isElite && (
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-bold">Bespoke Label</span>
                    <span className="text-emerald-400 font-medium">{selectedLabel || 'Prism Records (Elite)'}</span>
                  </div>
                )}
                {!isBasic && (
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-bold">Publishing Lines</span>
                    <span className="text-purple-400 font-mono text-[9px] block truncate">{cLine || '© Custom'}</span>
                  </div>
                )}
              </div>

              {/* Tracks Review List */}
              <div className="space-y-2">
                <span className="text-[10px] text-slate-500 uppercase block font-bold">Tracks Array Ingestion ({trackList.length} files)</span>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {trackList.map((t, idx) => (
                    <div key={idx} className="p-2 rounded bg-slate-900 border border-slate-850 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                      <div>
                        <span className="font-bold text-gray-200 block">{idx + 1}. {t.trackName || 'Unnamed track'}</span>
                        <div className="text-[11px] text-gray-400 mt-0.5">
                           By: <span className="font-bold text-gray-300">{t.mainArtistName}</span>
                           {t.otherArtists && t.otherArtists.length > 0 && ` (feat. ${t.otherArtists.join(', ')})`}
                        </div>
                        <div className="text-[10px] text-slate-500 font-semibold uppercase mt-1">Producer: {t.producer || 'N/A'} • Composer: {t.composer || 'N/A'}</div>
                      </div>
                      <div className="sm:text-right">
                        <span className="text-[10px] bg-slate-800 text-blue-400 font-mono px-2 py-0.5 rounded border border-slate-700 inline-block sm:block text-center min-w-[120px]">
                          📢 wav attached
                        </span>
                        {t.explicitContent && (
                          <span className="text-[8px] bg-red-900/30 text-red-400 font-bold uppercase inline-block sm:block mt-2 sm:mt-1 px-1 rounded">Parental advisory</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Special instructions field summary */}
              {specialRequest && (
                <div className="p-2.5 rounded bg-slate-900/80 border border-indigo-950 text-xs">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider mb-1">Pitch Ingestion Notes to System Admin</span>
                  <p className="text-gray-300 italic">"{specialRequest}"</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800" id="wizard_buttons_footer">
        {step > 1 ? (
          <button
            type="button"
            onClick={handleBack}
            className="cursor-pointer px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 font-bold text-xs text-white transition flex items-center gap-1.5"
            id="btn_wizard_back"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
        ) : (
          <div />
        )}

        {step < 4 ? (
          <button
            type="button"
            onClick={handleNext}
            className="cursor-pointer px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 font-bold text-xs text-white transition flex items-center gap-1.5"
            id="btn_wizard_next"
          >
            Continue Ingestion <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleFinalSubmit}
            className="cursor-pointer px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 font-black text-xs text-white rounded-lg shadow-lg shadow-emerald-900/30 transition flex items-center gap-1.5 animate-pulse"
            id="btn_wizard_submit"
          >
            <FileCheck className="w-4 h-4" /> Confirm & Ingest Track Package
          </button>
        )}
      </div>
    </div>
  );
}
