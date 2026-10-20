import React, { useState, useMemo } from 'react';
import {
  X,
  Car,
  Shield,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  FileText,
  Receipt,
  Download,
  Share2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Info,
  DollarSign,
  ChevronRight,
  Check,
  Phone,
  User,
  Building,
  KeyRound,
  RotateCcw,
  Sliders,
  Edit3,
  ArrowLeftRight,
  Printer,
  Scale
} from 'lucide-react';
import {
  CarHireBookingData,
  CarHireTripType,
  CarHireVehicle,
  VaultDocument,
  CustomerUser,
  CarHireCustomConfig
} from '../types';
import {
  CAR_HIRE_VEHICLES,
  POPULAR_CAR_HIRE_ROUTES,
  VETTED_CHAUFFEURS,
  PopularCarHireRoute
} from '../data/carHireData';
import {
  createCarHireVaultDocument,
  saveCarHireDocumentToVault,
  downloadCarHirePdf,
  generateCarHirePdf
} from '../utils/carHireInvoiceGenerator';

interface CarHireBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: CustomerUser | null;
  initialTripType?: CarHireTripType;
  initialVehicleId?: string;
  initialCustomConfig?: CarHireCustomConfig;
  onNavigateToVault?: (docId?: string) => void;
  onOpenTermsModal?: () => void;
}

