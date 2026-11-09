import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  FilePlus2, 
  Users, 
  Tags, 
  Layers, 
  Wallet, 
  HelpCircle, 
  LogOut, 
  ShieldCheck, 
  Sparkles,
  ArrowLeftRight,
  MoreVertical,
  X,
  Menu
} from 'lucide-react';
import { Plan, User } from '../types';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentUser: User;
  onLogout: () => void;
  isImpersonating: boolean;
  onExitImpersonation: () => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
}

export default function Sidebar({
  currentTab,
  setCurrentTab,
  currentUser,
  onLogout,
  isImpersonating,
  onExitImpersonation,
  isOpenMobile,
  setIsOpenMobile,
  isSidebarCollapsed,
  setIsSidebarCollapsed
}: SidebarProps) {
  const isBasic = currentUser.plan === 'Basic';
  const isPro = currentUser.plan === 'Pro';
  const isElite = currentUser.plan === 'Elite';
  const isAdmin = currentUser.email.toLowerCase() === 'admin@g.g' || currentUser.email.toLowerCase() === 'wavoralive@gmail.com' || currentUser.email.toLowerCase() === 'wavoradashboard@gmail.com';

  const menuItems = [
    { id: 'home', label: 'Home Feed', icon: Home, visible: !isAdmin },
    { id: 'new-release', label: 'New Release', icon: FilePlus2, visible: !isAdmin },
    { id: 'manage-artists', label: isAdmin ? 'Artist DB' : 'Manage Artists', icon: Users, visible: true },
    { id: 'manage-labels', label: isAdmin ? 'Label DB' : 'Manage Labels', icon: Tags, visible: true },
    { id: 'catalogue', label: 'Music Catalogue', icon: Layers, visible: !isAdmin },
    { id: 'revenue', label: 'Revenue Reports', icon: Wallet, visible: !isAdmin },
    { id: 'support', label: 'Help & Support', icon: HelpCircle, visible: !isAdmin },
    // Admin features visible to Admin
    { id: 'admin-panel', label: 'Administration Suite', icon: ShieldCheck, visible: isAdmin },
    { id: 'member-pool', label: 'Member Pool', icon: Users, visible: isAdmin },
  ];

  const handleTabClick = (id: string) => {
    setCurrentTab(id);
    setIsOpenMobile(false);
  };

  const getPlanBadge = (plan: Plan) => {
    if (isAdmin) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#6366F1]/10 text-[#6366F1] border border-[#6366F1]/20 tracking-wide uppercase">
          🚀 Administrator
        </span>
      );
    }
    switch (plan) {
      case 'Elite':
        return (
          <span className="px-3 py-1 rounded-full text-[10px] font-black bg-gradient-to-r from-amber-500/25 via-amber-400/15 to-amber-500/25 text-amber-300 border border-amber-500/40 tracking-wider uppercase inline-flex items-center gap-1 shadow-sm shadow-amber-500/20">
            <Sparkles className="w-3 h-3 text-amber-400" /> VIP Elite Member
          </span>
        );
      case 'Pro':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-950/40 text-purple-400 border border-purple-500/30 tracking-wide uppercase">
            ⚡ Pro Tier
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[rgba(255,255,255,0.1)] text-gray-300 border border-[#2F2F2F] tracking-wide uppercase">
            🎵 Basic Tier
          </span>
        );
    }
  };

  return (
    <>
      <AnimatePresence>
        {/* Mobile Navigation Drawer Backdrop & Slide-out Panel with Gestures */}
        {isOpenMobile && (
          <div className="lg:hidden fixed inset-0 z-[110]" id="mobile_nav_drawer_root">
            {/* Backdrop with rich blur */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setIsOpenMobile(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl cursor-pointer z-0"
              id="mobile_drawer_backdrop"
            />

            {/* Slide-out Drawer Panel with Drag-to-Close Gesture */}
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              drag="x"
              dragConstraints={{ left: -320, right: 0 }}
              dragElastic={{ left: 0.25, right: 0 }}
              onDragEnd={(_, info) => {
                if (info.offset.x < -60 || info.velocity.x < -200) {
                  setIsOpenMobile(false);
                }
              }}
              className="absolute top-0 left-0 bottom-0 w-[85vw] max-w-xs sm:max-w-sm bg-gradient-to-b from-[#0a0e1c] via-[#070914] to-black border-r border-indigo-500/20 shadow-2xl flex flex-col h-[100dvh] z-10 touch-pan-y"
              id="mobile_drawer_panel"
            >
              {/* Drag Handle Indicator Pill */}
              <div className="pt-3 pb-1 flex justify-center">
                <div className="w-10 h-1 rounded-full bg-slate-700/60" title="Swipe left to close" />
              </div>

              {/* Header inside drawer */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 shrink-0">
                <div>
                  <span className="text-base font-black tracking-tighter uppercase text-white">Wavora <span className="text-[#6366F1]">Live</span></span>
                  <div className="text-[9px] text-[#6366F1] font-mono tracking-widest uppercase">Digital Ingestions</div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpenMobile(false)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition cursor-pointer active:scale-95"
                  id="btn_drawer_close"
                  title="Close Menu (or swipe left)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Body & Nav Links */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5 flex flex-col">
                {/* Active user profile capsule */}
                <div className="p-4 rounded-2xl border border-indigo-500/20 bg-slate-900/60 text-left shadow-md">
                  <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">Active Identity</div>
                  <div className="font-extrabold text-sm text-white truncate">{currentUser.artistName}</div>
                  <div className="text-xs text-indigo-300 truncate mt-0.5">{currentUser.email}</div>
                  <div className="mt-2.5">{getPlanBadge(currentUser.plan)}</div>
                </div>

                {/* Impersonation active alert */}
                {isImpersonating && (
                  <div className="p-3 rounded-xl bg-orange-950/40 border border-orange-500/20 text-xs text-left animate-pulse">
                    <div className="font-bold text-orange-400 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Impersonation Active
                    </div>
                    <p className="text-gray-300 text-[10px] mt-1">Viewing portal for {currentUser.artistName}.</p>
                    <button
                      type="button"
                      onClick={() => { setIsOpenMobile(false); onExitImpersonation(); }}
                      className="w-full mt-2 py-1.5 px-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-[10px] flex items-center justify-center gap-1 transition cursor-pointer"
                      id="btn_exit_impersonate_mobile"
                    >
                      <ArrowLeftRight className="w-3 h-3" /> Back to Admin
                    </button>
                  </div>
                )}

                {/* Navigation Menu Links */}
                <nav className="space-y-1.5" id="mobile_nav_menu">
                  {menuItems
                    .filter(item => item.visible)
                    .map((item) => {
                      const IconComponent = item.icon;
                      const isActive = currentTab === item.id;
                      return (
                        <button
                          type="button"
                          key={item.id}
                          onClick={() => handleTabClick(item.id)}
                          className={`w-full text-left flex items-center gap-3.5 px-4 py-3 text-xs font-bold tracking-tight uppercase rounded-xl transition duration-150 cursor-pointer ${
                            isActive 
                              ? 'bg-[#6366F1]/15 text-[#6366F1] border-l-4 border-[#6366F1] font-black' 
                              : 'text-slate-300 hover:text-white hover:bg-white/5'
                          }`}
                          id={`mobile_tab_${item.id}`}
                        >
                          <IconComponent className={`w-4 h-4 ${isActive ? 'text-[#6366F1]' : 'text-slate-400'}`} />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                </nav>

                {/* Swipe hint */}
                <div className="mt-auto pt-4 text-center">
                  <span className="text-[10px] text-slate-500 font-mono italic">
                    ← Swipe left anywhere on drawer to close
                  </span>
                </div>
              </div>

              {/* Bottom Sign Out Bar */}
              <div className="p-4 border-t border-white/10 bg-slate-950/80">
                <button
                  type="button"
                  onClick={() => { setIsOpenMobile(false); onLogout(); }}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-xs font-bold tracking-tight uppercase text-red-400 hover:text-red-300 hover:bg-red-950/20 transition cursor-pointer border border-red-500/20"
                  id="btn_sidebar_logout_mobile"
                >
                  <LogOut className="w-4 h-4 text-red-400" />
                  <span>Sign Out Console</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar Container (Completely Hidden on Mobile devices) */}
      <motion.aside 
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
        className={`hidden ${isSidebarCollapsed ? '' : 'lg:flex'} lg:sticky lg:top-4 lg:z-10 w-64 bg-[#070710] border border-white/10 rounded-[2rem] flex-col h-[calc(100vh-2rem)] flex-shrink-0 lg:ml-4 shadow-2xl shadow-indigo-500/10 overflow-hidden`}
        id="app_sidebar"
      >
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 flex flex-col border-b border-white/10 overflow-hidden">
            {/* Header Brand */}
            <div className="hidden lg:flex items-center justify-between px-6 py-5 border-b border-white/10 shrink-0" id="sidebar_header_wrapper">
              <div className="flex items-center gap-2.5">
                <div className="text-left">
                  <span className="text-lg font-black tracking-tighter uppercase text-white">Wavora <span className="text-[#6366F1]">Live</span></span>
                  <div className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">Digital DSP Pipeline</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSidebarCollapsed(true)}
                className="p-1.5 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition cursor-pointer"
                id="btn_collapse_sidebar"
                title="Collapse Sidebar"
              >
                <Menu className="w-5 h-5 text-gray-400 hover:text-[#6366F1]" />
              </button>
            </div>

            {/* User profile capsule in sidebar */}
            <div className={`px-6 py-4 border-b text-left shrink-0 transition-all ${
              isElite 
                ? 'bg-gradient-to-r from-amber-950/40 via-slate-900 to-indigo-950/40 border-amber-500/30 border-l-4 border-l-amber-400 shadow-md shadow-amber-950/40' 
                : 'bg-white/5 border-white/10'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Active Identity</span>
                {isElite && (
                  <span className="text-[9px] text-amber-300 font-black uppercase tracking-wider bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/30">
                    VIP GOLD
                  </span>
                )}
              </div>
              <div className="font-bold text-sm text-white truncate">{currentUser.artistName}</div>
              <div className="text-xs text-slate-300 truncate mt-0.5">{currentUser.email}</div>
              <div className="mt-2.5">{getPlanBadge(currentUser.plan)}</div>
            </div>

            {/* Impersonation alert */}
            {isImpersonating && (
              <div className="mx-4 my-3 p-3 rounded-xl bg-orange-950/40 border border-orange-500/20 text-xs text-left shrink-0">
                <div className="font-bold text-orange-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Impersonation Active
                </div>
                <p className="text-gray-300 text-[10px] mt-1">Viewing artist portal for {currentUser.artistName}.</p>
                <button
                  type="button"
                  onClick={onExitImpersonation}
                  className="w-full mt-2 py-1 px-2 rounded bg-orange-500 hover:bg-orange-600 text-white font-bold text-[10px] flex items-center justify-center gap-1 transition cursor-pointer"
                  id="btn_exit_impersonate"
                >
                  <ArrowLeftRight className="w-3 h-3" /> Back to Admin
                </button>
              </div>
            )}

            {/* Navigation Links */}
            <nav className="py-4 px-3 space-y-1 overflow-y-auto flex-1 scrollbar-hide" id="sidebar_nav">
              {menuItems
                .filter(item => item.visible)
                .map((item, index) => {
                  const IconComponent = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <motion.button
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      type="button"
                      key={item.id}
                      onClick={() => handleTabClick(item.id)}
                      className={`w-full text-left font-sans flex items-center gap-3 px-3 py-2 text-xs font-bold tracking-tight uppercase rounded-xl transition duration-150 cursor-pointer ${
                        isActive 
                          ? 'bg-[#6366F1]/10 text-[#6366F1] border-l-2 border-[#6366F1]' 
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                      id={`sidebar_tab_${item.id}`}
                    >
                      <IconComponent className={`w-4 h-4 ${isActive ? 'text-[#6366F1]' : 'text-gray-450'}`} />
                      <span>{item.label}</span>
                    </motion.button>
                  );
                })}
            </nav>
          </div>

          {/* Footer controls */}
          <div className="p-4 bg-white/5 mt-auto">
            <button
              type="button"
              onClick={onLogout}
              className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold tracking-tight uppercase text-red-500 hover:text-red-400 hover:bg-red-950/10 transition cursor-pointer"
              id="btn_sidebar_logout"
            >
              <LogOut className="w-4 h-4 text-red-500" />
              <span>Sign Out Console</span>
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
