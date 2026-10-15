import React, { useState } from 'react';
import { 
  X, 
  ShoppingBag, 
  Truck, 
  ShieldCheck, 
  RotateCcw, 
  MapPin, 
  Check, 
  Zap,
  CheckCircle2
} from 'lucide-react';
import { Product } from '../types';
import { storage } from '../services/storage';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity?: number, color?: string, storageVariant?: string) => void;
  onBuyNow: (product: Product, color?: string, storageVariant?: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onBuyNow
}) => {
  if (!product) return null;

  const [selectedColor, setSelectedColor] = useState<string>(product.colors[0] || 'Standard');
  const [selectedStorage, setSelectedStorage] = useState<string>(product.storageVariants[0] || 'Standard');
  const [testPincode, setTestPincode] = useState('263139');
  const [pincodeResult, setPincodeResult] = useState(() => storage.checkPincode('263139'));
  const [addedNotice, setAddedNotice] = useState(false);

  const handleCheckPin = (e: React.FormEvent) => {
    e.preventDefault();
    setPincodeResult(storage.checkPincode(testPincode));
  };

  const resolvedPricing = storage.calculateResolvedPrice(product, selectedStorage);
  const effectiveStock = storage.getEffectiveAvailableStock(product.id, selectedStorage);
  const isOutOfStock = effectiveStock <= 0;

  const handleAddToCart = () => {
    onAddToCart(product, 1, selectedColor, selectedStorage);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="relative bg-white rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-bold text-slate-800 tracking-wide uppercase">{product.brand}</span>
            <span aria-hidden="true">·</span>
            <span>SKU: {product.sku}</span>
            <span aria-hidden="true">·</span>
            <span className="capitalize">{product.category}</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            
            {/* Left Column: Product Gallery & Quality Assurances */}
            <div className="md:col-span-5 space-y-4">
              <div className="relative aspect-square bg-slate-50 rounded-xl border border-slate-200/80 p-6 flex items-center justify-center overflow-hidden">
                {product.images && product.images[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="text-center text-slate-400">
                    <p className="font-semibold">{product.brand}</p>
                    <p className="text-xs">{product.model}</p>
                  </div>
                )}

                {/* Condition tag */}
                <div className="absolute top-3 left-3">
                  {product.condition === 'pre-owned' ? (
                    <span className="text-xs font-semibold text-amber-900 bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-sm shadow-xs">
                      {product.preOwnedDetails?.gradeLabel || 'Certified Pre-Owned'}
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-sm">
                      Brand New · Sealed Box
                    </span>
                  )}
                </div>
              </div>

              {/* Warranty Guarantee Strip */}
              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl space-y-1.5 text-xs text-blue-900">
                <div className="flex items-center gap-2 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>{product.warranty}</span>
                </div>
                <p className="text-blue-800/80 text-[11px] leading-relaxed">
                  Every order includes GST tax invoice with serial validation for authorized service support.
                </p>
              </div>

              {/* Pre-Owned 45-Point Inspection Card (if pre-owned) */}
              {product.condition === 'pre-owned' && (
                <div className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-xl space-y-2 text-xs text-amber-900">
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-amber-600" />
                      45-Point Inspection Passed
                    </span>
                    {product.preOwnedDetails?.batteryHealthPercent && (
                      <span className="text-[11px] bg-amber-200/70 text-amber-900 px-2 py-0.5 rounded font-mono">
                        {product.preOwnedDetails.batteryHealthPercent}% Battery Health
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    {product.preOwnedDetails?.diagnosticReportSummary || 'Inspected by Harvinder Telecom Haldwani technical staff. Screen, Face ID, cameras, micro-soldering, and charging verified.'}
                  </p>
                  {product.preOwnedDetails?.includedAccessories && (
                    <div className="pt-1.5 border-t border-amber-200/60 text-[11px]">
                      <span className="font-semibold">Included in Box: </span>
                      <span>{product.preOwnedDetails.includedAccessories.join(', ')}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column: Pricing, Variant Selection, Stock Lock, CTAs */}
            <div className="md:col-span-7 space-y-5">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                  {product.name}
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Price Block with Dynamic Variant Adjustments */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/90 space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
                    ₹{resolvedPricing.sellingPrice.toLocaleString('en-IN')}
                  </span>
                  {resolvedPricing.mrp > resolvedPricing.sellingPrice && (
                    <>
                      <span className="text-sm text-slate-400 line-through tabular-nums">
                        ₹{resolvedPricing.mrp.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-sm">
                        Save ₹{(resolvedPricing.mrp - resolvedPricing.sellingPrice).toLocaleString('en-IN')} ({resolvedPricing.discountPercent}% OFF)
                      </span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-0.5">
                  <span>Inclusive of GST {product.gstRate}% · HSN {product.hsnCode}</span>
                  {resolvedPricing.ram && (
                    <>
                      <span>·</span>
                      <span className="font-semibold text-slate-700">RAM: {resolvedPricing.ram}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Real-time Inventory Reservation Lock Banner (Phase 3) */}
              <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl flex items-center justify-between text-xs text-blue-900">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                  <span className="font-medium">
                    {effectiveStock > 0 
                      ? `${effectiveStock} units available in Haldwani showroom` 
                      : 'Temporarily reserved in checkout session'}
                  </span>
                </div>
                <span className="text-[10px] font-mono font-semibold bg-white text-blue-700 border border-blue-300 px-2 py-0.5 rounded">
                  15-Min Active Lock
                </span>
              </div>

              {/* Color Selection */}
              {product.colors && product.colors.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700">
                    Color: <span className="text-blue-600 font-bold">{selectedColor}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map(color => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-3 py-2 text-xs font-medium rounded-lg border min-h-[44px] transition-all focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none ${
                          selectedColor === color
                            ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold ring-1 ring-blue-600'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Storage Variant Selection with Dynamic Price Offsets */}
              {product.storageVariants && product.storageVariants.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700">
                    Storage Capacity: <span className="text-blue-600 font-bold">{selectedStorage}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.storageVariants.map(variant => {
                      const varObj = product.variants?.find(v => v.storage === variant);
                      const diff = varObj?.priceOffset || 0;
                      return (
                        <button
                          key={variant}
                          onClick={() => setSelectedStorage(variant)}
                          className={`px-3.5 py-2 text-xs font-medium rounded-lg border min-h-[44px] transition-all flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none ${
                            selectedStorage === variant
                              ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold ring-1 ring-blue-600'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <span>{variant}</span>
                          {diff > 0 && (
                            <span className="text-[10px] text-blue-600 font-bold">
                              (+₹{diff.toLocaleString('en-IN')})
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* PIN Code Delivery Checker Form */}
              <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-blue-600" />
                    Delivery Availability Check
                  </span>
                  <span className="text-slate-500 font-normal">Haldwani &amp; Pan-India</span>
                </div>

                <form onSubmit={handleCheckPin} className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={testPincode}
                    onChange={(e) => setTestPincode(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 6-digit PIN"
                    className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 tabular-nums font-medium"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-medium rounded-lg transition-colors"
                  >
                    Check
                  </button>
                </form>

                {pincodeResult && (
                  <div className="text-xs pt-1 space-y-0.5">
                    <p className="font-semibold text-slate-800">
                      Deliver to {pincodeResult.city}, {pincodeResult.state} ({pincodeResult.pincode}):
                    </p>
                    {pincodeResult.isExpressHaldwaniAvailable ? (
                      <p className="text-emerald-700 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Same-Day 24-hr Free Express Delivery available in Haldwani
                      </p>
                    ) : (
                      <p className="text-slate-600">
                        Estimated delivery in {pincodeResult.estimatedDeliveryDays}–{pincodeResult.estimatedDeliveryDays + 1} business days
                      </p>
                    )}
                    <p className="text-[11px] text-slate-500">
                      Cash on Delivery (COD) eligible · Free delivery over ₹499
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                    addedNotice 
                      ? 'bg-emerald-600 text-white' 
                      : isOutOfStock
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-white border-2 border-[#0B192C] text-[#0B192C] hover:bg-slate-50'
                  }`}
                >
                  {addedNotice ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added to Cart!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => onBuyNow(product, selectedColor, selectedStorage)}
                  disabled={isOutOfStock}
                  className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                    isOutOfStock
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-[#0B192C] hover:bg-blue-600 text-white shadow-md'
                  }`}
                >
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Buy Now</span>
                </button>
              </div>

            </div>
          </div>

          {/* Full Specifications Section */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="border-t border-slate-200 pt-6 space-y-4">
              <h2 className="text-base font-bold text-slate-900">
                Technical Specifications
              </h2>
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
                {Object.entries(product.specifications).map(([key, val], idx) => (
                  <div key={key} className={`grid grid-cols-12 px-4 py-2.5 ${idx % 2 === 0 ? 'bg-slate-50/60' : 'bg-white'}`}>
                    <span className="col-span-4 sm:col-span-3 font-semibold text-slate-600">{key}</span>
                    <span className="col-span-8 sm:col-span-9 text-slate-900">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Store Guarantee Footnote */}
          <div className="border-t border-slate-100 pt-4 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              Harvinder Telecom, Opp. Tikonia Chauraha, Nainital Road, Haldwani
            </span>
            <span className="flex items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
              7-Day In-Store Replacement Assurance
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};
