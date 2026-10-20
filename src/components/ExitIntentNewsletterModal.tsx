import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Sparkles,
  Mail,
  CheckCircle2,
  Download,
  Truck,
  Building2,
  Home,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  FileText
} from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { NewsletterInterest } from '../types';

const DISMISSED_KEY = 'megatrend_exit_intent_dismissed_until';
const SUBSCRIBED_KEY = 'megatrend_newsletter_subscribed_email';
const POPUP_TIMER_MS = 25000; // 25 seconds timed trigger
const DISMISS_COOLDOWN_DAYS = 3; // 3 days before showing again after dismissal

interface ExitIntentNewsletterModalProps {
  onOpenQuoteModal?: (service?: any, origin?: string, destination?: string) => void;
  forceOpen?: boolean;
  onClose?: () => void;
}

export const ExitIntentNewsletterModal: React.FC<ExitIntentNewsletterModalProps> = ({
  onOpenQuoteModal,
  forceOpen = false,
  onClose,
}) => {
  const { addNewsletterSubscriber } = useCms();

  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [interest, setInterest] = useState<NewsletterInterest>('all');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [serverMessage, setServerMessage] = useState('');
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [showFloatingPill, setShowFloatingPill] = useState(false);

  const hasTriggeredRef = useRef(false);
  const scrollPositionRef = useRef(0);
  const maxScrollDepthRef = useRef(0);

  // Check if popup should be suppressed based on local storage
  const isSuppressed = (): boolean => {
    if (typeof window === 'undefined') return true;
    try {
      // If already subscribed
      const subbed = localStorage.getItem(SUBSCRIBED_KEY);
      if (subbed) return true;

      // If dismissed within cooldown window
      const dismissedUntil = localStorage.getItem(DISMISSED_KEY);
      if (dismissedUntil && Number(dismissedUntil) > Date.now()) {
        return true;
      }
    } catch (e) {
      // ignore localstorage errors
    }
    return false;
  };

  // Helper to trigger the modal opening
  const triggerPopup = (reason: string) => {
    if (hasTriggeredRef.current || isOpen) return;
    if (!forceOpen && isSuppressed()) {
      setShowFloatingPill(true);
      return;
    }

    hasTriggeredRef.current = true;
    setIsOpen(true);
  };

  // Force open when requested via props (e.g., from Admin or header promotion)
  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
    }
  }, [forceOpen]);

  // Main listener for Timed & Exit-Intent triggers
  useEffect(() => {
    if (forceOpen || isOpen) return;

    if (isSuppressed()) {
      setShowFloatingPill(true);
      return;
    }

    // 1. Timed Trigger (25s countdown)
    const timer = setTimeout(() => {
      triggerPopup('timer_elapsed');
    }, POPUP_TIMER_MS);

    // 2. Desktop Mouse Exit-Intent Trigger (detect cursor leaving top edge)
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 15 || e.clientY <= 0) {
        triggerPopup('mouse_exit_top');
      }
    };

    // 3. Mobile / Desktop Scroll depth & back-scroll intent trigger
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (currentScroll / docHeight) * 100 : 0;

      if (scrollPercent > maxScrollDepthRef.current) {
        maxScrollDepthRef.current = scrollPercent;
      }

      // If user scrolled down past 45% and then rapidly scrolls back up towards header
      if (maxScrollDepthRef.current > 45 && currentScroll < scrollPositionRef.current - 120 && currentScroll < 200) {
        triggerPopup('scroll_up_intent');
      }

      scrollPositionRef.current = currentScroll;
    };

    // 4. Tab Blur / Visibility change intent trigger
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Prepare to show when user returns if eligible
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [forceOpen, isOpen]);

  // Handle closing modal
  const handleClose = () => {
    setIsOpen(false);
    setShowFloatingPill(true);

    if (dontShowAgain || subscribed) {
      try {
        localStorage.setItem(DISMISSED_KEY, String(Date.now() + 30 * 24 * 60 * 60 * 1000));
      } catch (e) {}
    } else {
      try {
        localStorage.setItem(DISMISSED_KEY, String(Date.now() + DISMISS_COOLDOWN_DAYS * 24 * 60 * 60 * 1000));
      } catch (e) {}
    }

    if (onClose) {
      onClose();
    }
  };

  // Handle newsletter subscription via CmsContext & Mailchimp
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setServerMessage('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setServerMessage('');

    try {
      const result = await addNewsletterSubscriber({
        email: cleanEmail,
        fullName: fullName.trim() || undefined,
        interest,
        source: 'exit_intent_modal',
        notes: 'Subscribed via exit-intent popup modal for relocation checklist & dispatch updates.',
      });

      setLoading(false);

      if (result.success) {
        setSubscribed(true);
        setServerMessage(result.message || 'Subscribed successfully! Your relocation kit is ready.');
        try {
          localStorage.setItem(SUBSCRIBED_KEY, cleanEmail);
          localStorage.setItem(DISMISSED_KEY, String(Date.now() + 60 * 24 * 60 * 60 * 1000));
        } catch (e) {}
      } else {
        setServerMessage(result.message || 'Subscription could not be completed. Please check email.');
      }
    } catch (err: any) {
      setLoading(false);
      setSubscribed(true);
      setServerMessage('Thank you for subscribing! Your guide is unlocked below.');
      try {
        localStorage.setItem(SUBSCRIBED_KEY, cleanEmail);
      } catch (e) {}
    }
  };

  const handleDownloadChecklist = () => {
    const checklistContent = `=====================================================
PYDA MOVERS & LOGISTICS
30-DAY MASTER RELOCATION & PACKING CHECKLIST
Hotlines: 0806 246 6212 | 0802 560 9972 | info@pydamovers.com
Abuja HQ: Suite A204 Citygate Plaza | Lagos: 374/376 Old Ojo Rd
Website: https://pydamovers.com
=====================================================

4 WEEKS BEFORE MOVING:
[ ] Request an official on-site survey or online CBM rate from Pyda Movers.
[ ] Declutter items: sort into Keep, Donate, and Dispose.
[ ] Catalog fragile valuables, electronics serial numbers, and artwork.
[ ] Inform utility providers, estate management, and security gates.

2 WEEKS BEFORE MOVING:
[ ] Order heavy-duty 5-ply cartons, bubble insulation, and stretch wrap.
[ ] Begin packing non-essential rooms, seasonal clothing, and books.
[ ] Label cartons by Room Name and Fragility Level (e.g. Master Bedroom - Fragile).
[ ] Confirm truck parking access and elevator booking at origin & destination.

1 WEEK BEFORE MOVING:
[ ] Pack an "Essentials Box" with toiletries, chargers, change of clothes & documents.
[ ] Defrost refrigerators and disconnect washing machines.
[ ] Back up IT servers and computer hard drives.
[ ] Reconfirm dispatch date and arrival time with your Pyda Coordinator.

MOVING DAY:
[ ] Meet the Pyda uniformed riggers & crew leads.
[ ] Conduct a room-by-room walkthrough and verify inventory sheet.
[ ] Inspect tamper seals on vehicle container doors.
[ ] Receive live GPS tracking link for interstate convoy monitoring.

=====================================================
Pyda Movers & Logistics - Safe, Secure & On-Time Nationwide Relocations.
`;

    const blob = new Blob([checklistContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Pyda_30_Day_Master_Relocation_Checklist.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleOpenQuote = () => {
    handleClose();
    if (onOpenQuoteModal) {
      onOpenQuoteModal('corporate', undefined, undefined);
    }
  };

  // Render floating pill if dismissed, allowing visitors to reopen the guide anytime
  if (!isOpen && showFloatingPill) {
    return (
      <button
        onClick={() => {
          hasTriggeredRef.current = true;
          setIsOpen(true);
        }}
        className="fixed bottom-24 right-5 z-40 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs px-3.5 py-2.5 rounded-full shadow-2xl flex items-center gap-2 border border-amber-400/40 hover:scale-105 transition-all transform animate-bounce duration-1000 cursor-pointer"
        title="Claim Free Relocation Guide & Checklist"
        id="reopen-exit-intent-pill"
      >
        <FileText className="w-4 h-4 text-slate-950" />
        <span className="hidden sm:inline">Free Relocation Kit & Checklist</span>
        <span className="sm:hidden font-bold">Relocation Kit</span>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
      </button>
    );
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in"
      onClick={handleClose}
      id="exit-intent-modal-backdrop"
    >
      <div
        className="relative bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/30 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl overflow-hidden animate-scale-up text-white"
        onClick={(e) => e.stopPropagation()}
        id="exit-intent-modal-container"
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-600/5 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-full transition-colors z-20 cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {!subscribed ? (
          <div className="space-y-5 relative z-10">
            {/* Top Badge & Header */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                <FileText className="w-3.5 h-3.5" />
                <span>Special Relocation Kit • Free Download</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                Wait! Don't Move Unprepared.
              </h3>
              <p className="text-xs sm:text-sm text-slate-300">
                Subscribe to the Pyda Dispatch Bulletin to receive verified logistics updates + instant download of the complete{' '}
                <strong className="text-amber-400 font-bold">30-Day Master Relocation & Packing Checklist</strong>.
              </p>
            </div>

            {/* Value Bullets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl text-xs">
              <div className="flex items-center gap-2 text-slate-200">
                <div className="w-5 h-5 rounded-md bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
                  <Download className="w-3 h-3" />
                </div>
                <span>30-Day Packing Checklist</span>
              </div>
              <div className="flex items-center gap-2 text-slate-200">
                <div className="w-5 h-5 rounded-md bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
                  <Truck className="w-3 h-3" />
                </div>
                <span>Highway Safety Advisories</span>
              </div>
              <div className="flex items-center gap-2 text-slate-200">
                <div className="w-5 h-5 rounded-md bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
                  <Building2 className="w-3 h-3" />
                </div>
                <span>Corporate Moving Guides</span>
              </div>
              <div className="flex items-center gap-2 text-slate-200">
                <div className="w-5 h-5 rounded-md bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
                  <ShieldCheck className="w-3 h-3" />
                </div>
                <span>Mailchimp Secure & Zero Spam</span>
              </div>
            </div>

            {/* Subscription Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Interest Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 block">
                  What are you planning to move?
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setInterest('residential')}
                    className={`p-2 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      interest === 'residential'
                        ? 'bg-amber-500 text-slate-950 border-amber-400'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <Home className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Home / Apartment</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInterest('corporate')}
                    className={`p-2 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      interest === 'corporate'
                        ? 'bg-amber-500 text-slate-950 border-amber-400'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Corporate Office</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInterest('haulage')}
                    className={`p-2 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      interest === 'haulage'
                        ? 'bg-amber-500 text-slate-950 border-amber-400'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <Truck className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Interstate Haulage</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInterest('all')}
                    className={`p-2 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      interest === 'all'
                        ? 'bg-amber-500 text-slate-950 border-amber-400'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">All Bulletins & Guides</span>
                  </button>
                </div>
              </div>

              {/* Name & Email inputs */}
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Your Name (Optional)"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                />
                <input
                  type="email"
                  required
                  placeholder="Your Email Address (e.g. name@company.com)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              {serverMessage && (
                <p className="text-[11px] text-rose-400 flex items-center gap-1 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{serverMessage}</span>
                </p>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Syncing with Mailchimp...</span>
                  </span>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Get Free Relocation Checklist & Bulletins</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Do not show again checkbox */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer hover:text-slate-400">
                  <input
                    type="checkbox"
                    checked={dontShowAgain}
                    onChange={(e) => setDontShowAgain(e.target.checked)}
                    className="rounded border-slate-800 text-amber-500 focus:ring-amber-400 cursor-pointer"
                  />
                  <span>Don't show this popup again</span>
                </label>
                <button
                  type="button"
                  onClick={handleClose}
                  className="hover:text-slate-300 underline cursor-pointer"
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* SUCCESS STATE */
          <div className="space-y-5 text-center py-2 relative z-10">
            <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Mailchimp Synchronized
              </span>
              <h3 className="text-2xl font-black text-white">You're All Set!</h3>
              <p className="text-xs text-slate-300 max-w-sm mx-auto">
                Welcome to the Pyda Dispatch Community. Your 30-Day Master Relocation Checklist is ready for instant download:
              </p>
            </div>

            {/* Checklist Ready Box */}
            <div className="bg-slate-950 border border-amber-500/40 p-4 rounded-2xl space-y-2 text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">30-Day Master Relocation & Packing Checklist</h4>
                  <p className="text-[10px] text-slate-400">Step-by-step moving guide and safety checklist for Nigeria</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={handleDownloadChecklist}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>Download 30-Day Master Relocation Checklist (.txt)</span>
              </button>

              <button
                onClick={handleOpenQuote}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Request Free Moving Quote</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleClose}
              className="text-xs text-slate-500 hover:text-slate-400 underline pt-1 cursor-pointer"
            >
              Continue browsing Pyda Movers
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
