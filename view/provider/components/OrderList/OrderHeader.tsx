
import React from 'react';
import { ShoppingBag, Search, RefreshCw, Loader2, CheckCircle2, Clock } from 'lucide-react';
import { Input } from '../../../components/Input';

interface OrderHeaderProps {
    searchQuery: string;
    setSearchQuery: (val: string) => void;
    currentTab: 'WAITING' | 'ACTIVE';
    setCurrentTab: (tab: 'WAITING' | 'ACTIVE') => void;
    waitingCount: number;
    activeCount: number;
    onRefresh?: () => void;
    isLoading?: boolean;
}

export const OrderHeader: React.FC<OrderHeaderProps> = ({ 
    searchQuery, setSearchQuery, 
    currentTab, setCurrentTab,
    waitingCount, activeCount,
    onRefresh, isLoading 
}) => (
    <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
                <h2 className="text-2xl font-black text-stone-900 dark:text-white tracking-tight flex items-center gap-2">
                    <ShoppingBag className="w-6 h-6 text-orange-500" /> Kelola Pesanan
                </h2>
                <p className="text-sm text-stone-500">Tinjau permintaan dan kelola pesanan yang sedang berlangsung.</p>
            </div>
        <div className="flex gap-2 w-full md:w-auto">
            <div className="flex-1 md:w-64">
                <Input 
                    label="" 
                    placeholder="Cari pesanan..." 
                    icon={<Search className="w-4 h-4" />} 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-10"
                />
            </div>
            {onRefresh && (
                <button
                    onClick={onRefresh}
                    disabled={isLoading}
                    className="h-10 px-4 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-wider hover:bg-stone-50 dark:hover:bg-stone-700 transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                    <span className="hidden sm:inline">Refresh</span>
                </button>
            )}
        </div>
        </div>

        <div className="flex gap-2 border-b border-stone-200 dark:border-stone-800 overflow-x-auto no-scrollbar">
            <button
                onClick={() => setCurrentTab('WAITING')}
                className={`pb-4 px-2 text-sm font-bold flex items-center gap-2 transition-all relative ${currentTab === 'WAITING' ? 'text-orange-600' : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'}`}
            >
                <Clock className="w-4 h-4" />
                Menunggu Persetujuan
                {waitingCount > 0 && (
                    <span className="bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 text-xs py-0.5 px-2 rounded-full font-black">
                        {waitingCount}
                    </span>
                )}
                {currentTab === 'WAITING' && (
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-600 rounded-t-full"></div>
                )}
            </button>
            <button
                onClick={() => setCurrentTab('ACTIVE')}
                className={`pb-4 px-2 text-sm font-bold flex items-center gap-2 transition-all relative ${currentTab === 'ACTIVE' ? 'text-blue-600' : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'}`}
            >
                <CheckCircle2 className="w-4 h-4" />
                Sedang Aktif
                {activeCount > 0 && (
                    <span className="bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 text-xs py-0.5 px-2 rounded-full font-black">
                        {activeCount}
                    </span>
                )}
                {currentTab === 'ACTIVE' && (
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></div>
                )}
            </button>
        </div>
    </div>
);
