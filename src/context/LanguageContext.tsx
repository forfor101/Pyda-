import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'fr';

export interface LanguageOption {
  code: Language;
  label: string;
  nativeLabel: string;
  flag: string;
  regionHint: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: 'en',
    label: 'English',
    nativeLabel: 'English',
    flag: '🇬🇧',
    regionHint: 'Nigeria, Ghana, UK, Global',
  },
  {
    code: 'fr',
    label: 'English (West Africa)',
    nativeLabel: 'English (ECOWAS)',
    flag: '🌍',
    regionHint: 'Benin, Togo, Ivory Coast, Cameroon, Senegal',
  },
];

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    // Nav Items
    'nav.home': 'Home',
    'nav.services': 'Services',
    'nav.about': 'About Us',
    'nav.investors': 'Register Trucks',
    'nav.coverage': 'Branches',
    'nav.calculator': 'Rate Estimator',
    'nav.checklist': 'Move Checklist',
    'nav.tracking': 'Live Tracking',
    'nav.contact': 'Contact',
    'nav.admin': 'Admin CMS',
    'nav.careers': 'Careers',

    // Header & Pan-African presence
    'header.brandTag': '& Logistics',
    'header.panAfricanPresence': 'Pan-African Network',
    'header.callDispatch': 'Call Dispatch',
    'header.switchLanguage': 'Switch Language',
    'header.languageSelected': 'Language',
    'header.ecowasRegion': 'ECOWAS & Central Africa Corridors',

    // Common CTAs & Labels
    'cta.getQuote': 'Get Instant Quote',
    'cta.claimOffer': 'Get Instant Quote',
    'cta.trackShipment': 'Track Cargo',
    'cta.calculateRate': 'Estimate Cost',
    'cta.viewBranches': 'Explore 36+ Hubs',
    'cta.learnMore': 'Learn More',
    'cta.viewAllServices': 'View All Services',
    'cta.contactUs': 'Contact Us Today',

    // Fleet Management Banner
    'fleet.bannerBadge': 'PYDA FLEET MANAGEMENT',
    'fleet.registerTrucks': 'Register Your Trucks Under Pyda Fleet Management',
    'fleet.guaranteedEarnings': 'Earn ₦650,000 to ₦3,500,000 Guaranteed Monthly Net Returns per truck.',
    'fleet.automatedPayout': '5th of Every Month Automated Direct Bank Remittance.',
    'fleet.gitCover': '100% Comprehensive Goods-In-Transit (GIT) Insurance by Leadway & AIICO.',
    'fleet.telematics': '24/7 Satellite Telematics & Speed Governors with Full Owner Portal Access.',
    'fleet.zeroIdle': 'Zero Idle Days with Long-Term Corporate Freight Contracts.',

    // Footer & Meta
    'footer.headquarters': 'Abuja Corporate HQ & Lagos Maritime Terminal',
    'footer.copyright': 'All Rights Reserved. Licensed Inter-State & Cross-Border Freight Hauler.',

    // Global Search
    'search.placeholder': 'Search services, branches, tools...',
    'search.shortcut': '⌘K',
    'search.quickSearch': 'Quick Search',
    'search.allCategories': 'All',
    'search.catServices': 'Services',
    'search.catBranches': 'Branches',
    'search.catTools': 'Tools & Estimators',
    'search.catHelp': 'Help & Support',
    'search.catPages': 'Pages',
    'search.popularSearches': 'Popular Searches',
    'search.noResults': 'No matching results found for',
    'search.trySearching': 'Try searching for:',
    'search.resultsCount': 'results found',
    'search.closeHint': 'ESC to close',
    'search.navigateHint': 'to navigate',
    'search.selectHint': 'to select',
  },
  fr: {
    // Nav Items
    'nav.home': 'Home',
    'nav.services': 'Our Services',
    'nav.about': 'About Us',
    'nav.investors': 'Register Trucks',
    'nav.coverage': 'Branches & Network',
    'nav.calculator': 'Rate Estimator',
    'nav.checklist': 'Move Checklist',
    'nav.tracking': 'Live Tracking',
    'nav.contact': 'Contact',
    'nav.admin': 'Admin CMS',
    'nav.careers': 'Careers & Jobs',

    // Header & Pan-African presence
    'header.brandTag': '& Pan-African Logistics',
    'header.panAfricanPresence': 'Pan-African Network',
    'header.callDispatch': 'Call Dispatch',
    'header.switchLanguage': 'Select Region / Locale',
    'header.languageSelected': 'Language',
    'header.ecowasRegion': 'ECOWAS & Central Africa Corridors',

    // Common CTAs & Labels
    'cta.getQuote': 'Get Instant Free Quote',
    'cta.claimOffer': 'Get Instant Free Quote',
    'cta.trackShipment': 'Track Cargo',
    'cta.calculateRate': 'Estimate Cost',
    'cta.viewBranches': 'Explore 36+ Hubs',
    'cta.learnMore': 'Learn More',
    'cta.viewAllServices': 'View All Services',
    'cta.contactUs': 'Contact Us Today',

    // Fleet Management Banner
    'fleet.bannerBadge': 'GESTION DE FLOTTE PYDA',
    'fleet.registerTrucks': 'Enregistrez Vos Camions Sous La Gestion De Flotte Pyda',
    'fleet.guaranteedEarnings': 'Revenus nets mensuels garantis de 650 000 ₦ a 3 500 000 ₦ par camion.',
    'fleet.automatedPayout': 'Virement bancaire direct automatise le 5 de chaque mois.',
    'fleet.gitCover': '100% Assurance Marchandises Transportees couverte par Leadway & AIICO.',
    'fleet.telematics': 'Telemetrie satellite 24h/24 et limiteurs de vitesse avec acces portail proprietaire.',
    'fleet.zeroIdle': 'Zero jour dimmobilisation avec contrats de fret corporatifs a long terme.',

    // Footer & Meta
    'footer.headquarters': 'Abuja Corporate HQ & Lagos Maritime Terminal',
    'footer.copyright': 'All Rights Reserved. ECOWAS-licensed interstate and cross-border freight carrier.',

    // Global Search
    'search.placeholder': 'Search services, branches, tools...',
    'search.shortcut': '⌘K',
    'search.quickSearch': 'Quick Search',
    'search.allCategories': 'All',
    'search.catServices': 'Services',
    'search.catBranches': 'Branches',
    'search.catTools': 'Tools & Estimators',
    'search.catHelp': 'Help & Support',
    'search.catPages': 'Pages',
    'search.popularSearches': 'Popular Searches',
    'search.noResults': 'No matching results found for',
    'search.trySearching': 'Try searching for:',
    'search.resultsCount': 'results found',
    'search.closeHint': 'ESC to close',
    'search.navigateHint': 'to navigate',
    'search.selectHint': 'to select',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
  currentOption: LanguageOption;
  languages: LanguageOption[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'megatrend_lang_preference';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Always default to English; read stored manual preference if explicitly set
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === 'en' || saved === 'fr') {
          return saved as Language;
        }
      } catch {
        // Ignore storage errors
      }
    }
    return 'en';
  });

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
    } catch {
      // Ignore storage errors
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = newLang;
    }
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  const currentOption = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  const t = (key: string, fallback?: string): string => {
    const langDict = TRANSLATIONS[language];
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    const defaultDict = TRANSLATIONS['en'];
    if (defaultDict && defaultDict[key]) {
      return defaultDict[key];
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        currentOption,
        languages: SUPPORTED_LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
