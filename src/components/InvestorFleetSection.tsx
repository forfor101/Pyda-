import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Truck,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Calculator,
  FileText,
  Clock,
  Sparkles,
  Phone,
  MessageCircle,
  Download,
  Building2,
  Calendar,
  Layers,
  ArrowRight,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Gauge,
  Cpu,
  BadgeCheck,
  HandCoins,
  Coins,
  Send,
  UserCheck,
  KeyRound,
  Eye,
  Camera,
  Scale,
  Maximize2,
  FileDown,
  Activity
} from 'lucide-react';
import { FleetPartnerModel, TruckTonnageCategory, InvestorTruckRegistration, TruckSurveyPhoto, DashboardTab } from '../types';
import { TruckSurveyPhotoUploader } from './TruckSurveyPhotoUploader';
import { VehicleHealthMonitor } from './VehicleHealthMonitor';
import { DriverProfilesSection } from './DriverProfilesSection';
import { useCms } from '../context/CmsContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import jsPDF from 'jspdf';
import confetti from 'canvas-confetti';

interface InvestorFleetSectionProps {
  onOpenQuoteModal?: () => void;
  onNavigateToContact?: () => void;
  onNavigateToDashboard?: (tab?: DashboardTab) => void;
}

interface TonnageOption {
  id: TruckTonnageCategory;
  name: string;
  tonnageRange: string;
  typicalMake: string;
  idealUse: string;
  fixedMonthlyPayoutRange: [number, number]; // in Naira
  revShareMonthlyGrossAvg: number; // in Naira
  revShareInvestorNetAvg: number; // in Naira
  spotTripAvgRate: number; // per interstate trip
  annualRoiEstPercent: number;
}

const TONNAGE_DATA: TonnageOption[] = [
  {
    id: '3.5_5_ton',
    name: '3.5 – 5 Ton Box Van / Canter',
    tonnageRange: '3.5 - 5.5 Tons',
    typicalMake: 'Mitsubishi Canter, Isuzu NPR, Hyundai Mighty',
    idealUse: 'Intra-city household moving, express banking deliveries & urban retail cargo',
    fixedMonthlyPayoutRange: [650000, 900000],
    revShareMonthlyGrossAvg: 1600000,
    revShareInvestorNetAvg: 1120000, // 70% net
    spotTripAvgRate: 280000,
    annualRoiEstPercent: 34,
  },
  {
    id: '10_15_ton',
    name: '10 – 15 Ton Enclosed Hauler',
    tonnageRange: '10 - 15 Tons',
    typicalMake: 'Mercedes-Benz Atego, DAF LF, MAN TGL, Isuzu Forward',
    idealUse: 'Corporate office relocation, inter-state FMCG transit & diplomatic moves',
    fixedMonthlyPayoutRange: [1100000, 1550000],
    revShareMonthlyGrossAvg: 2800000,
    revShareInvestorNetAvg: 1960000,
    spotTripAvgRate: 650000,
    annualRoiEstPercent: 38,
  },
  {
    id: '20_30_ton',
    name: '20 – 30 Ton Heavy Hauler / Semi-Trailer',
    tonnageRange: '20 - 30 Tons',
    typicalMake: 'Mack Granite, DAF CF/XF, MAN TGA, Sino Truck Howo',
    idealUse: 'Long-haul interstate corridors (Lagos-Abuja-Kano-PH), industrial warehousing & bulk freight',
    fixedMonthlyPayoutRange: [1800000, 2600000],
    revShareMonthlyGrossAvg: 4800000,
    revShareInvestorNetAvg: 3360000,
    spotTripAvgRate: 1450000,
    annualRoiEstPercent: 42,
  },
  {
    id: '35_ton_lowbed',
    name: '35+ Ton Lowbed / Flatbed Heavy Equipment',
    tonnageRange: '35 - 50 Tons',
    typicalMake: 'Mercedes Actros Heavy, MAN Heavy Haulage, Lowbed 3-Axle',
    idealUse: 'Industrial plant relocation, heavy generators, construction machinery & transformer transport',
    fixedMonthlyPayoutRange: [2400000, 3500000],
    revShareMonthlyGrossAvg: 6200000,
    revShareInvestorNetAvg: 4340000,
    spotTripAvgRate: 2200000,
    annualRoiEstPercent: 45,
  },
  {
    id: 'hiab_crane',
    name: 'HIAB Crane & Self-Loading Truck',
    tonnageRange: '15 - 25 Tons with 5-10T Boom',
    typicalMake: 'DAF/Mercedes with HIAB / Palfinger Crane',
    idealUse: 'Heavy rigging, ATM vault placement, server racks & architectural glass hoisting',
    fixedMonthlyPayoutRange: [1600000, 2300000],
    revShareMonthlyGrossAvg: 4200000,
    revShareInvestorNetAvg: 2940000,
    spotTripAvgRate: 950000,
    annualRoiEstPercent: 40,
  },
];

