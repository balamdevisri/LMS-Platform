import React from 'react';
import { CreditCard, History, Zap, CheckCircle2, AlertCircle, ArrowUpRight, Download, Receipt, Plus } from 'lucide-react';

export const SubscriptionSettings: React.FC = () => {
  // Mock data for UI presentation
  const subscriptionPlans = [
    {
      id: 'plan_pro',
      name: 'Scholar PRO',
      status: 'active',
      price: '₹1499/mo',
      nextBilling: 'Oct 15, 2026',
      features: ['Unlimited Course Access', 'Resume Builder', 'Live Premium Classes', 'Priority Support'],
    },
  ];

  const transactionHistory = [
    { id: 'txn_1092', date: 'Sep 15, 2026', amount: '₹1499', plan: 'Scholar PRO - Monthly', status: 'completed' },
    { id: 'txn_1091', date: 'Aug 15, 2026', amount: '₹1499', plan: 'Scholar PRO - Monthly', status: 'completed' },
    { id: 'txn_1090', date: 'Jul 15, 2026', amount: '₹1499', plan: 'Scholar PRO - Monthly', status: 'completed' },
    { id: 'txn_1089', date: 'Jun 15, 2026', amount: '₹1499', plan: 'Scholar PRO - Monthly', status: 'failed' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Current Subscription Section */}
        <div className="lg:col-span-8 space-y-6">
          <h2 className="font-heading font-extrabold text-xl text-slate-900 dark:text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            Active Subscription
          </h2>
          
          {subscriptionPlans.map(plan => (
            <div key={plan.id} className="relative bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 overflow-hidden shadow-xl shadow-indigo-900/20 border border-indigo-500/30">
              {/* Decorative Background Elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-3xl rounded-full translate-x-1/3 -translate-y-1/4 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 blur-3xl rounded-full -translate-x-1/3 translate-y-1/4 pointer-events-none" />
              
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="bg-amber-400 text-amber-950 text-[10px] font-extrabold uppercase px-2 py-1 rounded-md tracking-widest shadow-lg shadow-amber-400/20">
                      PRO TIER
                    </span>
                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      ACTIVE
                    </span>
                  </div>
                  
                  <div>
                    <h3 className="font-heading font-extrabold text-3xl text-white tracking-tight">{plan.name}</h3>
                    <p className="text-indigo-200 mt-1 font-medium text-sm">Next billing date: <span className="text-white font-bold">{plan.nextBilling}</span></p>
                  </div>

                  <div className="pt-2">
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-xs text-indigo-100 font-medium">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          {feat}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex flex-col items-start md:items-end gap-4 bg-white/5 p-5 rounded-2xl border border-white/10 backdrop-blur-md w-full md:w-auto shrink-0">
                  <div className="text-left md:text-right">
                    <span className="text-xs text-indigo-200 font-bold uppercase tracking-wider block mb-1">Plan Amount</span>
                    <div className="text-3xl font-heading font-black text-white">{plan.price}</div>
                  </div>
                  <button className="w-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs py-2.5 px-6 rounded-xl border border-white/20 transition-colors shadow-lg cursor-pointer">
                    Manage Plan
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Transaction History Section */}
          <div className="pt-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-extrabold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-500" />
                Transaction History
              </h2>
              <button className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 cursor-pointer">
                <Download className="w-4 h-4" /> Download All
              </button>
            </div>
            
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-zinc-800/50 border-b border-slate-200 dark:border-zinc-800">
                      <th className="py-4 px-6 text-xs font-extrabold text-slate-500 dark:text-zinc-400 uppercase tracking-widest">Transaction</th>
                      <th className="py-4 px-6 text-xs font-extrabold text-slate-500 dark:text-zinc-400 uppercase tracking-widest">Date</th>
                      <th className="py-4 px-6 text-xs font-extrabold text-slate-500 dark:text-zinc-400 uppercase tracking-widest">Amount</th>
                      <th className="py-4 px-6 text-xs font-extrabold text-slate-500 dark:text-zinc-400 uppercase tracking-widest">Status</th>
                      <th className="py-4 px-6 text-xs font-extrabold text-slate-500 dark:text-zinc-400 uppercase tracking-widest text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                    {transactionHistory.map(txn => (
                      <tr key={txn.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/50">
                              <CreditCard className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-bold text-sm text-slate-900 dark:text-zinc-100">{txn.plan}</p>
                              <p className="text-[10px] font-mono text-slate-400">{txn.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-xs font-medium text-slate-600 dark:text-zinc-300">{txn.date}</td>
                        <td className="py-4 px-6 text-sm font-bold text-slate-900 dark:text-zinc-100">{txn.amount}</td>
                        <td className="py-4 px-6">
                          {txn.status === 'completed' ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
                              <CheckCircle2 className="w-3 h-3" /> Paid
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
                              <AlertCircle className="w-3 h-3" /> Failed
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer inline-block" title="Download Receipt">
                            <Receipt className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Widgets (Payment Methods & Support) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-slate-200 dark:border-zinc-800 shadow-xs">
            <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <CreditCard className="w-4 h-4 text-indigo-500" />
              Payment Methods
            </h3>
            
            <div className="space-y-3">
              <div className="p-4 rounded-2xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-6 bg-slate-800 rounded flex items-center justify-center text-[10px] font-extrabold text-white tracking-widest shadow-sm">
                    VISA
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-zinc-100">•••• 4242</p>
                    <p className="text-[10px] text-slate-500">Expires 12/28</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Default</span>
              </div>
              
              <button className="w-full py-3 rounded-xl border border-dashed border-slate-300 dark:border-zinc-700 text-xs font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-zinc-100 transition-colors flex items-center justify-center gap-2 cursor-pointer">
                <Plus className="w-4 h-4" /> Add Payment Method
              </button>
            </div>
          </div>

          <div className="bg-linear-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20 rounded-3xl p-6 border border-indigo-100 dark:border-indigo-900/30">
            <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white mb-2">Need help with billing?</h3>
            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed mb-4">
              If you have questions about your subscription, failed charges, or want to request a refund, our support team is available 24/7.
            </p>
            <button className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:text-indigo-700 cursor-pointer">
              Contact Billing Support <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
