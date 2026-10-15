import React, { useState } from 'react';
import { 
  X, 
  User as UserIcon, 
  Package, 
  MapPin, 
  LogOut, 
  Plus, 
  Check, 
  AlertCircle,
  Truck,
  RotateCcw,
  Calendar,
  Phone,
  Mail,
  ShieldCheck
} from 'lucide-react';
import { User, Order, Address } from '../types';
import { storage } from '../services/storage';

interface CustomerAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onLoginSuccess: (user: User) => void;
  onLogout: () => void;
}

export const CustomerAccountModal: React.FC<CustomerAccountModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onLogout
}) => {
  if (!isOpen) return null;

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'profile'>('orders');

  // Form states
  const [loginEmail, setLoginEmail] = useState('rahul.kumar@gmail.com');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Address add form state
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPincode, setNewPincode] = useState('263139');
  const [newFlat, setNewFlat] = useState('');
  const [newArea, setNewArea] = useState('');
  const [newCity, setNewCity] = useState('Haldwani');
  const [newState, setNewState] = useState('Uttarakhand');
  const [newLandmark, setNewLandmark] = useState('');

  // Orders
  const userOrders: Order[] = currentUser ? storage.getOrdersForUser(currentUser.id) : [];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const res = storage.login(loginEmail);
    if (res.success && res.user) {
      onLoginSuccess(res.user);
    } else {
      setErrorMsg(res.error || 'Login failed');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!regName || !regEmail || !regPhone) {
      setErrorMsg('Please complete all registration fields.');
      return;
    }
    const res = storage.register(regName, regEmail, regPhone);
    if (res.success && res.user) {
      onLoginSuccess(res.user);
    } else {
      setErrorMsg(res.error || 'Registration failed');
    }
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName || !newPhone || !newPincode || !newFlat || !newArea) return;

    storage.saveUserAddress({
      fullName: newFullName,
      phone: newPhone,
      pincode: newPincode,
      flatHouse: newFlat,
      areaColony: newArea,
      city: newCity,
      state: newState,
      landmark: newLandmark,
      isDefault: false
    });

    setIsAddingAddress(false);
    // Refresh user state
    const refreshed = storage.getCurrentUser();
    if (refreshed) onLoginSuccess(refreshed);
  };

  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);

  const confirmCancelOrder = (orderId: string) => {
    storage.cancelOrder(orderId, 'Cancelled by customer from account portal');
    setCancellingOrderId(null);
    const refreshed = storage.getCurrentUser();
    if (refreshed) onLoginSuccess(refreshed);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'out_for_delivery': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'dispatched': return 'text-indigo-700 bg-indigo-50 border-indigo-200';
      case 'cancelled': return 'text-red-700 bg-red-50 border-red-200';
      default: return 'text-amber-800 bg-amber-50 border-amber-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="relative bg-white rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-blue-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {currentUser ? `Welcome, ${currentUser.name}` : 'Customer Account'}
              </h2>
              <p className="text-[11px] text-slate-500">
                {currentUser ? currentUser.email : 'Harvinder Telecom Haldwani Customer Portal'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="overflow-y-auto p-4 sm:p-6 lg:p-8 flex-1 space-y-6">
          {!currentUser ? (
            /* Authentication Section */
            <div className="max-w-md mx-auto space-y-6">
              {/* Tab Selector */}
              <div className="flex border-b border-slate-200">
                <button
                  onClick={() => { setAuthMode('login'); setErrorMsg(''); }}
                  className={`flex-1 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
                    authMode === 'login' 
                      ? 'border-blue-600 text-blue-600' 
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Sign In to Account
                </button>
                <button
                  onClick={() => { setAuthMode('register'); setErrorMsg(''); }}
                  className={`flex-1 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
                    authMode === 'register' 
                      ? 'border-blue-600 text-blue-600' 
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Create New Account
                </button>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {authMode === 'login' ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="e.g. rahul.kumar@gmail.com"
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#0B192C] hover:bg-blue-600 text-white font-semibold rounded-xl text-xs sm:text-sm transition-colors shadow-sm"
                  >
                    Sign In
                  </button>

                  {/* Demo Fast Login Helper */}
                  <div className="pt-2 text-center">
                    <p className="text-[11px] text-slate-400">One-click demo credentials:</p>
                    <button
                      type="button"
                      onClick={() => setLoginEmail('rahul.kumar@gmail.com')}
                      className="text-xs text-blue-600 hover:underline font-medium mt-1"
                    >
                      Use rahul.kumar@gmail.com (Haldwani Customer)
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Amit Joshi"
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="e.g. amit@gmail.com"
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mobile Phone (+91) *
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="10-digit mobile number"
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white tabular-nums"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs sm:text-sm transition-colors shadow-sm"
                  >
                    Register Account
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* Logged In Customer Dashboard */
            <div className="space-y-6">
              {/* Profile Bar with Nav Tabs */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div className="flex items-center gap-1 text-xs">
                  <button
                    onClick={() => setActiveTab('orders')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                      activeTab === 'orders' ? 'bg-[#0B192C] text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    My Orders ({userOrders.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('addresses')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                      activeTab === 'addresses' ? 'bg-[#0B192C] text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Saved Addresses ({currentUser.savedAddresses?.length || 0})
                  </button>
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                      activeTab === 'profile' ? 'bg-[#0B192C] text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Account Info
                  </button>
                </div>

                <button
                  onClick={onLogout}
                  className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-50"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>

              {/* TAB 1: Orders History */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  {userOrders.length > 0 ? (
                    userOrders.map((order) => (
                      <div 
                        key={order.id} 
                        className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4 shadow-2xs"
                      >
                        {/* Order Header */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                          <div>
                            <span className="font-mono font-bold text-xs sm:text-sm text-slate-900">
                              {order.orderNumber}
                            </span>
                            <span className="text-[11px] text-slate-400 ml-2">
                              Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded border uppercase tracking-wide ${getStatusColor(order.orderStatus)}`}>
                              {order.orderStatus.replace(/_/g, ' ')}
                            </span>
                            <span className="text-xs font-extrabold text-blue-700 tabular-nums">
                              ₹{order.totalAmount.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="space-y-2 text-xs">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center py-1">
                              <div>
                                <span className="font-semibold text-slate-900">{item.productName}</span>
                                {item.assignedImei && (
                                  <p className="text-[10px] text-blue-700 font-mono">
                                    Assigned IMEI: {item.assignedImei}
                                  </p>
                                )}
                              </div>
                              <span className="tabular-nums font-medium text-slate-700">
                                {item.quantity} x ₹{item.unitPrice.toLocaleString('en-IN')}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Tracking and Courier note */}
                        <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-slate-700 flex items-center gap-1.5">
                              <Truck className="w-3.5 h-3.5 text-blue-600" />
                              {order.trackingCourier || 'Harvinder Logistics Haldwani'}
                            </span>
                            {order.trackingNumber && (
                              <span className="font-mono text-slate-600 text-[11px]">
                                Tracking: {order.trackingNumber}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500">
                            Deliver to: {order.shippingAddress.flatHouse}, {order.shippingAddress.city} ({order.shippingAddress.pincode})
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-1">
                          {order.orderStatus !== 'delivered' && order.orderStatus !== 'cancelled' ? (
                            cancellingOrderId === order.id ? (
                              <div className="flex items-center gap-1.5 text-xs bg-red-50 border border-red-200 px-2 py-1 rounded-lg">
                                <span className="text-red-700 font-semibold text-[11px]">Cancel order?</span>
                                <button
                                  onClick={() => confirmCancelOrder(order.id)}
                                  className="px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white rounded text-[11px] font-semibold"
                                >
                                  Yes, Cancel
                                </button>
                                <button
                                  onClick={() => setCancellingOrderId(null)}
                                  className="px-2 py-0.5 text-slate-600 hover:bg-slate-200 rounded text-[11px]"
                                >
                                  Back
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setCancellingOrderId(order.id)}
                                className="text-xs text-red-600 hover:text-red-700 font-medium"
                              >
                                Cancel Order
                              </button>
                            )
                          ) : (
                            <span className="text-[11px] text-slate-400">Order closed</span>
                          )}

                          <button
                            onClick={() => window.print()}
                            className="text-xs text-blue-600 hover:underline font-semibold"
                          >
                            Print Invoice
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-slate-500 space-y-2">
                      <Package className="w-8 h-8 mx-auto text-slate-400" />
                      <p className="text-sm font-semibold text-slate-700">No Orders Yet</p>
                      <p className="text-xs">Your placed orders will show up here with live delivery status.</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: Addresses */}
              {activeTab === 'addresses' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-slate-900">Your Saved Addresses</h3>
                    {!isAddingAddress && (
                      <button
                        onClick={() => setIsAddingAddress(true)}
                        className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add New Address</span>
                      </button>
                    )}
                  </div>

                  {isAddingAddress && (
                    <form onSubmit={handleAddAddress} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
                      <h4 className="font-bold text-slate-800">Add New Delivery Location</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          required
                          placeholder="Recipient Name"
                          value={newFullName}
                          onChange={(e) => setNewFullName(e.target.value)}
                          className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
                        />
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          placeholder="Mobile (+91)"
                          value={newPhone}
                          onChange={(e) => setNewPhone(e.target.value)}
                          className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
                        />
                        <input
                          type="text"
                          required
                          maxLength={6}
                          placeholder="PIN Code"
                          value={newPincode}
                          onChange={(e) => setNewPincode(e.target.value)}
                          className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
                        />
                        <input
                          type="text"
                          required
                          placeholder="House/Flat No."
                          value={newFlat}
                          onChange={(e) => setNewFlat(e.target.value)}
                          className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
                        />
                        <input
                          type="text"
                          required
                          placeholder="Area / Colony"
                          value={newArea}
                          onChange={(e) => setNewArea(e.target.value)}
                          className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
                        />
                        <input
                          type="text"
                          required
                          placeholder="Landmark"
                          value={newLandmark}
                          onChange={(e) => setNewLandmark(e.target.value)}
                          className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg"
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsAddingAddress(false)}
                          className="px-3 py-1.5 text-slate-600 hover:text-slate-900"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-500"
                        >
                          Save Address
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentUser.savedAddresses?.map((addr) => (
                      <div key={addr.id} className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1 text-xs relative">
                        <p className="font-bold text-slate-900">{addr.fullName}</p>
                        <p className="text-slate-600">{addr.flatHouse}, {addr.areaColony}</p>
                        <p className="text-slate-600">{addr.city}, {addr.state} - {addr.pincode}</p>
                        <p className="text-slate-500 font-medium">Phone: +91 {addr.phone}</p>
                        {addr.isDefault && (
                          <span className="inline-block mt-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                            Default Address
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: Profile Info */}
              {activeTab === 'profile' && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
                  <h3 className="font-bold text-slate-900">Personal Information</h3>
                  <div className="space-y-2 text-slate-700">
                    <p className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      <span>{currentUser.name}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span>{currentUser.email}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span>+91 {currentUser.phone}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span>Member since {new Date(currentUser.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
