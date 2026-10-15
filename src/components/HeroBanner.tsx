import React from 'react';
import { ArrowRight, ShieldCheck, Zap, RotateCcw, Truck } from 'lucide-react';
import { ProductCategory } from '../types';

interface HeroBannerProps {
  onSelectCategory: (cat: ProductCategory | 'all' | 'pre-owned') => void;
  onOpenPincodeModal: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onSelectCategory,
  onOpenPincodeModal,
}) => {
  return (
    <div className="relative bg-gradient-to-br from-[#0B192C] via-[#102A43] to-[#1E3E62] text-white overflow-hidden border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Headline, Value Proposition, Action CTAs */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-blue-400 uppercase">
              <span>Haldwani's Trusted Electronics Destination</span>
              <span aria-hidden="true">·</span>
              <span>Uttarakhand</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Flagship Smartphones &amp; Authentic Tech. <span className="text-blue-400">Locally Backed.</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
              Shop official brand-sealed Apple, Samsung, OnePlus devices or inspect certified pre-owned phones with our rigorous 45-point quality check and in-store Haldwani warranty.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onSelectCategory('smartphones')}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm flex items-center gap-2"
              >
                <span>Explore Smartphones</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onSelectCategory('pre-owned')}
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg text-sm font-medium transition-colors"
              >
                Certified Pre-Owned
              </button>

              <button
                onClick={() => onSelectCategory('accessories')}
                className="px-4 py-2.5 text-slate-300 hover:text-white text-sm font-medium transition-colors"
              >
                GaN Fast Chargers &amp; Audio
              </button>
            </div>

            {/* Trust and Assurance Indicators - Clean unboxed text layout */}
            <div className="pt-4 border-t border-slate-700/60 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-400 shrink-0" />
                <span>24h Haldwani Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>100% Genuine Invoice</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-amber-400 shrink-0" />
                <span>7-Day Store Replacement</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Asset */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-700/50 bg-slate-900 aspect-[16/10] sm:aspect-[16/9] lg:aspect-[4/3]">
              <img
                src="/src/assets/images/hero_electronics_store_1791903234985.jpg"
                alt="Harvinder Telecom Haldwani flagship device showcase"
                className="w-full h-full object-cover object-center transform hover:scale-102 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-4 sm:p-6">
                <div className="text-white">
                  <p className="text-xs font-medium text-blue-300">Live in Haldwani Store</p>
                  <p className="text-sm sm:text-base font-bold">Opp. Tikonia Chauraha, Nainital Road</p>
                  <p className="text-xs text-slate-300">Open 10:00 AM – 9:00 PM · Walk-ins &amp; Online Orders</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
