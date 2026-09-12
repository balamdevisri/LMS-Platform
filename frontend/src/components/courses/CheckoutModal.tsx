import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Tag,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  GraduationCap,
  Sparkles,
  Lock,
  AlertCircle,
  Loader2,
  BookOpen,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/config/api';
import { courseService } from '@/services/courseService';
import { couponService } from '@/services/couponService';
import { toast } from 'sonner';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: { id: string; title: string; price?: number }[];
  totalPrice: number;
  onSuccess?: (courseIds: string[]) => void;
}

interface AppliedCoupon {
  code: string;
  discountPercent: number;
  discountAmount: number;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  courses,
  totalPrice,
  onSuccess,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Reset state when modal opens/closes or courses change
  useEffect(() => {
    if (isOpen) {
      setCouponCode('');
      setIsApplyingCoupon(false);
      setAppliedCoupon(null);
      setCouponError('');
      setIsLoading(false);
      setErrorMessage('');
      setIsSuccess(false);
      setSuccessMessage('');
    }
  }, [isOpen, totalPrice]);

  if (!isOpen) return null;

  // Pricing calculations
  const rawPrice = Math.max(0, Number(totalPrice) || 0);
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const effectivePrice = Math.max(0, rawPrice - discountAmount);
  
  // A course is free if the base price is 0 OR a coupon discounted it to 0
  const isFree = effectivePrice === 0;
  const isDiscountedToFree = rawPrice > 0 && isFree;

  const primaryCourse = courses[0];
  const courseTitle = primaryCourse?.title || 'Selected Course Track';

