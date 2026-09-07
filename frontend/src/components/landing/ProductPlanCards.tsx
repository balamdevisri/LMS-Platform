import React, { memo } from 'react';
import {
  Check,
  Zap,
  Sparkles,
  Crown,
  Flame,
  ArrowRight,
  ShieldCheck,
  Star,
  Layers
} from 'lucide-react';

export interface PricingPlan {
  name: string;
  price: string;
  originalPrice?: string;
  period: string;
  desc: string;
  features: string[];
  cta: string;
  popular: boolean;
  coursesCount: number;
  vipPass?: boolean;
  // CSS Ribbon configuration
  ribbon?: {
    text: string;
    styleType: 'corner' | 'draped';
    gradient: string;
    textColor: string;
    glowClass?: string;
    icon?: string;
  };
  perCourseCost?: string;
}

export const PRICING_PLANS_WITH_RIBBONS: PricingPlan[] = [
  {
    name: 'Starter (2 Courses)',
    price: '249',
    period: 'one-time',
    desc: 'Pick any 2 courses to kickstart your journey.',
    features: ['Lifetime Course Access', 'Verified Certificates Included', 'Self-Paced Practice Labs'],
    cta: 'Enroll Now',
    popular: false,
    coursesCount: 2,
    perCourseCost: '₹125 / course',
    ribbon: {
      text: 'STARTER',
      styleType: 'corner',
      gradient: 'bg-gradient-to-r from-slate-600 to-slate-700 dark:from-slate-700 dark:to-slate-800',
      textColor: 'text-slate-100',
    },
  },
  {
    name: 'Beginner (3 Courses)',
    price: '349',
    period: 'one-time',
    desc: 'Pick any 3 courses for a solid foundation.',
    features: ['Lifetime Course Access', 'Verified Certificates Included', 'Self-Paced Practice Labs'],
    cta: 'Enroll Now',
    popular: false,
    coursesCount: 3,
    perCourseCost: '₹116 / course',
    ribbon: {
      text: 'POPULAR',
      styleType: 'corner',
      gradient: 'bg-gradient-to-r from-emerald-600 to-teal-700',
      textColor: 'text-white',
      glowClass: 'shadow-emerald-500/30',
    },
  },
  {
    name: 'Career (5 Courses)',
    price: '449',
    period: 'one-time',
    desc: 'Best for comprehensive career preparation.',
    features: [
      'Lifetime Course Access',
      'Verified Certificates Included',
      'Priority Lab Access',
      'Portfolio Building Tools',
    ],
    cta: 'Enroll Now',
    popular: true,
    coursesCount: 5,
    perCourseCost: '₹90 / course',
    ribbon: {
      text: '★ MOST POPULAR ★',
      styleType: 'corner',
      gradient: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600',
      textColor: 'text-white font-black',
      glowClass: 'shadow-blue-500/40 ring-1 ring-blue-400/50',
    },
  },
  {
    name: 'Ultra Value (All 8 Courses)',
    price: '499',
    originalPrice: '1,999',
    period: 'one-time',
    desc: 'Unlock all 8 expert courses across our entire catalog.',
    features: [
      'All 8 Full Courses',
      'Lifetime Access & Updates',
      'All Verified Certificates',
      'Complete Practice Labs',
    ],
    cta: 'Enroll Now',
    popular: false,
    coursesCount: 8,
    vipPass: false,
    perCourseCost: 'Only ₹62 / course',
    ribbon: {
      text: '⚡ BEST VALUE ⚡',
      styleType: 'corner',
      gradient: 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500',
      textColor: 'text-slate-950 font-black',
      glowClass: 'shadow-amber-500/50 ring-1 ring-amber-300',
    },
  },
  {
    name: 'VIP 3-Month All-Access Pro Pass',
    price: '1,299',
    originalPrice: '2,999',
    period: '3 months',
    desc: 'ALL courses + Portfolio Builder + Resume Builder + Recruiter Suite.',
    features: [
      'All 8+ Expert Courses Unlocked',
      'Developer Portfolio & Vanity URL',
      'Resume Builder & PDF Export',
      'Auto-Import Verified Credentials',
      'Use Coupon VIP300 for ₹300 OFF (Final ₹999)',
    ],
    cta: 'Unlock VIP Pass',
    popular: false,
    coursesCount: 999,
    vipPass: true,
    ribbon: {
      text: '👑 VIP ALL-ACCESS PRO',
      styleType: 'draped',
      gradient: 'bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500',
      textColor: 'text-slate-950 font-black',
      glowClass: 'shadow-amber-500/60 ring-2 ring-amber-300/60',
    },
  },
];

