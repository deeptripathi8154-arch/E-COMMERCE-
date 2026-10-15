import { 
  Product, 
  Order, 
  User, 
  CartItem, 
  AuditLog, 
  OrderStatus, 
  Address, 
  UnitImeiRecord,
  PincodeInfo,
  InventoryReservation,
  ProductVariantOption
} from '../types';
import { SEED_PRODUCTS } from '../data/seedProducts';
import { AccessPolicies } from '../db/schema';
import { provisionAdministrator, AdminProvisionInput } from './adminAuth';

const STORAGE_KEYS = {
  PRODUCTS: 'HT_PRODUCTS_V1',
  ORDERS: 'HT_ORDERS_V1',
  USERS: 'HT_USERS_V1',
  CURRENT_USER: 'HT_CURRENT_USER_V1',
  CART: 'HT_CART_V1',
  AUDIT_LOGS: 'HT_AUDIT_LOGS_V1',
  SCHEMA_MIGRATIONS: 'HT_SCHEMA_MIGRATIONS_V1',
  RESERVATIONS: 'HT_RESERVATIONS_V1',
};

// Seed demo users
const INITIAL_USERS: User[] = [
  {
    id: 'user-admin-01',
    name: 'Harvinder Singh (Store Admin)',
    email: 'admin@harvindertelecom.com',
    phone: '9837012345',
    role: 'admin',
    savedAddresses: [
      {
        id: 'addr-admin-01',
        fullName: 'Harvinder Singh',
        phone: '9837012345',
        pincode: '263139',
        flatHouse: 'Shop No. 12-14, Harvinder Telecom',
        areaColony: 'Opposite Tikonia Chauraha, Nainital Road',
        city: 'Haldwani',
        state: 'Uttarakhand',
        landmark: 'Near Kumaon Motor Owners Union Bus Station',
        isDefault: true
      }
    ],
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'user-customer-01',
    name: 'Rahul Kumar',
    email: 'rahul.kumar@gmail.com',
    phone: '9876543210',
    role: 'customer',
    savedAddresses: [
      {
        id: 'addr-cust-01',
        fullName: 'Rahul Kumar',
        phone: '9876543210',
        pincode: '263139',
        flatHouse: 'House No. 42, Awas Vikas Colony',
        areaColony: 'Bhotia Parao',
        city: 'Haldwani',
        state: 'Uttarakhand',
        landmark: 'Near Golghar Market',
        isDefault: true
      }
    ],
    createdAt: '2026-02-14T10:00:00Z'
  }
];

// Initial seed orders for immediate realistic dashboard & customer order tracking
const INITIAL_ORDERS: Order[] = [
  {
    id: 'order-ht-8910',
    orderNumber: 'HT-2026-8910',
    userId: 'user-customer-01',
    customerName: 'Rahul Kumar',
    customerPhone: '9876543210',
    customerEmail: 'rahul.kumar@gmail.com',
    items: [
      {
        productId: 'prod-boat-airdopes-800',
        productName: 'boAt Airdopes 800 TWS Earbuds with LDAC & 4-Mic AI-ENx ANC',
        brand: 'boAt',
        sku: 'BOAT-AD800-BLK',
        quantity: 1,
        unitPrice: 1999,
        totalPrice: 1999,
        hsnCode: '8518',
        gstRate: 18,
        selectedColor: 'Carbon Black'
      }
    ],
    shippingAddress: {
      id: 'addr-cust-01',
      fullName: 'Rahul Kumar',
      phone: '9876543210',
      pincode: '263139',
      flatHouse: 'House No. 42, Awas Vikas Colony',
      areaColony: 'Bhotia Parao',
      city: 'Haldwani',
      state: 'Uttarakhand',
      landmark: 'Near Golghar Market',
      isDefault: true
    },
    deliveryMethod: 'express_haldwani',
    paymentMethod: 'upi',
    paymentStatus: 'paid',
    orderStatus: 'out_for_delivery',
    subtotal: 1999,
    discount: 0,
    taxAmount: 305, // 18% GST included
    shippingFee: 0,
    totalAmount: 1999,
    trackingCourier: 'Harvinder Express Local Rider',
    trackingNumber: 'HT-HLD-2026-092',
    createdAt: '2026-04-12T08:30:00Z',
    timeline: [
      { status: 'placed', timestamp: '2026-04-12T08:30:00Z', note: 'Order placed successfully via UPI' },
      { status: 'confirmed', timestamp: '2026-04-12T08:45:00Z', note: 'Confirmed by Harvinder Telecom Haldwani Store' },
      { status: 'packed', timestamp: '2026-04-12T09:15:00Z', note: 'Carefully packaged with tamper-proof security seal' },
      { status: 'dispatched', timestamp: '2026-04-12T10:00:00Z', note: 'Handed over to local delivery partner' },
      { status: 'out_for_delivery', timestamp: '2026-04-12T11:00:00Z', note: 'Rider on the way: Naveen (Contact: 98371-XXXXX)' }
    ]
  }
];

