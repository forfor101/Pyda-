import React, { useState, useRef, useEffect } from 'react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import {
  X,
  Printer,
  Download,
  Copy,
  Check,
  QrCode,
  ShieldAlert,
  CheckCircle2,
  Package,
  Truck,
  Box,
  Layers,
  Search,
  Scan,
  RefreshCw,
  ExternalLink,
  Tag,
  Clock,
  Sparkles,
  Info,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Filter
} from 'lucide-react';
import { InspectedCargoItem } from '../types';

export type WarehouseStatusType = 
  | 'pending_intake'
  | 'inspected'
  | 'crated'
  | 'loaded'
  | 'in_transit'
  | 'offloaded'
  | 'delivered';

export interface WarehouseStatusConfig {
  key: WarehouseStatusType;
  label: string;
  badgeClass: string;
  dotColor: string;
  icon: string;
  description: string;
}

export const WAREHOUSE_STATUS_CONFIGS: Record<WarehouseStatusType, WarehouseStatusConfig> = {
  pending_intake: {
    key: 'pending_intake',
    label: 'Pending Intake',
    badgeClass: 'bg-slate-700/60 text-slate-200 border-slate-600',
    dotColor: 'bg-slate-400',
    icon: '📦',
    description: 'Arrived at survey bay, awaiting verification',
  },
  inspected: {
    key: 'inspected',
    label: 'Inspected & Measured',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    dotColor: 'bg-amber-400',
    icon: '🔍',
    description: 'Volume audited & fragility classified by AI Inspector',
  },
  crated: {
    key: 'crated',
    label: 'Crated & Strapped',
    badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    dotColor: 'bg-purple-400',
    icon: '🛡️',
    description: 'Enclosed in protective wooden/bubble crates with ratchet straps',
  },
  loaded: {
    key: 'loaded',
    label: 'Loaded on Fleet Truck',
    badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    dotColor: 'bg-blue-400',
    icon: '🚚',
    description: 'Secured on transit truck payload bay according to axle balance',
  },
  in_transit: {
    key: 'in_transit',
    label: 'In Transit',
    badgeClass: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    dotColor: 'bg-indigo-400',
    icon: '🛣️',
    description: 'Vehicle en route with active GPS escort',
  },
  offloaded: {
    key: 'offloaded',
    label: 'Offloaded at Hub',
    badgeClass: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
    dotColor: 'bg-teal-400',
    icon: '📍',
    description: 'Safely offloaded at destination terminal / customer premises',
  },
  delivered: {
    key: 'delivered',
    label: 'Delivered & Verified',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    dotColor: 'bg-emerald-400',
    icon: '✅',
    description: 'Final handover completed with zero transit damage confirmed',
  },
};

interface PrintableInventoryQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  manifestId: string;
  items: InspectedCargoItem[];
  onUpdateItemStatus?: (itemId: string, newStatus: WarehouseStatusType, notes?: string, staffBadge?: string) => void;
  initialItemId?: string | null;
}

