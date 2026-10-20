export type PageView = 'home' | 'services' | 'coverage' | 'calculator' | 'checklist' | 'tracking' | 'contact' | 'about' | 'careers' | 'investors' | 'admin' | 'dashboard' | 'inspection' | 'car_hire' | 'terms';

export interface InspectedCargoItem {
  id: string;
  itemName: string;
  category: string;
  quantity: number;
  isFragile: boolean;
  fragilityLevel: 'high' | 'medium' | 'low';
  fragilityReason: string;
  recommendedPackaging: string;
  estimatedCbm: number;
  estimatedWeightKg: number;
  conditionNotes?: string;
  boundingAreaDescription?: string;
  photoIndex?: number;
  isArMeasured?: boolean;
  arDimensions?: {
    lengthM: number;
    widthM: number;
    heightM: number;
    measuredAt: string;
    confidenceScore: number;
  };
  warehouseStatus?: 'pending_intake' | 'inspected' | 'crated' | 'loaded' | 'in_transit' | 'offloaded' | 'delivered';
  statusUpdatedAt?: string;
  statusUpdatedBy?: string;
  statusNotes?: string;
  qrCodeData?: string;
}

export interface CargoInspectionReport {
  id: string;
  timestamp: string;
  title: string;
  inspectionLocation?: string;
  clientName?: string;
  photos: {
    id: string;
    dataUrl: string;
    caption?: string;
    capturedAt: string;
    source: 'camera' | 'upload' | 'preset';
  }[];
  items: InspectedCargoItem[];
  summary: string;
  totalItemsCount: number;
  fragileItemsCount: number;
  totalCbm: number;
  totalWeightKg: number;
  recommendedVehicle: string;
  specialHandlingNotes: string[];
  inspectorBadge: string;
  qrVerificationUrl?: string;
  status: 'draft' | 'verified' | 'transferred_to_quote';
  aiModelUsed?: string;
}

export interface SuggestedBox {
  id: string;
  name: string;
  category: 'small' | 'medium' | 'large' | 'xlarge' | 'dishpack' | 'wardrobe' | 'crate' | 'telescopic';
  dimensionsCm: {
    length: number;
    width: number;
    height: number;
  };
  dimensionsLabel: string;
  volumeCbmPerUnit: number;
  quantityRecommended: number;
  totalVolumeCbm: number;
  maxWeightKg: number;
  suggestedItems: string[];
  wallStrength: 'Single-Wall' | 'Double-Wall Heavy Duty' | 'Triple-Wall Honeycomb' | 'Reinforced Plywood Crate';
  estimatedCostNgn: number;
}

export interface SuggestedPackingMaterial {
  id: string;
  name: string;
  type: 'cushioning' | 'wrapping' | 'taping' | 'void_fill' | 'corner_protection' | 'moisture_barrier' | 'securing';
  quantity: number;
  unit: string;
  estimatedPriceNgn: number;
  purpose: string;
  recommendedForItems: string[];
}

export interface PackingProtocolStep {
  stepNumber: number;
  phase: 'Pre-Pack Preparation' | 'Fragile Isolation & Wrap' | 'Box Packing & Void Fill' | 'Labeling & Room Routing' | 'Truck Loading & Bay Stacking';
  title: string;
  instructions: string;
  keyPrecautions: string[];
}

export interface ItemSwapSuggestion {
  id: string;
  title: string;
  sourceItemName: string;
  fromBoxType: string;
  toBoxType: string;
  cbmSaved: number;
  densityScoreDelta: number;
  rationale: string;
  ergonomicBenefit: string;
  isApplied?: boolean;
}

export interface BoxTierDensity {
  category: string;
  label: string;
  fillPercentage: number;
  itemsAssigned: string[];
  status: 'optimal' | 'underfilled' | 'overfilled';
}

export interface PackingDensityAnalysis {
  packingDensityScore: number; // 0 to 100%
  densityGrade: 'Optimal High-Density' | 'Balanced Density' | 'Moderate Void Gaps' | 'Suboptimal Low-Density' | 'Overpacked Risk';
  occupiedCargoCbm: number;
  totalBoxesCbm: number;
  voidSpaceCbm: number;
  voidSpacePercent: number;
  centerOfGravityScore: number;
  crushResistanceScore: number;
  boxTierDensity: BoxTierDensity[];
  swapSuggestions: ItemSwapSuggestion[];
}

export interface PackingDensityTrendPoint {
  id: string;
  step: number;
  label: string;
  timestamp: string;
  action: string;
  densityScore: number;
  voidSpaceCbm: number;
  totalCbm: number;
  cbmSaved: number;
  efficiencyGain: number;
}

