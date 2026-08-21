import React, { useState } from 'react';
import { X, Tag, CheckCircle2, ShieldCheck, CreditCard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: { id: string; title: string }[];
  totalPrice: number;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, courses, totalPrice }) => {
  const [couponCode, setCouponCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [couponStatus, setCouponStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth(); // assuming useAuth exists

  if (!isOpen) return null;

  const isFree = couponStatus === 'success';
  const displayPrice = isFree ? 0 : totalPrice;

  const handleApplyCoupon = () => {
    if (!couponCode) return;
    setIsApplying(true);
    setTimeout(() => {
      if (couponCode.toUpperCase() === 'SG2026') {
        setCouponStatus('success');
      } else {
        setCouponStatus('error');
      }
      setIsApplying(false);
    }, 800);
  };

  const handleCheckout = async () => {
    if (!user) {
      alert("Please login first.");
      return;
    }

    setIsLoading(true);
    const courseIds = courses.map(c => c.id);

    try {
      if (isFree) {
        // Handle free enrollment
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/payments/enroll-free`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId: user.uid,
            studentEmail: user.email,
            studentName: user.displayName,
            courseIds,
            couponCode: couponCode.toUpperCase()
          })
        });
        const data = await response.json();
        if (data.success) {
          window.location.href = '/dashboard?payment_success=true';
        } else {
          alert('Error: ' + data.message);
        }
      } else {
        // Handle Stripe Checkout
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/payments/create-checkout-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId: user.uid,
            studentEmail: user.email,
            studentName: user.displayName,
            courseIds
          })
        });
        const data = await response.json();
        if (data.success && data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
        } else {
          alert('Error creating checkout session: ' + data.message);
        }
      }
    } catch (err) {
      console.error(err);
      alert('Network error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 flex flex-col transform transition-all scale-100">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-zinc-800/50 bg-slate-50/50 dark:bg-zinc-900/50">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-500" />
            Secure Checkout
          </h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Order Summary */}
          <div>
            <h3 className="text-sm font-semibold text-slate-500 dark:text-zinc-400 mb-3 uppercase tracking-wider">Order Summary</h3>
            <div className="space-y-3">
              {courses.map(c => (
                <div key={c.id} className="flex justify-between items-start text-sm">
                  <span className="text-slate-700 dark:text-zinc-300 pr-4">{c.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Details */}
          <div className="bg-slate-50 dark:bg-zinc-800/50 rounded-2xl p-4 space-y-3 border border-slate-100 dark:border-zinc-800">
            <div className="flex justify-between text-sm text-slate-600 dark:text-zinc-400">
              <span>Subtotal</span>
              <span>₹{totalPrice}</span>
            </div>
            {isFree && (
              <div className="flex justify-between text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                <span>Coupon SG2026 (100% OFF)</span>
                <span>-₹{totalPrice}</span>
              </div>
            )}
            <div className="pt-3 border-t border-slate-200 dark:border-zinc-700 flex justify-between items-center">
              <span className="font-bold text-slate-800 dark:text-white">Total</span>
              <span className="text-xl font-extrabold text-blue-600 dark:text-blue-400">₹{displayPrice}</span>
            </div>
          </div>

          {/* Coupon Code */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Have a coupon code?
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Enter code"
                disabled={isFree}
                className="flex-1 px-4 py-2.5 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:opacity-50 uppercase"
              />
              <button
                onClick={handleApplyCoupon}
                disabled={!couponCode || isApplying || isFree}
                className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-sm font-bold hover:bg-slate-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isApplying ? 'Applying...' : 'Apply'}
              </button>
            </div>
            {couponStatus === 'error' && (
              <p className="text-xs text-red-500 font-medium">Invalid or expired coupon code.</p>
            )}
            {couponStatus === 'success' && (
              <p className="text-xs text-emerald-500 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Coupon applied successfully!
              </p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-slate-50/80 dark:bg-zinc-900 border-t border-slate-100 dark:border-zinc-800/50">
          <button
            onClick={handleCheckout}
            disabled={isLoading}
            className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md ${
              isFree 
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            } disabled:opacity-70`}
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isFree ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Enroll for Free
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Pay with Stripe
              </>
            )}
          </button>
          
          <p className="text-center text-[11px] text-slate-500 dark:text-zinc-500 mt-4 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Payments are securely processed by Stripe
          </p>
        </div>
        
      </div>
    </div>
  );
};
