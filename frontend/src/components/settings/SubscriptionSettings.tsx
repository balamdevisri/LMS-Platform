import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  History,
  Zap,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  Download,
  Receipt,
  Plus,
  QrCode,
  Smartphone,
  Check,
  X,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/config/api';
import { toast } from 'sonner';

interface Transaction {
  id: string;
  orderId?: string;
  transactionId?: string;
  plan?: string;
  courseTitle?: string;
  date?: string;
  paidAt?: string;
  createdAt?: string;
  amount: number | string;
  currency?: string;
  status: string;
  paymentMethod?: string;
}

export const SubscriptionSettings: React.FC = () => {
  const { user, userProfile } = useAuth();
  const userId = userProfile?.uid || user?.uid || 'default_student';

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState<boolean>(true);
  const [upiModalOpen, setUpiModalOpen] = useState(false);
  const [newUpiId, setNewUpiId] = useState('');
  const [savedUpiList, setSavedUpiList] = useState<string[]>(() => {
    const cached = localStorage.getItem('shaivika_saved_upi_ids');
    if (cached) return JSON.parse(cached);
    return ['shaivika.student@okhdfcbank', 'scholar@upi'];
  });
  const [activePaymentMethod, setActivePaymentMethod] = useState<'upi' | 'card'>('upi');
  const [qrModalOpen, setQrModalOpen] = useState(false);

  // Fetch real payment transactions from backend & Firestore
  useEffect(() => {
    if (!userId) return;
    setLoadingTransactions(true);

    const fetchHistory = async () => {
      try {
        let token: string | null = null;
        if (user) {
          try {
            token = await user.getIdToken();
          } catch {}
        }

        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${API_BASE_URL}/payments/history?studentId=${userId}`, { headers });
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            setTransactions(json.data);
          }
        }
      } catch (err) {
        console.warn('[SubscriptionSettings] Error loading payments history:', err);
      } finally {
        setLoadingTransactions(false);
      }
    };

    fetchHistory();
  }, [userId, user]);

  const handleAddUpi = () => {
    const trimmed = newUpiId.trim();
    if (!trimmed || !trimmed.includes('@')) {
      toast.error('Please enter a valid UPI ID (e.g. yourname@okhdfcbank or mobile@paytm)');
      return;
    }

    if (savedUpiList.includes(trimmed)) {
      toast.info('UPI ID is already saved.');
      return;
    }

    const updated = [...savedUpiList, trimmed];
    setSavedUpiList(updated);
    localStorage.setItem('shaivika_saved_upi_ids', JSON.stringify(updated));
    setNewUpiId('');
    setUpiModalOpen(false);
    toast.success('✅ UPI ID linked successfully!');
  };

  const handleRemoveUpi = (idToRemove: string) => {
    const updated = savedUpiList.filter(id => id !== idToRemove);
    setSavedUpiList(updated);
    localStorage.setItem('shaivika_saved_upi_ids', JSON.stringify(updated));
    toast.info('UPI ID removed.');
  };

  // Mock Active Plan info (or dynamically based on enrolled tracks)
  const currentPlan = {
    id: 'plan_pro',
    name: 'Shaivika Scholar PRO',
    status: 'ACTIVE',
    price: '₹1,499 / yr',
    features: [
      'Unlimited Enterprise Courses',
      'AI Practice Sandbox Lab & Terminal',
      'Verified Certificates with QR Verification',
      'Portfolio & Resume Cloud Publishing',
      'Live Masterclasses & Mentorship Access'
    ],
  };

  return (
    <div className="space-y-8 font-sans text-slate-800 dark:text-zinc-100 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Active Subscription & Real-Time Transactions */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Active Subscription Banner */}
          <div className="space-y-4">
            <h2 className="font-heading font-extrabold text-xl text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <span>Platform Membership & Plan</span>
            </h2>
            
            <div className="relative bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 rounded-3xl p-6 sm:p-8 overflow-hidden shadow-xl shadow-indigo-950/30 border border-indigo-500/30 text-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none" />
              
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-3.5">
                  <div className="flex items-center gap-3">
                    <span className="bg-amber-400 text-amber-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md tracking-wider shadow-md">
                      SCHOLAR ALL-ACCESS
                    </span>
                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      ACTIVE
                    </span>
                  </div>
                  
                  <div>
                    <h3 className="font-heading font-black text-2xl sm:text-3xl text-white tracking-tight">{currentPlan.name}</h3>
                    <p className="text-indigo-200 mt-1 font-medium text-xs">
                      Official student access grant for <span className="text-white font-bold">{userProfile?.name || user?.displayName || 'Student Scholar'}</span>
                    </p>
                  </div>

                  <div className="pt-2">
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {currentPlan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-xs text-indigo-100 font-medium">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex flex-col items-start md:items-end gap-3 bg-white/5 p-5 rounded-2xl border border-white/10 backdrop-blur-md w-full md:w-auto shrink-0">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] text-indigo-200 font-bold uppercase tracking-wider block mb-0.5">Subscription Value</span>
                    <div className="text-2xl sm:text-3xl font-heading font-black text-amber-300 font-mono">{currentPlan.price}</div>
                  </div>
                  <button
                    onClick={() => setQrModalOpen(true)}
                    className="w-full bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-amber-950 font-black text-xs py-2.5 px-5 rounded-xl transition-all shadow-lg shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Pay with UPI</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Real-Time Transaction History Section */}
          <div className="pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading font-extrabold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-indigo-500" />
                  <span>Real-Time Payment History</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  Authoritative transaction logs synced with backend database & payment gateways.
                </p>
              </div>
            </div>
            
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-zinc-800/50 border-b border-slate-200 dark:border-zinc-800">
                      <th className="py-3.5 px-6 text-[10px] font-extrabold text-slate-500 dark:text-zinc-400 uppercase tracking-widest">Order / Plan</th>
                      <th className="py-3.5 px-6 text-[10px] font-extrabold text-slate-500 dark:text-zinc-400 uppercase tracking-widest">Method</th>
                      <th className="py-3.5 px-6 text-[10px] font-extrabold text-slate-500 dark:text-zinc-400 uppercase tracking-widest">Date</th>
                      <th className="py-3.5 px-6 text-[10px] font-extrabold text-slate-500 dark:text-zinc-400 uppercase tracking-widest">Amount</th>
                      <th className="py-3.5 px-6 text-[10px] font-extrabold text-slate-500 dark:text-zinc-400 uppercase tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs">
                    {loadingTransactions ? (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-slate-400">
                          <RefreshCw className="w-5 h-5 animate-spin mx-auto text-indigo-500 mb-2" />
                          <span>Loading real-time transactions...</span>
                        </td>
                      </tr>
                    ) : transactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400 dark:text-slate-500 font-medium">
                          <div className="max-w-xs mx-auto space-y-1">
                            <Receipt className="w-8 h-8 mx-auto text-slate-300 dark:text-zinc-700" />
                            <p className="font-bold text-slate-700 dark:text-zinc-300">No Payment Records Yet</p>
                            <p className="text-[11px] text-slate-400">Your enrollment fees and subscription orders will display here with live status and invoices.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      transactions.map((txn, idx) => (
                        <tr key={txn.id || idx} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/50">
                                <Receipt className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 dark:text-zinc-100">{txn.courseTitle || txn.plan || 'Scholar Track Access'}</p>
                                <p className="text-[10px] font-mono text-slate-400">{txn.transactionId || txn.orderId || txn.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-slate-600 dark:text-zinc-300 font-medium">
                            <span className="inline-flex items-center gap-1 text-[11px] bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                              <Smartphone className="w-3 h-3 text-cyan-500" />
                              {txn.paymentMethod || 'UPI Instant'}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-slate-600 dark:text-zinc-300 text-xs">
                            {txn.paidAt ? new Date(txn.paidAt).toLocaleDateString() : (txn.date || new Date().toLocaleDateString())}
                          </td>
                          <td className="py-4 px-6 font-bold text-slate-900 dark:text-zinc-100 font-mono">
                            ₹{typeof txn.amount === 'number' ? txn.amount.toLocaleString() : txn.amount}
                          </td>
                          <td className="py-4 px-6">
                            {String(txn.status).toUpperCase() === 'SUCCESS' || String(txn.status).toUpperCase() === 'COMPLETED' ? (
                              <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider">
                                <CheckCircle2 className="w-3 h-3" /> Paid
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider">
                                <AlertCircle className="w-3 h-3" /> {txn.status}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Payment Methods (UPI & Card) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4">
            <h3 className="font-heading font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-indigo-500" />
              <span>UPI & Payment Methods</span>
            </h3>

            {/* UPI Option Card */}
            <div className="space-y-3">
              <div className="p-4 rounded-2xl border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/50 dark:bg-indigo-950/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-xs">
                      UPI
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">UPI Payment (GPay / PhonePe / Paytm)</h4>
                      <p className="text-[10px] text-slate-500">Zero surcharge instant bank transfer</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full uppercase">
                    Preferred
                  </span>
                </div>

                {/* Saved UPI IDs */}
                <div className="space-y-1.5 pt-1">
                  {savedUpiList.map((upi, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white dark:bg-zinc-900 p-2 rounded-xl border border-indigo-100 dark:border-indigo-900/60 text-xs">
                      <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">{upi}</span>
                      <button
                        onClick={() => handleRemoveUpi(upi)}
                        className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                        title="Remove UPI ID"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setUpiModalOpen(true)}
                    className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Link New UPI ID</span>
                  </button>
                  <button
                    onClick={() => setQrModalOpen(true)}
                    className="p-2 rounded-xl bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer"
                    title="View UPI QR Code"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Card Backup Method */}
              <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-6 bg-slate-800 rounded flex items-center justify-center text-[9px] font-extrabold text-white tracking-widest shadow-xs">
                    VISA
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-zinc-100">Debit / Credit Cards</p>
                    <p className="text-[10px] text-slate-500">RuPay, Visa, Mastercard</p>
                  </div>
                </div>
                <CreditCard className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Support Widget */}
          <div className="bg-linear-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 rounded-3xl p-6 border border-indigo-100 dark:border-indigo-900/40 space-y-2">
            <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-500" />
              <span>Billing & Payments Support</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
              Have questions about UPI payments or course subscriptions? Our financial support team is available 24/7.
            </p>
            <a
              href="mailto:support@shaivika.ai"
              className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-cyan-400 hover:underline pt-1"
            >
              <span>Contact Billing Desk</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

      </div>

      {/* ── Link UPI ID Modal ────────────────────────────────────────────── */}
      {upiModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-heading font-black text-lg text-white flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-indigo-400" />
                Link UPI Payment Method
              </h3>
              <button
                onClick={() => setUpiModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              Enter your Virtual Payment Address (VPA) / UPI ID linked to Google Pay, PhonePe, Paytm, or BHIM.
            </p>

            <div className="space-y-2">
              <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">UPI ID / VPA</label>
              <input
                type="text"
                placeholder="e.g. 9876543210@paytm or yourname@okhdfcbank"
                value={newUpiId}
                onChange={(e) => setNewUpiId(e.target.value)}
                className="w-full p-3 text-xs bg-slate-950 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-white placeholder:text-slate-500"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setUpiModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUpi}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer shadow-md shadow-indigo-600/30"
              >
                Save & Link UPI
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── UPI QR Code Modal ────────────────────────────────────────────── */}
      {qrModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl space-y-5 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-left">
              <h3 className="font-heading font-black text-base text-white flex items-center gap-2">
                <QrCode className="w-5 h-5 text-amber-400" />
                Scan & Pay via UPI
              </h3>
              <button
                onClick={() => setQrModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-white rounded-2xl inline-block shadow-lg mx-auto">
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=shaivika.academy@okhdfcbank%26pn=Shaivika%20AI%20Foundation%26cu=INR"
                alt="UPI QR Code"
                className="w-44 h-44 object-contain mx-auto"
              />
            </div>

            <div className="space-y-1">
              <p className="text-xs font-extrabold text-white">Shaivika AI Foundation Official UPI</p>
              <p className="text-[11px] font-mono text-cyan-300 font-bold">shaivika.academy@okhdfcbank</p>
              <p className="text-[10px] text-slate-400 pt-1">Scan using any UPI App (GPay, PhonePe, Paytm, BHIM, Amazon Pay)</p>
            </div>

            <button
              onClick={() => {
                setQrModalOpen(false);
                toast.success('Payment instruction acknowledged.');
              }}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
