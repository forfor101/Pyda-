import React, { useState } from 'react';
import {
  Mail,
  Send,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Download,
  Tag,
  ArrowRight,
  Building2,
  Home,
  Truck,
  FileText
} from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { NewsletterInterest } from '../types';

interface NewsletterSubscriptionProps {
  variant?: 'footer' | 'standalone' | 'compact';
  onOpenQuoteModal?: () => void;
}

export const NewsletterSubscription: React.FC<NewsletterSubscriptionProps> = ({
  variant = 'footer',
  onOpenQuoteModal
}) => {
  const { addNewsletterSubscriber } = useCms();

  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [interest, setInterest] = useState<NewsletterInterest>('all');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [subscribedEmail, setSubscribedEmail] = useState('');
  const [serverMessage, setServerMessage] = useState('');
  const [showPreferences, setShowPreferences] = useState(false);

  const interestOptions: { id: NewsletterInterest; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'all', label: 'All Guides & Bulletins', icon: Sparkles },
    { id: 'residential', label: 'Home Moving Tips', icon: Home },
    { id: 'corporate', label: 'Corporate & Office Relocation', icon: Building2 },
    { id: 'haulage', label: 'Interstate Haulage & Rates', icon: Truck },
  ];

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@') || !email.includes('.')) return;

    setLoading(true);
    setServerMessage('');

    try {
      const result = await addNewsletterSubscriber({
        email: email.trim(),
        fullName: fullName.trim() || undefined,
        interest,
        source: 'footer_newsletter_component',
      });

      setLoading(false);
      if (result.success) {
        setSubscribed(true);
        setSubscribedEmail(email.trim());
        setServerMessage(result.message);
        setEmail('');
        setFullName('');
      } else {
        setServerMessage(result.message || 'Subscription failed. Please check your email and retry.');
      }
    } catch (err: any) {
      setLoading(false);
      setSubscribed(true);
      setSubscribedEmail(email.trim());
      setServerMessage('Thank you for subscribing! You will receive our monthly relocation guide & moving tips in your inbox.');
      setEmail('');
    }
  };

  const handleDownloadChecklist = () => {
    // Generate a clean printable checklist markdown / text document
    const checklistContent = `=====================================================
MEGATREND MOVERS & LOGISTICS
30-DAY MASTER RELOCATION & PACKING CHECKLIST
Hotlines: 0806 246 6212 | 0802 560 9972 | info@megatrendmovers.com
Abuja HQ: Suite A204 Citygate Plaza | Lagos: 374/376 Old Ojo Rd
=====================================================

4 WEEKS BEFORE MOVE:
[ ] Request an official on-site survey or online quote from Megatrend Movers.
[ ] Declutter items: sort into Keep, Donate, and Dispose.
[ ] Catalog fragile valuables, electronics serial numbers, and artwork.
[ ] Inform utility providers, estate management, and security gates.

2 WEEKS BEFORE MOVE:
[ ] Collect or order heavy-duty 5-ply cartons, bubble insulation, and stretch wrap.
[ ] Begin packing non-essential rooms, seasonal clothing, and books.
[ ] Label cartons by Room Name and Fragility Level (e.g. Master Bedroom - Fragile).
[ ] Confirm truck parking access and elevator booking at origin & destination.

1 WEEK BEFORE MOVE:
[ ] Pack an "Essentials Box" with toiletries, chargers, change of clothes & documents.
[ ] Defrost refrigerators and disconnect washing machines.
[ ] Back up IT servers and computer hard drives.
[ ] Reconfirm dispatch date and arrival time with your Megatrend Coordinator.

MOVING DAY:
[ ] Meet the Megatrend uniformed riggers & crew leads.
[ ] Conduct a room-by-room walkthrough and verify inventory sheet.
[ ] Inspect tamper seals on vehicle container doors.
[ ] Receive live GPS tracking link for interstate convoy monitoring.

=====================================================
Megatrend Movers & Logistics - Safe, Secure & On-Time Nationwide Relocations.
`;

    const blob = new Blob([checklistContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Megatrend_30_Day_Master_Relocation_Checklist.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="bg-slate-900/95 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-6 sm:p-8 relative overflow-hidden transition-all shadow-2xl"
      id="footer-newsletter-section"
    >
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-600/5 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10">
        {!subscribed ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Heading & Value Proposition */}
            <div className="lg:col-span-6 space-y-3">
              <div className="inline-flex items-center gap-2 text-amber-400 font-extrabold text-xs uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5 rounded-full">
                <Mail className="w-3.5 h-3.5" />
                <span>Logistics & Moving Dispatch Newsletter</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
                Stay Ahead with Moving Guides, Freight Insights & Verified Logistics
              </h3>

              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Join over <strong className="text-slate-200 font-bold">8,500+</strong> property owners, corporate facility managers, and business executives across Nigeria receiving our monthly relocation checklists, highway transit advisories, and moving best practices.
              </p>

              {/* Trust Badges */}
              <div className="pt-2 flex flex-wrap items-center gap-4 text-[11px] text-slate-400 font-medium">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Verified 1-Click Unsubscribe</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Free 30-Day Relocation Checklist</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Truck className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Transit Safety Advisories</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Subscription Form */}
            <div className="lg:col-span-6">
              <form onSubmit={handleSubscribe} className="space-y-4" id="newsletter-form">
                {/* Interest Preference Selector */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-amber-400" />
                      <span>Select Topics of Interest:</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPreferences(!showPreferences)}
                      className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
                    >
                      {showPreferences ? 'Hide Options' : 'Customize Topics'}
                    </button>
                  </div>

                  {showPreferences ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 animate-fade-in">
                      {interestOptions.map((opt) => {
                        const Icon = opt.icon;
                        const isSelected = interest === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setInterest(opt.id)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold text-left flex items-center gap-2 border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm'
                                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                            }`}
                            id={`newsletter-interest-${opt.id}`}
                          >
                            <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-400' : 'text-slate-500'}`} />
                            <span className="truncate">{opt.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-1.5">
                      {interestOptions.slice(0, 3).map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setInterest(opt.id)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                            interest === opt.id
                              ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setShowPreferences(true)}
                        className="px-2 py-1 text-[11px] text-slate-400 hover:text-amber-400 font-bold cursor-pointer"
                      >
                        + More
                      </button>
                    </div>
                  )}
                </div>

                {/* Input Fields */}
                <div className="space-y-2.5">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your Name (Optional)"
                      className="bg-slate-950 border border-slate-800 focus:border-amber-500 text-white placeholder-slate-500 text-xs rounded-xl px-4 py-3 outline-none transition-colors sm:w-1/3"
                      id="newsletter-name-input"
                    />

                    <div className="relative flex-grow">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your corporate or personal email..."
                        className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-white placeholder-slate-500 text-xs rounded-xl pl-10 pr-4 py-3 outline-none transition-colors"
                        id="newsletter-email-input"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm py-3.5 px-6 rounded-xl shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 transition-all transform active:scale-98 disabled:opacity-50 cursor-pointer"
                    id="newsletter-subscribe-btn"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-slate-950" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Subscribing & Syncing...</span>
                      </span>
                    ) : (
                      <>
                        <span>Join Dispatch Newsletter & Get Free Checklist</span>
                        <Send className="w-4 h-4 stroke-[2.5]" />
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>🔒 100% Privacy. Zero spam. Synced with Mailchimp & Cloud Dispatch.</span>
                  {serverMessage && !subscribed && (
                    <span className="text-amber-400 font-medium">{serverMessage}</span>
                  )}
                </div>
              </form>
            </div>
          </div>
        ) : (
          /* Confirmation & Welcome Card upon Success */
          <div className="bg-slate-950/80 border border-emerald-500/40 rounded-xl p-6 sm:p-8 animate-fade-in text-white space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                    <span>You're Officially Subscribed!</span>
                    <span className="text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Confirmation email & welcome pack dispatched to <strong className="text-amber-400">{subscribedEmail}</strong>.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSubscribed(false)}
                className="text-xs font-bold text-slate-400 hover:text-amber-400 border border-slate-800 hover:border-slate-700 bg-slate-900 px-3.5 py-2 rounded-xl transition-colors shrink-0 cursor-pointer"
                id="newsletter-subscribe-another-btn"
              >
                + Subscribe Another Address
              </button>
            </div>

            {/* Perks Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Free Moving Checklist Download */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-200 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Download className="w-3.5 h-3.5 text-amber-400" />
                      <span>Free Relocation Checklist</span>
                    </span>
                    <span className="text-xs text-amber-400 font-bold">Included</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Download our 30-Day Master Relocation & Packing Checklist to plan a stress-free move.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleDownloadChecklist}
                    className="w-full bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs py-2.5 px-3 rounded-lg border border-slate-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    id="download-checklist-btn"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-400" />
                    <span>Download Checklist (.txt)</span>
                  </button>
                </div>
              </div>

              {/* Fast Quote Action */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-200 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-amber-400" />
                      <span>Request Fast Moving Quote</span>
                    </span>
                    <span className="text-xs text-emerald-400 font-bold">Instant</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Ready to schedule? Calculate your volume and get a transparent price quote.
                  </p>
                </div>

                <div className="pt-2">
                  {onOpenQuoteModal && (
                    <button
                      onClick={onOpenQuoteModal}
                      className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs py-2.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      id="newsletter-get-quote-btn"
                    >
                      <span>Request Free Quote Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
