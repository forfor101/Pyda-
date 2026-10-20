import React from 'react';
import { 
  Shield, 
  Award, 
  Clock, 
  Radio, 
  Truck, 
  Users, 
  CheckCircle2, 
  ChevronRight, 
  MapPin, 
  Phone,
  ShieldCheck,
  Sparkles,
  Quote,
  Building2,
  Globe2
} from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { PageView } from '../types';
import registeredSignImg from '../assets/images/registered_trademark_sign_1790283777721.jpg';

interface AboutSectionProps {
  onOpenQuoteModal?: () => void;
  onNavigatePage?: (page: PageView) => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onOpenQuoteModal, onNavigatePage }) => {
  const { cms } = useCms();
  const { about, company } = cms;

  const ceo = about.leadershipTeam.find((l) => l.id === 'team-1' || l.role.toLowerCase().includes('ceo') || l.role.toLowerCase().includes('chief executive')) || about.leadershipTeam[0];
  const otherLeaders = about.leadershipTeam.filter((l) => l.id !== ceo?.id);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Clock': return <Clock className="w-6 h-6 text-amber-400" />;
      case 'ShieldCheck': return <ShieldCheck className="w-6 h-6 text-emerald-400" />;
      case 'Radio': return <Radio className="w-6 h-6 text-sky-400" />;
      case 'Award': return <Award className="w-6 h-6 text-amber-400" />;
      default: return <Truck className="w-6 h-6 text-amber-400" />;
    }
  };

  const handleValueClick = (valTitle: string) => {
    const lower = valTitle.toLowerCase();
    if (lower.includes('time') || lower.includes('clock') || lower.includes('precision')) {
      if (onOpenQuoteModal) onOpenQuoteModal();
    } else if (lower.includes('damage') || lower.includes('shield') || lower.includes('guarantee')) {
      if (onNavigatePage) onNavigatePage('services');
    } else if (lower.includes('telematics') || lower.includes('gps') || lower.includes('satellite') || lower.includes('radio')) {
      if (onNavigatePage) onNavigatePage('tracking');
    } else {
      if (onNavigatePage) onNavigatePage('contact');
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Banner for About Us */}
      <section className="relative bg-slate-900 border-b border-slate-800 text-white overflow-hidden py-16 lg:py-24">
        <div className="absolute inset-0 z-0">
          <img
            src={about.heroImage || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1400&auto=format&fit=crop&q=80'}
            alt="Pyda Movers Logistics Facility"
            className="w-full h-full object-cover opacity-25 filter brightness-75"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-slate-900/60" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
            <img
              src={registeredSignImg}
              alt="Registered Sign"
              referrerPolicy="no-referrer"
              className="w-4 h-4 rounded-full object-cover ring-1 ring-amber-400/50 shadow-sm"
            />
            <span>Since {about.foundedYear} • Pyda Movers® Registered Corporate Carrier (RC: 1842091)</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white max-w-3xl leading-tight">
            Pioneering Precision Logistics & Zero-Downtime Relocations
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed">
            {about.story}
          </p>

          <div className="grid sm:grid-cols-2 gap-4 pt-4 max-w-3xl">
            <div className="bg-slate-950/80 border border-slate-800 p-5 rounded-2xl">
              <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider mb-1">Our Mission</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{about.mission}</p>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 p-5 rounded-2xl">
              <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider mb-1">Our Vision</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{about.vision}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Operational Values */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-amber-400 text-xs font-extrabold uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
            Our Commitments
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">The Pyda Standard</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {about.coreValues.map((val, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleValueClick(val.title)}
              className="bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/40 p-6 rounded-2xl transition-all group shadow-md text-left active:scale-[0.98] cursor-pointer flex flex-col justify-between"
              title={`Click to explore ${val.title}`}
            >
              <div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 w-fit mb-4 group-hover:border-amber-500/40 group-hover:scale-110 transition-all">
                  {getIcon(val.icon)}
                </div>
                <h3 className="font-extrabold text-white text-base mb-2 group-hover:text-amber-400 transition-colors">{val.title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{val.desc}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 w-full flex items-center justify-between text-[11px] font-bold text-amber-400 opacity-80 group-hover:opacity-100">
                <span>Explore Guarantee</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Heavy Haulage Fleet Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <span className="text-amber-400 text-xs font-black uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                Transportation Capabilities
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">
                Modern Dedicated Fleet Showcase
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
                Every vehicle in our fleet is company-owned, climate-sealed, and satellite GPS-monitored 24/7.
              </p>
            </div>
            {onOpenQuoteModal && (
              <button
                onClick={onOpenQuoteModal}
                className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all active:scale-95 shrink-0 flex items-center gap-2 cursor-pointer"
              >
                <Truck className="w-4 h-4" />
                <span>Charter a Fleet Vehicle</span>
              </button>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {about.fleetShowcase.map((fleet) => (
              <div key={fleet.id} className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex flex-col group hover:border-slate-700 transition-all">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={fleet.imageUrl}
                    alt={fleet.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <span className="text-[11px] font-black px-2.5 py-1 rounded bg-amber-500 text-slate-950 uppercase">
                      {fleet.capacity}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-white mb-1.5">{fleet.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed mb-4">{fleet.description}</p>
                  </div>

                  <div className="space-y-1.5 pt-3 border-t border-slate-800/80">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Specifications:</p>
                    {fleet.specs.map((spec, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{spec}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={onOpenQuoteModal}
                      className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-amber-500 text-slate-300 hover:text-slate-950 border border-slate-800 hover:border-amber-400 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer"
                    >
                      <Truck className="w-3.5 h-3.5 text-amber-400 group-hover/btn:text-slate-950" />
                      <span>Charter {fleet.title.split(' ')[0]}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Executive Leadership & CEO Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-amber-400 text-xs font-extrabold uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 px-3.5 py-1 rounded-full inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Executive Leadership & Governance</span>
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-white">Guiding Pyda's Pan-African Vision</h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Backed by seasoned freight planners, corporate logistics directors, and certified riggers.
          </p>
        </div>

        {/* Highlighted CEO Feature Card */}
        {ceo && (
          <div className="relative bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-10 shadow-2xl overflow-hidden group">
            {/* Background Ambient Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 grid md:grid-cols-12 gap-8 items-center">
              {/* CEO Portrait Column */}
              <div className="md:col-span-4 flex flex-col items-center text-center">
                <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-3xl p-1 bg-gradient-to-tr from-amber-500 via-amber-300 to-amber-600 shadow-2xl shadow-amber-500/20">
                  <div className="w-full h-full rounded-[22px] overflow-hidden bg-slate-950 relative">
                    <img
                      src={ceo.avatar}
                      alt={ceo.name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-[22px]" />
                  </div>
                  {/* Verified Badge */}
                  <div className="absolute -bottom-3 -right-3 bg-amber-500 text-slate-950 p-2 rounded-2xl shadow-xl flex items-center gap-1 border-2 border-slate-900">
                    <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
                  </div>
                </div>

                <div className="mt-4 space-y-1">
                  <span className="inline-flex items-center gap-1 bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                    <Award className="w-3 h-3 text-amber-400" />
                    <span>Founder & CEO</span>
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white">{ceo.name}</h3>
                  <p className="text-xs font-bold text-amber-400">{ceo.role}</p>
                </div>
              </div>

              {/* CEO Message & Credentials Column */}
              <div className="md:col-span-8 space-y-6">
                <div className="relative bg-slate-950/70 border border-slate-800 p-6 sm:p-7 rounded-2xl shadow-inner">
                  <Quote className="w-8 h-8 text-amber-500/40 mb-3" />
                  <p className="text-slate-200 text-sm sm:text-base leading-relaxed italic font-serif">
                    "At Pyda Movers & Logistics, we believe that moving an organization's headquarters or a family's cherished home is a sacred trust. Our standard is uncompromising: flawless scheduling, satellite GPS transparency, comprehensive goods protection, and absolute zero downtime across Nigeria and Pan-Africa."
                  </p>
                  <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white uppercase tracking-wider">{ceo.name}</p>
                      <p className="text-[11px] text-slate-400">Executive Address • Abuja Headquarters</p>
                    </div>
                    <span className="text-xs font-serif font-black text-amber-400 tracking-widest uppercase italic">
                      — Executive Directorate
                    </span>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="bg-slate-950/50 border border-slate-800/80 p-3.5 rounded-xl">
                    <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Experience</p>
                    <p className="text-sm font-black text-white mt-0.5">18+ Years</p>
                    <p className="text-[10px] text-slate-400">Freight & Supply Chain</p>
                  </div>
                  <div className="bg-slate-950/50 border border-slate-800/80 p-3.5 rounded-xl">
                    <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Coverage</p>
                    <p className="text-sm font-black text-white mt-0.5">36 States + ECOWAS</p>
                    <p className="text-[10px] text-slate-400">Nigeria & Regional Reach</p>
                  </div>
                  <div className="bg-slate-950/50 border border-slate-800/80 p-3.5 rounded-xl">
                    <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Commitment</p>
                    <p className="text-sm font-black text-white mt-0.5">100% In-Transit Cover</p>
                    <p className="text-[10px] text-slate-400">Comprehensive Safety</p>
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {ceo.bio}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Other Management Team Members */}
        {otherLeaders.length > 0 && (
          <div className="space-y-4 pt-4">
            <h3 className="text-lg font-black text-white text-center sm:text-left flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-400" />
              <span>Operations & Fleet Directorate</span>
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherLeaders.map((leader) => (
                <div key={leader.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row gap-5 items-center sm:items-start hover:border-slate-700 transition-all shadow-md group">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-slate-700 shrink-0 shadow-lg relative bg-slate-950">
                    <img
                      src={leader.avatar}
                      alt={leader.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="flex-1 text-center sm:text-left space-y-2">
                    <div>
                      <h4 className="text-base font-bold text-white">{leader.name}</h4>
                      <p className="text-xs font-semibold text-amber-400 mt-0.5">{leader.role}</p>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                      {leader.bio}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
