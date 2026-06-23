import React from 'react';
import { Skeleton } from '../../components/Skeleton';

export const AdminImpactSkeleton: React.FC = () => {
    return (
        <div className="space-y-8 animate-in fade-in pb-20 px-1">
            {/* Header & Filter */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <Skeleton className="h-8 w-64 mb-2" />
                    <Skeleton className="h-3 w-48 border-l-2 border-orange-500 pl-3" />
                </div>
                <div className="flex flex-wrap items-center gap-3 bg-stone-100 dark:bg-stone-800 p-1.5 rounded-2xl border border-stone-200 dark:border-stone-700">
                    <Skeleton className="h-10 w-20 rounded-xl" />
                    <Skeleton className="h-10 w-20 rounded-xl" />
                    <Skeleton className="h-10 w-20 rounded-xl" />
                </div>
            </div>
            
            {/* Top Row: Primary Impacts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2].map((i) => (
                    <div key={i} className="bg-white dark:bg-stone-900 p-8 rounded-[2.5rem] border border-stone-200 dark:border-stone-800 shadow-sm relative overflow-hidden flex flex-col justify-between h-80">
                        <div>
                            <Skeleton className="h-4 w-48 mb-6" />
                            <div className="flex items-baseline gap-2">
                                <Skeleton className="h-16 w-32" />
                                <Skeleton className="h-6 w-10" />
                            </div>
                        </div>
                        <div className="mt-10">
                            <div className="flex items-center justify-between mb-2">
                                <Skeleton className="h-3 w-32" />
                                <Skeleton className="h-3 w-24" />
                            </div>
                            {/* Bar Chart Proxy */}
                            <div className="flex items-end gap-2 h-40 mt-6 w-full px-2 opacity-30">
                                {[1, 2, 3, 4, 5, 6, 7].map((bar) => (
                                    <div key={bar} className="flex-1 flex flex-col justify-end h-full">
                                        <Skeleton className="w-full rounded-t-lg" style={{ height: `${Math.random() * 80 + 10}%` }} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* KPI Strategi Row */}
            <div className="bg-stone-900 rounded-[3rem] p-8 md:p-12 shadow-3xl border border-stone-800 relative overflow-hidden">
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 items-center relative z-10">
                    
                    {/* Left Column: Management */}
                    <div className="xl:col-span-4 space-y-8">
                        <div>
                            <Skeleton className="h-6 w-32 rounded-full mb-6" />
                            <Skeleton className="h-12 w-64 mb-4" />
                            <Skeleton className="h-4 w-full max-w-sm" />
                            <Skeleton className="h-4 w-48 mt-2" />
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-stone-800/50 border border-stone-700 p-5 rounded-3xl flex items-center justify-between">
                                    <div className="space-y-2">
                                        <Skeleton className="h-3 w-20" />
                                        <Skeleton className="h-8 w-32" />
                                    </div>
                                    <Skeleton className="w-10 h-10 rounded-xl" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Visuals */}
                    <div className="xl:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-stone-800/30 p-6 md:p-10 rounded-[2.5rem] border border-stone-700">
                        {/* Chart Area */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-2">
                                    <Skeleton className="h-3 w-32" />
                                    <Skeleton className="h-8 w-24" />
                                </div>
                                <div className="space-y-2 text-right">
                                    <Skeleton className="h-6 w-16 ml-auto" />
                                    <Skeleton className="h-2 w-24 ml-auto" />
                                </div>
                            </div>
                            <div className="flex items-end gap-2 h-32 mt-6 w-full px-2 opacity-30">
                                {[1, 2, 3, 4, 5, 6, 7].map((bar) => (
                                    <div key={bar} className="flex-1 flex flex-col justify-end h-full">
                                        <Skeleton className="w-full rounded-t-lg" style={{ height: `${Math.random() * 80 + 10}%` }} />
                                    </div>
                                ))}
                            </div>
                            <Skeleton className="h-3 w-48 mt-2" />
                        </div>

                        {/* Gauge Area */}
                        <div className="flex flex-col items-center justify-center border-l border-stone-700 pl-0 md:pl-8">
                            <Skeleton className="w-56 h-56 rounded-full" />
                            <Skeleton className="h-3 w-32 mt-6" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
