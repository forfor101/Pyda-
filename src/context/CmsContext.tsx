import React, { createContext, useContext, useState, useEffect } from 'react';
import alhYerimaPhoto from '../assets/images/yerima_forfor_ceo_1789921205231.jpg';
import engrBabajidePhoto from '../assets/images/babajide_ogundipe_1789921225437.jpg';
import kayodeTamandiPhoto from '../assets/images/ernest_agu_director.jpg';
import aishaYareemaPhoto from '../assets/images/aisha_yareema_abdullahi_1789921860511.jpg';
import kwameMensahPhoto from '../assets/images/kwame_mensah_photo_1789922159258.jpg';
import usmanKabirPhoto from '../assets/images/usman_kabir.jpg';
import saboJashuaPhoto from '../assets/images/sabo_jashua.jpg';
import abubakarUmoruPhoto from '../assets/images/abubakar_umoru.jpg';
import chiomaNwachukwuPhoto from '../assets/images/chioma_nwachukwu_photo_1789990785245.jpg';
import {
  COMPANY_INFO,
  SERVICES_DATA,
  OFFICE_LOCATIONS,
  TESTIMONIALS,
  NIGERIAN_PRICING_BENCHMARKS,
  SAMPLE_SHIPMENTS,
  DEFAULT_JOB_OPENINGS,
  SAMPLE_JOB_APPLICATIONS,
  PricingBenchmark
} from '../data/companyData';
import { DEFAULT_LOGISTICS_EXPERTS } from '../data/expertsData';
import { DEFAULT_NEWSLETTER_SUBSCRIBERS, DEFAULT_NEWSLETTER_CAMPAIGNS } from '../data/newsletterData';
import { 
  ServiceDetail, 
  OfficeLocation, 
  ShipmentTrackStatus, 
  JobOpening, 
  JobApplication, 
  AdminSecurityConfig, 
  SecurityActivityLog, 
  SecurityAuditStats,
  VideoShowcaseItem, 
  LogisticsExpert,
  NewsletterSubscriber,
  NewsletterCampaign,
  NewsletterInterest,
  MailchimpStatus,
  SeoManagerConfig,
  ServiceSeoConfig
} from '../types';
import { DEFAULT_SERVICE_SEO_CONFIGS } from '../lib/seoMetadata';

export const DEFAULT_ADMIN_PASSKEY = '*Ybc530dam#';

export const DEFAULT_SECURITY_CONFIG: AdminSecurityConfig = {
  customPasskey: '', // Empty means using DEFAULT_ADMIN_PASSKEY
  recoveryEmail: 'yerimaforfor@gmail.com',
  recoveryPhone: '+234 806 246 6212',
  securityQuestion: 'What is the founding brand name or Abuja HQ operational city?',
  securityAnswer: 'Pyda',
  emergencyRecoveryToken: 'MT-RECOVER-SECURE-2026',
  lastPasskeyResetDate: 'Initial Setup',
  sessionTimeoutMinutes: 60,
  activityLogs: [
    {
      id: 'log-init',
      action: 'factory_reset',
      description: 'System master passkey (*Ybc530dam#) operational with multi-channel recovery.',
      timestamp: '2026-08-16T12:00:00Z',
    }
  ]
};

// Default curated Media Gallery items
export interface MediaItem {
  id: string;
  name: string;
  url: string;
  category: 'hero' | 'fleet' | 'services' | 'team' | 'branches' | 'warehouse' | 'general';
  sizeFormatted: string;
  uploadedAt: string;
}

export interface HeroData {
  badgeText: string;
  headlinePrefix: string;
  headlineGradient: string;
  subHeadline: string;
  bgImageUrl: string;
  bgOverlayOpacity: number;
  primaryBtnText: string;
  secondaryBtnText: string;
  stats: { label: string; value: string }[];
}

export interface CompanyData {
  name: string;
  brandName: string;
  brandSuffix: string;
  tagline: string;
  subTagline: string;
  phones: string[];
  whatsapp: string;
  email: string;
  quoteEmail: string;
  workingHours: string;
  headquartersAbuja: {
    title: string;
    address: string;
    landmark: string;
    phone: string;
  };
  mainOfficeLagos: {
    title: string;
    address: string;
    landmark: string;
    phone: string;
  };
  socialLinks: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    youtube?: string;
    whatsappChannel?: string;
  };
  copyrightText: string;
}

export interface AboutData {
  story: string;
  mission: string;
  vision: string;
  foundedYear: string;
  heroImage: string;
  coreValues: { title: string; desc: string; icon: string }[];
  fleetShowcase: {
    id: string;
    title: string;
    capacity: string;
    description: string;
    imageUrl: string;
    specs: string[];
  }[];
  leadershipTeam: {
    id: string;
    name: string;
    role: string;
    bio: string;
    avatar: string;
  }[];
}

export interface AnnouncementData {
  enabled: boolean;
  text: string;
  ctaText: string;
  ctaLink: string;
  badge: string;
  bgStyle: string;
}

export interface CmsConfig {
  hero: HeroData;
  company: CompanyData;
  services: ServiceDetail[];
  branches: OfficeLocation[];
  testimonials: typeof TESTIMONIALS;
  pricing: PricingBenchmark[];
  about: AboutData;
  videoShowcase: VideoShowcaseItem[];
  logisticsExperts: LogisticsExpert[];
  newsletterSubscribers: NewsletterSubscriber[];
  newsletterCampaigns: NewsletterCampaign[];
  announcement: AnnouncementData;
  mediaLibrary: MediaItem[];
  shipments: ShipmentTrackStatus[];
  jobOpenings: JobOpening[];
  jobApplications: JobApplication[];
  security: AdminSecurityConfig;
  seoMetadata: SeoManagerConfig;
  lastUpdated: string;
}

const PRESET_MEDIA: MediaItem[] = [
  {
    id: 'media-alh-yerima-forfor-ceo',
    name: 'Alhaji Yerima Forfor - Chief Executive Officer',
    url: alhYerimaPhoto,
    category: 'team',
    sizeFormatted: '633 KB',
    uploadedAt: 'Official Portrait',
  },
  {
    id: 'media-engr-kongo-garba',
    name: 'Engr. Kongo Garba - Chief Freight Dispatcher',
    url: engrBabajidePhoto,
    category: 'team',
    sizeFormatted: '678 KB',
    uploadedAt: 'Official Portrait',
  },
  {
    id: 'media-ms-aisha-yareema-abdullahi',
    name: 'Ms. Aisha Yareema Abdullahi - Head of Client Success',
    url: aishaYareemaPhoto,
    category: 'team',
    sizeFormatted: '620 KB',
    uploadedAt: 'Official Portrait',
  },
  {
    id: 'media-bukar-chiroma',
    name: 'M. Bukar Chiroma - Cross-Border & Customs Compliance Lead',
    url: kwameMensahPhoto,
    category: 'team',
    sizeFormatted: '615 KB',
    uploadedAt: 'Official Portrait',
  },
  {
    id: 'media-engr-usman-kabir',
    name: 'Engr. Usman Kabir - National Operations Director & FCT Regional Lead',
    url: usmanKabirPhoto,
    category: 'team',
    sizeFormatted: '620 KB',
    uploadedAt: 'Official Portrait',
  },
  {
    id: 'media-mr-sabo-jashua',
    name: 'Mr. Sabo Jashua - Heavy Rigging & Machinery Transport Lead',
    url: saboJashuaPhoto,
    category: 'team',
    sizeFormatted: '610 KB',
    uploadedAt: 'Official Portrait',
  },
  {
    id: 'media-mr-abubakar-umoru',
    name: 'Mr. Abubakar Umoru - Head of Corporate Relocations & Enterprise Transitions',
    url: abubakarUmoruPhoto,
    category: 'team',
    sizeFormatted: '630 KB',
    uploadedAt: 'Official Portrait',
  },
  {
    id: 'media-hero-default',
    name: 'Heavy Haulage Fleet on Highway',
    url: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=1600&auto=format&fit=crop&q=80',
    category: 'hero',
    sizeFormatted: '1.2 MB',
    uploadedAt: 'System Default',
  },
  {
    id: 'media-corp-move',
    name: 'Corporate Office Relocation Crew',
    url: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&auto=format&fit=crop&q=80',
    category: 'services',
    sizeFormatted: '950 KB',
    uploadedAt: 'System Default',
  },
  {
    id: 'media-comm-warehouse',
    name: 'Commercial Warehouse & Pallet Racking',
    url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&auto=format&fit=crop&q=80',
    category: 'warehouse',
    sizeFormatted: '1.1 MB',
    uploadedAt: 'System Default',
  },
  {
    id: 'media-res-packing',
    name: 'Residential White-Glove Wrapping',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80',
    category: 'services',
    sizeFormatted: '870 KB',
    uploadedAt: 'System Default',
  },
  {
    id: 'media-fleet-30ton',
    name: '30-Ton Freight Rig & Trailer',
    url: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=1200&auto=format&fit=crop&q=80',
    category: 'fleet',
    sizeFormatted: '1.4 MB',
    uploadedAt: 'System Default',
  },
  {
    id: 'media-fleet-box-truck',
    name: '10-Ton Enclosed Weatherproof Box Truck',
    url: 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=1200&auto=format&fit=crop&q=80',
    category: 'fleet',
    sizeFormatted: '1.0 MB',
    uploadedAt: 'System Default',
  },
  {
    id: 'media-abuja-hq',
    name: 'Abuja Citygate Corporate Terminal',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80',
    category: 'branches',
    sizeFormatted: '1.3 MB',
    uploadedAt: 'System Default',
  },
  {
    id: 'media-lagos-hub',
    name: 'Lagos Maritime Logistics & Container Depot',
    url: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=1200&auto=format&fit=crop&q=80',
    category: 'branches',
    sizeFormatted: '1.5 MB',
    uploadedAt: 'System Default',
  },
];

