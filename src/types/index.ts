export type ProductCategory = 
  | 'smartphones'
  | 'tablets'
  | 'accessories'
  | 'audio'
  | 'wearables'
  | 'computing';

export type ProductCondition = 'new' | 'pre-owned';

export type PreOwnedGrade = 'flawless_like_new' | 'excellent' | 'good';

export interface PreOwnedDetails {
  grade: PreOwnedGrade;
  gradeLabel: string; // e.g. 'Grade A+ · Flawless Like New'
  batteryHealthPercent?: number; // e.g. 96
  inspectionPointsPassed: number; // e.g. 45-point test
  storeWarrantyMonths: number; // e.g. 6 months
  includedAccessories: string[];
  diagnosticReportSummary: string;
}

export interface ProductVariantOption {
  id: string;
  storage: string; // e.g. '128GB', '256GB', '512GB', '1TB'
  ram?: string; // e.g. '8GB', '12GB', '16GB'
  priceOffset: number; // INR addition to base selling price
  mrpOffset?: number; // INR addition to base MRP
  stockQuantity: number;
  skuSuffix: string;
}

export interface InventoryReservation {
  id: string;
  productId: string;
  storage?: string;
  color?: string;
  quantity: number;
  sessionId: string;
  reservedUntil: string; // ISO timestamp
  status: 'active' | 'released' | 'converted';
}

export interface UnitImeiRecord {
  id: string;
  imei1: string;
  imei2?: string;
  serialNumber: string;
  conditionNote: string;
  status: 'in_stock' | 'reserved' | 'sold';
  assignedOrderId?: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  model: string;
  sku: string;
  slug: string;
  category: ProductCategory;
  shortDescription: string;
  description: string;
  images: string[];
  sellingPrice: number; // Base selling price in INR
  mrp: number; // Base MRP in INR
  discountPercent: number;
  gstRate: number; // e.g. 18
  hsnCode: string; // e.g. '8517'
  stockQuantity: number;
  isPublished: boolean;
  condition: ProductCondition;
  preOwnedDetails?: PreOwnedDetails;
  warranty: string;
  colors: string[];
  storageVariants: string[];
  variants?: ProductVariantOption[];
  specifications: Record<string, string>;
  unitImeis?: UnitImeiRecord[]; // Restricted to admin
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  pincode: string;
  flatHouse: string;
  areaColony: string;
  city: string;
  state: string;
  landmark?: string;
  isDefault?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin';
  savedAddresses: Address[];
  createdAt: string;
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedStorage?: string;
  selectedRam?: string;
  unitPrice?: number;
}

export type OrderStatus = 
  | 'placed'
  | 'confirmed'
  | 'packed'
  | 'dispatched'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod = 'cod' | 'upi' | 'card_test' | 'netbanking';
export type PaymentStatus = 'pending' | 'paid' | 'cod_verified' | 'failed';
export type DeliveryMethod = 'standard' | 'express_haldwani';

export interface OrderItem {
  productId: string;
  productName: string;
  brand: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  hsnCode: string;
  gstRate: number;
  selectedColor?: string;
  selectedStorage?: string;
  assignedImei?: string; // Assigned unit IMEI for phones/tablets
}

export interface OrderTimelineEvent {
  status: OrderStatus;
  timestamp: string;
  note: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  items: OrderItem[];
  shippingAddress: Address;
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  subtotal: number;
  discount: number;
  taxAmount: number;
  shippingFee: number;
  totalAmount: number;
  trackingCourier?: string;
  trackingNumber?: string;
  createdAt: string;
  timeline: OrderTimelineEvent[];
}

export interface AuditLog {
  id: string;
  action: string;
  actor: string;
  details: string;
  timestamp: string;
}

export interface PincodeInfo {
  pincode: string;
  city: string;
  district: string;
  state: string;
  isExpressHaldwaniAvailable: boolean;
  estimatedDeliveryDays: number;
  codAvailable: boolean;
}
