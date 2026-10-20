import React, { useState } from 'react';
import { Building2, Store, Home, Truck, Car, Check, ArrowRight, ShieldCheck, ChevronRight, Calculator, FileText, CheckCircle2, Shield, Info, Receipt } from 'lucide-react';
import { ServiceType } from '../types';
import { useCms } from '../context/CmsContext';
import { TransitInsuranceModal, InsurancePlanId } from './TransitInsuranceModal';

interface ServicesSectionProps {
  onOpenQuoteWithService: (service: ServiceType) => void;
  onOpenTransitInsurance?: () => void;
  onOpenCarHireModal?: () => void;
  activeService?: ServiceType;
  onSelectService?: (service: ServiceType) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ 
  onOpenQuoteWithService, 
  onOpenTransitInsurance,
  onOpenCarHireModal,
  activeService,
  onSelectService,
}) => {
  const { cms } = useCms();
  const services = cms.services;
  const [internalActiveTab, setInternalActiveTab] = useState<string>(services[0]?.id || 'corporate');
  const [isInsuranceModalOpen, setIsInsuranceModalOpen] = useState(false);

  const activeTab = activeService || internalActiveTab;

  const handleTabChange = (serviceId: string) => {
    setInternalActiveTab(serviceId);
    if (onSelectService) {
      onSelectService(serviceId as ServiceType);
    }
  };

  const handleOpenInsurance = () => {
    if (onOpenTransitInsurance) {
      onOpenTransitInsurance();
    } else {
      setIsInsuranceModalOpen(true);
    }
  };

  const getServiceIcon = (iconName: string) => {
    switch (iconName) {
      case 'Building2': return <Building2 className="w-6 h-6" />;
      case 'Store': return <Store className="w-6 h-6" />;
      case 'Home': return <Home className="w-6 h-6" />;
      case 'Truck': return <Truck className="w-6 h-6" />;
      case 'Car': return <Car className="w-6 h-6" />;
      default: return <Truck className="w-6 h-6" />;
    }
  };

  const selectedService = services.find((s) => s.id === activeTab) || services[0];

  if (!selectedService) return null;

  return (
    <section id="services-overview" className="py-16 lg:py-24 bg-slate-950 text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Title & Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-block text-amber-400 font-extrabold text-xs uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 px-3.5 py-1 rounded-full">
            Core Logistics Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Specialized Moving & Haulage Services
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Engineered for precision, speed, and safety. Whether relocating an executive office in Maitama Abuja, a commercial warehouse in Satellite Town Lagos, or dispatching 30-ton haulage trailers across West Africa.
          </p>
        </div>

        {/* ==================================================== */}
        {/* TRANSIT INSURANCE DISCRETIONARY BANNER IN SERVICES */}
        {/* ==================================================== */}
        <div className="bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900 border border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-amber-500/15 border border-amber-500/30 text-amber-400 rounded-2xl shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-black text-white text-sm sm:text-base">Comprehensive Goods-In-Transit (GIT) Insurance</span>
                <span className="text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30">
                  Optional Add-On
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                At customer discretion, add separate all-risk coverage for residential furniture or commercial IT assets backed by Tier-1 underwriters (Leadway & AIICO).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
            <button
              onClick={handleOpenInsurance}
              className="w-full md:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-1.5"
              id="open-transit-insurance-btn"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Explore Protection Plans & Calculator</span>
            </button>
          </div>
        </div>

        {/* Service Navigation Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {services.map((svc) => {
            const isActive = activeTab === svc.id;
            return (
              <button
                key={svc.id}
                onClick={() => handleTabChange(svc.id)}
                className={`p-4 rounded-xl border text-left transition-all active:scale-[0.98] flex flex-col justify-between gap-3 ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-xl shadow-amber-500/20 scale-[1.02]'
                    : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:bg-slate-800 hover:border-slate-700'
                }`}
                id={`service-tab-${svc.id}`}
              >
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-lg ${isActive ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-amber-400'}`}>
                    {getServiceIcon(svc.iconName)}
                  </div>
                  {isActive && <CheckCircle2 className="w-5 h-5 text-slate-950 fill-amber-400" />}
                </div>
                <div>
                  <h3 className="font-black text-sm leading-tight">{svc.title}</h3>
                  <p className={`text-[11px] mt-1 line-clamp-1 ${isActive ? 'text-slate-950 font-medium' : 'text-slate-400'}`}>
                    {svc.tagline}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Service Detail Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="grid lg:grid-cols-12 gap-8 items-start relative z-10">
            
            {/* Left Side: Service Details & Features */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{selectedService.tagline}</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white">
                  {selectedService.title}
                </h3>
                <p className="text-slate-300 text-sm sm:base leading-relaxed">
                  {selectedService.fullDesc}
                </p>
              </div>

              {/* Key Features Grid */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Standard Service Inclusions:
                </h4>
                <div className="grid sm:grid-cols-2 gap-2.5">
                  {selectedService.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-200 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="leading-snug">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ideal For Section */}
              <div className="pt-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                  Ideal Clients & Moving Scenarios:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedService.idealFor.map((item, idx) => (
                    <span
                      key={idx}
                      className="bg-slate-800 border border-slate-700 text-amber-300 text-xs font-semibold px-3 py-1 rounded-lg"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="pt-4 flex flex-wrap items-center gap-3">
                {selectedService.id === 'car_hire' ? (
                  <>
                    <button
                      onClick={() => {
                        if (onOpenCarHireModal) {
                          onOpenCarHireModal();
                        } else {
                          onOpenQuoteWithService('car_hire');
                        }
                      }}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm px-7 py-3.5 rounded-xl shadow-xl shadow-amber-500/20 flex items-center gap-2.5 transition-all transform active:scale-95"
                      id="services-book-car-hire-btn"
                    >
                      <Car className="w-4 h-4 stroke-[2.5]" />
                      <span>Book Car Hire & Instant Rates</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        if (onOpenCarHireModal) {
                          onOpenCarHireModal();
                        } else {
                          onOpenQuoteWithService('car_hire');
                        }
                      }}
                      className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:text-emerald-200 font-bold text-xs px-5 py-3.5 rounded-xl flex items-center gap-2 transition-all active:scale-95"
                      id="services-car-hire-invoice-btn"
                    >
                      <Receipt className="w-4 h-4 text-emerald-400" />
                      <span>Generate Inter/Intra State Receipt / Invoice</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => onOpenQuoteWithService(selectedService.id as ServiceType)}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm px-7 py-3.5 rounded-xl shadow-xl shadow-amber-500/20 flex items-center gap-2.5 transition-all transform active:scale-95"
                    >
                      <Calculator className="w-4 h-4" />
                      <span>Request Quote for {selectedService.title.split(' ')[0]}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={handleOpenInsurance}
                      className="bg-slate-950 hover:bg-slate-800 border border-amber-500/30 text-amber-400 hover:text-amber-300 font-bold text-xs px-5 py-3.5 rounded-xl flex items-center gap-2 transition-all active:scale-95"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Transit Insurance Options</span>
                    </button>
                  </>
                )}
              </div>

            </div>

            {/* Right Side: Image Asset & Process Timeline */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Image Preview for Corporate/Commercial or Service Visual */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-xl group aspect-video">
                <img
                  src={selectedService.imageUrl || 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&auto=format&fit=crop&q=80'}
                  alt={selectedService.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-xs text-slate-200 flex items-center justify-between">
                  <span className="bg-slate-950/80 backdrop-blur px-2.5 py-1 rounded border border-slate-700 font-semibold">
                    Professional Crew
                  </span>
                  <button
                    onClick={handleOpenInsurance}
                    className="bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 px-2.5 py-1 rounded font-black text-xs flex items-center gap-1 shadow-md transition-all"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Insurance Available</span>
                  </button>
                </div>
              </div>

              {/* 4-Step Process Execution */}
              <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800 space-y-3">
                <p className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>4-Step Execution Workflow</span>
                </p>

                <div className="space-y-3">
                  {selectedService.processSteps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-xs">
                      <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 font-black flex items-center justify-center shrink-0">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-bold text-white">{step.title}</p>
                        <p className="text-slate-400 leading-snug mt-0.5">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>

      {/* Transit Insurance Modal Instance */}
      <TransitInsuranceModal
        isOpen={isInsuranceModalOpen}
        onClose={() => setIsInsuranceModalOpen(false)}
        onApplyInsuranceToQuote={(planId, estPremium, val) => {
          setIsInsuranceModalOpen(false);
          onOpenQuoteWithService(selectedService.id as ServiceType);
        }}
      />
    </section>
  );
};