export const DEFAULT_CMS_CONFIG: CmsConfig = {
  hero: {
    badgeText: 'Nationwide Nigeria & Pan-African Coverage',
    headlinePrefix: 'Premier Corporate',
    headlineGradient: 'Relocation & Haulage Fleet',
    subHeadline:
      'Pyda Movers & Logistics delivers zero-downtime office moves, commercial warehouse transfers, residential house relocations, and heavy freight haulage across Abuja, Lagos, and all 36 Nigerian states with Pan-African highway reach.',
    bgImageUrl: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=1600&auto=format&fit=crop&q=80',
    bgOverlayOpacity: 85,
    primaryBtnText: 'Calculate Instant Moving Rate',
    secondaryBtnText: 'Explore Corporate Services',
    stats: [
      { label: 'Completed Moves', value: '14,800+' },
      { label: 'Nationwide Branches', value: '36 States' },
      { label: 'African Corridors', value: '8 Nations' },
      { label: 'On-Time Delivery', value: '99.4%' },
    ],
  },
  company: {
    name: 'Pyda Movers & Logistics',
    brandName: 'PYDA',
    brandSuffix: 'MOVERS',
    tagline: 'Nigeria & Pan-Africa’s Premier Relocation & Haulage Partners',
    subTagline:
      'Seamless corporate, commercial, and residential relocation services backed by a modern heavy haulage fleet across Nigeria and West/East Africa.',
    phones: ['08062466212', '08025609972'],
    whatsapp: '2348062466212',
    email: 'info@pydamovers.com',
    quoteEmail: 'quotes@pydamovers.com',
    workingHours: 'Mon - Sat: 8:00 AM - 6:00 PM (Emergency Dispatch 24/7)',
    headquartersAbuja: {
      title: 'Abuja Corporate HQ',
      address: 'Suite A204, AA Rano Citygate Plaza, Airport Road, Abuja, Nigeria',
      landmark: 'AA Rano Citygate Plaza, Airport Road',
      phone: '08062466212',
    },
    mainOfficeLagos: {
      title: 'Lagos Maritime Logistics Hub',
      address: '374/376 Old Ojo Road, Alakija, Satellite Town, Lagos, Nigeria',
      landmark: 'Old Ojo Road, Alakija, Satellite Town',
      phone: '08025609972',
    },
    socialLinks: {
      facebook: 'https://facebook.com/pydamovers',
      twitter: 'https://twitter.com/pydamovers',
      linkedin: 'https://linkedin.com/company/pyda-movers',
      instagram: 'https://instagram.com/pydamovers',
      youtube: 'https://youtube.com/@pydamovers',
      whatsappChannel: 'https://chat.whatsapp.com/invite/pydamovers',
    },
    copyrightText: 'Pyda Movers & Logistics Ltd. All rights reserved.',
  },
  services: SERVICES_DATA,
  branches: OFFICE_LOCATIONS,
  testimonials: TESTIMONIALS,
  pricing: NIGERIAN_PRICING_BENCHMARKS,
  about: {
    story:
      'Established to provide structured, technology-driven relocation and heavy freight solutions in West Africa, Pyda Movers & Logistics has grown into one of Nigeria’s most trusted logistics enterprises. We bridge corporate headquarters in Abuja and maritime commercial hubs in Lagos with state-of-the-art vehicle telematics, specialized heavy-lift rigging, and serialized inventory tracking.',
    mission:
      'To deliver flawless, stress-free relocation and haulage services that eliminate operational downtime for businesses and provide total peace of mind for families across Africa.',
    vision:
      'To be the undisputed standard of logistics excellence, integrity, and innovation across sub-Saharan Africa.',
    foundedYear: '2014',
    heroImage: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1400&auto=format&fit=crop&q=80',
    coreValues: [
      {
        title: 'Zero Downtime Guarantee',
        desc: 'Precision scheduling and phased weekend execution to ensure business operations continue uninterrupted.',
        icon: 'Clock',
      },
      {
        title: 'Complete Cargo Insurance',
        desc: 'Full Goods-In-Transit & comprehensive cargo liability coverage backing every single consignment.',
        icon: 'ShieldCheck',
      },
      {
        title: 'Real-Time Satellite Telematics',
        desc: 'GPS-monitored fleet tracking with live checkpoint logs accessible directly to dispatch and clients.',
        icon: 'Radio',
      },
      {
        title: 'Certified Master Riggers',
        desc: 'Vetted, uniformly trained, and background-checked technicians equipped with heavy-duty hoisting tools.',
        icon: 'Award',
      },
    ],
    fleetShowcase: [
      {
        id: 'fleet-1',
        title: '30-Ton Heavy Haulage Semi-Trailers',
        capacity: '30,000 kg Payload • 40ft Container Chassis',
        description: 'Engineered for port container transfers, raw industrial material haulage, and high-volume interstate supply chains.',
        imageUrl: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=1000&auto=format&fit=crop&q=80',
        specs: ['Air-ride suspension', 'GPS satellite tracking', 'Escort vehicle dispatch', '40ft & 2x 20ft container twist locks'],
      },
      {
        id: 'fleet-2',
        title: '10-Ton Enclosed Weatherproof Box Trucks',
        capacity: '10,000 kg Payload • 55 Cubic Meters',
        description: 'Ideal for 3-5 bedroom duplex relocations, corporate server racks, and bulk FMCG distribution.',
        imageUrl: 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=1000&auto=format&fit=crop&q=80',
        specs: ['Hydraulic tail-lift (2,000 kg)', 'Padded interior rails', 'Climate-seal insulation', 'Serialized cargo lock'],
      },
      {
        id: 'fleet-3',
        title: '3.5-Ton Rapid Dispatch Transit Vans',
        capacity: '3,500 kg Payload • 22 Cubic Meters',
        description: 'Nimble intra-city moving vans for fast urban residential relocations, executive flats, and express cargo.',
        imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1000&auto=format&fit=crop&q=80',
        specs: ['Urban height clearance', 'Fast loading ramp', 'Soft blanket cargo strapping', 'Same-day city turnaround'],
      },
    ],
    leadershipTeam: [
      {
        id: 'team-1',
        name: 'Alhaji Yerima Forfor',
        role: 'Managing Director & Chief Executive Officer',
        bio: 'Over 18 years of executive leadership in supply chain optimization, heavy freight haulage, and Pan-African transport infrastructure.',
        avatar: alhYerimaPhoto,
      },
      {
        id: 'team-2',
        name: 'Engr. Kongo Garba',
        role: 'Chief Freight Dispatcher & Interstate Route Coordinator',
        bio: 'Over 12 years coordinating 30-ton trailer schedules and multimodal interstate routing across Northern and Southern transit corridors.',
        avatar: engrBabajidePhoto,
      },
      {
        id: 'team-3',
        name: 'Kayode Tamandi',
        role: 'Director of Fleet Safety, Logistics & Telematics',
        bio: 'Accomplished logistics director overseeing safety compliance, driver background vetting, satellite route optimization, and highway telematics operations.',
        avatar: kayodeTamandiPhoto,
      },
      {
        id: 'team-4',
        name: 'Ms. Aisha Yareema Abdullahi',
        role: 'Head of Client Success & Goods-in-Transit Claims Concierge',
        bio: 'Oversees national client onboarding, pre-move physical condition surveys, digital inventory receipts, and 100% Goods-in-Transit insurance claim evaluations with 3-day resolution guarantee.',
        avatar: aishaYareemaPhoto,
      },
      {
        id: 'team-5',
        name: 'Mr. Abubakar Umoru',
        role: 'Head of Corporate Relocations & Enterprise Transitions',
        bio: 'Specialist in multinational office transitions, bank branch transfers, and white-glove executive asset relocations.',
        avatar: abubakarUmoruPhoto,
      },
    ],
  },
  announcement: {
    enabled: true,
    text: '⚡ Priority Dispatch: Scheduled Abuja ⇄ Lagos Daily Interstate Freight & Zero-Downtime Relocations!',
    ctaText: 'Get Free Quote',
    ctaLink: 'calculator',
    badge: 'Logistics Bulletin',
    bgStyle: 'bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-slate-950',
  },
  videoShowcase: [
    {
      id: 'vid-facility-abuja',
      title: 'Abuja Citygate Terminal & Fleet Staging Facility Tour',
      category: 'facility_tour',
      categoryLabel: 'Operations Facility',
      description: 'Go behind the scenes at our AA Rano Citygate Airport Road central dispatch hub, featuring heavy trailer bays, climate-controlled container storage, and computerized telematics operations.',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnailUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&auto=format&fit=crop&q=80',
      durationFormatted: '3:45 Min',
      location: 'Abuja Airport Road Hub',
      featuredClient: 'Operations & Fleet Command',
      keyHighlights: [
        'Secure 24/7 CCTV-monitored enclosed warehousing',
        'Hydraulic tail-lift fleet staging and maintenance yard',
        'Central telematics GPS tracking dispatch command station',
      ],
    },
    {
      id: 'vid-packing-white-glove',
      title: '5-Ply Export Packing & Custom Wooden Crating Demonstration',
      category: 'packing_demo',
      categoryLabel: 'Packing Quality',
      description: 'Watch our master riggers and carpenters craft bespoke wooden crates on-site, bubble-wrap fragile electronics, and shock-pad server racks for zero-downtime migrations.',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnailUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80',
      durationFormatted: '4:12 Min',
      location: 'Victoria Island & Maitama Sites',
      featuredClient: 'White-Glove Packing Standards',
      keyHighlights: [
        'Multi-layer export shock cushioning & edge corner guards',
        'Anti-static bubble insulation for enterprise server racks',
        'Heat-treated custom crating for Italian marble & artwork',
      ],
    },
    {
      id: 'vid-corp-bank-relocation',
      title: 'Client Story: 48-Hour Zero-Downtime Bank Headquarters Migration',
      category: 'client_story',
      categoryLabel: 'Verified Testimonial',
      description: 'How Pyda Movers seamlessly transitioned a 4-floor commercial banking headquarters from Victoria Island to Central Business District Abuja over a single weekend.',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnailUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80',
      durationFormatted: '5:20 Min',
      location: 'Lagos ➔ Abuja Corridor',
      featuredClient: 'Tier-1 Banking & Financial Partners',
      keyHighlights: [
        '100% operational resumption on Monday 8:00 AM',
        'Serialized barcode tagging on 450+ IT workstations',
        'Armed highway security escorts along A2 federal corridor',
      ],
    },
    {
      id: 'vid-fleet-operations',
      title: 'Pan-African Heavy Haulage & 30-Ton Freight Fleet in Action',
      category: 'fleet_operations',
      categoryLabel: 'Fleet Capabilities',
      description: 'Experience our fleet traversing Nigerian state highways and cross-border ECOWAS corridors with satellite speed monitoring and verified tamper-evident seals.',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnailUrl: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=1200&auto=format&fit=crop&q=80',
      durationFormatted: '3:10 Min',
      location: 'Nationwide Highway Corridors',
      featuredClient: 'Industrial & Port Logistics',
      keyHighlights: [
        'Air-ride shock absorbing suspension on heavy trucks',
        'Real-time satellite telematics monitoring speed & route',
        'Full Goods-in-Transit cargo insurance underwritten',
      ],
    },
  ],
  mediaLibrary: PRESET_MEDIA,
  shipments: SAMPLE_SHIPMENTS,
  jobOpenings: DEFAULT_JOB_OPENINGS,
  jobApplications: SAMPLE_JOB_APPLICATIONS,
  logisticsExperts: DEFAULT_LOGISTICS_EXPERTS,
  newsletterSubscribers: DEFAULT_NEWSLETTER_SUBSCRIBERS,
  newsletterCampaigns: DEFAULT_NEWSLETTER_CAMPAIGNS,
  security: DEFAULT_SECURITY_CONFIG,
  seoMetadata: DEFAULT_SERVICE_SEO_CONFIGS,
  lastUpdated: new Date().toISOString(),
};

