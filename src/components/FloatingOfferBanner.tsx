import React, { useState } from 'react';
import { 
  Truck, 
  HandCoins, 
  ShieldCheck, 
  TrendingUp, 
  ArrowRight, 
  MessageCircle, 
  CheckCircle2, 
  ArrowLeftRight, 
  X,
  Coins,
  Activity
} from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { PageView } from '../types';

interface FloatingOfferBannerProps {
  onOpenQuoteModal?: () => void;
  onNavigate: (view: PageView) => void;
}

export const FloatingOfferBanner: React.FC<FloatingOfferBannerProps> = ({
  onNavigate,
}) => {
  const { cms } = useCms();
  const { company } = cms;

  const [direction, setDirection] = useState<'left' | 'right'>('left');
  const [isDismissed, setIsDismissed] = useState(false);

  // Fleet management highlights for truck owners and investors
  const fleetPerks = [
    {
      badge: 'GUARANTEED EARNINGS',
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
      title: 'Earn ₦650,000 to ₦3,500,000 Monthly',
      subtitle: 'per truck under Pyda Fleet Management',
      icon: <Coins className="w-3.5 h-3.5 text-amber-400" />,
    },
    {
      badge: 'HEALTH MONITOR',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
      title: 'Real-Time Oil & Tire Pressure Diagnostics',
      subtitle: 'proactive CAN-bus maintenance alerts',
      icon: <Activity className="w-3.5 h-3.5 text-emerald-400" />,
    },
    {
      badge: 'AUTOMATED PAYOUTS',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
      title: '5th of Every Month Direct Remittance',
      subtitle: 'itemized statements & zero delayed payouts',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
    },
    {
      badge: 'COMPREHENSIVE COVER',
      badgeColor: 'bg-sky-500/20 text-sky-300 border border-sky-500/40',
      title: '100% Goods-in-Transit (GIT) Cargo Insurance',
      subtitle: 'underwritten by Leadway & AIICO',
      icon: <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />,
    },
    {
      badge: '24/7 TELEMATICS',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40',
      title: 'Satellite GPS & Remote Odometer Access',
      subtitle: 'transparent portal for truck owners',
      icon: <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />,
    },
    {
      badge: 'ZERO IDLE DAYS',
      badgeColor: 'bg-teal-500/20 text-teal-300 border border-teal-500/40',
      title: 'Dedicated Corporate FMCG & Banking Contracts',
      subtitle: 'vetted background-checked drivers provided',
      icon: <HandCoins className="w-3.5 h-3.5 text-teal-400" />,
    },
    {
      badge: 'TRUCK TONNAGES ACCEPTED',
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
      title: '3.5T–5T Canters • 10T–15T Box Haulers • 20T–30T Trailers',
      subtitle: 'onboarding across Lagos, Abuja, PH & Kano',
      icon: <Truck className="w-3.5 h-3.5 text-amber-400" />,
    },
  ];

  if (isDismissed) {
    return null;
  }

  const handleRegisterClick = () => {
    // If on home page, scroll to the truck registration section, or navigate to investors
    const el = document.getElementById('investor-fleet-teaser-banner') || document.getElementById('investor-fleet-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      onNavigate('investors');
    }
  };

  return (
    <div 
      className="relative z-30 w-full bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white border-b border-amber-500/30 shadow-2xl backdrop-blur-md overflow-hidden"
      id="pyda-fleet-management-register-banner"
    >
      {/* Ambient Top Glow Line */}
      <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.8)]" />

      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 flex flex-col md:flex-row items-center justify-between gap-2.5">
        
        {/* Left Fixed Badge & Program Identity */}
        <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
          <div 
            onClick={handleRegisterClick}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-[11px] uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-md cursor-pointer transition-transform active:scale-95"
            title="Click to register your truck under Pyda Fleet Management"
          >
            <Truck className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>PYDA FLEET MANAGEMENT</span>
          </div>

          <div className="hidden sm:flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-bold px-2 py-0.5 rounded-lg">
            <HandCoins className="w-3 h-3 text-amber-400" />
            <span>Register Your Trucks</span>
          </div>
        </div>

        {/* Center: Dynamic Continuous Ribbon Highlighting Truck Management Perks */}
        <div className="relative w-full overflow-hidden marquee-pause-hover py-0.5 flex-1 select-none">
          
          {/* Subtle Side Fade Overlays for Elegant Edge Transition */}
          <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-12 bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-12 bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none" />

          {/* Marquee Track with Duplicate Items for Infinite Smooth Scrolling */}
          <div className={`${direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right'} gap-8 items-center`}>
            
            {/* First Set of Fleet Management Items */}
            <div className="flex items-center gap-8 shrink-0">
              {fleetPerks.map((item, idx) => (
                <div 
                  key={`fleet-item-1-${idx}`} 
                  className="flex items-center gap-2.5 text-xs text-slate-200 whitespace-nowrap group cursor-pointer hover:text-amber-300 transition-colors"
                  onClick={handleRegisterClick}
                >
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md shadow-sm ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                  <span className="flex items-center gap-1.5">
                    {item.icon}
                    <strong className="text-white font-bold">{item.title}</strong>
                    <span className="text-slate-400 hidden lg:inline font-normal">({item.subtitle})</span>
                  </span>
                  <span className="text-slate-600 font-black">•</span>
                </div>
              ))}
            </div>

            {/* Duplicate Set for Seamless Infinite Loop */}
            <div className="flex items-center gap-8 shrink-0">
              {fleetPerks.map((item, idx) => (
                <div 
                  key={`fleet-item-2-${idx}`} 
                  className="flex items-center gap-2.5 text-xs text-slate-200 whitespace-nowrap group cursor-pointer hover:text-amber-300 transition-colors"
                  onClick={handleRegisterClick}
                >
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md shadow-sm ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                  <span className="flex items-center gap-1.5">
                    {item.icon}
                    <strong className="text-white font-bold">{item.title}</strong>
                    <span className="text-slate-400 hidden lg:inline font-normal">({item.subtitle})</span>
                  </span>
                  <span className="text-slate-600 font-black">•</span>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Right Controls: Register Truck CTA, WhatsApp & Direction Toggle */}
        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
          
          {/* Action CTA Button */}
          <button
            onClick={handleRegisterClick}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs px-3.5 py-1.5 rounded-lg shadow-lg transition-transform active:scale-95 whitespace-nowrap cursor-pointer"
            id="floating-register-truck-btn"
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Register Your Trucks</span>
            <ArrowRight className="w-3 h-3 stroke-[2.5]" />
          </button>

          {/* Quick WhatsApp Fleet Director Link */}
          <a
            href={`https://wa.me/${company.whatsapp || '2348062466212'}?text=Hello%20Pyda%20Fleet%20Directorate,%20I%20am%20a%20truck%20owner%20interested%20in%20registering%20my%20trucks%20under%20Pyda%20Fleet%20Management.`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-400 font-bold text-xs px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
            title="Chat directly with Pyda Fleet Directorate on WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Fleet Desk</span>
          </a>

          {/* Direction Toggle Control (Left / Right motion) */}
          <button
            onClick={() => setDirection(prev => prev === 'left' ? 'right' : 'left')}
            className="p-1 text-slate-400 hover:text-amber-400 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-md transition-colors cursor-pointer"
            title={`Scroll Direction: Currently Moving ${direction === 'left' ? 'Right-to-Left' : 'Left-to-Right'} (Click to switch)`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
          </button>

          {/* Close/Dismiss Banner */}
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-md transition-colors cursor-pointer"
            title="Dismiss fleet banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