  // Handle Coupon Application (Authoritative Server Validation)
  const handleApplyCoupon = async () => {
    const trimmed = couponCode.trim().toUpperCase();
    if (!trimmed) return;

    setIsApplyingCoupon(true);
    setCouponError('');
    setErrorMessage('');

    try {
      const token = user ? await user.getIdToken().catch(() => undefined) : undefined;
      const result = await couponService.validateCoupon(
        {
          couponCode: trimmed,
          courseId: primaryCourse?.id || '',
          coursePrice: rawPrice,
        },
        token,
        user?.uid
      );

      setIsApplyingCoupon(false);

      if (!result.valid) {
        setCouponError(result.message || result.error || 'Invalid or expired coupon code.');
        setAppliedCoupon(null);
        return;
      }

      const discountAmt = typeof result.discountAmount === 'number' ? result.discountAmount : 0;
      const discountPct =
        result.discountType === 'percentage'
          ? (result.discountValue ?? Math.round((discountAmt / (rawPrice || 1)) * 100))
          : Math.round((discountAmt / (rawPrice || 1)) * 100);

      setAppliedCoupon({
        code: trimmed,
        discountPercent: discountPct,
        discountAmount: discountAmt,
      });

      toast.success(`🎉 Coupon "${trimmed}" applied! Saved ₹${discountAmt}`);
    } catch (err: any) {
      setIsApplyingCoupon(false);
      setCouponError(err.message || 'Failed to validate coupon code.');
      setAppliedCoupon(null);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  // Handle Free Enrollment Flow (Direct Firestore enrollment, No Stripe)
  const handleFreeEnrollment = async () => {
    if (!user) {
      toast.warning('Please sign in to confirm your course enrollment.');
      navigate('/auth/login');
      onClose();
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const studentId = user.uid;
      const studentEmail = user.email || '';
      const studentName = user.displayName || user.email?.split('@')[0] || 'Student';
      const courseIds = courses.map((c) => c.id);

      // 1. Directly enroll in client storage + Firestore via courseService
      for (const c of courses) {
        await courseService.enrollCourse(c.id, studentId, {
          email: studentEmail,
          name: studentName,
          courseTitle: c.title,
        });
      }

      // 2. Notify backend endpoint for server-side persistence & confirmation email
      try {
        await fetch(`${API_BASE_URL}/payments/enroll-free`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId,
            studentEmail,
            studentName,
            courseIds,
            couponCode: appliedCoupon?.code || (rawPrice === 0 ? 'FREE_TIER' : undefined),
          }),
        });
      } catch (backendErr) {
        console.warn('[CheckoutModal] Backend enroll-free notice:', backendErr);
      }

      setIsSuccess(true);
      setSuccessMessage(`Enrolled successfully in "${courseTitle}"!`);
      toast.success(`🎉 Free enrollment confirmed for "${courseTitle}"!`);

      if (onSuccess) {
        onSuccess(courseIds);
      }

      // Redirect student directly to the enrolled course classroom after a brief success animation
      setTimeout(() => {
        onClose();
        if (courses.length === 1 && primaryCourse?.id) {
          navigate(`/courses/${primaryCourse.id}?mode=learn`);
        } else {
          navigate('/dashboard?enrolled=true');
        }
      }, 1200);
    } catch (err: any) {
      console.error('[CheckoutModal] Free enrollment error:', err);
      setErrorMessage(err.message || 'Failed to complete free enrollment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Paid Stripe Checkout Flow
  const handleStripeCheckout = async () => {
    if (!user) {
      toast.warning('Please sign in to proceed to checkout.');
      navigate('/auth/login');
      onClose();
      return;
    }

    if (effectivePrice <= 0) {
      // Safety guard: If price is 0, switch to free enrollment instead of Stripe charge attempt
      handleFreeEnrollment();
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const studentId = user.uid;
      const studentEmail = user.email || '';
      const studentName = user.displayName || user.email?.split('@')[0] || 'Student';
      const courseIds = courses.map((c) => c.id);

      const response = await fetch(`${API_BASE_URL}/payments/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          studentEmail,
          studentName,
          courseIds,
          amount: effectivePrice,
          couponCode: appliedCoupon?.code,
        }),
      });

      const data = await response.json();

      if (data.success && data.checkoutUrl) {
        // Redirect to Stripe checkout page
        window.location.href = data.checkoutUrl;
      } else if (data.freeCourse || data.amount === 0) {
        // Backend indicated 0 price
        await handleFreeEnrollment();
      } else {
        setErrorMessage(
          data.message || 'Payment session could not be created. Please check your network and try again.'
        );
      }
    } catch (err: any) {
      console.error('[CheckoutModal] Stripe checkout error:', err);
      setErrorMessage('Payment connection failed — please check your internet connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="bg-slate-900 border border-slate-800 text-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col relative"
      >
        {/* ========================================================================= */}
        {/* SUCCESS CONFIRMATION STATE                                               */}
        {/* ========================================================================= */}
        {isSuccess ? (
          <div className="p-8 sm:p-10 text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-8 h-8 animate-bounce" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-heading font-extrabold text-white">Enrollment Successful!</h3>
              <p className="text-xs text-slate-400 font-medium max-w-xs mx-auto">
                {successMessage || "You've successfully enrolled. Taking you to your course materials..."}
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-indigo-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Redirecting to Classroom...</span>
            </div>
          </div>
        ) : isFree ? (
          /* ========================================================================= */
          /* 1. FREE ENROLLMENT MODAL (NO STRIPE / NO PAYMENT GATEWAY)                 */
          /* ========================================================================= */
          <>
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-5 border-b border-slate-800 bg-slate-950/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-heading font-extrabold text-white">Confirm Enrollment</h2>
                  <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Free Instant Access</p>
                </div>
              </div>
              <button
                onClick={onClose}
                disabled={isLoading}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* Course Title Badge Card */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-400" /> Selected Track
                  </span>
                  <span className="text-[10px] font-black text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-full">
                    FREE
                  </span>
                </div>
                <h3 className="font-heading font-extrabold text-sm text-white leading-snug">
                  {courseTitle}
                </h3>
              </div>

              {/* Confirming Copy */}
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                You're about to enroll in <span className="text-white font-bold">{courseTitle}</span> for free. You'll get instant, lifetime access to all learning modules and syllabus materials.
              </p>

              {/* Discount Applied Callout (if paid course discounted to 0) */}
              {isDiscountedToFree && appliedCoupon && (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-emerald-300 font-semibold">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>Coupon <strong>{appliedCoupon.code}</strong> Applied (100% OFF)</span>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-[11px] text-slate-400 hover:text-rose-400 underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              )}

              {/* Benefits Checklist */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Full access to video lessons & interactive topics</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Personal progress tracking & verified certificate</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>No credit card or payment required</span>
                </div>
              </div>

              {/* Inline Error Message */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/80 flex items-start gap-2.5 text-rose-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-6 pt-2 pb-6 border-t border-slate-800/80 bg-slate-950/40">
              <button
                onClick={handleFreeEnrollment}
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-2xl bg-linear-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-xs tracking-wide shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/35 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Confirming Enrollment...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm Enrollment</span>
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          /* ========================================================================= */
          /* 2. PAID SECURE CHECKOUT FLOW (STRIPE PAYMENT WITH ORDER SUMMARY & COUPON)  */
          /* ========================================================================= */
          <>
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-5 border-b border-slate-800 bg-slate-950/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-heading font-extrabold text-white">Secure Checkout</h2>
                  <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">Encrypted Transaction</p>
                </div>
              </div>
              <button
                onClick={onClose}
                disabled={isLoading}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* Order Summary */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Order Summary</span>
                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2">
                  {courses.map((c) => (
                    <div key={c.id} className="flex justify-between items-start text-xs">
                      <span className="font-bold text-slate-200 pr-3">{c.title}</span>
                      <span className="font-bold text-slate-300 shrink-0">₹{rawPrice}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subtotal & Total Pricing Details */}
              <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800 space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-400 font-medium">
                  <span>Subtotal</span>
                  <span>₹{rawPrice}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-400 font-semibold items-center">
                    <span className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" /> Coupon ({appliedCoupon.code} - {appliedCoupon.discountPercent}% OFF)
                    </span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}

                <div className="pt-2.5 border-t border-slate-800 flex justify-between items-center">
                  <span className="font-extrabold text-white text-sm">Total</span>
                  <span className="font-heading font-black text-xl text-blue-400">
                    ₹{effectivePrice}
                  </span>
                </div>
              </div>

              {/* Coupon Code Input & Apply Button (Visible in Paid Flow Only) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-indigo-400" /> Have a Coupon Code?
                  </span>
                  {appliedCoupon && (
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-[10px] text-rose-400 hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </label>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value);
                      setCouponError('');
                    }}
                    placeholder="Enter code (e.g. SG2026)"
                    disabled={Boolean(appliedCoupon) || isApplyingCoupon || isLoading}
                    className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 uppercase transition-all font-mono placeholder:text-slate-500 disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={!couponCode.trim() || Boolean(appliedCoupon) || isApplyingCoupon || isLoading}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs shrink-0"
                  >
                    {isApplyingCoupon ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" />
                    ) : (
                      'Apply'
                    )}
                  </button>
                </div>

                {couponError && (
                  <p className="text-[11px] text-rose-400 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {couponError}
                  </p>
                )}

                {appliedCoupon && (
                  <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Coupon {appliedCoupon.code} applied successfully!
                  </p>
                )}
              </div>

              {/* Inline Error Message */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/80 flex items-start gap-2.5 text-rose-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-6 pt-2 pb-6 border-t border-slate-800/80 bg-slate-950/40 space-y-3">
              <button
                onClick={handleStripeCheckout}
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-2xl bg-linear-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs tracking-wide shadow-lg shadow-blue-600/20 hover:shadow-blue-600/35 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing with Stripe...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Pay with Stripe (₹{effectivePrice})</span>
                  </>
                )}
              </button>

              <p className="text-center text-[10px] text-slate-500 flex items-center justify-center gap-1.5 font-medium">
                <Lock className="w-3 h-3 text-slate-400" />
                <span>Payments are securely processed by Stripe</span>
              </p>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default CheckoutModal;
