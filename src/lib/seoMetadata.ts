import { PageView, ServiceType, SeoManagerConfig, ServiceSeoConfig } from '../types';

export interface PageMetadata {
  title: string;
  description: string;
  keywords: string;
  canonicalPath: string;
  ogType?: 'website' | 'article';
  ogImage?: string;
  robots?: string;
  schema?: Record<string, any>;
}

export const BASE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://megatrendmovers.com';
export const DEFAULT_OG_IMAGE = 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&h=630&q=80';

export const DEFAULT_SERVICE_SEO_CONFIGS: SeoManagerConfig = {
  services: {
    corporate: {
      title: 'Corporate Office Relocation Services | Zero-Downtime Migration Nigeria | Megatrend Movers',
      description: 'Zero-downtime office and headquarters migration in Abuja, Lagos, and Port Harcourt. Specialized IT server rack disassembly, serialized asset tagging, and weekend corporate dispatch.',
      keywords: 'corporate relocation Nigeria, office moving Abuja, IT server migration, corporate movers Lagos, business relocation service, executive office moving, commercial movers Nigeria',
      ogImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&h=630&q=80',
      canonicalPath: '/#services/corporate',
      robots: 'index, follow',
    },
    commercial: {
      title: 'Commercial Facility & Warehouse Relocation Solutions | Megatrend Movers Nigeria',
      description: 'End-to-end relocation for warehouses, retail stores, manufacturing facilities, and medical laboratories across Nigeria. Heavy machinery handling and inventory crating.',
      keywords: 'commercial relocation Nigeria, warehouse moving Lagos, industrial logistics Abuja, factory equipment transport, retail store inventory relocation, heavy machinery haulage',
      ogImage: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&h=630&q=80',
      canonicalPath: '/#services/commercial',
      robots: 'index, follow',
    },
    residential: {
      title: 'Residential & Home Moving Services | Stress-Free Packing & Relocation | Megatrend Movers',
      description: 'Premium home and apartment relocation across Lagos, Abuja, Port Harcourt, and 36 states. Full packing, furniture disassembly, delicate glassware crating, and safe delivery.',
      keywords: 'home movers Nigeria, house moving Abuja, residential moving Lagos, apartment relocation Port Harcourt, furniture movers Nigeria, packing service, white glove relocation',
      ogImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&h=630&q=80',
      canonicalPath: '/#services/residential',
      robots: 'index, follow',
    },
    haulage: {
      title: 'Heavy Haulage & Interstate Freight Trucking (3T - 30T) | Megatrend Logistics Nigeria',
      description: 'Long-haul freight and heavy equipment transport across all 36 Nigerian states and Pan-African corridors. Padded box vans, 10-ton flatbeds, and 30-ton container haulage rigs.',
      keywords: 'haulage company Nigeria, interstate trucking Lagos Abuja, 30 ton truck rental, container haulage, heavy equipment transport, logistics freight Nigeria, interstate goods delivery',
      ogImage: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1200&h=630&q=80',
      canonicalPath: '/#services/haulage',
      robots: 'index, follow',
    },
    car_hire: {
      title: 'Executive Car Hire & Chauffeur Services | Inter/Intra State Luxury Fleet | Megatrend Movers',
      description: 'Chauffeur-driven luxury car hire in Lagos, Abuja, and interstate travel across 36 states. Armored SUVs, Mercedes sedans, VIP buses, armed MOPOL police escort, and automated Pro-Forma Invoice / Tax Clearance Receipts.',
      keywords: 'car hire Nigeria, chauffeur service Lagos, executive car hire Abuja, interstate car rental Nigeria, armored car hire Lagos, bulletproof SUV rental Abuja, airport protocol transfer',
      ogImage: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&h=630&q=80',
      canonicalPath: '/#services/car_hire',
      robots: 'index, follow',
    },
  },
  pages: {
    home: {
      title: 'Megatrend Movers & Logistics | Premier Relocation & Haulage Services Nigeria',
      description: 'Nigeria & Pan-Africa’s leading relocation and haulage partner. Specialized in corporate office migration, commercial logistics, residential moving, and heavy interstate freight across 36 states.',
      keywords: 'movers in Nigeria, Abuja moving company, Lagos logistics company, office relocation Nigeria, interstate haulage, home movers Lagos, residential moving Abuja, corporate relocation',
      ogImage: DEFAULT_OG_IMAGE,
      canonicalPath: '/',
    },
    services: {
      title: 'Relocation & Logistics Services | Megatrend Movers Nigeria',
      description: 'Explore comprehensive moving services by Megatrend: Corporate Headquarters Migration, Commercial Facility Moving, Home Relocation, and 30-Ton Interstate Heavy Haulage.',
      keywords: 'moving services Nigeria, corporate office moving Abuja, commercial logistics Lagos, home moving service, interstate trucking, logistics company Nigeria',
      ogImage: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=1200&h=630&q=80',
      canonicalPath: '/#services',
    },
    calculator: {
      title: 'Moving Cost & Volume (CBM) Calculator | Instant Relocation Estimates | Megatrend Movers',
      description: 'Calculate moving costs and volume in cubic meters (CBM) instantly. Get transparent freight estimates tailored for intra-city moves and interstate haulage across Nigeria.',
      keywords: 'moving cost calculator Nigeria, relocation price estimator, moving volume CBM calculator, truck sizing calculator, logistics quote generator Nigeria',
      ogImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&h=630&q=80',
      canonicalPath: '/#calculator',
    },
    checklist: {
      title: 'Interactive Moving Day Preparation Checklist & Printable Planner | Megatrend Movers',
      description: 'Step-by-step relocation checklist from 4 weeks out to moving day and post-move setup. Keep track of tasks with auto-saved browser progress or print a custom document.',
      keywords: 'moving day checklist, relocation planner Nigeria, packing checklist, house moving tips, moving guide, moving timeline planner',
      ogImage: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=1200&h=630&q=80',
      canonicalPath: '/#checklist',
    },
    tracking: {
      title: 'Live Shipment & Cargo GPS Tracking | Megatrend Movers & Logistics',
      description: 'Track your moving consignment, corporate freight, or haulage truck in real time with live GPS status updates, dispatch milestones, and estimated time of arrival.',
      keywords: 'shipment tracking Nigeria, track consignment, freight tracker, logistics GPS tracking, cargo tracking Lagos Abuja',
      ogImage: DEFAULT_OG_IMAGE,
      canonicalPath: '/#tracking',
    },
    coverage: {
      title: 'Nationwide Branch Network & Pan-African Logistics Corridors | Megatrend Movers',
      description: 'Discover Megatrend’s coverage across all 36 Nigerian states with major logistics hubs in Abuja, Lagos, Port Harcourt, and Kano, plus cross-border corridors to Ghana, Benin, and Cameroon.',
      keywords: 'movers in Abuja, movers in Lagos, movers in Port Harcourt, nationwide logistics network Nigeria, West Africa cross-border haulage, freight hubs',
      ogImage: DEFAULT_OG_IMAGE,
      canonicalPath: '/#coverage',
    },
    about: {
      title: 'About Megatrend Movers & Logistics Ltd | Nigeria & Pan-Africa Logistics Leader',
      description: 'Learn about Megatrend Movers & Logistics Ltd: our heritage, modern padded haulage fleet, certified packing specialists, safety compliance, and vision across Africa.',
      keywords: 'about Megatrend Movers, best moving company in Nigeria, registered movers Abuja, logistics company history, professional moving team',
      ogImage: DEFAULT_OG_IMAGE,
      canonicalPath: '/#about',
    },
    contact: {
      title: 'Contact Megatrend Movers | Abuja Corporate Office & Lagos Logistics Hub',
      description: 'Get in touch with Megatrend Movers & Logistics Ltd. Contact our Abuja Corporate Office (AA Rano Citygate Plaza) or Lagos Logistics Hub (Satellite Town) for quotes and inquiries.',
      keywords: 'contact movers Abuja, moving company phone number Lagos, Megatrend office address, emergency logistics dispatch Nigeria, relocation customer care',
      ogImage: DEFAULT_OG_IMAGE,
      canonicalPath: '/#contact',
    },
    careers: {
      title: 'Careers & Job Openings at Megatrend Movers & Logistics | Join Our Fleet',
      description: 'Explore career opportunities at Megatrend Movers & Logistics Ltd. Apply for Heavy Haulage Drivers, Dispatch Coordinators, Packing Technicians, and Operations Managers.',
      keywords: 'logistics jobs Nigeria, driver vacancies Abuja, moving company jobs Lagos, dispatch coordinator careers, Megatrend careers',
      ogImage: DEFAULT_OG_IMAGE,
      canonicalPath: '/#careers',
    },
    investors: {
      title: 'Fleet Partner & Truck Investor Portal | Managed Trucking Yields | Megatrend Logistics',
      description: 'Bring your truck under Megatrend professional fleet management or lease directly for steady monthly returns. Transparent GPS tracking, insured cargo, and guaranteed monthly lease or 70/30 revenue share.',
      keywords: 'truck investment Nigeria, fleet management Lagos Abuja, truck lease returns, haulage partnership Nigeria, commercial vehicle management, Megatrend investors',
      ogImage: DEFAULT_OG_IMAGE,
      canonicalPath: '/#investors',
    },
  }
};

