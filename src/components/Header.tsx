import React, { useState } from 'react';
import { 
  Search, 
  ShoppingBag, 
  User as UserIcon, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Menu, 
  X,
  SlidersHorizontal
} from 'lucide-react';
import { ProductCategory, User } from '../types';

interface HeaderProps {
  currentCategory: ProductCategory | 'all' | 'pre-owned';
  onSelectCategory: (cat: ProductCategory | 'all' | 'pre-owned') => void;
  cartCount: number;
  onOpenCart: () => void;
  currentUser: User | null;
  onOpenAccount: () => void;
  onOpenAdmin: () => void;
  onOpenPincodeModal: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  currentPincode: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentCategory,
  onSelectCategory,
  cartCount,
  onOpenCart,
  currentUser,
  onOpenAccount,
  onOpenAdmin,
  onOpenPincodeModal,
  searchQuery,
  onSearchChange,
  currentPincode
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const categories = [
    { id: 'all', label: 'All Products' },
    { id: 'smartphones', label: 'Smartphones' },
    { id: 'tablets', label: 'Tablets' },
    { id: 'audio', label: 'Audio & Sound' },
    { id: 'wearables', label: 'Smartwatches' },
    { id: 'accessories', label: 'Chargers & Cases' },
    { id: 'pre-owned', label: 'Pre-Owned' },
  ] as const;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200" role="banner">
      {/* Top Announcement Strip */}
      <div className="bg-[#0B192C] text-slate-300 text-xs py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 truncate">
            <span className="flex items-center gap-1.5 font-medium text-white shrink-0">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              <span>Haldwani, Uttarakhand</span>
            </span>
            <span className="hidden sm:inline text-slate-500">|</span>
            <span className="hidden sm:inline truncate text-slate-300">
              Opp. Tikonia Chauraha, Nainital Road · Free 24h Haldwani Delivery on orders ₹499+
            </span>
            <span className="hidden lg:inline-flex text-[10px] font-mono uppercase bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded border border-blue-400/30">
              Phase 1 Sandbox
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs shrink-0">
            <button 
              onClick={onOpenPincodeModal}
              className="flex items-center gap-1 text-blue-300 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none rounded px-1"
              aria-label={`Change delivery pincode, currently ${currentPincode || '263139'}`}
            >
              <span>Deliver to:</span>
              <span className="font-semibold underline underline-offset-2">
                {currentPincode || '263139'}
              </span>
            </button>
            <span className="text-slate-600">|</span>
            <a 
              href="tel:+919837012345" 
              className="hidden md:flex items-center gap-1 text-slate-300 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none rounded px-1"
              aria-label="Call store helpline at +91 98370 12345"
            >
              <Phone className="w-3 h-3 text-emerald-400" />
              <span>+91 98370 12345</span>
            </a>
          </div>
        </div>
      </div>

      {/* Primary Top Bar Contract: Zone 1 (Wordmark) - Zone 2 (Nav Links) - Zone 3 (Actions) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between gap-4 lg:gap-8 h-16">
          
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-2 shrink-0">
            <button 
              onClick={() => onSelectCategory('all')} 
              className="text-left group flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none rounded-lg p-0.5"
              aria-label="Harvinder Telecom Home"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-sm group-hover:bg-blue-700 transition-colors">
                HT
              </div>
              <span className="text-lg sm:text-xl font-bold tracking-tight text-[#0B192C] whitespace-nowrap">
                Harvinder Telecom
              </span>
            </button>
          </div>

          {/* Search Bar for Quick Product Search */}
          <div className="hidden sm:flex flex-1 max-w-md mx-2" role="search">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search iPhone, Galaxy, chargers, boAt, IMEI..."
                className="w-full pl-9 pr-4 py-1.5 text-xs sm:text-sm bg-slate-100/90 border border-transparent rounded-full focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all text-slate-800 placeholder-slate-400"
                aria-label="Search catalog products"
              />
              {searchQuery && (
                <button 
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none rounded"
                  aria-label="Clear search input"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Zone 3: Primary Actions (Admin portal, User Account, Cart Drawer) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Admin Switcher */}
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 min-h-[44px] focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
              title="Open Admin & IMEI Tracking Console"
              aria-label="Open Admin Console"
            >
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span className="hidden md:inline">Admin Portal</span>
            </button>

            {/* Customer Account Button */}
            <button
              onClick={onOpenAccount}
              className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors min-h-[44px] focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
              aria-label={currentUser ? `Account menu for ${currentUser.name}` : "Sign in to customer account"}
            >
              <UserIcon className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">
                {currentUser ? currentUser.name.split(' ')[0] : 'Sign In'}
              </span>
            </button>

            {/* Shopping Cart Button with Count Badge */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 px-3.5 py-2 bg-[#0B192C] text-white hover:bg-slate-800 rounded-lg text-xs sm:text-sm font-medium transition-colors shadow-sm min-h-[44px] focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
              aria-label={`Shopping bag containing ${cartCount} items`}
            >
              <ShoppingBag className="w-4 h-4 text-blue-400" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold bg-blue-500 text-white rounded-full min-w-[20px] tabular-nums">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Search Bar */}
        <div className="sm:hidden pb-3">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search phones, audio, chargers..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-100 border border-transparent rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none text-slate-800"
            />
          </div>
        </div>

        {/* Zone 2: Navigation Links Bar */}
        <nav className="hidden sm:flex items-center gap-1 py-2 overflow-x-auto border-t border-slate-100 scrollbar-none">
          {categories.map((cat) => {
            const isActive = currentCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id as any)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1 shadow-lg">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 pb-1">
            Browse Categories
          </p>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                onSelectCategory(cat.id as any);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                currentCategory === cat.id 
                  ? 'bg-blue-50 text-blue-700 font-semibold' 
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 px-2">
            <span>Haldwani Store Timings:</span>
            <span className="font-medium text-slate-700">10:00 AM - 9:00 PM</span>
          </div>
        </div>
      )}
    </header>
  );
};
