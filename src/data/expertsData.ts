import alhYerimaPhoto from '../assets/images/yerima_forfor_ceo_1789921205231.jpg';
import engrBabajidePhoto from '../assets/images/babajide_ogundipe_1789921225437.jpg';
import kayodeTamandiPhoto from '../assets/images/ernest_agu_director.jpg';
import aishaYareemaPhoto from '../assets/images/aisha_yareema_abdullahi_1789921860511.jpg';
import kwameMensahPhoto from '../assets/images/kwame_mensah_photo_1789922159258.jpg';
import saboJashuaPhoto from '../assets/images/sabo_jashua.jpg';
import abubakarUmoruPhoto from '../assets/images/abubakar_umoru.jpg';
import chiomaNwachukwuPhoto from '../assets/images/chioma_nwachukwu_photo_1789990785245.jpg';
import { LogisticsExpert } from '../types';

export const DEFAULT_LOGISTICS_EXPERTS: LogisticsExpert[] = [
  {
    id: 'expert-yerima',
    name: 'Alhaji Yerima Forfor',
    role: 'Managing Director & Chief Executive Officer',
    department: 'executive',
    departmentLabel: 'Executive Directorate',
    experienceYears: '18+ Years',
    location: 'Abuja Corporate HQ (Citygate Plaza)',
    bio: 'Pioneered Megatrend Movers & Logistics into one of Nigeria’s preeminent freight transport and zero-downtime relocation authorities. Directs strategic fleet expansion across all 36 states and Pan-African corridors.',
    quote: 'Our covenant with every client is absolute reliability: zero operational downtime, live satellite transparency, and uncompromised safety.',
    avatar: alhYerimaPhoto,
    certifications: [
      'Chartered Institute of Logistics (CILT)',
      'Executive Transport Governance',
      'Advanced Supply Chain Strategy'
    ],
    trackRecord: '14,800+ Completed Relocations • 18+ Years Industry Leadership',
    specialties: [
      'Corporate Supply Chain Strategy',
      'Pan-African Interstate Network Expansion',
      'Zero-Downtime Executive Governance'
    ],
    featured: true,
    phone: '+234 806 246 6212',
    email: 'yerimaforfor@megatrendmovers.com'
  },
  {
    id: 'expert-abubakar',
    name: 'Mr. Abubakar Umoru',
    role: 'Head of Corporate Relocations & Enterprise Transitions',
    department: 'corporate',
    departmentLabel: 'Corporate Relocations',
    experienceYears: '14+ Years',
    location: 'Lagos & Abuja Business Districts',
    bio: 'Directs turnkey migrations for multinational corporate offices, commercial bank branches, and executive diplomatic residences with rigorous weekend turnaround protocols.',
    quote: 'We map every workstation, server rack, and executive desk to ensure your teams sign off Friday afternoon and resume seamlessly Monday at 8:00 AM.',
    avatar: abubakarUmoruPhoto,
    certifications: [
      'Project Management Professional (PMP)',
      'Certified Corporate Relocation Planner',
      'Enterprise Asset Chain-of-Custody Auditor'
    ],
    trackRecord: '650+ Corporate Facilities Relocated • 100% On-Time Resumption Rate',
    specialties: [
      'Bank Branch & IT Server Migration',
      'Serialized Barcode Asset Tagging',
      '48-Hour Weekend Office Shift'
    ],
    featured: true,
    phone: '+234 802 560 9972',
    email: 'corporate@megatrendmovers.com'
  },
  {
    id: 'expert-kayode',
    name: 'Kayode Tamandi',
    role: 'Director of Fleet Safety, Route Security & Telematics',
    department: 'fleet_safety',
    departmentLabel: 'Fleet Safety & Security',
    experienceYears: '20+ Years',
    location: 'Central Highway Command Center (Lokoja / Abuja)',
    bio: 'Accomplished logistics director and transport operations authority overseeing round-the-clock satellite GPS tracking, speed-governor enforcement, driver defensive vetting, tamper seal integrity, and highway security escorts.',
    quote: 'Every truck in our fleet is telematics-locked to the exact meter with computerized speed boundaries and 24/7 rapid response support.',
    avatar: kayodeTamandiPhoto,
    certifications: [
      'BSc. Transport Management & Operations',
      'Master of Business Administration (MBA)',
      'Certified Fleet Safety Director',
      'Defense Transport Security Specialist',
      'Satellite Telematics & Geofence Auditor'
    ],
    trackRecord: '3.2 Million Km Monitored • 99.9% Zero-Incident Transit Record',
    specialties: [
      'Live Satellite Telematics & Speed Geofencing',
      'Anti-Tamper Electronic Cargo Seals',
      'Highway Security & Armed Escort Coordination'
    ],
    featured: true,
    phone: '+234 803 624 9911',
    email: 'safety@megatrendmovers.com'
  },
  {
    id: 'expert-chioma',
    name: 'Mrs. Maria Sanda',
    role: 'Master White-Glove Packaging & Fragile Asset Specialist',
    department: 'white_glove',
    departmentLabel: 'White-Glove & Fragile Assets',
    experienceYears: '11+ Years',
    location: 'Abuja FCT & Lagos Hubs',
    bio: 'Leads our elite white-glove packing division, custom timber crating workshop, antistatic server rack packing, and museum-grade fine art & heirloom preservation handling.',
    quote: 'Family heirlooms and fragile server blades receive the same high precision: triple-layer cellular foam, anti-shock timber armor, and velvet handling.',
    avatar: chiomaNwachukwuPhoto,
    certifications: [
      'Certified White-Glove Master Packer',
      'Antistatic Electronic Packaging Specialist',
      'Fine Art & Antiques Preservation Certified'
    ],
    trackRecord: '4,500+ Residential & VIP Moves • 99.8% Zero-Scratch Quality Score',
    specialties: [
      'Custom Timber Crating & Cushioning',
      'Antiques & Fine Art Preservation',
      'Full Packing, Unpacking & Wardrobe Setup'
    ],
    featured: true,
    phone: '+234 806 246 6212',
    email: 'whiteglove@megatrendmovers.com'
  },
  {
    id: 'expert-babajide',
    name: 'Engr. Kongo Garba',
    role: 'Chief Freight Dispatcher & Interstate Route Coordinator',
    department: 'fleet_safety',
    departmentLabel: 'Interstate Haulage & Dispatch',
    experienceYears: '12+ Years',
    location: 'Lagos Maritime Hub (Old Ojo Road, Satellite Town)',
    bio: 'Coordinates 30-ton trailer schedules and multimodal interstate routing across Northern and Southern transit corridors, avoiding congestion and ensuring 24-hour express departures.',
    quote: 'Predictable transport schedules come from meticulous route scouting, live highway telematics, and direct radio communication with our drivers.',
    avatar: engrBabajidePhoto,
    certifications: [
      'Heavy Freight Dispatch Master',
      'National Highway Route Optimization',
      'ECOWAS Transit Weight & Bridge Compliance'
    ],
    trackRecord: '8,200+ Heavy Freight Dispatches • 24-Hour Express Corridor Lead',
    specialties: [
      'Heavy Freight Logistics (30-Ton Rigs)',
      'Port Container Drayage & Chassis Logistics',
      'Real-Time Bypass Corridor Routing'
    ],
    featured: false,
    phone: '+234 802 560 9972',
    email: 'dispatch@megatrendmovers.com'
  },
  {
    id: 'expert-kwame',
    name: 'M. Bukar Chiroma',
    role: 'Regional Cross-Border & Customs Compliance Lead',
    department: 'cross_border',
    departmentLabel: 'Pan-African & Customs Corridors',
    experienceYears: '15+ Years',
    location: 'Seme Border / Lome / Accra Transit Corridor',
    bio: 'Supervises international customs-bonded transit manifests, border clearance protocols, and sealed container forwarding across Nigeria, Benin, Togo, and Ghana.',
    quote: 'Cross-border transport shouldn’t be hampered by border red tape. We ensure bonded documents and seals are 100% verified before departure.',
    avatar: kwameMensahPhoto,
    certifications: [
      'ECOWAS Customs Bonded Transit Specialist',
      'International Border Transit Protocol',
      'Pan-African Cross-Border Freight Compliance'
    ],
    trackRecord: '2,900+ Cross-Border Border Clearances • 4-Day Lagos-Accra Express Corridor',
    specialties: [
      'ECOWAS Bonded Document Forwarding',
      'Cross-Border Port-to-Factory Haulage',
      'Multi-Currency Customs Escort Management'
    ],
    featured: false,
    phone: '+234 803 624 9911',
    email: 'crossborder@megatrendmovers.com'
  },
  {
    id: 'expert-sabo',
    name: 'Mr. Sabo Jashua',
    role: 'Heavy Rigging, Industrial Crane & Machinery Transport Lead',
    department: 'heavy_rigging',
    departmentLabel: 'Heavy Rigging & Machinery',
    experienceYears: '13+ Years',
    location: 'Port Harcourt Trans-Amadi & Industrial Parks',
    bio: 'Directs lowbed heavy trailer operations, factory plant dismantling, power transformer rigging, and high-tonnage industrial machinery loading with strict OSHA compliance.',
    quote: 'Precision rigging is pure physics and disciplined coordination. We position multi-ton factory equipment to the exact millimeter.',
    avatar: saboJashuaPhoto,
    certifications: [
      'OSHA Industrial Lifting & Rigging Certified',
      'Hydraulic Lowbed Safety Inspector',
      'Heavy Industrial Machine Skidding Specialist'
    ],
    trackRecord: '1,200+ Heavy Machinery Relocations • Zero Structural Safety Incidents',
    specialties: [
      'Hydraulic Lowbed & Crane Operations',
      'Factory Plant Machinery Relocation',
      'Industrial Rigging & Alignment'
    ],
    featured: false,
    phone: '+234 806 246 6212',
    email: 'rigging@megatrendmovers.com'
  },
  {
    id: 'expert-aisha',
    name: 'Ms. Aisha Yareema Abdullahi',
    role: 'Head of Client Success & Goods-in-Transit Claims Concierge',
    department: 'corporate',
    departmentLabel: 'Client Success & Insurance',
    experienceYears: '9+ Years',
    location: 'Abuja National Customer Care Hub',
    bio: 'Oversees customer onboarding, pre-move on-site physical condition surveys, digital inventory receipts, and 100% Goods-in-Transit insurance claim evaluations with 3-day resolution guarantee.',
    quote: 'Transparency builds enduring trust. When you choose Megatrend, you have a dedicated senior concierge tracking your satisfaction at every step.',
    avatar: aishaYareemaPhoto,
    certifications: [
      'Logistics Customer Experience Leader',
      'Goods-in-Transit Claims Assessor',
      'Corporate Key Account Specialist'
    ],
    trackRecord: '99.4% Client Satisfaction Index • 15-Minute Dedicated Response Time',
    specialties: [
      'Pre-Move Physical Survey Coordination',
      'Comprehensive GIT Insurance Guidance',
      '24/7 Dedicated Client Concierge'
    ],
    featured: false,
    phone: '+234 802 560 9972',
    email: 'clientsuccess@megatrendmovers.com'
  }
];