export interface SmartPackingPlan {
  id: string;
  generatedAt: string;
  inspectionRefId?: string;
  inspectionTitle?: string;
  sourceVolumeCbm: number;
  sourceItemsCount: number;
  sourceFragileCount: number;
  suggestedBoxes: SuggestedBox[];
  totalBoxesCount: number;
  totalBoxVolumeCbm: number;
  suggestedMaterials: SuggestedPackingMaterial[];
  totalMaterialsCostNgn: number;
  totalBoxesCostNgn: number;
  totalEstimatedPackagingCostNgn: number;
  spaceUtilizationPercent: number;
  fragileProtectionRating: number;
  ecoFriendlyRating: string;
  recommendedVehicleMatch: string;
  protocolSteps: PackingProtocolStep[];
  aiModelUsed: string;
  expertPackagingSummary: string;
  densityAnalysis?: PackingDensityAnalysis;
  swapSuggestions?: ItemSwapSuggestion[];
}

export interface SmartPackingRequest {
  totalCbm: number;
  totalWeightKg?: number;
  inspectionRefId?: string;
  inspectionTitle?: string;
  items: InspectedCargoItem[];
  moveCategory?: string;
  specialInstructions?: string;
}

export type FleetPartnerModel = 'fixed_monthly_lease' | 'revenue_share_management' | 'spot_charter_hire';

export type TruckTonnageCategory = '3.5_5_ton' | '10_15_ton' | '20_30_ton' | '35_ton_lowbed' | 'hiab_crane';

export type TruckSurveyPhotoType =
  | 'front_cabin'
  | 'cargo_interior'
  | 'left_profile'
  | 'right_profile'
  | 'rear_tailgate'
  | 'odometer_dash'
  | 'engine_bay'
  | 'chassis_vin'
  | 'tyres_undercarriage'
  | 'survey_other';

export interface TruckSurveyPhoto {
  id: string;
  type: TruckSurveyPhotoType;
  label: string;
  dataUrl: string; // Base64 data URL for preview and persistent storage
  fileName: string;
  fileSizeBytes: number;
  uploadedAt: string;
  caption?: string;
}

export interface InvestorTruckRegistration {
  id: string;
  registeredAt: string;
  investorName: string;
  phone: string;
  whatsapp?: string;
  email: string;
  companyName?: string;
  cityLocation: string;
  truckMake: string;
  truckModel: string;
  modelYear: number;
  truckCategory: TruckTonnageCategory;
  // Detailed Capacity specifications
  tonnageCapacity: number; // e.g. 5, 10, 15, 25, 30, 40 Tons
  cubicCapacityCbm?: number; // Volume in cubic meters (CBM)
  cargoLengthFt?: string; // e.g. "20ft", "28ft", "33ft", "40ft", "45ft"
  axleConfig?: '4x2 (Single Axle)' | '6x2 (Twin Steer / Tag)' | '6x4 (Double Axle Drive)' | '8x4 (Heavy Multi-Axle)' | string;
  payloadKg?: number; // In kilograms
  fuelType?: 'diesel' | 'cng' | 'petrol';
  transmission?: 'manual' | 'automatic' | 'automated_manual';
  bodyType: 'closed_box' | 'curtain_side' | 'flatbed' | 'dropside' | 'refrigerated' | 'hiab_crane';
  plateNumber: string;
  chassisVin?: string;
  currentOdometerKm?: number;
  // Site survey vehicle verification photos
  surveyPhotos?: TruckSurveyPhoto[];
  preferredModel: FleetPartnerModel;
  expectedMonthlyPayoutNaira?: number;
  roadworthinessValid: boolean;
  insuranceStatus: 'active' | 'expired' | 'need_pyda_brokerage' | 'need_megatrend_brokerage';
  inspectionCity: string;
  additionalNotes?: string;
  status: 'submitted' | 'under_inspection' | 'approved' | 'onboarded';
  referenceCode: string;
}

export interface DriverProfile {
  id: string;
  name: string;
  photoUrl: string;
  title: string;
  experienceYears: number;
  assignedTonnage: TruckTonnageCategory;
  assignedTruckExample: string;
  badgeNumber: string;
  licenseCertifications: {
    licenseClass: string;
    licenseNumberMasked: string;
    lasdriCertified: boolean;
    lasdriBadgeNo: string;
    defensiveDrivingCert: string;
    policeClearance: string;
    medicalFitnessDate: string;
  };
  metrics: {
    accidentFreeKm: string;
    rating: number;
    totalTrips: number;
    onTimeDeliveryRate: number;
    ecoDrivingScore: number;
  };
  specializationRoutes: string[];
  clientReviews: {
    clientName: string;
    clientCompany: string;
    rating: number;
    date: string;
    comment: string;
  }[];
  verificationBadge: string;
  isAvailableForNewInvestorTruck: boolean;
}