const INITIAL_LOGS: AuditLog[] = [
  {
    id: 'log-01',
    action: 'SYSTEM_BOOT',
    actor: 'System',
    details: 'Store database initialized with Haldwani inventory and GST config',
    timestamp: '2026-01-01T00:00:00Z'
  },
  {
    id: 'log-02',
    action: 'INVENTORY_SEEDED',
    actor: 'admin@harvindertelecom.com',
    details: 'Seeded initial 11 flagship electronics products with unit IMEIs',
    timestamp: '2026-01-01T00:05:00Z'
  }
];

class StorageService {
  constructor() {
    this.init();
  }

  private isLocalStorageAvailable(): boolean {
    try {
      return typeof window !== 'undefined' && !!window.localStorage;
    } catch {
      return false;
    }
  }

  private init(): void {
    if (!this.isLocalStorageAvailable()) return;

    // Versioned schema migration check (preserves existing data)
    const appliedMigrations = this.getAppliedMigrations();
    if (!appliedMigrations.includes('0001_initial_schema')) {
      appliedMigrations.push('0001_initial_schema');
      localStorage.setItem(STORAGE_KEYS.SCHEMA_MIGRATIONS, JSON.stringify(appliedMigrations));
    }

    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(SEED_PRODUCTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
      // Default to guest / not logged in
    }
    if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_LOGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CART)) {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify([]));
    }
  }

  getAppliedMigrations(): string[] {
    if (!this.isLocalStorageAvailable()) return ['0001_initial_schema'];
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SCHEMA_MIGRATIONS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  // ---- PRODUCTS ----
  getProducts(): Product[] {
    if (!this.isLocalStorageAvailable()) return SEED_PRODUCTS;
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!raw) return SEED_PRODUCTS;
    try {
      return JSON.parse(raw);
    } catch {
      return SEED_PRODUCTS;
    }
  }

  // Returns products for public storefront with IMEI numbers sanitized unless user is an authorized admin
  getPublicProducts(): Product[] {
    const raw = this.getProducts();
    const currentUser = this.getCurrentUser();
    return raw.map(p => AccessPolicies.sanitizeProductForPublic(p, currentUser));
  }

  saveProducts(products: Product[]): void {
    if (!this.isLocalStorageAvailable()) return;
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }

  getProductById(id: string): Product | undefined {
    return this.getProducts().find(p => p.id === id);
  }

  addProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    const products = this.getProducts();
    const newProduct: Product = {
      ...product,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    products.unshift(newProduct);
    this.saveProducts(products);
    this.addAuditLog('ADD_PRODUCT', this.getCurrentUser()?.email || 'admin', `Added product: ${newProduct.name} (SKU: ${newProduct.sku})`);
    return newProduct;
  }

  updateProduct(id: string, updates: Partial<Product>): Product | null {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return null;

    const updated: Product = {
      ...products[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    products[index] = updated;
    this.saveProducts(products);
    this.addAuditLog('UPDATE_PRODUCT', this.getCurrentUser()?.email || 'admin', `Updated product: ${updated.name}`);
    return updated;
  }

  deleteProduct(id: string): boolean {
    const products = this.getProducts();
    const target = products.find(p => p.id === id);
    if (!target) return false;

    const filtered = products.filter(p => p.id !== id);
    this.saveProducts(filtered);
    this.addAuditLog('DELETE_PRODUCT', this.getCurrentUser()?.email || 'admin', `Deleted product: ${target.name} (SKU: ${target.sku})`);
    return true;
  }

  // ---- UNIT IMEI TRACKING (FOR SMARTPHONES & TABLETS - ADMIN ONLY) ----
  addUnitImei(productId: string, unit: Omit<UnitImeiRecord, 'id'>): UnitImeiRecord | null {
    const product = this.getProductById(productId);
    if (!product) return null;

    const newUnit: UnitImeiRecord = {
      ...unit,
      id: `imei-${Date.now()}`
    };

    const imeis = product.unitImeis || [];
    imeis.push(newUnit);

    this.updateProduct(productId, {
      unitImeis: imeis,
      stockQuantity: imeis.filter(i => i.status === 'in_stock').length
    });

    this.addAuditLog('ADD_UNIT_IMEI', this.getCurrentUser()?.email || 'admin', `Added IMEI ${newUnit.imei1} to ${product.name}`);
    return newUnit;
  }

  updateUnitImei(productId: string, imeiId: string, updates: Partial<UnitImeiRecord>): boolean {
    const product = this.getProductById(productId);
    if (!product || !product.unitImeis) return false;

    const unitIndex = product.unitImeis.findIndex(u => u.id === imeiId);
    if (unitIndex === -1) return false;

    product.unitImeis[unitIndex] = {
      ...product.unitImeis[unitIndex],
      ...updates
    };

    const inStockCount = product.unitImeis.filter(i => i.status === 'in_stock').length;
    this.updateProduct(productId, {
      unitImeis: product.unitImeis,
      stockQuantity: inStockCount
    });

    this.addAuditLog('UPDATE_UNIT_IMEI', this.getCurrentUser()?.email || 'admin', `Updated IMEI unit ${imeiId} on ${product.name}`);
    return true;
  }

  deleteUnitImei(productId: string, imeiId: string): boolean {
    const product = this.getProductById(productId);
    if (!product || !product.unitImeis) return false;

    const filtered = product.unitImeis.filter(u => u.id !== imeiId);
    this.updateProduct(productId, {
      unitImeis: filtered,
      stockQuantity: filtered.filter(i => i.status === 'in_stock').length
    });

    this.addAuditLog('DELETE_UNIT_IMEI', this.getCurrentUser()?.email || 'admin', `Deleted IMEI unit ${imeiId} from ${product.name}`);
    return true;
  }

  // ---- DYNAMIC VARIANT PRICING & SPEC RESOLVER (PHASE 3) ----
  calculateResolvedPrice(product: Product, selectedStorage?: string): {
    sellingPrice: number;
    mrp: number;
    discountPercent: number;
    ram?: string;
    variantOption?: ProductVariantOption;
  } {
    if (!selectedStorage || !product.variants || product.variants.length === 0) {
      return {
        sellingPrice: product.sellingPrice,
        mrp: product.mrp,
        discountPercent: product.discountPercent,
      };
    }

    const matchedVariant = product.variants.find(v => v.storage === selectedStorage);
    if (!matchedVariant) {
      return {
        sellingPrice: product.sellingPrice,
        mrp: product.mrp,
        discountPercent: product.discountPercent,
      };
    }

    const sellingPrice = product.sellingPrice + matchedVariant.priceOffset;
    const mrp = product.mrp + (matchedVariant.mrpOffset ?? matchedVariant.priceOffset);
    const discountPercent = mrp > sellingPrice ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0;

    return {
      sellingPrice,
      mrp,
      discountPercent,
      ram: matchedVariant.ram,
      variantOption: matchedVariant
    };
  }

  // ---- REAL-TIME STOCK RESERVATION LOCKS (PHASE 3) ----
  getSessionId(): string {
    if (!this.isLocalStorageAvailable()) return 'session_default';
    let sid = sessionStorage.getItem('HT_SESSION_ID');
    if (!sid) {
      sid = `ht_sess_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      sessionStorage.setItem('HT_SESSION_ID', sid);
    }
    return sid;
  }

  getReservations(): InventoryReservation[] {
    if (!this.isLocalStorageAvailable()) return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.RESERVATIONS);
      const list: InventoryReservation[] = raw ? JSON.parse(raw) : [];
      // Clean up expired locks (> 15 minutes old)
      const now = new Date().toISOString();
      const valid = list.filter(r => r.status !== 'active' || r.reservedUntil > now);
      if (valid.length !== list.length) {
        localStorage.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(valid));
      }
      return valid;
    } catch {
      return [];
    }
  }

  saveReservations(reservations: InventoryReservation[]): void {
    if (!this.isLocalStorageAvailable()) return;
    localStorage.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(reservations));
  }

  getEffectiveAvailableStock(productId: string, storageVariant?: string, excludeSessionId?: string): number {
    const product = this.getProductById(productId);
    if (!product) return 0;

    const baseStock = product.stockQuantity;
    const now = new Date().toISOString();
    const activeReservations = this.getReservations().filter(r => 
      r.productId === productId && 
      r.status === 'active' && 
      r.reservedUntil > now &&
      (!storageVariant || !r.storage || r.storage === storageVariant) &&
      (!excludeSessionId || r.sessionId !== excludeSessionId)
    );

    const reservedCount = activeReservations.reduce((sum, r) => sum + r.quantity, 0);
    return Math.max(0, baseStock - reservedCount);
  }

  reserveStock(productId: string, quantity: number, storageVariant?: string, color?: string): { success: boolean; availableStock: number; error?: string } {
    const sessionId = this.getSessionId();
    const available = this.getEffectiveAvailableStock(productId, storageVariant, sessionId);

    if (available < quantity) {
      return { 
        success: false, 
        availableStock: available, 
        error: `Only ${available} unit(s) available. Others are locked in active checkouts.` 
      };
    }

    // 15-minute reservation hold
    const reservedUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    const reservations = this.getReservations();
    
    // Refresh or add reservation for this session
    const existingIndex = reservations.findIndex(r => 
      r.productId === productId && 
      r.sessionId === sessionId && 
      r.storage === storageVariant && 
      r.color === color &&
      r.status === 'active'
    );

    if (existingIndex > -1) {
      reservations[existingIndex].quantity = quantity;
      reservations[existingIndex].reservedUntil = reservedUntil;
    } else {
      reservations.push({
        id: `res-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        productId,
        quantity,
        storage: storageVariant,
        color,
        sessionId,
        reservedUntil,
        status: 'active'
      });
    }

    this.saveReservations(reservations);
    return { success: true, availableStock: available };
  }

  releaseSessionReservations(sessionId?: string): void {
    const sid = sessionId || this.getSessionId();
    const reservations = this.getReservations();
    reservations.forEach(r => {
      if (r.sessionId === sid && r.status === 'active') {
        r.status = 'released';
      }
    });
    this.saveReservations(reservations);
  }

  convertSessionReservations(sessionId?: string): void {
    const sid = sessionId || this.getSessionId();
    const reservations = this.getReservations();
    reservations.forEach(r => {
      if (r.sessionId === sid && r.status === 'active') {
        r.status = 'converted';
      }
    });
    this.saveReservations(reservations);
  }

  // ---- CART MANAGEMENT ----
  getCart(): CartItem[] {
    if (!this.isLocalStorageAvailable()) return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CART);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  saveCart(cart: CartItem[]): void {
    if (!this.isLocalStorageAvailable()) return;
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  }

  addToCart(product: Product, quantity = 1, selectedColor?: string, selectedStorage?: string): CartItem[] {
    const cart = this.getCart();
    const resolved = this.calculateResolvedPrice(product, selectedStorage);

    const existingIndex = cart.findIndex(item => 
      item.productId === product.id &&
      item.selectedColor === selectedColor &&
      item.selectedStorage === selectedStorage
    );

    if (existingIndex > -1) {
      cart[existingIndex].quantity += quantity;
      cart[existingIndex].unitPrice = resolved.sellingPrice;
    } else {
      cart.push({
        productId: product.id,
        product,
        quantity,
        selectedColor,
        selectedStorage,
        selectedRam: resolved.ram,
        unitPrice: resolved.sellingPrice
      });
    }

    // Lock real-time inventory reservation
    this.reserveStock(
      product.id, 
      (existingIndex > -1 ? cart[existingIndex].quantity : quantity), 
      selectedStorage, 
      selectedColor
    );

    this.saveCart(cart);
    return cart;
  }

  updateCartQuantity(productId: string, quantity: number, selectedColor?: string, selectedStorage?: string): CartItem[] {
    let cart = this.getCart();
    if (quantity <= 0) {
      cart = cart.filter(item => 
        !(item.productId === productId && item.selectedColor === selectedColor && item.selectedStorage === selectedStorage)
      );
    } else {
      const item = cart.find(i => 
        i.productId === productId && i.selectedColor === selectedColor && i.selectedStorage === selectedStorage
      );
      if (item) {
        item.quantity = quantity;
        this.reserveStock(productId, quantity, selectedStorage, selectedColor);
      }
    }
    this.saveCart(cart);
    return cart;
  }

  removeFromCart(productId: string, selectedColor?: string, selectedStorage?: string): CartItem[] {
    const cart = this.getCart().filter(item => 
      !(item.productId === productId && item.selectedColor === selectedColor && item.selectedStorage === selectedStorage)
    );

    // Release active reservation for this item
    const sessionId = this.getSessionId();
    const reservations = this.getReservations();
    const res = reservations.find(r => 
      r.productId === productId && 
      r.sessionId === sessionId && 
      r.storage === selectedStorage && 
      r.color === selectedColor && 
      r.status === 'active'
    );
    if (res) {
      res.status = 'released';
      this.saveReservations(reservations);
    }

    this.saveCart(cart);
    return cart;
  }

  clearCart(): void {
    this.releaseSessionReservations();
    this.saveCart([]);
  }

  // ---- ORDERS & CHECKOUT (TRANSACTION-SAFE RESERVATION & STOCK DEDUCTION) ----
  getOrders(): Order[] {
    if (!this.isLocalStorageAvailable()) return INITIAL_ORDERS;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return raw ? JSON.parse(raw) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  }

  saveOrders(orders: Order[]): void {
    if (!this.isLocalStorageAvailable()) return;
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }

  getOrderById(id: string): Order | undefined {
    const order = this.getOrders().find(o => o.id === id);
    if (!order) return undefined;
    const currentUser = this.getCurrentUser();
    if (!AccessPolicies.canViewOrder(currentUser, order.userId)) {
      return undefined; // Access denied: customer cannot view another customer's order
    }
    return order;
  }

  getOrdersForUser(userId: string): Order[] {
    const currentUser = this.getCurrentUser();
    // Strict RBAC isolation: customer cannot query another customer's orders
    if (currentUser?.role === 'admin') {
      return this.getOrders().filter(o => !userId || o.userId === userId);
    }
    if (!currentUser || currentUser.id !== userId) {
      return [];
    }
    return this.getOrders().filter(o => o.userId === userId);
  }

  createOrder(orderInput: {
    userId: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    shippingAddress: Address;
    deliveryMethod: 'standard' | 'express_haldwani';
    paymentMethod: 'cod' | 'upi' | 'card_test' | 'netbanking';
    cartItems: CartItem[];
  }): { success: boolean; order?: Order; error?: string } {
    const products = this.getProducts();

    // 1. Transaction-safe inventory verification
    for (const item of orderInput.cartItems) {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        return { success: false, error: `Product "${item.product.name}" no longer exists in store catalog.` };
      }
      if (product.stockQuantity < item.quantity) {
        return { 
          success: false, 
          error: `Insufficient stock for "${product.name}". Only ${product.stockQuantity} available.` 
        };
      }
    }

    const orderId = `order-ht-${Date.now().toString().slice(-4)}`;
    const orderNumber = `HT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    // 2. Build order items & assign individual IMEI for tracked smartphones
    const orderItems = orderInput.cartItems.map(item => {
      const product = products.find(p => p.id === item.productId)!;
      let assignedImeiNumber: string | undefined = undefined;

      // Assign unit IMEI if smartphone or tablet
      if (product.unitImeis && product.unitImeis.length > 0) {
        const availableUnit = product.unitImeis.find(u => u.status === 'in_stock');
        if (availableUnit) {
          availableUnit.status = 'sold';
          availableUnit.assignedOrderId = orderId;
          assignedImeiNumber = availableUnit.imei1;
        }
      }

      // Deduct aggregate stock quantity
      product.stockQuantity = Math.max(0, product.stockQuantity - item.quantity);
      product.updatedAt = now;

      const unitPrice = item.unitPrice || product.sellingPrice;
      const lineTotal = unitPrice * item.quantity;
      return {
        productId: product.id,
        productName: product.name,
        brand: product.brand,
        sku: product.sku,
        quantity: item.quantity,
        unitPrice: unitPrice,
        totalPrice: lineTotal,
        hsnCode: product.hsnCode,
        gstRate: product.gstRate,
        selectedColor: item.selectedColor,
        selectedStorage: item.selectedStorage,
        assignedImei: assignedImeiNumber
      };
    });

    // Save updated products inventory
    this.saveProducts(products);

    const subtotal = orderItems.reduce((acc, curr) => acc + curr.totalPrice, 0);
    // 18% GST inclusive: Tax = Subtotal - (Subtotal / 1.18)
    const taxAmount = Math.round(subtotal - (subtotal / 1.18));
    const shippingFee = (subtotal >= 499 || orderInput.deliveryMethod === 'express_haldwani') ? 0 : 70;
    const totalAmount = subtotal + shippingFee;

    const initialStatus = orderInput.paymentMethod === 'cod' ? 'confirmed' : 'confirmed';
    const paymentStatus = orderInput.paymentMethod === 'cod' ? 'cod_verified' : 'paid';

    const newOrder: Order = {
      id: orderId,
      orderNumber,
      userId: orderInput.userId,
      customerName: orderInput.customerName,
      customerPhone: orderInput.customerPhone,
      customerEmail: orderInput.customerEmail,
      items: orderItems,
      shippingAddress: orderInput.shippingAddress,
      deliveryMethod: orderInput.deliveryMethod,
      paymentMethod: orderInput.paymentMethod,
      paymentStatus,
      orderStatus: initialStatus,
      subtotal,
      discount: 0,
      taxAmount,
      shippingFee,
      totalAmount,
      trackingCourier: orderInput.deliveryMethod === 'express_haldwani' ? 'Harvinder Express Haldwani' : 'Insured Bluedart / Delhivery',
      trackingNumber: `HT-${orderInput.shippingAddress.pincode}-${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: now,
      timeline: [
        {
          status: 'placed',
          timestamp: now,
          note: `Order placed successfully via ${orderInput.paymentMethod.toUpperCase()}`
        },
        {
          status: 'confirmed',
          timestamp: now,
          note: orderInput.deliveryMethod === 'express_haldwani' 
            ? 'Confirmed: Eligible for 24-hr Same-Day Haldwani Delivery'
            : 'Confirmed: Order ready for packing and dispatch'
        }
      ]
    };

    const orders = this.getOrders();
    orders.unshift(newOrder);
    this.saveOrders(orders);

    // Convert session reservations and clear cart
    this.convertSessionReservations(this.getSessionId());
    this.clearCart();

    this.addAuditLog(
      'ORDER_CREATED',
      orderInput.customerEmail,
      `New order ${orderNumber} placed by ${orderInput.customerName} for ₹${totalAmount.toLocaleString('en-IN')}`
    );

    return { success: true, order: newOrder };
  }

  updateOrderStatus(orderId: string, newStatus: OrderStatus, courier?: string, trackingNumber?: string): boolean {
    const orders = this.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return false;

    order.orderStatus = newStatus;
    if (courier) order.trackingCourier = courier;
    if (trackingNumber) order.trackingNumber = trackingNumber;

    const statusNotes: Record<OrderStatus, string> = {
      placed: 'Order received by Harvinder Telecom',
      confirmed: 'Order verified and confirmed by Haldwani team',
      packed: 'Packed securely in tamper-evident packaging',
      dispatched: `Dispatched via ${order.trackingCourier || 'Harvinder Logistics'}`,
      out_for_delivery: 'Out for final delivery to your address',
      delivered: 'Delivered and verified with customer',
      cancelled: 'Order cancelled'
    };

    order.timeline.push({
      status: newStatus,
      timestamp: new Date().toISOString(),
      note: statusNotes[newStatus] || `Status updated to ${newStatus}`
    });

    this.saveOrders(orders);
    this.addAuditLog(
      'ORDER_STATUS_UPDATED',
      this.getCurrentUser()?.email || 'admin',
      `Order ${order.orderNumber} status changed to ${newStatus}`
    );
    return true;
  }

  cancelOrder(orderId: string, reason = 'Cancelled by customer'): boolean {
    const orders = this.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order || order.orderStatus === 'delivered' || order.orderStatus === 'cancelled') {
      return false;
    }

    // Restore inventory and IMEIs
    const products = this.getProducts();
    for (const item of order.items) {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        product.stockQuantity += item.quantity;
        if (product.unitImeis && item.assignedImei) {
          const unit = product.unitImeis.find(u => u.imei1 === item.assignedImei);
          if (unit) {
            unit.status = 'in_stock';
            unit.assignedOrderId = undefined;
          }
        }
      }
    }
    this.saveProducts(products);

    order.orderStatus = 'cancelled';
    order.timeline.push({
      status: 'cancelled',
      timestamp: new Date().toISOString(),
      note: `Order cancelled. Reason: ${reason}. Inventory restored.`
    });

    this.saveOrders(orders);
    this.addAuditLog(
      'ORDER_CANCELLED',
      this.getCurrentUser()?.email || 'customer',
      `Order ${order.orderNumber} cancelled. Stock restored.`
    );
    return true;
  }

  // ---- USER AUTH & PROFILES ----
  getUsers(): User[] {
    if (!this.isLocalStorageAvailable()) return INITIAL_USERS;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.USERS);
      return raw ? JSON.parse(raw) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  }

  saveUsers(users: User[]): void {
    if (!this.isLocalStorageAvailable()) return;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  getCurrentUser(): User | null {
    if (!this.isLocalStorageAvailable()) return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  setCurrentUser(user: User | null): void {
    if (!this.isLocalStorageAvailable()) return;
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }

  login(email: string): { success: boolean; user?: User; error?: string } {
    const normalizedEmail = email.trim().toLowerCase();
    const users = this.getUsers();
    const user = users.find(u => u.email.toLowerCase() === normalizedEmail);

    if (!user) {
      return { success: false, error: 'No account found with this email. Please register below.' };
    }

    this.setCurrentUser(user);
    this.addAuditLog('USER_LOGIN', user.email, `User ${user.name} logged in`);
    return { success: true, user };
  }

  register(name: string, email: string, phone: string): { success: boolean; user?: User; error?: string } {
    const normalizedEmail = email.trim().toLowerCase();
    const users = this.getUsers();

    if (users.some(u => u.email.toLowerCase() === normalizedEmail)) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      role: 'customer',
      savedAddresses: [],
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    this.saveUsers(users);
    this.setCurrentUser(newUser);

    this.addAuditLog('USER_REGISTER', newUser.email, `New customer registered: ${newUser.name}`);
    return { success: true, user: newUser };
  }

  async provisionNewAdmin(input: AdminProvisionInput): Promise<{ success: boolean; user?: User; error?: string }> {
    const current = this.getCurrentUser();
    const result = await provisionAdministrator(input, current || undefined);
    if (!result.success || !result.profile) {
      return { success: false, error: result.error };
    }

    const users = this.getUsers();
    if (users.some(u => u.email.toLowerCase() === result.profile!.email.toLowerCase())) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    const newAdminUser: User = {
      id: result.profile.id,
      name: result.profile.name,
      email: result.profile.email,
      phone: result.profile.phone,
      role: 'admin',
      savedAddresses: [],
      createdAt: new Date().toISOString()
    };

    users.push(newAdminUser);
    this.saveUsers(users);
    this.addAuditLog('ADMIN_PROVISIONED', result.profile.email, `New administrator provisioned: ${result.profile.name}`);
    return { success: true, user: newAdminUser };
  }

  logout(): void {
    const user = this.getCurrentUser();
    if (user) {
      this.addAuditLog('USER_LOGOUT', user.email, `User logged out`);
    }
    this.setCurrentUser(null);
  }

  updateUserProfile(updates: Partial<User>): User | null {
    const current = this.getCurrentUser();
    if (!current) return null;

    const updatedUser: User = { ...current, ...updates };
    const users = this.getUsers().map(u => u.id === current.id ? updatedUser : u);
    
    this.saveUsers(users);
    this.setCurrentUser(updatedUser);
    return updatedUser;
  }

  saveUserAddress(address: Omit<Address, 'id'>): Address | null {
    const user = this.getCurrentUser();
    if (!user) return null;

    const newAddr: Address = {
      ...address,
      id: `addr-${Date.now()}`
    };

    if (newAddr.isDefault) {
      user.savedAddresses.forEach(a => a.isDefault = false);
    } else if (user.savedAddresses.length === 0) {
      newAddr.isDefault = true;
    }

    user.savedAddresses.push(newAddr);
    this.updateUserProfile({ savedAddresses: user.savedAddresses });
    return newAddr;
  }

  deleteUserAddress(addressId: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    const filtered = user.savedAddresses.filter(a => a.id !== addressId);
    if (filtered.length > 0 && !filtered.some(a => a.isDefault)) {
      filtered[0].isDefault = true;
    }
    this.updateUserProfile({ savedAddresses: filtered });
    return true;
  }

  // ---- PIN CODE CHECKER (HALDWANI, UTTARAKHAND & ALL-INDIA) ----
  checkPincode(pincode: string): PincodeInfo {
    const cleaned = pincode.replace(/\D/g, '').slice(0, 6);

    // Kumaon & Uttarakhand specific hubs
    const UTTARAKHAND_PINS: Record<string, { city: string; district: string; express: boolean; days: number }> = {
      '263139': { city: 'Haldwani', district: 'Nainital', express: true, days: 0 }, // Same day (0-1 day)
      '263141': { city: 'Kathgodam', district: 'Nainital', express: true, days: 0 },
      '263126': { city: 'Lalkuan', district: 'Nainital', express: true, days: 1 },
      '263001': { city: 'Nainital (Mallital)', district: 'Nainital', express: false, days: 1 },
      '263002': { city: 'Nainital (Tallital)', district: 'Nainital', express: false, days: 1 },
      '263138': { city: 'Bhowali', district: 'Nainital', express: false, days: 1 },
      '263136': { city: 'Mukteshwar', district: 'Nainital', express: false, days: 2 },
      '263153': { city: 'Rudrapur', district: 'Udham Singh Nagar', express: true, days: 1 },
      '263148': { city: 'Kashipur', district: 'Udham Singh Nagar', express: false, days: 1 },
      '263601': { city: 'Almora', district: 'Almora', express: false, days: 2 },
      '263645': { city: 'Ranikhet', district: 'Almora', express: false, days: 2 },
      '262501': { city: 'Pithoragarh', district: 'Pithoragarh', express: false, days: 3 },
      '248001': { city: 'Dehradun', district: 'Dehradun', express: false, days: 2 },
      '249201': { city: 'Haridwar', district: 'Haridwar', express: false, days: 2 }
    };

    if (UTTARAKHAND_PINS[cleaned]) {
      const info = UTTARAKHAND_PINS[cleaned];
      return {
        pincode: cleaned,
        city: info.city,
        district: info.district,
        state: 'Uttarakhand',
        isExpressHaldwaniAvailable: info.express,
        estimatedDeliveryDays: info.days,
        codAvailable: true
      };
    }

    // Default estimate for Delhi/NCR and rest of India
    const isDelhi = cleaned.startsWith('11');
    return {
      pincode: cleaned,
      city: isDelhi ? 'Delhi' : 'India City',
      district: isDelhi ? 'Delhi NCR' : 'Local District',
      state: isDelhi ? 'Delhi' : 'India',
      isExpressHaldwaniAvailable: false,
      estimatedDeliveryDays: isDelhi ? 2 : 4,
      codAvailable: true
    };
  }

  // ---- AUDIT LOGS ----
  getAuditLogs(): AuditLog[] {
    if (!this.isLocalStorageAvailable()) return INITIAL_LOGS;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      return raw ? JSON.parse(raw) : INITIAL_LOGS;
    } catch {
      return INITIAL_LOGS;
    }
  }

  addAuditLog(action: string, actor: string, details: string): void {
    if (!this.isLocalStorageAvailable()) return;
    const logs = this.getAuditLogs();
    logs.unshift({
      id: `log-${Date.now()}`,
      action,
      actor,
      details,
      timestamp: new Date().toISOString()
    });
    // Keep last 150 logs
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs.slice(0, 150)));
  }

  // ---- DATABASE EXPORT, IMPORT & FACTORY RESET ----
  exportStoreData(): string {
    const data = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      store: 'Harvinder Telecom, Haldwani',
      products: this.getProducts(),
      orders: this.getOrders(),
      users: this.getUsers(),
      auditLogs: this.getAuditLogs()
    };
    return JSON.stringify(data, null, 2);
  }

  importStoreData(jsonString: string): { success: boolean; message: string } {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.products || !Array.isArray(parsed.products)) {
        return { success: false, message: 'Invalid backup file structure: missing products list.' };
      }

      this.saveProducts(parsed.products);
      if (parsed.orders) this.saveOrders(parsed.orders);
      if (parsed.users) this.saveUsers(parsed.users);
      if (parsed.auditLogs) localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(parsed.auditLogs));

      this.addAuditLog('DB_IMPORTED', 'admin', 'Store database restored from local JSON backup file');
      return { success: true, message: 'Store database successfully restored!' };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown parse error';
      return { success: false, message: `Failed to restore database: ${message}` };
    }
  }

  resetToDefaults(): void {
    if (!this.isLocalStorageAvailable()) return;
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(SEED_PRODUCTS));
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_LOGS));
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify([]));
  }
}

export const storage = new StorageService();
