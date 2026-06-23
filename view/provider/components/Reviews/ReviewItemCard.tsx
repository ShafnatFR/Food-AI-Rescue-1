
import React from 'react';
import { Star, Image as ImageIcon, Package, User, MessageSquare, ChevronRight, Calendar } from 'lucide-react';
import { Review } from '../../../../types';

interface ReviewItemCardProps {
    review: Review;
    onClick: () => void;
}

export const ReviewItemCard: React.FC<ReviewItemCardProps> = ({ review, onClick }) => {
    return (
        <div 
            onClick={onClick}
            className="group relative bg-white dark:bg-stone-900 rounded-[2rem] border-2 border-stone-100 dark:border-stone-800 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.08)] hover:border-yellow-500/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col md:flex-row md:items-start gap-6"
        >
            {/* Avatar / Icon */}
            <div className={`w-14 h-14 rounded-2xl shrink-0 relative z-10 overflow-hidden border-2 border-stone-100 dark:border-stone-800`}>
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${review.id}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffdfbf`} alt="Avatar" className="w-full h-full object-cover bg-stone-50 dark:bg-stone-800" />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 min-w-0 space-y-4 relative z-10">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-black text-xl text-stone-900 dark:text-white leading-tight truncate group-hover:text-yellow-600 transition-colors">
                            {review.user}
                        </h3>
                    </div>
                    
                    <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400 font-bold text-sm">
                        <Package className="w-4 h-4 text-orange-500" /> 
                        <span className="truncate">{review.foodName || 'Makanan'}</span>
                    </div>
                </div>

                <div className="bg-stone-50/50 dark:bg-stone-950/50 p-4 rounded-[1.5rem] border border-stone-100 dark:border-stone-800/50 relative">
                    <MessageSquare className="absolute top-4 left-4 w-4 h-4 text-stone-300 dark:text-stone-700" />
                    <p className="text-sm text-stone-700 dark:text-stone-300 font-medium leading-relaxed line-clamp-2 italic pl-6 pr-2">
                        "{review.comment}"
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2">
                    <div className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300 font-bold text-xs">
                        <Calendar className="w-4 h-4 text-stone-400" />
                        {review.date}
                    </div>
                    {review.mediaUrls && review.mediaUrls.length > 0 && (
                        <div className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300 font-bold text-xs">
                            <ImageIcon className="w-4 h-4 text-stone-400" />
                            Lampiran
                        </div>
                    )}
                </div>
            </div>
            
            {/* Right Side / Meta Info Area */}
            <div className="flex items-center justify-between md:flex-col md:items-end md:justify-center gap-4 pt-4 md:pt-0 md:pl-6 shrink-0 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1.5 rounded-xl border border-yellow-100 dark:border-yellow-900/30">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 drop-shadow-sm" />
                        <span className="text-xs font-black text-yellow-700 dark:text-yellow-400">{review.rating}.0</span>
                    </div>
                    <ChevronRight className="w-6 h-6 text-stone-300 group-hover:text-yellow-500 transition-colors hidden md:block" />
                </div>
            </div>
        </div>
    );
};