export interface CustomerUser {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  avatarUrl?: string;
  registeredAt: string;
  companyName?: string;
  defaultCity?: string;
}

export interface SignatureRecord {
  signatureDataUrl: string;
  signatureType: 'draw' | 'type' | 'upload';
  signedByName: string;
  signedRole: string;
  signedAt: string;
  ipHash: string;
  pkiVerificationCode: string;
  agreedToTerms: boolean;
}

export interface CustomerSavedQuote extends QuoteRequestData {
  savedAt: string;
  formattedEstimate?: string;
  notes?: string;
  signedAgreementId?: string;
  signedAt?: string;
  signatureRecord?: SignatureRecord;
  signedStatus?: 'pending' | 'signed';
}

export type VaultDocumentType =
  | 'insurance_certificate'
  | 'moving_agreement'
  | 'waybill_manifest'
  | 'bill_of_lading'
  | 'payment_receipt'
  | 'proof_of_delivery'
  | 'proforma_invoice'
  | 'packing_slip'
  | 'car_hire_invoice'
  | 'car_hire_receipt';

export interface DeliverySignatureInfo extends SignatureRecord {
  recipientPhone?: string;
  recipientEmail?: string;
  recipientDesignation?: string;
  conditionStatus?: string;
  tamperSealVerified?: boolean;
  documentVaultId?: string;
  inspectionNotes?: string;
  waybillNumber?: string;
}

export interface VaultDocument {
  id: string;
  title: string;
  docType: VaultDocumentType;
  referenceNumber: string;
  issuedDate: string;
  expiryDate?: string;
  status: 'active' | 'signed' | 'settled' | 'archived';
  fileSize: string;
  underwriterOrIssuer?: string;
  coverageAmountNaira?: number;
  originCity?: string;
  destinationCity?: string;
  signatories?: string[];
  signatureRecord?: SignatureRecord;
  associatedQuoteId?: string;
  summaryText: string;
  verifiedStampCode: string;
  tags: string[];
  smsNotificationSent?: boolean;
  smsRecipientPhone?: string;
  smsDispatchedAt?: string;
  smsMessageSid?: string;
  // Pro-Forma Invoice & Quote specifics
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  clientCompany?: string;
  serviceType?: ServiceType;
  movingDate?: string;
  distanceKm?: number;
  estimatedTransitHours?: string;
  recommendedVehicle?: string;
  propertySize?: string;
  quoteBreakdown?: QuoteBreakdownDetails;
  // Inventory Planner & Packing Slip specifics
  inventoryItems?: InventoryItem[];
  surveyPhotosCount?: number;
  totalCbm?: number;
  totalPieces?: number;
  sealNumbers?: string[];
  vehicleType?: string;
  handlingInstructions?: string;
  driverName?: string;
  inspectorName?: string;
  packingSlipRef?: string;
  // Car Hire specifics
  carHireTripType?: 'intra_state' | 'inter_state';
  carHireVehicle?: string;
  carHirePlateNumber?: string;
  carHireChauffeurName?: string;
  carHireChauffeurPhone?: string;
  carHireTotalDays?: number;
  carHirePickupDate?: string;
  carHireReturnDate?: string;
  carHireSubtotalNaira?: number;
  carHireVatNaira?: number;
  carHireTollNaira?: number;
  carHireSecurityEscort?: boolean;
  carHireBookingData?: CarHireBookingData;
}

export interface SmsDispatchLog {
  id: string;
  recipient: string;
  message: string;
  status: 'delivered' | 'sent' | 'simulated' | 'failed';
  provider: 'twilio' | 'native_nigerian_gateway';
  messageSid?: string;
  dispatchedAt: string;
  docReference?: string;
  docType?: string;
  error?: string;
}

export interface SmsGatewayConfig {
  provider: 'twilio' | 'native_nigerian_gateway';
  senderId: string;
  hasTwilio: boolean;
  phoneNumberConfigured: boolean;
  activePhoneNumber?: string;
}

export type BatchSmsCategory = 'weather_delay' | 'system_update' | 'traffic_reroute' | 'emergency_notice' | 'general';
export type BatchSmsUrgency = 'high' | 'medium' | 'low';
export type BatchSmsAudience = 'all_active' | 'in_transit' | 'corporate' | 'residential';

