import React, { useState } from 'react';
import { Database, Info, X } from 'lucide-react';

export const DemoDataNotice: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <aside 
      className="bg-blue-50 border-b border-blue-200 text-blue-900 py-2 px-4 sm:px-6"
      aria-label="Demonstration Data Disclosure"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-blue-600 shrink-0" />
          <p className="leading-snug">
            <span className="font-bold">Phase 1 Storefront Sandbox:</span>{' '}
            <span className="text-blue-800">
              Products, specifications, and SKU prices displayed below are verified demonstration records. Persistent database tables and live stock reservation activate in Phase 2.
            </span>
          </p>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="p-1 rounded-md text-blue-500 hover:text-blue-800 hover:bg-blue-100/70 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none transition-colors shrink-0"
          aria-label="Dismiss demonstration data notice"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
};