export const CarHireBookingModal: React.FC<CarHireBookingModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  initialTripType = 'intra_state',
  initialVehicleId = 'prado-txl-2024',
  initialCustomConfig,
  onNavigateToVault,
  onOpenTermsModal,
}) => {
  // Mode: 'booking' | 'preview_generated'
  const [activeStep, setActiveStep] = useState<'configure' | 'preview'>('configure');
  const [docTypeToGenerate, setDocTypeToGenerate] = useState<'invoice' | 'receipt'>('invoice');

  // Trip configuration state
  const [tripType, setTripType] = useState<CarHireTripType>(initialTripType);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(initialVehicleId);
  const [originCity, setOriginCity] = useState<string>('Lagos State');
  const [originAddress, setOriginAddress] = useState<string>('Victoria Island / Ikoyi, Lagos');
  const [destinationCity, setDestinationCity] = useState<string>(
    initialTripType === 'inter_state' ? 'Abuja FCT' : 'Ikeja / MMIA Airport, Lagos'
  );
  const [destinationAddress, setDestinationAddress] = useState<string>(
    initialTripType === 'inter_state' ? 'Maitama District, Abuja' : 'MMIA International Terminal, Ikeja'
  );

  const todayStr = new Date().toISOString().split('T')[0];
  const [pickupDate, setPickupDate] = useState<string>(todayStr);
  const [pickupTime, setPickupTime] = useState<string>('08:00');
  const [returnDate, setReturnDate] = useState<string>(todayStr);
  const [returnTime, setReturnTime] = useState<string>('20:00');
  const [totalDays, setTotalDays] = useState<number>(1);

  // Manual & Custom specification states
  const [isCustomVehicle, setIsCustomVehicle] = useState<boolean>(false);
  const [customVehicleName, setCustomVehicleName] = useState<string>('');
  const [customPlateNumber, setCustomPlateNumber] = useState<string>('');
  const [isManualPriceOverride, setIsManualPriceOverride] = useState<boolean>(false);
  const [manualDailyRate, setManualDailyRate] = useState<number>(0);

  // Sync with initial custom config whenever props change
  React.useEffect(() => {
    if (initialCustomConfig) {
      if (initialCustomConfig.tripType) setTripType(initialCustomConfig.tripType);
      if (initialCustomConfig.vehicleId) setSelectedVehicleId(initialCustomConfig.vehicleId);
      if (initialCustomConfig.customVehicleName) {
        setIsCustomVehicle(true);
        setCustomVehicleName(initialCustomConfig.customVehicleName);
      }
      if (initialCustomConfig.originCity) setOriginCity(initialCustomConfig.originCity);
      if (initialCustomConfig.originAddress) setOriginAddress(initialCustomConfig.originAddress);
      if (initialCustomConfig.destinationCity) setDestinationCity(initialCustomConfig.destinationCity);
      if (initialCustomConfig.destinationAddress) setDestinationAddress(initialCustomConfig.destinationAddress);
      if (initialCustomConfig.dailyRateNaira && initialCustomConfig.dailyRateNaira > 0) {
        setIsManualPriceOverride(true);
        setManualDailyRate(initialCustomConfig.dailyRateNaira);
      }
      if (initialCustomConfig.pickupDate) setPickupDate(initialCustomConfig.pickupDate);
      if (initialCustomConfig.returnDate) setReturnDate(initialCustomConfig.returnDate);
      if (initialCustomConfig.pickupTime) setPickupTime(initialCustomConfig.pickupTime);
      if (initialCustomConfig.returnTime) setReturnTime(initialCustomConfig.returnTime);
      if (initialCustomConfig.totalDays) setTotalDays(initialCustomConfig.totalDays);
      if (initialCustomConfig.docType) setDocTypeToGenerate(initialCustomConfig.docType);
    } else {
      if (initialTripType) setTripType(initialTripType);
      if (initialVehicleId) setSelectedVehicleId(initialVehicleId);
    }
  }, [initialCustomConfig, initialTripType, initialVehicleId, isOpen]);

  // Add-ons
  const [includeSecurityEscort, setIncludeSecurityEscort] = useState<boolean>(false);
  const [includeAirportProtocol, setIncludeAirportProtocol] = useState<boolean>(false);

  // Client Details
  const [clientName, setClientName] = useState<string>(currentUser?.fullName || 'Dr. Yerima Forfor');
  const [clientCompany, setClientCompany] = useState<string>(currentUser?.companyName || 'Apex Corporate Chambers');
  const [clientPhone, setClientPhone] = useState<string>(currentUser?.phone || '+234 803 892 1102');
  const [clientEmail, setClientEmail] = useState<string>(currentUser?.email || 'yerimaforfor@gmail.com');
  const [clientTin, setClientTin] = useState<string>('TIN-9281029-001');
  const [notes, setNotes] = useState<string>('');

  // Payment Details for Receipts
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'card' | 'corporate_po'>('bank_transfer');
  const [paymentReference, setPaymentReference] = useState<string>(
    `NIP-CBN-${new Date().getFullYear()}-PYDA-${Math.floor(10000 + Math.random() * 90000)}`
  );

  // Status feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedDoc, setGeneratedDoc] = useState<VaultDocument | null>(null);
  const [modalVehicleCategory, setModalVehicleCategory] = useState<'all' | 'coaster' | 'bus' | 'suv' | 'sedan' | 'escort'>('all');

  // Find active vehicle
  const activeVehicle = useMemo(() => {
    return CAR_HIRE_VEHICLES.find((v) => v.id === selectedVehicleId) || CAR_HIRE_VEHICLES[0];
  }, [selectedVehicleId]);

  const modalFilteredVehicles = useMemo(() => {
    if (modalVehicleCategory === 'all') return CAR_HIRE_VEHICLES;
    return CAR_HIRE_VEHICLES.filter((v) => v.category === modalVehicleCategory);
  }, [modalVehicleCategory]);

  // Recalculate days when dates change
  const handleDateChange = (type: 'pickup' | 'return', val: string) => {
    let pDate = type === 'pickup' ? val : pickupDate;
    let rDate = type === 'return' ? val : returnDate;

    if (type === 'pickup') {
      setPickupDate(val);
      if (new Date(val) > new Date(rDate)) {
        setReturnDate(val);
        rDate = val;
      }
    } else {
      setReturnDate(val);
      if (new Date(val) < new Date(pDate)) {
        setPickupDate(val);
        pDate = val;
      }
    }

    try {
      const diffTime = Math.abs(new Date(rDate).getTime() - new Date(pDate).getTime());
      const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
      setTotalDays(diffDays);
    } catch {
      setTotalDays(1);
    }
  };

  // Switch Trip Type helper
  const handleTripTypeSwitch = (type: CarHireTripType) => {
    setTripType(type);
    if (type === 'inter_state') {
      setDestinationCity('Abuja FCT');
      setDestinationAddress('Maitama District, Abuja');
      if (totalDays === 1) setTotalDays(2);
    } else {
      setDestinationCity(originCity);
      setDestinationAddress('Ikeja GRA & Airport Terminal, Lagos');
    }
  };

  // Apply Popular Route
  const handleApplyRoute = (route: PopularCarHireRoute) => {
    setTripType(route.tripType);
    setOriginCity(route.origin.split(',')[1]?.trim() || route.origin);
    setOriginAddress(route.origin);
    setDestinationCity(route.destination.split(',')[1]?.trim() || route.destination);
    setDestinationAddress(route.destination);
    if (route.tripType === 'inter_state' && totalDays < 2) {
      setTotalDays(2);
    }
  };

  // Compute live price breakdown
  const pricing = useMemo(() => {
    const isInter = tripType === 'inter_state';
    const standardDailyRate = isInter
      ? activeVehicle.dailyRateInterStateNaira
      : activeVehicle.dailyRateIntraStateNaira;
    const dailyBaseRate = isManualPriceOverride && manualDailyRate > 0
      ? manualDailyRate
      : standardDailyRate;
    const totalBaseHire = dailyBaseRate * totalDays;

    const baseToll = isInter
      ? activeVehicle.tollAllowanceInterStateNaira
      : 5000;
    const tollAllowance = baseToll;

    const chauffeurAllowance = (isInter ? 20000 : 15000) * totalDays;

    const dailyEscort = activeVehicle.armoredEscortDailyNaira || (isInter ? 150000 : 90000);
    const escortNaira = includeSecurityEscort ? dailyEscort * totalDays : 0;
    const protocolFee = includeAirportProtocol ? 25000 : 0;

    const subtotal = totalBaseHire + tollAllowance + chauffeurAllowance + escortNaira + protocolFee;
    const vatRate = 7.5;
    const vatAmount = Math.round(subtotal * (vatRate / 100));
    const totalAmount = subtotal + vatAmount;

    return {
      dailyBaseRate,
      standardDailyRate,
      totalBaseHire,
      tollAllowance,
      chauffeurAllowance,
      escortNaira,
      protocolFee,
      subtotal,
      vatRate,
      vatAmount,
      totalAmount,
    };
  }, [tripType, activeVehicle, totalDays, includeSecurityEscort, includeAirportProtocol, isManualPriceOverride, manualDailyRate]);

  // Build full booking payload
  const currentBookingData: CarHireBookingData = useMemo(() => {
    const assignedChauffeur = VETTED_CHAUFFEURS[0];
    const prefix = docTypeToGenerate === 'receipt' ? 'CHR' : 'CHI';
    const rand = Math.floor(10000 + Math.random() * 90000);
    const refNum = `${prefix}-PYDA-${new Date().getFullYear()}-${rand}`;
    const resolvedVehicleName = isCustomVehicle && customVehicleName.trim() ? customVehicleName.trim() : activeVehicle.name;
    const resolvedPlate = customPlateNumber.trim() || activeVehicle.plateNumberExample;

    return {
      documentType: docTypeToGenerate,
      tripType,
      invoiceOrReceiptNumber: refNum,
      issueDate: todayStr,
      dueDate: docTypeToGenerate === 'invoice' ? returnDate : undefined,
      status: docTypeToGenerate === 'receipt' ? 'settled' : 'pending',
      clientName,
      clientCompany,
      clientEmail,
      clientPhone,
      clientAddress: originAddress,
      taxIdentificationNumber: clientTin,
      vehicleId: activeVehicle.id,
      vehicleName: resolvedVehicleName,
      vehiclePlateNumber: resolvedPlate,
      chauffeurName: assignedChauffeur.name,
      chauffeurPhone: assignedChauffeur.phone,
      chauffeurLicenseNo: assignedChauffeur.badgeNumber,
      originCity,
      originAddress,
      destinationCity,
      destinationAddress,
      pickupDate,
      pickupTime,
      returnDate,
      returnTime,
      totalDays,
      dailyBaseRateNaira: pricing.dailyBaseRate,
      totalBaseHireNaira: pricing.totalBaseHire,
      tollAllowanceNaira: pricing.tollAllowance,
      chauffeurAllowanceNaira: pricing.chauffeurAllowance,
      securityEscortIncluded: includeSecurityEscort,
      securityEscortNaira: pricing.escortNaira,
      subtotalNaira: pricing.subtotal,
      vatRatePercent: 7.5,
      vatAmountNaira: pricing.vatAmount,
      totalAmountNaira: pricing.totalAmount,
      paymentMethod,
      paymentReference,
      notes: notes || (tripType === 'inter_state' ? 'Inter-state highway charter' : 'Intra-state city charter'),
      isManualPriceOverride,
      manualPriceNote: isManualPriceOverride ? `Manual Rate Override: ₦${pricing.dailyBaseRate.toLocaleString('en-NG')}/day` : undefined,
    };
  }, [
    docTypeToGenerate,
    tripType,
    todayStr,
    returnDate,
    clientName,
    clientCompany,
    clientEmail,
    clientPhone,
    originAddress,
    clientTin,
    activeVehicle,
    isCustomVehicle,
    customVehicleName,
    customPlateNumber,
    originCity,
    destinationCity,
    destinationAddress,
    pickupDate,
    pickupTime,
    returnTime,
    totalDays,
    pricing,
    includeSecurityEscort,
    paymentMethod,
    paymentReference,
    notes,
    isManualPriceOverride
  ]);

  // Show Toast
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Generate and save to Document Vault
  const handleGenerateAndSaveToVault = async (isReceipt: boolean = false) => {
    setIsGenerating(true);
    try {
      const doc = createCarHireVaultDocument(currentBookingData, isReceipt, currentUser);
      await saveCarHireDocumentToVault(doc);
      setGeneratedDoc(doc);
      setActiveStep('preview');
      triggerToast(
        `✓ ${isReceipt ? 'Official Receipt' : 'Pro-Forma Invoice'} #${doc.referenceNumber} vaulted successfully!`
      );
    } catch (err) {
      console.error('Failed to create car hire document:', err);
      triggerToast('Error saving document to vault. Please retry.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Download PDF
  const handleDownloadPdf = () => {
    const docToDownload = generatedDoc || createCarHireVaultDocument(currentBookingData, docTypeToGenerate === 'receipt', currentUser);
    downloadCarHirePdf(docToDownload, docTypeToGenerate === 'receipt');
    triggerToast(`Downloaded ${docTypeToGenerate === 'receipt' ? 'Receipt' : 'Invoice'} PDF #${docToDownload.referenceNumber}`);
  };

  // Share via WhatsApp
  const handleShareWhatsApp = () => {
    const isReceipt = docTypeToGenerate === 'receipt';
    const ref = generatedDoc?.referenceNumber || currentBookingData.invoiceOrReceiptNumber;
    const msg = `*PYDA MOVERS & LOGISTICS - CAR HIRE ${isReceipt ? 'RECEIPT' : 'INVOICE'}*\n\n` +
      `*Doc Ref:* ${ref}\n` +
      `*Type:* ${tripType === 'inter_state' ? 'Inter-State Highway' : 'Intra-State City'} Charter\n` +
      `*Vehicle:* ${activeVehicle.name} (${activeVehicle.plateNumberExample})\n` +
      `*Route:* ${originAddress} -> ${destinationAddress}\n` +
      `*Dates:* ${pickupDate} to ${returnDate} (${totalDays} Days)\n` +
      `*Total Amount:* ₦${pricing.totalAmount.toLocaleString('en-NG')} (VAT 7.5% incl)\n` +
      `*Status:* ${isReceipt ? 'PAID IN FULL • OFFICIAL RECEIPT' : 'PRO-FORMA INVOICE • PAYMENT PENDING'}\n\n` +
      `Official Chauffeur Dispatch Line: 08062466212`;

    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/2348062466212?text=${encoded}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div
        className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-100 relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="car-hire-modal-title"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-950 via-[#0c1f14] to-slate-950 border-b border-emerald-900/50 p-4 sm:p-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#83b735]/20 to-amber-500/20 border border-[#83b735]/40 flex items-center justify-center text-[#83b735] shadow-lg shrink-0">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#83b735] bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Inter & Intra State Fleet Hub
                </span>
                <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  Instant Receipt & Invoice Generator
                </span>
              </div>
              <h2 id="car-hire-modal-title" className="text-xl sm:text-2xl font-black text-white">
                Executive Car Hire & Chauffeur Services
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Step Navigation Tabs */}
        <div className="bg-slate-950 px-4 sm:px-6 py-2.5 border-b border-slate-800 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveStep('configure')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-2 ${
                activeStep === 'configure'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <span>1. Vehicle, Route & Pricing</span>
            </button>
            <ChevronRight className="w-4 h-4 text-slate-600" />
            <button
              onClick={() => {
                if (!generatedDoc) {
                  handleGenerateAndSaveToVault(docTypeToGenerate === 'receipt');
                } else {
                  setActiveStep('preview');
                }
              }}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-2 ${
                activeStep === 'preview'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <span>2. Invoice / Receipt Document</span>
              {generatedDoc && <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />}
            </button>
          </div>

          {/* Document Generation Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setDocTypeToGenerate('invoice');
                if (generatedDoc) setGeneratedDoc(null);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                docTypeToGenerate === 'invoice'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Pro-Forma Invoice</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setDocTypeToGenerate('receipt');
                if (generatedDoc) setGeneratedDoc(null);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                docTypeToGenerate === 'receipt'
                  ? 'bg-emerald-500 text-slate-950'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Paid Official Receipt</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {activeStep === 'configure' ? (
            <div className="space-y-6">
              {/* Trip Type Selector (Intra-State vs Inter-State) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleTripTypeSwitch('intra_state')}
                  className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 ${
                    tripType === 'intra_state'
                      ? 'bg-gradient-to-br from-emerald-950/60 to-slate-900 border-[#83b735] shadow-lg shadow-emerald-950/30 ring-2 ring-[#83b735]/40'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl shrink-0 ${tripType === 'intra_state' ? 'bg-[#83b735] text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                    <Car className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-sm">Intra-State City Charter</h4>
                      <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        Metropolitan Run
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Within city limits (Lagos, Abuja FCT, Port Harcourt, Kano). Daily 12-hour chauffeur charters, executive meetings, airport pickups, and weddings.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleTripTypeSwitch('inter_state')}
                  className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 ${
                    tripType === 'inter_state'
                      ? 'bg-gradient-to-br from-amber-950/60 to-slate-900 border-amber-500 shadow-lg shadow-amber-950/30 ring-2 ring-amber-500/40'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl shrink-0 ${tripType === 'inter_state' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-sm">Inter-State Highway Transit</h4>
                      <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                        Long-Distance Corridor
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Across state borders (e.g., Lagos to Abuja, Abuja to Kaduna/Jos, Lagos to Port Harcourt). Includes highway toll passes, driver subsistence, and optional armed escorts.
                    </p>
                  </div>
                </button>
              </div>

              {/* Quick Popular Route Selector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Popular Route Presets ({tripType === 'inter_state' ? 'Inter-State' : 'Intra-State'})</span>
                  </span>
                  <span className="text-[11px] text-slate-500">Click to autofill route & tolls</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {POPULAR_CAR_HIRE_ROUTES.filter((r) => r.tripType === tripType).map((route) => (
                    <button
                      key={route.id}
                      type="button"
                      onClick={() => handleApplyRoute(route)}
                      className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-left transition-colors flex flex-col justify-between"
                    >
                      <div>
                        <span className="font-bold text-xs text-white block">{route.title}</span>
                        <span className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                          {route.origin} → {route.destination}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-amber-400/90 font-mono mt-1.5 pt-1 border-t border-slate-900">
                        <span>~{route.typicalDistanceKm} KM</span>
                        <span>Tolls: ₦{route.tollEstimateNaira.toLocaleString('en-NG')}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Fleet Selection Carousel / Grid */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
                      <span>Select Executive Fleet Vehicle</span>
                      <span className="text-xs font-normal text-slate-400 font-mono">
                        ({tripType === 'inter_state' ? 'Inter-State Daily Rates' : 'Intra-State Daily Rates'})
                      </span>
                    </h3>
                  </div>

                  {/* Category Filter Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
                    {[
                      { id: 'all', label: 'All Fleet' },
                      { id: 'coaster', label: 'Coaster Buses (26–32 Seats)' },
                      { id: 'bus', label: 'VIP Shuttles (14-Seater)' },
                      { id: 'suv', label: 'SUVs' },
                      { id: 'sedan', label: 'Sedans' },
                      { id: 'escort', label: 'Escorts' }
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setModalVehicleCategory(cat.id as any)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                          modalVehicleCategory === cat.id
                            ? 'bg-amber-500 text-slate-950 font-black shadow'
                            : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {modalFilteredVehicles.map((v) => {
                    const isSelected = selectedVehicleId === v.id;
                    const dailyRate =
                      tripType === 'inter_state'
                        ? v.dailyRateInterStateNaira
                        : v.dailyRateIntraStateNaira;

                    return (
                      <div
                        key={v.id}
                        onClick={() => setSelectedVehicleId(v.id)}
                        className={`rounded-2xl border p-3.5 cursor-pointer transition-all flex flex-col justify-between relative group ${
                          isSelected
                            ? 'bg-slate-950 border-[#83b735] shadow-xl ring-2 ring-[#83b735]/40'
                            : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-3 right-3 bg-[#83b735] text-slate-950 p-1 rounded-full shadow-md z-10">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}

                        <div>
                          {/* Image Thumbnail */}
                          <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-3 bg-slate-900 border border-slate-800">
                            <img
                              src={v.imageUrl}
                              alt={v.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-mono text-amber-300">
                              Plate: {v.plateNumberExample}
                            </div>
                            {v.modelYear && (
                              <div className="absolute top-2 right-2 bg-slate-950/90 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded text-[10px] font-mono font-bold shadow">
                                {v.modelYear} Model
                              </div>
                            )}
                            {v.armoredEscortAvailable && (
                              <div className="absolute top-2 left-2 bg-amber-500/90 text-slate-950 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 shadow">
                                <Shield className="w-3 h-3" />
                                <span>Armored / Escort</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 flex-wrap mb-1">
                            {v.category === 'coaster' && (
                              <span className="text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/30">
                                Coaster Coach
                              </span>
                            )}
                            <h4 className="font-bold text-white text-xs sm:text-sm line-clamp-1">{v.name}</h4>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                            {v.description}
                          </p>

                          <div className="flex items-center gap-3 text-[11px] text-slate-300 my-2 pt-2 border-t border-slate-900">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3 text-amber-400" />
                              <span>{v.seats} Seats</span>
                            </span>
                            <span>•</span>
                            <span className="text-[10px] text-slate-400 truncate">
                              {v.luggageCapacity}
                            </span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-900 flex items-center justify-between mt-1">
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Daily Rate:</span>
                          <span className="font-mono font-black text-sm text-[#83b735]">
                            ₦{dailyRate.toLocaleString('en-NG')}
                            <span className="text-[10px] font-normal text-slate-400">/day</span>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Manual / Custom Vehicle Specification Override */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold text-white">Manual Vehicle Specification Override</span>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                      <input
                        type="checkbox"
                        checked={isCustomVehicle}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setIsCustomVehicle(checked);
                          if (checked && !customVehicleName) {
                            setCustomVehicleName(activeVehicle.name);
                            setCustomPlateNumber(activeVehicle.plateNumberExample);
                          }
                        }}
                        className="rounded text-amber-500 focus:ring-0 bg-slate-800 border-slate-700 w-4 h-4"
                      />
                      <span>Enable Custom Vehicle</span>
                    </label>
                  </div>

                  {isCustomVehicle && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
                      <div>
                        <label className="text-[11px] text-slate-400 font-bold block mb-1">
                          Custom Vehicle Make / Model / Variant
                        </label>
                        <input
                          type="text"
                          value={customVehicleName}
                          onChange={(e) => setCustomVehicleName(e.target.value)}
                          placeholder="e.g. Toyota Land Cruiser 300 VIP Armor B6 / Rolls-Royce Ghost"
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 font-bold block mb-1">
                          Designated Plate Number
                        </label>
                        <input
                          type="text"
                          value={customPlateNumber}
                          onChange={(e) => setCustomPlateNumber(e.target.value)}
                          placeholder="e.g. ABJ-482-XY / LAG-918-EK"
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-amber-300 font-mono outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Route & Schedule Form */}
              <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-xs sm:text-sm flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-400" />
                    <span>Route, Pickup Schedule & Rental Duration</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      const tempCity = originCity;
                      const tempAddr = originAddress;
                      setOriginCity(destinationCity);
                      setOriginAddress(destinationAddress);
                      setDestinationCity(tempCity);
                      setDestinationAddress(tempAddr);
                    }}
                    className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-bold"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                    <span>Swap Origin ⇄ Destination</span>
                  </button>
                </div>

                {/* Cities & Locations */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2">
                    <div>
                      <label className="text-slate-400 font-bold block mb-1">Pick-Up City / State</label>
                      <input
                        type="text"
                        value={originCity}
                        onChange={(e) => setOriginCity(e.target.value)}
                        placeholder="e.g. Lagos State"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 font-bold block mb-1">Pick-Up Specific Address / Landmark</label>
                      <input
                        type="text"
                        value={originAddress}
                        onChange={(e) => setOriginAddress(e.target.value)}
                        placeholder="e.g. Plot 14, Victoria Island, Lagos"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="text-slate-400 font-bold block mb-1">Destination City / State</label>
                      <input
                        type="text"
                        value={destinationCity}
                        onChange={(e) => setDestinationCity(e.target.value)}
                        placeholder="e.g. Abuja FCT"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 font-bold block mb-1">Destination Address / Corridor</label>
                      <input
                        type="text"
                        value={destinationAddress}
                        onChange={(e) => setDestinationAddress(e.target.value)}
                        placeholder="e.g. Maitama District, Abuja FCT"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1 border-t border-slate-900">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-400 font-bold block mb-1">Pick-Up Date</label>
                      <input
                        type="date"
                        value={pickupDate}
                        onChange={(e) => handleDateChange('pickup', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 font-bold block mb-1">Pick-Up Time</label>
                      <input
                        type="time"
                        value={pickupTime}
                        onChange={(e) => setPickupTime(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-400 font-bold block mb-1">Return Date</label>
                      <input
                        type="date"
                        value={returnDate}
                        onChange={(e) => handleDateChange('return', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 font-bold block mb-1">Duration (Days)</label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setTotalDays((prev) => Math.max(1, prev - 1))}
                          className="px-3 py-2 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-700"
                        >
                          -
                        </button>
                        <span className="flex-1 text-center font-mono font-bold text-amber-400 bg-slate-900 py-2 rounded-xl border border-slate-700">
                          {totalDays} Day{totalDays > 1 ? 's' : ''}
                        </span>
                        <button
                          type="button"
                          onClick={() => setTotalDays((prev) => prev + 1)}
                          className="px-3 py-2 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-700"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Protocol & Tactical Add-ons */}
              <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="font-bold text-white text-xs sm:text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Security Escorts & Executive Protocol Add-ons</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <label className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                    includeSecurityEscort
                      ? 'bg-amber-950/40 border-amber-500/60 text-white'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400'
                  }`}>
                    <input
                      type="checkbox"
                      checked={includeSecurityEscort}
                      onChange={(e) => setIncludeSecurityEscort(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded text-amber-500 focus:ring-0 bg-slate-800 border-slate-700"
                    />
                    <div>
                      <span className="font-bold text-white block">
                        Armed MOPOL / Police Escort Convoy
                      </span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        Tactical Mobile Police personnel, auxiliary chase vehicle, highway route clearance (+₦{(activeVehicle.armoredEscortDailyNaira || 120000).toLocaleString('en-NG')}/day)
                      </span>
                    </div>
                  </label>

                  <label className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                    includeAirportProtocol
                      ? 'bg-emerald-950/40 border-emerald-500/60 text-white'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400'
                  }`}>
                    <input
                      type="checkbox"
                      checked={includeAirportProtocol}
                      onChange={(e) => setIncludeAirportProtocol(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded text-emerald-500 focus:ring-0 bg-slate-800 border-slate-700"
                    />
                    <div>
                      <span className="font-bold text-white block">
                        Airport Meet & Greet Protocol Officer
                      </span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        VIP lounge escort, express tarmac/customs clearance at MMIA Lagos or Nnamdi Azikiwe Abuja (+₦25,000)
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Client & Billing Information */}
              <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="font-bold text-white text-xs sm:text-sm flex items-center gap-2">
                  <User className="w-4 h-4 text-amber-400" />
                  <span>Hirer Details for Official Commercial Invoicing / Receipt</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="text-slate-400 font-bold block mb-1">Hirer / Representative Name</label>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 font-bold block mb-1">Company / Organization</label>
                    <input
                      type="text"
                      value={clientCompany}
                      onChange={(e) => setClientCompany(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 font-bold block mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 font-bold block mb-1">Official Email</label>
                    <input
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 font-bold block mb-1">FIRS Tax ID (TIN Number)</label>
                    <input
                      type="text"
                      value={clientTin}
                      onChange={(e) => setClientTin(e.target.value)}
                      placeholder="e.g. 24891029-0001"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                  {docTypeToGenerate === 'receipt' && (
                    <div>
                      <label className="text-slate-400 font-bold block mb-1">Payment Reference (NIP / POS)</label>
                      <input
                        type="text"
                        value={paymentReference}
                        onChange={(e) => setPaymentReference(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-emerald-400 outline-none focus:border-emerald-400 font-mono"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Manual Price Override / Negotiated Rate Module */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-lg bg-emerald-500/20 text-[#83b735] font-black text-xs font-mono">₦</span>
                    <span className="text-xs font-bold text-white">Manual Tariff & Negotiated Daily Rate Override</span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={isManualPriceOverride}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setIsManualPriceOverride(checked);
                        if (checked && (!manualDailyRate || manualDailyRate <= 0)) {
                          setManualDailyRate(tripType === 'inter_state' ? activeVehicle.dailyRateInterStateNaira : activeVehicle.dailyRateIntraStateNaira);
                        }
                      }}
                      className="rounded text-[#83b735] focus:ring-0 bg-slate-800 border-slate-700 w-4 h-4"
                    />
                    <span>Enable Manual Price Override</span>
                  </label>
                </div>

                {isManualPriceOverride && (
                  <div className="space-y-3 pt-2 border-t border-slate-800">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex-1">
                        <label className="text-[11px] text-slate-400 font-bold block mb-1">
                          Agreed Base Daily Rate (₦ / Day)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-xs font-mono font-bold text-slate-400">₦</span>
                          <input
                            type="number"
                            min="10000"
                            step="5000"
                            value={manualDailyRate || ''}
                            onChange={(e) => setManualDailyRate(Number(e.target.value))}
                            placeholder="e.g. 120000"
                            className="w-full bg-slate-950 border border-emerald-500/50 rounded-xl pl-8 pr-3 py-2 text-xs font-mono font-bold text-[#83b735] outline-none focus:border-[#83b735]"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 self-end pb-0.5">
                        <button
                          type="button"
                          onClick={() => setManualDailyRate((prev) => Math.max(10000, prev - 10000))}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200"
                        >
                          -₦10k
                        </button>
                        <button
                          type="button"
                          onClick={() => setManualDailyRate((prev) => prev + 10000)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200"
                        >
                          +₦10k
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setManualDailyRate(tripType === 'inter_state' ? activeVehicle.dailyRateInterStateNaira : activeVehicle.dailyRateIntraStateNaira);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-amber-400 font-bold"
                        >
                          Reset Tariff
                        </button>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Standard Fleet Tariff: <strong className="text-slate-300">₦{pricing.standardDailyRate.toLocaleString('en-NG')}/day</strong></span>
                      <span className="text-emerald-400 font-bold">Custom Negotiated Tariff Active</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Dynamic Live Cost Summary & Vault Action Hub */}
              <div className="bg-gradient-to-br from-[#0c2415] via-[#091a10] to-slate-950 border border-emerald-600/50 rounded-2xl p-5 shadow-2xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-900/60 pb-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                      Transparent Cost Breakdown
                    </span>
                    <h4 className="text-base sm:text-lg font-black text-white">
                      {activeVehicle.name} • {tripType === 'inter_state' ? 'Inter-State' : 'Intra-State'} ({totalDays} Days)
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">
                      {docTypeToGenerate === 'receipt' ? 'Total Settled Amount' : 'Pro-Forma Total Amount'}
                    </span>
                    <span className="font-mono font-black text-2xl text-[#83b735]">
                      ₦{pricing.totalAmount.toLocaleString('en-NG')}
                    </span>
                  </div>
                </div>

                {/* Line Items Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-950/80 p-3 rounded-xl border border-emerald-950">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Base Fleet Hire:</span>
                    <span className="font-mono text-white font-bold">₦{pricing.totalBaseHire.toLocaleString('en-NG')}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Highway Tolls & Passes:</span>
                    <span className="font-mono text-white font-bold">₦{pricing.tollAllowance.toLocaleString('en-NG')}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Chauffeur Subsistence:</span>
                    <span className="font-mono text-white font-bold">₦{pricing.chauffeurAllowance.toLocaleString('en-NG')}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Statutory FIRS VAT (7.5%):</span>
                    <span className="font-mono text-emerald-400 font-bold">₦{pricing.vatAmount.toLocaleString('en-NG')}</span>
                  </div>
                  {includeSecurityEscort && (
                    <div className="col-span-2">
                      <span className="text-slate-400 text-[10px] block">Armed MOPOL Tactical Escort:</span>
                      <span className="font-mono text-amber-400 font-bold">₦{pricing.escortNaira.toLocaleString('en-NG')}</span>
                    </div>
                  )}
                  {includeAirportProtocol && (
                    <div className="col-span-2">
                      <span className="text-slate-400 text-[10px] block">Airport Protocol Officer:</span>
                      <span className="font-mono text-amber-400 font-bold">₦{pricing.protocolFee.toLocaleString('en-NG')}</span>
                    </div>
                  )}
                </div>

                {/* Chauffeur Safety & Trading Terms Notice */}
                <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs space-y-1">
                  <div className="flex items-start gap-2">
                    <Scale className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div className="text-[11px] text-slate-300 leading-relaxed">
                      Executive charters are subject to Pyda Movers Chauffeur Safety Disclosures, FRSC speed compliance (telematics-capped @ 80 km/h), maximum 10-hour daily driving fatigue caps, and standard carrier trading conditions.{' '}
                      {onOpenTermsModal && (
                        <button
                          type="button"
                          onClick={onOpenTermsModal}
                          className="text-amber-400 font-bold underline hover:text-amber-300 ml-1 inline-flex items-center gap-0.5"
                        >
                          <span>[View Charter Terms]</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleGenerateAndSaveToVault(docTypeToGenerate === 'receipt')}
                      disabled={isGenerating}
                      className="bg-[#83b735] hover:bg-[#92cb3b] text-slate-950 font-black text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-xl flex items-center gap-2 transition-all transform active:scale-95 disabled:opacity-50"
                      id="save-car-hire-vault-btn"
                    >
                      {isGenerating ? (
                        <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                      ) : docTypeToGenerate === 'receipt' ? (
                        <Receipt className="w-4 h-4" />
                      ) : (
                        <FileText className="w-4 h-4" />
                      )}
                      <span>
                        {docTypeToGenerate === 'receipt'
                          ? 'Generate Paid Receipt & Save to Vault'
                          : 'Generate Pro-Forma Invoice & Save to Vault'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadPdf}
                      className="bg-slate-900 hover:bg-slate-800 text-amber-400 hover:text-amber-300 border border-amber-500/30 font-bold text-xs px-4 py-3.5 rounded-xl flex items-center gap-2 transition-all"
                      id="download-car-hire-pdf-btn"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download PDF</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleShareWhatsApp}
                    className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold px-4 py-3.5 rounded-xl flex items-center gap-2 transition-all"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share Details on WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Document Preview State */
            <div className="space-y-6 animate-fade-in">
              <div className="bg-slate-950 border border-emerald-500/40 rounded-3xl p-6 shadow-2xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      {docTypeToGenerate === 'receipt' ? <Receipt className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                        {tripType === 'inter_state' ? 'Inter-State Transit' : 'Intra-State City'} • Vault Document #
                        {generatedDoc?.referenceNumber || currentBookingData.invoiceOrReceiptNumber}
                      </span>
                      <h3 className="text-xl font-black text-white mt-1">
                        {docTypeToGenerate === 'receipt'
                          ? 'Official Tax Clearance Receipt (Settled)'
                          : 'Official Pro-Forma Commercial Invoice'}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDownloadPdf}
                      className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow flex items-center gap-1.5 transition-all"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download PDF</span>
                    </button>
                    {onNavigateToVault && generatedDoc && (
                      <button
                        onClick={() => {
                          onClose();
                          onNavigateToVault(generatedDoc.id);
                        }}
                        className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all"
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>View in Vault</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Professional Clean Executive Receipt Sheet */}
                <div className="bg-white text-slate-900 rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-200/90 space-y-6 text-xs max-w-2xl mx-auto">
                  {/* Executive Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-5 border-b border-slate-200">
                    <div>
                      <h4 className="text-base sm:text-lg font-black tracking-tight text-slate-950">
                        PYDA MOVERS & LOGISTICS LTD
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        Executive Car Hire & Chauffeur Fleet Services
                      </p>
                      <div className="text-[10px] text-slate-400 mt-1.5 space-y-0.5">
                        <div>RC: 1498210 · FIRS TIN: 24891029-0001</div>
                        <div>Suite A204, AA Rano Citygate Plaza, Airport Rd, Abuja FCT</div>
                        <div>Hotline: +234 806 246 6212 · fleet@pydamovers.com</div>
                      </div>
                    </div>

                    <div className="text-left sm:text-right space-y-1">
                      <span className="inline-block text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                        {docTypeToGenerate === 'receipt' ? 'OFFICIAL RECEIPT' : 'PRO-FORMA INVOICE'}
                      </span>
                      <div className="font-mono font-bold text-xs text-slate-800">
                        REF: {generatedDoc?.referenceNumber || currentBookingData.invoiceOrReceiptNumber}
                      </div>
                      <div className="text-[11px] text-slate-500">Date Issued: {todayStr}</div>
                      <div className="text-[11px] font-semibold text-emerald-700">
                        {docTypeToGenerate === 'receipt' ? '● Payment Settled & Cleared' : '● 30-Day Guaranteed Tariff'}
                      </div>
                    </div>
                  </div>

                  {/* Two-Column Client & Charter Particulars */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 py-1">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Billed To / Hirer:
                      </span>
                      <div className="font-bold text-slate-900 text-sm">{clientName}</div>
                      {clientCompany && <div className="text-slate-700 font-medium">{clientCompany}</div>}
                      <div className="text-slate-600">Tel: {clientPhone}</div>
                      <div className="text-slate-600">Email: {clientEmail}</div>
                      {clientTin && <div className="text-slate-500 font-mono text-[10px]">TIN: {clientTin}</div>}
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Charter Particulars:
                      </span>
                      <div className="font-bold text-slate-900 text-sm">{activeVehicle.name}</div>
                      <div className="text-slate-700 font-mono text-[11px]">Plate: {activeVehicle.plateNumberExample}</div>
                      <div className="text-slate-600">
                        Corridor: {originAddress} → {destinationAddress}
                      </div>
                      <div className="text-slate-600">
                        Schedule: {totalDays} Day{totalDays > 1 ? 's' : ''} ({pickupDate} to {returnDate})
                      </div>
                      <div className="text-slate-600">
                        Chauffeur: {VETTED_CHAUFFEURS[0].name} ({VETTED_CHAUFFEURS[0].phone})
                      </div>
                    </div>
                  </div>

                  {/* Financial Table */}
                  <div className="space-y-3">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-300 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          <th className="py-2">Description</th>
                          <th className="py-2 text-center">Days / Qty</th>
                          <th className="py-2 text-right">Daily Rate</th>
                          <th className="py-2 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-[11px] text-slate-700">
                        <tr>
                          <td className="py-2.5 font-medium text-slate-900">
                            {activeVehicle.name} Daily Charter
                            <span className="block text-[10px] text-slate-400 font-normal">
                              {tripType === 'inter_state' ? 'Inter-State highway transit' : 'Intra-State city charter'}
                            </span>
                          </td>
                          <td className="py-2.5 text-center">{totalDays}</td>
                          <td className="py-2.5 text-right font-mono">₦{pricing.dailyBaseRate.toLocaleString('en-NG')}</td>
                          <td className="py-2.5 text-right font-mono font-semibold text-slate-900">
                            ₦{pricing.totalBaseHire.toLocaleString('en-NG')}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 font-medium text-slate-900">
                            Highway Toll Allowances & Transit Vouchers
                          </td>
                          <td className="py-2 text-center">Route</td>
                          <td className="py-2 text-right font-mono">₦{pricing.tollAllowance.toLocaleString('en-NG')}</td>
                          <td className="py-2 text-right font-mono font-semibold text-slate-900">
                            ₦{pricing.tollAllowance.toLocaleString('en-NG')}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 font-medium text-slate-900">
                            Chauffeur Subsistence & Accommodation
                          </td>
                          <td className="py-2 text-center">{totalDays}</td>
                          <td className="py-2 text-right font-mono">
                            ₦{Math.round(pricing.chauffeurAllowance / totalDays).toLocaleString('en-NG')}
                          </td>
                          <td className="py-2 text-right font-mono font-semibold text-slate-900">
                            ₦{pricing.chauffeurAllowance.toLocaleString('en-NG')}
                          </td>
                        </tr>
                        {includeSecurityEscort && (
                          <tr>
                            <td className="py-2 font-medium text-slate-900">
                              Tactical Police / MOPOL Armed Escort Patrol
                            </td>
                            <td className="py-2 text-center">{totalDays}</td>
                            <td className="py-2 text-right font-mono">
                              ₦{Math.round(pricing.escortNaira / totalDays).toLocaleString('en-NG')}
                            </td>
                            <td className="py-2 text-right font-mono font-semibold text-slate-900">
                              ₦{pricing.escortNaira.toLocaleString('en-NG')}
                            </td>
                          </tr>
                        )}
                        {includeAirportProtocol && (
                          <tr>
                            <td className="py-2 font-medium text-slate-900">
                              Airport VIP Protocol & Fast-Track Meet & Greet
                            </td>
                            <td className="py-2 text-center">1</td>
                            <td className="py-2 text-right font-mono">₦{pricing.protocolFee.toLocaleString('en-NG')}</td>
                            <td className="py-2 text-right font-mono font-semibold text-slate-900">
                              ₦{pricing.protocolFee.toLocaleString('en-NG')}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>

                    {/* Financial Summary */}
                    <div className="pt-3 border-t border-slate-200 flex justify-end">
                      <div className="w-full sm:w-72 space-y-1.5 text-xs">
                        <div className="flex justify-between text-slate-600">
                          <span>Subtotal:</span>
                          <span className="font-mono font-medium">₦{pricing.subtotal.toLocaleString('en-NG')}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>VAT (7.5%):</span>
                          <span className="font-mono font-medium">₦{pricing.vatAmount.toLocaleString('en-NG')}</span>
                        </div>
                        <div className="pt-2 border-t border-slate-300 flex justify-between items-baseline font-bold text-slate-950 text-sm">
                          <span>{docTypeToGenerate === 'receipt' ? 'Total Paid:' : 'Total Payable:'}</span>
                          <span className="font-mono text-base text-emerald-700">
                            ₦{pricing.totalAmount.toLocaleString('en-NG')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Clearance or Bank Remittance */}
                  {docTypeToGenerate === 'receipt' ? (
                    <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-3.5 flex items-center justify-between text-xs text-emerald-950">
                      <div>
                        <span className="font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Payment Settled & Official FIRS Tax Cleared</span>
                        </span>
                        <span className="text-[11px] text-emerald-800/80 font-mono mt-0.5 block">
                          Payment Ref: {paymentReference} · Method: {paymentMethod === 'card' ? 'Online Card' : 'NIP Direct Transfer'}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded border border-emerald-300">
                        CLEARED
                      </span>
                    </div>
                  ) : (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-700 space-y-1">
                      <span className="font-bold text-slate-900 block">Bank Remittance Accounts:</span>
                      <p>Access Bank: 0192847291 (Pyda Movers & Logistics Ltd)</p>
                      <p>Zenith Bank: 1019283746 (Pyda Movers Nigeria Ltd)</p>
                    </div>
                  )}

                  {/* Simple Legal Footer */}
                  <div className="pt-3 border-t border-slate-100 text-center text-slate-400 text-[10px]">
                    This official receipt is issued by Pyda Movers & Logistics Ltd. Registered with Federal Ministry of Works & Housing (FMWH/RL-0892).
                  </div>
                </div>

                {/* Back to Edit Button */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => setActiveStep('configure')}
                    className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Back to Edit Vehicle / Route Parameters</span>
                  </button>

                  <button
                    onClick={onClose}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-6 py-2.5 rounded-xl transition-all"
                  >
                    Close Window
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Floating Toast Notification */}
        {toastMessage && (
          <div className="absolute bottom-4 right-4 z-50 bg-[#0f2e1b] border-2 border-[#83b735] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-[#83b735] shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};