export interface ActiveClientTarget {
  id: string;
  name: string;
  phone: string;
  email?: string;
  company?: string;
  category: 'in_transit' | 'corporate' | 'residential';
  activeConsignment?: string; // e.g. TEMA-84920
  route?: string; // e.g. Lagos Hub -> Abuja HQ
  currentLocation?: string;
  driverName?: string;
  driverPhone?: string;
  status: string;
  selected?: boolean;
}

export interface BatchSmsCampaign {
  id: string;
  title: string;
  category: BatchSmsCategory;
  urgency: BatchSmsUrgency;
  messageTemplate: string;
  targetAudience: BatchSmsAudience;
  totalRecipients: number;
  successfulDispatches: number;
  failedDispatches: number;
  provider: string;
  dispatchedAt: string;
  dispatchedBy?: string;
  recipientsPreview: Array<{
    name: string;
    phone: string;
    status: 'delivered' | 'sent' | 'failed' | 'simulated';
    sid?: string;
    route?: string;
    trackingId?: string;
  }>;
}

export type ServiceType = 'corporate' | 'commercial' | 'residential' | 'haulage' | 'car_hire';

export type CarHireTripType = 'intra_state' | 'inter_state';

export type CarHireCategory = 'suv' | 'sedan' | 'bus' | 'coaster' | 'escort';

export interface CarHireVehicle {
  id: string;
  name: string;
  category: 'suv' | 'sedan' | 'bus' | 'coaster' | 'escort';
  modelYear?: string;
  seats: number;
  luggageCapacity: string;
  dailyRateIntraStateNaira: number;
  dailyRateInterStateNaira: number;
  tollAllowanceInterStateNaira: number;
  chauffeurAllowanceNaira: number;
  armoredEscortAvailable: boolean;
  armoredEscortDailyNaira?: number;
  imageUrl: string;
  description: string;
  features: string[];
  plateNumberExample: string;
}

export interface CarHireBookingData {
  id?: string;
  documentType: 'invoice' | 'receipt';
  tripType: CarHireTripType;
  invoiceOrReceiptNumber: string;
  issueDate: string;
  dueDate?: string;
  status: 'settled' | 'pending' | 'active';
  // Client details
  clientName: string;
  clientCompany?: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress?: string;
  taxIdentificationNumber?: string;
  // Vehicle details
  vehicleId: string;
  vehicleName: string;
  vehiclePlateNumber: string;
  chauffeurName: string;
  chauffeurPhone: string;
  chauffeurLicenseNo?: string;
  // Route details
  originCity: string;
  originAddress: string;
  destinationCity: string;
  destinationAddress: string;
  pickupDate: string;
  pickupTime: string;
  returnDate: string;
  returnTime: string;
  totalDays: number;
  // Pricing details
  dailyBaseRateNaira: number;
  totalBaseHireNaira: number;
  tollAllowanceNaira: number;
  chauffeurAllowanceNaira: number;
  securityEscortIncluded: boolean;
  securityEscortNaira: number;
  subtotalNaira: number;
  vatRatePercent: number; // 7.5%
  vatAmountNaira: number;
  totalAmountNaira: number;
  paymentMethod?: 'bank_transfer' | 'card' | 'corporate_po';
  paymentReference?: string;
  notes?: string;
  isManualPriceOverride?: boolean;
  manualPriceNote?: string;
}

export interface CarHireCustomConfig {
  tripType?: CarHireTripType;
  vehicleId?: string;
  customVehicleName?: string;
  customVehicleCategory?: 'suv' | 'sedan' | 'bus' | 'escort' | 'custom';
  originCity?: string;
  originAddress?: string;
  destinationCity?: string;
  destinationAddress?: string;
  dailyRateNaira?: number;
  pickupDate?: string;
  returnDate?: string;
  pickupTime?: string;
  returnTime?: string;
  totalDays?: number;
  isManualOverride?: boolean;
  docType?: 'invoice' | 'receipt';
}

export interface ServiceDetail {
  id: ServiceType;
  title: string;
  tagline: string;
  shortDesc: string;
  fullDesc: string;
  iconName: string;
  features: string[];
  idealFor: string[];
  processSteps: { title: string; desc: string }[];
  bgImage?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  ogImage?: string;
}

export interface TestimonialItem {
  id: string;
  category: ServiceType | 'corporate' | 'commercial' | 'residential' | 'haulage';
  serviceTitle: string;
  quote: string;
  author: string;
  role: string;
  company: string;
  city: string;
  rating: number;
  avatar: string;
  verified: boolean;
  moveHighlight?: string;
  date?: string;
  helpfulCount?: number;
  tags?: string[];
}

