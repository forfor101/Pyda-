import React, { useState } from 'react';
import { Truck, ShieldCheck, MapPin, Calculator, PhoneCall, ArrowRight, Award, Clock, CheckCircle2, Globe2, Building2, Navigation, Route, Search, Camera, Sparkles } from 'lucide-react';
import { NIGERIAN_CITIES } from '../data/companyData';
import { NIGERIAN_STATES_DATA } from '../data/nigerianStatesLgas';
import { LocationSelectorModal } from './LocationSelectorModal';
import { PageView, ServiceType } from '../types';
import { useCms } from '../context/CmsContext';

interface HeroProps {
  onOpenQuoteWithParams: (service: ServiceType, origin: string, dest: string, transitMode?: 'intra' | 'inter') => void;
  setCurrentPage: (page: PageView) => void;
}

const findStateIdFromCity = (cityName: string): string => {
  const clean = cityName.toLowerCase();
  if (clean.includes('abuja') || clean.includes('fct')) return 'fct';
  if (clean.includes('lagos')) return 'lagos';
  if (clean.includes('rivers') || clean.includes('port harcourt')) return 'rivers';
  if (clean.includes('kano')) return 'kano';
  if (clean.includes('ibadan') || clean.includes('oyo')) return 'oyo';
  if (clean.includes('enugu')) return 'enugu';
  if (clean.includes('kaduna')) return 'kaduna';
  if (clean.includes('edo') || clean.includes('benin')) return 'edo';
  if (clean.includes('cross river') || clean.includes('calabar')) return 'cross_river';
  if (clean.includes('delta') || clean.includes('asaba') || clean.includes('warri')) return 'delta';
  if (clean.includes('ogun') || clean.includes('abeokuta')) return 'ogun';
  if (clean.includes('akwa ibom') || clean.includes('uyo')) return 'akwa_ibom';
  if (clean.includes('plateau') || clean.includes('jos')) return 'plateau';
  const match = NIGERIAN_STATES_DATA.find(s => clean.includes(s.name.toLowerCase()) || clean.includes(s.capital.toLowerCase()));
  return match ? match.id : 'lagos';
};