interface CmsContextType {
  cms: CmsConfig;
  updateHero: (hero: Partial<HeroData>) => void;
  updateCompany: (company: Partial<CompanyData>) => void;
  updateServices: (services: ServiceDetail[]) => void;
  updateService: (id: string, service: Partial<ServiceDetail>) => void;
  addService: (service: ServiceDetail) => void;
  deleteService: (id: string) => void;
  updateBranches: (branches: OfficeLocation[]) => void;
  updateBranch: (id: string, branch: Partial<OfficeLocation>) => void;
  addBranch: (branch: OfficeLocation) => void;
  deleteBranch: (id: string) => void;
  updateTestimonials: (testimonials: typeof TESTIMONIALS) => void;
  addTestimonial: (testimonial: (typeof TESTIMONIALS)[0]) => void;
  deleteTestimonial: (id: string) => void;
  updatePricing: (benchmarks: PricingBenchmark[]) => void;
  updateAbout: (about: Partial<AboutData>) => void;
  updateVideoShowcase: (videos: VideoShowcaseItem[]) => void;
  updateVideoShowcaseItem: (id: string, updates: Partial<VideoShowcaseItem>) => void;
  addVideoShowcaseItem: (video: VideoShowcaseItem) => void;
  deleteVideoShowcaseItem: (id: string) => void;
  updateLogisticsExperts: (experts: LogisticsExpert[]) => void;
  updateLogisticsExpert: (id: string, updates: Partial<LogisticsExpert>) => void;
  addLogisticsExpert: (expert: LogisticsExpert) => void;
  deleteLogisticsExpert: (id: string) => void;
  updateNewsletterSubscribers: (subscribers: NewsletterSubscriber[]) => void;
  addNewsletterSubscriber: (sub: { email: string; fullName?: string; interest?: NewsletterInterest; source?: string; notes?: string }) => Promise<{ success: boolean; message: string; subscriber?: NewsletterSubscriber }>;
  updateNewsletterSubscriber: (id: string, updates: Partial<NewsletterSubscriber>) => void;
  deleteNewsletterSubscriber: (id: string) => Promise<boolean>;
  unsubscribeNewsletter: (emailOrId: string) => Promise<boolean>;
  testMailchimpConnection: () => Promise<any>;
  updateNewsletterCampaigns: (campaigns: NewsletterCampaign[]) => void;
  deleteNewsletterCampaign: (id: string) => Promise<boolean>;
  sendNewsletterTestEmail: (params: {
    testRecipient: string;
    subject: string;
    bodyContent?: string;
    bodyHtml?: string;
    previewText?: string;
    bannerBadge?: string;
    ctaText?: string;
    ctaUrl?: string;
  }) => Promise<{ success: boolean; message: string; messageId?: string; provider?: string }>;
  broadcastNewsletter: (params: {
    title?: string;
    subject: string;
    bodyContent?: string;
    bodyHtml?: string;
    targetInterest?: string;
    previewText?: string;
    bannerBadge?: string;
    ctaText?: string;
    ctaUrl?: string;
    templateId?: string;
  }) => Promise<any>;
  updateAnnouncement: (announcement: Partial<AnnouncementData>) => void;
  addMedia: (media: Omit<MediaItem, 'id' | 'uploadedAt'>) => MediaItem;
  deleteMedia: (id: string) => void;
  updateShipments: (shipments: ShipmentTrackStatus[]) => void;
  updateShipment: (trackingId: string, updates: Partial<ShipmentTrackStatus>) => void;
  addShipment: (shipment: ShipmentTrackStatus) => void;
  deleteShipment: (trackingId: string) => void;
  advanceShipmentSimulation: (trackingId: string, stepIncrement?: number) => void;
  updateJobOpenings: (openings: JobOpening[]) => void;
  updateJobOpening: (id: string, updates: Partial<JobOpening>) => void;
  addJobOpening: (job: JobOpening) => void;
  deleteJobOpening: (id: string) => void;
  updateJobApplications: (apps: JobApplication[]) => void;
  addJobApplication: (appData: Omit<JobApplication, 'id' | 'appliedAt' | 'status'>) => Promise<JobApplication>;
  updateJobApplicationStatus: (id: string, status: JobApplication['status'], adminNotes?: string) => void;
  deleteJobApplication: (id: string) => void;
  updateSecurity: (security: Partial<AdminSecurityConfig>) => void;
  updateSeoConfig: (seo: Partial<SeoManagerConfig>) => void;
  updateServiceSeo: (serviceId: string, updates: Partial<ServiceSeoConfig>) => void;
  updatePageSeo: (pageKey: string, updates: Partial<ServiceSeoConfig>) => void;
  resetServiceSeo: (serviceId: string) => void;
  resetAllSeo: () => void;
  verifyPasskey: (input: string, contextMeta?: { method?: string; source?: string; failureReason?: string; consecutiveFails?: number }) => boolean;
  resetPasskey: (newPasskey: string, reason?: string) => void;
  recordSecurityLog: (
    action: SecurityActivityLog['action'], 
    description: string,
    extra?: {
      attemptMasked?: string;
      attemptMethod?: SecurityActivityLog['attemptMethod'];
      failureReason?: SecurityActivityLog['failureReason'];
      severity?: SecurityActivityLog['severity'];
      requestPath?: string;
      metadata?: Record<string, any>;
    }
  ) => Promise<SecurityActivityLog>;
  fetchSecurityLogs: (filters?: { action?: string; severity?: string; search?: string; limit?: number }) => Promise<{ logs: SecurityActivityLog[]; stats?: SecurityAuditStats }>;
  clearSecurityLogs: (clearedBy?: string) => Promise<boolean>;
  resetToDefaults: () => void;
  exportJson: () => string;
  importJson: (jsonString: string) => boolean;
  saveToServer: () => Promise<boolean>;
  isLoading: boolean;
}

const CmsContext = createContext<CmsContextType | undefined>(undefined);

const CMS_STORAGE_KEY = 'pyda_cms_data_v2';
const LEGACY_CMS_STORAGE_KEY = 'megatrend_cms_data_v2';