export const SEO_METADATA: Record<PageView, PageMetadata> & {
  services_corporate: PageMetadata;
  services_commercial: PageMetadata;
  services_residential: PageMetadata;
  services_haulage: PageMetadata;
  services_car_hire: PageMetadata;
} = {
  home: {
    title: 'Megatrend Movers & Logistics | Premier Relocation & Haulage Services Nigeria',
    description: 'Nigeria & Pan-Africa’s leading relocation and haulage partner. Specialized in corporate office migration, commercial logistics, residential moving, and heavy interstate freight across 36 states.',
    keywords: 'movers in Nigeria, Abuja moving company, Lagos logistics company, office relocation Nigeria, interstate haulage, home movers Lagos, residential moving Abuja, corporate relocation',
    canonicalPath: '/',
    ogType: 'website',
    ogImage: DEFAULT_OG_IMAGE,
    robots: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'MovingCompany',
      name: 'Megatrend Movers & Logistics Ltd',
      url: BASE_URL,
      logo: `${BASE_URL}/logo.png`,
      image: DEFAULT_OG_IMAGE,
      description: 'Professional relocation, corporate migration, residential moving, and nationwide heavy haulage logistics services across Nigeria and West Africa.',
      telephone: '+2348062466212',
      email: 'info@megatrendmovers.com',
      address: [
        {
          '@type': 'PostalAddress',
          streetAddress: 'Suite A204, AA Rano Citygate Plaza, Airport Road',
          addressLocality: 'Abuja',
          addressRegion: 'FCT',
          addressCountry: 'NG',
        },
        {
          '@type': 'PostalAddress',
          streetAddress: '374/376 Old Ojo Road, Alakija, Satellite Town',
          addressLocality: 'Lagos',
          addressRegion: 'Lagos State',
          addressCountry: 'NG',
        },
      ],
      areaServed: [
        { '@type': 'Country', name: 'Nigeria' },
        { '@type': 'AdministrativeArea', name: 'West Africa' },
      ],
      priceRange: '₦₦ - ₦₦₦',
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          opens: '08:00',
          closes: '18:00',
        },
      ],
    },
  },

  services: {
    title: 'Relocation & Logistics Services | Megatrend Movers Nigeria',
    description: 'Explore comprehensive moving services by Megatrend: Corporate Headquarters Migration, Commercial Facility Moving, Home Relocation, and 30-Ton Interstate Heavy Haulage.',
    keywords: 'moving services Nigeria, corporate office moving Abuja, commercial logistics Lagos, home moving service, interstate trucking, logistics company Nigeria',
    canonicalPath: '/#services',
    ogType: 'website',
    ogImage: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=1200&h=630&q=80',
    robots: 'index, follow',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Service',
      serviceType: 'Relocation & Logistics',
      provider: {
        '@type': 'MovingCompany',
        name: 'Megatrend Movers & Logistics Ltd',
      },
      areaServed: 'Nigeria & ECOWAS Corridors',
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Megatrend Relocation Services',
        itemListElement: [
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Corporate Relocation Services' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Commercial Relocation Solutions' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Residential Home Moving' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Interstate Heavy Haulage Logistics' } },
        ],
      },
    },
  },

  services_corporate: {
    title: 'Corporate Office Relocation Services | Zero-Downtime Migration Nigeria | Megatrend Movers',
    description: 'Zero-downtime office and headquarters migration in Abuja, Lagos, and Port Harcourt. Specialized IT server rack disassembly, serialized asset tagging, and weekend corporate dispatch.',
    keywords: 'corporate relocation Nigeria, office moving Abuja, IT server migration, corporate movers Lagos, business relocation service, executive office moving',
    canonicalPath: '/#services/corporate',
    ogType: 'website',
    ogImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&h=630&q=80',
    robots: 'index, follow',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Corporate Relocation Services',
      serviceType: 'Office & Enterprise Migration',
      provider: {
        '@type': 'MovingCompany',
        name: 'Megatrend Movers & Logistics Ltd',
      },
      description: 'Zero-downtime corporate office migration with serialized asset inventory and IT server relocation.',
    },
  },

  services_commercial: {
    title: 'Commercial Facility & Warehouse Relocation Solutions | Megatrend Movers Nigeria',
    description: 'End-to-end relocation for warehouses, retail stores, manufacturing facilities, and medical laboratories across Nigeria. Heavy machinery handling and inventory crating.',
    keywords: 'commercial relocation Nigeria, warehouse moving Lagos, industrial logistics Abuja, factory equipment transport, retail store inventory relocation',
    canonicalPath: '/#services/commercial',
    ogType: 'website',
    ogImage: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&h=630&q=80',
    robots: 'index, follow',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Commercial Relocation Solutions',
      serviceType: 'Warehouse & Facility Logistics',
      provider: {
        '@type': 'MovingCompany',
        name: 'Megatrend Movers & Logistics Ltd',
      },
    },
  },

  services_residential: {
    title: 'Residential & Home Moving Services | Stress-Free Packing & Relocation | Megatrend Movers',
    description: 'Premium home and apartment relocation across Lagos, Abuja, Port Harcourt, and 36 states. Full packing, furniture disassembly, delicate glassware crating, and safe delivery.',
    keywords: 'home movers Nigeria, house moving Abuja, residential moving Lagos, apartment relocation Port Harcourt, furniture movers Nigeria, packing service',
    canonicalPath: '/#services/residential',
    ogType: 'website',
    ogImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&h=630&q=80',
    robots: 'index, follow',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Residential Home Moving',
      serviceType: 'Home Relocation',
      provider: {
        '@type': 'MovingCompany',
        name: 'Megatrend Movers & Logistics Ltd',
      },
    },
  },

  services_haulage: {
    title: 'Heavy Haulage & Interstate Freight Trucking (3T - 30T) | Megatrend Logistics Nigeria',
    description: 'Long-haul freight and heavy equipment transport across all 36 Nigerian states and Pan-African corridors. Padded box vans, 10-ton flatbeds, and 30-ton container haulage rigs.',
    keywords: 'haulage company Nigeria, interstate trucking Lagos Abuja, 30 ton truck rental, container haulage, heavy equipment transport, logistics freight Nigeria',
    canonicalPath: '/#services/haulage',
    ogType: 'website',
    ogImage: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1200&h=630&q=80',
    robots: 'index, follow',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Interstate Heavy Haulage Logistics',
      serviceType: 'Heavy Freight Haulage',
      provider: {
        '@type': 'MovingCompany',
        name: 'Megatrend Movers & Logistics Ltd',
      },
    },
  },

  services_car_hire: {
    title: 'Executive Car Hire & Chauffeur Services | Inter/Intra State Luxury Fleet | Megatrend Movers',
    description: 'Chauffeur-driven luxury car hire in Lagos, Abuja, and interstate travel across 36 states. Armored SUVs, Mercedes sedans, VIP buses, armed MOPOL police escort, and automated Pro-Forma Invoice / Tax Clearance Receipts.',
    keywords: 'car hire Nigeria, chauffeur service Lagos, executive car hire Abuja, interstate car rental Nigeria, armored car hire Lagos, bulletproof SUV rental Abuja, airport protocol transfer',
    canonicalPath: '/#services/car_hire',
    ogType: 'website',
    ogImage: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&h=630&q=80',
    robots: 'index, follow',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Executive Car Hire & Chauffeur Logistics',
      serviceType: 'Car Hire & Escort Logistics',
      provider: {
        '@type': 'MovingCompany',
        name: 'Megatrend Movers & Logistics Ltd',
      },
    },
  },

  car_hire: {
    title: 'Executive Car Hire & Chauffeur Services | Inter & Intra-State Fleet | Megatrend Movers',
    description: 'Chauffeur-driven luxury car hire in Lagos, Abuja, and interstate travel across 36 states. Armored SUVs, Mercedes sedans, VIP buses, armed MOPOL police escort, and automated Pro-Forma Invoice / Tax Clearance Receipts.',
    keywords: 'car hire Nigeria, chauffeur service Lagos, executive car hire Abuja, interstate car rental Nigeria, armored car hire Lagos, bulletproof SUV rental Abuja, airport protocol transfer',
    canonicalPath: '/#car_hire',
    ogType: 'website',
    ogImage: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&h=630&q=80',
    robots: 'index, follow',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Executive Car Hire & Chauffeur Logistics',
      serviceType: 'Car Hire & Escort Logistics',
      provider: {
        '@type': 'MovingCompany',
        name: 'Megatrend Movers & Logistics Ltd',
      },
    },
  },

  coverage: {
    title: 'Nationwide Branch Network & Pan-African Logistics Corridors | Megatrend Movers',
    description: 'Discover Megatrend’s coverage across all 36 Nigerian states with major logistics hubs in Abuja, Lagos, Port Harcourt, and Kano, plus cross-border corridors to Ghana, Benin, and Cameroon.',
    keywords: 'movers in Abuja, movers in Lagos, movers in Port Harcourt, nationwide logistics network Nigeria, West Africa cross-border haulage, freight hubs',
    canonicalPath: '/#coverage',
    ogType: 'website',
    ogImage: DEFAULT_OG_IMAGE,
    robots: 'index, follow',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Place',
      name: 'Megatrend Movers Nationwide Network',
      description: '36 state logistics branch coverage and Pan-African transit corridors.',
    },
  },

  calculator: {
    title: 'Moving Cost & Volume (CBM) Calculator | Instant Relocation Estimates | Megatrend Movers',
    description: 'Calculate moving costs and volume in cubic meters (CBM) instantly. Get transparent freight estimates tailored for intra-city moves and interstate haulage across Nigeria.',
    keywords: 'moving cost calculator Nigeria, relocation price estimator, moving volume CBM calculator, truck sizing calculator, logistics quote generator Nigeria',
    canonicalPath: '/#calculator',
    ogType: 'website',
    ogImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&h=630&q=80',
    robots: 'index, follow',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Megatrend Relocation Cost & CBM Volume Estimator',
      applicationCategory: 'UtilityApplication',
      operatingSystem: 'All',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'NGN',
      },
    },
  },

  checklist: {
    title: 'Interactive Moving Day Preparation Checklist & Printable Planner | Megatrend Movers',
    description: 'Step-by-step relocation checklist from 4 weeks out to moving day and post-move setup. Keep track of tasks with auto-saved browser progress or print a custom document.',
    keywords: 'moving day checklist, relocation planner Nigeria, packing checklist, house moving tips, moving guide, moving timeline planner',
    canonicalPath: '/#checklist',
    ogType: 'website',
    ogImage: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=1200&h=630&q=80',
    robots: 'index, follow',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: 'How to Organize a Moving Day Relocation',
      description: 'Comprehensive relocation milestone roadmap for home and corporate moves.',
    },
  },

  tracking: {
    title: 'Live Shipment & Cargo GPS Tracking | Megatrend Movers & Logistics',
    description: 'Track your moving consignment, corporate freight, or haulage truck in real time with live GPS status updates, dispatch milestones, and estimated time of arrival.',
    keywords: 'shipment tracking Nigeria, track consignment, freight tracker, logistics GPS tracking, cargo tracking Lagos Abuja',
    canonicalPath: '/#tracking',
    ogType: 'website',
    ogImage: DEFAULT_OG_IMAGE,
    robots: 'index, follow',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Megatrend Live Shipment GPS Tracker',
      applicationCategory: 'LogisticsTracking',
      operatingSystem: 'All',
    },
  },

  about: {
    title: 'About Megatrend Movers & Logistics Ltd | Nigeria & Pan-Africa Logistics Leader',
    description: 'Learn about Megatrend Movers & Logistics Ltd: our heritage, modern padded haulage fleet, certified packing specialists, safety compliance, and vision across Africa.',
    keywords: 'about Megatrend Movers, best moving company in Nigeria, registered movers Abuja, logistics company history, professional moving team',
    canonicalPath: '/#about',
    ogType: 'website',
    ogImage: DEFAULT_OG_IMAGE,
    robots: 'index, follow',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: 'About Megatrend Movers & Logistics',
      description: 'Company history, executive fleet capabilities, and corporate values.',
    },
  },

  contact: {
    title: 'Contact Megatrend Movers | Abuja Corporate Office & Lagos Logistics Hub',
    description: 'Get in touch with Megatrend Movers & Logistics Ltd. Contact our Abuja Corporate Office (AA Rano Citygate Plaza) or Lagos Logistics Hub (Satellite Town) for quotes and inquiries.',
    keywords: 'contact movers Abuja, moving company phone number Lagos, Megatrend office address, emergency logistics dispatch Nigeria, relocation customer care',
    canonicalPath: '/#contact',
    ogType: 'website',
    ogImage: DEFAULT_OG_IMAGE,
    robots: 'index, follow',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      name: 'Contact Megatrend Movers & Logistics Ltd',
      mainEntity: {
        '@type': 'MovingCompany',
        name: 'Megatrend Movers & Logistics Ltd',
        telephone: '+2348062466212',
        email: 'info@megatrendmovers.com',
      },
    },
  },

  careers: {
    title: 'Careers & Job Openings at Megatrend Movers & Logistics | Join Our Fleet',
    description: 'Explore career opportunities at Megatrend Movers & Logistics Ltd. Apply for Heavy Haulage Drivers, Dispatch Coordinators, Packing Technicians, and Operations Managers.',
    keywords: 'logistics jobs Nigeria, driver vacancies Abuja, moving company jobs Lagos, dispatch coordinator careers, Megatrend careers',
    canonicalPath: '/#careers',
    ogType: 'website',
    ogImage: DEFAULT_OG_IMAGE,
    robots: 'index, follow',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'JobPosting',
      hiringOrganization: {
        '@type': 'Organization',
        name: 'Megatrend Movers & Logistics Ltd',
      },
    },
  },

  investors: {
    title: 'Fleet Partner & Truck Investor Portal | Managed Trucking Yields | Megatrend Logistics',
    description: 'Bring your truck under Megatrend professional fleet management or lease directly for steady monthly returns. Transparent GPS tracking, insured cargo, and guaranteed monthly lease or 70/30 revenue share.',
    keywords: 'truck investment Nigeria, fleet management Lagos Abuja, truck lease returns, haulage partnership Nigeria, commercial vehicle management, Megatrend investors',
    canonicalPath: '/#investors',
    ogType: 'website',
    ogImage: DEFAULT_OG_IMAGE,
    robots: 'index, follow',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Megatrend Corporate Fleet Partner Program',
      serviceType: 'Fleet Asset Management & Haulage Leasing',
      provider: {
        '@type': 'MovingCompany',
        name: 'Megatrend Movers & Logistics Ltd',
      },
    },
  },

  admin: {
    title: 'Admin Dispatch & CMS Management Dashboard | Megatrend Movers',
    description: 'Internal administration portal for Megatrend Movers dispatch operations, live quote reviews, career applications, and website content management.',
    keywords: 'admin portal, logistics management dashboard',
    canonicalPath: '/#admin',
    ogType: 'website',
    ogImage: DEFAULT_OG_IMAGE,
    robots: 'noindex, nofollow',
    schema: undefined,
  },

  dashboard: {
    title: 'Customer Portal & Dashboard | Megatrend Movers Nigeria',
    description: 'Manage your saved moving quotes, live convoy tracking milestones, and pre-move inventory survey photos in one secure, protected client portal.',
    keywords: 'customer portal, moving quotes saved, shipment history, inventory survey photos, logistics client dashboard',
    canonicalPath: '/#dashboard',
    ogType: 'website',
    ogImage: DEFAULT_OG_IMAGE,
    robots: 'noindex, nofollow',
    schema: undefined,
  },

  inspection: {
    title: 'Digital Cargo Inspection & AI Fragility Scanner | Megatrend Movers',
    description: 'Capture or upload photos of your items, rooms, or freight pallets. Our Gemini Vision AI automatically identifies items, calculates CBM volume, and flags fragile cargo with custom packing recommendations.',
    keywords: 'AI cargo inspection, Gemini vision cargo, moving inventory scanner, fragile items scanner, digital cargo audit Nigeria, logistics inspection',
    canonicalPath: '/#inspection',
    ogType: 'website',
    ogImage: DEFAULT_OG_IMAGE,
    robots: 'index, follow',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Megatrend Digital Cargo Inspection & AI Scanner',
      applicationCategory: 'LogisticsUtility',
      operatingSystem: 'All',
    },
  },

  terms: {
    title: 'Terms and Conditions & Protective Disclosures | Pyda Movers & Logistics Ltd',
    description: 'Official standard trading conditions, carrier liability limitations, statutory carrier lien, PBO packing disclaimers, prohibited goods indemnity, and dispute protocols for Pyda Movers.',
    keywords: 'Pyda Movers terms and conditions, moving contract Nigeria, carriage of goods by land, carrier lien, moving company disclaimer, goods in transit liability, Pyda logistics terms',
    canonicalPath: '/#terms',
    ogType: 'website',
    ogImage: DEFAULT_OG_IMAGE,
    robots: 'index, follow',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Pyda Movers Standard Trading Conditions & Disclosures',
      description: 'Comprehensive contractual terms, protective carrier disclosures, and liability policies for Pyda Movers & Logistics Ltd.',
    },
  },
};

