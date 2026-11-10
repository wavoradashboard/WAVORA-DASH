import React from 'react';
import { motion } from 'motion/react';
import { 
  Play, 
  Disc, 
  ArrowUpRight, 
  DollarSign, 
  Wallet, 
  CheckCircle, 
  Music, 
  Crown, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Award, 
  Headphones, 
  Radio, 
  Star, 
  Globe, 
  Sliders,
  ChevronRight
} from 'lucide-react';
import { User, Release, RevenueReport, Notification } from '../types';
import NotificationsWidget from './NotificationsWidget';

interface DashboardHomeProps {
  currentUser: User;
  releases: Release[];
  revenueReports: RevenueReport[];
  setCurrentTab: (tab: string) => void;
  onOpenRevenueModal: () => void;
  notifications: Notification[];
}

export default function DashboardHome({
  currentUser,
  releases,
  revenueReports,
  setCurrentTab,
  onOpenRevenueModal,
  notifications,
}: DashboardHomeProps) {
  const isPremiumUser = currentUser.plan === 'Elite' || currentUser.email.toLowerCase() === 'demisedamn@gmail.com';

  // Filter user's specific releases
  const userReleases = releases.filter(r => r.email === currentUser.email);
  const totalReleases = userReleases.length;

  // Filter user's specific revenue
  const userRevenue = revenueReports.filter(r => r.email === currentUser.email);
  
  // Format helper for dynamic report currencies
  const formatAmount = (amount: number, currency?: 'USD' | 'INR') => {
    if (currency === 'INR') {
      return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const totalUSD = userRevenue
    .filter(rep => rep.currency !== 'INR')
    .reduce((sum, item) => sum + item.amount, 0);

  const totalINR = userRevenue
    .filter(rep => rep.currency === 'INR')
    .reduce((sum, item) => sum + item.amount, 0);

  // Live status helper
  const liveReleases = userReleases.filter(r => r.status === 'Live').length;
  const pendingReleases = userReleases.filter(r => r.status === 'Submitted').length;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.02
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 text-left" 
      id="dashboard_home_root"
    >
      {/* Upper Header Banner: Custom VIP Executive Banner for Premium/Elite Users */}
      {isPremiumUser ? (
        <motion.div 
          variants={itemVariants} 
          className="relative p-6 sm:p-8 bg-gradient-to-r from-[#0d0e1c] via-[#14102b] to-[#0c1824] rounded-3xl border-2 border-amber-500/40 shadow-2xl shadow-indigo-950/60 overflow-hidden"
          id="vip_executive_hero_banner"
        >
          {/* Ambient Glow Effects */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5 shadow-md shadow-amber-500/10">
                  <Crown className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                  Wavora Live VIP Elite Executive Member
                </span>
                <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1">
                  <Zap className="w-3 h-3 text-emerald-400" />
                  24-Hour Priority Express Ingestion
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white uppercase tracking-tight" id="home_welcome_header_vip">
                Welcome, <span className="text-white">{currentUser.artistName}</span>
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                Your account is configured on the <strong className="text-amber-300 font-bold">Wavora VIP Elite Tier</strong>. Enjoy 24-hour fast-track DSP distribution, direct royalty payouts, direct SoundExchange sync, and a dedicated VIP account concierge desk.
              </p>

              {/* VIP Executive Status Pill Bar */}
              <div className="pt-1 flex flex-wrap items-center gap-3 text-xs text-slate-300 font-semibold">
                <div className="flex items-center gap-1.5 bg-black/50 px-3 py-1.5 rounded-xl border border-white/10">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>VIP Direct Royalty Pipeline</span>
                </div>
                <div className="flex items-center gap-1.5 bg-black/50 px-3 py-1.5 rounded-xl border border-white/10">
                  <Headphones className="w-4 h-4 text-indigo-400" />
                  <span>24-Bit / 96kHz Lossless & Atmos Ready</span>
                </div>
                <div className="flex items-center gap-1.5 bg-black/50 px-3 py-1.5 rounded-xl border border-white/10">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>VIP Account Manager Assigned</span>
                </div>
              </div>
            </div>

            {/* Launch VIP Fast-Track Button */}
            <div className="w-full lg:w-auto flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setCurrentTab('new-release')}
                className="cursor-pointer px-6 py-3.5 bg-gradient-to-r from-amber-400 via-amber-300 to-emerald-400 hover:from-amber-300 hover:to-emerald-300 text-black font-black text-xs uppercase tracking-tight rounded-2xl shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transition transform active:scale-95"
                id="btn_home_quick_launch_vip"
              >
                <Play className="w-4 h-4 fill-black" /> Distribute Fast-Track Release
              </button>

              <button
                type="button"
                onClick={onOpenRevenueModal}
                className="cursor-pointer px-6 py-3 bg-black/60 hover:bg-black/90 text-amber-300 border border-amber-500/40 font-bold text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 transition"
                id="btn_home_view_statements_vip"
              >
                <DollarSign className="w-4 h-4 text-amber-400" /> Instant Royalty Audit
              </button>
            </div>
          </div>
        </motion.div>
      ) : (
        /* Standard Header Banner */
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-5 md:p-8 bg-white/2 rounded-3xl border border-white/10 relative overflow-hidden" id="home_welcome_banner">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(29,185,84,0.06),transparent_50%)] pointer-events-none" />
          <div className="relative z-10 space-y-1.5">
            <div className="text-[9px] md:text-[10px] text-[#6366F1] font-mono tracking-widest uppercase">Digital DSP Pipeline Ingestion</div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white uppercase tracking-tighter" id="home_welcome_header">
              Welcome, <span className="text-[#6366F1]">{currentUser.artistName}</span>
            </h2>
            <p className="text-[10px] md:text-xs text-gray-400 max-w-xl leading-relaxed">
              Distribute new singles, EPs, or albums directly to global music networks. Build your custom catalog metadata, verify official copyrights, and overview your digital earnings.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setCurrentTab('new-release')}
            className="relative z-10 cursor-pointer px-4 md:px-5 py-2.5 md:py-3 bg-white hover:bg-[#6366F1] hover:text-black text-black font-black text-[10px] md:text-xs uppercase tracking-tight rounded-xl flex items-center justify-center gap-2 transition duration-200 w-full sm:w-auto self-start md:self-auto shadow-lg"
            id="btn_home_quick_launch"
          >
            <Play className="w-3 md:w-3.5 h-3 md:h-3.5 fill-current" /> Distribute New Track
          </button>
        </motion.div>
      )}

      {/* Broadcast System Announcements Bulletin Board */}
      <motion.div variants={itemVariants}>
        <NotificationsWidget currentUser={currentUser} notifications={notifications} />
      </motion.div>

      {/* C Lines and P Lines display */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6" id="home_legal_lines_grid">
        <div className={`p-5 rounded-2xl border ${isPremiumUser ? 'bg-black/60 border-amber-500/20' : 'bg-white/2 border-white/10'}`} id="home_c_lines">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
              <span>Authorized C Lines (©)</span>
              {isPremiumUser && <span className="text-[9px] text-amber-400 font-mono bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30">VIP Imprints</span>}
            </h3>
          </div>
          <div className="space-y-1">
            {(currentUser.allowedCLines || []).length === 0 ? (
              <p className="text-[10px] text-gray-600 italic">No C lines authorized.</p>
            ) : (
              (currentUser.allowedCLines || []).map((line, i) => (
                <div key={i} className="text-[10px] text-gray-300 font-mono bg-black p-2 rounded border border-white/5 truncate flex items-center justify-between">
                  <span>© {line}</span>
                  {isPremiumUser && <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" />}
                </div>
              ))
            )}
          </div>
        </div>

        <div className={`p-5 rounded-2xl border ${isPremiumUser ? 'bg-black/60 border-amber-500/20' : 'bg-white/2 border-white/10'}`} id="home_p_lines">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
              <span>Authorized P Lines (℗)</span>
              {isPremiumUser && <span className="text-[9px] text-indigo-400 font-mono bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/30">Phonogram Master</span>}
            </h3>
          </div>
          <div className="space-y-1">
            {(currentUser.allowedPLines || []).length === 0 ? (
              <p className="text-[10px] text-gray-600 italic">No P lines authorized.</p>
            ) : (
              (currentUser.allowedPLines || []).map((line, i) => (
                <div key={i} className="text-[10px] text-gray-300 font-mono bg-black p-2 rounded border border-white/5 truncate flex items-center justify-between">
                  <span>℗ {line}</span>
                  {isPremiumUser && <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" />}
                </div>
              ))
            )}
          </div>
        </div>
      </motion.div>

      {/* Metric Cards - Dynamic */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4" id="home_stats_grid">
        <motion.div 
          whileHover={{ y: -2 }}
          className={`p-5 rounded-2xl border transition-all overflow-hidden ${isPremiumUser ? 'bg-gradient-to-br from-amber-950/20 via-black to-slate-900/80 border-amber-500/30' : 'bg-white/2 border-white/10 hover:border-[#2F2F2F]'}`}
          id="metric_total_releases"
        >
          <div className="flex items-center justify-between text-gray-400 mb-3">
            <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1">
              <span>Total Releases</span>
              {isPremiumUser && <Crown className="w-3 h-3 text-amber-400" />}
            </span>
            <div className={`p-1.5 rounded ${isPremiumUser ? 'bg-amber-500/20 text-amber-300' : 'bg-[#6366F1]/10 text-[#6366F1]'}`}>
              <Disc className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tighter truncate break-all" title={String(totalReleases)}>
            {totalReleases}
          </div>
          <div className="text-[10px] text-gray-400 mt-2 flex items-center gap-1 font-mono uppercase truncate">
            <span className={isPremiumUser ? 'text-amber-400 font-bold' : 'text-[#6366F1] font-bold'}>{liveReleases} Live</span>
            <span>•</span>
            <span className="text-amber-400 font-bold">{pendingReleases} In Review</span>
          </div>
        </motion.div>

        <motion.div 
          onClick={onOpenRevenueModal}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          className={`p-5 rounded-2xl border transition-all overflow-hidden cursor-pointer select-none group ${isPremiumUser ? 'bg-gradient-to-br from-emerald-950/20 via-black to-indigo-950/30 border-emerald-500/30 hover:border-emerald-400/50' : 'bg-white/2 hover:bg-[#181818] border-white/10 hover:border-indigo-500/30'}`}
          id="metric_total_revenue"
          title="Click to view detailed statements popup"
        >
          <div className="flex items-center justify-between text-gray-400 mb-3">
            <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-400 group-hover:text-emerald-300 transition-colors flex items-center gap-1.5">
              Artist Revenue <span className="text-[8px] bg-emerald-500/10 text-emerald-400 px-1 py-0.5 rounded border border-emerald-500/20 font-sans tracking-normal uppercase">Statement</span>
            </span>
            <div className="p-1.5 rounded bg-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          {totalINR > 0 && totalUSD > 0 ? (
            <div className="space-y-0.5 min-w-0">
              <div 
                className="text-xl sm:text-2xl lg:text-3xl font-black text-emerald-400 tracking-tighter truncate break-all"
                title={formatAmount(totalINR, 'INR')}
              >
                {formatAmount(totalINR, 'INR')}
              </div>
              <div 
                className="text-[10px] sm:text-xs font-bold text-slate-300 truncate break-all"
                title={`+ ${formatAmount(totalUSD, 'USD')}`}
              >
                + {formatAmount(totalUSD, 'USD')}
              </div>
            </div>
          ) : totalINR > 0 ? (
            <div 
              className="text-2xl sm:text-3xl lg:text-4xl font-black text-emerald-400 tracking-tighter truncate break-all"
              title={formatAmount(totalINR, 'INR')}
            >
              {formatAmount(totalINR, 'INR')}
            </div>
          ) : (
            <div 
              className="text-2xl sm:text-3xl lg:text-4xl font-black text-emerald-400 tracking-tighter truncate break-all"
              title={formatAmount(totalUSD, 'USD')}
            >
              {formatAmount(totalUSD, 'USD')}
            </div>
          )}
          <div className="text-[10px] text-gray-400 mt-2 flex items-center gap-1 font-mono uppercase truncate">
            <span className="text-emerald-400 font-bold flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> Direct Payout
            </span>
            <span>•</span>
            <span>Verified Revenue</span>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -2 }}
          className={`p-5 rounded-2xl border transition-all overflow-hidden ${isPremiumUser ? 'bg-gradient-to-br from-indigo-950/20 via-black to-slate-900/80 border-indigo-500/30' : 'bg-white/2 border-white/10 hover:border-[#2F2F2F]'}`}
          id="metric_streaming_share"
        >
          <div className="flex items-center justify-between text-gray-400 mb-3">
            <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Statement Block</span>
            <div className="p-1.5 rounded bg-indigo-500/10 text-indigo-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-base sm:text-lg lg:text-xl font-black text-white leading-tight uppercase tracking-tight truncate break-all">
            {userRevenue.length > 0 ? userRevenue[0].month : 'Current Cycle'}
          </div>
          <div className="text-[10px] text-indigo-300 font-bold mt-3 hover:underline cursor-pointer uppercase tracking-wider truncate break-all" onClick={() => setCurrentTab('revenue')}>
            {userRevenue.length > 0 ? `${formatAmount(userRevenue[0].amount, userRevenue[0].currency)} reported` : 'Reviewing stats'}
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -2 }}
          className={`p-5 rounded-2xl border transition-all overflow-hidden ${isPremiumUser ? 'bg-gradient-to-br from-purple-950/20 via-black to-slate-900/80 border-purple-500/30' : 'bg-white/2 border-white/10 hover:border-[#2F2F2F]'}`}
          id="metric_distribution_speed"
        >
          <div className="flex items-center justify-between text-gray-400 mb-3">
            <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">System Pipeline</span>
            <div className="p-1.5 rounded bg-purple-500/10 text-purple-400">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tighter flex items-baseline gap-1 truncate break-all">
            <span>{isPremiumUser ? 'FAST-TRACK' : 'UPTIME'}</span>
          </div>
          <div className="text-[10px] text-emerald-400 mt-2 font-mono uppercase tracking-wider truncate flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            {isPremiumUser ? '24hr Express Queue Active' : 'Direct Ingestion Operational'}
          </div>
        </motion.div>
      </motion.div>

      {/* Grid: Recent Releases and Streaming Analysis */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-12 gap-6" id="home_secondary_grid">
        {/* Recent Submissions */}
        <div className="md:col-span-12 p-6 bg-white/2 rounded-3xl border border-white/10 flex flex-col justify-between" id="recent_releases_section">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-300 flex items-center gap-2">
                <span>Catalog Registry Preview</span>
                {isPremiumUser && <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">VIP Catalog</span>}
              </h3>
              <button 
                onClick={() => setCurrentTab('catalogue')}
                className="text-xs text-[#6366F1] hover:underline cursor-pointer font-bold uppercase tracking-tight flex items-center gap-1"
              >
                <span>View Full Catalogue</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {userReleases.length === 0 ? (
              <div className="py-12 text-center text-gray-500 space-y-3" id="no_activity_alert">
                <Music className="w-10 h-10 text-gray-700 mx-auto" />
                <p className="text-xs text-gray-300">No releases registered on your catalog registry.</p>
                <button
                  onClick={() => setCurrentTab('new-release')}
                  className="mx-auto block text-xs bg-white text-black font-black px-4 py-2 rounded uppercase tracking-tighter hover:bg-[#6366F1] cursor-pointer"
                >
                  Create New release
                </button>
              </div>
            ) : (
              <div className="space-y-3" id="activity_list">
                {userReleases.slice(0, 3).map((rel) => (
                  <div 
                    key={rel.id} 
                    className="p-3.5 bg-black/80 rounded-2xl border border-white/10 flex items-center justify-between gap-3 text-xs hover:border-indigo-500/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <img 
                        src={rel.coverArtSignedUrl || rel.coverArtUrl || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=200&auto=format&fit=crop'} 
                        alt="" 
                        className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-white/10 shadow-md"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-extrabold text-white truncate max-w-[150px] sm:max-w-xs md:max-w-md uppercase tracking-tight text-sm">{rel.albumName}</h4>
                        <div className="text-[10px] text-gray-400 flex flex-wrap items-center gap-1.5 font-mono mt-0.5">
                          <span className="text-indigo-400 font-bold">{rel.type}</span>
                          <span>•</span>
                          <span>{rel.tracks.length} track(s)</span>
                          {rel.labelName && (
                            <>
                              <span>•</span>
                              <span className="text-amber-400 truncate max-w-[120px]">{rel.labelName}</span>
                            </>
                          )}
                          {isPremiumUser && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-400 font-bold">VIP Fast-Track</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0 flex flex-col items-end justify-center min-w-[100px]">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider whitespace-nowrap ${
                        rel.status === 'Live' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        rel.status === 'Approved' ? 'bg-blue-950/40 text-blue-400 border border-blue-500/20' :
                        rel.status === 'Rejected' ? 'bg-red-950/40 text-red-500 border border-red-500/20' :
                        'bg-amber-950/40 text-amber-400 border border-amber-500/30'
                      }`}>
                        {rel.status}
                      </span>
                      <div className="text-[9px] text-gray-500 mt-1 font-mono whitespace-nowrap">
                        {new Date(rel.submittedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

