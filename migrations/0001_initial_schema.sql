-- ==============================================================================
-- HARVINDER TELECOM E-COMMERCE — PRODUCTION DATABASE MIGRATION
-- Migration Version: 0001_initial_schema
-- Target Dialect: SQLite / Cloudflare D1 Compatible SQL
-- Zero-Cost Infrastructure Policy (Strict ₹0 Budget)
-- ==============================================================================

-- 1. Schema Migrations Ledger
CREATE TABLE IF NOT EXISTS schema_migrations (
    version TEXT PRIMARY KEY,
    description TEXT NOT NULL,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Product Categories
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon_name TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Brands
CREATE TABLE IF NOT EXISTS brands (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Products Table (Master Catalogue)
-- All monetary amounts stored as whole integer INR to avoid floating-point math
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    sku TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    brand_id TEXT NOT NULL,
    category_id TEXT NOT NULL,
    model TEXT NOT NULL,
    condition TEXT NOT NULL CHECK(condition IN ('new', 'pre-owned')),
    mrp INTEGER NOT NULL CHECK(mrp >= 0),
    selling_price INTEGER NOT NULL CHECK(selling_price >= 0),
    discount_percent INTEGER DEFAULT 0 CHECK(discount_percent >= 0 AND discount_percent <= 100),
    gst_rate INTEGER NOT NULL DEFAULT 18 CHECK(gst_rate >= 0),
    hsn_code TEXT NOT NULL DEFAULT '8517',
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK(stock_quantity >= 0),
    is_published INTEGER NOT NULL DEFAULT 1 CHECK(is_published IN (0, 1)),
    warranty TEXT NOT NULL,
    short_description TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE RESTRICT,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_condition ON products(condition);
CREATE INDEX IF NOT EXISTS idx_products_published ON products(is_published);

-- 5. Product Images
CREATE TABLE IF NOT EXISTS product_images (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    image_url TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    alt_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_product_images_pid ON product_images(product_id);

-- 6. Product Variants (Storage / RAM / Color combinations)
CREATE TABLE IF NOT EXISTS product_variants (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    sku TEXT NOT NULL UNIQUE,
    color TEXT,
    storage_capacity TEXT,
    ram_capacity TEXT,
    additional_price INTEGER NOT NULL DEFAULT 0,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_product_variants_pid ON product_variants(product_id);

-- 7. Serialized Unit Tracking (Confidential Admin Restricted — IMEI 1, IMEI 2, Serial No)
CREATE TABLE IF NOT EXISTS unit_imeis (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    variant_id TEXT,
    imei1 TEXT NOT NULL UNIQUE,
    imei2 TEXT,
    serial_number TEXT NOT NULL UNIQUE,
    condition_note TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'in_stock' CHECK(status IN ('in_stock', 'reserved', 'sold')),
    assigned_order_id TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_unit_imeis_pid ON unit_imeis(product_id);
CREATE INDEX IF NOT EXISTS idx_unit_imeis_status ON unit_imeis(status);
CREATE INDEX IF NOT EXISTS idx_unit_imeis_assigned ON unit_imeis(assigned_order_id);

-- 8. Customer Profiles & RBAC
CREATE TABLE IF NOT EXISTS customer_profiles (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'customer' CHECK(role IN ('customer', 'admin')),
    is_active INTEGER NOT NULL DEFAULT 1 CHECK(is_active IN (0, 1)),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_customers_email ON customer_profiles(email);
CREATE INDEX IF NOT EXISTS idx_customers_role ON customer_profiles(role);

-- 9. Customer Addresses
CREATE TABLE IF NOT EXISTS customer_addresses (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    pincode TEXT NOT NULL CHECK(LENGTH(pincode) = 6),
    flat_house TEXT NOT NULL,
    area_colony TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    landmark TEXT,
    is_default INTEGER NOT NULL DEFAULT 0 CHECK(is_default IN (0, 1)),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customer_profiles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_addresses_cid ON customer_addresses(customer_id);

-- 10. Cart Records
CREATE TABLE IF NOT EXISTS cart_records (
    id TEXT PRIMARY KEY,
    user_or_session_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    variant_id TEXT,
    quantity INTEGER NOT NULL CHECK(quantity > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_cart_session ON cart_records(user_or_session_id);

-- 11. Inventory Reservations (Prevents Concurrent Overselling)
CREATE TABLE IF NOT EXISTS inventory_reservations (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    unit_imei_id TEXT,
    session_id TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK(quantity > 0),
    reserved_until TIMESTAMP NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'released', 'converted')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (unit_imei_id) REFERENCES unit_imeis(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_res_product ON inventory_reservations(product_id);
CREATE INDEX IF NOT EXISTS idx_res_status ON inventory_reservations(status);

-- 12. Orders
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    order_number TEXT NOT NULL UNIQUE,
    customer_id TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    shipping_address_json TEXT NOT NULL,
    delivery_method TEXT NOT NULL CHECK(delivery_method IN ('standard', 'express_haldwani')),
    payment_method TEXT NOT NULL CHECK(payment_method IN ('cod', 'upi', 'card_test', 'netbanking')),
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK(payment_status IN ('pending', 'paid', 'cod_verified', 'failed')),
    order_status TEXT NOT NULL DEFAULT 'placed' CHECK(order_status IN ('placed', 'confirmed', 'packed', 'dispatched', 'out_for_delivery', 'delivered', 'cancelled')),
    subtotal INTEGER NOT NULL CHECK(subtotal >= 0),
    discount INTEGER NOT NULL DEFAULT 0 CHECK(discount >= 0),
    tax_amount INTEGER NOT NULL CHECK(tax_amount >= 0),
    shipping_fee INTEGER NOT NULL DEFAULT 0 CHECK(shipping_fee >= 0),
    total_amount INTEGER NOT NULL CHECK(total_amount >= 0),
    tracking_courier TEXT,
    tracking_number TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customer_profiles(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_num ON orders(order_number);

-- 13. Order Items
CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    brand TEXT NOT NULL,
    sku TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK(quantity > 0),
    unit_price INTEGER NOT NULL CHECK(unit_price >= 0),
    total_price INTEGER NOT NULL CHECK(total_price >= 0),
    hsn_code TEXT NOT NULL,
    gst_rate INTEGER NOT NULL,
    selected_color TEXT,
    selected_storage TEXT,
    assigned_imei TEXT,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- 14. Payment Records
CREATE TABLE IF NOT EXISTS payment_records (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    transaction_ref TEXT,
    amount INTEGER NOT NULL CHECK(amount >= 0),
    currency TEXT NOT NULL DEFAULT 'INR',
    status TEXT NOT NULL DEFAULT 'initiated',
    gateway_response_json TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- 15. Order Lifecycle & Shipping Events
CREATE TABLE IF NOT EXISTS order_events (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    status TEXT NOT NULL,
    note TEXT NOT NULL,
    actor TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_events_order ON order_events(order_id);

-- 16. Administrative System Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    action TEXT NOT NULL,
    actor TEXT NOT NULL,
    details TEXT NOT NULL,
    ip_address TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);

-- 17. Store Configuration (Haldwani Store Settings)
CREATE TABLE IF NOT EXISTS store_configuration (
    config_key TEXT PRIMARY KEY,
    config_value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Record migration 0001
INSERT OR IGNORE INTO schema_migrations (version, description) 
VALUES ('0001_initial_schema', 'Initial production relational schema for Harvinder Telecom E-Commerce');
