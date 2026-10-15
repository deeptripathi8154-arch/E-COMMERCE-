import React, { useState } from 'react';
import { 
  X, 
  Package, 
  BarChart3, 
  Smartphone, 
  Truck, 
  FileText, 
  Database, 
  Plus, 
  Edit, 
  Trash2, 
  Check, 
  AlertCircle, 
  Download, 
  Upload, 
  RefreshCw,
  Search,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { Product, Order, UnitImeiRecord, AuditLog, OrderStatus, ProductCategory, ProductCondition } from '../types';
import { storage } from '../services/storage';

interface AdminPortalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  orders: Order[];
  onDataModified: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  isOpen,
  onClose,
  products,
  orders,
  onDataModified
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'imei' | 'orders' | 'logs' | 'backup'>('overview');

  // Product Add / Edit modal state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [pName, setPName] = useState('');
  const [pBrand, setPBrand] = useState('Apple');
  const [pModel, setPModel] = useState('');
  const [pSku, setPSku] = useState('');
  const [pCategory, setPCategory] = useState<ProductCategory>('smartphones');
  const [pCondition, setPCondition] = useState<ProductCondition>('new');
  const [pPrice, setPPrice] = useState(59999);
  const [pMrp, setPMrp] = useState(64999);
  const [pStock, setPStock] = useState(5);
  const [pWarranty, setPWarranty] = useState('1 Year Official Brand Warranty');
  const [pDesc, setPDesc] = useState('');

  // Add Unit IMEI form state
  const [selectedProductForImei, setSelectedProductForImei] = useState<string>(products.find(p => p.unitImeis)?.id || '');
  const [imei1, setImei1] = useState('');
  const [imei2, setImei2] = useState('');
  const [serialNo, setSerialNo] = useState('');
  const [imeiConditionNote, setImeiConditionNote] = useState('Sealed Brand New Unit');

  // Admin Provisioning state
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPhone, setNewAdminPhone] = useState('');
  const [newAdminPass, setNewAdminPass] = useState('');
  const [newAdminSecret, setNewAdminSecret] = useState('');
  const [provisionMsg, setProvisionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Search filter
  const [adminSearch, setAdminSearch] = useState('');

  // Audit Logs
  const auditLogs: AuditLog[] = storage.getAuditLogs();

  // Metrics
  const totalRevenue = orders.reduce((sum, o) => o.paymentStatus === 'paid' || o.paymentStatus === 'cod_verified' ? sum + o.totalAmount : sum, 0);
  const totalItemsSold = orders.reduce((sum, o) => sum + o.items.reduce((acc, i) => acc + i.quantity, 0), 0);
  const lowStockCount = products.filter(p => p.stockQuantity <= 3).length;
  
  // All tracked IMEI units
  const allTrackedImeis = products.flatMap(p => 
    (p.unitImeis || []).map(u => ({ ...u, productName: p.name, productId: p.id, brand: p.brand }))
  );

  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setPName('');
    setPBrand('Apple');
    setPModel('');
    setPSku(`HT-${Date.now().toString().slice(-6)}`);
    setPCategory('smartphones');
    setPCondition('new');
    setPPrice(29999);
    setPMrp(34999);
    setPStock(5);
    setPWarranty('1 Year Official Brand Warranty');
    setPDesc('High-performance electronics device verified by Harvinder Telecom.');
    setIsAddingProduct(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setPName(prod.name);
    setPBrand(prod.brand);
    setPModel(prod.model);
    setPSku(prod.sku);
    setPCategory(prod.category);
    setPCondition(prod.condition);
    setPPrice(prod.sellingPrice);
    setPMrp(prod.mrp);
    setPStock(prod.stockQuantity);
    setPWarranty(prod.warranty);
    setPDesc(prod.shortDescription);
    setIsAddingProduct(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const discount = pMrp > pPrice ? Math.round(((pMrp - pPrice) / pMrp) * 100) : 0;

    if (editingProduct) {
      storage.updateProduct(editingProduct.id, {
        name: pName,
        brand: pBrand,
        model: pModel,
        sku: pSku,
        category: pCategory,
        condition: pCondition,
        sellingPrice: Number(pPrice),
        mrp: Number(pMrp),
        discountPercent: discount,
        stockQuantity: Number(pStock),
        warranty: pWarranty,
        shortDescription: pDesc,
      });
    } else {
      storage.addProduct({
        name: pName,
        brand: pBrand,
        model: pModel,
        sku: pSku,
        slug: pName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category: pCategory,
        condition: pCondition,
        sellingPrice: Number(pPrice),
        mrp: Number(pMrp),
        discountPercent: discount,
        gstRate: 18,
        hsnCode: pCategory === 'smartphones' ? '8517' : '8504',
        stockQuantity: Number(pStock),
        isPublished: true,
        warranty: pWarranty,
        shortDescription: pDesc,
        description: pDesc,
        images: ['/src/assets/images/hero_electronics_store_1791903234985.jpg'],
        colors: ['Black', 'Silver'],
        storageVariants: ['128GB', '256GB'],
        specifications: { 'Category': pCategory, 'Condition': pCondition },
        unitImeis: []
      });
    }

    setIsAddingProduct(false);
    onDataModified();
  };

  // In-UI confirmations and notices (replacing window.confirm and alert)
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{ id: string; name: string } | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [backupStatusMessage, setBackupStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const confirmDeleteProduct = () => {
    if (deleteConfirmTarget) {
      storage.deleteProduct(deleteConfirmTarget.id);
      setDeleteConfirmTarget(null);
      onDataModified();
    }
  };

  const handleAddImeiUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForImei || !imei1 || !serialNo) return;

    storage.addUnitImei(selectedProductForImei, {
      imei1,
      imei2: imei2 || undefined,
      serialNumber: serialNo,
      conditionNote: imeiConditionNote,
      status: 'in_stock'
    });

    setImei1('');
    setImei2('');
    setSerialNo('');
    onDataModified();
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    storage.updateOrderStatus(orderId, newStatus);
    onDataModified();
  };

  const handleProvisionAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setProvisionMsg(null);
    const res = await storage.provisionNewAdmin({
      fullName: newAdminName,
      email: newAdminEmail,
      phone: newAdminPhone,
      password: newAdminPass,
      provisioningSecret: newAdminSecret || 'HARVINDER_HALDWANI_DEV_SECRET_2026'
    });

    if (res.success && res.user) {
      setProvisionMsg({
        type: 'success',
        text: `Administrator account created for ${res.user.name} (${res.user.email}) with encrypted credentials!`
      });
      setNewAdminName('');
      setNewAdminEmail('');
      setNewAdminPhone('');
      setNewAdminPass('');
      setNewAdminSecret('');
      onDataModified();
    } else {
      setProvisionMsg({
        type: 'error',
        text: res.error || 'Failed to provision administrator.'
      });
    }
  };

  const handleExportBackup = () => {
    const json = storage.exportStoreData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `harvinder-telecom-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setBackupStatusMessage({
      type: 'success',
      text: 'Store backup downloaded successfully.'
    });
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = storage.importStoreData(content);
      setBackupStatusMessage({
        type: res.success ? 'success' : 'error',
        text: res.message
      });
      if (res.success) {
        onDataModified();
      }
    };
    reader.readAsText(file);
  };

  const confirmResetCatalog = () => {
    storage.resetToDefaults();
    setIsResetConfirmOpen(false);
    setBackupStatusMessage({
      type: 'success',
      text: 'Store inventory and records reset to default Haldwani configuration.'
    });
    onDataModified();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div 
        className="relative bg-white rounded-2xl max-w-6xl w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200 h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Admin Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-[#0B192C] text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              HT
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                <span>Harvinder Telecom Management Portal</span>
                <span className="text-[10px] font-mono bg-blue-500/30 text-blue-300 px-2 py-0.5 rounded border border-blue-400/30">
                  HALDWANI HUB
                </span>
              </h2>
              <p className="text-[11px] text-slate-300">
                Products · Confidential Unit IMEIs · Orders &amp; Fulfillment · Audit Trails
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            aria-label="Close admin portal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Strip */}
        <div className="flex items-center gap-1 px-6 border-b border-slate-200 bg-slate-50 overflow-x-auto shrink-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'overview' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Store KPI Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'products' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Product Catalog ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('imei')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'imei' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>IMEI Unit Tracking ({allTrackedImeis.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'orders' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Orders &amp; Logistics ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'logs' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Audit Trail</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === 'backup' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Local DB Privacy &amp; Backup</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="overflow-y-auto p-4 sm:p-6 flex-1 space-y-6">
          
          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* KPI Cards Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-xs font-semibold text-slate-500 uppercase">Total Settled Revenue</span>
                  <p className="text-2xl font-bold text-slate-900 tabular-nums">
                    ₹{totalRevenue.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[11px] text-emerald-600 font-medium">All verified Haldwani sales</p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-xs font-semibold text-slate-500 uppercase">Customer Orders</span>
                  <p className="text-2xl font-bold text-slate-900 tabular-nums">
                    {orders.length}
                  </p>
                  <p className="text-[11px] text-blue-600 font-medium">{totalItemsSold} items fulfilled</p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-xs font-semibold text-slate-500 uppercase">Active Catalog SKUs</span>
                  <p className="text-2xl font-bold text-slate-900 tabular-nums">
                    {products.length}
                  </p>
                  <p className="text-[11px] text-slate-500">Across 6 core categories</p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-xs font-semibold text-slate-500 uppercase">Tracked IMEI Units</span>
                  <p className="text-2xl font-bold text-slate-900 tabular-nums">
                    {allTrackedImeis.filter(u => u.status === 'in_stock').length} <span className="text-sm font-normal text-slate-500">in stock</span>
                  </p>
                  <p className="text-[11px] text-indigo-600 font-medium">{allTrackedImeis.filter(u => u.status === 'sold').length} units allocated to orders</p>
                </div>
              </div>

              {/* Low Stock Watchlist */}
              {lowStockCount > 0 && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>Low Stock Inventory Warning ({lowStockCount} items below threshold of 3 units)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs text-amber-800">
                    {products.filter(p => p.stockQuantity <= 3).map(p => (
                      <div key={p.id} className="p-2 bg-white/80 rounded border border-amber-200 flex justify-between">
                        <span className="truncate max-w-[200px] font-medium">{p.name}</span>
                        <span className="font-bold tabular-nums">{p.stockQuantity} left</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Orders Overview */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                  <h3 className="text-xs font-bold text-slate-900 uppercase">Recent Haldwani Store Orders</h3>
                  <button 
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-semibold text-blue-600 hover:underline"
                  >
                    View All Orders &rarr;
                  </button>
                </div>

                <div className="divide-y divide-slate-100 text-xs">
                  {orders.slice(0, 5).map(o => (
                    <div key={o.id} className="p-3 sm:px-4 flex items-center justify-between gap-2">
                      <div>
                        <span className="font-mono font-bold text-slate-900">{o.orderNumber}</span>
                        <span className="text-slate-500 ml-2">by {o.customerName} (+91 {o.customerPhone})</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-blue-700 tabular-nums">₹{o.totalAmount.toLocaleString('en-IN')}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border uppercase">
                          {o.orderStatus.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: PRODUCTS MANAGEMENT */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between gap-3 items-center">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={adminSearch}
                    onChange={(e) => setAdminSearch(e.target.value)}
                    placeholder="Filter products..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white"
                  />
                </div>

                <button
                  onClick={handleOpenAddProduct}
                  className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Product</span>
                </button>
              </div>

              {/* Products Table */}
              <div className="border border-slate-200 rounded-xl overflow-x-auto bg-white">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                      <th className="py-2.5 px-3">Product Name</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Condition</th>
                      <th className="py-2.5 px-3 text-right">Selling Price</th>
                      <th className="py-2.5 px-3 text-right">MRP</th>
                      <th className="py-2.5 px-3 text-center">Stock</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products
                      .filter(p => !adminSearch || p.name.toLowerCase().includes(adminSearch.toLowerCase()) || p.brand.toLowerCase().includes(adminSearch.toLowerCase()))
                      .map(p => (
                        <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-2.5 px-3 font-semibold text-slate-900 max-w-xs truncate">
                            {p.name}
                            <span className="block text-[11px] text-slate-400 font-mono">SKU: {p.sku}</span>
                          </td>
                          <td className="py-2.5 px-3 capitalize text-slate-600">{p.category}</td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                              p.condition === 'pre-owned' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {p.condition}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-900 tabular-nums">
                            ₹{p.sellingPrice.toLocaleString('en-IN')}
                          </td>
                          <td className="py-2.5 px-3 text-right text-slate-400 tabular-nums">
                            ₹{p.mrp.toLocaleString('en-IN')}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className={`font-bold tabular-nums px-2 py-0.5 rounded ${
                              p.stockQuantity <= 2 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-800'
                            }`}>
                              {p.stockQuantity}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right space-x-1">
                            <button
                              onClick={() => handleOpenEditProduct(p)}
                              className="p-1 text-slate-500 hover:text-blue-600"
                              title="Edit product"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmTarget({ id: p.id, name: p.name })}
                              className="p-1 text-slate-500 hover:text-red-600 focus-visible:ring-2 focus-visible:ring-red-600 rounded"
                              title="Delete product"
                              aria-label={`Delete product ${p.name}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: IMEI UNIT TRACKING (SMARTPHONES & TABLETS - CONFIDENTIAL ADMIN VIEW) */}
          {activeTab === 'imei' && (
            <div className="space-y-6">
              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1">
                <div className="flex items-center gap-2 font-bold">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Confidential Unit-Level IMEI &amp; Serial Number Tracking</span>
                </div>
                <p className="text-blue-800/80 leading-relaxed">
                  As required by regulatory standards and manufacturer warranty policies, individual IMEI 1, IMEI 2, and serial numbers are restricted to authorized Haldwani store administrators. These are never displayed publicly on frontend retail product pages.
                </p>
              </div>

              {/* Add New Unit IMEI Form */}
              <form onSubmit={handleAddImeiUnit} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
                <h3 className="font-bold text-slate-900">Register New Device Unit (IMEI Inbound)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">Select Device *</label>
                    <select
                      value={selectedProductForImei}
                      onChange={(e) => setSelectedProductForImei(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
                    >
                      {products.filter(p => p.category === 'smartphones' || p.category === 'tablets').map(p => (
                        <option key={p.id} value={p.id}>{p.brand} - {p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">Primary IMEI 1 (15-digits) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 354891104829999"
                      value={imei1}
                      onChange={(e) => setImei1(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">IMEI 2 (Optional eSIM/Dual)</label>
                    <input
                      type="text"
                      placeholder="e.g. 354891104829988"
                      value={imei2}
                      onChange={(e) => setImei2(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">Serial Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. HN79QZ08999"
                      value={serialNo}
                      onChange={(e) => setSerialNo(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <input
                    type="text"
                    placeholder="Condition notes: e.g. Factory sealed box, Indian retail unit"
                    value={imeiConditionNote}
                    onChange={(e) => setImeiConditionNote(e.target.value)}
                    className="flex-1 mr-3 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  />
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-500 shrink-0"
                  >
                    Add Unit to Inventory
                  </button>
                </div>
              </form>

              {/* Tracked IMEIs Table */}
              <div className="border border-slate-200 rounded-xl overflow-x-auto bg-white">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                      <th className="py-2.5 px-3">Product</th>
                      <th className="py-2.5 px-3">IMEI 1</th>
                      <th className="py-2.5 px-3">IMEI 2</th>
                      <th className="py-2.5 px-3">Serial No</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Assigned Order</th>
                      <th className="py-2.5 px-3">Condition Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allTrackedImeis.map((unit) => (
                      <tr key={unit.id} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-3 font-semibold text-slate-900 max-w-xs truncate">
                          {unit.productName}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{unit.imei1}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-500">{unit.imei2 || '—'}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-700">{unit.serialNumber}</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            unit.status === 'in_stock' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : unit.status === 'sold'
                                ? 'bg-slate-200 text-slate-700'
                                : 'bg-amber-100 text-amber-800'
                          }`}>
                            {unit.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-blue-700">
                          {unit.assignedOrderId || '—'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 text-[11px]">{unit.conditionNote}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: ORDERS & FULFILLMENT */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                Customer Orders &amp; Haldwani Dispatch Operations
              </h3>

              <div className="space-y-4">
                {orders.map((o) => (
                  <div key={o.id} className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 text-xs shadow-2xs">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                      <div>
                        <span className="font-mono font-bold text-sm text-slate-900">{o.orderNumber}</span>
                        <span className="text-slate-500 ml-2">Customer: {o.customerName} (+91 {o.customerPhone})</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-blue-700 tabular-nums">
                          ₹{o.totalAmount.toLocaleString('en-IN')}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 border text-slate-700 uppercase">
                          Payment: {o.paymentMethod.toUpperCase()} ({o.paymentStatus})
                        </span>
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <p className="text-slate-600">
                      <span className="font-semibold text-slate-800">Ship to: </span>
                      {o.shippingAddress.flatHouse}, {o.shippingAddress.areaColony}, {o.shippingAddress.city}, {o.shippingAddress.state} - {o.shippingAddress.pincode}
                    </p>

                    {/* Order Items */}
                    <div className="space-y-1 bg-slate-50 p-2.5 rounded-lg">
                      {o.items.map((item, i) => (
                        <div key={i} className="flex justify-between">
                          <span>{item.quantity}x {item.productName} {item.assignedImei && <span className="font-mono text-blue-600">(IMEI: {item.assignedImei})</span>}</span>
                          <span className="font-semibold tabular-nums">₹{item.totalPrice.toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>

                    {/* Status Changer Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-700">Update Status:</span>
                        <select
                          value={o.orderStatus}
                          onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value as OrderStatus)}
                          className="px-2.5 py-1 bg-white border border-slate-300 rounded font-semibold text-slate-800"
                        >
                          <option value="placed">Placed</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="packed">Packed</option>
                          <option value="dispatched">Dispatched</option>
                          <option value="out_for_delivery">Out For Delivery</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>

                      <span className="text-[11px] text-slate-500 font-mono">
                        Courier: {o.trackingCourier || 'Harvinder Express'} · Tracking: {o.trackingNumber}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: AUDIT TRAILS */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">System Activity &amp; Audit Logs</h3>
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                      <th className="py-2.5 px-3">Timestamp</th>
                      <th className="py-2.5 px-3">Action</th>
                      <th className="py-2.5 px-3">Actor</th>
                      <th className="py-2.5 px-3">Audit Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 text-slate-500 text-[11px]">
                          {new Date(log.timestamp).toLocaleTimeString()} · {new Date(log.timestamp).toLocaleDateString()}
                        </td>
                        <td className="py-2 px-3 font-bold text-blue-700 text-[11px]">{log.action}</td>
                        <td className="py-2 px-3 text-slate-600 text-[11px]">{log.actor}</td>
                        <td className="py-2 px-3 text-slate-800 font-sans text-xs">{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: LOCAL DB PRIVACY & BACKUP */}
          {activeTab === 'backup' && (
            <div className="space-y-6 max-w-2xl">
              {/* Privacy Notice */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-1">
                <p className="font-bold">100% Local Device Data Privacy &amp; Zero External Cost</p>
                <p className="leading-relaxed">
                  All inventory records, customer addresses, confidential IMEI numbers, and order transaction history are stored strictly on this device without requiring external cloud databases or paid plans.
                </p>
              </div>

              {/* Schema & Migration Status (Phase 2 Requirement) */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-blue-600" />
                    <h4 className="font-bold text-slate-900">Database Schema &amp; Migration Status</h4>
                  </div>
                  <span className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    MIGRATION ACTIVE: 0001_initial_schema
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-600">
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-800">Target Dialect:</p>
                    <p className="font-mono text-slate-500">SQLite / Cloudflare D1 Compatible</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-800">Monetary Precision:</p>
                    <p className="font-mono text-slate-500">Integer Currency (paise / whole INR)</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-800">Active Relational Tables (17):</p>
                    <p className="text-[11px] text-slate-500">
                      categories, brands, products, product_images, product_variants, unit_imeis, customer_profiles, customer_addresses, cart_records, inventory_reservations, orders, order_items, payment_records, order_events, audit_logs, store_configuration, schema_migrations
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-800">Access Policies (RBAC):</p>
                    <p className="text-[11px] text-emerald-700 font-medium">
                      Enforced (Unit IMEIs &amp; Audit Logs restricted to role:admin)
                    </p>
                  </div>
                </div>
              </div>

              {/* Safe Administrator Provisioning Form (Phase 2 Requirement) */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <h4 className="font-bold text-slate-900">Provision New Store Administrator</h4>
                  </div>
                  <span className="text-[10px] text-slate-400">Cryptographic Salt &amp; Web Crypto Hash</span>
                </div>

                <p className="text-slate-500 text-[11px]">
                  Securely register a co-administrator for the Haldwani hub. Regular registration cannot grant admin privileges.
                </p>

                {provisionMsg && (
                  <div className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
                    provisionMsg.type === 'success' 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                      : 'bg-red-50 border-red-200 text-red-700'
                  }`}>
                    {provisionMsg.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    <span>{provisionMsg.text}</span>
                  </div>
                )}

                <form onSubmit={handleProvisionAdmin} className="space-y-3 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={newAdminName}
                        onChange={(e) => setNewAdminName(e.target.value)}
                        placeholder="e.g. Jaswinder Singh"
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Admin Email *</label>
                      <input
                        type="email"
                        required
                        value={newAdminEmail}
                        onChange={(e) => setNewAdminEmail(e.target.value)}
                        placeholder="e.g. store.manager@harvindertelecom.com"
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Mobile Phone (+91) *</label>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={newAdminPhone}
                        onChange={(e) => setNewAdminPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="10-digit mobile"
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white tabular-nums"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Password (Min 8 chars) *</label>
                      <input
                        type="password"
                        required
                        minLength={8}
                        value={newAdminPass}
                        onChange={(e) => setNewAdminPass(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Master Provisioning Secret Token</label>
                    <input
                      type="password"
                      value={newAdminSecret}
                      onChange={(e) => setNewAdminSecret(e.target.value)}
                      placeholder="Enter master token (or authorized active admin session applies)"
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white font-mono text-[11px]"
                    />
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-xs transition-colors"
                    >
                      Provision Administrator
                    </button>
                  </div>
                </form>
              </div>

              {/* Data Backup & Restore */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-4 text-xs">
                {backupStatusMessage && (
                  <div className={`p-3 rounded-lg flex items-center justify-between gap-2 ${
                    backupStatusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                    <span>{backupStatusMessage.text}</span>
                    <button 
                      onClick={() => setBackupStatusMessage(null)}
                      className="text-xs font-bold hover:underline"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                <div>
                  <h4 className="font-bold text-slate-900">Export Store Backup (JSON)</h4>
                  <p className="text-slate-500 mt-0.5">Download a complete snapshot of products, IMEI units, and customer orders.</p>
                  <button
                    onClick={handleExportBackup}
                    className="mt-2.5 px-4 py-2 bg-[#0B192C] text-white rounded-lg font-semibold hover:bg-slate-800 flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download JSON Backup</span>
                  </button>
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <h4 className="font-bold text-slate-900">Restore / Import Database</h4>
                  <p className="text-slate-500 mt-0.5">Restore a previously exported backup file.</p>
                  <label className="mt-2.5 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-500 cursor-pointer">
                    <Upload className="w-4 h-4" />
                    <span>Choose Backup JSON</span>
                    <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
                  </label>
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <h4 className="font-bold text-red-700">Factory Catalog Reset</h4>
                  <p className="text-slate-500 mt-0.5">Reset store inventory and orders back to default Harvinder Telecom seeds.</p>
                  <button
                    onClick={() => setIsResetConfirmOpen(true)}
                    className="mt-2.5 px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg font-semibold hover:bg-red-100 flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Reset to Defaults</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal for Add / Edit Product */}
        {isAddingProduct && (
          <div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4">
            <form 
              onSubmit={handleSaveProduct} 
              className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto text-xs border border-slate-200 shadow-2xl"
            >
              <h3 className="text-sm font-bold text-slate-900">
                {editingProduct ? 'Edit Product' : 'Add New Product to Haldwani Store'}
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={pName}
                    onChange={(e) => setPName(e.target.value)}
                    placeholder="e.g. OnePlus 12 5G (Flowy Emerald)"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Brand</label>
                    <input
                      type="text"
                      required
                      value={pBrand}
                      onChange={(e) => setPBrand(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Model</label>
                    <input
                      type="text"
                      value={pModel}
                      onChange={(e) => setPModel(e.target.value)}
                      placeholder="e.g. OP-12"
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Category</label>
                    <select
                      value={pCategory}
                      onChange={(e) => setPCategory(e.target.value as any)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                    >
                      <option value="smartphones">Smartphones</option>
                      <option value="tablets">Tablets</option>
                      <option value="audio">Audio</option>
                      <option value="wearables">Wearables</option>
                      <option value="accessories">Accessories</option>
                      <option value="computing">Computing</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Condition</label>
                    <select
                      value={pCondition}
                      onChange={(e) => setPCondition(e.target.value as any)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                    >
                      <option value="new">Brand New</option>
                      <option value="pre-owned">Certified Pre-Owned</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Selling Price (₹)</label>
                    <input
                      type="number"
                      required
                      value={pPrice}
                      onChange={(e) => setPPrice(Number(e.target.value))}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">MRP (₹)</label>
                    <input
                      type="number"
                      required
                      value={pMrp}
                      onChange={(e) => setPMrp(Number(e.target.value))}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Stock Quantity</label>
                    <input
                      type="number"
                      required
                      value={pStock}
                      onChange={(e) => setPStock(Number(e.target.value))}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">SKU</label>
                    <input
                      type="text"
                      required
                      value={pSku}
                      onChange={(e) => setPSku(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Warranty Term</label>
                  <input
                    type="text"
                    value={pWarranty}
                    onChange={(e) => setPWarranty(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Short Description</label>
                  <textarea
                    rows={2}
                    value={pDesc}
                    onChange={(e) => setPDesc(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingProduct(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        )}
        {/* Delete Confirmation Modal */}
        {deleteConfirmTarget && (
          <div className="fixed inset-0 z-70 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-slate-200">
              <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>Delete Store Product</span>
              </div>
              <p className="text-xs text-slate-600">
                Are you sure you want to delete <span className="font-semibold text-slate-900">"{deleteConfirmTarget.name}"</span> from store inventory? This action is recorded in the system audit logs.
              </p>
              <div className="flex justify-end gap-2 pt-1 text-xs">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmTarget(null)}
                  className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteProduct}
                  className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold shadow-xs"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Factory Reset Confirmation Modal */}
        {isResetConfirmOpen && (
          <div className="fixed inset-0 z-70 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-slate-200">
              <div className="flex items-center gap-2 text-amber-600 font-bold text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>Reset Store to Defaults</span>
              </div>
              <p className="text-xs text-slate-600">
                Reset catalog, IMEIs, and orders back to default Haldwani store setup? A fresh snapshot of initial products will be loaded.
              </p>
              <div className="flex justify-end gap-2 pt-1 text-xs">
                <button
                  type="button"
                  onClick={() => setIsResetConfirmOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmResetCatalog}
                  className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold shadow-xs"
                >
                  Reset Everything
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
