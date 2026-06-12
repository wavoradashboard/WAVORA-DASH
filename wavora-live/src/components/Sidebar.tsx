import React from 'react';
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
  const isAdmin = currentUser.email === 'admin@g.g';

  const menuItems = [
    { id: 'home', label: 'Home Feed', icon: Home, visible: !isAdmin },
    { id: 'new-release', label: 'New Release', icon: FilePlus2, visible: !isAdmin },
    { id: 'manage-artists', label: 'Manage Artists', icon: Users, visible: !isAdmin },
    { id: 'manage-labels', label: 'Manage Labels', icon: Tags, visible: true },
    { id: 'catalogue', label: 'Music Catalogue', icon: Layers, visible: !isAdmin },
    { id: 'revenue', label: 'Revenue Reports', icon: Wallet, visible: !isAdmin },
    { id: 'support', label: 'Help & Support', icon: HelpCircle, visible: !isAdmin },
    // Admin features visible to Admin
    { id: 'admin-panel', label: 'Administration Suite', icon: ShieldCheck, visible: isAdmin },
  ];

  const handleTabClick = (id: string) => {
    setCurrentTab(id);
    setIsOpenMobile(false);
  };

  const getPlanBadge = (plan: Plan) => {
    if (isAdmin) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#1DB954]/10 text-[#1DB954] border border-[#1DB954]/20 tracking-wide uppercase">
          🚀 Administrator
        </span>
      );
    }
    switch (plan) {
      case 'Elite':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-950/40 text-amber-505 border border-amber-600/30 tracking-wide uppercase">
            💎 Elite Tier
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
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#1F1F1F] text-gray-300 border border-[#2F2F2F] tracking-wide uppercase">
            🎵 Basic Tier
          </span>
        );
    }
  };

  return (
    <>
      {/* Mobile Top Bar / Full Height Overlay Menu */}
      {isOpenMobile ? (
        <div 
          className="md:hidden fixed inset-0 z-50 bg-[#0A0A0A] flex flex-col h-screen w-screen overflow-y-auto animate-fade-in"
          id="mobile_header_full_overlay"
        >
          {/* Top Row Header inside overlay */}
          <div className="flex items-center justify-between px-6 h-20 border-b border-[#1F1F1F] flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-[#1DB954] rounded-full flex items-center justify-center font-black text-black text-sm">W</div>
              <div>
                <span className="text-base font-black tracking-tighter uppercase text-white">Wavora <span className="text-[#1DB954]">Live</span></span>
                <div className="text-[9px] text-[#1DB954] font-mono tracking-widest uppercase">Digital Ingestions</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpenMobile(false)}
              className="p-2 rounded-lg hover:bg-[#121212] text-gray-350 transition cursor-pointer"
              id="btn_hamburger_close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation & Body inside overlay */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              {/* User identity capsule */}
              <div className="p-4 rounded-xl border border-[#1F1F1F] bg-[#121212]/40 text-left">
                <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1">Active Identity</div>
                <div className="font-bold text-sm text-white truncate">{currentUser.artistName}</div>
                <div className="text-xs text-gray-400 truncate mt-0.5">{currentUser.email}</div>
                <div className="mt-2.5">{getPlanBadge(currentUser.plan)}</div>
              </div>

              {/* Impersonation active warning in overlay */}
              {isImpersonating && (
                <div className="p-3 rounded-lg bg-orange-950/40 border border-orange-500/20 text-xs text-left animate-pulse">
                  <div className="font-bold text-orange-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Impersonation Active
                  </div>
                  <p className="text-gray-300 text-[10px] mt-1">Viewing artist portal for {currentUser.artistName}.</p>
                  <button
                    type="button"
                    onClick={() => { setIsOpenMobile(false); onExitImpersonation(); }}
                    className="w-full mt-2 py-1.5 px-2 rounded bg-orange-500 hover:bg-orange-600 text-white font-bold text-[10px] flex items-center justify-center gap-1 transition cursor-pointer"
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
                        className={`w-full text-left font-sans flex items-center gap-3.5 px-4 py-3 text-xs font-bold tracking-tight uppercase rounded-lg transition duration-150 cursor-pointer ${
                          isActive 
                            ? 'bg-[#1DB954]/10 text-[#1DB954] border-l-2 border-[#1DB954]' 
                            : 'text-gray-400 hover:text-white hover:bg-[#121212]'
                        }`}
                        id={`mobile_tab_${item.id}`}
                      >
                        <IconComponent className={`w-4 h-4 ${isActive ? 'text-[#1DB954]' : 'text-gray-450'}`} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
              </nav>
            </div>

            {/* Sign Out Console */}
            <div className="pt-4 border-t border-[#1F1F1F]">
              <button
                type="button"
                onClick={() => { setIsOpenMobile(false); onLogout(); }}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg text-xs font-bold tracking-tight uppercase text-red-500 hover:text-red-400 hover:bg-red-950/10 transition cursor-pointer border border-red-500/10"
                id="btn_sidebar_logout_mobile"
              >
                <LogOut className="w-4 h-4 text-red-500" />
                <span>Sign Out Console</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Normal Mobile Top Bar - Height of h-20 exactly matching Header */
        <div 
          className="md:hidden flex items-center justify-between bg-[#0A0A0A] border-b border-[#1F1F1F] px-6 h-20 sticky top-0 z-50 w-full"
          id="mobile_header_normal"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#1DB954] flex items-center justify-center font-black text-black text-sm">W</div>
            <div className="text-left">
              <span className="text-sm font-bold tracking-tighter uppercase text-white">Wavora <span className="text-[#1DB954]">Live</span></span>
              <div className="text-[9px] text-[#1DB954] font-mono tracking-widest uppercase">DSP Pipeline</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsOpenMobile(true)}
            className="p-2 rounded-lg hover:bg-[#121212] text-gray-350 transition cursor-pointer"
            id="btn_hamburger"
          >
            <MoreVertical className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Desktop Sidebar Container (Completely Hidden on Mobile devices) */}
      <aside 
        className={`hidden ${isSidebarCollapsed ? '' : 'md:flex'} md:sticky md:top-0 md:z-10 w-64 bg-[#0A0A0A] border-r border-[#1F1F1F] flex-col justify-between h-screen flex-shrink-0`}
        id="app_sidebar"
      >
        <div className="flex-1 flex flex-col">
          {/* Header Brand */}
          <div className="hidden md:flex items-center justify-between px-6 py-5 border-b border-[#1F1F1F]" id="sidebar_header_wrapper">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-[#1DB954] rounded-full flex items-center justify-center">
                <div className="w-1.5 h-4 bg-black"></div>
              </div>
              <div className="text-left">
                <span className="text-lg font-black tracking-tighter uppercase text-white">Wavora <span className="text-[#1DB954]">Live</span></span>
                <div className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">Digital DSP Pipeline</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(true)}
              className="p-1.5 rounded-lg hover:bg-[#121212] text-gray-400 hover:text-white transition cursor-pointer"
              id="btn_collapse_sidebar"
              title="Collapse Sidebar"
            >
              <Menu className="w-5 h-5 text-gray-400 hover:text-[#1DB954]" />
            </button>
          </div>

          {/* User profile capsule in sidebar */}
          <div className="px-6 py-4 border-b border-[#1F1F1F] bg-[#121212]/40 text-left">
            <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1">Active Identity</div>
            <div className="font-bold text-sm text-white truncate">{currentUser.artistName}</div>
            <div className="text-xs text-gray-400 truncate mt-0.5">{currentUser.email}</div>
            <div className="mt-2.5">{getPlanBadge(currentUser.plan)}</div>
          </div>

          {/* Impersonation alert */}
          {isImpersonating && (
            <div className="mx-4 my-3 p-3 rounded-lg bg-orange-950/40 border border-orange-500/20 text-xs text-left">
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
          <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto" id="sidebar_nav">
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
                    className={`w-full text-left font-sans flex items-center gap-3 px-3 py-2 text-xs font-bold tracking-tight uppercase rounded-lg transition duration-150 cursor-pointer ${
                      isActive 
                        ? 'bg-[#1DB954]/10 text-[#1DB954] border-l-2 border-[#1DB954]' 
                        : 'text-gray-400 hover:text-white hover:bg-[#121212]'
                    }`}
                    id={`sidebar_tab_${item.id}`}
                  >
                    <IconComponent className={`w-4 h-4 ${isActive ? 'text-[#1DB954]' : 'text-gray-450'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
          </nav>
        </div>

        {/* Footer controls */}
        <div className="p-4 border-t border-[#1F1F1F] bg-[#121212]/20">
          <button
            type="button"
            onClick={onLogout}
            className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold tracking-tight uppercase text-red-500 hover:text-red-400 hover:bg-red-950/10 transition cursor-pointer"
            id="btn_sidebar_logout"
          >
            <LogOut className="w-4 h-4 text-red-500" />
            <span>Sign Out Console</span>
          </button>
        </div>
      </aside>
    </>
  );
}
