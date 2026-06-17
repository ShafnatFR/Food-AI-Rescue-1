import React, { useState } from 'react';
import { UserData } from '../../types';
import { Sidebar } from './Sidebar';
import { TopAppBar } from './TopAppBar';
import type { SidebarNavAction } from './sidebarNavConfig';

interface DesktopLayoutProps {
  children: React.ReactNode;
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
  bottomNav?: React.ReactNode;
}

export const DesktopLayout: React.FC<DesktopLayoutProps> = ({
  children,
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
  bottomNav,
}) => {
  const [isSidebarHidden, setIsSidebarHidden] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-[#FDFBF7] text-stone-900 dark:bg-stone-950 dark:text-white md:flex-row">
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        profileInitialTab={profileInitialTab}
        setProfileInitialTab={setProfileInitialTab}
        role={role}
        currentUser={currentUser}
        onLogout={onLogout}
        notificationsCount={notificationsCount}
        appSettings={appSettings}
        onSidebarAction={onSidebarAction}
        sidebarContext={sidebarContext}
        volunteerTab={volunteerTab}
        isSidebarHidden={isSidebarHidden}
      />

      <div className="flex min-h-screen flex-1 flex-col overflow-x-hidden">
        <TopAppBar
          currentUser={currentUser}
          notificationsCount={notificationsCount}
          onOpenNotifications={() => setCurrentView('notifications')}
          onOpenProfile={() => {
            setProfileInitialTab('main');
            setCurrentView('profile');
          }}
          isSidebarHidden={isSidebarHidden}
          onToggleSidebar={() => setIsSidebarHidden(!isSidebarHidden)}
        />

        <main className={`flex-1 transition-all duration-300 md:mt-16 ${isSidebarHidden ? 'md:ml-0' : 'md:ml-[280px]'}`}>
          <div className="desktop-canvas animate-view-enter mx-auto w-full max-w-desktop">
            {children}
          </div>
        </main>

        {bottomNav}
      </div>
    </div>
  );
};

