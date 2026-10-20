import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Calculator, Truck, ShieldCheck, CheckCircle2, ArrowRight, DollarSign, Calendar, 
  MapPin, Building, Building2, User, Phone, Mail, FileText, AlertCircle, Download, RotateCcw, 
  Sparkles, Check, AlertTriangle, ArrowLeftRight, Clock, Navigation, CheckSquare, 
  Layers, PackageCheck, Warehouse, ShieldAlert, ChevronDown, Compass, Camera, Image as ImageIcon, Eye,
  MessageCircle, FolderLock, Receipt, ExternalLink, Printer, Route, LocateFixed, Search,
  Wind, Tv, Fuel, Lock, Info, Scale
} from 'lucide-react';
import jsPDF from 'jspdf';
import { COMPANY_INFO } from '../data/companyData';
import { 
  NIGERIAN_STATES_DATA, 
  calculateComprehensiveMoveQuote, 
  MoveQuoteCalculationResult,
  NigerianState,
  FUEL_BENCHMARK_RATES,
  findStateIdFromCity
} from '../data/nigerianStatesLgas';
import { ServiceType, QuoteRequestData, QuoteBreakdownDetails, SiteSurveyPhoto, VaultDocument, InsuranceCoverageTier } from '../types';
import { validateFullName, validatePhone, validateEmail, validateMovingDate } from '../utils/validation';
import { useAuth } from '../context/AuthContext';
import { 
  createProformaInvoiceDocument, 
  saveProformaInvoiceToVault, 
  downloadProformaInvoicePdf 
} from '../utils/proformaInvoiceGenerator';
import { LocationSelectorModal } from './LocationSelectorModal';
import { TrustFixedPriceBanner } from './TrustFixedPriceBanner';
import { EnhancedInsuranceSection } from './EnhancedInsuranceSection';
import { InsuranceTermsModal } from './InsuranceTermsModal';

const LOCAL_STORAGE_KEY = 'megatrend_quote_form_draft_v2';
const SESSION_STORAGE_FALLBACK_KEY = 'megatrend_quote_form_draft';

interface QuoteDraftData {
  serviceType?: ServiceType;
  transitMode?: 'intra' | 'inter';
  originStateId?: string;
  originLgaName?: string;
  destinationStateId?: string;
  destinationLgaName?: string;
  movingDate?: string;
  propertySize?: string;
  needsPacking?: boolean;
  needsStorage?: boolean;
  needsInsurance?: boolean;
  insuranceTier?: InsuranceCoverageTier;
  floorLevel?: number;
  hasElevator?: boolean;
  acUnitsCount?: number;
  tvMountCount?: number;
  needsCleaning?: boolean;
  fullName?: string;
  companyName?: string;
  email?: string;
  phone?: string;
  instructions?: string;
  step?: 1 | 2;
  lastSavedAt?: string;
}

const loadLocalDraft = (): QuoteDraftData | null => {
  if (typeof window === 'undefined') return null;
  try {
    const rawLocal = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (rawLocal) {
      return JSON.parse(rawLocal) as QuoteDraftData;
    }
    const rawSession = sessionStorage.getItem(SESSION_STORAGE_FALLBACK_KEY);
    if (rawSession) {
      return JSON.parse(rawSession) as QuoteDraftData;
    }
  } catch (err) {
    console.warn('Unable to read quote draft from localStorage', err);
  }
  return null;
};

interface QuoteCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialService?: ServiceType;
  initialOriginState?: string;
  initialDestinationState?: string;
  initialTransitMode?: 'intra' | 'inter';
  initialInstructions?: string;
  initialSurveyPhotos?: SiteSurveyPhoto[];
  onNavigateToVault?: (docId?: string) => void;
  onOpenTermsModal?: () => void;
  onOpenInspection?: () => void;
}

