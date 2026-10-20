import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Minus, 
  Trash2, 
  Calculator, 
  Check, 
  Truck, 
  Box, 
  Layers, 
  ArrowRight, 
  RotateCcw,
  Camera,
  Image as ImageIcon,
  Sparkles,
  Maximize2,
  X,
  Info,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Gauge,
  ArrowLeftRight,
  Zap,
  ChevronDown,
  ChevronUp,
  CheckCheck,
  ShieldCheck,
  Sliders,
  TrendingUp,
  Minimize2
} from 'lucide-react';
import { INITIAL_INVENTORY_ITEMS } from '../data/companyData';
import { InventoryItem, SiteSurveyPhoto, PackingDensityTrendPoint } from '../types';
import { SiteSurveyCameraModal } from './SiteSurveyCameraModal';
import { SmartPackingAssistant } from './SmartPackingAssistant';
import { PackingDensityTrendChart } from './PackingDensityTrendChart';

const INVENTORY_STORAGE_KEY = 'megatrend_inventory_planner_items';
const SURVEY_PHOTOS_STORAGE_KEY = 'megatrend_inventory_survey_photos';

interface InventoryPlannerProps {
  onAttachToQuote: (itemsSummary: string, totalCbm: number, surveyPhotos?: SiteSurveyPhoto[]) => void;
  onOpenCargoInspection?: () => void;
}

