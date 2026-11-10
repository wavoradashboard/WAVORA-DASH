import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Layers, Disc, Calendar, AlertTriangle, CheckCircle, Clock, Trash2, 
  ChevronDown, ChevronUp, UserCheck, Search, X, Filter, SlidersHorizontal, ArrowUpDown, RefreshCw 
} from 'lucide-react';
import { Release, TrackStatus, User } from '../types';

interface CatalogueViewProps {
  currentUser: User;
  releases: Release[];
  onDeleteRelease: (id: string) => void;
  onEditRelease?: (release: Release) => void;
  onViewReleaseDetails?: (release: Release) => void;
}

type StatusTab = 'All' | TrackStatus;
type SortOption = 'newest' | 'oldest' | 'release_date_desc' | 'release_date_asc' | 'title_asc';
type DateRangeOption = 'all' | '30days' | '90days' | 'year';

export default function CatalogueView({
  currentUser,
  releases,
  onDeleteRelease,
  onEditRelease,
  onViewReleaseDetails,
}: CatalogueViewProps) {
  const [activeTab, setActiveTab] = useState<StatusTab>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [dateRange, setDateRange] = useState<DateRangeOption>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [expandedRelease, setExpandedRelease] = useState<string | null>(null);

  // Filter current user's releases
  const userReleases = useMemo(() => {
    return releases.filter(r => r.email.toLowerCase() === currentUser.email.toLowerCase());
  }, [releases, currentUser.email]);

  const toggleExpand = (id: string) => {
    setExpandedRelease((prev) => (prev === id ? null : id));
  };

  const statusThemes: Record<TrackStatus, { color: string; icon: React.ComponentType<any>; label: string; desc: string }> = {
    Submitted: {
      color: 'text-amber-400 border-amber-500/30 bg-amber-950/20',
      icon: Clock,
      label: 'Submitted for Review',
      desc: 'Our moderation crew is reviewing metadata compliance and WAV consistency.',
    },
    Approved: {
      color: 'text-blue-400 border-blue-500/30 bg-blue-950/20',
      icon: CheckCircle,
      label: 'Approved by Admin',
      desc: 'Metadata fully validated. Transitioning to global streaming network delivery.',
    },
    Rejected: {
      color: 'text-red-400 border-red-500/30 bg-red-950/20',
      icon: AlertTriangle,
      label: 'Requires Correction',
      desc: 'Check reviewer comments below to correct metadata coordinates, artwork, or audio tags.',
    },
    Live: {
      color: 'text-indigo-400 border-indigo-500/30 bg-indigo-950/20',
      icon: UserCheck,
      label: 'Delivered Live to DSPs',
      desc: 'Actively ingested on Spotify, Apple Music, and active streaming catalogs.',
    },
  };

  const getStatusCount = (tab: StatusTab) => {
    if (tab === 'All') return userReleases.length;
    return userReleases.filter(r => r.status === tab).length;
  };

  // Filter & Sort Logic
  const filteredReleases = useMemo(() => {
    return userReleases.filter(rel => {
      // 1. Status Tab filter
      if (activeTab !== 'All' && rel.status !== activeTab) {
        return false;
      }

      // 2. Type filter
      if (selectedType !== 'All' && rel.type !== selectedType) {
        return false;
      }

      // 3. Search query filter (matches album name, artist names, UPC, ID, track names)
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase().trim();
        const matchesName = rel.albumName.toLowerCase().includes(query);
        const matchesMainArtist = rel.mainArtistName.toLowerCase().includes(query);
        const matchesFeatures = rel.featureArtists?.some(f => f.toLowerCase().includes(query));
        const matchesOthers = rel.otherArtists?.some(o => o.toLowerCase().includes(query));
        const matchesUpc = rel.upc?.toLowerCase().includes(query);
        const matchesId = rel.id.toLowerCase().includes(query);
        const matchesTracks = rel.tracks?.some(t => t.trackName.toLowerCase().includes(query) || t.isrc?.toLowerCase().includes(query));

        if (!matchesName && !matchesMainArtist && !matchesFeatures && !matchesOthers && !matchesUpc && !matchesId && !matchesTracks) {
          return false;
        }
      }

      // 4. Date range filter
      if (dateRange !== 'all' && rel.submittedAt) {
        const submittedDate = new Date(rel.submittedAt).getTime();
        const now = Date.now();
        const dayInMs = 24 * 60 * 60 * 1000;

        if (dateRange === '30days' && (now - submittedDate > 30 * dayInMs)) {
          return false;
        }
        if (dateRange === '90days' && (now - submittedDate > 90 * dayInMs)) {
          return false;
        }
        if (dateRange === 'year') {
          const currentYear = new Date().getFullYear();
          const releaseYear = new Date(rel.submittedAt).getFullYear();
          if (releaseYear !== currentYear) {
            return false;
          }
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
      }
      if (sortBy === 'release_date_desc') {
        return new Date(b.releaseDate || b.submittedAt).getTime() - new Date(a.releaseDate || a.submittedAt).getTime();
      }
      if (sortBy === 'release_date_asc') {
        return new Date(a.releaseDate || a.submittedAt).getTime() - new Date(b.releaseDate || b.submittedAt).getTime();
      }
      if (sortBy === 'title_asc') {
        return a.albumName.localeCompare(b.albumName);
      }
      return 0;
    });
  }, [userReleases, activeTab, selectedType, searchTerm, dateRange, sortBy]);

  const hasActiveFilters = searchTerm !== '' || selectedType !== 'All' || dateRange !== 'all' || sortBy !== 'newest';

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedType('All');
    setDateRange('all');
    setSortBy('newest');
  };

  return (
    <div className="space-y-6" id="catalogue_root">
      {/* Header info */}
      <div className="p-6 bg-white/2 rounded-3xl border border-white/10 flex items-center justify-between" id="catalogue_header">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Layers className="w-5 h-5 text-[#6366F1]" />
            <h2 className="text-base font-black text-white uppercase tracking-tighter">My Ingestion Catalogue</h2>
          </div>
          <p className="text-xs text-gray-405 leading-relaxed">
            Monitor the lifecycle of your dispatches as they traverse from review submittal to active ingestion arrays.
          </p>
        </div>
      </div>

      {/* Main Search & Filter Control Bar */}
      <div className="p-4 bg-[#0e1424] rounded-2xl border border-slate-800 space-y-4" id="catalogue_search_filter_bar">
        {/* Search input field */}
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search releases by title, artist, track name, UPC, or Dispatch ID..."
            className="w-full bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 rounded-xl pl-10 pr-10 py-2.5 text-xs focus:outline-none focus:border-[#6366F1] transition shadow-inner font-medium"
            id="catalogue_search_input"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3 p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
              title="Clear search"
              id="catalogue_clear_search_btn"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Tab Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 p-1.5 bg-black/60 rounded-xl border border-slate-800/80" id="catalogue_status_tabs">
          {(['All', 'Submitted', 'Approved', 'Rejected', 'Live'] as StatusTab[]).map((tab) => {
            const isActive = activeTab === tab;
            const count = getStatusCount(tab);
            return (
              <button
                type="button"
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-2 text-center font-extrabold text-[10px] uppercase rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  isActive 
                    ? 'bg-[#6366F1] text-white shadow-sm shadow-[#6366F1]/30' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
                id={`cat_tab_trigger_${tab}`}
              >
                <span>{tab}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${
                  isActive ? 'bg-black/30 text-white' : 'bg-slate-900 text-slate-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Secondary Filters & Sorting controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-900">
          <div className="flex flex-wrap items-center gap-2">
            {/* Release Type Selector */}
            <div className="flex items-center gap-1 bg-slate-950/70 border border-slate-800 rounded-lg px-2.5 py-1.5 text-[11px]">
              <Filter className="w-3 h-3 text-indigo-400 shrink-0" />
              <span className="text-slate-500 text-[10px] font-bold uppercase mr-1">Type:</span>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer pr-1"
                id="catalogue_type_select"
              >
                <option value="All" className="bg-slate-900 text-white">All Types</option>
                <option value="Single" className="bg-slate-900 text-white">Single</option>
                <option value="EP" className="bg-slate-900 text-white">EP</option>
                <option value="Album" className="bg-slate-900 text-white">Album</option>
              </select>
            </div>

            {/* Date Filter Selector */}
            <div className="flex items-center gap-1 bg-slate-950/70 border border-slate-800 rounded-lg px-2.5 py-1.5 text-[11px]">
              <Calendar className="w-3 h-3 text-indigo-400 shrink-0" />
              <span className="text-slate-500 text-[10px] font-bold uppercase mr-1">Date:</span>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as DateRangeOption)}
                className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer pr-1"
                id="catalogue_date_select"
              >
                <option value="all" className="bg-slate-900 text-white">All Time</option>
                <option value="30days" className="bg-slate-900 text-white">Last 30 Days</option>
                <option value="90days" className="bg-slate-900 text-white">Last 90 Days</option>
                <option value="year" className="bg-slate-900 text-white">This Year ({new Date().getFullYear()})</option>
              </select>
            </div>

            {/* Sort Order Selector */}
            <div className="flex items-center gap-1 bg-slate-950/70 border border-slate-800 rounded-lg px-2.5 py-1.5 text-[11px]">
              <ArrowUpDown className="w-3 h-3 text-indigo-400 shrink-0" />
              <span className="text-slate-500 text-[10px] font-bold uppercase mr-1">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer pr-1"
                id="catalogue_sort_select"
              >
                <option value="newest" className="bg-slate-900 text-white">Newest Submission</option>
                <option value="oldest" className="bg-slate-900 text-white">Oldest Submission</option>
                <option value="release_date_desc" className="bg-slate-900 text-white">Release Date (Newest)</option>
                <option value="release_date_asc" className="bg-slate-900 text-white">Release Date (Oldest)</option>
                <option value="title_asc" className="bg-slate-900 text-white">Title (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Filter Status summary & Reset button */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-400 font-mono font-medium">
              Showing <strong className="text-indigo-300 font-bold">{filteredReleases.length}</strong> of {userReleases.length} releases
            </span>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="px-2.5 py-1 bg-slate-850 hover:bg-slate-800 border border-slate-750 text-indigo-300 text-[10px] font-bold rounded-md transition flex items-center gap-1 cursor-pointer"
                id="catalogue_reset_filters_btn"
                title="Reset all search filters"
              >
                <RefreshCw className="w-3 h-3" /> Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Active Tab Explanation Banner (shown when a specific status is selected) */}
      {activeTab !== 'All' && statusThemes[activeTab] && (
        <div className={`p-4 rounded-2xl border flex items-start gap-3 text-xs ${statusThemes[activeTab].color}`} id="active_tab_instructions_banner">
          {React.createElement(statusThemes[activeTab].icon, { className: 'w-5 h-5 mt-0.5 flex-shrink-0' })}
          <div>
            <h4 className="font-bold text-gray-100">{statusThemes[activeTab].label}</h4>
            <p className="opacity-80 mt-1">{statusThemes[activeTab].desc}</p>
          </div>
        </div>
      )}

      {/* Catalogue releases dynamic grid */}
      {filteredReleases.length === 0 ? (
        <div className="py-16 text-center bg-[#0e1424] rounded-3xl border border-slate-900 space-y-3" id="catalogue_empty_box">
          <Disc className="w-12 h-12 text-slate-705 mx-auto animate-spin" style={{ animationDuration: '6s' }} />
          <h3 className="text-sm font-bold text-gray-300">No matching releases found.</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            {userReleases.length === 0 
              ? "You haven't submitted any releases to your catalogue yet." 
              : "No releases match your current search terms and filter criteria."}
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-[#6366F1]/20 hover:bg-[#6366F1]/30 border border-[#6366F1]/40 text-[#6366F1] font-bold text-xs rounded-xl transition cursor-pointer"
              id="catalogue_empty_reset_btn"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Clear All Search Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4" id="catalogue_releases_stack">
          {filteredReleases.map((rel) => {
            const isExpanded = expandedRelease === rel.id;
            const currentTheme = statusThemes[rel.status] || statusThemes['Submitted'];

            return (
              <div 
                key={rel.id} 
                className="bg-[#0f1322] border border-slate-850 rounded-2xl overflow-hidden hover:border-slate-800 transition"
                id={`cat_release_card_${rel.id}`}
              >
                {/* Visual Header portion */}
                <div 
                  onClick={() => toggleExpand(rel.id)}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-4">
                    <img 
                      src={rel.coverArtSignedUrl || rel.coverArtUrl || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=200&auto=format&fit=crop'} 
                      alt="" 
                      className="w-14 h-14 rounded-xl object-cover border border-slate-800 flex-shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="space-y-0.5 text-left">
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-white text-sm tracking-wide">{rel.albumName}</h4>
                        {activeTab === 'All' && (
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${currentTheme.color}`}>
                            {rel.status}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">
                        {rel.mainArtistName} 
                        {rel.featureArtists && rel.featureArtists.length > 0 ? ` (feat. ${rel.featureArtists.join(', ')})` : ''}
                        {rel.otherArtists && rel.otherArtists.length > 0 ? ` (other. ${rel.otherArtists.join(', ')})` : ''}
                      </p>
                      <div className="text-[10px] text-gray-500 flex items-center gap-2 flex-wrap">
                        <span className="font-medium bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 uppercase text-[9px]">
                          {rel.type}
                        </span>
                        <span>•</span>
                        <span>{rel.tracks.length} track(s)</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-mono"><Calendar className="w-3 h-3 text-indigo-400" /> {rel.releaseDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 self-end sm:self-auto">
                    {onViewReleaseDetails && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewReleaseDetails(rel);
                        }}
                        className={`px-3 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95 ${
                          rel.status === 'Live'
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-emerald-500/20'
                            : 'bg-gradient-to-r from-indigo-600 to-purple-500 hover:from-indigo-500 hover:to-purple-400 text-white shadow-indigo-500/20'
                        }`}
                        id={`btn_header_view_poster_${rel.id}`}
                      >
                        {rel.status === 'Live' ? '🔥 View OUT NOW Poster' : '⚡ View Poster & Manifest'}
                      </button>
                    )}

                    <div className="text-right hidden md:block">
                      <span className="text-[10px] text-gray-500 uppercase font-bold block">Digital Dispatch ID</span>
                      <span className="font-mono text-[10px] text-slate-400">{rel.id}</span>
                    </div>

                    <div className="p-1.5 rounded bg-slate-900 border border-slate-800 text-gray-400">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded metadata portion */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-slate-900 bg-slate-950/30 overflow-hidden"
                    >
                      <div className="p-5 space-y-4 text-xs">
                        {/* Rejection comment */}
                        {rel.status === 'Rejected' && rel.feedback && (
                          <div className="p-3.5 bg-red-950/30 border border-red-500/20 rounded-2xl space-y-1 text-red-300">
                            <span className="text-[10px] font-black uppercase tracking-widest text-red-400 block">Reviewer Rejection Log:</span>
                            <p className="italic">"{rel.feedback}"</p>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Metadata block */}
                          <div className="space-y-2">
                            <span className="text-[10px] text-gray-500 uppercase font-bold block tracking-wider">Release Coordinates</span>
                            <div className="space-y-1.5 text-gray-300">
                              <div className="flex justify-between">
                                <span className="text-slate-500 text-[11px]">Primary Language:</span>
                                <span>{rel.language}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500 text-[11px]">Primary Genre:</span>
                                <span>{rel.genre || 'Electronic'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-550 text-[11px]">Sub-Genre tag:</span>
                                <span>{rel.subGenre || 'N/A'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500 text-[11px]">Origination Type:</span>
                                <span>{rel.contentType}</span>
                              </div>
                              {rel.labelName && (
                                <div className="flex justify-between text-indigo-400">
                                  <span className="text-slate-500 text-[11px]">Vanity Label Imprint:</span>
                                  <span>{rel.labelName}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Publishing block */}
                          <div className="space-y-2">
                            <span className="text-[10px] text-gray-500 uppercase font-bold block tracking-wider">Sound Recording Publishing rights</span>
                            <div className="space-y-1 text-gray-300">
                              <div>
                                <span className="text-slate-500 text-[10px] block font-bold uppercase">C Line (© Publisher)</span>
                                <span className="font-mono text-[11px] text-indigo-300">{rel.cLine || 'System Automated Default'}</span>
                              </div>
                              <div className="pt-2">
                                <span className="text-slate-500 text-[10px] block font-bold uppercase">P Line (℗ Recording)</span>
                                <span className="font-mono text-[11px] text-indigo-300">{rel.pLine || 'System Automated Default'}</span>
                              </div>
                            </div>
                          </div>

                          {/* Pitch text / Special requests */}
                          <div className="space-y-2 bg-slate-900/60 p-3 rounded-2xl border border-slate-900">
                            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Special Requests to Reviewer</span>
                            <p className="text-gray-400 text-[11px] leading-relaxed italic">
                              {rel.specialRequest ? `"${rel.specialRequest}"` : 'No special pitching requests submitted.'}
                            </p>
                          </div>
                        </div>

                        {/* Tracks array list */}
                        <div className="space-y-2 pt-2 border-t border-slate-900/60">
                          <span className="text-[10px] text-gray-500 uppercase font-black block tracking-widest">Master audio tracks list ({rel.tracks.length})</span>
                          
                          <div className="space-y-2">
                            {rel.tracks.map((track, idx) => (
                              <div key={track.id} className="p-3 bg-slate-900/80 rounded-xl border border-slate-850 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                                <div className="space-y-1">
                                  <div className="font-bold text-gray-200">
                                    {idx + 1}. {track.trackName} {track.explicitContent && <span className="align-middle inline-block ml-1 px-1 py-0.2 rounded bg-red-950/40 text-[8px] font-black text-red-500 border border-red-900/20">EXPLICIT</span>}
                                  </div>
                                  <p className="text-[10px] text-gray-400">
                                    Producer: <span className="text-slate-200">{track.producer}</span> • Composer: <span className="text-slate-200">{track.composer}</span> • Lyricist: <span className="text-slate-200">{track.lyricist}</span>
                                  </p>
                                </div>

                                <div className="text-left sm:text-right space-y-1 min-w-[150px]">
                                  <div className="text-[10px] text-slate-500 font-mono">
                                    WAV: {track.audioFileName || 'MasterAudio.wav'}
                                  </div>
                                  <div className="text-[10px] text-blue-400 font-semibold font-mono">
                                    ISRC: {track.isrc || 'Generated on approval'}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Action buttons (allow deleting release when Pending review) */}
                        <div className="flex justify-between items-center pt-3 border-t border-slate-900/60 flex-wrap gap-2">
                          <span className="text-[10px] text-slate-500">Submitted at: {new Date(rel.submittedAt).toLocaleString()}</span>
                          
                          <div className="flex flex-wrap items-center gap-2">
                            {onViewReleaseDetails && (
                              <button
                                type="button"
                                onClick={() => onViewReleaseDetails(rel)}
                                className="px-3 py-1 bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-500/30 text-indigo-300 hover:text-white font-bold rounded-lg text-[10px] tracking-wide transition flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                                id={`btn_expanded_poster_${rel.id}`}
                              >
                                {rel.status === 'Live' ? '🔥 View / Customize OUT NOW Poster' : '🎨 Customize Poster & Upload Art'}
                              </button>
                            )}
                            {rel.status === 'Rejected' && onEditRelease && (
                              <button
                                type="button"
                                onClick={() => onEditRelease(rel)}
                                className="px-3 py-1 bg-amber-950/20 hover:bg-amber-950/60 text-amber-400 font-bold rounded text-[10px] tracking-wide transition flex items-center gap-1 cursor-pointer"
                                id={`btn_edit_release_${rel.id}`}
                              >
                                Edit & Resubmit
                              </button>
                            )}
                            {(rel.status === 'Submitted' || rel.status === 'Rejected') && (
                              <button
                                type="button"
                                onClick={() => onDeleteRelease(rel.id)}
                                className="px-3 py-1 bg-red-950/20 hover:bg-red-950/60 text-red-400 font-bold rounded text-[10px] tracking-wide transition flex items-center gap-1 cursor-pointer"
                                id={`btn_delete_release_${rel.id}`}
                              >
                                <Trash2 className="w-3 h-3" /> Recall Submission
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

