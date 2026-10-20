import React, { useEffect, useState } from 'react';
import {
  X,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Clock,
  Sparkles,
  HelpCircle,
  Award,
  ArrowRight,
  ExternalLink,
  Lock,
  Percent,
  Check,
  Building2,
  Zap,
} from 'lucide-react';
import { InsuranceCoverageTier } from '../types';

interface InsuranceTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTier: InsuranceCoverageTier;
  onSelectTier?: (tier: InsuranceCoverageTier) => void;
}

export const InsuranceTermsModal: React.FC<InsuranceTermsModalProps> = ({
  isOpen,
  onClose,
  selectedTier,
  onSelectTier,
}) => {
  const [activeTab, setActiveTab] = useState<'matrix' | 'clauses' | 'claims'>('matrix');

  // Handle ESC key to dismiss modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="insurance-terms-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-[#0f2e1b] border border-emerald-600/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="relative bg-gradient-to-r from-[#0a1f12] via-[#0f2e1b] to-[#0a1f12] p-5 sm:p-6 border-b border-emerald-900/60 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#15652e]/40 border border-[#83b735]/50 flex items-center justify-center shrink-0 text-[#83b735]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2
                    id="insurance-terms-title"
                    className="text-lg sm:text-xl font-black text-white tracking-tight"
                  >
                    Goods-In-Transit (GIT) Insurance Policy Terms
                  </h2>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    Leadway & AIICO Consortium
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  Official cargo underwriting agreement under Nigerian Insurance Act & NAICOM regulatory framework (Ref: NAICOM/RIC/026). Coverage begins upon vehicle departure and ends upon final delivery sign-off.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors shrink-0"
              aria-label="Close Terms"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* TAB NAVIGATION */}
          <div className="flex items-center gap-2 mt-5 border-b border-emerald-900/60 -mb-5 sm:-mb-6 overflow-x-auto pb-0">
            <button
              type="button"
              onClick={() => setActiveTab('matrix')}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'matrix'
                  ? 'border-[#83b735] text-[#83b735] bg-[#83b735]/10'
                  : 'border-transparent text-slate-300 hover:text-white'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Tier Comparison Matrix</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('clauses')}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'clauses'
                  ? 'border-[#83b735] text-[#83b735] bg-[#83b735]/10'
                  : 'border-transparent text-slate-300 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Policy Terms & Exclusions</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('claims')}
              className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'claims'
                  ? 'border-[#83b735] text-[#83b735] bg-[#83b735]/10'
                  : 'border-transparent text-slate-300 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Claim Filing & SLA Procedure</span>
            </button>
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs leading-relaxed">
          {/* TAB 1: TIER COMPARISON MATRIX */}
          {activeTab === 'matrix' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 text-xs text-slate-300 flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p>
                  All Pyda Movers relocations include our baseline <strong>Carrier Liability</strong> at no extra charge. Upgrading to <strong>Standard All-Risk</strong> or <strong>Premium VIP Full-Replacement</strong> unlocks true goods-in-transit indemnification backed by Leadway Assurance Plc and AIICO Insurance Plc with expedited payout guarantees.
                </p>
              </div>

              {/* TIER COMPARISON TABLE */}
              <div className="overflow-x-auto rounded-2xl border border-slate-800 shadow-inner">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                      <th className="p-3.5 font-bold">Policy Parameters</th>
                      <th className="p-3.5 font-bold text-slate-300">
                        <span className="block text-white text-xs font-extrabold">Basic Protection</span>
                        <span className="text-[10px] text-slate-400 lowercase font-normal">Carrier Statutory Liability</span>
                      </th>
                      <th className="p-3.5 font-bold text-amber-300 bg-amber-500/5 border-x border-slate-800">
                        <div className="flex items-center gap-1">
                          <span className="block text-amber-400 text-xs font-extrabold">Standard All-Risk</span>
                          <span className="text-[9px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.2 rounded">POPULAR</span>
                        </div>
                        <span className="text-[10px] text-amber-300/80 lowercase font-normal">Full Goods-In-Transit</span>
                      </th>
                      <th className="p-3.5 font-bold text-purple-300 bg-purple-500/5">
                        <div className="flex items-center gap-1">
                          <span className="block text-purple-300 text-xs font-extrabold">Premium VIP</span>
                          <span className="text-[9px] bg-purple-500 text-white font-black px-1.5 py-0.2 rounded">ZERO DEDUCTIBLE</span>
                        </div>
                        <span className="text-[10px] text-purple-300/80 lowercase font-normal">VIP Full-Replacement</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 font-mono text-[11px]">
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-3.5 font-sans font-bold text-slate-300">Cover Fee / Premium</td>
                      <td className="p-3.5 text-emerald-400 font-bold">₦0 (Included Free)</td>
                      <td className="p-3.5 text-amber-300 font-bold bg-amber-500/5 border-x border-slate-800">₦45,000 Flat</td>
                      <td className="p-3.5 text-purple-300 font-bold bg-purple-500/5">₦95,000 Flat</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-3.5 font-sans font-bold text-slate-300">Maximum Valuation Limit</td>
                      <td className="p-3.5 text-slate-300">₦1,000 / kg (Weight Only)</td>
                      <td className="p-3.5 text-slate-200 font-bold bg-amber-500/5 border-x border-slate-800">Up to ₦25,000,000</td>
                      <td className="p-3.5 text-slate-200 font-bold bg-purple-500/5">Up to ₦75,000,000</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-3.5 font-sans font-bold text-slate-300">Deductible per Claim</td>
                      <td className="p-3.5 text-slate-400">₦25,000 statutory</td>
                      <td className="p-3.5 text-slate-300 bg-amber-500/5 border-x border-slate-800">₦15,000</td>
                      <td className="p-3.5 text-emerald-400 font-black bg-purple-500/5">₦0 (Zero Deductible)</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-3.5 font-sans font-bold text-slate-300">Valuation Basis</td>
                      <td className="p-3.5 text-slate-400">Depreciated weight weight-loss</td>
                      <td className="p-3.5 text-slate-300 bg-amber-500/5 border-x border-slate-800">Actual Cash Value (ACV)</td>
                      <td className="p-3.5 text-purple-300 font-bold bg-purple-500/5">Full Replacement Cost (New for Old)</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-3.5 font-sans font-bold text-slate-300">Claim Settlement SLA</td>
                      <td className="p-3.5 text-slate-400">14 – 21 business days</td>
                      <td className="p-3.5 text-slate-200 bg-amber-500/5 border-x border-slate-800">5 – 7 business days</td>
                      <td className="p-3.5 text-emerald-400 font-bold bg-purple-500/5">24 – 48 Hours Fast-Track</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-3.5 font-sans font-bold text-slate-300">Fragile Glass & Electronics</td>
                      <td className="p-3.5 text-rose-400">❌ Excluded</td>
                      <td className="p-3.5 text-emerald-400 bg-amber-500/5 border-x border-slate-800">✓ Fully Covered</td>
                      <td className="p-3.5 text-emerald-400 bg-purple-500/5">✓ Fully Covered + Crating Indemnity</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-3.5 font-sans font-bold text-slate-300">Highway Overturn & Collision</td>
                      <td className="p-3.5 text-emerald-400">✓ Covered (Weight basis)</td>
                      <td className="p-3.5 text-emerald-400 bg-amber-500/5 border-x border-slate-800">✓ 100% Repaired/Replaced</td>
                      <td className="p-3.5 text-emerald-400 bg-purple-500/5">✓ 100% Repaired/Replaced</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-3.5 font-sans font-bold text-slate-300">Dedicated Claims Officer</td>
                      <td className="p-3.5 text-slate-500">General Support Pool</td>
                      <td className="p-3.5 text-slate-300 bg-amber-500/5 border-x border-slate-800">Assigned Claims Specialist</td>
                      <td className="p-3.5 text-purple-300 font-bold bg-purple-500/5">VIP Concierge & Lead Adjuster</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-3.5 font-sans font-bold text-slate-300">Underwriting Consortium</td>
                      <td className="p-3.5 text-slate-400">Internal Pyda Reserve</td>
                      <td className="p-3.5 text-slate-300 bg-amber-500/5 border-x border-slate-800">Leadway Assurance Plc</td>
                      <td className="p-3.5 text-slate-200 bg-purple-500/5">Leadway & AIICO Co-insurance</td>
                    </tr>
                  </tbody>
                  {onSelectTier && (
                    <tfoot>
                      <tr className="bg-slate-950 border-t border-slate-800">
                        <td className="p-3.5 text-slate-400 font-sans font-bold">Action</td>
                        <td className="p-3.5">
                          <button
                            type="button"
                            onClick={() => {
                              onSelectTier('basic');
                              onClose();
                            }}
                            className={`w-full py-2 px-3 rounded-xl font-bold text-xs transition-colors ${
                              selectedTier === 'basic'
                                ? 'bg-slate-800 text-slate-300 border border-slate-600'
                                : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
                            }`}
                          >
                            {selectedTier === 'basic' ? 'Current Choice' : 'Select Basic'}
                          </button>
                        </td>
                        <td className="p-3.5 bg-amber-500/5 border-x border-slate-800">
                          <button
                            type="button"
                            onClick={() => {
                              onSelectTier('standard');
                              onClose();
                            }}
                            className={`w-full py-2 px-3 rounded-xl font-bold text-xs transition-all shadow-md ${
                              selectedTier === 'standard'
                                ? 'bg-amber-500 text-slate-950 font-black'
                                : 'bg-amber-500/20 hover:bg-amber-500 hover:text-slate-950 text-amber-300 border border-amber-500/40'
                            }`}
                          >
                            {selectedTier === 'standard' ? 'Current Choice' : 'Select Standard (₦45k)'}
                          </button>
                        </td>
                        <td className="p-3.5 bg-purple-500/5">
                          <button
                            type="button"
                            onClick={() => {
                              onSelectTier('premium');
                              onClose();
                            }}
                            className={`w-full py-2 px-3 rounded-xl font-bold text-xs transition-all shadow-md ${
                              selectedTier === 'premium'
                                ? 'bg-purple-600 text-white font-black'
                                : 'bg-purple-500/20 hover:bg-purple-600 hover:text-white text-purple-300 border border-purple-500/40'
                            }`}
                          >
                            {selectedTier === 'premium' ? 'Current Choice' : 'Select Premium VIP (₦95k)'}
                          </button>
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: POLICY CLAUSES & EXCLUSIONS */}
          {activeTab === 'clauses' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <FileText className="w-4 h-4" />
                  <span>Article 1: Scope of Goods-In-Transit Coverage</span>
                </div>
                <p className="text-slate-300">
                  This policy indemnifies the declared Cargo and Personal Effects of the Client during loading, conveyance by designated fleet vehicles, and offloading at the agreed destination address. Coverage begins the moment our crew initiates physical loading into the Pyda container/truck and terminates upon placement in the destination residence/office and joint signing of the Delivery Acceptance Receipt.
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <Lock className="w-4 h-4" />
                  <span>Article 2: Valuation Principles & Declared Cargo Limit</span>
                </div>
                <p className="text-slate-300">
                  Total indemnity shall not exceed the selected tier liability cap (Basic: ₦1,000/kg; Standard: ₦25,000,000; Premium VIP: ₦75,000,000). Any single high-value item exceeding ₦2,500,000 (such as individual high-end paintings, antique credenzas, luxury audio equipment, or corporate blade servers) must be declared prior to move day or cataloged in the survey photo section to guarantee full-replacement reimbursement.
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <Percent className="w-4 h-4" />
                  <span>Article 3: Zero-Deductible Terms (Premium VIP)</span>
                </div>
                <p className="text-slate-300">
                  Under the <strong>Premium VIP Protection</strong> tier, the statutory co-insurance deductible is completely waived (₦0 Deductible). The client receives 100% of the replacement or repair cost with zero out-of-pocket deduction. For the <strong>Standard All-Risk</strong> tier, an agreed fixed deductible of ₦15,000 applies per verified event.
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Article 4: Standard Exclusions & Ineligible Cargo</span>
                </div>
                <div className="text-slate-300 space-y-1.5">
                  <p>The policy does NOT extend to the following categories:</p>
                  <ul className="list-disc pl-5 space-y-1 text-slate-400">
                    <li>Cash, physical currency notes, minted coins, or bearer securities.</li>
                    <li>Uncut bullion, fine jewelry, precious stones, or bearer passports (clients are required to transport personal jewelry personally).</li>
                    <li>Flammable fluids, compressed gas cylinders (unless purged/certified empty), contraband, and firearms without formal military/police escort documentation.</li>
                    <li>Damage arising directly from owner-packed cartons that collapse under internal weight due to improper taping or lack of adequate internal padding, unless White-Glove Professional Packing was booked.</li>
                    <li>Pre-existing mechanical wear-and-tear or non-functional electronics where no physical casing impact or transit shock damage is documented.</li>
                  </ul>
                </div>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <Building2 className="w-4 h-4" />
                  <span>Article 5: Underwriting Consortium & Regulatory Registry</span>
                </div>
                <p className="text-slate-300">
                  Risk is co-underwritten by Leadway Assurance Company Plc (Lead Underwriter) and AIICO Insurance Plc Consortium under Marine & Cargo Open Cover Policy No. <strong>NIA-GIT-POL-8841-NG</strong>. Pyda Movers acts as an authorized corporate logistics broker and corporate signatory.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: CLAIMS FILING PROCEDURE & SLA */}
          {activeTab === 'claims' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-amber-300 text-sm">72-Hour Claim Notification Window</h4>
                  <p className="text-slate-300 text-xs mt-1">
                    Any transit damage, package shock, or missing inventory item must be flagged within <strong>72 hours (3 calendar days)</strong> of cargo delivery through our Customer Vault or 24/7 claims hotline.
                  </p>
                </div>
              </div>

              {/* 4-STEP PROCEDURE */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 relative">
                  <span className="absolute top-3 right-3 text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    STEP 01
                  </span>
                  <h5 className="font-bold text-white text-xs mb-1.5 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Delivery Acceptance Sign-Off
                  </h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Inspect external carton seals and unwrapped furniture upon arrival. If any box or item exhibits exterior impact, note the exception on the driver's electronic waybill or delivery manifest.
                  </p>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 relative">
                  <span className="absolute top-3 right-3 text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    STEP 02
                  </span>
                  <h5 className="font-bold text-white text-xs mb-1.5 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Photo / Video Evidence Submission
                  </h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Log in to your <strong>Customer Document Vault</strong> or send high-resolution photos and video of the damaged item to our dedicated claims desk via WhatsApp (0806 246 6212).
                  </p>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 relative">
                  <span className="absolute top-3 right-3 text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    STEP 03
                  </span>
                  <h5 className="font-bold text-white text-xs mb-1.5 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Independent Adjuster Review
                  </h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Leadway & AIICO loss adjusters assess the repair estimate or replacement cost. For <strong>Premium VIP</strong> clients, assessment begins within 12 hours of filing.
                  </p>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 relative">
                  <span className="absolute top-3 right-3 text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    STEP 04
                  </span>
                  <h5 className="font-bold text-white text-xs mb-1.5 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-400" />
                    Expedited Settlement Payout
                  </h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Approved claims are disbursed via direct electronic bank transfer (NIP) directly into your designated Nigerian bank account within the committed SLA (24–48 hours for Premium VIP).
                  </p>
                </div>
              </div>

              {/* CLAIMS HOTLINE CALLOUT */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">24/7 Dedicated Insurance Desk:</span>
                  <span className="text-white font-mono font-bold text-sm">0806 246 6212 • claims@pydamovers.com</span>
                </div>
                <a
                  href="https://wa.me/2348062466212?text=Hello%20Pyda%20Movers%20Insurance%20Desk%2C%20I%20have%20an%20insurance%20inquiry%20regarding%20Goods-in-Transit%20coverage."
                  target="_blank"
                  rel="noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl flex items-center justify-center gap-2 transition-colors shrink-0"
                >
                  <span>Chat with Claims Desk</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>NAICOM Regulated Policy • Zero Hidden Charges</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
            >
              Close Terms
            </button>
            {onSelectTier && selectedTier !== 'standard' && (
              <button
                type="button"
                onClick={() => {
                  onSelectTier('standard');
                  onClose();
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-md active:scale-95"
              >
                Apply Standard Protection (₦45k)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
