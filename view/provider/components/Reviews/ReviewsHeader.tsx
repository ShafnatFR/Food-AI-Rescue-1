
import React from 'react';

interface ReviewsHeaderProps {
    count: number;
}

export const ReviewsHeader: React.FC<ReviewsHeaderProps> = ({ count }) => {
    return (
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <h2 className="text-2xl font-black text-stone-900 dark:text-white uppercase tracking-tighter italic">Ulasan Penerima <span className="text-orange-500">({count})</span></h2>
        </div>
    );
};
