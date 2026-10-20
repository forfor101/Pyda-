import React from 'react';
import { ShieldCheck, Fuel, Lock, CheckCircle2, AlertCircle } from 'lucide-react';

interface TrustFixedPriceBannerProps {
  className?: string;
  compact?: boolean;
}

export const TrustFixedPriceBanner: React.FC<TrustFixedPriceBannerProps> = ({
  className = '',
  compact = false,
}) => {
  if (compact) {
    return (
      <div
        className={`bg-gradient-to-r from-amber-500/15 via-slate-900 to-amber-500/10 border border-amber-500/40 rounded-xl p-3 text-xs shadow-md ${className}`}
      >
        <div className="flex items-start gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
            <Lock className="w-3.5 h-3.5" />
          </div>
          <div className="space-y-1">
            <p className="font-extrabold text-amber-300 flex items-center gap-1.5 text-xs">
              <span>Fixed-Price Guarantee:</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">
                Zero Move-Day Surprises
              </span>
            </p>
            <p className="text-[11px] text-slate-300 leading-snug">
              Due to recent fuel price changes, all instant estimates cover end-to-end transit, Goods-in-Transit insurance, and gate clearance fees. <strong>Your quoted price on booking will not change on move day.</strong>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-gradient-to-r from-amber-950/40 via-slate-950 to-slate-900 border-2 border-amber-500/40 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden ${className}`}
    >
      {/* Background Subtle Accent Glow */}
      <div className="absolute -top-12 -right-12 w-44 h-44 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
            <Lock className="w-6 h-6 stroke-[2.2]" />
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
                Fixed-Price Guarantee
              </span>
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Price Locked on Booking
              </span>
              <span className="bg-amber-500/20 text-amber-300 text-[10px] font-mono px-2 py-0.5 rounded-full border border-amber-500/30">
                Fuel Adjusted @ ₦1,460/L
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-3xl">
              Due to recent fuel price changes, all instant estimates cover end-to-end transit, Goods-in-Transit insurance, and gate clearance fees. <strong>Your quoted price on booking will not change on move day.</strong>
            </p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-[11px] text-slate-400 font-medium">
              <span className="flex items-center gap-1 text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                100% Goods-in-Transit Protection Included
              </span>
              <span className="hidden sm:inline text-slate-600">•</span>
              <span className="flex items-center gap-1 text-slate-300">
                <Fuel className="w-3.5 h-3.5 text-amber-400" />
                Baseline Petrol (₦1,460/L) & Diesel (₦1,850/L)
              </span>
              <span className="hidden sm:inline text-slate-600">•</span>
              <span className="flex items-center gap-1 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                All Highway Tolls & LGA Levies Pre-Cleared
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
