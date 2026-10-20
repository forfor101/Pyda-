import React from 'react';
import { PhoneCall, Calculator, MessageCircle } from 'lucide-react';
import { COMPANY_INFO } from '../data/companyData';

interface QuickCallBarMobileProps {
  onOpenQuoteModal?: () => void;
}

export const QuickCallBarMobile: React.FC<QuickCallBarMobileProps> = ({ onOpenQuoteModal }) => {
  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/98 backdrop-blur-xl border-t border-slate-800/90 p-2 px-3 shadow-[0_-8px_30px_rgba(0,0,0,0.6)]">
      <div className="grid grid-cols-3 gap-2 items-center">
        {/* 1. Phone Call Action */}
        <a
          href={`tel:${COMPANY_INFO.phones[0]}`}
          className="flex flex-col sm:flex-row items-center justify-center gap-1 py-2 px-2 bg-slate-900 hover:bg-slate-850 active:bg-slate-800 text-amber-400 border border-amber-500/30 rounded-xl text-center active:scale-95 transition-all shadow-sm"
          id="mobile-sticky-call-btn"
          title={`Call ${COMPANY_INFO.phones[0]}`}
        >
          <PhoneCall className="w-4 h-4 text-amber-400 shrink-0" />
          <div className="flex flex-col leading-none text-left">
            <span className="text-[10px] text-slate-400 font-medium">Call 24/7</span>
            <span className="text-[11px] font-bold text-white tracking-tight">0806 246 6212</span>
          </div>
        </a>

        {/* 2. Instant Quote Action (In the middle) */}
        <button
          type="button"
          onClick={onOpenQuoteModal}
          className="flex flex-col sm:flex-row items-center justify-center gap-1 py-2 px-2 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 active:from-amber-500 active:to-amber-600 text-slate-950 font-black rounded-xl text-center shadow-lg shadow-amber-500/25 active:scale-95 transition-all border border-amber-300/50"
          id="mobile-sticky-quote-btn"
          title="Instant Quote Calculator"
        >
          <Calculator className="w-4 h-4 stroke-[2.5] shrink-0" />
          <div className="flex flex-col leading-none text-left">
            <span className="text-[10px] text-slate-950/80 font-bold uppercase tracking-tight">Rate Check</span>
            <span className="text-[11px] font-black text-slate-950 tracking-tight">Instant Quote</span>
          </div>
        </button>

        {/* 3. WhatsApp Action */}
        <a
          href="https://wa.me/2348062466212?text=Hello%20Pyda%20Movers!%20I%20need%20assistance%20with%20a%20haulage%20or%20relocation%20booking."
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col sm:flex-row items-center justify-center gap-1 py-2 px-2 bg-emerald-950/90 hover:bg-emerald-900 active:bg-emerald-800 text-emerald-300 border border-emerald-600/50 rounded-xl text-center active:scale-95 transition-all shadow-sm"
          id="mobile-sticky-whatsapp-btn"
          title="Chat on WhatsApp 24/7"
        >
          <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="flex flex-col leading-none text-left">
            <span className="text-[10px] text-emerald-400/80 font-medium">Live Chat</span>
            <span className="text-[11px] font-bold text-white tracking-tight">WhatsApp</span>
          </div>
        </a>
      </div>
    </div>
  );
};
