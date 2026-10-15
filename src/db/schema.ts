/**
 * Database Schema and Role-Based Access Control (RBAC) Policies
 * Harvinder Telecom E-Commerce Platform
 * Strict Zero-Cost Architecture (SQLite / Cloudflare D1 Compatible)
 */

export interface DbCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon_name: string | null;
  display_order: number;
  created_at: string;
}

export interface DbBrand {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  created_at: string;
}

export interface DbProduct {
  id: string;
  sku: string;
  name: string;
  slug: string;
  brand_id: string;
  category_id: string;
  model: string;
  condition: 'new' | 'pre-owned';
  mrp: number; // Integer INR
  selling_price: number; // Integer INR
  discount_percent: number;
  gst_rate: number;
  hsn_code: string;
  stock_quantity: number;
  is_published: 0 | 1;
  warranty: string;
  short_description: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface DbProductImage {
  id: string;
  product_id: string;
  image_url: string;
  display_order: number;
  alt_text: string | null;
  created_at: string;
}

export interface DbProductVariant {
  id: string;
  product_id: string;
  sku: string;
  color: string | null;
  storage_capacity: string | null;
  ram_capacity: string | null;
  additional_price: number; // Integer INR
  stock_quantity: number;
  created_at: string;
}

export interface DbUnitImei {
  id: string;
  product_id: string;
  variant_id: string | null;
  imei1: string;
  imei2: string | null;
  serial_number: string;
  condition_note: string;
  status: 'in_stock' | 'reserved' | 'sold';
  assigned_order_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbCustomerProfile {
  id: string;
  email: string;
  password_hash: string;
  salt: string;
  full_name: string;
  phone: string;
  role: 'customer' | 'admin';
  is_active: 0 | 1;
  created_at: string;
  updated_at: string;
}

export interface DbCustomerAddress {
  id: string;
  customer_id: string;
  full_name: string;
  phone: string;
  pincode: string;
  flat_house: string;
  area_colony: string;
  city: string;
  state: string;
  landmark: string | null;
  is_default: 0 | 1;
  created_at: string;
}

export interface DbCartRecord {
  id: string;
  user_or_session_id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface DbInventoryReservation {
  id: string;
  product_id: string;
  unit_imei_id: string | null;
  session_id: string;
  quantity: number;
  reserved_until: string;
  status: 'active' | 'released' | 'converted';
  created_at: string;
}

export interface DbOrder {
  id: string;
  order_number: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  shipping_address_json: string;
  delivery_method: 'standard' | 'express_haldwani';
  payment_method: 'cod' | 'upi' | 'card_test' | 'netbanking';
  payment_status: 'pending' | 'paid' | 'cod_verified' | 'failed';
  order_status: 'placed' | 'confirmed' | 'packed' | 'dispatched' | 'out_for_delivery' | 'delivered' | 'cancelled';
  subtotal: number;
  discount: number;
  tax_amount: number;
  shipping_fee: number;
  total_amount: number;
  tracking_courier: string | null;
  tracking_number: string | null;
  created_at: string;
}

export interface DbOrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  brand: string;
  sku: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  hsn_code: string;
  gst_rate: number;
  selected_color: string | null;
  selected_storage: string | null;
  assigned_imei: string | null;
}

export interface DbPaymentRecord {
  id: string;
  order_id: string;
  payment_method: string;
  transaction_ref: string | null;
  amount: number;
  currency: string;
  status: string;
  gateway_response_json: string | null;
  created_at: string;
}

export interface DbOrderEvent {
  id: string;
  order_id: string;
  status: string;
  note: string;
  actor: string;
  timestamp: string;
}

export interface DbAuditLog {
  id: string;
  action: string;
  actor: string;
  details: string;
  ip_address: string | null;
  timestamp: string;
}

export interface DbStoreConfig {
  config_key: string;
  config_value: string;
  description: string | null;
  updated_at: string;
}

// ==============================================================================
// DATABASE ACCESS POLICIES & ROLE-BASED ACCESS CONTROL (RBAC)
// ==============================================================================

export const AccessPolicies = {
  /**
   * Only authenticated administrators can inspect IMEI 1, IMEI 2, and unit serial numbers.
   * Public storefront queries must have unit IMEI records stripped.
   */
  canAccessImeis(user: { role?: string } | null | undefined): boolean {
    return user?.role === 'admin';
  },

  /**
   * Only administrators can create, update, or delete products and change pricing/discounts.
   */
  canManageCatalog(user: { role?: string } | null | undefined): boolean {
    return user?.role === 'admin';
  },

  /**
   * Customers can view only orders associated with their own account ID.
   * Administrators have store-wide order visibility.
   */
  canViewOrder(user: { id?: string; role?: string } | null | undefined, orderCustomerId: string): boolean {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.id === orderCustomerId;
  },

  /**
   * Only administrators can view full system audit trails.
   */
  canViewAuditLogs(user: { role?: string } | null | undefined): boolean {
    return user?.role === 'admin';
  },

  /**
   * Strips confidential IMEI details from a product record before serving public storefront views.
   */
  sanitizeProductForPublic<T extends { unitImeis?: unknown }>(product: T, user: { role?: string } | null | undefined): T {
    if (this.canAccessImeis(user)) {
      return product;
    }
    // Deep clone and delete unitImeis
    const sanitized = { ...product };
    delete sanitized.unitImeis;
    return sanitized;
  }
};
