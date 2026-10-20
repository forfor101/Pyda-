import React, { useState } from 'react';
import { DollarSign, Truck, Building2, Home, Car, Receipt, Check, ShieldCheck, ArrowRight, Info, Calculator, ShieldAlert, Sparkles, MapPin, Fuel } from 'lucide-react';
import { ServiceType } from '../types';
import { useCms } from '../context/CmsContext';
import { TrustFixedPriceBanner } from './TrustFixedPriceBanner';

interface PricingGuideSectionProps {
  onOpenQuoteWithService: (service: ServiceType, transitMode?: 'intra' | 'inter', initialOrigin?: string, initialDest?: string) => void;
  onNavigateToValuationCalculator?: () => void;
}

export const PricingGuideSection: React.FC<PricingGuideSectionProps> = ({ 
  onOpenQuoteWithService,
  onNavigateToValuationCalculator 
}) => {
  const { cms } = useCms();
  const benchmarks = cms.pricing;

  const [activeCategory, setActiveCategory] = useState<'all' | 'residential' | 'corporate' | 'haulage'>('all');
  const [moveType, setMoveType] = useState<'local' | 'interstate'>('local');
  const [selectedHub, setSelectedHub] = useState<'all' | 'lagos' | 'abuja'>('all');

  const filteredBenchmarks = benchmarks.filter((item) => {
    if (activeCategory === 'all') return true;
    return item.category === activeCategory;
  });

  return (
    <section id="pricing-benchmarks" className="py-16 sm:py-24 bg-slate-900 border-t border-b border-slate-800 text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest">
            <DollarSign className="w-4 h-4 text-amber-400" />
            <span>Transparent Moving & Haulage Rates</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Moving & Relocation Pricing Packages
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Updated operational pricing models reflecting current haulage realities, baseline petrol at <strong>₦1,460/liter</strong>, and commercial diesel at <strong>₦1,850/liter</strong>. Clear, fixed-price estimates for Lagos, Abuja, and nationwide interstate routes.
          </p>
        </div>

        {/* NOTICEABLE FIXED-PRICE GUARANTEE TRUST BANNER */}
        <TrustFixedPriceBanner className="mb-10" />

        {/* Goods-In-Transit (GIT) Insurance Quick Banner */}
        <div className="bg-gradient-to-r from-amber-950/40 via-slate-950 to-slate-900 border border-amber-500/30 rounded-2xl p-4 sm:p-5 mb-8 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-white text-sm sm:text-base">Need an Itemized Valuation & Insurance Estimate?</h4>
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Leadway & AIICO
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Calculate exact Goods-in-Transit premiums based on declared replacement values and interstate transit distance.
              </p>
            </div>
          </div>

          <a
            href="#item-valuation-insurance-calculator"
            onClick={(e) => {
              if (onNavigateToValuationCalculator) {
                e.preventDefault();
                onNavigateToValuationCalculator();
              }
            }}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition-transform shrink-0 active:scale-95 cursor-pointer"
            id="jump-to-valuation-calculator-btn"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Open Insurance Calculator</span>
          </a>
        </div>

        {/* Controls: Category Filter, Transit Type Toggle & Hub Selector */}
        <div className="flex flex-col gap-4 mb-10 bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-xl">
          
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            {/* Category Filter */}
            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  activeCategory === 'all'
                    ? 'bg-amber-500 text-slate-950 shadow-md scale-[1.02]'
                    : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
                id="filter-pricing-all"
              >
                All Packages
              </button>
              <button
                onClick={() => setActiveCategory('residential')}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeCategory === 'residential'
                    ? 'bg-amber-500 text-slate-950 shadow-md scale-[1.02]'
                    : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
                id="filter-pricing-residential"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Residential Moves</span>
              </button>
              <button
                onClick={() => setActiveCategory('corporate')}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeCategory === 'corporate'
                    ? 'bg-amber-500 text-slate-950 shadow-md scale-[1.02]'
                    : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
                id="filter-pricing-corporate"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Corporate & Office</span>
              </button>
              <button
                onClick={() => setActiveCategory('haulage')}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeCategory === 'haulage'
                    ? 'bg-amber-500 text-slate-950 shadow-md scale-[1.02]'
                    : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
                id="filter-pricing-haulage"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Interstate & Haulage</span>
              </button>
            </div>

            {/* Local vs Interstate Toggle */}
            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 w-full lg:w-auto justify-center">
              <button
                onClick={() => setMoveType('local')}
                className={`px-4 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  moveType === 'local'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
                id="pricing-type-local-btn"
              >
                Intra-City (Lagos & Abuja)
              </button>
              <button
                onClick={() => setMoveType('interstate')}
                className={`px-4 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  moveType === 'interstate'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
                id="pricing-type-interstate-btn"
              >
                Interstate (Highway Corridors)
              </button>
            </div>
          </div>

          {/* Hub Filter for Local Moves */}
          {moveType === 'local' && (
            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-bold text-slate-300">Filter By City Hub:</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setSelectedHub('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedHub === 'all'
                      ? 'bg-slate-800 text-amber-400 border border-amber-500/40 font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Both Lagos & Abuja Rates
                </button>
                <button
                  onClick={() => setSelectedHub('lagos')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedHub === 'lagos'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Lagos Intra-City
                </button>
                <button
                  onClick={() => setSelectedHub('abuja')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedHub === 'abuja'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Abuja Intra-City
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Pricing Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBenchmarks.map((item, idx) => {
            const priceNaira = moveType === 'local' ? item.localIntraCityNaira : item.interstateNaira;
            const priceRange = moveType === 'local' ? item.localIntraCityRange : item.interstateRange;
            const serviceKey: ServiceType = item.category === 'haulage' ? 'haulage' : item.category === 'corporate' ? 'corporate' : 'residential';

            return (
              <div
                key={idx}
                className="bg-slate-950 rounded-2xl border border-slate-800 hover:border-amber-400/50 p-6 flex flex-col justify-between transition-all group shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-amber-400">
                      {item.category}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {item.unitOrProperty}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-white text-base group-hover:text-amber-400 transition-colors">
                    {item.serviceName}
                  </h3>

                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Price Banner */}
                  <div className="mt-5 p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      {moveType === 'local' ? 'Standard Starting Rate' : 'Interstate Base Fare'}
                    </span>
                    
                    {/* If local move and both hubs available, show both Lagos and Abuja starting rates */}
                    {moveType === 'local' && item.lagosStartingNaira && item.abujaStartingNaira ? (
                      <div className="space-y-2 pt-1">
                        {(selectedHub === 'all' || selectedHub === 'lagos') && (
                          <div className="flex items-center justify-between bg-slate-950/80 p-2 rounded-lg border border-slate-800">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-amber-400 block">Lagos Intra-City:</span>
                              <span className="text-xs text-slate-400">Starting from</span>
                            </div>
                            <span className="text-xl font-black text-white font-mono">
                              ₦{item.lagosStartingNaira.toLocaleString()}
                            </span>
                          </div>
                        )}

                        {(selectedHub === 'all' || selectedHub === 'abuja') && (
                          <div className="flex items-center justify-between bg-slate-950/80 p-2 rounded-lg border border-slate-800">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-cyan-400 block">Abuja Intra-City:</span>
                              <span className="text-xs text-slate-400">Starting from</span>
                            </div>
                            <span className="text-xl font-black text-white font-mono">
                              ₦{item.abujaStartingNaira.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-2xl font-black text-amber-400">
                            ₦{priceNaira.toLocaleString()}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">starting</span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono pt-1">
                          Range: <strong className="text-slate-300">{priceRange}</strong>
                        </p>
                      </div>
                    )}

                    {/* Fuel adjustment badge */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center gap-1.5 text-[10px] text-slate-400">
                      <Fuel className="w-3 h-3 text-amber-400 shrink-0" />
                      <span>{item.fuelBenchmarkNote || 'Fuel adjusted: Petrol @ ₦1,460/L • Diesel @ ₦1,850/L'}</span>
                    </div>
                  </div>

                  {/* Recommended Vehicle */}
                  <button
                    type="button"
                    onClick={() => onOpenQuoteWithService(serviceKey, moveType === 'local' ? 'intra' : 'inter')}
                    className="mt-3.5 flex items-center justify-between w-full text-xs text-slate-300 bg-slate-900/40 hover:bg-slate-900 p-2.5 rounded-lg border border-slate-800/80 hover:border-amber-400/40 transition-colors text-left cursor-pointer group/vehicle active:scale-[0.98]"
                    title={`Click to select ${item.recommendedVehicle} for your quote`}
                  >
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-amber-400 shrink-0 group-hover/vehicle:scale-110 transition-transform" />
                      <span>Fleet: <strong className="text-white">{item.recommendedVehicle}</strong></span>
                    </div>
                    <span className="text-[10px] text-amber-400 font-bold opacity-0 group-hover/vehicle:opacity-100 transition-opacity">Select →</span>
                  </button>
                </div>

                {/* Card Action */}
                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <button
                    onClick={() => onOpenQuoteWithService(serviceKey, moveType === 'local' ? 'intra' : 'inter')}
                    className="w-full bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white font-bold text-xs py-3 rounded-xl border border-slate-800 hover:border-amber-400 transition-all flex items-center justify-center gap-2 group-hover:shadow-lg cursor-pointer active:scale-95"
                  >
                    <Calculator className="w-3.5 h-3.5" />
                    <span>Calculate Instant Quote</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Executive Car Hire Pricing Spotlight Banner */}
        <div className="mt-10 bg-gradient-to-br from-emerald-950/40 via-slate-950 to-slate-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
              <Car className="w-4 h-4 text-[#83b735]" />
              <span>Executive Chauffeur Fleet • Inter & Intra-State Rates</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Chauffeur-Driven Car Hire & Armed Escort Pricing
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Transparent daily charter pricing with verified protocol drivers. Intra-State city charters from <strong>₦85,000/day</strong>, Inter-State highway travel from <strong>₦165,000/day</strong>, and Armored Bulletproof B6 Land Cruisers from <strong>₦480,000/day</strong>. Every booking includes automatic Pro-Forma Invoice and Settled Official Receipt generation with FIRS VAT clearance.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <button
              onClick={() => onOpenQuoteWithService('car_hire', 'intra')}
              className="bg-[#83b735] hover:bg-[#92cb3b] text-slate-950 font-black text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-xl flex items-center gap-2 transition-all transform active:scale-95"
              id="pricing-car-hire-intra-btn"
            >
              <Car className="w-4 h-4 stroke-[2.5]" />
              <span>Book Intra-State (From ₦85k)</span>
            </button>

            <button
              onClick={() => onOpenQuoteWithService('car_hire', 'inter')}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-xl flex items-center gap-2 transition-all transform active:scale-95"
              id="pricing-car-hire-inter-btn"
            >
              <Receipt className="w-4 h-4 stroke-[2.5]" />
              <span>Inter-State & Invoice (From ₦165k)</span>
            </button>
          </div>
        </div>

        {/* Costing Disclaimer & Fixed-Price Stipulation */}
        <div className="mt-10 p-5 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-3.5 text-xs text-slate-300 max-w-4xl mx-auto shadow-lg">
          <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-white text-sm">
              Nigerian Logistics Pricing & Fixed-Price Policy:
            </p>
            <p className="leading-relaxed text-slate-400">
              Actual relocation costs vary based on exact route distance, floor elevation (₦15,000 per floor staircase carry when elevator is absent), specialized packing, and vehicle sizing (3-Ton vs 5-Ton vs 10-Ton). Every instant estimate generated through our platform includes our <strong>Fixed-Price Guarantee</strong> — covering complete transit, Goods-in-Transit insurance, and road tolls with no unexpected move-day surcharges.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};
