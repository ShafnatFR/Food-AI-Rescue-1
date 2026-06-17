import React from 'react';
import { Bell, Search, User, Menu } from 'lucide-react';
import { UserData } from '../../types';

interface TopAppBarProps {
  currentUser: UserData | null;
  notificationsCount?: number;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  searchPlaceholder?: string;
  isSidebarHidden?: boolean;
  onToggleSidebar?: () => void;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  currentUser,
  notificationsCount = 0,
  onOpenNotifications,
  onOpenProfile,
  searchPlaceholder = 'Cari...',
  isSidebarHidden = false,
  onToggleSidebar,
}) => {
  return (
    <header className={`hidden md:flex fixed top-0 right-0 z-40 h-16 items-center justify-between border-b border-stone-200 bg-white/80 px-8 backdrop-blur-md dark:border-stone-800 dark:bg-stone-900/80 transition-all duration-300 ${isSidebarHidden ? 'w-full ml-0' : 'w-[calc(100%-280px)] ml-[280px]'}`}>
      <div className="flex items-center gap-4 flex-1">
        {onToggleSidebar && (
          <button 
            onClick={onToggleSidebar}
            className="p-2 -ml-2 rounded-xl hover:bg-stone-100 text-stone-500 hover:text-stone-900 dark:hover:bg-stone-800 dark:hover:text-white transition-colors"
            title={isSidebarHidden ? "Tampilkan Sidebar" : "Sembunyikan Sidebar"}
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        
        <div className="flex max-w-xl flex-1 items-center rounded-full border border-stone-200 bg-white px-4 py-2 transition-all focus-within:border-orange-600 focus-within:ring-1 focus-within:ring-orange-600 dark:border-stone-700 dark:bg-stone-900">
          <Search className="mr-2 h-4 w-4 shrink-0 text-stone-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="w-full border-none bg-transparent p-0 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-0 dark:text-white"
            readOnly
            aria-label="Pencarian"
          />
        </div>
      </div>

      <div className="ml-6 flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenNotifications}
          className="relative rounded-full p-2 text-stone-500 transition-colors hover:bg-stone-50 hover:text-orange-600 dark:hover:bg-stone-800"
          aria-label="Notifikasi"
        >
          <Bell className="h-5 w-5" />
          {notificationsCount > 0 && (
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border-2 border-white bg-orange-600 dark:border-stone-900" />
          )}
        </button>

        <div className="mx-1 h-8 w-px bg-stone-200 dark:bg-stone-700" />

        <button
          type="button"
          onClick={onOpenProfile}
          className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-stone-200 bg-gradient-to-br from-orange-100 to-orange-200 text-xs font-black uppercase text-orange-600 transition-opacity hover:opacity-90 dark:border-stone-700 dark:from-orange-900/30 dark:to-orange-800/30"
          aria-label="Profil"
        >
          {currentUser?.avatar ? (
            <img src={currentUser.avatar} alt="" className="h-full w-full object-cover" />
          ) : (
            <User className="h-4 w-4" />
          )}
        </button>
      </div>
    </header>
  );
};
