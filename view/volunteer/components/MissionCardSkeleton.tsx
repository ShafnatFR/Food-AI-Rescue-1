import React from 'react';

export const MissionCardSkeleton: React.FC = () => {
    return (
        <div className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-100 dark:border-stone-800 relative overflow-hidden shadow-sm flex flex-col">
            <div className="absolute top-0 left-0 w-1 h-full bg-stone-200 dark:bg-stone-800" />
            
            <div className="flex justify-between items-start mb-4">
                <div>
                    <div className="h-5 md:h-6 w-40 animate-pulse bg-stone-200 dark:bg-stone-800 rounded-md" />
                </div>
                <div className="h-6 w-20 rounded-full animate-pulse bg-stone-200 dark:bg-stone-800" />
            </div>

            <div className="space-y-3 relative mb-6">
                <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-stone-100 dark:bg-stone-800" />
                
                <div className="flex items-center gap-3 relative z-10">
                    <div className="w-4 h-4 rounded-full bg-stone-200 dark:bg-stone-700 border-2 border-white dark:border-stone-900 animate-pulse" />
                    <div className="space-y-1.5">
                        <div className="h-2.5 w-16 animate-pulse bg-stone-200 dark:bg-stone-800 rounded-md" />
                        <div className="h-3.5 w-32 animate-pulse bg-stone-200 dark:bg-stone-800 rounded-md" />
                    </div>
                </div>

                <div className="flex items-center gap-3 relative z-10">
                    <div className="w-4 h-4 rounded-full bg-stone-200 dark:bg-stone-700 border-2 border-white dark:border-stone-900 animate-pulse" />
                    <div className="space-y-1.5">
                        <div className="h-2.5 w-16 animate-pulse bg-stone-200 dark:bg-stone-800 rounded-md" />
                        <div className="h-3.5 w-40 animate-pulse bg-stone-200 dark:bg-stone-800 rounded-md" />
                    </div>
                </div>
            </div>

            <div className="mt-auto pt-2 flex gap-3">
                <div className="h-10 w-full animate-pulse bg-stone-200 dark:bg-stone-800 rounded-2xl" />
            </div>
        </div>
    );
};
