import React, { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Navigation, 
  Globe, 
  Building, 
  CheckCircle, 
  Copy, 
  ExternalLink, 
  Route, 
  Radio, 
  Truck, 
  MessageSquare, 
  UserCheck, 
  ChevronRight,
  ShieldCheck,
  Calculator
} from 'lucide-react';
import { OfficeLocation, ServiceType } from '../types';
import { useCms } from '../context/CmsContext';
import { NetworkCoverageMap } from './NetworkCoverageMap';

interface CoverageMapSectionProps {
  onOpenQuoteModal?: (service?: ServiceType, origin?: string, destination?: string) => void;
}

export const CoverageMapSection: React.FC<CoverageMapSectionProps> = ({ onOpenQuoteModal }) => {
  const { cms } = useCms();
  const branches = cms.branches;
  const company = cms.company;

  const [selectedRegion, setSelectedRegion] = useState<'All' | 'Nigeria' | 'Pan-Africa'>('All');
  const [activeOfficeId, setActiveOfficeId] = useState<string>(branches[0]?.id || 'abuja-hq');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredOffices = branches.filter((off) => {
    if (selectedRegion === 'All') return true;
    return off.region === selectedRegion;
  });

  const activeOffice = branches.find((o) => o.id === activeOfficeId) || branches[0] || {
    id: 'hq',
    city: 'Abuja',
    type: 'headquarters',
    address: company.headquartersAbuja.address,
    phones: company.phones,
    email: company.email,
    stateCountry: 'FCT, Nigeria',
    region: 'Nigeria',
    coordinates: { lat: 9.0765, lng: 7.3986 },
    hours: company.workingHours,
    isMainHub: true,
  };

  const handleCopyAddress = (address: string, id: string) => {
    navigator.clipboard.writeText(address);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <section id="coverage-network" className="py-16 lg:py-24 bg-slate-900 text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-block text-amber-400 font-extrabold text-xs uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 px-3.5 py-1 rounded-full">
            Strategic Operating Hubs & Corridors
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Nationwide Nigeria & Pan-African Logistics Network
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Headquartered in <strong className="text-amber-400">Abuja</strong> with our main maritime haulage hub in <strong className="text-amber-400">Lagos</strong>, connected via scheduled express freight corridors across 36 Nigerian states and cross-border ECOWAS routes to Accra, Ghana and beyond.
          </p>
        </div>

        {/* 1. FEATURED: Interactive Network Connectivity Map with Clickable Pins & Manager Popups */}
        <div className="space-y-4">
          <NetworkCoverageMap 
            branches={branches}
            activeOfficeId={activeOfficeId}
            onSelectOffice={(id) => {
              setActiveOfficeId(id);
              const el = document.getElementById(`office-item-${id}`);
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
              }
            }}
            onOpenQuoteModal={onOpenQuoteModal}
          />
        </div>

        {/* Region Selector Pills */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white">Branch Directory & Regional Depots</h3>
            <p className="text-xs text-slate-400">Select any operating branch below for direct dispatch lines and local manager contacts</p>
          </div>

          <div className="flex justify-center gap-2">
            {(['All', 'Nigeria', 'Pan-Africa'] as const).map((region) => (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                  selectedRegion === region
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg font-black'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                {region === 'All' ? 'All Operating Locations' : region === 'Nigeria' ? '🇳🇬 Nigeria Nationwide' : '🌍 Pan-African Corridors'}
              </button>
            ))}
          </div>
        </div>

        {/* Map Visualizer & Branch Details Grid */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Interactive Office List */}
          <div className="lg:col-span-5 space-y-3 max-h-[580px] overflow-y-auto pr-1">
            {filteredOffices.map((office) => {
              const isActive = activeOffice.id === office.id;
              const isHQ = office.type === 'headquarters';
              return (
                <div
                  key={office.id}
                  onClick={() => setActiveOfficeId(office.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isActive
                      ? 'bg-slate-850 border-amber-400 shadow-xl shadow-amber-500/10 scale-[1.01]'
                      : 'bg-slate-950/70 border-slate-800 hover:bg-slate-850 hover:border-slate-700'
                  }`}
                  id={`office-item-${office.id}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`p-2.5 rounded-xl shrink-0 ${
                        office.isMainHub 
                          ? 'bg-amber-500 text-slate-950 font-black' 
                          : isActive 
                            ? 'bg-amber-500/20 text-amber-400' 
                            : 'bg-slate-800 text-slate-400'
                      }`}>
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-white text-sm">{office.city} Office</h4>
                          {office.isMainHub && (
                            <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                              {isHQ ? 'Corporate HQ' : 'Main Hub'}
                            </span>
                          )}
                        </div>
                        <p className="text-slate-400 text-xs mt-0.5">{office.stateCountry}</p>
                      </div>
                    </div>

                    <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                      {office.region}
                    </span>
                  </div>

                  {/* Local Manager Snippet */}
                  {office.managerName && (
                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
                      <div className="flex items-center gap-2 truncate">
                        <img 
                          src={office.managerAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'} 
                          alt={office.managerName}
                          className="w-5 h-5 rounded-full object-cover border border-amber-400 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <span className="text-slate-300 truncate">Lead: <strong className="text-white">{office.managerName}</strong></span>
                      </div>
                      <span className="text-amber-400 text-[11px] font-mono shrink-0">{office.phones?.[0] || '08062466212'}</span>
                    </div>
                  )}

                  {isActive && (
                    <div className="mt-3 pt-3 border-t border-slate-800 space-y-2 text-xs text-slate-300 animate-fade-in">
                      <p className="leading-snug text-slate-200">
                        <strong className="text-white">Address:</strong> {office.address}
                      </p>
                      {office.landmark && (
                        <p className="text-[11px] text-amber-400 font-medium">
                          <strong>Landmark:</strong> {office.landmark}
                        </p>
                      )}

                      {office.coverageAreas && (
                        <p className="text-[11px] text-slate-400">
                          <strong className="text-slate-300">Coverage Jurisdiction:</strong> {office.coverageAreas}
                        </p>
                      )}

                      <div className="flex items-center rounded-xl bg-slate-950 border border-slate-800 overflow-hidden mt-2 p-0.5" onClick={(e) => e.stopPropagation()}>
                        <a
                          href={`tel:${office.managerPhone || office.phones?.[0] || '08062466212'}`}
                          className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all text-center"
                        >
                          <Phone className="w-3 h-3" />
                          <span>Call Manager</span>
                        </a>
                        <a
                          href={`https://wa.me/${office.whatsappPhone || '2348062466212'}?text=Hello%20${encodeURIComponent(office.managerName || 'Manager')},%20I%20am%20inquiring%20about%20freight%20services%20from%20the%20${encodeURIComponent(office.city)}%20hub.`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 hover:bg-emerald-600/30 text-emerald-400 hover:text-emerald-300 font-bold text-[11px] py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all text-center"
                        >
                          <span>WhatsApp</span>
                        </a>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-slate-400 text-[11px]">
                          {office.hours ? office.hours.split('(')[0] : 'Mon - Sat: 7am - 7pm'}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyAddress(office.address, office.id);
                          }}
                          className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded"
                        >
                          {copiedId === office.id ? (
                            <>
                              <CheckCircle className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy Address</span>
                            </>
                          )}
                        </button>
                      </div>

                      {onOpenQuoteModal && (
                        <div className="pt-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenQuoteModal('corporate', office.city);
                            }}
                            className="w-full bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500 hover:to-amber-400 text-amber-300 hover:text-slate-950 border border-amber-500/40 hover:border-transparent font-black text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow transition-all active:scale-95"
                          >
                            <Calculator className="w-3.5 h-3.5" />
                            <span>Calculate Price (Origin: {office.city})</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Column: Selected Branch Focus Card */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Active Office Detail Card */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-amber-500 text-slate-950 text-xs font-black px-2.5 py-0.5 rounded-full uppercase">
                      {activeOffice.type}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">{activeOffice.region} Operations</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white mt-1">
                    {activeOffice.city} Terminal & Depot
                  </h3>
                </div>

                <div className="flex items-center rounded-xl bg-slate-900 border border-slate-800 p-0.5 overflow-hidden">
                  <a
                    href={`tel:${activeOffice.managerPhone || activeOffice.phones?.[0] || '08062466212'}`}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-lg shadow flex items-center gap-1.5 transition-transform active:scale-95"
                    title={`Call Terminal: ${activeOffice.managerPhone || activeOffice.phones?.[0] || '08062466212'}`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Terminal</span>
                  </a>
                  <a
                    href={`https://wa.me/${activeOffice.whatsappPhone || '2348062466212'}?text=Hello%20${encodeURIComponent(activeOffice.managerName || 'Manager')},%20I%20am%20inquiring%20about%20a%20relocation%20or%20freight%20booking%20from%20${encodeURIComponent(activeOffice.city || 'Hub')}.`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-400 hover:text-white hover:bg-emerald-600/40 font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all active:scale-95"
                    title="Message Terminal on WhatsApp"
                  >
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* Station Manager Spotlight Profile */}
              {activeOffice.managerName && (
                <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <img 
                      src={activeOffice.managerAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'} 
                      alt={activeOffice.managerName}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-400 shadow-md shrink-0" 
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider">Assigned Station Manager</span>
                      </div>
                      <h4 className="text-white font-black text-base">{activeOffice.managerName}</h4>
                      <p className="text-slate-400 text-xs">{activeOffice.managerTitle || 'Terminal Lead'}</p>
                    </div>
                  </div>

                  <div className="text-right sm:text-right space-y-1 w-full sm:w-auto">
                    <span className="text-[10px] text-slate-400 block">Direct Manager Desk</span>
                    <a 
                      href={`tel:${activeOffice.managerPhone || activeOffice.phones?.[0] || '08062466212'}`}
                      className="text-amber-400 font-mono font-bold text-xs sm:text-sm hover:underline block"
                    >
                      {activeOffice.managerPhone || activeOffice.phones?.[0] || '08062466212'}
                    </a>
                    {activeOffice.managerEmail && (
                      <a 
                        href={`mailto:${activeOffice.managerEmail}`}
                        className="text-slate-400 text-[11px] hover:text-white block"
                      >
                        {activeOffice.managerEmail}
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Grid of details */}
              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                
                <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-1.5">
                  <div className="flex items-center gap-2 text-amber-400 font-bold">
                    <Building className="w-4 h-4" />
                    <span>Physical Terminal Address</span>
                  </div>
                  <p className="text-white font-medium leading-relaxed">
                    {activeOffice.address}
                  </p>
                  {activeOffice.landmark && (
                    <p className="text-[11px] text-slate-400">
                      Near: {activeOffice.landmark}
                    </p>
                  )}
                  {activeOffice.fleetCapacity && (
                    <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] text-slate-300 flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-amber-400" />
                      <span>Fleet: <strong className="text-white">{activeOffice.fleetCapacity}</strong></span>
                    </div>
                  )}
                </div>

                <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-1.5">
                  <div className="flex items-center gap-2 text-amber-400 font-bold">
                    <Phone className="w-4 h-4" />
                    <span>Direct Lines & Dispatch</span>
                  </div>
                  <div className="space-y-1">
                    {activeOffice.phones.map((ph, i) => (
                      <p key={i} className="text-white font-mono font-medium">
                        {ph}
                      </p>
                    ))}
                    <p className="text-[11px] text-slate-400 pt-1">{activeOffice.hours}</p>
                    {activeOffice.coverageAreas && (
                      <p className="text-[10px] text-slate-400 pt-1">
                        <strong>Jurisdiction:</strong> {activeOffice.coverageAreas}
                      </p>
                    )}
                  </div>
                </div>

              </div>

              {/* Haulage Route Highlights */}
              <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300">Active Express Haulage Corridors from {activeOffice.city}:</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Daily Departures
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  {activeOffice.city === 'Abuja' && (
                    <>
                      <span className="bg-slate-800 text-slate-200 px-3 py-1 rounded-lg border border-slate-700">Abuja ⇄ Lagos Express (24-36 hrs)</span>
                      <span className="bg-slate-800 text-slate-200 px-3 py-1 rounded-lg border border-slate-700">Abuja ⇄ Kano / Kaduna Spine</span>
                      <span className="bg-slate-800 text-slate-200 px-3 py-1 rounded-lg border border-slate-700">Abuja ⇄ Port Harcourt / Eastern Corridor</span>
                    </>
                  )}
                  {activeOffice.city === 'Lagos' && (
                    <>
                      <span className="bg-slate-800 text-slate-200 px-3 py-1 rounded-lg border border-slate-700">Lagos Ports ⇄ Abuja FCT Hub</span>
                      <span className="bg-slate-800 text-slate-200 px-3 py-1 rounded-lg border border-slate-700">Lagos ⇄ Onitsha / Aba / PH</span>
                      <span className="bg-slate-800 text-slate-200 px-3 py-1 rounded-lg border border-slate-700">Lagos ⇄ Cotonou / Lome / Accra (ECOWAS)</span>
                    </>
                  )}
                  {activeOffice.city !== 'Abuja' && activeOffice.city !== 'Lagos' && (
                    <>
                      <span className="bg-slate-800 text-slate-200 px-3 py-1 rounded-lg border border-slate-700">{activeOffice.city} ⇄ Abuja HQ Direct</span>
                      <span className="bg-slate-800 text-slate-200 px-3 py-1 rounded-lg border border-slate-700">{activeOffice.city} ⇄ Lagos Maritime Terminal</span>
                      <span className="bg-slate-800 text-slate-200 px-3 py-1 rounded-lg border border-slate-700">Intra-State & Neighboring LGA Dispatch</span>
                    </>
                  )}
                </div>
              </div>

              {/* Call to action */}
              {onOpenQuoteModal && (
                <div className="pt-2">
                  <button
                    onClick={() => onOpenQuoteModal('corporate', activeOffice.city)}
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm py-3.5 px-6 rounded-2xl shadow-xl flex items-center justify-center gap-2.5 transition-all active:scale-[0.99] border border-amber-400/40"
                  >
                    <Calculator className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                    <span>Calculate Price (Origin: {activeOffice.city})</span>
                  </button>
                </div>
              )}

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

