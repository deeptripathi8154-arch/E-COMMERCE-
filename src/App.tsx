import React, { useState, useEffect } from 'react';
import { Product, ProductCategory, CartItem, User, Order } from './types';
import { storage } from './services/storage';
import { AccessPolicies } from './db/schema';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { CategoryTiles } from './components/CategoryTiles';
import { ProductGrid } from './components/ProductGrid';
import { DemoDataNotice } from './components/common/DemoDataNotice';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { CustomerAccountModal } from './components/CustomerAccountModal';
import { AdminPortal } from './components/AdminPortal';
import { PincodeCheckerModal } from './components/PincodeCheckerModal';
import { Footer } from './components/Footer';

export default function App() {
  const [products, setProducts] = useState<Product[]>(() => storage.getProducts());
  const [orders, setOrders] = useState<Order[]>(() => storage.getOrders());
  const [cart, setCart] = useState<CartItem[]>(() => storage.getCart());
  const [currentUser, setCurrentUser] = useState<User | null>(() => storage.getCurrentUser());

  const [currentCategory, setCurrentCategory] = useState<ProductCategory | 'all' | 'pre-owned'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPincode, setCurrentPincode] = useState('263139');

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isPincodeModalOpen, setIsPincodeModalOpen] = useState(false);

  // Sync data whenever modified
  const refreshStoreData = () => {
    setProducts(storage.getProducts());
    setOrders(storage.getOrders());
    setCart(storage.getCart());
    setCurrentUser(storage.getCurrentUser());
  };

  const handleAddToCart = (product: Product, quantity = 1, color?: string, storageVariant?: string) => {
    const updated = storage.addToCart(product, quantity, color, storageVariant);
    setCart([...updated]);
  };

  const handleBuyNow = (product: Product, color?: string, storageVariant?: string) => {
    handleAddToCart(product, 1, color, storageVariant);
    setSelectedProduct(null);
    setIsCheckoutOpen(true);
  };

  const handleUpdateQuantity = (productId: string, quantity: number, color?: string, storageVariant?: string) => {
    const updated = storage.updateCartQuantity(productId, quantity, color, storageVariant);
    setCart([...updated]);
  };

  const handleRemoveFromCart = (productId: string, color?: string, storageVariant?: string) => {
    const updated = storage.removeFromCart(productId, color, storageVariant);
    setCart([...updated]);
  };

  const handleOrderPlaced = (order: Order) => {
    refreshStoreData();
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Phase 2 RBAC enforcement: Strip sensitive serialized IMEI records from public customer view
  const publicProducts = React.useMemo(() => {
    return products.map(p => AccessPolicies.sanitizeProductForPublic(p, currentUser));
  }, [products, currentUser]);

  const sanitizedSelectedProduct = React.useMemo(() => {
    return selectedProduct ? AccessPolicies.sanitizeProductForPublic(selectedProduct, currentUser) : null;
  }, [selectedProduct, currentUser]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* 1. Header Navigation */}
      <Header
        currentCategory={currentCategory}
        onSelectCategory={(cat) => {
          setCurrentCategory(cat);
          setSearchQuery('');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        currentUser={currentUser}
        onOpenAccount={() => setIsAccountOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenPincodeModal={() => setIsPincodeModalOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        currentPincode={currentPincode}
      />

      {/* 2. Demonstration Data Disclaimer Banner */}
      <DemoDataNotice />

      {/* 3. Hero Section (shown when on main all-products view with no active search) */}
      {!searchQuery && currentCategory === 'all' && (
        <HeroBanner
          onSelectCategory={(cat) => {
            setCurrentCategory(cat);
            window.scrollTo({ top: 460, behavior: 'smooth' });
          }}
          onOpenPincodeModal={() => setIsPincodeModalOpen(true)}
        />
      )}

      {/* 4. Visual Category Tiles */}
      {!searchQuery && (
        <CategoryTiles
          currentCategory={currentCategory}
          onSelectCategory={(cat) => {
            setCurrentCategory(cat);
            window.scrollTo({ top: 460, behavior: 'smooth' });
          }}
        />
      )}

      {/* 5. Product Catalog Grid */}
      <main id="main-content" className="flex-1" role="main">
        <ProductGrid
          products={publicProducts}
          currentCategory={currentCategory}
          onSelectCategory={setCurrentCategory}
          onQuickView={(p) => setSelectedProduct(p)}
          onAddToCart={(p) => handleAddToCart(p, 1)}
          searchQuery={searchQuery}
        />
      </main>

      {/* 4. Footer & Store Information */}
      <Footer
        onSelectCategory={(cat) => {
          setCurrentCategory(cat);
          setSearchQuery('');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenPincodeModal={() => setIsPincodeModalOpen(true)}
      />

      {/* --- Interactive Modals & Drawers --- */}

      {/* Product Detail Modal (PDP) */}
      <ProductDetailModal
        product={sanitizedSelectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />

      {/* Cart Slide-Over Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* Multi-Step Checkout Modal with GST Invoice */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        currentUser={currentUser}
        onOrderPlaced={handleOrderPlaced}
      />

      {/* Customer Account & Order History Modal */}
      <CustomerAccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          refreshStoreData();
        }}
        onLogout={() => {
          storage.logout();
          setCurrentUser(null);
          refreshStoreData();
        }}
      />

      {/* Administrative Portal with IMEI Inventory */}
      <AdminPortal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        products={products}
        orders={orders}
        onDataModified={refreshStoreData}
      />

      {/* Regional PIN Code & Delivery Speed Checker */}
      <PincodeCheckerModal
        isOpen={isPincodeModalOpen}
        onClose={() => setIsPincodeModalOpen(false)}
        currentPincode={currentPincode}
        onSelectPincode={(pin) => setCurrentPincode(pin)}
      />
    </div>
  );
}