export interface TestimonialQueryOptions {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  sortBy?: 'recent' | 'helpful' | 'rating';
}

export interface TestimonialDatabaseResponse {
  testimonials: TestimonialItem[];
  totalCount: number;
  page: number;
  limit: number;
  hasMore: boolean;
  categories: { id: string; label: string; count: number }[];
  averageRating: number;
  verifiedRatio: string;
}

export interface ServiceSeoConfig {
  title: string;
  description: string;
  keywords: string;
  ogImage?: string;
  canonicalPath?: string;
  robots?: string;
  lastEdited?: string;
}

export interface SeoManagerConfig {
  services: {
    corporate: ServiceSeoConfig;
    commercial: ServiceSeoConfig;
    residential: ServiceSeoConfig;
    haulage: ServiceSeoConfig;
    [key: string]: ServiceSeoConfig;
  };
  pages?: {
    [pageKey: string]: ServiceSeoConfig;
  };
}

export interface OfficeLocation {
  id: string;
  city: string;
  type: 'headquarters' | 'branch' | 'hub' | 'international';
  address: string;
  landmark?: string;
  phones: string[];
  whatsappPhone?: string;
  email: string;
  stateCountry: string;
  region: 'Nigeria' | 'Pan-Africa';
  coordinates: { lat: number; lng: number };
  hours: string;
  isMainHub?: boolean;
  managerName?: string;
  managerTitle?: string;
  managerPhone?: string;
  managerEmail?: string;
  managerAvatar?: string;
  fleetCapacity?: string;
  coverageAreas?: string[];
}

export type InsuranceCoverageTier = 'basic' | 'standard' | 'premium';

export interface QuoteBreakdownDetails {
  baseRateNaira: number;
  distanceChargeNaira: number;
  accessTerrainSurchargeNaira: number;
  packingCratingNaira: number;
  storageAllotmentNaira: number;
  insuranceCoverNaira: number;
  totalEstimatedNaira: number;
  recommendedVehicle: string;
  crewSize: number;
  routeTier: string;
  staircaseSurchargeNaira?: number;
  floorLevel?: number;
  hasElevator?: boolean;
  acInstallationNaira?: number;
  acUnitsCount?: number;
  tvMountingNaira?: number;
  tvMountCount?: number;
  cleaningFeeNaira?: number;
  needsCleaning?: boolean;
  insuranceTier?: InsuranceCoverageTier;
}

export interface QuoteRequestData {
  id?: string;
  serviceType: ServiceType;
  transitMode?: 'intra' | 'inter';
  isInterstate?: boolean;
  fullName: string;
  email: string;
  phone: string;
  companyName?: string;
  originCity: string;
  destinationCity: string;
  originState?: string;
  originLga?: string;
  destinationState?: string;
  destinationLga?: string;
  distanceKm?: number;
  estimatedTransitHours?: string;
  quoteBreakdown?: QuoteBreakdownDetails;
  movingDate: string;
  propertySize?: string; // e.g. "3-Bedroom Duplex", "1000 sqm Office", "20ft Container"
  weightEstKg?: number;
  needsPacking: boolean;
  needsStorage: boolean;
  needsInsurance: boolean;
  insuranceTier?: InsuranceCoverageTier;
  specialInstructions?: string;
  surveyPhotos?: SiteSurveyPhoto[];
  estimatedCostNaira?: number;
  status?: 'pending' | 'reviewed' | 'approved' | 'dispatched';
  createdAt?: string;
}

export interface SiteSurveyPhoto {
  id: string;
  dataUrl: string; // Compressed base64 representation of the survey image
  label: string;
  category: 'Furniture' | 'Electronics' | 'Machinery / Generator' | 'Special / Fragile' | 'Office Fixtures' | 'Other';
  notes?: string;
  capturedAt: string;
  estimatedCbm?: number;
}

export interface GPSWaypoint {
  lat: number;
  lng: number;
  label?: string;
  timestamp?: string;
  speed?: number;
}

export interface ShipmentTrackStatus {
  trackingId: string;
  clientName: string;
  serviceType: string;
  origin: string;
  destination: string;
  currentLocation: string;
  status: 'In Transit' | 'Out for Delivery' | 'Delivered' | 'Pending Dispatch' | 'Customs Clearance';
  progressPercent: number;
  estimatedArrival: string;
  driverContact?: string;
  updates: { date: string; time: string; location: string; note: string }[];
  