export const QuoteCalculatorModal: React.FC<QuoteCalculatorModalProps> = ({
  isOpen,
  onClose,
  initialService = 'corporate',
  initialOriginState,
  initialDestinationState,
  initialTransitMode,
  initialInstructions,
  initialSurveyPhotos,
  onNavigateToVault,
  onOpenTermsModal,
  onOpenInspection,
}) => {
  const { customerProfile, saveDocumentToCloud } = useAuth();
  const [generatedInvoiceDoc, setGeneratedInvoiceDoc] = useState<VaultDocument | null>(null);
  const [isViewingInvoiceModal, setIsViewingInvoiceModal] = useState<boolean>(false);
  const [savedInspection, setSavedInspection] = useState<any>(null);
  const [isInspectionApplied, setIsInspectionApplied] = useState<boolean>(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('pyda_latest_cargo_inspection');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.items) && parsed.items.length > 0) {
          setSavedInspection(parsed);
        }
      }
    } catch (err) {
      // ignore
    }
  }, [isOpen]);

  const savedDraft = loadLocalDraft();

  const getDefaultMovingDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  };

  const [serviceType, setServiceType] = useState<ServiceType>(() => initialService || savedDraft?.serviceType || 'corporate');

  // Intra-state vs Inter-state Transit Mode
  const [transitMode, setTransitMode] = useState<'intra' | 'inter'>(() => {
    if (initialTransitMode) return initialTransitMode;
    if (savedDraft?.transitMode) return savedDraft.transitMode;
    if (initialOriginState && initialDestinationState && initialOriginState === initialDestinationState) {
      return 'intra';
    }
    const orig = initialOriginState || savedDraft?.originStateId || 'lagos';
    const dest = initialDestinationState || savedDraft?.destinationStateId || 'fct';
    return orig === dest ? 'intra' : 'inter';
  });

  // Location Selector Modal trigger ('origin' | 'destination' | null)
  const [locationSelectorTarget, setLocationSelectorTarget] = useState<'origin' | 'destination' | null>(null);
  
  // State & LGA selections
  const [originStateId, setOriginStateId] = useState<string>(() => {
    if (initialOriginState) return findStateIdFromCity(initialOriginState);
    return savedDraft?.originStateId || 'lagos';
  });
  const [originLgaName, setOriginLgaName] = useState<string>(() => {
    if (savedDraft?.originLgaName) return savedDraft.originLgaName;
    const resolvedOrigin = initialOriginState ? findStateIdFromCity(initialOriginState) : 'lagos';
    const st = NIGERIAN_STATES_DATA.find((s) => s.id === resolvedOrigin);
    return st ? st.lgas[7]?.name || st.lgas[0]?.name : 'Eti-Osa';
  });

  const [destinationStateId, setDestinationStateId] = useState<string>(() => {
    if (initialDestinationState) return findStateIdFromCity(initialDestinationState);
    if (savedDraft?.destinationStateId) return savedDraft.destinationStateId;
    // If intra-state mode, destination state must match origin
    if (initialTransitMode === 'intra' || savedDraft?.transitMode === 'intra') {
      return initialOriginState ? findStateIdFromCity(initialOriginState) : (savedDraft?.originStateId || 'lagos');
    }
    return 'fct';
  });
  const [destinationLgaName, setDestinationLgaName] = useState<string>(() => {
    if (savedDraft?.destinationLgaName) return savedDraft.destinationLgaName;
    const destStId = initialDestinationState 
      ? findStateIdFromCity(initialDestinationState)
      : (savedDraft?.destinationStateId || (initialTransitMode === 'intra' ? (initialOriginState ? findStateIdFromCity(initialOriginState) : 'lagos') : 'fct'));
    const st = NIGERIAN_STATES_DATA.find((s) => s.id === destStId);
    return st ? st.lgas[0]?.name : 'Abuja Municipal (AMAC)';
  });

  const [movingDate, setMovingDate] = useState<string>(() => savedDraft?.movingDate || getDefaultMovingDate());
  const [propertySize, setPropertySize] = useState<string>(() => savedDraft?.propertySize || 'Medium Office (300 - 600 sqm)');
  
  // Add-ons
  const [needsPacking, setNeedsPacking] = useState<boolean>(() => savedDraft?.needsPacking !== undefined ? savedDraft.needsPacking : true);
  const [needsStorage, setNeedsStorage] = useState<boolean>(() => savedDraft?.needsStorage !== undefined ? savedDraft.needsStorage : false);
  const [needsInsurance, setNeedsInsurance] = useState<boolean>(() => savedDraft?.needsInsurance !== undefined ? savedDraft.needsInsurance : true);
  const [insuranceTier, setInsuranceTier] = useState<InsuranceCoverageTier>(() => savedDraft?.insuranceTier || 'standard');
  const [showInsuranceTermsModal, setShowInsuranceTermsModal] = useState<boolean>(false);

  // Staircase Surcharge & Elevation (₦15,000 per floor level without functioning elevator)
  const [floorLevel, setFloorLevel] = useState<number>(() => savedDraft?.floorLevel !== undefined ? savedDraft.floorLevel : 0);
  const [hasElevator, setHasElevator] = useState<boolean>(() => savedDraft?.hasElevator !== undefined ? savedDraft.hasElevator : true);

  // Specialized Add-on Optional Items
  const [acUnitsCount, setAcUnitsCount] = useState<number>(() => savedDraft?.acUnitsCount || 0);
  const [tvMountCount, setTvMountCount] = useState<number>(() => savedDraft?.tvMountCount || 0);
  const [needsCleaning, setNeedsCleaning] = useState<boolean>(() => savedDraft?.needsCleaning || false);

  // User Contact
  const [fullName, setFullName] = useState<string>(() => savedDraft?.fullName || '');
  const [companyName, setCompanyName] = useState<string>(() => savedDraft?.companyName || '');
  const [email, setEmail] = useState<string>(() => savedDraft?.email || '');
  const [phone, setPhone] = useState<string>(() => savedDraft?.phone || '');
  const [instructions, setInstructions] = useState<string>(() => initialInstructions || savedDraft?.instructions || '');
  const [surveyPhotos, setSurveyPhotos] = useState<SiteSurveyPhoto[]>(() => initialSurveyPhotos || []);
  const [previewingSurveyPhoto, setPreviewingSurveyPhoto] = useState<SiteSurveyPhoto | null>(null);

  // Sync initialInstructions and initialSurveyPhotos when modal is opened or updated
  useEffect(() => {
    if (initialInstructions) {
      setInstructions(initialInstructions);
    }
  }, [initialInstructions]);

  useEffect(() => {
    if (initialSurveyPhotos && initialSurveyPhotos.length > 0) {
      setSurveyPhotos(initialSurveyPhotos);
    }
  }, [initialSurveyPhotos]);

  useEffect(() => {
    if (initialTransitMode) {
      handleTransitModeChange(initialTransitMode);
    }
  }, [initialTransitMode]);

  // Dynamically sync initialOriginState when passed or updated (e.g. from Coverage Map "Calculate Price")
  useEffect(() => {
    if (initialOriginState) {
      const resolvedStateId = findStateIdFromCity(initialOriginState);
      setOriginStateId(resolvedStateId);
      const st = NIGERIAN_STATES_DATA.find((s) => s.id === resolvedStateId);
      if (st && st.lgas.length > 0) {
        const matchedLga = st.lgas.find((l) =>
          initialOriginState.toLowerCase().includes(l.name.toLowerCase()) ||
          l.name.toLowerCase().includes(initialOriginState.toLowerCase())
        );
        setOriginLgaName(matchedLga ? matchedLga.name : st.lgas[0].name);
      }
      // If in intra mode, synchronize destination state; if in inter mode and same, pick alternate
      if (transitMode === 'intra') {
        setDestinationStateId(resolvedStateId);
      } else if (destinationStateId === resolvedStateId) {
        const altStateId = resolvedStateId === 'lagos' ? 'fct' : 'lagos';
        setDestinationStateId(altStateId);
      }
    }
  }, [initialOriginState]);

  useEffect(() => {
    if (initialDestinationState) {
      const resolvedDestStateId = findStateIdFromCity(initialDestinationState);
      setDestinationStateId(resolvedDestStateId);
      const st = NIGERIAN_STATES_DATA.find((s) => s.id === resolvedDestStateId);
      if (st && st.lgas.length > 0) {
        setDestinationLgaName(st.lgas[0].name);
      }
    }
  }, [initialDestinationState]);

  // Touched state for real-time validation error display
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const markTouched = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Real-time validations
  const dateValidation = validateMovingDate(movingDate);
  const nameValidation = validateFullName(fullName);
  const phoneValidation = validatePhone(phone);
  const emailValidation = validateEmail(email);

  const isStep1Valid = dateValidation.isValid;
  const isStep2Valid = nameValidation.isValid && phoneValidation.isValid && emailValidation.isValid;

  // State & Steps
  const [step, setStep] = useState<1 | 2>(() => savedDraft?.step || 1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedQuote, setSubmittedQuote] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState<string | null>(() => savedDraft?.lastSavedAt || null);
  const [showRestoredNotice, setShowRestoredNotice] = useState<boolean>(() => 
    Boolean(savedDraft && (savedDraft.fullName || savedDraft.phone || savedDraft.email || savedDraft.instructions || (savedDraft.step && savedDraft.step === 2)))
  );

  const handleApplyGoogleAiStudioManifest = () => {
    if (!savedInspection) return;

    if (savedInspection.totalCbm <= 4) {
      setPropertySize('1-Bedroom Apartment Move');
    } else if (savedInspection.totalCbm <= 8) {
      setPropertySize('2-Bedroom Apartment Move');
    } else if (savedInspection.totalCbm <= 15) {
      setPropertySize('3-4 Bedroom / Duplex Move');
    } else if (savedInspection.totalCbm <= 25) {
      setPropertySize('3-Ton Covered Box Truck');
    } else if (savedInspection.totalCbm <= 40) {
      setPropertySize('5-Ton Covered Box Truck');
    } else {
      setPropertySize('10-Ton Heavy Freight Truck');
    }

    const manifestSnippet = `[GOOGLE AI STUDIO CERTIFIED MANIFEST - ${savedInspection.totalCbm} CBM • ${savedInspection.totalItemsCount} ITEMS (${savedInspection.fragileItemsCount} FRAGILE)]: Surveyed via Google AI Studio Gemini Vision. Manifest: ${savedInspection.items.map((i: any) => `${i.itemName} (x${i.quantity || 1})`).slice(0, 6).join(', ')}${savedInspection.items.length > 6 ? '...' : ''}.`;

    setInstructions((prev) => {
      if (prev.includes('[GOOGLE AI STUDIO CERTIFIED MANIFEST')) return prev;
      return prev ? `${prev}\n\n${manifestSnippet}` : manifestSnippet;
    });

    if (Array.isArray(savedInspection.photos) && savedInspection.photos.length > 0) {
      const convertedPhotos: SiteSurveyPhoto[] = savedInspection.photos.slice(0, 4).map((p: any, idx: number) => ({
        id: `ai-photo-${idx + 1}-${Date.now()}`,
        dataUrl: p.dataUrl,
        label: p.caption || `Google AI Studio Scene #${idx + 1}`,
        category: 'general',
        estimatedCbm: Number((savedInspection.totalCbm / Math.max(1, savedInspection.photos.length)).toFixed(1)),
        uploadedAt: new Date().toISOString(),
      }));
      setSurveyPhotos(convertedPhotos);
    }

    setIsInspectionApplied(true);
  };

  // Selected State Objects
  const currentOriginState = useMemo(() => {
    return NIGERIAN_STATES_DATA.find((s) => s.id === originStateId) || NIGERIAN_STATES_DATA[0];
  }, [originStateId]);

  const currentDestinationState = useMemo(() => {
    return NIGERIAN_STATES_DATA.find((s) => s.id === destinationStateId) || NIGERIAN_STATES_DATA[1];
  }, [destinationStateId]);

  // Handle switching transit mode between intra-state and inter-state
  const handleTransitModeChange = (mode: 'intra' | 'inter') => {
    setTransitMode(mode);
    if (mode === 'intra') {
      // Intra-state: destination must be same state as origin
      if (destinationStateId !== originStateId) {
        setDestinationStateId(originStateId);
        const st = NIGERIAN_STATES_DATA.find((s) => s.id === originStateId);
        if (st && st.lgas.length > 1) {
          const diffLga = st.lgas.find((l) => l.name !== originLgaName) || st.lgas[1];
          setDestinationLgaName(diffLga.name);
        } else if (st && st.lgas.length > 0) {
          setDestinationLgaName(st.lgas[0].name);
        }
      }
    } else {
      // Inter-state: destination should be a different state from origin
      if (destinationStateId === originStateId) {
        const altStateId = originStateId === 'lagos' ? 'fct' : 'lagos';
        setDestinationStateId(altStateId);
        const st = NIGERIAN_STATES_DATA.find((s) => s.id === altStateId);
        if (st && st.lgas.length > 0) {
          setDestinationLgaName(st.lgas[0].name);
        }
      }
    }
  };

  // When Origin State changes, ensure selected LGA belongs to the state
  const handleOriginStateChange = (stateId: string) => {
    setOriginStateId(stateId);
    const targetState = NIGERIAN_STATES_DATA.find((s) => s.id === stateId);
    if (targetState && targetState.lgas.length > 0) {
      setOriginLgaName(targetState.lgas[0].name);
    }
    // If in intra-state mode, destination state automatically syncs to origin state
    if (transitMode === 'intra') {
      setDestinationStateId(stateId);
      if (targetState && targetState.lgas.length > 1) {
        setDestinationLgaName(targetState.lgas[1].name);
      } else if (targetState && targetState.lgas.length > 0) {
        setDestinationLgaName(targetState.lgas[0].name);
      }
    }
  };

  // When Destination State changes, ensure selected LGA belongs to the state
  const handleDestinationStateChange = (stateId: string) => {
    setDestinationStateId(stateId);
    const targetState = NIGERIAN_STATES_DATA.find((s) => s.id === stateId);
    if (targetState && targetState.lgas.length > 0) {
      setDestinationLgaName(targetState.lgas[0].name);
    }
    // Sync mode if user picks matching or different state
    if (stateId !== originStateId && transitMode === 'intra') {
      setTransitMode('inter');
    } else if (stateId === originStateId && transitMode === 'inter') {
      setTransitMode('intra');
    }
  };

  // Handle location selection from interactive modal
  const handleLocationModalSelect = (stateId: string, lgaName: string) => {
    if (locationSelectorTarget === 'origin') {
      setOriginStateId(stateId);
      setOriginLgaName(lgaName);
      if (transitMode === 'intra') {
        setDestinationStateId(stateId);
        const st = NIGERIAN_STATES_DATA.find((s) => s.id === stateId);
        if (st && st.lgas.length > 1 && lgaName === destinationLgaName) {
          const diff = st.lgas.find((l) => l.name !== lgaName) || st.lgas[1];
          setDestinationLgaName(diff.name);
        }
      }
    } else if (locationSelectorTarget === 'destination') {
      setDestinationStateId(stateId);
      setDestinationLgaName(lgaName);
      if (transitMode === 'intra' && stateId !== originStateId) {
        setTransitMode('inter');
      } else if (transitMode === 'inter' && stateId === originStateId) {
        setTransitMode('intra');
      }
    }
    setLocationSelectorTarget(null);
  };

  // Quick swap origin and destination
  const handleSwapLocations = () => {
    const tempStateId = originStateId;
    const tempLga = originLgaName;
    setOriginStateId(destinationStateId);
    setOriginLgaName(destinationLgaName);
    setDestinationStateId(tempStateId);
    setDestinationLgaName(tempLga);
  };

  // Apply Popular Move Corridor Presets
  const applyPreset = (origStateId: string, origLga: string, destStateId: string, destLga: string, mode?: 'intra' | 'inter', sz?: string) => {
    setOriginStateId(origStateId);
    setOriginLgaName(origLga);
    setDestinationStateId(destStateId);
    setDestinationLgaName(destLga);
    if (mode) {
      setTransitMode(mode);
    } else {
      setTransitMode(origStateId === destStateId ? 'intra' : 'inter');
    }
    if (sz) setPropertySize(sz);
  };

  // Calculate comprehensive price breakdown
  const quoteCalculation: MoveQuoteCalculationResult = useMemo(() => {
    return calculateComprehensiveMoveQuote({
      originStateId,
      originLgaName,
      destinationStateId,
      destinationLgaName,
      serviceType,
      propertySize,
      needsPacking,
      needsStorage,
      needsInsurance,
      insuranceTier,
      floorLevel,
      hasElevator,
      acUnitsCount,
      tvMountCount,
      needsCleaning,
    });
  }, [
    originStateId,
    originLgaName,
    destinationStateId,
    destinationLgaName,
    serviceType,
    propertySize,
    needsPacking,
    needsStorage,
    needsInsurance,
    insuranceTier,
    floorLevel,
    hasElevator,
    acUnitsCount,
    tvMountCount,
    needsCleaning,
  ]);

  // Synchronize form draft to LocalStorage on changes
  useEffect(() => {
    if (submittedQuote) return;
    try {
      const nowIso = new Date().toISOString();
      const draftToSave: QuoteDraftData = {
        serviceType,
        transitMode,
        originStateId,
        originLgaName,
        destinationStateId,
        destinationLgaName,
        movingDate,
        propertySize,
        needsPacking,
        needsStorage,
        needsInsurance,
        insuranceTier,
        floorLevel,
        hasElevator,
        acUnitsCount,
        tvMountCount,
        needsCleaning,
        fullName,
        companyName,
        email,
        phone,
        instructions,
        step,
        lastSavedAt: nowIso,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(draftToSave));
      setLastSavedTimestamp(nowIso);
    } catch (err) {
      // Ignore storage errors
    }
  }, [
    serviceType,
    transitMode,
    originStateId,
    originLgaName,
    destinationStateId,
    destinationLgaName,
    movingDate,
    propertySize,
    needsPacking,
    needsStorage,
    needsInsurance,
    insuranceTier,
    floorLevel,
    hasElevator,
    acUnitsCount,
    tvMountCount,
    needsCleaning,
    fullName,
    companyName,
    email,
    phone,
    instructions,
    step,
    submittedQuote,
  ]);

  useEffect(() => {
    if (initialService) setServiceType(initialService);
  }, [initialService]);

  const handleResetDraft = () => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      sessionStorage.removeItem(SESSION_STORAGE_FALLBACK_KEY);
    } catch (e) {}
    setServiceType('corporate');
    setOriginStateId('lagos');
    setOriginLgaName('Eti-Osa (Ikoyi, Victoria Island, Lekki Phase 1, Ajah, Chevron)');
    setDestinationStateId('fct');
    setDestinationLgaName('Abuja Municipal (AMAC - Central, Maitama, Wuse, Garki, Asokoro, Jabi, Utako, Guzape)');
    setMovingDate(getDefaultMovingDate());
    setPropertySize('Medium Office (300 - 600 sqm)');
    setNeedsPacking(true);
    setNeedsStorage(false);
    setNeedsInsurance(true);
    setInsuranceTier('standard');
    setFullName('');
    setCompanyName('');
    setEmail('');
    setPhone('');
    setInstructions('');
    setStep(1);
    setTouched({});
    setLastSavedTimestamp(null);
    setShowRestoredNotice(false);
    setErrorMsg('');
  };

  const handleProceedToStep2 = () => {
    markTouched('movingDate');
    if (!dateValidation.isValid) {
      setErrorMsg(dateValidation.error || 'Please enter a valid moving date.');
      return;
    }
    setErrorMsg('');
    setStep(2);
  };

  if (!isOpen) return null;

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      fullName: true,
      phone: true,
      email: true,
      movingDate: true,
    });

    if (!isStep2Valid) {
      const firstError = nameValidation.error || phoneValidation.error || emailValidation.error;
      setErrorMsg(firstError || 'Please provide accurate contact details before submitting your quote request.');
      return;
    }
    setErrorMsg('');
    setIsSubmitting(true);

    const breakdownData: QuoteBreakdownDetails = {
      baseRateNaira: quoteCalculation.baseRateNaira,
      distanceChargeNaira: quoteCalculation.distanceChargeNaira,
      accessTerrainSurchargeNaira: quoteCalculation.accessTerrainSurchargeNaira,
      packingCratingNaira: quoteCalculation.packingCratingNaira,
      storageAllotmentNaira: quoteCalculation.storageAllotmentNaira,
      insuranceCoverNaira: quoteCalculation.insuranceCoverNaira,
      totalEstimatedNaira: quoteCalculation.totalEstimatedNaira,
      recommendedVehicle: quoteCalculation.recommendedVehicle,
      crewSize: quoteCalculation.crewSize,
      routeTier: quoteCalculation.routeTier,
      insuranceTier: quoteCalculation.insuranceTier,
    };

    const payload: QuoteRequestData = {
      serviceType,
      transitMode,
      isInterstate: transitMode === 'inter',
      fullName,
      companyName,
      email,
      phone,
      originCity: `${quoteCalculation.originLgaName}, ${quoteCalculation.originStateName}`,
      destinationCity: `${quoteCalculation.destinationLgaName}, ${quoteCalculation.destinationStateName}`,
      originState: quoteCalculation.originStateName,
      originLga: quoteCalculation.originLgaName,
      destinationState: quoteCalculation.destinationStateName,
      destinationLga: quoteCalculation.destinationLgaName,
      distanceKm: quoteCalculation.distanceKm,
      estimatedTransitHours: quoteCalculation.estimatedTransitHours,
      quoteBreakdown: breakdownData,
      movingDate,
      propertySize,
      needsPacking,
      needsStorage,
      needsInsurance,
      insuranceTier: quoteCalculation.insuranceTier,
      specialInstructions: instructions,
      surveyPhotos: surveyPhotos.length > 0 ? surveyPhotos : undefined,
      estimatedCostNaira: quoteCalculation.totalEstimatedNaira,
    };

    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setSubmittedQuote(data.quote);
        try {
          localStorage.removeItem(LOCAL_STORAGE_KEY);
          sessionStorage.removeItem(SESSION_STORAGE_FALLBACK_KEY);

          // Automatically sync to customer portal saved quotes
          const existing = JSON.parse(localStorage.getItem('megatrend_customer_saved_quotes') || '[]');
          const newQuoteEntry = { ...data.quote, savedAt: new Date().toISOString() };
          localStorage.setItem('megatrend_customer_saved_quotes', JSON.stringify([newQuoteEntry, ...existing.filter((q: any) => q.id !== data.quote.id)]));
        } catch (e) {}

        // Automatically generate Pro-Forma Invoice and vault to Document Vault
        try {
          const invoiceDoc = createProformaInvoiceDocument(data.quote, quoteCalculation, customerProfile);
          await saveProformaInvoiceToVault(invoiceDoc, saveDocumentToCloud);
          setGeneratedInvoiceDoc(invoiceDoc);
        } catch (invErr) {
          console.warn('[QuoteModal] Pro-forma invoice generation notice:', invErr);
        }
      } else {
        throw new Error(data.message || 'Submission failed');
      }
    } catch (err) {
      // Fallback client quote generation
      const generatedQuote = {
        id: `QUOTE-${Math.floor(10000 + Math.random() * 90000)}`,
        ...payload,
        createdAt: new Date().toISOString(),
      };
      setSubmittedQuote(generatedQuote);
      try {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        sessionStorage.removeItem(SESSION_STORAGE_FALLBACK_KEY);

        // Automatically sync to customer portal saved quotes
        const existing = JSON.parse(localStorage.getItem('megatrend_customer_saved_quotes') || '[]');
        const newQuoteEntry = { ...generatedQuote, savedAt: new Date().toISOString() };
        localStorage.setItem('megatrend_customer_saved_quotes', JSON.stringify([newQuoteEntry, ...existing.filter((q: any) => q.id !== generatedQuote.id)]));
      } catch (e) {}

      // Automatically generate Pro-Forma Invoice for fallback quote and vault to Document Vault
      try {
        const invoiceDoc = createProformaInvoiceDocument(generatedQuote, quoteCalculation, customerProfile);
        await saveProformaInvoiceToVault(invoiceDoc, saveDocumentToCloud);
        setGeneratedInvoiceDoc(invoiceDoc);
      } catch (invErr) {
        console.warn('[QuoteModal] Pro-forma invoice fallback generation notice:', invErr);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadSummary = (mode: 'pdf' | 'print' = 'pdf') => {
    const refId = submittedQuote?.id || `EST-${Math.floor(10000 + Math.random() * 90000)}`;
    const clientName = submittedQuote?.fullName || fullName.trim() || 'Valued Relocation Client';
    const clientOrg = submittedQuote?.companyName || companyName.trim() || '';
    const clientPhone = submittedQuote?.phone || phone.trim() || 'N/A';
    const clientEmail = submittedQuote?.email || email.trim() || 'N/A';
    const clientNotes = submittedQuote?.instructions || instructions.trim() || '';
    const currentServiceType = (submittedQuote?.serviceType || serviceType || 'residential').toUpperCase();
    const dateStr = submittedQuote?.movingDate || movingDate || 'Flexible Schedule';
    const originStr = `${submittedQuote?.originLga || originLgaName || quoteCalculation.originLgaName}, ${submittedQuote?.originState || currentOriginState.name}`;
    const destStr = `${submittedQuote?.destinationLga || destinationLgaName || quoteCalculation.destinationLgaName}, ${submittedQuote?.destinationState || currentDestinationState.name}`;
    const distKm = submittedQuote?.distanceKm || quoteCalculation.distanceKm;
    const transitTime = submittedQuote?.estimatedTransitHours || quoteCalculation.estimatedTransitHours;
    const vehicle = quoteCalculation.recommendedVehicle;
    const propSize = submittedQuote?.propertySize || propertySize;
    const crew = quoteCalculation.crewSize;
    const b = quoteCalculation;
    const inspectionNotice = 'The final price will be determined after inspection by moving inspection personnel from our company or via video/pictures.';

    if (mode === 'print') {
      // Browser-native print using isolated iframe pattern (pop-up safe, no external page bleed)
      const printIframe = document.createElement('iframe');
      printIframe.style.position = 'fixed';
      printIframe.style.right = '0';
      printIframe.style.bottom = '0';
      printIframe.style.width = '0';
      printIframe.style.height = '0';
      printIframe.style.border = '0';
      document.body.appendChild(printIframe);

      const printDoc = printIframe.contentWindow?.document;
      if (!printDoc) {
        window.print();
        return;
      }

      printDoc.open();
      printDoc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Pyda Movers - Official Relocation Estimate Summary (#${refId})</title>
            <meta charset="utf-8" />
            <style>
              @page {
                size: A4;
                margin: 10mm 12mm 10mm 12mm;
              }
              body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                color: #0f172a;
                background: #ffffff;
                margin: 0;
                padding: 0;
                font-size: 9pt;
                line-height: 1.35;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .header {
                border-bottom: 3px solid #f59e0b;
                background: #0f172a;
                color: #ffffff;
                padding: 12px 16px;
                border-radius: 6px 6px 0 0;
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
              }
              .brand-title {
                font-size: 15pt;
                font-weight: 900;
                letter-spacing: -0.5px;
                margin: 0;
                color: #ffffff;
              }
              .brand-subtitle {
                color: #f59e0b;
                font-size: 8pt;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-top: 2px;
              }
              .header-meta {
                text-align: right;
                font-size: 7.5pt;
                color: #cbd5e1;
              }
              .ref-badge {
                display: inline-block;
                background: #f59e0b;
                color: #0f172a;
                font-weight: 900;
                padding: 2px 8px;
                border-radius: 4px;
                font-size: 8.5pt;
                margin-top: 4px;
              }
              .container {
                padding: 14px 16px;
                border: 1px solid #e2e8f0;
                border-top: 0;
                border-radius: 0 0 6px 6px;
              }
              .section-title {
                font-size: 8.5pt;
                font-weight: 800;
                color: #0f172a;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                border-bottom: 1.5px solid #0f172a;
                padding-bottom: 2px;
                margin: 10px 0 6px 0;
              }
              .info-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 6px 12px;
                font-size: 8pt;
                background: #f8fafc;
                padding: 8px 10px;
                border-radius: 6px;
                border: 1px solid #e2e8f0;
              }
              .info-item strong {
                color: #64748b;
                font-size: 7pt;
                text-transform: uppercase;
                display: block;
                margin-bottom: 1px;
              }
              .info-item span {
                color: #0f172a;
                font-weight: 600;
              }
              .table {
                width: 100%;
                border-collapse: collapse;
                margin: 8px 0;
                font-size: 8pt;
              }
              .table th {
                background: #0f172a;
                color: #ffffff;
                text-align: left;
                padding: 5px 8px;
                font-size: 7.5pt;
                text-transform: uppercase;
              }
              .table th:last-child {
                text-align: right;
              }
              .table td {
                padding: 5px 8px;
                border-bottom: 1px solid #e2e8f0;
              }
              .table td:last-child {
                text-align: right;
                font-family: monospace;
                font-weight: 700;
              }
              .table tr:nth-child(even) td {
                background: #f8fafc;
              }
              .total-box {
                background: #fef3c7;
                border: 2px solid #f59e0b;
                border-radius: 6px;
                padding: 8px 12px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin: 10px 0;
              }
              .total-title {
                font-size: 8.5pt;
                font-weight: 800;
                color: #92400e;
                text-transform: uppercase;
              }
              .total-amount {
                font-size: 13pt;
                font-weight: 900;
                color: #0f172a;
                text-align: right;
              }
              .total-usd {
                font-size: 7.5pt;
                color: #64748b;
                font-weight: 600;
              }
              .inspection-notice {
                background: #fffbeb;
                border: 1.5px solid #f59e0b;
                border-radius: 6px;
                padding: 8px 12px;
                margin: 10px 0;
              }
              .inspection-notice strong {
                color: #b45309;
                font-size: 8pt;
                display: block;
                margin-bottom: 2px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              }
              .inspection-notice p {
                margin: 0;
                font-size: 8.5pt;
                color: #1e293b;
                font-weight: 700;
                line-height: 1.4;
              }
              .footer {
                margin-top: 10px;
                border-top: 1px solid #cbd5e1;
                padding-top: 6px;
                font-size: 7pt;
                color: #64748b;
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div>
                <h1 class="brand-title">PYDA MOVERS & LOGISTICS LTD</h1>
                <div class="brand-subtitle">Official Relocation & Freight Cost Estimate Summary</div>
                <div style="font-size: 7pt; color: #94a3b8; margin-top: 2px;">Nationwide 36 States + FCT • 774 Local Government Areas Coverage</div>
              </div>
              <div class="header-meta">
                <div>Date: <strong>${new Date().toLocaleDateString('en-GB')}</strong></div>
                <div>Time: <strong>${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></div>
                <div class="ref-badge">REF: #${refId}</div>
              </div>
            </div>

            <div class="container">
              <div class="section-title">1. Client & Contact Information</div>
              <div class="info-grid">
                <div class="info-item">
                  <strong>Client Name:</strong>
                  <span>${clientName}</span>
                </div>
                <div class="info-item">
                  <strong>Organization:</strong>
                  <span>${clientOrg || 'Private Residential Relocation'}</span>
                </div>
                <div class="info-item">
                  <strong>Phone / WhatsApp:</strong>
                  <span>${clientPhone}</span>
                </div>
                <div class="info-item">
                  <strong>Email Address:</strong>
                  <span>${clientEmail}</span>
                </div>
              </div>

              <div class="section-title">2. Relocation Route & Operational Specifications</div>
              <div class="info-grid">
                <div class="info-item">
                  <strong>Pick-up Origin:</strong>
                  <span>${originStr}</span>
                </div>
                <div class="info-item">
                  <strong>Drop-off Destination:</strong>
                  <span>${destStr}</span>
                </div>
                <div class="info-item">
                  <strong>Route Distance & Transit:</strong>
                  <span>~${distKm} km (${transitTime})</span>
                </div>
                <div class="info-item">
                  <strong>Service & Move Date:</strong>
                  <span>${currentServiceType} • ${dateStr}</span>
                </div>
                <div class="info-item">
                  <strong>Property / Inventory:</strong>
                  <span>${propSize}</span>
                </div>
                <div class="info-item">
                  <strong>Fleet & Handling Crew:</strong>
                  <span>${vehicle} (${crew} Movers)</span>
                </div>
              </div>

              <div class="section-title">3. Itemized Cost Estimation Schedule</div>
              <table class="table">
                <thead>
                  <tr>
                    <th style="width: 30px;">#</th>
                    <th>Logistics & Handling Component</th>
                    <th>Operational Basis</th>
                    <th style="width: 120px;">Subtotal (NGN)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>01</td>
                    <td><strong>Base Relocation & Loading Crew</strong></td>
                    <td>Dedicated ${crew}-Man Professional Handling Crew</td>
                    <td>₦${b.baseRateNaira.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td>02</td>
                    <td><strong>Route Distance Logistics & Highway Transit</strong></td>
                    <td>~${b.distanceKm} km Inter-state / Intra-state Transit</td>
                    <td>${b.distanceChargeNaira > 0 ? `₦${b.distanceChargeNaira.toLocaleString()}` : 'Included in Base'}</td>
                  </tr>
                  ${b.accessTerrainSurchargeNaira > 0 ? `
                    <tr>
                      <td>03</td>
                      <td><strong>LGA Access, Island Toll & High-Density Surcharge</strong></td>
                      <td>Passage Clearance, Toll Bridges & Logistics Routing</td>
                      <td>₦${b.accessTerrainSurchargeNaira.toLocaleString()}</td>
                    </tr>
                  ` : ''}
                  ${b.packingCratingNaira > 0 ? `
                    <tr>
                      <td>04</td>
                      <td><strong>White-Glove Multi-Layer Packing & Wood Crating</strong></td>
                      <td>Heavy-Duty Bubble Film, Corrugated Sheets & Wooden Crates</td>
                      <td>₦${b.packingCratingNaira.toLocaleString()}</td>
                    </tr>
                  ` : ''}
                  ${b.storageAllotmentNaira > 0 ? `
                    <tr>
                      <td>05</td>
                      <td><strong>30-Day Climate-Controlled Security Warehousing</strong></td>
                      <td>Monitored Central Facility with Fire Suppression</td>
                      <td>₦${b.storageAllotmentNaira.toLocaleString()}</td>
                    </tr>
                  ` : ''}
                  ${b.insuranceCoverNaira > 0 ? `
                    <tr>
                      <td>06</td>
                      <td><strong>${b.insuranceTier === 'premium' ? 'Premium VIP Goods-In-Transit (GIT) Policy' : 'Standard Comprehensive Goods-In-Transit (GIT) Policy'}</strong></td>
                      <td>${b.insuranceTier === 'premium' ? 'Up to ₦75M Full-Replacement, Zero Deductible, 24-48hr Fast-Track' : 'Up to ₦25M All-Risk Cover • Leadway Marine & AIICO Consortium'}</td>
                      <td>₦${b.insuranceCoverNaira.toLocaleString()}</td>
                    </tr>
                  ` : `
                    <tr>
                      <td>06</td>
                      <td><strong>Basic Carrier Cargo Liability Protection</strong></td>
                      <td>₦1,000/kg Limited Weight Carrier Liability (Statutory)</td>
                      <td>Included (₦0)</td>
                    </tr>
                  `}
                  ${b.staircaseSurchargeNaira > 0 ? `
                    <tr>
                      <td>07</td>
                      <td><strong>Staircase Carry Surcharge</strong></td>
                      <td>${b.floorLevel} Floor${b.floorLevel > 1 ? 's' : ''} Above Ground (No Elevator @ ₦15,000/floor)</td>
                      <td>₦${b.staircaseSurchargeNaira.toLocaleString()}</td>
                    </tr>
                  ` : ''}
                  ${b.acInstallationNaira > 0 ? `
                    <tr>
                      <td>08</td>
                      <td><strong>Air Conditioner Removal & Re-installation</strong></td>
                      <td>${b.acUnitsCount} Unit${b.acUnitsCount > 1 ? 's' : ''} Professional De-mounting & Wall Fitting (@ ₦20,000/unit)</td>
                      <td>₦${b.acInstallationNaira.toLocaleString()}</td>
                    </tr>
                  ` : ''}
                  ${b.tvMountingNaira > 0 ? `
                    <tr>
                      <td>09</td>
                      <td><strong>Wall-Mounted TV Dismantling/Mounting</strong></td>
                      <td>${b.tvMountCount} Unit${b.tvMountCount > 1 ? 's' : ''} Bracket Dismount & Re-anchoring (@ ₦10,000/unit)</td>
                      <td>₦${b.tvMountingNaira.toLocaleString()}</td>
                    </tr>
                  ` : ''}
                  ${b.cleaningFeeNaira > 0 ? `
                    <tr>
                      <td>10</td>
                      <td><strong>Post-Move Deep Cleaning & Debris Removal</strong></td>
                      <td>Base Sanitization, Box Disposal & Post-Transit Debris Clear-Out</td>
                      <td>₦${b.cleaningFeeNaira.toLocaleString()}</td>
                    </tr>
                  ` : ''}
                </tbody>
              </table>

              <div class="total-box">
                <div>
                  <div class="total-title">Total Relocation Estimate (All-Inclusive)</div>
                  <div style="font-size: 7pt; color: #78350f; margin-top: 1px;">Covers vehicle fuel, driver allowance, tolls, loading & unloading</div>
                </div>
                <div class="total-amount">
                  ₦${b.totalEstimatedNaira.toLocaleString()}
                  <div class="total-usd">(approx. $${b.totalEstimatedUsd.toLocaleString()} USD)</div>
                </div>
              </div>

              <!-- NOTICEABLE FIXED-PRICE GUARANTEE TRUST BANNER -->
              <div style="background: #fffbeb; border: 1.5px solid #f59e0b; border-radius: 6px; padding: 7px 10px; font-size: 7.5pt; margin-top: 8px;">
                <strong style="color: #92400e; text-transform: uppercase; font-size: 7pt; display: block; margin-bottom: 2px;">Fixed-Price Guarantee:</strong>
                <span style="color: #451a03; line-height: 1.3;">Due to recent fuel price changes, all instant estimates cover end-to-end transit, Goods-in-Transit insurance, and gate clearance fees. Your quoted price on booking will not change on move day.</span>
              </div>

              <!-- MANDATORY INSPECTION & PRICING NOTICE -->
              <div class="inspection-notice">
                <strong>Official Inspection & Pricing Policy:</strong>
                <p>${inspectionNotice}</p>
              </div>

              ${clientNotes ? `
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 10px; font-size: 7.5pt; margin-top: 6px;">
                  <strong style="color: #64748b; text-transform: uppercase; font-size: 6.5pt; display: block;">Special Handling Notes:</strong>
                  <span style="color: #334155;">${clientNotes}</span>
                </div>
              ` : ''}

              <div class="footer">
                <div>
                  <strong>Pyda Movers & Logistics Ltd</strong><br />
                  Abuja HQ: Suite A204, AA Rano Citygate Plaza, Airport Road<br />
                  Lagos Hub: 374/376 Old Ojo Road, Alakija, Lagos<br />
                  Direct Hotline: +234 806 246 6212 | Secondary: +234 802 560 9972
                </div>
                <div style="text-align: right;">
                  <strong>Certified Digital Summary</strong><br />
                  Web: pydamovers.com<br />
                  Email: quotes@pydamovers.com
                </div>
              </div>
            </div>
          </body>
        </html>
      `);
      printDoc.close();

      setTimeout(() => {
        printIframe.contentWindow?.focus();
        printIframe.contentWindow?.print();
        setTimeout(() => {
          if (document.body.contains(printIframe)) {
            document.body.removeChild(printIframe);
          }
        }, 2500);
      }, 350);
      return;
    }

    // mode === 'pdf': Export high-quality vector PDF using jsPDF
    const doc = new jsPDF();

    // Background header banner (Dark slate)
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 38, 'F');

    // Accent strip (Amber gold)
    doc.setFillColor(245, 158, 11);
    doc.rect(0, 38, 210, 3, 'F');

    // Header Text
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('PYDA MOVERS & LOGISTICS LTD', 15, 16);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(245, 158, 11);
    doc.text('OFFICIAL RELOCATION & FREIGHT ESTIMATE SUMMARY', 15, 23);
    doc.setTextColor(203, 213, 225);
    doc.text('NATIONWIDE 36 STATES + FCT COVERAGE | 774 LOCAL GOVERNMENT AREAS', 15, 30);

    doc.setTextColor(203, 213, 225);
    doc.setFontSize(7.5);
    doc.text(`DATE: ${new Date().toLocaleDateString('en-GB')}`, 145, 16);
    doc.text(`TIME: ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, 145, 22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(245, 158, 11);
    doc.text(`REF: #${refId}`, 145, 29);

    let y = 48;

    // Document Title Banner
    doc.setFillColor(241, 245, 249);
    doc.rect(15, y, 180, 9, 'F');
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text('OFFICIAL RELOCATION & ROUTE LOGISTICS QUOTATION SUMMARY', 20, y + 6);

    y += 15;

    // Client Details Section
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('1. CLIENT & ORGANIZATION INFORMATION', 15, y);

    y += 3;
    doc.setLineWidth(0.3);
    doc.setDrawColor(203, 213, 225);
    doc.line(15, y, 195, y);

    y += 6;
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);

    doc.setFont('helvetica', 'bold');
    doc.text('Client Name:', 15, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`${clientName}`, 45, y);

    if (clientOrg) {
      doc.setFont('helvetica', 'bold');
      doc.text('Organization:', 115, y);
      doc.setFont('helvetica', 'normal');
      doc.text(`${clientOrg}`, 145, y);
    }

    y += 5.5;
    doc.setFont('helvetica', 'bold');
    doc.text('Phone / WhatsApp:', 15, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`${clientPhone}`, 45, y);

    doc.setFont('helvetica', 'bold');
    doc.text('Email Address:', 115, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`${clientEmail}`, 145, y);

    y += 11;

    // Logistics & LGA Specifications
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('2. ROUTE & LOCAL GOVERNMENT SPECIFICATIONS', 15, y);

    y += 3;
    doc.line(15, y, 195, y);

    y += 6;
    doc.setFontSize(8);

    doc.setFont('helvetica', 'bold');
    doc.text('Service Type:', 15, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`${currentServiceType} RELOCATION`, 45, y);

    doc.setFont('helvetica', 'bold');
    doc.text('Move Date:', 115, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`${dateStr}`, 145, y);

    y += 5.5;
    doc.setFont('helvetica', 'bold');
    doc.text('Origin (Pick-up):', 15, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`${originStr}`, 45, y);

    y += 5.5;
    doc.setFont('helvetica', 'bold');
    doc.text('Destination (Drop):', 15, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`${destStr}`, 45, y);

    y += 5.5;
    doc.setFont('helvetica', 'bold');
    doc.text('Route Distance:', 15, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`~${distKm} KM (${transitTime})`, 45, y);

    doc.setFont('helvetica', 'bold');
    doc.text('Fleet Assigned:', 115, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`${vehicle}`, 145, y);

    y += 5.5;
    doc.setFont('helvetica', 'bold');
    doc.text('Property / Volume:', 15, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`${propSize}`, 45, y);

    doc.setFont('helvetica', 'bold');
    doc.text('Crew Size:', 115, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`${crew} Professional Handlers`, 145, y);

    y += 12;

    // Comprehensive Pricing Breakdown Section
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('3. COMPREHENSIVE PRICE BREAKDOWN (ITEMIZED)', 15, y);

    y += 3;
    doc.line(15, y, 195, y);

    y += 6;
    doc.setFontSize(8);

    // Line 1: Base Relocation & Handling
    doc.setFont('helvetica', 'normal');
    doc.text(`Base Load & Handling Crew Allocation (${crew} Movers)`, 18, y);
    doc.text(`NGN ₦${b.baseRateNaira.toLocaleString()}`, 155, y);

    // Line 2: Distance & Highway Logistics
    y += 5;
    doc.text(`Distance Logistics & Fuel Allocation (${b.distanceKm} km)`, 18, y);
    doc.text(b.distanceChargeNaira > 0 ? `NGN ₦${b.distanceChargeNaira.toLocaleString()}` : 'Included in Base', 155, y);

    // Line 3: Access / Terrain / Toll Passages
    if (b.accessTerrainSurchargeNaira > 0) {
      y += 5;
      doc.text('LGA Access, High-Density Logistics & Express Tolls', 18, y);
      doc.text(`NGN ₦${b.accessTerrainSurchargeNaira.toLocaleString()}`, 155, y);
    }

    // Line 4: Packing
    if (b.packingCratingNaira > 0) {
      y += 5;
      doc.text('White-Glove Multi-Layer Packing & Wood Crating', 18, y);
      doc.text(`NGN ₦${b.packingCratingNaira.toLocaleString()}`, 155, y);
    }

    // Line 5: Storage
    if (b.storageAllotmentNaira > 0) {
      y += 5;
      doc.text('30-Day Climate-Controlled Security Warehousing', 18, y);
      doc.text(`NGN ₦${b.storageAllotmentNaira.toLocaleString()}`, 155, y);
    }

    // Line 6: Insurance
    if (b.insuranceCoverNaira > 0) {
      y += 5;
      const insText = b.insuranceTier === 'premium'
        ? 'GIT Premium VIP Cover (₦75M Cap, Zero Deductible)'
        : 'GIT Standard All-Risk Cover (₦25M Cap, Leadway/AIICO)';
      doc.text(insText, 18, y);
      doc.text(`NGN ₦${b.insuranceCoverNaira.toLocaleString()}`, 155, y);
    } else {
      y += 5;
      doc.text('GIT Basic Carrier Cover (₦1,000/kg Weight Basis)', 18, y);
      doc.text('Included (₦0)', 155, y);
    }

    // Line 7: Staircase Surcharge
    if (b.staircaseSurchargeNaira > 0) {
      y += 5;
      doc.text(`Staircase Surcharge (${b.floorLevel} Fl, No Elevator @ ₦15k/fl)`, 18, y);
      doc.text(`NGN ₦${b.staircaseSurchargeNaira.toLocaleString()}`, 155, y);
    }

    // Line 8: AC Removal & Re-installation
    if (b.acInstallationNaira > 0) {
      y += 5;
      doc.text(`AC Removal & Re-installation (${b.acUnitsCount} Units @ ₦20k)`, 18, y);
      doc.text(`NGN ₦${b.acInstallationNaira.toLocaleString()}`, 155, y);
    }

    // Line 9: TV Dismantling/Mounting
    if (b.tvMountingNaira > 0) {
      y += 5;
      doc.text(`Wall TV Dismantling/Mounting (${b.tvMountCount} Units @ ₦10k)`, 18, y);
      doc.text(`NGN ₦${b.tvMountingNaira.toLocaleString()}`, 155, y);
    }

    // Line 10: Deep Cleaning
    if (b.cleaningFeeNaira > 0) {
      y += 5;
      doc.text('Post-Move Deep Cleaning & Debris Removal (Base Fee)', 18, y);
      doc.text(`NGN ₦${b.cleaningFeeNaira.toLocaleString()}`, 155, y);
    }

    y += 8;

    // Total Price Box
    doc.setFillColor(254, 243, 199);
    doc.rect(15, y, 180, 18, 'F');
    doc.setDrawColor(245, 158, 11);
    doc.rect(15, y, 180, 18, 'S');

    doc.setTextColor(180, 83, 9);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('TOTAL COMPREHENSIVE ESTIMATED QUOTATION:', 20, y + 6);

    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    const nairaStr = `NGN ₦${b.totalEstimatedNaira.toLocaleString()}`;
    const usdStr = `(approx. $${b.totalEstimatedUsd.toLocaleString()} USD)`;
    doc.text(`${nairaStr}   ${usdStr}`, 20, y + 13);

    y += 24;

    // MANDATORY INSPECTION & PRICING NOTICE BOX
    doc.setFillColor(255, 251, 235);
    doc.rect(15, y, 180, 16, 'F');
    doc.setDrawColor(217, 119, 6);
    doc.rect(15, y, 180, 16, 'S');

    doc.setTextColor(180, 83, 9);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('OFFICIAL INSPECTION & PRICING POLICY:', 20, y + 5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    const splitPolicy = doc.splitTextToSize(inspectionNotice, 170);
    doc.text(splitPolicy, 20, y + 10.5);

    y += 19;

    // FIXED-PRICE GUARANTEE BOX IN PDF
    doc.setFillColor(254, 243, 199);
    doc.rect(15, y, 180, 14, 'F');
    doc.setDrawColor(245, 158, 11);
    doc.rect(15, y, 180, 14, 'S');

    doc.setTextColor(180, 83, 9);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('FIXED-PRICE GUARANTEE:', 20, y + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(15, 23, 42);
    const guaranteeNotice = 'Due to recent fuel price changes, all instant estimates cover end-to-end transit, Goods-in-Transit insurance, and gate clearance fees. Your quoted price on booking will not change on move day.';
    const splitGuarantee = doc.splitTextToSize(guaranteeNotice, 170);
    doc.text(splitGuarantee, 20, y + 9);

    y += 18;

    // Footer / Terms
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('PYDA MOVERS & LOGISTICS LTD - NIGERIA OPERATIONS', 15, y);

    y += 3.5;
    doc.setFont('helvetica', 'normal');
    doc.text('Abuja HQ: Suite A204, AA Rano Citygate Plaza, Airport Road | Lagos Hub: 374/376 Old Ojo Rd, Alakija', 15, y);
    y += 3.5;
    doc.text('Dispatch Hotline: +234 806 246 6212 | Secondary: +234 802 560 9972 | Email: quotes@pydamovers.com', 15, y);

    doc.save(`Pyda_Movers_Quote_Summary_${refId}.pdf`);
  };

  const handleDownloadPdf = () => {
    handleDownloadSummary('pdf');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl relative">
        
        {/* Header */}
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur z-20 px-5 sm:px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500 text-slate-950 shadow-md">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-white text-base sm:text-lg">Nigeria Relocation & Freight Rate Estimator</h3>
                <span className="hidden sm:inline-block px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-black rounded-full uppercase">
                  36 States + 774 LGAs
                </span>
              </div>
              <p className="text-xs text-slate-400">Comprehensive distance, LGA terrain & logistics rate engine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6">
          {/* NOTICEABLE FIXED-PRICE GUARANTEE TRUST BANNER */}
          <TrustFixedPriceBanner className="mb-5" />

          {/* LocalStorage Draft Restored Alert */}
          {showRestoredNotice && !submittedQuote && (
            <div className="mb-5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-xs animate-in fade-in">
              <div className="flex items-center gap-2 text-amber-300">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <span className="font-bold text-white">Draft Restored:</span>
                  <span className="text-amber-200/90 ml-1">
                    Your previous move coordinates and selections have been restored.
                  </span>
                  {lastSavedTimestamp && (
                    <span className="block text-[10px] text-slate-400 mt-0.5">
                      Last saved: {new Date(lastSavedTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleResetDraft}
                  className="px-2.5 py-1 text-[11px] font-bold text-slate-300 hover:text-amber-400 bg-slate-950 border border-slate-800 hover:border-amber-500/40 rounded-lg flex items-center gap-1 transition-colors"
                  title="Clear saved draft from LocalStorage and start fresh"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowRestoredNotice(false)}
                  className="text-slate-400 hover:text-white p-1"
                  aria-label="Dismiss notice"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {submittedQuote ? (
            /* Submission Confirmation Card */
            <div className="text-center py-6 space-y-5 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-500/40 shadow-lg">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3.5 py-1 rounded-full border border-amber-500/20">
                  Comprehensive Quote Logged & Confirmation Dispatched
                </span>
                <h4 className="text-2xl font-black text-white mt-2.5">Reference #{submittedQuote.id}</h4>
                <p className="text-slate-300 text-sm max-w-lg mx-auto mt-2 leading-relaxed">
                  Thank you <strong className="text-white">{submittedQuote.fullName}</strong>. Our senior logistics dispatch coordinator has received your relocation plan and will call you at <strong className="text-amber-400">{submittedQuote.phone}</strong>.
                </p>
                {submittedQuote.email && (
                  <div className="mt-3 inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs px-4 py-1.5 rounded-full shadow">
                    <Mail className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Itemized PDF quotation copy sent to <strong className="text-white">{submittedQuote.email}</strong></span>
                  </div>
                )}
              </div>

              {/* Estimate Breakdown Card */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 text-left max-w-xl mx-auto space-y-3.5 text-xs shadow-xl">
                <div className="flex justify-between border-b border-slate-800 pb-2.5">
                  <span className="text-slate-400 font-semibold">Service Type:</span>
                  <span className="font-bold text-amber-400 uppercase">{submittedQuote.serviceType} Relocation</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2.5">
                  <span className="text-slate-400 font-semibold">Pick-up Origin LGA:</span>
                  <span className="font-bold text-white text-right max-w-[65%] truncate">
                    {submittedQuote.originLga || ''}, {submittedQuote.originState || submittedQuote.originCity}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2.5">
                  <span className="text-slate-400 font-semibold">Drop-off Destination LGA:</span>
                  <span className="font-bold text-emerald-400 text-right max-w-[65%] truncate">
                    {submittedQuote.destinationLga || ''}, {submittedQuote.destinationState || submittedQuote.destinationCity}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2.5">
                  <span className="text-slate-400 font-semibold">Route & Logistics:</span>
                  <span className="font-bold text-slate-300">
                    ~{submittedQuote.distanceKm || quoteCalculation.distanceKm} km • {quoteCalculation.recommendedVehicle}
                  </span>
                </div>
                <div className="flex justify-between pt-1">
                  <div>
                    <span className="text-slate-300 font-bold block">Comprehensive Estimate:</span>
                    <span className="text-[10px] text-slate-400">Includes LGA terrain, highway tolls & add-ons</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-amber-400 block">
                      ₦{submittedQuote.estimatedCostNaira?.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      (~${Math.round((submittedQuote.estimatedCostNaira || 0) / 1500).toLocaleString()} USD)
                    </span>
                  </div>
                </div>

                {/* Inspection & Final Price Policy Stipulation */}
                <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-3 text-left">
                  <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-slate-300 text-xs leading-relaxed">
                    <strong className="text-amber-300 block font-bold text-xs mb-0.5 uppercase tracking-wide">
                      Inspection & Pricing Notice:
                    </strong>
                    The final price will be determined after inspection by moving inspection personnel from our company or via video/pictures.
                  </div>
                </div>
              </div>

              {/* Automatic Pro-Forma Invoice Generation Banner & Action Hub */}
              {generatedInvoiceDoc && (
                <div className="bg-gradient-to-b from-slate-950 to-slate-900 border-2 border-amber-500/40 rounded-3xl p-5 sm:p-6 text-left max-w-xl mx-auto shadow-2xl space-y-4 relative overflow-hidden ring-1 ring-amber-500/20">
                  <div className="flex items-start justify-between gap-3 border-b border-slate-800/80 pb-3.5">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 shadow-inner">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                            Document Vault • Auto-Generated
                          </span>
                          <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" /> PKI Verified
                          </span>
                        </div>
                        <h5 className="font-extrabold text-white text-base mt-1 flex items-center gap-2">
                          <span>Pro-Forma Commercial Invoice</span>
                          <span className="text-xs font-mono text-amber-400 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                            {generatedInvoiceDoc.referenceNumber}
                          </span>
                        </h5>
                      </div>
                    </div>
                    <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-500/30 whitespace-nowrap shrink-0">
                      Vaulted & Ready
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    An official itemized <strong>Pro-Forma Relocation & Haulage Invoice</strong> has been automatically compiled and saved to your <strong>Document Vault</strong>. It includes formal FIRS VAT compliance (7.5%), Leadway GIT cargo protection, complete line-item pricing, and corporate banking remittance schedules.
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs bg-slate-950/80 p-3.5 rounded-2xl border border-slate-850">
                    <div>
                      <span className="text-slate-400 text-[11px] block">Invoice Subtotal:</span>
                      <span className="text-white font-bold font-mono">
                        ₦{(generatedInvoiceDoc.coverageAmountNaira || 0).toLocaleString('en-NG')}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block">FIRS VAT (7.5%):</span>
                      <span className="text-emerald-400 font-bold font-mono">
                        ₦{Math.round((generatedInvoiceDoc.coverageAmountNaira || 0) * 0.075).toLocaleString('en-NG')}
                      </span>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <span className="text-slate-400 text-[11px] block">Tariff Guarantee:</span>
                      <span className="text-amber-400 font-mono font-bold text-[11px]">
                        30-Day Price Lock
                      </span>
                    </div>
                  </div>

                  {/* Immediate Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsViewingInvoiceModal(true)}
                      className="flex-1 min-w-[140px] bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl border border-slate-700 hover:border-slate-600 flex items-center justify-center gap-2 transition-all active:scale-95 shadow"
                      id="view-proforma-invoice-btn"
                    >
                      <Eye className="w-4 h-4 text-amber-400" />
                      <span>View Pro-Forma Invoice</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => downloadProformaInvoicePdf(generatedInvoiceDoc)}
                      className="flex-1 min-w-[140px] bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-amber-500/20"
                      id="download-proforma-invoice-btn"
                    >
                      <Download className="w-4 h-4 stroke-[2.5]" />
                      <span>Download Invoice (PDF)</span>
                    </button>

                    {onNavigateToVault && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onNavigateToVault(generatedInvoiceDoc.id);
                        }}
                        className="w-full bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-amber-300 font-bold text-xs py-2 px-3 rounded-xl border border-slate-800 hover:border-amber-500/30 flex items-center justify-center gap-1.5 transition-colors"
                        id="open-vault-from-quote-btn"
                      >
                        <FolderLock className="w-3.5 h-3.5 text-amber-400" />
                        <span>Manage in Document Vault</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className="pt-2 flex flex-wrap justify-center gap-3" id="calculator-modal">
                <a
                  href={`https://wa.me/2348062466212?text=${encodeURIComponent(
                    `Hello Pyda Movers! I just generated a relocation quote on your website (Ref #${submittedQuote.id}). Service: ${submittedQuote.serviceType} from ${submittedQuote.originLga || ''}, ${submittedQuote.originState || ''} to ${submittedQuote.destinationLga || ''}, ${submittedQuote.destinationState || ''}. Total Estimate: ₦${submittedQuote.estimatedCostNaira.toLocaleString()}. Please confirm scheduling!`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 transition-transform active:scale-95 shadow-md shadow-emerald-900/40"
                  id="wa-quote-confirmation-btn"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Send Quote to Dispatch on WhatsApp</span>
                </a>
                <button
                  type="button"
                  onClick={() => handleDownloadSummary('pdf')}
                  className="bg-slate-800 hover:bg-slate-750 text-amber-300 hover:text-amber-200 font-extrabold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 border border-amber-500/40 transition-all shadow hover:border-amber-400 active:scale-95"
                  id="download-summary-pdf-btn"
                  title="Download finalized quote estimate details as PDF"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>Download Summary (PDF)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadSummary('print')}
                  className="bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 border border-slate-700 hover:border-slate-600 transition-all shadow active:scale-95"
                  id="print-summary-btn"
                  title="Browser-native print / Save as PDF"
                >
                  <Printer className="w-4 h-4 text-slate-400" />
                  <span>Print Summary</span>
                </button>
                <a
                  href={`tel:${COMPANY_INFO.phones[0]}`}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 transition-transform active:scale-95 shadow-md"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Dispatch {COMPANY_INFO.phones[0]}</span>
                </a>
                <button
                  onClick={onClose}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs px-5 py-2.5 rounded-xl"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Form Wizard */
            <form onSubmit={handleSubmitQuote} className="space-y-5">
              
              {step === 1 ? (
                /* Step 1: Logistics Specs with Nigerian State & LGA Integration */
                <div className="space-y-4 text-xs">
                  
                  {/* Service Type Selection */}
                  <div>
                    <label className="block font-bold text-slate-300 mb-2 uppercase tracking-wider">
                      Service Type Required
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'corporate', label: 'Corporate Office' },
                        { id: 'commercial', label: 'Commercial' },
                        { id: 'residential', label: 'Home Relocation' },
                        { id: 'haulage', label: 'Heavy Haulage' },
                      ].map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setServiceType(s.id as ServiceType)}
                          className={`p-2.5 rounded-xl border font-bold text-xs transition-all ${
                            serviceType === s.id
                              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md scale-[1.01]'
                              : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-850'
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* TRANSIT ROUTE CLASSIFICATION: INTRA-STATE VS INTER-STATE SELECTOR */}
                  <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                        <Route className="w-3.5 h-3.5 text-amber-400" />
                        <span>1. Route Transit Classification</span>
                      </label>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {transitMode === 'intra' ? 'Local Metro Relocation' : 'Nationwide Highway Transit'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {/* Intra-State Option */}
                      <button
                        type="button"
                        onClick={() => handleTransitModeChange('intra')}
                        className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 ${
                          transitMode === 'intra'
                            ? 'bg-amber-500/15 border-amber-500 text-white shadow-lg ring-1 ring-amber-500/30'
                            : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-850 hover:text-white'
                        }`}
                        id="transit-mode-intra-btn"
                      >
                        <div className={`p-2 rounded-lg shrink-0 ${
                          transitMode === 'intra' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                        }`}>
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-extrabold text-xs text-white">
                              Intra-State Move
                            </span>
                            {transitMode === 'intra' && (
                              <span className="bg-amber-500 text-slate-950 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                            Within same state / city (e.g. Ikeja ➔ Lekki, AMAC ➔ Kubwa).
                          </p>
                          <span className="inline-block mt-1 text-[10px] text-amber-400 font-semibold">
                            ⚡ Same-Day Turnaround • Local City Rates
                          </span>
                        </div>
                      </button>

                      {/* Inter-State Option */}
                      <button
                        type="button"
                        onClick={() => handleTransitModeChange('inter')}
                        className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 ${
                          transitMode === 'inter'
                            ? 'bg-amber-500/15 border-amber-500 text-white shadow-lg ring-1 ring-amber-500/30'
                            : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-850 hover:text-white'
                        }`}
                        id="transit-mode-inter-btn"
                      >
                        <div className={`p-2 rounded-lg shrink-0 ${
                          transitMode === 'inter' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                        }`}>
                          <Truck className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-extrabold text-xs text-white">
                              Inter-State Move
                            </span>
                            {transitMode === 'inter' && (
                              <span className="bg-amber-500 text-slate-950 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                            State-to-state nationwide transit (e.g. Lagos ➔ Abuja, PH ➔ Kano).
                          </p>
                          <span className="inline-block mt-1 text-[10px] text-amber-400 font-semibold">
                            🛡️ Interstate GIT Cover • Highway GPS Escort
                          </span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Popular Corridor Quick Presets */}
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5 text-amber-400" />
                        Popular {transitMode === 'intra' ? 'Intra-State' : 'Inter-State'} Corridors
                      </span>
                      <span className="text-[10px] text-slate-400">Click to autofill route</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {transitMode === 'intra' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => applyPreset('lagos', 'Ikeja (GRA, Alausa, Ikeja City Mall, Maryland, Allen)', 'lagos', 'Eti-Osa (Ikoyi, Victoria Island, Lekki Phase 1, Ajah, Chevron)', 'intra')}
                            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-amber-500/20 hover:text-amber-300 border border-slate-800 text-[11px] text-slate-300 transition-colors flex items-center gap-1"
                          >
                            <Building2 className="w-3 h-3 text-amber-400" />
                            <span>Lagos: Ikeja GRA ➔ Lekki / VI</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => applyPreset('lagos', 'Ikeja (GRA, Alausa, Ikeja City Mall, Maryland, Allen)', 'lagos', 'Surulere (Bode Thomas, Adeniran Ogunsanya, Ojuelegba, Aguda)', 'intra')}
                            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-amber-500/20 hover:text-amber-300 border border-slate-800 text-[11px] text-slate-300 transition-colors flex items-center gap-1"
                          >
                            <Building2 className="w-3 h-3 text-amber-400" />
                            <span>Lagos: Ikeja ➔ Surulere</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => applyPreset('fct', 'Abuja Municipal (AMAC - Central, Maitama, Wuse, Garki, Asokoro, Jabi, Utako, Guzape)', 'fct', 'Bwari (Kubwa, Bwari, Dutse, Ushafa, Dawaki, Mpape)', 'intra')}
                            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-amber-500/20 hover:text-amber-300 border border-slate-800 text-[11px] text-slate-300 transition-colors flex items-center gap-1"
                          >
                            <Building2 className="w-3 h-3 text-amber-400" />
                            <span>Abuja: AMAC (Maitama) ➔ Kubwa</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => applyPreset('rivers', 'Port Harcourt City (Old GRA, Town, Diobu, D-Line)', 'rivers', 'Obio/Akpor (Trans-Amadi, Rumuokoro, GRA Phase 1-3, Rumuola)', 'intra')}
                            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-amber-500/20 hover:text-amber-300 border border-slate-800 text-[11px] text-slate-300 transition-colors flex items-center gap-1"
                          >
                            <Building2 className="w-3 h-3 text-amber-400" />
                            <span>Rivers: Old GRA ➔ Trans-Amadi</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => applyPreset('lagos', 'Eti-Osa (Ikoyi, Victoria Island, Lekki Phase 1, Ajah, Chevron)', 'fct', 'Abuja Municipal (AMAC - Central, Maitama, Wuse, Garki, Asokoro, Jabi, Utako, Guzape)', 'inter')}
                            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-amber-500/20 hover:text-amber-300 border border-slate-800 text-[11px] text-slate-300 transition-colors flex items-center gap-1"
                          >
                            <Truck className="w-3 h-3 text-amber-400" />
                            <span>Lagos (Eti-Osa) ➔ Abuja (AMAC)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => applyPreset('fct', 'Abuja Municipal (AMAC - Central, Maitama, Wuse, Garki, Asokoro, Jabi, Utako, Guzape)', 'lagos', 'Ikeja (GRA, Alausa, Ikeja City Mall, Maryland, Allen)', 'inter')}
                            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-amber-500/20 hover:text-amber-300 border border-slate-800 text-[11px] text-slate-300 transition-colors flex items-center gap-1"
                          >
                            <Truck className="w-3 h-3 text-amber-400" />
                            <span>Abuja (AMAC) ➔ Lagos (Ikeja)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => applyPreset('rivers', 'Obio/Akpor (Trans-Amadi, Rumuokoro, GRA Phase 1-3, Rumuola)', 'fct', 'Abuja Municipal (AMAC - Central, Maitama, Wuse, Garki, Asokoro, Jabi, Utako, Guzape)', 'inter')}
                            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-amber-500/20 hover:text-amber-300 border border-slate-800 text-[11px] text-slate-300 transition-colors flex items-center gap-1"
                          >
                            <Truck className="w-3 h-3 text-amber-400" />
                            <span>Port Harcourt ➔ Abuja</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => applyPreset('kano', 'Nassarawa (Bompai Industrial Area, Kano GRA)', 'lagos', 'Apapa (Port Wharf, Commercial Marine Hub)', 'inter')}
                            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-amber-500/20 hover:text-amber-300 border border-slate-800 text-[11px] text-slate-300 transition-colors flex items-center gap-1"
                          >
                            <Truck className="w-3 h-3 text-amber-400" />
                            <span>Kano ➔ Lagos (Apapa Port)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => applyPreset('oyo', 'Ibadan North (Bodija, Agodi GRA, Secretariat)', 'fct', 'Abuja Municipal (AMAC - Central, Maitama, Wuse, Garki, Asokoro, Jabi, Utako, Guzape)', 'inter')}
                            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-amber-500/20 hover:text-amber-300 border border-slate-800 text-[11px] text-slate-300 transition-colors flex items-center gap-1"
                          >
                            <Truck className="w-3 h-3 text-amber-400" />
                            <span>Ibadan ➔ Abuja</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* ORIGIN & DESTINATION WITH NIGERIAN STATES & LOCAL GOVERNMENT AREAS */}
                  <div className="grid md:grid-cols-2 gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800 relative">
                    
                    {/* Swap Button (Only enabled or meaningful for Inter-State, or swaps LGAs in Intra-State) */}
                    <button
                      type="button"
                      onClick={handleSwapLocations}
                      title="Swap Origin and Destination Locations"
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-amber-500 text-slate-950 border-2 border-slate-900 shadow-md hover:scale-110 active:scale-95 transition-all"
                      id="swap-locations-btn"
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5" />
                    </button>

                    {/* ORIGIN STATE & LGA */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-amber-400" />
                          <span>Pick-Up Origin (Nigeria)</span>
                        </span>
                        
                        {/* Interactive Location Selector Icon Button for Origin */}
                        <button
                          type="button"
                          onClick={() => setLocationSelectorTarget('origin')}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-bold text-[11px] flex items-center gap-1.5 transition-all shadow-sm group"
                          title="Open Interactive Nigerian Location & Hub Directory"
                          id="open-origin-location-selector-btn"
                        >
                          <MapPin className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                          <span>Location Selector</span>
                        </button>
                      </div>

                      {/* State Select with Hub Directory Icon */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[11px] text-slate-300 font-bold">
                            Origin State
                          </label>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {currentOriginState.zone}
                          </span>
                        </div>
                        <div className="relative">
                          <select
                            value={originStateId}
                            onChange={(e) => handleOriginStateChange(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 pr-9 text-white font-medium focus:ring-2 focus:ring-amber-400 focus:outline-none text-xs"
                            id="origin-state-select"
                          >
                            {NIGERIAN_STATES_DATA.map((st) => (
                              <option key={`orig-st-${st.id}`} value={st.id}>
                                {st.name} ({st.capital})
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => setLocationSelectorTarget('origin')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-400 p-1"
                            title="Open Location Selector"
                          >
                            <Search className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* LGA Select */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[11px] text-slate-300 font-bold">
                            Pick-Up LGA or District
                          </label>
                          <span className="text-[10px] text-amber-400 font-mono">
                            {currentOriginState.lgas.length} LGAs
                          </span>
                        </div>
                        <div className="relative">
                          <select
                            value={originLgaName}
                            onChange={(e) => setOriginLgaName(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 pr-9 text-white font-medium focus:ring-2 focus:ring-amber-400 focus:outline-none text-xs"
                            id="origin-lga-select"
                          >
                            {currentOriginState.lgas.map((lga) => (
                              <option key={`orig-lga-${lga.name}`} value={lga.name}>
                                {lga.name} {lga.isIslandOrTollArea ? '🏝️ [Island/Toll]' : ''} {lga.isIndustrialZone ? '🏭 [Industrial]' : ''}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => setLocationSelectorTarget('origin')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-400 p-1"
                            title="Browse all LGAs in Location Selector"
                          >
                            <LocateFixed className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* DESTINATION STATE & LGA */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Drop-Off Destination (Nigeria)</span>
                        </span>

                        {/* Interactive Location Selector Icon Button for Destination */}
                        <button
                          type="button"
                          onClick={() => setLocationSelectorTarget('destination')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 font-bold text-[11px] flex items-center gap-1.5 transition-all shadow-sm group"
                          title="Open Interactive Nigerian Location & Hub Directory"
                          id="open-destination-location-selector-btn"
                        >
                          <Navigation className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                          <span>Location Selector</span>
                        </button>
                      </div>

                      {/* State Select / Intra-State Lock indicator */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[11px] text-slate-300 font-bold">
                            Destination State
                          </label>
                          {transitMode === 'intra' ? (
                            <span className="text-[10px] text-blue-300 font-bold bg-blue-500/15 border border-blue-500/30 px-2 py-0.5 rounded">
                              🔒 Same State (Intra-Move)
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-mono">
                              {currentDestinationState.zone}
                            </span>
                          )}
                        </div>

                        {transitMode === 'intra' ? (
                          <div className="flex items-center justify-between p-2.5 bg-slate-900 border border-blue-500/30 rounded-xl text-xs text-white">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-blue-400 shrink-0" />
                              <span className="font-bold">{currentOriginState.name}</span>
                              <span className="text-slate-400 text-[11px]">({currentOriginState.capital})</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleTransitModeChange('inter')}
                              className="text-[10px] text-amber-400 hover:text-amber-300 font-bold underline"
                              title="Switch to inter-state to pick a different destination state"
                            >
                              Moving out of state?
                            </button>
                          </div>
                        ) : (
                          <div className="relative">
                            <select
                              value={destinationStateId}
                              onChange={(e) => handleDestinationStateChange(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 pr-9 text-white font-medium focus:ring-2 focus:ring-amber-400 focus:outline-none text-xs"
                              id="destination-state-select"
                            >
                              {NIGERIAN_STATES_DATA.map((st) => (
                                <option key={`dest-st-${st.id}`} value={st.id}>
                                  {st.name} ({st.capital})
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => setLocationSelectorTarget('destination')}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-400 p-1"
                              title="Open Location Selector"
                            >
                              <Search className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* LGA Select */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[11px] text-slate-300 font-bold">
                            Drop-Off LGA or District
                          </label>
                          <span className="text-[10px] text-emerald-400 font-mono">
                            {currentDestinationState.lgas.length} LGAs
                          </span>
                        </div>
                        <div className="relative">
                          <select
                            value={destinationLgaName}
                            onChange={(e) => setDestinationLgaName(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 pr-9 text-white font-medium focus:ring-2 focus:ring-amber-400 focus:outline-none text-xs"
                            id="destination-lga-select"
                          >
                            {currentDestinationState.lgas.map((lga) => (
                              <option key={`dest-lga-${lga.name}`} value={lga.name}>
                                {lga.name} {lga.isIslandOrTollArea ? '🏝️ [Island/Toll]' : ''} {lga.isIndustrialZone ? '🏭 [Industrial]' : ''}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => setLocationSelectorTarget('destination')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-400 p-1"
                            title="Browse all LGAs in Location Selector"
                          >
                            <LocateFixed className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* ROUTE DYNAMICS BANNER */}
                  <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl shrink-0 ${
                        transitMode === 'intra' ? 'bg-blue-500/15 text-blue-400' : 'bg-amber-500/15 text-amber-400'
                      }`}>
                        {transitMode === 'intra' ? <Building2 className="w-5 h-5" /> : <Truck className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-white font-black text-xs sm:text-sm">
                            {quoteCalculation.originLgaName.split('(')[0].trim()} ➔ {quoteCalculation.destinationLgaName.split('(')[0].trim()}
                          </p>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                            transitMode === 'intra' ? 'bg-blue-500/20 text-blue-300' : 'bg-amber-500/20 text-amber-300'
                          }`}>
                            {transitMode === 'intra' ? 'Intra-State Move' : 'Inter-State Transit'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Calculated route distance: <span className="text-white font-mono font-bold">~{quoteCalculation.distanceKm} km</span> • Estimated transit duration: <span className="text-amber-300 font-bold">{quoteCalculation.estimatedTransitHours}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                        quoteCalculation.routeTier === 'Intra-LGA Direct'
                          ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                          : quoteCalculation.routeTier === 'Intra-State Hub-to-Hub'
                          ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                          : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      }`}>
                        {quoteCalculation.routeTier}
                      </span>
                    </div>
                  </div>

                  {/* GOOGLE AI STUDIO SMART CARGO SCAN INTEGRATION CARD */}
                  <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-amber-500/35 rounded-2xl p-3.5 space-y-2.5 shadow-xl">
                    <div className="flex items-center justify-between flex-wrap gap-2.5">
                      <div className="flex items-center gap-2.5">
                        <span className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-emerald-500/20 text-amber-400 border border-amber-500/30">
                          <Sparkles className="w-4 h-4 animate-pulse" />
                        </span>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-black text-white">
                              Google AI Studio Smart Cargo Scan
                            </span>
                            <span className="text-[9px] uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                              Gemini 3.8 Flash
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400">
                            Eliminate manual inventory guesswork with multimodal camera volume & fragility scanning
                          </p>
                        </div>
                      </div>

                      {savedInspection ? (
                        <div className="flex items-center gap-2">
                          {isInspectionApplied ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>AI Studio Manifest Applied ({savedInspection.totalCbm} CBM)</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={handleApplyGoogleAiStudioManifest}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#fed700] via-amber-400 to-[#83b735] text-slate-950 font-black text-xs shadow-md hover:opacity-95 active:scale-95 transition-all cursor-pointer"
                            >
                              <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                              <span>Auto-Fill from AI Survey ({savedInspection.totalCbm} CBM)</span>
                            </button>
                          )}
                        </div>
                      ) : (
                        onOpenInspection && (
                          <button
                            type="button"
                            onClick={onOpenInspection}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-950 to-slate-900 hover:from-emerald-900 hover:to-slate-800 border border-emerald-600/50 text-emerald-300 hover:text-white text-xs font-bold shadow active:scale-95 transition-all cursor-pointer"
                          >
                            <Camera className="w-3.5 h-3.5 text-amber-400" />
                            <span>Launch Google AI Studio Scanner</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )
                      )}
                    </div>

                    {isInspectionApplied && savedInspection && (
                      <div className="bg-slate-950/80 rounded-xl p-2.5 border border-emerald-500/30 flex items-center justify-between text-[11px] text-slate-300">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="truncate">
                            Certified <strong>{savedInspection.totalItemsCount} items</strong> ({savedInspection.fragileItemsCount} fragile) • Calculated <strong>{savedInspection.totalCbm} CBM</strong>
                          </span>
                        </div>
                        <span className="text-[10px] text-amber-400 font-mono shrink-0">
                          99.4% AI Precision
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Property / Load Size & Moving Date Grid */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Property Size / Freight Volume</label>
                      <select
                        value={propertySize}
                        onChange={(e) => setPropertySize(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-medium focus:ring-2 focus:ring-amber-400 focus:outline-none"
                        id="property-size-select"
                      >
                        <option value="1-Bedroom Apartment Move">1-Bedroom Apartment Move (Lagos: ₦150k | Abuja: ₦120k)</option>
                        <option value="2-Bedroom Apartment Move">2-Bedroom Apartment Move (Lagos: ₦280k | Abuja: ₦220k)</option>
                        <option value="3-4 Bedroom / Duplex Move">3-4 Bedroom / Duplex Move (Lagos: ₦450k | Abuja: ₦380k)</option>
                        <option value="3-Ton Covered Box Truck">3-Ton Covered Box Truck (Interstate Base: ₦650k)</option>
                        <option value="5-Ton Covered Box Truck">5-Ton Covered Box Truck (Interstate Base: ₦1.1m)</option>
                        <option value="Studio / Mini-Flat Move (under 100 sqm)">Studio / Mini-Flat Move (under 100 sqm)</option>
                        <option value="Small Office (1 - 15 Workstations)">Small Office (1 - 15 Workstations)</option>
                        <option value="Medium Office (20 - 50 Workstations)">Medium Office (20 - 50 Workstations)</option>
                        <option value="Corporate HQ / Bank Move (100+ Workstations)">Corporate HQ / Bank Move (100+ Workstations)</option>
                        <option value="10-Ton Heavy Freight Truck">10-Ton Heavy Freight Truck</option>
                        <option value="30-Ton Heavy Haulage / 40ft Container">30-Ton Heavy Haulage / 40ft Container</option>
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block font-bold text-slate-300">Target Moving Date *</label>
                        {touched.movingDate && dateValidation.isValid && (
                          <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                            <CheckCircle2 className="w-3 h-3" /> Valid Date
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type="date"
                          min={new Date().toISOString().split('T')[0]}
                          value={movingDate}
                          onBlur={() => markTouched('movingDate')}
                          onChange={(e) => {
                            setMovingDate(e.target.value);
                            markTouched('movingDate');
                          }}
                          className={`w-full bg-slate-950 border rounded-xl p-2.5 text-white font-medium focus:outline-none transition-colors ${
                            touched.movingDate && !dateValidation.isValid
                              ? 'border-rose-500 focus:ring-2 focus:ring-rose-400'
                              : touched.movingDate && dateValidation.isValid
                              ? 'border-emerald-500/80 focus:ring-2 focus:ring-emerald-400'
                              : 'border-slate-700 focus:ring-2 focus:ring-amber-400'
                          }`}
                        />
                      </div>
                      {touched.movingDate && !dateValidation.isValid && (
                        <p className="text-[11px] text-rose-400 font-medium flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>{dateValidation.error}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Building Floor Level & Service Elevator (Staircase Surcharge Rule) */}
                  <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-amber-400" />
                        <span>Building Floor Level & Elevator Access</span>
                      </label>
                      <span className="text-[10px] text-amber-300 font-mono">
                        {floorLevel === 0
                          ? 'Ground Floor (₦0)'
                          : hasElevator
                          ? 'Elevator Verified (₦0 Surcharge)'
                          : `+₦${(floorLevel * 15000).toLocaleString()} Staircase Surcharge`}
                      </span>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">
                          Property Floor Level (Carry Origin)
                        </label>
                        <select
                          value={floorLevel}
                          onChange={(e) => setFloorLevel(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white font-medium focus:ring-2 focus:ring-amber-400 focus:outline-none"
                          id="floor-level-select"
                        >
                          <option value={0}>Ground Floor (Level 0 - Direct Roll-Out)</option>
                          <option value={1}>1st Floor (1 Level Above Ground)</option>
                          <option value={2}>2nd Floor (2 Levels Above Ground)</option>
                          <option value={3}>3rd Floor (3 Levels Above Ground)</option>
                          <option value={4}>4th Floor (4 Levels Above Ground)</option>
                          <option value={5}>5th Floor (5 Levels Above Ground)</option>
                          <option value={6}>6th+ Floor (Multi-Story Penthouse / High-Rise)</option>
                        </select>
                      </div>

                      <div className="flex flex-col justify-end">
                        <label className="flex items-center gap-2.5 p-2.5 bg-slate-900 rounded-xl border border-slate-700 cursor-pointer hover:border-slate-600 transition-colors">
                          <input
                            type="checkbox"
                            checked={hasElevator}
                            onChange={(e) => setHasElevator(e.target.checked)}
                            className="rounded text-amber-500 focus:ring-amber-400"
                            id="has-elevator-checkbox"
                          />
                          <div>
                            <span className="text-white block font-bold text-xs">Functioning Service Elevator Available</span>
                            <span className="text-[10px] text-slate-400 block">
                              {hasElevator
                                ? 'Elevator verified: Staircase carry surcharge waived (₦0)'
                                : 'No elevator: ₦15,000 auto-added per floor above ground'}
                            </span>
                          </div>
                        </label>
                      </div>
                    </div>

                    {!hasElevator && floorLevel > 0 && (
                      <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between text-xs text-amber-300">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>Staircase carry for {floorLevel} floor{floorLevel > 1 ? 's' : ''} without elevator (@ ₦15,000/floor):</span>
                        </span>
                        <span className="font-mono font-bold text-amber-400 text-sm">
                          +₦{(floorLevel * 15000).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Add-On Optional Items (AC, TV, Deep Cleaning) */}
                  <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Optional Technical & Debris Add-Ons</span>
                      </label>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Fixed Tariff Rates
                      </span>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-2.5">
                      {/* 1. AC Removal & Re-installation: ₦20,000 per unit */}
                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex flex-col justify-between gap-2.5 hover:border-slate-700 transition-colors">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-white font-bold text-xs flex items-center gap-1">
                              <Wind className="w-3.5 h-3.5 text-amber-400" />
                              <span>AC De-mount & Install</span>
                            </span>
                            <span className="text-[10px] font-mono text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                              ₦20,000 / unit
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-1 leading-snug">
                            Gas pump-down, outdoor bracket unbolting & pipe connection.
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                          <span className="text-[10px] text-slate-400">Quantity:</span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setAcUnitsCount(Math.max(0, acUnitsCount - 1))}
                              className="w-6 h-6 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white font-bold flex items-center justify-center text-xs active:scale-95"
                              disabled={acUnitsCount <= 0}
                            >
                              -
                            </button>
                            <span className="font-mono font-bold text-xs text-amber-400 min-w-[16px] text-center">
                              {acUnitsCount}
                            </span>
                            <button
                              type="button"
                              onClick={() => setAcUnitsCount(acUnitsCount + 1)}
                              className="w-6 h-6 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white font-bold flex items-center justify-center text-xs active:scale-95"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* 2. Wall Mounted TV Dismantling/Mounting: ₦10,000 per unit */}
                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex flex-col justify-between gap-2.5 hover:border-slate-700 transition-colors">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-white font-bold text-xs flex items-center gap-1">
                              <Tv className="w-3.5 h-3.5 text-amber-400" />
                              <span>Wall TV Mounting</span>
                            </span>
                            <span className="text-[10px] font-mono text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                              ₦10,000 / unit
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-1 leading-snug">
                            Precision bracket removal, screen cushioning & wall drilling/re-mount.
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                          <span className="text-[10px] text-slate-400">Quantity:</span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setTvMountCount(Math.max(0, tvMountCount - 1))}
                              className="w-6 h-6 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white font-bold flex items-center justify-center text-xs active:scale-95"
                              disabled={tvMountCount <= 0}
                            >
                              -
                            </button>
                            <span className="font-mono font-bold text-xs text-amber-400 min-w-[16px] text-center">
                              {tvMountCount}
                            </span>
                            <button
                              type="button"
                              onClick={() => setTvMountCount(tvMountCount + 1)}
                              className="w-6 h-6 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white font-bold flex items-center justify-center text-xs active:scale-95"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* 3. Post-Move Deep Cleaning & Debris Removal: ₦45,000 base fee */}
                      <label className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex flex-col justify-between gap-2.5 hover:border-slate-700 cursor-pointer transition-colors">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-white font-bold text-xs flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                              <span>Deep Cleaning & Debris</span>
                            </span>
                            <span className="text-[10px] font-mono text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                              ₦45,000 flat
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-1 leading-snug">
                            Floor scrubbing, sanitization, packaging box disposal & hauling debris away.
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                          <span className="text-[10px] text-slate-400">Include Option:</span>
                          <input
                            type="checkbox"
                            checked={needsCleaning}
                            onChange={(e) => setNeedsCleaning(e.target.checked)}
                            className="rounded text-amber-500 focus:ring-amber-400"
                            id="needs-cleaning-checkbox"
                          />
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Standard Logistics Addons: Packing & Storage */}
                  <div>
                    <label className="block font-bold text-slate-300 mb-2 uppercase tracking-wider text-[11px]">
                      Packing & Storage Handling
                    </label>
                    <div className="grid sm:grid-cols-2 gap-2.5">
                      <label className="flex items-start gap-2.5 p-3 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                        <input
                          type="checkbox"
                          checked={needsPacking}
                          onChange={(e) => setNeedsPacking(e.target.checked)}
                          className="mt-0.5 rounded text-amber-500 focus:ring-amber-400"
                        />
                        <div>
                          <span className="text-slate-200 block font-bold text-xs">Full Packing & Crating</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">Multi-layer bubble wrap, wardrobe boxes & wood crating</span>
                        </div>
                      </label>

                      <label className="flex items-start gap-2.5 p-3 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                        <input
                          type="checkbox"
                          checked={needsStorage}
                          onChange={(e) => setNeedsStorage(e.target.checked)}
                          className="mt-0.5 rounded text-amber-500 focus:ring-amber-400"
                        />
                        <div>
                          <span className="text-slate-200 block font-bold text-xs">Secure Storage Hub</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">30-day climate-controlled warehousing</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* ENHANCED INSURANCE COVERAGE TOGGLE & TIERED PROTECTION (Basic, Standard, Premium) */}
                  <EnhancedInsuranceSection
                    needsInsurance={needsInsurance}
                    insuranceTier={insuranceTier}
                    onToggleEnhanced={(enabled) => setNeedsInsurance(enabled)}
                    onSelectTier={(tier) => {
                      setInsuranceTier(tier);
                      setNeedsInsurance(tier !== 'basic');
                    }}
                    onOpenTerms={() => setShowInsuranceTermsModal(true)}
                  />

                  {/* ITEMIZED COMPREHENSIVE QUOTE BREAKDOWN CARD */}
                  <div className="bg-slate-950 border border-amber-500/40 rounded-2xl p-4 sm:p-5 space-y-3 shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-amber-400" />
                        <span className="font-black text-white text-sm">Comprehensive Price Quote Breakdown</span>
                      </div>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">
                        {quoteCalculation.recommendedVehicle}
                      </span>
                    </div>

                    {/* Breakdown Line Items */}
                    <div className="space-y-1.5 text-[11px] text-slate-300">
                      <div className="flex justify-between">
                        <span className="text-slate-400">1. Base Move & Loading Crew ({quoteCalculation.crewSize} Movers):</span>
                        <span className="font-mono text-white font-bold">₦{quoteCalculation.baseRateNaira.toLocaleString()}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-400">2. Route Distance & Highway Logistics (~{quoteCalculation.distanceKm} km • Petrol @ ₦1,460/L, Diesel @ ₦1,850/L):</span>
                        <span className="font-mono text-white font-bold">
                          {quoteCalculation.distanceChargeNaira > 0 ? `₦${quoteCalculation.distanceChargeNaira.toLocaleString()}` : 'Included in Base'}
                        </span>
                      </div>

                      {quoteCalculation.staircaseSurchargeNaira > 0 && (
                        <div className="flex justify-between text-amber-300">
                          <span>3. Staircase Carry Surcharge ({quoteCalculation.floorLevel} floor{quoteCalculation.floorLevel > 1 ? 's' : ''}, no elevator @ ₦15k/floor):</span>
                          <span className="font-mono font-bold">₦{quoteCalculation.staircaseSurchargeNaira.toLocaleString()}</span>
                        </div>
                      )}

                      {quoteCalculation.acInstallationNaira > 0 && (
                        <div className="flex justify-between text-amber-300">
                          <span>4. Air Conditioner De-Mount & Re-installation ({quoteCalculation.acUnitsCount} unit{quoteCalculation.acUnitsCount > 1 ? 's' : ''} @ ₦20k):</span>
                          <span className="font-mono font-bold">₦{quoteCalculation.acInstallationNaira.toLocaleString()}</span>
                        </div>
                      )}

                      {quoteCalculation.tvMountingNaira > 0 && (
                        <div className="flex justify-between text-amber-300">
                          <span>5. Wall-Mounted TV Dismantling/Mounting ({quoteCalculation.tvMountCount} unit{quoteCalculation.tvMountCount > 1 ? 's' : ''} @ ₦10k):</span>
                          <span className="font-mono font-bold">₦{quoteCalculation.tvMountingNaira.toLocaleString()}</span>
                        </div>
                      )}

                      {quoteCalculation.cleaningFeeNaira > 0 && (
                        <div className="flex justify-between text-amber-300">
                          <span>6. Post-Move Deep Cleaning & Debris Removal (Base Fee):</span>
                          <span className="font-mono font-bold">₦{quoteCalculation.cleaningFeeNaira.toLocaleString()}</span>
                        </div>
                      )}

                      {quoteCalculation.accessTerrainSurchargeNaira > 0 && (
                        <div className="flex justify-between text-amber-300/90">
                          <span>7. LGA Access & Island Bridge Toll Factor:</span>
                          <span className="font-mono font-bold">₦{quoteCalculation.accessTerrainSurchargeNaira.toLocaleString()}</span>
                        </div>
                      )}

                      {quoteCalculation.packingCratingNaira > 0 && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">8. Multi-Layer Packing & Wood Crating:</span>
                          <span className="font-mono text-white font-bold">₦{quoteCalculation.packingCratingNaira.toLocaleString()}</span>
                        </div>
                      )}

                      {quoteCalculation.storageAllotmentNaira > 0 && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">9. 30-Day Climate Warehousing:</span>
                          <span className="font-mono text-white font-bold">₦{quoteCalculation.storageAllotmentNaira.toLocaleString()}</span>
                        </div>
                      )}

                      <div className="flex justify-between items-center text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400">
                            10. Goods-In-Transit Insurance (
                            {quoteCalculation.insuranceTier === 'premium'
                              ? 'Premium VIP ₦75M, ₦0 Ded.'
                              : quoteCalculation.insuranceTier === 'standard'
                              ? 'Standard All-Risk ₦25M'
                              : 'Basic Carrier Liability'}
                            ):
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowInsuranceTermsModal(true)}
                            className="text-[10px] text-amber-400 hover:text-white underline font-bold"
                            title="View Insurance Coverage Terms"
                          >
                            [View Terms]
                          </button>
                        </div>
                        <span className="font-mono text-white font-bold">
                          {quoteCalculation.insuranceCoverNaira > 0
                            ? `₦${quoteCalculation.insuranceCoverNaira.toLocaleString()}`
                            : 'Included (₦0)'}
                        </span>
                      </div>
                    </div>

                    {/* Fixed-Price Guarantee Notice Callout */}
                    <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-2.5 text-xs">
                      <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div className="text-slate-200 leading-relaxed text-[11px]">
                        <strong className="text-amber-300 block font-bold text-xs mb-0.5">
                          Fixed-Price Guarantee:
                        </strong>
                        Due to recent fuel price changes, all instant estimates cover end-to-end transit, Goods-in-Transit insurance, and gate clearance fees. Your quoted price on booking will not change on move day.
                      </div>
                    </div>

                    {/* Official Inspection & Pricing Stipulation */}
                    <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-start gap-2.5 text-xs">
                      <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div className="text-slate-300 leading-relaxed text-[11px]">
                        <strong className="text-amber-300 block font-bold text-xs mb-0.5">
                          Inspection & Pricing Policy:
                        </strong>
                        The final price will be determined after inspection by moving inspection personnel from our company or via video/pictures.
                      </div>
                    </div>

                    {/* Total & Action */}
                    <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">
                          Total Relocation Estimate (All-Inclusive):
                        </span>
                        <div className="flex items-baseline gap-2 mt-0.5">
                          <span className="text-2xl font-black text-amber-400">
                            ₦{quoteCalculation.totalEstimatedNaira.toLocaleString()}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            (~${quoteCalculation.totalEstimatedUsd.toLocaleString()} USD)
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={handleResetDraft}
                          className="text-slate-400 hover:text-slate-200 text-xs px-2.5 py-2 rounded-xl border border-slate-800 hover:bg-slate-800 transition-colors"
                          title="Clear and reset form fields"
                        >
                          <RotateCcw className="w-3.5 h-3.5 inline mr-1" />
                          Reset
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadSummary('pdf')}
                          className="bg-slate-800 hover:bg-slate-750 text-amber-300 hover:text-amber-200 text-xs font-bold px-3 py-2 rounded-xl border border-amber-500/40 flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                          title="Download finalized quote estimate details as PDF"
                          id="download-summary-pdf-step1"
                        >
                          <Download className="w-3.5 h-3.5 text-amber-400" />
                          <span>Download Summary</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadSummary('print')}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium px-2.5 py-2 rounded-xl border border-slate-700 flex items-center gap-1 transition-all active:scale-95"
                          title="Print quote summary or save via browser print"
                          id="print-summary-step1"
                        >
                          <Printer className="w-3.5 h-3.5 text-slate-400" />
                          <span className="hidden sm:inline">Print</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleProceedToStep2}
                          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-md active:scale-95 ml-auto sm:ml-0"
                        >
                          <span>Confirm & Book Survey</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              ) : (
                /* Step 2: Contact Details with Real-Time Validation */
                <div className="space-y-4 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                    <div>
                      <p className="text-amber-400 font-bold">Relocation Route Selected:</p>
                      <p className="text-slate-200 text-xs mt-0.5">
                        {quoteCalculation.originLgaName.split('(')[0].trim()} ({quoteCalculation.originStateName}) ➔ {quoteCalculation.destinationLgaName.split('(')[0].trim()} ({quoteCalculation.destinationStateName})
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {propertySize} • Date: {movingDate} • Total: <strong className="text-amber-300">₦{quoteCalculation.totalEstimatedNaira.toLocaleString()}</strong>
                      </p>
                      <p className="text-[11px] text-slate-300 mt-1 flex items-center gap-1.5 flex-wrap">
                        <span className="text-amber-400 font-bold">Transit Insurance:</span>
                        <span className="font-semibold text-white">
                          {quoteCalculation.insuranceTier === 'premium'
                            ? 'Premium VIP Cover (Up to ₦75M, Zero Deductible)'
                            : quoteCalculation.insuranceTier === 'standard'
                            ? 'Standard All-Risk Cover (Up to ₦25M)'
                            : 'Basic Carrier Liability (₦1,000/kg Weight Basis)'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowInsuranceTermsModal(true)}
                          className="text-[10px] text-amber-400 underline hover:text-white font-medium ml-1"
                        >
                          View Terms
                        </button>
                      </p>
                      {(quoteCalculation.staircaseSurchargeNaira > 0 || quoteCalculation.acInstallationNaira > 0 || quoteCalculation.tvMountingNaira > 0 || quoteCalculation.cleaningFeeNaira > 0) && (
                        <p className="text-[10px] text-amber-300/90 mt-0.5 flex flex-wrap gap-1.5 font-medium">
                          {quoteCalculation.staircaseSurchargeNaira > 0 && <span>• Staircase (+₦{quoteCalculation.staircaseSurchargeNaira.toLocaleString()})</span>}
                          {quoteCalculation.acInstallationNaira > 0 && <span>• {quoteCalculation.acUnitsCount}x AC (+₦{quoteCalculation.acInstallationNaira.toLocaleString()})</span>}
                          {quoteCalculation.tvMountingNaira > 0 && <span>• {quoteCalculation.tvMountCount}x TV (+₦{quoteCalculation.tvMountingNaira.toLocaleString()})</span>}
                          {quoteCalculation.cleaningFeeNaira > 0 && <span>• Deep Cleaning (+₦45,000)</span>}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleDownloadSummary('pdf')}
                        className="bg-slate-900 hover:bg-slate-800 text-amber-300 text-xs font-bold px-2.5 py-1.5 rounded-xl border border-amber-500/40 flex items-center gap-1 transition-colors"
                        title="Download Quote Summary (PDF)"
                        id="download-summary-step2-btn"
                      >
                        <Download className="w-3.5 h-3.5 text-amber-400" />
                        <span>Download Summary</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadSummary('print')}
                        className="bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white p-1.5 rounded-xl border border-slate-800 transition-colors"
                        title="Print Quote Summary"
                        id="print-summary-step2-btn"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="text-xs text-amber-400 underline hover:text-white font-bold px-1"
                      >
                        Edit Route
                      </button>
                    </div>
                  </div>

                  {/* Fixed-Price Guarantee Notice Callout */}
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-2.5 text-xs">
                    <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div className="text-slate-200 leading-relaxed text-[11px]">
                      <strong className="text-amber-300 block font-bold text-xs mb-0.5">
                        Fixed-Price Guarantee:
                      </strong>
                      Due to recent fuel price changes, all instant estimates cover end-to-end transit, Goods-in-Transit insurance, and gate clearance fees. Your quoted price on booking will not change on move day.
                    </div>
                  </div>

                  {/* Inspection Notice Stipulation */}
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-2.5 text-xs">
                    <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div className="text-slate-300 leading-relaxed text-[11px]">
                      <strong className="text-amber-300 block font-bold text-xs mb-0.5">
                        Inspection & Pricing Policy:
                      </strong>
                      The final price will be determined after inspection by moving inspection personnel from our company or via video/pictures.
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl flex items-center gap-2 animate-in fade-in">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                      <span className="font-medium">{errorMsg}</span>
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* Full Contact Name */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block font-bold text-slate-300">Full Contact Name *</label>
                        {touched.fullName && nameValidation.isValid && (
                          <span className="text-[10px] text-emerald-400 flex items-center gap-0.5 font-semibold">
                            <CheckCircle2 className="w-3 h-3" /> Valid
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          placeholder="e.g. Chief Adeleke Johnson"
                          value={fullName}
                          onBlur={() => markTouched('fullName')}
                          onChange={(e) => {
                            setFullName(e.target.value);
                            markTouched('fullName');
                          }}
                          className={`w-full bg-slate-950 border rounded-xl p-2.5 pr-8 text-white font-medium focus:outline-none transition-colors ${
                            touched.fullName && !nameValidation.isValid
                              ? 'border-rose-500 focus:ring-2 focus:ring-rose-400'
                              : touched.fullName && nameValidation.isValid
                              ? 'border-emerald-500/80 focus:ring-2 focus:ring-emerald-400'
                              : 'border-slate-700 focus:ring-2 focus:ring-amber-400'
                          }`}
                        />
                        {touched.fullName && (
                          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                            {nameValidation.isValid ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-rose-400" />
                            )}
                          </div>
                        )}
                      </div>
                      {touched.fullName && !nameValidation.isValid && (
                        <p className="text-[11px] text-rose-400 font-medium flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>{nameValidation.error}</span>
                        </p>
                      )}
                    </div>

                    {/* Phone / WhatsApp */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block font-bold text-slate-300">Phone / WhatsApp Number *</label>
                        {touched.phone && phoneValidation.isValid && (
                          <span className="text-[10px] text-emerald-400 flex items-center gap-0.5 font-semibold">
                            <CheckCircle2 className="w-3 h-3" /> Valid format
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type="tel"
                          required
                          placeholder="e.g. 08062466212 or +234..."
                          value={phone}
                          onBlur={() => markTouched('phone')}
                          onChange={(e) => {
                            setPhone(e.target.value);
                            markTouched('phone');
                          }}
                          className={`w-full bg-slate-950 border rounded-xl p-2.5 pr-8 text-white font-medium focus:outline-none transition-colors ${
                            touched.phone && !phoneValidation.isValid
                              ? 'border-rose-500 focus:ring-2 focus:ring-rose-400'
                              : touched.phone && phoneValidation.isValid
                              ? 'border-emerald-500/80 focus:ring-2 focus:ring-emerald-400'
                              : 'border-slate-700 focus:ring-2 focus:ring-amber-400'
                          }`}
                        />
                        {touched.phone && (
                          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                            {phoneValidation.isValid ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-rose-400" />
                            )}
                          </div>
                        )}
                      </div>
                      {touched.phone && !phoneValidation.isValid ? (
                        <p className="text-[11px] text-rose-400 font-medium flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>{phoneValidation.error}</span>
                        </p>
                      ) : (
                        <p className="text-[10px] text-slate-400 mt-1">Direct contact for coordinator dispatch call</p>
                      )}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* Email Address */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block font-bold text-slate-300">Email Address *</label>
                        {touched.email && emailValidation.isValid && (
                          <span className="text-[10px] text-emerald-400 flex items-center gap-0.5 font-semibold">
                            <CheckCircle2 className="w-3 h-3" /> Valid email
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type="email"
                          required
                          placeholder="e.g. adeleke@company.com"
                          value={email}
                          onBlur={() => markTouched('email')}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            markTouched('email');
                          }}
                          className={`w-full bg-slate-950 border rounded-xl p-2.5 pr-8 text-white font-medium focus:outline-none transition-colors ${
                            touched.email && !emailValidation.isValid
                              ? 'border-rose-500 focus:ring-2 focus:ring-rose-400'
                              : touched.email && emailValidation.isValid
                              ? 'border-emerald-500/80 focus:ring-2 focus:ring-emerald-400'
                              : 'border-slate-700 focus:ring-2 focus:ring-amber-400'
                          }`}
                        />
                        {touched.email && (
                          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                            {emailValidation.isValid ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-rose-400" />
                            )}
                          </div>
                        )}
                      </div>
                      {touched.email && !emailValidation.isValid ? (
                        <p className="text-[11px] text-rose-400 font-medium flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>{emailValidation.error}</span>
                        </p>
                      ) : (
                        <p className="text-[10px] text-slate-400 mt-1">Formal PDF quote copy will be delivered here</p>
                      )}
                    </div>

                    {/* Company Name */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block font-bold text-slate-300">Company / Organization</label>
                        <span className="text-[10px] text-slate-400">Optional</span>
                      </div>
                      <input
                        type="text"
                        placeholder="e.g. Corporate Office / Residential Move"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-medium focus:ring-2 focus:ring-amber-400 focus:outline-none"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">Include company name for corporate invoicing</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-bold text-slate-300">Special Handling Instructions / Notes</label>
                      <span className="text-[10px] text-slate-400">{instructions.length}/500 chars</span>
                    </div>
                    <textarea
                      rows={2}
                      maxLength={500}
                      placeholder="e.g. Fragile IT servers requiring antistatic bubble wrap, 3rd floor office access or gated estate protocols."
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-medium focus:ring-2 focus:ring-amber-400 focus:outline-none"
                    />
                  </div>

                  {/* Attached Site Survey Photos Gallery in Quote Review */}
                  {surveyPhotos.length > 0 && (
                    <div className="bg-slate-950 border border-amber-500/30 rounded-xl p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Camera className="w-4 h-4 text-amber-400" />
                          <span className="text-xs font-bold text-white">
                            Attached Site Survey Photos ({surveyPhotos.length})
                          </span>
                        </div>
                        <span className="text-[10px] text-amber-400 font-mono font-bold">
                          Total ~{surveyPhotos.reduce((sum, p) => sum + (p.estimatedCbm || 1.0), 0).toFixed(1)} CBM
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {surveyPhotos.map((photo) => (
                          <div
                            key={photo.id}
                            className="group relative bg-slate-900 border border-slate-800 rounded-lg overflow-hidden flex flex-col"
                          >
                            <div 
                              className="relative aspect-video bg-black cursor-pointer overflow-hidden"
                              onClick={() => setPreviewingSurveyPhoto(photo)}
                            >
                              <img
                                src={photo.dataUrl}
                                alt={photo.label}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                              <span className="absolute bottom-1 right-1 bg-slate-950/80 p-1 rounded text-white hover:text-amber-400">
                                <Eye className="w-3 h-3" />
                              </span>
                            </div>
                            <div className="p-1.5 flex items-center justify-between text-[10px]">
                              <span className="font-bold text-slate-200 truncate max-w-[80px]" title={photo.label}>
                                {photo.label}
                              </span>
                              <button
                                type="button"
                                onClick={() => setSurveyPhotos(prev => prev.filter(p => p.id !== photo.id))}
                                className="text-slate-500 hover:text-rose-400"
                                title="Remove photo from quote"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Terms and Carrier Disclosures Consent Callout */}
                  <div className="p-3.5 bg-slate-950/90 border border-slate-800 rounded-xl text-xs space-y-1.5">
                    <div className="flex items-start gap-2.5">
                      <Scale className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div className="text-[11px] text-slate-300 leading-relaxed">
                        By submitting this official quote request, you acknowledge that all carriage is governed by{' '}
                        <strong className="text-white">Pyda Movers Standard Trading Conditions</strong>, including Owner-Packed (PBO) zero liability exclusions, statutory carrier’s general lien over unpaid consignments, and the mandatory 48-hour damage notification protocol.{' '}
                        {onOpenTermsModal && (
                          <button
                            type="button"
                            onClick={onOpenTermsModal}
                            className="text-amber-400 font-bold underline hover:text-amber-300 ml-1 inline-flex items-center gap-0.5"
                          >
                            <span>[View Terms & Protective Disclosures]</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="bg-slate-800 text-slate-300 font-bold px-4 py-2.5 rounded-xl hover:bg-slate-700 transition-colors"
                      >
                        Back to Route
                      </button>
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold sm:ml-2">
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Autosaved</span>
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs px-6 py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
                      id="submit-quote-btn"
                    >
                      {isSubmitting ? (
                        <span>Sending Request...</span>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Submit Official Quote Request</span>
                        </>
                      )}
                    </button>
                  </div>

                </div>
              )}

            </form>
          )}
        </div>

      </div>

      {/* Enlarged Survey Photo Preview Dialog */}
      {previewingSurveyPhoto && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in"
          onClick={() => setPreviewingSurveyPhoto(null)}
        >
          <div 
            className="relative bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[4/3] bg-black">
              <img
                src={previewingSurveyPhoto.dataUrl}
                alt={previewingSurveyPhoto.label}
                className="w-full h-full object-contain"
              />
              <button
                onClick={() => setPreviewingSurveyPhoto(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-slate-950/80 text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-1.5 bg-slate-950">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  {previewingSurveyPhoto.category}
                </span>
                <span className="text-xs font-mono font-bold text-amber-400">
                  +{(previewingSurveyPhoto.estimatedCbm || 1.0).toFixed(1)} CBM
                </span>
              </div>
              <h5 className="font-bold text-white text-sm">{previewingSurveyPhoto.label}</h5>
              {previewingSurveyPhoto.notes && (
                <p className="text-xs text-slate-400">{previewingSurveyPhoto.notes}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Interactive Pro-Forma Invoice Viewer Modal */}
      {isViewingInvoiceModal && generatedInvoiceDoc && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in"
          onClick={() => setIsViewingInvoiceModal(false)}
        >
          <div 
            className="relative bg-slate-900 border border-amber-500/40 rounded-3xl overflow-hidden max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl ring-1 ring-amber-500/20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Banner */}
            <div className="bg-slate-950 p-4 sm:p-5 border-b border-slate-800 relative">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      Document Vault • Pro-Forma Invoice
                    </span>
                    <h4 className="text-base sm:text-lg font-extrabold text-white mt-1">
                      {generatedInvoiceDoc.title}
                    </h4>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsViewingInvoiceModal(false)}
                  className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Invoice Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs">
              {/* Meta Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="space-y-1.5 border-b sm:border-b-0 sm:border-r border-slate-800 pb-3 sm:pb-0 sm:pr-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Billed To / Consignor:
                  </span>
                  <div className="font-extrabold text-white text-sm">
                    {generatedInvoiceDoc.clientName || 'Valued Relocation Client'}
                  </div>
                  {generatedInvoiceDoc.clientCompany && (
                    <div className="text-slate-300 font-semibold">{generatedInvoiceDoc.clientCompany}</div>
                  )}
                  <div className="text-slate-400">Tel: {generatedInvoiceDoc.clientPhone || 'On File'}</div>
                  <div className="text-slate-400">Email: {generatedInvoiceDoc.clientEmail || 'N/A'}</div>
                </div>

                <div className="space-y-1.5 sm:pl-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Shipment & Logistics Corridor:
                  </span>
                  <div className="font-bold text-amber-400 uppercase">
                    {(generatedInvoiceDoc.serviceType || 'corporate')} Relocation
                  </div>
                  <div className="text-slate-300">
                    <strong>Pickup:</strong> {generatedInvoiceDoc.originCity}
                  </div>
                  <div className="text-emerald-400">
                    <strong>Delivery:</strong> {generatedInvoiceDoc.destinationCity}
                  </div>
                  <div className="text-slate-400">
                    Transit: ~{generatedInvoiceDoc.distanceKm || 0} km • {generatedInvoiceDoc.recommendedVehicle || 'Heavy Freight Carrier'}
                  </div>
                </div>
              </div>

              {/* Itemized Financial Schedule */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Itemized Freight & Value-Added Schedule
                </span>
                <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950">
                  <div className="grid grid-cols-12 bg-slate-900 px-3.5 py-2 font-bold text-slate-400 text-[11px] border-b border-slate-800">
                    <span className="col-span-8">Description & Scope</span>
                    <span className="col-span-4 text-right">Amount (NGN)</span>
                  </div>

                  <div className="divide-y divide-slate-850">
                    <div className="grid grid-cols-12 px-3.5 py-2.5 items-center">
                      <div className="col-span-8 space-y-0.5">
                        <span className="font-bold text-white block">Base Relocation & White-Glove Crew</span>
                        <span className="text-[11px] text-slate-400">Dedicated loading, rigging & transport crew</span>
                      </div>
                      <span className="col-span-4 text-right font-mono font-bold text-slate-200">
                        ₦{(generatedInvoiceDoc.quoteBreakdown?.baseRateNaira || Math.round((generatedInvoiceDoc.coverageAmountNaira || 0) * 0.45)).toLocaleString('en-NG')}
                      </span>
                    </div>

                    <div className="grid grid-cols-12 px-3.5 py-2.5 items-center">
                      <div className="col-span-8 space-y-0.5">
                        <span className="font-bold text-white block">Highway Freight Logistics & Distance Surcharge</span>
                        <span className="text-[11px] text-slate-400">{generatedInvoiceDoc.distanceKm || 0} km interstate corridor & fuel index</span>
                      </div>
                      <span className="col-span-4 text-right font-mono font-bold text-slate-200">
                        ₦{(generatedInvoiceDoc.quoteBreakdown?.distanceChargeNaira || Math.round((generatedInvoiceDoc.coverageAmountNaira || 0) * 0.35)).toLocaleString('en-NG')}
                      </span>
                    </div>

                    {((generatedInvoiceDoc.quoteBreakdown?.accessTerrainSurchargeNaira || 0) > 0) && (
                      <div className="grid grid-cols-12 px-3.5 py-2.5 items-center">
                        <div className="col-span-8 space-y-0.5">
                          <span className="font-bold text-white block">LGA Access, Heavy Density Logistics & Tolls</span>
                          <span className="text-[11px] text-slate-400">Corridor clearance, bridge passes & access transit</span>
                        </div>
                        <span className="col-span-4 text-right font-mono font-bold text-slate-200">
                          ₦{(generatedInvoiceDoc.quoteBreakdown?.accessTerrainSurchargeNaira || 0).toLocaleString('en-NG')}
                        </span>
                      </div>
                    )}

                    {((generatedInvoiceDoc.quoteBreakdown?.packingCratingNaira || 0) > 0) && (
                      <div className="grid grid-cols-12 px-3.5 py-2.5 items-center">
                        <div className="col-span-8 space-y-0.5">
                          <span className="font-bold text-white block">Multi-Layer Protective Packing & Custom Crating</span>
                          <span className="text-[11px] text-slate-400">High-density bubble wrap, stretch film & wood crating</span>
                        </div>
                        <span className="col-span-4 text-right font-mono font-bold text-slate-200">
                          ₦{(generatedInvoiceDoc.quoteBreakdown?.packingCratingNaira || 0).toLocaleString('en-NG')}
                        </span>
                      </div>
                    )}

                    {((generatedInvoiceDoc.quoteBreakdown?.insuranceCoverNaira || 0) > 0) && (
                      <div className="grid grid-cols-12 px-3.5 py-2.5 items-center">
                        <div className="col-span-8 space-y-0.5">
                          <span className="font-bold text-white block">100% Comprehensive Goods-In-Transit (GIT) Policy</span>
                          <span className="text-[11px] text-slate-400">Leadway Assurance & AIICO Consortium All-Risk Underwriting</span>
                        </div>
                        <span className="col-span-4 text-right font-mono font-bold text-slate-200">
                          ₦{(generatedInvoiceDoc.quoteBreakdown?.insuranceCoverNaira || 0).toLocaleString('en-NG')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Totals Box */}
                  <div className="bg-slate-900/90 p-3.5 border-t border-slate-800 space-y-1.5">
                    <div className="flex justify-between text-slate-300">
                      <span>Logistics Net Subtotal:</span>
                      <span className="font-mono font-bold">₦{(generatedInvoiceDoc.coverageAmountNaira || 0).toLocaleString('en-NG')}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Statutory 7.5% FIRS VAT Allocation:</span>
                      <span className="font-mono font-bold text-emerald-400">
                        ₦{Math.round((generatedInvoiceDoc.coverageAmountNaira || 0) * 0.075).toLocaleString('en-NG')}
                      </span>
                    </div>
                    <div className="flex justify-between text-white font-extrabold text-sm pt-2 border-t border-slate-800">
                      <span className="text-amber-400">TOTAL PAYABLE (NGN):</span>
                      <div className="text-right">
                        <span className="text-amber-400 font-mono text-base block">
                          ₦{Math.round((generatedInvoiceDoc.coverageAmountNaira || 0) * 1.075).toLocaleString('en-NG')}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono font-normal">
                          (~${Math.round(((generatedInvoiceDoc.coverageAmountNaira || 0) * 1.075) / 1500).toLocaleString('en-US')} USD)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Settlement Bank Details */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                  Official Corporate Bank Settlement Details
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[11px] font-bold text-white block">Primary: Zenith Bank Plc</span>
                    <span className="text-slate-400 block">Acct Name: Pyda Movers & Logistics Ltd</span>
                    <span className="text-amber-400 font-mono font-bold text-xs block mt-0.5">1018924012 (NGN Commercial)</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[11px] font-bold text-white block">Secondary: First Bank of Nigeria</span>
                    <span className="text-slate-400 block">Acct Name: Pyda Movers & Logistics Ltd</span>
                    <span className="text-amber-400 font-mono font-bold text-xs block mt-0.5">2038914022 (Interstate Freight)</span>
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1.5 pt-1">
                  <span>Payment Ref:</span>
                  <span className="font-mono font-bold text-amber-300">{generatedInvoiceDoc.referenceNumber}</span>
                  <span className="text-slate-500">• 30-Day price lock from {generatedInvoiceDoc.issuedDate}</span>
                </div>
              </div>

              {/* PKI Seal & Validity */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-950 rounded-2xl border border-slate-850 text-[11px]">
                <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>PKI Code: {generatedInvoiceDoc.verifiedStampCode}</span>
                </div>
                <span className="text-slate-400">
                  Valid Until: <strong className="text-white font-mono">{generatedInvoiceDoc.expiryDate}</strong>
                </span>
              </div>

              {/* Inspection Notice Stipulation */}
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-2.5 text-xs">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-slate-300 leading-relaxed text-[11px]">
                  <strong className="text-amber-300 block font-bold text-xs mb-0.5">
                    Official Pricing & Inspection Stipulation:
                  </strong>
                  The final price will be determined after inspection by moving inspection personnel from our company or via video/pictures.
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsViewingInvoiceModal(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs py-2.5 px-4 rounded-xl transition-colors"
              >
                Close Preview
              </button>

              <button
                type="button"
                onClick={() => downloadProformaInvoicePdf(generatedInvoiceDoc)}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 transition-all active:scale-95 shadow-md shadow-amber-500/20"
                id="modal-download-proforma-pdf"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>Download Official PDF</span>
              </button>

              {onNavigateToVault && (
                <button
                  type="button"
                  onClick={() => {
                    setIsViewingInvoiceModal(false);
                    onClose();
                    onNavigateToVault(generatedInvoiceDoc.id);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 transition-all active:scale-95 shadow"
                  id="modal-open-in-vault-btn"
                >
                  <FolderLock className="w-4 h-4" />
                  <span>Open in Document Vault</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Interactive Location & Hub Selector Modal */}
      {locationSelectorTarget && (
        <LocationSelectorModal
          isOpen={!!locationSelectorTarget}
          onClose={() => setLocationSelectorTarget(null)}
          onSelectLocation={handleLocationModalSelect}
          targetType={locationSelectorTarget}
          currentStateId={locationSelectorTarget === 'origin' ? originStateId : destinationStateId}
          currentLgaName={locationSelectorTarget === 'origin' ? originLgaName : destinationLgaName}
          transitMode={transitMode}
          pairedStateId={transitMode === 'intra' ? originStateId : undefined}
        />
      )}

      {/* Goods-In-Transit Insurance Terms & Conditions Overlay */}
      <InsuranceTermsModal
        isOpen={showInsuranceTermsModal}
        onClose={() => setShowInsuranceTermsModal(false)}
        selectedTier={quoteCalculation.insuranceTier || insuranceTier}
        onSelectTier={(tier) => {
          setInsuranceTier(tier);
          setNeedsInsurance(tier !== 'basic');
        }}
      />
    </div>
  );
};
