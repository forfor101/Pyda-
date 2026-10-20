import React, { useState } from 'react';
import { 
  Phone, Menu, X, Truck, Lock, LogIn, LogOut, ShieldCheck, 
  ChevronDown, FileText, FolderLock, Calculator, 
  MessageSquare, ArrowRight, CheckCircle2 
} from 'lucide-react';
import { PageView } from '../types';
import { useCms } from '../context/CmsContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from './AuthModal';
import { LanguageSwitcher } from './LanguageSwitcher';
import { BrandLogo } from './BrandLogo';

interface HeaderProps {
  currentPage: PageView;
  setCurrentPage: (page: PageView) => void;
  onOpenQuoteModal?: () => void;
  onOpenAuthModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  currentPage, 
  setCurrentPage, 
  onOpenQuoteModal,
  onOpenAuthModal,
}) => {
  const { cms } = useCms();
  const { company } = cms;
  const { t } = useLanguage();
  const { user, customerProfile, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [internalAuthModalOpen, setInternalAuthModalOpen] = useState(false);

  const navLinks: { label: string; view: PageView; highlight?: boolean; badge?: string }[] = [
    { label: t('nav.home', 'Home'), view: 'home' },
    { label: t('nav.services', 'Services'), view: 'services' },
    { label: 'Car Hire', view: 'car_hire', highlight: true },
    { label: 'AI Cargo Vision', view: 'inspection', badge: 'AI Studio' },
    { label: t('nav.about', 'About Us'), view: 'about' },
    { label: t('nav.investors', 'Truck Investors'), view: 'investors' },
    { label: t('nav.careers', 'Careers'), view: 'careers' },
    { label: t('nav.coverage', 'Branches'), view: 'coverage' },
    { label: t('nav.calculator', 'Rate Estimator'), view: 'calculator' },
    { label: t('nav.tracking', 'Tracking'), view: 'tracking' },
    { label: t('nav.dashboard', 'Client Portal'), view: 'dashboard' },
    { label: t('nav.contact', 'Contact'), view: 'contact' },
  ];

  const handleNavClick = (view: PageView) => {
    setCurrentPage(view);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAuth = () => {
    if (onOpenAuthModal) {
      onOpenAuthModal();
    } else {
      setInternalAuthModalOpen(true);
    }
  };

  const handleSignOut = async () => {
    await logout();
    setUserDropdownOpen(false);
  };

  const displayName = customerProfile?.fullName || user?.displayName || user?.email?.split('@')[0] || 'Client';
  const initialLetter = displayName.charAt(0).toUpperCase() || 'C';

  return (
    <>
      <header className="sticky top-0 z-40 text-white shadow-2xl transition-all duration-200" id="main-site-header">
        {/* ========================================================================= */}
        {/* MAIN EXECUTIVE NAVIGATION & BRAND COMMAND CENTER (Duchess Naturals Inspired) */}
        {/* ========================================================================= */}
        <div className="bg-slate-950/95 backdrop-blur-md border-b border-emerald-900/40 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4 flex items-center justify-between gap-4">
            
            {/* ==================================================== */}
            {/* BESPOKE BRAND LOGO WITH SINGLE REGISTERED TRADEMARK (R) */}
            {/* ==================================================== */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <button
                onClick={() => handleNavClick('home')}
                className="text-left focus:outline-none focus:ring-2 focus:ring-[#83b735] rounded-2xl p-1 shrink-0 group flex items-center transition-opacity hover:opacity-95"
                id="brand-logo-btn"
                aria-label="Pyda Movers & Logistics - Registered Corporate Trademark"
              >
                <BrandLogo
                  brandName={company.brandName || 'PYDA'}
                  brandSuffix={company.brandSuffix || 'MOVERS'}
                  size="md"
                  taglineVariant="full"
                />
              </button>
            </div>

            {/* ==================================================== */}
            {/* DESKTOP EXPANDED NAVIGATION BAR (ENLARGED LETTERS & REFINED COLORS) */}
            {/* ==================================================== */}
            <div className="hidden lg:flex items-center gap-3">
              <nav className="flex items-center gap-1.5 xl:gap-2 font-medium">
                {navLinks.map((link) => {
                  const isActive = currentPage === link.view;
                  return (
                    <button
                      key={link.view}
                      onClick={() => handleNavClick(link.view)}
                      className={`px-3.5 py-2 xl:px-4 xl:py-2.5 rounded-xl text-xs xl:text-sm font-bold tracking-wide transition-all duration-200 relative flex items-center gap-1.5 active:scale-95 ${
                        isActive
                          ? 'bg-emerald-950/90 text-[#fed700] shadow-lg shadow-black/50 border border-emerald-600/60 font-extrabold ring-1 ring-emerald-500/30'
                          : link.highlight
                          ? 'text-emerald-300 hover:text-[#fed700] bg-emerald-900/25 hover:bg-emerald-900/40 border border-emerald-600/40 font-extrabold shadow-sm'
                          : 'text-slate-200 hover:text-white hover:bg-slate-900 hover:border-slate-800'
                      }`}
                      id={`nav-${link.view}`}
                    >
                      <span>{link.label}</span>
                      {link.badge && (
                        <span className="px-1.5 py-0.5 rounded-md bg-gradient-to-r from-amber-500/25 to-emerald-500/25 border border-amber-400/40 text-[9px] font-black text-amber-300 uppercase tracking-wider">
                          {link.badge}
                        </span>
                      )}
                      
                      {/* Active indicator */}
                      {isActive && (
                        <span className="absolute -bottom-1 left-2.5 right-2.5 h-[2.5px] bg-[#fed700] rounded-full shadow-sm" />
                      )}

                      {link.highlight && !isActive && (
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#83b735] opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#83b735]"></span>
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              {/* ==================================================== */}
              {/* PRIMARY ACTION BUTTONS: PORTAL ACCESS & LANGUAGE */}
              {/* ==================================================== */}
              <div className="flex items-center gap-2 pl-2 border-l border-emerald-900/50">
                {/* Language Switcher Pill */}
                <div className="hidden sm:block">
                  <LanguageSwitcher variant="pill" />
                </div>

                {/* Client Portal / Sign In Button */}
                {user ? (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                      className="flex items-center gap-2 bg-emerald-950/80 hover:bg-emerald-900/80 border border-emerald-600/40 px-3 py-2 rounded-xl text-xs xl:text-sm font-bold transition-all shadow-md group active:scale-95"
                      id="header-user-menu-btn"
                    >
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-[#fed700] text-slate-950 flex items-center justify-center font-black text-xs shrink-0 shadow-md">
                        {initialLetter}
                      </div>
                      <div className="text-left hidden xl:block max-w-[110px] truncate">
                        <span className="text-white text-xs font-bold block truncate leading-tight">{displayName}</span>
                        <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1 leading-none">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Portal Active</span>
                        </span>
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-transform" />
                    </button>

                    {/* Dropdown Menu */}
                    {userDropdownOpen && (
                      <div className="absolute right-0 mt-2.5 w-68 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 space-y-1.5">
                        <div className="p-2.5 border-b border-slate-800 mb-1">
                          <p className="text-sm font-bold text-white truncate">{displayName}</p>
                          <p className="text-xs text-slate-400 truncate">{user.email}</p>
                          <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-bold">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Firebase Verified Account</span>
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleNavClick('dashboard')}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-200 hover:bg-slate-800 hover:text-amber-400 flex items-center gap-2.5 transition-all active:scale-[0.98]"
                          id="header-dropdown-portal-link"
                        >
                          <Truck className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>My Shipments & Live Convoys</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleNavClick('dashboard')}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-200 hover:bg-slate-800 hover:text-amber-400 flex items-center gap-2.5 transition-all active:scale-[0.98]"
                          id="header-dropdown-vault-link"
                        >
                          <FolderLock className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>Document Vault & Signed SLAs</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleNavClick('dashboard')}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-slate-200 hover:bg-slate-800 hover:text-amber-400 flex items-center gap-2.5 transition-all active:scale-[0.98]"
                          id="header-dropdown-quotes-link"
                        >
                          <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                          <span>Saved Quotes & Estimates</span>
                        </button>

                        <div className="pt-1.5 border-t border-slate-800 mt-1">
                          <button
                            type="button"
                            onClick={handleSignOut}
                            className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 flex items-center gap-2.5 transition-all active:scale-[0.98]"
                            id="header-dropdown-signout-btn"
                          >
                            <LogOut className="w-4 h-4 shrink-0" />
                            <span>Sign Out of Portal</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleOpenAuth}
                    className="flex items-center gap-2 bg-slate-800/90 hover:bg-slate-750 text-slate-200 hover:text-amber-300 border border-slate-700/80 hover:border-amber-400/40 px-3.5 py-2.5 rounded-xl text-xs xl:text-sm font-bold shadow-md transition-all active:scale-95 shrink-0"
                    id="header-sign-in-btn"
                  >
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Client Portal</span>
                  </button>
                )}
              </div>
            </div>

            {/* ==================================================== */}
            {/* THREE LINES MENU TOGGLE (MOBILE) */}
            {/* SIGN IN MERGED TO/UNDER THREE LINES; STANDALONE SIGN IN ICON REMOVED */}
            {/* ==================================================== */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 sm:p-2.5 rounded-xl bg-slate-800/90 text-slate-200 hover:text-white hover:bg-slate-700 active:scale-95 transition-all border border-slate-700/60 flex items-center justify-center shadow-md focus:outline-none focus:ring-2 focus:ring-amber-400 group shrink-0"
                aria-label={mobileMenuOpen ? "Close Navigation & Client Portal Menu" : "Open Navigation & Client Portal Menu"}
                id="header-menu-toggle-rc-position"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 transition-transform duration-150" />
                ) : (
                  <div className="flex items-center gap-1.5">
                    <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 group-hover:text-amber-300 transition-colors" />
                    {user && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-900 animate-pulse" />
                    )}
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* EXPANDED MOBILE DRAWER MENU - UNDER THE THREE LINES */}
        {/* ========================================================================= */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-slate-950 border-t border-slate-800/90 px-4 pt-4 pb-8 space-y-4 animate-in slide-in-from-top-3 duration-200 shadow-2xl">
            
            {/* Mobile Header Brand & Registered Trademark (R) Banner */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <BrandLogo
                  brandName={company.brandName || 'PYDA'}
                  brandSuffix={company.brandSuffix || 'MOVERS'}
                  size="sm"
                  taglineVariant="compact"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <LanguageSwitcher variant="pill" />
              </div>
            </div>

            {/* ========================================================================= */}
            {/* CLIENT PORTAL & SIGN-IN MODULE (MERGED DIRECTLY UNDER THE THREE LINES) */}
            {/* ========================================================================= */}
            {!user ? (
              <div className="p-4 bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-850 rounded-2xl border border-amber-500/30 shadow-lg shadow-black/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner shrink-0">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white leading-tight">Client Portal & Document Vault</h4>
                      <p className="text-[11px] text-slate-400 leading-tight">Live shipments, freight bills & signed SLAs</p>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                    Secure
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleOpenAuth();
                  }}
                  className="w-full py-3 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 active:scale-95 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition-all border border-amber-300/40"
                  id="drawer-signin-action-btn"
                >
                  <LogIn className="w-4 h-4 stroke-[2.5]" />
                  <span>Sign In / Access Client Portal</span>
                </button>
              </div>
            ) : (
              <div className="p-4 bg-gradient-to-br from-slate-900 to-slate-850 rounded-2xl border border-emerald-500/30 shadow-lg shadow-black/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black text-sm flex items-center justify-center shadow-md shrink-0">
                      {initialLetter}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold text-white truncate">{displayName}</p>
                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Portal Active</span>
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleSignOut();
                    }}
                    className="text-xs font-bold text-rose-400 hover:text-rose-300 active:scale-95 px-3 py-1.5 rounded-lg hover:bg-rose-500/10 transition-all border border-rose-500/20 shrink-0"
                    id="drawer-signout-btn"
                  >
                    Sign Out
                  </button>
                </div>

                {/* Quick Portal Action Buttons */}
                <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleNavClick('dashboard');
                    }}
                    className="p-2.5 bg-slate-800/90 hover:bg-slate-750 text-slate-200 hover:text-amber-400 rounded-xl text-xs font-bold flex items-center gap-2 border border-slate-700/60 transition-all shadow-sm active:scale-95"
                  >
                    <Truck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate">My Shipments</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleNavClick('dashboard');
                    }}
                    className="p-2.5 bg-slate-800/90 hover:bg-slate-750 text-slate-200 hover:text-emerald-400 rounded-xl text-xs font-bold flex items-center gap-2 border border-slate-700/60 transition-all shadow-sm active:scale-95"
                  >
                    <FolderLock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">Document Vault</span>
                  </button>
                </div>
              </div>
            )}

            {/* Navigation Links with Enlarged Typography */}
            <div className="grid gap-1.5 pt-1">
              {navLinks.map((link) => {
                const isActive = currentPage === link.view;
                return (
                  <button
                    key={link.view}
                    onClick={() => handleNavClick(link.view)}
                    className={`text-left px-4 py-3 rounded-xl text-base font-bold transition-all active:scale-[0.98] flex items-center justify-between ${
                      isActive
                        ? 'bg-slate-800 text-amber-400 font-black border border-amber-400/50 shadow-md'
                        : 'text-slate-200 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{link.label}</span>
                      {link.badge && (
                        <span className="px-1.5 py-0.5 rounded-md bg-gradient-to-r from-amber-500/25 to-emerald-500/25 border border-amber-400/40 text-[9px] font-black text-amber-300 uppercase tracking-wider">
                          {link.badge}
                        </span>
                      )}
                    </div>
                    {isActive ? (
                      <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    ) : (
                      <ArrowRight className="w-4 h-4 text-slate-600" />
                    )}
                  </button>
                );
              })}

              {/* Client Portal Direct Nav Link in Menu */}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (user) {
                    handleNavClick('dashboard');
                  } else {
                    handleOpenAuth();
                  }
                }}
                className={`text-left px-4 py-3 rounded-xl text-base font-bold transition-all active:scale-[0.98] flex items-center justify-between ${
                  currentPage === 'dashboard'
                    ? 'bg-slate-800 text-amber-400 font-black border border-amber-400/50 shadow-md'
                    : 'text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30'
                }`}
                id="drawer-nav-portal-link"
              >
                <div className="flex items-center gap-2.5">
                  {user ? (
                    <Truck className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Lock className="w-4 h-4 text-amber-400" />
                  )}
                  <span>{user ? 'Client Portal & Shipments' : 'Client Portal & Sign In'}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </button>
            </div>

            {/* Emergency Contacts Card */}
            <div className="pt-3 border-t border-slate-800/90 space-y-2">
              <a
                href={`tel:${company.phones[0]}`}
                className="w-full py-3 bg-slate-900 hover:bg-slate-850 border border-slate-750 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Phone className="w-4 h-4 text-amber-400" />
                <span>{t('header.callDispatch', 'Call 24/7 Operations')}: {company.phones[0]}</span>
              </a>

              {onOpenQuoteModal && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenQuoteModal();
                  }}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 active:scale-95 text-slate-950 font-black text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all border border-amber-300/40"
                >
                  <Calculator className="w-4 h-4 stroke-[2.5]" />
                  <span>Get Instant Freight & Relocation Quote</span>
                </button>
              )}

              <a
                href={`https://wa.me/${company.whatsapp || '2348062466212'}?text=Hello%20Pyda%20Movers%20Dispatch!%20I%20need%20assistance%20with%20a%20haulage%20or%20relocation%20booking.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-emerald-950/80 hover:bg-emerald-900/80 border border-emerald-700/60 active:scale-95 text-emerald-300 font-black text-xs rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp Live Operations Room</span>
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Internal Auth Modal */}
      <AuthModal
        isOpen={internalAuthModalOpen}
        onClose={() => setInternalAuthModalOpen(false)}
        onSuccessNavigate={(page) => handleNavClick(page)}
      />
    </>
  );
};
