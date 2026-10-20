import React, { useEffect } from 'react';
import { PageView, ServiceType } from '../types';
import { applyPageMetadata } from '../lib/seoMetadata';
import { useLanguage } from '../context/LanguageContext';
import { useCms } from '../context/CmsContext';

interface DynamicMetadataManagerProps {
  currentPage: PageView;
  currentService?: ServiceType;
  onPageChangeFromHash?: (page: PageView, service?: ServiceType) => void;
}

export const DynamicMetadataManager: React.FC<DynamicMetadataManagerProps> = ({
  currentPage,
  currentService,
  onPageChangeFromHash,
}) => {
  const { language } = useLanguage();
  const { cms } = useCms();

  // 1. Synchronize document title, meta tags, and structured JSON-LD whenever page, service, language, or CMS SEO metadata changes
  useEffect(() => {
    applyPageMetadata(currentPage, currentService, language, cms?.seoMetadata);

    // Update browser URL hash cleanly without forcing page jumps
    let expectedHash = `#${currentPage}`;
    if (currentPage === 'home') {
      expectedHash = '';
    } else if (currentPage === 'services' && currentService) {
      expectedHash = `#services/${currentService}`;
    }

    const currentHash = window.location.hash;
    if (currentHash !== expectedHash && !(currentPage === 'home' && currentHash === '')) {
      const newUrl = expectedHash ? `${window.location.pathname}${expectedHash}` : window.location.pathname;
      window.history.replaceState({ page: currentPage, service: currentService }, '', newUrl);
    }
  }, [currentPage, currentService, language, cms?.seoMetadata]);

  // 2. Listen to browser popstate / hashchange events for browser history and deep-linking support
  useEffect(() => {
    const handleHashChange = () => {
      if (!onPageChangeFromHash) return;
      const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
      
      if (!hash || hash === 'home') {
        onPageChangeFromHash('home');
        return;
      }

      if (hash.startsWith('services')) {
        const parts = hash.split('/');
        const serviceSubtype = parts[1] as ServiceType | undefined;
        if (serviceSubtype && ['corporate', 'commercial', 'residential', 'haulage', 'car_hire'].includes(serviceSubtype)) {
          onPageChangeFromHash('services', serviceSubtype);
        } else {
          onPageChangeFromHash('services');
        }
        return;
      }

      const validPages: PageView[] = [
        'home',
        'services',
        'car_hire',
        'coverage',
        'calculator',
        'checklist',
        'tracking',
        'contact',
        'about',
        'careers',
        'investors',
        'dashboard',
        'admin',
        'terms',
      ];

      if (validPages.includes(hash as PageView)) {
        onPageChangeFromHash(hash as PageView);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
    };
  }, [onPageChangeFromHash]);

  return null;
};
