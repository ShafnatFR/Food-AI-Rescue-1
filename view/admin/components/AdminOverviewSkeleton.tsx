import React from 'react';
import { Skeleton } from '../../components/Skeleton';

export const AdminOverviewSkeleton: React.FC = () => {
    return (
        <div className="space-y-8 animate-in fade-in">
            {/* Hero Banner Skeleton */}
            <div className="bg-stone-200 dark:bg-stone-800 rounded-3xl p-8 md:p-10 relative overflow-hidden h-64 flex flex-col justify-center">
                <div className="relative z-10 max-w-2xl">
                    <Skeleton className="h-10 w-48 mb-4 bg-stone-300 dark:bg-stone-700" />
                    <Skeleton className="h-6 w-96 mb-3 bg-stone-300 dark:bg-stone-700" />
                    <Skeleton className="h-8 w-48 mb-6 rounded-full bg-stone-300 dark:bg-stone-700" />
                    <div className="flex gap-3">
                        <Skeleton className="h-12 w-36 rounded-xl bg-stone-300 dark:bg-stone-700" />
                        <Skeleton className="h-12 w-40 rounded-xl bg-stone-300 dark:bg-stone-700" />
                        <Skeleton className="h-12 w-12 rounded-xl bg-stone-300 dark:bg-stone-700" />
                    </div>
                </div>
            </div>

            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
                        <div className="flex items-start justify-between mb-3">
                            <Skeleton className="w-11 h-11 rounded-xl" />
                        </div>
                        <Skeleton className="h-3 w-24 mb-2" />
                        <div className="flex items-baseline gap-2 mb-2">
                            <Skeleton className="h-8 w-20" />
                            <Skeleton className="h-4 w-6" />
                        </div>
                        <Skeleton className="h-3 w-32" />
                        {/* Sparkline proxy */}
                        <div className="flex items-end gap-[3px] h-8 mt-3 opacity-30">
                            {[1, 2, 3, 4, 5, 6, 7].map((bar) => (
                                <Skeleton key={bar} className="flex-1 rounded-sm h-full" style={{ height: `${Math.random() * 60 + 20}%` }} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Grid: Activities + Quick Actions + Top Donors */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Real-time Activity Feed */}
                <div className="lg:col-span-2 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-6 w-32 rounded-full" />
                    </div>
                    <div className="space-y-6">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex gap-4 items-start">
                                <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-3 w-1/2" />
                                </div>
                                <Skeleton className="h-3 w-16" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Sidebar Column */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm">
                        <Skeleton className="h-4 w-32 mb-4" />
                        <div className="grid grid-cols-2 gap-3">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800">
                                    <Skeleton className="w-9 h-9 rounded-xl mb-2.5" />
                                    <Skeleton className="h-3 w-16 mb-1" />
                                    <Skeleton className="h-2 w-20" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top Donatur */}
                    <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm">
                        <Skeleton className="h-4 w-32 mb-4" />
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <Skeleton className="w-6 h-6 rounded-lg shrink-0" />
                                    <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                                    <div className="flex-1 space-y-1.5">
                                        <Skeleton className="h-3 w-24" />
                                        <Skeleton className="h-2 w-16" />
                                    </div>
                                    <Skeleton className="h-3 w-12" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* User Role Distribution */}
                <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm">
                    <Skeleton className="h-4 w-40 mb-6" />
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="space-y-1.5">
                                <div className="flex justify-between items-center">
                                    <Skeleton className="h-3 w-20" />
                                    <Skeleton className="h-3 w-12" />
                                </div>
                                <Skeleton className="h-2 w-full rounded-full" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Expiring Soon Alert */}
                <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm">
                    <Skeleton className="h-4 w-40 mb-6" />
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-4 p-3 bg-stone-50 dark:bg-stone-800/50 rounded-2xl border border-stone-100 dark:border-stone-800">
                                <Skeleton className="w-12 h-6 rounded-lg shrink-0" />
                                <div className="flex-1 space-y-1.5">
                                    <Skeleton className="h-3 w-3/4" />
                                    <Skeleton className="h-2 w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
