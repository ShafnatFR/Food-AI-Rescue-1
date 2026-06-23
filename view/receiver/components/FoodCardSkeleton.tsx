import React from 'react';

interface FoodCardSkeletonProps {
    layoutMode: 'list' | 'grid';
}

export const FoodCardSkeleton: React.FC<FoodCardSkeletonProps> = ({ layoutMode }) => {
    return (
        <div 
            className={`
                bg-white dark:bg-stone-900 rounded-[1.5rem] border border-stone-200 dark:border-stone-800 
                relative overflow-hidden flex
                ${layoutMode === 'list' ? 'flex-row h-32 md:h-40 p-3 md:p-4 gap-4 md:gap-6' : 'flex-col p-3 md:p-4 gap-3'}
            `}
        >
            <div className={`shrink-0 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 relative ${layoutMode === 'list' ? 'w-28 md:w-36 h-full' : 'w-full aspect-square'}`}>
                {/* Image Placeholder */}
                <div className="w-full h-full animate-pulse bg-stone-200 dark:bg-stone-700" />
                
                {/* AI Score Badge Placeholder */}
                <div className="absolute top-2 left-2 z-10 w-24 h-6 rounded-xl animate-pulse bg-white/60 dark:bg-stone-900/60" />
                
                {/* Save Button Placeholder */}
                <div className="absolute top-2 right-2 z-10 w-7 h-7 rounded-lg animate-pulse bg-white/60 dark:bg-stone-900/60" />
                
                {/* Quantity Badge Placeholder */}
                <div className="absolute bottom-2 left-2 right-2 h-5 rounded-lg animate-pulse bg-black/20 dark:bg-black/40" />
            </div>

            <div className="flex-1 flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start mb-1 gap-1">
                        {/* Title */}
                        <div className={`animate-pulse bg-stone-200 dark:bg-stone-800 rounded-md ${layoutMode === 'grid' ? 'w-full h-4 md:h-5' : 'w-3/4 h-5 md:h-6'}`} />
                    </div>
                    
                    <div className="space-y-2 mt-2 md:mt-3">
                        {/* Provider Name */}
                        <div className="w-1/2 h-2.5 animate-pulse bg-stone-200 dark:bg-stone-800 rounded-md" />
                        {/* Expiry Time */}
                        <div className="w-3/4 h-2.5 animate-pulse bg-stone-200 dark:bg-stone-800 rounded-md" />
                    </div>
                </div>
                
                {/* Footer (Method & Arrow) */}
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                    <div className="w-16 h-5 animate-pulse bg-stone-200 dark:bg-stone-800 rounded-md" />
                    <div className="w-6 h-6 rounded-full animate-pulse bg-stone-200 dark:bg-stone-800" />
                </div>
            </div>
        </div>
    );
};
