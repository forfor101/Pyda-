import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  ShieldAlert,
  Calculator,
  CheckCircle2,
  AlertCircle,
  FileText,
  Building2,
  Home,
  Truck,
  HelpCircle,
  Download,
  PhoneCall,
  Lock,
  Sparkles,
  ArrowRight,
  Info,
  Check
} from 'lucide-react';
import { ServiceType } from '../types';

interface TransitInsuranceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyInsuranceToQuote?: (planId: string, estimatedPremium: number, declaredValue: number) => void;
}

export type InsurancePlanId = 'basic' | 'residential' | 'commercial' | 'haulage';

interface ProtectionPlan {
  id: InsurancePlanId;
  name: string;
  category: 'Standard Included' | 'Residential Protection' | 'Commercial Protection' | 'Industrial Cargo';
  ratePercent: number; // e.g. 1.2 for 1.2%
  fixedRateDesc?: string;
  tagline: string;
  description: string;
  icon: React.ReactNode;
  popular?: boolean;
  coverageCap: string;
  deductible: string;
  turnaroundTime: string;
  coveredPerils: string[];
  exclusions: string[];
  bestFor: string;
}

export const PROTECTION_PLANS: ProtectionPlan[] = [
  {
    id: 'basic',
    name: 'Standard Carrier Valuation',
    category: 'Standard Included',
    ratePercent: 0,
    fixedRateDesc: 'Included in Standard Transport Rate (₦0 Add-on)',
    tagline: 'Baseline Carrier Care & Limited Weight Liability',
    description: 'Every relocation with Megatrend Movers includes standard carrier liability per company terms of carriage, adhering to professional packing and secured transit standards.',
    icon: <ShieldAlert className="w-5 h-5 text-slate-400" />,
    coverageCap: 'Standard Carrier Terms (₦1,000 / kg damaged)',
    deductible: 'N/A',
    turnaroundTime: '7 - 10 Business Days',
    coveredPerils: [
      'Standard carrier handling care and certified tie-down strapping',
      'Basic carrier limited liability under standard manifest',
      'Transit vehicle mechanical roadside recovery'
    ],
    exclusions: [
      'Full replacement cost of high-value electronics, art, or jewelry',
      'Unforeseen external highway road incidents or civil unrest',
      'Pre-existing scratches or defects not packed by crew'
    ],
    bestFor: 'Routine non-fragile cargo, standard low-value household boxes, budget moves.'
  },
  {
    id: 'residential',
    name: 'Residential All-Risk Protection',
    category: 'Residential Protection',
    ratePercent: 1.2,
    tagline: 'Comprehensive Full-Replacement Cover for Home & Villa Belongings',
    description: 'Designed for residential moves (apartments, duplexes, luxury mansions). Reimburses or replaces delicate home furniture, Italian leather, electronics, kitchenware, and crystal at current declared market replacement value.',
    icon: <Home className="w-5 h-5 text-amber-400" />,
    popular: true,
    coverageCap: 'Up to ₦50,000,000 Declared Value',
    deductible: '5% of loss (Min ₦15,000)',
    turnaroundTime: '48 - 72 Hours Fast-Track Payout',
    coveredPerils: [
      'Full replacement or professional repair of broken / dented furniture',
      '4K/8K OLED TVs, home theaters, refrigerators & delicate electronics',
      'Porcelain, crystal chandeliers, glassware & marble table tops',
      'Accidental vehicle collision, highway rollover, fire, storm, or flash flooding',
      'Theft or hijack during transit with police report verification',
      'Loading and offloading accidental drops by movers'
    ],
    exclusions: [
      'Cash currency, raw bullion gold, or unsealed personal passports',
      'Living plants or pet transit (handled under specialized live-cargo terms)'
    ],
    bestFor: '1 to 5 Bedroom Apartments, Duplexes, Luxury Residential Relocations & Expatriates.'
  },
  {
    id: 'commercial',
    name: 'Commercial & Corporate Asset Cover',
    category: 'Commercial Protection',
    ratePercent: 1.5,
    tagline: 'Enterprise-Grade Transit Cover for Servers, Office Furniture & Inventory',
    description: 'Custom-tailored for corporate headquarters, bank branches, medical facilities, and retail stores. Protects critical IT assets, executive suites, and inventory against operational business interruption risks.',
    icon: <Building2 className="w-5 h-5 text-blue-400" />,
    coverageCap: 'Up to ₦200,000,000 Declared Asset Value',
    deductible: '5% of claim (Min ₦35,000)',
    turnaroundTime: '48 - 72 Hours Expedited Corporate Payout',
    coveredPerils: [
      'Enterprise server racks, NAS units, networking switches & workstations',
      'Executive mahogany conference tables & ergonomic executive chairs',
      'Medical diagnostics equipment, dental chairs & laboratory instruments',
      'Retail inventory, boxed apparel, consumer goods & showroom stock',
      'Water ingress, highway collision, vehicle overturn & cargo theft',
      'Disassembly / reassembly handling incident coverage'
    ],
    exclusions: [
      'Intangible software data loss (clients must complete server backup prior to move)',
      'Wear and tear on pre-existing mechanical equipment'
    ],
    bestFor: 'Corporate Offices, Tech Hubs, Financial Institutions, Retail Stores & Clinics.'
  },
  {
    id: 'haulage',
    name: 'Industrial Haulage & High-Value Floater',
    category: 'Industrial Cargo',
    ratePercent: 1.8,
    tagline: 'Heavy Industrial Cargo, Machinery & 30-Ton Container Marine Cover',
    description: 'Underwritten for heavy manufacturing machinery, industrial transformers, construction equipment, port container drayage, and cross-border West African freight corridors.',
    icon: <Truck className="w-5 h-5 text-emerald-400" />,
    coverageCap: 'Up to ₦500,000,000+ Underwritten Syndicate Policy',
    deductible: '10% of claim (Min ₦100,000)',
    turnaroundTime: '5 Business Days Assessment & Payout',
    coveredPerils: [
      '30-ton trailer container rollover, bridge impact & highway derailment',
      'Heavy industrial generators, CNC machinery & transformers',
      'Port clearance drayage from Apapa/Tin Can/Onne to inland terminals',
      'Electronic tamper seal breach and armed hijack contingency cover',
      'Jettison, catastrophic transit fire, explosion & total vessel/trailer loss'
    ],
    exclusions: [
      'Prohibited contraband or hazardous radioactive cargo without special permit',
      'Inadequate client factory packaging if uninspected by Megatrend survey team'
    ],
    bestFor: 'Factories, Industrial Haulage, Port Container Drayage & Interstate Heavy Transport.'
  }
];

