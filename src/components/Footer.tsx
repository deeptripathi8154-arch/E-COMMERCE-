import React from 'react';
import { MapPin, Phone, Mail, Clock, ShieldCheck, Truck, RotateCcw, Award } from 'lucide-react';
import { ProductCategory } from '../types';

interface FooterProps {
  onSelectCategory: (cat: ProductCategory | 'all' | 'pre-owned') => void;
  onOpenAdmin: () => void;
  onOpenPincodeModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectCategory,
  onOpenAdmin,
  onOpenPincodeModal
}) => {
  return (
    <footer className="bg-[#0B192C] text-slate-300 border-t border-slate-800 text-xs">
      {/* Trust Proposition Bar */}
      <div className="border-b border-slate-800/80 py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-6 h-6 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white text-sm">100% Original Brand Goods</p>
              <p className="text-slate-400 text-xs mt-0.5">Brand sealed boxes with authorized manufacturer Indian warranty.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Truck className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white text-sm">24h Haldwani Delivery</p>
              <p className="text-slate-400 text-xs mt-0.5">Free express doorstep delivery in Haldwani &amp; Kathgodam over ₹499.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <RotateCcw className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white text-sm">7-Day Replacement Policy</p>
              <p className="text-slate-400 text-xs mt-0.5">In-store diagnostic support and replacement for hardware defects.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Award className="w-6 h-6 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white text-sm">45-Point Pre-Owned Check</p>
              <p className="text-slate-400 text-xs mt-0.5">Certified pre-owned devices with 6 months Harvinder store warranty.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Location Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
          
          {/* Brand & Physical Haldwani Location */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-blue-600 flex items-center justify-center text-white font-black text-xs">
                HT
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Harvinder Telecom
              </span>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Premier electronics retail destination in Haldwani, Uttarakhand. Serving customers across Nainital, Almora, Rudrapur, and all over India with authentic mobile devices, sound systems, and GaN accessories.
            </p>

            <div className="space-y-2 pt-2 text-xs">
              <div className="flex items-start gap-2.5 text-slate-300">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>
                  Shop No. 12–14, Opposite Tikonia Chauraha, Nainital Road, Haldwani, Nainital District, Uttarakhand – 263139
                </span>
              </div>

              <div className="flex items-center gap-2.5 text-slate-300">
                <Clock className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Store Timings: Mon–Sat: 10:00 AM – 9:00 PM | Sun: 11:00 AM – 8:00 PM</span>
              </div>

              <div className="flex items-center gap-2.5 text-slate-300">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href="tel:+919837012345" className="hover:text-white transition-colors">
                  Helpline: +91 98370 12345 / 05946-2819XX
                </a>
              </div>

              <div className="flex items-center gap-2.5 text-slate-300">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <a href="mailto:support@harvindertelecom.com" className="hover:text-white transition-colors">
                  support@harvindertelecom.com
                </a>
              </div>
            </div>
          </div>

          {/* Categories Navigation */}
          <div className="lg:col-span-3 space-y-3">
            <p className="text-xs font-bold text-white uppercase tracking-wider">
              Browse Categories
            </p>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => onSelectCategory('smartphones')} className="hover:text-white transition-colors">
                  Flagship Smartphones (Apple, Samsung, OnePlus)
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('tablets')} className="hover:text-white transition-colors">
                  Tablets &amp; Stylus Accessories (iPad, Tab)
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('audio')} className="hover:text-white transition-colors">
                  Audio &amp; ANC Earbuds (Sony, boAt, JBL)
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('wearables')} className="hover:text-white transition-colors">
                  Smartwatches &amp; AMOLED Wearables
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('accessories')} className="hover:text-white transition-colors">
                  65W/100W GaN Fast Chargers &amp; Cables
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('pre-owned')} className="hover:text-white transition-colors">
                  Certified Pre-Owned (With Store Warranty)
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Support & Local Policies */}
          <div className="lg:col-span-4 space-y-3">
            <p className="text-xs font-bold text-white uppercase tracking-wider">
              Customer Support &amp; Guarantees
            </p>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={onOpenPincodeModal} className="hover:text-white transition-colors text-left">
                  PIN Code Delivery Estimator (Uttarakhand &amp; India)
                </button>
              </li>
              <li>
                <span className="text-slate-400">
                  GST Invoice &amp; HSN Billing (GSTIN: 05AAACH1234F1Z8)
                </span>
              </li>
              <li>
                <span className="text-slate-400">
                  7-Day Hardware Replacement Guarantee
                </span>
              </li>
              <li>
                <span className="text-slate-400">
                  Cash on Delivery (COD) &amp; UPI Zero-Fee Payments
                </span>
              </li>
              <li>
                <span className="text-slate-400">
                  In-Store Repair &amp; Diagnostic Desk Haldwani
                </span>
              </li>
              <li className="pt-2">
                <button
                  onClick={onOpenAdmin}
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300 underline underline-offset-2"
                >
                  Admin Portal &amp; IMEI Management Console
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Strip */}
        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            &copy; {new Date().getFullYear()} Harvinder Telecom. All rights reserved. Tikonia Chauraha, Nainital Road, Haldwani, Uttarakhand.
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>GST Registered (State 05)</span>
            <span aria-hidden="true">·</span>
            <span>Local Device Privacy</span>
            <span aria-hidden="true">·</span>
            <span>100% Genuine Tech</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
