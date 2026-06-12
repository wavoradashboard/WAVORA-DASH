import React from 'react';
import { motion } from 'motion/react';
import { DollarSign, Wallet, Calendar, ArrowUpRight, ShieldCheck, Download, Award, Landmark } from 'lucide-react';
import { RevenueReport, User } from '../types';

interface RevenuePageProps {
  currentUser: User;
  revenueReports: RevenueReport[];
  onOpenRevenueModal: () => void;
}

export default function RevenuePage({ currentUser, revenueReports, onOpenRevenueModal }: RevenuePageProps) {
  // Filter core artist reports
  const userReports = revenueReports.filter(rep => rep.email === currentUser.email);
  
  // Format helper for dynamic report currencies
  const formatAmount = (amount: number, currency?: 'USD' | 'INR') => {
    if (currency === 'INR') {
      return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Totals calculations segregated by currency
  const totalUSD = userReports
    .filter(rep => rep.currency !== 'INR')
    .reduce((sum, item) => sum + item.amount, 0);

  const totalINR = userReports
    .filter(rep => rep.currency === 'INR')
    .reduce((sum, item) => sum + item.amount, 0);

  const latestPeriod = userReports.length > 0 ? userReports[0] : null;

  return (
    <div className="space-y-6" id="revenue_root">
      {/* Page Header */}
      <div className="p-6 bg-[#0f1424] rounded-2xl border border-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-4" id="revenue_header">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Landmark className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">Financial Royalty Feed</h2>
          </div>
          <p className="text-xs text-slate-400 max-w-xl">
            View verified reports retrieved from partner DSPs (Spotify, Apple, YouTube, TikTok). Reports are loaded on a monthly cycle.
          </p>
        </div>

        {userReports.length > 0 && (
          <button
            type="button"
            className="cursor-pointer px-4 py-2 bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition self-start md:self-auto"
            onClick={() => alert('Starting CSV data download export... (Royalty Statements Export Prepared)')}
          >
            <Download className="w-3.5 h-3.5" /> Export Royalty XML
          </button>
        )}
      </div>

      {/* Balance panel summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="revenue_stats_mesh">
        <div 
          onClick={onOpenRevenueModal}
          className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/20 to-teal-950/20 border border-emerald-500/20 hover:border-emerald-500/40 hover:from-emerald-950/30 hover:to-teal-950/30 flex items-center justify-between overflow-hidden cursor-pointer select-none transition-all active:scale-[0.98] group relative"
          id="metric_withdrawable_revenue_card"
          title="Click to see all detailed monthly statements"
        >
          <div className="space-y-1 min-w-0 flex-1 pr-2">
            <span className="text-[10px] text-emerald-400 group-hover:text-[#1ed760] font-extrabold uppercase tracking-widest block flex items-center gap-1.5 transition-colors">
              Withdrawable Revenue <span className="text-[8px] bg-emerald-500/15 text-emerald-300 px-1 py-0.5 rounded border border-emerald-500/20 font-sans tracking-normal uppercase">View Reports</span>
            </span>
            {totalINR > 0 && totalUSD > 0 ? (
              <div className="space-y-1 min-w-0">
                <div className="text-xl sm:text-2xl font-black text-white tracking-tight truncate break-all" title={formatAmount(totalINR, 'INR')}>
                  {formatAmount(totalINR, 'INR')}
                </div>
                <div className="text-xs font-semibold text-emerald-400 truncate break-all" title={`+ ${formatAmount(totalUSD, 'USD')}`}>
                  + {formatAmount(totalUSD, 'USD')}
                </div>
              </div>
            ) : totalINR > 0 ? (
              <div className="text-2xl sm:text-3xl font-black text-white tracking-tight truncate break-all" title={formatAmount(totalINR, 'INR')}>
                {formatAmount(totalINR, 'INR')}
              </div>
            ) : (
              <div className="text-2xl sm:text-3xl font-black text-white tracking-tight truncate break-all" title={formatAmount(totalUSD, 'USD')}>
                {formatAmount(totalUSD, 'USD')}
              </div>
            )}
            <span className="text-[9px] text-gray-400 block mt-1 truncate">Directly payout configured via Bank / PayPal transfer.</span>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-full flex-shrink-0 group-hover:scale-110 transition-transform">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between overflow-hidden">
          <div className="space-y-1 min-w-0 flex-1 pr-2">
            <span className="text-[10px] text-gray-500 font-extrabold uppercase tracking-widest block">Latest Statement Period</span>
            <div className="text-lg sm:text-xl font-bold text-gray-200 truncate pr-1">
              {latestPeriod ? latestPeriod.month : 'Awaiting Period'}
            </div>
            <span className="text-[9px] text-indigo-400 font-semibold block mt-1.5 truncate" title={latestPeriod ? `${formatAmount(latestPeriod.amount, latestPeriod.currency)} processed` : 'Monthly ingestion pending'}>
              {latestPeriod ? `${formatAmount(latestPeriod.amount, latestPeriod.currency)} processed` : 'Monthly ingestion pending'}
            </span>
          </div>
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-full flex-shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-500 font-extrabold uppercase tracking-widest block">Audit Compliancy status</span>
            <div className="text-lg font-bold text-teal-400 flex items-center gap-1.5 mt-0.5">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>Verified Ledger</span>
            </div>
            <span className="text-[9px] text-gray-500 block mt-1">DSPs reporting pipelines fully operational.</span>
          </div>
          <div className="p-3 bg-teal-500/10 text-teal-400 rounded-full">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Breakdown Area */}
      {userReports.length === 0 ? (
        <div className="py-16 text-center bg-[#0e1424] rounded-2xl border border-slate-900 space-y-3" id="revenue_empty_block">
          <Wallet className="w-12 h-12 text-slate-705 mx-auto" />
          <h3 className="text-sm font-bold text-gray-300">No statements logged yet.</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Our finance administrators have not uploaded statements for your artist account yet. Log in as admin@g.g / 232323 to post custom monthly royalties for any artist!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6" id="revenue_data_grid">
          {/* Historical statements list */}
          <div className="md:col-span-6 space-y-4" id="rev_tables_layer">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Monthly Processing Cycles</h3>
            
            <div className="space-y-3" id="revenue_periods_stack">
              {userReports.map((item) => (
                <div 
                  key={item.id} 
                  className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between text-xs hover:border-slate-700 transition"
                >
                  <div className="space-y-1">
                    <span className="font-bold text-gray-100 block">{item.month} Statement</span>
                    <span className="text-[10px] text-gray-500 font-mono">ID ref: {item.id}</span>
                  </div>

                  <div className="text-right">
                    <span className="font-extrabold text-emerald-400 block">{formatAmount(item.amount, item.currency)}</span>
                    <span className="text-[9px] text-slate-400 flex items-center justify-end gap-1 font-semibold mt-1">
                      <ArrowUpRight className="w-3 h-3 text-emerald-500" /> Auto-Verified
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Breakdown on latest monthly period */}
          <div className="md:col-span-6 space-y-4" id="rev_breakdowns_layer">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Store / Metadata Share Breakdown</h3>

            {latestPeriod && (
              <div className="p-5 bg-slate-900 rounded-xl border border-slate-800 space-y-4" id="rev_latest_breakdown_box">
                <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400">{latestPeriod.month} Ledger Breakdown</span>
                  <span className="font-bold text-xs text-white">{formatAmount(latestPeriod.amount, latestPeriod.currency)}</span>
                </div>

                <div className="space-y-3" id="rev_stores_progress">
                  {latestPeriod.breakdown.map((item, idx) => {
                    const pct = Math.round((item.amount / latestPeriod.amount) * 100) || 0;
                    return (
                      <div key={idx} className="space-y-1 text-xs">
                        <div className="flex justify-between text-gray-300 font-medium">
                          <span>{item.releaseName}</span>
                          <span className="font-mono text-gray-400">
                            {formatAmount(item.amount, latestPeriod.currency)} ({pct}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full ${
                              idx === 0 ? 'bg-emerald-500' :
                              idx === 1 ? 'bg-indigo-500' :
                              'bg-cyan-500'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