interface ProductPlanCardsProps {
  onSelectPlan: (courses: { id: string; title: string }[], price: number) => void;
}

export const ProductPlanCards: React.FC<ProductPlanCardsProps> = ({ onSelectPlan }) => {
  const standardPlans = PRICING_PLANS_WITH_RIBBONS.filter((p) => !p.vipPass);
  const vipPlan = PRICING_PLANS_WITH_RIBBONS.find((p) => p.vipPass);

  return (
    <div className="space-y-12">
      {/* ── 1. 4-Column Grid: Standard Course Bundles ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
        {standardPlans.map((plan, idx) => {
          const isPopular = plan.popular;
          const isUltraValue = plan.coursesCount === 8;

          return (
            <div
              key={idx}
              className={`relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between overflow-hidden transition-all duration-300 backdrop-blur-xl group hover:-translate-y-2 hover:shadow-2xl ${
                isPopular
                  ? 'bg-white/95 dark:bg-[#111827]/95 border-2 border-blue-500 dark:border-blue-400 shadow-xl shadow-blue-500/10'
                  : isUltraValue
                  ? 'bg-white/95 dark:bg-[#111827]/95 border-2 border-amber-500 dark:border-amber-400 shadow-xl shadow-amber-500/10'
                  : 'bg-white/90 dark:bg-[#111827]/90 border border-slate-200/90 dark:border-slate-800/90 shadow-sm hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {/* ── CSS RIBBON: Corner Diagonal Ribbon ── */}
              {plan.ribbon && (
                <div className="plan-ribbon-wrapper">
                  <div
                    className={`plan-corner-ribbon ${plan.ribbon.gradient} ${plan.ribbon.textColor} ${
                      plan.ribbon.glowClass || ''
                    }`}
                  >
                    {plan.ribbon.text}
                  </div>
                </div>
              )}

              {/* Ambient Glow for highlighted cards */}
              {(isPopular || isUltraValue) && (
                <div
                  className={`pointer-events-none absolute -top-16 -right-16 w-44 h-44 rounded-full blur-3xl opacity-20 dark:opacity-25 transition-opacity ${
                    isPopular ? 'bg-blue-500' : 'bg-amber-500'
                  }`}
                />
              )}

              {/* Card Body */}
              <div className="space-y-5 z-10">
                {/* Plan Header */}
                <div className="space-y-2 pr-12">
                  <h3 className="font-extrabold text-base sm:text-lg text-[#0f172a] dark:text-[#ffffff] leading-tight">
                    {plan.name}
                  </h3>

                  {/* Per Course Value Tag */}
                  {plan.perCourseCost && (
                    <span
                      className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        isUltraValue
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                          : isPopular
                          ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {plan.perCourseCost}
                    </span>
                  )}
                </div>

                {/* Price Display */}
                <div className="flex items-baseline gap-1.5 pt-1">
                  <span className="text-sm font-black text-slate-500 dark:text-slate-400">₹</span>
                  <span className="text-3xl sm:text-4xl font-black text-[#0f172a] dark:text-[#ffffff] tracking-tight">
                    {plan.price}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    /{plan.period}
                  </span>
                  {plan.originalPrice && (
                    <span className="text-xs line-through text-slate-400 dark:text-slate-500 ml-1.5 font-semibold">
                      ₹{plan.originalPrice}
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#475569] dark:text-[#94a3b8] leading-relaxed font-normal min-h-[36px]">
                  {plan.desc}
                </p>

                {/* Features Checklist */}
                <ul className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-xs text-[#0f172a] dark:text-[#ffffff] font-medium">
                  {plan.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          isUltraValue
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                            : isPopular
                            ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span className="leading-tight">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <div className="pt-6 z-10">
                <button
                  type="button"
                  onClick={() =>
                    onSelectPlan(
                      [{ id: `bundle-${plan.coursesCount}`, title: plan.name }],
                      Number(String(plan.price).replace(/,/g, ''))
                    )
                  }
                  className={`w-full py-3 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer shadow-sm active:scale-98 ${
                    isPopular
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25'
                      : isUltraValue
                      ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-500/25 font-black'
                      : 'bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#0f172a] dark:text-[#ffffff] border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span>{plan.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Bottom Subtle Gradient Accent Line */}
              <div
                className="absolute bottom-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  background: isUltraValue
                    ? 'linear-gradient(to right, transparent, #F59E0B, transparent)'
                    : isPopular
                    ? 'linear-gradient(to right, transparent, #2563EB, transparent)'
                    : 'linear-gradient(to right, transparent, #64748B, transparent)',
                }}
              />
            </div>
          );
        })}
      </div>

      {/* ── 2. VIP All-Access Pro Pass Card with Draped 3D CSS Ribbon ── */}
      {vipPlan && (
        <div className="relative rounded-3xl p-8 sm:p-10 border-2 border-amber-500/40 bg-gradient-to-br from-slate-950 via-[#0d1322] to-slate-950 text-white shadow-2xl overflow-hidden group transition-all duration-300 hover:border-amber-500/60">
          {/* ── CSS RIBBON: Top Draped 3D Hanging Bookmark Ribbon ── */}
          {vipPlan.ribbon && (
            <div
              className={`plan-draped-ribbon ${vipPlan.ribbon.gradient} ${vipPlan.ribbon.textColor} ${
                vipPlan.ribbon.glowClass || ''
              }`}
            >
              {vipPlan.ribbon.text}
            </div>
          )}

          {/* Ambient Gold Radial Glow Behind Card */}
          <div className="pointer-events-none absolute top-0 right-1/4 w-80 h-80 rounded-full bg-amber-500/15 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-10 w-60 h-60 rounded-full bg-yellow-500/10 blur-3xl" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 sm:gap-10">
            {/* Left Content */}
            <div className="space-y-4 max-w-xl text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-extrabold tracking-widest uppercase">
                <Crown className="w-3.5 h-3.5 fill-amber-400" />
                <span>EXCLUSIVE ALL-ACCESS PASS</span>
              </div>

              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight font-heading">
                {vipPlan.name}
              </h3>

              <div className="flex items-baseline gap-2 justify-center lg:justify-start">
                <span className="text-lg text-amber-300 font-bold">₹</span>
                <span className="text-4xl sm:text-5xl font-black text-amber-400 tracking-tight">
                  {vipPlan.price}
                </span>
                <span className="text-xs text-slate-400 font-medium">/{vipPlan.period}</span>
                {vipPlan.originalPrice && (
                  <span className="text-sm line-through text-slate-500 font-semibold ml-2">
                    ₹{vipPlan.originalPrice}
                  </span>
                )}
                <span className="ml-2 text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
                  SAVE ₹1,700
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                {vipPlan.desc}
              </p>
            </div>

            {/* Right Features & VIP CTA */}
            <div className="space-y-6 w-full lg:w-auto">
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-200 font-medium">
                {vipPlan.features.map((feat, fIdx) => (
                  <li key={fIdx} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 text-amber-400 stroke-[3]" />
                    </div>
                    <span className="font-semibold">{feat}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    onSelectPlan(
                      [{ id: 'vip_pass_3m', title: vipPlan.name }],
                      1299
                    )
                  }
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all cursor-pointer active:scale-98"
                >
                  <Crown className="w-4 h-4 fill-slate-950" />
                  <span>{vipPlan.cta}</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>

                <span className="text-[11px] text-amber-300/80 font-medium">
                  Instant activation upon enrollment
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(ProductPlanCards);
