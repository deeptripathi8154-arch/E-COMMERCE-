import React from 'react';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div 
      className="bg-white rounded-xl border border-slate-200/90 overflow-hidden p-4 space-y-3 animate-pulse"
      aria-hidden="true"
    >
      <div className="aspect-[4/3] bg-slate-100 rounded-lg w-full"></div>
      <div className="space-y-2 pt-2">
        <div className="h-3 bg-slate-100 rounded w-1/3"></div>
        <div className="h-4 bg-slate-100 rounded w-4/5"></div>
        <div className="h-3 bg-slate-100 rounded w-1/2"></div>
      </div>
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="h-5 bg-slate-100 rounded w-1/3"></div>
        <div className="h-7 bg-slate-100 rounded w-16"></div>
      </div>
    </div>
  );
};

export const ProductGridSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
};