export const InvestorFleetSection: React.FC<InvestorFleetSectionProps> = ({
  onOpenQuoteModal,
  onNavigateToContact,
  onNavigateToDashboard,
}) => {
  const { cms } = useCms();
  const { company } = cms;
  const { user, customerProfile } = useAuth();

  // Calculator State
  const [selectedTonnage, setSelectedTonnage] = useState<TruckTonnageCategory>('10_15_ton');
  const [selectedModel, setSelectedModel] = useState<FleetPartnerModel>('fixed_monthly_lease');
  const [truckCount, setTruckCount] = useState<number>(1);
  const [vehicleAgeYears, setVehicleAgeYears] = useState<number>(3);

  // Active FAQ Accordion
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Registration Form State
  const [formData, setFormData] = useState<{
    investorName: string;
    phone: string;
    whatsapp: string;
    email: string;
    companyName: string;
    cityLocation: string;
    truckMake: string;
    truckModel: string;
    modelYear: number;
    truckCategory: TruckTonnageCategory;
    tonnageCapacity: number;
    cubicCapacityCbm: number;
    cargoLengthFt: string;
    axleConfig: string;
    payloadKg: number;
    currentOdometerKm: number;
    fuelType: 'diesel' | 'cng' | 'petrol';
    transmission: 'manual' | 'automatic' | 'automated_manual';
    surveyPhotos: TruckSurveyPhoto[];
    bodyType: 'closed_box' | 'curtain_side' | 'flatbed' | 'dropside' | 'refrigerated' | 'hiab_crane';
    plateNumber: string;
    chassisVin: string;
    preferredModel: FleetPartnerModel;
    expectedMonthlyPayoutNaira: number;
    roadworthinessValid: boolean;
    insuranceStatus: 'active' | 'expired' | 'need_pyda_brokerage' | 'need_megatrend_brokerage';
    inspectionCity: string;
    additionalNotes: string;
    agreedToTerms: boolean;
  }>({
    investorName: customerProfile?.fullName || '',
    phone: customerProfile?.phone || '',
    whatsapp: customerProfile?.phone || '',
    email: customerProfile?.email || user?.email || '',
    companyName: customerProfile?.companyName || '',
    cityLocation: 'Lagos',
    truckMake: 'Mercedes-Benz',
    truckModel: 'Atego 1523 (Box Body)',
    modelYear: 2018,
    truckCategory: '10_15_ton',
    tonnageCapacity: 15,
    cubicCapacityCbm: 45,
    cargoLengthFt: '28ft Enclosed Box',
    axleConfig: '4x2 (Single Axle)',
    payloadKg: 15000,
    currentOdometerKm: 148500,
    fuelType: 'diesel',
    transmission: 'manual',
    surveyPhotos: [],
    bodyType: 'closed_box',
    plateNumber: '',
    chassisVin: '',
    preferredModel: 'fixed_monthly_lease',
    expectedMonthlyPayoutNaira: 1350000,
    roadworthinessValid: true,
    insuranceStatus: 'active',
    inspectionCity: 'Lagos (Ikeja / Lekki Hub)',
    additionalNotes: '',
    agreedToTerms: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<InvestorTruckRegistration | null>(null);

  // Current selected tonnage calculations
  const activeTonnageData = useMemo(() => {
    return TONNAGE_DATA.find((t) => t.id === selectedTonnage) || TONNAGE_DATA[1];
  }, [selectedTonnage]);

  const calculations = useMemo(() => {
    let monthlyPerTruck = 0;
    let payoutModelLabel = '';

    if (selectedModel === 'fixed_monthly_lease') {
      monthlyPerTruck = (activeTonnageData.fixedMonthlyPayoutRange[0] + activeTonnageData.fixedMonthlyPayoutRange[1]) / 2;
      payoutModelLabel = 'Guaranteed Monthly Net Payout';
    } else if (selectedModel === 'revenue_share_management') {
      monthlyPerTruck = activeTonnageData.revShareInvestorNetAvg;
      payoutModelLabel = 'Est. Monthly Net Revenue (70% Investor Share)';
    } else {
      // Spot charter based on 3-4 trips/month average
      monthlyPerTruck = activeTonnageData.spotTripAvgRate * 3.2;
      payoutModelLabel = 'Est. Average Monthly Charter Earnings';
    }

    // Apply age factor (slight adjustment for older trucks)
    const ageMultiplier = vehicleAgeYears <= 3 ? 1.05 : vehicleAgeYears <= 7 ? 1.0 : 0.92;
    const adjustedMonthlyPerTruck = Math.round(monthlyPerTruck * ageMultiplier);
    const totalMonthlyEarnings = adjustedMonthlyPerTruck * truckCount;
    const annualEarnings = totalMonthlyEarnings * 12;

    // Maintenance reserve recommendation (handled by Pyda in Model 1, or set aside in Model 2)
    const monthlyMaintSinkingFund = Math.round(totalMonthlyEarnings * 0.08);

    return {
      monthlyPerTruck: adjustedMonthlyPerTruck,
      totalMonthlyEarnings,
      annualEarnings,
      payoutModelLabel,
      monthlyMaintSinkingFund,
      annualRoi: activeTonnageData.annualRoiEstPercent,
    };
  }, [selectedModel, activeTonnageData, truckCount, vehicleAgeYears]);

  // Trigger vibrant celebratory confetti
  const triggerSuccessConfetti = () => {
    try {
      // 1. Center cannon burst
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#fbbf24', '#10b981', '#38bdf8', '#ffffff'],
        disableForReducedMotion: true,
        zIndex: 9999,
      });

      // 2. Dual side fireworks cannons
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 60,
          origin: { x: 0.05, y: 0.7 },
          colors: ['#f59e0b', '#10b981', '#fbbf24', '#ffffff'],
          disableForReducedMotion: true,
          zIndex: 9999,
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 60,
          origin: { x: 0.95, y: 0.7 },
          colors: ['#f59e0b', '#10b981', '#fbbf24', '#ffffff'],
          disableForReducedMotion: true,
          zIndex: 9999,
        });
      }, 250);

      // 3. Gentle golden shower finale
      setTimeout(() => {
        confetti({
          particleCount: 65,
          spread: 100,
          origin: { y: 0.35 },
          colors: ['#f59e0b', '#fbbf24', '#10b981', '#ffffff'],
          scalar: 0.9,
          ticks: 200,
          disableForReducedMotion: true,
          zIndex: 9999,
        });
      }, 550);
    } catch (err) {
      console.warn('Confetti error:', err);
    }
  };

  // Handle Form Submission
  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.investorName || !formData.phone || !formData.truckMake || !formData.plateNumber) {
      alert('Please fill out the required fields: Full Name, Phone, Truck Make, and Plate Number.');
      return;
    }

    setIsSubmitting(true);
    const refCode = `MGT-INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newRecord: InvestorTruckRegistration = {
      id: `INV-REG-${Date.now()}`,
      registeredAt: new Date().toISOString(),
      investorName: formData.investorName,
      phone: formData.phone,
      whatsapp: formData.whatsapp,
      email: formData.email,
      companyName: formData.companyName,
      cityLocation: formData.cityLocation,
      truckMake: formData.truckMake,
      truckModel: formData.truckModel,
      modelYear: formData.modelYear,
      truckCategory: formData.truckCategory,
      tonnageCapacity: formData.tonnageCapacity,
      cubicCapacityCbm: formData.cubicCapacityCbm,
      cargoLengthFt: formData.cargoLengthFt,
      axleConfig: formData.axleConfig,
      payloadKg: formData.payloadKg,
      currentOdometerKm: formData.currentOdometerKm,
      fuelType: formData.fuelType,
      transmission: formData.transmission,
      surveyPhotos: formData.surveyPhotos,
      bodyType: formData.bodyType,
      plateNumber: formData.plateNumber.toUpperCase(),
      chassisVin: formData.chassisVin,
      preferredModel: formData.preferredModel,
      expectedMonthlyPayoutNaira: formData.expectedMonthlyPayoutNaira,
      roadworthinessValid: formData.roadworthinessValid,
      insuranceStatus: formData.insuranceStatus,
      inspectionCity: formData.inspectionCity,
      additionalNotes: formData.additionalNotes,
      status: 'submitted',
      referenceCode: refCode,
    };

    try {
      // 1. Save to Firestore if available
      if (db) {
        await addDoc(collection(db, 'investorRegistrations'), newRecord);
      }
    } catch (err) {
      console.warn('Firestore write warning (offline fallback enabled):', err);
    }

    // 2. Save locally for persistence
    try {
      const existing = localStorage.getItem('megatrend_investor_registrations');
      const list = existing ? JSON.parse(existing) : [];
      localStorage.setItem('megatrend_investor_registrations', JSON.stringify([newRecord, ...list]));
    } catch (e) {
      // ignore
    }

    setSubmissionSuccess(newRecord);
    setIsSubmitting(false);

    // Trigger celebratory confetti animation
    triggerSuccessConfetti();

    // Smoothly scroll to the success card
    setTimeout(() => {
      const el = document.getElementById('register-truck-form');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Generate Official Term Sheet Sample PDF
  const handleDownloadTermSheetPdf = (reg: InvestorTruckRegistration) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    // Header Bar
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(margin, y, contentWidth, 24, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(245, 158, 11); // amber-500
    doc.text('PYDA MOVERS & LOGISTICS LTD', margin + 5, y + 9);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(203, 213, 225);
    doc.text('Fleet Partnership & Truck Asset Management Division • RC: 1498210', margin + 5, y + 15);
    doc.text('HQ: 14B Admiralty Way, Lekki Phase 1, Lagos | Fleet Hotline: +234 806 246 6212', margin + 5, y + 20);

    // Title Tag
    doc.setFillColor(245, 158, 11);
    doc.roundedRect(pageWidth - margin - 55, y + 4, 50, 16, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text('FLEET PARTNER', pageWidth - margin - 50, y + 10);
    doc.setFontSize(7);
    doc.text('TERM SHEET & SLA', pageWidth - margin - 50, y + 15);

    y += 30;

    // Meta Section
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, contentWidth, 15, 1.5, 1.5, 'FD');

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('PARTNERSHIP REF #', margin + 4, y + 4.5);
    doc.text('REGISTRATION DATE', margin + 55, y + 4.5);
    doc.text('MANAGEMENT MODEL', margin + 105, y + 4.5);
    doc.text('STATUS', margin + 155, y + 4.5);

    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(reg.referenceCode, margin + 4, y + 10.5);
    doc.text(new Date(reg.registeredAt).toLocaleDateString('en-GB'), margin + 55, y + 10.5);

    const modelDisplay =
      reg.preferredModel === 'fixed_monthly_lease'
        ? 'Fixed Guaranteed Monthly Lease'
        : reg.preferredModel === 'revenue_share_management'
        ? 'Managed Revenue Share (70/30)'
        : 'Direct Spot Charter';
    doc.text(modelDisplay, margin + 105, y + 10.5);

    doc.setTextColor(5, 150, 105);
    doc.text('PRE-INSPECTION VERIFIED', margin + 155, y + 10.5);

    y += 19;

    // 1. Investor and Asset Details
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('1. ASSET OWNER, VEHICLE SPECIFICATIONS & CAPACITY', margin, y + 2);
    y += 4.5;

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, y, contentWidth, 34, 1.5, 1.5, 'FD');

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Asset Owner / Investor: ${reg.investorName} ${reg.companyName ? `(${reg.companyName})` : ''}`, margin + 4, y + 5.5);
    doc.text(`Contact: ${reg.phone} • Email: ${reg.email} • Location: ${reg.cityLocation}`, margin + 4, y + 11);
    doc.text(`Vehicle: ${reg.truckMake} ${reg.truckModel} (${reg.modelYear}) • Body Type: ${reg.bodyType.replace('_', ' ').toUpperCase()}`, margin + 4, y + 16.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`Capacity Rating: ${reg.tonnageCapacity || 15} Metric Tons • Cargo Volume: ${reg.cubicCapacityCbm || 45} m³ (CBM) • Cargo Length: ${reg.cargoLengthFt || '28ft'}`, margin + 4, y + 22);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Axle Configuration: ${reg.axleConfig || '4x2 Single Axle'} • Payload: ${(reg.payloadKg || 15000).toLocaleString()} kg • Odo: ${(reg.currentOdometerKm || 0).toLocaleString()} km`, margin + 4, y + 27.5);
    doc.text(`FRSC Plate: ${reg.plateNumber} • VIN/Chassis: ${reg.chassisVin || 'Pending Physical Stamp'} • Hub: ${reg.inspectionCity}`, margin + 4, y + 32.5);

    y += 38;

    // 2. Commercial Terms & Payout Schedule
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('2. COMMERCIAL TERMS & SETTLEMENT COMMITMENTS', margin, y + 2);
    y += 4.5;

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, y, contentWidth, 26, 1.5, 1.5, 'FD');

    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('• Payout Schedule & Direct Remittance:', margin + 4, y + 5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('  - Fixed Lease payouts are credited on the 5th working day of each calendar month via direct NIBSS electronic transfer.', margin + 4, y + 9.5);
    doc.text('  - Revenue share contracts are settled bi-weekly on the 5th and 20th with verified manifest audit logs.', margin + 4, y + 14);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('• Operational Asset Protection & Maintenance SLA:', margin + 4, y + 19);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('  - 24/7 dual GPS telematics access, speed limiting (80 km/h), and 100% Goods-in-Transit (GIT) cargo insurance underwritten.', margin + 4, y + 23.5);

    y += 30;

    // 3. Site Survey Photos & Verification Audit
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('3. VEHICLE SITE SURVEY & PHOTO VERIFICATION AUDIT', margin, y + 2);
    y += 4.5;

    doc.setFillColor(240, 253, 244); // emerald-50
    doc.setDrawColor(187, 247, 208); // emerald-200
    doc.roundedRect(margin, y, contentWidth, 20, 1.5, 1.5, 'FD');

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(21, 128, 61);
    const photoCount = reg.surveyPhotos?.length || 0;
    doc.text(`✓ Site Survey Status: ${photoCount} Verified Inspection Angle(s) Recorded`, margin + 4, y + 5.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(22, 101, 52);
    const anglesList = reg.surveyPhotos && reg.surveyPhotos.length > 0
      ? reg.surveyPhotos.map((p) => p.label).join(' • ')
      : 'Front Cabin, Cargo Bed Interior, Left Profile, Rear Tailgate (Standard Verification Set)';
    doc.text(`Inspection Angles Attached: ${anglesList}`, margin + 4, y + 10.5, { maxWidth: contentWidth - 8 });
    doc.text(`Pre-Inspection Clearance Hash: MGT-SURVEY-${Date.now().toString(36).toUpperCase()} • Expedited Workshop Lane Granted`, margin + 4, y + 16.5);

    y += 24;

    // 4. ONBOARDING ROADMAP
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('4. PHYSICAL INSPECTION & ONBOARDING ROADMAP', margin, y + 2);
    y += 4.5;

    doc.setFillColor(254, 252, 232); // amber-50
    doc.setDrawColor(254, 240, 138); // amber-200
    doc.roundedRect(margin, y, contentWidth, 19, 1.5, 1.5, 'FD');

    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(180, 83, 9);
    doc.text('STEP 1: Fleet Workshop Physical Verification Check (42 Points)', margin + 4, y + 5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 53, 15);
    doc.text(`Senior Fleet Inspector will contact you within 24 hours to schedule intake at ${reg.inspectionCity}.`, margin + 4, y + 9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(180, 83, 9);
    doc.text('STEP 2: SLA Execution & Telematics GPS Fitting', margin + 4, y + 13.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 53, 15);
    doc.text('Agreement signing, IoT dual-tracker install, and deployment onto active corporate relocation convoys.', margin + 4, y + 17);

    y += 23;

    // 5. Execution Block
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('5. VERIFICATION ENDORSEMENT', margin, y + 2);
    y += 4;

    const sigW = (contentWidth - 4) / 2;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, y, sigW, 20, 1.5, 1.5, 'FD');
    doc.roundedRect(margin + sigW + 4, y, sigW, 20, 1.5, 1.5, 'FD');

    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('ASSET OWNER ACKNOWLEDGEMENT', margin + 3, y + 4.5);
    doc.text('PYDA FLEET DIRECTORATE', margin + sigW + 7, y + 4.5);

    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text(reg.investorName, margin + 3, y + 10);
    doc.text('Engr. T. O. Balogun (Fleet Operations VP)', margin + sigW + 7, y + 10);

    doc.setFontSize(6);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(5, 150, 105);
    doc.text('✓ Submitted via Fleet Partner Portal with Survey Photos', margin + 3, y + 16);
    doc.text('✓ Verified Corporate Fleet Operator • SLA Active', margin + sigW + 7, y + 16);

    y += 24;

    // Footer
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y, pageWidth - margin, y);
    y += 4;

    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(`Official Fleet Partnership Term Sheet • Document Ref: ${reg.referenceCode} • Confidential`, margin, y);
    doc.text('Pyda Logistics Fleet Network • Lagos | Abuja | Port Harcourt | Kano', pageWidth - margin - 85, y);

    doc.save(`${reg.referenceCode}-Partnership-TermSheet.pdf`);
  };

  const faqs = [
    {
      q: 'How are payment settlements and monthly earnings disbursed?',
      a: 'For Fixed Monthly Lease contracts, guaranteed funds are credited to your designated Nigerian commercial bank account on the 5th of every month. For Revenue Share (70/30) contracts, settlements occur bi-weekly on the 5th and 20th, accompanied by itemized manifest audit reports and client payment reconciliations.',
    },
    {
      q: 'Who is responsible for routine servicing, tire replacement, and repairs?',
      a: 'Under Model 1 (Guaranteed Fixed Lease), Pyda handles routine servicing, fluid changes, and minor operational upkeep. Major powertrain overhauls (engine/gearbox) are reviewed under a clear warranty agreement. Under Model 2 (Revenue Share), maintenance costs are deducted from the gross earnings pool with zero markup at certified Pyda workshop rates.',
    },
    {
      q: 'How do I monitor my truck’s location, mileage, and driver behavior?',
      a: 'Every registered truck is fitted with high-precision dual GPS telematics, speed governors (capped at 80 km/h), and AI dashcams. As an investor, you receive dedicated login credentials to our live Investor Telematics Portal, allowing you to view real-time GPS locations, route histories, and mileage logs 24/7.',
    },
    {
      q: 'What types of cargo and clients will my truck transport?',
      a: 'Pyda exclusively transports verified corporate office relocations, high-value residential moves, diplomatic cargo, and blue-chip FMCG goods. We enforce a strict zero-tolerance policy against illegal contraband, hazardous chemicals, or unauthorized roadside overloading.',
    },
    {
      q: 'What is the contract duration and can I withdraw my truck if needed?',
      a: 'Our standard Fleet Management Agreement runs for 12 months with automatic annual renewal upon mutual agreement. If you wish to withdraw your vehicle, our transparent exit clause requires a 30-day written notice with zero penalty fees once active trips are settled.',
    },
    {
      q: 'What if the truck gets involved in an accident or highway incident?',
      a: 'All cargo is 100% indemnified under Pyda’s Master Goods-In-Transit (GIT) Insurance policy through Leadway Assurance and AIICO. We also require/facilitate comprehensive vehicle insurance with verified tracking-backed recovery protocols to protect the physical vehicle.',
    },
  ];

  return (
    <div className="space-y-16 py-8" id="investor-fleet-section">
      {/* 1. HERO SECTION: INVESTOR VALUE PROPOSITION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border-y border-slate-800 py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="max-w-7xl mx-auto space-y-8 relative z-10">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold font-mono">
              <HandCoins className="w-4 h-4" />
              <span>INVESTOR & FLEET PARTNERSHIP PROGRAM</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Turn Your Trucks Into <span className="text-amber-400">Guaranteed Monthly Passive Income</span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Partner your 3.5T – 35T trucks, box vans, and HIAB cranes with Pyda Movers & Logistics Ltd. We manage drivers, corporate contracts, maintenance, and telematics while delivering reliable monthly returns directly to your bank account.
            </p>
          </div>

          {/* Value Metric Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-950/80 border border-slate-800 p-5 rounded-2xl space-y-1">
              <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">₦650k - ₦3.5M</span>
              <p className="text-xs font-bold text-white">Guaranteed Monthly Net Payouts</p>
              <p className="text-[11px] text-slate-400">Based on tonnage & lease contract</p>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-5 rounded-2xl space-y-1">
              <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">5th of Every Mo.</span>
              <p className="text-xs font-bold text-white">Automated Direct Bank Remittance</p>
              <p className="text-[11px] text-slate-400">Zero delays, itemized statements</p>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-5 rounded-2xl space-y-1">
              <span className="text-2xl sm:text-3xl font-black text-blue-400 font-mono">24/7 Telematics</span>
              <p className="text-xs font-bold text-white">Live GPS & Odometer Portal</p>
              <p className="text-[11px] text-slate-400">Complete visibility for owners</p>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-5 rounded-2xl space-y-1">
              <span className="text-2xl sm:text-3xl font-black text-purple-400 font-mono">100% GIT Cover</span>
              <p className="text-xs font-bold text-white">Zero Cargo Claims Liability</p>
              <p className="text-[11px] text-slate-400">Underwritten by Leadway & AIICO</p>
            </div>
          </div>

          {/* Quick Action Anchor Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href="#investor-calculator"
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm px-6 py-3 rounded-xl shadow-xl flex items-center gap-2 transition-all"
            >
              <Calculator className="w-4 h-4" />
              <span>Calculate Projected ROI</span>
            </a>

            <a
              href="#register-truck-form"
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl border border-slate-700 flex items-center gap-2 transition-all"
            >
              <Truck className="w-4 h-4 text-amber-400" />
              <span>Register Your Truck Now</span>
            </a>

            <a
              href={`https://wa.me/${company.whatsapp || '2348062466212'}?text=Hello%20Pyda%20Fleet%20Directorate,%20I%20am%20an%20investor%20and%20would%20like%20to%20register%20my%20trucks%20for%20management.`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-xs sm:text-sm px-5 py-3 rounded-xl flex items-center gap-2 transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat With Fleet Director</span>
            </a>

            {onNavigateToDashboard && (
              <button
                type="button"
                onClick={() => onNavigateToDashboard('payouts')}
                className="bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 font-black text-xs sm:text-sm px-5 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg"
                id="hero-investor-payout-statements-btn"
              >
                <FileDown className="w-4 h-4 text-amber-400" />
                <span>Download Monthly Commission Statements (PDF)</span>
              </button>
            )}

            <a
              href="#vehicle-health-monitor"
              className="bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/40 font-bold text-xs sm:text-sm px-5 py-3 rounded-xl flex items-center gap-2 transition-all shadow"
              id="hero-vehicle-health-anchor-btn"
            >
              <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>Vehicle Health Monitor & Diagnostics</span>
            </a>

            <a
              href="#investor-driver-profiles"
              className="bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/40 font-bold text-xs sm:text-sm px-5 py-3 rounded-xl flex items-center gap-2 transition-all shadow"
              id="hero-driver-profiles-anchor-btn"
            >
              <UserCheck className="w-4 h-4 text-purple-400" />
              <span>Verified Driver Profiles</span>
            </a>
          </div>
        </div>
      </section>

      {/* EXISTING INVESTOR PAYOUT & STATEMENTS BANNER */}
      {onNavigateToDashboard && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-7 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
                <Coins className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-black text-white">
                    Already an Active Fleet Partner?
                  </h3>
                  <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                    August 2026 Payouts Disbursed
                  </span>
                </div>
                <p className="text-xs text-slate-400 max-w-2xl">
                  Access your verified monthly haulage remittance statements, FIRS tax credit certificates, itemized cargo manifests, and download official signed PDFs directly from your dashboard.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigateToDashboard('payouts')}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-black px-6 py-3 rounded-xl shadow-xl flex items-center gap-2 transition-all shrink-0 active:scale-95"
              id="banner-open-payout-statements-btn"
            >
              <FileDown className="w-4 h-4" />
              <span>Access & Download Payout PDFs</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. THE THREE BUSINESS MODELS (TRANSPARENT STRUCTURE) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
            PARTNERSHIP ARCHITECTURE
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">Choose Your Preferred Fleet Business Model</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Tailored engagement structures designed for high yields, passive capital preservation, and zero operational headache.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Model 1 */}
          <div className="bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-7 space-y-6 flex flex-col justify-between shadow-2xl relative">
            <div className="absolute -top-3.5 right-6 bg-amber-500 text-slate-950 font-black text-[10px] uppercase px-3 py-1 rounded-full shadow">
              Most Popular • 100% Passive
            </div>

            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
                <Coins className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-lg font-black text-white">Fixed Monthly Guaranteed Lease</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Predictable, passive monthly payout credited every 5th of the month.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <span className="text-xs text-slate-400 font-bold block">Monthly Yield Range:</span>
                <span className="text-2xl font-black text-amber-400 font-mono">₦650,000 - ₦3,500,000</span>
                <span className="text-[11px] text-slate-500 block">per truck / net to investor</span>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-300 pt-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Pyda covers all fuel, driver salaries & road levies.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Routine preventative maintenance managed by Pyda.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Guaranteed payment regardless of client trip volume.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>24/7 GPS telematics owner dashboard included.</span>
                </li>
              </ul>
            </div>

            <a
              href="#register-truck-form"
              onClick={() => {
                setFormData((prev) => ({ ...prev, preferredModel: 'fixed_monthly_lease' }));
                setSelectedModel('fixed_monthly_lease');
              }}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-lg"
            >
              <span>Select Guaranteed Lease</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Model 2 */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-6 flex flex-col justify-between shadow-xl">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
                <TrendingUp className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-lg font-black text-white">Managed Revenue Share (70/30)</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Higher earning potential linked to corporate relocation contract billings.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <span className="text-xs text-slate-400 font-bold block">Avg. Monthly Yield Range:</span>
                <span className="text-2xl font-black text-emerald-400 font-mono">₦1,120,000 - ₦4,340,000</span>
                <span className="text-[11px] text-slate-500 block">70% investor / 30% management fee</span>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-300 pt-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Direct deployment onto lucrative corporate & interstate contracts.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Bi-weekly settlements on the 5th and 20th of every month.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Transparent itemized billing audits and client manifest logs.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Discounted maintenance rates at Pyda regional hubs.</span>
                </li>
              </ul>
            </div>

            <a
              href="#register-truck-form"
              onClick={() => {
                setFormData((prev) => ({ ...prev, preferredModel: 'revenue_share_management' }));
                setSelectedModel('revenue_share_management');
              }}
              className="w-full py-3 bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all border border-slate-700"
            >
              <span>Select Revenue Share</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Model 3 */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-6 flex flex-col justify-between shadow-xl">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold">
                <Truck className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-lg font-black text-white">Spot Charter & Direct Project Hire</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Retain operational control while hiring your truck for dedicated haulage trips.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <span className="text-xs text-slate-400 font-bold block">Interstate Trip Tariff:</span>
                <span className="text-2xl font-black text-blue-400 font-mono">₦280k - ₦2.2M / Trip</span>
                <span className="text-[11px] text-slate-500 block">70% upfront mobilization on load</span>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-300 pt-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>70% mobilization paid immediately upon loading and dispatch.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>30% balance cleared within 24 hours of signed Proof of Delivery (POD).</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Ideal for owners who want flexibility between their own jobs.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Direct inclusion in high-demand surge relocation corridors.</span>
                </li>
              </ul>
            </div>

            <a
              href="#register-truck-form"
              onClick={() => {
                setFormData((prev) => ({ ...prev, preferredModel: 'spot_charter_hire' }));
                setSelectedModel('spot_charter_hire');
              }}
              className="w-full py-3 bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all border border-slate-700"
            >
              <span>Select Spot Charter</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE ROI & EARNINGS CALCULATOR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="investor-calculator">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
          <div className="border-b border-slate-800 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-amber-400" />
                <h2 className="text-xl sm:text-2xl font-black text-white">Investor Fleet Earnings Simulator</h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Simulate your projected monthly and annualized returns based on truck tonnage, asset age, and fleet management model.
              </p>
            </div>

            <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full self-start sm:self-auto font-mono">
              Live Verified Rate Book (2026 Q3)
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Inputs (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Step 1: Select Tonnage */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  1. Select Vehicle Category & Tonnage:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {TONNAGE_DATA.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setSelectedTonnage(t.id);
                        setFormData((prev) => ({ ...prev, truckCategory: t.id }));
                      }}
                      className={`p-3.5 rounded-2xl text-left border transition-all ${
                        selectedTonnage === t.id
                          ? 'bg-amber-500/10 border-amber-500 text-white shadow-lg'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <span className="text-xs font-black block text-white">{t.name}</span>
                      <span className="text-[11px] text-amber-400/90 font-mono block mt-0.5">{t.typicalMake}</span>
                      <span className="text-[10px] text-slate-500 block mt-1 leading-snug">{t.idealUse}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Select Management Model */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  2. Select Fleet Management Model:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'fixed_monthly_lease' as FleetPartnerModel, label: 'Guaranteed Lease', tag: 'Fixed Monthly' },
                    { id: 'revenue_share_management' as FleetPartnerModel, label: 'Revenue Share', tag: '70% to Owner' },
                    { id: 'spot_charter_hire' as FleetPartnerModel, label: 'Spot Charter', tag: 'Trip-by-Trip' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setSelectedModel(m.id);
                        setFormData((prev) => ({ ...prev, preferredModel: m.id }));
                      }}
                      className={`p-3 rounded-xl text-center border transition-all ${
                        selectedModel === m.id
                          ? 'bg-amber-500 text-slate-950 font-black border-amber-400 shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="text-xs font-bold block">{m.label}</span>
                      <span className={`text-[10px] block ${selectedModel === m.id ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>
                        {m.tag}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3: Truck Count & Vehicle Age Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-400">Number of Trucks:</span>
                    <span className="font-mono font-black text-amber-400 text-sm">{truckCount} Unit(s)</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={truckCount}
                    onChange={(e) => setTruckCount(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>1 Solo Truck</span>
                    <span>5 Fleet Units</span>
                    <span>10 Fleet Units</span>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-400">Vehicle Age (Years in Use):</span>
                    <span className="font-mono font-black text-emerald-400 text-sm">{vehicleAgeYears} Year(s)</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={vehicleAgeYears}
                    onChange={(e) => setVehicleAgeYears(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Brand New / 1yr</span>
                    <span>5 Years</span>
                    <span>10 Years Max</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Projected Yield Card (5 Cols) */}
            <div className="lg:col-span-5 bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-7 space-y-6 flex flex-col justify-between shadow-2xl">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-400 font-mono">
                    PROJECTED INVESTOR YIELD
                  </span>
                  <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-500/40">
                    ~{calculations.annualRoi}% Annual ROI
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-slate-400">{calculations.payoutModelLabel}</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
                      ₦{calculations.totalMonthlyEarnings.toLocaleString('en-NG')}
                    </span>
                    <span className="text-xs text-slate-400 font-bold">/ Month</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Calculated for {truckCount} unit(s) • Est. ${(Math.round(calculations.totalMonthlyEarnings / 1550)).toLocaleString()} USD/mo
                  </p>
                </div>

                {/* Annualized Gross & Breakdown */}
                <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">12-Month Net Total:</span>
                    <span className="font-mono font-black text-amber-400">
                      ₦{calculations.annualEarnings.toLocaleString('en-NG')}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Monthly Payout Date:</span>
                    <span className="font-bold text-emerald-400">5th of Every Month</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Maintenance Handling:</span>
                    <span className="text-slate-200 font-bold">
                      {selectedModel === 'fixed_monthly_lease' ? 'Pyda Absorbed' : 'Managed Pool Sinking Fund'}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">GIT Cargo Insurance:</span>
                    <span className="text-emerald-400 font-bold">100% Zero-Liability</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <a
                  href="#register-truck-form"
                  className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-xl active:scale-98"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Lock In These Earnings & Onboard</span>
                </a>
                <p className="text-[10px] text-slate-500 text-center">
                  Subject to physical engineering inspection and valid registration documents.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3.5 VEHICLE HEALTH MONITOR & DIAGNOSTIC TELEMATICS PANEL */}
      <VehicleHealthMonitor
        onNavigateToContact={onNavigateToContact}
        onOpenBookingModal={onOpenQuoteModal}
      />

      {/* 4. TRANSPARENT TERMS & CONDITIONS / OPERATIONAL SLAs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono">
            LEGAL & OPERATIONAL INTEGRITY
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">Transparent Terms, Conditions & Settlement SLAs</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            We operate with bank-grade governance, clear legal contracts, and zero hidden deductions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
          {/* Term 1 */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-black text-white">1. Settlement Date Guarantee</h3>
            <p className="text-slate-400 leading-relaxed">
              Lease payouts are executed automatically on the 5th of every month via NIBSS direct electronic credit. Revenue share statements are reconciled bi-weekly on the 5th and 20th with itemized trip audit logs.
            </p>
          </div>

          {/* Term 2 */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-black text-white">2. Dual GIT & Asset Insurance</h3>
            <p className="text-slate-400 leading-relaxed">
              All cargo carried by your truck is covered under Pyda’s Master Goods-In-Transit policy (up to ₦100M per convoy) with Leadway & AIICO. Investors bear zero liability for freight loss, damage, or road claims.
            </p>
          </div>

          {/* Term 3 */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-black text-white">3. 24/7 Owner Telematics Portal</h3>
            <p className="text-slate-400 leading-relaxed">
              Every vehicle is equipped with dual GPS hardware and digital speed governors. Investors receive secure portal access to monitor real-time location, engine running hours, trip routes, and mileage odometer logs.
            </p>
            <a
              href="#vehicle-health-monitor"
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 pt-1 transition-colors"
            >
              <span>Inspect Live Health Telematics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Term 4 */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-black text-white">4. Vetted, Certified Captains</h3>
            <p className="text-slate-400 leading-relaxed">
              We exclusively deploy background-checked, drug-tested, and FRSC-certified commercial drivers. All drivers undergo defensive driving training and are subject to continuous AI speed governance (max 80 km/h).
            </p>
            <div className="pt-1">
              <a
                href="#investor-driver-profiles"
                className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
              >
                <span>View Verified Driver Profiles & Credentials ↓</span>
              </a>
            </div>
          </div>

          {/* Term 5 */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold">
              <Gauge className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-black text-white">5. Scheduled Fleet Maintenance</h3>
            <p className="text-slate-400 leading-relaxed">
              Preventative maintenance occurs every 5,000 km in our certified workshops across Lagos (Lekki/Ikeja), Abuja (Idu Industrial), and Port Harcourt (Trans-Amadi) using OEM parts and premium synthetic lubricants.
            </p>
          </div>

          {/* Term 6 */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-black text-white">6. Flexible 30-Day Exit Protocol</h3>
            <p className="text-slate-400 leading-relaxed">
              Our 1-year renewable Master Fleet Agreement includes a transparent 30-day written notice exit clause. You retain 100% legal ownership of your vehicle and can retrieve it with zero penalty upon settling active cycles.
            </p>
          </div>
        </div>
      </section>

      {/* DRIVER PROFILES SECTION - VETTED FLEET CAPTAINS & SAFETY AUDIT */}
      <DriverProfilesSection
        onRegisterTruckClick={() => {
          const el = document.getElementById('register-truck-form');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* 5. TRUCK REGISTRATION & ONBOARDING FORM */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8" id="register-truck-form">
        <div className="bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
          <div className="border-b border-slate-800 pb-6 text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold font-mono">
              <BadgeCheck className="w-4 h-4" />
              <span>OFFICIAL TRUCK ONBOARDING APPLICATION</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Register Your Truck Under Pyda Fleet</h2>
            <p className="text-xs text-slate-400 max-w-lg mx-auto">
              Submit your vehicle details below. Our fleet engineering team will review your application and schedule a 42-point physical inspection within 24 hours.
            </p>
          </div>

          {submissionSuccess ? (
            <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 text-center space-y-6 animate-in fade-in">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40 shadow-lg">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-mono font-black">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>PRE-INSPECTION APPLICATION CLEARED</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">Application Successfully Submitted!</h3>
                <p className="text-xs text-slate-300 max-w-lg mx-auto">
                  Your truck <strong className="text-white font-bold">{submissionSuccess.truckMake} {submissionSuccess.truckModel} ({submissionSuccess.plateNumber})</strong> has been logged in the fleet onboarding queue.
                </p>
                <div className="inline-block bg-slate-950 border border-slate-800 px-4 py-2 rounded-xl text-xs font-mono text-amber-400 mt-2">
                  Reference Code: <strong className="text-white font-bold">{submissionSuccess.referenceCode}</strong>
                </div>
              </div>

              {/* Truck Capacity & Specs Summary Badge */}
              <div className="p-4 bg-slate-950/90 rounded-2xl border border-slate-800 text-left max-w-xl mx-auto space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase font-mono">
                    <Truck className="w-3.5 h-3.5" />
                    <span>Registered Truck Specifications</span>
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 font-bold">
                    Year: {submissionSuccess.modelYear}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Tonnage Capacity</span>
                    <strong className="text-white text-sm font-black">{submissionSuccess.tonnageCapacity || 15} Tons</strong>
                  </div>
                  <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Cargo Volume</span>
                    <strong className="text-white text-sm font-black">{submissionSuccess.cubicCapacityCbm || 45} CBM</strong>
                  </div>
                  <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Cargo Length</span>
                    <strong className="text-white text-xs font-bold truncate block">{submissionSuccess.cargoLengthFt || '28ft'}</strong>
                  </div>
                  <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Axle Config</span>
                    <strong className="text-white text-xs font-bold truncate block">{submissionSuccess.axleConfig || '4x2'}</strong>
                  </div>
                </div>

                {/* Survey Photos Preview Grid if uploaded */}
                {submissionSuccess.surveyPhotos && submissionSuccess.surveyPhotos.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-emerald-400 flex items-center gap-1">
                        <Camera className="w-3.5 h-3.5" />
                        <span>{submissionSuccess.surveyPhotos.length} Verified Site Survey Photo(s) Attached</span>
                      </span>
                      <span className="text-slate-500 font-mono text-[10px]">Expedited Lane</span>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      {submissionSuccess.surveyPhotos.slice(0, 4).map((p) => (
                        <div key={p.id} className="relative aspect-[4/3] rounded-lg overflow-hidden border border-slate-800 bg-slate-900">
                          <img src={p.dataUrl} alt={p.label} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/30" />
                          <span className="absolute bottom-1 left-1 text-[8px] font-bold text-white bg-black/60 px-1 rounded truncate max-w-[90%]">
                            {p.label.split(' ')[0]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-left text-xs space-y-2 max-w-xl mx-auto text-slate-300">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Next Step: 24-Hour Review & Physical Inspection</span>
                </p>
                <p className="text-[11px] text-slate-400">
                  Our Fleet Engineer will call you at <strong className="text-white">{submissionSuccess.phone}</strong> to confirm the intake appointment at <strong className="text-white">{submissionSuccess.inspectionCity}</strong>.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleDownloadTermSheetPdf(submissionSuccess)}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg transition-all active:scale-95"
                  id="download-term-sheet-pdf-btn"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Partnership Term Sheet & Survey Voucher (PDF)</span>
                </button>

                <button
                  type="button"
                  onClick={triggerSuccessConfetti}
                  className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold text-xs px-4 py-3 rounded-xl transition-all active:scale-95 flex items-center gap-1.5 shadow"
                  title="Re-launch celebration confetti"
                  id="replay-confetti-btn"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Replay Celebration</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSubmissionSuccess(null);
                    setFormData((prev) => ({ ...prev, plateNumber: '', chassisVin: '', surveyPhotos: [] }));
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all active:scale-95"
                >
                  Register Another Truck
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitRegistration} className="space-y-6 text-xs">
              {/* Part 1: Investor Contact Info */}
              <div className="space-y-4">
                <h3 className="font-black text-slate-200 text-sm flex items-center gap-2 border-b border-slate-800 pb-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[10px] font-bold">1</span>
                  <span>Investor / Asset Owner Details</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-400 block mb-1">Full Legal Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alhaji Mustapha Danladi"
                      value={formData.investorName}
                      onChange={(e) => setFormData({ ...formData, investorName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 text-white rounded-xl p-3 outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-400 block mb-1">Company / Entity Name (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Danladi Haulage & Trading Ltd"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 text-white rounded-xl p-3 outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-400 block mb-1">Direct Phone Number (WhatsApp Active) *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 0803 555 0192"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value, whatsapp: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 text-white rounded-xl p-3 outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-400 block mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. investor@gmail.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 text-white rounded-xl p-3 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Part 2: Truck Make, Model, Identification */}
              <div className="space-y-4 pt-4">
                <h3 className="font-black text-slate-200 text-sm flex items-center gap-2 border-b border-slate-800 pb-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[10px] font-bold">2</span>
                  <span>Vehicle Make, Model & Identity</span>
                </h3>

                {/* Popular Brand Quick Chips */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 block">Popular Truck Makes (Click to select):</label>
                  <div className="flex flex-wrap gap-1.5">
                    {['Mercedes-Benz', 'DAF', 'MAN', 'Isuzu', 'Mitsubishi Canter', 'Sinotruk HOWO', 'Scania', 'Volvo', 'Shacman', 'Mack'].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setFormData({ ...formData, truckMake: m })}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                          formData.truckMake.toLowerCase() === m.toLowerCase()
                            ? 'bg-amber-500 text-slate-950 font-black shadow'
                            : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="font-bold text-slate-400 block mb-1">Truck Make *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mercedes-Benz"
                      value={formData.truckMake}
                      onChange={(e) => setFormData({ ...formData, truckMake: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 text-white rounded-xl p-3 outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-400 block mb-1">Truck Model *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Atego 1523 / Actros 2640 / CF 85"
                      value={formData.truckModel}
                      onChange={(e) => setFormData({ ...formData, truckModel: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 text-white rounded-xl p-3 outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-400 block mb-1">Year of Manufacture *</label>
                    <input
                      type="number"
                      min="2010"
                      max="2026"
                      required
                      value={formData.modelYear}
                      onChange={(e) => setFormData({ ...formData, modelYear: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 text-white rounded-xl p-3 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="font-bold text-slate-400 block mb-1">Body Type *</label>
                    <select
                      value={formData.bodyType}
                      onChange={(e) => setFormData({ ...formData, bodyType: e.target.value as any })}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 text-white rounded-xl p-3 outline-none"
                    >
                      <option value="closed_box">Fully Enclosed Box Body (Dry Freight)</option>
                      <option value="curtain_side">Curtain-Sided Tautliner</option>
                      <option value="flatbed">Heavy-Duty Flatbed</option>
                      <option value="dropside">Dropside / Stake Body</option>
                      <option value="refrigerated">Refrigerated (Reefer)</option>
                      <option value="hiab_crane">Self-Loading Crane (HIAB)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-400 block mb-1">Plate Number (FRSC) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. KJA-892-XY"
                      value={formData.plateNumber}
                      onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value.toUpperCase() })}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 text-white rounded-xl p-3 outline-none font-mono uppercase"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-400 block mb-1">Chassis / VIN Number</label>
                    <input
                      type="text"
                      placeholder="17-Digit VIN (e.g. WDB934...)"
                      value={formData.chassisVin}
                      onChange={(e) => setFormData({ ...formData, chassisVin: e.target.value.toUpperCase() })}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 text-white rounded-xl p-3 outline-none font-mono uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* Part 3: Vehicle Capacity & Engineering Specifications */}
              <div className="space-y-4 pt-4">
                <h3 className="font-black text-slate-200 text-sm flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[10px] font-bold">3</span>
                    <span>Vehicle Capacity & Engineering Specifications</span>
                  </div>
                  <span className="text-[11px] text-amber-400 font-mono font-bold flex items-center gap-1">
                    <Scale className="w-3.5 h-3.5" />
                    <span>Payload & Volume Rating</span>
                  </span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Tonnage Capacity with quick chips */}
                  <div>
                    <label className="font-bold text-slate-400 block mb-1">Tonnage Capacity (Metric Tons) *</label>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      max="60"
                      required
                      value={formData.tonnageCapacity}
                      onChange={(e) => {
                        const tons = Number(e.target.value);
                        setFormData({
                          ...formData,
                          tonnageCapacity: tons,
                          payloadKg: tons * 1000,
                        });
                      }}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 text-white rounded-xl p-3 outline-none font-mono font-bold text-sm"
                    />
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {[3.5, 5, 10, 15, 20, 30, 45].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setFormData({ ...formData, tonnageCapacity: t, payloadKg: t * 1000 })}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                            formData.tonnageCapacity === t
                              ? 'bg-amber-500 text-slate-950 font-black'
                              : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                          }`}
                        >
                          {t}T
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Cubic Volume Capacity (m³ / CBM) */}
                  <div>
                    <label className="font-bold text-slate-400 block mb-1">Cubic Capacity (m³ / CBM) *</label>
                    <input
                      type="number"
                      min="5"
                      max="150"
                      required
                      value={formData.cubicCapacityCbm}
                      onChange={(e) => setFormData({ ...formData, cubicCapacityCbm: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 text-white rounded-xl p-3 outline-none font-mono font-bold text-sm"
                    />
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {[25, 45, 60, 85, 100].map((cbm) => (
                        <button
                          key={cbm}
                          type="button"
                          onClick={() => setFormData({ ...formData, cubicCapacityCbm: cbm })}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                            formData.cubicCapacityCbm === cbm
                              ? 'bg-amber-500 text-slate-950 font-black'
                              : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                          }`}
                        >
                          {cbm} CBM
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Cargo Box Length / Container Size */}
                  <div>
                    <label className="font-bold text-slate-400 block mb-1">Cargo Bed / Box Length *</label>
                    <select
                      value={formData.cargoLengthFt}
                      onChange={(e) => setFormData({ ...formData, cargoLengthFt: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 text-white rounded-xl p-3 outline-none"
                    >
                      <option value="14ft Canter Van">14ft Canter Van / Light Box</option>
                      <option value="20ft Rigid Box">20ft Standard Rigid Box</option>
                      <option value="28ft Enclosed Box">28ft Heavy Enclosed Box Body</option>
                      <option value="33ft Semi-Trailer">33ft Tri-Axle Semi-Trailer</option>
                      <option value="40ft High Cube Container">40ft High Cube Container Hauler</option>
                      <option value="45ft Heavy Flatbed">45ft Heavy Extendable Flatbed</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Axle Configuration */}
                  <div>
                    <label className="font-bold text-slate-400 block mb-1">Axle Configuration *</label>
                    <select
                      value={formData.axleConfig}
                      onChange={(e) => setFormData({ ...formData, axleConfig: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 text-white rounded-xl p-3 outline-none"
                    >
                      <option value="4x2 (Single Axle)">4x2 (Single Driven Axle)</option>
                      <option value="6x2 (Twin Steer / Tag)">6x2 (Tag / Lift Axle)</option>
                      <option value="6x4 (Double Differential)">6x4 (Double Differential Heavy)</option>
                      <option value="8x4 (Heavy Quad-Axle)">8x4 (Quad-Axle Heavy Hauler)</option>
                    </select>
                  </div>

                  {/* Max Gross Payload (kg) */}
                  <div>
                    <label className="font-bold text-slate-400 block mb-1">Max Payload (kg) *</label>
                    <input
                      type="number"
                      step="100"
                      min="1000"
                      max="70000"
                      required
                      value={formData.payloadKg}
                      onChange={(e) => setFormData({ ...formData, payloadKg: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 text-white rounded-xl p-3 outline-none font-mono"
                    />
                  </div>

                  {/* Current Odometer Reading (km) */}
                  <div>
                    <label className="font-bold text-slate-400 block mb-1">Current Odometer (km)</label>
                    <input
                      type="number"
                      step="1000"
                      min="0"
                      placeholder="e.g. 145000"
                      value={formData.currentOdometerKm}
                      onChange={(e) => setFormData({ ...formData, currentOdometerKm: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 text-white rounded-xl p-3 outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Part 4: Site Survey Photos Upload for Verification (NEW & REQUESTED) */}
              <div className="space-y-4 pt-4">
                <h3 className="font-black text-slate-200 text-sm flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[10px] font-bold">4</span>
                    <span>Site Survey Photos for Verification</span>
                  </div>
                  <span className="text-[11px] text-amber-400 font-mono font-bold flex items-center gap-1">
                    <Camera className="w-3.5 h-3.5" />
                    <span>Upload 4 Required Survey Angles</span>
                  </span>
                </h3>

                <TruckSurveyPhotoUploader
                  photos={formData.surveyPhotos}
                  onChange={(photos) => setFormData((prev) => ({ ...prev, surveyPhotos: photos }))}
                  truckMake={formData.truckMake}
                  truckModel={formData.truckModel}
                />
              </div>

              {/* Part 5: Management Model & Preferred Terms */}
              <div className="space-y-4 pt-4">
                <h3 className="font-black text-slate-200 text-sm flex items-center gap-2 border-b border-slate-800 pb-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[10px] font-bold">5</span>
                  <span>Management Engagement & Inspection Preference</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-400 block mb-1">Preferred Management Model *</label>
                    <select
                      value={formData.preferredModel}
                      onChange={(e) => setFormData({ ...formData, preferredModel: e.target.value as FleetPartnerModel })}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 text-white rounded-xl p-3 outline-none"
                    >
                      <option value="fixed_monthly_lease">Model 1: Guaranteed Monthly Fixed Lease</option>
                      <option value="revenue_share_management">Model 2: Managed Revenue Share (70/30 Split)</option>
                      <option value="spot_charter_hire">Model 3: Spot Charter & Direct Route Hire</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-400 block mb-1">Preferred Inspection Hub *</label>
                    <select
                      value={formData.inspectionCity}
                      onChange={(e) => setFormData({ ...formData, inspectionCity: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 text-white rounded-xl p-3 outline-none"
                    >
                      <option value="Lagos (Lekki / Ikeja Central Workshop)">Lagos (Lekki / Ikeja Central Workshop)</option>
                      <option value="Abuja (Idu Industrial Fleet Hub)">Abuja (Idu Industrial Fleet Hub)</option>
                      <option value="Port Harcourt (Trans-Amadi Hub)">Port Harcourt (Trans-Amadi Hub)</option>
                      <option value="Kano (Bompai Industrial Yard)">Kano (Bompai Industrial Yard)</option>
                      <option value="Ibadan (Ring Road Hub)">Ibadan (Ring Road Hub)</option>
                      <option value="Enugu / Asaba Regional Yard">Enugu / Asaba Regional Yard</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-400 block mb-1">Additional Notes / Fleet Details (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="Provide any details about current tire conditions, tracker installed, or number of additional trucks..."
                    value={formData.additionalNotes}
                    onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 text-white rounded-xl p-3 outline-none"
                  />
                </div>

                {/* Checkbox Agreement */}
                <div className="flex items-start gap-3 p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
                  <input
                    type="checkbox"
                    id="investor-terms-agree"
                    required
                    checked={formData.agreedToTerms}
                    onChange={(e) => setFormData({ ...formData, agreedToTerms: e.target.checked })}
                    className="mt-1 accent-amber-500 w-4 h-4 rounded cursor-pointer"
                  />
                  <label htmlFor="investor-terms-agree" className="text-[11px] text-slate-300 leading-snug cursor-pointer">
                    I confirm that I am the legal owner or authorized representative of the vehicle described above. I agree to Pyda’s transparent physical inspection SLA, 30-day exit terms, and monthly electronic bank settlement schedule.
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-sm rounded-xl flex items-center justify-center gap-2 shadow-2xl transition-all active:scale-98"
                  id="submit-truck-registration-btn"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Registering Truck in Fleet Queue...' : 'Submit Truck Registration & Site Survey'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* 6. INVESTOR FAQS */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
            FREQUENTLY ASKED QUESTIONS
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">Investor Fleet FAQs</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-white text-xs sm:text-sm hover:text-amber-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-amber-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />}
                </button>

                {isOpen && (
                  <div className="p-4 sm:p-5 pt-0 text-xs text-slate-300 border-t border-slate-800/60 leading-relaxed bg-slate-950/30">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. DIRECT FLEET DIRECTOR CONTACT BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-slate-950 p-8 sm:p-12 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
              Have a Fleet of 3+ Trucks or Multi-Axle Lowbeds?
            </h3>
            <p className="text-xs sm:text-sm font-medium text-slate-900 max-w-xl">
              Connect directly with our Chief Operating Officer and VP of Fleet Operations for custom corporate leasing terms, dedicated regional corridors, and priority onboarding.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={`tel:${company.phones[0]}`}
              className="bg-slate-950 hover:bg-slate-900 text-white font-black text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-lg flex items-center gap-2 transition-all"
            >
              <Phone className="w-4 h-4 text-amber-400" />
              <span>Call Fleet Desk: {company.phones[0]}</span>
            </a>

            <a
              href={`https://wa.me/${company.whatsapp || '2348062466212'}?text=Hello%20Pyda,%20I%20have%20multiple%20trucks%20for%20fleet%20investment.`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-lg flex items-center gap-2 transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp VIP Line</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