/**
 * Helper to update or create a meta tag safely
 */
function setMetaTag(selector: string, attrName: string, attrValue: string, content: string) {
  if (typeof document === 'undefined') return;
  let element = document.querySelector(selector) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attrName, attrValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

/**
 * Helper to update or create canonical link tag
 */
function setCanonicalTag(url: string) {
  if (typeof document === 'undefined') return;
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

/**
 * Helper to update or create JSON-LD schema script
 */
function setStructuredData(schema?: Record<string, any>) {
  if (typeof document === 'undefined') return;
  const scriptId = 'seo-dynamic-json-ld';
  let script = document.getElementById(scriptId) as HTMLScriptElement | null;
  
  if (!schema) {
    if (script) script.remove();
    return;
  }

  if (!script) {
    script = document.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(schema, null, 2);
}

/**
 * Helper function to resolve merged metadata between defaults and CMS customizations
 */
export function getResolvedPageMetadata(
  page: PageView,
  serviceSubtype?: ServiceType,
  customSeoConfig?: SeoManagerConfig
): PageMetadata {
  let metaKey: keyof typeof SEO_METADATA = page;
  if (page === 'services' && serviceSubtype) {
    const subKey = `services_${serviceSubtype}` as keyof typeof SEO_METADATA;
    if (SEO_METADATA[subKey]) {
      metaKey = subKey;
    }
  }

  const baseMeta = { ...(SEO_METADATA[metaKey] || SEO_METADATA.home) };

  // Check for custom overrides
  if (customSeoConfig) {
    // 1. Service-specific override
    if (page === 'services' && serviceSubtype && customSeoConfig.services?.[serviceSubtype]) {
      const custom = customSeoConfig.services[serviceSubtype];
      if (custom.title?.trim()) baseMeta.title = custom.title.trim();
      if (custom.description?.trim()) baseMeta.description = custom.description.trim();
      if (custom.keywords?.trim()) baseMeta.keywords = custom.keywords.trim();
      if (custom.ogImage?.trim()) baseMeta.ogImage = custom.ogImage.trim();
      if (custom.canonicalPath?.trim()) baseMeta.canonicalPath = custom.canonicalPath.trim();
      if (custom.robots?.trim()) baseMeta.robots = custom.robots.trim();
    }
    // 2. Page-level override
    else if (customSeoConfig.pages?.[page]) {
      const custom = customSeoConfig.pages[page];
      if (custom.title?.trim()) baseMeta.title = custom.title.trim();
      if (custom.description?.trim()) baseMeta.description = custom.description.trim();
      if (custom.keywords?.trim()) baseMeta.keywords = custom.keywords.trim();
      if (custom.ogImage?.trim()) baseMeta.ogImage = custom.ogImage.trim();
      if (custom.canonicalPath?.trim()) baseMeta.canonicalPath = custom.canonicalPath.trim();
      if (custom.robots?.trim()) baseMeta.robots = custom.robots.trim();
    }
  }

  return baseMeta;
}

/**
 * Core function to apply metadata dynamically based on current page, service, and CMS overrides
 */
export function applyPageMetadata(
  page: PageView,
  serviceSubtype?: ServiceType,
  languageCode?: string,
  customSeoConfig?: SeoManagerConfig
) {
  if (typeof document === 'undefined') return;

  const meta = getResolvedPageMetadata(page, serviceSubtype, customSeoConfig);
  const fullCanonicalUrl = `${BASE_URL}${meta.canonicalPath}`;

  // 1. Update Document Title
  document.title = meta.title;

  // 2. Standard Meta Tags
  setMetaTag('meta[name="description"]', 'name', 'description', meta.description);
  setMetaTag('meta[name="keywords"]', 'name', 'keywords', meta.keywords);
  setMetaTag('meta[name="author"]', 'name', 'author', 'Megatrend Movers & Logistics Ltd');
  setMetaTag('meta[name="robots"]', 'name', 'robots', meta.robots || 'index, follow');

  // 3. Open Graph Social Tags
  setMetaTag('meta[property="og:title"]', 'property', 'og:title', meta.title);
  setMetaTag('meta[property="og:description"]', 'property', 'og:description', meta.description);
  setMetaTag('meta[property="og:url"]', 'property', 'og:url', fullCanonicalUrl);
  setMetaTag('meta[property="og:type"]', 'property', 'og:type', meta.ogType || 'website');
  setMetaTag('meta[property="og:image"]', 'property', 'og:image', meta.ogImage || DEFAULT_OG_IMAGE);
  setMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', 'Megatrend Movers & Logistics');

  // 4. Twitter Card Meta Tags
  setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
  setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', meta.title);
  setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', meta.description);
  setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', meta.ogImage || DEFAULT_OG_IMAGE);

  // 5. Canonical Link
  setCanonicalTag(fullCanonicalUrl);

  // 6. Structured JSON-LD Schema
  setStructuredData(meta.schema);

  // 7. Update document language if provided
  if (languageCode) {
    document.documentElement.lang = languageCode;
  }
}