export const PrintableInventoryQrModal: React.FC<PrintableInventoryQrModalProps> = ({
  isOpen,
  onClose,
  manifestId,
  items,
  onUpdateItemStatus,
  initialItemId = null,
}) => {
  const [activeTab, setActiveTab] = useState<'sheet' | 'scanner' | 'single'>('sheet');
  const [selectedItemId, setSelectedItemId] = useState<string>(items[0]?.id || '');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [fragileFilter, setFragileFilter] = useState<'all' | 'fragile' | 'durable'>('all');
  const [labelDensity, setLabelDensity] = useState<'detailed' | 'compact'>('detailed');

  // Scanner state
  const [scannerSelectedId, setScannerSelectedId] = useState<string>(initialItemId || items[0]?.id || '');
  const [newStatus, setNewStatus] = useState<WarehouseStatusType>('inspected');
  const [staffBadge, setStaffBadge] = useState('Pyda Terminal Inspector #771');
  const [statusNote, setStatusNote] = useState('');
  const [updateSuccessMessage, setUpdateSuccessMessage] = useState<string | null>(null);
  const [recentUpdates, setRecentUpdates] = useState<Array<{
    itemId: string;
    itemName: string;
    status: WarehouseStatusType;
    timestamp: string;
    note?: string;
  }>>([]);

  // Audio confirmation beep
  const playBeep = (isSuccess = true) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (isSuccess) {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
        osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.16);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, ctx.currentTime);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.26);
      }
    } catch {
      // AudioContext not available or suppressed
    }
  };

  useEffect(() => {
    if (initialItemId) {
      setSelectedItemId(initialItemId);
      setScannerSelectedId(initialItemId);
      const targetItem = items.find((i) => i.id === initialItemId);
      if (targetItem?.warehouseStatus) {
        setNewStatus(targetItem.warehouseStatus);
      }
      setActiveTab('single');
    } else if (items.length > 0 && !selectedItemId) {
      setSelectedItemId(items[0].id);
      setScannerSelectedId(items[0].id);
    }
  }, [initialItemId, items]);

  if (!isOpen) return null;

  // Filtered items for printable sheet
  const filteredItems = items.filter((item) => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName = item.itemName.toLowerCase().includes(q);
      const matchCat = item.category.toLowerCase().includes(q);
      const matchId = item.id.toLowerCase().includes(q);
      if (!matchName && !matchCat && !matchId) return false;
    }
    if (statusFilter !== 'all') {
      const itemStatus = item.warehouseStatus || 'inspected';
      if (itemStatus !== statusFilter) return false;
    }
    if (fragileFilter === 'fragile' && !item.isFragile) return false;
    if (fragileFilter === 'durable' && item.isFragile) return false;
    return true;
  });

  const selectedItem = items.find((i) => i.id === selectedItemId) || items[0];
  const scannerItem = items.find((i) => i.id === scannerSelectedId) || items[0];

  // Generate QR content string
  const getQrContent = (item: InspectedCargoItem) => {
    const trackingSku = `PYDA-${manifestId.slice(-4)}-${item.id.slice(-4)}`.toUpperCase();
    return JSON.stringify({
      sku: trackingSku,
      manifestId,
      itemId: item.id,
      item: item.itemName,
      cbm: item.estimatedCbm,
      fragile: item.isFragile,
      status: item.warehouseStatus || 'inspected',
      verifyUrl: `https://pyda.ng/verify/cargo/${manifestId}?sku=${trackingSku}`,
    });
  };

  const getItemSku = (item: InspectedCargoItem) => {
    return `TAG-${item.id.slice(-6).toUpperCase()}`;
  };

  const handleCopyLink = (item: InspectedCargoItem) => {
    const url = `https://pyda.ng/verify/cargo/${manifestId}?item=${item.id}`;
    navigator.clipboard?.writeText(url);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadSingleQrPng = (item: InspectedCargoItem) => {
    const canvas = document.getElementById(`qr-canvas-${item.id}`) as HTMLCanvasElement;
    if (!canvas) return;
    const pngUrl = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `Pyda-QR-Tag-${manifestId}-${getItemSku(item)}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const handlePrintSheet = () => {
    window.print();
  };

  const handleCommitStatusUpdate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!scannerItem) return;

    if (onUpdateItemStatus) {
      onUpdateItemStatus(scannerItem.id, newStatus, statusNote, staffBadge);
    }

    playBeep(true);
    setUpdateSuccessMessage(`Status updated to "${WAREHOUSE_STATUS_CONFIGS[newStatus].label}" for ${scannerItem.itemName}`);
    
    setRecentUpdates((prev) => [
      {
        itemId: scannerItem.id,
        itemName: scannerItem.itemName,
        status: newStatus,
        timestamp: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        note: statusNote || undefined,
      },
      ...prev.slice(0, 9),
    ]);

    setStatusNote('');
    setTimeout(() => {
      setUpdateSuccessMessage(null);
    }, 3500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 print:p-0 print:bg-white print:static print:backdrop-blur-none">
      
      {/* Print CSS styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-qr-manifest-sheet, #printable-qr-manifest-sheet * {
            visibility: visible !important;
          }
          #printable-qr-manifest-sheet {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: white !important;
            color: black !important;
            padding: 10mm !important;
            display: block !important;
          }
          .no-print {
            display: none !important;
          }
          .qr-print-card {
            page-break-inside: avoid !important;
            border: 2px solid #0f172a !important;
            color: #0f172a !important;
            background: #ffffff !important;
          }
        }
      `}</style>

      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:border-none print:shadow-none print:bg-white print:rounded-none">
        
        {/* Modal Header */}
        <div className="no-print p-5 sm:p-6 border-b border-slate-800 bg-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
              <QrCode className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-extrabold text-white">
                  Warehouse Cargo QR Tracking Hub
                </h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {items.length} Item Tags
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Printable optical tags for rapid inventory audits, status scans, and warehouse verification
              </p>
            </div>
          </div>

          {/* Action Header Tabs & Close */}
          <div className="flex items-center gap-2">
            <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex items-center">
              <button
                type="button"
                onClick={() => setActiveTab('sheet')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'sheet'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Printable Sheet</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('scanner')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'scanner'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Scan className="w-3.5 h-3.5" />
                <span>Rapid Status Scanner</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('single')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'single'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>Single Tag</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body Area */}
        <div className="overflow-y-auto flex-1 p-5 sm:p-6 space-y-6">

          {/* TAB 1: PRINTABLE QR INVENTORY LABELS SHEET */}
          {activeTab === 'sheet' && (
            <div className="space-y-6">
              
              {/* Controls & Filter Bar */}
              <div className="no-print bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-md">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Search box */}
                  <div className="relative w-full sm:w-56">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Filter items or SKU..."
                      className="w-full bg-slate-900 border border-slate-800 focus:border-amber-400 text-white text-xs rounded-xl pl-9 pr-3 py-2 outline-none"
                    />
                  </div>

                  {/* Status filter */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-slate-900 text-slate-300 border border-slate-800 text-xs rounded-xl px-3 py-2 outline-none font-bold"
                  >
                    <option value="all">All Statuses</option>
                    {Object.values(WAREHOUSE_STATUS_CONFIGS).map((cfg) => (
                      <option key={cfg.key} value={cfg.key}>
                        {cfg.icon} {cfg.label}
                      </option>
                    ))}
                  </select>

                  {/* Fragile Filter */}
                  <select
                    value={fragileFilter}
                    onChange={(e) => setFragileFilter(e.target.value as any)}
                    className="bg-slate-900 text-slate-300 border border-slate-800 text-xs rounded-xl px-3 py-2 outline-none font-bold"
                  >
                    <option value="all">Fragile & Durable</option>
                    <option value="fragile">⚠️ Fragile Only</option>
                    <option value="durable">📦 Durable Only</option>
                  </select>

                  {/* Density toggle */}
                  <div className="flex items-center rounded-xl bg-slate-900 p-1 border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setLabelDensity('detailed')}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-lg ${
                        labelDensity === 'detailed'
                          ? 'bg-slate-800 text-amber-400'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Standard Tag
                    </button>
                    <button
                      type="button"
                      onClick={() => setLabelDensity('compact')}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-lg ${
                        labelDensity === 'compact'
                          ? 'bg-slate-800 text-amber-400'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Compact Sticker
                    </button>
                  </div>
                </div>

                {/* Print Trigger Button */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handlePrintSheet}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 cursor-pointer"
                  >
                    <Printer className="w-4 h-4 stroke-[2.5]" />
                    <span>Print QR Label Sheet ({filteredItems.length})</span>
                  </button>
                </div>
              </div>

              {/* Printable Canvas Section */}
              <div id="printable-qr-manifest-sheet" className="space-y-6">
                
                {/* Printable Document Header (shown in print) */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 print:bg-white print:text-black print:border-black print:border-b-2 print:rounded-none">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="text-base font-extrabold text-amber-400 print:text-black tracking-wide">
                        PYDA MOVERS & LOGISTICS • CARGO AUDIT TAGS
                      </div>
                      <div className="text-xs text-slate-400 print:text-gray-700">
                        Manifest Reference: <strong className="text-white print:text-black">#{manifestId}</strong> • Terminal Bay: Abuja / Lagos Central Hub
                      </div>
                    </div>
                    <div className="text-right text-[11px] text-slate-400 print:text-gray-700">
                      <div>Generated: {new Date().toLocaleDateString('en-GB')} {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</div>
                      <div className="font-mono text-amber-400 print:text-black font-bold">Standard 2x4 Barcode Tag Layout</div>
                    </div>
                  </div>
                </div>

                {/* Items Grid */}
                {filteredItems.length === 0 ? (
                  <div className="no-print p-12 text-center bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                    <Box className="w-8 h-8 text-slate-500 mx-auto" />
                    <p className="text-sm font-bold text-white">No items match your filter criteria</p>
                    <p className="text-xs text-slate-400">Clear your search or status filter to show cargo tags</p>
                  </div>
                ) : (
                  <div className={`grid gap-4 ${labelDensity === 'detailed' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'} print:grid-cols-2 print:gap-4`}>
                    {filteredItems.map((item) => {
                      const statusCfg = WAREHOUSE_STATUS_CONFIGS[item.warehouseStatus || 'inspected'];
                      const sku = getItemSku(item);
                      const qrValue = getQrContent(item);

                      return (
                        <div
                          key={item.id}
                          className="qr-print-card relative p-4 rounded-2xl bg-slate-950 border border-slate-800 shadow-lg flex flex-col justify-between print:border-2 print:border-slate-900 print:bg-white print:text-black"
                        >
                          {/* Card Top Banner */}
                          <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-2.5 mb-2.5 print:border-slate-300">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 rounded print:text-black print:border-black">
                                  {sku}
                                </span>
                                <span className="text-[10px] text-slate-400 print:text-gray-600 font-mono">
                                  #{manifestId.slice(-6)}
                                </span>
                              </div>
                              <h4 className="font-extrabold text-sm text-white print:text-black mt-1 leading-snug line-clamp-1">
                                {item.itemName}
                              </h4>
                            </div>

                            {/* Fragility Badge */}
                            <div>
                              {item.isFragile ? (
                                <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 print:text-red-700 print:border-red-700">
                                  <ShieldAlert className="w-2.5 h-2.5" />
                                  FRAGILE
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 print:text-emerald-700 print:border-emerald-700">
                                  <CheckCircle className="w-2.5 h-2.5" />
                                  DURABLE
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Center Body: QR Code and Key Warehouse Metrics */}
                          <div className="flex items-center gap-3.5 py-1">
                            {/* QR Code Container */}
                            <div className="p-2 rounded-xl bg-white border border-slate-700 shrink-0 print:border-black flex items-center justify-center shadow-inner">
                              <QRCodeSVG
                                value={qrValue}
                                size={labelDensity === 'detailed' ? 92 : 78}
                                level="M"
                                includeMargin={false}
                              />
                              {/* Hidden Canvas for PNG Export */}
                              <div className="hidden">
                                <QRCodeCanvas
                                  id={`qr-canvas-${item.id}`}
                                  value={qrValue}
                                  size={256}
                                  level="H"
                                />
                              </div>
                            </div>

                            {/* Specifications */}
                            <div className="space-y-1.5 flex-1 min-w-0">
                              <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                                <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800 print:bg-gray-100 print:border-gray-300">
                                  <span className="text-slate-400 print:text-gray-600 block text-[9px]">Measured Volume</span>
                                  <strong className="text-amber-400 print:text-black font-mono">
                                    {(item.estimatedCbm * item.quantity).toFixed(2)} CBM
                                  </strong>
                                </div>
                                <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800 print:bg-gray-100 print:border-gray-300">
                                  <span className="text-slate-400 print:text-gray-600 block text-[9px]">Est. Weight</span>
                                  <strong className="text-slate-200 print:text-black font-mono">
                                    {item.estimatedWeightKg * item.quantity} kg
                                  </strong>
                                </div>
                              </div>

                              <div className="text-[10px] text-slate-300 print:text-gray-800 line-clamp-2 leading-tight">
                                <span className="text-slate-400 print:text-gray-600 font-bold">Crating: </span>
                                {item.recommendedPackaging}
                              </div>

                              <div className="flex items-center gap-1.5 pt-0.5">
                                <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full border ${statusCfg.badgeClass} print:text-black print:border-black`}>
                                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                  <span>{statusCfg.label}</span>
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Card Footer Actions (Hidden when printing) */}
                          <div className="no-print mt-3 pt-2 border-t border-slate-800 flex items-center justify-between gap-2 text-xs">
                            <span className="text-[10px] text-slate-500 font-mono">
                              Qty: <strong className="text-slate-300">{item.quantity}</strong>
                            </span>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleDownloadSingleQrPng(item)}
                                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                                title="Download QR PNG"
                              >
                                <Download className="w-2.5 h-2.5" />
                                <span>PNG</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setScannerSelectedId(item.id);
                                  setNewStatus(item.warehouseStatus || 'inspected');
                                  setActiveTab('scanner');
                                }}
                                className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                                title="Update warehouse status"
                              >
                                <Scan className="w-2.5 h-2.5" />
                                <span>Scan/Update</span>
                              </button>
                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}

              </div>

            </div>
          )}

          {/* TAB 2: WAREHOUSE RAPID STATUS SCANNER & UPDATER */}
          {activeTab === 'scanner' && (
            <div className="space-y-6">
              
              {/* Warehouse Floor Scanner Interactive Banner */}
              <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/20 p-5 rounded-3xl border border-amber-500/30 shadow-xl flex flex-col md:flex-row items-center justify-between gap-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                    <Scan className="w-8 h-8 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold text-white flex items-center gap-2">
                      <span>Warehouse Floor Rapid Status Terminal</span>
                      <span className="text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                        Live Scanner Ready
                      </span>
                    </h4>
                    <p className="text-xs text-slate-300 mt-1 max-w-xl">
                      Select or scan an item's optical QR tag to immediately update handling progress, crating verification, vehicle loading, or dispatch delivery.
                    </p>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="flex items-center gap-3">
                  <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Items</span>
                    <span className="text-base font-black text-white">{items.length}</span>
                  </div>
                  <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Updated Today</span>
                    <span className="text-base font-black text-amber-400">{recentUpdates.length}</span>
                  </div>
                </div>
              </div>

              {/* Success Notification Alert */}
              {updateSuccessMessage && (
                <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 flex items-center justify-between text-xs text-emerald-300 shadow-lg animate-in fade-in duration-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-bold">{updateSuccessMessage}</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400">Audio Beep Confirmed ✓</span>
                </div>
              )}

              {/* Two Column Layout: Scanner Target & Status Action Controller */}
              <div className="grid md:grid-cols-12 gap-6">
                
                {/* Left Column: Simulated Barcode Target Reticle & Item Carousel (5 cols) */}
                <div className="md:col-span-5 space-y-4">
                  <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 space-y-4 text-center">
                    
                    <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
                      <span className="font-bold text-slate-300 flex items-center gap-1.5">
                        <Scan className="w-3.5 h-3.5 text-amber-400" />
                        Optical Target Reticle
                      </span>
                      <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        Active Target: {scannerItem ? getItemSku(scannerItem) : 'None'}
                      </span>
                    </div>

                    {/* Scannable Target Box */}
                    <div className="relative mx-auto w-52 h-52 bg-slate-900 rounded-2xl border-2 border-amber-400/60 p-3 flex flex-col items-center justify-center shadow-inner group">
                      
                      {/* Corner Target Markers */}
                      <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber-400" />
                      <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-400" />
                      <div className="absolute bottom-2 left-2 w-4 h-2 border-b-2 border-l-2 border-amber-400" />
                      <div className="absolute bottom-2 right-2 w-4 h-2 border-b-2 border-r-2 border-amber-400" />

                      {/* Moving laser scanline animation */}
                      <div className="absolute left-3 right-3 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-bounce opacity-80 pointer-events-none" />

                      {scannerItem ? (
                        <div className="bg-white p-2 rounded-xl shadow-md">
                          <QRCodeSVG
                            value={getQrContent(scannerItem)}
                            size={130}
                            level="M"
                          />
                        </div>
                      ) : (
                        <div className="text-slate-500 text-xs">No item selected</div>
                      )}

                      <span className="text-[10px] text-slate-400 font-mono mt-2 block">
                        Laser Focus: Ready to Read
                      </span>
                    </div>

                    {/* Quick Item Picker Select Box */}
                    <div className="space-y-1.5 text-left">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Select Item to Scan / Update:
                      </label>
                      <select
                        value={scannerSelectedId}
                        onChange={(e) => {
                          setScannerSelectedId(e.target.value);
                          const target = items.find((i) => i.id === e.target.value);
                          if (target?.warehouseStatus) {
                            setNewStatus(target.warehouseStatus);
                          }
                          playBeep(true);
                        }}
                        className="w-full bg-slate-900 border border-slate-800 text-white text-xs rounded-xl px-3 py-2.5 outline-none font-bold focus:border-amber-400 transition-colors"
                      >
                        {items.map((item, idx) => (
                          <option key={item.id} value={item.id}>
                            #{idx + 1} {getItemSku(item)} — {item.itemName} ({item.quantity} qty)
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Quick Item Thumbnails list */}
                    <div className="space-y-1.5 text-left pt-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Quick Item Selector:
                      </span>
                      <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                        {items.map((it) => (
                          <button
                            key={it.id}
                            type="button"
                            onClick={() => {
                              setScannerSelectedId(it.id);
                              if (it.warehouseStatus) setNewStatus(it.warehouseStatus);
                              playBeep(true);
                            }}
                            className={`w-full p-2 rounded-xl text-left text-xs flex items-center justify-between transition-all cursor-pointer ${
                              it.id === scannerSelectedId
                                ? 'bg-amber-500 text-slate-950 font-black shadow'
                                : 'bg-slate-900 text-slate-300 hover:bg-slate-850 hover:text-white border border-slate-800'
                            }`}
                          >
                            <span className="truncate pr-2">{it.itemName}</span>
                            <span className="font-mono text-[10px] opacity-80">{getItemSku(it)}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>

                {/* Right Column: Rapid Status Action Buttons & Update Form (7 cols) */}
                <div className="md:col-span-7 space-y-5">
                  {scannerItem ? (
                    <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-5">
                      
                      {/* Item Overview Header */}
                      <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                              {getItemSku(scannerItem)}
                            </span>
                            <span className="text-xs text-slate-400 font-bold">
                              Qty: {scannerItem.quantity}
                            </span>
                          </div>
                          <h3 className="text-lg font-extrabold text-white mt-1">
                            {scannerItem.itemName}
                          </h3>
                        </div>

                        {/* Current Status Badge */}
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block font-bold uppercase">Current Status</span>
                          <span className={`inline-flex items-center gap-1.5 text-xs font-extrabold px-2.5 py-1 rounded-full border mt-0.5 ${
                            WAREHOUSE_STATUS_CONFIGS[scannerItem.warehouseStatus || 'inspected'].badgeClass
                          }`}>
                            <span>{WAREHOUSE_STATUS_CONFIGS[scannerItem.warehouseStatus || 'inspected'].icon}</span>
                            <span>{WAREHOUSE_STATUS_CONFIGS[scannerItem.warehouseStatus || 'inspected'].label}</span>
                          </span>
                        </div>
                      </div>

                      {/* Technical Specs Brief */}
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Category</span>
                          <span className="font-bold text-white truncate block">{scannerItem.category}</span>
                        </div>
                        <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Total Volume</span>
                          <span className="font-bold text-amber-400 font-mono">
                            {(scannerItem.estimatedCbm * scannerItem.quantity).toFixed(2)} CBM
                          </span>
                        </div>
                        <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">Fragility</span>
                          <span className={`font-bold ${scannerItem.isFragile ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {scannerItem.isFragile ? 'Fragile Cargo' : 'Durable'}
                          </span>
                        </div>
                      </div>

                      {/* Rapid Status Touch Buttons */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                          Select New Warehouse Status:
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {Object.values(WAREHOUSE_STATUS_CONFIGS).map((cfg) => {
                            const isSelected = newStatus === cfg.key;
                            return (
                              <button
                                key={cfg.key}
                                type="button"
                                onClick={() => {
                                  setNewStatus(cfg.key);
                                  playBeep(true);
                                }}
                                className={`p-2.5 rounded-xl text-left border transition-all flex items-center gap-2.5 cursor-pointer ${
                                  isSelected
                                    ? 'bg-amber-500/20 border-amber-400 text-white shadow-md'
                                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                                }`}
                              >
                                <span className="text-lg shrink-0">{cfg.icon}</span>
                                <div className="min-w-0 flex-1">
                                  <div className="text-xs font-bold flex items-center justify-between">
                                    <span>{cfg.label}</span>
                                    {isSelected && (
                                      <Check className="w-3.5 h-3.5 text-amber-400" />
                                    )}
                                  </div>
                                  <div className="text-[10px] text-slate-400 truncate">
                                    {cfg.description}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Inspector Badge & Handler Note */}
                      <div className="grid sm:grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="text-[11px] font-bold text-slate-400 block mb-1">
                            Inspector Staff ID / Terminal Badge:
                          </label>
                          <input
                            type="text"
                            value={staffBadge}
                            onChange={(e) => setStaffBadge(e.target.value)}
                            placeholder="Terminal Badge ID"
                            className="w-full bg-slate-900 border border-slate-800 text-white text-xs rounded-xl px-3 py-2 outline-none focus:border-amber-400"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-400 block mb-1">
                            Operational Notes (Optional):
                          </label>
                          <input
                            type="text"
                            value={statusNote}
                            onChange={(e) => setStatusNote(e.target.value)}
                            placeholder="e.g. Crated in Bay B3 with bubble film"
                            className="w-full bg-slate-900 border border-slate-800 text-white text-xs rounded-xl px-3 py-2 outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>

                      {/* Commit Button */}
                      <button
                        type="button"
                        onClick={handleCommitStatusUpdate}
                        className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 transition-all shadow-xl active:scale-95 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                        <span>Update Item Status to "{WAREHOUSE_STATUS_CONFIGS[newStatus].label}"</span>
                      </button>

                    </div>
                  ) : (
                    <div className="p-8 text-center text-slate-400">
                      Select an item to update status
                    </div>
                  )}

                  {/* Audit Trail of Recent Updates */}
                  {recentUpdates.length > 0 && (
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                      <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>Recent Status Updates in this Session</span>
                      </h5>
                      <div className="divide-y divide-slate-800 text-xs">
                        {recentUpdates.map((up, i) => (
                          <div key={i} className="py-2 flex items-center justify-between gap-2">
                            <div>
                              <span className="font-bold text-white">{up.itemName}</span>
                              <span className="text-[10px] text-slate-400 ml-2">
                                → {WAREHOUSE_STATUS_CONFIGS[up.status].label}
                              </span>
                              {up.note && (
                                <span className="text-[10px] text-slate-500 block">"{up.note}"</span>
                              )}
                            </div>
                            <span className="text-[10px] font-mono text-slate-400 shrink-0">
                              {up.timestamp}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

              </div>

            </div>
          )}

          {/* TAB 3: SINGLE ITEM QR TAG VIEW */}
          {activeTab === 'single' && (
            <div className="max-w-xl mx-auto space-y-6">
              
              {/* Item Dropdown Switcher */}
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-slate-400 shrink-0">Select Item:</span>
                <select
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className="bg-slate-900 border border-slate-800 text-white text-xs rounded-xl px-3 py-2 outline-none font-bold w-full"
                >
                  {items.map((it) => (
                    <option key={it.id} value={it.id}>
                      {getItemSku(it)} — {it.itemName} ({it.quantity} qty)
                    </option>
                  ))}
                </select>
              </div>

              {selectedItem && (
                <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-6 shadow-2xl">
                  
                  {/* Single Tag Card Display */}
                  <div className="p-6 rounded-2xl bg-white text-slate-950 border-2 border-slate-900 shadow-xl space-y-4">
                    
                    {/* Header */}
                    <div className="flex items-start justify-between border-b-2 border-slate-900 pb-3">
                      <div>
                        <div className="text-[11px] font-black uppercase tracking-wider text-slate-900">
                          PYDA LOGISTICS CARGO TAG
                        </div>
                        <div className="font-mono text-xs font-bold text-amber-600">
                          SKU: {getItemSku(selectedItem)} • REF: #{manifestId}
                        </div>
                      </div>

                      <div>
                        {selectedItem.isFragile ? (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded bg-rose-600 text-white">
                            ⚠️ HIGH FRAGILITY
                          </span>
                        ) : (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-600 text-white">
                            ✓ STANDARD CARGO
                          </span>
                        )}
                      </div>
                    </div>

                    {/* QR Code and details */}
                    <div className="flex items-center gap-6">
                      <div className="p-2 border-2 border-slate-900 rounded-xl bg-white shrink-0">
                        <QRCodeSVG
                          value={getQrContent(selectedItem)}
                          size={140}
                          level="H"
                        />
                      </div>

                      <div className="space-y-2 text-xs">
                        <h4 className="text-base font-black text-slate-950 leading-tight">
                          {selectedItem.itemName}
                        </h4>
                        <div>
                          <span className="text-slate-600 font-bold">Category: </span>
                          <span className="font-semibold">{selectedItem.category}</span>
                        </div>
                        <div>
                          <span className="text-slate-600 font-bold">Quantity: </span>
                          <span className="font-semibold">{selectedItem.quantity} Unit(s)</span>
                        </div>
                        <div>
                          <span className="text-slate-600 font-bold">Measured Volume: </span>
                          <span className="font-bold text-amber-700">
                            {(selectedItem.estimatedCbm * selectedItem.quantity).toFixed(2)} CBM
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-600 font-bold">Status: </span>
                          <span className="font-black uppercase">
                            {WAREHOUSE_STATUS_CONFIGS[selectedItem.warehouseStatus || 'inspected'].label}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Packaging advisory */}
                    <div className="p-2 rounded-lg bg-slate-100 border border-slate-300 text-[11px] text-slate-800">
                      <strong>Crating Protocol: </strong> {selectedItem.recommendedPackaging}
                    </div>

                    <div className="text-center text-[9px] text-slate-500 font-mono tracking-wider pt-1 border-t border-slate-200">
                      SCAN FOR RAPID INVENTORY VERIFICATION & STATUS UPDATES • PYDA MOVERS NIGERIA
                    </div>
                  </div>

                  {/* Tag Action Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleDownloadSingleQrPng(selectedItem)}
                      className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-800 transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-amber-400" />
                      <span>Download Tag PNG</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopyLink(selectedItem)}
                      className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-800 transition-all cursor-pointer"
                    >
                      {copiedId === selectedItem.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied Link!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-amber-400" />
                          <span>Copy Tracking Link</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Switch to scanner button */}
                  <button
                    type="button"
                    onClick={() => {
                      setScannerSelectedId(selectedItem.id);
                      setNewStatus(selectedItem.warehouseStatus || 'inspected');
                      setActiveTab('scanner');
                    }}
                    className="w-full py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Scan className="w-3.5 h-3.5 text-amber-400" />
                    <span>Open in Rapid Warehouse Status Updater</span>
                  </button>

                </div>
              )}

            </div>
          )}

        </div>

        {/* Modal Bottom Footer */}
        <div className="no-print p-4 sm:p-5 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Warehouse Scanners: 100% Offline Compatible ISO/IEC 18004 QR Codes</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrintSheet}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print A4 Label Sheet</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