  // Real-time GPS & Telematics
  currentCoordinates?: { lat: number; lng: number };
  originCoordinates?: { lat: number; lng: number; label: string };
  destinationCoordinates?: { lat: number; lng: number; label: string };
  routeCoordinates?: [number, number][]; // Highway polyline coordinates [lat, lng]
  speedKmh?: number;
  headingDegrees?: number;
  vehiclePlate?: string;
  vehicleType?: string;
  vehicleUnit?: string;
  driverName?: string;
  driverPhone?: string;
  driverPhoto?: string;
  fuelLevelPercent?: number;
  batteryVolts?: number;
  cargoTempCelsius?: number;
  tamperSealCode?: string;
  geofenceStatus?: 'Inside Hub' | 'On Highway Route' | 'Near Destination' | 'Arrived at Site' | 'Exited Perimeter';
  satelliteCount?: number;
  distanceTraveledKm?: number;
  totalDistanceKm?: number;
  sosAlertActive?: boolean;

  // Real-time SMS Notification Preferences via Twilio Gateway
  smsNotificationsEnabled?: boolean;
  smsNotificationPhone?: string;
  smsLastDispatchedAt?: string;
  smsLastDispatchedSid?: string;
  smsLastMessage?: string;

  // Delivery Handover & Recipient Digital Signature (Proof of Delivery)
  deliverySignature?: DeliverySignatureInfo;
}

export interface ActiveFleetTruck {
  id: string;
  unitCode: string;
  plateNumber: string;
  makeModel: string;
  category: 'heavy_trailer' | 'medium_box' | 'urban_van' | 'specialized_rig';
  tonnageCapacity: number;
  status: 'in_transit' | 'out_for_delivery' | 'loading_dock' | 'customs_hold' | 'standby' | 'delivered';
  currentLocationName: string;
  stateOrRegion: string;
  coordinates: { lat: number; lng: number };
  speedKmh: number;
  headingDegrees: number;
  driverName: string;
  driverPhone: string;
  driverAvatar?: string;
  activeConsignment?: {
    trackingId?: string;
    clientName: string;
    serviceType: string;
    origin: string;
    destination: string;
    tamperSealCode?: string;
    cargoDescription: string;
    progressPercent: number;
    estimatedArrival?: string;
  };
  telematics: {
    fuelPercent: number;
    batteryVolts: number;
    cargoTempCelsius?: number;
    satelliteCount: number;
    odometerKm: number;
    engineHours?: number;
    sosActive?: boolean;
    lastPingTimestamp: string;
  };
  routeCorridor?: string;
  routePolyline?: [number, number][];
}

export interface InventoryItem {
  id: string;
  category: 'Furniture' | 'Electronics' | 'Boxes & Crates' | 'Special / Fragile';
  name: string;
  volumeCbm: number; // Cubic meters
  qty: number;
}

export type JobCategory = 'driver' | 'warehouse' | 'logistics' | 'operations' | 'technician';

export interface JobOpening {
  id: string;
  title: string;
  category: JobCategory;
  location: string;
  employmentType: 'Full-Time' | 'Contract' | 'Part-Time' | 'Temporary' | 'Full-Time / Contract' | string;
  salaryRange?: string;
  experienceRequired: string;
  vacancies: number;
  status: 'active' | 'closed' | 'draft';
  postedDate: string;
  deadline?: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  featured?: boolean;
}

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  fullName: string;
  email: string;
  phone: string;
  cityState: string;
  licenseClass?: string;
  yearsExperience: string;
  currentEmployer?: string;
  availableStartDate: string;
  hasGuarantor: boolean;
  resumeOrBioNotes?: string;
  status: 'submitted' | 'under_review' | 'interview_scheduled' | 'offer_extended' | 'hired' | 'rejected';
  appliedAt: string;
  adminNotes?: string;
}

export interface SecurityActivityLog {
  id: string;
  action: 'login_success' | 'login_failed' | 'passkey_changed' | 'passkey_reset_otp' | 'passkey_reset_question' | 'passkey_reset_token' | 'factory_reset';
  description: string;
  timestamp: string;
  ipOrDevice?: string;
  // Request metadata for security audit
  ip?: string;
  userAgent?: string;
  browser?: string;
  os?: string;
  deviceType?: 'Desktop' | 'Mobile' | 'Tablet' | 'Bot / Script' | string;
  locationHint?: string;
  attemptMasked?: string;
  attemptMethod?: 'admin_modal' | 'passkey_prompt' | 'emergency_token' | 'recovery_wizard' | 'api_call' | string;
  failureReason?: 'incorrect_passkey' | 'empty_input' | 'invalid_token' | 'invalid_otp' | 'invalid_qa' | 'rate_limit_exceeded' | string;
  severity?: 'info' | 'warning' | 'critical';
  requestPath?: string;
  metadata?: Record<string, any>;
}

