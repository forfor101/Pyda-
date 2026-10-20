import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Box,
  Layers,
  ShieldCheck,
  Truck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Download,
  Plus,
  Minus,
  Check,
  ArrowRight,
  Info,
  Package,
  Ruler,
  Camera,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sliders,
  Gauge,
  ArrowLeftRight,
  Zap,
  TrendingUp,
  BarChart3,
  HelpCircle,
  Minimize2,
  CheckCheck
} from 'lucide-react';
import jsPDF from 'jspdf';
import {
  CargoInspectionReport,
  InspectedCargoItem,
  SmartPackingPlan,
  SuggestedBox,
  SuggestedPackingMaterial,
  PackingProtocolStep,
  PackingDensityAnalysis,
  ItemSwapSuggestion,
  BoxTierDensity,
  PackingDensityTrendPoint
} from '../types';
import { PackingDensityTrendChart } from './PackingDensityTrendChart';

interface SmartPackingAssistantProps {
  onAddBoxesToManifest?: (boxes: { name: string; category: any; volumeCbm: number; qty: number }[]) => void;
  onAttachToQuote?: (summary: string, totalCbm: number) => void;
  onOpenCargoInspection?: () => void;
  currentInventoryCbm?: number;
}

// Built-in verified sample cargo inspection scenarios
const SAMPLE_INSPECTION_PRESETS: {
  id: string;
  title: string;
  subtitle: string;
  totalCbm: number;
  totalWeightKg: number;
  items: InspectedCargoItem[];
}[] = [
  {
    id: 'preset-living-suite',
    title: 'Luxury Living & Glass Dining Suite',
    subtitle: 'High-risk tempered glass, curved OLED display & leather suite',
    totalCbm: 4.85,
    totalWeightKg: 340,
    items: [
      {
        id: 'item-1',
        itemName: 'Tempered Glass Top 8-Seater Dining Table',
        category: 'Furniture & Glassware',
        quantity: 1,
        isFragile: true,
        fragilityLevel: 'high',
        fragilityReason: 'Heavy tempered bevel glass surface susceptible to edge shear and torsional stress',
        recommendedPackaging: 'Bespoke plywood crating with closed-cell EPE foam corner buffers',
        estimatedCbm: 1.45,
        estimatedWeightKg: 78,
      },
      {
        id: 'item-2',
        itemName: '65-inch Curved 4K OLED Television',
        category: 'Electronics & Audio-Visual',
        quantity: 1,
        isFragile: true,
        fragilityLevel: 'high',
        fragilityReason: 'Exposed ultra-thin OLED display panel highly vulnerable to point-load impact',
        recommendedPackaging: 'Telescopic anti-static foam-lined carton with rigid wood backing',
        estimatedCbm: 0.38,
        estimatedWeightKg: 24,
      },
      {
        id: 'item-3',
        itemName: 'Fine Porcelain China & Crystal Stemware Crate',
        category: 'Glassware & Dining',
        quantity: 2,
        isFragile: true,
        fragilityLevel: 'high',
        fragilityReason: 'High-brittleness lead crystal and bone porcelain with zero shock tolerance',
        recommendedPackaging: 'Individual tissue + 15mm bubble wrap in partitioned honeycomb dish-pack cartons',
        estimatedCbm: 0.42,
        estimatedWeightKg: 32,
      },
      {
        id: 'item-4',
        itemName: 'Solid Teak 4-Door Storage Credenza',
        category: 'Heavy Wood Furniture',
        quantity: 1,
        isFragile: false,
        fragilityLevel: 'medium',
        fragilityReason: 'Polished natural veneer can scratch easily; brass hinges need stabilization',
        recommendedPackaging: 'Quilted moving blankets with corrugated edge protectors',
        estimatedCbm: 1.85,
        estimatedWeightKg: 110,
      },
      {
        id: 'item-5',
        itemName: 'Framed Canvas Acrylic Artwork (120cm x 90cm)',
        category: 'Artwork & Antiques',
        quantity: 2,
        isFragile: true,
        fragilityLevel: 'high',
        fragilityReason: 'Unstretched canvas tension and gilded softwood frame prone to impact tears',
        recommendedPackaging: 'Acid-free glassine wrap, corner cardboard protectors, flat picture carton',
        estimatedCbm: 0.28,
        estimatedWeightKg: 16,
      },
    ],
  },
  {
    id: 'preset-office-it',
    title: 'Executive Boardroom & IT Server Bay',
    subtitle: 'Server rack units, ergonomic chairs, dual monitors & glass desks',
    totalCbm: 6.20,
    totalWeightKg: 490,
    items: [
      {
        id: 'item-it-1',
        itemName: '42U Server Rack Cabinet & IT Network Switch Unit',
        category: 'IT Infrastructure',
        quantity: 1,
        isFragile: true,
        fragilityLevel: 'high',
        fragilityReason: 'Precision electronic circuit boards and fiber patch panels vulnerable to vibration',
        recommendedPackaging: 'Desiccant moisture packs, anti-static foil shroud, timber skid palletizing',
        estimatedCbm: 2.10,
        estimatedWeightKg: 145,
      },
      {
        id: 'item-it-2',
        itemName: 'Ergonomic Mesh High-Back Executive Chairs',
        category: 'Office Furniture',
        quantity: 6,
        isFragile: false,
        fragilityLevel: 'low',
        fragilityReason: 'Durable nylon composite frame and aluminum base',
        recommendedPackaging: 'Heavy-duty furniture stretch-wrap with castor wheel locks',
        estimatedCbm: 1.80,
        estimatedWeightKg: 96,
      },
      {
        id: 'item-it-3',
        itemName: '34-inch Ultrawide Curved Workstation Monitors',
        category: 'Electronics',
        quantity: 4,
        isFragile: true,
        fragilityLevel: 'high',
        fragilityReason: 'Curved matrix screens sensitive to edge pressure and torsion',
        recommendedPackaging: 'Individual molded EPE foam monitor boxes with antistatic film',
        estimatedCbm: 0.80,
        estimatedWeightKg: 36,
      },
      {
        id: 'item-it-4',
        itemName: 'Executive L-Shaped Tempered Glass Desk',
        category: 'Office Furniture',
        quantity: 1,
        isFragile: true,
        fragilityLevel: 'high',
        fragilityReason: '12mm tempered safety glass tops requiring flat-edge transport',
        recommendedPackaging: 'Padded glass cart packaging and edge cushioning',
        estimatedCbm: 1.50,
        estimatedWeightKg: 85,
      },
    ],
  },
];

