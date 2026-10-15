import React from 'react';
import { 
  Smartphone, 
  Tablet, 
  Headphones, 
  Watch, 
  Zap, 
  ShieldCheck, 
  Laptop
} from 'lucide-react';
import { ProductCategory } from '../types';

interface CategoryTilesProps {
  currentCategory: ProductCategory | 'all' | 'pre-owned';
  onSelectCategory: (cat: ProductCategory | 'all' | 'pre-owned') => void;
}

export const CategoryTiles: React.FC<CategoryTilesProps> = ({
  currentCategory,
  onSelectCategory,
}) => {
  const categories = [
    {
      id: 'smartphones',
      name: 'Smartphones',
      description: 'Apple, Samsung, OnePlus & Pixel',
      icon: Smartphone,
    },
    {
      id: 'tablets',
      name: 'Tablets & Styluses',
      description: 'iPad & Galaxy Tab accessories',
      icon: Tablet,
    },
    {
      id: 'audio',
      name: 'Audio & ANC Earbuds',
      description: 'boAt, Sony, JBL studio sound',
      icon: Headphones,
    },
    {
      id: 'wearables',
      name: 'Smartwatches',
      description: 'AMOLED display & calling',
      icon: Watch,
    },
    {
      id: 'accessories',
      name: 'GaN Chargers & Cables',
      description: '65W/100W PD wall adapters',
      icon: Zap,
    },
    {
      id: 'pre-owned',
      name: 'Certified Pre-Owned',
      description: '45-Point check with 6M warranty',
      icon: ShieldCheck,
    },
  ] as const;

  return (
    <section 
      className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-4" 
      aria-label="Popular Product Categories"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
            Explore by Category
          </h2>
          <p className="text-xs text-slate-500">
            Official warranties, in-store Haldwani inspection, and verified original accessories
          </p>
        </div>
        {currentCategory !== 'all' && (
          <button
            onClick={() => onSelectCategory('all')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none rounded px-1.5 py-0.5"
          >
            Show All Products &rarr;
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = currentCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id as any)}
              className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between group focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none min-h-[110px] ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/80 shadow-xs ring-1 ring-blue-600'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
              }`}
              aria-pressed={isSelected}
            >
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Icon className="w-4 h-4" />
              </div>
              <div className="mt-3">
                <p className={`text-xs font-bold leading-tight ${isSelected ? 'text-blue-700' : 'text-slate-900'}`}>
                  {cat.name}
                </p>
                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                  {cat.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
