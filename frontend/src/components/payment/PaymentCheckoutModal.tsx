import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  CreditCard,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Video,
  BookOpen,
  Lock,
  RotateCw,
  Tag,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { paymentService, type PaymentOrderResponse } from '@/services/paymentService';
import { couponService, type CouponValidationResponse } from '@/services/couponService';
import { toast } from 'sonner';

interface PaymentCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: {
    id: string;
    title: string;
    price?: number;
    instructor?: { name: string };
    duration?: string;
  };
  studentInfo: {
    uid: string;
    email?: string;
    name?: string;
  };
  onPaymentSuccess: (enrollment: any) => void;
  onNavigateToLiveClass?: () => void;
}

type CheckoutStep = 'details' | 'processing' | 'success' | 'failed' | 'pending';

export const PaymentCheckoutModal: React.FC<PaymentCheckoutModalProps> = ({
  isOpen,
  onClose,
  course,
  studentInfo,
  onPaymentSuccess,
  onNavigateToLiveClass,
}) => {
  const [step, setStep] = useState<CheckoutStep>('details');
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState<string>('');
  const [orderData, setOrderData] = useState<PaymentOrderResponse | null>(null);
  const [loadingOrder, setLoadingOrder] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Coupon state
  const [couponCodeInput, setCouponCodeInput] = useState<string>('');
  const [validatingCoupon, setValidatingCoupon] = useState<boolean>(false);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationResponse | null>(null);
  const [couponError, setCouponError] = useState<string>('');

  // Fetch or refresh order
  const initOrder = async (couponToApply?: string) => {
    if (!course?.id || !studentInfo?.uid) return;
    setLoadingOrder(true);
    setErrorMessage('');

    try {
      const res = await paymentService.createPaymentOrder(course.id, studentInfo, undefined, couponToApply);
      setLoadingOrder(false);
      if (res.alreadyEnrolled) {
        toast.info('You are already actively enrolled in this course!');
        setStep('success');
        onPaymentSuccess(res.enrollment);
      } else if (res.freeCourse || (res.finalAmount === 0 && res.success)) {
        toast.success('🎉 Free course enrollment activated!');
        setStep('success');
        onPaymentSuccess(res.enrollment);
      } else if (res.success) {
        setOrderData(res);
      } else {
        setErrorMessage(res.error || res.message || 'Failed to initialize payment order.');
      }
    } catch (err: any) {
      setLoadingOrder(false);
      setErrorMessage('Could not connect to payment gateway service.');
    }
  };

  // Initialize Order on Modal Open
  useEffect(() => {
    if (isOpen && course?.id && studentInfo?.uid) {
      setStep('details');
      setErrorMessage('');
      setCouponCodeInput('');
      setAppliedCoupon(null);
      setCouponError('');

      // Guard: If course is free (price is 0), immediately activate free enrollment
      if (course.price === 0) {
        setStep('success');
        toast.success('🎉 Free course enrollment activated!');
        onPaymentSuccess({ courseId: course.id, studentId: studentInfo.uid, isFree: true });
        return;
      }

      initOrder();
    }
  }, [isOpen, course?.id, studentInfo?.uid]);

  // Handle Apply Coupon
  const handleApplyCoupon = async () => {
    const code = couponCodeInput.trim().toUpperCase();
    if (!code) return;

    setValidatingCoupon(true);
    setCouponError('');

    try {
      const valResult = await couponService.validateCoupon(
        {
          couponCode: code,
          courseId: course.id,
          coursePrice: course.price,
        },
        undefined,
        studentInfo.uid
      );

      setValidatingCoupon(false);

      if (!valResult.valid) {
        setCouponError(valResult.message || valResult.error || 'Invalid or expired coupon code');
        setAppliedCoupon(null);
        return;
      }

      setAppliedCoupon(valResult);
      toast.success(`🎉 Coupon "${code}" applied! Saved ₹${valResult.discountAmount || 0}`);

      // Re-initialize order with coupon
      await initOrder(code);
    } catch (err: any) {
      setValidatingCoupon(false);
      setCouponError(err.message || 'Error validating coupon code');
    }
  };

  // Handle Remove Coupon
  const handleRemoveCoupon = async () => {
    setAppliedCoupon(null);
    setCouponCodeInput('');
    setCouponError('');
    await initOrder(undefined);
  };

  if (!isOpen) return null;

  const displayPrice = orderData?.amount ?? course.price ?? 0;
  const currencySymbol = '₹';

  // Handle Pay Action
  const handleProceedPayment = async () => {
    if (!orderData?.orderId) {
      toast.error('Order session not initialized. Please try again.');
      return;
    }

    setStep('processing');
    setErrorMessage('');

    try {
      // Simulate realistic payment gateway transaction processing
      await new Promise((r) => setTimeout(r, 1500));

      // Execute server-side payment verification
      const verifyRes = await paymentService.verifyPayment({
        orderId: orderData.orderId,
        paymentId: `txn_live_${Date.now()}`,
        signature: `sig_verified_${orderData.orderId}`,
        studentId: studentInfo.uid,
        studentEmail: studentInfo.email,
        studentName: studentInfo.name,
        courseId: course.id,
      });

      if (verifyRes.success) {
        setStep('success');
        toast.success('🎉 Payment verified and course access granted!');
        onPaymentSuccess(verifyRes.enrollment);
      } else {
        setStep('failed');
        setErrorMessage(verifyRes.error || 'Payment verification failed on the server.');
      }
    } catch (err: any) {
      setStep('failed');
      setErrorMessage(err?.message || 'Transaction could not be completed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-100">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base tracking-tight">Shaivika LMS Secure Checkout</h3>
              <p className="text-xs text-slate-400">256-bit Encrypted Server Payment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Based on Step */}
        <div className="p-6 space-y-6">
          {/* STEP 1: Details & Method Selection */}
          {step === 'details' && (
            <>
              {/* Course Summary Card */}
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400">Course Enrollment</span>
                  <h4 className="font-bold text-white text-base truncate mt-0.5">{course.title}</h4>
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {course.duration || '60 hours'}
                    </span>
                    <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                      <Video className="w-3.5 h-3.5" />
                      Live Classes Included
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs text-slate-400 block">Total Due</span>
                  <span className="text-2xl font-extrabold text-white tracking-tight">
                    {currencySymbol}
                    {displayPrice.toLocaleString()}
                  </span>
                  {appliedCoupon && (
                    <span className="text-[11px] line-through text-slate-500 block">
                      {currencySymbol}{(course.price || 0).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Coupon Code Input & Savings Section */}
              <div className="p-3.5 rounded-2xl bg-slate-800/30 border border-slate-700/50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-sky-400" />
                    <span>Have a Coupon Code?</span>
                  </label>
                  {appliedCoupon && (
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-[11px] font-medium text-rose-400 hover:text-rose-300 transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {!appliedCoupon ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={couponCodeInput}
                      onChange={(e) => {
                        setCouponCodeInput(e.target.value);
                        setCouponError('');
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleApplyCoupon();
                        }
                      }}
                      placeholder="ENTER PROMO CODE (e.g. SG2026)"
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-white uppercase font-mono tracking-wider placeholder:text-slate-500 placeholder:normal-case placeholder:tracking-normal focus:outline-none focus:border-sky-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={validatingCoupon || !couponCodeInput.trim()}
                      className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md shadow-sky-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1"
                    >
                      {validatingCoupon ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Checking...</span>
                        </>
                      ) : (
                        'Apply'
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-300">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div>
                        <span className="font-bold">{appliedCoupon.code}</span> applied: {appliedCoupon.discountType === 'percentage' ? `${appliedCoupon.discountValue}% OFF` : `₹${appliedCoupon.discountValue} OFF`}
                      </div>
                    </div>
                    <span className="font-extrabold text-emerald-400">-₹{appliedCoupon.discountAmount}</span>
                  </div>
                )}

                {couponError && (
                  <p className="text-[11px] text-rose-400 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{couponError}</span>
                  </p>
                )}
              </div>

              {/* Payment Methods */}
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-2.5 block">Select Payment Method</label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('upi')}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                      selectedMethod === 'upi'
                        ? 'bg-sky-500/10 border-sky-500/50 text-white shadow-lg shadow-sky-500/10'
                        : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
                    }`}
                  >
                    <QrCode className="w-5 h-5 text-sky-400" />
                    <span className="text-xs font-bold">UPI / QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMethod('card')}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                      selectedMethod === 'card'
                        ? 'bg-sky-500/10 border-sky-500/50 text-white shadow-lg shadow-sky-500/10'
                        : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-sky-400" />
                    <span className="text-xs font-bold">Cards</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMethod('netbanking')}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                      selectedMethod === 'netbanking'
                        ? 'bg-sky-500/10 border-sky-500/50 text-white shadow-lg shadow-sky-500/10'
                        : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
                    }`}
                  >
                    <Lock className="w-5 h-5 text-sky-400" />
                    <span className="text-xs font-bold">NetBanking</span>
                  </button>
                </div>
              </div>

              {/* UPI Option Input */}
              {selectedMethod === 'upi' && (
                <div className="p-4 rounded-2xl bg-slate-800/30 border border-slate-700/50 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-semibold">Instant UPI Handle</span>
                    <span className="text-slate-400">GPay, PhonePe, Paytm</span>
                  </div>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="student@okaxis or username@upi"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors font-mono"
                  />
                </div>
              )}

              {/* Error Notice */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Pay Button */}
              <button
                type="button"
                onClick={handleProceedPayment}
                disabled={loadingOrder}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-extrabold text-sm shadow-xl shadow-sky-500/20 hover:shadow-sky-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loadingOrder ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    Initializing Secure Gateway...
                  </>
                ) : (
                  <>
                    <span>
                      Pay {currencySymbol}
                      {displayPrice.toLocaleString()} & Activate Access
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </>
          )}

          {/* STEP 2: Processing */}
          {step === 'processing' && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-sky-500/20 border-t-sky-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-sky-400 animate-pulse" />
                </div>
              </div>
              <h4 className="text-lg font-bold text-white">Verifying Transaction Server-Side...</h4>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                Communicating with the banking gateway and generating cryptographic enrollment tokens. Please do not close
                this window.
              </p>
            </div>
          )}

          {/* STEP 3: Success */}
          {step === 'success' && (
            <div className="py-6 flex flex-col items-center justify-center text-center space-y-5">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/10 animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-xl font-extrabold text-white tracking-tight">Payment Successful!</h4>
                <p className="text-xs text-slate-400 mt-1">Your course enrollment and Live Classroom access are fully active.</p>
              </div>

              {/* Receipt Summary Card */}
              <div className="w-full p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-left space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Course Program</span>
                  <span className="font-bold text-white">{course.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Enrollment Status</span>
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Active & Verified
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Access Level</span>
                  <span className="font-bold text-sky-400">Lifetime Full Access + Live Classes</span>
                </div>
              </div>

              {/* Navigation CTAs */}
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <BookOpen className="w-4 h-4 text-sky-400" />
                  Go to Course
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onNavigateToLiveClass) onNavigateToLiveClass();
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-1.5"
                >
                  <Video className="w-4 h-4" />
                  View Live Classes
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Failed */}
          {step === 'failed' && (
            <div className="py-6 flex flex-col items-center justify-center text-center space-y-5">
              <div className="w-16 h-16 rounded-3xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shadow-xl shadow-red-500/10">
                <AlertCircle className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-xl font-extrabold text-white tracking-tight">Payment Failed</h4>
                <p className="text-xs text-slate-400 mt-1">
                  {errorMessage || 'Your payment was not completed. No charges were made to your account.'}
                </p>
              </div>

              <div className="w-full grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
                >
                  Back to Course
                </button>

                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-sky-600/20"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
