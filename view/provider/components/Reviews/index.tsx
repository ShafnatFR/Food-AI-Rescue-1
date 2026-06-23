
import React, { useState, useMemo } from 'react';
import { MessageSquare } from 'lucide-react';
import { Review, ClaimHistoryItem } from '../../../../types';
import { EmptyState } from '../../../common/EmptyState';
import { ReviewsHeader } from './ReviewsHeader';
import { ReviewItemCard } from './ReviewItemCard';
import { ReviewDetailModal } from './ReviewDetailModal';
import { ReviewsPagination } from './ReviewsPagination';
import { toast } from '../../../common/ToastContext';

interface ReviewsViewProps {
    onNavigateToOrder?: (orderId: string) => void;
    claims: ClaimHistoryItem[]; // Receive real claims
}

export const ReviewsView: React.FC<ReviewsViewProps> = ({ onNavigateToOrder, claims = [] }) => {
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  
  // Transform Claims with ratings into Review objects
  const reviews = useMemo(() => {
      return claims
        .filter(c => c.rating && c.rating > 0)
        .map(c => ({
            id: `REV-${c.id}`,
            orderId: c.id,
            foodName: c.foodName,
            user: (c as any).receiverName || `Penerima Manfaat ${c.id.substring(0, 4)}`, // Dynamic seed
            rating: c.rating!,
            comment: c.review || 'Tidak ada komentar tertulis.',
            date: c.date,
            mediaUrls: c.reviewMedia || []
        }));
  }, [claims]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentReviews = reviews.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(reviews.length / itemsPerPage);

  const handleShowProductDetail = () => {
      if (selectedReview && selectedReview.orderId && onNavigateToOrder) {
          onNavigateToOrder(selectedReview.orderId);
          setSelectedReview(null);
      } else {
          toast.error("ID Pesanan tidak ditemukan pada ulasan ini.");
      }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
       <ReviewsHeader 
            count={reviews.length} 
       />

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {currentReviews.length === 0 && (
             <div className="py-10 col-span-full">
                <EmptyState 
                    icon={MessageSquare}
                    title="Belum Ada Ulasan"
                    description="Bagikan lebih banyak donasi untuk mendapatkan ulasan dari penerima manfaat."
                />
             </div>
          )}
          {currentReviews.map(review => (
             <ReviewItemCard 
                key={review.id} 
                review={review} 
                onClick={() => setSelectedReview(review)} 
             />
          ))}
          
          {reviews.length > itemsPerPage && (
            <div className="col-span-full">
                <ReviewsPagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    setCurrentPage={setCurrentPage}
                    indexOfFirstItem={indexOfFirstItem}
                    indexOfLastItem={indexOfLastItem}
                    totalItems={reviews.length}
                />
            </div>
          )}
       </div>

       {selectedReview && (
           <ReviewDetailModal 
                review={selectedReview}
                onClose={() => setSelectedReview(null)}
                onShowProductDetail={handleShowProductDetail}
           />
       )}
    </div>
  );
};
