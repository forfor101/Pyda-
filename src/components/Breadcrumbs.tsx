import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, 
  ChevronRight, 
  ChevronDown, 
  ArrowLeft, 
  Copy, 
  Check, 
  Share2, 
  Building2, 
  Store, 
  Truck, 
  Car,
  Layers, 
  ExternalLink 
} from 'lucide-react';
import { PageView, ServiceType } from '../types';
import { useCms } from '../context/CmsContext';

export interface BreadcrumbItem {
  id: string;
  name: string;
  href: string;
  page?: PageView;
  service?: ServiceType;
  tab?: string;
  isCurrent?: boolean;
}

interface BreadcrumbsProps {
  currentPage: PageView;
  currentService?: ServiceType;
  dashboardTab?: string;
  onNavigatePage: (page: PageView, service?: ServiceType) => void;
  onSelectService?: (service: ServiceType) => void;
  onSelectDashboardTab?: (tab: any) => void;
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  currentPage,
  currentService = 'corporate',
  dashboardTab,
  onNavigatePage,
  onSelectService,
  onSelectDashboardTab,
  className = '',
}) => {
  const { cms } = useCms();
  const [copied, setCopied] = useState(false);
  const [serviceMenuOpen, setServiceMenuOpen] = useState(false);
  const serviceMenuRef = useRef<HTMLDivElement>(null);

  // Close service switcher dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (serviceMenuRef.current && !serviceMenuRef.current.contains(e.target as Node)) {
        setServiceMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Construct baseUrl
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://megatrendmovers.com';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';

  // Service display names mapping
  const serviceLabels: Record<ServiceType, { name: string; shortName: string; icon: any }> = {
    corporate: { 
      name: 'Corporate Moving', 
      shortName: 'Corporate', 
      icon: <Building2 className="w-3.5 h-3.5" /> 
    },
    commercial: { 
      name: 'Commercial Moving', 
      shortName: 'Commercial', 
      icon: <Store className="w-3.5 h-3.5" /> 
    },
    residential: { 
      name: 'Residential Moving', 
      shortName: 'Residential', 
      icon: <Home className="w-3.5 h-3.5" /> 
    },
    haulage: { 
      name: 'Heavy Haulage & Freight', 
      shortName: 'Haulage', 
      icon: <Truck className="w-3.5 h-3.5" /> 
    },
    car_hire: { 
      name: 'Executive Car Hire & Chauffeur', 
      shortName: 'Car Hire', 
      icon: <Car className="w-3.5 h-3.5" /> 
    },
  };

  // Dashboard tab names mapping
  const dashboardTabLabels: Record<string, string> = {
    quotes: 'Relocation Quotes & Estimates',
    shipments: 'Active Shipments & GPS',
    fleet: 'Active Fleet Overview',
    vault: 'Insurance & Agreements Vault',
    inventory: 'Inventory Survey Photos',
    payouts: 'Investor Fleet Performance & Payouts',
    profile: 'Security & Account Settings',
  };

  // Build the breadcrumb hierarchy items
  const items: BreadcrumbItem[] = [
    {
      id: 'home',
      name: 'Home',
      href: `${origin}${pathname}#home`,
      page: 'home',
      isCurrent: false,
    },
  ];

  if (currentPage === 'services') {
    items.push({
      id: 'services-root',
      name: 'Services',
      href: `${origin}${pathname}#services`,
      page: 'services',
      isCurrent: !currentService,
    });

    if (currentService) {
      const activeSvcKey = (currentService as ServiceType);
      const svcInfo = serviceLabels[activeSvcKey] || { name: 'Corporate Moving', shortName: 'Corporate', icon: <Building2 className="w-3.5 h-3.5" /> };
      items.push({
        id: `service-${activeSvcKey}`,
        name: svcInfo.name,
        href: `${origin}${pathname}#services/${activeSvcKey}`,
        page: 'services',
        service: activeSvcKey,
        isCurrent: true,
      });
    }
  } else if (currentPage === 'coverage') {
    items.push({
      id: 'coverage',
      name: 'Branches & Coverage Network',
      href: `${origin}${pathname}#coverage`,
      page: 'coverage',
      isCurrent: true,
    });
  } else if (currentPage === 'calculator') {
    items.push({
      id: 'calculator-root',
      name: 'Relocation Calculator',
      href: `${origin}${pathname}#calculator`,
      page: 'calculator',
      isCurrent: false,
    });
    items.push({
      id: 'calculator-volume',
      name: 'Volume (CBM) & Valuation Estimator',
      href: `${origin}${pathname}#calculator`,
      page: 'calculator',
      isCurrent: true,
    });
  } else if (currentPage === 'checklist') {
    items.push({
      id: 'checklist-root',
      name: 'Moving Checklist',
      href: `${origin}${pathname}#checklist`,
      page: 'checklist',
      isCurrent: false,
    });
    items.push({
      id: 'checklist-planner',
      name: 'Moving Day Preparation Guide',
      href: `${origin}${pathname}#checklist`,
      page: 'checklist',
      isCurrent: true,
    });
  } else if (currentPage === 'tracking') {
    items.push({
      id: 'tracking-root',
      name: 'Cargo Tracking',
      href: `${origin}${pathname}#tracking`,
      page: 'tracking',
      isCurrent: false,
    });
    items.push({
      id: 'tracking-telematics',
      name: 'Live GPS Telematics',
      href: `${origin}${pathname}#tracking`,
      page: 'tracking',
      isCurrent: true,
    });
  } else if (currentPage === 'about') {
    items.push({
      id: 'about-root',
      name: 'About Pyda Movers',
      href: `${origin}${pathname}#about`,
      page: 'about',
      isCurrent: false,
    });
    items.push({
      id: 'about-heritage',
      name: 'Heritage, Fleet & Safety',
      href: `${origin}${pathname}#about`,
      page: 'about',
      isCurrent: true,
    });
  } else if (currentPage === 'careers') {
    items.push({
      id: 'careers-root',
      name: 'Careers',
      href: `${origin}${pathname}#careers`,
      page: 'careers',
      isCurrent: false,
    });
    items.push({
      id: 'careers-openings',
      name: 'Fleet Driver & Logistics Openings',
      href: `${origin}${pathname}#careers`,
      page: 'careers',
      isCurrent: true,
    });
  } else if (currentPage === 'investors') {
    items.push({
      id: 'investors-root',
      name: 'Fleet Investors',
      href: `${origin}${pathname}#investors`,
      page: 'investors',
      isCurrent: false,
    });
    items.push({
      id: 'investors-telematics',
      name: 'Managed Trucking & Telematics',
      href: `${origin}${pathname}#investors`,
      page: 'investors',
      isCurrent: true,
    });
  } else if (currentPage === 'dashboard') {
    items.push({
      id: 'dashboard-root',
      name: 'Client Portal',
      href: `${origin}${pathname}#dashboard`,
      page: 'dashboard',
      isCurrent: !dashboardTab,
    });
    if (dashboardTab && dashboardTabLabels[dashboardTab]) {
      items.push({
        id: `dashboard-${dashboardTab}`,
        name: dashboardTabLabels[dashboardTab],
        href: `${origin}${pathname}#dashboard`,
        page: 'dashboard',
        tab: dashboardTab,
        isCurrent: true,
      });
    }
  } else if (currentPage === 'contact') {
    items.push({
      id: 'contact-root',
      name: 'Contact & Depots',
      href: `${origin}${pathname}#contact`,
      page: 'contact',
      isCurrent: false,
    });
    items.push({
      id: 'contact-hubs',
      name: 'Abuja HQ & Regional Hubs',
      href: `${origin}${pathname}#contact`,
      page: 'contact',
      isCurrent: true,
    });
  } else if (currentPage === 'admin') {
    items.push({
      id: 'admin-root',
      name: 'Administration',
      href: `${origin}${pathname}#admin`,
      page: 'admin',
      isCurrent: false,
    });
    items.push({
      id: 'admin-portal',
      name: 'Logistics Command Center',
      href: `${origin}${pathname}#admin`,
      page: 'admin',
      isCurrent: true,
    });
  } else if (currentPage === 'terms') {
    items.push({
      id: 'terms-root',
      name: 'Legal & Disclosures',
      href: `${origin}${pathname}#terms`,
      page: 'terms',
      isCurrent: false,
    });
    items.push({
      id: 'terms-page',
      name: 'Standard Trading Conditions & Carrier Protective Disclosures',
      href: `${origin}${pathname}#terms`,
      page: 'terms',
      isCurrent: true,
    });
  }

  // =========================================================================
  // SEARCH ENGINE SCHEMA.ORG BREADCRUMBLIST JSON-LD GENERATION
  // =========================================================================
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': items.map((item, index) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'name': item.name,
        'item': item.href,
      })),
    };

    const scriptId = 'schema-breadcrumb-json-ld';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(breadcrumbSchema, null, 2);

    return () => {
      // Cleanup on unmount if needed
    };
  }, [items]);

  // Handle Breadcrumb navigation clicks
  const handleItemClick = (e: React.MouseEvent, item: BreadcrumbItem) => {
    e.preventDefault();
    if (item.isCurrent) return;

    if (item.page) {
      onNavigatePage(item.page, item.service);
      if (item.service && onSelectService) {
        onSelectService(item.service);
      }
      if (item.tab && onSelectDashboardTab) {
        onSelectDashboardTab(item.tab);
      }
    }
  };

  // Quick Back navigation
  const handleGoBack = () => {
    if (items.length > 2) {
      // Go to parent item
      const parent = items[items.length - 2];
      if (parent.page) {
        onNavigatePage(parent.page, parent.service);
      }
    } else {
      // Go to Home
      onNavigatePage('home');
    }
  };

  // Copy current URL / breadcrumb link to clipboard
  const handleCopyLink = () => {
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <nav
      id="breadcrumb-navigation"
      aria-label="Breadcrumb"
      className={`bg-slate-900/90 border-b border-slate-800/80 backdrop-blur-md sticky top-16 z-30 transition-all ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex items-center justify-between gap-3">
          
          {/* Left: Interactive Path Trail with Schema.org Microdata */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 min-w-0">
            {/* Quick Back Button on mobile / tablet */}
            <button
              type="button"
              onClick={handleGoBack}
              title="Go back to previous level"
              aria-label="Back"
              className="sm:hidden p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors shrink-0"
              id="breadcrumb-back-btn"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>

            <ol
              itemScope
              itemType="https://schema.org/BreadcrumbList"
              className="flex items-center gap-1.5 sm:gap-2 text-xs text-slate-400 whitespace-nowrap min-w-0"
            >
              {items.map((item, index) => {
                const isLast = index === items.length - 1;
                const isFirst = index === 0;

                return (
                  <li
                    key={item.id}
                    itemProp="itemListElement"
                    itemScope
                    itemType="https://schema.org/ListItem"
                    className="flex items-center gap-1.5 sm:gap-2 min-w-0"
                  >
                    {isLast ? (
                      /* Leaf / Current Active Node */
                      <div className="flex items-center gap-1.5 font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                        {currentPage === 'services' && currentService && (
                          <span className="text-amber-400 shrink-0">
                            {serviceLabels[currentService]?.icon}
                          </span>
                        )}
                        <span
                          itemProp="name"
                          aria-current="page"
                          className="truncate max-w-[180px] sm:max-w-xs md:max-w-none text-slate-100 font-black text-xs"
                          id="breadcrumb-current-page"
                        >
                          {item.name}
                        </span>
                        <meta itemProp="position" content={String(index + 1)} />

                        {/* If on services, show dropdown trigger for sibling switching */}
                        {currentPage === 'services' && (
                          <div className="relative inline-block text-left" ref={serviceMenuRef}>
                            <button
                              type="button"
                              onClick={() => setServiceMenuOpen(!serviceMenuOpen)}
                              title="Switch service category"
                              aria-expanded={serviceMenuOpen}
                              aria-haspopup="true"
                              className="p-1 rounded-md hover:bg-amber-400/20 text-amber-300 hover:text-white transition-colors"
                              id="breadcrumb-service-switcher-btn"
                            >
                              <ChevronDown className="w-3 h-3" />
                            </button>

                            {/* Dropdown Menu */}
                            {serviceMenuOpen && (
                              <div
                                className="absolute left-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl z-50 p-1.5 animate-in fade-in zoom-in-95 duration-150"
                                role="menu"
                                id="breadcrumb-service-dropdown"
                              >
                                <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-800">
                                  All Relocation Services
                                </div>
                                {(['corporate', 'commercial', 'residential', 'haulage', 'car_hire'] as ServiceType[]).map((svcKey) => {
                                  const svc = serviceLabels[svcKey];
                                  const isSelected = currentService === svcKey;
                                  return (
                                    <button
                                      key={svcKey}
                                      type="button"
                                      role="menuitem"
                                      onClick={() => {
                                        if (onSelectService) onSelectService(svcKey);
                                        onNavigatePage('services', svcKey);
                                        setServiceMenuOpen(false);
                                      }}
                                      className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-left text-xs font-bold transition-colors ${
                                        isSelected
                                          ? 'bg-amber-500 text-slate-950 font-black'
                                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                      }`}
                                      id={`breadcrumb-switch-to-${svcKey}`}
                                    >
                                      <div className="flex items-center gap-2">
                                        <span className={isSelected ? 'text-slate-950' : 'text-amber-400'}>
                                          {svc.icon}
                                        </span>
                                        <span>{svc.name}</span>
                                      </div>
                                      {isSelected && <Check className="w-3.5 h-3.5" />}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Parent Node Link */
                      <a
                        itemProp="item"
                        href={item.href}
                        onClick={(e) => handleItemClick(e, item)}
                        className={`flex items-center gap-1.5 py-1 px-2 rounded-lg transition-colors hover:bg-slate-800/80 hover:text-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 ${
                          isFirst ? 'font-bold text-slate-300' : 'text-slate-400'
                        }`}
                        id={`breadcrumb-item-${item.id}`}
                      >
                        {isFirst && <Home className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400" />}
                        <span itemProp="name">{item.name}</span>
                        <meta itemProp="position" content={String(index + 1)} />
                      </a>
                    )}

                    {/* Separator Chevron */}
                    {!isLast && (
                      <ChevronRight
                        className="w-3.5 h-3.5 text-slate-600 shrink-0 select-none"
                        aria-hidden="true"
                      />
                    )}
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Right: Quick Utility Actions (Share/Copy Link & Hierarchy Tag) */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyLink}
              title="Copy path URL to clipboard"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 border border-slate-750 transition-all active:scale-95"
              id="breadcrumb-copy-path-btn"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Path Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Share Path</span>
                </>
              )}
            </button>

            <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/50">
              Verified Schema.org
            </span>
          </div>

        </div>
      </div>
    </nav>
  );
};
