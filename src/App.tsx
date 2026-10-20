import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ServicesSection } from './components/ServicesSection';
import { AboutSection } from './components/AboutSection';
import { CoverageMapSection } from './components/CoverageMapSection';
import { QuoteCalculatorModal } from './components/QuoteCalculatorModal';
import { ShipmentTracker } from './components/ShipmentTracker';
import { InventoryPlanner } from './components/InventoryPlanner';
import { ContactSection } from './components/ContactSection';
import { TrustBadges } from './components/TrustBadges';
import { TestimonialCarousel } from './components/TestimonialCarousel';
import { Footer } from './components/Footer';
import { QuickCallBarMobile } from './components/QuickCallBarMobile';
import { FloatingChatWidget } from './components/FloatingChatWidget';
import { BackToTopButton } from './components/BackToTopButton';
import { PricingGuideSection } from './components/PricingGuideSection';
import { ItemValuationInsuranceCalculator } from './components/ItemValuationInsuranceCalculator';
import { MovingDayChecklist } from './components/MovingDayChecklist';
import { FaqSection } from './components/FaqSection';
import { VideoTourSection } from './components/VideoTourSection';
import { LogisticsExpertsSection } from './components/LogisticsExpertsSection';
import { CareersSection } from './components/CareersSection';
import { InvestorFleetSection } from './components/InvestorFleetSection';
import { InvestorBannerTeaser } from './components/InvestorBannerTeaser';
import { AdminDashboard } from './components/AdminDashboard';
import { UserDashboard } from './components/UserDashboard';
import { FloatingOfferBanner } from './components/FloatingOfferBanner';
import { Breadcrumbs } from './components/Breadcrumbs';
import { DynamicMetadataManager } from './components/DynamicMetadataManager';
import { ExitIntentNewsletterModal } from './components/ExitIntentNewsletterModal';
import { DigitalCargoInspection } from './components/DigitalCargoInspection';
import { TrustFixedPriceBanner } from './components/TrustFixedPriceBanner';
import { CarHireSection } from './components/CarHireSection';
import { CarHireBookingModal } from './components/CarHireBookingModal';
import { TermsAndConditionsSection } from './components/TermsAndConditionsSection';
import { TermsAndConditionsModal } from './components/TermsAndConditionsModal';
import { CmsProvider } from './context/CmsContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { PageView, ServiceType, SiteSurveyPhoto, DashboardTab, CarHireTripType, CarHireCustomConfig } from './types';

