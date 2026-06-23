import React from 'react';

interface StockItemCardSkeletonProps {
    layoutMode: 'list' | 'grid';
}

export const StockItemCardSkeleton: React.FC<StockItemCardSkeletonProps> = ({ layoutMode }) => {
    return (
        <div 
            className={`
                bg-white dark:bg-stone-900 rounded-[1.5rem] md:rounded-[2rem] border border-stone-200 dark:border-stone-800 
                relative overflow-hidden flex
                ${layoutMode === 'list' ? 'flex-row h-32 md:h-44 p-3 md:p-4 gap-4 md:gap-6' : 'flex-col p-3 md:p-5 gap-3 md:gap-4'}
            `}
        >
            {/* Image Placeholder */}
            <div className={`shrink-0 rounded-xl md:rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-800 animate-pulse ${layoutMode === 'list' ? 'w-24 md:w-36 h-full' : 'w-full aspect-square md:aspect-video'}`} />

            {/* Content Placeholder */}
            <div className="flex-1 flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start mb-1">
                        {/* Title */}
                        <div className={`animate-pulse bg-stone-200 dark:bg-stone-800 rounded-md ${layoutMode === 'grid' ? 'h-4 md:h-6 w-3/4' : 'h-5 md:h-7 w-2/3'}`} />
                        {/* Status Badge */}
                        <div className="animate-pulse bg-stone-200 dark:bg-stone-800 rounded-lg h-4 md:h-5 w-12 md:w-16 shrink-0 ml-2" />
                    </div>
                    
                    {/* Expiry Time */}
                    <div className="h-3 w-32 md:w-40 animate-pulse bg-stone-200 dark:bg-stone-800 rounded-md mt-2 md:mt-3 mb-1 md:mb-2" />

                    {/* Description */}
                    <div className={`space-y-1.5 mt-2 md:mt-3 ${layoutMode === 'grid' ? 'hidden md:block' : ''}`}>
                         <div className="h-2.5 w-full animate-pulse bg-stone-200 dark:bg-stone-800 rounded-md" />
                         <div className="h-2.5 w-4/5 animate-pulse bg-stone-200 dark:bg-stone-800 rounded-md" />
                    </div>
                </div>
                
                {/* Footer (Quantity & Arrow) */}
                <div className="flex items-center justify-between mt-2 md:mt-4 pt-2 md:pt-4 border-t border-stone-50 dark:border-stone-800">
                    <div>
                        <div className="h-2 w-20 animate-pulse bg-stone-200 dark:bg-stone-800 rounded-md hidden md:block mb-1.5" />
                        <div className="h-3 w-12 md:w-16 animate-pulse bg-stone-200 dark:bg-stone-800 rounded-md" />
                    </div>
                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-full animate-pulse bg-stone-200 dark:bg-stone-800" />
                </div>
            </div>
        </div>
    );
};
