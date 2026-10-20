import React, { useState, useMemo } from 'react';
import jsPDF from 'jspdf';
import {
  ShieldCheck,
  ShieldAlert,
  Calculator,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Truck,
  Sparkles,
  ArrowRight,
  Download,
  PhoneCall,
  MessageCircle,
  Info,
  Layers,
  MapPin,
  FileSpreadsheet,
  FileCheck2,
  FileText,
  Check,
  Sliders,
  DollarSign,
  Briefcase,
  Home,
  Laptop,
  Tv,
  Boxes,
  HelpCircle,
  FileDown
} from 'lucide-react';
import { useCms } from '../context/CmsContext';

export interface ValuedItem {
  id: string;
  name: string;
  category: 'Living Room' | 'Bedroom' | 'Kitchen & Appliances' | 'Electronics & IT' | 'Fine Art & Antiques' | 'Commercial & Industrial' | 'Other';
  declaredValue: number;
  quantity: number;
  isFragile: boolean;
}

export type InsuranceTier = 'basic' | 'silver' | 'gold' | 'platinum';

interface RoutePreset {
  id: string;
  name: string;
  distanceKm: number;
  terrainType: 'standard' | 'monsoon' | 'escort';
  popular?: boolean;
}

const ROUTE_PRESETS: RoutePreset[] = [
  { id: 'lag-local', name: 'Lagos Intra-City (Island ⇄ Mainland)', distanceKm: 35, terrainType: 'standard', popular: true },
  { id: 'abj-local', name: 'Abuja Metropolitan Relocation', distanceKm: 30, terrainType: 'standard', popular: true },
  { id: 'lag-ibd', name: 'Lagos ⇄ Ibadan Expressway', distanceKm: 135, terrainType: 'standard' },
  { id: 'abj-kdn', name: 'Abuja ⇄ Kaduna Corridor', distanceKm: 190, terrainType: 'standard' },
  { id: 'lag-ben', name: 'Lagos ⇄ Benin City', distanceKm: 320, terrainType: 'monsoon' },
  { id: 'lag-abj', name: 'Lagos ⇄ Abuja Federal Highway', distanceKm: 755, terrainType: 'escort', popular: true },
  { id: 'lag-phc', name: 'Lagos ⇄ Port Harcourt Oil Hub', distanceKm: 615, terrainType: 'monsoon', popular: true },
  { id: 'abj-kan', name: 'Abuja ⇄ Kano Commercial Belt', distanceKm: 365, terrainType: 'standard' },
  { id: 'lag-enu', name: 'Lagos ⇄ Enugu / Onitsha', distanceKm: 520, terrainType: 'monsoon' },
  { id: 'pan-nig', name: 'Cross-Country Long Haul (1,200+ km)', distanceKm: 1250, terrainType: 'escort' },
];

const ITEM_PRESETS: Omit<ValuedItem, 'id'>[] = [
  { name: '75" 4K OLED Smart TV & Audio Soundbar', category: 'Electronics & IT', declaredValue: 1800000, quantity: 1, isFragile: true },
  { name: 'Double-Door Inverter Refrigerator', category: 'Kitchen & Appliances', declaredValue: 1200000, quantity: 1, isFragile: true },
  { name: 'Italian 7-Seater Leather Living Room Suite', category: 'Living Room', declaredValue: 3500000, quantity: 1, isFragile: false },
  { name: 'King-Size Master Bed Frame & Orthopedic Mattress', category: 'Bedroom', declaredValue: 1500000, quantity: 1, isFragile: false },
  { name: 'Corporate Server Rack / Network Switchgear', category: 'Commercial & Industrial', declaredValue: 6500000, quantity: 1, isFragile: true },
  { name: 'Executive Mac Studio / Dual Curved Monitor Workstation', category: 'Electronics & IT', declaredValue: 2400000, quantity: 1, isFragile: true },
  { name: 'Crystal Dining Chandelier & Marble Dining Table', category: 'Fine Art & Antiques', declaredValue: 2800000, quantity: 1, isFragile: true },
  { name: '30kVA Silent Diesel Generator Set', category: 'Commercial & Industrial', declaredValue: 7500000, quantity: 1, isFragile: false },
];

interface ItemValuationInsuranceCalculatorProps {
  onApplyToQuote?: (declaredValue: number, estimatedPremium: number, planName: string, itemsSummary: string) => void;
  className?: string;
}

