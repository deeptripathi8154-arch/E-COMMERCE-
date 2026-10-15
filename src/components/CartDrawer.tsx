import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Plus, Minus } from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number, color?: string, storageVariant?: string) => void;
  onRemoveItem: (productId: string, color?: string, storageVariant?: string) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout
}) => {
  if (!isOpen) return null;

  const subtotal = cart.reduce((acc, item) => acc + ((item.unitPrice || item.product.sellingPrice) * item.quantity), 0);
  const freeShippingThreshold = 499;
  const isFreeShipping = subtotal >= freeShippingThreshold || cart.length === 0;
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const shippingFee = isFreeShipping ? 0 : 70;
  const grandTotal = subtotal + shippingFee;
  // Inclusive 18% GST
  const estimatedTax = Math.round(subtotal - (subtotal / 1.18));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
      <div 
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Your Shopping Bag</h2>
            <span className="text-xs font-semibold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full tabular-nums">
              {cart.reduce((sum, i) => sum + i.quantity, 0)} items
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        {cart.length > 0 && (
          <div className="bg-blue-50/80 px-6 py-2.5 border-b border-blue-100 text-xs">
            {isFreeShipping ? (
              <p className="text-emerald-700 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                You qualify for FREE Delivery in Haldwani &amp; India!
              </p>
            ) : (
              <div>
                <p className="text-blue-900 font-medium">
                  Add <span className="font-bold text-blue-700 tabular-nums">₹{amountNeededForFreeShipping.toLocaleString('en-IN')}</span> more for FREE delivery
                </p>
                <div className="w-full bg-blue-200 rounded-full h-1.5 mt-1.5 overflow-hidden">
                  <div 
                    className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 divide-y divide-slate-100">
          {cart.length > 0 ? (
            cart.map((item, index) => {
              const itemPrice = item.unitPrice || item.product.sellingPrice;
              return (
                <div key={`${item.productId}-${item.selectedColor}-${item.selectedStorage}-${index}`} className="pt-4 first:pt-0 flex gap-4">
                  {/* Product thumbnail */}
                  <div className="w-18 h-18 sm:w-20 sm:h-20 bg-slate-50 border border-slate-200 rounded-lg p-2 shrink-0 flex items-center justify-center overflow-hidden">
                    {item.product.images && item.product.images[0] ? (
                      <img 
                        src={item.product.images[0]} 
                        alt={item.product.name} 
                        className="max-h-full max-w-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="text-[10px] text-slate-400 font-medium">{item.product.brand}</span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-xs sm:text-sm font-semibold text-slate-900 line-clamp-2 leading-snug">
                          {item.product.name}
                        </h3>
                        <button
                          onClick={() => onRemoveItem(item.productId, item.selectedColor, item.selectedStorage)}
                          className="text-slate-400 hover:text-red-600 p-1 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Variant specs */}
                      {(item.selectedColor || item.selectedStorage || item.selectedRam) && (
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                          {item.selectedColor && (item.selectedStorage || item.selectedRam) && <span> · </span>}
                          {item.selectedStorage && <span>Storage: {item.selectedStorage}</span>}
                          {item.selectedRam && <span> ({item.selectedRam} RAM)</span>}
                        </p>
                      )}
                    </div>

                    {/* Quantity and Price */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden">
                        <button
                          onClick={() => onUpdateQuantity(item.productId, item.quantity - 1, item.selectedColor, item.selectedStorage)}
                          className="p-1 hover:bg-slate-100 text-slate-600 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-semibold text-slate-800 tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.productId, item.quantity + 1, item.selectedColor, item.selectedStorage)}
                          className="p-1 hover:bg-slate-100 text-slate-600 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-xs sm:text-sm font-bold text-slate-900 tabular-nums">
                        ₹{(itemPrice * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-16 space-y-3">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <p className="text-base font-semibold text-slate-800">Your bag is empty</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Explore our catalog of smartphones, chargers, earbuds and smartwatches to start shopping.
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-5 py-2 bg-[#0B192C] text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors"
              >
                Browse Catalog
              </button>
            </div>
          )}
        </div>

        {/* Footer Order Summary & Checkout Trigger */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-6 border-t border-slate-200 bg-slate-50 space-y-3">
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Items Subtotal:</span>
                <span className="font-semibold text-slate-900 tabular-nums">
                  ₹{subtotal.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Inclusive 18% GST:</span>
                <span className="tabular-nums">₹{estimatedTax.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Fee:</span>
                <span className="font-semibold tabular-nums">
                  {shippingFee === 0 ? (
                    <span className="text-emerald-700">FREE</span>
                  ) : (
                    `₹${shippingFee}`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm sm:text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
                <span>Order Total:</span>
                <span className="tabular-nums text-blue-700">
                  ₹{grandTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onProceedToCheckout();
              }}
              className="w-full py-3 bg-[#0B192C] hover:bg-blue-600 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-md"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Harvinder Telecom Haldwani Store Guarantee</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
