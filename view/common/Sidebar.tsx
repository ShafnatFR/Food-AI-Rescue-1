import React from 'react';
import { LogOut, Sparkles, PlusCircle } from 'lucide-react';
import { UserData } from '../../types';
import {
  getSidebarConfig,
  SIDEBAR_FOOTER,
  isSidebarItemActive,
  type SidebarNavAction,
} from './sidebarNavConfig';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  profileInitialTab: string;
  setProfileInitialTab: (tab: string) => void;
  role: string | null;
  currentUser: UserData | null;
  onLogout: () => void;
  notificationsCount?: number;
  appSettings?: Record<string, unknown>;
  onSidebarAction?: (action: SidebarNavAction) => void;
  sidebarContext?: React.ReactNode;
  volunteerTab?: string;
  isSidebarHidden?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  setCurrentView,
  profileInitialTab,
  setProfileInitialTab,
  role,
  currentUser,
  onLogout,
  notificationsCount = 0,
  appSettings,
  onSidebarAction,
  sidebarContext,
  volunteerTab,
  isSidebarHidden = false,
}) => {
  const config = getSidebarConfig(role);
  if (!config) return null;

  const appName = (appSettings?.appName as string) || 'Food AI Rescue';
  const appNameParts = appName.split(' ');

  const handleAction = (action: SidebarNavAction) => {
    if (action.kind === 'view') {
      if (action.profileTab) setProfileInitialTab(action.profileTab);
      else setProfileInitialTab('main');
      setCurrentView(action.view);
      return;
    }
    onSidebarAction?.(action);
  };

  return (
    <aside className={`fixed left-0 top-0 z-50 hidden h-screen w-[280px] shrink-0 flex-col overflow-hidden border-r border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900 md:flex transition-transform duration-300 ${isSidebarHidden ? '-translate-x-full' : 'translate-x-0'}`}>
      {/* Header / Logo */}
      <div className="px-6 pb-4 pt-8 relative">
        <button
          type="button"
          className="group flex w-full items-center gap-3 text-left"
          onClick={() => {
            setProfileInitialTab('main');
            setCurrentView('dashboard');
          }}
        >
          <img src="/assets/logo-secondary.svg" alt="Logo" className="h-10 w-auto object-contain transition-transform group-hover:scale-105" />
        </button>
        {/* Toggle Button Inside Sidebar */}
        <button 
          onClick={() => {
            const btn = document.querySelector('header button[title="Sembunyikan Sidebar"]') as HTMLButtonElement;
            if(btn) btn.click();
          }}
          className="absolute right-4 top-8 p-2 rounded-xl text-stone-400 hover:bg-stone-100 hover:text-stone-900 transition-colors"
          title="Sembunyikan Sidebar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/><path d="m16 15-3-3 3-3"/></svg>
        </button>
      </div>

      {/* Optional context slot (e.g. volunteer active mission) */}
      {sidebarContext && <div className="px-6 pb-4">{sidebarContext}</div>}

      {/* CTA */}
      {config.cta && (
        <div className="px-4 pb-4">
          <button
            type="button"
            onClick={() => handleAction(config.cta!.action)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-orange-700 active:scale-95"
          >
            <PlusCircle className="h-4 w-4" />
            {config.cta.label}
          </button>
        </div>
      )}

      {/* Main Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {config.items.map((item) => {
          const active = isSidebarItemActive(item, currentView, profileInitialTab, volunteerTab);
          const badge = item.showBadge && notificationsCount > 0 ? notificationsCount : undefined;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleAction(item.action)}
              className={`flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 transition-all ${
                active
                  ? 'bg-orange-50 text-orange-600 dark:bg-orange-950/20'
                  : 'text-stone-500 hover:bg-stone-50 hover:text-stone-900 dark:hover:bg-stone-800/50 dark:hover:text-white'
              }`}
            >
              <div className="flex min-w-0 items-center gap-3">
                <item.icon className={`h-5 w-5 shrink-0 ${active ? 'text-orange-600' : ''}`} />
                <span className="truncate text-[11px] font-black uppercase tracking-widest">{item.label}</span>
              </div>
              {badge !== undefined && (
                <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-orange-600 px-1.5 text-[8px] font-black text-white">
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer links */}
      <div className="border-t border-stone-100 px-3 py-3 dark:border-stone-800">
        {SIDEBAR_FOOTER.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleAction(item.action)}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-stone-500 transition-colors hover:bg-stone-50 hover:text-stone-900 dark:hover:bg-stone-800/50 dark:hover:text-white"
          >
            <item.icon className="h-4 w-4 shrink-0" />
            <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </div>

      {/* User block */}
      <div className="border-t border-stone-100 bg-stone-50/50 p-4 dark:border-stone-800 dark:bg-stone-800/30">
        <div className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-3 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-100 to-orange-200 text-xs font-black uppercase italic text-orange-600 dark:from-orange-900/30 dark:to-orange-800/30">
            {currentUser?.name?.charAt(0) || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[10px] font-black uppercase italic tracking-tight text-stone-900 dark:text-white">
              {currentUser?.name || 'User'}
            </p>
            <p className="truncate text-[8px] font-bold uppercase tracking-widest text-stone-400">
              {role?.replace(/_/g, ' ') || 'Guest'}
            </p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="rounded-xl p-2 text-stone-400 transition-all hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
            title="Keluar"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