export const ItemValuationInsuranceCalculator: React.FC<ItemValuationInsuranceCalculatorProps> = ({
  onApplyToQuote,
  className = '',
}) => {
  const { cms } = useCms();
  const phone = cms.company?.phones?.[0] || '08062466212';
  const cleanPhone = phone.replace(/\D/g, '');
  const waNumber = cleanPhone.startsWith('0') ? `234${cleanPhone.slice(1)}` : cleanPhone;

  // Valuation Mode: 'itemized' or 'lumpsum'
  const [valuationMode, setValuationMode] = useState<'itemized' | 'lumpsum'>('itemized');

  // Lumpsum state
  const [lumpSumValue, setLumpSumValue] = useState<number>(12000000); // ₦12,000,000 default

  // Itemized state
  const [items, setItems] = useState<ValuedItem[]>([
    { id: '1', name: '75" 4K OLED Smart TV & Soundbar', category: 'Electronics & IT', declaredValue: 1800000, quantity: 1, isFragile: true },
    { id: '2', name: 'Italian 7-Seater Leather Living Room Suite', category: 'Living Room', declaredValue: 3500000, quantity: 1, isFragile: false },
    { id: '3', name: 'King Bed Frame & Orthopedic Mattress', category: 'Bedroom', declaredValue: 1400000, quantity: 1, isFragile: false },
    { id: '4', name: 'Double-Door Inverter Refrigerator & Washer', category: 'Kitchen & Appliances', declaredValue: 1900000, quantity: 1, isFragile: true },
    { id: '5', name: 'Executive Mac Studio / Dual Monitor Workstation', category: 'Electronics & IT', declaredValue: 2200000, quantity: 1, isFragile: true },
  ]);

  // Form for adding custom item
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<ValuedItem['category']>('Living Room');
  const [newItemValue, setNewItemValue] = useState<number | ''>(500000);
  const [newItemQty, setNewItemQty] = useState<number>(1);
  const [newItemFragile, setNewItemFragile] = useState<boolean>(false);

  // Transit Route & Distance
  const [distanceKm, setDistanceKm] = useState<number>(755); // Lagos to Abuja default
  const [routeType, setRouteType] = useState<'standard' | 'monsoon' | 'escort'>('standard');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('lag-abj');

  // Insurance Policy Tier
  const [selectedTier, setSelectedTier] = useState<InsuranceTier>('gold');

  // Deductible choice
  const [deductibleChoice, setDeductibleChoice] = useState<'zero' | 'standard' | 'high'>('standard');

  // Add-ons
  const [includeEscortSecurity, setIncludeEscortSecurity] = useState(false);
  const [includeMonsoonWeatherSeal, setIncludeMonsoonWeatherSeal] = useState(true);

  // Status for actions
  const [copySuccess, setCopySuccess] = useState(false);

  // Calculate Total Declared Value
  const totalDeclaredValue = useMemo(() => {
    if (valuationMode === 'lumpsum') {
      return lumpSumValue;
    }
    return items.reduce((acc, item) => acc + (item.declaredValue * item.quantity), 0);
  }, [valuationMode, lumpSumValue, items]);

  // Count fragile items
  const fragileCount = useMemo(() => {
    if (valuationMode === 'lumpsum') return 1;
    return items.filter((i) => i.isFragile).reduce((acc, i) => acc + i.quantity, 0);
  }, [valuationMode, items]);

  // Calculation Math
  const calculation = useMemo(() => {
    // 1. Tier Base Rate
    let baseRatePercent = 0;
    let tierName = 'Standard Carrier Liability';
    let deductibleDesc = 'Per Carrier Weight Limit (₦1,000 / kg)';
    let turnaroundHours = '7 - 10 Days';

    switch (selectedTier) {
      case 'basic':
        baseRatePercent = 0;
        tierName = 'Basic Carrier Valuation';
        deductibleDesc = 'Limited Weight Liability';
        turnaroundHours = '7 - 10 Days';
        break;
      case 'silver':
        baseRatePercent = 1.1;
        tierName = 'Silver Comprehensive GIT Protection';
        deductibleDesc = deductibleChoice === 'zero' ? '0% (No Deductible)' : deductibleChoice === 'high' ? '10% of Claim (Min ₦30,000)' : '5% of Claim (Min ₦15,000)';
        turnaroundHours = '72 Hours';
        break;
      case 'gold':
        baseRatePercent = 1.65;
        tierName = 'Gold All-Risk Full Replacement Cover';
        deductibleDesc = deductibleChoice === 'zero' ? '0% (Zero Deductible)' : deductibleChoice === 'high' ? '5% Deductible' : '0% Deductible Included';
        turnaroundHours = '48 Hours Fast-Track';
        break;
      case 'platinum':
        baseRatePercent = 2.4;
        tierName = 'Platinum Executive & High-Tech Haulage Cover';
        deductibleDesc = '0% (Zero Deductible & Loss-of-Use Reimbursement)';
        turnaroundHours = '24 - 48 Hours Expedited';
        break;
    }

    if (selectedTier === 'basic') {
      return {
        basePremium: 0,
        distanceSurcharge: 0,
        fragileSurcharge: 0,
        addonsCost: 0,
        totalPremium: 0,
        baseRatePercent: 0,
        tierName,
        deductibleDesc,
        turnaroundHours,
        underwriters: ['Standard Carrier Underwriting']
      };
    }

    // Base Value Premium
    let basePremium = (totalDeclaredValue * baseRatePercent) / 100;

    // Distance Surcharge scaling: ~₦1,200 per 100km modulated by terrain risk
    const terrainMultiplier = routeType === 'escort' ? 1.3 : routeType === 'monsoon' ? 1.2 : 1.0;
    const distanceFactor = Math.max(1, distanceKm / 100);
    const distanceSurcharge = Math.round(distanceFactor * 2200 * terrainMultiplier);

    // Fragile Surcharge
    const fragileSurcharge = fragileCount > 0 ? Math.min(65000, fragileCount * 4500) : 0;

    // Deductible adjustment
    let deductibleMultiplier = 1.0;
    if (deductibleChoice === 'zero' && selectedTier === 'silver') deductibleMultiplier = 1.2;
    if (deductibleChoice === 'high') deductibleMultiplier = 0.85;

    // Addons
    let addonsCost = 0;
    if (includeEscortSecurity) addonsCost += 45000;
    if (includeMonsoonWeatherSeal) addonsCost += 18000;

    let subtotal = (basePremium * deductibleMultiplier) + distanceSurcharge + fragileSurcharge + addonsCost;

    // Minimum premium threshold for commercial GIT policy
    const minPremium = selectedTier === 'platinum' ? 45000 : selectedTier === 'gold' ? 25000 : 15000;
    const totalPremium = Math.max(minPremium, Math.round(subtotal));

    return {
      basePremium: Math.round(basePremium),
      distanceSurcharge,
      fragileSurcharge,
      addonsCost,
      totalPremium,
      baseRatePercent,
      tierName,
      deductibleDesc,
      turnaroundHours,
      underwriters: ['Leadway Assurance Plc', 'AIICO Insurance Plc', 'AXA Mansard']
    };
  }, [selectedTier, totalDeclaredValue, distanceKm, routeType, fragileCount, deductibleChoice, includeEscortSecurity, includeMonsoonWeatherSeal]);

  // Handlers
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !newItemValue || newItemValue <= 0) return;

    const newItem: ValuedItem = {
      id: Date.now().toString(),
      name: newItemName.trim(),
      category: newItemCategory,
      declaredValue: Number(newItemValue),
      quantity: Math.max(1, newItemQty),
      isFragile: newItemFragile,
    };

    setItems((prev) => [newItem, ...prev]);
    setNewItemName('');
    setNewItemValue(500000);
    setNewItemQty(1);
    setNewItemFragile(false);
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSelectRoutePreset = (preset: RoutePreset) => {
    setSelectedPresetId(preset.id);
    setDistanceKm(preset.distanceKm);
    setRouteType(preset.terrainType);
  };

  const handleApplyPresetItem = (preset: Omit<ValuedItem, 'id'>) => {
    const newItem: ValuedItem = {
      id: Date.now().toString(),
      ...preset,
    };
    setItems((prev) => [newItem, ...prev]);
  };

  const formatNaira = (val: number) => {
    return `₦${val.toLocaleString('en-NG')}`;
  };

  // Generate downloadable manifest
  const handleDownloadManifest = () => {
    const manifestLines = [
      '========================================================================',
      '      MEGATREND MOVERS & LOGISTICS - GOODS IN TRANSIT VALUATION SCHEDULE',
      '========================================================================',
      `Date Generated: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`,
      `Policy Underwriters: Leadway Assurance Plc & AIICO Insurance Plc`,
      `24/7 Dispatch Hotline: ${phone}`,
      '------------------------------------------------------------------------',
      `DECLARED CARGO VALUE: ${formatNaira(totalDeclaredValue)}`,
      `SELECTED PROTECTION TIER: ${calculation.tierName}`,
      `TRANSIT ROUTE DISTANCE: ${distanceKm} km (Risk Level: ${routeType.toUpperCase()})`,
      `ESTIMATED GIT PREMIUM: ${formatNaira(calculation.totalPremium)}`,
      `DEDUCTIBLE TERMS: ${calculation.deductibleDesc}`,
      `CLAIM TURNAROUND: ${calculation.turnaroundHours}`,
      '------------------------------------------------------------------------',
      'ITEMIZED INVENTORY BREAKDOWN:',
    ];

    if (valuationMode === 'itemized') {
      items.forEach((item, idx) => {
        manifestLines.push(
          `${idx + 1}. [${item.category}] ${item.name} (Qty: ${item.quantity}) - Value: ${formatNaira(item.declaredValue * item.quantity)}${item.isFragile ? ' [FRAGILE]' : ''}`
        );
      });
    } else {
      manifestLines.push(`• Lump-Sum Declared Relocation Valued Manifest: ${formatNaira(lumpSumValue)}`);
    }

    manifestLines.push(
      '------------------------------------------------------------------------',
      'TERMS & DISCLOSURE:',
      '• Premium estimate is subject to pre-loading manifest verification by the Lead Movers Dispatch Supervisor.',
      '• Official Certificate of Marine / Transit Insurance is issued upon convoy departure.',
      '========================================================================'
    );

    const blob = new Blob([manifestLines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Megatrend_Insurance_Valuation_${distanceKm}KM_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Generate formal, high-resolution PDF Insurance Valuation Summary
  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const timestamp = new Date().toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    const quoteRef = `GIT-VAL-${Math.floor(100000 + Math.random() * 900000)}`;

    // 1. Header Banner & Branding (Navy / Slate-900)
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 42, 'F');

    // Accent Line (Amber)
    doc.setFillColor(245, 158, 11); // amber-500
    doc.rect(0, 42, pageWidth, 2, 'F');

    // Company Header Text
    doc.setTextColor(245, 158, 11);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('MEGATREND MOVERS & LOGISTICS', 14, 16);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text('Goods-In-Transit (GIT) Valuation Schedule & Premium Assessment', 14, 23);
    doc.text(`Official Underwriting Certificate | Generated: ${timestamp}`, 14, 29);
    doc.text(`24/7 Hotline: ${phone} | support@megatrendmovers.ng`, 14, 35);

    // Reference Pill (Top Right)
    doc.setFillColor(30, 41, 59); // slate-800
    doc.roundedRect(pageWidth - 72, 10, 58, 22, 2, 2, 'F');
    doc.setTextColor(245, 158, 11);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text('VALUATION REF / POLICY', pageWidth - 68, 17);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text(quoteRef, pageWidth - 68, 26);

    let currentY = 52;

    // 2. Executive Summary & Policy Highlights Grid
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('1. Goods-In-Transit Coverage & Policy Specifications', 14, currentY);
    currentY += 4;

    // Box Container
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setFillColor(248, 250, 252); // slate-50
    doc.roundedRect(14, currentY, 182, 44, 2, 2, 'FD');

    const col1X = 18;
    const col2X = 108;
    let gridY = currentY + 7;

    // Left Column Info
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('TOTAL DECLARED CARGO VALUE', col1X, gridY);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(formatNaira(totalDeclaredValue), col1X, gridY + 6);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('SELECTED PROTECTION TIER', col1X, gridY + 14);
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(calculation.tierName, col1X, gridY + 20);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('DEDUCTIBLE TERMS', col1X, gridY + 28);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(calculation.deductibleDesc, col1X, gridY + 34);

    // Right Column Info
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('ESTIMATED GIT PREMIUM', col2X, gridY);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(217, 119, 6); // amber-600
    doc.text(formatNaira(calculation.totalPremium), col2X, gridY + 6);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('TRANSIT ROUTE & RISK PROFILE', col2X, gridY + 14);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(`${distanceKm} km (${routeType.toUpperCase()} Route Risk Profile)`, col2X, gridY + 20);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('FAST-TRACK CLAIMS SETTLEMENT', col2X, gridY + 28);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(5, 150, 105); // emerald-600
    doc.text(`${calculation.turnaroundHours} Guaranteed`, col2X, gridY + 34);

    currentY += 52;

    // 3. Premium Breakdown Table
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('2. Actuarial Premium Calculation Breakdown', 14, currentY);
    currentY += 4;

    // Table Header
    doc.setFillColor(241, 245, 249); // slate-100
    doc.rect(14, currentY, 182, 7, 'F');
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('COST COMPONENT / RATE APPLIED', 18, currentY + 5);
    doc.text('RISK DETAIL', 108, currentY + 5);
    doc.text('AMOUNT (NGN)', 166, currentY + 5);
    currentY += 7;

    const addCostRow = (label: string, detail: string, amount: string, isTotal = false) => {
      if (isTotal) {
        doc.setFillColor(254, 243, 199); // amber-100
        doc.rect(14, currentY, 182, 8, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(15, 23, 42);
        doc.text(label, 18, currentY + 5.5);
        doc.text(detail, 108, currentY + 5.5);
        doc.setTextColor(217, 119, 6);
        doc.text(amount, 166, currentY + 5.5);
        currentY += 9;
      } else {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(51, 65, 85);
        doc.text(label, 18, currentY + 5);
        doc.text(detail, 108, currentY + 5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(amount, 166, currentY + 5);
        doc.setDrawColor(241, 245, 249);
        doc.line(14, currentY + 6.5, 196, currentY + 6.5);
        currentY += 6.5;
      }
    };

    addCostRow('Base Value Premium', `Rate: ${calculation.baseRatePercent}% on ${formatNaira(totalDeclaredValue)}`, formatNaira(calculation.basePremium));
    addCostRow('Distance Highway Risk', `${distanceKm} km corridor scaled`, `+${formatNaira(calculation.distanceSurcharge)}`);
    if (calculation.fragileSurcharge > 0) {
      addCostRow('Fragile Handling Premium', `${fragileCount} delicate/fragile items`, `+${formatNaira(calculation.fragileSurcharge)}`);
    }
    if (calculation.addonsCost > 0) {
      addCostRow('Enclosed Protection Add-ons', 'Weather-barrier / Convoy escort', `+${formatNaira(calculation.addonsCost)}`);
    }
    addCostRow('TOTAL ESTIMATED GIT PREMIUM', 'Complete Trip Insurance (All-Inclusive)', formatNaira(calculation.totalPremium), true);

    currentY += 4;

    // 4. Itemized Cargo Schedule
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('3. Itemized Cargo Valuation Schedule', 14, currentY);
    currentY += 4;

    // Item Table Header
    doc.setFillColor(241, 245, 249);
    doc.rect(14, currentY, 182, 7, 'F');
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('ITEM DESCRIPTION & CATEGORY', 18, currentY + 5);
    doc.text('QTY', 120, currentY + 5);
    doc.text('STATUS', 138, currentY + 5);
    doc.text('TOTAL VALUE', 166, currentY + 5);
    currentY += 7;

    if (valuationMode === 'itemized') {
      const itemsToPrint = items.slice(0, 8); // Top items fitting cleanly
      itemsToPrint.forEach((item, idx) => {
        const itemBg = idx % 2 === 0 ? 255 : 250;
        doc.setFillColor(itemBg, itemBg, itemBg);
        doc.rect(14, currentY, 182, 6, 'F');

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(15, 23, 42);
        
        // Truncate name safely
        const safeName = item.name.length > 45 ? `${item.name.substring(0, 42)}...` : item.name;
        doc.text(`${idx + 1}. [${item.category}] ${safeName}`, 18, currentY + 4.2);
        doc.text(String(item.quantity), 122, currentY + 4.2);
        
        if (item.isFragile) {
          doc.setTextColor(217, 119, 6);
          doc.setFont('helvetica', 'bold');
          doc.text('FRAGILE', 138, currentY + 4.2);
        } else {
          doc.setTextColor(100, 116, 139);
          doc.text('Standard', 138, currentY + 4.2);
        }

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(formatNaira(item.declaredValue * item.quantity), 166, currentY + 4.2);

        currentY += 6;
      });

      if (items.length > 8) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139);
        doc.text(`+ ${items.length - 8} additional items included in full electronic manifest schedule.`, 18, currentY + 4);
        currentY += 5;
      }
    } else {
      doc.setFillColor(255, 255, 255);
      doc.rect(14, currentY, 182, 7, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text('1. Full Consignment Bulk Household / Office Valuation Declaration', 18, currentY + 5);
      doc.text('1 Bulk', 120, currentY + 5);
      doc.text('Standard', 138, currentY + 5);
      doc.setFont('helvetica', 'bold');
      doc.text(formatNaira(lumpSumValue), 166, currentY + 5);
      currentY += 7;
    }

    currentY += 4;

    // 5. Underwriter Certification & Security Notice Box
    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, currentY, 182, 24, 2, 2, 'FD');

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('UNDERWRITING PARTNERS & DISPATCH COMPLIANCE NOTICE:', 18, currentY + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(71, 85, 105);
    doc.text('• Underwritten by Leadway Assurance Plc, AIICO Insurance Plc & AXA Mansard (NIA Licensed).', 18, currentY + 10.5);
    doc.text('• All claims require digital pre-move photo verification recorded during loading by our certified Supervisor.', 18, currentY + 14.5);
    doc.text('• Fast-track payout guarantees apply upon submission of valid police incident report or driver inspection report.', 18, currentY + 18.5);

    currentY += 28;

    // 6. Signature & Footer
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text('Authorized Insurer Desk: Megatrend Movers Risk Management Division', 14, currentY);
    doc.text('Official Digital Stamp: NIA-CERT-VERIFIED-2026', pageWidth - 70, currentY);

    // Save PDF
    doc.save(`Megatrend_GIT_Insurance_Valuation_${quoteRef}.pdf`);
  };

  // WhatsApp link with structured quotation
  const whatsappUrl = useMemo(() => {
    const text = `Hello Megatrend Movers! I used your Item Valuation & Insurance Calculator:
- Declared Cargo Value: ${formatNaira(totalDeclaredValue)}
- Transit Route: ${distanceKm} km (${routeType})
- Policy Tier: ${calculation.tierName}
- Estimated GIT Premium: ${formatNaira(calculation.totalPremium)}
- Item Count: ${valuationMode === 'itemized' ? items.length : 'Lump-Sum'}

Please review and confirm insurance coverage for our upcoming relocation.`;
    return `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`;
  }, [totalDeclaredValue, distanceKm, routeType, calculation, valuationMode, items.length, waNumber]);

  return (
    <section className={`w-full max-w-7xl mx-auto px-4 sm:px-6 py-10 ${className}`} id="item-valuation-insurance-calculator">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 font-mono text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Goods-In-Transit (GIT) Valuation Engine</span>
            </div>
            
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Item Valuation & <span className="text-amber-400">Insurance Calculator</span>
            </h2>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Calculate accurate Goods-in-Transit (GIT) insurance premiums for your household, corporate IT, or freight haulage. Guaranteed full-replacement compensation backed by Nigeria’s top-tier underwriters.
            </p>

            {/* Underwriter Trust Badges */}
            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Underwriting Partners:</span>
              <span className="bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 font-bold text-slate-200">
                Leadway Assurance
              </span>
              <span className="bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 font-bold text-slate-200">
                AIICO Insurance Plc
              </span>
              <span className="bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 font-bold text-slate-200">
                AXA Mansard
              </span>
            </div>
          </div>

          {/* Quick Stat Pill */}
          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex flex-col items-start gap-3 shadow-lg shrink-0 w-full lg:w-72">
            <div>
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">Zero-Risk Relocation Guarantee</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-emerald-400">100%</span>
                <span className="text-xs text-slate-300 font-bold">Replacement Value</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Instant digital Marine / Transit Certificate issued with verified policy number prior to dispatch.
            </p>
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="w-full bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              title="Download Insurance Valuation Summary as PDF"
            >
              <FileDown className="w-3.5 h-3.5 text-amber-400" />
              <span>Download PDF Policy Summary</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Valuation & Parameters (7 Cols) */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* 1. Valuation Method Selection */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base sm:text-lg">Cargo / Item Declared Valuation</h3>
                  <p className="text-slate-400 text-xs">Choose how you wish to declare your item replacement costs</p>
                </div>
              </div>

              {/* Toggle Switch */}
              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setValuationMode('itemized')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    valuationMode === 'itemized'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Itemized List</span>
                </button>
                <button
                  type="button"
                  onClick={() => setValuationMode('lumpsum')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    valuationMode === 'lumpsum'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Lump-Sum Quick</span>
                </button>
              </div>
            </div>

            {/* If Lump-Sum Mode */}
            {valuationMode === 'lumpsum' ? (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-2">
                    Enter Total Declared Replacement Value (₦):
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold text-base">₦</span>
                    <input
                      type="number"
                      min="500000"
                      max="500000000"
                      step="500000"
                      value={lumpSumValue}
                      onChange={(e) => setLumpSumValue(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 text-white font-mono font-bold text-xl rounded-2xl py-3.5 pl-10 pr-4 outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Range Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono text-slate-400">
                    <span>₦1,000,000</span>
                    <span className="text-amber-400 font-bold">{formatNaira(lumpSumValue)}</span>
                    <span>₦100,000,000+</span>
                  </div>
                  <input
                    type="range"
                    min="1000000"
                    max="50000000"
                    step="500000"
                    value={lumpSumValue}
                    onChange={(e) => setLumpSumValue(Number(e.target.value))}
                    className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />
                </div>

                {/* Quick Presets */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider block">
                    Quick Residential & Commercial Benchmarks:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { label: '1-2 Bed Flat', val: 5000000 },
                      { label: '3-Bed Apartment', val: 12000000 },
                      { label: '4-Bed Duplex', val: 25000000 },
                      { label: 'Luxury Mansion', val: 60000000 },
                      { label: 'Office / IT Rack', val: 35000000 },
                      { label: 'Industrial Haul', val: 80000000 },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setLumpSumValue(preset.val)}
                        className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                          lumpSumValue === preset.val
                            ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                            : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="truncate">{preset.label}</div>
                        <div className="font-mono text-[10px] text-slate-400 mt-0.5">{formatNaira(preset.val)}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* If Itemized Mode */
              <div className="space-y-5 animate-in fade-in duration-200">
                {/* Fast Presets Pill Bar */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Quick Add Common High-Value Items:</span>
                  </span>
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                    {ITEM_PRESETS.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleApplyPresetItem(p)}
                        className="px-3 py-1.5 bg-slate-950 hover:bg-amber-500/10 border border-slate-800 hover:border-amber-500/40 rounded-xl text-[11px] font-medium text-slate-300 hover:text-white shrink-0 flex items-center gap-1.5 transition-all active:scale-95"
                      >
                        <Plus className="w-3 h-3 text-amber-400" />
                        <span className="truncate max-w-[170px]">{p.name}</span>
                        <span className="text-amber-400 font-mono text-[10px]">({formatNaira(p.declaredValue)})</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Item Input Form */}
                <form onSubmit={handleAddItem} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <span className="text-xs font-bold text-slate-200 block">Add Custom Item to Valuation Schedule:</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                    <div className="sm:col-span-5">
                      <input
                        type="text"
                        placeholder="Item Description (e.g. 65in OLED TV)"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl p-2.5 outline-none focus:border-amber-400 placeholder-slate-500"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <select
                        value={newItemCategory}
                        onChange={(e) => setNewItemCategory(e.target.value as ValuedItem['category'])}
                        className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl p-2.5 outline-none focus:border-amber-400"
                      >
                        <option value="Living Room">Living Room</option>
                        <option value="Bedroom">Bedroom</option>
                        <option value="Kitchen & Appliances">Kitchen & Appliances</option>
                        <option value="Electronics & IT">Electronics & IT</option>
                        <option value="Fine Art & Antiques">Fine Art & Antiques</option>
                        <option value="Commercial & Industrial">Commercial & Industrial</option>
                        <option value="Other">Other Goods</option>
                      </select>
                    </div>

                    <div className="sm:col-span-4">
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">₦</span>
                        <input
                          type="number"
                          placeholder="Est. Value"
                          value={newItemValue}
                          onChange={(e) => setNewItemValue(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-700 text-white font-mono text-xs rounded-xl py-2.5 pl-6 pr-2 outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                        <input
                          type="checkbox"
                          checked={newItemFragile}
                          onChange={(e) => setNewItemFragile(e.target.checked)}
                          className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-slate-900 border-slate-700"
                        />
                        <span>Fragile / Delicate Item</span>
                      </label>

                      <div className="flex items-center gap-1 text-xs text-slate-300">
                        <span>Qty:</span>
                        <input
                          type="number"
                          min="1"
                          max="50"
                          value={newItemQty}
                          onChange={(e) => setNewItemQty(Math.max(1, Number(e.target.value)))}
                          className="w-14 bg-slate-900 border border-slate-700 text-white text-center text-xs rounded-lg py-1 px-1 outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={!newItemName.trim() || !newItemValue}
                      className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Item</span>
                    </button>
                  </div>
                </form>

                {/* Items Table / List */}
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {items.length === 0 ? (
                    <div className="text-center py-6 text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl">
                      No items added yet. Click above presets or enter items manually.
                    </div>
                  ) : (
                    items.map((item) => (
                      <div
                        key={item.id}
                        className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {item.isFragile && (
                            <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" title="Fragile Item" />
                          )}
                          <div className="truncate">
                            <span className="font-bold text-slate-200 truncate block">{item.name}</span>
                            <span className="text-[10px] text-slate-500">{item.category} • Qty: {item.quantity}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="font-mono font-bold text-slate-200">
                            {formatNaira(item.declaredValue * item.quantity)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Total Tally Footnote */}
                <div className="flex items-center justify-between p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <span className="text-xs font-bold text-slate-300">Total Declared Items Value ({items.length} items):</span>
                  <span className="text-base font-mono font-black text-amber-400">{formatNaira(totalDeclaredValue)}</span>
                </div>
              </div>
            )}
          </div>

          {/* 2. Transit Distance & Route Logistics Profile */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-6">
            <div className="flex items-center gap-2.5 border-b border-slate-800 pb-4">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div>
                <h3 className="font-extrabold text-white text-base sm:text-lg">Transit Route Distance & Risk Profile</h3>
                <p className="text-slate-400 text-xs">Highway mileage and seasonal terrain factors impacting goods-in-transit</p>
              </div>
            </div>

            {/* Popular Route Presets */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider block">
                Select Major Nigerian Freight Corridor:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ROUTE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectRoutePreset(preset)}
                    className={`p-3 rounded-xl border text-xs font-medium text-left flex items-center justify-between gap-2 transition-all ${
                      selectedPresetId === preset.id
                        ? 'bg-amber-500/15 border-amber-400 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="truncate">
                      <span className="font-bold block truncate">{preset.name}</span>
                      <span className="text-[10px] text-slate-400 capitalize">{preset.terrainType} Route Risk</span>
                    </div>
                    <span className="font-mono font-bold text-amber-400 shrink-0">{preset.distanceKm} km</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Distance Slider & Number Input */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300">Custom Transit Distance (km):</label>
                <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-amber-400 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
                  <Truck className="w-3.5 h-3.5" />
                  <span>{distanceKm} Kilometers</span>
                </div>
              </div>

              <input
                type="range"
                min="10"
                max="1800"
                step="10"
                value={distanceKm}
                onChange={(e) => {
                  setDistanceKm(Number(e.target.value));
                  setSelectedPresetId('');
                }}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />

              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>10 km (Intra-city)</span>
                <span>400 km (Regional)</span>
                <span>800 km (Interstate)</span>
                <span>1,800 km (Trans-Nigeria)</span>
              </div>
            </div>

            {/* Route Risk / Weather Condition Toggle */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              {[
                { id: 'standard', title: 'Standard Express', desc: 'Dry season highway corridor' },
                { id: 'monsoon', title: 'Monsoon Rain Guard', desc: 'Heavy moisture & flash flood seal' },
                { id: 'escort', title: 'High-Security Escort', desc: '24/7 dedicated convoy tracking' },
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRouteType(r.id as any)}
                  className={`p-2.5 rounded-xl border text-xs text-left transition-all ${
                    routeType === r.id
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="font-bold block text-slate-200">{r.title}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5 leading-tight">{r.desc}</span>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Plan Tier Selection & Real-Time Calculation Breakdown (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Policy Tier Selector Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl">
            <div className="flex items-center gap-2.5 border-b border-slate-800 pb-4">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <div>
                <h3 className="font-extrabold text-white text-base sm:text-lg">Select GIT Protection Tier</h3>
                <p className="text-slate-400 text-xs">Tailored to your risk profile and item sensitivity</p>
              </div>
            </div>

            {/* Tier Cards */}
            <div className="space-y-3">
              {[
                {
                  id: 'basic',
                  name: 'Standard Carrier Liability',
                  rate: '₦0 (Included)',
                  desc: 'Statutory weight-based liability (₦1,000/kg). Best for non-fragile basic goods.',
                  badge: 'Standard Baseline',
                },
                {
                  id: 'silver',
                  name: 'Silver Comprehensive Transit',
                  rate: '1.10% Base Rate',
                  desc: 'Covers road collision, overturned vehicle, water damage & major impacts.',
                  badge: 'Residential Standard',
                },
                {
                  id: 'gold',
                  name: 'Gold All-Risk Replacement',
                  rate: '1.65% Base Rate',
                  desc: 'Full market replacement, zero deductible, 48h fast-track payout, theft & drops.',
                  badge: 'Most Popular',
                  popular: true,
                },
                {
                  id: 'platinum',
                  name: 'Platinum High-Tech & Haulage',
                  rate: '2.40% Base Rate',
                  desc: 'Specialized for corporate IT servers, luxury antiques, zero deductible + loss-of-use.',
                  badge: 'Enterprise Cargo',
                },
              ].map((tier) => (
                <div
                  key={tier.id}
                  onClick={() => setSelectedTier(tier.id as InsuranceTier)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    selectedTier === tier.id
                      ? 'bg-amber-500/15 border-amber-400 shadow-md ring-1 ring-amber-400/50'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        selectedTier === tier.id ? 'border-amber-400 bg-amber-400' : 'border-slate-600'
                      }`}>
                        {selectedTier === tier.id && <Check className="w-3 h-3 text-slate-950 stroke-[3]" />}
                      </div>
                      <span className="font-bold text-white text-xs">{tier.name}</span>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      tier.popular
                        ? 'bg-amber-500 text-slate-950 font-black'
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      {tier.badge}
                    </span>
                  </div>

                  <div className="pl-6 flex items-center justify-between text-xs">
                    <p className="text-slate-400 text-[11px] leading-snug max-w-[260px]">{tier.desc}</p>
                    <span className="font-mono font-black text-amber-400 text-xs shrink-0">{tier.rate}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Deductible Choice */}
            {selectedTier !== 'basic' && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider block">
                  Deductible Option:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeductibleChoice('zero')}
                    className={`p-2 rounded-xl border text-[11px] font-bold text-center transition-all ${
                      deductibleChoice === 'zero'
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    0% Zero Deductible
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeductibleChoice('standard')}
                    className={`p-2 rounded-xl border text-[11px] font-bold text-center transition-all ${
                      deductibleChoice === 'standard'
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    5% Standard
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeductibleChoice('high')}
                    className={`p-2 rounded-xl border text-[11px] font-bold text-center transition-all ${
                      deductibleChoice === 'high'
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    10% Higher Excess (-15% Rate)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Premium Calculation Summary Card */}
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl relative overflow-hidden" id="calculated-insurance-premium-box">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-amber-400 uppercase font-black tracking-wider block">
                  Official Estimation Summary
                </span>
                <h4 className="font-extrabold text-white text-base">GIT Insurance Premium</h4>
              </div>
              <ShieldCheck className="w-7 h-7 text-emerald-400" />
            </div>

            {/* Price Display */}
            <div className="bg-slate-950/90 rounded-2xl p-4 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-medium block">Total Calculated Premium:</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-amber-400 font-mono tracking-tight">
                  {formatNaira(calculation.totalPremium)}
                </span>
                {calculation.totalPremium > 0 && (
                  <span className="text-xs text-slate-400 font-medium">/ complete trip</span>
                )}
              </div>
              <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold pt-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Underwritten by Leadway Assurance & AIICO Insurance</span>
              </p>
            </div>

            {/* Line-by-line Cost Breakdown */}
            <div className="space-y-2 text-xs border-t border-slate-800/80 pt-3">
              <div className="flex justify-between text-slate-300">
                <span>Declared Cargo Value:</span>
                <span className="font-mono font-bold text-white">{formatNaira(totalDeclaredValue)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Policy Tier & Rate:</span>
                <span className="font-mono text-amber-400 font-bold">{calculation.tierName.split(' ')[0]} ({calculation.baseRatePercent}%)</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Base Value Premium:</span>
                <span className="font-mono text-slate-200">{formatNaira(calculation.basePremium)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Distance Risk Charge ({distanceKm} km):</span>
                <span className="font-mono text-slate-200">+{formatNaira(calculation.distanceSurcharge)}</span>
              </div>
              {calculation.fragileSurcharge > 0 && (
                <div className="flex justify-between text-slate-300">
                  <span>Fragile Cargo Handling ({fragileCount} items):</span>
                  <span className="font-mono text-slate-200">+{formatNaira(calculation.fragileSurcharge)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-300">
                <span>Claim Deductible:</span>
                <span className="font-mono text-slate-300">{calculation.deductibleDesc}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Fast Payout Guarantee:</span>
                <span className="font-mono text-emerald-400 font-bold">{calculation.turnaroundHours}</span>
              </div>
            </div>

            {/* Interactive Action Buttons */}
            <div className="space-y-2.5 pt-2">
              
              {onApplyToQuote && (
                <button
                  type="button"
                  onClick={() => {
                    const itemsSummary = valuationMode === 'itemized'
                      ? `${items.length} items (Total Val: ${formatNaira(totalDeclaredValue)})`
                      : `Lump Sum Declared Val: ${formatNaira(totalDeclaredValue)}`;
                    onApplyToQuote(totalDeclaredValue, calculation.totalPremium, calculation.tierName, itemsSummary);
                  }}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm py-3.5 px-4 rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all transform active:scale-98"
                  id="apply-insurance-to-quote-btn"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Apply to Formal Relocation Quote</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {/* Primary PDF Download Button */}
              <button
                type="button"
                onClick={handleDownloadPdf}
                className="w-full bg-slate-900 hover:bg-slate-800 text-amber-300 hover:text-amber-200 border-2 border-amber-500/40 hover:border-amber-400 font-black text-xs sm:text-sm py-3 px-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-98"
                id="download-insurance-pdf-summary-btn"
                title="Download formal Goods-in-Transit (GIT) Valuation Schedule PDF"
              >
                <FileDown className="w-4 h-4 text-amber-400" />
                <span>Download Summary as PDF</span>
                <span className="bg-amber-500/20 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-md border border-amber-500/30">
                  Official PDF
                </span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleDownloadManifest}
                  className="bg-slate-950 hover:bg-slate-900 text-slate-300 border border-slate-800 font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                  id="download-valuation-manifest-btn"
                  title="Download Itemized Valuation Schedule TXT"
                >
                  <Download className="w-3.5 h-3.5 text-slate-400" />
                  <span>Download .TXT</span>
                </button>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors text-center"
                  id="wa-underwriter-desk-btn"
                  title="Forward to Leadway/AIICO Insurance Underwriter Desk"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-current" />
                  <span>WhatsApp Desk</span>
                </a>
              </div>

            </div>

            <p className="text-[10px] text-slate-500 text-center leading-relaxed">
              *Certificate of Insurance is officially registered with the Nigerian Insurers Association (NIA) upon payment confirmation.
            </p>
          </div>

        </div>

      </div>

    </section>
  );
};
