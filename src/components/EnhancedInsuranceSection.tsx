import React from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  FileText,
  Sparkles,
  Info,
  Award,
  Zap,
  Check,
  ExternalLink,
} from 'lucide-react';
import { InsuranceCoverageTier } from '../types';

interface EnhancedInsuranceSectionProps {
  needsInsurance: boolean;
  insuranceTier: InsuranceCoverageTier;
  onToggleEnhanced: (enabled: boolean) => void;
  onSelectTier: (tier: InsuranceCoverageTier) => void;
  onOpenTerms: () => void;
  className?: string;
}

export const EnhancedInsuranceSection: React.FC<EnhancedInsuranceSectionProps> = ({
  needsInsurance,
  insuranceTier,
  onToggleEnhanced,
  onSelectTier,
  onOpenTerms,
  className = '',
}) => {
  // Enhanced is considered active if needsInsurance is true and tier is standard or premium
  const isEnhancedActive = needsInsurance && insuranceTier !== 'basic';
  const effectiveTier: InsuranceCoverageTier = !needsInsurance ? 'basic' : insuranceTier;

  const handleToggle = () => {
    if (isEnhancedActive) {
      // Turn off enhanced coverage -> fallback to basic
      onToggleEnhanced(false);
      onSelectTier('basic');
    } else {
      // Turn on enhanced coverage -> default to standard
      onToggleEnhanced(true);
      onSelectTier('standard');
    }
  };

  return (
    <div
      className={`bg-[#0a1f12]/90 border border-emerald-900/60 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl transition-all ${
        isEnhancedActive ? 'border-[#83b735]/60 ring-1 ring-[#83b735]/30 bg-[#0f2e1b]/70' : ''
      } ${className}`}
    >
      {/* HEADER & TOGGLE ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-900/50">
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
              isEnhancedActive
                ? 'bg-[#15652e]/40 text-[#83b735] border border-[#83b735]/50'
                : 'bg-slate-900 text-slate-400 border border-slate-800'
            }`}
          >
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-extrabold text-white text-sm tracking-tight">
                Enhanced Insurance Coverage
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                Leadway & AIICO Backed
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
              Accidental damage, transit shock, rollover & theft protection underwritten by Leadway Assurance & AIICO Consortium.
            </p>
          </div>
        </div>

        {/* TOGGLE SWITCH & VIEW TERMS BUTTON */}
        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
          <button
            type="button"
            onClick={onOpenTerms}
            className="text-[11px] font-bold text-[#fed700] hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#fed700]/40 bg-[#fed700]/10 hover:bg-[#fed700]/20 transition-all active:scale-95"
            title="View Goods-In-Transit Terms and Conditions"
            id="view-insurance-terms-btn"
          >
            <FileText className="w-3.5 h-3.5 text-[#fed700]" />
            <span>View Terms</span>
          </button>

          {/* Accessible Switch Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-200 hidden sm:inline">
              {isEnhancedActive ? 'Enhanced Active' : 'Basic Carrier'}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={isEnhancedActive}
              onClick={handleToggle}
              className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#83b735] focus:ring-offset-2 focus:ring-offset-[#0a1f12] cursor-pointer ${
                isEnhancedActive ? 'bg-[#83b735]' : 'bg-slate-800'
              }`}
              id="enhanced-insurance-toggle"
              aria-label="Toggle Enhanced Insurance Coverage"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-slate-950 transition-transform ${
                  isEnhancedActive ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* TIERED PROTECTION OPTIONS CARDS (Basic, Standard, Premium) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="font-semibold text-slate-300">Select Protection Plan:</span>
          <span className="text-[10px] text-slate-400">Click any card to select tier</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* TIER 1: BASIC */}
          <div
            onClick={() => {
              onToggleEnhanced(false);
              onSelectTier('basic');
            }}
            className={`relative p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
              effectiveTier === 'basic'
                ? 'bg-[#0f2e1b]/80 border-emerald-600/70 ring-1 ring-emerald-500/50 shadow-md'
                : 'bg-[#0a1f12]/60 border-emerald-950/80 hover:border-emerald-800/80 hover:bg-[#0f2e1b]/40'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-xs font-black text-white">Basic Protection</span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                  STATUTORY
                </span>
              </div>

              <div className="mb-2">
                <span className="text-base font-black text-emerald-400">₦0</span>
                <span className="text-[10px] text-slate-400 ml-1">Included Free</span>
              </div>

              <div className="space-y-1 text-[10.5px] text-slate-300 mb-3">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span><strong>₦1,000 / kg</strong> limited weight liability</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span>₦25,000 statutory deductible</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span>Standard 14–21 day claims review</span>
                </div>
                <div className="flex items-center gap-1.5 text-rose-400/90 text-[10px]">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Fragiles & electronics excluded</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-emerald-900/60 flex items-center justify-between text-[11px]">
              <span className="text-slate-400 text-[10px]">Default Carrier Cover</span>
              <span
                className={`font-bold flex items-center gap-1 text-[10.5px] ${
                  effectiveTier === 'basic' ? 'text-emerald-400' : 'text-slate-500'
                }`}
              >
                {effectiveTier === 'basic' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Selected</span>
                  </>
                ) : (
                  <span>Select Basic</span>
                )}
              </span>
            </div>
          </div>

          {/* TIER 2: STANDARD (RECOMMENDED) */}
          <div
            onClick={() => {
              onToggleEnhanced(true);
              onSelectTier('standard');
            }}
            className={`relative p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
              effectiveTier === 'standard'
                ? 'bg-[#0f2e1b] border-[#83b735] ring-2 ring-[#83b735]/40 shadow-lg shadow-[#83b735]/15'
                : 'bg-[#0a1f12]/60 border-emerald-950/80 hover:border-[#83b735]/50 hover:bg-[#0f2e1b]/40'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-xs font-black text-[#83b735]">Standard All-Risk</span>
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-[#83b735] text-slate-950">
                  MOST POPULAR
                </span>
              </div>

              <div className="mb-2">
                <span className="text-base font-black text-[#fed700]">₦45,000</span>
                <span className="text-[10px] text-slate-300 ml-1">Flat Rate</span>
              </div>

              <div className="space-y-1 text-[10.5px] text-slate-300 mb-3">
                <div className="flex items-center gap-1.5 text-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-[#83b735] shrink-0" />
                  <span><strong>Up to ₦25,000,000</strong> All-Risk Cover</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <CheckCircle2 className="w-3 h-3 text-[#83b735] shrink-0" />
                  <span>Underwritten by Leadway & AIICO</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <CheckCircle2 className="w-3 h-3 text-[#83b735] shrink-0" />
                  <span>TVs, appliances, furniture & glass</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <CheckCircle2 className="w-3 h-3 text-[#83b735] shrink-0" />
                  <span>5–7 business days claim SLA (₦15k ded.)</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-emerald-900/60 flex items-center justify-between text-[11px]">
              <span className="text-[#83b735] text-[10px] font-bold">Recommended</span>
              <span
                className={`font-black flex items-center gap-1 text-[10.5px] ${
                  effectiveTier === 'standard' ? 'text-[#83b735]' : 'text-slate-400'
                }`}
              >
                {effectiveTier === 'standard' ? (
                  <>
                    <Check className="w-3 h-3 text-[#83b735]" />
                    <span>Selected</span>
                  </>
                ) : (
                  <span>Select (₦45k)</span>
                )}
              </span>
            </div>
          </div>

          {/* TIER 3: PREMIUM VIP */}
          <div
            onClick={() => {
              onToggleEnhanced(true);
              onSelectTier('premium');
            }}
            className={`relative p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
              effectiveTier === 'premium'
                ? 'bg-[#0f2e1b] border-[#fed700] ring-2 ring-[#fed700]/40 shadow-lg shadow-[#fed700]/15'
                : 'bg-[#0a1f12]/60 border-emerald-950/80 hover:border-[#fed700]/50 hover:bg-[#0f2e1b]/40'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-xs font-black text-[#fed700]">Premium VIP</span>
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-[#fed700] text-slate-950">
                  ZERO DEDUCTIBLE
                </span>
              </div>

              <div className="mb-2">
                <span className="text-base font-black text-[#fed700]">₦95,000</span>
                <span className="text-[10px] text-slate-300 ml-1">Flat Rate</span>
              </div>

              <div className="space-y-1 text-[10.5px] text-slate-300 mb-3">
                <div className="flex items-center gap-1.5 text-amber-200">
                  <Sparkles className="w-3 h-3 text-[#fed700] shrink-0" />
                  <span><strong>Up to ₦75,000,000</strong> Full Replacement</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-300 font-bold">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>₦0 Deductible Guarantee</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Zap className="w-3 h-3 text-[#fed700] shrink-0" />
                  <span>24–48 Hours Fast-Track Concierge</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <CheckCircle2 className="w-3 h-3 text-[#83b735] shrink-0" />
                  <span>Servers, fine art & fragile crating</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-emerald-900/60 flex items-center justify-between text-[11px]">
              <span className="text-[#fed700] text-[10px] font-bold">Full Replacement</span>
              <span
                className={`font-black flex items-center gap-1 text-[10.5px] ${
                  effectiveTier === 'premium' ? 'text-[#fed700]' : 'text-slate-400'
                }`}
              >
                {effectiveTier === 'premium' ? (
                  <>
                    <Check className="w-3 h-3 text-[#fed700]" />
                    <span>Selected</span>
                  </>
                ) : (
                  <span>Select (₦95k)</span>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* POLICY UNDERWRITING SUB-BANNER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-[#0f2e1b]/80 rounded-xl border border-emerald-900/60 text-[11px] text-slate-300">
        <div className="flex items-center gap-2">
          <Award className="w-3.5 h-3.5 text-[#fed700] shrink-0" />
          <span>Policy Ref: <strong>NIA-GIT-POL-8841-NG</strong> • Regulated by NAICOM</span>
        </div>
        <button
          type="button"
          onClick={onOpenTerms}
          className="text-[#fed700] hover:text-white underline font-semibold text-left sm:text-right transition-colors"
        >
          Read complete underwriting terms & exclusions ➔
        </button>
      </div>
    </div>
  );
};
