import React from 'react';
import { ShieldCheck, Award, Truck, Users, ArrowRight } from 'lucide-react';
import { PageView } from '../types';

interface TrustBadgesProps {
  onNavigatePage?: (page: PageView) => void;
  onOpenQuoteModal?: () => void;
}

export const TrustBadges: React.FC<TrustBadgesProps> = ({ onNavigatePage, onOpenQuoteModal }) => {
  const pillars: {
    icon: React.ReactNode;
    title: string;
    desc: string;
    actionLabel: string;
    action: () => void;
  }[] = [
    {
      icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
      title: '100% Fully Insured',
      desc: 'Comprehensive Goods-In-Transit & Cargo Liability protection for every load.',
      actionLabel: 'View Insurance Plans',
      action: () => {
        if (onNavigatePage) {
          onNavigatePage('services');
          setTimeout(() => {
            const el = document.getElementById('open-transit-insurance-btn');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        } else if (onOpenQuoteModal) {
          onOpenQuoteModal();
        }
      },
    },
    {
      icon: <Truck className="w-6 h-6 text-amber-400" />,
      title: 'Pan-African Fleet',
      desc: 'Owned & managed fleet ranging from 3-ton vans to 30-ton haulage trailers.',
      actionLabel: 'Explore Fleet Vehicles',
      action: () => {
        if (onNavigatePage) {
          onNavigatePage('about');
        } else if (onOpenQuoteModal) {
          onOpenQuoteModal();
        }
      },
    },
    {
      icon: <Award className="w-6 h-6 text-amber-400" />,
      title: 'Zero Downtime',
      desc: 'Specialized phased weekend moves to ensure uninterrupted business continuity.',
      actionLabel: 'Plan Corporate Move',
      action: () => {
        if (onOpenQuoteModal) {
          onOpenQuoteModal();
        } else if (onNavigatePage) {
          onNavigatePage('services');
        }
      },
    },
    {
      icon: <Users className="w-6 h-6 text-blue-400" />,
      title: 'Certified Riggers',
      desc: 'Vetted, uniform-wearing, background-checked professional packing teams.',
      actionLabel: 'Meet Logistics Team',
      action: () => {
        if (onNavigatePage) {
          onNavigatePage('about');
        } else if (onOpenQuoteModal) {
          onOpenQuoteModal();
        }
      },
    },
  ];

  return (
    <section className="py-12 bg-slate-950 text-white border-t border-b border-slate-800" id="trust-pillars-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Core Pillars */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar, idx) => (
            <button
              key={idx}
              type="button"
              onClick={pillar.action}
              className="bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/50 p-5 rounded-2xl flex flex-col justify-between text-left transition-all group shadow-md hover:shadow-xl active:scale-[0.98] cursor-pointer"
              title={`Click to ${pillar.actionLabel.toLowerCase()}`}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-slate-950 group-hover:bg-slate-900 rounded-xl border border-slate-800 group-hover:border-amber-500/30 shrink-0 transition-colors group-hover:scale-110 transform duration-200">
                  {pillar.icon}
                </div>
                <div>
                  <h4 className="font-extrabold text-white text-sm group-hover:text-amber-400 transition-colors">{pillar.title}</h4>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed">{pillar.desc}</p>
                </div>
              </div>
              <div className="pt-3 mt-3 border-t border-slate-800/80 w-full flex items-center justify-between text-[11px] font-bold text-amber-400 group-hover:text-amber-300">
                <span>{pillar.actionLabel}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
