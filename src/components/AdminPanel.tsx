import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  Users, 
  Disc, 
  HelpCircle, 
  Sparkles, 
  Check, 
  X, 
  Send, 
  DollarSign, 
  Save,
  PlusCircle, 
  Plus, 
  Trash2, 
  Award,
  BookOpen,
  UserCheck,
  Bell,
  Eye,
  Globe,
  FileText,
  Music,
  Calendar,
  Hash,
  Layers,
  Copy
} from 'lucide-react';
import { User, Release, SupportQuery, OacApplication, RevenueReport, TrackStatus, Plan, Notification, ArtistProfile } from '../types';

interface AdminPanelProps {
  currentUser: User;
  users: User[];
  releases: Release[];
  artists: ArtistProfile[];
  supportQueries: SupportQuery[];
  oacApplications: OacApplication[];
  onApproveUser: (email: string) => void;
  onRejectUser: (email: string) => void;
  onCreateUser: (newUser: User) => Promise<{ success: boolean; message: string }>;
  onUpdateReleaseStatus: (releaseId: string, status: TrackStatus, feedback?: string) => void;
  onReplySupportQuery: (queryId: string, replyText: string) => void;
  onUpdateOacStatus: (oacId: string, status: 'Approved' | 'Rejected') => void;
  onPostRevenue: (email: string, month: string, amount: number, releaseName: string, currency: 'USD' | 'INR') => void;
  onImpersonateUser: (user: User) => void;
  notifications: Notification[];
  onPushNotification: (notif: Notification) => void;
  onDeleteNotification: (id: string) => void;
  onDownloadFile: (path: string) => void;
  onUpdateArtist: (id: string, updates: Partial<ArtistProfile>) => void;
  onUpdateUser: (email: string, updates: Partial<User>) => void;
}