export const CmsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cms, setCms] = useState<CmsConfig>(() => {
    try {
      let local = localStorage.getItem(CMS_STORAGE_KEY);
      if (!local) {
        local = localStorage.getItem(LEGACY_CMS_STORAGE_KEY);
      }
      if (local) {
        // Sanitize any legacy brand names in stored cache
        const sanitizedStr = local
          .split('Megatrend Movers & Logistics Ltd').join('Pyda Movers & Logistics Ltd')
          .split('MEGATREND MOVERS & LOGISTICS LTD').join('PYDA MOVERS & LOGISTICS LTD')
          .split('Megatrend Movers & Logistics').join('Pyda Movers & Logistics')
          .split('MEGATREND MOVERS & LOGISTICS').join('PYDA MOVERS & LOGISTICS')
          .split('Megatrend Movers').join('Pyda Movers')
          .split('MEGATREND MOVERS').join('PYDA MOVERS')
          .split('megatrend movers').join('pyda movers')
          .split('Megatrend Logistics').join('Pyda Logistics')
          .split('MEGATREND LOGISTICS').join('PYDA LOGISTICS')
          .split('megatrendmovers.com').join('pydamovers.com')
          .split('megatrendmovers.ng').join('pydamovers.ng')
          .split('megatrend.ng').join('pyda.ng')
          .split('megatrendmovers').join('pydamovers')
          .split('MEGATREND').join('PYDA')
          .split('Megatrend').join('Pyda');
        const parsed = JSON.parse(sanitizedStr);
        const mergedAbout = { ...DEFAULT_CMS_CONFIG.about, ...(parsed.about || {}) };
        if (mergedAbout.leadershipTeam) {
          mergedAbout.leadershipTeam = mergedAbout.leadershipTeam.map((leader: any) => {
            if (leader.id === 'team-1' || leader.name?.toLowerCase().includes('yerima')) {
              return { ...leader, avatar: alhYerimaPhoto, name: 'Alhaji Yerima Forfor' };
            }
            if (leader.id === 'team-2' || leader.name?.toLowerCase().includes('babajide') || leader.name?.toLowerCase().includes('kongo') || leader.name?.toLowerCase().includes('garba')) {
              return {
                ...leader,
                id: 'team-2',
                name: 'Engr. Kongo Garba',
                role: 'Chief Freight Dispatcher & Interstate Route Coordinator',
                bio: 'Over 12 years coordinating 30-ton trailer schedules and multimodal interstate routing across Northern and Southern transit corridors.',
                avatar: engrBabajidePhoto,
              };
            }
            if (leader.id === 'team-3' || leader.name?.toLowerCase().includes('danladi') || leader.name?.toLowerCase().includes('ernest') || leader.name?.toLowerCase().includes('kayode') || leader.name?.toLowerCase().includes('tamandi')) {
              return {
                ...leader,
                id: 'team-3',
                name: 'Kayode Tamandi',
                role: 'Director of Fleet Safety, Logistics & Telematics',
                bio: 'Accomplished logistics director overseeing safety compliance, driver background vetting, satellite route optimization, and highway telematics operations.',
                avatar: kayodeTamandiPhoto,
              };
            }
            if (leader.id === 'team-4' || leader.name?.toLowerCase().includes('halima') || leader.name?.toLowerCase().includes('aisha') || leader.name?.toLowerCase().includes('yareema')) {
              return {
                ...leader,
                id: 'team-4',
                name: 'Ms. Aisha Yareema Abdullahi',
                role: 'Head of Client Success & Goods-in-Transit Claims Concierge',
                bio: 'Oversees national client onboarding, pre-move physical condition surveys, digital inventory receipts, and 100% Goods-in-Transit insurance claim evaluations with 3-day resolution guarantee.',
                avatar: aishaYareemaPhoto,
              };
            }
            if (leader.id === 'team-5' || leader.name?.toLowerCase().includes('folashade') || leader.name?.toLowerCase().includes('abubakar') || leader.name?.toLowerCase().includes('umoru')) {
              return {
                ...leader,
                id: 'team-5',
                name: 'Mr. Abubakar Umoru',
                role: 'Head of Corporate Relocations & Enterprise Transitions',
                bio: 'Specialist in multinational office transitions, bank branch transfers, and white-glove executive asset relocations.',
                avatar: abubakarUmoruPhoto,
              };
            }
            return leader;
          });
          const hasAisha = mergedAbout.leadershipTeam.some((l: any) => l.name?.toLowerCase().includes('aisha'));
          if (!hasAisha) {
            mergedAbout.leadershipTeam.push({
              id: 'team-4',
              name: 'Ms. Aisha Yareema Abdullahi',
              role: 'Head of Client Success & Goods-in-Transit Claims Concierge',
              bio: 'Oversees national client onboarding, pre-move physical condition surveys, digital inventory receipts, and 100% Goods-in-Transit insurance claim evaluations with 3-day resolution guarantee.',
              avatar: aishaYareemaPhoto,
            });
          }
        }
        const loadedExperts = parsed.logisticsExperts?.length ? parsed.logisticsExperts.map((exp: any) => {
          if (exp.id === 'expert-yerima' || exp.name?.toLowerCase().includes('yerima')) {
            return { ...exp, avatar: alhYerimaPhoto };
          }
          if (exp.id === 'expert-babajide' || exp.id === 'expert-kongo' || exp.name?.toLowerCase().includes('babajide') || exp.name?.toLowerCase().includes('kongo') || exp.name?.toLowerCase().includes('garba')) {
            return {
              ...exp,
              id: 'expert-kongo',
              name: 'Engr. Kongo Garba',
              avatar: engrBabajidePhoto,
            };
          }
          if (exp.id === 'expert-ibrahim' || exp.id === 'expert-ernest' || exp.id === 'expert-kayode' || exp.name?.toLowerCase().includes('danladi') || exp.name?.toLowerCase().includes('ernest') || exp.name?.toLowerCase().includes('kayode') || exp.name?.toLowerCase().includes('tamandi')) {
            return {
              ...exp,
              id: 'expert-kayode',
              name: 'Kayode Tamandi',
              role: 'Director of Fleet Safety, Route Security & Telematics',
              department: 'fleet_safety',
              departmentLabel: 'Fleet Safety & Security',
              avatar: kayodeTamandiPhoto,
            };
          }
          if (exp.id === 'expert-folashade' || exp.id === 'expert-abubakar' || exp.name?.toLowerCase().includes('folashade') || exp.name?.toLowerCase().includes('abubakar') || exp.name?.toLowerCase().includes('umoru')) {
            return {
              ...exp,
              id: 'expert-abubakar',
              name: 'Mr. Abubakar Umoru',
              role: 'Head of Corporate Relocations & Enterprise Transitions',
              avatar: abubakarUmoruPhoto,
            };
          }
          if (exp.id === 'expert-tariq' || exp.id === 'expert-sabo' || exp.name?.toLowerCase().includes('tariq') || exp.name?.toLowerCase().includes('sabo') || exp.name?.toLowerCase().includes('jashua')) {
            return {
              ...exp,
              id: 'expert-sabo',
              name: 'Mr. Sabo Jashua',
              avatar: saboJashuaPhoto,
            };
          }
          if (exp.id === 'expert-halima' || exp.id === 'expert-aisha' || exp.name?.toLowerCase().includes('halima') || exp.name?.toLowerCase().includes('aisha') || exp.name?.toLowerCase().includes('yareema')) {
            return {
              ...exp,
              id: 'expert-aisha',
              name: 'Ms. Aisha Yareema Abdullahi',
              role: 'Head of Client Success & Goods-in-Transit Claims Concierge',
              avatar: aishaYareemaPhoto,
            };
          }
          if (exp.id === 'expert-kwame' || exp.id === 'expert-bukar' || exp.name?.toLowerCase().includes('kwame') || exp.name?.toLowerCase().includes('mensa') || exp.name?.toLowerCase().includes('bukar') || exp.name?.toLowerCase().includes('chiroma')) {
            return {
              ...exp,
              id: 'expert-bukar',
              name: 'M. Bukar Chiroma',
              avatar: kwameMensahPhoto,
            };
          }
          if (exp.id === 'expert-chioma' || exp.id === 'expert-maria' || exp.name?.toLowerCase().includes('chioma') || exp.name?.toLowerCase().includes('nwachukwu') || exp.name?.toLowerCase().includes('maria') || exp.name?.toLowerCase().includes('sanda')) {
            return {
              ...exp,
              id: 'expert-maria',
              name: 'Mrs. Maria Sanda',
              avatar: chiomaNwachukwuPhoto,
            };
          }
          return exp;
        }) : DEFAULT_LOGISTICS_EXPERTS;

        const loadedBranches = parsed.branches?.length 
          ? parsed.branches.map((b: any) => {
              const def = OFFICE_LOCATIONS.find(d => d.id === b.id);
              const branchLat = typeof b.coordinates?.lat === 'number' && Number.isFinite(b.coordinates.lat) 
                ? b.coordinates.lat 
                : (def?.coordinates?.lat ?? 9.0062);
              const branchLng = typeof b.coordinates?.lng === 'number' && Number.isFinite(b.coordinates.lng) 
                ? b.coordinates.lng 
                : (def?.coordinates?.lng ?? 7.4281);
              const isAbuja = b.id === 'abuja-hq' || b.managerName?.toLowerCase().includes('kabir') || b.managerName?.toLowerCase().includes('usman');
              return {
                ...def,
                ...b,
                coordinates: {
                  lat: branchLat,
                  lng: branchLng,
                },
                managerName: isAbuja ? 'Engr. Usman Kabir' : (b.managerName || def?.managerName),
                managerTitle: isAbuja ? 'National Operations Director & FCT Regional Lead' : (b.managerTitle || def?.managerTitle),
                managerPhone: b.managerPhone || def?.managerPhone,
                managerEmail: isAbuja ? 'u.kabir@megatrendmovers.com' : (b.managerEmail || def?.managerEmail),
                managerAvatar: isAbuja
                  ? usmanKabirPhoto
                  : (b.id === 'accra-ghana' || b.managerName?.toLowerCase().includes('kwame') || b.managerName?.toLowerCase().includes('bukar') || b.managerName?.toLowerCase().includes('chiroma'))
                  ? kwameMensahPhoto
                  : (b.managerAvatar || def?.managerAvatar),
                fleetCapacity: b.fleetCapacity || def?.fleetCapacity,
                coverageAreas: b.coverageAreas || def?.coverageAreas,
                whatsappPhone: b.whatsappPhone || def?.whatsappPhone,
              };
            }) 
          : OFFICE_LOCATIONS;

        return {
          ...DEFAULT_CMS_CONFIG,
          ...parsed,
          branches: loadedBranches,
          hero: { ...DEFAULT_CMS_CONFIG.hero, ...(parsed.hero || {}) },
          company: { ...DEFAULT_CMS_CONFIG.company, ...(parsed.company || {}) },
          about: mergedAbout,
          logisticsExperts: loadedExperts,
          newsletterSubscribers: parsed.newsletterSubscribers?.length ? parsed.newsletterSubscribers : DEFAULT_NEWSLETTER_SUBSCRIBERS,
          newsletterCampaigns: parsed.newsletterCampaigns?.length ? parsed.newsletterCampaigns : DEFAULT_NEWSLETTER_CAMPAIGNS,
          announcement: { ...DEFAULT_CMS_CONFIG.announcement, ...(parsed.announcement || {}) },
          mediaLibrary: parsed.mediaLibrary?.length ? parsed.mediaLibrary : PRESET_MEDIA,
          shipments: parsed.shipments?.length 
            ? parsed.shipments.map((s: any) => {
                const defaultShipment = SAMPLE_SHIPMENTS.find(ds => ds.trackingId.toLowerCase() === s.trackingId?.toLowerCase());
                return {
                  ...defaultShipment,
                  ...s,
                  currentCoordinates: {
                    lat: typeof s.currentCoordinates?.lat === 'number' && Number.isFinite(s.currentCoordinates.lat) ? s.currentCoordinates.lat : (defaultShipment?.currentCoordinates?.lat ?? 7.8023),
                    lng: typeof s.currentCoordinates?.lng === 'number' && Number.isFinite(s.currentCoordinates.lng) ? s.currentCoordinates.lng : (defaultShipment?.currentCoordinates?.lng ?? 6.7412),
                  },
                  originCoordinates: s.originCoordinates && typeof s.originCoordinates.lat === 'number' && Number.isFinite(s.originCoordinates.lat) ? s.originCoordinates : defaultShipment?.originCoordinates,
                  destinationCoordinates: s.destinationCoordinates && typeof s.destinationCoordinates.lat === 'number' && Number.isFinite(s.destinationCoordinates.lat) ? s.destinationCoordinates : defaultShipment?.destinationCoordinates,
                  routeCoordinates: Array.isArray(s.routeCoordinates) && s.routeCoordinates.length > 0 ? s.routeCoordinates : defaultShipment?.routeCoordinates,
                };
              })
            : SAMPLE_SHIPMENTS,
          jobOpenings: parsed.jobOpenings?.length ? parsed.jobOpenings : DEFAULT_JOB_OPENINGS,
          jobApplications: parsed.jobApplications?.length ? parsed.jobApplications : SAMPLE_JOB_APPLICATIONS,
          security: { ...DEFAULT_SECURITY_CONFIG, ...(parsed.security || {}) },
          seoMetadata: { 
            ...DEFAULT_SERVICE_SEO_CONFIGS, 
            ...(parsed.seoMetadata || {}),
            services: {
              ...DEFAULT_SERVICE_SEO_CONFIGS.services,
              ...(parsed.seoMetadata?.services || {})
            },
            pages: {
              ...DEFAULT_SERVICE_SEO_CONFIGS.pages,
              ...(parsed.seoMetadata?.pages || {})
            }
          },
        };
      }
    } catch (e) {
      console.warn('Failed to parse local CMS config', e);
    }
    return DEFAULT_CMS_CONFIG;
  });

  const [isLoading, setIsLoading] = useState(false);

  // Sync to server on boot if available
  useEffect(() => {
    const fetchServerCms = async () => {
      try {
        const res = await fetch('/api/cms');
        if (res.ok) {
          const data = await res.json();
          if (data && data.cms) {
            setCms((prev) => ({
              ...prev,
              ...data.cms,
            }));
            localStorage.setItem(CMS_STORAGE_KEY, JSON.stringify(data.cms));
          }
        }
      } catch (err) {
        // Silent server check
      }
    };
    fetchServerCms();
  }, []);

  // Save to LocalStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(CMS_STORAGE_KEY, JSON.stringify(cms));
    } catch (err) {
      console.error('LocalStorage write failed', err);
    }
  }, [cms]);

  // Persist to server API helper
  const saveToServer = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/cms', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cms }),
      });
      setIsLoading(false);
      return res.ok;
    } catch (e) {
      setIsLoading(false);
      return false;
    }
  };

  const updateHero = (heroUpdates: Partial<HeroData>) => {
    setCms((prev) => {
      const next = {
        ...prev,
        hero: { ...prev.hero, ...heroUpdates },
        lastUpdated: new Date().toISOString(),
      };
      return next;
    });
  };

  const updateCompany = (companyUpdates: Partial<CompanyData>) => {
    setCms((prev) => {
      const next = {
        ...prev,
        company: { ...prev.company, ...companyUpdates },
        lastUpdated: new Date().toISOString(),
      };
      return next;
    });
  };

  const updateServices = (services: ServiceDetail[]) => {
    setCms((prev) => ({ ...prev, services, lastUpdated: new Date().toISOString() }));
  };

  const updateService = (id: string, updates: Partial<ServiceDetail>) => {
    setCms((prev) => ({
      ...prev,
      services: prev.services.map((s) => (s.id === id ? { ...s, ...updates } : s)),
      lastUpdated: new Date().toISOString(),
    }));
  };

  const addService = (newService: ServiceDetail) => {
    setCms((prev) => ({
      ...prev,
      services: [...prev.services, newService],
      lastUpdated: new Date().toISOString(),
    }));
  };

  const deleteService = (id: string) => {
    setCms((prev) => ({
      ...prev,
      services: prev.services.filter((s) => s.id !== id),
      lastUpdated: new Date().toISOString(),
    }));
  };

  const updateBranches = (branches: OfficeLocation[]) => {
    setCms((prev) => ({ ...prev, branches, lastUpdated: new Date().toISOString() }));
  };

  const updateBranch = (id: string, updates: Partial<OfficeLocation>) => {
    setCms((prev) => ({
      ...prev,
      branches: prev.branches.map((b) => (b.id === id ? { ...b, ...updates } : b)),
      lastUpdated: new Date().toISOString(),
    }));
  };

  const addBranch = (newBranch: OfficeLocation) => {
    setCms((prev) => ({
      ...prev,
      branches: [...prev.branches, newBranch],
      lastUpdated: new Date().toISOString(),
    }));
  };

  const deleteBranch = (id: string) => {
    setCms((prev) => ({
      ...prev,
      branches: prev.branches.filter((b) => b.id !== id),
      lastUpdated: new Date().toISOString(),
    }));
  };

  const updateTestimonials = (testimonials: typeof TESTIMONIALS) => {
    setCms((prev) => ({ ...prev, testimonials, lastUpdated: new Date().toISOString() }));
  };

  const addTestimonial = (testimonial: (typeof TESTIMONIALS)[0]) => {
    setCms((prev) => ({
      ...prev,
      testimonials: [testimonial, ...prev.testimonials],
      lastUpdated: new Date().toISOString(),
    }));
  };

  const deleteTestimonial = (id: string) => {
    setCms((prev) => ({
      ...prev,
      testimonials: prev.testimonials.filter((t) => t.id !== id),
      lastUpdated: new Date().toISOString(),
    }));
  };

  const updatePricing = (pricing: PricingBenchmark[]) => {
    setCms((prev) => ({ ...prev, pricing, lastUpdated: new Date().toISOString() }));
  };

  const updateAbout = (aboutUpdates: Partial<AboutData>) => {
    setCms((prev) => ({
      ...prev,
      about: { ...prev.about, ...aboutUpdates },
      lastUpdated: new Date().toISOString(),
    }));
  };

  const updateVideoShowcase = (videoShowcase: VideoShowcaseItem[]) => {
    setCms((prev) => ({ ...prev, videoShowcase, lastUpdated: new Date().toISOString() }));
  };

  const updateVideoShowcaseItem = (id: string, updates: Partial<VideoShowcaseItem>) => {
    setCms((prev) => ({
      ...prev,
      videoShowcase: (prev.videoShowcase || []).map((v) => (v.id === id ? { ...v, ...updates } : v)),
      lastUpdated: new Date().toISOString(),
    }));
  };

  const addVideoShowcaseItem = (video: VideoShowcaseItem) => {
    setCms((prev) => ({
      ...prev,
      videoShowcase: [video, ...(prev.videoShowcase || [])],
      lastUpdated: new Date().toISOString(),
    }));
  };

  const deleteVideoShowcaseItem = (id: string) => {
    setCms((prev) => ({
      ...prev,
      videoShowcase: (prev.videoShowcase || []).filter((v) => v.id !== id),
      lastUpdated: new Date().toISOString(),
    }));
  };

  const updateAnnouncement = (announcementUpdates: Partial<AnnouncementData>) => {
    setCms((prev) => ({
      ...prev,
      announcement: { ...prev.announcement, ...announcementUpdates },
      lastUpdated: new Date().toISOString(),
    }));
  };

  const addMedia = (media: Omit<MediaItem, 'id' | 'uploadedAt'>): MediaItem => {
    const newItem: MediaItem = {
      ...media,
      id: `media-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      uploadedAt: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    };

    setCms((prev) => ({
      ...prev,
      mediaLibrary: [newItem, ...prev.mediaLibrary],
      lastUpdated: new Date().toISOString(),
    }));

    return newItem;
  };

  const deleteMedia = (id: string) => {
    setCms((prev) => ({
      ...prev,
      mediaLibrary: prev.mediaLibrary.filter((m) => m.id !== id),
      lastUpdated: new Date().toISOString(),
    }));
  };

  const updateShipments = (shipments: ShipmentTrackStatus[]) => {
    setCms((prev) => ({ ...prev, shipments, lastUpdated: new Date().toISOString() }));
  };

  const updateShipment = (trackingId: string, updates: Partial<ShipmentTrackStatus>) => {
    setCms((prev) => ({
      ...prev,
      shipments: (prev.shipments || SAMPLE_SHIPMENTS).map((s) =>
        s.trackingId.toLowerCase() === trackingId.toLowerCase() ? { ...s, ...updates } : s
      ),
      lastUpdated: new Date().toISOString(),
    }));
  };

  const addShipment = (newShipment: ShipmentTrackStatus) => {
    setCms((prev) => ({
      ...prev,
      shipments: [newShipment, ...(prev.shipments || SAMPLE_SHIPMENTS)],
      lastUpdated: new Date().toISOString(),
    }));
  };

  const deleteShipment = (trackingId: string) => {
    setCms((prev) => ({
      ...prev,
      shipments: (prev.shipments || SAMPLE_SHIPMENTS).filter(
        (s) => s.trackingId.toLowerCase() !== trackingId.toLowerCase()
      ),
      lastUpdated: new Date().toISOString(),
    }));
  };

  // Simulates incremental movement along the route coordinates
  const advanceShipmentSimulation = (trackingId: string, stepIncrement: number = 1) => {
    setCms((prev) => {
      const shipments = prev.shipments || SAMPLE_SHIPMENTS;
      const target = shipments.find((s) => s.trackingId.toLowerCase() === trackingId.toLowerCase());
      if (!target || !target.routeCoordinates || target.routeCoordinates.length === 0) {
        return prev;
      }

      const validRoute = target.routeCoordinates.filter(
        (c): c is [number, number] => Array.isArray(c) && c.length >= 2 && typeof c[0] === 'number' && typeof c[1] === 'number' && Number.isFinite(c[0]) && Number.isFinite(c[1])
      );
      if (validRoute.length === 0) return prev;

      const totalWaypoints = validRoute.length;
      let currentIndex = 0;
      const curLat = target.currentCoordinates?.lat;
      const curLng = target.currentCoordinates?.lng;
      if (typeof curLat === 'number' && typeof curLng === 'number' && Number.isFinite(curLat) && Number.isFinite(curLng)) {
        // Find closest point index in route
        let minDist = Infinity;
        validRoute.forEach((coord, idx) => {
          const d = Math.hypot(coord[0] - curLat, coord[1] - curLng);
          if (d < minDist) {
            minDist = d;
            currentIndex = idx;
          }
        });
      }

      const nextIndex = Math.min(totalWaypoints - 1, (currentIndex + stepIncrement) % totalWaypoints);
      const nextCoord = validRoute[nextIndex];
      const targetLat = Array.isArray(nextCoord) && typeof nextCoord[0] === 'number' && Number.isFinite(nextCoord[0]) ? nextCoord[0] : 7.8023;
      const targetLng = Array.isArray(nextCoord) && typeof nextCoord[1] === 'number' && Number.isFinite(nextCoord[1]) ? nextCoord[1] : 6.7412;
      const newProgress = Math.min(100, Math.round(((nextIndex + 1) / totalWaypoints) * 100));

      // Calculate speed fluctuation (e.g. 50-85 km/h)
      const simulatedSpeed = newProgress >= 100 ? 0 : Math.floor(55 + Math.random() * 25);
      const newStatus = newProgress >= 100 ? 'Delivered' : newProgress >= 85 ? 'Out for Delivery' : 'In Transit';

      const updatedShipment: ShipmentTrackStatus = {
        ...target,
        currentCoordinates: { lat: targetLat, lng: targetLng },
        progressPercent: newProgress,
        speedKmh: simulatedSpeed,
        status: newStatus,
        distanceTraveledKm: Math.round(((target.totalDistanceKm || 750) * newProgress) / 100),
      };

      return {
        ...prev,
        shipments: shipments.map((s) =>
          s.trackingId.toLowerCase() === trackingId.toLowerCase() ? updatedShipment : s
        ),
      };
    });
  };

  // Careers & Job Openings Management
  const updateJobOpenings = (jobOpenings: JobOpening[]) => {
    setCms((prev) => ({ ...prev, jobOpenings, lastUpdated: new Date().toISOString() }));
  };

  const updateJobOpening = (id: string, updates: Partial<JobOpening>) => {
    setCms((prev) => ({
      ...prev,
      jobOpenings: (prev.jobOpenings || DEFAULT_JOB_OPENINGS).map((j) =>
        j.id === id ? { ...j, ...updates } : j
      ),
      lastUpdated: new Date().toISOString(),
    }));
  };

  const addJobOpening = (job: JobOpening) => {
    setCms((prev) => ({
      ...prev,
      jobOpenings: [job, ...(prev.jobOpenings || DEFAULT_JOB_OPENINGS)],
      lastUpdated: new Date().toISOString(),
    }));
  };

  const deleteJobOpening = (id: string) => {
    setCms((prev) => ({
      ...prev,
      jobOpenings: (prev.jobOpenings || DEFAULT_JOB_OPENINGS).filter((j) => j.id !== id),
      lastUpdated: new Date().toISOString(),
    }));
  };

  // Job Applications Management
  const updateJobApplications = (jobApplications: JobApplication[]) => {
    setCms((prev) => ({ ...prev, jobApplications, lastUpdated: new Date().toISOString() }));
  };

  const addJobApplication = async (
    appData: Omit<JobApplication, 'id' | 'appliedAt' | 'status'>
  ): Promise<JobApplication> => {
    const newApplication: JobApplication = {
      ...appData,
      id: `APP-${Math.floor(10000 + Math.random() * 90000)}`,
      status: 'submitted',
      appliedAt: new Date().toISOString(),
    };

    // Update local CMS state immediately
    setCms((prev) => ({
      ...prev,
      jobApplications: [newApplication, ...(prev.jobApplications || SAMPLE_JOB_APPLICATIONS)],
      lastUpdated: new Date().toISOString(),
    }));

    // Post to server if online
    try {
      await fetch('/api/careers/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newApplication),
      });
    } catch (err) {
      // Graceful fallback for offline/client
    }

    return newApplication;
  };

  const updateJobApplicationStatus = (
    id: string,
    status: JobApplication['status'],
    adminNotes?: string
  ) => {
    setCms((prev) => ({
      ...prev,
      jobApplications: (prev.jobApplications || SAMPLE_JOB_APPLICATIONS).map((a) =>
        a.id === id ? { ...a, status, ...(adminNotes !== undefined ? { adminNotes } : {}) } : a
      ),
      lastUpdated: new Date().toISOString(),
    }));

    // Async server notification
    fetch(`/api/careers/applications/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, adminNotes }),
    }).catch(() => {});
  };

  const deleteJobApplication = (id: string) => {
    setCms((prev) => ({
      ...prev,
      jobApplications: (prev.jobApplications || SAMPLE_JOB_APPLICATIONS).filter((a) => a.id !== id),
      lastUpdated: new Date().toISOString(),
    }));
  };

  const getClientContextMeta = () => {
    if (typeof window === 'undefined') return {};
    const ua = navigator.userAgent || '';
    const screen = `${window.screen?.width || 0}x${window.screen?.height || 0}`;
    const viewport = `${window.innerWidth || 0}x${window.innerHeight || 0}`;
    const language = navigator.language || 'en';
    const platform = navigator.platform || '';
    
    let deviceType: 'Desktop' | 'Mobile' | 'Tablet' = 'Desktop';
    if (/ipad|tablet/i.test(ua)) deviceType = 'Tablet';
    else if (/mobile|iphone|android/i.test(ua)) deviceType = 'Mobile';

    let browser = 'Web Browser';
    if (/edg\//i.test(ua)) browser = 'Microsoft Edge';
    else if (/opr\/|opera/i.test(ua)) browser = 'Opera';
    else if (/chrome/i.test(ua)) browser = 'Google Chrome';
    else if (/safari/i.test(ua)) browser = 'Apple Safari';
    else if (/firefox/i.test(ua)) browser = 'Mozilla Firefox';

    let os = 'Unknown OS';
    if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
    else if (/mac os x/i.test(ua)) os = 'macOS';
    else if (/android/i.test(ua)) os = 'Android';
    else if (/windows/i.test(ua)) os = 'Windows';
    else if (/linux/i.test(ua)) os = 'Linux';

    return {
      ua,
      screen,
      viewport,
      language,
      platform,
      deviceType,
      browser,
      os,
    };
  };

  const recordSecurityLog = async (
    action: SecurityActivityLog['action'], 
    description: string,
    extra?: {
      attemptMasked?: string;
      attemptMethod?: SecurityActivityLog['attemptMethod'];
      failureReason?: SecurityActivityLog['failureReason'];
      severity?: SecurityActivityLog['severity'];
      requestPath?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<SecurityActivityLog> => {
    const clientMeta = getClientContextMeta();
    const fallbackId = `sec-log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    
    const localLog: SecurityActivityLog = {
      id: fallbackId,
      action,
      description,
      timestamp: new Date().toISOString(),
      ipOrDevice: `Local Client (${clientMeta.deviceType || 'Desktop'} • ${clientMeta.browser || 'Browser'})`,
      ip: '127.0.0.1',
      userAgent: clientMeta.ua || '',
      browser: clientMeta.browser,
      os: clientMeta.os,
      deviceType: clientMeta.deviceType,
      attemptMasked: extra?.attemptMasked,
      attemptMethod: extra?.attemptMethod || 'admin_modal',
      failureReason: extra?.failureReason,
      severity: extra?.severity || (action === 'login_failed' ? 'warning' : 'info'),
      requestPath: extra?.requestPath || (typeof window !== 'undefined' ? window.location.pathname : '/admin'),
      metadata: {
        ...(extra?.metadata || {}),
        screen: clientMeta.screen,
        viewport: clientMeta.viewport,
        language: clientMeta.language,
      }
    };

    // Prepend immediately to local state for responsive UI
    setCms((prev) => {
      const currentLogs = prev.security?.activityLogs || [];
      return {
        ...prev,
        security: {
          ...(prev.security || DEFAULT_SECURITY_CONFIG),
          activityLogs: [localLog, ...currentLogs.slice(0, 50)],
        },
        lastUpdated: new Date().toISOString(),
      };
    });

    // Send to backend server to capture authentic remote IP and server-side headers
    try {
      const res = await fetch('/api/security/log-attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          description,
          attemptMasked: extra?.attemptMasked,
          attemptMethod: extra?.attemptMethod || 'admin_modal',
          failureReason: extra?.failureReason,
          severity: localLog.severity,
          requestPath: localLog.requestPath,
          metadata: {
            ...localLog.metadata,
            clientTimestamp: localLog.timestamp,
          }
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.log) {
          // Update local log with server resolved data (true IP, parsed UA)
          setCms((prev) => {
            const currentLogs = prev.security?.activityLogs || [];
            const updated = currentLogs.map((l) => (l.id === fallbackId ? { ...l, ...data.log } : l));
            return {
              ...prev,
              security: {
                ...(prev.security || DEFAULT_SECURITY_CONFIG),
                activityLogs: updated,
              },
            };
          });
          return data.log;
        }
      }
    } catch (err) {
      // Graceful offline fallback
    }

    return localLog;
  };

  const fetchSecurityLogs = async (filters?: { action?: string; severity?: string; search?: string; limit?: number }) => {
    try {
      const queryParams = new URLSearchParams();
      if (filters?.action) queryParams.set('action', filters.action);
      if (filters?.severity) queryParams.set('severity', filters.severity);
      if (filters?.search) queryParams.set('search', filters.search);
      if (filters?.limit) queryParams.set('limit', String(filters.limit));

      const res = await fetch(`/api/security/logs?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.logs)) {
          // Sync server logs to CMS state
          setCms((prev) => ({
            ...prev,
            security: {
              ...(prev.security || DEFAULT_SECURITY_CONFIG),
              activityLogs: data.logs,
            },
          }));
          return { logs: data.logs, stats: data.stats };
        }
      }
    } catch (err) {
      console.warn('Could not fetch server security logs', err);
    }
    return { logs: cms.security?.activityLogs || [] };
  };

  const clearSecurityLogs = async (clearedBy: string = 'Admin Dashboard'): Promise<boolean> => {
    try {
      await fetch('/api/security/logs', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clearedBy }),
      });
    } catch (err) {
      // Local clear fallback
    }

    const resetLog: SecurityActivityLog = {
      id: `sec-log-${Date.now()}-cleared`,
      action: 'factory_reset',
      description: `Security audit logs purged and archived by ${clearedBy}.`,
      timestamp: new Date().toISOString(),
      ipOrDevice: 'Local Admin Terminal',
      ip: '127.0.0.1',
      severity: 'info',
    };

    setCms((prev) => ({
      ...prev,
      security: {
        ...(prev.security || DEFAULT_SECURITY_CONFIG),
        activityLogs: [resetLog],
      },
      lastUpdated: new Date().toISOString(),
    }));
    return true;
  };

  const updateSecurity = (updates: Partial<AdminSecurityConfig>) => {
    setCms((prev) => ({
      ...prev,
      security: {
        ...(prev.security || DEFAULT_SECURITY_CONFIG),
        ...updates,
      },
      lastUpdated: new Date().toISOString(),
    }));
  };

  const verifyPasskey = (
    input: string,
    contextMeta?: {
      method?: string;
      source?: string;
      failureReason?: string;
      consecutiveFails?: number;
    }
  ): boolean => {
    const trimmed = input.trim();
    const maskedAttempt = input.length > 0
      ? `${'•'.repeat(Math.min(input.length, 12))} [${input.length} chars]`
      : '(Empty Passkey)';

    if (!trimmed) {
      recordSecurityLog('login_failed', 'Rejected empty admin passkey submission.', {
        attemptMasked: '(Empty)',
        attemptMethod: (contextMeta?.method as any) || 'admin_modal',
        failureReason: 'empty_input',
        severity: 'warning',
        requestPath: contextMeta?.source || '/admin-portal',
      });
      return false;
    }

    const currentCustom = cms.security?.customPasskey?.trim();
    const activePasskey = currentCustom && currentCustom.length > 0 ? currentCustom : DEFAULT_ADMIN_PASSKEY;

    // Check against active passkey or emergency master token
    const isMasterToken = trimmed === (cms.security?.emergencyRecoveryToken || DEFAULT_SECURITY_CONFIG.emergencyRecoveryToken);
    const isMasterFallback = trimmed === DEFAULT_ADMIN_PASSKEY;

    const isMatch = trimmed === activePasskey || isMasterToken || (isMasterFallback && !currentCustom);

    if (isMatch) {
      const matchType = isMasterToken ? 'Emergency Recovery Master Token' : 'Verified Admin Passkey';
      recordSecurityLog('login_success', `Admin authentication successful via ${matchType}.`, {
        attemptMasked: `${'•'.repeat(Math.min(trimmed.length, 12))} [Verified]`,
        attemptMethod: (contextMeta?.method as any) || (isMasterToken ? 'emergency_token' : 'admin_modal'),
        severity: 'info',
        requestPath: contextMeta?.source || '/admin-portal',
        metadata: {
          isEmergencyTokenUsed: isMasterToken,
        }
      });
    } else {
      const fails = (contextMeta?.consecutiveFails || 0) + 1;
      const severity = fails >= 3 ? 'critical' : 'warning';
      recordSecurityLog(
        'login_failed',
        `Failed admin login attempt: Incorrect passkey provided (Consecutive attempt #${fails}).`,
        {
          attemptMasked: maskedAttempt,
          attemptMethod: (contextMeta?.method as any) || 'admin_modal',
          failureReason: (contextMeta?.failureReason as any) || 'incorrect_passkey',
          severity,
          requestPath: contextMeta?.source || '/admin-portal',
          metadata: {
            consecutiveFails: fails,
          }
        }
      );
    }

    return isMatch;
  };

  const resetPasskey = (newPasskey: string, reason: string = 'Admin passkey updated / reset') => {
    const trimmed = newPasskey.trim();
    setCms((prev) => ({
      ...prev,
      security: {
        ...(prev.security || DEFAULT_SECURITY_CONFIG),
        customPasskey: trimmed,
        lastPasskeyResetDate: new Date().toISOString(),
      },
      lastUpdated: new Date().toISOString(),
    }));

    recordSecurityLog('passkey_changed', `${reason}. New passkey configured successfully.`, {
      attemptMethod: 'recovery_wizard',
      severity: 'info',
    });
  };

  const updateLogisticsExperts = (experts: LogisticsExpert[]) => {
    setCms((prev) => ({ ...prev, logisticsExperts: experts, lastUpdated: new Date().toISOString() }));
  };

  const updateLogisticsExpert = (id: string, updates: Partial<LogisticsExpert>) => {
    setCms((prev) => ({
      ...prev,
      logisticsExperts: (prev.logisticsExperts || DEFAULT_LOGISTICS_EXPERTS).map((exp) =>
        exp.id === id ? { ...exp, ...updates } : exp
      ),
      lastUpdated: new Date().toISOString(),
    }));
  };

  const addLogisticsExpert = (expert: LogisticsExpert) => {
    setCms((prev) => ({
      ...prev,
      logisticsExperts: [...(prev.logisticsExperts || DEFAULT_LOGISTICS_EXPERTS), expert],
      lastUpdated: new Date().toISOString(),
    }));
  };

  const deleteLogisticsExpert = (id: string) => {
    setCms((prev) => ({
      ...prev,
      logisticsExperts: (prev.logisticsExperts || DEFAULT_LOGISTICS_EXPERTS).filter((exp) => exp.id !== id),
      lastUpdated: new Date().toISOString(),
    }));
  };

  const updateNewsletterSubscribers = (subscribers: NewsletterSubscriber[]) => {
    setCms((prev) => ({
      ...prev,
      newsletterSubscribers: subscribers,
      lastUpdated: new Date().toISOString(),
    }));
  };

  const addNewsletterSubscriber = async (sub: {
    email: string;
    fullName?: string;
    interest?: NewsletterInterest;
    source?: string;
    notes?: string;
  }) => {
    const emailLower = sub.email?.toLowerCase().trim();
    if (!emailLower) {
      return { success: false, message: 'Email address is required.' };
    }

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.subscriber) {
          setCms((prev) => {
            const existing = prev.newsletterSubscribers || DEFAULT_NEWSLETTER_SUBSCRIBERS;
            const idx = existing.findIndex((s) => s.email.toLowerCase() === emailLower);
            let updated: NewsletterSubscriber[];
            if (idx !== -1) {
              updated = [...existing];
              updated[idx] = data.subscriber;
            } else {
              updated = [data.subscriber, ...existing];
            }
            return {
              ...prev,
              newsletterSubscribers: updated,
              lastUpdated: new Date().toISOString(),
            };
          });
        }
        return {
          success: true,
          message: data.message || 'Subscribed successfully!',
          subscriber: data.subscriber,
        };
      }
      const errData = await response.json();
      return { success: false, message: errData.message || 'Subscription failed.' };
    } catch (err: any) {
      // Fallback local persistence if server is unavailable
      const newSub: NewsletterSubscriber = {
        id: `SUB-${Math.floor(10000 + Math.random() * 90000)}`,
        email: emailLower,
        fullName: sub.fullName || '',
        interest: sub.interest || 'all',
        source: sub.source || 'footer_form',
        status: 'subscribed',
        subscribedAt: new Date().toISOString(),
        mailchimpSynced: false,
        notes: sub.notes || '',
      };

      setCms((prev) => ({
        ...prev,
        newsletterSubscribers: [newSub, ...(prev.newsletterSubscribers || DEFAULT_NEWSLETTER_SUBSCRIBERS)],
        lastUpdated: new Date().toISOString(),
      }));

      return {
        success: true,
        message: 'Thank you for subscribing! You will receive our monthly relocation guide & moving tips in your inbox.',
        subscriber: newSub,
      };
    }
  };

  const updateNewsletterSubscriber = (id: string, updates: Partial<NewsletterSubscriber>) => {
    setCms((prev) => ({
      ...prev,
      newsletterSubscribers: (prev.newsletterSubscribers || DEFAULT_NEWSLETTER_SUBSCRIBERS).map((s) =>
        s.id === id ? { ...s, ...updates } : s
      ),
      lastUpdated: new Date().toISOString(),
    }));
  };

  const deleteNewsletterSubscriber = async (id: string): Promise<boolean> => {
    try {
      await fetch(`/api/newsletter/subscribers/${id}`, { method: 'DELETE' });
    } catch (err) {
      // Continue local removal
    }

    setCms((prev) => ({
      ...prev,
      newsletterSubscribers: (prev.newsletterSubscribers || DEFAULT_NEWSLETTER_SUBSCRIBERS).filter((s) => s.id !== id),
      lastUpdated: new Date().toISOString(),
    }));
    return true;
  };

  const unsubscribeNewsletter = async (emailOrId: string): Promise<boolean> => {
    try {
      await fetch('/api/newsletter/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: emailOrId, email: emailOrId }),
      });
    } catch (err) {
      // Continue local update
    }

    setCms((prev) => ({
      ...prev,
      newsletterSubscribers: (prev.newsletterSubscribers || DEFAULT_NEWSLETTER_SUBSCRIBERS).map((s) =>
        s.id === emailOrId || s.email.toLowerCase() === emailOrId.toLowerCase()
          ? { ...s, status: 'unsubscribed' }
          : s
      ),
      lastUpdated: new Date().toISOString(),
    }));
    return true;
  };

  const testMailchimpConnection = async () => {
    try {
      const res = await fetch('/api/newsletter/test-mailchimp', { method: 'POST' });
      return await res.json();
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  const updateNewsletterCampaigns = (campaigns: NewsletterCampaign[]) => {
    setCms((prev) => ({
      ...prev,
      newsletterCampaigns: campaigns,
      lastUpdated: new Date().toISOString(),
    }));
  };

  const deleteNewsletterCampaign = async (id: string): Promise<boolean> => {
    try {
      await fetch(`/api/newsletter/campaigns/${id}`, { method: 'DELETE' });
    } catch (err) {
      // Continue local removal
    }

    setCms((prev) => ({
      ...prev,
      newsletterCampaigns: (prev.newsletterCampaigns || DEFAULT_NEWSLETTER_CAMPAIGNS).filter((c) => c.id !== id),
      lastUpdated: new Date().toISOString(),
    }));
    return true;
  };

  const sendNewsletterTestEmail = async (params: {
    testRecipient: string;
    subject: string;
    bodyContent?: string;
    bodyHtml?: string;
    previewText?: string;
    bannerBadge?: string;
    ctaText?: string;
    ctaUrl?: string;
  }) => {
    try {
      const res = await fetch('/api/newsletter/test-broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to dispatch test email.' };
    }
  };

  const broadcastNewsletter = async (params: {
    title?: string;
    subject: string;
    bodyContent?: string;
    bodyHtml?: string;
    targetInterest?: string;
    previewText?: string;
    bannerBadge?: string;
    ctaText?: string;
    ctaUrl?: string;
    templateId?: string;
  }) => {
    try {
      const res = await fetch('/api/newsletter/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (data.success && data.campaign) {
        setCms((prev) => ({
          ...prev,
          newsletterCampaigns: [data.campaign, ...(prev.newsletterCampaigns || DEFAULT_NEWSLETTER_CAMPAIGNS)],
          lastUpdated: new Date().toISOString(),
        }));
      }
      return data;
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  const updateSeoConfig = (updates: Partial<SeoManagerConfig>) => {
    setCms((prev) => ({
      ...prev,
      seoMetadata: {
        ...prev.seoMetadata,
        ...updates,
        services: {
          ...prev.seoMetadata.services,
          ...(updates.services || {}),
        },
        pages: {
          ...prev.seoMetadata.pages,
          ...(updates.pages || {}),
        },
      },
      lastUpdated: new Date().toISOString(),
    }));
  };

  const updateServiceSeo = (serviceId: string, updates: Partial<ServiceSeoConfig>) => {
    setCms((prev) => {
      const existing = prev.seoMetadata?.services?.[serviceId] || DEFAULT_SERVICE_SEO_CONFIGS.services[serviceId as keyof typeof DEFAULT_SERVICE_SEO_CONFIGS.services] || {
        title: '',
        description: '',
        keywords: '',
      };
      return {
        ...prev,
        seoMetadata: {
          ...prev.seoMetadata,
          services: {
            ...prev.seoMetadata?.services,
            [serviceId]: {
              ...existing,
              ...updates,
              lastEdited: new Date().toISOString(),
            },
          },
        },
        lastUpdated: new Date().toISOString(),
      };
    });
  };

  const updatePageSeo = (pageKey: string, updates: Partial<ServiceSeoConfig>) => {
    setCms((prev) => {
      const existing = prev.seoMetadata?.pages?.[pageKey] || DEFAULT_SERVICE_SEO_CONFIGS.pages?.[pageKey] || {
        title: '',
        description: '',
        keywords: '',
      };
      return {
        ...prev,
        seoMetadata: {
          ...prev.seoMetadata,
          pages: {
            ...prev.seoMetadata?.pages,
            [pageKey]: {
              ...existing,
              ...updates,
              lastEdited: new Date().toISOString(),
            },
          },
        },
        lastUpdated: new Date().toISOString(),
      };
    });
  };

  const resetServiceSeo = (serviceId: string) => {
    setCms((prev) => {
      const defaultForService = DEFAULT_SERVICE_SEO_CONFIGS.services[serviceId as keyof typeof DEFAULT_SERVICE_SEO_CONFIGS.services];
      if (!defaultForService) return prev;
      return {
        ...prev,
        seoMetadata: {
          ...prev.seoMetadata,
          services: {
            ...prev.seoMetadata?.services,
            [serviceId]: { ...defaultForService },
          },
        },
        lastUpdated: new Date().toISOString(),
      };
    });
  };

  const resetAllSeo = () => {
    setCms((prev) => ({
      ...prev,
      seoMetadata: JSON.parse(JSON.stringify(DEFAULT_SERVICE_SEO_CONFIGS)),
      lastUpdated: new Date().toISOString(),
    }));
  };

  const resetToDefaults = () => {
    setCms(DEFAULT_CMS_CONFIG);
    localStorage.setItem(CMS_STORAGE_KEY, JSON.stringify(DEFAULT_CMS_CONFIG));
    saveToServer();
  };

  const exportJson = (): string => {
    return JSON.stringify(cms, null, 2);
  };

  const importJson = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && typeof parsed === 'object' && parsed.hero && parsed.company) {
        setCms({
          ...DEFAULT_CMS_CONFIG,
          ...parsed,
        });
        return true;
      }
    } catch (e) {
      console.error('Failed to import JSON configuration', e);
    }
    return false;
  };

  return (
    <CmsContext.Provider
      value={{
        cms,
        updateHero,
        updateCompany,
        updateServices,
        updateService,
        addService,
        deleteService,
        updateBranches,
        updateBranch,
        addBranch,
        deleteBranch,
        updateTestimonials,
        addTestimonial,
        deleteTestimonial,
        updatePricing,
        updateAbout,
        updateVideoShowcase,
        updateVideoShowcaseItem,
        addVideoShowcaseItem,
        deleteVideoShowcaseItem,
        updateLogisticsExperts,
        updateLogisticsExpert,
        addLogisticsExpert,
        deleteLogisticsExpert,
        updateNewsletterSubscribers,
        addNewsletterSubscriber,
        updateNewsletterSubscriber,
        deleteNewsletterSubscriber,
        unsubscribeNewsletter,
        testMailchimpConnection,
        updateNewsletterCampaigns,
        deleteNewsletterCampaign,
        sendNewsletterTestEmail,
        broadcastNewsletter,
        updateAnnouncement,
        addMedia,
        deleteMedia,
        updateShipments,
        updateShipment,
        addShipment,
        deleteShipment,
        advanceShipmentSimulation,
        updateJobOpenings,
        updateJobOpening,
        addJobOpening,
        deleteJobOpening,
        updateJobApplications,
        addJobApplication,
        updateJobApplicationStatus,
        deleteJobApplication,
        updateSecurity,
        updateSeoConfig,
        updateServiceSeo,
        updatePageSeo,
        resetServiceSeo,
        resetAllSeo,
        verifyPasskey,
        resetPasskey,
        recordSecurityLog,
        fetchSecurityLogs,
        clearSecurityLogs,
        resetToDefaults,
        exportJson,
        importJson,
        saveToServer,
        isLoading,
      }}
    >
      {children}
    </CmsContext.Provider>
  );
};

export const useCms = () => {
  const context = useContext(CmsContext);
  if (!context) {
    throw new Error('useCms must be used within a CmsProvider');
  }
  return context;
};