function MainAppContent() {
  // Parse initial page and service from URL hash if present
  const parseInitialRoute = (): { page: PageView; service?: ServiceType } => {
    if (typeof window === 'undefined') return { page: 'home' };
    const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
    if (!hash || hash === 'home') return { page: 'home' };

    if (hash.startsWith('services')) {
      const parts = hash.split('/');
      const svc = parts[1] as ServiceType | undefined;
      if (svc && ['corporate', 'commercial', 'residential', 'haulage', 'car_hire'].includes(svc)) {
        return { page: 'services', service: svc };
      }
      return { page: 'services', service: 'corporate' };
    }

    const validPages: PageView[] = [
      'home',
      'services',
      'coverage',
      'calculator',
      'checklist',
      'tracking',
      'contact',
      'about',
      'careers',
      'investors',
      'admin',
      'dashboard',
      'inspection',
      'car_hire',
      'terms',
    ];
    if (validPages.includes(hash as PageView)) {
      return { page: hash as PageView };
    }
    return { page: 'home' };
  };

  const initialRoute = parseInitialRoute();
  const [currentPage, setCurrentPage] = useState<PageView>(initialRoute.page);
  const [currentService, setCurrentService] = useState<ServiceType | undefined>(initialRoute.service || 'corporate');
  const [dashboardTab, setDashboardTab] = useState<DashboardTab>('quotes');
  const [termsModalOpen, setTermsModalOpen] = useState(false);

  // Reset any cached theme attributes from previous palette switcher
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove(
        'theme-sahara-night',
        'theme-atlantic-cobalt',
        'theme-calabar-viridian',
        'theme-executive-light',
        'theme-dark'
      );
      document.documentElement.removeAttribute('data-theme');
      try {
        localStorage.removeItem('pyda_theme_palette');
      } catch {
        // ignore
      }
    }
  }, []);

  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [carHireModalOpen, setCarHireModalOpen] = useState(false);
  const [carHireModalTripType, setCarHireModalTripType] = useState<CarHireTripType>('intra_state');
  const [carHireModalVehicleId, setCarHireModalVehicleId] = useState<string | undefined>(undefined);
  const [carHireCustomConfig, setCarHireCustomConfig] = useState<CarHireCustomConfig | undefined>(undefined);

  const handleOpenCarHireModal = (
    tripType: CarHireTripType = 'intra_state',
    vehicleId?: string,
    customConfig?: CarHireCustomConfig
  ) => {
    setCarHireModalTripType(tripType);
    if (vehicleId) setCarHireModalVehicleId(vehicleId);
    setCarHireCustomConfig(customConfig);
    setCarHireModalOpen(true);
  };

  const [quoteParams, setQuoteParams] = useState<{
    service?: ServiceType;
    origin?: string;
    destination?: string;
    transitMode?: 'intra' | 'inter';
    instructions?: string;
    surveyPhotos?: SiteSurveyPhoto[];
  }>({});

  const handleOpenQuote = (
    service?: ServiceType, 
    origin?: string, 
    destination?: string,
    instructions?: string,
    surveyPhotos?: SiteSurveyPhoto[],
    transitMode?: 'intra' | 'inter'
  ) => {
    setQuoteParams({ service, origin, destination, instructions, surveyPhotos, transitMode });
    setQuoteModalOpen(true);
  };

  const handleAttachInventoryToQuote = (
    summary: string, 
    totalCbm: number, 
    surveyPhotos?: SiteSurveyPhoto[]
  ) => {
    setQuoteParams({
      service: 'corporate',
      instructions: `[INVENTORY & BULKY SURVEY MANIFEST - ${totalCbm.toFixed(1)} CBM]: ${summary}`,
      surveyPhotos: surveyPhotos || [],
    });
    setQuoteModalOpen(true);
  };

  const handleApplyInsuranceToQuote = (
    declaredValue: number,
    estimatedPremium: number,
    planName: string,
    itemsSummary: string
  ) => {
    setQuoteParams({
      service: 'corporate',
      instructions: `[DECLARED GOODS-IN-TRANSIT VALUATION & INSURANCE POLICY]:\n• Selected Policy: ${planName}\n• Total Declared Replacement Value: ₦${declaredValue.toLocaleString('en-NG')}\n• Estimated GIT Premium: ₦${estimatedPremium.toLocaleString('en-NG')}\n• Schedule Breakdown: ${itemsSummary}`,
    });
    setQuoteModalOpen(true);
  };

  const handlePageChange = (page: PageView, service?: ServiceType) => {
    setCurrentPage(page);
    if (service) {
      setCurrentService(service);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (currentPage === 'admin') {
    return (
      <>
        <DynamicMetadataManager
          currentPage="admin"
          onPageChangeFromHash={(page, svc) => {
            setCurrentPage(page);
            if (svc) setCurrentService(svc);
          }}
        />
        <AdminDashboard onBackToSite={() => setCurrentPage('home')} />
      </>
    );
  }

  return (
    <div className="min-h-screen font-sans antialiased flex flex-col pb-16 sm:pb-0 bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      {/* Dynamic SEO Metadata & Title Manager */}
      <DynamicMetadataManager
        currentPage={currentPage}
        currentService={currentPage === 'services' ? currentService : undefined}
        onPageChangeFromHash={(page, svc) => {
          setCurrentPage(page);
          if (svc) setCurrentService(svc);
        }}
      />

      {/* Header Bar */}
      <Header
        currentPage={currentPage}
        setCurrentPage={handlePageChange}
        onOpenQuoteModal={() => handleOpenQuote()}
      />

      {/* Pyda Fleet Management & Truck Owner Registration Banner (Directly below Header) */}
      <FloatingOfferBanner
        onOpenQuoteModal={() => handleOpenQuote()}
        onNavigate={(page) => handlePageChange(page)}
      />

      {/* Main View Router */}
      <main className="flex-grow">
        {/* Breadcrumb Navigation on Sub-Pages (e.g., Services > Corporate Moving) */}
        {currentPage !== 'home' && (
          <Breadcrumbs
            currentPage={currentPage}
            currentService={currentService}
            dashboardTab={dashboardTab}
            onNavigatePage={handlePageChange}
            onSelectService={(svc) => {
              setCurrentService(svc);
              handlePageChange('services', svc);
            }}
            onSelectDashboardTab={(tab) => {
              setDashboardTab(tab);
              handlePageChange('dashboard');
            }}
          />
        )}

        {currentPage === 'home' && (
          <>
            <Hero
              onOpenQuoteWithParams={(svc, orig, dest, mode) => handleOpenQuote(svc, orig, dest, undefined, undefined, mode)}
              setCurrentPage={handlePageChange}
            />
            <ServicesSection
              onOpenQuoteWithService={(svc) => handleOpenQuote(svc)}
              onOpenCarHireModal={() => handleOpenCarHireModal('intra_state')}
              activeService={currentService}
              onSelectService={(svc) => setCurrentService(svc)}
            />
            {currentService === 'car_hire' && (
              <CarHireSection
                onOpenBookingModal={(tripType, vehicleId, customConfig) => handleOpenCarHireModal(tripType || 'intra_state', vehicleId, customConfig)}
                onNavigateToVault={() => {
                  setDashboardTab('vault');
                  handlePageChange('dashboard');
                }}
              />
            )}
            <AboutSection
              onOpenQuoteModal={() => handleOpenQuote()}
            />
            <LogisticsExpertsSection
              onOpenQuoteModal={(svc, orig, dest) => handleOpenQuote(svc, orig, dest)}
              onNavigateToContact={() => handlePageChange('contact')}
            />
            <PricingGuideSection
              onOpenQuoteWithService={(svc, mode) => handleOpenQuote(svc, undefined, undefined, undefined, undefined, mode)}
              onNavigateToValuationCalculator={() => {
                const el = document.getElementById('item-valuation-insurance-calculator');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                else handlePageChange('calculator');
              }}
            />
            <ItemValuationInsuranceCalculator
              onApplyToQuote={handleApplyInsuranceToQuote}
            />
            <CoverageMapSection 
              onOpenQuoteModal={(svc, orig, dest) => handleOpenQuote(svc, orig, dest)}
            />
            <InvestorBannerTeaser
              onNavigateToInvestors={() => handlePageChange('investors')}
            />
            <TestimonialCarousel
              onOpenQuoteModal={(svc) => handleOpenQuote(svc)}
            />
            <VideoTourSection
              onOpenQuoteModal={(svc) => handleOpenQuote(svc)}
            />
            <InventoryPlanner
              onAttachToQuote={handleAttachInventoryToQuote}
              onOpenCargoInspection={() => {
                setCurrentPage('inspection');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
            <MovingDayChecklist
              onOpenQuoteModal={() => handleOpenQuote()}
            />
            <ShipmentTracker />
            <FaqSection
              onOpenQuoteModal={(svc) => handleOpenQuote(svc as any)}
            />
            <TrustBadges 
              onNavigatePage={handlePageChange}
              onOpenQuoteModal={() => handleOpenQuote()}
            />
            <ContactSection />
          </>
        )}

        {currentPage === 'services' && (
          <div className="pt-4">
            <ServicesSection
              onOpenQuoteWithService={(svc) => handleOpenQuote(svc)}
              onOpenCarHireModal={() => handleOpenCarHireModal('intra_state')}
              activeService={currentService}
              onSelectService={(svc) => setCurrentService(svc)}
            />
            {currentService === 'car_hire' && (
              <CarHireSection
                onOpenBookingModal={(tripType, vehicleId, customConfig) => handleOpenCarHireModal(tripType || 'intra_state', vehicleId, customConfig)}
                onNavigateToVault={() => {
                  setDashboardTab('vault');
                  handlePageChange('dashboard');
                }}
              />
            )}
            <PricingGuideSection
              onOpenQuoteWithService={(svc, mode) => handleOpenQuote(svc, undefined, undefined, undefined, undefined, mode)}
              onNavigateToValuationCalculator={() => {
                const el = document.getElementById('item-valuation-insurance-calculator');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                else handlePageChange('calculator');
              }}
            />
            <ItemValuationInsuranceCalculator
              onApplyToQuote={handleApplyInsuranceToQuote}
            />
            <TestimonialCarousel
              onOpenQuoteModal={(svc) => handleOpenQuote(svc)}
            />
            <TrustBadges 
              onNavigatePage={handlePageChange}
              onOpenQuoteModal={() => handleOpenQuote()}
            />
          </div>
        )}

        {currentPage === 'car_hire' && (
          <div className="pt-4">
            <CarHireSection
              onOpenBookingModal={(tripType, vehicleId, customConfig) => handleOpenCarHireModal(tripType || 'intra_state', vehicleId, customConfig)}
              onNavigateToVault={() => {
                setDashboardTab('vault');
                handlePageChange('dashboard');
              }}
            />
          </div>
        )}

        {currentPage === 'about' && (
          <div className="pt-4">
            <AboutSection
              onOpenQuoteModal={() => handleOpenQuote()}
              onNavigatePage={handlePageChange}
            />
            <LogisticsExpertsSection
              onOpenQuoteModal={(svc, orig, dest) => handleOpenQuote(svc, orig, dest)}
              onNavigateToContact={() => handlePageChange('contact')}
            />
            <TestimonialCarousel
              onOpenQuoteModal={(svc) => handleOpenQuote(svc)}
            />
            <TrustBadges 
              onNavigatePage={handlePageChange}
              onOpenQuoteModal={() => handleOpenQuote()}
            />
          </div>
        )}

        {currentPage === 'coverage' && (
          <div className="pt-4">
            <CoverageMapSection 
              onOpenQuoteModal={(svc, orig, dest) => handleOpenQuote(svc, orig, dest)}
            />
            <PricingGuideSection
              onOpenQuoteWithService={(svc, mode) => handleOpenQuote(svc, undefined, undefined, undefined, undefined, mode)}
              onNavigateToValuationCalculator={() => handlePageChange('calculator')}
            />
            <ContactSection />
          </div>
        )}

        {currentPage === 'calculator' && (
          <div className="pt-4 space-y-12">
            {/* Noticeable Fixed-Price Guarantee Trust Banner */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <TrustFixedPriceBanner />
            </div>

            {/* Digital Cargo Inspection AI Callout Banner */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/20 via-slate-900 to-amber-500/10 border border-amber-500/40 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
                <div className="space-y-2 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs uppercase tracking-wider">
                    <span>Gemini Vision Powered</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    Digital Cargo Inspection & Fragility Scanner
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                    Take or upload photos of your rooms, pallets, or items via your device camera. Our AI vision model automatically generates a labeled inventory manifest, flags fragile items, and computes exact CBM volume.
                  </p>
                </div>
                <button
                  onClick={() => handlePageChange('inspection')}
                  className="bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-xl shadow-amber-500/20 flex items-center gap-2 transition-all transform active:scale-95 shrink-0"
                >
                  <span>Launch Camera & Cargo Scanner</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>

            <PricingGuideSection
              onOpenQuoteWithService={(svc, mode) => handleOpenQuote(svc, undefined, undefined, undefined, undefined, mode)}
              onNavigateToValuationCalculator={() => {
                const el = document.getElementById('item-valuation-insurance-calculator');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />
            <ItemValuationInsuranceCalculator
              onApplyToQuote={handleApplyInsuranceToQuote}
            />
            <InventoryPlanner
              onAttachToQuote={handleAttachInventoryToQuote}
              onOpenCargoInspection={() => {
                setCurrentPage('inspection');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
            <div className="text-center pb-12">
              <button
                onClick={() => handleOpenQuote()}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm px-8 py-4 rounded-xl shadow-xl transition-all transform active:scale-95"
              >
                Launch Formal Quote Calculator Wizard
              </button>
            </div>
          </div>
        )}

        {currentPage === 'inspection' && (
          <div className="pt-4">
            <DigitalCargoInspection
              onAttachToQuote={handleAttachInventoryToQuote}
              onNavigateToQuote={() => handleOpenQuote()}
              onBackToHome={() => handlePageChange('home')}
            />
          </div>
        )}

        {currentPage === 'tracking' && (
          <div className="pt-4">
            <ShipmentTracker />
          </div>
        )}

        {currentPage === 'checklist' && (
          <div className="pt-4">
            <MovingDayChecklist
              onOpenQuoteModal={() => handleOpenQuote()}
            />
          </div>
        )}

        {currentPage === 'contact' && (
          <div className="pt-4">
            <ContactSection />
          </div>
        )}

        {currentPage === 'careers' && (
          <div className="pt-4">
            <CareersSection onOpenQuoteModal={() => handleOpenQuote()} />
          </div>
        )}

        {currentPage === 'investors' && (
          <div className="pt-4">
            <InvestorFleetSection
              onOpenQuoteModal={() => handleOpenQuote()}
              onNavigateToContact={() => handlePageChange('contact')}
              onNavigateToDashboard={(tab) => {
                if (tab) setDashboardTab(tab);
                handlePageChange('dashboard');
              }}
            />
          </div>
        )}

        {currentPage === 'dashboard' && (
          <div className="pt-4">
            <UserDashboard
              onNavigatePage={handlePageChange}
              onOpenQuoteModal={(svc, orig, dest) => handleOpenQuote(svc, orig, dest)}
              onOpenCarHireModal={(tripType, vehicleId) => handleOpenCarHireModal(tripType || 'intra_state', vehicleId)}
              initialTab={dashboardTab}
            />
          </div>
        )}

        {currentPage === 'terms' && (
          <div className="pt-4">
            <TermsAndConditionsSection
              onOpenQuoteModal={() => handleOpenQuote()}
              onNavigatePage={handlePageChange}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer
        setCurrentPage={handlePageChange}
        onOpenQuoteModal={() => handleOpenQuote()}
        onOpenTermsModal={() => setTermsModalOpen(true)}
      />

      {/* Mobile Sticky Quick Action Bar */}
      <QuickCallBarMobile
        onOpenQuoteModal={() => handleOpenQuote()}
      />

      {/* Floating Expert Chat Widget & Back to Top */}
      <FloatingChatWidget 
        currentPage={currentPage}
        currentService={currentService}
      />
      <BackToTopButton />

      {/* Timed Exit-Intent Newsletter & Moving Tips Modal */}
      <ExitIntentNewsletterModal
        onOpenQuoteModal={handleOpenQuote}
      />

      {/* Quote Calculator Modal */}
      <QuoteCalculatorModal
        isOpen={quoteModalOpen}
        onClose={() => setQuoteModalOpen(false)}
        initialService={quoteParams.service}
        initialTransitMode={quoteParams.transitMode}
        initialOriginState={quoteParams.origin}
        initialDestinationState={quoteParams.destination}
        initialInstructions={quoteParams.instructions}
        initialSurveyPhotos={quoteParams.surveyPhotos}
        onNavigateToVault={(docId) => {
          setQuoteModalOpen(false);
          setDashboardTab('vault');
          handlePageChange('dashboard');
        }}
        onOpenTermsModal={() => setTermsModalOpen(true)}
        onOpenInspection={() => {
          setQuoteModalOpen(false);
          handlePageChange('inspection');
        }}
      />

      {/* Executive Inter/Intra State Car Hire Booking & Invoicing Modal */}
      <CarHireBookingModal
        isOpen={carHireModalOpen}
        onClose={() => setCarHireModalOpen(false)}
        initialTripType={carHireModalTripType}
        initialVehicleId={carHireModalVehicleId}
        initialCustomConfig={carHireCustomConfig}
        onNavigateToVault={(docId) => {
          setCarHireModalOpen(false);
          setDashboardTab('vault');
          handlePageChange('dashboard');
        }}
        onOpenTermsModal={() => setTermsModalOpen(true)}
      />

      {/* Comprehensive Terms and Conditions & Protective Disclosures Modal */}
      <TermsAndConditionsModal
        isOpen={termsModalOpen}
        onClose={() => setTermsModalOpen(false)}
        onNavigateToFullPage={() => {
          setTermsModalOpen(false);
          handlePageChange('terms');
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <CmsProvider>
        <AuthProvider>
          <MainAppContent />
        </AuthProvider>
      </CmsProvider>
    </LanguageProvider>
  );
}