function LegalLineManager({ 
  initialLines, 
  title, 
  onSave 
}: { 
  initialLines: string[], 
  title: string, 
  onSave: (lines: string[]) => void 
}) {
  const [lines, setLines] = useState<string[]>(initialLines || []);
  const [newLine, setNewLine] = useState('');

  const handleAdd = () => {
    if (newLine.trim()) {
      setLines([...lines, newLine.trim()]);
      setNewLine('');
    }
  };

  const handleRemove = (index: number) => {
    setLines(lines.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-1.5 flex-1 min-w-0">
      <div className="flex justify-between items-center pr-1">
        <span className="text-[9px] text-gray-500 block pl-1 uppercase font-black tracking-tight">{title}</span>
      </div>
      <div className="space-y-1 max-h-[60px] overflow-y-auto mb-1 scrollbar-hide pr-1">
        {lines.length === 0 && <span className="text-[8px] text-gray-700 italic pl-1">No custom lines added</span>}
        {lines.map((line, i) => (
          <div key={i} className="flex items-center gap-1.5 bg-black/60 border border-[#1F1F1F] rounded-md px-2 py-1 group">
            <span className="flex-1 text-[10px] text-gray-300 truncate leading-none">{line}</span>
            <button 
              onClick={() => handleRemove(i)}
              className="text-gray-600 hover:text-red-500 transition-colors cursor-pointer shrink-0"
              title="Remove"
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-1.5 pt-0.5">
        <input 
          type="text"
          value={newLine}
          onChange={(e) => setNewLine(e.target.value)}
          placeholder="Type new line..."
          className="flex-1 bg-black border border-[#1F1F1F] rounded-md px-2.5 py-1.5 text-[10px] text-gray-200 focus:outline-none focus:border-[#1DB954]/60 transition-all font-medium"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAdd();
            }
          }}
        />
        <button 
          onClick={handleAdd}
          className="p-1.5 bg-[#1DB954] text-black hover:bg-[#1ed760] rounded-md transition-all cursor-pointer flex items-center justify-center shrink-0 shadow-sm"
          title="Add to list"
        >
          <Plus size={14} strokeWidth={3} />
        </button>
        <button 
          onClick={() => onSave(lines)}
          className="p-1.5 bg-white text-black hover:bg-gray-200 rounded-md transition-all cursor-pointer flex items-center justify-center shrink-0 shadow-sm"
          title="Save all changes"
        >
          <Save size={14} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}

export default function AdminPanel({
  currentUser,
  users,
  releases,
  artists,
  supportQueries,
  oacApplications,
  onApproveUser,
  onRejectUser,
  onCreateUser,
  onUpdateReleaseStatus,
  onReplySupportQuery,
  onUpdateOacStatus,
  onPostRevenue,
  onImpersonateUser,
  notifications,
  onPushNotification,
  onDeleteNotification,
  onDownloadFile,
  onUpdateArtist,
  onUpdateUser
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'releases' | 'queries' | 'oac' | 'revenue' | 'notifications' | 'artists' | 'legal'>('users');
  const [inspectRelease, setInspectRelease] = useState<Release | null>(null);

  // New User Provisioning States
  const [createArtistName, setCreateArtistName] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createPlan, setCreatePlan] = useState<Plan>('Basic');
  const [createSuccess, setCreateSuccess] = useState('');
  const [createError, setCreateError] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  // Local form states for Posting Revenue
  const [revEmail, setRevEmail] = useState('');
  const [revMonth, setRevMonth] = useState('June 2026');
  const [revAmount, setRevAmount] = useState('');
  const [revRelease, setRevRelease] = useState('');
  const [revCurrency, setRevCurrency] = useState<'USD' | 'INR'>('INR');
  const [revSuccess, setRevSuccess] = useState('');

  // Local form states for Pushing Notifications
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifTargetType, setNotifTargetType] = useState<'Everyone' | 'Plan' | 'Artist'>('Everyone');
  const [notifTargetValue, setNotifTargetValue] = useState('');
  const [notifSeverity, setNotifSeverity] = useState<Notification['severity']>('Info');
  const [notifSuccess, setNotifSuccess] = useState('');

  // Local reply state for queries
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});
  const [releaseFeedbackMap, setReleaseFeedbackMap] = useState<Record<string, string>>({});

  const handleCopy = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    // Using a quick alert for confirmation as seen in other components
    // A custom toast would be better but this is consistent with current app behavior
    // alert(`${label} copied!`); 
    // Actually, maybe just a silent copy is better if it happens a lot? 
    // No, feedback is good.
    console.log(`${label} copied to clipboard`);
  };

  const pendingUsers = users.filter(u => !u.isApproved && u.email !== 'admin@g.g');
  const activeUsers = users.filter(u => u.isApproved && u.email !== 'admin@g.g');
  
  const submittedReleases = releases.filter(r => r.status === 'Submitted');
  const approvedReleases = releases.filter(r => r.status === 'Approved');
  const processedReleases = releases.filter(r => r.status === 'Live' || r.status === 'Rejected');

  const pendingQueries = supportQueries.filter(q => q.status === 'Pending');
  const pendingOacs = oacApplications.filter(app => app.status === 'Pending');

  const handleRevenueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRevSuccess('');

    if (!revEmail || !revMonth || !revAmount || !revRelease) {
      alert('Metadata Verification: All revenue ledger entries are mandatory.');
      return;
    }

    const numericAmount = parseFloat(revAmount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      alert('Entry Violation: Total payout amount must be a genuine numeric value.');
      return;
    }

    onPostRevenue(revEmail, revMonth, numericAmount, revRelease, revCurrency);
    setRevAmount('');
    const symbol = revCurrency === 'INR' ? '₹' : '$';
    setRevSuccess(`Ledger Updated: Successfully compiled royalty of ${symbol}${numericAmount.toFixed(2)} to ${revEmail} for ${revRelease}.`);
  };

  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateSuccess('');
    setCreateError('');

    if (!createArtistName || !createEmail || !createPassword) {
      setCreateError('Please fill in Artist Name, Email, and Password.');
      return;
    }

    if (createPassword.length < 6) {
      setCreateError('Password must be at least 6 characters long.');
      return;
    }

    setCreateLoading(true);

    const newUser: User = {
      artistName: createArtistName,
      email: createEmail.toLowerCase(),
      password: createPassword,
      plan: createPlan,
      isApproved: true, // Admin-created accounts are auto-approved
      registeredAt: new Date().toISOString(),
    };

    try {
      const res = await onCreateUser(newUser);
      if (res.success) {
        setCreateSuccess(res.message);
        setCreateArtistName('');
        setCreateEmail('');
        setCreatePassword('');
        setCreatePlan('Basic');
      } else {
        setCreateError(res.message);
      }
    } catch (err: any) {
      setCreateError(err.message || 'Verification Error during user registration.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handlePushNotificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNotifSuccess('');

    if (!notifTitle.trim() || !notifMessage.trim()) {
      alert('Validation Error: A notification must include both a Title and a Message.');
      return;
    }

    const tValue = notifTargetType === 'Everyone' ? undefined : notifTargetValue;
    if (notifTargetType !== 'Everyone' && !tValue) {
      alert('Validation Error: Please configure a Target Value for ' + notifTargetType);
      return;
    }

    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      title: notifTitle.trim(),
      message: notifMessage.trim(),
      targetType: notifTargetType,
      targetValue: tValue,
      severity: notifSeverity,
      createdAt: new Date().toISOString(),
    };

    onPushNotification(newNotif);

    // Reset text fields
    setNotifTitle('');
    setNotifMessage('');
    setNotifSuccess(`Broadcast PUSH Engaged: "${newNotif.title}" successfully dispatched to ${notifTargetType}${tValue ? ' [' + tValue + ']' : ''}.`);
  };

  const currentArtistReleases = releases.filter(r => r.email === revEmail);

  const renderReleaseCard = (rel: Release, isApprovedStage: boolean) => {
    return (
      <div key={rel.id} className={`p-5 bg-black rounded-xl border ${isApprovedStage ? 'border-blue-500/20 border-l-4 border-l-blue-500' : 'border-[#1F1F1F] border-l-4 border-l-amber-500'} space-y-4`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1F1F1F]">
          <div className="flex items-center gap-3">
            <img 
              src={rel.coverArtSignedUrl || rel.coverArtUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=200&auto=format&fit=crop'} 
              alt="" 
              className="w-16 h-16 rounded object-cover border border-[#1F1F1F]"
              referrerPolicy="no-referrer"
            />
            <div>
              <span className="text-xs bg-indigo-900/30 text-indigo-400 font-bold px-1.5 py-0.5 rounded mr-2 uppercase tracking-wide">{rel.type}</span>
              <span className="text-[10px] text-gray-500">Submitted: {new Date(rel.submittedAt).toLocaleString()}</span>
              {isApprovedStage && (
                <span className="ml-2 text-[9px] bg-blue-950 text-blue-400 border border-blue-500/20 font-black px-1.5 py-0.5 rounded uppercase tracking-wider">Pre-Approved</span>
              )}
              <div className="flex items-center gap-2">
                <h4 className="text-base font-black text-white mt-1 uppercase tracking-tight">{rel.albumName}</h4>
                <button 
                  onClick={() => handleCopy(rel.albumName, 'Album Name')}
                  className="p-1 hover:text-[#1DB954] text-gray-500 transition cursor-pointer"
                  title="Copy Album Name"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
              <p className="text-xs text-gray-400">
                Main Artist: <span className="text-white font-semibold">{rel.mainArtistName}</span>
                <button 
                  onClick={() => handleCopy(rel.mainArtistName, 'Artist Name')}
                  className="inline-block ml-1 p-0.5 hover:text-[#1DB954] text-gray-500 transition cursor-pointer"
                  title="Copy Artist Name"
                >
                  <Copy className="w-2.5 h-2.5" />
                </button>
                {rel.featureArtists && rel.featureArtists.length > 0 && ` | Featuring: ${rel.featureArtists.join(', ')}`}
                {rel.otherArtists && rel.otherArtists.length > 0 && ` | Other: ${rel.otherArtists.join(', ')}`}
                {' | '}genre: {rel.genre || 'Electronic'} ({rel.subGenre})
              </p>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => rel.coverArtUrl && onDownloadFile(rel.coverArtUrl)}
                  className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-[10px] text-blue-400 border border-blue-900/40 rounded flex items-center gap-1.5 cursor-pointer transition"
                >
                  <PlusCircle className="w-3 h-3" /> Download Cover PNG
                </button>
              </div>
            </div>
          </div>

          <div className="text-right text-[11px] text-gray-400 font-mono space-y-1">
            <div>Format: {rel.contentType} Compliance</div>
            <div>Release Date: {rel.releaseDate}</div>
            {rel.labelName && <div className="text-amber-400 font-bold">Imprint: {rel.labelName}</div>}
          </div>
        </div>

        {/* Tracks table */}
        <div className="bg-[#0A0A0A] p-3 rounded-lg border border-[#1F1F1F]">
          <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block mb-1">Supplied Audio Metadata Assets ({rel.tracks.length})</span>
          <table className="w-full text-left text-[11px] text-gray-300">
            <thead>
              <tr className="border-b border-[#1F1F1F] text-gray-500">
                <th className="py-1"># Title</th>
                <th className="py-1">Producer / Composer</th>
                <th className="py-1">ISRC</th>
                <th className="py-1 text-center">Explicit</th>
                <th className="py-1">Attached WAV</th>
              </tr>
            </thead>
            <tbody>
              {rel.tracks.map((track, i) => (
                <tr key={track.id} className="border-b border-[#1F1F1F]/60">
                  <td className="py-2.5 font-bold text-gray-200">
                    <div className="flex items-center gap-1.5">
                      {i+1}. {track.trackName}
                      <button 
                        onClick={() => handleCopy(track.trackName, 'Track Name')}
                        className="p-0.5 hover:text-[#1DB954] text-gray-500 transition cursor-pointer"
                      >
                        <Copy className="w-2.5 h-2.5" />
                      </button>
                    </div>
                    <div className="text-[10px] text-gray-400 font-normal mt-0.5">
                      By: <span className="text-gray-300 font-semibold">{track.mainArtistName}</span>
                      {track.featureArtists && track.featureArtists.length > 0 && ` (feat. ${track.featureArtists.join(', ')})`}
                      {track.otherArtists && track.otherArtists.length > 0 && ` (other. ${track.otherArtists.join(', ')})`}
                    </div>
                  </td>
                  <td className="py-2.5 text-gray-400">
                    {track.producer || 'N/A'} / {track.composer || 'N/A'}
                  </td>
                  <td className="py-2.5 font-mono text-gray-400">
                    <div className="flex items-center gap-1.5">
                      {track.isrc || '-- Auto Generate --'}
                      {track.isrc && (
                        <button 
                          onClick={() => handleCopy(track.isrc!, 'ISRC')}
                          className="p-0.5 hover:text-[#1DB954] text-gray-500 transition cursor-pointer"
                        >
                          <Copy className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 text-center">
                    {(track.explicitContent || (track as any).explicit_content) ? (
                      <span className="px-2 py-0.5 text-[9px] bg-red-950 text-red-500 border border-red-500/20 font-bold rounded">⚠️ YES</span>
                    ) : (
                      <span className="px-2 py-0.5 text-[9px] bg-emerald-950 text-emerald-400 border border-[#10b981]/25 font-bold rounded">✓ NO</span>
                    )}
                  </td>
                  <td className="py-2.5 text-[10px] text-blue-400 underline truncate max-w-[120px]">
                    {track.audioFileName || 'Master_v1.wav'}
                  </td>
                  <td className="py-2.5 px-2">
                    {track.audioFileName && (
                      <button
                        onClick={() => onDownloadFile(track.audioFileName!)}
                        className="p-1 px-2 bg-blue-950/20 hover:bg-blue-900/30 text-[9px] text-blue-400 border border-blue-500/20 rounded font-bold cursor-pointer transition uppercase"
                      >
                        Get WAV
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Special instructions */}
        {(rel.specialRequest || (rel as any).special_request || (rel as any).special_instructions) && (
          <div className="p-3 bg-[#17171e] rounded border border-blue-900/20 text-xs">
            <span className="text-indigo-400 font-bold uppercase text-[9px] block tracking-wide">Artist Editorial Note (Special Pitching Request):</span>
            <p className="text-gray-300 italic mt-0.5">"{(rel.specialRequest || (rel as any).special_request || (rel as any).special_instructions)}"</p>
          </div>
        )}

        {/* Direct reviewer comment and actions */}
        <div className="space-y-3 pt-2 text-left">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Ingestion Notes / Review Feedback Comment (Required if rejecting)</label>
            <input
              type="text"
              placeholder="e.g. Artwork exceeds 3000px and matches digital store rules. Release approved."
              className="w-full bg-[#0A0A0A] border border-[#1F1F1F] rounded p-2 text-xs text-white outline-none focus:border-[#1DB954]"
              value={releaseFeedbackMap[rel.id] || ''}
              onChange={(e) => {
                const v = e.target.value;
                setReleaseFeedbackMap(prev => ({ ...prev, [rel.id]: v }));
              }}
            />
          </div>

          <div className="flex gap-2 justify-end flex-wrap">
            <button
              type="button"
              onClick={() => setInspectRelease(rel)}
              className="mr-auto px-4 py-2 bg-[#121212] hover:bg-[#1E1E1E] text-gray-300 hover:text-[#1DB954] border border-[#2A2A2A] hover:border-[#1DB954]/30 font-bold rounded-lg text-xs uppercase tracking-tight flex items-center gap-1.5 cursor-pointer transition"
              id={`btn_inspect_release_card_${rel.id}`}
              title="Inspect Complete Metadata & Asset Details"
            >
              <Eye className="w-4 h-4" /> Inspect All Details
            </button>

            <button
              onClick={() => onUpdateReleaseStatus(rel.id, 'Live', releaseFeedbackMap[rel.id])}
              className="px-4 py-2 bg-[#1DB954] text-black hover:bg-emerald-400 font-bold rounded-lg text-xs uppercase tracking-tight flex items-center gap-1.5 cursor-pointer transition animate-pulse"
              id={`btn_approve_release_live_${rel.id}`}
            >
              <UserCheck className="w-4 h-4" /> Ship Live to DSPs
            </button>
            
            {!isApprovedStage && (
              <button
                onClick={() => onUpdateReleaseStatus(rel.id, 'Approved', releaseFeedbackMap[rel.id])}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs uppercase tracking-tight flex items-center gap-1.5 cursor-pointer transition"
                id={`btn_approve_release_app_${rel.id}`}
              >
                <Check className="w-4 h-4" /> Pre-Approve Metadata
              </button>
            )}

            <button
              onClick={() => {
                if (!releaseFeedbackMap[rel.id]) {
                  alert('Review Rule: Rejecting releases require audit comments detailing compliance issues to help the artist correct them.');
                  return;
                }
                onUpdateReleaseStatus(rel.id, 'Rejected', releaseFeedbackMap[rel.id]);
              }}
              className="px-4 py-2 bg-red-950 hover:bg-red-900 text-red-400 rounded-lg text-xs uppercase tracking-tight flex items-center gap-1.5 cursor-pointer transition"
              id={`btn_reject_release_${rel.id}`}
            >
              <X className="w-4 h-4" /> Issue Rejection Notice
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6" id="admin_panel_root">
      {/* Header Info */}
      <div className="p-6 bg-[#121212] rounded-2xl border border-[#1F1F1F] flex flex-col md:flex-row md:items-center justify-between gap-4" id="admin_header_card">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-[#1DB954]" />
            <h2 className="text-xl font-black text-white uppercase tracking-tighter">System Administration Suite</h2>
          </div>
          <p className="text-xs text-gray-400 max-w-xl">
            Authorize new members, review submitted WAV files/artwork metadata, verify Spotify/YouTube OAC credentials, and sign official royalty balance accounts.
          </p>
        </div>
        <div className="px-3 py-1 bg-[#1DB954]/10 border border-[#1DB954]/20 rounded-full text-xs text-[#1DB954] font-bold">
          Role: Master Admin
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex flex-wrap gap-2 p-1 bg-[#0A0A0A] border border-[#1F1F1F] rounded-xl overflow-x-auto" id="admin_tabs_row">
        {[
          { id: 'users', label: 'Member Access Requests', count: pendingUsers.length, icon: Users },
          { id: 'releases', label: 'Release Ingestion Queue', count: submittedReleases.length + approvedReleases.length, icon: Disc },
          { id: 'queries', label: 'Support Helpdesk', count: pendingQueries.length, icon: HelpCircle },
          { id: 'oac', label: 'OAC Verifications', count: pendingOacs.length, icon: Award },
          { id: 'revenue', label: 'Post Royalty Ledgers', count: 0, icon: DollarSign },
          { id: 'notifications', label: 'Broadcast Notifications', count: 0, icon: Bell },
          { id: 'legal', label: 'Authorized Tags Control', count: 0, icon: FileText },
          { id: 'artists', label: 'Managed Artists DB', count: artists.length, icon: Layers }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-4 text-xs font-bold tracking-tight uppercase flex items-center gap-2 rounded-lg cursor-pointer transition ${
                isActive 
                  ? 'bg-[#1DB954] text-black shadow' 
                  : 'text-gray-400 hover:text-white hover:bg-[#121212]'
              }`}
              id={`admin_tab_trigger_${tab.id}`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${isActive ? 'bg-black text-[#1DB954]' : 'bg-[#1DB954]/20 text-[#1DB954]'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Render selected active tab */}
      <div className="space-y-6" id="admin_tab_content">
        
        {/* MEMBERS APPROVAL TAB */}
        {activeTab === 'users' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6" id="admin_members_section">
            {/* Column 1 of 3: Create / Provision Artist Account */}
            <div className="md:col-span-4 bg-[#121212] p-6 rounded-2xl border border-[#1F1F1F] space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#1DB954]">Provision Artist</h3>
              <p className="text-[11px] text-gray-400">Directly generate, configure, and approve a secure artist account.</p>

              <form onSubmit={handleCreateUserSubmit} className="space-y-4 pt-2 text-left">
                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest">Artist / Band Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Lunar Melody"
                    className="w-full bg-black border border-[#1F1F1F] rounded p-2.5 text-xs text-white outline-none focus:border-[#1DB954]"
                    value={createArtistName}
                    onChange={(e) => setCreateArtistName(e.target.value)}
                    id="admin_create_user_name"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest">Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. artist@wavora.live"
                    className="w-full bg-black border border-[#1F1F1F] rounded p-2.5 text-xs text-white outline-none focus:border-[#1DB954]"
                    value={createEmail}
                    onChange={(e) => setCreateEmail(e.target.value)}
                    id="admin_create_user_email"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest">Password</label>
                  <input
                    type="password"
                    placeholder="e.g. securePass123"
                    className="w-full bg-black border border-[#1F1F1F] rounded p-2.5 text-xs text-white outline-none focus:border-[#1DB954]"
                    value={createPassword}
                    onChange={(e) => setCreatePassword(e.target.value)}
                    id="admin_create_user_password"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest">Distribution tier</label>
                  <select
                    className="w-full bg-black border border-[#1F1F1F] rounded p-2.5 text-xs text-white outline-none focus:border-[#1DB954]"
                    value={createPlan}
                    onChange={(e) => setCreatePlan(e.target.value as Plan)}
                    id="admin_create_user_plan"
                  >
                    <option value="Basic">Basic Tier</option>
                    <option value="Pro">Pro Tier</option>
                    <option value="Elite">Elite Tier</option>
                  </select>
                </div>

                {createError && (
                  <div className="p-2 text-[10px] text-red-400 bg-red-950/20 border border-red-500/20 rounded font-mono" id="admin_create_user_err">
                    ⚠ {createError}
                  </div>
                )}

                {createSuccess && (
                  <div className="p-2 text-[10px] text-emerald-400 bg-emerald-900/20 border border-emerald-500/20 rounded font-mono" id="admin_create_user_succ">
                    ✓ {createSuccess}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={createLoading}
                  className="w-full py-2.5 px-4 bg-[#1DB954] hover:bg-[#1ed760] disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-black font-black rounded text-[11px] uppercase tracking-wide cursor-pointer transition duration-150 flex items-center justify-center gap-2"
                  id="admin_btn_create_user"
                >
                  {createLoading ? (
                    <span className="flex items-center gap-1">
                      <svg className="animate-spin h-3.5 w-3.5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Provisioning on Supabase...
                    </span>
                  ) : (
                    "Create & Approve User"
                  )}
                </button>
              </form>
            </div>

            {/* Column 2 of 3: Pending approvals */}
            <div className="md:col-span-4 bg-[#121212] p-6 rounded-2xl border border-[#1F1F1F] space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-amber-500">Pending Approvals ({pendingUsers.length})</h3>
              
              {pendingUsers.length === 0 ? (
                <p className="text-xs text-gray-500 py-8 text-center bg-black/40 rounded-lg">No pending external registrations.</p>
              ) : (
                <div className="space-y-3">
                  {pendingUsers.map((user, idx) => (
                    <div key={`${user.email}-p-${idx}`} className="p-4 bg-black rounded-xl border border-[#1F1F1F] flex flex-col justify-between gap-3 text-xs text-left">
                      <div>
                        <div className="font-bold text-white text-sm">{user.artistName}</div>
                        <div className="text-gray-400 font-mono text-[11px] mt-0.5 truncate">{user.email}</div>
                        <div className="text-gray-500 mt-2 flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded bg-blue-900/20 text-blue-400 font-bold text-[9px] uppercase">{user.plan}</span>
                          <span>Reg: {new Date(user.registeredAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => onApproveUser(user.email)}
                          className="flex-1 py-1.5 bg-[#1DB954] text-black hover:bg-emerald-400 font-bold rounded-lg flex items-center justify-center gap-1 cursor-pointer transition text-[11px]"
                          id={`btn_approve_user_${user.email}`}
                        >
                          <Check className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => onRejectUser(user.email)}
                          className="flex-1 py-1.5 bg-red-955 text-red-400 border border-red-500/20 hover:bg-red-900 hover:text-white font-bold rounded-lg flex items-center justify-center gap-1 cursor-pointer transition text-[11px]"
                        >
                          <X className="w-3.5 h-3.5" /> Deny
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Column 3 of 3: Active Members listing with Impersonate */}
            <div className="md:col-span-4 bg-[#121212] p-6 rounded-2xl border border-[#1F1F1F] space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Active Members Pool ({activeUsers.length})</h3>
              
              <div className="max-h-[400px] overflow-y-auto space-y-2 pr-1">
                {activeUsers.map((user, idx) => (
                  <div key={`${user.email}-a-${idx}`} className="p-3 bg-black rounded-lg border border-[#1F1F1F] flex flex-col gap-2 text-xs text-left">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1 pr-2">
                        <span className="font-bold text-gray-200 block truncate">{user.artistName}</span>
                        <span className="text-[10px] text-gray-500 block truncate">{user.email}</span>
                        <span className="text-[9px] bg-slate-850 border border-slate-800 text-slate-300 font-semibold px-1 rounded inline-block mt-1">{user.plan} Tier</span>
                      </div>
                      <button
                        onClick={() => onImpersonateUser(user)}
                        className="px-2.5 py-1 bg-white hover:bg-gray-100 text-black font-bold rounded text-[10px] uppercase tracking-tight cursor-pointer transition flex-shrink-0"
                        id={`btn_impersonate_${user.email}`}
                      >
                        Impersonate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* INGESTION QUEUE TAB */}
        {activeTab === 'releases' && (
          <div className="space-y-6" id="admin_releases_section">
            
            {/* Stage 1: Awaiting Metadata Audit */}
            <div className="bg-[#121212] p-6 rounded-2xl border border-[#1F1F1F]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-2 border-b border-[#1F1F1F] text-left">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-amber-500 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse inline-block" />
                    Stage 1: Awaiting Metadata Audit ({submittedReleases.length})
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">Newly submitted tracks that require comprehensive metadata verify and metadata pre-approval.</p>
                </div>
              </div>

              {submittedReleases.length === 0 ? (
                <p className="text-xs text-gray-500 py-8 text-center bg-black/40 rounded-lg">No pending submissions awaiting Stage 1 metadata audit.</p>
              ) : (
                <div className="space-y-4">
                  {submittedReleases.map(rel => renderReleaseCard(rel, false))}
                </div>
              )}
            </div>

            {/* Stage 2: Pre-Approved Ingestions */}
            <div className="bg-[#121212] p-6 rounded-2xl border border-[#1F1F1F]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-2 border-b border-[#1F1F1F] text-left">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-blue-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse inline-block" />
                    Stage 2: Pre-Approved Ingestions ({approvedReleases.length})
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">Metadata pre-approved entries. Turn Live to push to Spotify/Apple Music, or Issue Rejection if corrections are needed.</p>
                </div>
              </div>

              {approvedReleases.length === 0 ? (
                <p className="text-xs text-gray-500 py-8 text-center bg-black/40 rounded-lg">No pre-approved releases awaiting active delivery.</p>
              ) : (
                <div className="space-y-4">
                  {approvedReleases.map(rel => renderReleaseCard(rel, true))}
                </div>
              )}
            </div>

            {/* Historical Audit Trail */}
            <div className="bg-[#121212] p-6 rounded-2xl border border-[#1F1F1F]">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Ingestion Audit Log Archive ({processedReleases.length})</h3>
              
              <div className="space-y-3">
                {processedReleases.map(rel => (
                  <div key={rel.id} className="p-3 bg-black rounded-xl border border-[#1F1F1F] flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-white mb-0.5 block truncate max-w-[200px]">{rel.albumName} - {rel.mainArtistName}</span>
                      <span className="text-[10px] text-gray-500">Shipped: {new Date(rel.submittedAt).toLocaleDateString()}</span>
                      {rel.feedback && <p className="text-[10px] text-[#1DB954] mt-1 bg-[#1DB954]/5 p-1 rounded font-mono">Feedback: "{rel.feedback}"</p>}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                        rel.status === 'Live' ? 'bg-emerald-900/20 text-[#1DB954] border border-[#1DB954]/20' :
                        rel.status === 'Approved' ? 'bg-blue-900/20 text-blue-400 border border-blue-500/20' :
                        'bg-red-950 text-red-400 border border-red-500/10'
                      }`}>
                        {rel.status}
                      </span>
                      <button
                        onClick={() => setInspectRelease(rel)}
                        className="p-1 px-2 bg-[#121212] hover:bg-[#1E1E1E] hover:text-[#1DB954] text-gray-400 border border-[#2A2A2A] rounded text-[10px] font-bold cursor-pointer transition flex items-center gap-1"
                        id={`btn_inspect_audit_${rel.id}`}
                      >
                        <Eye className="w-3 h-3" /> Inspect Track
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* AUTHORIZED TAGS CONTROL TAB */}
        {activeTab === 'legal' && (
          <div className="bg-[#121212] p-6 rounded-2xl border border-[#1F1F1F] space-y-6" id="admin_legal_section">
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#1F1F1F]">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#1DB954] flex items-center gap-2">
                   <FileText size={18} /> Authorized Legal Tags Management
                </h3>
                <p className="text-[11px] text-gray-400 mt-1">Assign custom C Line and P Line overrides to specific dashboards. These will be the ONLY options available to the user in the wizard.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {activeUsers.length === 0 ? (
                <div className="lg:col-span-2 py-12 text-center bg-black/40 border border-dashed border-[#1F1F1F] rounded-xl">
                  <span className="text-xs text-gray-500">No active dashboards found to manage.</span>
                </div>
              ) : (
                activeUsers.map((user, idx) => (
                  <div key={`legal-user-${user.email}-${idx}`} className="p-5 bg-black rounded-xl border border-[#1F1F1F] hover:border-[#1DB954]/20 transition-all flex flex-col gap-4 shadow-2xl">
                    <div className="flex items-center justify-between pb-3 border-b border-[#1F1F1F]/40">
                      <div className="min-w-0">
                        <span className="font-black text-gray-100 block text-sm tracking-tight truncate">{user.artistName}</span>
                        <span className="text-[10px] text-gray-500 block font-mono truncate">{user.email}</span>
                      </div>
                      <div className="px-2 py-1 bg-[#1DB954]/10 border border-[#1DB954]/20 rounded text-[9px] text-[#1DB954] font-black uppercase">
                        {user.plan}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <LegalLineManager 
                        title="Authorized C Lines (©)"
                        initialLines={user.allowedCLines || []}
                        onSave={(newLines) => {
                          onUpdateUser(user.email, { allowedCLines: newLines });
                        }}
                      />
                      <LegalLineManager 
                        title="Authorized P Lines (℗)"
                        initialLines={user.allowedPLines || []}
                        onSave={(newLines) => {
                          onUpdateUser(user.email, { allowedPLines: newLines });
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'queries' && (
          <div className="bg-[#121212] p-6 rounded-2xl border border-[#1F1F1F] space-y-4" id="admin_queries_section">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#1DB954]">Active Support Inquiries ({pendingQueries.length})</h3>

            {pendingQueries.length === 0 ? (
              <p className="text-xs text-gray-500 py-10 text-center bg-black/40 rounded-lg">No active support desks waiting for response. Superb!</p>
            ) : (
              <div className="space-y-4">
                {pendingQueries.map(q => (
                  <div key={q.id} className="p-4 bg-black rounded-xl border border-[#1F1F1F] space-y-3 text-xs">
                    <div className="flex justify-between border-b border-[#1F1F1F] pb-2">
                      <div>
                        <span className="font-bold text-gray-200 block text-sm">{q.artistName}</span>
                        <span className="text-[10px] text-gray-500 tracking-wider font-mono">{q.email}</span>
                      </div>
                      <span className="text-[10px] text-gray-400">{new Date(q.submittedAt).toLocaleString()}</span>
                    </div>

                    <p className="text-gray-300 italic p-3 bg-[#121212] rounded border border-[#1F1F1F]">
                      "{q.queryText}"
                    </p>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">Write Admin Guidance Reply</label>
                      <textarea
                        rows={2}
                        placeholder="e.g. Hi there! Royalties are securely processed on the 10th of each month. Your account is on schedule."
                        className="w-full bg-[#0A0A0A] border border-[#1F1F1F] rounded p-2 text-xs text-white outline-none focus:border-[#1DB954] resize-none"
                        value={replyTextMap[q.id] || ''}
                        onChange={(e) => {
                          const v = e.target.value;
                          setReplyTextMap(prev => ({ ...prev, [q.id]: v }));
                        }}
                      />
                      <button
                        onClick={() => {
                          if (!replyTextMap[q.id]?.trim()) return;
                          onReplySupportQuery(q.id, replyTextMap[q.id].trim());
                        }}
                        className="px-3.5 py-1.5 bg-[#1DB954] text-black hover:bg-emerald-400 font-bold rounded text-xs uppercase tracking-tight flex items-center gap-1 cursor-pointer transition"
                        id={`btn_reply_query_${q.id}`}
                      >
                        <Send className="w-3.5 h-3.5" /> Dispatch Reply to Member Portal
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* OFFICIAL ARTIST CHANNEL VERIFICATIONS */}
        {activeTab === 'oac' && (
          <div className="bg-[#121212] p-6 rounded-2xl border border-[#1F1F1F] space-y-4" id="admin_oac_section">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#1DB954]">Official Artist Channel (OAC) Requests ({pendingOacs.length})</h3>

            {pendingOacs.length === 0 ? (
              <p className="text-xs text-gray-500 py-10 text-center bg-black/40 rounded-lg">No OAC requests are pending. Everyone is fully verified.</p>
            ) : (
              <div className="space-y-4">
                {pendingOacs.map(app => (
                  <div key={app.id} className="p-4 bg-black rounded-xl border border-[#1F1F1F] space-y-3 text-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-sm text-white block">{app.artistName}</span>
                        <span className="text-[10px] text-gray-500 font-mono tracking-wider block">Legal Name: {app.fullName} ({app.email})</span>
                      </div>
                      <span className="text-[10px] text-gray-400">Req: {new Date(app.submittedAt).toLocaleDateString()}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 p-3 bg-[#121212] rounded border border-[#1F1F1F]">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-gray-500 block tracking-wider mb-0.5">Spotify URL Profile</span>
                        <a href={app.spotifyLink} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline truncate block text-[11px] font-mono">{app.spotifyLink}</a>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-bold text-gray-500 block tracking-wider mb-0.5">YouTube Channel URL</span>
                        <a href={app.youtubeLink} target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline truncate block text-[11px] font-mono">{app.youtubeLink}</a>
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => onUpdateOacStatus(app.id, 'Approved')}
                        className="px-3.5 py-1.5 bg-[#1DB954] text-black hover:bg-emerald-400 font-bold rounded text-xs uppercase tracking-tight flex items-center gap-1 cursor-pointer transition"
                        id={`btn_approve_oac_${app.id}`}
                      >
                        <Check className="w-3.5 h-3.5" /> Confirm OAC Verification
                      </button>
                      <button
                        onClick={() => onUpdateOacStatus(app.id, 'Rejected')}
                        className="px-3.5 py-1.5 bg-red-950 text-red-400 rounded text-xs uppercase tracking-tight flex items-center gap-1 cursor-pointer transition"
                      >
                        <X className="w-3.5 h-3.5" /> Deny Claim
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* POST REVENUE LEDGER TAB */}
        {activeTab === 'revenue' && (
          <div className="bg-[#121212] p-6 rounded-2xl border border-[#1F1F1F] space-y-4" id="admin_revenue_section">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#1DB954]">Post Royalties & Monthly Revenue Statements</h3>
            <p className="text-xs text-gray-400 max-w-lg">
              Populate active monthly royalty blocks that feed directly into artist wallets and statement dashboards. Keep the numeric figures clean.
            </p>

            {revSuccess && (
              <div className="p-3 bg-[#1DB954]/10 border border-[#1DB954]/20 rounded-lg text-xs text-[#1DB954] font-bold">
                 ✓ {revSuccess}
              </div>
            )}

            <form onSubmit={handleRevenueSubmit} className="space-y-4 max-w-xl" id="admin_revenue_form">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">Select Destination Artist</label>
                  <select
                    className="w-full bg-black border border-[#1F1F1F] rounded p-2.5 text-xs text-white outline-none focus:border-[#1DB954]"
                    value={revEmail}
                    onChange={(e) => {
                      setRevEmail(e.target.value);
                      setRevRelease('');
                    }}
                    id="admin_rev_artist_select"
                  >
                    <option value="">-- Choose Artist Profile --</option>
                    {activeUsers.map((user, idx) => (
                      <option key={`${user.email}-rev-${idx}`} value={user.email}>
                        {user.artistName} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">Statement Month / Year</label>
                  <select
                    className="w-full bg-black border border-[#1F1F1F] rounded p-2.5 text-xs text-white outline-none focus:border-[#1DB954]"
                    value={revMonth}
                    onChange={(e) => setRevMonth(e.target.value)}
                  >
                    <option value="June 2026">June 2026</option>
                    <option value="May 2026">May 2026</option>
                    <option value="April 2026">April 2026</option>
                    <option value="March 2026">March 2026</option>
                  </select>
                </div>
              </div>

              {revEmail && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">Select Release Metadata</label>
                    <select
                      className="w-full bg-black border border-[#1F1F1F] rounded p-2.5 text-xs text-white outline-none focus:border-[#1DB954]"
                      value={revRelease}
                      onChange={(e) => setRevRelease(e.target.value)}
                      id="admin_rev_release_select"
                    >
                      <option value="">-- Select Catalog Item --</option>
                      {currentArtistReleases.map(rel => (
                        <option key={rel.id} value={rel.albumName}>
                          {rel.albumName} [{rel.type}]
                        </option>
                      ))}
                      <option value="Legacy Backcatalog Single">Legacy Backcatalog Single</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">Currency Mode</label>
                    <div className="flex bg-black border border-[#1F1F1F] p-1 rounded" id="admin_rev_currency_selector">
                      <button
                        type="button"
                        onClick={() => setRevCurrency('INR')}
                        className={`flex-1 py-1 text-center text-[11px] font-bold rounded transition cursor-pointer ${
                          revCurrency === 'INR'
                            ? 'bg-[#1DB954] text-black'
                            : 'text-gray-400 hover:text-white'
                        }`}
                        id="btn_toggle_currency_inr"
                      >
                        Rupees (₹)
                      </button>
                      <button
                        type="button"
                        onClick={() => setRevCurrency('USD')}
                        className={`flex-1 py-1 text-center text-[11px] font-bold rounded transition cursor-pointer ${
                          revCurrency === 'USD'
                            ? 'bg-[#1DB954] text-black'
                            : 'text-gray-400 hover:text-white'
                        }`}
                        id="btn_toggle_currency_usd"
                      >
                        USD ($)
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      Allocation ({revCurrency === 'INR' ? '₹ INR' : '$ USD'})
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder={revCurrency === 'INR' ? 'e.g. 25000.00' : 'e.g. 520.45'}
                      className="w-full bg-black border border-[#1F1F1F] rounded p-2.5 text-xs text-white outline-none focus:border-[#1DB954]"
                      value={revAmount}
                      onChange={(e) => setRevAmount(e.target.value)}
                      id="admin_rev_amount_input"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={!revEmail}
                className={`w-full py-2.5 px-4 font-black rounded-lg text-xs uppercase tracking-tight flex items-center justify-center gap-1.5 transition ${
                  revEmail 
                    ? 'bg-[#1DB954] text-black hover:bg-emerald-400 cursor-pointer' 
                    : 'bg-[#121212] text-gray-500 border border-[#1F1F1F] cursor-not-allowed'
                }`}
                id="btn_admin_payout_submit"
              >
                <PlusCircle className="w-4 h-4" /> Append Balance To Statement ledger
              </button>
            </form>
          </div>
        )}

        {/* BROADCAST SYSTEM NOTIFICATIONS TAB */}
        {activeTab === 'notifications' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6" id="admin_notifications_workspace">
            {/* Column 1 of 2: Constructor Form */}
            <div className="md:col-span-5 bg-[#121212] p-6 rounded-2xl border border-[#1F1F1F] space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#1DB954] flex items-center gap-1.5">
                  <Bell className="w-4 h-4 animate-bounce" /> Broadcast Push Engine
                </h3>
                <p className="text-[11px] text-gray-400">
                  Target system announcements to specific user archetypes, plan tiers, or individual artists in real-time.
                </p>
              </div>

              {notifSuccess && (
                <div className="p-3 bg-[#1DB954]/10 border border-[#1DB954]/20 rounded-lg text-xs text-[#1DB954] font-bold">
                  ✓ {notifSuccess}
                </div>
              )}

              <form onSubmit={handlePushNotificationSubmit} className="space-y-3.5 text-left" id="admin_notif_form">
                {/* Severity Tier */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">Notice Severity Tier</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['Info', 'Success', 'Warning', 'Critical'] as const).map((sev) => (
                      <button
                        key={sev}
                        type="button"
                        onClick={() => setNotifSeverity(sev)}
                        className={`py-1.5 text-[10px] uppercase font-bold text-center rounded border transition ${
                          notifSeverity === sev
                            ? sev === 'Critical' ? 'bg-red-500 text-black border-red-500 font-black' :
                              sev === 'Warning' ? 'bg-amber-500 text-black border-amber-500 font-black' :
                              sev === 'Success' ? 'bg-emerald-500 text-black border-emerald-500 font-black' :
                              'bg-[#1DB954] text-black border-[#1DB954] font-black'
                            : 'bg-black text-gray-405 border-[#1F1F1F] hover:border-gray-700'
                        }`}
                      >
                        {sev}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Target Audience */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">Target Audience</label>
                  <select
                    className="w-full bg-black border border-[#1F1F1F] rounded p-2 text-xs text-white outline-none focus:border-[#1DB954]"
                    value={notifTargetType}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      setNotifTargetType(val);
                      setNotifTargetValue('');
                    }}
                    id="admin_notif_target_type"
                  >
                    <option value="Everyone">Everyone / All Members</option>
                    <option value="Plan">Subscription Plan Tier</option>
                    <option value="Artist">Specific Regulated Artist</option>
                  </select>
                </div>

                {/* Conditional Targets */}
                {notifTargetType === 'Plan' && (
                  <div className="space-y-1 animate-fade-in">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">Target subscription plan</label>
                    <select
                      className="w-full bg-black border border-[#1F1F1F] rounded p-2 text-xs text-white outline-none focus:border-[#1DB954]"
                      value={notifTargetValue}
                      onChange={(e) => setNotifTargetValue(e.target.value)}
                      id="admin_notif_target_plan"
                      required
                    >
                      <option value="">-- Choose Plan --</option>
                      <option value="Basic">Basic Tier</option>
                      <option value="Pro">Pro Premium Tier</option>
                      <option value="Elite">Elite Custom Tier</option>
                    </select>
                  </div>
                )}

                {notifTargetType === 'Artist' && (
                  <div className="space-y-1 animate-fade-in">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">Target Artist email</label>
                    <select
                      className="w-full bg-black border border-[#1F1F1F] rounded p-2 text-xs text-white outline-none focus:border-[#1DB954]"
                      value={notifTargetValue}
                      onChange={(e) => setNotifTargetValue(e.target.value)}
                      id="admin_notif_target_artist"
                      required
                    >
                      <option value="">-- Choose Member Profile --</option>
                      {activeUsers.map((user, idx) => (
                        <option key={`${user.email}-notif-${idx}`} value={user.email}>
                          {user.artistName} ({user.email})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Announcement Title */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">Announcement Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Critical Pipeline Outage resolved"
                    className="w-full bg-black border border-[#1F1F1F] rounded p-2.5 text-xs text-white outline-none focus:border-[#1DB954]"
                    value={notifTitle}
                    onChange={(e) => setNotifTitle(e.target.value)}
                    id="admin_notif_title_input"
                    maxLength={60}
                    required
                  />
                </div>

                {/* Announcement Message */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">Announcement Description / Body</label>
                  <textarea
                    rows={4}
                    placeholder="Provide explanatory description details, links or direct instructions here..."
                    className="w-full bg-black border border-[#1F1F1F] rounded p-2.5 text-xs text-white outline-none focus:border-[#1DB954] resize-none"
                    value={notifMessage}
                    onChange={(e) => setNotifMessage(e.target.value)}
                    id="admin_notif_message_input"
                    maxLength={350}
                    required
                  />
                  <div className="text-right text-[9px] text-gray-550 font-mono">
                    {notifMessage.length}/350 chars
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#1DB954] hover:bg-emerald-400 hover:text-black text-black font-extrabold text-xs uppercase tracking-tight rounded-lg flex items-center justify-center gap-1.5 transition active:scale-[0.98] cursor-pointer"
                  id="btn_admin_notif_submit"
                >
                  <Send className="w-3.5 h-3.5 fill-current" /> Dispatch Broadcast Signal
                </button>
              </form>
            </div>

            {/* Column 2 of 2: Active Dispatched Broadcasts */}
            <div className="md:col-span-7 bg-[#121212] p-6 rounded-2xl border border-[#1F1F1F] flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#1DB954] mb-3 border-b border-[#1F1F1F] pb-3">
                  Broadcasts Ledger ({notifications.length})
                </h3>

                {notifications.length === 0 ? (
                  <div className="py-20 text-center text-gray-550 space-y-2">
                    <Bell className="w-8 h-8 mx-auto text-gray-700" />
                    <p className="text-xs">No administrative broadcast logs found in global storage.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                    {notifications.map((notif) => (
                      <div 
                        key={notif.id} 
                        className="p-3.5 bg-black rounded-xl border border-[#1F1F1F] flex flex-col sm:flex-row items-start justify-between gap-3 text-xs text-left"
                      >
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                              notif.severity === 'Critical' ? 'bg-red-950 text-red-400 border border-red-500/10' :
                              notif.severity === 'Warning' ? 'bg-amber-950 text-amber-500 border border-amber-500/10' :
                              notif.severity === 'Success' ? 'bg-emerald-950 text-[#1DB954] border border-[#1DB954]/10' :
                              'bg-indigo-950 text-indigo-400 border border-indigo-500/10'
                            }`}>
                              {notif.severity}
                            </span>
                            <span className="font-extrabold text-white uppercase tracking-tight text-[11px] truncate max-w-[200px]">
                              {notif.title}
                            </span>
                          </div>

                          <p className="text-gray-400 text-[11px] leading-relaxed break-words">{notif.message}</p>

                          <div className="flex items-center gap-2 pt-1 font-mono text-[9px] text-gray-550">
                            <span>Target: {notif.targetType} {notif.targetValue ? `(${notif.targetValue})` : ''}</span>
                            <span>•</span>
                            <span>{new Date(notif.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Are you absolutely sure you want to recall and delete "${notif.title}"?`)) {
                              onDeleteNotification(notif.id);
                              setNotifSuccess(`Broadcast Deleted: System notice dismissed from all client terminals.`);
                            }
                          }}
                          className="p-1.5 hover:bg-red-500/10 text-gray-500 hover:text-red-400 border border-transparent hover:border-red-500/20 rounded-lg transition self-end sm:self-start cursor-pointer"
                          title="Delete / Recall Broadast"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="text-[9px] uppercase tracking-wider text-gray-650 mt-4 border-t border-[#1F1F1F] pt-3 text-right">
                All changes reflect instantly inside active artist browser dashboards.
              </div>
            </div>
          </div>
        )}

        {/* MANAGED ARTISTS DATABASE TAB */}
        {activeTab === 'artists' && (
          <div className="bg-[#121212] p-6 rounded-2xl border border-[#1F1F1F] space-y-6" id="admin_artists_section">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1F1F1F] pb-4">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#1DB954] flex items-center gap-2">
                  <Globe className="w-4 h-4" /> Global Managed Artists Registry ({artists.length})
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">Comprehensive database of all artists registered across every member profile with verified platform links.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {artists.length === 0 ? (
                <div className="col-span-full py-20 text-center bg-black/40 rounded-xl border border-[#1F1F1F]/60">
                   <Users className="w-10 h-10 mx-auto text-gray-700 mb-2" />
                   <p className="text-xs text-gray-500">Global registry is currently empty.</p>
                </div>
              ) : (
                artists.map(artist => (
                  <div key={artist.id} className="bg-black/60 p-4 rounded-xl border border-[#1F1F1F] hover:border-[#1DB954]/20 transition-all group">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="text-sm font-black text-white uppercase tracking-tight group-hover:text-[#1DB954] transition-colors">{artist.name}</h4>
                        <p className="text-[10px] text-gray-500 font-mono mt-0.5">{artist.email}</p>
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-indigo-900/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                         <span className="text-[10px] font-bold">{artist.name.charAt(0).toUpperCase()}</span>
                      </div>
                    </div>

                    <div className="space-y-3 py-3 border-y border-[#1F1F1F]/60 my-2">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-gray-500 uppercase tracking-widest font-bold">Platform Connectivity:</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                         {artist.spotifyLink && artist.spotifyLink !== 'NONE' ? (
                           <div className="flex items-center gap-1">
                             <a href={artist.spotifyLink} target="_blank" rel="noopener noreferrer" 
                                className="px-2 py-1 bg-[#1DB954]/10 text-[#1DB954] border border-[#1DB954]/20 rounded text-[9px] font-bold hover:bg-[#1DB954] hover:text-black transition">
                               Spotify
                             </a>
                             <button 
                               onClick={() => {
                                 navigator.clipboard.writeText(artist.spotifyLink);
                                 alert('Spotify URL copied');
                               }}
                               className="p-1 text-[8px] text-gray-500 hover:text-white cursor-pointer"
                             >
                               Copy
                             </button>
                           </div>
                         ) : <span className="px-2 py-1 bg-red-900/10 text-red-500/60 border border-red-900/20 rounded text-[9px] font-bold italic">No Spotify ID</span>}

                         {artist.appleMusicLink && artist.appleMusicLink !== 'NONE' ? (
                           <div className="flex items-center gap-1">
                             <a href={artist.appleMusicLink} target="_blank" rel="noopener noreferrer" 
                                className="px-2 py-1 bg-red-900/10 text-red-500 border border-red-500/20 rounded text-[9px] font-bold hover:bg-red-500 hover:text-white transition">
                               Apple Music
                             </a>
                             <button 
                               onClick={() => {
                                 navigator.clipboard.writeText(artist.appleMusicLink);
                                 alert('Apple Music URL copied');
                               }}
                               className="p-1 text-[8px] text-gray-500 hover:text-white cursor-pointer"
                             >
                               Copy
                             </button>
                           </div>
                         ) : <span className="px-2 py-1 bg-red-900/10 text-red-500/60 border border-red-900/20 rounded text-[9px] font-bold italic">No Apple ID</span>}

                         {artist.instagramLink ? (
                           <a href={artist.instagramLink} target="_blank" rel="noopener noreferrer" 
                              className="px-2 py-1 bg-purple-900/10 text-purple-400 border border-purple-500/20 rounded text-[9px] font-bold hover:bg-purple-500 hover:text-white transition">
                             Instagram
                           </a>
                         ) : <span className="px-2 py-1 bg-gray-900/40 text-gray-650 border border-gray-800/40 rounded text-[9px] font-bold">No Instagram</span>}
                      </div>

                      <div className="pt-2 border-t border-[#1F1F1F]/40 mt-2">
                        <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Artist Connectivity:</div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {artist.spotifyLink ? (
                            <a href={artist.spotifyLink} target="_blank" rel="noopener noreferrer" 
                               className="px-2 py-1 bg-green-900/10 text-[#1DB954] border border-[#1DB954]/20 rounded text-[9px] font-bold hover:bg-[#1DB954] hover:text-white transition">
                              Spotify
                            </a>
                          ) : <span className="px-2 py-1 bg-gray-900/40 text-gray-650 border border-gray-800/40 rounded text-[9px] font-bold">No Spotify</span>}

                          {artist.appleMusicLink ? (
                            <div className="flex items-center gap-1">
                              <a href={artist.appleMusicLink} target="_blank" rel="noopener noreferrer" 
                                 className="px-2 py-1 bg-red-900/10 text-red-500 border border-red-500/20 rounded text-[9px] font-bold hover:bg-red-500 hover:text-white transition">
                                Apple Music
                              </a>
                              <button 
                                onClick={() => handleCopy(artist.appleMusicLink, 'Apple Music Link')}
                                className="p-1 hover:text-[#1DB954] text-gray-500 transition cursor-pointer"
                              >
                                Copy
                              </button>
                            </div>
                          ) : <span className="px-2 py-1 bg-red-900/10 text-red-500/60 border border-red-900/20 rounded text-[9px] font-bold italic">No Apple ID</span>}

                          {artist.instagramLink ? (
                            <a href={artist.instagramLink} target="_blank" rel="noopener noreferrer" 
                               className="px-2 py-1 bg-purple-900/10 text-purple-400 border border-purple-500/20 rounded text-[9px] font-bold hover:bg-purple-500 hover:text-white transition">
                              Instagram
                            </a>
                          ) : <span className="px-2 py-1 bg-gray-900/40 text-gray-650 border border-gray-800/40 rounded text-[9px] font-bold">No Instagram</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <span className="text-[9px] text-gray-600 font-mono">Registry ID: {artist.id.substring(0, 8)}...</span>
                      <div className="flex gap-1.5">
                        <button 
                          onClick={() => {
                            const user = users.find(u => u.email === artist.email);
                            if (user) onImpersonateUser(user);
                            else alert('Error: Root User Profile not found in directory for this artist.');
                          }}
                          className="p-1 px-2.5 bg-white text-black text-[9px] font-black rounded uppercase tracking-tighter hover:bg-emerald-400 transition cursor-pointer"
                        >
                          Access Profile
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>


      {/* FULL METADATA SPECS DETAILED INSPECTOR MODAL */}
      {inspectRelease && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto" id="metadata_specs_inspector_overlay">
          <div className="bg-[#0D0D0D] border border-[#2E2E2E] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 bg-black border-b border-[#1F1F1F] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Disc className="w-5 h-5 text-[#1DB954]" />
                <div className="text-left">
                  <h3 className="text-sm font-black text-white uppercase tracking-tight">Digital Asset Complete Specifications</h3>
                  <p className="text-[10px] text-gray-400">Deep inspection mode for Release ID: <span className="font-mono text-amber-400">{inspectRelease.id}</span></p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectRelease(null)}
                className="p-1 px-3 bg-[#1F1F1F] hover:bg-red-950 hover:text-red-400 text-gray-400 border border-[#2E2E2E] rounded-md text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                id="btn_close_inspector_modal"
              >
                <X className="w-4 h-4" /> Close Inspection
              </button>
            </div>

            {/* Modal Content Scroll Area */}
            <div className="p-6 overflow-y-auto space-y-6 text-left">
              
              {/* Parent Release Profile Section (Grid of specs) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Visual Cover Art Indicator */}
                <div className="bg-black p-4 rounded-xl border border-[#1F1F1F] flex flex-col items-center justify-center space-y-3">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Cover Art Assets</span>
                  <img 
                    src={inspectRelease.coverArtSignedUrl || inspectRelease.coverArtUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=200&auto=format&fit=crop'} 
                    alt="Cover Art" 
                    className="w-44 h-44 rounded-lg object-cover border border-[#2E2E2E] shadow-md animate-pulse"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex flex-col gap-2 w-full mt-2">
                    <div className="text-[10px] text-gray-500 hover:text-blue-400 truncate max-w-full font-mono select-all text-center">
                      {inspectRelease.coverArtUrl || 'N/A'}
                    </div>
                    <button
                      onClick={() => inspectRelease.coverArtUrl && onDownloadFile(inspectRelease.coverArtUrl)}
                      className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded text-[10px] uppercase tracking-tight flex items-center justify-center gap-1.5 transition"
                    >
                      <PlusCircle className="w-3.5 h-3.5" /> Download Cover PNG
                    </button>
                  </div>
                </div>

                {/* Technical Distribution Fields */}
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <span className="text-xs font-bold text-[#1DB954] bg-[#1DB954]/10 border border-[#1DB954]/20 px-2 py-0.5 rounded uppercase tracking-wider">{inspectRelease.type} Release</span>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-black text-white mt-1 uppercase tracking-tight">{inspectRelease.albumName}</h2>
                      <button 
                        onClick={() => handleCopy(inspectRelease.albumName, 'Album Name')}
                        className="p-1 hover:text-[#1DB954] text-gray-500 transition cursor-pointer"
                        title="Copy Album Name"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-400">
                      Registrant Artist Email: <span className="text-indigo-400 font-bold">{inspectRelease.email}</span>
                      <button 
                        onClick={() => handleCopy(inspectRelease.email, 'Email')}
                        className="inline-block ml-1 p-0.5 hover:text-[#1DB954] text-gray-500 transition cursor-pointer"
                        title="Copy Email"
                      >
                        <Copy className="w-2.5 h-2.5" />
                      </button>
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5 text-xs">
                    <div className="p-3 bg-black rounded-lg border border-[#1F1F1F] space-y-1 relative group">
                      <div className="text-[9px] text-gray-550 uppercase font-black tracking-wider">Principal Release Artist</div>
                      <div className="font-bold text-white text-[13px]">{inspectRelease.mainArtistName}</div>
                      <button 
                        onClick={() => handleCopy(inspectRelease.mainArtistName, 'Artist Name')}
                        className="absolute top-2 right-2 p-1 hover:text-[#1DB954] text-gray-500 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                        title="Copy Artist Name"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="p-3 bg-black rounded-lg border border-[#1F1F1F] space-y-1 relative group">
                      <div className="text-[9px] text-gray-550 uppercase font-black tracking-wider">Feature Artists</div>
                      <div className="font-bold text-gray-300">
                        {inspectRelease.featureArtists && inspectRelease.featureArtists.length > 0
                          ? inspectRelease.featureArtists.join(', ')
                          : 'None'}
                      </div>
                      {inspectRelease.featureArtists && inspectRelease.featureArtists.length > 0 && (
                        <button 
                          onClick={() => handleCopy(inspectRelease.featureArtists!.join(', '), 'Feature Artists')}
                          className="absolute top-2 right-2 p-1 hover:text-[#1DB954] text-gray-500 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <div className="p-3 bg-black rounded-lg border border-[#1F1F1F] space-y-1 relative group">
                      <div className="text-[9px] text-gray-550 uppercase font-black tracking-wider">Other Artists</div>
                      <div className="font-bold text-gray-300">
                        {inspectRelease.otherArtists && inspectRelease.otherArtists.length > 0
                          ? inspectRelease.otherArtists.join(', ')
                          : 'None'}
                      </div>
                      {inspectRelease.otherArtists && inspectRelease.otherArtists.length > 0 && (
                        <button 
                          onClick={() => handleCopy(inspectRelease.otherArtists!.join(', '), 'Other Artists')}
                          className="absolute top-2 right-2 p-1 hover:text-[#1DB954] text-gray-500 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <div className="p-3 bg-black rounded-lg border border-[#1F1F1F] space-y-1">
                      <div className="text-[9px] text-gray-550 uppercase font-black tracking-wider">Primary Store Genre</div>
                      <div className="font-bold text-emerald-400">{inspectRelease.genre}</div>
                    </div>

                    <div className="p-3 bg-black rounded-lg border border-[#1F1F1F] space-y-1">
                      <div className="text-[9px] text-gray-550 uppercase font-black tracking-wider">Ingress Sub-Genre</div>
                      <div className="font-bold text-teal-400">{inspectRelease.subGenre || 'N/A'}</div>
                    </div>

                    <div className="p-3 bg-black rounded-lg border border-[#1F1F1F] space-y-1">
                      <div className="text-[9px] text-gray-550 uppercase font-black tracking-wider">Publishing Language</div>
                      <div className="font-bold text-white flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5 text-gray-400" />
                        {inspectRelease.language || 'English'}
                      </div>
                    </div>

                    <div className="p-3 bg-black rounded-lg border border-[#1F1F1F] space-y-1">
                      <div className="text-[9px] text-gray-550 uppercase font-black tracking-wider">Content Grade Class</div>
                      <div className="font-bold text-orange-400">{inspectRelease.contentType} Ingest</div>
                    </div>

                    <div className="p-3 bg-black rounded-lg border border-[#1F1F1F] space-y-1 relative group">
                      <div className="text-[9px] text-gray-550 uppercase font-black tracking-wider">Legal Imprint (Label)</div>
                      <div className="font-bold text-amber-400">{inspectRelease.labelName || 'Independent Self-Release'}</div>
                      <button 
                        onClick={() => handleCopy(inspectRelease.labelName || 'Independent Self-Release', 'Label Name')}
                        className="absolute top-2 right-2 p-1 hover:text-[#1DB954] text-gray-500 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="p-3 bg-black rounded-lg border border-[#1F1F1F] space-y-1 relative group">
                      <div className="text-[9px] text-gray-550 uppercase font-black tracking-wider">Declared Ingest Date</div>
                      <div className="font-bold text-white flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {inspectRelease.releaseDate}
                      </div>
                      <button 
                        onClick={() => handleCopy(inspectRelease.releaseDate, 'Release Date')}
                        className="absolute top-2 right-2 p-1 hover:text-[#1DB954] text-gray-500 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Intellectual Property Declarations (C Line & P Line) */}
              <div className="bg-black p-4 rounded-xl border border-[#1F1F1F] space-y-3">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  Intellectual Copyright Legal Ownership (CLine & PLine)
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                  <div className="p-2.5 bg-[#090909] rounded border border-[#1F1F1F]/60 relative group">
                    <span className="text-[#999999] uppercase text-[9px] block mb-0.5">Composition Phonographic Copyright (℗ Line)</span>
                    <span className="text-white font-semibold">{inspectRelease.pLine || `℗ ${new Date(inspectRelease.submittedAt).getFullYear()} ${inspectRelease.mainArtistName}`}</span>
                    <button 
                      onClick={() => handleCopy(inspectRelease.pLine || `℗ ${new Date(inspectRelease.submittedAt).getFullYear()} ${inspectRelease.mainArtistName}`, 'P Line')}
                      className="absolute top-2 right-2 p-1 hover:text-[#1DB954] text-gray-500 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="p-2.5 bg-[#090909] rounded border border-[#1F1F1F]/60 relative group">
                    <span className="text-[#999999] uppercase text-[9px] block mb-0.5">Authorial/Structural Publishing Copyright (© Line)</span>
                    <span className="text-white font-semibold">{inspectRelease.cLine || `© ${new Date(inspectRelease.submittedAt).getFullYear()} ${inspectRelease.mainArtistName}`}</span>
                    <button 
                      onClick={() => handleCopy(inspectRelease.cLine || `© ${new Date(inspectRelease.submittedAt).getFullYear()} ${inspectRelease.mainArtistName}`, 'C Line')}
                      className="absolute top-2 right-2 p-1 hover:text-[#1DB954] text-gray-500 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Technical Ingest Track assets - EVERY SINGLE PROPERTY */}
              <div className="space-y-4">
                <span className="text-xs uppercase font-extrabold text-[#1DB954] tracking-widest block">Supplied Track Audio Masters & Lyrics Sheets ({inspectRelease.tracks.length})</span>
                
                <div className="space-y-4">
                  {inspectRelease.tracks.map((track, idx) => (
                    <div key={track.id} className="p-5 bg-black rounded-xl border border-[#222] space-y-4 text-xs">
                      {/* Track Title and Basic Info Header */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#1F1F1F]">
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center font-bold text-gray-300 font-mono text-[11px]">
                            {idx + 1}
                          </span>
                          <div className="text-left">
                            <h4 className="text-sm font-black text-white uppercase tracking-tight">{track.trackName}</h4>
                            <p className="text-[11px] text-gray-400">
                              By: <span className="text-white font-bold">{track.mainArtistName}</span> 
                              {track.featureArtists && track.featureArtists.length > 0 && ` (feat. ${track.featureArtists.join(', ')})`}
                              {track.otherArtists && track.otherArtists.length > 0 && ` (other. ${track.otherArtists.join(', ')})`}
                            </p>
                          </div>
                        </div>

                        {/* Badges / Audio specs */}
                        <div className="flex flex-wrap gap-1.5 items-center">
                          {(track.explicitContent || (track as any).explicit_content) ? (
                            <span className="px-2 py-0.5 text-[8px] bg-red-950 text-red-400 border border-red-500/20 font-extrabold rounded">⚠️ YES (EXPLICIT AUDIO)</span>
                          ) : (
                            <span className="px-2 py-0.5 text-[8px] bg-emerald-950 text-emerald-400 border border-[#10b981]/20 font-extrabold rounded">✓ NO (CLEAN EDIT)</span>
                          )}
                          <span className="px-2 py-0.5 text-[8px] bg-blue-950 text-blue-400 border border-blue-500/20 font-extrabold rounded font-mono">
                            {track.audioFileName || 'Master_WAV.wav'}
                          </span>
                          {track.audioFileName && (
                            <button
                              onClick={() => onDownloadFile(track.audioFileName!)}
                              className="px-2 py-0.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded text-[8px] uppercase tracking-tight flex items-center gap-1 transition"
                            >
                              <Music className="w-2.5 h-2.5" /> Download WAV
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Every Single Property in a Bento Grid layout for the Track */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <div className="p-2.5 bg-[#090909] rounded border border-[#1F1F1F] space-y-0.5 text-left relative group">
                          <span className="text-[8px] text-gray-500 uppercase font-extrabold block">Producer Metadata</span>
                          <span className="text-white font-semibold text-[11px]">{track.producer || 'Unassigned'}</span>
                          {track.producer && (
                            <button 
                              onClick={() => handleCopy(track.producer!, 'Producer')}
                              className="absolute top-2 right-2 p-0.5 hover:text-[#1DB954] text-gray-500 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                            >
                              <Copy className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>

                        <div className="p-2.5 bg-[#090909] rounded border border-[#1F1F1F] space-y-0.5 text-left relative group">
                          <span className="text-[8px] text-gray-500 uppercase font-extrabold block">Lyricist Record</span>
                          <span className="text-white font-semibold text-[11px]">{track.lyricist || 'Unassigned'}</span>
                          {track.lyricist && (
                            <button 
                              onClick={() => handleCopy(track.lyricist!, 'Lyricist')}
                              className="absolute top-2 right-2 p-0.5 hover:text-[#1DB954] text-gray-500 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                            >
                              <Copy className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>

                        <div className="p-2.5 bg-[#090909] rounded border border-[#1F1F1F] space-y-0.5 text-left relative group">
                          <span className="text-[8px] text-gray-500 uppercase font-extrabold block">Composer Composition</span>
                          <span className="text-white font-semibold text-[11px]">{track.composer || 'Unassigned'}</span>
                          {track.composer && (
                            <button 
                              onClick={() => handleCopy(track.composer!, 'Composer')}
                              className="absolute top-2 right-2 p-0.5 hover:text-[#1DB954] text-gray-500 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                            >
                              <Copy className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>

                        <div className="p-2.5 bg-[#090909] rounded border border-[#1F1F1F] space-y-0.5 text-left relative group">
                          <span className="text-[8px] text-gray-500 uppercase font-extrabold block">Technical ISRC Code</span>
                          <span className="text-amber-400 font-mono font-black text-[11px]">{track.isrc || 'Awaiting Auto-Generation'}</span>
                          {track.isrc && (
                            <button 
                              onClick={() => handleCopy(track.isrc!, 'ISRC')}
                              className="absolute top-2 right-2 p-0.5 hover:text-[#1DB954] text-gray-500 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                            >
                              <Copy className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>

                        <div className="p-2.5 bg-[#090909] rounded border border-[#1F1F1F] space-y-0.5 text-left">
                          <span className="text-[8px] text-gray-500 uppercase font-extrabold block">Genre/Sub-Genre</span>
                          <span className="text-teal-400 font-semibold text-[11px]">{track.genre || inspectRelease.genre} ({track.subGenre || inspectRelease.subGenre || 'N/A'})</span>
                        </div>

                        <div className="p-2.5 bg-[#090909] rounded border border-[#1F1F1F] space-y-0.5 text-left">
                          <span className="text-[8px] text-gray-500 uppercase font-extrabold block">Language Match</span>
                          <span className="text-white font-semibold text-[11px]">{track.language || inspectRelease.language || 'English'}</span>
                        </div>
                      </div>

                      {/* Lyrics Ingested Section */}
                      <div className="bg-[#0A0A0A] p-3 rounded-lg border border-[#1F1F1F] space-y-1.5 text-left relative group">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] uppercase font-black text-gray-550 tracking-wider block">Attached Lyrics Sheet</span>
                          {track.lyrics && (
                            <button 
                              onClick={() => handleCopy(track.lyrics!, 'Lyrics')}
                              className="p-1 hover:text-[#1DB954] text-gray-500 transition cursor-pointer flex items-center gap-1 text-[9px] font-bold"
                            >
                              <Copy className="w-2.5 h-2.5" /> Copy Lyrics
                            </button>
                          )}
                        </div>
                        {track.lyrics ? (
                          <div className="bg-black p-3 rounded font-mono text-[11px] text-gray-300 whitespace-pre-wrap max-h-[160px] overflow-y-auto leading-relaxed border border-[#1F1F1F] text-left">
                            {track.lyrics}
                          </div>
                        ) : (
                          <p className="text-gray-650 italic text-[10px]">No lyrics supplied for this track entry (Instrumental record or pending upload).</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* User / Administration feedback loop details */}
              {(inspectRelease.feedback || inspectRelease.specialRequest || (inspectRelease as any).special_request || (inspectRelease as any).special_instructions) && (
                <div className="bg-black p-4 rounded-xl border border-[#1F1F1F] space-y-3">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Revision Logs & Directives</span>
                  <div className="space-y-2 text-xs">
                    {(inspectRelease.specialRequest || (inspectRelease as any).special_request || (inspectRelease as any).special_instructions) && (
                      <div className="p-3 bg-zinc-900/40 rounded border border-zinc-850 text-left">
                        <span className="text-[9px] text-[#1DB954] font-bold block uppercase">Artist Request Comment (Special Pitching Request):</span>
                        <p className="text-gray-300 italic mt-1">"{(inspectRelease.specialRequest || (inspectRelease as any).special_request || (inspectRelease as any).special_instructions)}"</p>
                      </div>
                    )}
                    {inspectRelease.feedback && (
                      <div className="p-3 bg-indigo-950/20 rounded border border-indigo-900/10 text-left">
                        <span className="text-[9px] text-indigo-400 font-bold block uppercase">Reviewer Audit Feedback Comment:</span>
                        <p className="text-gray-350 italic mt-1">"{inspectRelease.feedback}"</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-black border-t border-[#1F1F1F] flex items-center justify-between">
              <div className="text-[10px] text-gray-500 uppercase font-mono tracking-widest">
                Compliance Verified Status: <span className="text-[#1DB954] font-black">{inspectRelease.status}</span>
              </div>
              <button
                type="button"
                onClick={() => setInspectRelease(null)}
                className="px-5 py-2 bg-[#1DB954] text-black font-extrabold hover:bg-emerald-400 rounded-lg text-xs uppercase tracking-tight transition cursor-pointer"
              >
                Close Specifications Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