export const InventoryPlanner: React.FC<InventoryPlannerProps> = ({ 
  onAttachToQuote,
  onOpenCargoInspection
}) => {
  const [plannerTab, setPlannerTab] = useState<'smart_assistant' | 'manifest_builder'>('smart_assistant');

  const [items, setItems] = useState<InventoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(INVENTORY_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load inventory from localStorage', e);
    }
    return INITIAL_INVENTORY_ITEMS;
  });

  const [surveyPhotos, setSurveyPhotos] = useState<SiteSurveyPhoto[]>(() => {
    try {
      const saved = localStorage.getItem(SURVEY_PHOTOS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load survey photos from localStorage', e);
    }
    return [];
  });

  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<InventoryItem['category']>('Boxes & Crates');
  const [isCameraModalOpen, setIsCameraModalOpen] = useState<boolean>(false);
  const [selectedPhotoPreview, setSelectedPhotoPreview] = useState<SiteSurveyPhoto | null>(null);

  // Real-Time Space Optimization & Item Swap State
  const [appliedManifestSwaps, setAppliedManifestSwaps] = useState<string[]>([]);
  const [isSwapsTrayOpen, setIsSwapsTrayOpen] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Packing Density Trend History (tracked across user session)
  const [trendHistory, setTrendHistory] = useState<PackingDensityTrendPoint[]>(() => {
    try {
      const saved = sessionStorage.getItem('pyda_inventory_density_trend');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Could not read saved trend history', e);
    }
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return [
      {
        id: 'step-init',
        step: 1,
        label: 'Baseline (72%)',
        timestamp: timeStr,
        action: 'Initial Standard Inventory Manifest',
        densityScore: 72,
        voidSpaceCbm: 1.62,
        totalCbm: 10.4,
        cbmSaved: 0,
        efficiencyGain: 0
      }
    ];
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const recordTrendStep = (actionName: string, newScore: number, newVoidCbm: number, newTotalCbm: number) => {
    setTrendHistory((prev) => {
      const baseline = prev[0]?.densityScore || 72;
      const baseVoid = prev[0]?.voidSpaceCbm || 1.62;
      const stepNum = prev.length + 1;
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const cbmSaved = Math.max(0, parseFloat((baseVoid - newVoidCbm).toFixed(2)));
      const efficiencyGain = newScore - baseline;

      const newPoint: PackingDensityTrendPoint = {
        id: `trend-${Date.now()}-${stepNum}`,
        step: stepNum,
        label: `Step ${stepNum} (${newScore}%)`,
        timestamp: timeStr,
        action: actionName,
        densityScore: newScore,
        voidSpaceCbm: newVoidCbm,
        totalCbm: newTotalCbm,
        cbmSaved,
        efficiencyGain
      };

      const updated = [...prev, newPoint];
      try {
        sessionStorage.setItem('pyda_inventory_density_trend', JSON.stringify(updated));
      } catch (e) {
        // ignore
      }
      return updated;
    });
  };

  const handleResetTrend = () => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const resetPoint: PackingDensityTrendPoint = {
      id: `trend-reset-${Date.now()}`,
      step: 1,
      label: `Baseline (${manifestDensityScore}%)`,
      timestamp: timeStr,
      action: 'Session Benchmark Reset to Current Manifest State',
      densityScore: manifestDensityScore,
      voidSpaceCbm: estimatedVoidSpaceCbm,
      totalCbm,
      cbmSaved: 0,
      efficiencyGain: 0
    };
    setTrendHistory([resetPoint]);
    try {
      sessionStorage.setItem('pyda_inventory_density_trend', JSON.stringify([resetPoint]));
    } catch (e) {}
    showToast('Packing density trend history reset to current manifest benchmark.');
  };

  const handleSimulateStep = () => {
    const nextScore = Math.min(98, manifestDensityScore + 3);
    const nextVoid = Math.max(0.06, parseFloat((estimatedVoidSpaceCbm - 0.12).toFixed(2)));
    const nextTotal = parseFloat((totalCbm - 0.12).toFixed(2));
    recordTrendStep(
      'Simulated Multi-Tier Carton Compaction (+3% Density)',
      nextScore,
      nextVoid,
      nextTotal
    );
    showToast(`Simulated Box Compaction Step: Density climbed to ${nextScore}%!`);
  };

  // Real-time suggestions for space optimization
  const MANIFEST_SWAP_OPTIONS = [
    {
      id: 'swap-files-archive',
      title: 'Swap Standard Boxes to Heavy-Duty Document Archive Cartons',
      category: 'Boxes & Crates',
      fromName: 'Standard Moving Box (Files)',
      toName: 'Heavy-Duty Double-Wall Archive Box (Compact 1.5 cu ft)',
      fromCbm: 0.1,
      toCbm: 0.08,
      densityBoost: 7,
      cbmSaved: 0.50,
      keywordMatch: 'Files',
      rationale: 'Heavy documents deform single-wall boxes and cause 30% dead air space. Heavy-duty double-wall archive cartons allow 4-tier vertical ceiling stacking without bottom wall sag.',
      ergonomicBenefit: 'Maintains gross unit lift weight strictly below carrier manual handling threshold (<22kg).'
    },
    {
      id: 'swap-desks-flatpack',
      title: 'Disassemble Executive Desks into Flat-Pack Modular Pallets',
      category: 'Furniture',
      fromName: 'Executive Office Desk',
      toName: 'Executive Office Desk (Disassembled Flat-Pack Panels & Legs)',
      fromCbm: 1.2,
      toCbm: 0.65,
      densityBoost: 11,
      cbmSaved: 2.20,
      keywordMatch: 'Desk',
      rationale: 'Fully assembled desks enclose massive hollow leg chambers that cannot bear top weight. Disassembling tops and side modesty panels eliminates over 45% dead air volume.',
      ergonomicBenefit: 'Permits smooth transit through narrow service elevators and 90° stairwells without wall gouging.'
    },
    {
      id: 'swap-pcs-nesting',
      title: 'Nest Desktop PC Workstations into Padded Furniture Storage Cavities',
      category: 'Electronics',
      fromName: 'Desktop PC & Monitor Setup',
      toName: 'Desktop PC & Monitor Setup (Nested in Padded Furniture Cavity)',
      fromCbm: 0.2,
      toCbm: 0.12,
      densityBoost: 6,
      cbmSaved: 0.80,
      keywordMatch: 'Desktop PC',
      rationale: 'Padded furniture drawer cavities and internal credenza lockers can house wrapped IT peripherals with tension wrap, eliminating external loose outer box volume.',
      ergonomicBenefit: 'Pairs electronics directly with host workstations, reducing handling touches by 50%.'
    },
    {
      id: 'swap-server-crating',
      title: 'Encase 42U Server Rack in Fitted Plywood Crate with Vibration Dampers',
      category: 'Special / Fragile',
      fromName: 'Server Rack 42U Unit',
      toName: 'Server Rack 42U (Precision Fitted Anti-Shock Plywood Crate)',
      fromCbm: 1.8,
      toCbm: 1.4,
      densityBoost: 5,
      cbmSaved: 0.40,
      keywordMatch: 'Server Rack',
      rationale: 'Uncrated server racks require 30cm clearance buffers on all perimeter sides. Custom rigid crating allows flush loading directly against truck headboards.',
      ergonomicBenefit: 'Includes 4-way mechanical forklift skid bases for rapid dock loading.'
    }
  ];

  // Persist inventory items to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to persist inventory to localStorage', e);
    }
  }, [items]);

  // Persist survey photos to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SURVEY_PHOTOS_STORAGE_KEY, JSON.stringify(surveyPhotos));
    } catch (e) {
      console.error('Failed to persist survey photos to localStorage', e);
    }
  }, [surveyPhotos]);

  const updateQty = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(1, item.qty + delta);
          return { ...item, qty: newQty };
        }
        return item;
      })
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    const newItem: InventoryItem = {
      id: Date.now().toString(),
      category: newItemCategory,
      name: newItemName.trim(),
      volumeCbm: newItemCategory === 'Boxes & Crates' ? 0.1 : newItemCategory === 'Electronics' ? 0.3 : 1.0,
      qty: 1,
    };
    setItems([...items, newItem]);
    setNewItemName('');
  };

  const handleSaveSurveyPhoto = (newPhoto: SiteSurveyPhoto) => {
    setSurveyPhotos((prev) => [newPhoto, ...prev]);
  };

  const handleRemoveSurveyPhoto = (id: string) => {
    setSurveyPhotos((prev) => prev.filter((p) => p.id !== id));
    if (selectedPhotoPreview?.id === id) {
      setSelectedPhotoPreview(null);
    }
  };

  const handleResetInventory = () => {
    if (window.confirm('Reset inventory, real-time swaps and survey photos to default benchmark?')) {
      setItems(INITIAL_INVENTORY_ITEMS);
      setSurveyPhotos([]);
      setAppliedManifestSwaps([]);
      localStorage.removeItem(SURVEY_PHOTOS_STORAGE_KEY);
      showToast('Inventory reset to standard corporate benchmark.');
    }
  };

  // Toggle specific real-time swap in the manifest
  const handleToggleManifestSwap = (swapId: string) => {
    const swap = MANIFEST_SWAP_OPTIONS.find((s) => s.id === swapId);
    if (!swap) return;

    const isApplied = appliedManifestSwaps.includes(swapId);

    if (isApplied) {
      // Revert swap
      setItems((prev) =>
        prev.map((item) => {
          if (
            item.name.toLowerCase().includes(swap.toName.toLowerCase()) ||
            item.name.toLowerCase().includes(swap.keywordMatch.toLowerCase())
          ) {
            return {
              ...item,
              name: swap.fromName,
              volumeCbm: swap.fromCbm,
            };
          }
          return item;
        })
      );
      setAppliedManifestSwaps((prev) => prev.filter((id) => id !== swapId));
      showToast(`Reverted "${swap.fromName}" back to standard container.`);

      const targetScore = Math.max(72, manifestDensityScore - Math.round(swap.densityBoost * 0.75));
      const targetVoid = parseFloat((estimatedVoidSpaceCbm + swap.cbmSaved).toFixed(2));
      const targetTotal = parseFloat((totalCbm + swap.cbmSaved).toFixed(2));
      recordTrendStep(`Reverted Swap: ${swap.fromName}`, targetScore, targetVoid, targetTotal);
    } else {
      // Apply swap
      setItems((prev) =>
        prev.map((item) => {
          if (item.name.toLowerCase().includes(swap.keywordMatch.toLowerCase())) {
            return {
              ...item,
              name: swap.toName,
              volumeCbm: swap.toCbm,
            };
          }
          return item;
        })
      );
      setAppliedManifestSwaps((prev) => [...prev, swapId]);
      showToast(`Applied Space Optimization: ${swap.title} (+${swap.densityBoost}% Density Boost)!`);

      const targetScore = Math.min(96, manifestDensityScore + Math.round(swap.densityBoost * 0.75));
      const targetVoid = Math.max(0.08, parseFloat((estimatedVoidSpaceCbm - swap.cbmSaved).toFixed(2)));
      const targetTotal = parseFloat((totalCbm - swap.cbmSaved).toFixed(2));
      recordTrendStep(swap.title, targetScore, targetVoid, targetTotal);
    }
  };

  // Apply all real-time space optimization swaps
  const handleApplyAllManifestSwaps = () => {
    MANIFEST_SWAP_OPTIONS.forEach((swap) => {
      setItems((prev) =>
        prev.map((item) => {
          if (item.name.toLowerCase().includes(swap.keywordMatch.toLowerCase())) {
            return {
              ...item,
              name: swap.toName,
              volumeCbm: swap.toCbm,
            };
          }
          return item;
        })
      );
    });
    setAppliedManifestSwaps(MANIFEST_SWAP_OPTIONS.map((s) => s.id));
    showToast('Applied all 4 space optimization swaps! Maximum volumetric packing density achieved.');
    recordTrendStep('Applied All 4 Space Optimization Swaps (Max Compaction)', 95, 0.38, parseFloat((totalCbm - 2.8).toFixed(2)));
  };

  // Revert all manifest swaps
  const handleRevertAllManifestSwaps = () => {
    MANIFEST_SWAP_OPTIONS.forEach((swap) => {
      setItems((prev) =>
        prev.map((item) => {
          if (
            item.name.toLowerCase().includes(swap.toName.toLowerCase()) ||
            item.name.toLowerCase().includes(swap.keywordMatch.toLowerCase())
          ) {
            return {
              ...item,
              name: swap.fromName,
              volumeCbm: swap.fromCbm,
            };
          }
          return item;
        })
      );
    });
    setAppliedManifestSwaps([]);
    showToast('Reverted all real-time swaps to baseline standard items.');
    recordTrendStep('Reverted All Swaps to Standard Baseline Cartons', 72, 1.62, 10.4);
  };

  // Calculations
  const totalItemsCount = items.reduce((sum, i) => sum + i.qty, 0);
  const itemsCbm = items.reduce((sum, i) => sum + i.volumeCbm * i.qty, 0);
  const surveyCbm = surveyPhotos.reduce((sum, p) => sum + (p.estimatedCbm || 1.0), 0);
  
  // Real-time density metrics
  const baseDensity = Math.min(88, Math.max(68, Math.round((itemsCbm / Math.max(0.1, itemsCbm * 1.18)) * 100)));
  const swapBonus = appliedManifestSwaps.reduce((acc, id) => {
    const sw = MANIFEST_SWAP_OPTIONS.find((s) => s.id === id);
    return acc + (sw?.densityBoost || 0);
  }, 0);
  
  const manifestDensityScore = Math.min(96, Math.max(72, baseDensity + Math.round(swapBonus * 0.75)));
  
  // Buffer adjusts with density: higher density requires smaller safety clearance margin
  const bufferMargin = Math.max(0.8, 2.0 - (appliedManifestSwaps.length * 0.28));
  const totalCbm = parseFloat((itemsCbm + surveyCbm + bufferMargin).toFixed(2));
  
  const estimatedVoidSpaceCbm = parseFloat(
    Math.max(0.08, totalCbm * (manifestDensityScore >= 88 ? 0.08 : manifestDensityScore >= 80 ? 0.14 : 0.22)).toFixed(2)
  );
  const voidPercent = Math.max(5, Math.min(32, Math.round((estimatedVoidSpaceCbm / Math.max(0.1, totalCbm)) * 100)));
  
  let densityGrade = 'Balanced Baseline';
  if (manifestDensityScore >= 88) {
    densityGrade = 'Optimal High-Density Compaction';
  } else if (manifestDensityScore >= 78) {
    densityGrade = 'Balanced Space Utilization';
  } else {
    densityGrade = 'Moderate Void Air Pockets';
  }

  const getRecommendedVehicle = (cbm: number) => {
    if (cbm <= 5) return '3-Ton Padded Moving Van';
    if (cbm <= 15) return '5-Ton Covered Box Truck';
    if (cbm <= 30) return '10-Ton Heavy Logistics Truck';
    if (cbm <= 55) return '20-Ton Heavy Haulage Rig / 20ft Container';
    return '30-Ton Multi-Axle Haulage Trailer / 40ft Container';
  };

  const handleAddBoxesToManifest = (boxes: { name: string; category: any; volumeCbm: number; qty: number }[]) => {
    const newItems: InventoryItem[] = boxes.map((b, idx) => ({
      id: `ai-box-${Date.now()}-${idx}`,
      category: 'Boxes & Crates',
      name: b.name,
      volumeCbm: b.volumeCbm,
      qty: b.qty,
    }));
    setItems((prev) => [...prev, ...newItems]);
    setPlannerTab('manifest_builder');
    const totalAddedBoxes = boxes.reduce((acc, b) => acc + b.qty, 0);
    recordTrendStep(
      `Injected ${totalAddedBoxes} AI Optimized Boxes to Manifest`,
      Math.min(96, manifestDensityScore + 5),
      Math.max(0.08, parseFloat((estimatedVoidSpaceCbm - 0.25).toFixed(2))),
      totalCbm
    );
  };

  const handleApplyToQuote = () => {
    const photoDetails = surveyPhotos.length > 0
      ? ` | ${surveyPhotos.length} Bulky Site Survey Photo(s) Attached: [${surveyPhotos.map(p => `${p.label} (~${p.estimatedCbm || 1.0} CBM)`).join(', ')}]`
      : '';
    const summary = `${totalItemsCount} standard items (${items.map((i) => `${i.qty}x ${i.name}`).join(', ')})${photoDetails}`;
    onAttachToQuote(summary, totalCbm, surveyPhotos);
  };

  return (
    <section id="inventory-planner" className="py-16 bg-slate-950 text-white relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 text-amber-300 font-extrabold text-xs uppercase tracking-widest bg-gradient-to-r from-amber-500/15 to-emerald-500/15 border border-amber-500/30 px-4 py-1.5 rounded-full shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Google AI Studio • Volumetric Packing Hub</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">CBM Volume & Smart Packing Hub</h2>
          <p className="text-slate-300 text-sm">
            Leverage Google AI Studio multimodal intelligence to calculate optimal carton sizing, density balancing, and protective crating from Digital Cargo Inspection volume measurements.
          </p>
        </div>

        {/* Planner Mode Switcher Tabs */}
        <div className="flex justify-center">
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl max-w-xl w-full">
            <button
              onClick={() => setPlannerTab('smart_assistant')}
              className={`flex-1 py-3 px-4 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 ${
                plannerTab === 'smart_assistant'
                  ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-[#83b735] text-slate-950 shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-4 h-4 fill-current" />
              <span>Smart Packing Assistant</span>
              <span className="bg-slate-950/20 text-[10px] px-2 py-0.5 rounded-full font-bold ml-1">
                Google AI Studio
              </span>
            </button>

            <button
              onClick={() => setPlannerTab('manifest_builder')}
              className={`flex-1 py-3 px-4 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 ${
                plannerTab === 'manifest_builder'
                  ? 'bg-amber-500 text-slate-950 shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Box className="w-4 h-4" />
              <span>Moving Inventory Manifest</span>
              <span className="bg-slate-800 text-amber-400 text-[10px] px-2 py-0.5 rounded-full font-bold ml-1">
                {items.length} Items
              </span>
            </button>
          </div>
        </div>

        {/* MODE 1: SMART PACKING ASSISTANT (GEMINI AI) */}
        {plannerTab === 'smart_assistant' && (
          <div className="space-y-6">
            <SmartPackingAssistant
              onAddBoxesToManifest={handleAddBoxesToManifest}
              onAttachToQuote={(summary, cbm) => onAttachToQuote(summary, cbm, surveyPhotos)}
              onOpenCargoInspection={onOpenCargoInspection}
              currentInventoryCbm={totalCbm}
            />
          </div>
        )}

        {/* MODE 2: MANIFEST BUILDER & BULKY SURVEY PHOTOS */}
        {plannerTab === 'manifest_builder' && (
          <div className="space-y-6 animate-fade-in">
            {/* VISUAL PACKING DENSITY SCORE GAUGE & REAL-TIME SWAP SUGGESTIONS */}
            <div className="bg-gradient-to-br from-[#0c2415] via-[#091a10] to-slate-950 border border-emerald-600/50 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 relative overflow-hidden">
              
              {/* Top Banner Row: Gauge + Grade + High-level Metrics */}
              <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                
                {/* Radial Circular Density Gauge */}
                <div className="flex items-center gap-5 sm:gap-6 shrink-0 w-full lg:w-auto">
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                      {/* Track Circle */}
                      <circle cx="50" cy="50" r="40" className="stroke-slate-800" strokeWidth="8" fill="transparent" />
                      {/* Progress Circle with Dynamic Color */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        className={`transition-all duration-700 ease-out ${
                          manifestDensityScore >= 88
                            ? 'stroke-[#83b735]'
                            : manifestDensityScore >= 78
                            ? 'stroke-amber-400'
                            : 'stroke-rose-400'
                        }`}
                        strokeWidth="8"
                        strokeDasharray={`${2 * Math.PI * 40}`}
                        strokeDashoffset={`${2 * Math.PI * 40 * (1 - manifestDensityScore / 100)}`}
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
                        {manifestDensityScore}%
                      </span>
                      <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider">
                        Density
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Gauge className="w-4 h-4 text-[#83b735]" />
                      <span className="text-xs font-black uppercase tracking-wider text-slate-300">
                        Packing Density Score
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                        <Zap className="w-3 h-3 text-amber-400" />
                        <span>{appliedManifestSwaps.length} of {MANIFEST_SWAP_OPTIONS.length} Swaps Applied</span>
                      </span>
                    </div>
                    
                    <h4 className="text-base sm:text-lg font-black text-white truncate">
                      {densityGrade}
                    </h4>
                    
                    <p className="text-[11px] text-slate-400 max-w-sm leading-snug">
                      {manifestDensityScore >= 88
                        ? 'High volumetric compaction achieved with minimal dead-space air pockets.'
                        : manifestDensityScore >= 78
                        ? 'Balanced baseline density. Real-time carton swaps can eliminate remaining void air pockets.'
                        : 'Significant void pockets detected. Apply swap recommendations below to optimize truck volume.'}
                    </p>
                  </div>
                </div>

                {/* Diagnostic Metric Bars */}
                <div className="flex-1 w-full grid sm:grid-cols-3 gap-3 text-xs">
                  {/* Metric 1: Volumetric Cube Fit */}
                  <div className="bg-[#0f2e1b]/80 border border-emerald-800/40 p-3 rounded-2xl space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-300 font-bold flex items-center gap-1">
                        <Box className="w-3.5 h-3.5 text-amber-400" />
                        <span>Cube Fit</span>
                      </span>
                      <span className="font-mono font-bold text-amber-400">{manifestDensityScore}%</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-[#83b735] h-full transition-all duration-500"
                        style={{ width: `${manifestDensityScore}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 block truncate">
                      Items: {itemsCbm.toFixed(2)} CBM • Total: {totalCbm} CBM
                    </span>
                  </div>

                  {/* Metric 2: Void Air Pockets */}
                  <div className="bg-[#0f2e1b]/80 border border-emerald-800/40 p-3 rounded-2xl space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-300 font-bold flex items-center gap-1">
                        <Minimize2 className="w-3.5 h-3.5 text-sky-400" />
                        <span>Void Air Pockets</span>
                      </span>
                      <span className="font-mono font-bold text-sky-400">{voidPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-sky-400 h-full transition-all duration-500"
                        style={{ width: `${voidPercent}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 block truncate">
                      Dead Space: ~{estimatedVoidSpaceCbm} CBM
                    </span>
                  </div>

                  {/* Metric 3: Center-of-Gravity Balance */}
                  <div className="bg-[#0f2e1b]/80 border border-emerald-800/40 p-3 rounded-2xl space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-300 font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Axle CG Stability</span>
                      </span>
                      <span className="font-mono font-bold text-emerald-400">
                        {Math.min(98, 86 + appliedManifestSwaps.length * 3)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-400 h-full transition-all duration-500"
                        style={{ width: `${Math.min(98, 86 + appliedManifestSwaps.length * 3)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 block truncate">
                      Anti-Sag & Anti-Roll Balanced
                    </span>
                  </div>
                </div>

              </div>

              {/* Action Toolbar: Swaps Strip */}
              <div className="pt-3 border-t border-emerald-950/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-300 w-full sm:w-auto">
                  <ArrowLeftRight className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-xs">
                    <strong>Real-Time Suggestions:</strong> 4 space swaps can boost volumetric density by up to +29%
                  </span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                  {appliedManifestSwaps.length < MANIFEST_SWAP_OPTIONS.length ? (
                    <button
                      onClick={handleApplyAllManifestSwaps}
                      className="bg-[#83b735] hover:bg-[#72a32c] text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                    >
                      <Zap className="w-3.5 h-3.5 fill-slate-950" />
                      <span>Apply All Swaps (+29%)</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleRevertAllManifestSwaps}
                      className="bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-bold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Revert All Swaps</span>
                    </button>
                  )}

                  <button
                    onClick={() => setIsSwapsTrayOpen(!isSwapsTrayOpen)}
                    className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-400 text-amber-400 font-bold text-xs transition-colors flex items-center gap-1"
                  >
                    <span>{isSwapsTrayOpen ? 'Hide Real-Time Swaps' : 'Show Real-Time Swaps (4)'}</span>
                    {isSwapsTrayOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => setPlannerTab('smart_assistant')}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs transition-all shadow-md flex items-center gap-1.5 transform active:scale-95"
                    title="Launch full AI Smart Packing Assistant"
                  >
                    <Sparkles className="w-3.5 h-3.5 fill-current" />
                    <span>Gemini Smart Packing</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Collapsible Real-Time Swap Suggestions Cards */}
              {isSwapsTrayOpen && (
                <div className="pt-3 border-t border-emerald-950/60 grid sm:grid-cols-2 gap-3.5 animate-fade-in">
                  {MANIFEST_SWAP_OPTIONS.map((swap) => {
                    const isApplied = appliedManifestSwaps.includes(swap.id);

                    return (
                      <div
                        key={swap.id}
                        className={`rounded-2xl p-4 border transition-all duration-300 flex flex-col justify-between space-y-3 shadow-md ${
                          isApplied
                            ? 'bg-gradient-to-br from-[#0f2e1b] to-slate-950 border-[#83b735] ring-1 ring-[#83b735]/40'
                            : 'bg-slate-950/90 border-slate-800/90 hover:border-amber-500/40'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                              isApplied
                                ? 'bg-[#83b735]/20 text-[#83b735] border-[#83b735]/40'
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            }`}>
                              {isApplied ? '✓ Swap Applied & Compacted' : 'AI Recommendation'}
                            </span>

                            <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-800/40">
                              +{swap.densityBoost}% Density Boost
                            </span>
                          </div>

                          <h5 className="font-bold text-white text-xs leading-snug">
                            {swap.title}
                          </h5>

                          {/* From -> To Container mapping */}
                          <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between gap-2 text-[10px]">
                            <div className="space-y-0.5 text-left flex-1 min-w-0">
                              <span className="text-[8px] uppercase tracking-wider text-rose-400 font-bold block">From Format</span>
                              <p className="text-slate-300 font-medium truncate">{swap.fromName}</p>
                            </div>

                            <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-amber-400 shrink-0">
                              <ArrowRight className="w-3 h-3" />
                            </div>

                            <div className="space-y-0.5 text-right flex-1 min-w-0">
                              <span className="text-[8px] uppercase tracking-wider text-[#83b735] font-bold block">To Format</span>
                              <p className="text-white font-bold truncate">{swap.toName}</p>
                            </div>
                          </div>

                          <p className="text-[11px] text-slate-300 leading-relaxed">
                            {swap.rationale}
                          </p>

                          <div className="flex items-center gap-1.5 text-[10px] text-amber-300/90 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                            <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>{swap.ergonomicBenefit}</span>
                          </div>
                        </div>

                        {/* Card Footer with action button */}
                        <div className="pt-2 border-t border-slate-900 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400">
                            Saves: <strong className="text-white">~{swap.cbmSaved} CBM Void Space</strong>
                          </span>

                          <button
                            onClick={() => handleToggleManifestSwap(swap.id)}
                            className={`text-xs font-black px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 active:scale-95 ${
                              isApplied
                                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                                : 'bg-gradient-to-r from-amber-500 to-[#83b735] text-slate-950 shadow-md hover:opacity-95'
                            }`}
                          >
                            {isApplied ? (
                              <>
                                <CheckCheck className="w-3.5 h-3.5 text-[#83b735]" />
                                <span>Revert Swap</span>
                              </>
                            ) : (
                              <>
                                <Zap className="w-3.5 h-3.5 fill-slate-950" />
                                <span>Apply Swap & Compact</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>

            {/* PACKING DENSITY TREND VISUALIZATION (POWERED BY RECHARTS) */}
            <PackingDensityTrendChart
              trendHistory={trendHistory}
              currentScore={manifestDensityScore}
              currentVoidCbm={estimatedVoidSpaceCbm}
              totalCbm={totalCbm}
              onResetTrend={handleResetTrend}
              onSimulateStep={handleSimulateStep}
              title="Packing Density Trend & Session Efficiency"
              subtitle="Real-time telematics curve showing volumetric density growth and void air pocket compression across your current planning session as box usage is optimized."
            />
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Site Survey Photo Verification</h4>
                  <p className="text-xs text-slate-400">
                    Snap photos of heavy safes, generators, conference tables, or fragile machinery
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setIsCameraModalOpen(true)}
                  className="flex-1 sm:flex-initial bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-95"
                >
                  <Camera className="w-4 h-4" />
                  <span>Take Site Survey Photo</span>
                  {surveyPhotos.length > 0 && (
                    <span className="bg-slate-950 text-amber-400 text-[10px] font-black px-2 py-0.5 rounded-full ml-1">
                      {surveyPhotos.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={handleResetInventory}
                  className="p-2.5 text-slate-400 hover:text-white bg-slate-950 border border-slate-800 hover:bg-slate-800 rounded-xl transition-colors"
                  title="Reset inventory"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Main Grid */}
            <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Inventory List, Survey Photo Gallery, and Add Item Form */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. Captured Bulky Site Survey Photos Gallery */}
            {surveyPhotos.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <h3 className="font-bold text-white text-sm">
                      Captured Site Survey Photos ({surveyPhotos.length})
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsCameraModalOpen(true)}
                    className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Another Photo</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {surveyPhotos.map((photo) => (
                    <div
                      key={photo.id}
                      className="group relative bg-slate-950 border border-slate-800 hover:border-amber-500/50 rounded-xl overflow-hidden transition-all shadow-md flex flex-col"
                    >
                      {/* Photo Thumbnail */}
                      <div className="relative aspect-[4/3] bg-black overflow-hidden cursor-pointer" onClick={() => setSelectedPhotoPreview(photo)}>
                        <img
                          src={photo.dataUrl}
                          alt={photo.label}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <span className="p-1.5 rounded-lg bg-slate-900/90 text-white hover:text-amber-400">
                            <Maximize2 className="w-3.5 h-3.5" />
                          </span>
                        </div>
                        <span className="absolute top-1.5 left-1.5 bg-slate-950/80 backdrop-blur-sm text-amber-400 text-[9px] font-black px-1.5 py-0.5 rounded border border-amber-500/20">
                          {photo.category}
                        </span>
                      </div>

                      {/* Photo Info */}
                      <div className="p-2.5 flex-1 flex flex-col justify-between text-xs space-y-1">
                        <div>
                          <h5 className="font-bold text-white text-xs truncate" title={photo.label}>
                            {photo.label}
                          </h5>
                          {photo.notes && (
                            <p className="text-[10px] text-slate-400 truncate" title={photo.notes}>
                              {photo.notes}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-900 text-[10px]">
                          <span className="text-amber-400 font-mono font-bold">
                            +{(photo.estimatedCbm || 1.0).toFixed(1)} CBM
                          </span>
                          <button
                            onClick={() => handleRemoveSurveyPhoto(photo.id)}
                            className="text-slate-500 hover:text-rose-400 p-1"
                            title="Delete survey photo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add Survey Photo Card Slot */}
                  <button
                    onClick={() => setIsCameraModalOpen(true)}
                    className="aspect-[4/3] sm:aspect-auto border-2 border-dashed border-slate-800 hover:border-amber-400/60 bg-slate-950/50 hover:bg-slate-950 rounded-xl flex flex-col items-center justify-center p-4 text-center transition-all group min-h-[140px]"
                  >
                    <div className="w-8 h-8 rounded-full bg-amber-500/10 group-hover:bg-amber-500/20 text-amber-400 flex items-center justify-center mb-1.5">
                      <Camera className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-300 group-hover:text-white">Snap Bulky Item</span>
                    <span className="text-[9px] text-slate-500">Camera / Upload</span>
                  </button>
                </div>
              </div>
            )}

            {/* 2. Standard Inventory List & Add Item Form */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              
              {/* Add New Item Form */}
              <form onSubmit={handleAddItem} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">Add Custom Item to Manifest:</p>
                <div className="grid sm:grid-cols-12 gap-2">
                  <input
                    type="text"
                    placeholder="Item Name (e.g., Filing Cabinet, TV 65-inch)"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className="sm:col-span-6 bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:ring-2 focus:ring-amber-400 focus:outline-none"
                  />
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value as any)}
                    className="sm:col-span-4 bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:ring-2 focus:ring-amber-400 focus:outline-none"
                  >
                    <option value="Furniture">Furniture</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Boxes & Crates">Boxes & Crates</option>
                    <option value="Special / Fragile">Special / Fragile</option>
                  </select>
                  <button
                    type="submit"
                    className="sm:col-span-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-2.5 rounded-lg flex items-center justify-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>
              </form>

              {/* Inventory Manifest List */}
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-800">
                  <span>Item Description</span>
                  <span>Qty & Vol</span>
                </div>

                {items.map((item) => (
                  <div key={item.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-white">{item.name}</p>
                        {appliedManifestSwaps.some((id) => {
                          const sw = MANIFEST_SWAP_OPTIONS.find((s) => s.id === id);
                          return sw && (item.name.toLowerCase().includes(sw.toName.toLowerCase()) || item.name.includes(sw.keywordMatch));
                        }) && (
                          <span className="text-[9px] font-black text-[#83b735] bg-[#83b735]/15 border border-[#83b735]/30 px-1.5 py-0.5 rounded-full inline-flex items-center gap-1 shrink-0">
                            <Zap className="w-2.5 h-2.5 fill-current" />
                            <span>Compacted</span>
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        {item.category} • {(item.volumeCbm * item.qty).toFixed(2)} CBM ({item.volumeCbm} CBM/unit)
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center bg-slate-900 rounded-lg border border-slate-700 p-1">
                        <button
                          onClick={() => updateQty(item.id, -1)}
                          className="p-1 text-slate-400 hover:text-white"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2 font-black text-amber-400">{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.id, 1)}
                          className="p-1 text-slate-400 hover:text-white"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                        title="Remove Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>

          </div>

          {/* Right Column: Volume & Recommended Truck Summary */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h3 className="font-black text-white text-lg flex items-center gap-2">
                <Calculator className="w-5 h-5 text-amber-400" />
                <span>Volume Analysis & Sizing</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">Calculated based on Nigerian freight & CBM standards</p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400 font-bold">Standard Manifest Items:</span>
                <span className="text-sm font-black text-white">{totalItemsCount} units ({itemsCbm.toFixed(1)} CBM)</span>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400 font-bold flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-amber-400" />
                  <span>Site Survey Bulky Items:</span>
                </span>
                <span className="text-sm font-black text-amber-400">
                  {surveyPhotos.length} photo(s) ({surveyCbm.toFixed(1)} CBM)
                </span>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
                <div>
                  <span className="text-slate-400 font-bold block">Total Cubic Meters (CBM):</span>
                  <span className="text-[10px] text-slate-500">Includes 2.0 CBM crating & spacing buffer</span>
                </div>
                <span className="text-2xl font-black text-amber-400">{totalCbm.toFixed(1)} CBM</span>
              </div>

              {/* Visual Packing Density Score Card */}
              <div className="bg-[#0a1f12] p-4 rounded-xl border border-emerald-800/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-bold flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5 text-[#83b735]" />
                    <span>Packing Density Score:</span>
                  </span>
                  <span className={`font-mono font-black text-sm px-2 py-0.5 rounded-full ${
                    manifestDensityScore >= 85 ? 'text-[#83b735] bg-[#83b735]/10' : 'text-amber-400 bg-amber-500/10'
                  }`}>
                    {manifestDensityScore}%
                  </span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      manifestDensityScore >= 85 ? 'bg-[#83b735]' : 'bg-amber-400'
                    }`}
                    style={{ width: `${manifestDensityScore}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                  <span>~{estimatedVoidSpaceCbm} CBM void pockets</span>
                  <button
                    onClick={() => setPlannerTab('smart_assistant')}
                    className="text-[#83b735] hover:underline font-bold flex items-center gap-1"
                  >
                    <span>Swap items for +18% boost</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="bg-slate-950 border-2 border-amber-500/50 p-5 rounded-xl space-y-2">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Truck className="w-4 h-4" />
                  <span>Recommended Dispatch Vehicle:</span>
                </p>
                <p className="text-lg font-black text-white">{getRecommendedVehicle(totalCbm)}</p>
                <p className="text-[11px] text-slate-400">Padded floor, tie-down straps, hydraulic tail-lift, and GPS track included.</p>
              </div>

              {surveyPhotos.length === 0 && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2 text-xs text-amber-300">
                  <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                  <p>
                    <strong>Have large or unusual items?</strong> Tap "Take Site Survey Photo" to photograph heavy safes, server racks, or 10-seater desks.
                  </p>
                </div>
              )}

              <button
                onClick={handleApplyToQuote}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-95"
              >
                <span>Attach Inventory & Photos to Formal Quote</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
          </div>
        )}

      </div>

      {/* Camera Modal */}
      <SiteSurveyCameraModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onSavePhoto={handleSaveSurveyPhoto}
      />

      {/* Enlarged Photo Inspection Modal */}
      {selectedPhotoPreview && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedPhotoPreview(null)}
        >
          <div 
            className="relative bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden max-w-xl w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[4/3] bg-black">
              <img
                src={selectedPhotoPreview.dataUrl}
                alt={selectedPhotoPreview.label}
                className="w-full h-full object-contain"
              />
              <button
                onClick={() => setSelectedPhotoPreview(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-slate-950/80 text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-2 bg-slate-950 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <span className="bg-amber-500/10 text-amber-400 text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-amber-500/20">
                  {selectedPhotoPreview.category}
                </span>
                <span className="text-xs font-mono text-amber-400 font-bold">
                  Est: +{(selectedPhotoPreview.estimatedCbm || 1.0).toFixed(1)} CBM
                </span>
              </div>
              <h4 className="text-white font-bold text-base">{selectedPhotoPreview.label}</h4>
              {selectedPhotoPreview.notes && (
                <p className="text-xs text-slate-300">
                  <strong>Notes:</strong> {selectedPhotoPreview.notes}
                </p>
              )}
              <div className="flex justify-between items-center pt-2 text-[10px] text-slate-500">
                <span>Captured: {new Date(selectedPhotoPreview.capturedAt).toLocaleString()}</span>
                <button
                  onClick={() => handleRemoveSurveyPhoto(selectedPhotoPreview.id)}
                  className="text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete Survey Photo</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0f2e1b] border-2 border-[#83b735] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in text-xs font-bold max-w-md">
          <CheckCircle2 className="w-4 h-4 text-[#83b735] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

    </section>
  );
};
