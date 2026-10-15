import React, { useState } from 'react';
import { X, MapPin, Truck, CheckCircle2, ShieldCheck } from 'lucide-react';
import { storage } from '../services/storage';
import { PincodeInfo } from '../types';

interface PincodeCheckerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPincode: string;
  onSelectPincode: (pin: string) => void;
}

export const PincodeCheckerModal: React.FC<PincodeCheckerModalProps> = ({
  isOpen,
  onClose,
  currentPincode,
  onSelectPincode
}) => {
  if (!isOpen) return null;

  const [inputPin, setInputPin] = useState(currentPincode || '263139');
  const [result, setResult] = useState<PincodeInfo | null>(() => storage.checkPincode(currentPincode || '263139'));

  const popularKumaonPins = [
    { pin: '263139', name: 'Haldwani City (Opp. Tikonia / Bhotia Parao)' },
    { pin: '263141', name: 'Kathgodam / Sheeshmahal' },
    { pin: '263126', name: 'Lalkuan / Bindukhatta' },
    { pin: '263001', name: 'Nainital (Mallital / Tallital)' },
    { pin: '263153', name: 'Rudrapur (Udham Singh Nagar)' },
    { pin: '263601', name: 'Almora Town' },
  ];

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    const info = storage.checkPincode(inputPin);
    setResult(info);
  };

  const handleApply = (pin: string) => {
    onSelectPincode(pin);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="relative bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200 p-6 space-y-4 text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Check Delivery Speeds &amp; PIN Code
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleCheck} className="flex gap-2">
          <input
            type="text"
            maxLength={6}
            value={inputPin}
            onChange={(e) => setInputPin(e.target.value.replace(/\D/g, ''))}
            placeholder="Enter 6-digit Indian PIN code"
            className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white focus:border-blue-500 tabular-nums"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-[#0B192C] text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors"
          >
            Check
          </button>
        </form>

        {result && (
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-slate-900 text-sm">
                  {result.city}, {result.state} ({result.pincode})
                </p>
                <p className="text-[11px] text-slate-500">{result.district} District</p>
              </div>

              <button
                onClick={() => handleApply(result.pincode)}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-xs transition-colors"
              >
                Deliver Here
              </button>
            </div>

            <div className="pt-2 border-t border-slate-200 space-y-1">
              {result.isExpressHaldwaniAvailable ? (
                <p className="text-emerald-700 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Same-Day 24-hr Express Delivery Available from Haldwani Hub
                </p>
              ) : (
                <p className="text-slate-700 font-medium flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-blue-600" />
                  Standard Insured Courier (Est. {result.estimatedDeliveryDays}–{result.estimatedDeliveryDays + 1} Days)
                </p>
              )}

              <p className="text-[11px] text-slate-500">
                Cash on Delivery (COD) supported · Free delivery on orders over ₹499
              </p>
            </div>
          </div>
        )}

        {/* Popular Regional PINs in Kumaon / Haldwani */}
        <div className="space-y-1.5 pt-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Quick Select (Kumaon Hubs):
          </p>
          <div className="space-y-1 max-h-36 overflow-y-auto divide-y divide-slate-100">
            {popularKumaonPins.map((item) => (
              <button
                key={item.pin}
                onClick={() => {
                  setInputPin(item.pin);
                  const info = storage.checkPincode(item.pin);
                  setResult(info);
                }}
                className="w-full py-1.5 px-2 text-left flex justify-between items-center hover:bg-slate-50 rounded transition-colors text-slate-700 hover:text-blue-600"
              >
                <span>{item.name}</span>
                <span className="font-mono font-bold text-[11px] text-slate-500">{item.pin}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