export const TransitInsuranceModal: React.FC<TransitInsuranceModalProps> = ({
  isOpen,
  onClose,
  onApplyInsuranceToQuote
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<InsurancePlanId>('residential');
  const [declaredValue, setDeclaredValue] = useState<number>(10000000); // ₦10,000,000 default
  const [activeTab, setActiveTab] = useState<'plans' | 'calculator' | 'faqs' | 'underwriters'>('plans');

  if (!isOpen) return null;

  const currentPlan = PROTECTION_PLANS.find((p) => p.id === selectedPlanId) || PROTECTION_PLANS[1];

  // Calculate Premium
  const calculatePremium = (plan: ProtectionPlan, value: number) => {
    if (plan.ratePercent === 0) return 0;
    return Math.round(value * (plan.ratePercent / 100));
  };

  const calculatedPremium = calculatePremium(currentPlan, declaredValue);

  const formatNaira = (amount: number) => {
    return `₦${amount.toLocaleString('en-NG')}`;
  };

  const handleApplyToQuote = () => {
    if (onApplyInsuranceToQuote) {
      onApplyInsuranceToQuote(currentPlan.id, calculatedPremium, declaredValue);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* ==================================================== */}
        {/* MODAL HEADER */}
        {/* ==================================================== */}
        <div className="p-5 sm:px-8 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-2xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-white">Transit Insurance & Protection Plans</h3>
                <span className="hidden sm:inline-block text-[10px] uppercase tracking-wider font-extrabold bg-amber-500/20 text-amber-400 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                  Optional Add-On
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Comprehensive All-Risk Goods-In-Transit (GIT) Coverage for Residential & Commercial Assets.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors shrink-0"
            id="close-transit-insurance-modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ==================================================== */}
        {/* CUSTOMER DISCRETION CALLOUT BANNER */}
        {/* ==================================================== */}
        <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/30 border-b border-amber-500/20 px-5 sm:px-8 py-3.5 flex items-start sm:items-center gap-3 text-xs">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
          <div className="text-slate-300 leading-relaxed">
            <strong className="text-amber-300 font-bold">Client Discretion Notice: </strong> 
            Transit insurance coverage is completely optional and calculated transparently as a separate item. You may elect to add full-replacement coverage based on your declared inventory value or utilize standard carrier terms.
          </div>
        </div>

        {/* ==================================================== */}
        {/* NAVIGATION TABS */}
        {/* ==================================================== */}
        <div className="bg-slate-950/60 px-5 sm:px-8 border-b border-slate-800 flex items-center gap-2 overflow-x-auto shrink-0 py-2.5">
          <button
            onClick={() => setActiveTab('plans')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'plans'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Protection Plans Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'calculator'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Interactive Premium Estimator</span>
          </button>

          <button
            onClick={() => setActiveTab('underwriters')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'underwriters'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Underwriters & Claims Workflow</span>
          </button>

          <button
            onClick={() => setActiveTab('faqs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'faqs'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Insurance FAQs</span>
          </button>
        </div>

        {/* ==================================================== */}
        {/* MODAL BODY CONTENT */}
        {/* ==================================================== */}
        <div className="p-5 sm:p-8 overflow-y-auto flex-grow space-y-6">

          {/* TAB 1: PROTECTION PLANS OVERVIEW */}
          {activeTab === 'plans' && (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-base font-black text-white">Compare Protection Tiers</h4>
                  <p className="text-xs text-slate-400">Choose the tier that matches your residential furniture or commercial business infrastructure.</p>
                </div>
                <div className="text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Settlements backed by NAICOM-registered underwriters</span>
                </div>
              </div>

              {/* Plan Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PROTECTION_PLANS.map((plan) => {
                  const isSelected = selectedPlanId === plan.id;
                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlanId(plan.id)}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative ${
                        isSelected
                          ? 'bg-slate-850 border-amber-400 shadow-xl ring-1 ring-amber-400/40'
                          : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      {plan.popular && (
                        <span className="absolute -top-2.5 right-4 bg-amber-500 text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-md">
                          Most Popular for Homes
                        </span>
                      )}

                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className={`p-2 rounded-xl ${isSelected ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-300'}`}>
                              {plan.icon}
                            </div>
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">{plan.category}</span>
                              <h5 className="font-black text-white text-sm sm:text-base leading-tight">{plan.name}</h5>
                            </div>
                          </div>

                          <div className="text-right">
                            {plan.ratePercent > 0 ? (
                              <div>
                                <span className="text-amber-400 font-black text-base">{plan.ratePercent}%</span>
                                <span className="text-[10px] text-slate-400 block">of declared value</span>
                              </div>
                            ) : (
                              <span className="text-emerald-400 font-bold text-xs bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                Included
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed">
                          {plan.description}
                        </p>

                        <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-800/80">
                          <div>
                            <span className="text-slate-500 block">Max Limit:</span>
                            <span className="font-bold text-slate-200">{plan.coverageCap}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Claims SLA:</span>
                            <span className="font-bold text-emerald-400">{plan.turnaroundTime}</span>
                          </div>
                        </div>

                        {/* Covered Items Bullet Checklist */}
                        <div className="space-y-1.5 pt-2">
                          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Key Inclusions:</span>
                          {plan.coveredPerils.slice(0, 3).map((peril, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              <span className="leading-snug">{peril}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 mt-3 border-t border-slate-800 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400">
                          Deductible: <strong className="text-slate-200">{plan.deductible}</strong>
                        </span>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPlanId(plan.id);
                            setActiveTab('calculator');
                          }}
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors ${
                            isSelected
                              ? 'bg-amber-500 text-slate-950 font-black'
                              : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                          }`}
                        >
                          <span>Calculate Rate</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Quick Callout */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-amber-400 shrink-0" />
                  <p className="text-slate-300">
                    Need a custom multi-million Naira marine cargo policy for factory machinery? Our logistics risk team issues tailored certificate endorsements within 2 hours.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('calculator')}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl shrink-0 active:scale-95 transition-all"
                >
                  Estimate Premium Now
                </button>
              </div>

            </div>
          )}

          {/* TAB 2: INTERACTIVE PREMIUM ESTIMATOR */}
          {activeTab === 'calculator' && (
            <div className="space-y-6">
              
              <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-6">
                
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h4 className="text-base font-black text-white flex items-center gap-2">
                      <Calculator className="w-5 h-5 text-amber-400" />
                      <span>Transit Insurance Premium Calculator</span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Estimate the exact one-time cost to fully insure your declared consignment during transit.
                    </p>
                  </div>
                  <div className="hidden sm:block text-right">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Policy Partner</span>
                    <span className="text-xs font-bold text-amber-400">Leadway / AIICO Insurance</span>
                  </div>
                </div>

                {/* Step 1: Select Plan */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    1. Select Protection Plan
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {PROTECTION_PLANS.map((plan) => (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => setSelectedPlanId(plan.id)}
                        className={`p-3 rounded-xl border text-left text-xs transition-all ${
                          selectedPlanId === plan.id
                            ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 font-bold'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="font-black text-white text-xs truncate">{plan.name}</div>
                        <div className="text-[11px] text-amber-400 mt-0.5">
                          {plan.ratePercent > 0 ? `${plan.ratePercent}% Premium` : 'Included (₦0)'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 2: Declared Consignment Value */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                      2. Declared Value of Items / Assets to Insure
                    </label>
                    <span className="text-sm font-black text-amber-400 font-mono">
                      {formatNaira(declaredValue)}
                    </span>
                  </div>

                  {/* Range Slider */}
                  <input
                    type="range"
                    min={1000000}
                    max={100000000}
                    step={500000}
                    value={declaredValue}
                    onChange={(e) => setDeclaredValue(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />

                  {/* Preset Value Chips */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {[
                      { label: '₦3M (Studio/1-Bed)', val: 3000000 },
                      { label: '₦8M (3-Bed Flat)', val: 8000000 },
                      { label: '₦15M (Duplex/Villa)', val: 15000000 },
                      { label: '₦35M (Corporate Office)', val: 35000000 },
                      { label: '₦75M (Industrial Haulage)', val: 75000000 }
                    ].map((chip) => (
                      <button
                        key={chip.val}
                        type="button"
                        onClick={() => setDeclaredValue(chip.val)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          declaredValue === chip.val
                            ? 'bg-amber-500 text-slate-950 font-black'
                            : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Premium Calculation Summary Card */}
                <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                  <div>
                    <span className="text-[11px] text-slate-400 block uppercase font-bold">Selected Protection</span>
                    <span className="text-sm font-black text-white block">{currentPlan.name}</span>
                    <span className="text-[11px] text-amber-400/90 font-medium">Rate: {currentPlan.ratePercent}%</span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block uppercase font-bold">Insured Replacement Sum</span>
                    <span className="text-base font-black text-slate-200 font-mono block">{formatNaira(declaredValue)}</span>
                    <span className="text-[10px] text-slate-500">Deductible: {currentPlan.deductible}</span>
                  </div>

                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-right sm:text-right">
                    <span className="text-[10px] text-amber-400 font-bold block uppercase tracking-wider">One-Time Premium</span>
                    <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
                      {calculatedPremium > 0 ? formatNaira(calculatedPremium) : '₦0 (Included)'}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Single Relocation Voyage</span>
                  </div>
                </div>

                {/* Action Row */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <div className="text-xs text-slate-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Official Certificate of Marine/Transit Insurance generated upon dispatch.</span>
                  </div>

                  <button
                    onClick={handleApplyToQuote}
                    className="w-full sm:w-auto px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <span>Apply {currentPlan.name.split(' ')[0]} Cover to Relocation Quote</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>

            </div>
          )}

          {/* TAB 3: UNDERWRITERS & CLAIMS WORKFLOW */}
          {activeTab === 'underwriters' && (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Underwriting Syndicate Card */}
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                  <h4 className="text-sm font-black text-white flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-400" />
                    <span>Regulated Underwriting Consortium</span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Megatrend Movers partners with Nigeria’s top-tier, NAICOM-registered insurance institutions to provide direct, fully compliant marine cargo and goods-in-transit (GIT) underwriting.
                  </p>

                  <div className="space-y-2.5 text-xs text-slate-300">
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                      <span className="font-bold text-white">Leadway Assurance Company Ltd</span>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded">Tier-1 Rated</span>
                    </div>
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                      <span className="font-bold text-white">AIICO Insurance Plc</span>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded">Tier-1 Rated</span>
                    </div>
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                      <span className="font-bold text-white">AXA Mansard Insurance Plc</span>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded">Global Backed</span>
                    </div>
                  </div>
                </div>

                {/* 4-Step Claims Process */}
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                  <h4 className="text-sm font-black text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-400" />
                    <span>Rapid 4-Step Claims Protocol</span>
                  </h4>

                  <div className="space-y-3 text-xs">
                    {[
                      {
                        step: '1',
                        title: 'Onsite Note & Waybill Notation',
                        desc: 'Note any damage on the lead driver’s digital manifest upon delivery.'
                      },
                      {
                        step: '2',
                        title: 'Photographic Proof & Survey',
                        desc: 'Upload clear pictures of damaged items through your tracking portal.'
                      },
                      {
                        step: '3',
                        title: 'Assessor Review (24 - 48 Hours)',
                        desc: 'Certified loss adjuster evaluates repair estimate or full replacement sum.'
                      },
                      {
                        step: '4',
                        title: 'Direct Bank Settlement',
                        desc: 'Approved claim amount credited directly to your bank account within 72 hours.'
                      }
                    ].map((item) => (
                      <div key={item.step} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-black flex items-center justify-center shrink-0 text-xs">
                          {item.step}
                        </div>
                        <div>
                          <p className="font-bold text-white">{item.title}</p>
                          <p className="text-slate-400 text-[11px] mt-0.5 leading-snug">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 4: FREQUENTLY ASKED QUESTIONS */}
          {activeTab === 'faqs' && (
            <div className="space-y-3">
              {[
                {
                  q: 'Why is transit insurance billed separately instead of being bundled into the moving rate?',
                  a: 'We respect client discretion and transparency. Bundling a mandatory insurance fee inflates the baseline move cost for clients who only have basic non-fragile cargo or corporate clients who already have their own comprehensive enterprise umbrella policies. Separating it allows you to choose exactly what fits your inventory.'
                },
                {
                  q: 'How do I declare the value of my items for insurance?',
                  a: 'During the booking survey or through our digital Inventory Planner, you can state the replacement value of your high-value belongings. For items above ₦2,000,000 each (such as grand pianos or server racks), serial numbers and receipts help expedite any claim processing.'
                },
                {
                  q: 'Does transit insurance cover items packed by the client themselves (PBO)?',
                  a: 'Standard All-Risk cover requires items to be packed and secured by Megatrend’s certified crew to prevent pre-transit internal box damage. Items packed entirely by the client are covered against total vehicle loss or road accident, but not internal scratching due to improper self-padding.'
                },
                {
                  q: 'What is the deductible/excess?',
                  a: 'The deductible (typically 5% of the claim, min ₦15,000) is the standard policy excess required by underwriters for partial damage repairs. In the event of a total loss incident (e.g., vehicle fire or hijack), the full declared sum is settled.'
                },
                {
                  q: 'How quickly will I receive my Certificate of Insurance?',
                  a: 'Once your relocation quote is confirmed and the insurance add-on is selected, an official Certificate of Transit Cover with policy reference is emailed to you prior to vehicle departure.'
                }
              ].map((faq, idx) => (
                <div key={idx} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1.5 text-xs">
                  <h5 className="font-black text-amber-400 flex items-center gap-2">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{faq.q}</span>
                  </h5>
                  <p className="text-slate-300 leading-relaxed pl-5">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* ==================================================== */}
        {/* MODAL FOOTER */}
        {/* ==================================================== */}
        <div className="p-4 sm:px-8 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>24/7 Dispatch Insurance Hotline: <strong className="text-white">08062466212</strong></span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs rounded-xl transition-colors"
            >
              Close Window
            </button>

            <button
              onClick={handleApplyToQuote}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Configure Quote with Insurance</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
