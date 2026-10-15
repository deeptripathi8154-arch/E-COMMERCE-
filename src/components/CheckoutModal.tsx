import React, { useState } from 'react';
import { 
  X, 
  Check, 
  MapPin, 
  Truck, 
  CreditCard, 
  QrCode, 
  Banknote, 
  Printer, 
  ShieldCheck, 
  AlertCircle,
  Building,
  ArrowRight
} from 'lucide-react';
import { CartItem, User, Address, Order, DeliveryMethod, PaymentMethod } from '../types';
import { storage } from '../services/storage';
import { numberToIndianWords } from '../utils/currency';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  currentUser: User | null;
  onOrderPlaced: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cart,
  currentUser,
  onOrderPlaced
}) => {
  if (!isOpen) return null;

  // Checkout Steps: 1: Address -> 2: Delivery -> 3: Payment -> 4: Success & Invoice
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Address fields
  const defaultSavedAddr = currentUser?.savedAddresses?.find(a => a.isDefault) || currentUser?.savedAddresses?.[0];
  
  const [fullName, setFullName] = useState(currentUser?.name || defaultSavedAddr?.fullName || 'Rahul Kumar');
  const [phone, setPhone] = useState(currentUser?.phone || defaultSavedAddr?.phone || '9876543210');
  const [email, setEmail] = useState(currentUser?.email || 'customer@gmail.com');
  const [pincode, setPincode] = useState(defaultSavedAddr?.pincode || '263139');
  const [flatHouse, setFlatHouse] = useState(defaultSavedAddr?.flatHouse || 'House No. 18, Block B');
  const [areaColony, setAreaColony] = useState(defaultSavedAddr?.areaColony || 'Tikonia');
  const [city, setCity] = useState(defaultSavedAddr?.city || 'Haldwani');
  const [state, setState] = useState(defaultSavedAddr?.state || 'Uttarakhand');
  const [landmark, setLandmark] = useState(defaultSavedAddr?.landmark || 'Near Nainital Bank');

  // Delivery & Payment
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>(
    pincode === '263139' || pincode === '263141' ? 'express_haldwani' : 'standard'
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [upiId, setUpiId] = useState('user@okhdfcbank');
  const [codOtp, setCodOtp] = useState('');
  const [simulatedOtpSent, setSimulatedOtpSent] = useState(false);

  // Price calculations with variant offsets
  const subtotal = cart.reduce((acc, item) => acc + ((item.unitPrice || item.product.sellingPrice) * item.quantity), 0);
  const freeThreshold = 499;
  const isFree = subtotal >= freeThreshold || deliveryMethod === 'express_haldwani';
  const shippingFee = isFree ? 0 : 70;
  const grandTotal = subtotal + shippingFee;
  const taxAmount = Math.round(subtotal - (subtotal / 1.18));

  // Auto detect city/state from Indian PIN code
  const handlePincodeChange = (pin: string) => {
    const cleaned = pin.replace(/\D/g, '').slice(0, 6);
    setPincode(cleaned);
    if (cleaned.length === 6) {
      const pinInfo = storage.checkPincode(cleaned);
      setCity(pinInfo.city);
      setState(pinInfo.state);
      if (pinInfo.isExpressHaldwaniAvailable) {
        setDeliveryMethod('express_haldwani');
      } else {
        setDeliveryMethod('standard');
      }
    }
  };

  const handleProceedToDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || pincode.length !== 6 || !flatHouse || !areaColony) {
      setErrorMessage('Please fill all required address fields with a valid 6-digit PIN code.');
      return;
    }
    setErrorMessage('');
    setStep(2);
  };

  const handleProceedToPayment = () => {
    setErrorMessage('');
    setStep(3);
  };

  const handleFinalOrderSubmit = () => {
    setIsSubmitting(true);
    setErrorMessage('');

    // Form shipping address
    const shippingAddress: Address = {
      id: `addr-${Date.now()}`,
      fullName,
      phone,
      pincode,
      flatHouse,
      areaColony,
      city,
      state,
      landmark,
      isDefault: true
    };

    // Save address for logged in customer
    if (currentUser) {
      storage.saveUserAddress(shippingAddress);
    }

    // Call transaction-safe createOrder
    const result = storage.createOrder({
      userId: currentUser?.id || `guest-${Date.now()}`,
      customerName: fullName,
      customerPhone: phone,
      customerEmail: email,
      shippingAddress,
      deliveryMethod,
      paymentMethod,
      cartItems: cart
    });

    setTimeout(() => {
      setIsSubmitting(false);
      if (result.success && result.order) {
        setConfirmedOrder(result.order);
        onOrderPlaced(result.order);
        setStep(4);
      } else {
        setErrorMessage(result.error || 'Failed to complete order. Please check item stock.');
      }
    }, 600);
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="relative bg-white rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200 max-h-[94vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-[#0B192C] text-white">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <div>
              <h2 className="text-base font-bold">Harvinder Telecom Checkout</h2>
              <p className="text-[11px] text-slate-300">100% Secure Indian Retail Transaction · Haldwani, UK</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            aria-label="Close checkout"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Indicator (when not in success state) */}
        {step < 4 && (
          <div className="grid grid-cols-3 border-b border-slate-200 text-xs font-semibold bg-slate-50">
            <div className={`py-3 px-4 text-center border-r border-slate-200 transition-colors ${step === 1 ? 'text-blue-600 bg-white border-b-2 border-b-blue-600' : 'text-slate-500'}`}>
              1. Delivery Address
            </div>
            <div className={`py-3 px-4 text-center border-r border-slate-200 transition-colors ${step === 2 ? 'text-blue-600 bg-white border-b-2 border-b-blue-600' : 'text-slate-500'}`}>
              2. Shipping Mode
            </div>
            <div className={`py-3 px-4 text-center transition-colors ${step === 3 ? 'text-blue-600 bg-white border-b-2 border-b-blue-600' : 'text-slate-500'}`}>
              3. Payment &amp; Taxes
            </div>
          </div>
        )}

        {/* Modal Content */}
        <div className="overflow-y-auto p-4 sm:p-6 lg:p-8 flex-1 space-y-6">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: Address Entry */}
          {step === 1 && (
            <form onSubmit={handleProceedToDelivery} className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  Recipient &amp; Delivery Destination
                </h3>
                <p className="text-xs text-slate-500 mb-2">
                  Please provide your Indian phone number and PIN code for order alerts and courier dispatch.
                </p>
                <div className="p-2.5 bg-blue-50/80 border border-blue-200 rounded-lg flex items-center justify-between text-xs text-blue-900">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                    <span>
                      <strong>15-Minute Inventory Hold Active:</strong> Items in your cart are locked for checkout.
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-semibold bg-white text-blue-700 px-2 py-0.5 rounded border border-blue-300">
                    Reserved
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Rahul Kumar"
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
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="10-digit mobile number"
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="For GST invoice & updates"
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    PIN Code * (e.g. 263139 Haldwani)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => handlePincodeChange(e.target.value)}
                    placeholder="6-digit PIN code"
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white tabular-nums font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Flat / House No. / Building *
                  </label>
                  <input
                    type="text"
                    required
                    value={flatHouse}
                    onChange={(e) => setFlatHouse(e.target.value)}
                    placeholder="e.g. House No. 42, Green Enclave"
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Area / Street / Sector *
                  </label>
                  <input
                    type="text"
                    required
                    value={areaColony}
                    onChange={(e) => setAreaColony(e.target.value)}
                    placeholder="e.g. Tikonia Chauraha / Bhotia Parao"
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    City / Town *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="e.g. Near Tikonia Police Post / Nainital Road"
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#0B192C] hover:bg-blue-600 text-white font-semibold rounded-xl text-xs sm:text-sm flex items-center gap-2 transition-colors shadow-sm"
                >
                  <span>Continue to Shipping</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Shipping Method */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  Select Delivery Speed
                </h3>
                <p className="text-xs text-slate-500">
                  Delivering to: <span className="font-semibold text-slate-800">{city}, {state} ({pincode})</span>
                </p>
              </div>

              <div className="space-y-3">
                {/* Haldwani Express Option */}
                <label 
                  className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                    deliveryMethod === 'express_haldwani'
                      ? 'border-blue-600 bg-blue-50/60 ring-1 ring-blue-600'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="express_haldwani"
                    checked={deliveryMethod === 'express_haldwani'}
                    onChange={() => setDeliveryMethod('express_haldwani')}
                    className="mt-1 text-blue-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-900">
                        Harvinder Express (Same-Day / 24-hr Delivery)
                      </span>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-sm">
                        FREE
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      Direct hand-delivery from our Tikonia Chauraha store by verified local rider with tamper-proof seal inspection.
                    </p>
                    <p className="text-[11px] text-blue-700 font-medium mt-1">
                      Recommended for Haldwani &amp; Kathgodam residents
                    </p>
                  </div>
                </label>

                {/* Standard Insured Courier */}
                <label 
                  className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                    deliveryMethod === 'standard'
                      ? 'border-blue-600 bg-blue-50/60 ring-1 ring-blue-600'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="standard"
                    checked={deliveryMethod === 'standard'}
                    onChange={() => setDeliveryMethod('standard')}
                    className="mt-1 text-blue-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-900">
                        Standard Insured Courier (BlueDart / Delhivery)
                      </span>
                      <span className="text-xs font-semibold text-slate-700">
                        {subtotal >= 499 ? <span className="text-emerald-700 font-bold">FREE</span> : '₹70'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      Fully transit-insured shipment across Uttarakhand (Nainital, Almora, Dehradun) and all India pin codes.
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Estimated 2–4 business days with live SMS tracking
                    </p>
                  </div>
                </label>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Back to Address
                </button>

                <button
                  type="button"
                  onClick={handleProceedToPayment}
                  className="px-6 py-2.5 bg-[#0B192C] hover:bg-blue-600 text-white font-semibold rounded-xl text-xs sm:text-sm flex items-center gap-2 transition-colors shadow-sm"
                >
                  <span>Continue to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Payment Method & Review */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  Select Indian Payment Method
                </h3>
                <p className="text-xs text-slate-500">
                  Total payable amount: <span className="font-bold text-blue-700 tabular-nums">₹{grandTotal.toLocaleString('en-IN')}</span> (includes 18% GST)
                </p>
              </div>

              {/* Payment Options Accordion */}
              <div className="space-y-3">
                {/* UPI / QR Code */}
                <div className={`border rounded-xl p-4 transition-all ${paymentMethod === 'upi' ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-600' : 'border-slate-200'}`}>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="upi"
                      checked={paymentMethod === 'upi'}
                      onChange={() => setPaymentMethod('upi')}
                      className="text-blue-600"
                    />
                    <div className="flex-1 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <QrCode className="w-4 h-4 text-blue-600" />
                        <span className="text-xs sm:text-sm font-bold text-slate-900">
                          Instant UPI (Google Pay, PhonePe, Paytm, BHIM)
                        </span>
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm">
                        Zero Fee
                      </span>
                    </div>
                  </label>

                  {paymentMethod === 'upi' && (
                    <div className="mt-4 pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                      <div className="p-3 bg-white rounded-lg border border-slate-200 flex flex-col items-center justify-center text-center">
                        {/* Dynamic Clean QR Simulator */}
                        <div className="w-28 h-28 bg-slate-900 rounded-lg p-2 flex items-center justify-center">
                          <div className="w-full h-full bg-white p-1 rounded grid grid-cols-4 gap-1">
                            {Array.from({ length: 16 }).map((_, i) => (
                              <div key={i} className={`rounded-xs ${i % 3 === 0 ? 'bg-slate-900' : 'bg-slate-300'}`}></div>
                            ))}
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-500 mt-2 font-mono">
                          UPI ID: harvindertelecom@upi
                        </span>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-700">
                          Or Enter Your UPI ID / VPA:
                        </label>
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="e.g. mobile@paytm"
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 font-mono"
                        />
                        <p className="text-[11px] text-slate-500">
                          You will receive a collect request notification on your UPI app.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Cash on Delivery (COD) */}
                <div className={`border rounded-xl p-4 transition-all ${paymentMethod === 'cod' ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-600' : 'border-slate-200'}`}>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="text-blue-600"
                    />
                    <div className="flex-1 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Banknote className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs sm:text-sm font-bold text-slate-900">
                          Cash on Delivery (COD)
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-600">Pay cash upon delivery</span>
                    </div>
                  </label>

                  {paymentMethod === 'cod' && (
                    <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-600 space-y-2">
                      <p>
                        Pay in cash or through rider UPI QR when your order arrives at your doorstep in Haldwani.
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        {!simulatedOtpSent ? (
                          <button
                            type="button"
                            onClick={() => {
                              setSimulatedOtpSent(true);
                              setCodOtp('4819');
                            }}
                            className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-medium hover:bg-slate-700"
                          >
                            Send Verification SMS OTP to +91 {phone}
                          </button>
                        ) : (
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-emerald-700 font-semibold">OTP auto-verified (Code: {codOtp})</span>
                            <Check className="w-4 h-4 text-emerald-600" />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Simulator */}
                <div className={`border rounded-xl p-4 transition-all ${paymentMethod === 'card_test' ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-600' : 'border-slate-200'}`}>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card_test"
                      checked={paymentMethod === 'card_test'}
                      onChange={() => setPaymentMethod('card_test')}
                      className="text-blue-600"
                    />
                    <div className="flex-1 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-indigo-600" />
                        <span className="text-xs sm:text-sm font-bold text-slate-900">
                          Debit / Credit Card (RuPay, Visa, Mastercard)
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500">Test Simulator</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Order Items & GST Breakdown Summary */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs text-slate-600">
                <div className="font-bold text-slate-800 pb-1 border-b border-slate-200 flex justify-between">
                  <span>Order Items ({cart.length})</span>
                  <span>Amount</span>
                </div>
                {cart.map((item, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="truncate max-w-[240px]">
                      {item.quantity}x {item.product.name}
                    </span>
                    <span className="font-semibold text-slate-800 tabular-nums">
                      ₹{(item.product.sellingPrice * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
                <div className="pt-2 border-t border-slate-200 space-y-1">
                  <div className="flex justify-between">
                    <span>Tax Breakdown (18% GST):</span>
                    <span className="tabular-nums">CGST (9%) + SGST (9%) = ₹{taxAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee:</span>
                    <span className="font-semibold">{shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-900 pt-1">
                    <span>Total Net Payable:</span>
                    <span className="text-blue-700 tabular-nums">₹{grandTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Back to Shipping
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleFinalOrderSubmit}
                  className="px-6 py-3 bg-[#0B192C] hover:bg-blue-600 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 transition-colors shadow-md disabled:bg-slate-400"
                >
                  {isSubmitting ? (
                    <span>Confirming with Store...</span>
                  ) : (
                    <>
                      <span>Pay ₹{grandTotal.toLocaleString('en-IN')} &amp; Place Order</span>
                      <Check className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Order Success & GST Tax Invoice */}
          {step === 4 && confirmedOrder && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="text-center py-4 space-y-2">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900">
                  Order Successfully Placed!
                </h3>
                <p className="text-xs text-slate-500">
                  Order Reference: <span className="font-mono font-bold text-slate-800">{confirmedOrder.orderNumber}</span>
                </p>
                <p className="text-xs text-emerald-700 font-semibold">
                  A confirmation SMS has been dispatched to +91 {confirmedOrder.customerPhone}.
                </p>
              </div>

              {/* Printable Official GST Tax Invoice */}
              <div id="tax-invoice-printable" className="p-6 bg-white border border-slate-300 rounded-xl space-y-4 text-xs text-slate-700 shadow-sm">
                {/* Invoice Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b border-slate-200">
                  <div>
                    <h4 className="text-base font-extrabold text-[#0B192C]">
                      HARVINDER TELECOM
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Opp. Tikonia Chauraha, Nainital Road, Haldwani, Nainital, Uttarakhand - 263139
                    </p>
                    <p className="text-[11px] font-mono text-slate-700 mt-0.5">
                      GSTIN: 05AAACH1234F1Z8 · State Code: 05 (Uttarakhand)
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Support: +91 98370 12345 · support@harvindertelecom.com
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] bg-slate-100 px-2 py-0.5 rounded">
                      TAX INVOICE
                    </span>
                    <p className="text-xs font-semibold text-slate-900 mt-1">
                      Invoice No: {confirmedOrder.orderNumber}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Date: {new Date(confirmedOrder.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Payment Mode: {confirmedOrder.paymentMethod.toUpperCase()} ({confirmedOrder.paymentStatus})
                    </p>
                  </div>
                </div>

                {/* Billed To / Shipped To */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-200 text-xs">
                  <div>
                    <p className="font-bold text-slate-800 uppercase tracking-wide text-[10px]">Billed To / Consignee:</p>
                    <p className="font-semibold text-slate-900">{confirmedOrder.customerName}</p>
                    <p>{confirmedOrder.shippingAddress.flatHouse}, {confirmedOrder.shippingAddress.areaColony}</p>
                    <p>{confirmedOrder.shippingAddress.city}, {confirmedOrder.shippingAddress.state} - {confirmedOrder.shippingAddress.pincode}</p>
                    <p>Phone: +91 {confirmedOrder.customerPhone}</p>
                  </div>

                  <div>
                    <p className="font-bold text-slate-800 uppercase tracking-wide text-[10px]">Dispatch &amp; Tracking:</p>
                    <p className="font-semibold text-slate-900">Courier: {confirmedOrder.trackingCourier}</p>
                    <p className="font-mono text-slate-800">Docket / AWB: {confirmedOrder.trackingNumber}</p>
                    <p className="text-blue-700 font-medium">Status: Out for Preparation in Haldwani</p>
                  </div>
                </div>

                {/* Itemized Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold border-y border-slate-200">
                        <th className="py-2 px-2">#</th>
                        <th className="py-2 px-2">Description of Goods</th>
                        <th className="py-2 px-2">HSN</th>
                        <th className="py-2 px-2 text-center">Qty</th>
                        <th className="py-2 px-2 text-right">Unit Rate (₹)</th>
                        <th className="py-2 px-2 text-right">Total (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {confirmedOrder.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-2.5 px-2">{idx + 1}</td>
                          <td className="py-2.5 px-2">
                            <span className="font-semibold text-slate-900">{item.productName}</span>
                            {item.assignedImei && (
                              <p className="text-[10px] font-mono text-blue-700">
                                Allocated Unit IMEI: {item.assignedImei}
                              </p>
                            )}
                          </td>
                          <td className="py-2.5 px-2 font-mono">{item.hsnCode}</td>
                          <td className="py-2.5 px-2 text-center tabular-nums">{item.quantity}</td>
                          <td className="py-2.5 px-2 text-right tabular-nums">₹{item.unitPrice.toLocaleString('en-IN')}</td>
                          <td className="py-2.5 px-2 text-right font-semibold text-slate-900 tabular-nums">
                            ₹{item.totalPrice.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Tax & Total Calculation */}
                {(() => {
                  const isIntraState = confirmedOrder.shippingAddress.state.toLowerCase().includes('uttarakhand') || 
                                       confirmedOrder.shippingAddress.pincode.startsWith('26') || 
                                       confirmedOrder.shippingAddress.pincode.startsWith('24');
                  const cgst = Math.round(confirmedOrder.taxAmount / 2);
                  const sgst = confirmedOrder.taxAmount - cgst;

                  return (
                    <div className="border-t border-slate-200 pt-3 flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="text-[11px] text-slate-500 max-w-sm space-y-1">
                        <p className="font-semibold text-slate-700">Terms &amp; Conditions:</p>
                        <p>1. Goods sold are backed by manufacturer warranty / Harvinder Telecom Store Warranty.</p>
                        <p>2. Keep this invoice safe for claiming brand service center assistance in Haldwani.</p>
                        <p className="pt-2 font-medium text-slate-900 italic">
                          Amount in Words: {numberToIndianWords(confirmedOrder.totalAmount)}
                        </p>
                      </div>

                      <div className="w-full sm:w-72 space-y-1.5 text-xs text-slate-700">
                        <div className="flex justify-between">
                          <span>Taxable Value:</span>
                          <span className="tabular-nums font-medium">₹{(confirmedOrder.subtotal - confirmedOrder.taxAmount).toLocaleString('en-IN')}</span>
                        </div>
                        {isIntraState ? (
                          <>
                            <div className="flex justify-between text-slate-600">
                              <span>Central GST (CGST @ 9%):</span>
                              <span className="tabular-nums">₹{cgst.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                              <span>State GST (SGST @ 9%):</span>
                              <span className="tabular-nums">₹{sgst.toLocaleString('en-IN')}</span>
                            </div>
                          </>
                        ) : (
                          <div className="flex justify-between text-slate-600">
                            <span>Integrated GST (IGST @ 18%):</span>
                            <span className="tabular-nums">₹{confirmedOrder.taxAmount.toLocaleString('en-IN')}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Delivery Charges:</span>
                          <span className="tabular-nums font-medium">{confirmedOrder.shippingFee === 0 ? 'FREE' : `₹${confirmedOrder.shippingFee}`}</span>
                        </div>
                        <div className="flex justify-between text-sm font-extrabold text-[#0B192C] pt-2 border-t border-slate-200">
                          <span>Grand Total (INR):</span>
                          <span className="tabular-nums text-blue-700">₹{confirmedOrder.totalAmount.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="pt-3 flex justify-between items-end text-[10px] text-slate-500 border-t border-slate-100">
                          <span>E. &amp; O.E. · Computer Generated</span>
                          <div className="text-right">
                            <p className="font-semibold text-slate-800">For Harvinder Telecom</p>
                            <p className="text-[9px] mt-3 border-t border-slate-400 pt-0.5">Authorized Signatory</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handlePrintInvoice}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print / Save Tax Invoice</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 bg-[#0B192C] hover:bg-blue-600 text-white font-bold rounded-xl text-xs sm:text-sm transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
