import React from 'react';
import { SearchX, RefreshCw } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No products match your criteria',
  description = 'Try adjusting your search terms, removing filters, or selecting a different category.',
  actionText = 'Reset Filters',
  onAction
}) => {
  return (
    <div 
      className="text-center py-12 px-6 bg-white rounded-xl border border-slate-200 my-6 max-w-md mx-auto space-y-3"
      role="status"
      aria-live="polite"
    >
      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-500">
        <SearchX className="w-6 h-6" />
      </div>
      <h3 className="text-sm sm:text-base font-bold text-slate-900">{title}</h3>
      <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
      {onAction && (
        <button
          onClick={onAction}
          className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-[#0B192C] text-white text-xs font-semibold rounded-lg hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
};
