import React, { useState } from 'react';
import { 
  Truck, 
  MapPin, 
  Phone, 
  Mail, 
  Shield, 
  ChevronRight, 
  Calculator, 
  ArrowUp, 
  Send, 
  CheckCircle2,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  MessageCircle,
  Users,
  ExternalLink,
  Lock,
  Scale
} from 'lucide-react';
import { PageView } from '../types';
import { useCms } from '../context/CmsContext';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { NewsletterSubscription } from './NewsletterSubscription';
import { BrandLogo } from './BrandLogo';
import registeredSignImg from '../assets/images/registered_trademark_sign_1790283777721.jpg';

interface FooterProps {
  setCurrentPage: (page: PageView) => void;
  onOpenQuoteModal: () => void;
  onOpenTermsModal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentPage, onOpenQuoteModal, onOpenTermsModal }) => {
  const { cms } = useCms();
  const { company } = cms;
  const { t } = useLanguage();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const socialLinksConfig = [
    {
      name: 'Facebook',
      url: company.socialLinks?.facebook || 'https://facebook.com/pydamovers',
      icon: Facebook,
      color: 'hover:bg-[#1877F2]/20 hover:text-[#1877F2] hover:border-[#1877F2]/40',
      tag: '14.2k followers',
      label: 'Follow our Facebook Page for moving guides & customer reviews',
    },
    {
      name: 'X (Twitter)',
      url: company.socialLinks?.twitter || 'https://twitter.com/pydamovers',
      icon: Twitter,
      color: 'hover:bg-sky-500/20 hover:text-sky-400 hover:border-sky-500/40',
      tag: '@PydaMovers',
      label: 'Follow on X for real-time interstate traffic & dispatch updates',
    },
    {
      name: 'LinkedIn',
      url: company.socialLinks?.linkedin || 'https://linkedin.com/company/pyda-movers',
      icon: Linkedin,
      color: 'hover:bg-[#0A66C2]/20 hover:text-[#0A66C2] hover:border-[#0A66C2]/40',
      tag: 'Corporate & Haulage',
      label: 'Connect with our B2B Logistics & Corporate Moving division',
    },
    {
      name: 'Instagram',
      url: company.socialLinks?.instagram || 'https://instagram.com/pydamovers',
      icon: Instagram,
      color: 'hover:bg-gradient-to-tr hover:from-amber-500/20 hover:to-pink-500/20 hover:text-pink-400 hover:border-pink-500/40',
      tag: 'Behind the Scenes',
      label: 'Watch live relocation walkthroughs & fleet operations',
    },
    {
      name: 'YouTube',
      url: company.socialLinks?.youtube || 'https://youtube.com/@pydamovers',
      icon: Youtube,
      color: 'hover:bg-red-600/20 hover:text-red-400 hover:border-red-600/40',
      tag: 'Fleet & Rigging Videos',
      label: 'Subscribe for expert packing tutorials and heavy freight logs',
    },
    {
      name: 'WhatsApp',
      url: company.whatsapp ? `https://wa.me/${company.whatsapp}` : 'https://wa.me/2348062466212',
      icon: MessageCircle,
      color: 'hover:bg-emerald-500/20 hover:text-emerald-400 hover:border-emerald-500/40',
      tag: '24/7 Rapid Dispatch',
      label: 'Chat live with our Abuja & Lagos dispatch coordinators',
    },
  ];

  return (
    <footer className="bg-slate-950 text-white border-t border-slate-800" id="site-footer">
      
      {/* Upper CTA Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-slate-950 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight">Planning a Corporate or Residential Move?</h3>
            <p className="text-xs sm:text-sm font-semibold text-slate-900">
              Get an accurate, transparent cost estimate in minutes or speak directly with our Abuja/Lagos dispatchers.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onOpenQuoteModal}
              className="bg-slate-950 hover:bg-slate-900 text-amber-400 font-extrabold text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-xl flex items-center gap-2 transition-all transform active:scale-95"
              id="footer-get-quote-btn"
            >
              <Calculator className="w-4 h-4" />
              <span>Get Instant Quote</span>
            </button>

            <a
              href={`tel:${company.phones[0]}`}
              className="bg-slate-900/10 hover:bg-slate-950/20 active:scale-95 text-slate-950 font-black text-xs sm:text-sm px-5 py-3.5 rounded-xl border border-slate-950/30 flex items-center gap-2 transition-all"
              id="footer-call-hotline-btn"
            >
              <Phone className="w-4 h-4" />
              <span>Call {company.phones[0]}</span>
            </a>

            <a
              href={`https://wa.me/${company.whatsapp || '2348062466212'}?text=Hello%20Pyda%20Movers!%20I%20am%20inquiring%20about%20a%20relocation%20or%20freight%20booking.`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-900 hover:bg-emerald-950 text-white font-black text-xs sm:text-sm px-5 py-3.5 rounded-xl shadow-lg flex items-center gap-2 transition-all active:scale-95 border border-emerald-700"
              id="footer-whatsapp-cta-btn"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp Us</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer Directory */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Newsletter Subscription Block */}
        <div className="mb-14">
          <NewsletterSubscription variant="footer" onOpenQuoteModal={onOpenQuoteModal} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          
          {/* Brand, Overview & Social Media Hub */}
          <div className="lg:col-span-4 space-y-5">
            <BrandLogo
              size="sm"
              taglineVariant="minimal"
              brandName={company.brandName || 'PYDA'}
              brandSuffix={company.brandSuffix || 'MOVERS'}
              onClick={() => {
                setCurrentPage('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              id="footer-brand-logo"
            />

            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              {company.subTagline}
            </p>

            <button
              type="button"
              onClick={() => {
                setCurrentPage('services');
                scrollToTop();
              }}
              className="flex items-center gap-2 text-xs text-amber-400 font-bold hover:text-amber-300 transition-colors text-left cursor-pointer group"
              title="Learn more about fully insured cargo coverage"
            >
              <Shield className="w-4 h-4 text-emerald-400 shrink-0 group-hover:scale-110 transition-transform" />
              <span className="underline decoration-dotted">Fully Insured & Registered Transport Partner</span>
            </button>

            {/* Social Media & Community Channels Section */}
            <div className="pt-2 border-t border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-amber-400" />
                  <span>Join Our Social Community</span>
                </span>
                <span className="text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full">
                  15k+ Members
                </span>
              </div>

              {/* Social Media Icons Grid */}
              <div className="flex flex-wrap items-center gap-2.5">
                {socialLinksConfig.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 transition-all transform hover:-translate-y-0.5 hover:shadow-lg active:scale-90 ${social.color}`}
                      title={`${social.name} - ${social.tag}`}
                      aria-label={`Visit Pyda Movers on ${social.name}`}
                      id={`footer-social-${social.name.toLowerCase().replace(/[^a-z]/g, '')}`}
                    >
                      <Icon className="w-4 h-4 stroke-[2]" />
                    </a>
                  );
                })}
              </div>

              <p className="text-[11px] text-slate-400 leading-normal">
                Follow us on <strong className="text-slate-300">Facebook, Instagram, X & LinkedIn</strong> for packing guides, customer reviews, convoy telematics and logistics updates.
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 space-y-3 text-xs">
            <p className="font-extrabold uppercase tracking-wider text-amber-400">Navigation</p>
            <ul className="space-y-2 text-slate-300 font-medium">
              {[
                { label: 'Home Overview', view: 'home' as PageView },
                { label: 'Our Services', view: 'services' as PageView },
                { label: 'Executive Car Hire', view: 'car_hire' as PageView },
                { label: 'About Us & Fleet', view: 'about' as PageView },
                { label: 'Truck Investors & Fleet Partner', view: 'investors' as PageView },
                { label: 'Careers (Driver & Logistics Jobs)', view: 'careers' as PageView },
                { label: 'Branch Network', view: 'coverage' as PageView },
                { label: 'Rate Calculator', view: 'calculator' as PageView },
                { label: 'AI Cargo Inspection', view: 'inspection' as PageView },
                { label: 'Move Checklist', view: 'checklist' as PageView },
                { label: 'Track Shipment', view: 'tracking' as PageView },
                { label: 'Client Portal (Saved Quotes)', view: 'dashboard' as PageView },
                { label: 'Contact Us', view: 'contact' as PageView },
                { label: 'Terms & Protective Disclosures', view: 'terms' as PageView },
              ].map((link) => (
                <li key={link.view}>
                  <button
                    onClick={() => {
                      setCurrentPage(link.view);
                      scrollToTop();
                    }}
                    className="hover:text-amber-400 transition-all active:translate-x-1 flex items-center gap-1"
                    id={`footer-nav-${link.view}`}
                  >
                    <ChevronRight className="w-3 h-3 text-slate-600" />
                    <span>{link.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Core Services Summary */}
          <div className="lg:col-span-2 space-y-3 text-xs">
            <p className="font-extrabold uppercase tracking-wider text-amber-400">Core Services</p>
            <ul className="space-y-2 text-slate-300 font-medium">
              {cms.services.slice(0, 6).map((s) => (
                <li key={s.id}>
                  <button
                    onClick={() => {
                      setCurrentPage('services');
                      scrollToTop();
                    }}
                    className="hover:text-amber-400 transition-all active:translate-x-1 text-left"
                  >
                    {s.title}
                  </button>
                </li>
              ))}
            </ul>

            {/* Social Proof Mini Callout */}
            <div className="pt-3 border-t border-slate-800">
              <a
                href={company.socialLinks?.whatsappChannel || 'https://chat.whatsapp.com/invite/pydamovers'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 active:scale-95 transition-all"
                id="footer-whatsapp-channel-link"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Join WhatsApp Channel</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            </div>
          </div>

          {/* Office Addresses, Direct Phones & Direct Connect */}
          <div className="lg:col-span-4 space-y-4 text-xs">
            <p className="font-extrabold uppercase tracking-wider text-amber-400">Key Office Hubs & Contacts</p>

            <div className="space-y-3 text-slate-300">
              <button
                type="button"
                onClick={() => {
                  setCurrentPage('contact');
                  scrollToTop();
                }}
                className="flex items-start gap-2.5 text-left group hover:opacity-95 cursor-pointer w-full"
                title="View Abuja Headquarters details & GPS directions"
              >
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                <div>
                  <p className="font-bold text-white group-hover:text-amber-400 transition-colors">{company.headquartersAbuja.title}:</p>
                  <p className="text-slate-400 text-[11px] leading-snug">{company.headquartersAbuja.address}</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentPage('contact');
                  scrollToTop();
                }}
                className="flex items-start gap-2.5 text-left group hover:opacity-95 cursor-pointer w-full"
                title="View Lagos Logistics Terminal details & GPS directions"
              >
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                <div>
                  <p className="font-bold text-white group-hover:text-amber-400 transition-colors">{company.mainOfficeLagos.title}:</p>
                  <p className="text-slate-400 text-[11px] leading-snug">{company.mainOfficeLagos.address}</p>
                </div>
              </button>

              <div className="flex items-center gap-2.5 pt-1">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="flex items-center gap-3 font-extrabold text-amber-400">
                  <a href={`tel:${company.phones[0]}`} className="hover:underline">{company.phones[0]}</a>
                  {company.phones[1] && (
                    <>
                      <span>|</span>
                      <a href={`tel:${company.phones[1]}`} className="hover:underline">{company.phones[1]}</a>
                    </>
                  )}
                </div>
              </div>

              {/* Direct Social Media Hotline Links */}
              <div className="pt-2 border-t border-slate-800 flex items-center gap-3">
                <a
                  href={`https://wa.me/${company.whatsapp || '2348062466212'}?text=Hello%20Pyda%20Movers,%20I%20would%20like%20to%20inquire%20about%20a%20relocation%20service.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-500/10 hover:bg-emerald-500/20 active:scale-95 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-lg font-bold text-[11px] flex items-center gap-1.5 transition-all"
                  id="footer-whatsapp-chat-btn"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp Live Dispatch</span>
                </a>

                <a
                  href={`mailto:${company.email || 'info@pydamovers.com'}`}
                  className="bg-slate-900 hover:bg-slate-850 active:scale-95 text-slate-300 border border-slate-800 px-3 py-1.5 rounded-lg font-bold text-[11px] flex items-center gap-1.5 transition-all"
                  id="footer-email-btn"
                >
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  <span>Email Us</span>
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar with Copyright, Social Icons & Admin Link */}
        <div className="mt-8 pt-8 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2 text-center md:text-left">
            <img
              src={registeredSignImg}
              alt="Registered Sign"
              referrerPolicy="no-referrer"
              className="w-4 h-4 rounded-full object-cover ring-1 ring-amber-400/40 shadow-sm shrink-0"
            />
            <p>
              © {new Date().getFullYear()} {company.copyrightText} • <span className="text-slate-400 font-semibold">Pyda Movers®</span> is a registered corporate carrier (RC: 1842091).
            </p>
          </div>

          {/* Social Quick Links on Bottom Bar */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 mr-1 hidden sm:inline">Connect:</span>
            {socialLinksConfig.slice(0, 5).map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-amber-400 hover:border-slate-700 active:scale-90 transition-all"
                  title={social.name}
                  aria-label={social.name}
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher variant="pill" />

            <button
              onClick={() => {
                setCurrentPage('terms');
                scrollToTop();
              }}
              className="text-slate-400 hover:text-amber-400 active:scale-95 font-bold transition-all text-[11px] flex items-center gap-1.5"
              id="footer-terms-link"
              title="View Standard Trading Conditions & Carrier Protective Disclosures"
            >
              <Scale className="w-3.5 h-3.5 text-amber-400" />
              <span>Terms & Disclosures</span>
            </button>

            <button
              onClick={() => {
                setCurrentPage('admin');
                scrollToTop();
              }}
              className="text-slate-400 hover:text-amber-400 active:scale-95 font-bold transition-all text-[11px] flex items-center gap-1.5"
              id="footer-admin-link"
            >
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Admin CMS Portal</span>
            </button>

            <button
              onClick={scrollToTop}
              className="p-2 bg-slate-900 rounded-lg hover:bg-slate-800 active:scale-95 text-amber-400 flex items-center gap-1 transition-all"
              title="Scroll to top"
              id="footer-back-to-top-btn"
            >
              <span>Back to top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};