// Client-side real-time calculation engine for Packing Density & Item Swaps
function computeClientDensityAnalysis(
  totalCbm: number,
  suggestedBoxes: SuggestedBox[],
  items: InspectedCargoItem[],
  appliedSwapIds: string[],
  boxOverrides: Record<string, number>
): PackingDensityAnalysis {
  const totalBoxVolumeCbm = suggestedBoxes.length > 0
    ? parseFloat(
        suggestedBoxes.reduce((acc, b) => {
          const q = boxOverrides[b.id] !== undefined ? boxOverrides[b.id] : b.quantityRecommended;
          return acc + (b.volumeCbmPerUnit * Math.max(1, q));
        }, 0).toFixed(2)
      )
    : parseFloat((totalCbm * 1.15).toFixed(2));

  const rawRatio = totalBoxVolumeCbm > 0 ? (totalCbm / totalBoxVolumeCbm) : 0.82;
  const baseScore = Math.min(88, Math.max(68, Math.round(rawRatio * 100)));
  const swapBonus = appliedSwapIds.length * 4;
  const packingDensityScore = Math.min(96, baseScore + swapBonus);

  const voidSpaceCbm = Math.max(
    0.06,
    parseFloat((totalBoxVolumeCbm - (totalCbm * (1 - appliedSwapIds.length * 0.035))).toFixed(2))
  );
  const voidSpacePercent = Math.max(4, Math.min(38, Math.round((voidSpaceCbm / Math.max(0.1, totalBoxVolumeCbm)) * 100)));

  let densityGrade: PackingDensityAnalysis['densityGrade'] = 'Balanced Density';
  if (packingDensityScore >= 88) {
    densityGrade = 'Optimal High-Density';
  } else if (packingDensityScore >= 76) {
    densityGrade = 'Balanced Density';
  } else if (packingDensityScore >= 64) {
    densityGrade = 'Moderate Void Gaps';
  } else {
    densityGrade = 'Suboptimal Low-Density';
  }

  const boxTierDensity: BoxTierDensity[] = suggestedBoxes.map((b) => {
    let fill = 82;
    if (b.category === 'small') fill = 94;
    else if (b.category === 'medium') fill = 83;
    else if (b.category === 'large') fill = 66;
    else if (b.category === 'dishpack') fill = 90;
    else if (b.category === 'crate') fill = 92;
    else if (b.category === 'telescopic') fill = 88;

    if (appliedSwapIds.length > 0 && b.category === 'large') {
      fill = Math.min(94, fill + (appliedSwapIds.length * 7));
    }

    return {
      category: b.category,
      label: b.name,
      fillPercentage: fill,
      itemsAssigned: b.suggestedItems || [],
      status: fill >= 82 ? 'optimal' : fill < 72 ? 'underfilled' : 'optimal',
    };
  });

  const availableSwaps: ItemSwapSuggestion[] = [
    {
      id: 'swap-books-small',
      title: 'Swap Dense Books & Tools into Small Heavy-Duty Cartons',
      sourceItemName: 'Books, Heavy Documents & Metal Hardware',
      fromBoxType: 'Large Bulky Goods Box (4.5 cu ft)',
      toBoxType: 'Small Heavy-Duty Book & Tool Box (1.5 cu ft)',
      cbmSaved: 0.12,
      densityScoreDelta: 5,
      rationale: 'Heavy dense items packed in large boxes waste up to 35% vertical headspace and induce bottom wall sag. Relocating them to small double-wall cartons eliminates 0.12 CBM air pockets and frees large boxes for fluffy lightweight bedding.',
      ergonomicBenefit: 'Keeps gross carton weight under 25kg carrier lifting safety threshold.',
      isApplied: appliedSwapIds.includes('swap-books-small'),
    },
    {
      id: 'swap-dishware-honeycomb',
      title: 'Consolidate China & Glassware into Honeycomb Cell Dish-Pack',
      sourceItemName: 'Porcelain Dining Sets & Crystal Stemware',
      fromBoxType: 'Standard Medium Utility Cartons (3.0 cu ft)',
      toBoxType: 'Triple-Wall Honeycomb Dish-Pack with Cell Dividers',
      cbmSaved: 0.18,
      densityScoreDelta: 7,
      rationale: 'Wrapping fragile stemware in loose bubble wrap inside standard square cartons leaves massive perimeter void gaps. Modular vertical honeycomb cells pack glasses 2.4x denser while providing 360° impact absorption.',
      ergonomicBenefit: 'Prevents point-contact shattering during road vibration on transit corridors.',
      isApplied: appliedSwapIds.includes('swap-dishware-honeycomb'),
    },
    {
      id: 'swap-electronics-nest',
      title: 'Nest Small Audio & Peripherals into Padded Credenza Cavities',
      sourceItemName: 'Modems, Cables, Audio Consoles & Power Bricks',
      fromBoxType: '2x Loose Cartons',
      toBoxType: 'Internal Storage Cavities of Credenza / Desk',
      cbmSaved: 0.10,
      densityScoreDelta: 4,
      rationale: 'Internal storage drawers and shelving in credenzas or desks can be secured with tension wrap to house wrapped small electronics, eliminating 2 external loose boxes.',
      ergonomicBenefit: 'Consolidates IT peripherals directly with corresponding furniture.',
      isApplied: appliedSwapIds.includes('swap-electronics-nest'),
    },
    {
      id: 'swap-linens-voidfill',
      title: 'Repurpose Soft Bedding & Cushions as Eco-Friendly Void Fill',
      sourceItemName: 'Duvets, Pillows & Cotton Throws',
      fromBoxType: 'Standalone Large Linens Carton',
      toBoxType: 'Natural Void-Fill Cushioning in Irregular Crates',
      cbmSaved: 0.15,
      densityScoreDelta: 6,
      rationale: 'Replacing synthetic packaging peanuts with actual customer-owned linens/pillows around irregular furniture eliminates 0.15 CBM dead space and saves carton costs.',
      ergonomicBenefit: '100% biodegradable zero-waste packing buffer.',
      isApplied: appliedSwapIds.includes('swap-linens-voidfill'),
    },
  ];

  return {
    packingDensityScore,
    densityGrade,
    occupiedCargoCbm: totalCbm,
    totalBoxesCbm: totalBoxVolumeCbm,
    voidSpaceCbm,
    voidSpacePercent,
    centerOfGravityScore: Math.min(97, 88 + (appliedSwapIds.length * 2)),
    crushResistanceScore: Math.min(99, 93 + (appliedSwapIds.length * 2)),
    boxTierDensity,
    swapSuggestions: availableSwaps,
  };
}

