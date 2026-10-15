import React, { useState } from 'react';
import { ShoppingBag, Eye, Check, Shield, AlertCircle } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onQuickView,
  onAddToCart,
}) => {
  const [addedAnim, setAddedAnim] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
    setAddedAnim(true);
    setTimeout(() => setAddedAnim(false), 1400);
  };

  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 3;
  const isOutOfStock = product.stockQuantity <= 0;

  return (
    <div 
      onClick={() => onQuickView(product)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onQuickView(product);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${product.name}, selling price ${product.sellingPrice} rupees`}
      className="group relative bg-white rounded-xl border border-slate-200/90 overflow-hidden hover:shadow-md hover:border-slate-300 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none transition-all duration-200 flex flex-col cursor-pointer"
    >
      {/* Visual Image Container - Leads with imagery (65-70% visual weight) */}
      <div className="relative aspect-[4/3] bg-slate-50 flex items-center justify-center overflow-hidden p-4">
        {product.images && product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-contain object-center transform group-hover:scale-105 transition-transform duration-300"
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.currentTarget;
              target.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100 rounded-lg">
            <span className="text-xs font-medium text-slate-500">{product.brand}</span>
            <span className="text-[11px] text-slate-400 mt-1">{product.model}</span>
          </div>
        )}

        {/* Clean subtle condition & demo indicator tag */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
          {product.condition === 'pre-owned' ? (
            <span className="text-[10px] font-semibold text-amber-900 bg-amber-100/95 border border-amber-300 px-2 py-0.5 rounded-sm shadow-2xs">
              {product.preOwnedDetails?.gradeLabel ? product.preOwnedDetails.gradeLabel.split(' (')[0] : 'Certified Pre-Owned'}
            </span>
          ) : (
            product.discountPercent > 15 && (
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50/95 border border-emerald-200 px-2 py-0.5 rounded-sm tabular-nums">
                {product.discountPercent}% OFF
              </span>
            )
          )}
          <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500 bg-white/90 border border-slate-200 px-1.5 py-0.2 rounded-xs">
            Demo Item
          </span>
        </div>

        {/* Quick View Hover Action */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onQuickView(product);
          }}
          className="absolute bottom-2.5 right-2.5 p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center bg-white/95 text-slate-700 hover:text-blue-600 rounded-lg shadow-sm border border-slate-200 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none transition-opacity"
          aria-label={`Quick View ${product.name}`}
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>

      {/* Product Information Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Clean Unboxed Metadata with · separator */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="font-semibold text-slate-700 tracking-wide uppercase text-[11px]">
              {product.brand}
            </span>
            <span aria-hidden="true">·</span>
            <span className="capitalize">{product.category}</span>
          </div>

          {/* Product Name */}
          <h3 className="text-sm font-semibold text-slate-900 mt-1 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>

          {/* Key Specs snippet */}
          <p className="text-xs text-slate-500 mt-1 line-clamp-1">
            {product.shortDescription}
          </p>
        </div>

        {/* Price & Action Area */}
        <div className="pt-2 border-t border-slate-100 flex items-end justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-bold text-slate-900 tabular-nums">
                ₹{product.sellingPrice.toLocaleString('en-IN')}
              </span>
              {product.mrp > product.sellingPrice && (
                <span className="text-xs text-slate-400 line-through tabular-nums">
                  ₹{product.mrp.toLocaleString('en-IN')}
                </span>
              )}
            </div>

            {/* Stock indicator */}
            <div className="text-[11px] mt-0.5">
              {isOutOfStock ? (
                <span className="text-red-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Out of Stock
                </span>
              ) : isLowStock ? (
                <span className="text-amber-700 font-medium">
                  Only {product.stockQuantity} units left
                </span>
              ) : (
                <span className="text-emerald-700 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                  In Stock · Haldwani
                </span>
              )}
            </div>
          </div>

          {/* Add to Cart button */}
          <button
            onClick={handleAdd}
            disabled={isOutOfStock}
            className={`px-3.5 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shrink-0 min-h-[44px] min-w-[76px] transition-all focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none ${
              addedAnim 
                ? 'bg-emerald-600 text-white' 
                : isOutOfStock
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-[#0B192C] hover:bg-blue-600 text-white shadow-xs'
            }`}
            aria-label={`Add ${product.name} to Cart`}
          >
            {addedAnim ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