export const Hero: React.FC<HeroProps> = ({ onOpenQuoteWithParams, setCurrentPage }) => {
  const { cms } = useCms();
  const { hero, company } = cms;

  const [selectedService, setSelectedService] = useState<ServiceType>('corporate');
  const [transitMode, setTransitMode] = useState<'intra' | 'inter'>('inter');
  const [origin, setOrigin] = useState(NIGERIAN_CITIES[0]); // Abuja
  const [destination, setDestination] = useState(NIGERIAN_CITIES[1]); // Lagos
  const [locationModalTarget, setLocationModalTarget] = useState<'origin' | 'destination' | null>(null);

  const handleTransitModeChange = (mode: 'intra' | 'inter') => {
    setTransitMode(mode);
    if (mode === 'intra') {
      setOrigin('Lagos');
      setDestination('Lagos');
    } else {
      setOrigin('Lagos');
      setDestination('Abuja');
    }
  };

  const handleLocationSelect = (stateId: string, lgaName: string) => {
    const stateObj = NIGERIAN_STATES_DATA.find((s) => s.id === stateId);
    const label = stateObj ? `${stateObj.name} (${lgaName})` : lgaName;
    if (locationModalTarget === 'origin') {
      setOrigin(label);
      if (transitMode === 'intra') {
        setDestination(label);
      }
    } else {
      setDestination(label);
    }
    setLocationModalTarget(null);
  };

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onOpenQuoteWithParams(selectedService, origin, destination, transitMode);
  };

  return (
    <div className="relative bg-slate-950 text-white overflow-hidden">
      {/* Background Graphic & Hero Image with overlay (Duchess Naturals Forest & Gold) */}
      <div className="absolute inset-0 z-0">
        <img
          src={hero.bgImageUrl || 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=1600&auto=format&fit=crop&q=80'}
          alt="Pyda Movers Logistics Fleet"
          className="w-full h-full object-cover object-center opacity-25 scale-105 transform filter brightness-90"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a1f12] via-[#0f2e1b]/95 to-slate-950/90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#15652e]/25 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 lg:pt-20 lg:pb-24">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Hero Tagline & Main Value Prop */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Top Badges (Coverage Hubs + Google AI Studio Integration) */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setCurrentPage('coverage')}
                className="inline-flex items-center gap-2 bg-emerald-900/35 hover:bg-emerald-900/50 border border-emerald-600/40 hover:border-[#83b735] backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold text-emerald-300 active:scale-95 transition-all cursor-pointer group shadow-sm"
                title="Explore Nationwide Logistics Network & Hubs"
              >
                <Globe2 className="w-3.5 h-3.5 text-[#83b735] shrink-0 group-hover:rotate-45 transition-transform" />
                <span>{hero.badgeText}</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentPage('inspection')}
                className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500/15 via-emerald-500/15 to-blue-500/15 hover:from-amber-500/25 hover:to-emerald-500/25 border border-amber-500/40 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-black text-amber-300 active:scale-95 transition-all cursor-pointer shadow-sm group"
                title="Powered by Google AI Studio: Run instant multimodal room & cargo inspection"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
                <span>Google AI Studio Integration</span>
              </button>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-[1.15]">
              {hero.headlinePrefix} <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-[#fed700] via-amber-400 to-[#83b735] bg-clip-text text-transparent font-extrabold tracking-tight">
                {hero.headlineGradient}
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed font-normal">
              {hero.subHeadline}
            </p>

            {/* Office Locations & Hotlines Highlight Cards (Interactive) */}
            <div className="grid sm:grid-cols-2 gap-3 pt-2 text-xs">
              <button
                type="button"
                onClick={() => setCurrentPage('contact')}
                className="bg-[#0f2e1b]/70 hover:bg-[#15652e]/40 backdrop-blur border border-emerald-800/40 hover:border-[#83b735]/60 rounded-2xl p-3.5 flex items-start gap-3 text-left transition-all active:scale-[0.98] cursor-pointer group shadow-md"
                title="View Abuja HQ Office Details & GPS"
              >
                <div className="p-2 rounded-xl bg-emerald-500/20 text-[#83b735] shrink-0 group-hover:bg-emerald-500/30 group-hover:scale-110 transition-all">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-white text-xs group-hover:text-[#fed700] transition-colors">{company.headquartersAbuja.title}</p>
                    <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-[#fed700] group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <p className="text-slate-300 text-[11px] leading-snug mt-0.5">
                    {company.headquartersAbuja.address}
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setCurrentPage('contact')}
                className="bg-[#0f2e1b]/70 hover:bg-[#15652e]/40 backdrop-blur border border-emerald-800/40 hover:border-[#83b735]/60 rounded-2xl p-3.5 flex items-start gap-3 text-left transition-all active:scale-[0.98] cursor-pointer group shadow-md"
                title="View Lagos Maritime Terminal Office Details & GPS"
              >
                <div className="p-2 rounded-xl bg-emerald-500/20 text-[#83b735] shrink-0 group-hover:bg-emerald-500/30 group-hover:scale-110 transition-all">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-white text-xs group-hover:text-[#fed700] transition-colors">{company.mainOfficeLagos.title}</p>
                    <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-[#fed700] group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <p className="text-slate-300 text-[11px] leading-snug mt-0.5">
                    {company.mainOfficeLagos.address}
                  </p>
                </div>
              </button>
            </div>

            {/* Action Buttons & Phone Links */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <div className="inline-flex rounded-2xl bg-gradient-to-r from-[#fed700] to-amber-500 p-0.5 shadow-xl shadow-amber-500/25 items-center">
                <a
                  href={`tel:${company.phones[0]}`}
                  className="bg-transparent hover:bg-black/10 text-slate-950 font-black text-sm px-5 py-3 rounded-2xl flex items-center gap-2 transition-all transform active:scale-95"
                  id="hero-call-now-btn"
                  title={`Call Primary Hotline: ${company.phones[0]}`}
                >
                  <PhoneCall className="w-4 h-4 text-slate-950 animate-bounce" />
                  <span>Call {company.phones[0]}</span>
                </a>
                {company.phones[1] && (
                  <a
                    href={`tel:${company.phones[1]}`}
                    className="border-l border-slate-950/20 text-slate-950/80 hover:text-slate-950 hover:bg-black/10 font-bold text-xs px-3 py-3 rounded-r-2xl flex items-center gap-1 transition-all"
                    title={`Call Alternate Line: ${company.phones[1]}`}
                  >
                    <span>Alt Line</span>
                  </a>
                )}
              </div>

              <button
                onClick={() => setCurrentPage('inspection')}
                className="bg-gradient-to-r from-emerald-950 via-[#0f2e1b] to-slate-900 hover:from-emerald-900 hover:to-slate-800 text-emerald-300 hover:text-white border border-emerald-500/60 font-black text-xs sm:text-sm px-5 py-3.5 rounded-2xl flex items-center gap-2.5 transition-all shadow-xl shadow-emerald-950/50 active:scale-95 cursor-pointer group"
                id="hero-cargo-inspection-cta"
                title="Powered by Google AI Studio - Multimodal Gemini 3.8 Flash Vision Survey"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
                </span>
                <Sparkles className="w-4 h-4 text-[#fed700] group-hover:rotate-12 transition-transform" />
                <span>Google AI Studio Cargo Scanner</span>
              </button>

              <button
                onClick={() => setCurrentPage('coverage')}
                className="text-slate-300 hover:text-white font-semibold text-sm flex items-center gap-1.5 px-3 py-2 transition-colors"
              >
                <span>View Coverage Map</span>
                <ArrowRight className="w-4 h-4 text-[#fed700]" />
              </button>
            </div>

            {/* Key Trust Signals Bar (Interactive) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-emerald-900/40">
              {hero.stats.map((stat, idx) => {
                const getTarget = (lbl: string): PageView => {
                  const l = lbl.toLowerCase();
                  if (l.includes('state') || l.includes('coverage') || l.includes('network')) return 'coverage';
                  if (l.includes('year') || l.includes('experience') || l.includes('trust')) return 'about';
                  if (l.includes('fleet') || l.includes('truck')) return 'about';
                  if (l.includes('time') || l.includes('delivery') || l.includes('rate')) return 'tracking';
                  return 'services';
                };
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentPage(getTarget(stat.label))}
                    className="text-left group transition-transform active:scale-95 cursor-pointer hover:opacity-95"
                    title={`Click to explore ${stat.label}`}
                  >
                    <p className="text-2xl sm:text-3xl font-black text-[#fed700] group-hover:text-white tracking-tight transition-colors">{stat.value}</p>
                    <p className="text-xs font-medium text-slate-400 group-hover:text-emerald-300 uppercase tracking-wider mt-0.5 transition-colors">{stat.label}</p>
                  </button>
                );
              })}
            </div>

          </div>

          {/* Right Column: Quick Rate & Move Estimator Widget */}
          <div className="lg:col-span-5">
            <div className="bg-[#0f2e1b]/80 backdrop-blur-xl border border-emerald-700/40 rounded-3xl p-6 shadow-2xl shadow-emerald-950/50">
              
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-emerald-800/60">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-gradient-to-br from-amber-400 to-[#fed700] text-slate-950 rounded-xl font-bold shadow-md">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-base">Quick Move & Freight Quote</h3>
                    <p className="text-xs text-slate-300">Instant estimate for Nigeria & Pan-Africa</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-300 bg-emerald-900/40 border border-emerald-600/40 px-2.5 py-0.5 rounded-full">
                  <Clock className="w-3 h-3 text-[#83b735]" />
                  <span>2 Mins</span>
                </div>
              </div>

              <form onSubmit={handleHeroSubmit} className="space-y-3.5">
                
                {/* Transit Route Mode: Intra vs Inter */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Route className="w-3.5 h-3.5 text-amber-400" />
                      <span>Route Classification</span>
                    </label>
                    <span className="text-[10px] text-amber-400 font-semibold">
                      {transitMode === 'intra' ? 'Local City Move' : 'Inter-State Transit'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleTransitModeChange('intra')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                        transitMode === 'intra'
                          ? 'bg-gradient-to-r from-[#fed700] to-amber-500 text-slate-950 border-amber-300 shadow-md font-black'
                          : 'bg-slate-950/70 text-slate-300 border-emerald-900/40 hover:bg-emerald-950/50 hover:border-emerald-700'
                      }`}
                      id="hero-mode-intra-btn"
                    >
                      <Building2 className="w-3.5 h-3.5 shrink-0" />
                      <span>Intra-State</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTransitModeChange('inter')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                        transitMode === 'inter'
                          ? 'bg-gradient-to-r from-[#fed700] to-amber-500 text-slate-950 border-amber-300 shadow-md font-black'
                          : 'bg-slate-950/70 text-slate-300 border-emerald-900/40 hover:bg-emerald-950/50 hover:border-emerald-700'
                      }`}
                      id="hero-mode-inter-btn"
                    >
                      <Truck className="w-3.5 h-3.5 shrink-0" />
                      <span>Inter-State</span>
                    </button>
                  </div>
                </div>

                {/* Service Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Service Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'corporate', label: 'Corporate' },
                      { id: 'commercial', label: 'Commercial' },
                      { id: 'residential', label: 'Residential' },
                      { id: 'haulage', label: 'Heavy Haulage' },
                    ].map((svc) => (
                      <button
                        type="button"
                        key={svc.id}
                        onClick={() => setSelectedService(svc.id as ServiceType)}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
                          selectedService === svc.id
                            ? 'bg-gradient-to-r from-[#fed700] to-amber-500 text-slate-950 border-amber-300 shadow-md font-extrabold'
                            : 'bg-slate-950/70 text-slate-300 border-emerald-900/40 hover:bg-emerald-950/50 hover:border-emerald-700'
                        }`}
                        id={`hero-svc-btn-${svc.id}`}
                      >
                        <span>{svc.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Origin City */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#83b735]" />
                      <span>Origin (Pick-Up Hub)</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setLocationModalTarget('origin')}
                      className="px-2 py-0.5 rounded-lg bg-emerald-900/30 hover:bg-emerald-900/50 border border-emerald-600/40 text-emerald-300 font-bold text-[11px] transition-all active:scale-95 cursor-pointer shadow-sm group"
                      title="Open Interactive Nigerian Location & Hub Directory"
                      id="hero-origin-location-selector-btn"
                    >
                      <span>Browse 774 LGAs</span>
                    </button>
                  </div>
                  <div className="relative">
                    <select
                      value={origin}
                      onChange={(e) => {
                        const newOrig = e.target.value;
                        setOrigin(newOrig);
                        if (transitMode === 'intra') {
                           setDestination(newOrig);
                        }
                      }}
                      className="w-full bg-slate-950/90 border border-emerald-800/50 focus:border-[#83b735] text-white text-xs sm:text-sm rounded-xl px-3.5 py-2.5 outline-none transition-colors"
                      id="hero-origin-select"
                    >
                      {!NIGERIAN_CITIES.includes(origin) && (
                        <option value={origin} className="bg-slate-900 text-white font-bold text-emerald-400">
                          📍 {origin}
                        </option>
                      )}
                      {NIGERIAN_CITIES.map((c) => (
                        <option key={c} value={c} className="bg-slate-900 text-white">
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Destination City */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Navigation className="w-3.5 h-3.5 text-[#83b735]" />
                      <span>Destination (Drop-Off Hub)</span>
                    </label>
                    {transitMode === 'intra' ? (
                      <span className="text-[10px] text-emerald-300 font-bold bg-emerald-900/30 border border-emerald-600/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span>🔒 Same State / Metro</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setLocationModalTarget('destination')}
                        className="px-2 py-0.5 rounded-lg bg-emerald-900/30 hover:bg-emerald-900/50 border border-emerald-600/40 text-emerald-300 font-bold text-[11px] transition-all active:scale-95 cursor-pointer shadow-sm group"
                        title="Open Interactive Nigerian Location & Hub Directory"
                        id="hero-destination-location-selector-btn"
                      >
                        <span>Browse 774 LGAs</span>
                      </button>
                    )}
                  </div>
                  {transitMode === 'intra' ? (
                    <div className="w-full bg-slate-950/90 border border-emerald-700/40 text-slate-200 text-xs rounded-xl px-3.5 py-2.5 flex items-center justify-between">
                      <span className="font-semibold text-white truncate mr-2">📍 {origin} (Intra-Metro)</span>
                      <button
                        type="button"
                        onClick={() => setLocationModalTarget('origin')}
                        className="text-[10px] text-[#fed700] hover:underline font-bold whitespace-nowrap cursor-pointer"
                      >
                        Change LGA
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <select
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        className="w-full bg-slate-950/90 border border-emerald-800/50 focus:border-[#83b735] text-white text-xs sm:text-sm rounded-xl px-3.5 py-2.5 outline-none transition-colors"
                        id="hero-destination-select"
                      >
                        {!NIGERIAN_CITIES.includes(destination) && (
                          <option value={destination} className="bg-slate-900 text-white font-bold text-emerald-400">
                            📍 {destination}
                          </option>
                        )}
                        {NIGERIAN_CITIES.map((c) => (
                          <option key={c} value={c} className="bg-slate-900 text-white">
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#fed700] via-amber-400 to-[#fed700] hover:from-amber-300 hover:to-[#fed700] text-slate-950 font-black text-sm py-3.5 rounded-2xl shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 transition-all transform active:scale-95 cursor-pointer"
                    id="hero-calculate-rate-btn"
                  >
                    <span>{hero.primaryBtnText}</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>

                <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 pt-1">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Instant Price Range</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentPage('services')}
                    className="flex items-center gap-1 text-slate-300 hover:text-amber-400 active:scale-95 transition-all cursor-pointer group"
                    title="Click to view Goods-In-Transit Insurance options"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                    <span className="underline decoration-dotted group-hover:text-amber-300">Goods-In-Transit Insured</span>
                  </button>
                </div>

              </form>

            </div>
          </div>

        </div>
      </div>

      {/* Interactive Location Selector Modal */}
      {locationModalTarget && (
        <LocationSelectorModal
          isOpen={!!locationModalTarget}
          onClose={() => setLocationModalTarget(null)}
          targetField={locationModalTarget}
          targetType={locationModalTarget}
          transitMode={transitMode}
          currentStateId={findStateIdFromCity(locationModalTarget === 'origin' ? origin : destination)}
          currentLgaName=""
          onSelectLocation={handleLocationSelect}
          onSwitchTransitMode={(mode) => handleTransitModeChange(mode)}
          pairedStateId={transitMode === 'intra' ? findStateIdFromCity(origin) : undefined}
        />
      )}
    </div>
  );
};
