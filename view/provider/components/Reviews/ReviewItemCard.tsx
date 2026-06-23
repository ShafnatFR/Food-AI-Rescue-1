
import React from 'react';
import { Star, Image as ImageIcon, Package, User } from 'lucide-react';
import { Review } from '../../../../types';

interface ReviewItemCardProps {
    review: Review;
    layoutMode: 'list' | 'grid';
    onClick: () => void;
}

export const ReviewItemCard: React.FC<ReviewItemCardProps> = ({ review, layoutMode, onClick }) => {
    return (
        <div 
            onClick={onClick}
            className={`
                group relative bg-white dark:bg-stone-900 rounded-[2rem] border-2 border-stone-100 dark:border-stone-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] cursor-pointer 
                hover:border-yellow-500/30 hover:shadow-[0_20px_50px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between
                ${layoutMode === 'grid' ? 'p-4 md:p-6' : 'p-6 flex-row gap-6'}
            `}
        >
            <div className={`flex-1 ${layoutMode === 'grid' ? 'space-y-4' : 'space-y-4'}`}>
                <div className={`flex justify-between items-start ${layoutMode === 'grid' ? 'flex-col gap-3' : 'flex-row items-center'}`}>
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center font-black text-stone-600 dark:text-stone-300 shrink-0 border border-stone-200 dark:border-stone-700`}>
                            <User className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                            <p className="font-bold text-stone-900 dark:text-white group-hover:text-yellow-600 transition-colors truncate text-sm">{review.user}</p>
                            <p className="text-[10px] text-stone-500 flex items-center gap-1 font-bold truncate mt-0.5">
                                <Package className="w-3 h-3 text-orange-500" /> {review.foodName || 'Makanan'}
                            </p>
                        </div>
                    </div>
                    <div className={`flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1.5 rounded-xl border border-yellow-100 dark:border-yellow-900/30 ${layoutMode === 'grid' ? 'self-start' : ''}`}>
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 drop-shadow-sm" />
                        <span className="text-xs font-black text-yellow-700 dark:text-yellow-400">{review.rating}.0</span>
                    </div>
                </div>
                
                <div className="bg-stone-50/50 dark:bg-stone-950/50 p-4 rounded-2xl border border-stone-100 dark:border-stone-800/50">
                    <p className={`text-stone-700 dark:text-stone-300 italic leading-relaxed text-xs line-clamp-3`}>"{review.comment}"</p>
                </div>
            </div>
            
            <div className={`flex items-center justify-between ${layoutMode === 'grid' ? 'mt-4 pt-4 border-t border-stone-100 dark:border-stone-800/50' : 'w-48 shrink-0 flex-col items-end justify-center border-l border-stone-100 dark:border-stone-800/50 pl-6'}`}>
                <div className="flex items-center gap-2">
                    {review.mediaUrls && review.mediaUrls.length > 0 && (
                        <span className={`px-2 py-1 bg-stone-100 dark:bg-stone-800 rounded-lg text-[9px] font-black text-stone-500 uppercase tracking-widest flex items-center gap-1.5`}>
                            <ImageIcon className="w-3 h-3" /> <span className={layoutMode === 'grid' ? 'hidden md:inline' : ''}>Lampiran</span>
                        </span>
                    )}
                </div>
                <span className="text-[10px] font-bold text-stone-400 tracking-wider">{review.date}</span>
            </div>
        </div>
    );
};
