import { DriverProfile } from '../types';

export const DRIVER_PROFILES: DriverProfile[] = [
  {
    id: 'drv-babatunde-alabi',
    name: 'Captain Babatunde Alabi',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
    title: 'Senior Interstate Fleet Captain & Heavy Haulage Lead',
    experienceYears: 14,
    assignedTonnage: '20_30_ton',
    assignedTruckExample: 'Mack Granite 30T Semi-Trailer (Plate: ABJ-482-XY)',
    badgeNumber: 'PYDA-CPT-0891',
    verificationBadge: 'Level 5 Master Captain',
    isAvailableForNewInvestorTruck: true,
    licenseCertifications: {
      licenseClass: 'Class G (Articulated Heavy Vehicles)',
      licenseNumberMasked: 'FRSC-LA-****-9821',
      lasdriCertified: true,
      lasdriBadgeNo: 'LASDRI/HVY/2026-0891',
      defensiveDrivingCert: 'FRSC Master Highway Safety & Anti-Jackknifing Protocol',
      policeClearance: 'Force CID Alagbon Biometric Character Clearance Verified',
      medicalFitnessDate: 'January 2026 (Vision 20/20 & Clean Toxicology)'
    },
    metrics: {
      accidentFreeKm: '520,000+ KM',
      rating: 4.98,
      totalTrips: 384,
      onTimeDeliveryRate: 99.6,
      ecoDrivingScore: 98
    },
    specializationRoutes: [
      'Lagos - Sagamu - Benin - Onitsha Expressway',
      'Lagos - Ibadan - Ilorin - Abuja Dual-Carriageway',
      'Abuja - Kaduna - Kano Long-Haul Interstate'
    ],
    clientReviews: [
      {
        clientName: 'Segun Adebayo',
        clientCompany: 'Honeywell Flour Mills Plc',
        rating: 5,
        date: 'September 2026',
        comment: 'Captain Alabi handled our 28-ton FMCG consignment from Ikeja to Kano flawlessly. Zero cargo vibration damage, smooth gear shifting, and kept dispatch updated every 3 hours without fail.'
      },
      {
        clientName: 'Fatima Kyari',
        clientCompany: 'Nestle Nigeria Supply Chain',
        rating: 5,
        date: 'August 2026',
        comment: 'One of the most disciplined heavy hauler captains in Nigeria. Arrived at our Abuja distribution depot with intact customs seals and full physical manifest paperwork.'
      }
    ]
  },
  {
    id: 'drv-ibrahim-haruna',
    name: 'Ibrahim Haruna (Dan-Borno)',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80',
    title: 'Northern Corridor Long-Haul Semi-Trailer Specialist',
    experienceYears: 16,
    assignedTonnage: '20_30_ton',
    assignedTruckExample: 'DAF CF 30-Ton Tri-Axle Semi-Trailer (Plate: KAN-712-TZ)',
    badgeNumber: 'PYDA-CPT-1142',
    verificationBadge: 'Level 5 Master Captain',
    isAvailableForNewInvestorTruck: true,
    licenseCertifications: {
      licenseClass: 'Class G (Articulated Freight)',
      licenseNumberMasked: 'FRSC-KN-****-4412',
      lasdriCertified: true,
      lasdriBadgeNo: 'NIT/KD-5190 (National Interstate Verified)',
      defensiveDrivingCert: 'Trans-Sahara Highway Night-Navigation & Anti-Hijack Protocol',
      policeClearance: 'Federal Criminal Registry Biometric Record Verified Clean',
      medicalFitnessDate: 'February 2026 (Class 1 DOT Comprehensive Medical)'
    },
    metrics: {
      accidentFreeKm: '610,000+ KM',
      rating: 4.95,
      totalTrips: 420,
      onTimeDeliveryRate: 99.2,
      ecoDrivingScore: 97
    },
    specializationRoutes: [
      'Lagos - Abuja - Kaduna - Kano - Zaria',
      'Port Harcourt - Makurdi - Lafia - Jos Trunk Road',
      'Kano - Katsina - Maradi Cross-Border Corridor'
    ],
    clientReviews: [
      {
        clientName: 'Alhaji Sani Mohammed',
        clientCompany: 'Kano Agro-Allied Commodities Ltd',
        rating: 5,
        date: 'August 2026',
        comment: 'Ibrahim transported 30 metric tons of agricultural commodities through challenging terrain with total composure. The investor truck returned spotless with zero harsh braking events on the telematics log.'
      },
      {
        clientName: 'Chinedu Okeke',
        clientCompany: 'IHS Telecom Towers Nigeria',
        rating: 5,
        date: 'July 2026',
        comment: 'Consistent 5-star performance on the Abuja-Kano corridor. Delivered high-value telecom power units right on schedule without a hitch.'
      }
    ]
  },
  {
    id: 'drv-emeka-okon',
    name: 'Emeka Christian Okon',
    photoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=600&auto=format&fit=crop&q=80',
    title: 'Mid-Tonnage Corporate & Diplomatic Relocation Specialist',
    experienceYears: 10,
    assignedTonnage: '10_15_ton',
    assignedTruckExample: 'Mercedes-Benz Atego 15-Ton Box Truck (Plate: LAG-918-EK)',
    badgeNumber: 'PYDA-CPT-2045',
    verificationBadge: 'Senior Logistics Captain',
    isAvailableForNewInvestorTruck: false,
    licenseCertifications: {
      licenseClass: 'Class E (Commercial Heavy Freight)',
      licenseNumberMasked: 'FRSC-ABJ-****-7731',
      lasdriCertified: true,
      lasdriBadgeNo: 'LASDRI/MED/2026-2045',
      defensiveDrivingCert: 'High-Value Fragile Asset Protective Transit & Air-Suspension Calibration',
      policeClearance: 'FCT Police Command Biometric Character Reference Cleared',
      medicalFitnessDate: 'March 2026 (Certified Class 1 Fitness & Toxicology)'
    },
    metrics: {
      accidentFreeKm: '340,000+ KM',
      rating: 4.99,
      totalTrips: 275,
      onTimeDeliveryRate: 99.8,
      ecoDrivingScore: 99
    },
    specializationRoutes: [
      'Lagos Metro (VI, Ikoyi, Lekki) - Ibadan Interstate',
      'Abuja Central (Maitama, Asokoro, Wuse) - Port Harcourt GRA',
      'Enugu - Asaba - Warri Commercial Arteries'
    ],
    clientReviews: [
      {
        clientName: 'Adeola Balogun',
        clientCompany: 'Sterling Financial Services',
        rating: 5,
        date: 'October 2026',
        comment: 'Emeka moved our entire 4-floor corporate bank headquarters in Victoria Island without a single scratch on server racks or glass desks. Unmatched diligence and care.'
      },
      {
        clientName: 'Sarah Van Der Berg',
        clientCompany: 'EU Diplomatic Mission Abuja',
        rating: 5,
        date: 'August 2026',
        comment: 'Diplomatic relocation from Maitama to Ikoyi. Emeka\'s attention to fragile cargo tie-downs and protocol timing is extraordinary. A credit to the fleet management.'
      }
    ]
  },
  {
    id: 'drv-musa-bello',
    name: 'Musa Bello',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=80',
    title: 'Heavy Industrial & Machinery Haulage Captain',
    experienceYears: 12,
    assignedTonnage: '20_30_ton',
    assignedTruckExample: 'MAN TGA 30-Ton Container Carrier (Plate: EDO-551-XA)',
    badgeNumber: 'PYDA-CPT-3810',
    verificationBadge: 'Senior Logistics Captain',
    isAvailableForNewInvestorTruck: true,
    licenseCertifications: {
      licenseClass: 'Class G (Heavy Articulated & Lowbed)',
      licenseNumberMasked: 'FRSC-ED-****-3109',
      lasdriCertified: true,
      lasdriBadgeNo: 'LASDRI/HVY/2026-3810',
      defensiveDrivingCert: 'Heavy Machinery Weight-Distribution & Hazmat Level-2 Safety',
      policeClearance: 'National Police Character Certificate Verified',
      medicalFitnessDate: 'January 2026 (Cardiovascular & Toxicology Clean)'
    },
    metrics: {
      accidentFreeKm: '430,000+ KM',
      rating: 4.94,
      totalTrips: 290,
      onTimeDeliveryRate: 99.1,
      ecoDrivingScore: 95
    },
    specializationRoutes: [
      'Apapa Port / Tin Can - Sagamu Interchange - Asaba',
      'Port Harcourt Onne Free Zone - Warri Industrial Axis',
      'Benin Bypass - Auchi - Lokoja Heavy Freight Corridor'
    ],
    clientReviews: [
      {
        clientName: 'Engr. Tunde Williams',
        clientCompany: 'Beta Glass Plc Agbara',
        rating: 5,
        date: 'September 2026',
        comment: 'Musa discharged three 40-foot flat-rack industrial units directly into our factory yard in Agbara without missing a beat. Experienced and confident on rough terrain.'
      },
      {
        clientName: 'Chief Patrick Eze',
        clientCompany: 'Onne Port Maritime Operations',
        rating: 5,
        date: 'July 2026',
        comment: 'Smooth port evacuation and zero highway delays. Highly recommended for heavy commercial asset owners who want peace of mind.'
      }
    ]
  },
  {
    id: 'drv-kehinde-adebayo',
    name: 'Kehinde Adebayo',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    title: 'Express Metro & Regional Canter Haulage Captain',
    experienceYears: 8,
    assignedTonnage: '3.5_5_ton',
    assignedTruckExample: 'Mitsubishi Canter 5-Ton Box Van (Plate: OGU-204-TR)',
    badgeNumber: 'PYDA-CPT-1184',
    verificationBadge: 'Certified Fleet Specialist',
    isAvailableForNewInvestorTruck: true,
    licenseCertifications: {
      licenseClass: 'Class E (Commercial Vehicle)',
      licenseNumberMasked: 'FRSC-OG-****-8820',
      lasdriCertified: true,
      lasdriBadgeNo: 'LASDRI/MET/2026-1184',
      defensiveDrivingCert: 'Metropolitan Congestion Evasion & Rapid Dispatch Protocol',
      policeClearance: 'Ogun State Command Biometric Clearance Approved',
      medicalFitnessDate: 'February 2026 (Vision 20/20 & Certified Clean)'
    },
    metrics: {
      accidentFreeKm: '215,000+ KM',
      rating: 4.97,
      totalTrips: 360,
      onTimeDeliveryRate: 99.7,
      ecoDrivingScore: 98
    },
    specializationRoutes: [
      'Lagos Intra-State (Ikeja, Lekki, Epe, Badagry Express)',
      'Lagos - Sagamu - Abeokuta - Ibadan Express Corridor',
      'Abuja Metro & FCT Satellite Town Rapid Dispatch'
    ],
    clientReviews: [
      {
        clientName: 'Dr. (Mrs.) Folake Alabi',
        clientCompany: 'Ikoyi Executive Consignor',
        rating: 5,
        date: 'October 2026',
        comment: 'Kehinde moved our luxury duplex from Ikoyi to Banana Island in one day. Extremely polite, carefully strapped all artwork and designer furniture.'
      },
      {
        clientName: 'Uche Nnamdi',
        clientCompany: 'Jumia Distribution Hub Operations',
        rating: 5,
        date: 'September 2026',
        comment: 'Rapid turnarounds on commercial store restocks across Lagos Island. We trust Kehinde with millions in fragile consumer inventory.'
      }
    ]
  }
];