export interface SecurityAuditStats {
  totalLogs: number;
  failedAttemptsTotal: number;
  failedAttempts24h: number;
  successfulLoginsTotal: number;
  uniqueIpCount: number;
  lastFailedAttempt?: SecurityActivityLog;
  threatLevel: 'low' | 'moderate' | 'elevated' | 'critical';
}

export interface AdminSecurityConfig {
  customPasskey?: string; // If set and not empty, this is the active passkey instead of default
  recoveryEmail: string;
  recoveryPhone: string;
  securityQuestion: string;
  securityAnswer: string;
  emergencyRecoveryToken: string;
  lastPasskeyResetDate?: string;
  sessionTimeoutMinutes?: number;
  activityLogs?: SecurityActivityLog[];
}

export interface VideoShowcaseItem {
  id: string;
  title: string;
  category: 'facility_tour' | 'packing_demo' | 'fleet_operations' | 'client_story';
  categoryLabel: string;
  description: string;
  videoUrl: string; // YouTube URL, Vimeo, or direct MP4 / WebM video link
  thumbnailUrl: string;
  durationFormatted: string;
  featuredClient?: string;
  location?: string;
  keyHighlights: string[];
}

export interface LogisticsExpert {
  id: string;
  name: string;
  role: string;
  department: 'executive' | 'corporate' | 'fleet_safety' | 'white_glove' | 'cross_border' | 'heavy_rigging';
  departmentLabel: string;
  experienceYears: string;
  bio: string;
  quote: string;
  avatar: string;
  location: string;
  certifications: string[];
  trackRecord: string;
  specialties: string[];
  featured?: boolean;
  phone?: string;
  email?: string;
}

export type NewsletterInterest = 'all' | 'residential' | 'corporate' | 'haulage';

export interface NewsletterSubscriber {
  id: string;
  email: string;
  fullName?: string;
  interest: NewsletterInterest;
  source: string; // e.g. 'footer_form', 'quote_modal', 'manual_admin'
  status: 'subscribed' | 'unsubscribed' | 'pending';
  subscribedAt: string;
  mailchimpSynced?: boolean;
  mailchimpId?: string;
  lastEmailSentAt?: string;
  notes?: string;
}

export interface NewsletterCampaign {
  id: string;
  title: string;
  subject: string;
  previewText?: string;
  targetInterest: 'all' | NewsletterInterest;
  recipientCount: number;
  successfulCount?: number;
  failedCount?: number;
  status: 'draft' | 'sent' | 'scheduled' | 'failed';
  sentAt?: string;
  bodyHtml?: string;
  ctaText?: string;
  ctaUrl?: string;
  bannerBadge?: string;
  templateId?: string;
  senderInfo?: string;
  openRatePercent?: number;
  clickRatePercent?: number;
}

export interface MailchimpStatus {
  isConfigured: boolean;
  serverPrefix?: string;
  audienceId?: string;
  statusMessage: string;
  lastTestStatus?: 'success' | 'failed' | 'not_tested';
  lastTestedAt?: string;
}

export interface InvestorStatementTripItem {
  tripId: string;
  date: string;
  waybillNumber: string;
  route: string;
  cargoCategory: string;
  truckPlate: string;
  distanceKm: number;
  grossFreightNaira: number;
  pydaFeeNaira?: number;
  megatrendFeeNaira?: number;
  investorNetNaira: number;
  deliveryReceiptStatus: 'confirmed' | 'pending_signoff';
}

export interface InvestorPayoutStatement {
  id: string; // e.g. "PYDA-STM-2026-08"
  statementNumber: string; // e.g. "PYDA-PAY-2026-08-9941"
  periodMonth: string; // e.g. "August 2026"
  periodCode: string; // e.g. "2026-08"
  issuedDate: string;
  settlementDate?: string;
  status: 'settled' | 'processing' | 'pending';
  investorId: string;
  investorName: string;
  companyName?: string;
  investorEmail: string;
  investorPhone: string;
  taxIdentificationNumber?: string;
  partnershipModel: FleetPartnerModel; // 'fixed_monthly_lease' | 'revenue_share_management' | 'spot_charter_hire'
  bankDetails: {
    bankName: string;
    accountNumber: string;
    accountName: string;
    nibssSessionRef?: string;
  };
  assignedTrucks: {
    plateNumber: string;
    truckMake: string;
    truckModel: string;
    tonnageCapacity: number;
    cargoLengthFt?: string;
    modelType: FleetPartnerModel;
    tripsCompleted: number;
    totalDistanceKm: number;
    grossContributionNaira: number;
  }[];
  financials: {
    grossHaulageRevenueNaira: number;
    managementCommissionPercent: number; // e.g. 30% for rev share, 0% for fixed
    managementCommissionNaira: number;
    gitInsuranceDeductionNaira: number;
    fuelMaintenanceAllowanceNaira: number;
    statutoryWhtPercent: number; // e.g. 5%
    statutoryWhtNaira: number;
    roadTollLeviesNaira: number;
    netPayoutNaira: number;
    disbursementStatus: 'settled' | 'processing' | 'in_review';
    disbursementReference: string;
  };
  tripsSummary: InvestorStatementTripItem[];
  authorizedSignatory: {
    name: string;
    title: string;
    signatureDate: string;
    corporateSealNumber: string;
  };
}

