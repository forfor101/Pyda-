import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Package, 
  Clock, 
  ChevronDown, 
  HelpCircle, 
  Sparkles, 
  CheckCircle2, 
  PhoneCall, 
  MessageCircle, 
  FileText, 
  Truck, 
  Lock,
  ArrowRight
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface FaqItem {
  id: string;
  category: 'insurance' | 'packing' | 'timelines' | 'pricing';
  question: string;
  answer: string;
  highlights: string[];
  badge: string;
}

interface FaqSectionProps {
  onOpenQuoteModal?: (serviceType?: string) => void;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ onOpenQuoteModal }) => {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<'all' | 'insurance' | 'packing' | 'timelines' | 'pricing'>('all');
  const [openFaqId, setOpenFaqId] = useState<string | null>('faq-insurance-1');
  const [searchQuery, setSearchQuery] = useState('');

  const faqs: FaqItem[] = [
    // Insurance FAQs
    {
      id: 'faq-insurance-1',
      category: 'insurance',
      badge: '100% Comprehensive',
      question: 'Are my goods and furniture fully insured during transit and handling?',
      answer: 'Yes! Every relocation and freight consignment with Pyda Movers is protected by comprehensive Goods-in-Transit (GIT) and Third-Party Cargo Liability insurance. Our policy covers unexpected road hazards, impact protection, and accidental physical damage during transit between any Nigerian states.',
      highlights: [
        'Underwritten by top tier Nigerian underwriters with zero-excess claims support',
        'Optional full replacement value coverage for high-value executive items & electronics',
        'Formal certificate of transit coverage issued with every commercial assignment',
      ],
    },
    {
      id: 'faq-insurance-2',
      category: 'insurance',
      badge: 'Claims Process',
      question: 'What is the procedure if an item is damaged or misplaced during a move?',
      answer: 'Prior to loading, our team conducts a joint physical inventory condition survey and signs a manifest with you. In the rare event of damage, a formal claim report is documented on-site immediately upon delivery. Valid claims are assessed and processed within 3 to 5 business days with direct compensation or professional restorative repair.',
      highlights: [
        'Pre-move digital photographic inventory condition report',
        'Dedicated on-site supervisor sign-off before and after uncrating',
        'Expedited claims settlement within 3–5 business days',
      ],
    },
    // Packing FAQs
    {
      id: 'faq-packing-1',
      category: 'packing',
      badge: 'Multi-Layer Packing',
      question: 'What materials and techniques do you use to protect delicate goods and IT equipment?',
      answer: 'We utilize industrial-grade export standard packaging: 5-ply double-wall corrugated moving boxes, anti-static bubble rolls, heavy-duty stretch film, corrugated corner protectors, and custom heat-treated wooden crates for fragile glassware, marble tables, artwork, and enterprise servers.',
      highlights: [
        'Heavy-duty 5-ply corrugated cartons categorized by room & weight',
        'Anti-static bubble wrap for server racks, monitors, and precision electronics',
        'Custom bespoke wooden crating built on-site for fragile marble & artwork',
      ],
    },
    {
      id: 'faq-packing-2',
      category: 'packing',
      badge: 'Full-Service Crating',
      question: 'Do your movers handle dismantling and reassembly of furniture and office workstations?',
      answer: 'Absolutely. Our uniformed crews include certified carpenters and technical riggers equipped with precision power tools. We dismantle modular workstations, executive desks, conference tables, bed frames, and chandeliers, packaging every bolt and fastener systematically for reassembly at the destination.',
      highlights: [
        'Complete disassembly and re-assembly of executive furniture & workstations',
        'Careful labeling and magnetic hardware compartmentalization',
        'De-installation and secure re-mounting of TVs and wall displays upon request',
      ],
    },
    // Timelines FAQs
    {
      id: 'faq-timelines-1',
      category: 'timelines',
      badge: 'Guaranteed Schedules',
      question: 'How long does an interstate relocation take (e.g. Lagos to Abuja or Port Harcourt)?',
      answer: 'Intra-city moves (within Lagos or within Abuja) are completed within 4 to 8 hours on the same day. For interstate transit (e.g. Lagos to Abuja, Kano, or Port Harcourt), standard transit takes 24 to 48 hours depending on route conditions. All long-haul journeys feature continuous satellite GPS tracking with automated dispatch updates.',
      highlights: [
        'Intra-City (Lagos/Abuja): Same-day completion in 4–8 hours',
        'Interstate (Lagos ➔ Abuja / PH): 24–48 hours direct highway haulage',
        'Live satellite speed and checkpoint tracking accessible via tracking portal',
      ],
    },
    {
      id: 'faq-timelines-2',
      category: 'timelines',
      badge: 'Zero Downtime',
      question: 'Can you execute our corporate office relocation during the weekend or overnight?',
      answer: 'Yes. We specialize in zero-downtime corporate relocations. Our teams can initiate packing Friday evening at close of business, haul and reassemble over Saturday and Sunday, allowing your staff to resume normal operations without missing a single hour of business on Monday morning.',
      highlights: [
        'Phased weekend shifts (Friday 6:00 PM through Sunday midnight)',
        'Server rack and IT infrastructure prioritized for early Monday connectivity',
        'Dedicated moving supervisor assigned for end-to-end liaison',
      ],
    },
    // Pricing FAQs
    {
      id: 'faq-pricing-1',
      category: 'pricing',
      badge: 'Transparent Rates',
      question: 'How are relocation costs calculated, and are there hidden fuel or gate fees?',
      answer: 'Our quotes are 100% transparent and all-inclusive. Pricing is calculated based on volume (cubic meters), distance between origin and destination, packing material requirements, and vehicle size (3-ton, 5-ton, 10-ton, or 30-ton trailer). There are no hidden fuel surcharges, driver gratuities, or post-survey markups.',
      highlights: [
        'Binding written quotes provided before any vehicle deployment',
        'Inclusive of dedicated trucks, diesel, driver allowances, toll fees, and loaders',
        'Flexible corporate payment options (Invoices with CAC and tax compliance)',
      ],
    },
  ];

  const categories = [
    { id: 'all', label: 'All Questions', icon: <HelpCircle className="w-3.5 h-3.5" /> },
    { id: 'insurance', label: 'Insurance & Security', icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> },
    { id: 'packing', label: 'Packing & Materials', icon: <Package className="w-3.5 h-3.5 text-amber-400" /> },
    { id: 'timelines', label: 'Timelines & Transit', icon: <Clock className="w-3.5 h-3.5 text-blue-400" /> },
    { id: 'pricing', label: 'Pricing & Billing', icon: <FileText className="w-3.5 h-3.5 text-purple-400" /> },
  ];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.highlights.some(h => h.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const toggleFaq = (id: string) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  return (
    <section id="faq-section" className="py-16 sm:py-24 bg-slate-950 text-white relative overflow-hidden border-t border-slate-800">
      {/* Background Decorative Lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
            <HelpCircle className="w-4 h-4" />
            <span>Got Questions? We Have Transparent Answers</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white uppercase font-sans">
            Frequently Asked <span className="text-amber-400">Questions</span>
          </h2>

          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            Everything you need to know about our comprehensive goods-in-transit insurance, multi-layer export packing materials, and verified interstate delivery timelines.
          </p>
        </div>

        {/* Search & Category Filter Pills */}
        <div className="max-w-4xl mx-auto mb-10 space-y-4">
          
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 scale-105'
                      : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  {cat.icon}
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

        </div>

        {/* FAQ Accordion Grid */}
        <div className="max-w-4xl mx-auto space-y-3.5">
          {filteredFaqs.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-sm">
              <p>No questions matched your search criteria. You can ask our live logistics coordinator directly on WhatsApp!</p>
              <a
                href="https://wa.me/2348062466212?text=Hello%20Pyda%20Movers!%20I%20have%20a%20specific%20relocation%20question."
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-lg transition-transform"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Ask Support on WhatsApp</span>
              </a>
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className={`border rounded-2xl transition-all duration-200 overflow-hidden ${
                    isOpen 
                      ? 'bg-slate-900/90 border-amber-500/40 shadow-xl shadow-amber-500/5' 
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
                  }`}
                >
                  {/* Question Header */}
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full p-5 sm:p-6 text-left flex items-start justify-between gap-4 focus:outline-none focus:ring-2 focus:ring-amber-400 rounded-2xl"
                    aria-expanded={isOpen}
                    id={`faq-btn-${faq.id}`}
                  >
                    <div className="space-y-1.5 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-amber-400">
                          {faq.badge}
                        </span>
                        {faq.category === 'insurance' && (
                          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> Fully Insured
                          </span>
                        )}
                        {faq.category === 'packing' && (
                          <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                            <Package className="w-3 h-3" /> Heavy-Duty Packaging
                          </span>
                        )}
                        {faq.category === 'timelines' && (
                          <span className="text-[10px] text-blue-400 font-bold flex items-center gap-1">
                            <Clock className="w-3 h-3" /> 24-48h Interstate
                          </span>
                        )}
                      </div>
                      <h3 className="text-base sm:text-lg font-black text-white leading-snug">
                        {faq.question}
                      </h3>
                    </div>

                    <div className={`p-2 rounded-xl shrink-0 transition-transform duration-200 ${
                      isOpen ? 'bg-amber-500 text-slate-950 rotate-180' : 'bg-slate-800 text-slate-400'
                    }`}>
                      <ChevronDown className="w-4 h-4 stroke-[3]" />
                    </div>
                  </button>

                  {/* Answer Content */}
                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-6 pt-1 text-slate-300 text-xs sm:text-sm leading-relaxed border-t border-slate-800/80 space-y-4 animate-in fade-in slide-in-from-top-1 duration-150">
                      <p className="text-slate-300 leading-relaxed">
                        {faq.answer}
                      </p>

                      {/* Bullet Highlights */}
                      <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2">
                        <div className="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Key Service Guarantee:</span>
                        </div>
                        <ul className="space-y-1.5">
                          {faq.highlights.map((h, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              <span>{h}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Trust Assurance Banner Call-To-Action */}
        <div className="mt-12 max-w-4xl mx-auto bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-amber-500/20 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-emerald-400 text-xs font-black uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Certified Professional Logistics Partner</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Have a Custom Corporate or Interstate Relocation Requirement?
            </h3>
            <p className="text-xs text-slate-400 max-w-xl">
              Our certified logistics managers are available 24/7 in Abuja & Lagos to provide a tailored quote and on-site physical survey.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
            {onOpenQuoteModal && (
              <button
                onClick={() => onOpenQuoteModal('corporate')}
                className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-6 py-3.5 rounded-xl shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
                id="faq-instant-quote-btn"
              >
                <span>Request Free Quote</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <a
              href="https://wa.me/2348062466212?text=Hello%20Pyda%20Movers!%20I%20have%20a%20relocation%20inquiry%20regarding%20insurance%20and%20packing."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-5 py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"
              id="faq-whatsapp-btn"
            >
              <MessageCircle className="w-4 h-4 fill-current stroke-none" />
              <span>WhatsApp Support</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};
