import React, { useState, useMemo, useRef } from 'react';
import {
  Car,
  Shield,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Calendar,
  Clock,
  ArrowRight,
  FileText,
  Receipt,
  Download,
  Phone,
  Sparkles,
  Users,
  Briefcase,
  Layers,
  ChevronRight,
  Check,
  Edit3,
  Sliders,
  RotateCcw,
  ArrowLeftRight,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { CAR_HIRE_VEHICLES, POPULAR_CAR_HIRE_ROUTES } from '../data/carHireData';
import { CarHireTripType, CarHireVehicle, CarHireCustomConfig } from '../types';

interface CarHireSectionProps {
  onOpenBookingModal: (tripType?: CarHireTripType, vehicleId?: string, customConfig?: CarHireCustomConfig) => void;
  onNavigateToVault?: (docId?: string) => void;
}

export const CarHireSection: React.FC<CarHireSectionProps> = ({
  onOpenBookingModal,
  onNavigateToVault,
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'coaster' | 'bus' | 'suv' | 'sedan' | 'escort'>('all');
  const [previewTripType, setPreviewTripType] = useState<CarHireTripType>('intra_state');

  // Ref for scrolling directly to the Manual Configurator
  const editorRef = useRef<HTMLDivElement>(null);

  // Manual Edit State: Vehicle Type & Year
  const [editTripType, setEditTripType] = useState<CarHireTripType>('intra_state');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('prado-txl-2024');
  const [customVehicleName, setCustomVehicleName] = useState<string>('Toyota Land Cruiser Prado TXL 4x4 (2024)');
  const [customVehicleCategory, setCustomVehicleCategory] = useState<'suv' | 'sedan' | 'bus' | 'coaster' | 'escort' | 'custom'>('suv');
  const [customVehicleYear, setCustomVehicleYear] = useState<string>('2024');
  const [isBespokeVehicle, setIsBespokeVehicle] = useState<boolean>(false);

  // Manual Edit State: Location
  const [originCity, setOriginCity] = useState<string>('Lagos State');
  const [originLocation, setOriginLocation] = useState<string>('Victoria Island / Ikoyi, Lagos');
  const [destinationCity, setDestinationCity] = useState<string>('Lagos State');
  const [destinationLocation, setDestinationLocation] = useState<string>('MMIA International Terminal, Ikeja');

  // Manual Edit State: Date
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  const [pickupDate, setPickupDate] = useState<string>(todayStr);
  const [pickupTime, setPickupTime] = useState<string>('08:00');
  const [returnDate, setReturnDate] = useState<string>(tomorrowStr);
  const [returnTime, setReturnTime] = useState<string>('20:00');
  const [totalDays, setTotalDays] = useState<number>(1);

  // Manual Edit State: Price
  const [manualDailyRate, setManualDailyRate] = useState<number>(145000);
  const [isPriceCustomized, setIsPriceCustomized] = useState<boolean>(false);
  const [highlightToast, setHighlightToast] = useState<string | null>(null);

  // Active vehicle reference
  const activeVehicle = useMemo(() => {
    return CAR_HIRE_VEHICLES.find((v) => v.id === selectedVehicleId) || CAR_HIRE_VEHICLES[0];
  }, [selectedVehicleId]);

  // Standard tariff rate for selected vehicle
  const standardTariff = useMemo(() => {
    if (!activeVehicle) return 145000;
    return editTripType === 'inter_state'
      ? activeVehicle.dailyRateInterStateNaira
      : activeVehicle.dailyRateIntraStateNaira;
  }, [activeVehicle, editTripType]);

  // Handle trip type switch in editor
  const handleEditTripTypeChange = (type: CarHireTripType) => {
    setEditTripType(type);
    if (!isPriceCustomized && activeVehicle) {
      setManualDailyRate(
        type === 'inter_state'
          ? activeVehicle.dailyRateInterStateNaira
          : activeVehicle.dailyRateIntraStateNaira
      );
    }
    if (type === 'inter_state') {
      setDestinationCity('Abuja FCT');
      setDestinationLocation('Maitama District, Abuja');
      if (totalDays === 1) setTotalDays(2);
    } else {
      setDestinationCity('Lagos State');
      setDestinationLocation('MMIA International Terminal, Ikeja');
    }
  };

  // Handle vehicle selection in editor
  const handleSelectVehicleInEditor = (vehicleId: string) => {
    if (vehicleId === 'custom') {
      setIsBespokeVehicle(true);
      setSelectedVehicleId('custom');
      setCustomVehicleName('Bespoke Executive Luxury Model');
      setCustomVehicleCategory('custom');
      return;
    }
    const found = CAR_HIRE_VEHICLES.find((v) => v.id === vehicleId);
    if (found) {
      setIsBespokeVehicle(false);
      setSelectedVehicleId(found.id);
      setCustomVehicleName(found.name);
      setCustomVehicleCategory(found.category);
      if (found.modelYear) {
        setCustomVehicleYear(found.modelYear);
      }
      if (!isPriceCustomized) {
        setManualDailyRate(
          editTripType === 'inter_state'
            ? found.dailyRateInterStateNaira
            : found.dailyRateIntraStateNaira
        );
      }
    }
  };

  // Handle setting model year
  const handleSetModelYear = (year: string) => {
    setCustomVehicleYear(year);
    setCustomVehicleName((prev) => {
      const yearRegex = /\b(202[0-9])\b/;
      if (yearRegex.test(prev)) {
        return prev.replace(yearRegex, year);
      }
      return `${prev} (${year} Model)`;
    });
  };

  // Handle clicking "Manual Edit" on a vehicle card
  const handleSelectForManualEdit = (vehicle: CarHireVehicle) => {
    setIsBespokeVehicle(false);
    setSelectedVehicleId(vehicle.id);
    setCustomVehicleName(vehicle.name);
    setCustomVehicleCategory(vehicle.category);
    if (vehicle.modelYear) {
      setCustomVehicleYear(vehicle.modelYear);
    }
    setManualDailyRate(
      editTripType === 'inter_state'
        ? vehicle.dailyRateInterStateNaira
        : vehicle.dailyRateIntraStateNaira
    );
    setIsPriceCustomized(false);
    setHighlightToast(`Loaded ${vehicle.name} into Manual Configurator`);
    setTimeout(() => setHighlightToast(null), 3500);

    if (editorRef.current) {
      editorRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Handle date changes
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

  // Adjust duration by +/- days
  const handleAdjustDays = (delta: number) => {
    const newDays = Math.max(1, totalDays + delta);
    setTotalDays(newDays);
    try {
      const d = new Date(pickupDate);
      d.setDate(d.getDate() + newDays - 1);
      setReturnDate(d.toISOString().split('T')[0]);
    } catch {
      // ignore
    }
  };

  // Swap pickup & destination locations
  const handleSwapLocations = () => {
    const tempCity = originCity;
    const tempLoc = originLocation;
    setOriginCity(destinationCity);
    setOriginLocation(destinationLocation);
    setDestinationCity(tempCity);
    setDestinationLocation(tempLoc);
  };

  // Live Pricing Calculation
  const livePricing = useMemo(() => {
    const isInter = editTripType === 'inter_state';
    const rate = manualDailyRate > 0 ? manualDailyRate : standardTariff;
    const baseHire = rate * totalDays;
    const tollAllowance = isInter ? (activeVehicle?.tollAllowanceInterStateNaira || 18000) : 5000;
    const chauffeurAllowance = (isInter ? 20000 : 15000) * totalDays;
    const subtotal = baseHire + tollAllowance + chauffeurAllowance;
    const vat = Math.round(subtotal * 0.075);
    const total = subtotal + vat;
    return {
      rate,
      baseHire,
      tollAllowance,
      chauffeurAllowance,
      subtotal,
      vat,
      total,
    };
  }, [editTripType, manualDailyRate, standardTariff, totalDays, activeVehicle]);

  // Build custom config payload
  const buildCustomConfig = (docType?: 'invoice' | 'receipt'): CarHireCustomConfig => {
    return {
      tripType: editTripType,
      vehicleId: selectedVehicleId,
      customVehicleName: customVehicleName.trim() || activeVehicle?.name || 'Executive Chauffeur Vehicle',
      customVehicleCategory,
      originCity,
      originAddress: originLocation,
      destinationCity,
      destinationAddress: destinationLocation,
      dailyRateNaira: manualDailyRate,
      pickupDate,
      returnDate,
      pickupTime,
      returnTime,
      totalDays,
      isManualOverride: isPriceCustomized || isBespokeVehicle || customVehicleName !== activeVehicle?.name,
      docType
    };
  };

  const handleBookWithCustomSettings = () => {
    onOpenBookingModal(editTripType, selectedVehicleId, buildCustomConfig());
  };

  const handleInvoiceWithCustomSettings = () => {
    onOpenBookingModal(editTripType, selectedVehicleId, buildCustomConfig('invoice'));
  };

  const handleReceiptWithCustomSettings = () => {
    onOpenBookingModal(editTripType, selectedVehicleId, buildCustomConfig('receipt'));
  };

  const handleResetToStandard = () => {
    setIsPriceCustomized(false);
    setIsBespokeVehicle(false);
    if (activeVehicle) {
      setCustomVehicleName(activeVehicle.name);
      setCustomVehicleCategory(activeVehicle.category);
      setManualDailyRate(
        editTripType === 'inter_state'
          ? activeVehicle.dailyRateInterStateNaira
          : activeVehicle.dailyRateIntraStateNaira
      );
    }
  };

  const filteredVehicles = CAR_HIRE_VEHICLES.filter((v) => {
    if (activeCategory === 'all') return true;
    return v.category === activeCategory;
  });

  return (
    <section id="car-hire-services" className="py-16 lg:py-24 bg-slate-950 text-white relative">
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950/20 via-slate-950 to-slate-950 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-[#83b735] px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider">
            <Car className="w-3.5 h-3.5" />
            <span>Executive Mobility & Protocol Fleet</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Inter & Intra-State Car Hire Services
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Chauffeur-driven luxury sedans, heavy 4x4 SUVs, armored ballistic patrols, and executive VIP buses. Vetted protocol drivers, satellite GPS telematics, and automated Pro-Forma Commercial Invoicing with FIRS Tax Clearance Receipts.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (editorRef.current) {
                  editorRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              className="bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
            >
              <Edit3 className="w-4 h-4 text-amber-400" />
              <span>Manual Customizer (Edit Vehicle, Route, Price & Date)</span>
            </button>
          </div>
        </div>

        {/* Intra-State vs Inter-State Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Intra-State Card */}
          <div className="bg-gradient-to-br from-slate-900/90 to-slate-950 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />

            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#83b735] bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                Metropolitan Charters
              </span>
              <span className="text-xs text-slate-400 font-mono">From ₦85,000 / Day</span>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white">Intra-State City Charters</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Full-day (12 hrs) dedicated chauffeur service within Lagos, Abuja FCT, Port Harcourt, or Kano. Ideal for corporate roadshows, diplomatic airport receptions, executive boardroom commutes, and luxury weddings.
              </p>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-300">
              {[
                'Unlimited city stops with zero fuel hassle',
                'Dedicated uniformed protocol driver with defensive driving badge',
                'MMIA & Nnamdi Azikiwe Airport meet-and-greet reception',
                'Instant Official Tax Clearance Receipt with FIRS 7.5% compliance'
              ].map((feat, i) => (
                <li key={i} className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#83b735] shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>

            <div className="pt-2">
              <div className="inline-flex rounded-xl bg-[#83b735] p-0.5 shadow-lg items-center">
                <button
                  onClick={() => onOpenBookingModal('intra_state')}
                  className="bg-transparent hover:bg-black/10 text-slate-950 font-black text-xs sm:text-sm px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all transform active:scale-95"
                  id="hire-intra-state-btn"
                >
                  <span>Book Intra-State Charter</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onOpenBookingModal('intra_state', undefined, { docType: 'receipt' } as any)}
                  className="border-l border-slate-950/20 text-slate-950/80 hover:text-slate-950 hover:bg-black/10 font-bold text-xs px-3 py-2.5 rounded-r-lg transition-all"
                  title="Generate Official Receipt"
                >
                  <span>Receipt</span>
                </button>
              </div>
            </div>
          </div>

          {/* Inter-State Card */}
          <div className="bg-gradient-to-br from-slate-900/90 to-slate-950 border border-amber-500/30 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors" />

            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                Highway Corridors (36 States)
              </span>
              <span className="text-xs text-slate-400 font-mono">From ₦165,000 / Day</span>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white">Inter-State Long-Distance Transit</h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Seamless highway travel between Nigerian states (Lagos ↔ Abuja, Abuja ↔ Kaduna/Jos, Lagos ↔ Port Harcourt). Fully equipped with highway toll allocations, driver per-diem, and optional armed security escort convoys.
              </p>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-300">
              {[
                'Federal highway toll passes & electronic express lane vouchers',
                'Senior interstate highway captain with route safety clearance',
                'Satellite GPS telematics monitoring with SOS emergency transponder',
                'Official Pro-Forma Commercial Invoicing for corporate procurement'
              ].map((feat, i) => (
                <li key={i} className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>

            <div className="pt-2">
              <div className="inline-flex rounded-xl bg-amber-500 p-0.5 shadow-lg items-center">
                <button
                  onClick={() => onOpenBookingModal('inter_state')}
                  className="bg-transparent hover:bg-black/10 text-slate-950 font-black text-xs sm:text-sm px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all transform active:scale-95"
                  id="hire-inter-state-btn"
                >
                  <span>Book Inter-State Highway</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onOpenBookingModal('inter_state', undefined, { docType: 'invoice' } as any)}
                  className="border-l border-slate-950/20 text-slate-950/80 hover:text-slate-950 hover:bg-black/10 font-bold text-xs px-3 py-2.5 rounded-r-lg transition-all"
                  title="Generate Pro-Forma Invoice"
                >
                  <span>Invoice</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MANUAL CUSTOM TRIP & RATE CONFIGURATOR (Direct Manual Editing Hub)        */}
        {/* ========================================================================= */}
        <div
          ref={editorRef}
          id="car-hire-manual-editor"
          className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Toast Alert when vehicle loaded from fleet */}
          {highlightToast && (
            <div className="p-3 bg-amber-500/20 border border-amber-500/40 rounded-xl text-xs text-amber-300 font-bold flex items-center gap-2 animate-pulse">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{highlightToast}</span>
            </div>
          )}

          {/* Configurator Header & Status Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-2">
                <Edit3 className="w-3.5 h-3.5" />
                <span>Interactive Manual Configurator • Live Rate & Schedule Editor</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Manual Edit: Vehicle Type, Route, Price & Dates
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mt-1">
                Directly edit vehicle type, pick-up and destination locations, negotiated daily rate, and rental schedule. Subtotal, highway tolls, and FIRS 7.5% VAT recalculate in real-time.
              </p>
            </div>

            {/* Mode Switcher & Reset Button */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleEditTripTypeChange('intra_state')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    editTripType === 'intra_state'
                      ? 'bg-emerald-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Intra-State (Metro)
                </button>
                <button
                  type="button"
                  onClick={() => handleEditTripTypeChange('inter_state')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    editTripType === 'inter_state'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Inter-State (Highway)
                </button>
              </div>

              <button
                type="button"
                onClick={handleResetToStandard}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                title="Reset to default fleet tariff rates"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                <span>Reset Tariff</span>
              </button>
            </div>
          </div>

          {/* 4 Interactive Manual Edit Modules (Grid) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* MODULE 1: VEHICLE TYPE MANUAL EDIT */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5" />
                    <span>1. Vehicle Type</span>
                  </label>
                  <span className="text-[10px] bg-slate-950 text-slate-400 font-mono px-2 py-0.5 rounded border border-slate-800">
                    {activeVehicle.seats} Seats
                  </span>
                </div>

                <div className="space-y-2 mt-2">
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">Preset Fleet Model:</span>
                    <select
                      value={selectedVehicleId}
                      onChange={(e) => handleSelectVehicleInEditor(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white outline-none focus:border-amber-400"
                    >
                      {CAR_HIRE_VEHICLES.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name} ({v.category.toUpperCase()})
                        </option>
                      ))}
                      <option value="custom">+ Bespoke / Custom Vehicle Model</option>
                    </select>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">Manual Vehicle Name / Model:</span>
                    <input
                      type="text"
                      value={customVehicleName}
                      onChange={(e) => setCustomVehicleName(e.target.value)}
                      placeholder="e.g. Toyota Coaster 30-Seater Executive Coach (2025 Model)"
                      className="w-full bg-slate-950 border border-amber-500/40 rounded-xl px-2.5 py-2 text-xs text-white outline-none focus:border-amber-400 font-bold"
                    />
                  </div>

                  {/* Model Year / Years Selector */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] text-slate-400">Model Year / Generation:</span>
                      <span className="text-[10px] font-mono text-amber-400 font-bold">{customVehicleYear}</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {['2025', '2024', '2023', '2022', '2021', '2020'].map((yr) => (
                        <button
                          key={yr}
                          type="button"
                          onClick={() => handleSetModelYear(yr)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono transition-all ${
                            customVehicleYear === yr
                              ? 'bg-amber-500 text-slate-950 shadow-md ring-1 ring-amber-400'
                              : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                          }`}
                        >
                          {yr}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {[
                      { id: 'suv', label: 'SUV' },
                      { id: 'sedan', label: 'Sedan' },
                      { id: 'coaster', label: 'Coaster Bus' },
                      { id: 'bus', label: 'VIP Shuttle' },
                      { id: 'escort', label: 'Escort' }
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCustomVehicleCategory(cat.id as any)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                          customVehicleCategory === cat.id
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 border-t border-slate-800/80 pt-2 flex items-center justify-between">
                <span>Luggage: <strong className="text-slate-300">{activeVehicle.luggageCapacity.split('+')[0]}</strong></span>
                <span className="text-[#83b735] font-bold">Chauffeur Included</span>
              </div>
            </div>

            {/* MODULE 2: LOCATION MANUAL EDIT */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>2. Route & Locations</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleSwapLocations}
                    className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-bold"
                    title="Swap Origin and Destination"
                  >
                    <ArrowLeftRight className="w-3 h-3" />
                    <span>Swap</span>
                  </button>
                </div>

                <div className="space-y-2 mt-2">
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">Pick-up Location & City:</span>
                    <input
                      type="text"
                      value={originLocation}
                      onChange={(e) => setOriginLocation(e.target.value)}
                      placeholder="e.g. Victoria Island / Ikoyi, Lagos"
                      className="w-full bg-slate-950 border border-emerald-500/40 rounded-xl px-2.5 py-2 text-xs text-white outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">Destination / Corridor:</span>
                    <input
                      type="text"
                      value={destinationLocation}
                      onChange={(e) => setDestinationLocation(e.target.value)}
                      placeholder="e.g. Maitama District, Abuja FCT"
                      className="w-full bg-slate-950 border border-emerald-500/40 rounded-xl px-2.5 py-2 text-xs text-white outline-none focus:border-emerald-400"
                    />
                  </div>

                  {/* Quick City Presets */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {[
                      { name: 'Lagos VI', orig: 'Victoria Island, Lagos', dest: 'MMIA Terminal, Ikeja' },
                      { name: 'Abuja FCT', orig: 'Maitama, Abuja FCT', dest: 'Nnamdi Azikiwe Airport' },
                      { name: 'PH GRA', orig: 'GRA Phase 2, Port Harcourt', dest: 'Trans-Amadi, PH' }
                    ].map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => {
                          setOriginLocation(preset.orig);
                          setDestinationLocation(preset.dest);
                        }}
                        className="px-2 py-0.5 rounded-lg text-[10px] bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-emerald-300 border border-slate-800 transition-colors"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 border-t border-slate-800/80 pt-2 flex items-center justify-between">
                <span>Trip Mode:</span>
                <span className="font-bold text-slate-200">
                  {editTripType === 'inter_state' ? 'Inter-State Highway' : 'Intra-State Metro'}
                </span>
              </div>
            </div>

            {/* MODULE 3: PRICE MANUAL EDIT */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-[#83b735] flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>3. Price (Daily Tariff)</span>
                  </label>
                  {isPriceCustomized ? (
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                      Custom Rate
                    </span>
                  ) : (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded-full border border-emerald-500/30">
                      Standard Tariff
                    </span>
                  )}
                </div>

                <div className="space-y-2 mt-2">
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">Manual Daily Base Rate (₦/Day):</span>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-xs font-mono font-bold text-slate-400">₦</span>
                      <input
                        type="number"
                        min="10000"
                        step="5000"
                        value={manualDailyRate || ''}
                        onChange={(e) => {
                          setManualDailyRate(Number(e.target.value));
                          setIsPriceCustomized(true);
                        }}
                        placeholder="e.g. 145000"
                        className="w-full bg-slate-950 border border-[#83b735]/60 rounded-xl pl-8 pr-3 py-2 text-xs font-mono font-bold text-[#83b735] outline-none focus:border-[#83b735]"
                      />
                    </div>
                  </div>

                  {/* Price Increment / Quick Adjustment Chips */}
                  <div className="flex flex-wrap items-center gap-1 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setManualDailyRate((prev) => Math.max(10000, prev - 10000));
                        setIsPriceCustomized(true);
                      }}
                      className="px-2 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-[10px] font-bold text-slate-300 border border-slate-800"
                    >
                      -₦10k
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setManualDailyRate((prev) => prev + 10000);
                        setIsPriceCustomized(true);
                      }}
                      className="px-2 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-[10px] font-bold text-slate-300 border border-slate-800"
                    >
                      +₦10k
                    </button>
                    {[85000, 120000, 165000, 245000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => {
                          setManualDailyRate(amt);
                          setIsPriceCustomized(true);
                        }}
                        className="px-1.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-[10px] font-mono text-amber-300 border border-slate-800"
                      >
                        ₦{(amt / 1000).toFixed(0)}k
                      </button>
                    ))}
                  </div>

                  <div className="text-[11px] text-slate-400">
                    Standard Tariff: <strong className="text-slate-200">₦{standardTariff.toLocaleString('en-NG')}/day</strong>
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 border-t border-slate-800/80 pt-2 flex items-center justify-between">
                <span>Base Subtotal:</span>
                <span className="font-mono font-bold text-white">₦{livePricing.baseHire.toLocaleString('en-NG')}</span>
              </div>
            </div>

            {/* MODULE 4: DATE MANUAL EDIT */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>4. Rental Dates</span>
                  </label>
                  <span className="text-[10px] bg-cyan-950 text-cyan-300 font-bold px-2 py-0.5 rounded-full border border-cyan-800">
                    {totalDays} Day{totalDays > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="space-y-2 mt-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[11px] text-slate-400 block mb-1">Pick-Up Date:</span>
                      <input
                        type="date"
                        value={pickupDate}
                        onChange={(e) => handleDateChange('pickup', e.target.value)}
                        className="w-full bg-slate-950 border border-cyan-500/40 rounded-xl px-2 py-1.5 text-xs text-white outline-none focus:border-cyan-400 font-mono"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block mb-1">Pick-Up Time:</span>
                      <input
                        type="time"
                        value={pickupTime}
                        onChange={(e) => setPickupTime(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-white outline-none focus:border-cyan-400 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">Return Date:</span>
                    <input
                      type="date"
                      value={returnDate}
                      onChange={(e) => handleDateChange('return', e.target.value)}
                      className="w-full bg-slate-950 border border-cyan-500/40 rounded-xl px-2 py-1.5 text-xs text-white outline-none focus:border-cyan-400 font-mono"
                    />
                  </div>

                  {/* Duration Stepper & Presets */}
                  <div className="flex items-center gap-2 pt-1">
                    <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                      <button
                        type="button"
                        onClick={() => handleAdjustDays(-1)}
                        className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center text-xs"
                      >
                        -
                      </button>
                      <span className="px-2 font-mono font-bold text-xs text-cyan-300">
                        {totalDays}d
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAdjustDays(1)}
                        className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center text-xs"
                      >
                        +
                      </button>
                    </div>

                    {[3, 7, 14].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => {
                          setTotalDays(d);
                          try {
                            const dateObj = new Date(pickupDate);
                            dateObj.setDate(dateObj.getDate() + d - 1);
                            setReturnDate(dateObj.toISOString().split('T')[0]);
                          } catch {
                            // ignore
                          }
                        }}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                          totalDays === d
                            ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                            : 'bg-slate-950 text-slate-400 hover:text-cyan-300 border-slate-800'
                        }`}
                      >
                        {d}d
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 border-t border-slate-800/80 pt-2 flex items-center justify-between">
                <span>Schedule:</span>
                <span className="font-mono text-cyan-300">{pickupDate} → {returnDate}</span>
              </div>
            </div>

          </div>

          {/* Real-time Calculation Breakdown & Direct Action Panel */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-inner">
            
            {/* Live Breakdown Details */}
            <div className="space-y-2 w-full lg:w-auto">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-black uppercase text-amber-400">
                  Custom Quotation Summary:
                </span>
                <span className="text-xs font-bold text-white bg-slate-900 px-2.5 py-0.5 rounded-lg border border-slate-700">
                  {customVehicleName}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  • {originLocation.split(',')[0]} → {destinationLocation.split(',')[0]}
                </span>
                <span className="text-xs text-cyan-300 font-mono">
                  • {totalDays} Day{totalDays > 1 ? 's' : ''}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                <span>
                  Base Rate: <strong className="text-white font-mono">₦{livePricing.rate.toLocaleString('en-NG')}/d</strong>
                </span>
                <span>•</span>
                <span>
                  Tolls & Fuel Allowance: <strong className="text-white font-mono">₦{livePricing.tollAllowance.toLocaleString('en-NG')}</strong>
                </span>
                <span>•</span>
                <span>
                  Chauffeur Allowance: <strong className="text-white font-mono">₦{livePricing.chauffeurAllowance.toLocaleString('en-NG')}</strong>
                </span>
                <span>•</span>
                <span>
                  VAT 7.5%: <strong className="text-white font-mono">₦{livePricing.vat.toLocaleString('en-NG')}</strong>
                </span>
              </div>
            </div>

            {/* Total Display & Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto justify-end">
              <div className="text-right sm:pr-2">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
                  Total Payable (All-Inclusive)
                </span>
                <span className="font-mono font-black text-2xl sm:text-3xl text-[#83b735]">
                  ₦{livePricing.total.toLocaleString('en-NG')}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleBookWithCustomSettings}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm px-5 py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-95 flex-1 sm:flex-initial"
                >
                  <Car className="w-4 h-4 stroke-[2.5]" />
                  <span>Book Custom Trip</span>
                </button>

                {/* Merged Document Generation Control (Single Unified Document Icon) */}
                <div className="inline-flex rounded-xl bg-slate-900 border border-slate-700/80 p-0.5 overflow-hidden flex-1 sm:flex-initial items-center">
                  <button
                    type="button"
                    onClick={handleInvoiceWithCustomSettings}
                    className="hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-xs sm:text-sm px-3.5 py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all"
                    title="Generate Pro-Forma Invoice"
                  >
                    <FileText className="w-4 h-4 text-amber-400" />
                    <span>Pro-Forma Invoice</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleReceiptWithCustomSettings}
                    className="hover:bg-emerald-900/40 text-emerald-300 font-bold text-xs sm:text-sm px-3.5 py-2.5 rounded-lg flex items-center justify-center gap-1 transition-all border-l border-slate-800"
                    title="Generate Settled Official Receipt"
                  >
                    <span>Official Receipt</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Fleet Filter Bar & Trip Rate Toggle */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-thin">
            {[
              { id: 'all', label: 'All Fleet Vehicles' },
              { id: 'coaster', label: 'Coaster Buses (26–32 Seats)' },
              { id: 'bus', label: 'VIP Shuttles (14-Seater)' },
              { id: 'suv', label: 'Executive SUVs' },
              { id: 'sedan', label: 'Luxury Sedans' },
              { id: 'escort', label: 'Escort & Chase 4x4' }
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeCategory === cat.id
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Pricing Toggle Mode */}
          <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
            <span className="text-[10px] text-slate-400 font-bold px-2 uppercase tracking-wider">
              Display Rates:
            </span>
            <button
              onClick={() => setPreviewTripType('intra_state')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                previewTripType === 'intra_state'
                  ? 'bg-emerald-500 text-slate-950'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Intra-State
            </button>
            <button
              onClick={() => setPreviewTripType('inter_state')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                previewTripType === 'inter_state'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Inter-State
            </button>
          </div>
        </div>

        {/* Fleet Vehicle Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map((vehicle) => {
            const currentDailyRate =
              previewTripType === 'inter_state'
                ? vehicle.dailyRateInterStateNaira
                : vehicle.dailyRateIntraStateNaira;

            return (
              <div
                key={vehicle.id}
                className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden hover:border-slate-700 transition-all shadow-xl flex flex-col justify-between group"
              >
                <div>
                  {/* Vehicle Image */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
                    <img
                      src={vehicle.imageUrl}
                      alt={vehicle.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700/80 text-[10px] font-mono text-amber-300">
                      Plate: {vehicle.plateNumberExample}
                    </div>

                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      {vehicle.modelYear && (
                        <div className="bg-slate-950/90 backdrop-blur-md text-amber-300 font-mono text-[10px] font-bold px-2 py-0.5 rounded-lg border border-amber-500/40 shadow">
                          {vehicle.modelYear} Model
                        </div>
                      )}
                      {vehicle.armoredEscortAvailable && (
                        <div className="bg-amber-500/90 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-lg shadow flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          <span className="hidden sm:inline">Armored</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 sm:p-6 space-y-4">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                        {vehicle.category === 'coaster' && (
                          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                            Coaster Coach (30-Seater)
                          </span>
                        )}
                        {vehicle.modelYear && (
                          <span className="bg-slate-800 text-slate-300 border border-slate-700 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full">
                            {vehicle.modelYear} Series
                          </span>
                        )}
                      </div>
                      <h4 className="font-black text-white text-base sm:text-lg group-hover:text-amber-400 transition-colors">
                        {vehicle.name}
                      </h4>
                      <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                        {vehicle.description}
                      </p>
                    </div>

                    {/* Specs Badges */}
                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950 p-3 rounded-2xl border border-slate-800/80">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Seating Capacity</span>
                        <span className="font-bold text-white flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-amber-400" />
                          <span>{vehicle.seats} Passengers</span>
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Luggage Space</span>
                        <span className="font-bold text-slate-300 text-[11px] truncate block">
                          {vehicle.luggageCapacity}
                        </span>
                      </div>
                    </div>

                    {/* Top Amenities */}
                    <ul className="space-y-1.5 text-[11px] text-slate-300">
                      {vehicle.features.slice(0, 3).map((feat, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-[#83b735] shrink-0" />
                          <span className="truncate">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card Footer with Price and Actions */}
                <div className="p-5 sm:p-6 pt-0 space-y-3">
                  <div className="flex items-center justify-between border-t border-slate-800 pt-3">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">
                        {previewTripType === 'inter_state' ? 'Inter-State Rate' : 'Intra-State Rate'}
                      </span>
                      <span className="font-mono font-black text-xl text-[#83b735]">
                        ₦{currentDailyRate.toLocaleString('en-NG')}
                        <span className="text-[10px] font-normal text-slate-400">/day</span>
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block font-mono">VAT 7.5% Included</span>
                      <span className="text-[10px] text-amber-400 font-bold">Driver Assigned</span>
                    </div>
                  </div>

                  {/* Merged Consolidated Action Bar */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenBookingModal(previewTripType, vehicle.id)}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs py-2.5 px-3 rounded-xl shadow transition-all flex items-center justify-center gap-1.5 active:scale-95"
                      title="Book Fleet or generate Official Receipt"
                    >
                      <Car className="w-3.5 h-3.5" />
                      <span>Book / Receipt</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectForManualEdit(vehicle)}
                      className="bg-slate-950 hover:bg-slate-800 text-amber-400 hover:text-amber-300 border border-amber-500/40 rounded-xl py-2.5 px-2 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                      title="Manual Edit: Custom Route, Rate, Schedule & Vehicle"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                      <span>Edit Tariff</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Official Document Vault Integration Banner */}
        <div className="bg-gradient-to-r from-slate-950 via-emerald-950/40 to-slate-950 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-[#83b735]" />
              <span>Document Vault Automated Integration</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Instant Inter & Intra-State Invoicing & Tax Clearance Receipts
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Every car hire booking automatically compiles an official, tamper-proof Pro-Forma Invoice or Settled Tax Receipt saved directly to your client Document Vault. Includes FIRS statutory VAT allocation (7.5%), highway toll schedules, assigned driver credentials, and publication-quality PDF downloads.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => onOpenBookingModal('intra_state')}
              className="bg-[#83b735] hover:bg-[#92cb3b] text-slate-950 font-black text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-xl flex items-center gap-2 transition-all transform active:scale-95"
            >
              <FileText className="w-4 h-4 stroke-[2.5]" />
              <span>Generate Car Hire Invoice</span>
            </button>

            {onNavigateToVault && (
              <button
                onClick={() => onNavigateToVault('DOC-CHI-2026-891')}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white font-bold text-xs sm:text-sm px-5 py-3.5 rounded-xl flex items-center gap-2 transition-all"
              >
                <span>View Sample in Vault</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>
    </section>
  );
};
