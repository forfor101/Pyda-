import React, { useState, useMemo } from 'react';
import { 
  MessageCircle, 
  PhoneCall, 
  Send, 
  X, 
  ExternalLink, 
  Clock, 
  Sparkles,
  ShieldCheck,
  Tag,
  ArrowRight
} from 'lucide-react';
import { useCms } from '../context/CmsContext';

interface FloatingChatWidgetProps {
  currentPage?: string;
  currentService?: string;
}

export const FloatingChatWidget: React.FC<FloatingChatWidgetProps> = ({ 
  currentPage = 'home',
  currentService 
}) => {
  const { cms } = useCms();
  const phone = cms.company?.phones?.[0] || '08062466212';
  
  // Format for WhatsApp international link (e.g. 2348062466212)
  const cleanPhone = phone.replace(/\D/g, '');
  const waNumber = cleanPhone.startsWith('0') 
    ? `234${cleanPhone.slice(1)}` 
    : cleanPhone.startsWith('234') 
      ? cleanPhone 
      : `234${cleanPhone}`;
  
  const [showQuickCard, setShowQuickCard] = useState(false);
  const [customMsg, setCustomMsg] = useState('');

  // Determine context-based default message and contextual quick options
  const contextData = useMemo(() => {
    if (currentPage === 'services') {
      if (currentService === 'commercial' || currentService === 'corporate') {
        return {
          label: 'Corporate Relocation',
          badge: 'Corporate Inquiry',
          defaultMsg: 'Hello Pyda Movers! I am interested in corporate & office moving solutions for our organization.',
          quickOptions: [
            'I am interested in corporate moving for our office relocation.',
            'Can you provide a corporate freight proposal with insurance coverage?',
            'What is the turnaround time for relocating server rooms and office desks?',
            'I need a site inspection for our multi-floor corporate headquarters.',
          ]
        };
      }
      if (currentService === 'interstate' || currentService === 'haulage') {
        return {
          label: 'Interstate Haulage',
          badge: 'Long-Distance',
          defaultMsg: 'Hello Pyda Movers! I am interested in interstate haulage and long-distance moving across Nigeria.',
          quickOptions: [
            'I need an interstate haulage quote from Lagos to Abuja.',
            'What truck sizes (5T, 10T, 30T) are available for immediate deployment?',
            'Do your long-haul convoys have GPS live tracking and security escort?',
            'Can you deliver to East/North depots within 48 hours?',
          ]
        };
      }
      if (currentService === 'international') {
        return {
          label: 'International Freight',
          badge: 'Global Logistics',
          defaultMsg: 'Hello Pyda Movers! I am interested in international relocation and freight forwarding services.',
          quickOptions: [
            'I need international air/sea freight shipping and customs clearing.',
            'Can you handle door-to-door relocation to UK/USA/Canada/Europe?',
            'What customs paperwork and export documentation do I need?',
            'I require crating and air-cargo packing for fragile valuables.',
          ]
        };
      }
      if (currentService === 'storage' || currentService === 'warehousing') {
        return {
          label: 'Warehousing & Storage',
          badge: 'Facility Storage',
          defaultMsg: 'Hello Pyda Movers! I am interested in secure warehousing and climate-controlled storage.',
          quickOptions: [
            'I need monthly storage rates for household furniture and boxes.',
            'What security and fire prevention systems are at your warehouse?',
            'Can you pack, pick up, and store my items until my new house is ready?',
            'I require palletized industrial cargo warehousing in Lagos/Abuja.',
          ]
        };
      }
      return {
        label: 'Relocation Services',
        badge: 'Home & Office',
        defaultMsg: 'Hello Pyda Movers! I am interested in your moving and relocation services.',
        quickOptions: [
          'I am interested in full-service residential home moving with packing.',
          'Can you quote for moving a 3-bedroom apartment this weekend?',
          'Do your teams supply free packing boxes and protective bubble wrap?',
          'I need specialized handling for pianos and fine art pieces.',
        ]
      };
    }

    if (currentPage === 'coverage') {
      return {
        label: 'Network Coverage',
        badge: 'Regional Terminals',
        defaultMsg: 'Hello Pyda Movers! I am checking your coverage network and would like to confirm service to my location.',
        quickOptions: [
          'Can you confirm scheduled departures from your Lagos and Abuja hubs?',
          'I need direct dispatch to Port Harcourt / Kano / Ibadan corridors.',
          'What is the transit timeline to regional depots outside main state capitals?',
          'I want to speak with the regional station manager for my state.',
        ]
      };
    }

    if (currentPage === 'calculator') {
      return {
        label: 'Instant Estimator',
        badge: 'Quote Support',
        defaultMsg: 'Hello Pyda Movers! I am using your moving cost calculator and would like to finalize my booking quote.',
        quickOptions: [
          'I have an inventory list and want to get a guaranteed locked-in price.',
          'What is the standard turnaround time for scheduling weekday moves?',
          'Can you assign a relocation supervisor to review my volume estimate?',
          'What payment terms and deposit requirements apply to my move?',
        ]
      };
    }

    if (currentPage === 'tracking') {
      return {
        label: 'Live Shipment Tracking',
        badge: 'Track & Trace',
        defaultMsg: 'Hello Pyda Movers! I am tracking a shipment and need live dispatch assistance.',
        quickOptions: [
          'I have my Waybill / Consignment Tracking Number and need an ETA update.',
          'Can dispatch verify the current checkpoint location of my truck?',
          'Please notify the destination terminal receiver before convoy arrival.',
          'I need a proof-of-delivery (POD) timestamp confirmation.',
        ]
      };
    }

    if (currentPage === 'about') {
      return {
        label: 'Corporate Logistics',
        badge: 'Enterprise Advisory',
        defaultMsg: 'Hello Pyda Movers! I would like to speak with a senior logistics coordinator about our company relocation.',
        quickOptions: [
          'I want to discuss an enterprise partnership for recurring corporate logistics.',
          'Can you send your corporate profile and safety compliance audit?',
          'I would like to schedule an introductory call with your Operations Director.',
          'Do you handle tender biddings for multinational logistics contracts?',
        ]
      };
    }

    if (currentPage === 'contact') {
      return {
        label: 'Direct Customer Desk',
        badge: 'Live Support',
        defaultMsg: 'Hello Pyda Movers! I would like to make an inquiry regarding your moving and logistics services.',
        quickOptions: [
          'Hello! I would like to schedule a free pre-move physical or virtual survey.',
          'What is your earliest availability for this week?',
          'Can someone call me back regarding my relocation requirements?',
          'I need an expedited emergency move within 24 hours.',
        ]
      };
    }

    // Default Home context
    return {
      label: 'Express Moving Desk',
      badge: 'Real-Time Lead',
      defaultMsg: 'Hello Pyda Movers! I am interested in booking a move and would like a free quote.',
      quickOptions: [
        'Hi Pyda Movers! I am interested in corporate & office moving.',
        'I need a fast residential home moving quote for my apartment.',
        'What is your truck availability for an interstate haul this week?',
        'Do you provide free packing boxes and disassembly services?',
      ]
    };
  }, [currentPage, currentService]);

  const getWhatsAppUrl = (text?: string) => {
    const messageToSend = text || customMsg || contextData.defaultMsg;
    return `https://wa.me/${waNumber}?text=${encodeURIComponent(messageToSend)}`;
  };

  return (
    <div className="hidden sm:flex fixed bottom-6 right-4 sm:right-6 z-50 flex-col items-end gap-3" id="floating-whatsapp-widget-container">
      
      {/* Quick Launch Card when user clicks prompt toggle */}
      {showQuickCard && (
        <div 
          className="w-[calc(100vw-2rem)] sm:w-[380px] bg-slate-950/95 backdrop-blur-md border border-emerald-500/30 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200 text-xs"
          id="wa-quick-launcher-card"
        >
          
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 p-4 border-b border-emerald-500/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950 shadow-md">
                  <MessageCircle className="w-6 h-6 fill-current stroke-none" />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-slate-950 rounded-full animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-extrabold text-white text-sm">Pyda WhatsApp Desk</h4>
                  <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Online
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">Customer Support • +234 806 246 6212</p>
              </div>
            </div>

            <button
              onClick={() => setShowQuickCard(false)}
              className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              aria-label="Close WhatsApp prompt"
              id="wa-quick-close-btn"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-3.5 max-h-[75vh] overflow-y-auto">
            
            {/* Context Badge Banner */}
            <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-3 text-slate-200 text-[11px] leading-relaxed flex items-start justify-between gap-2.5">
              <div className="flex items-start gap-2">
                <Tag className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-emerald-300 block">Page Context Detected:</span>
                  <span className="text-slate-300">{contextData.label}</span>
                </div>
              </div>
              <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-full border border-emerald-500/30 shrink-0">
                {contextData.badge}
              </span>
            </div>

            {/* Quick Context Inquiries */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Pre-filled Instant Prompts:</span>
              </span>
              <div className="grid gap-1.5">
                {contextData.quickOptions.map((opt, i) => (
                  <a
                    key={i}
                    href={getWhatsAppUrl(opt)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 bg-slate-900 hover:bg-emerald-950/50 border border-slate-800 hover:border-emerald-500/50 rounded-xl text-[11px] text-slate-300 hover:text-white flex items-center justify-between gap-2 transition-all text-left group active:scale-[0.98]"
                  >
                    <span className="leading-snug">{opt}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  </a>
                ))}
              </div>
            </div>

            {/* Custom Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Or Customize Your Message:
              </label>
              <div className="relative">
                <textarea
                  rows={2}
                  value={customMsg || contextData.defaultMsg}
                  onChange={(e) => setCustomMsg(e.target.value)}
                  placeholder="Type your message..."
                  className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 text-white placeholder-slate-500 text-xs rounded-xl p-3 outline-none transition-colors resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-1 flex gap-2">
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-xs py-3 px-4 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                id="wa-open-chat-btn"
              >
                <MessageCircle className="w-4 h-4 fill-current stroke-none" />
                <span>Send via WhatsApp</span>
              </a>

              <a
                href={`tel:${phone}`}
                className="bg-slate-900 hover:bg-slate-800 active:scale-95 text-slate-200 border border-slate-800 p-3 rounded-xl flex items-center justify-center transition-all"
                title="Direct Phone Call"
                id="wa-direct-call-btn"
              >
                <PhoneCall className="w-4 h-4 text-amber-400" />
              </a>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-emerald-400" />
                <span>Instant dispatch response</span>
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-amber-400" />
                <span>Verified Business Desk</span>
              </span>
            </div>

          </div>

        </div>
      )}

      {/* Unified Single WhatsApp Floating Action Button */}
      <button
        type="button"
        onClick={() => setShowQuickCard(!showQuickCard)}
        className="group relative bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl shadow-2xl shadow-emerald-500/40 flex items-center gap-3 transition-all transform hover:scale-105 active:scale-95 border border-emerald-400/50 cursor-pointer"
        id="whatsapp-direct-support-btn"
        aria-label="WhatsApp Business Support"
        title={`WhatsApp Support: ${contextData.label}`}
      >
        <div className="relative flex items-center justify-center">
          {showQuickCard ? (
            <X className="w-6 h-6 text-slate-950 stroke-[3]" />
          ) : (
            <>
              <MessageCircle className="w-6 h-6 fill-current stroke-none" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-white border-2 border-emerald-600 rounded-full animate-pulse" />
            </>
          )}
        </div>

        <div className="flex flex-col items-start text-left leading-tight">
          <span className="text-xs font-black uppercase tracking-wider text-slate-950">
            {showQuickCard ? 'Close Chat' : 'WhatsApp Support'}
          </span>
          <span className="text-[10px] text-slate-900 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping" />
            {contextData.badge}
          </span>
        </div>
      </button>

    </div>
  );
};
