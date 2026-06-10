import React from 'react';
import { Home, Box, History, User, LogOut, Bell, Sparkles, ChevronRight } from 'lucide-react';
import { UserData } from '../../types';

interface SidebarProps {
    currentView: string;
    setCurrentView: (view: string) => void;
    profileInitialTab: string;
    setProfileInitialTab: (tab: string) => void;
    role: string | null;
    currentUser: UserData | null;
    onLogout: () => void;
    notificationsCount?: number;
    appSettings?: any;
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
    appSettings
}) => {

    const [isCollapsed, setIsCollapsed] = React.useState(false);

    // Helper to check active state
    const isActive = (view: string, tab?: string) => {
        if (tab) {
            return currentView === view && profileInitialTab === tab;
        }
        return currentView === view;
    };

    const navItems = [
        { 
            id: 'dashboard', 
            label: 'Home', 
            icon: Home, 
            onClick: () => { setProfileInitialTab('main'); setCurrentView('dashboard'); } 
        },
        // Role specific items
        ...((role === 'individual_donor' || role === 'corporate_donor') ? [
            { 
                id: 'inventory', 
                label: 'Stok Makanan', 
                icon: Box, 
                onClick: () => { setCurrentView('inventory'); }
            }
        ] : []),
        // 'Misi Relawan' hidden — volunteer navigates via dashboard tabs
        ...(role === 'recipient' ? [
            { 
                id: 'history', 
                label: 'Riwayat Klaim', 
                icon: History, 
                onClick: () => { setProfileInitialTab('history'); setCurrentView('profile'); }
            }
        ] : []),
        { 
            id: 'notifications', 
            label: 'Notifikasi', 
            icon: Bell, 
            badge: notificationsCount > 0 ? notificationsCount : undefined,
            onClick: () => { setCurrentView('notifications'); }
        },
        { 
            id: 'profile', 
            label: 'Profil Saya', 
            icon: User, 
            onClick: () => { setProfileInitialTab('main'); setCurrentView('profile'); }
        }
    ];

    return (
        <aside className={`hidden md:flex ${isCollapsed ? 'w-24' : 'w-72'} bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800 flex-col h-screen sticky top-0 z-50 overflow-hidden shrink-0 transition-all duration-500 ease-in-out`}>
            {/* Header / Logo */}
            <div className={`p-8 transition-all duration-500 ${isCollapsed ? 'px-6' : 'px-8'}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 group cursor-pointer" onClick={() => { setProfileInitialTab('main'); setCurrentView('dashboard'); }}>
                        <div className="w-10 h-10 bg-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-600/20 group-hover:scale-110 transition-transform shrink-0">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        {!isCollapsed && (
                            <div className="animate-in fade-in slide-in-from-left-2 duration-500">
                                <h1 className="text-xl font-black text-stone-900 dark:text-white leading-none italic uppercase tracking-tighter">
                                    {(appSettings?.appName || 'Food AI Rescue').split(' ')[0]}
                                </h1>
                                <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">
                                    {(appSettings?.appName || 'Food AI Rescue').split(' ').slice(1).join(' ')}
                                </p>
                            </div>
                        )}

                    </div>
                </div>
            </div>

            {/* Collapse Toggle Button - Floating at the edge or fixed */}
            <div className="relative h-0 overflow-visible w-full">
                <button 
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -right-4 -top-6 w-9 h-9 bg-white dark:bg-stone-800 border-2 border-stone-100 dark:border-stone-700 rounded-full flex items-center justify-center text-stone-400 hover:text-orange-600 shadow-lg z-50 transition-all hover:scale-110 active:scale-95 group/toggle"
                >
                    <ChevronRight className={`w-5 h-5 transition-transform duration-500 ${isCollapsed ? '' : 'rotate-180'} group-hover/toggle:scale-110`} />
                </button>
            </div>

            {/* Nav Links */}
            <nav className={`flex-1 ${isCollapsed ? 'px-4' : 'px-4'} space-y-1.5 mt-4 transition-all duration-500`}>
                {navItems.map((item) => {
                    // Check if actually active
                    let active = false;
                    if (item.id === 'dashboard') active = currentView === 'dashboard';
                    else if (item.id === 'profile') active = currentView === 'profile' && profileInitialTab !== 'history';
                    else if (item.id === 'history') active = currentView === 'profile' && profileInitialTab === 'history';
                    else active = currentView === item.id;
                    
                    return (
                        <button
                            key={item.id}
                            onClick={item.onClick}
                            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} p-3.5 rounded-2xl transition-all group relative ${
                                active
                                    ? 'bg-orange-50 dark:bg-orange-950/20 text-orange-600'
                                    : 'text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-800/50 hover:text-stone-900 dark:hover:text-white'
                            }`}
                        >
                            <div className="flex items-center gap-3.5">
                                <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${active ? 'fill-orange-600/10' : ''} shrink-0`} />
                                {!isCollapsed && (
                                    <span className="text-[11px] font-black uppercase tracking-widest animate-in fade-in slide-in-from-left-2 duration-500 whitespace-nowrap">
                                        {item.label}
                                    </span>
                                )}
                            </div>
                            
                            {item.badge && (
                                <span className={`bg-orange-600 text-white text-[8px] font-black rounded-full h-5 flex items-center justify-center transition-all duration-500 ${
                                    isCollapsed ? 'absolute -top-1 -right-1 min-w-[1.25rem]' : 'px-1.5 min-w-[1.25rem]'
                                }`}>
                                    {item.badge}
                                </span>
                            )}

                            {!isCollapsed && active && (
                                <ChevronRight className="w-3.5 h-3.5 animate-in fade-in slide-in-from-left-1 duration-500" />
                            )}

                            {/* Tooltip for collapsed mode */}
                            {isCollapsed && (
                                <div className="absolute left-full ml-4 px-3 py-2 bg-stone-900 text-white text-[9px] font-black uppercase tracking-widest rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-[100] whitespace-nowrap shadow-xl">
                                    {item.label}
                                </div>
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* User Profile Badge */}
            <div className={`p-4 border-t border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/30 transition-all duration-500 ${isCollapsed ? 'px-4' : 'px-4'}`}>
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} p-3 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm transition-all hover:border-orange-200 dark:hover:border-orange-900/40 cursor-default group/user`}>
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 flex items-center justify-center text-orange-600 font-black text-xs uppercase italic shrink-0">
                        {currentUser?.name?.charAt(0) || 'U'}
                    </div>
                    
                    {!isCollapsed && (
                        <div className="flex-1 min-w-0 animate-in fade-in slide-in-from-left-2 duration-500">
                            <p className="text-[10px] font-black text-stone-900 dark:text-white truncate uppercase italic tracking-tight">{currentUser?.name || 'User Name'}</p>
                            <p className="text-[8px] font-bold text-stone-400 uppercase tracking-widest truncate">{role?.replace('_', ' ') || 'Guest'}</p>
                        </div>
                    )}

                    {!isCollapsed && (
                        <button 
                            onClick={onLogout}
                            className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all active:scale-95"
                            title="Keluar Aplikasi"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    )}

                    {/* Tooltip for logout in collapsed mode */}
                    {isCollapsed && (
                        <button 
                            onClick={onLogout}
                            className="absolute left-full ml-4 px-3 py-2 bg-red-600 text-white text-[9px] font-black uppercase tracking-widest rounded-lg opacity-0 pointer-events-none group-hover/user:opacity-100 transition-opacity z-[100] whitespace-nowrap shadow-xl"
                        >
                            Logout
                        </button>
                    )}
                </div>
                
                {!isCollapsed && (
                    <div className="mt-4 flex flex-col items-center gap-1 opacity-40 animate-in fade-in duration-700">
                        <p className="text-[8px] font-black text-stone-400 uppercase tracking-[0.2em]">Build v2.4.9</p>
                        <div className="flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-green-500"></span>
                            <p className="text-[7px] font-bold text-stone-500 uppercase tracking-widest">System Operational</p>
                        </div>
                    </div>
                )}
                {isCollapsed && (
                    <div className="mt-4 flex justify-center opacity-40">
                         <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    </div>
                )}
            </div>
        </aside>
    );
};