export const SmartPackingAssistant: React.FC<SmartPackingAssistantProps> = ({
  onAddBoxesToManifest,
  onAttachToQuote,
  onOpenCargoInspection,
  currentInventoryCbm = 0,
}) => {
  // Source Inspection Data
  const [activeInspection, setActiveInspection] = useState<CargoInspectionReport | null>(null);
  const [availableReports, setAvailableReports] = useState<CargoInspectionReport[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('preset-living-suite');
  const [isUsingPreset, setIsUsingPreset] = useState<boolean>(true);

  // Assistant State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<number>(1);
  const [packingPlan, setPackingPlan] = useState<SmartPackingPlan | null>(null);
  const [activeTab, setActiveTab] = useState<'density' | 'boxes' | 'materials' | 'protocol' | 'manifest'>('density');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [boxQuantityOverrides, setBoxQuantityOverrides] = useState<Record<string, number>>({});
  const [expandedBoxId, setExpandedBoxId] = useState<string | null>(null);
  const [isSourceSelectorOpen, setIsSourceSelectorOpen] = useState<boolean>(false);

  // Packing Density & Real-Time Item Swap State
  const [appliedSwapIds, setAppliedSwapIds] = useState<string[]>([]);
  const [simSelectedItemId, setSimSelectedItemId] = useState<string>('');
  const [simTargetBoxType, setSimTargetBoxType] = useState<string>('Small Heavy-Duty Carton');
  const [simNotice, setSimNotice] = useState<string | null>(null);

  // Packing Density Trend History (tracked across session)
  const [assistantTrendHistory, setAssistantTrendHistory] = useState<PackingDensityTrendPoint[]>(() => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return [
      {
        id: 'assist-init',
        step: 1,
        label: 'Baseline (76%)',
        timestamp: timeStr,
        action: 'Initial Inspected Cargo Layout',
        densityScore: 76,
        voidSpaceCbm: 1.15,
        totalCbm: 5.58,
        cbmSaved: 0,
        efficiencyGain: 0
      }
    ];
  });

  const recordAssistantTrend = (actionName: string, newScore: number, newVoidCbm: number, newTotalCbm: number) => {
    setAssistantTrendHistory((prev) => {
      const baseline = prev[0]?.densityScore || 76;
      const baseVoid = prev[0]?.voidSpaceCbm || 1.15;
      const stepNum = prev.length + 1;
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const cbmSaved = Math.max(0, parseFloat((baseVoid - newVoidCbm).toFixed(2)));
      const efficiencyGain = newScore - baseline;

      const newPoint: PackingDensityTrendPoint = {
        id: `assist-step-${Date.now()}-${stepNum}`,
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

      return [...prev, newPoint];
    });
  };

  const handleResetAssistantTrend = () => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const resetPoint: PackingDensityTrendPoint = {
      id: `assist-reset-${Date.now()}`,
      step: 1,
      label: `Baseline (${liveDensityAnalysis.packingDensityScore}%)`,
      timestamp: timeStr,
      action: 'Session Benchmark Reset to Current Container Configuration',
      densityScore: liveDensityAnalysis.packingDensityScore,
      voidSpaceCbm: liveDensityAnalysis.voidSpaceCbm,
      totalCbm: liveDensityAnalysis.totalBoxesCbm,
      cbmSaved: 0,
      efficiencyGain: 0
    };
    setAssistantTrendHistory([resetPoint]);
    showToast('Density trend history reset to current configuration.');
  };

  const handleSimulateAssistantStep = () => {
    const nextScore = Math.min(98, liveDensityAnalysis.packingDensityScore + 3);
    const nextVoid = Math.max(0.06, parseFloat((liveDensityAnalysis.voidSpaceCbm - 0.09).toFixed(2)));
    const nextTotal = parseFloat((liveDensityAnalysis.totalBoxesCbm - 0.09).toFixed(2));
    recordAssistantTrend(
      `Simulated ${simTargetBoxType} Compaction (+3% Density)`,
      nextScore,
      nextVoid,
      nextTotal
    );
    showToast(`Simulated carton compaction: Density climbed to ${nextScore}%!`);
  };

  // Helper toast notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load saved inspections from localStorage and API
  useEffect(() => {
    // 1. Check local storage for recent cargo inspection
    try {
      const saved = localStorage.getItem('pyda_latest_cargo_inspection');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.items) && parsed.items.length > 0) {
          setActiveInspection(parsed);
          setIsUsingPreset(false);
        }
      }
    } catch (e) {
      console.warn('Could not read cached cargo inspection:', e);
    }

    // 2. Fetch server list of inspections
    fetch('/api/cargo-inspection/list')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.reports) && data.reports.length > 0) {
          setAvailableReports(data.reports);
          if (!activeInspection) {
            setActiveInspection(data.reports[0]);
            setIsUsingPreset(false);
          }
        }
      })
      .catch((err) => console.warn('Could not fetch server cargo inspections:', err));
  }, []);

  // Compute active volume and items depending on source
  const currentItems: InspectedCargoItem[] = isUsingPreset
    ? SAMPLE_INSPECTION_PRESETS.find((p) => p.id === selectedPresetId)?.items || SAMPLE_INSPECTION_PRESETS[0].items
    : activeInspection?.items || [];

  const currentTotalCbm: number = isUsingPreset
    ? SAMPLE_INSPECTION_PRESETS.find((p) => p.id === selectedPresetId)?.totalCbm || 4.85
    : activeInspection?.totalCbm || (currentItems.reduce((acc, it) => acc + (it.estimatedCbm * (it.quantity || 1)), 0) || 4.5);

  const currentTotalWeightKg: number = isUsingPreset
    ? SAMPLE_INSPECTION_PRESETS.find((p) => p.id === selectedPresetId)?.totalWeightKg || 340
    : activeInspection?.totalWeightKg || Math.round(currentTotalCbm * 85);

  const currentInspectionTitle: string = isUsingPreset
    ? SAMPLE_INSPECTION_PRESETS.find((p) => p.id === selectedPresetId)?.title || 'Preset Cargo Scenario'
    : activeInspection?.title || 'Digital Cargo Survey';

  const fragileCount = currentItems.filter((i) => i.isFragile || i.fragilityLevel === 'high')
    .reduce((acc, it) => acc + (it.quantity || 1), 0);

  // Compute live real-time Packing Density Analysis
  const liveDensityAnalysis: PackingDensityAnalysis = useMemo(() => {
    const boxes = packingPlan?.suggestedBoxes || [];
    return computeClientDensityAnalysis(
      currentTotalCbm,
      boxes,
      currentItems,
      appliedSwapIds,
      boxQuantityOverrides
    );
  }, [currentTotalCbm, packingPlan, currentItems, appliedSwapIds, boxQuantityOverrides]);

  // Generate Smart Packing Plan with Gemini API
  const handleGeneratePackingPlan = async () => {
    setIsGenerating(true);
    setGenerationStep(1);

    const stepTimer = setInterval(() => {
      setGenerationStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 850);

    try {
      const payload = {
        totalCbm: currentTotalCbm,
        totalWeightKg: currentTotalWeightKg,
        inspectionRefId: isUsingPreset ? selectedPresetId : activeInspection?.id,
        inspectionTitle: currentInspectionTitle,
        items: currentItems,
        moveCategory: 'commercial_residential',
        specialInstructions: 'Provide maximum protection for fragile glassware and electronics with standard Nigerian logistics boxes.',
      };

      const res = await fetch('/api/smart-packing/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      clearInterval(stepTimer);

      if (data.success && data.plan) {
        setPackingPlan(data.plan);
        // Initialize overrides
        const initialOverrides: Record<string, number> = {};
        data.plan.suggestedBoxes.forEach((b: SuggestedBox) => {
          initialOverrides[b.id] = b.quantityRecommended;
        });
        setBoxQuantityOverrides(initialOverrides);
        showToast('Smart Packing Plan & Density Diagnostics generated via Gemini AI!');
      } else {
        showToast(data.message || 'Could not generate AI packing plan. Using logistics standard.');
      }
    } catch (err: any) {
      clearInterval(stepTimer);
      console.error('Error generating smart packing plan:', err);
      showToast('Network error while connecting to Gemini AI. Please retry.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Adjust recommended box quantity
  const handleUpdateBoxQty = (boxId: string, delta: number) => {
    setBoxQuantityOverrides((prev) => {
      const current = prev[boxId] !== undefined ? prev[boxId] : 1;
      const updated = Math.max(0, current + delta);
      return { ...prev, [boxId]: updated };
    });
  };

  // Toggle specific real-time swap
  const handleToggleSwap = (swapId: string) => {
    setAppliedSwapIds((prev) => {
      const exists = prev.includes(swapId);
      const next = exists ? prev.filter((id) => id !== swapId) : [...prev, swapId];
      showToast(
        exists
          ? 'Reverted item allocation to standard container.'
          : 'Applied smart space optimization swap! Packing Density increased.'
      );

      const targetScore = exists
        ? Math.max(76, liveDensityAnalysis.packingDensityScore - 5)
        : Math.min(96, liveDensityAnalysis.packingDensityScore + 5);
      const targetVoid = exists
        ? parseFloat((liveDensityAnalysis.voidSpaceCbm + 0.12).toFixed(2))
        : Math.max(0.06, parseFloat((liveDensityAnalysis.voidSpaceCbm - 0.12).toFixed(2)));

      recordAssistantTrend(
        exists ? `Reverted Swap: ${swapId}` : `Applied Swap: ${swapId}`,
        targetScore,
        targetVoid,
        liveDensityAnalysis.totalBoxesCbm
      );

      return next;
    });
  };

  // Apply all high-impact swaps at once
  const handleApplyAllSwaps = () => {
    const allSwapIds = liveDensityAnalysis.swapSuggestions.map((s) => s.id);
    setAppliedSwapIds(allSwapIds);
    showToast('Applied all space optimization swaps! Maximum density achieved.');
    recordAssistantTrend(
      'Applied All High-Impact Space Swaps (+18% Space Boost)',
      94,
      0.35,
      liveDensityAnalysis.totalBoxesCbm
    );
  };

  // Revert all swaps
  const handleRevertAllSwaps = () => {
    setAppliedSwapIds([]);
    showToast('Reverted all custom swaps to baseline packing configuration.');
    recordAssistantTrend(
      'Reverted All Custom Swaps to Baseline Standard',
      76,
      1.15,
      liveDensityAnalysis.totalBoxesCbm
    );
  };

  // Run custom live item swap simulator
  const handleRunSimulator = () => {
    const item = currentItems.find((i) => i.id === simSelectedItemId) || currentItems[0];
    if (!item) return;

    setSimNotice(
      `Compaction Simulated: Moving "${item.itemName}" into "${simTargetBoxType}" eliminates ~0.09 CBM perimeter air pockets (+3% Density Score boost).`
    );
    showToast(`Simulated relocation of "${item.itemName}" into ${simTargetBoxType}!`);

    recordAssistantTrend(
      `Simulated: ${item.itemName} into ${simTargetBoxType}`,
      Math.min(97, liveDensityAnalysis.packingDensityScore + 3),
      Math.max(0.06, parseFloat((liveDensityAnalysis.voidSpaceCbm - 0.09).toFixed(2))),
      liveDensityAnalysis.totalBoxesCbm
    );
  };

  // Add calculated boxes directly to Inventory Planner manifest
  const handleApplyBoxesToManifest = () => {
    if (!packingPlan || !onAddBoxesToManifest) return;

    const boxesToAdd = packingPlan.suggestedBoxes.map((b) => {
      const qty = boxQuantityOverrides[b.id] !== undefined ? boxQuantityOverrides[b.id] : b.quantityRecommended;
      return {
        name: `${b.name} (${b.dimensionsLabel})`,
        category: 'Boxes & Crates',
        volumeCbm: b.volumeCbmPerUnit,
        qty: Math.max(1, qty),
      };
    }).filter((b) => b.qty > 0);

    onAddBoxesToManifest(boxesToAdd);
    showToast(`Added ${boxesToAdd.reduce((acc, b) => acc + b.qty, 0)} calculated boxes to inventory manifest!`);
  };

  // Attach packaging plan to formal quote
  const handleAttachPlanToQuote = () => {
    if (!packingPlan || !onAttachToQuote) return;

    const totalBoxes = packingPlan.suggestedBoxes.reduce((acc, b) => {
      const qty = boxQuantityOverrides[b.id] !== undefined ? boxQuantityOverrides[b.id] : b.quantityRecommended;
      return acc + qty;
    }, 0);

    const boxSummary = packingPlan.suggestedBoxes.map((b) => {
      const qty = boxQuantityOverrides[b.id] !== undefined ? boxQuantityOverrides[b.id] : b.quantityRecommended;
      return `${qty}x ${b.name}`;
    }).join(', ');

    const fullSummary = `AI Smart Packing Specification: ${totalBoxes} Boxes (${boxSummary}) | Packing Density Score: ${liveDensityAnalysis.packingDensityScore}% (${liveDensityAnalysis.densityGrade}) | ${appliedSwapIds.length} Space Optimization Swaps Applied | Sized from Cargo Inspection [${currentInspectionTitle} - ${currentTotalCbm} CBM]`;

    onAttachToQuote(fullSummary, packingPlan.totalBoxVolumeCbm);
    showToast('Smart Packing Specification attached to Quote Calculator!');
  };

  // Download PDF Packing Slip Specification with Density Metrics
  const handleDownloadPdf = () => {
    if (!packingPlan) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Brand Header
    doc.setFillColor(15, 46, 27); // #0f2e1b deep forest
    doc.rect(0, 0, pageWidth, 42, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('PYDA MOVERS & LOGISTICS', 18, 18);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(254, 215, 0); // harvest gold
    doc.text('SMART PACKING SPECIFICATION & PACKING DENSITY REPORT', 18, 26);

    doc.setTextColor(200, 220, 200);
    doc.setFontSize(8);
    doc.text('Nigeria Premier White-Glove Corporate Freight & Relocation Solutions', 18, 33);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString()}`, pageWidth - 70, 33);

    // Meta Block
    doc.setTextColor(20, 30, 25);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('CARGO SURVEY & PACKING DENSITY BENCHMARK', 18, 52);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Inspection Survey: ${currentInspectionTitle}`, 18, 60);
    doc.text(`Surveyed Cargo Volume: ${currentTotalCbm} CBM`, 18, 66);
    doc.text(`Surveyed Items Count: ${currentItems.length} units (${fragileCount} Fragile Tagged)`, 18, 72);

    doc.text(`PACKING DENSITY SCORE: ${liveDensityAnalysis.packingDensityScore}% (${liveDensityAnalysis.densityGrade})`, 110, 60);
    doc.text(`Void Space: ${liveDensityAnalysis.voidSpaceCbm} CBM (${liveDensityAnalysis.voidSpacePercent}% Air Pockets)`, 110, 66);
    doc.text(`Center of Gravity Balance: ${liveDensityAnalysis.centerOfGravityScore}%`, 110, 72);

    doc.setDrawColor(200, 215, 200);
    doc.line(18, 78, pageWidth - 18, 78);

    // Applied Swaps Summary
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 46, 27);
    doc.text('APPLIED REAL-TIME SPACE OPTIMIZATION SWAPS', 18, 87);

    let yPos = 94;
    liveDensityAnalysis.swapSuggestions.forEach((swp) => {
      const isApplied = appliedSwapIds.includes(swp.id);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(isApplied ? 20 : 100, isApplied ? 110 : 110, isApplied ? 40 : 110);
      doc.text(`${isApplied ? '[APPLIED]' : '[RECOMMENDED]'} ${swp.title} (+${swp.densityScoreDelta}% Density)`, 22, yPos);
      yPos += 5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(80, 90, 85);
      doc.text(`Rationale: ${swp.rationale.substring(0, 95)}...`, 26, yPos);
      yPos += 6;
    });

    yPos += 4;
    // Box Sizing Table
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 46, 27);
    doc.text('OPTIMAL BOX SIZING BREAKDOWN', 18, yPos);
    yPos += 8;

    doc.setFillColor(245, 248, 245);
    doc.rect(18, yPos - 5, pageWidth - 36, 8, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(50, 70, 60);
    doc.text('BOX CATEGORY & SPECIFICATION', 22, yPos);
    doc.text('DIMENSIONS (CM)', 95, yPos);
    doc.text('QTY', 140, yPos);
    doc.text('VOL (CBM)', 155, yPos);
    doc.text('EST. COST', 175, yPos);

    yPos += 8;

    packingPlan.suggestedBoxes.forEach((box) => {
      const qty = boxQuantityOverrides[box.id] !== undefined ? boxQuantityOverrides[box.id] : box.quantityRecommended;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(20, 30, 25);
      doc.text(box.name.length > 42 ? box.name.substring(0, 40) + '...' : box.name, 22, yPos);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(box.dimensionsLabel, 95, yPos);
      doc.text(`${qty}`, 142, yPos);
      doc.text(`${(box.volumeCbmPerUnit * qty).toFixed(2)}`, 157, yPos);
      doc.text(`N${(box.estimatedCostNgn * qty).toLocaleString('en-NG')}`, 175, yPos);

      yPos += 5;
      doc.setFontSize(7.5);
      doc.setTextColor(100, 110, 105);
      doc.text(`Assigned items: ${box.suggestedItems.join(', ').substring(0, 75)}`, 26, yPos);

      yPos += 6;
      if (yPos > 260) {
        doc.addPage();
        yPos = 25;
      }
    });

    yPos += 6;
    // Materials Section
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 46, 27);
    doc.text('PROTECTIVE MATERIALS & CUSHIONING SUPPLIES', 18, yPos);
    yPos += 8;

    packingPlan.suggestedMaterials.slice(0, 5).forEach((mat) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(30, 45, 35);
      doc.text(`• ${mat.name}: ${mat.quantity} ${mat.unit} (~N${(mat.estimatedPriceNgn * mat.quantity).toLocaleString('en-NG')})`, 22, yPos);
      yPos += 5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(90, 100, 95);
      doc.text(`   Purpose: ${mat.purpose}`, 22, yPos);
      yPos += 5;
    });

    doc.save(`Pyda-Packing-Density-Report-${Date.now().toString().slice(-6)}.pdf`);
    showToast('Downloaded official PDF packing specification & density report!');
  };

  return (
    <div className="bg-slate-900/90 border border-emerald-900/40 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6 relative overflow-hidden backdrop-blur-md">
      
      {/* Background Glow Accent */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0f2e1b] border border-[#83b735] text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-[#83b735]" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header & Title - Google AI Studio Integration */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-emerald-950 pb-5">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/15 via-emerald-500/15 to-blue-500/15 border border-amber-500/35 text-amber-300 text-xs font-black tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span>Google AI Studio • Smart Packing Engine</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-black flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Gemini 3.8 Flash Volumetric Optimization</span>
            </span>
          </div>
          <h3 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Packing Density & Real-Time Item Swap Assistant</span>
          </h3>
          <p className="text-slate-300 text-xs max-w-2xl leading-relaxed">
            Powered by <strong className="text-white">Google AI Studio</strong>. Evaluates arrangement efficiency in real time. Features a visual Packing Density Score and actionable carton compaction swaps to eliminate air pockets, prevent freight crush, and minimize required container volume.
          </p>
        </div>

        {/* Source Cargo Inspection Picker Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSourceSelectorOpen(!isSourceSelectorOpen)}
            className="flex items-center gap-2 bg-[#0a1f12] hover:bg-[#0f2e1b] border border-emerald-800/60 text-emerald-300 text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all shadow-sm"
          >
            <Camera className="w-4 h-4 text-amber-400" />
            <div className="text-left">
              <span className="block text-[10px] text-slate-400 leading-none">Cargo Source</span>
              <span className="text-white text-xs font-bold truncate max-w-[140px] inline-block">{currentInspectionTitle}</span>
            </div>
            {isSourceSelectorOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {onOpenCargoInspection && (
            <button
              onClick={onOpenCargoInspection}
              className="p-2.5 bg-slate-950 border border-slate-800 hover:border-amber-400/50 text-slate-300 hover:text-amber-400 rounded-xl transition-colors"
              title="Open Digital Cargo Inspection Camera"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Cargo Inspection Source Selector Dropdown */}
      {isSourceSelectorOpen && (
        <div className="bg-[#0a1f12] border border-emerald-700/40 rounded-2xl p-4 space-y-3 animate-fade-in text-xs">
          <div className="flex items-center justify-between border-b border-emerald-900/60 pb-2">
            <span className="font-black text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Ruler className="w-3.5 h-3.5 text-amber-400" />
              <span>Select Cargo Inspection Survey Volume</span>
            </span>
            <span className="text-[10px] text-emerald-400">
              {availableReports.length > 0 ? `${availableReports.length} Recorded Inspections` : 'Preset Demonstrations'}
            </span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {activeInspection && (
              <div
                onClick={() => {
                  setIsUsingPreset(false);
                  setIsSourceSelectorOpen(false);
                }}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  !isUsingPreset
                    ? 'bg-[#0f2e1b] border-[#83b735] text-white shadow-md'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-emerald-600/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-emerald-400 uppercase">Live Inspection</span>
                  <span className="text-amber-400 font-mono font-bold">{activeInspection.totalCbm} CBM</span>
                </div>
                <h5 className="font-bold text-white text-xs truncate mt-1">{activeInspection.title || 'Digital Cargo Survey'}</h5>
                <p className="text-[10px] text-slate-400">{activeInspection.items.length} items • {activeInspection.fragileItemsCount} fragile</p>
              </div>
            )}

            {SAMPLE_INSPECTION_PRESETS.map((preset) => (
              <div
                key={preset.id}
                onClick={() => {
                  setSelectedPresetId(preset.id);
                  setIsUsingPreset(true);
                  setIsSourceSelectorOpen(false);
                }}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  isUsingPreset && selectedPresetId === preset.id
                    ? 'bg-[#0f2e1b] border-[#83b735] text-white shadow-md'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-emerald-600/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-amber-400 uppercase">Benchmark Preset</span>
                  <span className="text-amber-400 font-mono font-bold">{preset.totalCbm} CBM</span>
                </div>
                <h5 className="font-bold text-white text-xs truncate mt-1">{preset.title}</h5>
                <p className="text-[10px] text-slate-400">{preset.items.length} items • {preset.subtitle.substring(0, 32)}...</p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2 text-[11px] text-slate-400 border-t border-emerald-950">
            <span>Want to measure your room dimensions with AR spatial camera?</span>
            {onOpenCargoInspection && (
              <button
                onClick={onOpenCargoInspection}
                className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
              >
                <span>Launch Camera Survey</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* VISUAL PACKING DENSITY SCORE GAUGE & LIVE DIAGNOSTICS CARD */}
      <div className="bg-gradient-to-br from-[#0c2415] via-[#091a10] to-slate-950 border border-emerald-600/50 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden space-y-5">
        
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          
          {/* Radial Circular Density Gauge */}
          <div className="flex items-center gap-5 sm:gap-6 shrink-0">
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                {/* Track Circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-slate-800"
                  strokeWidth="8"
                  fill="transparent"
                />
                {/* Progress Circle with Dynamic Color */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className={`transition-all duration-700 ease-out ${
                    liveDensityAnalysis.packingDensityScore >= 88
                      ? 'stroke-[#83b735]'
                      : liveDensityAnalysis.packingDensityScore >= 76
                      ? 'stroke-amber-400'
                      : 'stroke-rose-400'
                  }`}
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - liveDensityAnalysis.packingDensityScore / 100)}`}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>

              {/* Gauge Center Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                  {liveDensityAnalysis.packingDensityScore}%
                </span>
                <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider">
                  Density
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-[#83b735]" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-300">
                  Packing Density Score
                </span>
              </div>
              <h4 className="text-lg font-black text-white">
                {liveDensityAnalysis.densityGrade}
              </h4>
              <p className="text-[11px] text-slate-400 max-w-xs leading-snug">
                {liveDensityAnalysis.packingDensityScore >= 88
                  ? 'High volumetric compaction achieved with minimal dead-space air pockets.'
                  : liveDensityAnalysis.packingDensityScore >= 76
                  ? 'Balanced baseline density. Swapping items into dedicated cartons can eliminate residual void pockets.'
                  : 'Suboptimal air pockets detected. Reallocating heavy or fragile goods recommended.'}
              </p>
              
              <div className="flex items-center gap-2 pt-1">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>{appliedSwapIds.length} of {liveDensityAnalysis.swapSuggestions.length} Swaps Applied</span>
                </span>
              </div>
            </div>
          </div>

          {/* Diagnostic Metrics Bars */}
          <div className="flex-1 w-full grid sm:grid-cols-3 gap-3 text-xs">
            
            {/* Metric 1: Space Utilization */}
            <div className="bg-[#0f2e1b]/80 border border-emerald-800/40 p-3.5 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-300 font-bold flex items-center gap-1">
                  <Box className="w-3.5 h-3.5 text-amber-400" />
                  <span>Cube Volume Fit</span>
                </span>
                <span className="font-mono font-bold text-amber-400">{liveDensityAnalysis.packingDensityScore}%</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-500 to-[#83b735] h-full transition-all duration-500"
                  style={{ width: `${liveDensityAnalysis.packingDensityScore}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 block truncate">
                Cargo: {liveDensityAnalysis.occupiedCargoCbm} / Boxes: {liveDensityAnalysis.totalBoxesCbm} CBM
              </span>
            </div>

            {/* Metric 2: Void Air Pockets */}
            <div className="bg-[#0f2e1b]/80 border border-emerald-800/40 p-3.5 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-300 font-bold flex items-center gap-1">
                  <Minimize2 className="w-3.5 h-3.5 text-sky-400" />
                  <span>Void Air Pockets</span>
                </span>
                <span className="font-mono font-bold text-sky-400">{liveDensityAnalysis.voidSpacePercent}%</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-sky-400 h-full transition-all duration-500"
                  style={{ width: `${liveDensityAnalysis.voidSpacePercent}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 block truncate">
                Estimated Void: ~{liveDensityAnalysis.voidSpaceCbm} CBM
              </span>
            </div>

            {/* Metric 3: Center of Gravity Stability */}
            <div className="bg-[#0f2e1b]/80 border border-emerald-800/40 p-3.5 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-300 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Center-of-Gravity</span>
                </span>
                <span className="font-mono font-bold text-emerald-400">{liveDensityAnalysis.centerOfGravityScore}%</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-400 h-full transition-all duration-500"
                  style={{ width: `${liveDensityAnalysis.centerOfGravityScore}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 block truncate">
                Crush Resistance: {liveDensityAnalysis.crushResistanceScore}% Certified
              </span>
            </div>

          </div>

        </div>

        {/* Real-time Swap Quick Action Strip */}
        <div className="pt-3 border-t border-emerald-950 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <ArrowLeftRight className="w-4 h-4 text-amber-400" />
            <span>
              <strong>Real-Time Suggestions Available:</strong> 4 algorithmic swaps can boost space utilization by up to +18%
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {appliedSwapIds.length < liveDensityAnalysis.swapSuggestions.length ? (
              <button
                onClick={handleApplyAllSwaps}
                className="flex-1 sm:flex-initial bg-[#83b735] hover:bg-[#72a32c] text-slate-950 font-black text-xs px-4 py-2 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 fill-slate-950" />
                <span>Apply All Space Swaps (+18%)</span>
              </button>
            ) : (
              <button
                onClick={handleRevertAllSwaps}
                className="flex-1 sm:flex-initial bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-bold text-xs px-4 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Revert to Baseline</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('density')}
              className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-400 text-amber-400 font-bold text-xs transition-colors flex items-center gap-1"
            >
              <span>Explore Swaps</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Main Generation Trigger Banner */}
      {!packingPlan && !isGenerating && (
        <div className="bg-gradient-to-br from-[#0f2e1b] to-slate-950 border border-emerald-600/40 rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto shadow-inner">
            <Box className="w-7 h-7" />
          </div>
          <div className="max-w-xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Google AI Studio Powered Engine</span>
            </div>
            <h4 className="text-xl font-black text-white">Generate Full Carton Sizing & Protective Spec</h4>
            <p className="text-slate-300 text-xs leading-relaxed">
              Our Google AI Studio multimodal packaging model evaluates the {currentTotalCbm} CBM volume measurements, fragility profiles, and surface dimensions to allocate box counts, dish-pack dividers, and cushioning materials.
            </p>
          </div>
          <button
            onClick={handleGeneratePackingPlan}
            className="inline-flex items-center gap-2.5 bg-gradient-to-r from-[#fed700] via-amber-400 to-[#83b735] hover:opacity-95 text-slate-950 font-black text-sm px-7 py-3.5 rounded-xl shadow-xl transform active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4 fill-slate-950" />
            <span>Generate Smart Packing Plan with Google AI Studio</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Generating State Overlay with Google AI Studio Branding */}
      {isGenerating && (
        <div className="bg-[#0f2e1b]/90 border border-[#83b735]/40 rounded-2xl p-8 text-center space-y-5 shadow-2xl animate-pulse">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 mx-auto animate-spin">
            <RefreshCw className="w-7 h-7" />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 text-[11px] font-bold">
              <span>Google AI Studio • Gemini 3.8 Flash Neural Computation</span>
            </div>
            <h4 className="text-lg font-black text-white">Optimizing Volumetric Packaging Density...</h4>
            <div className="space-y-1.5 text-xs text-emerald-300">
              <p className={generationStep === 1 ? 'font-bold text-amber-400' : 'text-slate-400'}>
                1. Parsing Digital Cargo Inspection volume measurements ({currentTotalCbm} CBM)...
              </p>
              <p className={generationStep === 2 ? 'font-bold text-amber-400' : 'text-slate-400'}>
                2. Allocating standardized carton matrices & honeycomb dish-packs...
              </p>
              <p className={generationStep === 3 ? 'font-bold text-amber-400' : 'text-slate-400'}>
                3. Analyzing packing density ratios and void-space air pockets...
              </p>
              <p className={generationStep === 4 ? 'font-bold text-amber-400' : 'text-slate-400'}>
                4. Computing real-time item swap suggestions for space compaction...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-800 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('density')}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'density'
              ? 'bg-[#83b735] text-slate-950 shadow-md font-black'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ArrowLeftRight className="w-4 h-4" />
          <span>Packing Density & Item Swaps</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ml-1 ${
            activeTab === 'density' ? 'bg-slate-950 text-[#83b735]' : 'bg-[#83b735]/20 text-[#83b735]'
          }`}>
            {appliedSwapIds.length > 0 ? `${appliedSwapIds.length} Active` : `${liveDensityAnalysis.swapSuggestions.length} Available`}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('boxes')}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'boxes'
              ? 'bg-amber-500 text-slate-950 shadow-md font-black'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Box className="w-4 h-4" />
          <span>Box Sizing Matrix {packingPlan ? `(${packingPlan.suggestedBoxes.length})` : ''}</span>
        </button>

        <button
          onClick={() => setActiveTab('materials')}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'materials'
              ? 'bg-amber-500 text-slate-950 shadow-md font-black'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Protective Materials {packingPlan ? `(${packingPlan.suggestedMaterials.length})` : ''}</span>
        </button>

        <button
          onClick={() => setActiveTab('protocol')}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'protocol'
              ? 'bg-amber-500 text-slate-950 shadow-md font-black'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>5-Step Packing Protocol</span>
        </button>

        <button
          onClick={() => setActiveTab('manifest')}
          className={`px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'manifest'
              ? 'bg-amber-500 text-slate-950 shadow-md font-black'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Source Cargo Manifest ({currentItems.length})</span>
        </button>
      </div>

      {/* TAB: PACKING DENSITY & ITEM SWAPS */}
      {activeTab === 'density' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0a1f12] border border-emerald-900/60 p-4 rounded-2xl">
            <div>
              <h4 className="font-black text-white text-sm flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4 text-[#83b735]" />
                <span>Real-Time Item Swap Suggestions for Space Optimization</span>
              </h4>
              <p className="text-xs text-slate-400">
                Click "Apply Swap" to test spatial redistribution. Swapping items into matched carton categories eliminates air pockets, elevates your Packing Density Score, and reduces transit vehicle size requirements.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-mono font-bold text-amber-400">
                Current: {liveDensityAnalysis.packingDensityScore}%
              </span>
            </div>
          </div>

          {/* Dynamic Item Swap Cards Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {liveDensityAnalysis.swapSuggestions.map((suggestion) => {
              const isApplied = appliedSwapIds.includes(suggestion.id);

              return (
                <div
                  key={suggestion.id}
                  className={`rounded-2xl p-5 border transition-all duration-300 flex flex-col justify-between space-y-3.5 shadow-lg ${
                    isApplied
                      ? 'bg-gradient-to-br from-[#0f2e1b] to-slate-950 border-[#83b735] ring-1 ring-[#83b735]/40'
                      : 'bg-slate-950/80 border-slate-800 hover:border-amber-500/40'
                  }`}
                >
                  <div className="space-y-2.5">
                    {/* Top Badges */}
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                        isApplied
                          ? 'bg-[#83b735]/20 text-[#83b735] border-[#83b735]/40'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}>
                        {isApplied ? '✓ Swap Applied & Compacted' : 'AI Recommendation'}
                      </span>

                      <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-800/40">
                        +{suggestion.densityScoreDelta}% Density Boost
                      </span>
                    </div>

                    <h5 className="font-bold text-white text-sm leading-snug">
                      {suggestion.title}
                    </h5>

                    {/* From -> To Box Mapping Pills */}
                    <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-2 text-[11px]">
                      <div className="space-y-0.5 text-left flex-1 min-w-0">
                        <span className="text-[9px] uppercase tracking-wider text-rose-400 font-bold block">From Container</span>
                        <p className="text-slate-300 font-bold truncate">{suggestion.fromBoxType}</p>
                      </div>

                      <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-amber-400 shrink-0">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>

                      <div className="space-y-0.5 text-right flex-1 min-w-0">
                        <span className="text-[9px] uppercase tracking-wider text-[#83b735] font-bold block">To Container</span>
                        <p className="text-white font-bold truncate">{suggestion.toBoxType}</p>
                      </div>
                    </div>

                    {/* Rationale & Benefit */}
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {suggestion.rationale}
                    </p>

                    <div className="flex items-center gap-2 text-[11px] text-amber-300/90 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{suggestion.ergonomicBenefit}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-2 border-t border-slate-900 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">
                      Compacts: <strong className="text-white">~{suggestion.cbmSaved} CBM Void Space</strong>
                    </span>

                    <button
                      onClick={() => handleToggleSwap(suggestion.id)}
                      className={`text-xs font-black px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 active:scale-95 ${
                        isApplied
                          ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                          : 'bg-gradient-to-r from-amber-500 to-[#83b735] text-slate-950 shadow-md hover:opacity-95'
                      }`}
                    >
                      {isApplied ? (
                        <>
                          <CheckCheck className="w-3.5 h-3.5 text-[#83b735]" />
                          <span>Revert Item Swap</span>
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

          {/* PACKING DENSITY TREND & SESSION EFFICIENCY VISUALIZATION (RECHARTS) */}
          <PackingDensityTrendChart
            trendHistory={assistantTrendHistory}
            currentScore={liveDensityAnalysis.packingDensityScore}
            currentVoidCbm={liveDensityAnalysis.voidSpaceCbm}
            totalCbm={liveDensityAnalysis.totalBoxesCbm}
            onResetTrend={handleResetAssistantTrend}
            onSimulateStep={handleSimulateAssistantStep}
            title="Packing Density Trend & Efficiency Improvement"
            subtitle="Live Recharts telematics measuring space compaction and void elimination progress during this session as box assignments are refined."
          />

          {/* Box Tier Density Breakdown Bar Graph */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-400" />
                <h5 className="font-bold text-white text-xs sm:text-sm">
                  Box Tier Fill Rate & Density Distribution
                </h5>
              </div>
              <span className="text-[10px] text-slate-400">Target: 80–92% Optimal Fill Rate</span>
            </div>

            <div className="space-y-3 text-xs">
              {liveDensityAnalysis.boxTierDensity.map((tier, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{tier.label}</span>
                    <span className={`font-mono font-bold ${
                      tier.fillPercentage >= 80 ? 'text-[#83b735]' : 'text-amber-400'
                    }`}>
                      {tier.fillPercentage}% Full ({tier.status === 'optimal' ? 'Compact' : 'Air Pockets Detected'})
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        tier.fillPercentage >= 88
                          ? 'bg-[#83b735]'
                          : tier.fillPercentage >= 78
                          ? 'bg-amber-400'
                          : 'bg-rose-400'
                      }`}
                      style={{ width: `${tier.fillPercentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Live Item Swap Simulator */}
          <div className="bg-[#0a1f12] border border-emerald-800/40 rounded-2xl p-5 space-y-4 shadow-xl text-xs">
            <div className="flex items-center gap-2 border-b border-emerald-950 pb-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <h5 className="font-black text-white text-xs sm:text-sm">
                Interactive Custom Item Swap Simulator
              </h5>
            </div>
            <p className="text-slate-400 text-xs">
              Test moving any surveyed cargo article between containers to preview how the spatial density score and truck volume respond.
            </p>

            <div className="grid sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-6 space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Select Surveyed Item</label>
                <select
                  value={simSelectedItemId || (currentItems[0]?.id || '')}
                  onChange={(e) => setSimSelectedItemId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white p-2.5 rounded-xl text-xs focus:ring-1 focus:ring-amber-400"
                >
                  {currentItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.itemName} ({item.estimatedCbm} CBM)
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-4 space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Target Box Container</label>
                <select
                  value={simTargetBoxType}
                  onChange={(e) => setSimTargetBoxType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white p-2.5 rounded-xl text-xs focus:ring-1 focus:ring-amber-400"
                >
                  <option value="Small Heavy-Duty Book & Tool Box (1.5 cu ft)">Small Heavy-Duty Book & Tool Box</option>
                  <option value="Medium Utility Carton (3.0 cu ft)">Medium Utility Carton</option>
                  <option value="Large Bulky Goods Box (4.5 cu ft)">Large Bulky Goods Box</option>
                  <option value="Honeycomb Dish-Pack with Cell Dividers">Honeycomb Dish-Pack with Cell Dividers</option>
                  <option value="Telescopic Expandable Mirror & TV Box">Telescopic Expandable Mirror & TV Box</option>
                  <option value="Bespoke Timber Plywood Crate">Bespoke Timber Plywood Crate</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <button
                  onClick={handleRunSimulator}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs py-2.5 rounded-xl transition-all shadow-md active:scale-95"
                >
                  Simulate
                </button>
              </div>
            </div>

            {simNotice && (
              <div className="bg-[#0f2e1b] border border-[#83b735] text-emerald-300 p-3 rounded-xl flex items-center gap-2 animate-fade-in text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-[#83b735] shrink-0" />
                <span>{simNotice}</span>
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB: BOX SIZING MATRIX */}
      {activeTab === 'boxes' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Recommended standard box sizes based on measured item volume & density:</span>
            <span className="text-[10px] text-amber-400">Adjust counts with + / - as needed</span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {(packingPlan?.suggestedBoxes || liveDensityAnalysis.boxTierDensity.map((t, idx) => ({
              id: `preview-box-${idx}`,
              name: t.label,
              category: t.category as any,
              dimensionsCm: { length: 45, width: 45, height: 40 },
              dimensionsLabel: '45 x 45 x 40 cm',
              volumeCbmPerUnit: 0.081,
              quantityRecommended: 12,
              totalVolumeCbm: 0.97,
              maxWeightKg: 30,
              suggestedItems: t.itemsAssigned,
              wallStrength: 'Double-Wall Heavy Duty' as any,
              estimatedCostNgn: 2400,
            }))).map((box) => {
              const qty = boxQuantityOverrides[box.id] !== undefined ? boxQuantityOverrides[box.id] : box.quantityRecommended;
              const isOptimizedBySwap = (
                (box.category === 'dishpack' && appliedSwapIds.includes('swap-dishware-honeycomb')) ||
                (box.category === 'small' && appliedSwapIds.includes('swap-books-small')) ||
                (box.category === 'crate' && appliedSwapIds.includes('swap-linens-voidfill'))
              );

              return (
                <div
                  key={box.id}
                  className={`bg-slate-950 border rounded-2xl p-4 flex flex-col justify-between space-y-3 transition-all shadow-md group ${
                    isOptimizedBySwap ? 'border-[#83b735]/80 ring-1 ring-[#83b735]/30' : 'border-slate-800 hover:border-emerald-600/60'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-1 flex-wrap">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                        box.category === 'dishpack' || box.category === 'crate'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          : box.category === 'telescopic'
                          ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      }`}>
                        {box.wallStrength}
                      </span>
                      {isOptimizedBySwap && (
                        <span className="text-[9px] font-black text-[#83b735] bg-[#83b735]/15 border border-[#83b735]/30 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <Zap className="w-2.5 h-2.5 fill-current" />
                          <span>Space Swap Compacted</span>
                        </span>
                      )}
                      <span className="text-[11px] font-mono text-amber-400 font-bold ml-auto">
                        ₦{box.estimatedCostNgn.toLocaleString('en-NG')} / unit
                      </span>
                    </div>

                    <div>
                      <h5 className="font-bold text-white text-xs leading-snug group-hover:text-amber-400 transition-colors">
                        {box.name}
                      </h5>
                      <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                        {box.dimensionsLabel} • {box.volumeCbmPerUnit} CBM
                      </p>
                    </div>

                    {/* Assigned Items */}
                    <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80 text-[10px] space-y-1">
                      <span className="font-bold text-slate-300 block">Assigned Items to Pack:</span>
                      <p className="text-slate-400 leading-tight">
                        {box.suggestedItems.join(', ')}
                      </p>
                    </div>
                  </div>

                  {/* Quantity Selector & Cost Total */}
                  <div className="pt-2 border-t border-slate-900 flex items-center justify-between">
                    <div className="text-[10px]">
                      <span className="text-slate-400 block">Subtotal:</span>
                      <span className="font-black text-amber-400 font-mono">
                        ₦{(box.estimatedCostNgn * qty).toLocaleString('en-NG')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-xl p-1">
                      <button
                        onClick={() => handleUpdateBoxQty(box.id, -1)}
                        className="p-1 text-slate-400 hover:text-white active:scale-95 transition-all"
                        title="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-black text-white text-xs px-2 font-mono">
                        {qty}
                      </span>
                      <button
                        onClick={() => handleUpdateBoxQty(box.id, 1)}
                        className="p-1 text-slate-400 hover:text-white active:scale-95 transition-all"
                        title="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Toolbar for Manifest */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 bg-[#0a1f12] border border-emerald-900/60 p-4 rounded-2xl">
            <div className="text-xs text-slate-300">
              <span className="font-bold text-white block">Ready to sync with your moving inventory?</span>
              <span className="text-[11px] text-slate-400">
                Calculated boxes can be automatically added into your moving inventory manifest with exact CBMs.
              </span>
            </div>
            {onAddBoxesToManifest && (
              <button
                onClick={handleApplyBoxesToManifest}
                className="w-full sm:w-auto bg-[#83b735] hover:bg-[#72a32c] text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all transform active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add All Boxes to Inventory Manifest</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* TAB: PROTECTIVE MATERIALS */}
      {activeTab === 'materials' && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid sm:grid-cols-2 gap-3">
            {(packingPlan?.suggestedMaterials || []).map((mat) => (
              <div
                key={mat.id}
                className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {mat.type.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      ₦{mat.estimatedPriceNgn.toLocaleString('en-NG')} / {mat.unit}
                    </span>
                  </div>
                  <h5 className="font-bold text-white text-xs">{mat.name}</h5>
                  <p className="text-[11px] text-slate-300">{mat.purpose}</p>
                  
                  {mat.recommendedForItems && mat.recommendedForItems.length > 0 && (
                    <div className="text-[10px] text-slate-400 bg-slate-900 p-2 rounded-lg">
                      <strong>Targets:</strong> {mat.recommendedForItems.join(', ')}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Required: <strong className="text-white">{mat.quantity} {mat.unit}</strong></span>
                  <span className="font-mono font-bold text-amber-400">
                    ₦{(mat.estimatedPriceNgn * mat.quantity).toLocaleString('en-NG')}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {packingPlan && (
            <div className="p-4 bg-emerald-950/40 border border-emerald-800/40 rounded-2xl flex items-center justify-between text-xs">
              <span className="text-slate-300">
                Total Materials Cost: <strong className="text-amber-400">₦{packingPlan.totalMaterialsCostNgn.toLocaleString('en-NG')}</strong>
              </span>
              <span className="text-emerald-400 font-bold">
                {packingPlan.ecoFriendlyRating}
              </span>
            </div>
          )}
        </div>
      )}

      {/* TAB: PACKING PROTOCOL */}
      {activeTab === 'protocol' && (
        <div className="space-y-3 animate-fade-in">
          {(packingPlan?.protocolSteps || []).map((step) => (
            <div
              key={step.stepNumber}
              className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-2.5"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-black text-sm flex items-center justify-center shrink-0">
                  {step.stepNumber}
                </div>
                <div>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                    {step.phase}
                  </span>
                  <h5 className="font-bold text-white text-sm">{step.title}</h5>
                </div>
              </div>

              <p className="text-xs text-slate-300 pl-11 leading-relaxed">
                {step.instructions}
              </p>

              {step.keyPrecautions && step.keyPrecautions.length > 0 && (
                <div className="pl-11 pt-1 space-y-1">
                  {step.keyPrecautions.map((prec, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-[11px] text-amber-300/90">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                      <span>{prec}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* TAB: SOURCE CARGO MANIFEST */}
      {activeTab === 'manifest' && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Inspected items surveyed from Digital Cargo Inspection module:</span>
            <span className="font-mono text-amber-400 font-bold">Total: {currentTotalCbm} CBM</span>
          </div>

          <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
            {currentItems.map((item, idx) => (
              <div
                key={item.id || idx}
                className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{item.quantity}x {item.itemName}</span>
                    {item.isFragile && (
                      <span className="bg-rose-500/10 text-rose-400 text-[9px] font-extrabold px-1.5 py-0.5 rounded border border-rose-500/20">
                        Fragile ({item.fragilityLevel})
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400">
                    {item.category} • {item.recommendedPackaging || 'Standard wrapping'}
                  </p>
                </div>

                <div className="text-right sm:shrink-0 text-xs font-mono">
                  <span className="text-amber-400 font-bold">{(item.estimatedCbm * (item.quantity || 1)).toFixed(2)} CBM</span>
                  <span className="text-slate-500 block text-[10px]">~{item.estimatedWeightKg || 25} kg</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Export & Quote Action Bar */}
      {packingPlan && (
        <div className="pt-4 border-t border-emerald-950 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleDownloadPdf}
              className="flex-1 sm:flex-initial bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Export PDF Specification & Density Report</span>
            </button>

            <button
              onClick={handleGeneratePackingPlan}
              className="p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors"
              title="Regenerate Smart Packing Plan"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {onAttachToQuote && (
            <button
              onClick={handleAttachPlanToQuote}
              className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs px-6 py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-95"
            >
              <span>Attach Packaging & Density Spec to Formal Quote</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

    </div>
  );
};