export type DashboardTab = 'quotes' | 'tracking' | 'fleet' | 'vault' | 'inventory' | 'payouts' | 'profile';

export type LeadStatus = 'new_lead' | 'contacted' | 'quote_sent' | 'booked' | 'archived';

export interface WhatsAppLeadConversion {
  id: string;
  timestamp: string; // ISO date string
  pageUrl: string; // e.g. "https://pydamovers.com/#calculator"
  pagePath: string; // e.g. "/#calculator"
  pageTitle: string; // e.g. "Relocation Quote Calculator"
  source: string; // identifier e.g. "floating_widget", "calculator_modal", "branch_map"
  sourceLabel: string; // display name e.g. "Floating WhatsApp Widget"
  whatsappNumber: string; // target e.g. "2348062466212"
  inquiryMessage?: string;
  status: LeadStatus;
  deviceType?: 'mobile' | 'tablet' | 'desktop';
  referrer?: string;
  notes?: string;
  assignedStaff?: string;
  estimatedValueNaira?: number;
}

export interface PageInquiryMetric {
  pagePath: string;
  pageTitle: string;
  clickCount: number;
  percentage: number;
  lastInquiryAt: string;
  topSource: string;
}

// ==========================================
// SMART PACKING ASSISTANT (GEMINI POWERED)
// ==========================================

export interface RecommendedBoxSpec {
  id: string;
  boxType: string; // e.g. "Small Book & Heavy Goods Box", "Medium Standard Cargo Box", "Large Linen & Appliance Box", "Wardrobe Box with Metal Rail", "Picture & Mirror Flat Pack Carton"
  dimensionsCm: string; // e.g. "45 x 30 x 30 cm"
  volumeCbm: number; // e.g. 0.04
  quantity: number;
  recommendedContents: string;
  maxWeightKg: number;
  unitPriceNaira: number;
  totalPriceNaira: number;
  wallType: 'Single-Wall' | 'Double-Wall Heavy Duty' | 'Triple-Wall Export Grade';
}

export interface PackingMaterialSpec {
  id: string;
  materialName: string; // e.g. "Heavy-Duty Bubble Wrap (50m roll)", "Corrugated Brown Paper Pads (Pack of 10)", "Stretch Film / Shrink Wrap (500mm)", "Biodegradable Packing Peanuts (Bag)", "Reinforced Fiberglass Packing Tape (Roll)", "Corner Edge Protectors (Pack of 20)", "Antistatic Foam Sheeting"
  quantityNeeded: string;
  purpose: string;
  unitPriceNaira: number;
  totalPriceNaira: number;
  isEssential: boolean;
}

export interface CustomCratingSpec {
  id: string;
  itemName: string;
  crateType: string; // e.g. "Plywood Timber Frame with Interior High-Density Foam Lining"
  estimatedDimensionsCm: string;
  reason: string;
  estimatedCostNaira: number;
  fragilityLevel: 'high' | 'medium' | 'low';
}

export interface SmartPackingPlan {
  id: string;
  generatedAt: string;
  sourceType: 'inspection_report' | 'inventory_manifest' | 'combined';
  inspectionReportId?: string;
  inspectionTitle?: string;
  totalVolumeCbm: number;
  totalEstimatedWeightKg: number;
  analyzedItemsCount: number;
  fragileItemsCount: number;
  strategySummary: string;
  recommendedBoxes: RecommendedBoxSpec[];
  packingMaterials: PackingMaterialSpec[];
  customCratingItems: CustomCratingSpec[];
  packingSequenceTips: string[];
  totalBoxesCount: number;
  estimatedBoxesCostNaira: number;
  estimatedMaterialsCostNaira: number;
  estimatedCratingCostNaira: number;
  totalPackingCostNaira: number;
  estimatedPackingTimeHours: string;
  spaceEfficiencyPercent: number;
  aiModelUsed: string;
}


