import React, { useState, useMemo } from 'react';
import { Product, ProductCategory } from '../types';
import { ProductCard } from './ProductCard';
import { EmptyState } from './common/EmptyState';
import { Sparkles, Clock, Flame } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  currentCategory: ProductCategory | 'all' | 'pre-owned';
  onSelectCategory: (cat: ProductCategory | 'all' | 'pre-owned') => void;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  searchQuery: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  currentCategory,
  onSelectCategory,
  onQuickView,
  onAddToCart,
  searchQuery
}) => {
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [conditionFilter, setConditionFilter] = useState<'all' | 'new' | 'pre-owned'>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [viewSegment, setViewSegment] = useState<'all' | 'featured' | 'new_arrivals'>('all');

  // Available brands in the current products set
  const availableBrands = useMemo(() => {
    const brands = new Set<string>();
    products.forEach(p => brands.add(p.brand));
    return ['all', ...Array.from(brands)];
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Category filter
      if (currentCategory === 'pre-owned' && p.condition !== 'pre-owned') return false;
      if (currentCategory !== 'all' && currentCategory !== 'pre-owned' && p.category !== currentCategory) return false;

      // Brand filter
      if (selectedBrand !== 'all' && p.brand !== selectedBrand) return false;

      // Condition filter
      if (conditionFilter !== 'all' && p.condition !== conditionFilter) return false;

      // In stock filter
      if (inStockOnly && p.stockQuantity <= 0) return false;

      // Segment filter (Featured: discount > 10% or flagship, New Arrivals: created recently)
      if (viewSegment === 'featured' && p.discountPercent < 8 && p.sellingPrice < 30000) return false;
      if (viewSegment === 'new_arrivals' && p.condition === 'pre-owned') return false;

      // Search query filter (matches name, brand, model, SKU)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesBrand = p.brand.toLowerCase().includes(q);
        const matchesModel = p.model.toLowerCase().includes(q);
        const matchesSku = p.sku.toLowerCase().includes(q);
        const matchesCategory = p.category.toLowerCase().includes(q);
        if (!matchesName && !matchesBrand && !matchesModel && !matchesSku && !matchesCategory) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.sellingPrice - b.sellingPrice;
      if (sortBy === 'price-desc') return b.sellingPrice - a.sellingPrice;
      return 0; // Default order
    });
  }, [products, currentCategory, selectedBrand, conditionFilter, inStockOnly, viewSegment, searchQuery, sortBy]);

  const resetAllFilters = () => {
    onSelectCategory('all');
    setSelectedBrand('all');
    setConditionFilter('all');
    setInStockOnly(false);
    setViewSegment('all');
    setSortBy('featured');
  };

  const getCategoryTitle = () => {
    if (searchQuery) return `Search Results for "${searchQuery}"`;
    switch (currentCategory) {
      case 'smartphones': return 'Flagship & 5G Smartphones';
      case 'tablets': return 'Tablets & Pro Accessories';
      case 'audio': return 'Hi-Res Audio, ANC Earbuds & Headphones';
      case 'wearables': return 'Smartwatches & Fitness Trackers';
      case 'accessories': return 'Fast GaN Chargers, Cables & Adapters';
      case 'computing': return 'Networking & Computing Accessories';
      case 'pre-owned': return 'Certified Pre-Owned Electronics (With Store Warranty)';
      default: return 'Storefront Product Catalogue';
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8" aria-label="Product Showcase">
      {/* Title & Filter Bar Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            {getCategoryTitle()}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Displaying <span className="font-semibold text-slate-800 tabular-nums">{filteredProducts.length}</span> demonstration devices &amp; accessories in Haldwani inventory
          </p>
        </div>

        {/* View Segments (Featured / New Arrivals / All) */}
        {!searchQuery && currentCategory === 'all' && (
          <div className="inline-flex p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs self-start md:self-auto">
            <button
              onClick={() => setViewSegment('all')}
              className={`px-3 py-1.5 font-semibold rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none ${
                viewSegment === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Items
            </button>
            <button
              onClick={() => setViewSegment('featured')}
              className={`px-3 py-1.5 font-semibold rounded-md transition-colors flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none ${
                viewSegment === 'featured' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>Featured Deals</span>
            </button>
            <button
              onClick={() => setViewSegment('new_arrivals')}
              className={`px-3 py-1.5 font-semibold rounded-md transition-colors flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none ${
                viewSegment === 'new_arrivals' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span>New Arrivals</span>
            </button>
          </div>
        )}

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Brand Selector */}
          <div className="relative">
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 font-medium focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none cursor-pointer"
              aria-label="Filter by brand"
            >
              <option value="all">All Brands</option>
              {availableBrands.filter(b => b !== 'all').map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Condition Selector */}
          <div className="relative">
            <select
              value={conditionFilter}
              onChange={(e) => setConditionFilter(e.target.value as any)}
              className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 font-medium focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none cursor-pointer"
              aria-label="Filter by condition"
            >
              <option value="all">All Conditions</option>
              <option value="new">Brand New</option>
              <option value="pre-owned">Certified Pre-Owned</option>
            </select>
          </div>

          {/* Sort Selector */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 font-medium focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none cursor-pointer"
              aria-label="Sort products"
            >
              <option value="featured">Sort: Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>

          {/* In-Stock Only Toggle */}
          <label className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg cursor-pointer text-slate-700 select-none focus-within:ring-2 focus-within:ring-blue-600">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="rounded text-blue-600 focus:ring-0"
              aria-label="Show in-stock items only"
            />
            <span className="font-medium">In-Stock</span>
          </label>
        </div>
      </div>

      {/* Grid or Empty State */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 pt-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={onQuickView}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No products found in this selection"
          description="Try broadening your brand or condition filters, or search for another model."
          actionText="Reset All Filters"
          onAction={resetAllFilters}
        />
      )}
    </section>
  );
};
