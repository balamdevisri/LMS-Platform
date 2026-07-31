import React from 'react';
import { BrandLogo } from '@/components/common/BrandLogo';
import { VerifyEmailCard } from '@/components/auth/VerifyEmailCard';

export const VerifyEmail: React.FC = () => {
  return (
    <div className="space-y-6 bg-white/95 backdrop-blur-2xl p-6 sm:p-8 rounded-3xl border border-sky-200 shadow-2xl shadow-sky-500/15 text-slate-900 font-['Sora'] text-center">
      {/* Mobile Brand Logo */}
      <div className="lg:hidden flex justify-center pb-2">
        <BrandLogo size="md" showSubtitle={true} />
      </div>

      <VerifyEmailCard />
    </div>
  );
};

export default VerifyEmail;
