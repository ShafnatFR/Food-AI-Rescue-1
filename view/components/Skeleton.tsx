import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div className={`animate-pulse bg-stone-200 dark:bg-[#2C2A29] rounded-md ${className}`} />
  );
};

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32 rounded-full hidden sm:block" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>

      <div className="bg-white dark:bg-[#1C1917] p-6 rounded-3xl border border-stone-200 dark:border-[#2C1810] space-y-4">
        <Skeleton className="h-6 w-40 mb-6" />
        <div className="space-y-3">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export const ListSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 animate-in fade-in duration-500 w-full">
      <div className="flex justify-between items-center mb-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 bg-white dark:bg-[#1C1917] rounded-2xl border border-stone-200 dark:border-[#2C1810] flex gap-4 items-center">
            <Skeleton className="w-16 h-16 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="p-4 bg-white dark:bg-[#1C1917] rounded-3xl border border-stone-200 dark:border-[#2C1810] space-y-4 animate-in fade-in duration-500">
      <Skeleton className="w-full h-40 rounded-2xl" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="pt-2 flex justify-between items-center">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>
    </div>
  );
};

export const FormSkeleton: React.FC = () => {
  return (
    <div className="p-6 bg-white dark:bg-[#1C1917] rounded-3xl border border-stone-200 dark:border-[#2C1810] space-y-6 animate-in fade-in duration-500 max-w-2xl mx-auto w-full">
      <div className="space-y-2 mb-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full" />
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </div>
      <div className="pt-4 flex justify-end">
        <Skeleton className="h-12 w-32 rounded-full" />
      </div>
    </div>
  );
};
